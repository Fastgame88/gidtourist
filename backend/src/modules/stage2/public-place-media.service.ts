import { Injectable } from "@nestjs/common";

type WikiPage = {
  title?: string;
  fullurl?: string;
  thumbnail?: { source?: string };
  coordinates?: Array<{ lat?: number; lon?: number }>;
};

type WikiResponse = { query?: { pages?: Record<string, WikiPage> } };

type OpenverseItem = {
  title?: string | null;
  thumbnail?: string | null;
  url?: string | null;
  creator?: string | null;
  foreign_landing_url?: string | null;
  source?: string | null;
  license?: string | null;
  license_version?: string | null;
};

type OpenverseResponse = { results?: OpenverseItem[] };

export type PublicPlaceMedia = {
  imageUrl: string | null;
  provider: "wikipedia" | "openverse" | null;
  sourceUrl: string | null;
  attribution: string | null;
  error: string | null;
};

const STOP_WORDS = new Set([
  "the", "and", "of", "in", "at", "на", "у", "в", "і", "та", "для", "з", "із", "по", "проспект", "вулиця", "street", "avenue",
  "готель", "hotel", "ресторан", "restaurant", "кафе", "cafe", "магазин", "shop", "аптека", "pharmacy",
]);

function normalize(value: string) {
  return value
    .toLocaleLowerCase("uk")
    .normalize("NFKD")
    .replace(/[’'`]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function tokens(value: string) {
  return normalize(value).split(/\s+/).filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function tokenScore(name: string, candidate: string) {
  const wanted = tokens(name);
  if (!wanted.length) return 0;
  const haystack = normalize(candidate);
  const matched = wanted.filter((token) => haystack.includes(token)).length;
  return matched / wanted.length;
}

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const r = 6371000;
  const toRad = (value: number) => value * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

@Injectable()
export class PublicPlaceMediaService {
  private readonly cache = new Map<string, { value: PublicPlaceMedia; expiresAt: number }>();
  private readonly ttlMs = 24 * 60 * 60 * 1000;

  private cacheKey(input: { name: string; address?: string; lat?: number; lng?: number }) {
    return [normalize(input.name), normalize(input.address || ""), Number(input.lat).toFixed(4), Number(input.lng).toFixed(4)].join("|");
  }

  private async fetchJson<T>(url: string, timeoutMs = 5500): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "GidTourist/1.0 (public place media lookup)",
        },
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json() as T;
    } finally {
      clearTimeout(timer);
    }
  }

  private bestWikipediaPage(name: string, pages: WikiPage[], lat?: number, lng?: number) {
    return pages
      .filter((page) => page.thumbnail?.source)
      .map((page) => {
        const score = tokenScore(name, page.title || "");
        const point = page.coordinates?.[0];
        const distance = Number.isFinite(lat) && Number.isFinite(lng) && Number.isFinite(point?.lat) && Number.isFinite(point?.lon)
          ? distanceMeters(Number(lat), Number(lng), Number(point?.lat), Number(point?.lon))
          : null;
        const proximityBonus = distance == null ? 0 : distance <= 150 ? 0.4 : distance <= 500 ? 0.25 : distance <= 1200 ? 0.1 : -0.25;
        return { page, score: score + proximityBonus, nameScore: score, distance };
      })
      .filter((item) => item.nameScore >= 0.5 || (item.nameScore >= 0.34 && item.distance != null && item.distance <= 250))
      .sort((a, b) => b.score - a.score)[0]?.page ?? null;
  }

  private async wikipedia(input: { name: string; lat?: number; lng?: number }): Promise<PublicPlaceMedia | null> {
    const endpoints = ["https://uk.wikipedia.org/w/api.php", "https://en.wikipedia.org/w/api.php"];
    const errors: string[] = [];
    for (const endpoint of endpoints) {
      try {
        const search = new URLSearchParams({
          action: "query",
          format: "json",
          generator: "search",
          gsrsearch: input.name,
          gsrnamespace: "0",
          gsrlimit: "8",
          prop: "pageimages|coordinates|info",
          piprop: "thumbnail",
          pithumbsize: "1400",
          inprop: "url",
          redirects: "1",
        });
        const data = await this.fetchJson<WikiResponse>(`${endpoint}?${search.toString()}`);
        let pages = Object.values(data.query?.pages ?? {});
        let best = this.bestWikipediaPage(input.name, pages, input.lat, input.lng);

        if (!best && Number.isFinite(input.lat) && Number.isFinite(input.lng)) {
          const nearby = new URLSearchParams({
            action: "query",
            format: "json",
            generator: "geosearch",
            ggscoord: `${input.lat}|${input.lng}`,
            ggsradius: "1200",
            ggslimit: "12",
            prop: "pageimages|coordinates|info",
            piprop: "thumbnail",
            pithumbsize: "1400",
            inprop: "url",
          });
          const nearData = await this.fetchJson<WikiResponse>(`${endpoint}?${nearby.toString()}`);
          pages = Object.values(nearData.query?.pages ?? {});
          best = this.bestWikipediaPage(input.name, pages, input.lat, input.lng);
        }
        if (best?.thumbnail?.source) {
          return {
            imageUrl: best.thumbnail.source,
            provider: "wikipedia",
            sourceUrl: best.fullurl || null,
            attribution: best.title ? `Wikipedia · ${best.title}` : "Wikipedia",
            error: null,
          };
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }
    if (errors.length) throw new Error(`Wikipedia: ${errors.join(" | ")}`);
    return null;
  }

  private async openverse(input: { name: string; address?: string }): Promise<PublicPlaceMedia | null> {
    const locationHint = (input.address || "").split(",").slice(0, 2).join(" ");
    const query = [input.name, locationHint].filter(Boolean).join(" ").trim();
    if (!query) return null;
    const params = new URLSearchParams({ q: query, page_size: "10" });
    const data = await this.fetchJson<OpenverseResponse>(`https://api.openverse.org/v1/images/?${params.toString()}`);
    const best = (data.results ?? [])
      .map((item) => ({ item, score: tokenScore(input.name, item.title || "") }))
      .filter(({ item, score }) => score >= 0.67 && Boolean(item.thumbnail || item.url))
      .sort((a, b) => b.score - a.score)[0]?.item;
    if (!best) return null;
    const license = [best.license, best.license_version].filter(Boolean).join(" ").trim();
    const attribution = [best.creator || "Openverse", license || null].filter(Boolean).join(" · ");
    return {
      imageUrl: best.thumbnail || best.url || null,
      provider: "openverse",
      sourceUrl: best.foreign_landing_url || null,
      attribution,
      error: null,
    };
  }

  async lookup(input: { name: string; address?: string; lat?: number; lng?: number }): Promise<PublicPlaceMedia> {
    const key = this.cacheKey(input);
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const errors: string[] = [];
    let result: PublicPlaceMedia | null = null;
    try { result = await this.wikipedia(input); } catch (error) { errors.push(error instanceof Error ? error.message : String(error)); }
    if (!result) {
      try { result = await this.openverse(input); } catch (error) { errors.push(`Openverse: ${error instanceof Error ? error.message : String(error)}`); }
    }
    const value = result ?? {
      imageUrl: null,
      provider: null,
      sourceUrl: null,
      attribution: null,
      error: errors.length ? errors.join(" | ").slice(0, 500) : "Wikipedia/Openverse не знайшли достатньо точного фото для цієї локації.",
    };
    this.cache.set(key, { value, expiresAt: Date.now() + this.ttlMs });
    return value;
  }
}

import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service.js";
import { makeId } from "../../common/id.js";
import type { AuthUser } from "../../common/auth.guard.js";
import { GooglePlacesService, type GoogleNearbyPlace } from "./google-places.service.js";

function num(value: unknown, fallback?: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function fallbackCategoryFromPlaceType(placeType: string) {
  const value = placeType.toLocaleLowerCase("uk");
  if (/ресторан|кафе|бар|кав|їж|food|піц/.test(value)) return "food";
  if (/магаз|сувен|аптек|shop/.test(value)) return "shop";
  if (/чан|саун|басейн|spa|масаж|відпоч|екскурс/.test(value)) return "rest";
  if (/розваг|актив|квадро|рафт|зіп|джип|entertain/.test(value)) return "entertainment";
  if (/трансфер|таксі|оренда авто|transfer/.test(value)) return "transfer";
  return "hotel";
}

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const r = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isOpenNow(workHours: Record<string, unknown> | null) {
  if (!workHours) return null;
  if (workHours.always_open === true) return true;
  const daily = workHours.daily as { from?: string; to?: string } | undefined;
  if (!daily?.from || !daily?.to) return null;
  const formatter = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Kyiv", hour: "2-digit", minute: "2-digit", hour12: false });
  const now = formatter.format(new Date());
  return now >= daily.from && now <= daily.to;
}

type PlaceRow = {
  id: string;
  region_id: string;
  category_slug: string;
  category_name: string;
  subcategory: string | null;
  name: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  phone: string | null;
  telegram: string | null;
  website: string | null;
  image_url: string | null;
  rating: string | number;
  review_count: number;
  price_level: number | null;
  work_hours: Record<string, unknown>;
  attributes: Record<string, unknown>;
  details: Record<string, unknown>;
  translations: Record<string, unknown>;
  status: string;
  tags: string[];
};

const PARTNER_SUBCATEGORY_ALIASES: Record<string, string[]> = {
  "Ресторани": ["ресторан", "кухн"], "Кафе": ["кафе", "кавʼ", "кав'", "coffee"], "Бари": ["бар"], "Піцерії": ["піц", "pizza"],
  "Кондитерські": ["кондитер", "десерт", "торт"], "Фастфуд": ["фаст", "fast food"], "Їжа з собою": ["з собою", "доставка"], "Традиційна кухня": ["україн", "гуцул", "традиц"],
  "Продукти": ["продукт", "grocery", "супермаркет"], "Сувеніри": ["сувен"], "Одяг і взуття": ["одяг", "взут"], "Товари для дому": ["для дому", "госптов", "мебл", "будмат"],
  "Аптеки": ["аптек", "фарма"], "Техніка": ["технік", "електрон"], "Будівництво": ["будів", "будмат", "інструмент"], "Косметика": ["космет", "beauty"],
  "Гори": ["гора", "гір", "полонин"], "Річки": ["річк", "river"], "Водоспади": ["водоспад"], "Озера": ["озер"], "Оглядові точки": ["огляд", "панорам"], "Печери": ["печер"], "Ліси": ["ліс"],
  "Пам’ятки": ["памʼят", "пам'ят", "визначн"], "Музеї": ["музе"], "Храми": ["храм", "церк", "монаст"], "Архітектура": ["архітект", "замок"], "Історичні місця": ["істор"], "Скульптури": ["скульп", "памʼятник", "пам'ятник"], "Події": ["поді", "концерт", "фестиваль"],
  "Активний відпочинок": ["актив", "джип", "рафт", "зіп", "похід"], "Атракціони": ["атракц", "парк розваг"], "Екскурсії": ["екскурс"], "SPA і басейни": ["spa", "спа", "саун", "басейн", "масаж", "чан"], "Риболовля": ["рибол"], "Верхова їзда": ["кін", "верхов"], "Квадроцикли": ["квадро"], "Польоти": ["політ", "параплан", "авіа"],
  "Автобусні зупинки": ["зупин", "bus stop"], "Залізничні станції": ["залізнич", "вокзал", "станц"], "Автостанції": ["автостан", "автовокзал"], "Таксі": ["таксі", "трансфер"], "Парковки": ["парков"], "Оренда авто": ["оренда авто", "прокат авто"], "Заправки": ["азс", "заправ"], "Зарядні станції": ["заряд", "charging"],
  "Банкомати": ["банкомат", "atm"], "Обмін валют": ["обмін валют"], "Пошта": ["пошта"], "Лікарні": ["лікарн", "медич"], "Туалети": ["туалет"], "Wi‑Fi": ["wi-fi", "wifi"], "Поліція": ["поліц"], "Інформаційні центри": ["інформаційн", "туристичний центр"],
  "Піші маршрути": ["піш", "hiking"], "Веломаршрути": ["вело", "bike"], "Автомаршрути": ["автомаршрут"], "Верхові маршрути": ["верхов", "кінн"], "Водні маршрути": ["водн", "рафт", "сплав"], "Популярні маршрути": ["популярн маршрут"], "Складні маршрути": ["складн маршрут"], "Маршрути вихідного дня": ["вихідного дня"],
};

function partnerMatchesSubcategory(place: PlaceRow, label: string) {
  if (!label) return true;
  if (place.subcategory === label || place.tags.includes(label)) return true;
  const haystack = [place.name, place.description, place.subcategory ?? "", ...place.tags].join(" ").toLocaleLowerCase("uk");
  return (PARTNER_SUBCATEGORY_ALIASES[label] ?? []).some((token) => haystack.includes(token.toLocaleLowerCase("uk")));
}

function parseTelegramIds(value: unknown) {
  const raw = Array.isArray(value) ? value : String(value ?? "").split(/[\s,;]+/g);
  return Array.from(new Set(raw.map((item) => String(item).trim()).filter((item) => /^\d{5,20}$/.test(item))));
}


@Injectable()
export class Stage2Service {
  constructor(private readonly db: DatabaseService, private readonly google: GooglePlacesService) {}

  private async categoryForPlaceType(placeType: string, fallback = "hotel") {
    const clean = placeType.trim();
    if (!clean) return fallback;
    const result = await this.db.query(
      "SELECT category_slug FROM place_type_templates WHERE active=true AND lower(place_type)=lower($1) ORDER BY sort_order,label LIMIT 1",
      [clean],
    );
    return String(result.rows[0]?.category_slug || fallbackCategoryFromPlaceType(clean) || fallback);
  }

  private async verifiedAddressFromBody(body: Record<string, unknown>) {
    const details = body.details && typeof body.details === "object" ? body.details as Record<string, unknown> : {};
    const ids = details.geo_place_ids && typeof details.geo_place_ids === "object" ? details.geo_place_ids as Record<string, unknown> : {};
    const isVerified = details.address_verified === true;
    const cityId = String(ids.city ?? "").trim();
    const streetId = String(ids.street ?? "").trim();
    const houseId = String(ids.house ?? "").trim();
    if (!isVerified || !cityId || !streetId || !houseId) {
      throw new BadRequestException("Оберіть місто, вулицю та будинок з підказок Google Maps");
    }
    const verified = await this.geoDetails(houseId);
    if (!verified.city || !verified.street || !verified.house || !verified.lat || !verified.lng) {
      throw new BadRequestException("Google Maps не підтвердив повну адресу");
    }
    return verified;
  }

  private async ensureRegionForPlace(city: string, regionName: string, lat: number, lng: number, fallback = "region-tatariv") {
    const name = city.trim();
    if (!name) return fallback;
    const existing = await this.db.query("SELECT id FROM regions WHERE lower(name)=lower($1) LIMIT 1", [name]);
    if (existing.rows[0]?.id) return String(existing.rows[0].id);
    const slugBase = name.toLocaleLowerCase("uk").normalize("NFKD").replace(/[^a-zа-яіїєґ0-9]+/giu, "-").replace(/^-+|-+$/g, "").slice(0, 48) || makeId("region");
    const id = `region-${slugBase}`;
    await this.db.query(
      `INSERT INTO regions(id,slug,name,center_lat,center_lng,active) VALUES($1,$2,$3,$4,$5,true)
       ON CONFLICT (id) DO UPDATE SET center_lat=EXCLUDED.center_lat,center_lng=EXCLUDED.center_lng,updated_at=now()`,
      [id, slugBase, name + (regionName ? "" : ""), lat, lng],
    );
    return id;
  }

  private googlePlaceToStage2(place: GoogleNearbyPlace, lat?: number, lng?: number) {
    const location = place.location;
    const placeLat = Number(location?.latitude ?? 0);
    const placeLng = Number(location?.longitude ?? 0);
    const section = this.google.mapSection(place.primaryType ?? "", place.types ?? []);
    const distance = lat != null && lng != null && placeLat && placeLng ? distanceMeters(lat, lng, placeLat, placeLng) : null;
    return {
      id: `google_${place.id}`,
      region_id: "google",
      category_slug: section,
      category_name: section,
      subcategory: this.google.subcategory(place.primaryType ?? "", place.primaryTypeDisplayName?.text ?? ""),
      name: place.displayName?.text ?? "Google Maps place",
      description: place.primaryTypeDisplayName?.text ?? "Google Maps",
      address: place.formattedAddress ?? "",
      lat: placeLat,
      lng: placeLng,
      phone: place.nationalPhoneNumber ?? null,
      telegram: null,
      website: place.websiteUri ?? null,
      image_url: null,
      rating: Number(place.rating ?? 0),
      review_count: Number(place.userRatingCount ?? 0),
      price_level: null,
      work_hours: place.regularOpeningHours ?? {},
      attributes: { partner: false, google: true, google_maps_uri: place.googleMapsUri ?? null },
      details: { google_place_id: place.id, google_maps_uri: place.googleMapsUri ?? null },
      translations: {},
      tags: place.types ?? [],
      distance_m: distance == null ? null : Math.round(distance),
      is_open_now: place.regularOpeningHours?.openNow ?? null,
      status: "external",
      source: "google" as const,
      is_partner: false,
    };
  }

  async geoAutocomplete(input: string, mode: "city" | "street" | "house", city = "", street = "") {
    return this.google.autocomplete(input, mode, city, street);
  }

  async geoReverse(lat: number, lng: number) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new BadRequestException("lat/lng are required");
    return this.google.reverse(lat, lng);
  }

  async geoDetails(placeId: string) {
    const place = await this.google.details(placeId);
    const components = place.addressComponents ?? [];
    const pick = (...types: string[]) => components.find((item) => types.some((type) => item.types?.includes(type)))?.longText ?? "";
    return {
      place_id: place.id,
      formatted_address: place.formattedAddress ?? "",
      lat: Number(place.location?.latitude ?? 0),
      lng: Number(place.location?.longitude ?? 0),
      city: pick("locality", "postal_town", "administrative_area_level_3"),
      region: pick("administrative_area_level_1"),
      street: pick("route"),
      house: pick("street_number"),
    };
  }

  async context(startParam: string) {
    const qr = await this.db.query(
      `SELECT q.id,q.start_param,q.type,q.source,q.region_id,q.place_id,q.active,
              r.name region_name,r.name_en region_name_en,r.name_pl region_name_pl,r.center_lat,r.center_lng,r.community_url
       FROM qr_points q JOIN regions r ON r.id=q.region_id
       WHERE q.start_param=$1 AND q.active=true`,
      [startParam],
    );
    const row = qr.rows[0] as Record<string, unknown> | undefined;
    if (!row) throw new NotFoundException("QR context not found or inactive");
    const place = row.place_id ? await this.place(String(row.place_id), false) : null;
    return {
      qr: { id: row.id, startParam: row.start_param, type: row.type, source: row.source },
      region: { id: row.region_id, name: row.region_name, nameEn: row.region_name_en, namePl: row.region_name_pl, lat: row.center_lat, lng: row.center_lng, communityUrl: row.community_url },
      place,
    };
  }

  async categories() {
    const result = await this.db.query(
      "SELECT slug,name,name_en,name_pl,sort_order,subcategories,filter_config FROM categories WHERE active=true ORDER BY sort_order,name",
    );
    return result.rows;
  }

  async placeTypeTemplates(category?: string) {
    const result = await this.db.query(
      `SELECT id,category_slug,place_type,label,default_title,default_description,default_services,default_amenities,fields,sort_order,active
       FROM place_type_templates WHERE active=true AND ($1::text IS NULL OR category_slug=$1) ORDER BY category_slug,sort_order,label`,
      [category || null],
    );
    return result.rows;
  }

  private async rawPlaces(regionId?: string, includePending = false) {
    const result = await this.db.query<PlaceRow>(
      `SELECT p.*,c.name category_name,
        COALESCE((SELECT json_agg(t.tag ORDER BY t.tag) FROM place_tags t WHERE t.place_id=p.id),'[]'::json)::jsonb AS tags
       FROM places p JOIN categories c ON c.slug=p.category_slug
       WHERE ($1::text IS NULL OR p.region_id=$1) ${includePending ? "" : "AND p.status='approved'"}
       ORDER BY p.rating DESC,p.name`,
      [regionId ?? null],
    );
    return result.rows;
  }

  async places(params: Record<string, unknown>) {
    const regionId = String(params.region_id ?? "region-tatariv");
    const category = params.category ? String(params.category) : "";
    const subcategory = params.subcategory ? String(params.subcategory) : "";
    const q = params.q ? String(params.q).trim().toLocaleLowerCase("uk") : "";
    const lat = num(params.lat);
    const lng = num(params.lng);
    const radius = num(params.radius);
    const minRating = num(params.min_rating);
    const priceLevel = num(params.price_level);
    const openNow = String(params.open_now ?? "") === "true";
    const kids = String(params.kids ?? "") === "true";
    const parking = String(params.parking ?? "") === "true";
    const partner = String(params.partner ?? "") === "true";

    let rows = await this.rawPlaces(regionId);
    rows = rows.filter((p) => !category || p.category_slug === category);
    rows = rows.filter((p) => partnerMatchesSubcategory(p, subcategory));
    rows = rows.filter((p) => !q || [p.name,p.description,p.address,p.subcategory ?? "",...p.tags].join(" ").toLocaleLowerCase("uk").includes(q));
    rows = rows.filter((p) => minRating == null || Number(p.rating) >= minRating);
    rows = rows.filter((p) => priceLevel == null || p.price_level === priceLevel);
    rows = rows.filter((p) => !kids || p.attributes?.kids === true);
    rows = rows.filter((p) => !parking || p.attributes?.parking === true);
    rows = rows.filter((p) => !partner || p.attributes?.partner === true);
    rows = rows.filter((p) => !openNow || isOpenNow(p.work_hours) === true);

    const mapped = rows.map((p) => {
      const distance = lat != null && lng != null ? distanceMeters(lat, lng, Number(p.lat), Number(p.lng)) : null;
      return { ...p, rating: Number(p.rating), distance_m: distance == null ? null : Math.round(distance), is_open_now: isOpenNow(p.work_hours) };
    });
    const filtered = radius != null ? mapped.filter((p) => p.distance_m != null && p.distance_m <= radius) : mapped;
    const partnerRows = filtered.map((p) => ({ ...p, source: "partner" as const, is_partner: p.attributes?.partner === true }));
    const includeGoogle = String(params.include_google ?? "") === "true" && lat != null && lng != null && radius != null && this.google.enabled();
    if (includeGoogle) {
      const googleSection = String(params.google_section ?? (category || "all"));
      try {
        const googlePlaces = await this.google.nearby(lat!, lng!, radius!, googleSection, subcategory);
        const external = googlePlaces.map((item) => this.googlePlaceToStage2(item, lat!, lng!));
        const selectedQuery = q.toLocaleLowerCase("uk");
        const filteredExternal = external.filter((place) => !subcategory || this.google.matchesSubcategory(subcategory, String(place.tags[0] ?? ""), place.tags))
          .filter((place) => !selectedQuery || [place.name, place.description, place.address, place.subcategory, ...place.tags].join(" ").toLocaleLowerCase("uk").includes(selectedQuery));
        const deduped = filteredExternal.filter((googlePlace) => !partnerRows.some((partnerPlace) => distanceMeters(Number(partnerPlace.lat), Number(partnerPlace.lng), googlePlace.lat, googlePlace.lng) < 35 && partnerPlace.name.toLocaleLowerCase("uk").includes(googlePlace.name.toLocaleLowerCase("uk").split(" ")[0] || "___")));
        const combined = [...partnerRows, ...deduped];
        combined.sort((a, b) => (a.distance_m ?? 1e12) - (b.distance_m ?? 1e12) || Number(b.rating) - Number(a.rating));
        return combined;
      } catch {
        // Google Places is optional; partner catalog must remain available if quota/key is unavailable.
      }
    }
    partnerRows.sort((a, b) => (a.distance_m ?? 1e12) - (b.distance_m ?? 1e12) || Number(b.rating) - Number(a.rating));
    return partnerRows;
  }

  async place(id: string, publicOnly = true) {
    if (id.startsWith("google_")) {
      const googleId = id.slice("google_".length);
      const result = await this.google.details(googleId);
      return this.googlePlaceToStage2(result);
    }
    const rows = await this.rawPlaces(undefined, !publicOnly);
    const place = rows.find((row) => row.id === id && (!publicOnly || row.status === "approved"));
    if (!place) throw new NotFoundException("Place not found");
    return { ...place, rating: Number(place.rating), is_open_now: isOpenNow(place.work_hours) };
  }

  async profile(user: AuthUser) {
    const result = await this.db.query(
      `SELECT id,telegram_id::text,telegram_username,first_name,last_name,selected_language,role,phone,consent,created_at,last_active_at
       FROM users WHERE id=$1`, [user.id],
    );
    return result.rows[0];
  }

  async updateProfile(user: AuthUser, body: Record<string, unknown>) {
    const language = ["uk","en","pl"].includes(String(body.selected_language)) ? String(body.selected_language) : undefined;
    const phone = body.phone === undefined ? undefined : String(body.phone ?? "");
    const consent = body.consent && typeof body.consent === "object" ? body.consent : undefined;
    await this.db.query(
      `UPDATE users SET selected_language=COALESCE($2,selected_language), phone=COALESCE($3,phone), consent=COALESCE($4::jsonb,consent), updated_at=now() WHERE id=$1`,
      [user.id, language ?? null, phone ?? null, consent ? JSON.stringify(consent) : null],
    );
    return this.profile(user);
  }

  async favorites(user: AuthUser) {
    const result = await this.db.query(
      `SELECT p.*,c.name category_name,COALESCE((SELECT json_agg(t.tag ORDER BY t.tag) FROM place_tags t WHERE t.place_id=p.id),'[]'::json)::jsonb AS tags
       FROM favorites f JOIN places p ON p.id=f.place_id JOIN categories c ON c.slug=p.category_slug
       WHERE f.user_id=$1 AND p.status='approved' ORDER BY f.created_at DESC`, [user.id],
    );
    return result.rows;
  }

  async addFavorite(user: AuthUser, placeId: string) {
    await this.place(placeId);
    await this.db.query("INSERT INTO favorites(user_id,place_id) VALUES($1,$2) ON CONFLICT DO NOTHING", [user.id, placeId]);
    return { ok: true };
  }

  async removeFavorite(user: AuthUser, placeId: string) {
    await this.db.query("DELETE FROM favorites WHERE user_id=$1 AND place_id=$2", [user.id, placeId]);
    return { ok: true };
  }

  async addEvent(user: AuthUser | undefined, body: Record<string, unknown>) {
    const eventType = String(body.event_type ?? "").trim();
    if (!eventType) throw new BadRequestException("event_type is required");
    await this.db.query(
      "INSERT INTO activity_events(id,user_id,region_id,place_id,event_type,payload) VALUES($1,$2,$3,$4,$5,$6::jsonb)",
      [makeId("evt"), user?.id ?? null, body.region_id ?? null, body.place_id ?? null, eventType, JSON.stringify(body.payload ?? {})],
    );
    return { ok: true };
  }

  async recentActivity(user: AuthUser) {
    const result = await this.db.query(
      `SELECT e.id,e.event_type,e.region_id,e.place_id,e.payload,e.created_at,p.name place_name,c.name category_name
       FROM activity_events e LEFT JOIN places p ON p.id=e.place_id LEFT JOIN categories c ON c.slug=p.category_slug
       WHERE e.user_id=$1 ORDER BY e.created_at DESC LIMIT 50`,
      [user.id],
    );
    return result.rows;
  }

  async emergency(regionId: string) {
    const result = await this.db.query(
      "SELECT id,type,title,note,phone,lat,lng,tone,sort_order FROM emergency_contacts WHERE region_id=$1 AND active=true ORDER BY sort_order,title",
      [regionId],
    );
    return result.rows;
  }

  async partnerPlaces(user: AuthUser) {
    const result = await this.db.query(
      `SELECT DISTINCT p.*
       FROM places p
       JOIN organizations o ON o.id=p.organization_id
       LEFT JOIN organization_telegram_access a ON a.organization_id=o.id AND a.active=true
       WHERE o.owner_user_id=$1 OR (a.telegram_id::text=$2 AND a.active=true)
       ORDER BY p.updated_at DESC`,
      [user.id, user.telegram_id ?? ""],
    );
    return result.rows;
  }

  async partnerAccess(user: AuthUser, startParam: string) {
    if (!user.telegram_id) throw new UnauthorizedException("Telegram ID is required");
    const result = await this.db.query(
      `SELECT q.id qr_id,q.start_param,q.active,p.id place_id,p.status,p.organization_id,p.name,p.details,
              EXISTS(SELECT 1 FROM organization_telegram_access a WHERE a.organization_id=p.organization_id AND a.telegram_id::text=$2 AND a.active=true) allowed
       FROM qr_points q JOIN places p ON p.id=q.place_id
       WHERE q.start_param=$1 AND q.active=true AND q.type='partner_access' LIMIT 1`,
      [startParam, user.telegram_id],
    );
    const row = result.rows[0] as Record<string, unknown> | undefined;
    if (!row) throw new NotFoundException("Partner QR not found or inactive");
    if (row.allowed !== true) throw new UnauthorizedException("Цей Telegram ID не має доступу до кабінету цього партнера");
    await this.db.transaction(async (client) => {
      await client.query("UPDATE users SET role=CASE WHEN role='tourist' THEN 'partner' ELSE role END,updated_at=now() WHERE id=$1", [user.id]);
      await client.query("UPDATE organizations SET owner_user_id=COALESCE(owner_user_id,$2),updated_at=now() WHERE id=$1", [row.organization_id, user.id]);
    });
    return { ok: true, place_id: row.place_id, status: row.status, organization_id: row.organization_id, name: row.name, start_param: startParam };
  }

  async createPartnerPlace(user: AuthUser, body: Record<string, unknown>) {
    const name = String(body.name ?? "").trim();
    if (!name) throw new BadRequestException("name is required");
    const placeType = String(body.subcategory ?? body.place_type ?? "Готель").trim() || "Готель";
    const category = await this.categoryForPlaceType(placeType, "hotel");
    const verifiedAddress = await this.verifiedAddressFromBody(body);
    const lat = verifiedAddress.lat;
    const lng = verifiedAddress.lng;
    const requestedRegion = body.region_id ? String(body.region_id) : "region-tatariv";
    const regionId = await this.ensureRegionForPlace(verifiedAddress.city, verifiedAddress.region, lat, lng, requestedRegion);
    const organizationId = makeId("org");
    const placeId = makeId("place");

    await this.db.transaction(async (client) => {
      await client.query(
        "INSERT INTO organizations(id,owner_user_id,region_id,name,status) VALUES($1,$2,$3,$4,'pending')",
        [organizationId, user.id, regionId, String(body.organization_name ?? name)],
      );
      await client.query(
        `INSERT INTO places(id,organization_id,region_id,category_slug,subcategory,name,description,address,lat,lng,phone,telegram,website,image_url,price_level,work_hours,attributes,details,status,created_by_user_id)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb,$17::jsonb,$18::jsonb,'pending',$19)`,
        [placeId, organizationId, regionId, category, placeType, name, body.description ?? "", verifiedAddress.formatted_address || body.address || "", lat, lng, body.phone ?? null, body.telegram ?? null, body.website ?? null, body.image_url ?? null, num(body.price_level), JSON.stringify(body.work_hours ?? {}), JSON.stringify(body.attributes ?? {}), JSON.stringify(body.details ?? {}), user.id],
      );
      await client.query("UPDATE users SET role=CASE WHEN role='tourist' THEN 'partner' ELSE role END, updated_at=now() WHERE id=$1", [user.id]);
    });
    return this.place(placeId, false);
  }

  async updatePartnerPlace(user: AuthUser, placeId: string, body: Record<string, unknown>) {
    const owned = await this.db.query(
      `SELECT p.id FROM places p JOIN organizations o ON o.id=p.organization_id
       LEFT JOIN organization_telegram_access a ON a.organization_id=o.id AND a.active=true
       WHERE p.id=$1 AND (o.owner_user_id=$2 OR (a.telegram_id::text=$3 AND a.active=true)) LIMIT 1`,
      [placeId, user.id, user.telegram_id ?? ""],
    );
    if (!owned.rows[0]) throw new NotFoundException("Partner place not found");
    const current = await this.place(placeId, false) as PlaceRow;
    const nextLat = num(body.lat, Number(current.lat))!;
    const nextLng = num(body.lng, Number(current.lng))!;
    const nextRegionId = await this.ensureRegionForPlace(String(body.city ?? ""), String(body.region_name ?? ""), nextLat, nextLng, current.region_id);
    const nextPlaceType = String(body.subcategory ?? current.subcategory ?? "Готель").trim() || "Готель";
    const nextCategory = await this.categoryForPlaceType(nextPlaceType, current.category_slug);
    await this.db.query(
      `UPDATE places SET region_id=$2,category_slug=$3,subcategory=$4,name=$5,description=$6,address=$7,lat=$8,lng=$9,phone=$10,telegram=$11,website=$12,image_url=$13,
       price_level=$14,work_hours=$15::jsonb,attributes=$16::jsonb,details=$17::jsonb,status=CASE WHEN status='approved' THEN 'approved' ELSE 'pending' END,updated_at=now() WHERE id=$1`,
      [placeId, nextRegionId, nextCategory, nextPlaceType, body.name ?? current.name, body.description ?? current.description, body.address ?? current.address, nextLat, nextLng, body.phone ?? current.phone, body.telegram ?? current.telegram, body.website ?? current.website, body.image_url ?? current.image_url, num(body.price_level, current.price_level ?? undefined) ?? null, JSON.stringify(body.work_hours ?? current.work_hours ?? {}), JSON.stringify(body.attributes ?? current.attributes ?? {}), JSON.stringify(body.details ?? current.details ?? {})],
    );
    return this.place(placeId, false);
  }

  async adminPartners() {
    const result = await this.db.query(
      `SELECT p.id,p.name,p.category_slug,p.subcategory,p.address,p.status,p.region_id,p.lat,p.lng,r.name region_name,o.name organization_name,
              COALESCE((SELECT json_agg(a.telegram_id::text ORDER BY a.telegram_id) FROM organization_telegram_access a WHERE a.organization_id=o.id AND a.active=true),'[]'::json) telegram_ids,
              (SELECT q.start_param FROM qr_points q WHERE q.place_id=p.id AND q.type='partner_access' AND q.active=true ORDER BY q.created_at DESC LIMIT 1) partner_start_param
       FROM places p JOIN organizations o ON o.id=p.organization_id JOIN regions r ON r.id=p.region_id
       ORDER BY p.updated_at DESC`,
    );
    return result.rows;
  }

  async adminCreatePartner(body: Record<string, unknown>) {
    const name = String(body.name ?? "").trim();
    const categorySlug = String(body.category_slug ?? "").trim();
    const telegramIds = parseTelegramIds(body.telegram_ids);
    if (!name) throw new BadRequestException("Вкажіть назву партнера");
    if (!categorySlug) throw new BadRequestException("Оберіть категорію");
    if (!telegramIds.length) throw new BadRequestException("Вкажіть хоча б один числовий Telegram ID");
    const category = await this.db.query("SELECT slug FROM categories WHERE slug=$1 AND active=true LIMIT 1", [categorySlug]);
    if (!category.rows[0]) throw new BadRequestException("Невідома категорія");

    const detailsInput = body.details && typeof body.details === "object" ? body.details as Record<string, unknown> : {};
    let address = String(body.address ?? "").trim();
    let city = String(body.city ?? "").trim();
    let regionName = String(body.region_name ?? "").trim();
    let lat = num(body.lat);
    let lng = num(body.lng);
    const mapSelected = body.map_selected === true;
    if (!mapSelected) {
      const verified = await this.verifiedAddressFromBody(body);
      address = verified.formatted_address || address;
      city = verified.city || city;
      regionName = verified.region || regionName;
      lat = verified.lat;
      lng = verified.lng;
    } else if (lat == null || lng == null || !address) {
      throw new BadRequestException("Оберіть адресу з Google або вкажіть точку на мапі");
    }

    const regionId = await this.ensureRegionForPlace(city, regionName, lat!, lng!, String(body.region_id ?? "region-tatariv"));
    const organizationId = makeId("org");
    const placeId = makeId("place");
    const qrId = makeId("qr");
    const startParam = `partner-${makeId("").replaceAll("-", "").slice(0, 32)}`;
    const publish = body.publish === true;
    const status = publish ? "approved" : "draft";
    const workHours = body.work_hours && typeof body.work_hours === "object" ? body.work_hours : {};
    const attributes = body.attributes && typeof body.attributes === "object" ? body.attributes as Record<string, unknown> : {};
    const details = {
      ...detailsInput,
      admin_created: true,
      partner_invite_start_param: startParam,
      allowed_telegram_ids: telegramIds,
    };

    await this.db.transaction(async (client) => {
      await client.query(
        "INSERT INTO organizations(id,region_id,name,status) VALUES($1,$2,$3,$4)",
        [organizationId, regionId, name, publish ? "approved" : "invited"],
      );
      await client.query(
        `INSERT INTO places(id,organization_id,region_id,category_slug,subcategory,name,description,address,lat,lng,phone,image_url,work_hours,attributes,details,status,approved_at)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14::jsonb,$15::jsonb,$16,CASE WHEN $16='approved' THEN now() ELSE NULL END)`,
        [placeId, organizationId, regionId, categorySlug, body.subcategory ?? null, name, String(body.description ?? ""), address, lat, lng, body.phone ?? null, body.image_url ?? null, JSON.stringify(workHours), JSON.stringify({ ...attributes, partner: true, placement_type: body.placement_type ?? "social", rate_percent: num(body.rate_percent, 0) ?? 0 }), JSON.stringify(details), status],
      );
      for (const telegramId of telegramIds) {
        await client.query(
          `INSERT INTO organization_telegram_access(organization_id,telegram_id,role,active) VALUES($1,$2,'owner',true)
           ON CONFLICT (organization_id,telegram_id) DO UPDATE SET active=true,updated_at=now()`,
          [organizationId, telegramId],
        );
      }
      await client.query(
        `INSERT INTO qr_points(id,start_param,type,source,region_id,place_id,active) VALUES($1,$2,'partner_access','admin_partner',$3,$4,true)`,
        [qrId, startParam, regionId, placeId],
      );
    });
    return { ok: true, organization_id: organizationId, place_id: placeId, status, start_param: startParam, telegram_ids: telegramIds };
  }

  async adminPlaces(status = "approved") {
    const allowed = ["approved", "pending", "rejected", "draft", "all"];
    const resolved = allowed.includes(status) ? status : "approved";
    const result = await this.db.query(
      `SELECT p.id,p.name,p.category_slug,p.subcategory,p.address,p.status,p.region_id,p.lat,p.lng,r.name region_name,o.name organization_name
       FROM places p JOIN regions r ON r.id=p.region_id LEFT JOIN organizations o ON o.id=p.organization_id
       WHERE ($1='all' OR p.status=$1) ORDER BY r.name,p.name`,
      [resolved],
    );
    return result.rows;
  }

  async adminUpdateRegion(regionId: string, body: Record<string, unknown>) {
    const communityUrl = body.community_url === undefined ? undefined : String(body.community_url ?? "").trim() || null;
    const result = await this.db.query(
      `UPDATE regions SET community_url=COALESCE($2,community_url),updated_at=now() WHERE id=$1
       RETURNING id,name,community_url`,
      [regionId, communityUrl ?? null],
    );
    if (!result.rows[0]) throw new NotFoundException("Region not found");
    return result.rows[0];
  }

  async adminPending() {
    const result = await this.db.query(
      `SELECT p.id,p.name,p.category_slug,p.subcategory,p.address,p.status,p.moderation_comment,p.created_at,p.updated_at,
              o.name organization_name,u.telegram_username,u.first_name,u.last_name,r.name region_name
       FROM places p LEFT JOIN organizations o ON o.id=p.organization_id LEFT JOIN users u ON u.id=o.owner_user_id JOIN regions r ON r.id=p.region_id
       WHERE p.status IN ('draft','pending','rejected') ORDER BY p.updated_at DESC`,
    );
    return result.rows;
  }

  async adminStatus(placeId: string, status: string, comment?: string, categorySlug?: string) {
    if (!["approved","rejected","pending","draft"].includes(status)) throw new BadRequestException("Invalid status");
    const cleanCategory = String(categorySlug ?? "").trim();
    if (cleanCategory) {
      const category = await this.db.query("SELECT slug FROM categories WHERE slug=$1 AND active=true LIMIT 1", [cleanCategory]);
      if (!category.rows[0]) throw new BadRequestException("Invalid category_slug");
    }
    const result = await this.db.query(
      `UPDATE places SET status=$2,moderation_comment=$3,category_slug=COALESCE($4,category_slug),approved_at=CASE WHEN $2='approved' THEN now() ELSE approved_at END,updated_at=now() WHERE id=$1 RETURNING id,name,status,category_slug,moderation_comment`,
      [placeId, status, comment ?? null, cleanCategory || null],
    );
    if (!result.rows[0]) throw new NotFoundException("Place not found");
    return result.rows[0];
  }

  async adminCreateQr(body: Record<string, unknown>) {
    const placeId = body.place_id ? String(body.place_id) : null;
    let regionId = String(body.region_id ?? "region-tatariv");
    if (placeId) {
      const place = await this.place(placeId);
      regionId = String((place as { region_id?: string }).region_id || regionId);
    }
    const startParam = String(body.start_param ?? makeId("qr").replaceAll("-", "").slice(0, 48)).trim();
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(startParam)) throw new BadRequestException("start_param must contain only A-Z, a-z, 0-9, _ or - and be up to 64 characters");
    const id = makeId("qr");
    await this.db.query(
      `INSERT INTO qr_points(id,start_param,type,source,region_id,place_id,campaign_id,ambassador_id,active)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,true)`,
      [id, startParam, body.type ?? "entry_point", body.source ?? "hotel", regionId, placeId, body.campaign_id ?? null, body.ambassador_id ?? null],
    );
    return { id, start_param: startParam, region_id: regionId, place_id: placeId, active: true };
  }

  async adminQrList() {
    const result = await this.db.query(
      `SELECT q.id,q.start_param,q.type,q.source,q.active,q.created_at,r.name region_name,p.name place_name,p.id place_id
       FROM qr_points q JOIN regions r ON r.id=q.region_id LEFT JOIN places p ON p.id=q.place_id ORDER BY q.created_at DESC`,
    );
    return result.rows;
  }

  async adminToggleQr(id: string, active: boolean) {
    const result = await this.db.query("UPDATE qr_points SET active=$2,updated_at=now() WHERE id=$1 RETURNING id,start_param,active", [id, active]);
    if (!result.rows[0]) throw new NotFoundException("QR point not found");
    return result.rows[0];
  }

  async adminSaveTemplate(body: Record<string, unknown>) {
    const categorySlug = String(body.category_slug ?? "").trim();
    const placeType = String(body.place_type ?? "").trim();
    const label = String(body.label ?? placeType).trim();
    if (!categorySlug || !placeType || !label) throw new BadRequestException("category_slug, place_type and label are required");
    const id = String(body.id ?? makeId("tpl"));
    const defaultTitle = String(body.default_title ?? "").trim() || null;
    const defaultDescription = String(body.default_description ?? "").trim() || null;
    await this.db.query(
      `INSERT INTO place_type_templates(id,category_slug,place_type,label,default_title,default_description,default_services,default_amenities,fields,sort_order,active)
       VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9::jsonb,$10,true)
       ON CONFLICT (category_slug,place_type) DO UPDATE SET label=EXCLUDED.label,default_title=EXCLUDED.default_title,default_description=EXCLUDED.default_description,default_services=EXCLUDED.default_services,default_amenities=EXCLUDED.default_amenities,fields=EXCLUDED.fields,sort_order=EXCLUDED.sort_order,active=true,updated_at=now()`,
      [id,categorySlug,placeType,label,defaultTitle,defaultDescription,JSON.stringify(body.default_services ?? []),JSON.stringify(body.default_amenities ?? []),JSON.stringify(body.fields ?? {}),num(body.sort_order,100)],
    );
    return { ok: true, id, category_slug: categorySlug, place_type: placeType };
  }

  async adminCreateCategory(body: Record<string, unknown>) {
    const slug = String(body.slug ?? "").trim().toLowerCase();
    const name = String(body.name ?? "").trim();
    if (!slug || !name) throw new BadRequestException("slug and name are required");
    await this.db.query(
      `INSERT INTO categories(slug,name,name_en,name_pl,sort_order,subcategories,filter_config) VALUES($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb)
       ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name,name_en=EXCLUDED.name_en,name_pl=EXCLUDED.name_pl,subcategories=EXCLUDED.subcategories,filter_config=EXCLUDED.filter_config,updated_at=now()`,
      [slug,name,body.name_en ?? null,body.name_pl ?? null,num(body.sort_order,100),JSON.stringify(body.subcategories ?? []),JSON.stringify(body.filter_config ?? {})],
    );
    return { ok: true, slug };
  }

  async adminEmergency(body: Record<string, unknown>) {
    const id = body.id ? String(body.id) : makeId("em");
    const regionId = String(body.region_id ?? "region-tatariv");
    const title = String(body.title ?? "").trim();
    if (!title) throw new BadRequestException("title is required");
    await this.db.query(
      `INSERT INTO emergency_contacts(id,region_id,type,title,note,phone,lat,lng,tone,sort_order,active)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true)
       ON CONFLICT (id) DO UPDATE SET type=EXCLUDED.type,title=EXCLUDED.title,note=EXCLUDED.note,phone=EXCLUDED.phone,lat=EXCLUDED.lat,lng=EXCLUDED.lng,tone=EXCLUDED.tone,sort_order=EXCLUDED.sort_order,active=true,updated_at=now()`,
      [id,regionId,body.type ?? "custom",title,body.note ?? "",body.phone ?? null,num(body.lat),num(body.lng),body.tone ?? "green",num(body.sort_order,100)],
    );
    return { ok: true, id };
  }
}

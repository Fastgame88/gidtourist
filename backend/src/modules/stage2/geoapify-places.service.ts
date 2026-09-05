import { BadGatewayException, Injectable, NotFoundException } from "@nestjs/common";

export type GeoapifyPlace = {
  placeId: string;
  name: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  categories: string[];
  distance?: number;
  website?: string | null;
  phone?: string | null;
  openingHours?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  internetAccess?: boolean | null;
  wheelchair?: boolean | string | null;
  parking?: Record<string, unknown> | null;
  raw?: Record<string, unknown>;
};

export type GeoapifyRouteMetric = { id: string; distance_m: number; walking_duration_s: number };

type GeoapifyFeature = {
  properties?: Record<string, unknown>;
  geometry?: { coordinates?: unknown };
};

type GeoapifyFeatureCollection = { features?: GeoapifyFeature[] };

type GeoapifyRoutingResponse = {
  results?: Array<{ distance?: number; time?: number }>;
  features?: Array<{ properties?: { distance?: number; time?: number } }>;
};

const SECTION_CATEGORIES: Record<string, string[]> = {
  all: [
    "catering", "commercial", "entertainment", "tourism", "leisure", "sport",
    "public_transport", "service", "healthcare", "natural", "national_park", "parking",
  ],
  food: ["catering"],
  shop: ["commercial"],
  rest: ["leisure.spa", "sport.swimming_pool", "service.travel_agency", "tourism", "accommodation"],
  entertainment: ["entertainment", "activity", "sport", "tourism.attraction"],
  transfer: ["public_transport", "service.taxi", "service.vehicle", "parking", "commercial.vehicle"],
  nature: ["natural", "national_park", "leisure.park", "tourism.attraction.viewpoint", "waterway"],
  interesting: ["tourism", "heritage", "religion", "entertainment.museum", "activity.events_venue"],
  useful: ["healthcare", "service.post", "service.police", "service.financial", "commercial.health_and_beauty.pharmacy", "parking"],
  routes: ["natural", "tourism", "sport", "highway.path", "highway.footway", "highway.cycleway"],
};

const SUBCATEGORY_CATEGORIES: Record<string, string[]> = {
  "Українська кухня": ["catering.restaurant.ukrainian", "catering.restaurant.regional"],
  "Неукраїнська кухня": ["catering.restaurant"],
  "Фаст фуд": ["catering.fast_food"],
  "Кавʼярні": ["catering.cafe", "catering.cafe.coffee", "catering.cafe.coffee_shop"],
  "Ресторани": ["catering.restaurant"],
  "Кафе": ["catering.cafe"],
  "Бари": ["catering.bar", "catering.pub"],
  "Піцерії": ["catering.restaurant.pizza", "catering.fast_food.pizza"],
  "Кондитерські": ["commercial.food_and_drink.confectionery", "catering.cafe.cake", "catering.cafe.dessert"],
  "Фастфуд": ["catering.fast_food"],
  "Їжа з собою": ["catering.fast_food", "commercial.food_and_drink.deli"],
  "Традиційна кухня": ["catering.restaurant.ukrainian", "catering.restaurant.regional"],
  "Продовольчі": ["commercial.supermarket", "commercial.convenience", "commercial.food_and_drink", "commercial.marketplace"],
  "Промтовари": ["commercial"],
  "Продукти": ["commercial.supermarket", "commercial.convenience", "commercial.food_and_drink", "commercial.marketplace"],
  "Сувеніри": ["commercial.gift_and_souvenir"],
  "Одяг і взуття": ["commercial.clothing", "commercial.clothing.shoes"],
  "Товари для дому": ["commercial.furniture_and_interior", "commercial.houseware_and_hardware"],
  "Аптеки": ["commercial.health_and_beauty.pharmacy", "healthcare.pharmacy"],
  "Техніка": ["commercial.elektronics"],
  "Будівництво": ["commercial.houseware_and_hardware.building_materials", "commercial.houseware_and_hardware.hardware_and_tools"],
  "Косметика": ["commercial.health_and_beauty.cosmetics"],
  "Чани": ["leisure.spa", "leisure.spa.public_bath", "leisure.spa.sauna"],
  "Сауни": ["leisure.spa.sauna", "leisure.spa"],
  "Басейни": ["sport.swimming_pool", "leisure.spa"],
  "Масаж": ["leisure.spa"],
  "Походи": ["natural", "tourism", "highway.path", "highway.footway"],
  "Гори": ["natural.mountain", "natural.mountain.peak", "natural.mountain.hill"],
  "Річки": ["natural.water.river_system", "waterway.river_system"],
  "Водоспади": ["natural.water", "tourism.attraction"],
  "Джерела": ["natural.water.spring"],
  "Озера": ["natural.water"],
  "Оглядові точки": ["tourism.attraction.viewpoint"],
  "Печери": ["natural.mountain.cave_entrance"],
  "Ліси": ["natural.forest", "natural.protected_area", "leisure.park.nature_reserve"],
  "Пам’ятки": ["tourism.sights", "tourism.attraction", "heritage"],
  "Музеї": ["entertainment.museum"],
  "Храми": ["tourism.sights.place_of_worship", "religion.place_of_worship"],
  "Архітектура": ["tourism.sights.building", "tourism.sights.castle", "heritage"],
  "Історичні місця": ["tourism.sights", "heritage"],
  "Скульптури": ["tourism.attraction.artwork.sculpture", "tourism.attraction.artwork.statue", "tourism.sights.memorial.monument"],
  "Події": ["activity.events_venue", "entertainment.culture"],
  "Активний відпочинок": ["sport", "activity", "entertainment.activity_park", "natural"],
  "Атракціони": ["entertainment.theme_park", "entertainment.activity_park", "entertainment.amusement_arcade"],
  "Екскурсії": ["service.travel_agency", "tourism"],
  "SPA і басейни": ["leisure.spa", "sport.swimming_pool"],
  "Риболовля": ["sport.fishing", "commercial.outdoor_and_sport.fishing"],
  "Верхова їзда": ["sport.horse_riding"],
  "Квадроцикли": ["activity", "sport"],
  "Польоти": ["airport.gliding", "activity"],
  "Автобусні зупинки": ["public_transport.bus", "public_transport.platform"],
  "Залізничні станції": ["public_transport.train"],
  "Автостанції": ["public_transport.bus", "public_transport"],
  "Таксі": ["service.taxi"],
  "Парковки": ["parking", "parking.cars"],
  "Оренда авто": ["commercial.vehicle", "service.vehicle"],
  "Заправки": ["service.vehicle.fuel"],
  "Зарядні станції": ["service.vehicle.charging_station"],
  "Банкомати": ["service.financial", "service.financial.atm"],
  "Обмін валют": ["service.financial"],
  "Пошта": ["service.post", "service.post.office"],
  "Лікарні": ["healthcare.hospital", "healthcare.clinic_or_praxis"],
  "Туалети": ["amenity.toilet", "building.toilet"],
  "Wi‑Fi": ["service", "catering", "accommodation"],
  "Поліція": ["service.police"],
  "Інформаційні центри": ["tourism.information", "tourism.information.office"],
  "Піші маршрути": ["highway.path", "highway.footway", "natural", "tourism"],
  "Веломаршрути": ["highway.cycleway", "sport", "natural"],
  "Автомаршрути": ["tourism", "natural"],
  "Верхові маршрути": ["sport.horse_riding", "natural"],
  "Водні маршрути": ["waterway", "natural.water", "sport"],
  "Популярні маршрути": ["tourism", "natural"],
  "Складні маршрути": ["natural.mountain", "highway.path"],
  "Маршрути вихідного дня": ["tourism", "natural", "leisure.park"],
};

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.map(asString).filter(Boolean) : [];
}

@Injectable()
export class GeoapifyPlacesService {
  private readonly nearbyCache = new Map<string, { value: GeoapifyPlace[]; expiresAt: number }>();
  private readonly detailsCache = new Map<string, { value: GeoapifyPlace; expiresAt: number }>();
  private readonly routeCache = new Map<string, { value: GeoapifyRouteMetric; expiresAt: number }>();
  private readonly nearbyCacheTtlMs = 5 * 60 * 1000;
  private readonly detailsCacheTtlMs = 10 * 60 * 1000;
  private readonly routeCacheTtlMs = 10 * 60 * 1000;

  private key() {
    return (process.env.GEOAPIFY_API_KEY || "").trim();
  }

  enabled() { return Boolean(this.key()); }

  private async requestJson<T>(url: string, retry = true): Promise<T> {
    if (!this.key()) throw new BadGatewayException("GEOAPIFY_API_KEY is not configured");
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (response.status === 429 && retry) {
      const retryAfter = Math.max(500, Math.min(2500, Number(response.headers.get("retry-after") || 0) * 1000 || 800));
      await new Promise((resolve) => setTimeout(resolve, retryAfter));
      return this.requestJson<T>(url, false);
    }
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new BadGatewayException(`Geoapify API ${response.status}: ${body || response.statusText}`);
    }
    return response.json() as Promise<T>;
  }

  categoriesFor(section = "all", subcategory = "") {
    const specific = SUBCATEGORY_CATEGORIES[subcategory];
    if (specific?.length) return specific;
    return SECTION_CATEGORIES[section] ?? SECTION_CATEGORIES.all;
  }

  mapSection(categories: string[], fallback = "interesting") {
    if (categories.some((item) => item.startsWith("catering"))) return "food";
    if (categories.some((item) => item.startsWith("commercial"))) return "shop";
    if (categories.some((item) => item.startsWith("public_transport") || item.startsWith("service.taxi") || item.startsWith("service.vehicle") || item.startsWith("parking"))) return "transfer";
    if (categories.some((item) => item.startsWith("natural") || item.startsWith("national_park") || item.startsWith("waterway") || item.startsWith("leisure.park"))) return "nature";
    if (categories.some((item) => item.startsWith("leisure.spa") || item.startsWith("accommodation"))) return "rest";
    if (categories.some((item) => item.startsWith("entertainment") || item.startsWith("activity") || item.startsWith("sport"))) return "entertainment";
    if (categories.some((item) => item.startsWith("healthcare") || item.startsWith("service.post") || item.startsWith("service.police"))) return "useful";
    if (categories.some((item) => item.startsWith("tourism") || item.startsWith("heritage") || item.startsWith("religion"))) return "interesting";
    return fallback;
  }

  subcategory(categories: string[]) {
    const joined = categories.join(" ");
    const pairs: Array<[RegExp, string]> = [
      [/catering\.restaurant\.pizza|catering\.fast_food\.pizza/, "Піцерії"],
      [/catering\.restaurant/, "Ресторани"], [/catering\.cafe/, "Кафе"], [/catering\.bar|catering\.pub/, "Бари"], [/catering\.fast_food/, "Фастфуд"],
      [/commercial\.supermarket|commercial\.convenience|commercial\.food_and_drink/, "Продукти"], [/commercial\.gift_and_souvenir/, "Сувеніри"], [/commercial\.health_and_beauty\.pharmacy|healthcare\.pharmacy/, "Аптеки"],
      [/leisure\.spa\.sauna/, "Сауни"], [/leisure\.spa/, "SPA і басейни"], [/sport\.swimming_pool/, "Басейни"],
      [/entertainment\.museum/, "Музеї"], [/tourism\.attraction\.viewpoint/, "Оглядові точки"], [/natural\.mountain/, "Гори"], [/natural\.forest/, "Ліси"],
      [/public_transport\.train/, "Залізничні станції"], [/public_transport\.bus/, "Автобусні зупинки"], [/service\.taxi/, "Таксі"], [/parking/, "Парковки"],
      [/service\.vehicle\.fuel/, "Заправки"], [/service\.vehicle\.charging_station/, "Зарядні станції"], [/healthcare\.hospital/, "Лікарні"], [/service\.post/, "Пошта"], [/service\.police/, "Поліція"],
    ];
    return pairs.find(([pattern]) => pattern.test(joined))?.[1] ?? "";
  }

  private featureToPlace(feature: GeoapifyFeature): GeoapifyPlace | null {
    const props = feature.properties ?? {};
    const coordinates = Array.isArray(feature.geometry?.coordinates) ? feature.geometry?.coordinates as unknown[] : [];
    const lat = asNumber(props.lat) ?? asNumber(coordinates[1]);
    const lng = asNumber(props.lon) ?? asNumber(coordinates[0]);
    const placeId = asString(props.place_id);
    if (!placeId || lat == null || lng == null) return null;
    const contact = asRecord(props.contact);
    const wiki = asRecord(props.wiki_and_media);
    const phoneInternational = contact ? asRecord(contact.phone_international) : undefined;
    const phone = asString(contact?.phone) || asString(phoneInternational?.ua) || stringArray(contact?.phone_other)[0] || null;
    const categories = stringArray(props.categories);
    return {
      placeId,
      name: asString(props.name) || asString(props.address_line1) || "Локація",
      formattedAddress: asString(props.formatted) || [asString(props.address_line1), asString(props.address_line2)].filter(Boolean).join(", "),
      lat,
      lng,
      categories,
      distance: asNumber(props.distance),
      website: asString(props.website) || null,
      phone,
      openingHours: asString(props.opening_hours) || null,
      imageUrl: asString(wiki?.image) || null,
      description: asString(props.description) || null,
      internetAccess: typeof props.internet_access === "boolean" ? props.internet_access : null,
      wheelchair: typeof props.wheelchair === "boolean" || typeof props.wheelchair === "string" ? props.wheelchair as boolean | string : null,
      parking: asRecord(props.parking) ?? null,
      raw: props,
    };
  }

  async nearby(lat: number, lng: number, radius: number, section = "all", subcategory = "", limit = 20, name = ""): Promise<GeoapifyPlace[]> {
    const preferredCategories = this.categoriesFor(section, subcategory);
    const safeLimit = Math.max(1, Math.min(Math.round(limit || 20), 40));
    const cleanName = name.trim();
    const cacheKey = [lat.toFixed(4), lng.toFixed(4), Math.round(radius), preferredCategories.join(","), safeLimit, cleanName.toLocaleLowerCase("uk")].join(":");
    const cached = this.nearbyCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const request = async (categories: string[]) => {
      const params = new URLSearchParams({
        categories: categories.join(","),
        filter: `circle:${lng},${lat},${Math.max(50, Math.round(radius))}`,
        bias: `proximity:${lng},${lat}`,
        limit: String(safeLimit),
        lang: "uk",
        apiKey: this.key(),
      });
      if (cleanName) params.set("name", cleanName);
      return this.requestJson<GeoapifyFeatureCollection>(`https://api.geoapify.com/v2/places?${params.toString()}`);
    };

    let data: GeoapifyFeatureCollection;
    try {
      data = await request(preferredCategories);
    } catch (error) {
      // Category taxonomies evolve. If a very specific category chip becomes unsupported,
      // fall back to the stable parent section instead of making the whole client list empty.
      const fallbackCategories = SECTION_CATEGORIES[section] ?? SECTION_CATEGORIES.all;
      if (!subcategory || fallbackCategories.join(",") === preferredCategories.join(",")) throw error;
      data = await request(fallbackCategories);
    }
    const result = (data.features ?? []).map((feature) => this.featureToPlace(feature)).filter((item): item is GeoapifyPlace => Boolean(item));
    this.nearbyCache.set(cacheKey, { value: result, expiresAt: Date.now() + this.nearbyCacheTtlMs });
    return result;
  }

  async details(placeId: string): Promise<GeoapifyPlace> {
    const clean = placeId.trim();
    if (!clean) throw new NotFoundException("Geoapify place id is required");
    const cached = this.detailsCache.get(clean);
    if (cached && cached.expiresAt > Date.now()) return cached.value;
    const params = new URLSearchParams({ id: clean, features: "details", lang: "uk", apiKey: this.key() });
    const data = await this.requestJson<GeoapifyFeatureCollection>(`https://api.geoapify.com/v2/place-details?${params.toString()}`);
    const feature = (data.features ?? []).find((item) => item.properties?.feature_type === "details") ?? data.features?.[0];
    const place = feature ? this.featureToPlace(feature) : null;
    if (!place) throw new NotFoundException("Geoapify place not found");
    this.detailsCache.set(clean, { value: place, expiresAt: Date.now() + this.detailsCacheTtlMs });
    return place;
  }

  async walkingRoute(originLat: number, originLng: number, destination: { id: string; lat: number; lng: number }): Promise<GeoapifyRouteMetric | null> {
    const cacheKey = `${originLat.toFixed(4)}:${originLng.toFixed(4)}:${destination.lat.toFixed(4)}:${destination.lng.toFixed(4)}`;
    const cached = this.routeCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return { ...cached.value, id: destination.id };
    const params = new URLSearchParams({
      waypoints: `${originLat},${originLng}|${destination.lat},${destination.lng}`,
      mode: "walk",
      format: "json",
      apiKey: this.key(),
    });
    const data = await this.requestJson<GeoapifyRoutingResponse>(`https://api.geoapify.com/v1/routing?${params.toString()}`);
    const route = data.results?.[0] ?? data.features?.[0]?.properties;
    const distance = asNumber(route?.distance);
    const time = asNumber(route?.time);
    if (distance == null || time == null) return null;
    const value = { id: destination.id, distance_m: Math.round(distance), walking_duration_s: Math.round(time) };
    this.routeCache.set(cacheKey, { value, expiresAt: Date.now() + this.routeCacheTtlMs });
    return value;
  }
}

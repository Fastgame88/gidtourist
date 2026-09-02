import { BadGatewayException, Injectable } from "@nestjs/common";

export type GoogleSuggestion = { place_id: string; text: string; main_text: string; secondary_text: string };
export type GoogleNearbyPlace = {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  primaryType?: string;
  primaryTypeDisplayName?: { text?: string };
  types?: string[];
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  regularOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
  googleMapsUri?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  photos?: Array<{ name?: string }>;
  addressComponents?: Array<{ longText?: string; shortText?: string; types?: string[] }>;
};

const NEARBY_TYPES: Record<string, string[]> = {
  food: ["restaurant", "cafe", "bar", "bakery", "coffee_shop", "fast_food_restaurant", "pizza_restaurant", "ukrainian_restaurant"],
  shop: ["grocery_store", "supermarket", "convenience_store", "gift_shop", "pharmacy", "clothing_store", "shoe_store", "home_goods_store", "electronics_store", "hardware_store", "cosmetics_store", "market", "store"],
  rest: ["spa", "massage", "sauna", "swimming_pool", "wellness_center", "hiking_area", "tour_agency"],
  entertainment: ["adventure_sports_center", "amusement_center", "amusement_park", "off_roading_area", "tourist_attraction", "playground", "ski_resort", "stable", "sports_activity_location"],
  transfer: ["taxi_service", "taxi_stand", "bus_station", "bus_stop", "train_station", "parking", "car_rental", "gas_station", "electric_vehicle_charging_station"],
  nature: ["mountain_peak", "river", "lake", "nature_preserve", "scenic_spot", "woods", "park", "national_park", "hiking_area"],
  interesting: ["tourist_attraction", "museum", "history_museum", "church", "historical_place", "historical_landmark", "cultural_landmark", "monument", "sculpture", "event_venue"],
  useful: ["atm", "bank", "post_office", "hospital", "general_hospital", "public_bathroom", "police", "tourist_information_center", "pharmacy"],
  routes: ["hiking_area", "cycling_park", "tourist_attraction", "scenic_spot", "park", "national_park"],
};

const SUBCATEGORY_TYPES: Record<string, string[]> = {
  "Ресторани": ["restaurant", "ukrainian_restaurant", "bistro"],
  "Кафе": ["cafe", "coffee_shop", "coffee_stand"],
  "Бари": ["bar", "cocktail_bar", "sports_bar", "wine_bar"],
  "Піцерії": ["pizza_restaurant"],
  "Кондитерські": ["bakery", "confectionery", "cake_shop", "dessert_shop"],
  "Фастфуд": ["fast_food_restaurant"],
  "Їжа з собою": ["food_delivery", "deli"],
  "Традиційна кухня": ["ukrainian_restaurant", "restaurant"],
  "Продукти": ["grocery_store", "supermarket", "food_store", "convenience_store", "market"],
  "Сувеніри": ["gift_shop", "market"],
  "Одяг і взуття": ["clothing_store", "shoe_store", "sportswear_store"],
  "Товари для дому": ["home_goods_store", "furniture_store", "hardware_store"],
  "Аптеки": ["pharmacy", "drugstore"],
  "Техніка": ["electronics_store", "cell_phone_store"],
  "Будівництво": ["building_materials_store", "hardware_store", "home_improvement_store"],
  "Косметика": ["cosmetics_store", "beauty_salon"],
  "Гори": ["mountain_peak", "scenic_spot", "hiking_area"],
  "Річки": ["river"],
  "Водоспади": ["scenic_spot", "tourist_attraction"],
  "Джерела": ["scenic_spot"],
  "Озера": ["lake"],
  "Оглядові точки": ["scenic_spot", "observation_deck"],
  "Печери": ["tourist_attraction"],
  "Ліси": ["woods", "nature_preserve"],
  "Пам’ятки": ["tourist_attraction", "cultural_landmark", "historical_landmark"],
  "Музеї": ["museum", "history_museum", "art_museum"],
  "Храми": ["church"],
  "Архітектура": ["cultural_landmark", "historical_place", "castle"],
  "Історичні місця": ["historical_place", "historical_landmark"],
  "Скульптури": ["sculpture", "monument"],
  "Події": ["event_venue", "concert_hall", "cultural_center"],
  "Активний відпочинок": ["adventure_sports_center", "off_roading_area", "hiking_area"],
  "Атракціони": ["amusement_center", "amusement_park"],
  "Екскурсії": ["tour_agency", "tourist_attraction"],
  "SPA і басейни": ["spa", "sauna", "swimming_pool", "massage"],
  "Риболовля": ["fishing_pond", "fishing_pier", "fishing_charter"],
  "Верхова їзда": ["stable", "sports_activity_location"],
  "Квадроцикли": ["off_roading_area", "adventure_sports_center"],
  "Польоти": ["adventure_sports_center", "airstrip"],
  "Автобусні зупинки": ["bus_stop"],
  "Залізничні станції": ["train_station"],
  "Автостанції": ["bus_station", "transit_station"],
  "Таксі": ["taxi_service", "taxi_stand"],
  "Парковки": ["parking", "parking_lot", "parking_garage"],
  "Оренда авто": ["car_rental"],
  "Заправки": ["gas_station"],
  "Зарядні станції": ["electric_vehicle_charging_station", "ebike_charging_station"],
  "Банкомати": ["atm"],
  "Обмін валют": ["bank"],
  "Пошта": ["post_office"],
  "Лікарні": ["hospital", "general_hospital", "medical_center"],
  "Туалети": ["public_bathroom"],
  "Wi‑Fi": ["internet_cafe", "visitor_center"],
  "Поліція": ["police"],
  "Інформаційні центри": ["tourist_information_center", "visitor_center"],
  "Піші маршрути": ["hiking_area"],
  "Веломаршрути": ["cycling_park", "hiking_area"],
  "Автомаршрути": ["scenic_spot", "tourist_attraction"],
  "Верхові маршрути": ["stable", "sports_activity_location"],
  "Водні маршрути": ["river", "lake", "marina"],
  "Популярні маршрути": ["hiking_area", "scenic_spot", "tourist_attraction"],
  "Складні маршрути": ["hiking_area", "mountain_peak"],
  "Маршрути вихідного дня": ["hiking_area", "park", "scenic_spot"],
};

@Injectable()
export class GooglePlacesService {
  private key() {
    return (process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "").trim();
  }

  enabled() { return Boolean(this.key()); }

  private async googleFetch<T>(url: string, init: RequestInit): Promise<T> {
    const key = this.key();
    if (!key) throw new BadGatewayException("GOOGLE_MAPS_SERVER_API_KEY is not configured");
    const headers = new Headers(init.headers);
    headers.set("X-Goog-Api-Key", key);
    const response = await fetch(url, { ...init, headers });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new BadGatewayException(`Google Maps API ${response.status}: ${body || response.statusText}`);
    }
    return response.json() as Promise<T>;
  }

  async autocomplete(input: string, mode: "city" | "street" | "house", city = "", street = ""): Promise<GoogleSuggestion[]> {
    const clean = input.trim();
    if (clean.length < 1) return [];
    const query = mode === "city" ? clean : mode === "street" ? `${clean}, ${city}, Україна` : `${street} ${clean}, ${city}, Україна`;
    const body: Record<string, unknown> = {
      input: query,
      languageCode: "uk",
      regionCode: "UA",
      includedRegionCodes: ["ua"],
      includeQueryPredictions: false,
    };

    // `(cities)` excludes villages/smaller settlements. Use locality-compatible primary types instead,
    // so typing from the first letter can return both cities and villages across Ukraine.
    if (mode === "city") body.includedPrimaryTypes = ["locality", "postal_town", "administrative_area_level_3", "administrative_area_level_4", "administrative_area_level_5"];
    if (mode === "street") body.includedPrimaryTypes = ["route"];
    if (mode === "house") body.includedPrimaryTypes = ["street_address", "premise", "subpremise"];

    type Prediction = {
      placeId?: string;
      text?: { text?: string };
      structuredFormat?: { mainText?: { text?: string }; secondaryText?: { text?: string } };
      types?: string[];
    };
    type AutocompleteResponse = { suggestions?: Array<{ placePrediction?: Prediction }> };
    const request = (payload: Record<string, unknown>) => this.googleFetch<AutocompleteResponse>(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-FieldMask": "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text,suggestions.placePrediction.types",
        },
        body: JSON.stringify(payload),
      },
    );

    let data = await request(body);
    // A few Ukrainian villages are inconsistently classified by Google. If the strict locality
    // request is empty, retry without a primary-type restriction and keep only settlement-like results.
    if (mode === "city" && !(data.suggestions ?? []).some((item) => item.placePrediction?.placeId)) {
      const fallbackBody = { ...body };
      delete fallbackBody.includedPrimaryTypes;
      data = await request(fallbackBody);
    }

    const settlementTypes = new Set([
      "locality", "postal_town", "administrative_area_level_3", "administrative_area_level_4", "administrative_area_level_5",
      "sublocality", "political",
    ]);

    return (data.suggestions ?? []).flatMap((item) => {
      const prediction = item.placePrediction;
      if (!prediction?.placeId) return [];
      if (mode === "city" && prediction.types?.length && !prediction.types.some((type) => settlementTypes.has(type))) return [];
      return [{
        place_id: prediction.placeId,
        text: prediction.text?.text || prediction.structuredFormat?.mainText?.text || "",
        main_text: prediction.structuredFormat?.mainText?.text || prediction.text?.text || "",
        secondary_text: prediction.structuredFormat?.secondaryText?.text || "",
      }];
    }).slice(0, 8);
  }

  async details(placeId: string): Promise<GoogleNearbyPlace> {
    return this.googleFetch<GoogleNearbyPlace>(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=uk&regionCode=UA`, {
      method: "GET",
      headers: { "X-Goog-FieldMask": "id,displayName,formattedAddress,location,addressComponents,types,primaryType,primaryTypeDisplayName,rating,userRatingCount,priceLevel,regularOpeningHours,googleMapsUri,websiteUri,nationalPhoneNumber,photos" },
    });
  }

  async nearby(lat: number, lng: number, radius: number, section = "all", subcategory = ""): Promise<GoogleNearbyPlace[]> {
    const subcategoryTypes = SUBCATEGORY_TYPES[subcategory] ?? [];
    const types = subcategoryTypes.length ? subcategoryTypes : section === "all" ? Array.from(new Set(Object.values(NEARBY_TYPES).flat())).slice(0, 50) : (NEARBY_TYPES[section] ?? []);
    if (!types.length) return [];
    const data = await this.googleFetch<{ places?: GoogleNearbyPlace[] }>("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.types,places.primaryType,places.primaryTypeDisplayName,places.rating,places.userRatingCount,places.priceLevel,places.regularOpeningHours,places.googleMapsUri,places.websiteUri,places.nationalPhoneNumber,places.photos",
      },
      body: JSON.stringify({
        includedTypes: types,
        maxResultCount: 20,
        rankPreference: "DISTANCE",
        languageCode: "uk",
        regionCode: "UA",
        locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius: Math.max(100, Math.min(radius, 50000)) } },
      }),
    });
    return data.places ?? [];
  }

  mapSection(primaryType = "", types: string[] = []) {
    const all = new Set([primaryType, ...types]);
    for (const [section, candidates] of Object.entries(NEARBY_TYPES)) {
      if (candidates.some((type) => all.has(type))) return section;
    }
    return "interesting";
  }

  matchesSubcategory(label: string, primaryType = "", types: string[] = []) {
    const expected = SUBCATEGORY_TYPES[label] ?? [];
    if (!expected.length) return true;
    const actual = new Set([primaryType, ...types]);
    return expected.some((type) => actual.has(type));
  }

  subcategory(primaryType = "", label = "") {
    if (label) return label;
    return primaryType.replaceAll("_", " ");
  }
}

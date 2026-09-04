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
  googleMapsLinks?: {
    placeUri?: string;
    directionsUri?: string;
    writeAReviewUri?: string;
    reviewsUri?: string;
    photosUri?: string;
  };
  websiteUri?: string;
  nationalPhoneNumber?: string;
  photos?: Array<{ name?: string; authorAttributions?: Array<{ displayName?: string; uri?: string; photoUri?: string }> }>;
  reviews?: Array<{
    rating?: number;
    text?: { text?: string; languageCode?: string };
    originalText?: { text?: string; languageCode?: string };
    authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
    relativePublishTimeDescription?: string;
    publishTime?: string;
    googleMapsUri?: string;
  }>;
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
  // Client category chips used by the approved Gid Tourist design.
  "Українська кухня": ["ukrainian_restaurant", "restaurant"],
  "Неукраїнська кухня": ["restaurant", "italian_restaurant", "asian_restaurant", "chinese_restaurant", "japanese_restaurant"],
  "Фаст фуд": ["fast_food_restaurant"],
  "Кавʼярні": ["cafe", "coffee_shop", "coffee_stand"],
  "Продовольчі": ["grocery_store", "supermarket", "convenience_store", "market"],
  "Промтовари": ["store", "home_goods_store", "hardware_store", "electronics_store", "clothing_store"],
  "Чани": ["spa", "sauna", "wellness_center"],
  "Сауни": ["sauna", "spa"],
  "Басейни": ["swimming_pool", "spa"],
  "Масаж": ["massage", "spa"],
  "Походи": ["hiking_area", "tourist_attraction"],
  "Джипи": ["off_roading_area", "adventure_sports_center"],
  "Рафтинг": ["adventure_sports_center", "tourist_attraction"],
  "Зіплайн": ["adventure_sports_center", "amusement_center"],
  "Для дітей": ["playground", "amusement_center", "amusement_park"],
  "Коні": ["stable", "sports_activity_location"],
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
    const fieldMask = "id,displayName,formattedAddress,location,addressComponents,types,primaryType,primaryTypeDisplayName,rating,userRatingCount,priceLevel,regularOpeningHours,googleMapsUri,googleMapsLinks,websiteUri,nationalPhoneNumber,photos,reviews";
    const fetchDetails = (localized: boolean) => this.googleFetch<GoogleNearbyPlace>(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?${localized ? "languageCode=uk&" : ""}regionCode=UA`,
      { method: "GET", headers: { "X-Goog-FieldMask": fieldMask } },
    );
    const primary = await fetchDetails(true);
    const hasReviewText = primary.reviews?.some((review) => Boolean(review.text?.text?.trim() || review.originalText?.text?.trim()));
    if (Number(primary.userRatingCount ?? 0) > 0 && !hasReviewText) {
      try {
        const fallback = await fetchDetails(false);
        if (fallback.reviews?.some((review) => Boolean(review.text?.text?.trim() || review.originalText?.text?.trim()))) {
          return { ...primary, reviews: fallback.reviews };
        }
      } catch { /* localized details remain usable */ }
    }
    return primary;
  }

  async photoUri(photoName: string) {
    const clean = photoName.trim().replace(/^\/+/, "");
    if (!clean || !/^places\/[^/]+\/photos\/[^/]+/.test(clean)) throw new BadGatewayException("Invalid Google photo name");
    const data = await this.googleFetch<{ photoUri?: string }>(`https://places.googleapis.com/v1/${clean}/media?maxWidthPx=1200&maxHeightPx=900&skipHttpRedirect=true`, { method: "GET" });
    if (!data.photoUri) throw new BadGatewayException("Google photo is unavailable");
    return data.photoUri;
  }

  async photoData(photoName: string) {
    const clean = photoName.trim().replace(/^\/+/, "");
    if (!clean || !/^places\/[^/]+\/photos\/[^/]+/.test(clean)) throw new BadGatewayException("Invalid Google photo name");
    const key = this.key();
    if (!key) throw new BadGatewayException("GOOGLE_MAPS_SERVER_API_KEY is not configured");

    // Request the media endpoint directly with a fresh photo resource name. This avoids keeping
    // short-lived Google image URLs in the client and lets the server follow Google's redirect.
    const mediaUrl = `https://places.googleapis.com/v1/${clean}/media?maxWidthPx=1200&maxHeightPx=900&key=${encodeURIComponent(key)}`;
    const response = await fetch(mediaUrl, { redirect: "follow", headers: { Accept: "image/avif,image/webp,image/*,*/*" } });
    if (!response.ok) throw new BadGatewayException(`Google photo ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    if (!buffer.length) throw new BadGatewayException("Google photo is empty");
    const contentType = response.headers.get("content-type") || "image/jpeg";
    if (!contentType.toLowerCase().startsWith("image/")) throw new BadGatewayException("Google photo response is not an image");
    return { buffer, contentType };
  }

  async placePhotoData(placeId: string) {
    const place = await this.googleFetch<{ photos?: Array<{ name?: string }> }>(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=uk&regionCode=UA`,
      { method: "GET", headers: { "X-Goog-FieldMask": "photos" } },
    );
    const photoNames = (place.photos ?? []).map((photo) => photo.name?.trim() || "").filter(Boolean).slice(0, 5);
    if (!photoNames.length) throw new BadGatewayException("Google place has no photo");
    let lastError: unknown;
    for (const photoName of photoNames) {
      try { return await this.photoData(photoName); }
      catch (error) { lastError = error; }
    }
    throw lastError instanceof Error ? lastError : new BadGatewayException("Google place photos are unavailable");
  }


  async reverse(lat: number, lng: number) {
    const key = this.key();
    if (!key) throw new BadGatewayException("GOOGLE_MAPS_SERVER_API_KEY is not configured");
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(String(lat))},${encodeURIComponent(String(lng))}&language=uk&region=ua&key=${encodeURIComponent(key)}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new BadGatewayException(`Google Geocoding API ${response.status}: ${body || response.statusText}`);
    }
    const data = await response.json() as { status?: string; error_message?: string; results?: Array<{ formatted_address?: string; place_id?: string; address_components?: Array<{ long_name?: string; short_name?: string; types?: string[] }> }> };
    if (data.status !== "OK" || !data.results?.[0]) throw new BadGatewayException(`Google Geocoding API: ${data.error_message || data.status || "no result"}`);
    const first = data.results[0];
    const component = (type: string) => first.address_components?.find((item) => item.types?.includes(type))?.long_name || "";
    return {
      place_id: first.place_id || "",
      formatted_address: first.formatted_address || "",
      lat, lng,
      city: component("locality") || component("postal_town") || component("administrative_area_level_3"),
      region: component("administrative_area_level_1"),
      street: component("route"),
      house: component("street_number"),
    };
  }

  async nearby(lat: number, lng: number, radius: number, section = "all", subcategory = "", limit = 20, spread = false): Promise<GoogleNearbyPlace[]> {
    const subcategoryTypes = SUBCATEGORY_TYPES[subcategory] ?? [];
    const types = subcategoryTypes.length ? subcategoryTypes : section === "all" ? Array.from(new Set(Object.values(NEARBY_TYPES).flat())).slice(0, 50) : (NEARBY_TYPES[section] ?? []);
    if (!types.length) return [];

    const search = async (centerLat: number, centerLng: number, searchRadius: number, maxResultCount: number, rankPreference: "DISTANCE" | "POPULARITY") => {
      const data = await this.googleFetch<{ places?: GoogleNearbyPlace[] }>("https://places.googleapis.com/v1/places:searchNearby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.types,places.primaryType,places.primaryTypeDisplayName,places.rating,places.userRatingCount,places.priceLevel,places.regularOpeningHours,places.googleMapsUri,places.googleMapsLinks,places.websiteUri,places.nationalPhoneNumber,places.photos",
        },
        body: JSON.stringify({
          includedTypes: types,
          maxResultCount: Math.max(1, Math.min(maxResultCount, 20)),
          rankPreference,
          languageCode: "uk",
          regionCode: "UA",
          locationRestriction: { circle: { center: { latitude: centerLat, longitude: centerLng }, radius: Math.max(100, Math.min(searchRadius, 50000)) } },
        }),
      });
      return data.places ?? [];
    };

    if (!spread || radius < 1000 || limit < 12 || subcategory) {
      // Lists in the tourist UI are proximity-first. Keeping DISTANCE here prevents a larger
      // radius from replacing nearby 300–500 m places with more popular but farther results.
      return search(lat, lng, radius, limit, "DISTANCE");
    }

    // For 1–5 km discovery always reserve the center query for the nearest places first, then
    // enrich the rest of the result set from surrounding sectors. This guarantees that increasing
    // the selected radius cannot make already-nearby markers disappear just because of popularity.
    const earth = 6371000;
    const distance = (aLat: number, aLng: number, bLat: number, bLng: number) => {
      const rad = (v: number) => v * Math.PI / 180;
      const dLat = rad(bLat-aLat), dLng = rad(bLng-aLng);
      const h = Math.sin(dLat/2)**2 + Math.cos(rad(aLat))*Math.cos(rad(bLat))*Math.sin(dLng/2)**2;
      return 2*earth*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
    };
    const offset = radius * 0.48;
    const dLat = offset / 111320;
    const dLng = offset / (111320 * Math.max(.2, Math.cos(lat * Math.PI / 180)));
    const sectorRadius = Math.max(450, radius * 0.62);
    const [center, north, south, east, west] = await Promise.all([
      search(lat, lng, radius, Math.min(20, limit), "DISTANCE"),
      search(lat+dLat, lng, sectorRadius, 5, "POPULARITY"),
      search(lat-dLat, lng, sectorRadius, 5, "POPULARITY"),
      search(lat, lng+dLng, sectorRadius, 5, "POPULARITY"),
      search(lat, lng-dLng, sectorRadius, 5, "POPULARITY"),
    ]);
    const selected: GoogleNearbyPlace[] = [];
    const seen = new Set<string>();
    for (const group of [center, north, south, east, west]) {
      let groupCount = 0;
      for (const place of group) {
        if (!place.id || seen.has(place.id)) continue;
        const pLat = Number(place.location?.latitude);
        const pLng = Number(place.location?.longitude);
        if (!Number.isFinite(pLat) || !Number.isFinite(pLng) || distance(lat,lng,pLat,pLng) > radius) continue;
        seen.add(place.id);
        selected.push(place);
        groupCount += 1;
        if (selected.length >= limit || groupCount >= (group === center ? Math.min(20, limit) : 3)) break;
      }
      if (selected.length >= limit) break;
    }
    return selected.slice(0, limit);
  }

  async walkingMatrix(originLat: number, originLng: number, destinations: Array<{ id: string; lat: number; lng: number }>) {
    const clean = destinations.filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng)).slice(0, 20);
    if (!clean.length) return [] as Array<{ id: string; distance_m: number; walking_duration_s: number }>;
    const data = await this.googleFetch<Array<{
      originIndex?: number; destinationIndex?: number; distanceMeters?: number; duration?: string; condition?: string; status?: { code?: number; message?: string };
    }>>(
      "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-FieldMask": "originIndex,destinationIndex,distanceMeters,duration,status,condition",
        },
        body: JSON.stringify({
          origins: [{ waypoint: { location: { latLng: { latitude: originLat, longitude: originLng } } } }],
          destinations: clean.map((item) => ({ waypoint: { location: { latLng: { latitude: item.lat, longitude: item.lng } } } })),
          travelMode: "WALK",
        }),
      },
    );
    return data.flatMap((item) => {
      const index = Number(item.destinationIndex ?? 0);
      const destination = clean[index];
      const distance = Number(item.distanceMeters ?? 0);
      const durationMatch = String(item.duration ?? "").match(/^([0-9.]+)s$/);
      const duration = durationMatch ? Math.round(Number(durationMatch[1])) : 0;
      const statusCode = Number(item.status?.code ?? 0);
      if (!destination || statusCode !== 0 || item.condition === "ROUTE_NOT_FOUND" || !distance || !duration) return [];
      return [{ id: destination.id, distance_m: Math.round(distance), walking_duration_s: duration }];
    });
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

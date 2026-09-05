export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS regions (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  name_en text,
  name_pl text,
  center_lat double precision NOT NULL,
  center_lng double precision NOT NULL,
  community_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  telegram_id bigint UNIQUE,
  telegram_username text,
  first_name text,
  last_name text,
  photo_url text,
  language_code text,
  selected_language text NOT NULL DEFAULT 'uk',
  role text NOT NULL DEFAULT 'tourist',
  phone text,
  consent jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url text;

CREATE TABLE IF NOT EXISTS user_sessions (
  token_hash text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);

CREATE TABLE IF NOT EXISTS categories (
  slug text PRIMARY KEY,
  name text NOT NULL,
  name_en text,
  name_pl text,
  sort_order integer NOT NULL DEFAULT 100,
  active boolean NOT NULL DEFAULT true,
  subcategories jsonb NOT NULL DEFAULT '[]'::jsonb,
  filter_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organizations (
  id text PRIMARY KEY,
  owner_user_id text REFERENCES users(id) ON DELETE SET NULL,
  region_id text REFERENCES regions(id) ON DELETE SET NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS places (
  id text PRIMARY KEY,
  organization_id text REFERENCES organizations(id) ON DELETE SET NULL,
  region_id text NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
  category_slug text NOT NULL REFERENCES categories(slug) ON DELETE RESTRICT,
  subcategory text,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  phone text,
  telegram text,
  website text,
  image_url text,
  rating numeric(3,2) NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  price_level integer,
  work_hours jsonb NOT NULL DEFAULT '{}'::jsonb,
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  translations jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  moderation_comment text,
  created_by_user_id text REFERENCES users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_places_region_category_status ON places(region_id, category_slug, status);
CREATE INDEX IF NOT EXISTS idx_places_geo ON places(lat, lng);

CREATE TABLE IF NOT EXISTS place_tags (
  place_id text NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  tag text NOT NULL,
  PRIMARY KEY(place_id, tag)
);
CREATE INDEX IF NOT EXISTS idx_place_tags_tag ON place_tags(tag);

CREATE TABLE IF NOT EXISTS qr_points (
  id text PRIMARY KEY,
  start_param text UNIQUE NOT NULL,
  type text NOT NULL DEFAULT 'entry_point',
  source text NOT NULL DEFAULT 'hotel',
  region_id text NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
  place_id text REFERENCES places(id) ON DELETE SET NULL,
  campaign_id text,
  ambassador_id text,
  active boolean NOT NULL DEFAULT true,
  created_by_user_id text REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_qr_points_start ON qr_points(start_param, active);


CREATE TABLE IF NOT EXISTS organization_telegram_access (
  organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  telegram_id bigint NOT NULL,
  role text NOT NULL DEFAULT 'owner',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(organization_id, telegram_id)
);
CREATE INDEX IF NOT EXISTS idx_org_tg_access_telegram ON organization_telegram_access(telegram_id, active);

CREATE TABLE IF NOT EXISTS favorites (
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id text NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, place_id)
);

CREATE TABLE IF NOT EXISTS external_favorites (
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id text NOT NULL,
  place_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, place_id)
);

CREATE TABLE IF NOT EXISTS activity_events (
  id text PRIMARY KEY,
  user_id text REFERENCES users(id) ON DELETE SET NULL,
  region_id text REFERENCES regions(id) ON DELETE SET NULL,
  place_id text REFERENCES places(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_user_created ON activity_events(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id text PRIMARY KEY,
  region_id text NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  note text NOT NULL DEFAULT '',
  phone text,
  lat double precision,
  lng double precision,
  tone text NOT NULL DEFAULT 'green',
  sort_order integer NOT NULL DEFAULT 100,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_emergency_region ON emergency_contacts(region_id, active, sort_order);

CREATE TABLE IF NOT EXISTS place_type_templates (
  id text PRIMARY KEY,
  category_slug text NOT NULL REFERENCES categories(slug) ON DELETE CASCADE,
  place_type text NOT NULL,
  label text NOT NULL,
  default_title text,
  default_description text,
  default_services jsonb NOT NULL DEFAULT '[]'::jsonb,
  default_amenities jsonb NOT NULL DEFAULT '[]'::jsonb,
  fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 100,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(category_slug, place_type)
);
ALTER TABLE place_type_templates ADD COLUMN IF NOT EXISTS default_title text;
ALTER TABLE place_type_templates ADD COLUMN IF NOT EXISTS default_description text;
ALTER TABLE place_type_templates ADD COLUMN IF NOT EXISTS default_amenities jsonb NOT NULL DEFAULT '[]'::jsonb;
`;

export const SEED_SQL = `
INSERT INTO regions (id, slug, name, name_en, name_pl, center_lat, center_lng, community_url)
VALUES ('region-tatariv', 'tatariv', 'Татарів', 'Tatariv', 'Tatarów', 48.34535, 24.57855, NULL)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, center_lat = EXCLUDED.center_lat, center_lng = EXCLUDED.center_lng;

INSERT INTO categories (slug, name, name_en, name_pl, sort_order, subcategories, filter_config) VALUES
('hotel','Про заклад','About place','O obiekcie',10,'[]'::jsonb,'{}'::jsonb),
('food','Де поїсти','Food','Gdzie zjeść',20,'["Українська кухня","Неукраїнська кухня","Фаст фуд","Кавʼярні"]'::jsonb,'{"rating":true,"price":true,"open_now":true,"kids":true}'::jsonb),
('shop','Де купити','Shopping','Zakupy',30,'["Продовольчі","Промтовари","Сувеніри","Аптеки"]'::jsonb,'{"rating":true,"distance":true,"open_now":true}'::jsonb),
('rest','Де відпочити','Relax','Wypoczynek',40,'["Чани","Сауни","Басейни","Масаж","Походи","Екскурсії"]'::jsonb,'{"rating":true,"price":true,"open_now":true}'::jsonb),
('entertainment','Розваги','Entertainment','Rozrywka',50,'["Джипи","Квадроцикли","Рафтинг","Зіплайн","Для дітей","Коні"]'::jsonb,'{"rating":true,"price":true,"kids":true}'::jsonb),
('transfer','Трансфер','Transfer','Transfer',60,'["Таксі","Автостанції","Парковки","Оренда авто","Заправки"]'::jsonb,'{"distance":true,"open_now":true}'::jsonb),
('nature','Природа','Nature','Natura',65,'["Гори","Річки","Водоспади","Озера","Оглядові точки","Печери","Ліси"]'::jsonb,'{"distance":true}'::jsonb),
('useful','Корисне','Useful','Przydatne',66,'["Банкомати","Обмін валют","Пошта","Лікарні","Туалети","Wi‑Fi","Поліція","Інформаційні центри"]'::jsonb,'{"distance":true,"open_now":true}'::jsonb),
('emergency','Халепа?','Emergency','Pomoc',70,'[]'::jsonb,'{}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, name_en=EXCLUDED.name_en, name_pl=EXCLUDED.name_pl, subcategories=EXCLUDED.subcategories, filter_config=EXCLUDED.filter_config;

INSERT INTO place_type_templates (id,category_slug,place_type,label,default_title,default_description,default_services,default_amenities,fields,sort_order) VALUES
('tpl-hotel','hotel','Готель','Готель','Новий готель','Комфортний готель для відпочинку гостей. Додайте короткий опис розташування, номерів та головних переваг.','["Сніданок","Прибирання","Сауна","Басейн","Трансфер"]'::jsonb,'["Номери","Паркінг","Wi‑Fi","Сніданок"]'::jsonb,'{"room_count":"Кількість номерів","opened_year":"Рік відкриття","languages":"Мови обслуговування","accommodation_type":"Тип розміщення"}'::jsonb,10),
('tpl-guesthouse','hotel','Садиба','Садиба','Нова садиба','Затишна садиба для відпочинку. Опишіть умови проживання, територію та головні переваги.','["Сніданок","Мангал","Чан","Трансфер"]'::jsonb,'["Номери","Паркінг","Wi‑Fi","Мангал"]'::jsonb,'{"room_count":"Кількість кімнат","opened_year":"Рік відкриття","languages":"Мови обслуговування","accommodation_type":"Тип розміщення"}'::jsonb,20),
('tpl-restaurant','food','Ресторан','Ресторан','Новий ресторан','Ресторан із власною кухнею та атмосферою. Опишіть кухню, формат закладу й особливі пропозиції.','["Основне меню","Сніданки","Доставка","Їжа з собою","Дитяче меню"]'::jsonb,'["Меню","Паркінг","Wi‑Fi","Дитяче меню"]'::jsonb,'{"capacity":"Кількість посадкових місць","average_check":"Середній чек","cuisine":"Кухня","languages":"Мови обслуговування"}'::jsonb,10),
('tpl-cafe','food','Кафе','Кафе','Нове кафе','Кафе для сніданків, кави та зустрічей. Додайте інформацію про меню, формат і особливості.','["Кава","Десерти","Сніданки","Їжа з собою"]'::jsonb,'["Кава","Wi‑Fi","Їжа з собою","Десерти"]'::jsonb,'{"capacity":"Кількість посадкових місць","average_check":"Середній чек","cuisine":"Тип кухні","languages":"Мови обслуговування"}'::jsonb,20),
('tpl-bar','food','Бар','Бар','Новий бар','Бар із напоями та закусками. Опишіть формат, атмосферу, кухню або події.','["Напої","Закуски","Жива музика"]'::jsonb,'["Напої","Wi‑Fi","Жива музика"]'::jsonb,'{"capacity":"Кількість місць","average_check":"Середній чек","format":"Формат закладу","languages":"Мови обслуговування"}'::jsonb,30),
('tpl-shop','shop','Магазин','Магазин','Новий магазин','Магазин товарів для туристів і місцевих мешканців. Вкажіть основний асортимент та умови покупки.','["Продаж у магазині","Самовивіз"]'::jsonb,'["Оплата карткою","Паркінг","Самовивіз"]'::jsonb,'{"store_format":"Формат магазину","assortment":"Основний асортимент","delivery":"Доставка / самовивіз","payment_methods":"Способи оплати"}'::jsonb,10),
('tpl-souvenir','shop','Сувенірна крамниця','Сувенірна крамниця','Нова сувенірна крамниця','Сувеніри, подарунки та локальні товари. Опишіть асортимент і особливі вироби.','["Сувеніри","Подарунки","Локальні товари"]'::jsonb,'["Подарунки","Локальні товари","Оплата карткою"]'::jsonb,'{"assortment":"Основний асортимент","local_goods":"Локальні товари","delivery":"Доставка / самовивіз","payment_methods":"Способи оплати"}'::jsonb,20),
('tpl-pharmacy','shop','Аптека','Аптека','Нова аптека','Аптека та товари для здоровʼя. Додайте графік, формат роботи й доступні сервіси.','["Ліки","Товари для здоровʼя"]'::jsonb,'["Ліки","Оплата карткою","Самовивіз"]'::jsonb,'{"format":"Формат аптеки","delivery":"Доставка / самовивіз","payment_methods":"Способи оплати","languages":"Мови обслуговування"}'::jsonb,30),
('tpl-spa','rest','SPA / сауна','SPA / сауна','Новий SPA / сауна','Місце для відпочинку й відновлення. Опишіть формати процедур, місткість і умови відвідування.','["Сауна","Чан","Масаж","Басейн"]'::jsonb,'["SPA","Паркінг","Рушники","Душ"]'::jsonb,'{"capacity":"Місткість","duration":"Тривалість сеансу","price_info":"Вартість","languages":"Мови обслуговування"}'::jsonb,10),
('tpl-excursion','rest','Екскурсії','Екскурсії','Нова екскурсія','Екскурсійна послуга для туристів. Опишіть маршрут, тривалість, складність та формат групи.','["Екскурсія","Гід","Трансфер"]'::jsonb,'["Гід","Трансфер","Групи"]'::jsonb,'{"duration":"Тривалість","group_size":"Розмір групи","difficulty":"Складність","languages":"Мови проведення"}'::jsonb,20),
('tpl-entertainment','entertainment','Активний відпочинок','Активний відпочинок','Нова активність','Активний відпочинок та враження. Опишіть формат, рівень складності, сезонність і вимоги до гостей.','["Квадроцикли","Рафтинг","Зіплайн","Джип-тур"]'::jsonb,'["Активності","Паркінг","Інструктор"]'::jsonb,'{"age_limit":"Вікові обмеження","duration":"Тривалість","difficulty":"Рівень складності","season":"Сезонність"}'::jsonb,10),
('tpl-transfer','transfer','Трансфер / таксі','Трансфер / таксі','Новий трансфер','Трансфер або таксі для гостей регіону. Вкажіть тип транспорту, місткість і зону роботи.','["Трансфер","Таксі","Оренда авто"]'::jsonb,'["Трансфер","Багаж","Дитяче крісло"]'::jsonb,'{"vehicle_type":"Тип транспорту","capacity":"Місткість","service_area":"Зона роботи","languages":"Мови водія"}'::jsonb,10)
ON CONFLICT (category_slug,place_type) DO UPDATE SET label=EXCLUDED.label,default_title=EXCLUDED.default_title,default_description=EXCLUDED.default_description,default_services=EXCLUDED.default_services,default_amenities=EXCLUDED.default_amenities,fields=EXCLUDED.fields,sort_order=EXCLUDED.sort_order,updated_at=now();

-- Remove only the historical demo points that shipped with the prototype.
-- Real partner/admin-created places use generated IDs and are never touched here.
DELETE FROM qr_points WHERE id='qr-girskyi-zatyshok' OR start_param='hotel-girskyi-zatyshok';
DELETE FROM places
WHERE organization_id IS NULL AND id = ANY(ARRAY[
  'place-girskyi-zatyshok','food-hutsulshchyna','food-kolyba','food-pizza','food-coffee',
  'shop-smak','shop-souvenir','shop-pharmacy','shop-home','rest-tub','rest-sauna','rest-pool','rest-massage',
  'fun-jeep','fun-quad','fun-rafting','fun-zipline','transfer-taxi','transfer-bus','transfer-gas','transfer-parking'
]::text[]);

INSERT INTO emergency_contacts (id, region_id, type, title, note, phone, tone, sort_order) VALUES
('em-112','region-tatariv','emergency','Єдиний номер допомоги','Поліція · швидка · рятувальники','112','red',10),
('em-103','region-tatariv','ambulance','Швидка допомога','Цілодобово','103','red',20),
('em-102','region-tatariv','police','Поліція','Допомога та правопорядок','102','blue',30),
('em-101','region-tatariv','rescue','ДСНС / рятувальники','Пожежі · аварії · надзвичайні ситуації','101','orange',40),
('em-mountain','region-tatariv','rescue','Гірські рятувальники','Яремче, найближчий пост','+380673421868','green',50)
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, note=EXCLUDED.note, phone=EXCLUDED.phone, active=true;
`;

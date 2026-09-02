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
  language_code text,
  selected_language text NOT NULL DEFAULT 'uk',
  role text NOT NULL DEFAULT 'tourist',
  phone text,
  consent jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz NOT NULL DEFAULT now()
);

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

INSERT INTO places (id, region_id, category_slug, subcategory, name, description, address, lat, lng, phone, telegram, website, image_url, rating, review_count, price_level, work_hours, attributes, details, status, approved_at)
VALUES
('place-girskyi-zatyshok','region-tatariv','hotel','Готель','Готель «Гірський затишок»','Затишний готель у серці Карпат з видом на гори та річку.','вул. Незалежності, 155, Татарів',48.34490,24.57920,'+380671234567','https://t.me/gid_tourist_tatariv','https://example.com','/images/mountain-hotel.webp',4.80,125,3,'{"always_open":true}'::jsonb,'{"parking":true,"kids":true,"wifi":true,"partner":true,"verified":true}'::jsonb,'{"check_in":"14:00","check_out":"11:00","wifi_ssid":"Girskyi_Zatyshok_Guest","wifi_password":"zatyshok155","rules":["Куріння заборонено в приміщеннях","Тихий час 22:00–08:00"],"languages":["uk","en","pl"]}'::jsonb,'approved',now()),
('food-hutsulshchyna','region-tatariv','food','Українська кухня','Ресторан «Гуцульщина»','Автентична карпатська кухня, локальні продукти та затишна атмосфера.','вул. Незалежності, 42, Татарів',48.34570,24.57740,'+380673421111',NULL,NULL,NULL,4.80,125,2,'{"daily":{"from":"10:00","to":"22:00"}}'::jsonb,'{"kids":true,"parking":true,"partner":true,"verified":true}'::jsonb,'{}'::jsonb,'approved',now()),
('food-kolyba','region-tatariv','food','Українська кухня','Колиба «У Марічки»','Банош, бограч, деруни та домашні карпатські страви.','вул. Шевченка, 8, Татарів',48.34710,24.57590,'+380673422222',NULL,NULL,NULL,4.70,86,2,'{"daily":{"from":"09:00","to":"21:30"}}'::jsonb,'{"kids":true,"parking":true}'::jsonb,'{}'::jsonb,'approved',now()),
('food-pizza','region-tatariv','food','Неукраїнська кухня','Піцерія «Татаріно»','Піца, паста та італійська кухня.','вул. Незалежності, 61, Татарів',48.34370,24.58110,'+380673423333',NULL,NULL,NULL,4.70,94,2,'{"daily":{"from":"11:00","to":"23:00"}}'::jsonb,'{"kids":true}'::jsonb,'{}'::jsonb,'approved',now()),
('food-coffee','region-tatariv','food','Кавʼярні','Кавʼярня «Гори & Кава»','Кава, десерти та сніданки.','вул. Незалежності, 28, Татарів',48.34640,24.58020,'+380673424444',NULL,NULL,NULL,4.90,68,1,'{"daily":{"from":"08:00","to":"20:00"}}'::jsonb,'{"kids":true,"wifi":true}'::jsonb,'{}'::jsonb,'approved',now()),
('shop-smak','region-tatariv','shop','Продовольчі','Магазин продуктів «Смак»','Продукти харчування, хліб та молочні вироби.','вул. Незалежності, 36, Татарів',48.34595,24.57970,'+380674001111',NULL,NULL,NULL,4.80,126,1,'{"daily":{"from":"08:00","to":"22:00"}}'::jsonb,'{"parking":true}'::jsonb,'{}'::jsonb,'approved',now()),
('shop-souvenir','region-tatariv','shop','Сувеніри','Сувеніри «Карпати»','Подарунки, кераміка та локальні вироби.','вул. Незалежності, 40, Татарів',48.34620,24.57790,'+380674002222',NULL,NULL,NULL,4.70,89,2,'{"daily":{"from":"09:00","to":"20:00"}}'::jsonb,'{}'::jsonb,'{}'::jsonb,'approved',now()),
('shop-pharmacy','region-tatariv','shop','Аптеки','Аптека «Здоровʼя»','Ліки та товари для здоровʼя.','вул. Незалежності, 52, Татарів',48.34480,24.57650,'+380674003333',NULL,NULL,NULL,4.60,72,2,'{"daily":{"from":"08:00","to":"21:00"}}'::jsonb,'{}'::jsonb,'{}'::jsonb,'approved',now()),
('shop-home','region-tatariv','shop','Промтовари','Госптовари «Все для дому»','Побутова хімія, інструменти та посуд.','вул. Незалежності, 70, Татарів',48.34320,24.58330,'+380674004444',NULL,NULL,NULL,4.50,51,1,'{"daily":{"from":"09:00","to":"19:00"}}'::jsonb,'{}'::jsonb,'{}'::jsonb,'approved',now()),
('rest-tub','region-tatariv','rest','Чани','Чан «Гірське відновлення»','Карпатський чан з видом на гори.','вул. Лісова, 4, Татарів',48.34290,24.57580,'+380675001111',NULL,NULL,'/images/service-tub.webp',4.80,128,3,'{"daily":{"from":"10:00","to":"22:00"}}'::jsonb,'{"parking":true,"partner":true}'::jsonb,'{}'::jsonb,'approved',now()),
('rest-sauna','region-tatariv','rest','Сауни','Сауна в «Карпатському затишку»','Сауна, віники та душ.','вул. Незалежності, 155, Татарів',48.34485,24.57910,'+380675002222',NULL,NULL,'/images/service-sauna.webp',4.70,86,3,'{"daily":{"from":"16:00","to":"22:00"}}'::jsonb,'{"parking":true,"partner":true}'::jsonb,'{}'::jsonb,'approved',now()),
('rest-pool','region-tatariv','rest','Басейни','Басейн «Aqua Relax»','Басейн, шезлонги та бар.','вул. Гірська, 12, Татарів',48.34770,24.58210,'+380675003333',NULL,NULL,'/images/service-pool.webp',4.60,93,3,'{"daily":{"from":"09:00","to":"21:00"}}'::jsonb,'{"kids":true,"parking":true}'::jsonb,'{}'::jsonb,'approved',now()),
('rest-massage','region-tatariv','rest','Масаж','Масажний салон «Harmony»','Масаж та SPA-процедури.','вул. Незалежності, 77, Татарів',48.34810,24.57600,'+380675004444',NULL,NULL,'/images/rest-massage.webp',4.90,112,3,'{"daily":{"from":"09:00","to":"20:00"}}'::jsonb,'{}'::jsonb,'{}'::jsonb,'approved',now()),
('fun-jeep','region-tatariv','entertainment','Джипи','Джип-тур Гірськими стежками','Маршрут на полонини та водоспади.','Старт: центр Татарова',48.34680,24.58400,'+380676001111',NULL,NULL,NULL,4.90,128,3,'{"daily":{"from":"08:00","to":"19:00"}}'::jsonb,'{"partner":true}'::jsonb,'{}'::jsonb,'approved',now()),
('fun-quad','region-tatariv','entertainment','Квадроцикли','Квадроцикли в Карпатах','Лісові маршрути та драйв.','вул. Польова, 7, Татарів',48.34190,24.58600,'+380676002222',NULL,NULL,'/images/fun-quad.webp',4.80,96,3,'{"daily":{"from":"09:00","to":"18:00"}}'::jsonb,'{}'::jsonb,'{}'::jsonb,'approved',now()),
('fun-rafting','region-tatariv','entertainment','Рафтинг','Рафтинг на Пруті','Сплави різної складності.','Татарів, берег Прута',48.34920,24.57280,'+380676003333',NULL,NULL,'/images/fun-rafting.webp',4.70,74,3,'{"daily":{"from":"09:00","to":"18:00"}}'::jsonb,'{}'::jsonb,'{}'::jsonb,'approved',now()),
('fun-zipline','region-tatariv','entertainment','Зіплайн','Зіплайн над карпатським лісом','Панорамний політ над лісом.','вул. Гірська, 25, Татарів',48.35000,24.58550,'+380676004444',NULL,NULL,'/images/fun-zipline.webp',4.90,58,3,'{"daily":{"from":"10:00","to":"18:00"}}'::jsonb,'{}'::jsonb,'{}'::jsonb,'approved',now()),
('transfer-taxi','region-tatariv','transfer','Таксі','Таксі «Карпати трансфер»','Трансфери по Карпатах та Україні.','Татарів',48.34520,24.57820,'+380677001111',NULL,NULL,'/images/transfer-reference/taxi-card.jpg',4.80,126,2,'{"always_open":true}'::jsonb,'{"partner":true}'::jsonb,'{}'::jsonb,'approved',now()),
('transfer-bus','region-tatariv','transfer','Автостанції','Автостанція Татарів','Міжміські та приміські маршрути.','вул. Незалежності, Татарів',48.34430,24.58080,NULL,NULL,NULL,'/images/transfer-reference/bus-card.jpg',4.60,89,1,'{"daily":{"from":"06:00","to":"22:00"}}'::jsonb,'{}'::jsonb,'{}'::jsonb,'approved',now()),
('transfer-gas','region-tatariv','transfer','Заправки','АЗС ОККО','Паливо, кава, магазин.','Татарів',48.35110,24.57060,NULL,NULL,NULL,'/images/transfer-reference/gas-card.jpg',4.50,72,2,'{"always_open":true}'::jsonb,'{}'::jsonb,'{}'::jsonb,'approved',now()),
('transfer-parking','region-tatariv','transfer','Парковки','Парковка біля вокзалу','Зручна парковка для автомобілів.','Татарів',48.34400,24.58120,NULL,NULL,NULL,'/images/transfer-reference/parking-card.jpg',4.30,51,1,'{"always_open":true}'::jsonb,'{}'::jsonb,'{}'::jsonb,'approved',now())
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, address=EXCLUDED.address, lat=EXCLUDED.lat, lng=EXCLUDED.lng, category_slug=EXCLUDED.category_slug, subcategory=EXCLUDED.subcategory, status=EXCLUDED.status;

INSERT INTO place_tags (place_id, tag) VALUES
('food-hutsulshchyna','Банош'),('food-hutsulshchyna','Бограч'),('food-hutsulshchyna','Грибна юшка'),('food-hutsulshchyna','Деруни'),
('food-kolyba','Українська кухня'),('food-kolyba','Для дітей'),('food-pizza','Піца'),('food-pizza','Італійська кухня'),('food-coffee','Кава'),('food-coffee','Сніданки'),
('shop-smak','Продукти'),('shop-smak','Хліб'),('shop-smak','Молочні вироби'),('shop-souvenir','Сувеніри'),('shop-souvenir','Кераміка'),('shop-pharmacy','Ліки'),('shop-home','Побутова хімія'),
('rest-tub','Чани'),('rest-tub','Вид на гори'),('rest-sauna','Сауна'),('rest-pool','Басейн'),('rest-massage','Масаж'),('rest-massage','SPA'),
('fun-jeep','Джипи'),('fun-jeep','Екстрим'),('fun-quad','Квадроцикли'),('fun-rafting','Рафтинг'),('fun-zipline','Зіплайн'),
('transfer-taxi','Трансфери'),('transfer-taxi','24/7'),('transfer-bus','Автобуси'),('transfer-gas','Заправки'),('transfer-parking','Парковки')
ON CONFLICT DO NOTHING;

INSERT INTO qr_points (id, start_param, type, source, region_id, place_id, active)
VALUES ('qr-girskyi-zatyshok','hotel-girskyi-zatyshok','entry_point','hotel','region-tatariv','place-girskyi-zatyshok',true)
ON CONFLICT (id) DO UPDATE SET active=true, region_id=EXCLUDED.region_id, place_id=EXCLUDED.place_id;

INSERT INTO emergency_contacts (id, region_id, type, title, note, phone, tone, sort_order) VALUES
('em-112','region-tatariv','emergency','Єдиний номер допомоги','Поліція · швидка · рятувальники','112','red',10),
('em-103','region-tatariv','ambulance','Швидка допомога','Цілодобово','103','red',20),
('em-102','region-tatariv','police','Поліція','Допомога та правопорядок','102','blue',30),
('em-101','region-tatariv','rescue','ДСНС / рятувальники','Пожежі · аварії · надзвичайні ситуації','101','orange',40),
('em-mountain','region-tatariv','rescue','Гірські рятувальники','Яремче, найближчий пост','+380673421868','green',50)
ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, note=EXCLUDED.note, phone=EXCLUDED.phone, active=true;
`;

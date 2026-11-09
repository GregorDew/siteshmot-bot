-- ==========================================================
-- БАЗА ДАНИХ №2: ТОВАРИ (DB_PRODUCTS)
-- Містить: ціну, назву, опис, матеріал, вид (взуття, аксесуар,
-- верхній одяг, нижній одяг), стать (жіночий, чоловічий, унісекс)
-- та розміри (для взуття та одягу)
-- ==========================================================

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  description TEXT NOT NULL,
  material TEXT NOT NULL,
  category_type TEXT NOT NULL CHECK (category_type IN ('footwear', 'accessory', 'upper_clothing', 'lower_clothing')),
  gender TEXT NOT NULL CHECK (gender IN ('female', 'male', 'unisex')),
  sizes_json TEXT NOT NULL, -- JSON масив розмірів, напр. '["38","39","40","41","42"]' або '["XS","S","M","L","XL"]'
  image TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'bg-[#e8eef0]',
  created_at TEXT NOT NULL
);

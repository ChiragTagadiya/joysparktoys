-- ============================================================
-- Joy Spark Toys — Supabase Database Schema
-- ============================================================
-- HOW TO USE:
--   1. Go to https://app.supabase.com → Your Project → SQL Editor
--   2. Click "New query"
--   3. Paste this entire file and click "Run"
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles  (extends Supabase Auth users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name        TEXT,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'customer'
                CHECK (role IN ('customer', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create a profile row whenever a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TABLE: products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  price           NUMERIC(10, 2) NOT NULL,
  original_price  NUMERIC(10, 2),
  category        TEXT NOT NULL,
  brand           TEXT,
  age_group       TEXT,
  rating          NUMERIC(3, 2) DEFAULT 0,
  review_count    INTEGER DEFAULT 0,
  stock           INTEGER NOT NULL DEFAULT 0,
  images          TEXT[] DEFAULT '{}',
  tags            TEXT[] DEFAULT '{}',
  featured        BOOLEAN DEFAULT FALSE,
  best_seller     BOOLEAN DEFAULT FALSE,
  new_arrival     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: orders
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users ON DELETE SET NULL,
  order_number    TEXT UNIQUE NOT NULL,
  items           JSONB NOT NULL DEFAULT '[]',
  address         JSONB NOT NULL DEFAULT '{}',
  payment_method  TEXT NOT NULL DEFAULT 'cod',
  status          TEXT NOT NULL DEFAULT 'confirmed'
                    CHECK (status IN (
                      'confirmed', 'in_progress', 'processing',
                      'shipped', 'delivered', 'cancelled', 'return'
                    )),
  subtotal        NUMERIC(10, 2) NOT NULL,
  shipping        NUMERIC(10, 2) DEFAULT 0,
  total           NUMERIC(10, 2) NOT NULL,
  notes           TEXT,
  expected_delivery_date TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: site_config  (key-value store for admin settings)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_config (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_config (key, value) VALUES
  ('banner_enabled',          'true'),
  ('banner_text',             'FREE Shipping on orders above ₹499! 🎉'),
  ('free_shipping_threshold', '499'),
  ('maintenance_mode',        'false')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- STORAGE BUCKET: assets  (product images, banners, etc.)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- products (public read, admin write)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT USING (true);
CREATE POLICY "Admin can insert products"
  ON products FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admin can update products"
  ON products FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admin can delete products"
  ON products FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- orders (user sees own, admin sees all)
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can view all orders"
  ON orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admin can update orders"
  ON orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- site_config (public read, admin write)
CREATE POLICY "Anyone can view site config"
  ON site_config FOR SELECT USING (true);
CREATE POLICY "Admin can manage site config"
  ON site_config FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- storage
CREATE POLICY "Public can view assets"
  ON storage.objects FOR SELECT USING (bucket_id = 'assets');
CREATE POLICY "Authenticated users can upload assets"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'assets' AND auth.role() = 'authenticated'
  );
CREATE POLICY "Admin can delete assets"
  ON storage.objects FOR DELETE USING (
    bucket_id = 'assets' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- ADMIN SETUP
-- ============================================================
-- After running this schema, to make a user admin:
--   UPDATE profiles SET role = 'admin' WHERE id = '<user-uuid>';
-- OR find the user in Supabase Auth → copy their UUID → run above.
-- ============================================================

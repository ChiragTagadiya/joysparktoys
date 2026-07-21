-- ============================================================
-- Joy Spark Toys — Migration v2
-- Discount scheduling on products + Announcements marquee bar
-- ============================================================
-- Run in: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- ============================================================
-- 1. Add discount scheduling columns to products
-- ============================================================
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS discount_start   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS discount_end     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS discount_label   TEXT; -- e.g. "FLASH SALE", "30% OFF"

-- ============================================================
-- 2. Announcements table (marquee/ticker bar at top of site)
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text        TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'info'
                CHECK (type IN ('discount', 'trending', 'new_arrival', 'promo', 'info')),
  emoji       TEXT DEFAULT '🎉',
  link        TEXT,
  active      BOOLEAN DEFAULT TRUE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view announcements"
  ON announcements FOR SELECT USING (true);

CREATE POLICY "Admin can manage announcements"
  ON announcements FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Default announcements (seeded)
INSERT INTO announcements (text, type, emoji, sort_order, active) VALUES
  ('FREE Shipping on orders above ₹499!',             'promo',       '🚚', 1, true),
  ('Up to 40% OFF on Best Sellers — Shop Now!',       'discount',    '🔥', 2, true),
  ('New arrivals added every week!',                  'new_arrival', '🆕', 3, true),
  ('Trending this week: Educational Toys 🔬',         'trending',    '📈', 4, true),
  ('BIS Certified, 100% Safe for Children',           'info',        '🛡️', 5, true),
  ('Cash on Delivery available across India',         'info',        '💰', 6, true),
  ('24-Hour Refund on Damaged or Wrong Deliveries',   'promo',       '🔄', 7, true)
ON CONFLICT DO NOTHING;

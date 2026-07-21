-- ============================================================
-- Joy Spark Toys — Seed Products
-- ============================================================
-- Run AFTER schema.sql to populate sample products.
-- Replace image URLs with your own Supabase Storage URLs
-- once you upload actual product photos.
-- ============================================================

INSERT INTO products
  (name, description, price, original_price, category, brand, age_group,
   rating, review_count, stock, images, tags, featured, best_seller, new_arrival)
VALUES

(
  'Super Hero Action Figure Set',
  'Set of 5 super hero action figures with detailed accessories. Each figure stands 15 cm tall with multiple points of articulation. BIS certified, non-toxic ABS plastic.',
  799, 1299, 'action-figures', 'PlayFun', '6-8 years',
  4.5, 284, 50,
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop'],
  ARRAY['superhero', 'action', 'collectible'],
  true, true, false
),

(
  'Wooden Building Blocks Set (100 Pcs)',
  'Premium beechwood blocks with smooth sanded edges. 100 pieces in 9 shapes and 6 vibrant colours. Develop spatial reasoning and creativity. Includes carry bag.',
  599, 899, 'building-blocks', 'LittleBuilder', '3-5 years',
  4.8, 512, 120,
  ARRAY['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&h=600&fit=crop'],
  ARRAY['wooden', 'blocks', 'stem', 'toddler'],
  true, true, false
),

(
  'Remote Control Racing Car',
  'High-speed 1:18 scale RC car with 2.4 GHz control, LED headlights, and independent suspension. Reaches 25 km/h. Includes 2 rechargeable batteries for extended play.',
  1499, 1999, 'remote-control', 'TurboKid', '6-8 years',
  4.6, 218, 42,
  ARRAY['https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&h=600&fit=crop'],
  ARRAY['rc car', 'racing', 'remote control', 'speed'],
  true, false, false
),

(
  'Princess Castle Dollhouse',
  'Dreamy 3-story castle with 18 furniture pieces, 2 doll figures, and LED tower lights. Encourages imaginative storytelling and role-play. Easy no-glue assembly.',
  2299, 2999, 'dolls', 'DreamWorld', '3-5 years',
  4.9, 156, 28,
  ARRAY['https://images.unsplash.com/photo-1605979257913-1704eb7b6246?w=600&h=600&fit=crop'],
  ARRAY['dollhouse', 'princess', 'castle', 'imaginative play'],
  true, false, true
),

(
  'Junior Science Experiment Kit',
  '50+ experiments including volcano reactions, crystal growing, pH testing, and invisible ink. All materials included, no extra purchases needed. Detailed instruction booklet.',
  1299, 1599, 'educational', 'LabKids', '9-12 years',
  4.7, 289, 64,
  ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop'],
  ARRAY['science', 'experiment', 'stem', 'chemistry', 'educational'],
  false, true, false
),

(
  'Musical Baby Piano',
  'Colourful 8-key mini piano with 10 pre-loaded nursery rhymes. Light-up keys, adjustable volume, and a built-in microphone for singing. Batteries included.',
  1799, 2199, 'musical', 'TinyTunes', '0-2 years',
  4.5, 178, 95,
  ARRAY['https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=600&h=600&fit=crop'],
  ARRAY['music', 'piano', 'baby', 'nursery rhymes', 'learning'],
  false, false, true
),

(
  'Art & Craft Mega Kit',
  '200+ piece kit: watercolours, oil pastels, sketch pens, stencils, origami sheets, glitter glue, and a hard-case carry box. Perfect for school projects and rainy days.',
  1099, 1499, 'arts-crafts', 'ColorKid', '6-8 years',
  4.6, 342, 120,
  ARRAY['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop'],
  ARRAY['art', 'craft', 'creative', 'painting', 'drawing'],
  true, false, false
),

(
  'Soft Plush Teddy Bear Set (3 Pcs)',
  'Ultra-soft teddy bears in small, medium, and large sizes. Made from hypoallergenic polyester fibre. Machine washable. A perfect first toy and a lovely gift.',
  799, 999, 'soft-toys', 'HugBuddy', '0-2 years',
  4.9, 524, 200,
  ARRAY['https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=600&h=600&fit=crop'],
  ARRAY['soft toy', 'teddy bear', 'baby', 'plush', 'gift'],
  false, true, false
),

(
  'Family Board Game Bundle',
  'Includes 4 classic Indian family board games: Ludo, Snakes & Ladders, Chess, and Carrom Board (mini). Durable pieces, printed fabric board. Fits in one carry pouch.',
  999, 1299, 'board-games', 'FunBoard', '9-12 years',
  4.4, 198, 75,
  ARRAY['https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=600&h=600&fit=crop'],
  ARRAY['board game', 'family', 'ludo', 'chess', 'carrom', 'indoor'],
  false, false, false
),

(
  'Outdoor Sports Combo Kit',
  'Everything for outdoor fun: cricket bat + ball, frisbee, skipping rope, and a foam football. Light materials suitable for garden, terrace, or park play.',
  899, 1199, 'outdoor', 'SportJoy', '6-8 years',
  4.3, 167, 88,
  ARRAY['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop'],
  ARRAY['outdoor', 'sports', 'cricket', 'football', 'active play'],
  false, true, true
);

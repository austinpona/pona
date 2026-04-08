-- =====================================================
-- Update existing product prices
-- =====================================================
UPDATE products SET price = 35 WHERE id = 1;   -- Infinity Link Bracelet: 65 → 35
UPDATE products SET price = 65 WHERE id = 2;   -- Silver Star Necklace: 35 → 65
UPDATE products SET price = 50 WHERE id = 5;   -- Custom Name Bracelets: 60 → 50
UPDATE products SET price = 80 WHERE id = 6;   -- Blue Crystal Cross Bracelet Set: 50 → 80
UPDATE products SET price = 45 WHERE id = 7;   -- Pink Crystal Bear Bracelet: 65 → 45
UPDATE products SET price = 50 WHERE id = 10;  -- Gothic Cross Link Bracelet: 45 → 50
UPDATE products SET price = 65 WHERE id = 11;  -- Leopard Charm Bangle: 50 → 65

-- Fix product name for id 1 (was 'BraceletInfinity Link')
UPDATE products SET name = 'Infinity Link Bracelet' WHERE id = 1;

-- =====================================================
-- Insert 17 new products
-- =====================================================
INSERT INTO products (id, name, description, price, image_url, badge, active) VALUES
(12, 'Cat''s Eye Bead Bracelet',          'Smooth cat eye glass bead stretch bracelet, available in pink, blue, yellow, orange, burgundy, red and green', 30,  'images/IMG-20260319-WA0083.jpg', 'new', true),
(13, 'Red Pearl 8-Ball Bracelet',         'Red and pearl bead bracelet with 8-ball charm and silver star dangle',                  40,  'images/IMG-20260319-WA0084.jpg', 'new', true),
(14, 'Hot Pink Cross & Star Bracelet',    'Vibrant hot pink bead bracelet with crystal spacers, rhinestone cross and star charms', 40,  'images/IMG-20260319-WA0086.jpg', 'new', true),
(15, 'Green Pearl 8-Ball Bracelet',       'Green and pearl bead bracelet with 8-ball charm and silver star dangle',                40,  'images/IMG-20260319-WA0087.jpg', 'new', true),
(16, 'Yellow Silver 8-Ball Bracelet',     'Yellow and silver bead bracelet with 8-ball charm and star dangle',                     40,  'images/IMG-20260319-WA0088.jpg', 'new', true),
(17, 'Blue Crystal Charm Bracelet',       'Soft blue crystal bead bracelet with crystal spacers and charm (paw, letter or owl)',   40,  'images/IMG-20260319-WA0089.jpg', 'new', true),
(18, 'Purple Spider Charm Bracelet',      'Purple and lilac bead bracelet with crystal spacers and silver spider charm',           40,  'images/IMG-20260319-WA0090.jpg', 'new', true),
(19, 'Pink Charm Bracelet',               'Pink and white bead bracelet with crystal spacers and charm (star, letter or heart)',   40,  'images/IMG-20260319-WA0091.jpg', 'new', true),
(20, 'Yellow Charm Bracelet',             'Yellow and white bead bracelet with charm options (butterfly, letter, smiley daisy)',   40,  'images/IMG-20260319-WA0092.jpg', 'new', true),
(21, 'Aqua Spider Charm Bracelet',        'Aqua and clear crystal bead bracelet with crystal spacers and silver spider charm',     40,  'images/IMG-20260319-WA0093.jpg', 'new', true),
(22, 'Black Spider Charm Bracelet',       'Black and clear crystal bead bracelet with crystal spacers and silver spider charm',    40,  'images/IMG-20260319-WA0094.jpg', 'new', true),
(23, 'Evil Eye Bracelet Set (3 Pack)',    'Crystal and evil eye bead bracelet set with star chain, cross charm and evil eye beads', 120, 'images/IMG-20260319-WA0095.jpg', 'bestseller', true),
(24, 'Pearl & Star Bead Necklace',        'Delicate pearl bead necklace with iridescent star beads and star charm',                70,  'images/IMG-20260319-WA0096.jpg', 'new', true),
(25, 'Gamer Charm Necklace',              'Silver chain necklace with controller, butterfly, dice, evil eye and cross charms',      100, 'images/IMG-20260319-WA0097.jpg', 'new', true),
(26, 'Skull & Bones Gothic Necklace',     'Gothic bead necklace with skull, dice, butterfly, bone beads and cross pendant',        100, 'images/IMG-20260319-WA0098.jpg', 'new', true),
(27, '"Truth" Gothic Charm Necklace',     'Black gothic chain necklace with dice, wings, butterfly, flower charms and "Truth" letter beads', 90, 'images/IMG-20260319-WA0099.jpg', 'new', true),
(28, 'Custom Name Charm Necklace',        'Colourful custom name bead necklace with skulls, aliens, mushrooms, crosses and butterfly charms', 100, 'images/IMG-20260319-WA0100.jpg', 'bestseller', true),
(39, 'Gothic Skull & 8-Ball Charm Bracelet', 'Silver snake chain charm bracelet with 8-ball beads, skull, dice, gun and cross charms', 45, 'images/IMG-20260406-WA0071.jpg', 'new', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  badge = EXCLUDED.badge,
  active = EXCLUDED.active;

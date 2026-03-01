-- GAA Marketplace Database Schema
-- PostgreSQL / Supabase

-- ============================================
-- USERS TABLE
-- ============================================
-- Stores user/creator profiles
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  wallet_address TEXT UNIQUE,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GAA ITEMS TABLE
-- ============================================
-- Stores GAA (digital collectibles) items
CREATE TABLE gaa_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'FREE',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  metadata JSONB,  -- For additional flexible data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BIDS TABLE
-- ============================================
-- Stores bids placed on GAA items
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES gaa_items(id) ON DELETE CASCADE,
  bidder_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FAVORITES TABLE (OPTIONAL)
-- ============================================
-- Users can favorite/like items
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES gaa_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)  -- Prevent duplicate favorites
);

-- ============================================
-- TRANSACTIONS TABLE (OPTIONAL)
-- ============================================
-- Records completed sales
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES gaa_items(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'FREE',
  transaction_hash TEXT,  -- For blockchain transactions
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_items_creator ON gaa_items(creator_id);
CREATE INDEX idx_items_status ON gaa_items(status);
CREATE INDEX idx_items_created ON gaa_items(created_at DESC);
CREATE INDEX idx_bids_item ON bids(item_id);
CREATE INDEX idx_bids_bidder ON bids(bidder_id);
CREATE INDEX idx_bids_amount ON bids(amount DESC);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_item ON favorites(item_id);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller ON transactions(seller_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gaa_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECURITY POLICIES
-- ============================================

-- USERS: Public can read, users can update their own profile
CREATE POLICY "Public can view users" 
  ON users FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- GAA ITEMS: Public can read, creators can manage their items
CREATE POLICY "Public can view active items" 
  ON gaa_items FOR SELECT 
  USING (status = 'active' OR creator_id = auth.uid());

CREATE POLICY "Creators can insert items" 
  ON gaa_items FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own items" 
  ON gaa_items FOR UPDATE 
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own items" 
  ON gaa_items FOR DELETE 
  USING (auth.uid() = creator_id);

-- BIDS: Public can read, authenticated users can bid
CREATE POLICY "Public can view bids" 
  ON bids FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can place bids" 
  ON bids FOR INSERT 
  WITH CHECK (auth.uid() = bidder_id);

-- FAVORITES: Users can manage their own favorites
CREATE POLICY "Users can view own favorites" 
  ON favorites FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" 
  ON favorites FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites" 
  ON favorites FOR DELETE 
  USING (auth.uid() = user_id);

-- TRANSACTIONS: Parties can view their transactions
CREATE POLICY "Users can view own transactions" 
  ON transactions FOR SELECT 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for gaa_items table
CREATE TRIGGER update_gaa_items_updated_at 
  BEFORE UPDATE ON gaa_items 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (FOR TESTING)
-- ============================================

-- Insert sample users
INSERT INTO users (username, email, avatar_url, bio) VALUES
('Cinderella', 'cinderella@gaafree.com', 'images/clients-item1.jpg', 'Cosmic artist exploring the depths of space'),
('Ke Chin', 'ke.chin@gaafree.com', 'images/clients-item2.jpg', 'Digital creator and planetary enthusiast'),
('Cheese Kate', 'cheese.kate@gaafree.com', 'images/clients-item3.jpg', 'NFT collector and space lover');

-- Insert sample GAA items
INSERT INTO gaa_items (name, description, image_url, price, creator_id) 
SELECT 
  'Lightning Axe',
  'A powerful cosmic weapon forged in the heart of a dying star. This rare artifact channels the energy of lightning storms across distant planets.',
  'images/exoplanet-item1.jpg',
  0.36,
  id FROM users WHERE username = 'Cinderella';

INSERT INTO gaa_items (name, description, image_url, price, creator_id) 
SELECT 
  'Dieffenbachia Reflector',
  'An ancient artifact that bends light and reality. Discovered on an exoplanet orbiting a triple star system.',
  'images/exoplanet-item5.jpg',
  0.29,
  id FROM users WHERE username = 'Ke Chin';

INSERT INTO gaa_items (name, description, image_url, price, creator_id) 
SELECT 
  'Nebula Crystal',
  'A crystalline structure formed from compressed nebula gases. Glows with the light of a thousand stars.',
  'images/exoplanet-item2.jpg',
  0.42,
  id FROM users WHERE username = 'Cheese Kate';

INSERT INTO gaa_items (name, description, image_url, price, creator_id) 
SELECT 
  'Void Walker',
  'Legendary boots that allow travel through the void between stars. Worn by ancient space explorers.',
  'images/exoplanet-item3.jpg',
  0.55,
  id FROM users WHERE username = 'Cinderella';

-- Insert sample bids
INSERT INTO bids (item_id, bidder_id, amount)
SELECT 
  gi.id,
  u.id,
  0.40
FROM gaa_items gi, users u
WHERE gi.name = 'Lightning Axe' AND u.username = 'Ke Chin';

INSERT INTO bids (item_id, bidder_id, amount)
SELECT 
  gi.id,
  u.id,
  0.32
FROM gaa_items gi, users u
WHERE gi.name = 'Dieffenbachia Reflector' AND u.username = 'Cinderella';

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- Get all active items with creator info
-- SELECT 
--   gi.*,
--   u.username as creator_name,
--   u.avatar_url as creator_avatar
-- FROM gaa_items gi
-- JOIN users u ON gi.creator_id = u.id
-- WHERE gi.status = 'active'
-- ORDER BY gi.created_at DESC;

-- Get item with highest bid
-- SELECT 
--   gi.name,
--   gi.price as starting_price,
--   MAX(b.amount) as highest_bid,
--   COUNT(b.id) as bid_count
-- FROM gaa_items gi
-- LEFT JOIN bids b ON gi.id = b.item_id
-- GROUP BY gi.id, gi.name, gi.price
-- ORDER BY highest_bid DESC;

-- Get user's portfolio
-- SELECT 
--   u.username,
--   COUNT(gi.id) as items_created,
--   SUM(gi.price) as total_value
-- FROM users u
-- LEFT JOIN gaa_items gi ON u.id = gi.creator_id
-- GROUP BY u.id, u.username;

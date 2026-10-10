CREATE TABLE IF NOT EXISTS course_prices (
  slug TEXT PRIMARY KEY,
  list_price INTEGER NOT NULL CHECK (list_price > 0),
  current_price INTEGER NOT NULL CHECK (current_price > 0 AND current_price < list_price),
  campaign_price INTEGER CHECK (campaign_price IS NULL OR (campaign_price > 0 AND campaign_price < current_price)),
  campaign_starts_at TEXT,
  campaign_ends_at TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'live')),
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ((campaign_price IS NULL AND campaign_starts_at IS NULL AND campaign_ends_at IS NULL) OR (campaign_price IS NOT NULL AND campaign_starts_at IS NOT NULL AND campaign_ends_at IS NOT NULL AND campaign_starts_at < campaign_ends_at))
);
CREATE TABLE IF NOT EXISTS price_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  before_json TEXT NOT NULL,
  after_json TEXT NOT NULL,
  changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO course_prices (slug, list_price, current_price) VALUES
('ziwei-foundations', 2680, 1880),
('tarot-practice', 1980, 1480),
('website-building', 2680, 1980),
('social-graphic-editor', 1980, 1480),
('facebook-ads', 2480, 1780),
('short-video-filming', 2480, 1780),
('ai-video-editing', 2980, 2180),
('ai-copy-design', 1980, 1480),
('ai-resume-service', 1680, 1180),
('online-course-building', 2980, 2180),
('ai-still-to-video', 2480, 1780),
('ai-digital-presenter', 2480, 1780),
('private-domain-operations', 2680, 1880);

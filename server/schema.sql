-- PM Copilot Database Schema
-- Run: psql -f schema.sql postgresql://postgres:postgres@localhost:5432/pm_copilot

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Default demo user: email: demo@pmcopilot.com, password: password123
-- bcrypt hash of 'password123' with 10 rounds
INSERT INTO users (email, password_hash, name, role)
VALUES ('demo@pmcopilot.com', '$2a$10$rQEY0tKMQ5y6fPzlKJQx5OWz4jGYfMpVqMKzxGGm1FGnCqV8KpKu6', 'Demo User', 'admin')
ON CONFLICT (email) DO NOTHING;

CREATE TABLE IF NOT EXISTS roadmap_items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50),
  priority VARCHAR(20),
  quarter VARCHAR(10),
  category VARCHAR(100),
  owner VARCHAR(255),
  progress INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS features (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50),
  priority VARCHAR(20),
  effort VARCHAR(20),
  impact VARCHAR(20),
  score NUMERIC(5,2),
  category VARCHAR(100),
  assignee VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_stories (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  acceptance_criteria TEXT,
  story_points INTEGER,
  priority VARCHAR(20),
  status VARCHAR(50),
  sprint_id INTEGER,
  feature_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sprints (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  goal TEXT,
  status VARCHAR(50),
  start_date DATE,
  end_date DATE,
  capacity INTEGER,
  velocity INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stakeholders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  role VARCHAR(100),
  department VARCHAR(100),
  influence VARCHAR(20),
  interest VARCHAR(20),
  email VARCHAR(255),
  communication_preference VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_research (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  market_size VARCHAR(100),
  growth_rate VARCHAR(50),
  key_trends TEXT,
  target_segment VARCHAR(255),
  source VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competitors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  website VARCHAR(255),
  market_share VARCHAR(50),
  strengths TEXT,
  weaknesses TEXT,
  pricing VARCHAR(255),
  threat_level VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_metrics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  current_value VARCHAR(100),
  target_value VARCHAR(100),
  unit VARCHAR(50),
  category VARCHAR(100),
  trend VARCHAR(20),
  last_updated TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_feedback (
  id SERIAL PRIMARY KEY,
  source VARCHAR(100),
  customer_name VARCHAR(255),
  feedback_text TEXT,
  sentiment VARCHAR(20),
  category VARCHAR(100),
  priority VARCHAR(20),
  status VARCHAR(50),
  feature_request TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS releases (
  id SERIAL PRIMARY KEY,
  version VARCHAR(50),
  name VARCHAR(255),
  description TEXT,
  status VARCHAR(50),
  release_date DATE,
  features_count INTEGER,
  bug_fixes_count INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ab_tests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  hypothesis TEXT,
  variant_a TEXT,
  variant_b TEXT,
  metric VARCHAR(255),
  status VARCHAR(50),
  start_date DATE,
  end_date DATE,
  winner VARCHAR(20),
  results TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS requirements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  type VARCHAR(50),
  priority VARCHAR(20),
  status VARCHAR(50),
  acceptance_criteria TEXT,
  stakeholder VARCHAR(255),
  source VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS risks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  probability VARCHAR(20),
  impact VARCHAR(20),
  risk_score NUMERIC(5,2),
  mitigation TEXT,
  owner VARCHAR(255),
  status VARCHAR(50),
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_capacity (
  id SERIAL PRIMARY KEY,
  member_name VARCHAR(255),
  role VARCHAR(100),
  availability_percent INTEGER,
  sprint_id INTEGER,
  allocated_hours INTEGER,
  skills TEXT,
  current_load VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS okrs (
  id SERIAL PRIMARY KEY,
  objective TEXT,
  key_result TEXT,
  progress INTEGER DEFAULT 0,
  owner VARCHAR(255),
  quarter VARCHAR(10),
  status VARCHAR(50),
  category VARCHAR(100),
  target_value VARCHAR(100),
  current_value VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

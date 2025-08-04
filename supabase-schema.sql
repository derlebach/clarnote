-- Supabase Analytics Schema for Clarnote
-- Run these SQL commands in your Supabase SQL Editor to set up analytics tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Page Views Table
CREATE TABLE page_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  page TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id UUID,
  referrer TEXT,
  user_agent TEXT
);

-- Create index for better query performance
CREATE INDEX idx_page_views_user_id ON page_views(user_id);
CREATE INDEX idx_page_views_timestamp ON page_views(timestamp);
CREATE INDEX idx_page_views_page ON page_views(page);
CREATE INDEX idx_page_views_session_id ON page_views(session_id);

-- User Actions Table
CREATE TABLE actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id UUID
);

-- Create index for better query performance
CREATE INDEX idx_actions_user_id ON actions(user_id);
CREATE INDEX idx_actions_timestamp ON actions(timestamp);
CREATE INDEX idx_actions_action ON actions(action);
CREATE INDEX idx_actions_session_id ON actions(session_id);

-- User Sessions Table
CREATE TABLE user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in seconds
  pages_visited INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_start ON user_sessions(session_start);
CREATE INDEX idx_user_sessions_end ON user_sessions(session_end);

-- Churn Events Table
CREATE TABLE churn_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT,
  value_lost DECIMAL(10,2)
);

-- Create index for better query performance
CREATE INDEX idx_churn_events_user_id ON churn_events(user_id);
CREATE INDEX idx_churn_events_timestamp ON churn_events(timestamp);
CREATE INDEX idx_churn_events_type ON churn_events(event_type);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE churn_events ENABLE ROW LEVEL SECURITY;

-- Page Views Policies
CREATE POLICY "Users can view their own page views" ON page_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow anonymous page view inserts" ON page_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can insert their own page views" ON page_views
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Actions Policies
CREATE POLICY "Users can view their own actions" ON actions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow anonymous action inserts" ON actions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can insert their own actions" ON actions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- User Sessions Policies
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow anonymous session inserts" ON user_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can insert their own sessions" ON user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Churn Events Policies
CREATE POLICY "Users can view their own churn events" ON churn_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own churn events" ON churn_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Optional: Create views for analytics
CREATE VIEW daily_page_views AS
SELECT 
  DATE(timestamp) as date,
  page,
  COUNT(*) as views,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions
FROM page_views 
GROUP BY DATE(timestamp), page
ORDER BY date DESC, views DESC;

CREATE VIEW daily_actions AS
SELECT 
  DATE(timestamp) as date,
  action,
  COUNT(*) as action_count,
  COUNT(DISTINCT user_id) as unique_users
FROM actions 
GROUP BY DATE(timestamp), action
ORDER BY date DESC, action_count DESC;

CREATE VIEW user_session_summary AS
SELECT 
  user_id,
  COUNT(*) as total_sessions,
  AVG(duration) as avg_duration,
  AVG(pages_visited) as avg_pages_per_session,
  MAX(last_activity) as last_seen
FROM user_sessions 
WHERE session_end IS NOT NULL
GROUP BY user_id;

-- Comments for documentation
COMMENT ON TABLE page_views IS 'Tracks page views and navigation patterns';
COMMENT ON TABLE actions IS 'Tracks user actions and interactions';
COMMENT ON TABLE user_sessions IS 'Tracks user sessions and engagement';
COMMENT ON TABLE churn_events IS 'Tracks user churn events and reasons';

COMMENT ON COLUMN page_views.page IS 'The page path that was viewed';
COMMENT ON COLUMN page_views.referrer IS 'The referring page or source';
COMMENT ON COLUMN page_views.user_agent IS 'Browser user agent string';

COMMENT ON COLUMN actions.action IS 'The type of action performed';
COMMENT ON COLUMN actions.details IS 'Additional context about the action as JSON';

COMMENT ON COLUMN user_sessions.duration IS 'Session duration in seconds';
COMMENT ON COLUMN user_sessions.pages_visited IS 'Number of pages visited in session';

COMMENT ON COLUMN churn_events.event_type IS 'Type of churn event (cancel, delete, etc.)';
COMMENT ON COLUMN churn_events.value_lost IS 'Monetary value lost from churn'; 
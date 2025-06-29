-- Create personality_results table
CREATE TABLE IF NOT EXISTS personality_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_type TEXT NOT NULL CHECK (user_type IN ('existing', 'new')),
  personality_scores JSONB NOT NULL,
  current_class TEXT,
  current_spec TEXT,
  recommended_jobs JSONB,
  user_answers JSONB NOT NULL
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_personality_results_user_type ON personality_results(user_type);
CREATE INDEX IF NOT EXISTS idx_personality_results_created_at ON personality_results(created_at);

-- Enable Row Level Security (optional)
ALTER TABLE personality_results ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed)
CREATE POLICY "Allow all operations on personality_results" ON personality_results
FOR ALL USING (true);

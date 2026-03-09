-- Migration: Add password column to users table
-- Run this SQL in your Supabase SQL Editor

-- Add password column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Add comment to the column
COMMENT ON COLUMN users.password IS 'Hashed password for user authentication';

-- Make sure the column is not null (optional, uncomment if needed)
-- ALTER TABLE users ALTER COLUMN password SET NOT NULL;


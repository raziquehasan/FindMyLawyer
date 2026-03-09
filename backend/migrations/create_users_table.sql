-- Migration: Create users table with all required columns
-- Run this SQL in your Supabase SQL Editor if the table doesn't exist

CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'lawyer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Enable Row Level Security (optional)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow service role to access all rows (for backend operations)
CREATE POLICY IF NOT EXISTS "Service role can access all users"
ON users FOR ALL
USING (true)
WITH CHECK (true);


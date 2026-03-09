# Database Migrations

These SQL files need to be run in your Supabase SQL Editor to set up the database schema.

## Setup Instructions

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the migrations in order:

### Step 1: Create users table (if it doesn't exist)
Run `create_users_table.sql` - This creates the users table with all required columns including password.

### Step 2: Add password column (if table exists but column is missing)
Run `add_password_to_users.sql` - This adds the password column to an existing users table.

## Quick Fix for Current Error

If you're getting the error "Could not find the 'password' column", run this in Supabase SQL Editor:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
```

## Verify the Schema

After running migrations, verify the table structure:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

You should see:
- id (uuid)
- name (text)
- email (text)
- phone (text)
- password (text) ← This is the missing column
- role (text)
- created_at (timestamp)
- updated_at (timestamp)


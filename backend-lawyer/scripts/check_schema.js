/**
 * Script to check if the Supabase users table has the required columns
 * Run with: node backend/scripts/check_schema.js
 */

require("dotenv").config();
const supabase = require("../src/config/supabase");

async function checkSchema() {
  try {
    console.log("🔍 Checking Supabase users table schema...\n");

    // Try to query the table structure
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .limit(1);

    if (error) {
      console.error("❌ Error accessing users table:", error.message);
      
      if (error.message.includes("password")) {
        console.log("\n💡 SOLUTION:");
        console.log("The 'password' column is missing from the users table.");
        console.log("Run this SQL in your Supabase SQL Editor:");
        console.log("\nALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;\n");
      }
      
      process.exit(1);
    }

    // Try to insert a test record (will fail if columns are missing)
    const testData = {
      name: "test",
      email: `test_${Date.now()}@test.com`,
      phone: "+911234567890",
      password: "test_hash",
      role: "client",
    };

    const { error: insertError } = await supabase
      .from("users")
      .insert([testData])
      .select();

    if (insertError) {
      console.error("❌ Schema check failed:", insertError.message);
      
      if (insertError.message.includes("password")) {
        console.log("\n💡 SOLUTION:");
        console.log("The 'password' column is missing from the users table.");
        console.log("Run this SQL in your Supabase SQL Editor:");
        console.log("\nALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;\n");
        console.log("Or run the migration file: backend/migrations/add_password_to_users.sql");
      }
      
      process.exit(1);
    }

    // Clean up test record
    await supabase
      .from("users")
      .delete()
      .eq("email", testData.email);

    console.log("✅ Schema check passed! All required columns exist.\n");
    console.log("Required columns found:");
    console.log("  - id");
    console.log("  - name");
    console.log("  - email");
    console.log("  - phone");
    console.log("  - password ✓");
    console.log("  - role");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Unexpected error:", err.message);
    process.exit(1);
  }
}

checkSchema();


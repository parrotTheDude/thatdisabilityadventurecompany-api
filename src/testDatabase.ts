import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const testDatabaseConnection = async () => {
  try {
    // Create a connection pool
    const db = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    console.log("🔍 Testing MySQL database connection...");

    // Run a test query
    const [rows] = await db.query("SELECT 1+1 AS result");
    console.log("✅ Database connection successful! Test Query Result:", rows);

    await db.end(); // Close connection pool
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
};

// Run the test
testDatabaseConnection();
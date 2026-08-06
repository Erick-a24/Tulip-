const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error(
    "Missing DATABASE_URL. Copy .env.example to .env and fill in your Neon connection string."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = { pool };

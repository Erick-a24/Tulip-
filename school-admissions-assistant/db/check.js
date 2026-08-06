require("dotenv").config();
const { pool } = require("./client");

async function main() {
  const client = await pool.connect();
  try {
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    console.log("Tables:", tables.rows.map((r) => r.table_name).join(", "));

    const program = await client.query(
      `INSERT INTO program (name, description, level) VALUES ($1, $2, $3) RETURNING id, name`,
      ["Primary", "Grades G1-G7", "Primary"]
    );
    console.log("Inserted program:", program.rows[0]);

    const fee = await client.query(
      `INSERT INTO fee (program_id, fee_type, amount) VALUES ($1, $2, $3) RETURNING id, fee_type, amount`,
      [program.rows[0].id, "Annual tuition", 1850000]
    );
    console.log("Inserted fee:", fee.rows[0]);

    const joined = await client.query(
      `SELECT program.name AS program_name, fee.fee_type, fee.amount
       FROM fee JOIN program ON program.id = fee.program_id
       WHERE fee.id = $1`,
      [fee.rows[0].id]
    );
    console.log("Joined result:", joined.rows[0]);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("db:check failed:", err.message);
  process.exit(1);
});

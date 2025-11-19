import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgres://postgres:1234@localhost:5432/smoo'
});

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('DB Connected:', res.rows[0]);
    pool.end();
  } catch (err) {
    console.error('DB Connection Error:', err);
  }
})();

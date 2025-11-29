import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgres://postgres:1234@localhost:5432/smoo'
});

(async () => {
  try {
    console.log('Checking direct messages...\n');
    
    const messages = await pool.query('SELECT * FROM direct_messages ORDER BY created_at DESC LIMIT 10');
    console.log('Recent messages:', JSON.stringify(messages.rows, null, 2));
    
    console.log('\n\nChecking freelancers...\n');
    const freelancers = await pool.query('SELECT id, full_name, user_type FROM freelancers LIMIT 5');
    console.log('Freelancers:', JSON.stringify(freelancers.rows, null, 2));
    
    console.log('\n\nChecking product owners...\n');
    const productOwners = await pool.query('SELECT id, full_name, user_type FROM product_owners LIMIT 5');
    console.log('Product Owners:', JSON.stringify(productOwners.rows, null, 2));
    
    pool.end();
  } catch (err) {
    console.error('Error:', err);
    pool.end();
  }
})();

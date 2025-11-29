import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgres://postgres:1234@localhost:5432/smoo'
});

(async () => {
  try {
    console.log('Checking users in conversations...\n');
    
    // Check freelancers table
    console.log('Freelancers:');
    const freelancers = await pool.query('SELECT id, full_name, email, profile_image FROM freelancers LIMIT 5');
    console.log(JSON.stringify(freelancers.rows, null, 2));
    
    // Check product owners table
    console.log('\n\nProduct Owners:');
    const productOwners = await pool.query('SELECT id, full_name, email, profile_image FROM product_owners LIMIT 5');
    console.log(JSON.stringify(productOwners.rows, null, 2));
    
    pool.end();
  } catch (err) {
    console.error('Error:', err);
    pool.end();
  }
})();

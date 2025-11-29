const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:1234@localhost:5432/smoo' });

// Get freelancer ID for "yassine"
pool.query(`SELECT id, full_name FROM freelancers WHERE full_name LIKE '%yassine%' OR full_name LIKE '%test%'`).then(fr => {
  console.log('=== Freelancers ===');
  fr.rows.forEach(f => console.log(f.id, '-', f.full_name));
  
  return pool.query(`SELECT id, full_name FROM product_owners`);
}).then(po => {
  console.log('\n=== Product Owners ===');
  po.rows.forEach(p => console.log(p.id, '-', p.full_name));
  
  // Now check all direct messages
  return pool.query(`
    SELECT 
      id,
      sender_id, 
      sender_type, 
      receiver_id, 
      receiver_type,
      LEFT(content, 80) as content_preview,
      created_at
    FROM direct_messages 
    ORDER BY created_at DESC 
    LIMIT 10
  `);
}).then(dm => {
  console.log('\n=== Recent Direct Messages ===');
  dm.rows.forEach((row, i) => {
    console.log(`\nMessage ${i + 1}:`);
    console.log('  From:', row.sender_id.substring(0, 8), '(', row.sender_type, ')');
    console.log('  To:', row.receiver_id.substring(0, 8), '(', row.receiver_type, ')');
    console.log('  Content:', row.content_preview);
  });
  pool.end();
}).catch(err => {
  console.error('Error:', err);
  pool.end();
});

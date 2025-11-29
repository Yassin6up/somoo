const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:1234@localhost:5432/smoo' });

pool.query(`
  SELECT 
    sender_id, 
    sender_type, 
    receiver_id, 
    receiver_type, 
    LEFT(content, 150) as content_preview,
    created_at
  FROM direct_messages 
  WHERE content LIKE '%PROPOSAL%' 
  ORDER BY created_at DESC 
  LIMIT 3
`).then(r => {
  console.log('=== Proposal Messages ===');
  r.rows.forEach((row, i) => {
    console.log(`\nProposal ${i + 1}:`);
    console.log('  Sender:', row.sender_id, '(', row.sender_type, ')');
    console.log('  Receiver:', row.receiver_id, '(', row.receiver_type, ')');
    console.log('  Content preview:', row.content_preview);
    console.log('  Created:', row.created_at);
  });
  pool.end();
}).catch(err => {
  console.error('Error:', err);
  pool.end();
});

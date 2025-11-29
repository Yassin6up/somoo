const {Pool} = require('pg');
const pool = new Pool({connectionString: 'postgres://postgres:1234@localhost:5432/smoo'});

console.log('=== Checking Conversation vs Direct Messages ===\n');

// Check conversation messages
pool.query(`
  SELECT id, content, sender_id, sender_type, created_at 
  FROM conversation_messages 
  WHERE conversation_id = '62bba686-faed-4465-891d-a0679d7fa684' 
  ORDER BY created_at DESC 
  LIMIT 10
`).then(r => {
  console.log('Group Conversation Messages:', r.rows.length);
  r.rows.forEach((msg, i) => {
    console.log(`  ${i+1}. ${msg.sender_type}: ${msg.content.substring(0, 50)}`);
  });
  
  // Check direct messages
  return pool.query(`
    SELECT id, content, sender_id, sender_type, receiver_id, receiver_type, created_at 
    FROM direct_messages 
    WHERE (sender_id = '97ea9e4b-9d2d-4896-93ec-66fb641ee545' AND receiver_id = 'f5bfcebd-b5f0-446e-bbae-1da66e060ccf')
       OR (sender_id = 'f5bfcebd-b5f0-446e-bbae-1da66e060ccf' AND receiver_id = '97ea9e4b-9d2d-4896-93ec-66fb641ee545')
    ORDER BY created_at DESC 
    LIMIT 10
  `);
}).then(r => {
  console.log('\nDirect Messages:', r.rows.length);
  r.rows.forEach((msg, i) => {
    const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
    const preview = content.substring(0, 60);
    console.log(`  ${i+1}. ${msg.sender_type} -> ${msg.receiver_type}: ${preview}`);
  });
  
  pool.end();
}).catch(err => {
  console.error('Error:', err);
  pool.end();
});

import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/smoo'
});

async function fixGroupIdNullable() {
  try {
    console.log('🔧 Making group_id nullable in project_proposals table...\n');
    
    // Make group_id nullable
    await pool.query(`
      ALTER TABLE project_proposals 
      ALTER COLUMN group_id DROP NOT NULL;
    `);
    
    console.log('✅ Successfully made group_id nullable!');
    console.log('ℹ️ Now individual freelancers can have proposals without a group.');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

fixGroupIdNullable();

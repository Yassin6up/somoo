// Update existing posts to mark them as task posts
import { db } from './server/db.ts';
import { sql } from 'drizzle-orm';

async function updateTaskPosts() {
  try {
    console.log('🔄 Updating existing task posts...');
    
    const result = await db.execute(sql`
      UPDATE group_posts 
      SET is_task_post = true 
      WHERE 
        (task_title IS NOT NULL AND task_title != '') 
        OR (task_reward IS NOT NULL AND task_reward != '')
        OR content LIKE '%وسم: مهمة%'
        OR content LIKE '%مهمة مطلوبة%'
    `);
    
    console.log('✅ Updated existing task posts successfully');
    console.log(`📊 Rows affected: ${result.rowCount || 'unknown'}`);
    
    // Verify the update
    const stats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_posts,
        SUM(CASE WHEN is_task_post THEN 1 ELSE 0 END) as task_posts
      FROM group_posts
    `);
    
    console.log('📈 Current statistics:');
    console.log(`   Total posts: ${stats.rows[0]?.total_posts || 0}`);
    console.log(`   Task posts: ${stats.rows[0]?.task_posts || 0}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating task posts:', error);
    process.exit(1);
  }
}

updateTaskPosts();

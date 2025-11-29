-- Migration: Add is_task_post column to group_posts table
-- This column marks posts that are created for tasks

-- Add the is_task_post column with default false
ALTER TABLE group_posts 
ADD COLUMN IF NOT EXISTS is_task_post BOOLEAN NOT NULL DEFAULT false;

-- Optional: Update existing posts that have task markers in content
-- This is a one-time migration to mark existing task posts
UPDATE group_posts 
SET is_task_post = true 
WHERE 
  (task_title IS NOT NULL AND task_title != '') 
  OR (task_reward IS NOT NULL AND task_reward != '')
  OR content LIKE '%وسم: مهمة%'
  OR content LIKE '%مهمة مطلوبة%';

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_group_posts_is_task_post ON group_posts(is_task_post);

-- Verify the migration
SELECT COUNT(*) as total_posts, 
       SUM(CASE WHEN is_task_post THEN 1 ELSE 0 END) as task_posts
FROM group_posts;

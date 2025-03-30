-- Drop the existing order column
ALTER TABLE conversation_history DROP COLUMN "order";

-- Add the new order column that will be managed by a trigger
ALTER TABLE conversation_history ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

-- Update existing records to have correct order
WITH ordered_messages AS (
    SELECT 
        message_id,
        conversation_id,
        ROW_NUMBER() OVER (PARTITION BY conversation_id ORDER BY created_at) - 1 as new_order
    FROM conversation_history
)
UPDATE conversation_history ch
SET "order" = om.new_order
FROM ordered_messages om
WHERE ch.message_id = om.message_id; 
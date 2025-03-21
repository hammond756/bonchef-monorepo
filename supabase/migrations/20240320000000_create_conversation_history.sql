-- Create conversation history table
CREATE TABLE conversation_history (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    "order" SERIAL,
    archived BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(conversation_id, "order")
);

-- Create index for faster lookups
CREATE INDEX conversation_history_conversation_id_idx ON conversation_history(conversation_id);
CREATE INDEX conversation_history_user_id_idx ON conversation_history(user_id);

-- Set up Row Level Security (RLS)
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own conversations
CREATE POLICY "Users can view own conversations"
    ON conversation_history
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own conversations
CREATE POLICY "Users can insert own conversations"
    ON conversation_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own conversations
CREATE POLICY "Users can update own conversations"
    ON conversation_history
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own conversations
CREATE POLICY "Users can delete own conversations"
    ON conversation_history
    FOR DELETE
    USING (auth.uid() = user_id); 
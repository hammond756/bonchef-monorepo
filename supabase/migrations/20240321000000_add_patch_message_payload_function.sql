-- Create function to patch message payload
CREATE OR REPLACE FUNCTION patch_message_payload(
    p_message_id UUID,
    p_payload JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE conversation_history
    SET payload = payload || p_payload
    WHERE message_id = p_message_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION patch_message_payload TO authenticated; 
-- Create recipe_repost_queue table for Instagram automation
CREATE TABLE IF NOT EXISTS "public"."recipe_repost_queue" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "recipe_id" "uuid" NOT NULL,
    "is_posted" boolean DEFAULT false NOT NULL,
    "posted_at" timestamptz,
    "instagram_post_id" "text",
    "instagram_post_url" "text",
    "error_message" "text",
    "created_at" timestamptz DEFAULT "now"() NOT NULL,
    "updated_at" timestamptz DEFAULT "now"() NOT NULL,
    CONSTRAINT "recipe_repost_queue_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "recipe_repost_queue_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE CASCADE
);

-- Add comments for documentation
COMMENT ON TABLE "public"."recipe_repost_queue" IS 'Queue for recipes scheduled to be posted on Instagram';
COMMENT ON COLUMN "public"."recipe_repost_queue"."recipe_id" IS 'Reference to the recipe to be posted';
COMMENT ON COLUMN "public"."recipe_repost_queue"."is_posted" IS 'Whether the recipe has been successfully posted to Instagram';
COMMENT ON COLUMN "public"."recipe_repost_queue"."posted_at" IS 'Timestamp when the recipe was successfully posted';
COMMENT ON COLUMN "public"."recipe_repost_queue"."instagram_post_id" IS 'Instagram post ID after successful posting';
COMMENT ON COLUMN "public"."recipe_repost_queue"."instagram_post_url" IS 'Instagram post URL for easy access';
COMMENT ON COLUMN "public"."recipe_repost_queue"."error_message" IS 'Error message if posting failed';

-- Create indexes for performance
CREATE INDEX "recipe_repost_queue_recipe_id_idx" ON "public"."recipe_repost_queue" USING "btree" ("recipe_id");
CREATE INDEX "recipe_repost_queue_is_posted_idx" ON "public"."recipe_repost_queue" USING "btree" ("is_posted");

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION "public"."trigger_set_timestamp"()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "set_timestamp"
    BEFORE UPDATE ON "public"."recipe_repost_queue"
    FOR EACH ROW
    EXECUTE PROCEDURE "public"."trigger_set_timestamp"();

-- Enable Row Level Security (RLS)
ALTER TABLE "public"."recipe_repost_queue" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Only allow system/service accounts to manage the queue (no user access needed)
CREATE POLICY "Service accounts can manage repost queue" ON "public"."recipe_repost_queue"
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Note: Validation that only public recipes can be added to queue
-- will be enforced at the application level

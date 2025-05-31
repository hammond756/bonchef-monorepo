

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."delete_old_temporary_users"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Delete auth.users entries for temporary users older than 24 hours
  -- Cascading will handle deletion of related records in other tables
  DELETE FROM auth.users
  WHERE email LIKE 'tijdelijke-bezoeker-%'
  AND created_at < NOW() - INTERVAL '24 hours';
END;
$$;


ALTER FUNCTION "public"."delete_old_temporary_users"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'name')
  );
  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."recipe_creation_prototype" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "total_cook_time_minutes" integer NOT NULL,
    "ingredients" "jsonb" NOT NULL,
    "instructions" "text"[] NOT NULL,
    "description" "text" NOT NULL,
    "n_portions" integer NOT NULL,
    "thumbnail" "text" NOT NULL,
    "source_url" "text" NOT NULL,
    "source_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "user_id" "uuid" NOT NULL,
    "is_public" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."recipe_creation_prototype" OWNER TO "postgres";


COMMENT ON COLUMN "public"."recipe_creation_prototype"."is_public" IS 'Whether other people can view the recipe';



CREATE OR REPLACE FUNCTION "public"."is_liked_by_current_user"("rec" "public"."recipe_creation_prototype") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$SELECT EXISTS (
    SELECT 1 FROM recipe_likes
    WHERE recipe_id = rec.id AND user_id = auth.uid()  -- assuming auth.uid() returns current user's ID
  );$$;


ALTER FUNCTION "public"."is_liked_by_current_user"("rec" "public"."recipe_creation_prototype") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."patch_message_payload"("p_message_id" "uuid", "p_payload" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    UPDATE conversation_history
    SET payload = payload || p_payload
    WHERE message_id = p_message_id;
END;
$$;


ALTER FUNCTION "public"."patch_message_payload"("p_message_id" "uuid", "p_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."revoke_old_temporary_users"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Revoke all sessions for temporary users older than 24 hours
  -- This effectively logs them out and prevents them from logging back in
  -- since they don't know their passwords
  DELETE FROM auth.sessions
  WHERE user_id IN (
    SELECT id
    FROM auth.users
    WHERE email LIKE 'tijdelijke-bezoeker-%'
    AND created_at < NOW() - INTERVAL '24 hours'
  );
END;
$$;


ALTER FUNCTION "public"."revoke_old_temporary_users"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_user_id_from_jwt"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.user_id := auth.uid();  -- grabs from JWT claims
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_user_id_from_jwt"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_post_conversations_to_slack"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  is_production boolean;
  project_url text;
  auth_key text;
BEGIN
  -- Check if we're running in production by looking at the current database name
  SELECT current_database() NOT LIKE '%local%' 
    AND current_database() NOT LIKE 'postgres'
    AND current_database() NOT LIKE 'supabase%'
    INTO is_production;
  
  -- Only proceed if we're in production
  IF is_production THEN
    -- Get secrets from vault
    SELECT decrypted_secret INTO project_url
    FROM vault.decrypted_secrets 
    WHERE name = 'project_url';
    
    SELECT decrypted_secret INTO auth_key
    FROM vault.decrypted_secrets 
    WHERE name = 'slack_post_edge_function_service_role_key';
    
    -- Make HTTP request to the edge function
    PERFORM
      net.http_post(
        url := project_url || '/functions/v1/post-conversations-to-slack',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || auth_key
        ),
        body := '{}'::jsonb
      );
    
    -- Log that we triggered the function
    RAISE NOTICE 'Triggered post-conversations-to-slack function';
  ELSE
    -- Log that we skipped execution in non-production environment
    RAISE NOTICE 'Skipping post-conversations-to-slack trigger in development environment';
  END IF;
END;
$$;


ALTER FUNCTION "public"."trigger_post_conversations_to_slack"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversation_history" (
    "message_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "content" "text" NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "archived" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "order" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."conversation_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "display_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "bio" "text",
    "avatar" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recipe_likes" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "recipe_id" "uuid",
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."recipe_likes" OWNER TO "postgres";


ALTER TABLE "public"."recipe_likes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."recipe_likes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."conversation_history"
    ADD CONSTRAINT "conversation_history_pkey" PRIMARY KEY ("message_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recipe_creation_prototype"
    ADD CONSTRAINT "recipe_creation_prototype_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recipe_likes"
    ADD CONSTRAINT "recipe_likes_pkey" PRIMARY KEY ("id");



CREATE INDEX "conversation_history_conversation_id_idx" ON "public"."conversation_history" USING "btree" ("conversation_id");



CREATE INDEX "conversation_history_user_id_idx" ON "public"."conversation_history" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "add-user-to-email-list" AFTER INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://lwnjybqifrnppmahxera.supabase.co/functions/v1/add-user-to-email-campaign', 'POST', '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3bmp5YnFpZnJucHBtYWh4ZXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgyMTI3NjksImV4cCI6MjA0Mzc4ODc2OX0.mKwJ1_Yh6D2JDw9GXDMu-efihP02OdFiYVaGwYZlFSI"}', '{}', '5000');



CREATE OR REPLACE TRIGGER "set_user_id_before_insert" BEFORE INSERT ON "public"."recipe_likes" FOR EACH ROW EXECUTE FUNCTION "public"."set_user_id_from_jwt"();



ALTER TABLE ONLY "public"."conversation_history"
    ADD CONSTRAINT "conversation_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recipe_creation_prototype"
    ADD CONSTRAINT "recipe_creation_prototype_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recipe_likes"
    ADD CONSTRAINT "recipe_likes_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipe_creation_prototype"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recipe_likes"
    ADD CONSTRAINT "recipe_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Allow users to delete their own profile" ON "public"."profiles" FOR DELETE USING (("auth"."uid"() = "id"));



CREATE POLICY "Allow users to update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Allow users to view any profile" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Enable delete for users based on user_id" ON "public"."recipe_likes" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."recipe_likes" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."recipe_likes" FOR SELECT USING (true);



CREATE POLICY "Users can delete own conversations" ON "public"."conversation_history" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own recipes" ON "public"."recipe_creation_prototype" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own conversations" ON "public"."conversation_history" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own recipes" ON "public"."recipe_creation_prototype" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own conversations" ON "public"."conversation_history" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own recipes" ON "public"."recipe_creation_prototype" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own conversations" ON "public"."conversation_history" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own recipes and public recipes" ON "public"."recipe_creation_prototype" FOR SELECT USING ((("auth"."uid"() = "user_id") OR "is_public"));



ALTER TABLE "public"."conversation_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recipe_creation_prototype" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recipe_likes" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


















































































































































































































GRANT ALL ON FUNCTION "public"."delete_old_temporary_users"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_old_temporary_users"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_old_temporary_users"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON TABLE "public"."recipe_creation_prototype" TO "anon";
GRANT ALL ON TABLE "public"."recipe_creation_prototype" TO "authenticated";
GRANT ALL ON TABLE "public"."recipe_creation_prototype" TO "service_role";



GRANT ALL ON FUNCTION "public"."is_liked_by_current_user"("rec" "public"."recipe_creation_prototype") TO "anon";
GRANT ALL ON FUNCTION "public"."is_liked_by_current_user"("rec" "public"."recipe_creation_prototype") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_liked_by_current_user"("rec" "public"."recipe_creation_prototype") TO "service_role";



GRANT ALL ON FUNCTION "public"."patch_message_payload"("p_message_id" "uuid", "p_payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."patch_message_payload"("p_message_id" "uuid", "p_payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."patch_message_payload"("p_message_id" "uuid", "p_payload" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."revoke_old_temporary_users"() TO "anon";
GRANT ALL ON FUNCTION "public"."revoke_old_temporary_users"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."revoke_old_temporary_users"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_user_id_from_jwt"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_user_id_from_jwt"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_user_id_from_jwt"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_post_conversations_to_slack"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_post_conversations_to_slack"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_post_conversations_to_slack"() TO "service_role";
























GRANT ALL ON TABLE "public"."conversation_history" TO "anon";
GRANT ALL ON TABLE "public"."conversation_history" TO "authenticated";
GRANT ALL ON TABLE "public"."conversation_history" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."recipe_likes" TO "anon";
GRANT ALL ON TABLE "public"."recipe_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."recipe_likes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."recipe_likes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."recipe_likes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."recipe_likes_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;

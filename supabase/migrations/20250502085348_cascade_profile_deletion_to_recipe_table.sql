alter table "public"."recipe_creation_prototype" drop constraint "recipe_creation_prototype_user_id_fkey";

alter table "public"."recipe_creation_prototype" add constraint "recipe_creation_prototype_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."recipe_creation_prototype" validate constraint "recipe_creation_prototype_user_id_fkey";

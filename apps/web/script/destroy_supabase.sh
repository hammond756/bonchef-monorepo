docker volume rm supabase_config_create-recipe
docker volume rm supabase_db_create-recipe
docker volume rm supabase_storage_create-recipe
docker volume rm supabase_edge_runtime_create-recipe
docker system prune --all --filter label=com.supabase.cli.project=create-recipe
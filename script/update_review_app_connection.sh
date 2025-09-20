BRANCH_NAME=$(git symbolic-ref --short HEAD)
HEROKU_APP_NAME=$1

# Check that the app name is set, and that the branch name is set
if [ -z "$HEROKU_APP_NAME" ]; then
    echo "Error: HEROKU_APP_NAME is not set"
    exit 1
fi

if [ -z "$BRANCH_NAME" ]; then
    echo "Error: BRANCH_NAME is not set"
    exit 1
fi

supabase link --project-ref lwnjybqifrnppmahxera

SUPABASE_PREVIEW_ENV=$(supabase --experimental branches get $BRANCH_NAME -o json)

if [ -z "$SUPABASE_PREVIEW_ENV" ]; then
    echo "Error: there is no preview branch for $BRANCH_NAME, have you checked out right branch?"
    exit 1
fi

echo "Updating the review app connection for $HEROKU_APP_NAME"

SUPABASE_URL=$(echo $SUPABASE_PREVIEW_ENV | jq -r '.SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY=$(echo $SUPABASE_PREVIEW_ENV | jq -r '.SUPABASE_SERVICE_ROLE_KEY')
SUPABASE_ANON_KEY=$(echo $SUPABASE_PREVIEW_ENV | jq -r '.SUPABASE_ANON_KEY')
NEXT_PUBLIC_MARKETING_USER_ID="0149f366-5b4f-4f10-be0d-3aacf1cdbd73"

if [ -z "$SUPABASE_URL" ] || [ "$SUPABASE_URL" = "null" ]; then
    echo "Error: SUPABASE_URL is not set or is null"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] || [ "$SUPABASE_SERVICE_ROLE_KEY" = "null" ]; then
    echo "Error: SUPABASE_SERVICE_ROLE_KEY is not set or is null"
    exit 1
fi

if [ -z "$SUPABASE_ANON_KEY" ] || [ "$SUPABASE_ANON_KEY" = "null" ]; then
    echo "Error: SUPABASE_ANON_KEY is not set or is null"
    exit 1
fi

heroku config:set \
    -a $HEROKU_APP_NAME \
    NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL \
    SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
    NEXT_PUBLIC_MARKETING_USER_ID=$NEXT_PUBLIC_MARKETING_USER_ID

git commit --allow-empty -m "Trigger build"

git push
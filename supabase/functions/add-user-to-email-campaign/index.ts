// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

// Types for the webhook payload
interface TableRecord<T> {
  id: string
  created_at: string
  [key: string]: any
}

interface InsertPayload {
  type: 'INSERT'
  table: string
  schema: string
  record: TableRecord<{
    display_name: string
    id: string
  }>
  old_record: null
}

interface ZohoTokenResponse {
  access_token: string
  api_domain: string
  token_type: string
  expires_in: number
}

// Initialize Supabase client with service role
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

async function getUserEmail(userId: string): Promise<string | null> {
  const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId)

  if (error) {
    console.error('Error fetching user email:', error)
    return null
  }

  return user.email
}

async function getZohoAccessToken(): Promise<string> {
  const clientId = Deno.env.get('ZOHO_CAMPAIGNS_CLIENT_ID')
  const clientSecret = Deno.env.get('ZOHO_CAMPAIGNS_CLIENT_SECRET')
  const accountsServer = Deno.env.get('ZOHO_CAMPAIGNS_SERVER')

  if (!clientId || !clientSecret) {
    throw new Error('Missing Zoho client credentials')
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
    scope: 'ZohoCampaigns.contact.CREATE,ZohoCampaigns.contact.UPDATE,ZohoCampaigns.contact.READ',
    soid: 'ZohoCampaigns.20105658965',
  })

  const response = await fetch(
    `https://accounts.zoho.eu/oauth/v2/token?${params}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Zoho OAuth error: ${await response.text()}`)
  }

  const data = await response.json() as ZohoTokenResponse

  return data.access_token
}

async function addToZohoCampaign(email: string, displayName: string) {
  const zohoListKey = Deno.env.get('ZOHO_CAMPAIGNS_LIST_KEY_NEW_USERS')

  if (!zohoListKey) {
    throw new Error('Missing Zoho list key configuration')
  }

  // Get a fresh access token
  const accessToken = await getZohoAccessToken()

  const contactInfo = {
    'First Name': displayName,
    'Contact Email': email,
  }

  const params = new URLSearchParams({
    resfmt: 'JSON',
    listkey: zohoListKey,
    contactinfo: JSON.stringify(contactInfo),
  })

  const response = await fetch(
    `https://campaigns.zoho.eu/api/v1.1/json/listsubscribe?${params}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Zoho API error: ${await response.text()}`)
  }

  return await response.json()
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json() as InsertPayload

    // Verify this is an insert event for profiles
    if (payload.type !== 'INSERT' || payload.table !== 'profiles') {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get user's email from auth.users table
    const email = await getUserEmail(payload.record.id)

    if (!email) {
      console.log("User email not found", payload.record.display_name)
      return new Response(
        JSON.stringify({ error: 'User email not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (email.includes('@example.com')) {
      console.log("Skipping test user", payload.record.display_name)
      return new Response(
        JSON.stringify({ success: true, result: {message: "Skipping test user"} }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log("Adding user to Zoho campaign", payload.record.display_name)

    // Add user to Zoho campaign
    const result = await addToZohoCampaign(email, payload.record.display_name)

    console.log("Result", result)

    if (result.status === 'error') {
      throw new Error(result.message)
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/add-user-to-email-campaign' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

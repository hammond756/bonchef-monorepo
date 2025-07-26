#!/bin/bash

# Dump auth.users, auth.identities, and everything from public schema
# Use exclusions to avoid unwanted auth tables while keeping the ones we want
#
# Profiles are created via a trigger, so we don't need to seed them
pg_dump postgresql://postgres:postgres@localhost:54322/postgres \
    --data-only --inserts --column-inserts \
    --no-owner --no-privileges \
    -n public -n auth \
    --exclude-table=auth.sessions \
    --exclude-table=auth.schema_migrations \
    --exclude-table=auth.audit_log_entries \
    --exclude-table=auth.refresh_tokens \
    --exclude-table=auth.mfa_amr_claims \
    --exclude-table=auth.mfa_factors \
    --exclude-table=auth.mfa_challenges \
    --exclude-table=auth.flow_state \
    --exclude-table=auth.saml_providers \
    --exclude-table=auth.saml_relay_states \
    --exclude-table=auth.sso_providers \
    --exclude-table=auth.sso_domains \
    --exclude-table=auth.saml_providers \
    --exclude-table=auth.saml_relay_states \
    --exclude-table=public.profiles \
    > supabase/seed.sql

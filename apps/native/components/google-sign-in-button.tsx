import * as WebBrowser from 'expo-web-browser'
import { supabase } from '@/lib/utils/supabase/client'
import GoogleButton from './ui/google-button'
import { expo } from '@/app.json'
import { useEffect } from 'react'

// Configure WebBrowser for better OAuth experience
WebBrowser.maybeCompleteAuthSession()

/**
 * Google Sign-In Button Component
 * 
 * This component implements Google OAuth using Supabase's signInWithOAuth method
 * and expo-web-browser for handling the OAuth flow on mobile platforms.
 * 
 * Required environment variables:
 * - EXPO_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - EXPO_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anon key
 * - EXPO_PUBLIC_GOOGLE_AUTH_WEB_CLIENT_ID: Your Google OAuth Web Client ID
 * 
 * Make sure to configure the redirect URL in your Supabase project settings:
 * - Add your app's scheme (e.g., bonchefnative://google-auth) to the redirect URLs
 * - Configure Google OAuth in your Supabase dashboard with the same redirect URL
 * - The scheme is automatically read from app.json
 */

interface GoogleSignInButtonProps {
  onSuccess?: () => void
  onError?: (error: Error) => void
  disabled?: boolean
  className?: string
  text?: string
}

export default function GoogleSignInButton({ 
  onSuccess, 
  onError, 
  disabled = false,
  className = '',
  text = 'Log in met Google'
}: GoogleSignInButtonProps) {
  
  function extractParamsFromUrl(url: string) {
    const parsedUrl = new URL(url);
    const hash = parsedUrl.hash.substring(1); // Remove the leading '#'
    const params = new URLSearchParams(hash);
    return {
      access_token: params.get("access_token"),
      expires_in: parseInt(params.get("expires_in") || "0", 10),
      refresh_token: params.get("refresh_token"),
      token_type: params.get("token_type"),
      provider_token: params.get("provider_token"),
      code: params.get("code"),
    };
  }

  async function handleGoogleSignIn() {    
    try {
      // Use native app scheme for redirect
      const redirectUrl = `${expo.scheme}://google-auth`;
      
      const res = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: { prompt: "consent" },
          skipBrowserRedirect: true,
        },
      });

      const googleOAuthUrl = res.data.url;
      if (!googleOAuthUrl) {
        console.error("no oauth url found!");
        onError?.(new Error("Er is iets mis gegaan bij het aanmelden met Google"));
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(
        googleOAuthUrl,
        redirectUrl,
        { showInRecents: true },
      ).catch((err) => {
        console.error("handleGoogleSignIn - openAuthSessionAsync - error", { err });
        onError?.(err instanceof Error ? err : new Error('Er is iets mis gegaan bij het aanmelden met Google'));
        return null;
      });
      
      if (result && result.type === "success") {
        const params = extractParamsFromUrl(result.url);
        
        if (params.access_token && params.refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });
          
          if (error) {
            onError?.(error);
          } else {
            onSuccess?.();
          }
        } else {
          onError?.(new Error('Er is iets mis gegaan bij het aanmelden met Google'));
        }
      } else {
        if (result?.type === 'cancel') {
          // User cancelled, don't show error
          return;
        }
        console.error("handleGoogleSignIn - openAuthSessionAsync - result", { result });
        onError?.(new Error('Er is iets mis gegaan bij het aanmelden met Google'));
      }
    } catch (error) {
      console.error("handleGoogleSignIn - error", { error });
      onError?.(error instanceof Error ? error : new Error('Unknown error occurred'));
    }
  }

  // Warm up the browser for better performance
  useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  return (
    <GoogleButton
      onPress={handleGoogleSignIn}
      disabled={disabled}
      className={className}
      text={text}
    />
  )
}

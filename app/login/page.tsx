"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-8">
      <div className="bg-bg-card border border-dark-20 p-12 w-full max-w-md relative">
        {/* Crop marks */}
        <span className="absolute top-0 left-0 w-4 h-4 border-t border-l border-dark-50/40" />
        <span className="absolute top-0 right-0 w-4 h-4 border-t border-r border-dark-50/40" />
        <span className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-dark-50/40" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-dark-50/40" />

        <div className="mb-8">
          <h1 className="text-display-hero text-dark mb-2">HARDWAR</h1>
          <span className="text-micro text-dark-50">TACTICAL COMPANION APPLICATION</span>
        </div>

        <div className="border-t border-dark-20 mb-8" />

        <p className="text-body text-secondary mb-8">
          Sign in to access the rules reference, AI chat, and session aid for
          the Hardwar tabletop miniatures wargame.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="w-full text-meta bg-accent text-dark px-6 py-3.5 border-none cursor-pointer hover:bg-accent-dark transition-colors font-medium flex items-center justify-center gap-3"
        >
          <svg width="16" height="16" viewBox="0 0 488 512" fill="currentColor">
            <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
          </svg>
          SIGN IN WITH GOOGLE
        </button>

        <div className="flex items-center justify-between mt-8">
          <span className="text-micro text-dark-50">AUTH.GATEWAY</span>
          <span className="text-micro text-dark-50">v1.0</span>
        </div>
      </div>
    </div>
  );
}

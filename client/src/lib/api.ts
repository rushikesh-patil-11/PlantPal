// This file will contain functions to interact with your backend API.

import { supabase } from '@/lib/supabaseClient';
import { User } from '@shared/schema';

async function getCurrentUser(): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    console.log('No active session, cannot fetch app user.');
    return null;
  }

  const response = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  if (response.ok) {
    const result = await response.json();
    return result.data as User || null;
  }

  if (response.status === 401) {
    console.log('Not authorized to fetch user, session might be invalid or expired.');
    return null;
  }

  const errorData = await response.json();
  throw new Error(errorData?.message || 'Failed to fetch user from /api/auth/me');
}

// To maintain a similar structure for now for use-auth.tsx
const api = {
  user: {
    // This structure mimics the Hono client's $get, but it's a direct function call
    // In use-auth.tsx, api.user.$get() will become api.user.get()
    get: getCurrentUser, 
  },
  // Add other API namespaces and functions as needed
  // examplePlaceholder: async () => { return { message: 'Placeholder resolved!' }; }
};

export { api }; // Changed to named export

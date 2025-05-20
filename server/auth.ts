import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Request, Response, NextFunction, Express } from 'express';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool } = pg;
import * as schema from '@shared/schema';
import { eq } from 'drizzle-orm';

// Ensure these are set in your .env file for the server
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const databaseUrl = process.env.DATABASE_URL; // For Drizzle to connect to Supabase DB

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Server-side Supabase URL or Anon Key is missing from environment variables.');
  // Optionally throw an error to prevent server startup without essential config
  // throw new Error('Server-side Supabase URL or Anon Key is missing.');
}

if (!databaseUrl) {
  console.error('DATABASE_URL is missing from environment variables for Drizzle.');
  // Optionally throw an error
  // throw new Error('DATABASE_URL is missing.');
}

let supabase: SupabaseClient;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Fallback or error handling if Supabase client can't be initialized
  console.error('Supabase client could not be initialized on the server.');
  // Create a dummy client or throw to prevent routes from using an undefined client
  // This is a placeholder; adjust error handling as needed.
  supabase = {} as SupabaseClient; 
}

let db: ReturnType<typeof drizzle<typeof schema>>;
if (databaseUrl) {
  const pool = new Pool({
    connectionString: databaseUrl,
  });
  db = drizzle(pool, { schema });
} else {
  console.error('Drizzle client could not be initialized on the server.');
  db = {} as ReturnType<typeof drizzle<typeof schema>>;
}

interface AuthenticatedRequest extends Request {
  user?: schema.User; // User from our database
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log('[AuthMiddleware] Entered. Path:', req.path);
  if (!supabase || Object.keys(supabase).length === 0) {
    console.error('[AuthMiddleware] Supabase client not available.');
    return res.status(500).json({ message: 'Authentication service not configured.' });
  }
  if (!db || Object.keys(db).length === 0) {
    console.error('[AuthMiddleware] Database client not available.');
    return res.status(500).json({ message: 'Database service not configured.' });
  }

  const authHeader = req.headers.authorization;
  console.log('[AuthMiddleware] Auth header:', authHeader ? authHeader.substring(0, 15) + '...' : 'Not present');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[AuthMiddleware] No Bearer token. Proceeding as unauthenticated.');
    return next();
  }

  const token = authHeader.split(' ')[1];
  console.log('[AuthMiddleware] Token extracted.');

  try {
    console.log('[AuthMiddleware] Attempting supabase.auth.getUser(token)...');
    const { data: { user: supabaseUser }, error: supabaseError } = await supabase.auth.getUser(token);

    if (supabaseError) {
      console.warn('[AuthMiddleware] Supabase token validation error:', supabaseError.message);
      return next(); 
    }
    if (!supabaseUser) {
      console.warn('[AuthMiddleware] Supabase token valid, but no user returned by Supabase.');
      return next(); 
    }
    
    console.log(`[AuthMiddleware] Supabase user successfully retrieved: ${supabaseUser.id}, Email: ${supabaseUser.email}`);

    console.log(`[AuthMiddleware] Looking for application user with supabase_auth_id: ${supabaseUser.id}`);
    const appUsers = await db.select().from(schema.users).where(eq(schema.users.supabase_auth_id, supabaseUser.id)).limit(1);

    if (appUsers.length > 0) {
      req.user = appUsers[0];
      console.log(`[AuthMiddleware] Found existing application user: ${req.user.username} (ID: ${req.user.id}). Setting req.user.`);
    } else {
      console.log(`[AuthMiddleware] Application user not found for Supabase ID: ${supabaseUser.id}. Checking by email and potentially auto-creating.`);
      // User exists in Supabase Auth but not in our public.users table (or not linked).
      // First, try to find user by email from Supabase
      if (supabaseUser.email) {
        console.log(`[AuthMiddleware] Attempting to find user by email: ${supabaseUser.email}`);
        const usersByEmail = await db.select().from(schema.users).where(eq(schema.users.email, supabaseUser.email)).limit(1);
        if (usersByEmail.length > 0) {
          const existingUser = usersByEmail[0];
          console.log(`[AuthMiddleware] Found existing user by email: ${existingUser.username} (ID: ${existingUser.id}). Linking Supabase ID.`);
          // Update this user's supabase_auth_id
          const updatedUsers = await db.update(schema.users)
            .set({ supabase_auth_id: supabaseUser.id })
            .where(eq(schema.users.id, existingUser.id))
            .returning();
          if (updatedUsers.length > 0) {
            req.user = updatedUsers[0];
            console.log(`[AuthMiddleware] Successfully linked Supabase ID ${supabaseUser.id} to user ${req.user.username}. Setting req.user.`);
          } else {
            console.error(`[AuthMiddleware] Failed to update supabase_auth_id for user ID ${existingUser.id}.`);
            // Potentially proceed to create new user or handle error differently
          }
        } else {
          console.log(`[AuthMiddleware] No user found with email ${supabaseUser.email}. Proceeding to create new user.`);
          // No user by email, proceed with new user creation
          await createNewApplicationUser(db, supabaseUser, req);
        }
      } else {
        console.warn('[AuthMiddleware] Supabase user has no email. Cannot check by email, proceeding to create new user based on Supabase ID only.');
        // No email from Supabase, proceed with new user creation logic as before
        await createNewApplicationUser(db, supabaseUser, req);
      }
    }
    console.log('[AuthMiddleware] Proceeding to next middleware/route. req.user is currently:', req.user ? { id: req.user.id, username: req.user.username } : undefined);
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Unexpected error:', error);
    next(error); 
  }
};

// Helper function to create a new application user
async function createNewApplicationUser(db: ReturnType<typeof drizzle<typeof schema>>, supabaseUser: any, req: AuthenticatedRequest) {
  try {
    let newUsername = supabaseUser.email ? supabaseUser.email.split('@')[0] : `user_${supabaseUser.id.substring(0, 8)}`;
    console.log(`[AuthMiddleware-Create] Generated initial username: ${newUsername}`);
    
    const newUserPayload: schema.InsertUser = {
      supabase_auth_id: supabaseUser.id,
      username: newUsername,
    };
    if (supabaseUser.email) {
      newUserPayload.email = supabaseUser.email;
    }

    console.log(`[AuthMiddleware-Create] Checking if username '${newUserPayload.username}' exists.`);
    let usernameExists = await db.select().from(schema.users).where(eq(schema.users.username, newUserPayload.username)).limit(1);
    if (usernameExists.length > 0) {
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      newUserPayload.username = `${newUserPayload.username}_${randomSuffix}`;
      console.warn(`[AuthMiddleware-Create] Generated username ${newUsername} already exists. Appended suffix, new username: ${newUserPayload.username}`);
    }

    console.log('[AuthMiddleware-Create] Attempting to insert new user with payload:', newUserPayload);
    const createdUsers = await db.insert(schema.users)
      .values(newUserPayload)
      .returning();
    
    if (createdUsers.length > 0) {
      req.user = createdUsers[0];
      console.log(`[AuthMiddleware-Create] Successfully created and set application user: ${req.user.username} (ID: ${req.user.id}). Setting req.user.`);
    } else {
      console.error(`[AuthMiddleware-Create] Failed to create application user for Supabase ID: ${supabaseUser.id} after insert returned empty.`);
    }
  } catch (insertError) {
    console.error(`[AuthMiddleware-Create] Error auto-creating user for Supabase ID ${supabaseUser.id}:`, insertError);
    // Do not set req.user if creation fails
  }
}

export function setupAuth(app: Express) {
  app.use(authMiddleware);
  // Potentially add other auth-related routes here if needed, e.g., /auth/logout (though Supabase logout is client-side)
}

// Export the db instance for storage.ts to use
export { db };

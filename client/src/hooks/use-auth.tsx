import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import type { User as SupabaseAuthUser } from '@supabase/supabase-js'; 
import { insertUserSchema, User as SelectUser, InsertUser as DbInsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '../lib/supabaseClient'; 

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>; 
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SupabaseAuthUser | null, Error, RegisterCredentials>; 
};

type LoginData = { email: string; password?: string }; 

type RegisterCredentials = {
  username: string;
  email: string;
  password?: string; 
};

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation<SelectUser, Error, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      if (!credentials.password) {
        throw new Error("Password is required for login.");
      }
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (signInError) {
        throw signInError;
      }

      if (!signInData.user || !signInData.session) {
        throw new Error("Login successful with Supabase, but no session or user data returned. Email might not be confirmed.");
      }
      
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      const appUser = await queryClient.fetchQuery<SelectUser | null, Error>({
        queryKey: ["/api/auth/me"],
        queryFn: getQueryFn({ on401: "returnNull" }),
      });

      if (!appUser) {
        throw new Error("Logged in with Supabase, but failed to retrieve application user profile. Auto-creation might have an issue.");
      }
      return appUser;
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/auth/me"], user); 
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username || user.email}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation<SupabaseAuthUser | null, Error, RegisterCredentials>({
    mutationFn: async (credentials: RegisterCredentials) => {
      if (!credentials.password) {
        throw new Error("Password is required for registration.");
      }
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.username,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }
      return signUpData.user; 
    },
    onSuccess: (supabaseUser: SupabaseAuthUser | null, variables: RegisterCredentials) => {
      if (supabaseUser) {
        toast({
          title: "Registration initiated!",
          description: `Welcome, ${variables.username}! Please check your email (${variables.email}) to confirm your account. Once confirmed, you can log in.`,
        });
      } else {
        toast({
          title: "Registration incomplete",
          description: "Sign-up process returned no user data. Please try again or contact support if the issue persists.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase signout error:", error);
        throw error; 
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      queryClient.setQueryData(["/api/auth/me"], null);
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout.",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

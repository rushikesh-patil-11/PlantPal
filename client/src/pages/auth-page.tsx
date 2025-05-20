import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertUserSchema } from "@shared/schema";
import { Leaf, Loader2 } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";

// Extend the schema with validation rules
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Base schema for registration form - omits supabase_auth_id which is not provided by the form
const baseRegisterFormSchema = insertUserSchema;

const registerSchema = baseRegisterFormSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { loginMutation, registerMutation, isLoading: isAuthLoading } = useAuth();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: () => navigate('/dashboard'),
    });
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    // Omit supabase_auth_id as it's not part of the form input
    const { supabase_auth_id, ...registrationData } = data as any; 
    registerMutation.mutate(registrationData, {
      onSuccess: () => navigate('/dashboard'), // Or to a 'please verify email' page
    });
  };

  return (
    <MainLayout withSidebar={false}>
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-5xl">
          {/* Left column - Forms */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-6">
              <Leaf className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-primary font-nunito">PlantPal</h1>
            </div>
            
            <Tabs value="login" onValueChange={(value) => console.log(value)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              {/* Login form */}
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome back</CardTitle>
                    <CardDescription>Login to your account to manage your plants</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter your password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={loginForm.formState.isSubmitting || isAuthLoading}
                        >
                          {loginForm.formState.isSubmitting || isAuthLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Sign In
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-primary" 
                      >
                        Register
                      </Button>
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Register form */}
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>Join PlantPal to start tracking your plant collection</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Choose a username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Create a password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={registerForm.formState.isSubmitting || isAuthLoading}
                        >
                          {registerForm.formState.isSubmitting || isAuthLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Create Account
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-primary" 
                      >
                        Login
                      </Button>
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right column - Hero section */}
          <div className="hidden md:flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-primary/90 to-secondary p-8 text-white">
            <div className="mb-8">
              <Leaf className="h-20 w-20 mb-4 mx-auto" />
              <h2 className="text-3xl font-bold mb-4 text-center font-nunito">Your Personal Plant Care Assistant</h2>
              <p className="text-center max-w-md">
                Track your plants, set watering reminders, and get AI-powered care recommendations to keep your plants thriving.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <div className="rounded-full bg-white/30 w-10 h-10 flex items-center justify-center mb-3">
                  <Leaf className="h-5 w-5" />
                </div>
                <h3 className="font-nunito font-bold mb-1">Track Your Plants</h3>
                <p className="text-sm">Create a digital collection of all your plants with care details.</p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <div className="rounded-full bg-white/30 w-10 h-10 flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                </div>
                <h3 className="font-nunito font-bold mb-1">Care Reminders</h3>
                <p className="text-sm">Never forget to water or fertilize with timely reminders.</p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <div className="rounded-full bg-white/30 w-10 h-10 flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                </div>
                <h3 className="font-nunito font-bold mb-1">Plant Insights</h3>
                <p className="text-sm">Keep a log of activities and track your plant's health over time.</p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                <div className="rounded-full bg-white/30 w-10 h-10 flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 16h5v5"></path></svg>
                </div>
                <h3 className="font-nunito font-bold mb-1">AI Recommendations</h3>
                <p className="text-sm">Get personalized care tips powered by AI technology.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

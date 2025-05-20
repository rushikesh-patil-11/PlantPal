import React from 'react';
import { Button } from '@/components/ui/button'; 
import { Label } from '@/components/ui/label';   
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
import { useAuth } from '@/hooks/use-auth'; 
import { Skeleton } from '@/components/ui/skeleton'; 
import { MainLayout } from "@/components/layout/main-layout"; 

const ProfilePage = () => {
  const { user, isLoading, logoutMutation } = useAuth(); 

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4 md:px-0 max-w-3xl space-y-8">
          <header className="mb-10 flex flex-col items-center space-y-4">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-64" />
            </div>
          </header>
          <section className="p-6 bg-card text-card-foreground rounded-lg shadow space-y-4">
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </section>
          <section className="p-6 bg-card text-card-foreground rounded-lg shadow space-y-4">
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-1/4" />
          </section>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4 text-center">
          <p>User not found. Please log in.</p>
          <Button onClick={() => window.location.href = '/auth'} className="mt-4">Go to Login</Button>
        </div>
      </MainLayout>
    );
  }

  const formattedJoinDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4 md:px-0 max-w-3xl">
        <header className="mb-10 flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={undefined} alt={user.username || ''} /> 
            <AvatarFallback>{(user.username || 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-center">{user.username}</h1>
            <p className="text-muted-foreground text-center">{user.email}</p>
          </div>
        </header>

        <section className="mb-8 p-6 bg-card text-card-foreground rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-6">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <p id="name" className="mt-1 text-sm">{user?.username || 'N/A'}</p>
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <p id="email" className="mt-1 text-sm">{user?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Joined on: {formattedJoinDate}</p>
            </div>
          </div>
        </section>

        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto" disabled={logoutMutation.isPending}>
            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;

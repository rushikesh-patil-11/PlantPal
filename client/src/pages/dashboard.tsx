import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { MainLayout } from "@/components/layout/main-layout"; // Import MainLayout
import AiRecommendation from "@/components/ai-recommendation";
import PlantCard from "@/components/plant-card";
import AddPlantModal from "@/components/add-plant-modal";
import { Leaf, Plus, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Plant, AiRecommendation as AiRecommendationType } from "@shared/schema";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [isAddPlantModalOpen, setIsAddPlantModalOpen] = useState(false);

  // Fetch plants
  const { data: plants, isLoading: isLoadingPlants } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });

  // Fetch AI recommendations
  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery<AiRecommendationType[]>({
    queryKey: ["/api/ai-recommendations"],
  });

  const filteredPlants = plants || [];

  return (
    <MainLayout>
      {/* Content that was previously in <main> now goes directly inside MainLayout */}
      {/* The <Navbar /> is now part of MainLayout */}
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, <span>{user?.username}!</span>
            </h1>
            <p className="text-muted-foreground">
              Let's check on your plant family today.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              onClick={() => setIsAddPlantModalOpen(true)}
              className="rounded-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Plant
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* AI Recommendation */}
          <div className="lg:col-span-3">
            <AiRecommendation 
              recommendation={recommendations?.[0]} 
              isLoading={isLoadingRecommendations} 
            />
          </div>
        </div>

        {/* Plant Collection */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-nunito font-semibold text-foreground">Your Plant Collection</h2>
            <div className="flex items-center space-x-2">
              {/* Search and Filter removed */}
            </div>
          </div>
          
          {isLoadingPlants ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredPlants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredPlants.slice(0, 8).map(plant => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <Leaf className="h-12 w-12 text-primary mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-nunito font-semibold mb-2">No plants found</h3>
              <p className="text-muted-foreground mb-4">
                {plants?.length === 0 
                  ? "Start by adding your first plant to your collection." 
                  : "You have no plants in your collection yet, or there was an issue fetching them."}
              </p>
              {plants?.length === 0 && (
                <Button onClick={() => setIsAddPlantModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Plant
                </Button>
              )}
            </div>
          )}
          
          {filteredPlants.length > 8 && (
            <div className="mt-5 flex justify-center">
              <Button variant="link" className="text-primary" asChild>
                <Link href="/plants">
                  View All Plants
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </Link>
              </Button>
            </div>
          )}
        </section>
      {/* AddPlantModal remains, MainLayout closes around the page content */}
      <AddPlantModal 
        isOpen={isAddPlantModalOpen} 
        onClose={() => setIsAddPlantModalOpen(false)} 
      />
    </MainLayout>
  );
}

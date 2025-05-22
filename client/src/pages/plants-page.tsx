import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/navbar";
import PlantCard from "@/components/plant-card";
import AddPlantModal from "@/components/add-plant-modal";
import { Plant } from "@shared/schema";
import { Plus, Leaf } from "lucide-react";

export default function PlantsPage() {
  const [isAddPlantModalOpen, setIsAddPlantModalOpen] = useState(false);

  // Fetch plants
  const { data: plants, isLoading } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });

  const plantsToDisplay = plants || [];

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-2xl font-nunito font-bold text-foreground">My Plants</h1>
              <p className="text-muted-foreground mt-1">
                {!isLoading && `${plantsToDisplay.length} plants in your collection`}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button onClick={() => setIsAddPlantModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Plant
              </Button>
            </div>
          </div>
          
          
          {/* Plants Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
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
          ) : plantsToDisplay.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {plantsToDisplay.map(plant => (
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
                  : "You currently have no plants in your collection."}
              </p>
              {plants?.length === 0 && (
                <Button onClick={() => setIsAddPlantModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Plant
                </Button>
              )}
            </div>
          )}
        </main>
        
        <AddPlantModal 
          isOpen={isAddPlantModalOpen} 
          onClose={() => setIsAddPlantModalOpen(false)} 
        />
      </div>
    </MainLayout>
  );
}

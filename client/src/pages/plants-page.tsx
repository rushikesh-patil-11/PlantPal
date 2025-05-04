import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import Navbar from "@/components/navbar";
import PlantCard from "@/components/plant-card";
import AddPlantModal from "@/components/add-plant-modal";
import { Plant } from "@shared/schema";
import { Plus, Search, SlidersHorizontal, Leaf } from "lucide-react";

export default function PlantsPage() {
  const [isAddPlantModalOpen, setIsAddPlantModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [filterLight, setFilterLight] = useState("all");

  // Fetch plants
  const { data: plants, isLoading } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });

  // Filter and sort plants
  const filteredAndSortedPlants = plants
    ?.filter(plant => 
      (plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       (plant.species && plant.species.toLowerCase().includes(searchQuery.toLowerCase()))) &&
      (filterLight === "all" || plant.lightNeeds === filterLight)
    )
    .sort((a, b) => {
      if (sortOption === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortOption === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOption === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortOption === "water-soon") {
        // Sort by days until next watering
        const aLastWatered = a.lastWatered ? new Date(a.lastWatered).getTime() : 0;
        const bLastWatered = b.lastWatered ? new Date(b.lastWatered).getTime() : 0;
        
        const aDaysUntilWatering = a.lastWatered 
          ? a.waterFrequency - Math.floor((Date.now() - aLastWatered) / (1000 * 60 * 60 * 24))
          : -999; // Plants never watered go last
          
        const bDaysUntilWatering = b.lastWatered 
          ? b.waterFrequency - Math.floor((Date.now() - bLastWatered) / (1000 * 60 * 60 * 24))
          : -999;
          
        return aDaysUntilWatering - bDaysUntilWatering;
      }
      return 0;
    }) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-2xl font-nunito font-bold text-foreground">My Plants</h1>
            <p className="text-muted-foreground mt-1">
              {!isLoading && `${filteredAndSortedPlants.length} plants in your collection`}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button onClick={() => setIsAddPlantModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Plant
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search plants..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="water-soon">Water Soon</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterLight} onValueChange={setFilterLight}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by light" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Light Needs</SelectItem>
                  <SelectItem value="low">Low Light</SelectItem>
                  <SelectItem value="medium">Medium Light</SelectItem>
                  <SelectItem value="bright-indirect">Bright Indirect</SelectItem>
                  <SelectItem value="full-sun">Full Sun</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
        ) : filteredAndSortedPlants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredAndSortedPlants.map(plant => (
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
                : "No plants match your search. Try different filters or search terms."}
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
  );
}

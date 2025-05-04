import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { DropletIcon, SunIcon, MoreHorizontal, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plant } from "@shared/schema";
import { 
  apiRequest, 
  queryClient 
} from "@/lib/queryClient";
import { 
  lightNeedsLabels, 
  getPlantPlaceholderImage,
  getWateringStatus,
  getWateringStatusColor,
  mapWateringStatusToIcon
} from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface PlantCardProps {
  plant: Plant;
}

export default function PlantCard({ plant }: PlantCardProps) {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  // Calculate watering status
  const wateringStatus = getWateringStatus({
    lastWatered: plant.lastWatered ? new Date(plant.lastWatered) : null,
    waterFrequency: plant.waterFrequency
  });
  
  // Get status color
  const statusColor = getWateringStatusColor(wateringStatus);
  
  // Water plant mutation
  const waterMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/care-logs", {
        plantId: plant.id,
        activityType: "watering",
        notes: "Watered the plant from dashboard"
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plant.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({
        title: "Plant watered",
        description: `${plant.name} has been watered`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to log watering",
        variant: "destructive",
      });
    },
  });

  // Delete plant mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/plants/${plant.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
      toast({
        title: "Plant deleted",
        description: `${plant.name} has been removed from your collection`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete plant",
        variant: "destructive",
      });
    },
  });

  return (
    <Card 
      className="plant-card overflow-hidden bg-white transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/plants/${plant.id}`}>
        <div className="h-48 overflow-hidden relative cursor-pointer">
          <img
            src={plant.imageUrl || getPlantPlaceholderImage(plant.id)}
            alt={plant.name}
            className="w-full h-full object-cover transition-transform duration-300"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          />
          <div className={`absolute top-3 right-3 bg-white/90 rounded-full p-1.5 ${statusColor}`}>
            {/* Dynamically render icon based on watering status */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {wateringStatus === 'overdue' && (
                <path d="M9.5 14.5 3 9l3-3m0 0h4m-4 0v4M14.5 9.5 21 15l-3 3m0 0h-4m4 0v-4" />
              )}
              {(wateringStatus === 'due' || wateringStatus === 'soon') && (
                <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
              )}
              {wateringStatus === 'ok' && (
                <>
                  <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
                  <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
                </>
              )}
              {wateringStatus === 'unknown' && (
                <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0 0a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v.01 M12 8v4" />
              )}
            </svg>
          </div>
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-1">
          <Link href={`/plants/${plant.id}`}>
            <h3 className="font-nunito font-semibold text-foreground text-lg hover:text-primary cursor-pointer">
              {plant.name}
            </h3>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Plant options">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/plants/${plant.id}`}>
                  <div className="flex w-full">View Details</div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={waterMutation.isPending}
                onClick={() => waterMutation.mutate()}
              >
                {waterMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <DropletIcon className="mr-2 h-4 w-4" />
                )}
                Water Now
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${plant.name}?`)) {
                    deleteMutation.mutate();
                  }
                }}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                )}
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {plant.species && (
          <p className="text-muted-foreground text-sm mb-3">{plant.species}</p>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="mr-3 flex items-center">
              <DropletIcon className="text-primary mr-1 h-3 w-3" />
              <span className="text-xs font-medium">Every {plant.waterFrequency} days</span>
            </div>
            <div className="flex items-center">
              <SunIcon className="text-accent mr-1 h-3 w-3" />
              <span className="text-xs font-medium">{lightNeedsLabels[plant.lightNeeds] || plant.lightNeeds}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

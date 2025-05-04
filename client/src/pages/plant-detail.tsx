import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { 
  DropletIcon, 
  SunIcon, 
  FlowerIcon, 
  InfoIcon, 
  AlertCircleIcon, 
  ArrowLeftIcon,
  CalendarIcon,
  Droplet,
  Scissors,
  Trash2,
  MoreHorizontal,
  DropletIcon as DropletFill,
  Loader2,
  PlusCircle
} from "lucide-react";
import Navbar from "@/components/navbar";
import CareLogEntry from "@/components/care-log-entry";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plant, CareLog, Reminder, AiRecommendation } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  lightNeedsLabels,
  formatDate,
  getPlantPlaceholderImage,
  getWateringStatus,
  getWateringStatusColor,
  mapWateringStatusToIcon
} from "@/lib/utils";
import AiRecommendationComponent from "@/components/ai-recommendation";

export default function PlantDetail() {
  const [match, params] = useRoute("/plants/:id");
  const plantId = match ? parseInt(params.id) : -1;
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Fetch plant details
  const { data: plant, isLoading: isLoadingPlant } = useQuery<Plant>({
    queryKey: [`/api/plants/${plantId}`],
    enabled: plantId > 0,
  });
  
  // Fetch care logs
  const { data: careLogs, isLoading: isLoadingLogs } = useQuery<CareLog[]>({
    queryKey: [`/api/plants/${plantId}/care-logs`],
    enabled: plantId > 0,
  });
  
  // Fetch reminders
  const { data: reminders, isLoading: isLoadingReminders } = useQuery<Reminder[]>({
    queryKey: [`/api/reminders`],
    enabled: plantId > 0,
  });
  
  // Fetch AI recommendations for this plant
  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery<AiRecommendation[]>({
    queryKey: [`/api/ai-recommendations`],
    enabled: plantId > 0,
  });

  // Filter reminders for this plant
  const plantReminders = reminders?.filter(reminder => reminder.plantId === plantId) || [];
  
  // Filter recommendations for this plant
  const plantRecommendations = recommendations?.filter(rec => rec.plantId === plantId) || [];
  
  // Water plant mutation
  const waterMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/care-logs", {
        plantId,
        activityType: "watering",
        notes: "Watered the plant"
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plantId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/plants/${plantId}/care-logs`] });
      queryClient.invalidateQueries({ queryKey: [`/api/reminders`] });
      toast({
        title: "Plant watered",
        description: "Watering logged successfully",
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
      await apiRequest("DELETE", `/api/plants/${plantId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
      toast({
        title: "Plant deleted",
        description: "Your plant has been removed from your collection",
      });
      // Navigate to plants page
      window.location.href = "/plants";
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete plant",
        variant: "destructive",
      });
    },
  });
  
  // Calculate watering status
  const wateringStatus = plant ? getWateringStatus({
    lastWatered: plant.lastWatered ? new Date(plant.lastWatered) : null,
    waterFrequency: plant.waterFrequency
  }) : "unknown";
  
  // Get status color
  const statusColor = getWateringStatusColor(wateringStatus);
  const WateringIcon = mapWateringStatusToIcon(wateringStatus);
  
  if (isLoadingPlant) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/plants" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Plants
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <Skeleton className="h-72 w-full rounded-lg" />
            </div>
            <div className="md:w-2/3">
              <Skeleton className="h-10 w-3/4 mb-2" />
              <Skeleton className="h-5 w-1/2 mb-4" />
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Skeleton className="h-20 rounded-lg" />
                <Skeleton className="h-20 rounded-lg" />
              </div>
              <Skeleton className="h-32 rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <AlertCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Plant Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The plant you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button asChild>
              <Link href="/plants">View All Plants</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/plants" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Plants
        </Link>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Plant Image */}
          <div className="md:w-1/3">
            <div className="rounded-lg overflow-hidden border bg-white h-72 organic-shadow">
              <img 
                src={plant.imageUrl || getPlantPlaceholderImage(plant.id)} 
                alt={plant.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Quick Actions */}
            <div className="mt-4 flex gap-2">
              <Button 
                className="flex-1"
                variant="outline"
                onClick={() => waterMutation.mutate()}
                disabled={waterMutation.isPending}
              >
                {waterMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <DropletIcon className="mr-2 h-4 w-4" />
                )}
                Water Now
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/plants/${plant.id}/edit`}>
                      Edit Plant
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    Delete Plant
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Plant Details */}
          <div className="md:w-2/3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h1 className="text-3xl font-bold font-nunito">{plant.name}</h1>
                {plant.species && (
                  <p className="text-muted-foreground">{plant.species}</p>
                )}
              </div>
            </div>
            
            {/* Plant Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex items-center">
                  <div className="rounded-full bg-primary/10 p-3 mr-4">
                    <DropletIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Water every</p>
                    <p className="font-semibold">{plant.waterFrequency} days</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center">
                  <div className="rounded-full bg-accent/10 p-3 mr-4">
                    <SunIcon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Light needs</p>
                    <p className="font-semibold">{lightNeedsLabels[plant.lightNeeds] || plant.lightNeeds}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Watering Status */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`rounded-full ${statusColor === 'text-primary' ? 'bg-primary/10' : 'bg-muted'} p-3 mr-4`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={statusColor}><path d={WateringIcon === 'droplet' ? "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" : WateringIcon === 'droplets' ? "M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" : "M9.5 14.5 3 9l3-3m0 0h4m-4 0v4M14.5 9.5 21 15l-3 3m0 0h-4m4 0v-4"}></path></svg>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Watering status</p>
                      <p className={`font-semibold ${statusColor}`}>
                        {wateringStatus === 'overdue' && 'Overdue for watering'}
                        {wateringStatus === 'due' && 'Due for watering today'}
                        {wateringStatus === 'soon' && 'Will need water soon'}
                        {wateringStatus === 'ok' && 'Recently watered'}
                        {wateringStatus === 'unknown' && 'No watering record'}
                      </p>
                      {plant.lastWatered && (
                        <p className="text-xs text-muted-foreground">
                          Last watered: {formatDate(plant.lastWatered)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant={wateringStatus === 'overdue' || wateringStatus === 'due' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => waterMutation.mutate()}
                    disabled={waterMutation.isPending}
                  >
                    {waterMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <DropletIcon className="mr-2 h-4 w-4" />
                    )}
                    Water
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Care Notes */}
            {plant.careNotes && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <div className="rounded-full bg-muted p-3 mr-4 mt-1">
                      <InfoIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Care Notes</p>
                      <p className="text-muted-foreground whitespace-pre-line">{plant.careNotes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Tabs for Care Log, Reminders, Recommendations */}
            <Tabs defaultValue="care-log" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="care-log">Care Log</TabsTrigger>
                <TabsTrigger value="reminders">Reminders</TabsTrigger>
                <TabsTrigger value="recommendations">AI Tips</TabsTrigger>
              </TabsList>
              
              {/* Care Log Tab */}
              <TabsContent value="care-log">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex justify-between items-center">
                      <span>Care History</span>
                      <Button size="sm" variant="ghost" className="text-primary">
                        <Link href={`/plants/${plant.id}/log`} className="flex items-center">
                          <PlusCircle className="mr-1 h-4 w-4" />
                          Add Entry
                        </Link>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingLogs ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex items-start">
                            <Skeleton className="h-10 w-10 rounded-full mr-4" />
                            <div className="flex-1">
                              <Skeleton className="h-5 w-1/3 mb-2" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : careLogs && careLogs.length > 0 ? (
                      <div className="space-y-4">
                        {careLogs.map(log => (
                          <CareLogEntry key={log.id} careLog={log} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="font-semibold mb-1">No care log entries yet</p>
                        <p className="text-muted-foreground text-sm mb-4">
                          Start tracking your plant care activities
                        </p>
                        <Button size="sm" variant="outline">
                          <Link href={`/plants/${plant.id}/log`} className="flex items-center">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add First Entry
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Reminders Tab */}
              <TabsContent value="reminders">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex justify-between items-center">
                      <span>Scheduled Reminders</span>
                      <Button size="sm" variant="ghost" className="text-primary">
                        <Link href={`/calendar?plant=${plant.id}`} className="flex items-center">
                          Add Reminder
                        </Link>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingReminders ? (
                      <div className="space-y-4">
                        {[1, 2].map(i => (
                          <div key={i} className="flex items-start">
                            <Skeleton className="h-10 w-10 rounded-full mr-4" />
                            <div className="flex-1">
                              <Skeleton className="h-5 w-1/3 mb-2" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : plantReminders.length > 0 ? (
                      <div className="space-y-3">
                        {plantReminders.map(reminder => (
                          <div key={reminder.id} className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
                            <div className="flex items-center">
                              <div className="rounded-full bg-muted p-2 mr-3">
                                {reminder.reminderType === 'watering' && <Droplet className="h-4 w-4 text-primary" />}
                                {reminder.reminderType === 'fertilizing' && <FlowerIcon className="h-4 w-4 text-accent" />}
                                {reminder.reminderType === 'pruning' && <Scissors className="h-4 w-4 text-muted-foreground" />}
                                {!['watering', 'fertilizing', 'pruning'].includes(reminder.reminderType) && 
                                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />}
                              </div>
                              <div>
                                <p className="font-medium">{reminder.reminderType.charAt(0).toUpperCase() + reminder.reminderType.slice(1)}</p>
                                <p className="text-sm text-muted-foreground">{formatDate(reminder.dueDate)}</p>
                              </div>
                            </div>
                            <Badge variant={reminder.completed ? "outline" : "default"}>
                              {reminder.completed ? "Completed" : "Upcoming"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="font-semibold mb-1">No reminders scheduled</p>
                        <p className="text-muted-foreground text-sm mb-4">
                          Schedule reminders to stay on top of plant care
                        </p>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/calendar?plant=${plant.id}`}>
                            Schedule Reminder
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* AI Recommendations Tab */}
              <TabsContent value="recommendations">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex justify-between items-center">
                      <span>AI Care Recommendations</span>
                      <Button size="sm" variant="ghost" className="text-primary" asChild>
                        <Link href={`/ai-recommendations?plant=${plant.id}`}>
                          Get New Tip
                        </Link>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingRecommendations ? (
                      <Skeleton className="h-32 w-full" />
                    ) : plantRecommendations.length > 0 ? (
                      <div className="space-y-4">
                        {plantRecommendations.map(recommendation => (
                          <AiRecommendationComponent 
                            key={recommendation.id}
                            recommendation={recommendation}
                            compact={true}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 text-muted-foreground opacity-50"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>
                        <p className="font-semibold mb-1">No AI recommendations yet</p>
                        <p className="text-muted-foreground text-sm mb-4">
                          Get personalized care tips for your {plant.name}
                        </p>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/ai-recommendations?plant=${plant.id}`}>
                            Get Plant Care Tips
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plant</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete <span className="font-semibold">{plant.name}</span>? 
            This will remove all care logs and reminders for this plant.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Plant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

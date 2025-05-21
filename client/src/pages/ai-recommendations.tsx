import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MainLayout } from "@/components/layout/main-layout";
import { Navbar } from "@/components/navbar";
import AiRecommendation from "@/components/ai-recommendation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { AiRecommendation as AiRecommendationType, Plant } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Lightbulb, Loader2, Plus } from "lucide-react";

// Schema for generating AI recommendations
const aiRecommendationSchema = z.object({
  plantId: z.number().optional(),
  plantName: z.string().min(1, "Plant name is required"),
  plantSpecies: z.string().optional(),
  careIssue: z.string().optional(),
  plantDescription: z.string().optional(),
});

type AiRecommendationFormValues = z.infer<typeof aiRecommendationSchema>;

export default function AiRecommendations() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  const plantIdParam = params.get('plant');
  const { toast } = useToast();
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Fetch AI recommendations
  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery<AiRecommendationType[]>({
    queryKey: ["/api/ai-recommendations"],
  });

  // Fetch plants for the form dropdown
  const { data: plants, isLoading: isLoadingPlants } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });

  // Generate recommendation mutation
  const generateRecommendationMutation = useMutation({
    mutationFn: async (values: AiRecommendationFormValues) => {
      const res = await apiRequest("POST", "/api/ai-recommendations/generate", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Recommendation generated",
        description: "AI has created personalized plant care tips",
      });
      setIsGenerateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/ai-recommendations"] });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate recommendation. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mark recommendation as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/ai-recommendations/${id}/read`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-recommendations"] });
    },
  });

  // Form for generating recommendations
  const form = useForm<AiRecommendationFormValues>({
    resolver: zodResolver(aiRecommendationSchema),
    defaultValues: {
      plantId: plantIdParam ? parseInt(plantIdParam) : undefined,
      plantName: "",
      plantSpecies: "",
      careIssue: "",
      plantDescription: "",
    },
  });

  // Update plant name when plant id changes
  const watchPlantId = form.watch("plantId");
  
  // Fill plant name and species when a plant is selected
  const onPlantChange = (plantId: number) => {
    const selectedPlant = plants?.find(p => p.id === plantId);
    if (selectedPlant) {
      form.setValue("plantName", selectedPlant.name);
      if (selectedPlant.species) {
        form.setValue("plantSpecies", selectedPlant.species);
      }
    }
  };

  const recommendationsToDisplay = recommendations || [];

  // Submit form
  const onSubmit = (values: AiRecommendationFormValues) => {
    generateRecommendationMutation.mutate(values);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-2xl font-nunito font-bold text-foreground">AI Care Recommendations</h1>
            <p className="text-muted-foreground mt-1">Get personalized care tips from our plant AI assistant</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button onClick={() => setIsGenerateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Generate New Tips
            </Button>
          </div>
        </div>


        {/* Recommendations List */}
        {isLoadingRecommendations ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start gap-4">
                    <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="w-3/4 h-6 mb-3" />
                      <Skeleton className="w-full h-4 mb-2" />
                      <Skeleton className="w-full h-4 mb-2" />
                      <Skeleton className="w-2/3 h-4 mb-3" />
                      <div className="flex gap-2">
                        <Skeleton className="w-16 h-5 rounded-full" />
                        <Skeleton className="w-16 h-5 rounded-full" />
                        <Skeleton className="w-16 h-5 rounded-full" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recommendationsToDisplay && recommendationsToDisplay.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendationsToDisplay.map((rec) => (
              <AiRecommendation
                key={rec.id}
                recommendation={rec}
                onViewMore={() => markAsReadMutation.mutate(rec.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">No recommendations</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {"No recommendations available yet. Generate some to get started!"}
            </p>
          </div>
        )}
      </div>

      {/* Generate Recommendation Dialog */}
      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Generate AI Care Tips</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="plantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Plant (Optional)</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(parseInt(value));
                        onPlantChange(parseInt(value));
                      }}
                      defaultValue={field.value?.toString()} 
                      disabled={isLoadingPlants}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a plant from your collection" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingPlants ? (
                          <SelectItem value="loading" disabled>Loading plants...</SelectItem>
                        ) : (
                          plants?.map(plant => (
                            <SelectItem key={plant.id} value={plant.id.toString()}>
                              {plant.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plant Name</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Monstera Deliciosa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plantSpecies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plant Species (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Araceae" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="careIssue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specific Care Issue (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Yellowing leaves, pests" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plantDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Plant Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide more details about your plant or its environment..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsGenerateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={generateRecommendationMutation.isPending}>
                  {generateRecommendationMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Tips
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
  </MainLayout>
  );
}

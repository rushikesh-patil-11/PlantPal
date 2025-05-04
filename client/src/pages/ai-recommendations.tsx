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
import Navbar from "@/components/navbar";
import AiRecommendation from "@/components/ai-recommendation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { AiRecommendation as AiRecommendationType, Plant } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Lightbulb, Loader2, Plus, Search } from "lucide-react";

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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter recommendations based on search and category
  const filteredRecommendations = recommendations?.filter(rec => {
    const matchesSearch = 
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.tags && rec.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesCategory = selectedCategory === "all" || 
      (rec.tags && rec.tags.includes(selectedCategory));
    
    return matchesSearch && matchesCategory;
  });

  // Get all unique tags from recommendations
  const allTags = recommendations?.flatMap(rec => rec.tags || []) || [];
  const uniqueTags = Array.from(new Set(allTags)).sort();

  // Submit form
  const onSubmit = (values: AiRecommendationFormValues) => {
    generateRecommendationMutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search recommendations..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="h-10">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  {uniqueTags.slice(0, 5).map(tag => (
                    <TabsTrigger key={tag} value={tag} className="text-xs">{tag}</TabsTrigger>
                  ))}
                  {uniqueTags.length > 5 && (
                    <Select onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-8 text-xs border-0">
                        <span>More tags</span>
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueTags.slice(5).map(tag => (
                          <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </TabsList>
              </Tabs>
            </div>
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
        ) : filteredRecommendations && filteredRecommendations.length > 0 ? (
          <div className="space-y-6">
            {filteredRecommendations.map(recommendation => (
              <AiRecommendation
                key={recommendation.id}
                recommendation={recommendation}
                onViewMore={() => markAsReadMutation.mutate(recommendation.id)}
              />
            ))}
          </div>
        ) : recommendations && recommendations.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-nunito font-semibold mb-2">No matching recommendations</h3>
            <p className="text-muted-foreground mb-4">
              Try using different search terms or categories
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-nunito font-semibold mb-2">No AI recommendations yet</h3>
            <p className="text-muted-foreground mb-4">
              Get personalized care tips for your plants by generating your first recommendation
            </p>
            <Button onClick={() => setIsGenerateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Generate First Recommendation
            </Button>
          </div>
        )}
      </main>

      {/* Generate Recommendation Dialog */}
      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate AI Care Recommendation</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="plantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Your Plant (Optional)</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const plantId = parseInt(value);
                        field.onChange(plantId);
                        onPlantChange(plantId);
                      }}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose from your plants" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingPlants ? (
                          <div className="p-2">
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          </div>
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

              <Separator className="my-2" />

              <FormField
                control={form.control}
                name="plantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plant Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Monstera" {...field} />
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
                    <FormLabel>Species (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Monstera Deliciosa" {...field} />
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
                    <FormLabel>Care Issue or Question (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Yellow leaves" {...field} />
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
                    <FormLabel>Additional Details (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your plant's environment, current condition, or specific care needs"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsGenerateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={generateRecommendationMutation.isPending}
                >
                  {generateRecommendationMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Tips"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

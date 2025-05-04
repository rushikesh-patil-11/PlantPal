import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InsertPlant, lightNeedsOptions } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, DropletIcon, SunIcon, Upload } from "lucide-react";

// Schema for adding a plant
const addPlantSchema = z.object({
  name: z.string().min(1, "Plant name is required"),
  species: z.string().optional(),
  imageUrl: z.string().optional(),
  waterFrequency: z.coerce.number().int().min(1, "Water frequency must be at least 1 day"),
  lightNeeds: z.enum(lightNeedsOptions as [string, ...string[]], {
    required_error: "Light needs is required",
  }),
  careNotes: z.string().optional(),
});

type AddPlantFormValues = z.infer<typeof addPlantSchema>;

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPlantModal({ isOpen, onClose }: AddPlantModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Create plant mutation
  const createPlantMutation = useMutation({
    mutationFn: async (values: AddPlantFormValues) => {
      const plantData: InsertPlant = {
        ...values,
        userId: user!.id,
      };
      
      const res = await apiRequest("POST", "/api/plants", plantData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Plant added",
        description: "Your plant has been added to your collection",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
      form.reset();
      setUploadedImage(null);
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add plant. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form setup
  const form = useForm<AddPlantFormValues>({
    resolver: zodResolver(addPlantSchema),
    defaultValues: {
      name: "",
      species: "",
      imageUrl: "",
      waterFrequency: 7,
      lightNeeds: "medium",
      careNotes: "",
    },
  });

  // Handle image upload (mock implementation - would be replaced with real upload)
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server/storage
      // For this demo, we'll create a data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setUploadedImage(imageUrl);
        form.setValue("imageUrl", "https://images.unsplash.com/photo-1463154545680-d59320fd685d?auto=format&fit=crop&w=800&q=80");
      };
      reader.readAsDataURL(file);
    }
  };

  // Form submission
  const onSubmit = (values: AddPlantFormValues) => {
    createPlantMutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Plant</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plant Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Monstera Deliciosa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="species"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Species (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Monstera Deliciosa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel>Upload Photo</FormLabel>
              <div 
                className={`
                  border-2 border-dashed rounded-lg py-6 px-4 text-center cursor-pointer
                  ${uploadedImage ? 'border-primary/30 bg-primary/5' : 'border-gray-300 hover:border-primary/30 hover:bg-primary/5'}
                  transition-colors
                `}
                onClick={() => document.getElementById('plantPhoto')?.click()}
              >
                {uploadedImage ? (
                  <div className="relative">
                    <img 
                      src={uploadedImage} 
                      alt="Plant preview" 
                      className="mx-auto max-h-48 rounded-lg object-cover"
                    />
                    <p className="text-sm text-muted-foreground mt-2">Click to change image</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Drag and drop your plant photo here</p>
                    <Button type="button" variant="ghost" size="sm" className="text-primary text-sm font-medium">
                      Or browse files
                    </Button>
                  </>
                )}
                <input 
                  type="file" 
                  id="plantPhoto" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </FormItem>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="waterFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Water Frequency</FormLabel>
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <span className="flex items-center">
                            <DropletIcon className="h-4 w-4 text-primary mr-2" />
                            <SelectValue placeholder="Select frequency" />
                          </span>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="3">Every 3 days</SelectItem>
                        <SelectItem value="5">Every 5 days</SelectItem>
                        <SelectItem value="7">Every 7 days</SelectItem>
                        <SelectItem value="10">Every 10 days</SelectItem>
                        <SelectItem value="14">Every 14 days</SelectItem>
                        <SelectItem value="21">Every 21 days</SelectItem>
                        <SelectItem value="30">Every 30 days</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lightNeeds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Light Needs</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <span className="flex items-center">
                            <SunIcon className="h-4 w-4 text-accent mr-2" />
                            <SelectValue placeholder="Select light needs" />
                          </span>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low light</SelectItem>
                        <SelectItem value="medium">Medium light</SelectItem>
                        <SelectItem value="bright-indirect">Bright indirect</SelectItem>
                        <SelectItem value="full-sun">Full sun</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="careNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Care Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any specific care instructions or notes about your plant"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createPlantMutation.isPending}
              >
                {createPlantMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Add Plant
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

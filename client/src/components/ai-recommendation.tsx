import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AiRecommendation as AiRecommendationType, Plant } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate, truncateText } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Leaf, Trash2, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

// Helper function to render content with markdown-style headers
const renderRecommendationContent = (content: string | undefined | null): (JSX.Element | null)[] | null => {
  if (!content) return null;
  return content.split(/\r?\n/).map((line, index) => {
    if (line.startsWith("### ")) {
      return <h3 key={index}>{line.substring(4)}</h3>;
    } else if (line.startsWith("## ")) {
      return <h2 key={index}>{line.substring(3)}</h2>;
    } else if (line.startsWith("# ")) {
      return <h1 key={index}>{line.substring(2)}</h1>;
    } else if (line.trim() === '') {
      // Filter out empty lines, or render <br key={index} /> if explicit spacing is desired
      return null; 
    } else {
      return <p key={index}>{line}</p>;
    }
  }).filter(Boolean); // Remove nulls (from empty lines)
};

interface AiRecommendationProps {
  recommendation?: AiRecommendationType;
  isLoading?: boolean;
  compact?: boolean;
  onViewMore?: () => void;
  onDelete?: (id: number) => void;
}

export default function AiRecommendation({ 
  recommendation, 
  isLoading = false,
  compact = false,
  onViewMore, 
  onDelete 
}: AiRecommendationProps) {
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Fetch plants for plant name
  const { data: plants } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });
  
  // Get plant name by id
  const getPlantName = (plantId?: number) => {
    if (!plantId) return "";
    const plant = plants?.find(p => p.id === plantId);
    return plant?.name || "";
  };
  
  // Dialog open handler
  const handleViewMore = () => {
    setIsViewDialogOpen(true);
    if (onViewMore) {
      onViewMore();
    }
  };

  const handleDelete = () => {
    if (recommendation && onDelete) {
      onDelete(recommendation.id);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center">
            <Skeleton className="w-16 h-16 rounded-full mb-4 md:mb-0 md:mr-5" />
            <div className="flex-1">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-3" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendation) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="text-center py-6">
            <Leaf className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="font-semibold mb-1">No recommendations yet</p>
            <p className="text-muted-foreground text-sm mb-4">
              Get personalized plant care advice from our AI assistant
            </p>
            <Button variant="outline" asChild>
              <Link href="/ai-recommendations">
                Get Care Tips
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // For compact mode (used in lists)
  if (compact) {
    return (
      <div 
        className="bg-white rounded-lg border p-4 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all"
        onClick={handleViewMore}
        // Stop propagation to prevent card click if delete button is inside this clickable area for compact view
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Leaf className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h3 className="font-nunito font-semibold text-foreground text-sm line-clamp-1">{recommendation.title}</h3>
              {!recommendation.read && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">New</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {truncateText(recommendation.content, 120)}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {recommendation.tags?.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        {/* Delete button for compact view - consider placement carefully */}
        {onDelete && recommendation && (
          <div className="absolute top-2 right-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={(e) => { 
                      e.stopPropagation(); // Prevent card click from triggering view dialog
                      setIsDeleteDialogOpen(true); 
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete recommendation</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Full recommendation dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{recommendation.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {recommendation.plantId && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Leaf className="h-4 w-4 mr-1" />
                  <span>{getPlantName(recommendation.plantId)}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-1 mb-4">
                {recommendation.tags?.map((tag, i) => (
                  <Badge key={i} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="prose prose-sm max-w-none">
                {renderRecommendationContent(recommendation.content)}
              </div>
              <div className="text-xs text-muted-foreground mt-4">
                Generated on {recommendation.createdAt ? formatDate(recommendation.createdAt) : 'Date not available'}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Regular full mode
  return (
    <>
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row items-start">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 md:mb-0 md:mr-5">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-nunito font-semibold text-foreground text-lg mb-2">{recommendation.title}</h3>
              <p className="text-muted-foreground mb-3 line-clamp-3">
                {truncateText(recommendation.content, 150)}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {recommendation.tags?.slice(0, 5).map((tag, i) => (
                  <Badge key={i} variant="secondary" className="bg-green-50 text-primary text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  className="text-primary p-0 h-auto"
                  onClick={handleViewMore}
                >
                  Read More
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  {onDelete && recommendation && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setIsDeleteDialogOpen(true)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete recommendation</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {!recommendation.read && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">New</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Full recommendation view dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{recommendation.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {recommendation.plantId && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Leaf className="h-4 w-4 mr-1" />
                <span>{getPlantName(recommendation.plantId)}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-1 mb-4">
              {recommendation.tags?.map((tag, i) => (
                <Badge key={i} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="prose prose-sm max-w-none">
              {renderRecommendationContent(recommendation.content)}
            </div>
            <div className="text-xs text-muted-foreground mt-4">
              Generated on {recommendation.createdAt ? formatDate(recommendation.createdAt) : 'Date not available'}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {recommendation && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="pt-2">
                Are you sure you want to delete this AI recommendation titled "<strong>{recommendation.title}</strong>"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

import { CareLog, Plant } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CareLogEntryProps {
  careLog: CareLog;
}

export default function CareLogEntry({ careLog }: CareLogEntryProps) {
  // Get all plants to find the specific plant
  const { data: plants } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });
  
  // Get plant related to this care log
  const plant = plants?.find(p => p.id === careLog.plantId);
  
  // Get icon based on activity type
  const getIcon = () => {
    switch (careLog.activityType) {
      case "watering":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path>
          </svg>
        );
      case "fertilizing":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <path d="M12 7c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2s-2 .9-2 2v2c0 1.1.9 2 2 2Z"></path>
            <path d="M14 13c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H8.5c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2"></path>
            <path d="M12 22c3.9 0 7-3.1 7-7v-2c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v2c0 3.9 3.1 7 7 7Z"></path>
          </svg>
        );
      case "pruning":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
            <circle cx="6" cy="6" r="3"></circle>
            <path d="M8.5 8.5 19 19"></path>
            <circle cx="18" cy="18" r="3"></circle>
            <path d="M8.5 15.5 19 5"></path>
          </svg>
        );
      case "repotting":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
            <path d="M12 10V5"></path>
            <path d="M12 10a3 3 0 1 0 3 3"></path>
            <rect width="16" height="8" x="4" y="15" rx="2"></rect>
            <path d="M18 15V9a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v6"></path>
          </svg>
        );
      case "misting":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
            <path d="m12 19 7-7a5 5 0 0 0-7-7l-7 7a5 5 0 0 0 7 7Z"></path>
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
            <path d="m9 12 2 2 4-4"></path>
          </svg>
        );
    }
  };
  
  // Get activity text
  const getActivityText = () => {
    switch (careLog.activityType) {
      case "watering":
        return "Watered";
      case "fertilizing":
        return "Fertilized";
      case "pruning":
        return "Pruned";
      case "repotting":
        return "Repotted";
      case "misting":
        return "Misted";
      default:
        return "Cared for";
    }
  };
  
  // Get background color based on activity type
  const getActivityBgColor = () => {
    switch (careLog.activityType) {
      case "watering":
        return "bg-primary/10";
      case "fertilizing":
        return "bg-accent/10";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="flex items-start">
      <div className={`rounded-full p-3 mr-4 ${getActivityBgColor()}`}>
        {getIcon()}
      </div>
      <div>
        <div className="flex items-center">
          <p className="font-medium">
            {getActivityText()} {plant?.name || 'plant'}
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <time className="text-xs text-muted-foreground ml-2">
                  {careLog.performedAt ? formatDate(careLog.performedAt) : 'Date unavailable'}
                </time>
              </TooltipTrigger>
              <TooltipContent>
                <p>{careLog.performedAt ? new Date(careLog.performedAt).toLocaleString() : 'Date unavailable'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {careLog.notes && (
          <p className="text-sm text-muted-foreground mt-1">{careLog.notes}</p>
        )}
      </div>
    </div>
  );
}

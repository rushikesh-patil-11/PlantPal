import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Reminder, Plant } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { reminderTypeIcons } from "@/lib/utils";

interface RemindersSectionProps {
  reminders?: Reminder[];
  isLoading: boolean;
}

export default function RemindersSection({ reminders, isLoading }: RemindersSectionProps) {
  const { toast } = useToast();

  // Fetch plants to get names
  const { data: plants } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });

  // Filter reminders to today (not completed)
  const todayReminders = reminders?.filter(reminder => 
    !reminder.completed && 
    new Date(reminder.dueDate).toDateString() === new Date().toDateString()
  ) || [];

  // Mark reminder as complete mutation
  const completeReminderMutation = useMutation({
    mutationFn: async (reminderId: number) => {
      const res = await apiRequest("POST", `/api/reminders/${reminderId}/complete`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({
        title: "Reminder completed",
        description: "Task marked as completed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive",
      });
    },
  });

  // Get plant name by id
  const getPlantName = (plantId: number) => {
    const plant = plants?.find(p => p.id === plantId);
    return plant?.name || "Unknown Plant";
  };

  // Get icon component based on reminder type
  const getIconForReminder = (type: string) => {
    const iconName = reminderTypeIcons[type];
    
    return ({ className }: { className: string }) => (
      <span 
        className={`${className} ri-${iconName}-line`} 
        style={{ 
          fontFamily: 'Remixicon', 
          fontSize: '1.25rem'
        }}
      />
    );
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-nunito font-semibold text-foreground">Today's Plant Care</h2>
        <Link href="/calendar" className="text-primary hover:text-primary/80 text-sm font-medium font-nunito flex items-center">
          View Calendar
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
      
      <Card>
        <CardContent className="p-5">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center p-3 rounded-lg border">
                  <Skeleton className="h-12 w-12 rounded-full mr-4" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              ))}
            </div>
          ) : todayReminders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {todayReminders.map(task => {
                const IconComponent = getIconForReminder(task.reminderType);
                
                const isPending = completeReminderMutation.isPending && 
                  completeReminderMutation.variables === task.id;
                
                return (
                  <div key={task.id} className="flex items-center p-3 rounded-lg border border-secondary/30 bg-green-50">
                    <div className={`
                      rounded-full p-3 mr-4
                      ${task.reminderType === 'watering' ? 'bg-primary/10 text-primary' : 
                        task.reminderType === 'fertilizing' ? 'bg-accent/10 text-accent' : 
                        'bg-muted/60 text-muted-foreground'}
                    `}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-nunito font-semibold text-foreground">
                        {getPlantName(task.plantId)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {task.reminderType === 'watering' ? 'Needs watering today' : 
                          task.reminderType === 'fertilizing' ? 'Fertilize today' :
                          task.reminderType === 'pruning' ? 'Time to prune' :
                          task.reminderType === 'repotting' ? 'Time to repot' :
                          'Check today'}
                      </p>
                    </div>
                    <Button 
                      size="icon"
                      className="ml-auto rounded-full bg-primary text-white hover:bg-primary/90"
                      onClick={() => completeReminderMutation.mutate(task.id)}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="rounded-full bg-primary/10 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
              <h3 className="font-nunito font-semibold text-lg mb-1">All caught up!</h3>
              <p className="text-muted-foreground mb-4">
                You have no plant care tasks scheduled for today.
              </p>
              <Button variant="outline" asChild>
                <Link href="/calendar">
                  Schedule Care Tasks
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isEqual, isSameMonth, addDays, addMonths, subMonths, startOfMonth, endOfMonth, isBefore, isToday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/navbar";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { Reminder, Plant, insertReminderSchema, reminderTypeOptions } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { reminderTypeLabels, reminderTypeIcons } from "@/lib/utils";
import { CalendarIcon, ChevronLeft, ChevronRight, CheckIcon, Loader2 } from "lucide-react";

// Schema for creating a reminder
const reminderFormSchema = z.object({
  plantId: z.number({
    required_error: "Please select a plant",
  }),
  reminderType: z.enum(reminderTypeOptions as [string, ...string[]], {
    required_error: "Please select a reminder type",
  }),
  dueDate: z.date({
    required_error: "Please select a date",
  }),
  notes: z.string().optional(),
});

type ReminderFormValues = z.infer<typeof reminderFormSchema>;

export default function CalendarPage() {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [isViewReminderOpen, setIsViewReminderOpen] = useState(false);

  // Fetch all reminders
  const { data: reminders, isLoading: isLoadingReminders } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
  });

  // Fetch all plants
  const { data: plants, isLoading: isLoadingPlants } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });

  // Filter reminders for selected date
  const selectedDateReminders = reminders?.filter(reminder => {
    if (!selectedDate) return false;
    const reminderDate = new Date(reminder.dueDate);
    return isEqual(
      new Date(reminderDate.getFullYear(), reminderDate.getMonth(), reminderDate.getDate()),
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    );
  });

  // Get reminders by date
  const getRemindersByDate = (date: Date) => {
    return reminders?.filter(reminder => {
      const reminderDate = new Date(reminder.dueDate);
      return isEqual(
        new Date(reminderDate.getFullYear(), reminderDate.getMonth(), reminderDate.getDate()),
        new Date(date.getFullYear(), date.getMonth(), date.getDate())
      );
    });
  };

  // Form for adding a reminder
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      plantId: undefined,
      reminderType: undefined,
      dueDate: selectedDate,
      notes: "",
    },
  });

  // Update form when selected date changes
  useEffect(() => {
    if (selectedDate) {
      form.setValue("dueDate", selectedDate);
    }
  }, [selectedDate, form]);

  // Create reminder mutation
  const createReminderMutation = useMutation({
    mutationFn: async (values: ReminderFormValues) => {
      const res = await apiRequest("POST", "/api/reminders", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder created",
        description: "Your reminder has been scheduled",
      });
      setIsAddReminderOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create reminder",
        variant: "destructive",
      });
    },
  });

  // Complete reminder mutation
  const completeReminderMutation = useMutation({
    mutationFn: async (reminderId: number) => {
      const res = await apiRequest("POST", `/api/reminders/${reminderId}/complete`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Reminder completed",
        description: "Reminder marked as completed",
      });
      setIsViewReminderOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete reminder",
        variant: "destructive",
      });
    },
  });

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const onAddReminderSubmit = (values: ReminderFormValues) => {
    createReminderMutation.mutate(values);
  };

  const viewReminderDetails = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setIsViewReminderOpen(true);
  };

  const getPlantNameById = (plantId: number) => {
    const plant = plants?.find(p => p.id === plantId);
    return plant?.name || "Unknown Plant";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-nunito font-bold text-foreground">Care Calendar</h1>
            <p className="text-muted-foreground mt-1">Schedule and manage your plant care activities</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button onClick={() => {
              setSelectedDate(new Date());
              setIsAddReminderOpen(true);
            }}>
              Add Reminder
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-nunito">
                {format(currentMonth, "MMMM yyyy")}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous month</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next month</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-3">
                <div className="grid grid-cols-7 gap-1">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div key={day} className="text-center py-2 text-sm font-medium text-muted-foreground">
                        {day}
                      </div>
                    )
                  )}
                </div>
                <div className="grid grid-cols-7 gap-1 mt-1">
                  {eachDayOfInterval({
                    start: startOfWeek(startOfMonth(currentMonth)),
                    end: endOfWeek(endOfMonth(currentMonth)),
                  }).map((day, index) => {
                    const dayReminders = getRemindersByDate(day) || [];
                    const isSelectedDate = selectedDate && isEqual(
                      new Date(day.getFullYear(), day.getMonth(), day.getDate()),
                      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
                    );
                    
                    return (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setSelectedDate(day)}
                            className={`
                              calendar-day h-14 rounded-lg border p-1 text-center relative
                              ${!isSameMonth(day, currentMonth) ? "bg-muted/20 text-muted-foreground" : ""}
                              ${isSelectedDate ? "border-primary bg-primary/10" : "border-border"}
                              ${isToday(day) ? "font-bold" : ""}
                              hover:border-primary hover:bg-primary/5 transition-colors
                            `}
                          >
                            <span className="text-sm">{format(day, "d")}</span>
                            <div className="flex justify-center mt-1 gap-0.5">
                              {isLoadingReminders ? (
                                <Skeleton className="h-1.5 w-1.5 rounded-full" />
                              ) : (
                                <>
                                  {dayReminders.filter(r => r.reminderType === "watering").length > 0 && (
                                    <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                                  )}
                                  {dayReminders.filter(r => r.reminderType === "fertilizing").length > 0 && (
                                    <div className="h-1.5 w-1.5 bg-accent rounded-full" />
                                  )}
                                  {dayReminders.filter(r => !["watering", "fertilizing"].includes(r.reminderType)).length > 0 && (
                                    <div className="h-1.5 w-1.5 bg-muted-foreground rounded-full" />
                                  )}
                                </>
                              )}
                            </div>
                          </button>
                        </TooltipTrigger>
                        {dayReminders.length > 0 && (
                          <TooltipContent>
                            <div className="font-medium">{format(day, "MMM d, yyyy")}</div>
                            <ul className="text-xs mt-1">
                              {dayReminders.map((reminder, i) => (
                                <li key={i}>• {reminderTypeLabels[reminder.reminderType]} {getPlantNameById(reminder.plantId)}</li>
                              ))}
                            </ul>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reminders for Selected Date */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-nunito flex items-center justify-between">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                  {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
                </div>
                {selectedDate && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setIsAddReminderOpen(true)}
                  >
                    Add
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingReminders ? (
                <div className="space-y-3 py-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full mr-3" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedDateReminders && selectedDateReminders.length > 0 ? (
                <div className="space-y-3 py-2">
                  {selectedDateReminders.map(reminder => {
                    const Icon = reminderTypeIcons[reminder.reminderType] ? 
                      ({ className }: { className: string }) => {
                        const iconName = reminderTypeIcons[reminder.reminderType];
                        return (
                          <span 
                            className={`${className} ri-${iconName}-line`} 
                            style={{ 
                              fontFamily: 'Remixicon', 
                              fontSize: '1.25rem'
                            }}
                          />
                        );
                      }
                    : CalendarIcon;
                    
                    return (
                      <div 
                        key={reminder.id} 
                        className={`
                          flex items-center justify-between p-3 rounded-lg border 
                          ${reminder.completed ? 'bg-muted/30 border-muted' : 'bg-primary/5 border-primary/20'}
                          cursor-pointer hover:bg-primary/10 transition-colors
                        `}
                        onClick={() => viewReminderDetails(reminder)}
                      >
                        <div className="flex items-center">
                          <div className={`
                            rounded-full p-2 mr-3
                            ${reminder.reminderType === 'watering' ? 'bg-primary/20 text-primary' : 
                              reminder.reminderType === 'fertilizing' ? 'bg-accent/20 text-accent' : 
                              'bg-muted text-muted-foreground'}
                          `}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className={`font-medium ${reminder.completed ? 'text-muted-foreground line-through' : ''}`}>
                              {reminderTypeLabels[reminder.reminderType]} {getPlantNameById(reminder.plantId)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(reminder.dueDate), "h:mm a")}
                            </p>
                          </div>
                        </div>
                        {reminder.completed ? (
                          <Badge variant="outline" className="text-muted-foreground">
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="default">
                            Due
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : selectedDate ? (
                <div className="text-center py-6">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="font-semibold mb-1">No reminders for this day</p>
                  <p className="text-muted-foreground text-sm mb-4">
                    Add a reminder to keep track of your plant care tasks
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setIsAddReminderOpen(true)}
                  >
                    Add Reminder
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="font-semibold mb-1">Select a date</p>
                  <p className="text-muted-foreground text-sm">
                    Click on a date to view or add reminders
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add Reminder Dialog */}
      <Dialog open={isAddReminderOpen} onOpenChange={setIsAddReminderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Reminder</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddReminderSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="plantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plant</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a plant" />
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
              <FormField
                control={form.control}
                name="reminderType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminder Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reminder type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reminderTypeOptions.map(type => (
                          <SelectItem key={type} value={type}>
                            {reminderTypeLabels[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <div className="grid gap-2">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => isBefore(date, new Date())}
                          className="border rounded-md p-3"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes"
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
                  onClick={() => setIsAddReminderOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createReminderMutation.isPending}
                >
                  {createReminderMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Reminder
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View/Complete Reminder Dialog */}
      {selectedReminder && (
        <Dialog open={isViewReminderOpen} onOpenChange={setIsViewReminderOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reminder Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Plant</h3>
                <p className="text-lg font-semibold mt-1">{getPlantNameById(selectedReminder.plantId)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Task</h3>
                <p className="text-lg font-semibold mt-1">
                  {reminderTypeLabels[selectedReminder.reminderType]}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                <p className="text-lg font-semibold mt-1">
                  {format(new Date(selectedReminder.dueDate), "PPP")}
                </p>
              </div>
              {selectedReminder.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                  <p className="mt-1">{selectedReminder.notes}</p>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="completed"
                    checked={selectedReminder.completed}
                    disabled={selectedReminder.completed || completeReminderMutation.isPending}
                    onCheckedChange={() => {
                      if (!selectedReminder.completed) {
                        completeReminderMutation.mutate(selectedReminder.id);
                      }
                    }}
                  />
                  <label
                    htmlFor="completed"
                    className={`text-sm font-medium ${
                      selectedReminder.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    Mark as completed
                  </label>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setIsViewReminderOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

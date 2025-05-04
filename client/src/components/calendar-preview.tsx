import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Reminder, Plant } from "@shared/schema";
import { format, addDays, startOfWeek, isEqual } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarPreviewProps {
  reminders?: Reminder[];
  isLoading: boolean;
}

export default function CalendarPreview({ reminders, isLoading }: CalendarPreviewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  
  // Fetch plants to get names
  const { data: plants } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });

  // Create array of dates for the week
  useEffect(() => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    setWeekDays(days);
  }, [currentWeekStart]);

  // Navigate to previous week
  const previousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  // Navigate to next week
  const nextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  // Check if a day has watering tasks
  const hasWateringTasks = (date: Date) => {
    return reminders?.some(reminder => 
      reminder.reminderType === 'watering' && 
      isEqual(
        new Date(new Date(reminder.dueDate).setHours(0, 0, 0, 0)),
        new Date(date.setHours(0, 0, 0, 0))
      )
    );
  };

  // Check if a day has fertilizing tasks
  const hasFertilizingTasks = (date: Date) => {
    return reminders?.some(reminder => 
      reminder.reminderType === 'fertilizing' && 
      isEqual(
        new Date(new Date(reminder.dueDate).setHours(0, 0, 0, 0)),
        new Date(date.setHours(0, 0, 0, 0))
      )
    );
  };

  // Check if a day has other tasks (not watering or fertilizing)
  const hasOtherTasks = (date: Date) => {
    return reminders?.some(reminder => 
      reminder.reminderType !== 'watering' && 
      reminder.reminderType !== 'fertilizing' && 
      isEqual(
        new Date(new Date(reminder.dueDate).setHours(0, 0, 0, 0)),
        new Date(date.setHours(0, 0, 0, 0))
      )
    );
  };

  // Check if a day is today
  const isToday = (date: Date) => {
    return isEqual(
      new Date(date.setHours(0, 0, 0, 0)),
      new Date(new Date().setHours(0, 0, 0, 0))
    );
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-nunito font-semibold text-foreground">Upcoming Care Schedule</h2>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={previousWeek}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous week</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={nextWeek}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next week</span>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-medium text-muted-foreground">
            {format(weekDays[0] || new Date(), "MMM d")} - {format(weekDays[6] || addDays(new Date(), 6), "MMM d, yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-7 gap-2 mb-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
              <div key={index} className="text-center">
                <p className="text-sm font-nunito font-semibold text-foreground">{day}</p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {isLoading ? (
              Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="calendar-day rounded-lg border border-lightGray p-2 text-center relative">
                  <Skeleton className="h-5 w-5 mx-auto mb-1" />
                  <Skeleton className="h-2 w-2 rounded-full mx-auto" />
                </div>
              ))
            ) : (
              weekDays.map((day, index) => (
                <div 
                  key={index} 
                  className={`
                    calendar-day rounded-lg p-2 text-center relative cursor-pointer
                    ${isToday(new Date(day)) ? 'border-primary bg-green-50' : 'border border-lightGray'}
                  `}
                  onClick={() => window.location.href = `/calendar?date=${format(day, 'yyyy-MM-dd')}`}
                >
                  <p className="text-sm font-medium mb-1">{format(day, "d")}</p>
                  <div className="flex flex-col items-center gap-1">
                    {hasWateringTasks(new Date(day)) && (
                      <div className="h-2 w-2 bg-primary rounded-full" title="Watering task" />
                    )}
                    {hasFertilizingTasks(new Date(day)) && (
                      <div className="h-2 w-2 bg-accent rounded-full" title="Fertilizing task" />
                    )}
                    {hasOtherTasks(new Date(day)) && (
                      <div className="h-2 w-2 bg-muted-foreground rounded-full" title="Other care task" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {!isLoading && (
            <div className="mt-4 text-right">
              <Button variant="link" className="text-primary p-0 h-auto" asChild>
                <Link href="/calendar">
                  Full Calendar
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

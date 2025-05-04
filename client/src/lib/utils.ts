import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return `Today, ${format(dateObj, "h:mm a")}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday, ${format(dateObj, "h:mm a")}`;
  }
  
  return format(dateObj, "MMM d, yyyy");
}

export function formatDateRelative(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export const lightNeedsLabels: Record<string, string> = {
  "low": "Low light",
  "medium": "Medium light",
  "bright-indirect": "Bright indirect",
  "full-sun": "Full sun"
};

export const activityTypeIcons: Record<string, string> = {
  "watering": "drop",
  "fertilizing": "seedling",
  "pruning": "scissors",
  "repotting": "flower",
  "misting": "droplets"
};

export const reminderTypeLabels: Record<string, string> = {
  "watering": "Water",
  "fertilizing": "Fertilize",
  "pruning": "Prune",
  "repotting": "Repot",
  "other": "Check on"
};

export const reminderTypeIcons: Record<string, string> = {
  "watering": "drop",
  "fertilizing": "seedling",
  "pruning": "scissors",
  "repotting": "flower",
  "other": "check"
};

// Generate a placeholder image URL for plants that don't have images
export function getPlantPlaceholderImage(id: number): string {
  const placeholders = [
    "https://images.unsplash.com/photo-1463154545680-d59320fd685d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1637967886160-fd761aac0906?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1622638100769-b45676aa4b3a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1586188261134-f7b62097807a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1682078149506-ef851ab45c8e?auto=format&fit=crop&w=800&q=80",
  ];
  
  return placeholders[id % placeholders.length];
}

// Calculate watering status
export function getWateringStatus(plant: { lastWatered: Date | null, waterFrequency: number }) {
  if (!plant.lastWatered) return "unknown";
  
  const lastWateredDate = new Date(plant.lastWatered);
  const currentDate = new Date();
  const diffDays = Math.floor((currentDate.getTime() - lastWateredDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays >= plant.waterFrequency + 2) {
    return "overdue";
  } else if (diffDays >= plant.waterFrequency) {
    return "due";
  } else if (diffDays >= plant.waterFrequency - 1) {
    return "soon";
  } else {
    return "ok";
  }
}

export function getWateringStatusColor(status: string) {
  switch(status) {
    case "overdue": return "text-destructive";
    case "due": return "text-amber-500";
    case "soon": return "text-blue-500";
    case "ok": return "text-primary";
    default: return "text-gray-400";
  }
}

export function mapWateringStatusToIcon(status: string) {
  switch(status) {
    case "overdue": return "water-off";
    case "due":
    case "soon": return "droplet";
    case "ok": return "droplets";
    default: return "help-circle";
  }
}

import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  supabase_auth_id: text("supabase_auth_id").unique().notNull(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  supabase_auth_id: true,
});

// Credentials for login
export const LoginCredentialsSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password cannot be empty" }),
});
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;

// Credentials for registration
export const RegisterCredentialsSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});
export type RegisterCredentials = z.infer<typeof RegisterCredentialsSchema>;

// Plant table
export const plants = pgTable("plants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  species: text("species"),
  imageUrl: text("image_url"),
  waterFrequency: integer("water_frequency").notNull(), // in days
  lightNeeds: text("light_needs").notNull(),
  careNotes: text("care_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  lastWatered: timestamp("last_watered"),
});

export const insertPlantSchema = createInsertSchema(plants).pick({
  userId: true,
  name: true,
  species: true,
  imageUrl: true,
  waterFrequency: true,
  lightNeeds: true,
  careNotes: true,
});

// Care log for tracking plant activities
export const careLogs = pgTable("care_logs", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id").notNull(),
  userId: integer("user_id").notNull(),
  activityType: text("activity_type").notNull(), // watering, fertilizing, pruning, etc.
  notes: text("notes"),
  performedAt: timestamp("performed_at").defaultNow(),
});

export const insertCareLogSchema = createInsertSchema(careLogs).pick({
  plantId: true,
  userId: true,
  activityType: true,
  notes: true,
});

// Reminders for plant care
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id").notNull(),
  userId: integer("user_id").notNull(),
  reminderType: text("reminder_type").notNull(), // watering, fertilizing, etc.
  dueDate: timestamp("due_date").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertReminderSchema = createInsertSchema(reminders).pick({
  plantId: true,
  userId: true,
  reminderType: true,
  dueDate: true,
});

// AI recommendations
export const aiRecommendations = pgTable("ai_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  plantId: integer("plant_id"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  read: boolean("read").default(false),
});

export const insertAiRecommendationSchema = createInsertSchema(aiRecommendations, {
  // if you need to override any zod types, you can do it here
  // e.g. tags: z.array(z.string()).nonempty(),
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  read: true // 'read' defaults to false, so not typically part of an initial insert
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof insertUserSchema._input; 

export type Plant = typeof plants.$inferSelect;
export type InsertPlant = typeof insertPlantSchema._input; 

export type CareLog = typeof careLogs.$inferSelect;
export type InsertCareLog = typeof insertCareLogSchema._input; 

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof insertReminderSchema._input; 

export type AiRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAiRecommendation = z.infer<typeof insertAiRecommendationSchema>; 

// Enums for frontend type safety
export const lightNeedsOptions = ["low", "medium", "bright-indirect", "full-sun"] as const;
export const activityTypeOptions = ["watering", "fertilizing", "pruning", "repotting", "misting"] as const;
export const reminderTypeOptions = ["watering", "fertilizing", "pruning", "repotting", "other"] as const;

export type LightNeeds = typeof lightNeedsOptions[number];
export type ActivityType = typeof activityTypeOptions[number];
export type ReminderType = typeof reminderTypeOptions[number];
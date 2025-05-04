import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
});

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
  read: boolean("read").default(false),
});

export const insertAiRecommendationSchema = createInsertSchema(aiRecommendations).pick({
  userId: true,
  plantId: true,
  title: true,
  content: true,
  tags: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Plant = typeof plants.$inferSelect;
export type InsertPlant = z.infer<typeof insertPlantSchema>;

export type CareLog = typeof careLogs.$inferSelect;
export type InsertCareLog = z.infer<typeof insertCareLogSchema>;

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;

export type AiRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAiRecommendation = z.infer<typeof insertAiRecommendationSchema>;

// Enums for frontend type safety
export const lightNeedsOptions = ["low", "medium", "bright-indirect", "full-sun"] as const;
export const activityTypeOptions = ["watering", "fertilizing", "pruning", "repotting", "misting"] as const;
export const reminderTypeOptions = ["watering", "fertilizing", "pruning", "repotting", "other"] as const;

export type LightNeeds = typeof lightNeedsOptions[number];
export type ActivityType = typeof activityTypeOptions[number];
export type ReminderType = typeof reminderTypeOptions[number];

import { db } from './auth'; // Assuming db (Drizzle instance) is exported from auth.ts
import * as schema from '@shared/schema';
import { eq, and, desc, isNull } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

export const storage = {
  // User operations (primarily for auth to fetch user, but could be expanded)
  async getUserBySupabaseId(supabaseId: string): Promise<schema.User | null> {
    const users = await db.select().from(schema.users).where(eq(schema.users.supabase_auth_id, supabaseId)).limit(1);
    return users[0] || null;
  },

  // Plant operations
  async getPlantsByUserId(userId: number): Promise<schema.Plant[]> {
    return db.select().from(schema.plants).where(eq(schema.plants.userId, userId)).orderBy(desc(schema.plants.createdAt));
  },

  async getPlant(plantId: number): Promise<schema.Plant | null> {
    const plants = await db.select().from(schema.plants).where(eq(schema.plants.id, plantId)).limit(1);
    return plants[0] || null;
  },

  async createPlant(plantData: schema.InsertPlant): Promise<schema.Plant> {
    const newPlants = await db.insert(schema.plants).values(plantData).returning();
    return newPlants[0];
  },

  async updatePlant(plantId: number, plantData: Partial<schema.InsertPlant>): Promise<schema.Plant | null> {
    // Ensure userId is not accidentally updated if present in plantData
    const { userId, ...updateData } = plantData as any; 
    const updatedPlants = await db.update(schema.plants).set(updateData).where(eq(schema.plants.id, plantId)).returning();
    return updatedPlants[0] || null;
  },

  async deletePlant(plantId: number): Promise<boolean> {
    const result = await db.delete(schema.plants).where(eq(schema.plants.id, plantId)).returning({ id: schema.plants.id });
    return result.length > 0;
  },

  // CareLog operations
  async getCareLogsByPlantId(plantId: number): Promise<schema.CareLog[]> {
    return db.select().from(schema.careLogs).where(eq(schema.careLogs.plantId, plantId)).orderBy(desc(schema.careLogs.performedAt));
  },
  
  async getCareLogById(logId: number): Promise<schema.CareLog | null> {
    const logs = await db.select().from(schema.careLogs).where(eq(schema.careLogs.id, logId)).limit(1);
    return logs[0] || null;
  },

  async createCareLog(logData: schema.InsertCareLog): Promise<schema.CareLog> {
    const newLogs = await db.insert(schema.careLogs).values(logData).returning();
    return newLogs[0];
  },

  async updateCareLog(logId: number, logData: Partial<schema.InsertCareLog>): Promise<schema.CareLog | null> {
    const { userId, plantId, ...updateData } = logData as any; // Prevent accidental update of foreign keys
    const updatedLogs = await db.update(schema.careLogs).set(updateData).where(eq(schema.careLogs.id, logId)).returning();
    return updatedLogs[0] || null;
  },

  async deleteCareLog(logId: number): Promise<boolean> {
    const result = await db.delete(schema.careLogs).where(eq(schema.careLogs.id, logId)).returning({ id: schema.careLogs.id });
    return result.length > 0;
  },

  // Reminder operations
  async getRemindersByPlantId(plantId: number): Promise<schema.Reminder[]> {
    return db.select().from(schema.reminders).where(eq(schema.reminders.plantId, plantId)).orderBy(schema.reminders.dueDate);
  },
  
  async getRemindersByUserId(userId: number): Promise<schema.Reminder[]> {
    // This requires a join if reminders don't directly have userId, or if you only want reminders for user's plants
    // Assuming reminders have userId as per schema for simplicity in routes.ts
    // If schema.reminders.userId exists:
     return db.select().from(schema.reminders).where(eq(schema.reminders.userId, userId)).orderBy(schema.reminders.dueDate);
    // If not, and you need to join through plants:
    // const plantAlias = alias(schema.plants, 'p');
    // return db.selectDistinctOn([schema.reminders.id], { ...schema.reminders })
    //   .from(schema.reminders)
    //   .innerJoin(plantAlias, eq(schema.reminders.plantId, plantAlias.id))
    //   .where(eq(plantAlias.userId, userId))
    //   .orderBy(schema.reminders.dueDate);
  },

  async getReminderById(reminderId: number): Promise<schema.Reminder | null> {
    const reminders = await db.select().from(schema.reminders).where(eq(schema.reminders.id, reminderId)).limit(1);
    return reminders[0] || null;
  },

  async createReminder(reminderData: schema.InsertReminder): Promise<schema.Reminder> {
    const newReminders = await db.insert(schema.reminders).values(reminderData).returning();
    return newReminders[0];
  },

  async updateReminder(reminderId: number, reminderData: Partial<schema.InsertReminder>): Promise<schema.Reminder | null> {
    const { userId, plantId, ...updateData } = reminderData as any; // Prevent accidental update of foreign keys
    const updatedReminders = await db.update(schema.reminders).set(updateData).where(eq(schema.reminders.id, reminderId)).returning();
    return updatedReminders[0] || null;
  },

  async deleteReminder(reminderId: number): Promise<boolean> {
    const result = await db.delete(schema.reminders).where(eq(schema.reminders.id, reminderId)).returning({ id: schema.reminders.id });
    return result.length > 0;
  },

  // AI Recommendation operations
  async getAiRecommendationsByPlantId(plantId: number): Promise<schema.AiRecommendation[]> {
    return db.select().from(schema.aiRecommendations).where(eq(schema.aiRecommendations.plantId, plantId)).orderBy(desc(schema.aiRecommendations.createdAt));
  },
  
  async getAiRecommendationsByUserId(userId: number): Promise<schema.AiRecommendation[]> {
    return db.select().from(schema.aiRecommendations).where(eq(schema.aiRecommendations.userId, userId)).orderBy(desc(schema.aiRecommendations.createdAt));
  },

  async getAiRecommendationById(recommendationId: number): Promise<schema.AiRecommendation | null> {
    const recommendations = await db.select().from(schema.aiRecommendations).where(eq(schema.aiRecommendations.id, recommendationId)).limit(1);
    return recommendations[0] || null;
  },

  async createAiRecommendation(recommendationData: schema.InsertAiRecommendation): Promise<schema.AiRecommendation> {
    // Explicitly parse to ensure conformity and catch errors early
    const validatedData = schema.insertAiRecommendationSchema.parse(recommendationData);
    const newRecommendations = await db.insert(schema.aiRecommendations).values(validatedData).returning();
    return newRecommendations[0];
  },

  async updateAiRecommendationReadStatus(recommendationId: number, isRead: boolean): Promise<schema.AiRecommendation | null> {
    const updatedRecommendations = await db.update(schema.aiRecommendations)
      .set({ read: isRead })
      .where(eq(schema.aiRecommendations.id, recommendationId))
      .returning();
    return updatedRecommendations[0] || null;
  },

  async deleteAiRecommendation(recommendationId: number): Promise<boolean> {
    const result = await db.delete(schema.aiRecommendations).where(eq(schema.aiRecommendations.id, recommendationId)).returning({ id: schema.aiRecommendations.id });
    return result.length > 0;
  },
  
  // UserSettings Operations (assuming schema.userSettings exists)
  // NB: The following UserSettings functions are commented out because schema.userSettings 
  // and schema.insertUserSettingSchema are not yet defined in shared/schema.ts.
  // Please define them in your schema and uncomment these functions when ready.
  /*
  async getUserSettings(userId: number): Promise<schema.UserSetting | null> {
    // Check if userSettings table exists in your schema.ts, if not, this will fail.
    // Example: export const userSettings = pgTable("user_settings", { userId: integer('user_id').primaryKey().references(() => users.id), ... });
    if (!schema.userSettings) {
        console.warn('schema.userSettings is not defined. Skipping getUserSettings.');
        return null;
    }
    const settings = await db.select().from(schema.userSettings).where(eq(schema.userSettings.userId, userId)).limit(1);
    return settings[0] || null;
  },

  async updateUserSettings(userId: number, settingsData: Partial<schema.InsertUserSetting>): Promise<schema.UserSetting | null> {
    if (!schema.userSettings || !schema.insertUserSettingSchema) { // Also check for insert schema if you have one
        console.warn('schema.userSettings or its insert schema is not defined. Skipping updateUserSettings.');
        return null;
    }
    // Upsert logic: Update if exists, insert if not.
    const existingSettings = await this.getUserSettings(userId);
    if (existingSettings) {
      const updatedSettings = await db.update(schema.userSettings).set(settingsData).where(eq(schema.userSettings.userId, userId)).returning();
      return updatedSettings[0] || null;
    } else {
      // Ensure all required fields for an insert are present or have defaults
      const fullSettingsData = { ...settingsData, userId } as schema.InsertUserSetting; // Cast might be needed if types don't align perfectly
      const newSettings = await db.insert(schema.userSettings).values(fullSettingsData).returning();
      return newSettings[0] || null;
    }
  }
  */
};

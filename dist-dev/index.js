var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express2 from "express";
import session from "express-session";

// server/routes.ts
import { createServer } from "http";

// server/auth.ts
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  LoginCredentialsSchema: () => LoginCredentialsSchema,
  RegisterCredentialsSchema: () => RegisterCredentialsSchema,
  activityTypeOptions: () => activityTypeOptions,
  aiRecommendations: () => aiRecommendations,
  careLogs: () => careLogs,
  insertAiRecommendationSchema: () => insertAiRecommendationSchema,
  insertCareLogSchema: () => insertCareLogSchema,
  insertPlantSchema: () => insertPlantSchema,
  insertReminderSchema: () => insertReminderSchema,
  insertUserSchema: () => insertUserSchema,
  lightNeedsOptions: () => lightNeedsOptions,
  plants: () => plants,
  reminderTypeOptions: () => reminderTypeOptions,
  reminders: () => reminders,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  supabase_auth_id: text("supabase_auth_id").unique().notNull(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  supabase_auth_id: true
});
var LoginCredentialsSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password cannot be empty" })
});
var RegisterCredentialsSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" })
});
var plants = pgTable("plants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  species: text("species"),
  imageUrl: text("image_url"),
  waterFrequency: integer("water_frequency").notNull(),
  // in days
  lightNeeds: text("light_needs").notNull(),
  careNotes: text("care_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  lastWatered: timestamp("last_watered")
});
var insertPlantSchema = createInsertSchema(plants).pick({
  userId: true,
  name: true,
  species: true,
  imageUrl: true,
  waterFrequency: true,
  lightNeeds: true,
  careNotes: true
});
var careLogs = pgTable("care_logs", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id").notNull(),
  userId: integer("user_id").notNull(),
  activityType: text("activity_type").notNull(),
  // watering, fertilizing, pruning, etc.
  notes: text("notes"),
  performedAt: timestamp("performed_at").defaultNow()
});
var insertCareLogSchema = createInsertSchema(careLogs).pick({
  plantId: true,
  userId: true,
  activityType: true,
  notes: true
});
var reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id").notNull(),
  userId: integer("user_id").notNull(),
  reminderType: text("reminder_type").notNull(),
  // watering, fertilizing, etc.
  dueDate: timestamp("due_date").notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at")
});
var insertReminderSchema = createInsertSchema(reminders).pick({
  plantId: true,
  userId: true,
  reminderType: true,
  dueDate: true
});
var aiRecommendations = pgTable("ai_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  plantId: integer("plant_id"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()),
  read: boolean("read").default(false)
});
var insertAiRecommendationSchema = createInsertSchema(aiRecommendations, {
  // if you need to override any zod types, you can do it here
  // e.g. tags: z.array(z.string()).nonempty(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  read: true
  // 'read' defaults to false, so not typically part of an initial insert
});
var lightNeedsOptions = ["low", "medium", "bright-indirect", "full-sun"];
var activityTypeOptions = ["watering", "fertilizing", "pruning", "repotting", "misting"];
var reminderTypeOptions = ["watering", "fertilizing", "pruning", "repotting", "other"];

// server/auth.ts
import { eq } from "drizzle-orm";
var { Pool } = pg;
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
var databaseUrl = process.env.DATABASE_URL;
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Server-side Supabase URL or Anon Key is missing from environment variables.");
}
if (!databaseUrl) {
  console.error("DATABASE_URL is missing from environment variables for Drizzle.");
}
var supabase;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.error("Supabase client could not be initialized on the server.");
  supabase = {};
}
var db;
if (databaseUrl) {
  const pool = new Pool({
    connectionString: databaseUrl
  });
  db = drizzle(pool, { schema: schema_exports });
} else {
  console.error("Drizzle client could not be initialized on the server.");
  db = {};
}
var authMiddleware = async (req, res, next) => {
  console.log("[AuthMiddleware] Entered. Path:", req.path);
  if (!supabase || Object.keys(supabase).length === 0) {
    console.error("[AuthMiddleware] Supabase client not available.");
    return res.status(500).json({ message: "Authentication service not configured." });
  }
  if (!db || Object.keys(db).length === 0) {
    console.error("[AuthMiddleware] Database client not available.");
    return res.status(500).json({ message: "Database service not configured." });
  }
  const authHeader = req.headers.authorization;
  console.log("[AuthMiddleware] Auth header:", authHeader ? authHeader.substring(0, 15) + "..." : "Not present");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("[AuthMiddleware] No Bearer token. Proceeding as unauthenticated.");
    return next();
  }
  const token = authHeader.split(" ")[1];
  console.log("[AuthMiddleware] Token extracted.");
  try {
    console.log("[AuthMiddleware] Attempting supabase.auth.getUser(token)...");
    const { data: { user: supabaseUser }, error: supabaseError } = await supabase.auth.getUser(token);
    if (supabaseError) {
      console.warn("[AuthMiddleware] Supabase token validation error:", supabaseError.message);
      return next();
    }
    if (!supabaseUser) {
      console.warn("[AuthMiddleware] Supabase token valid, but no user returned by Supabase.");
      return next();
    }
    console.log(`[AuthMiddleware] Supabase user successfully retrieved: ${supabaseUser.id}, Email: ${supabaseUser.email}`);
    console.log(`[AuthMiddleware] Looking for application user with supabase_auth_id: ${supabaseUser.id}`);
    const appUsers = await db.select().from(users).where(eq(users.supabase_auth_id, supabaseUser.id)).limit(1);
    if (appUsers.length > 0) {
      req.user = appUsers[0];
      console.log(`[AuthMiddleware] Found existing application user: ${req.user.username} (ID: ${req.user.id}). Setting req.user.`);
    } else {
      console.log(`[AuthMiddleware] Application user not found for Supabase ID: ${supabaseUser.id}. Checking by email and potentially auto-creating.`);
      if (supabaseUser.email) {
        console.log(`[AuthMiddleware] Attempting to find user by email: ${supabaseUser.email}`);
        const usersByEmail = await db.select().from(users).where(eq(users.email, supabaseUser.email)).limit(1);
        if (usersByEmail.length > 0) {
          const existingUser = usersByEmail[0];
          console.log(`[AuthMiddleware] Found existing user by email: ${existingUser.username} (ID: ${existingUser.id}). Linking Supabase ID.`);
          const updatedUsers = await db.update(users).set({ supabase_auth_id: supabaseUser.id }).where(eq(users.id, existingUser.id)).returning();
          if (updatedUsers.length > 0) {
            req.user = updatedUsers[0];
            console.log(`[AuthMiddleware] Successfully linked Supabase ID ${supabaseUser.id} to user ${req.user.username}. Setting req.user.`);
          } else {
            console.error(`[AuthMiddleware] Failed to update supabase_auth_id for user ID ${existingUser.id}.`);
          }
        } else {
          console.log(`[AuthMiddleware] No user found with email ${supabaseUser.email}. Proceeding to create new user.`);
          await createNewApplicationUser(db, supabaseUser, req);
        }
      } else {
        console.warn("[AuthMiddleware] Supabase user has no email. Cannot check by email, proceeding to create new user based on Supabase ID only.");
        await createNewApplicationUser(db, supabaseUser, req);
      }
    }
    console.log("[AuthMiddleware] Proceeding to next middleware/route. req.user is currently:", req.user ? { id: req.user.id, username: req.user.username } : void 0);
    next();
  } catch (error) {
    console.error("[AuthMiddleware] Unexpected error:", error);
    next(error);
  }
};
async function createNewApplicationUser(db2, supabaseUser, req) {
  try {
    let newUsername = supabaseUser.email ? supabaseUser.email.split("@")[0] : `user_${supabaseUser.id.substring(0, 8)}`;
    console.log(`[AuthMiddleware-Create] Generated initial username: ${newUsername}`);
    const newUserPayload = {
      supabase_auth_id: supabaseUser.id,
      username: newUsername
    };
    if (supabaseUser.email) {
      newUserPayload.email = supabaseUser.email;
    }
    console.log(`[AuthMiddleware-Create] Checking if username '${newUserPayload.username}' exists.`);
    let usernameExists = await db2.select().from(users).where(eq(users.username, newUserPayload.username)).limit(1);
    if (usernameExists.length > 0) {
      const randomSuffix = Math.random().toString(36).substring(2, 7);
      newUserPayload.username = `${newUserPayload.username}_${randomSuffix}`;
      console.warn(`[AuthMiddleware-Create] Generated username ${newUsername} already exists. Appended suffix, new username: ${newUserPayload.username}`);
    }
    console.log("[AuthMiddleware-Create] Attempting to insert new user with payload:", newUserPayload);
    const createdUsers = await db2.insert(users).values(newUserPayload).returning();
    if (createdUsers.length > 0) {
      req.user = createdUsers[0];
      console.log(`[AuthMiddleware-Create] Successfully created and set application user: ${req.user.username} (ID: ${req.user.id}). Setting req.user.`);
    } else {
      console.error(`[AuthMiddleware-Create] Failed to create application user for Supabase ID: ${supabaseUser.id} after insert returned empty.`);
    }
  } catch (insertError) {
    console.error(`[AuthMiddleware-Create] Error auto-creating user for Supabase ID ${supabaseUser.id}:`, insertError);
  }
}
function setupAuth(app2) {
  app2.use(authMiddleware);
}

// server/storage.ts
import { eq as eq2, desc } from "drizzle-orm";
var storage = {
  // User operations (primarily for auth to fetch user, but could be expanded)
  async getUserBySupabaseId(supabaseId) {
    const users2 = await db.select().from(users).where(eq2(users.supabase_auth_id, supabaseId)).limit(1);
    return users2[0] || null;
  },
  // Plant operations
  async getPlantsByUserId(userId) {
    return db.select().from(plants).where(eq2(plants.userId, userId)).orderBy(desc(plants.createdAt));
  },
  async getPlant(plantId) {
    const plants2 = await db.select().from(plants).where(eq2(plants.id, plantId)).limit(1);
    return plants2[0] || null;
  },
  async createPlant(plantData) {
    const newPlants = await db.insert(plants).values(plantData).returning();
    return newPlants[0];
  },
  async updatePlant(plantId, plantData) {
    const { userId, ...updateData } = plantData;
    const updatedPlants = await db.update(plants).set(updateData).where(eq2(plants.id, plantId)).returning();
    return updatedPlants[0] || null;
  },
  async deletePlant(plantId) {
    const result = await db.delete(plants).where(eq2(plants.id, plantId)).returning({ id: plants.id });
    return result.length > 0;
  },
  // CareLog operations
  async getCareLogsByPlantId(plantId) {
    return db.select().from(careLogs).where(eq2(careLogs.plantId, plantId)).orderBy(desc(careLogs.performedAt));
  },
  async getCareLogById(logId) {
    const logs = await db.select().from(careLogs).where(eq2(careLogs.id, logId)).limit(1);
    return logs[0] || null;
  },
  async createCareLog(logData) {
    const newLogs = await db.insert(careLogs).values(logData).returning();
    return newLogs[0];
  },
  async updateCareLog(logId, logData) {
    const { userId, plantId, ...updateData } = logData;
    const updatedLogs = await db.update(careLogs).set(updateData).where(eq2(careLogs.id, logId)).returning();
    return updatedLogs[0] || null;
  },
  async deleteCareLog(logId) {
    const result = await db.delete(careLogs).where(eq2(careLogs.id, logId)).returning({ id: careLogs.id });
    return result.length > 0;
  },
  // Reminder operations
  async getRemindersByPlantId(plantId) {
    return db.select().from(reminders).where(eq2(reminders.plantId, plantId)).orderBy(reminders.dueDate);
  },
  async getRemindersByUserId(userId) {
    return db.select().from(reminders).where(eq2(reminders.userId, userId)).orderBy(reminders.dueDate);
  },
  async getReminderById(reminderId) {
    const reminders2 = await db.select().from(reminders).where(eq2(reminders.id, reminderId)).limit(1);
    return reminders2[0] || null;
  },
  async createReminder(reminderData) {
    const newReminders = await db.insert(reminders).values(reminderData).returning();
    return newReminders[0];
  },
  async updateReminder(reminderId, reminderData) {
    const { userId, plantId, ...updateData } = reminderData;
    const updatedReminders = await db.update(reminders).set(updateData).where(eq2(reminders.id, reminderId)).returning();
    return updatedReminders[0] || null;
  },
  async deleteReminder(reminderId) {
    const result = await db.delete(reminders).where(eq2(reminders.id, reminderId)).returning({ id: reminders.id });
    return result.length > 0;
  },
  // AI Recommendation operations
  async getAiRecommendationsByPlantId(plantId) {
    return db.select().from(aiRecommendations).where(eq2(aiRecommendations.plantId, plantId)).orderBy(desc(aiRecommendations.createdAt));
  },
  async getAiRecommendationsByUserId(userId) {
    return db.select().from(aiRecommendations).where(eq2(aiRecommendations.userId, userId)).orderBy(desc(aiRecommendations.createdAt));
  },
  async getAiRecommendationById(recommendationId) {
    const recommendations = await db.select().from(aiRecommendations).where(eq2(aiRecommendations.id, recommendationId)).limit(1);
    return recommendations[0] || null;
  },
  async createAiRecommendation(recommendationData) {
    const validatedData = insertAiRecommendationSchema.parse(recommendationData);
    const newRecommendations = await db.insert(aiRecommendations).values(validatedData).returning();
    return newRecommendations[0];
  },
  async updateAiRecommendationReadStatus(recommendationId, isRead) {
    const updatedRecommendations = await db.update(aiRecommendations).set({ read: isRead }).where(eq2(aiRecommendations.id, recommendationId)).returning();
    return updatedRecommendations[0] || null;
  },
  async deleteAiRecommendation(recommendationId) {
    const result = await db.delete(aiRecommendations).where(eq2(aiRecommendations.id, recommendationId)).returning({ id: aiRecommendations.id });
    return result.length > 0;
  }
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

// server/perplexity.ts
var plantCareDatabase = {
  default: {
    content: `
# General Plant Care Guide

## Watering
- Most houseplants prefer to dry out slightly between waterings
- Check the top 1-2 inches of soil; water when dry
- Reduce watering in winter, increase in summer
- Use room temperature water to avoid shocking roots

## Light
- Most houseplants prefer bright, indirect light
- Avoid direct sunlight which can scorch leaves
- Rotate plants regularly to ensure even growth
- Signs of insufficient light: leggy growth, small leaves
- Signs of too much light: scorched leaves, dry soil

## Soil & Fertilizing
- Use well-draining potting mix appropriate for your plant type
- Fertilize during growing season (spring-summer) only
- Dilute fertilizer to half-strength to prevent burning
- Repot when plant becomes root-bound (usually every 1-2 years)

## Common Issues
- Yellow leaves: Usually indicates overwatering
- Brown leaf tips: Often due to dry air or mineral buildup
- Pests: Check regularly for spider mites, mealybugs, and scale
- Root rot: Caused by overwatering, repot in fresh soil if caught early

## Seasonal Care
- Reduce watering and stop fertilizing in winter
- Increase humidity around plants in winter if using indoor heating
- Clean leaves regularly to remove dust and help plants photosynthesize
- Use a humidifier or pebble tray for tropical plants
`,
    tags: ["watering", "light", "fertilizing", "seasonal care", "pests"]
  },
  // Common houseplants
  "monstera": {
    content: `
# Monstera Deliciosa Care Guide

## Watering
- Allow the top 2-3 inches of soil to dry out between waterings
- Water thoroughly until water flows from drainage holes
- Reduce watering in winter when growth slows
- Water approximately once every 1-2 weeks, adjusting based on conditions

## Light
- Thrives in medium to bright indirect light
- Can tolerate some direct morning sunlight
- Avoid harsh afternoon sun which can burn leaves
- Fenestration (leaf holes) will not develop properly in low light

## Soil & Fertilizing
- Use a well-draining, chunky aroid mix
- Mix in perlite, orchid bark, and charcoal for better drainage
- Fertilize monthly during growing season (spring-summer) with balanced liquid fertilizer
- Do not fertilize in winter when growth is minimal

## Common Issues
- Yellow leaves: Usually indicates overwatering
- Brown leaf edges: Low humidity or inconsistent watering
- Lack of fenestration: Insufficient light or immature plant
- Pests: Check for spider mites and scale, especially under leaves

## Pruning & Support
- Provide a moss pole or trellis for climbing as the plant matures
- Prune to control size and remove damaged leaves
- Can be propagated easily from stem cuttings with nodes

## Humidity & Temperature
- Prefers humidity levels of 60% or higher
- Use a humidifier or pebble tray to increase humidity
- Keep away from cold drafts and maintain temperatures between 65-85\xB0F
`,
    tags: ["watering", "light", "humidity", "propagation", "fertilizing"]
  },
  "pothos": {
    content: `
# Pothos (Epipremnum aureum) Care Guide

## Watering
- Allow soil to dry out halfway before watering
- Very tolerant of inconsistent watering
- More susceptible to overwatering than underwatering
- Water approximately every 1-2 weeks

## Light
- Adaptable to various light conditions
- Grows best in medium to bright indirect light
- Can tolerate low light but growth will be slower
- Variegated varieties need brighter light to maintain patterns

## Soil & Fertilizing
- Use a standard well-draining potting mix
- Fertilize lightly every 2-3 months during growing season
- No need to fertilize in winter
- Repot every 2-3 years or when root-bound

## Common Issues
- Yellow leaves: Typically overwatering
- Brown spots: Often sunburn or cold damage
- Leggy growth: Insufficient light
- Very resilient to pests but occasionally gets mealybugs

## Propagation
- Extremely easy to propagate from stem cuttings
- Can root in water or directly in soil
- Each cutting should have at least one node
- Root development takes 2-4 weeks in water

## Special Notes
- Perfect for beginners due to high tolerance for neglect
- Effective air purifier for indoor spaces
- Toxic to pets if ingested
- Can be trained to climb or trail from hanging baskets
`,
    tags: ["watering", "light", "propagation", "beginner-friendly", "air-purifying"]
  },
  "snake plant": {
    content: `
# Snake Plant (Sansevieria) Care Guide

## Watering
- Very drought tolerant - water only when soil is completely dry
- Water approximately once every 3-6 weeks
- Reduce watering further in winter
- Root rot from overwatering is the most common issue

## Light
- Extremely adaptable to different light conditions
- Can survive in low light but grows best in medium to bright indirect light
- Can tolerate some direct sunlight once acclimated
- Variegated varieties need more light to maintain patterns

## Soil & Fertilizing
- Use well-draining cactus or succulent mix
- Add extra perlite or sand for better drainage
- Fertilize only 2-3 times per year during growing season
- Use half-strength balanced fertilizer

## Common Issues
- Soft, mushy base: Overwatering leading to rot
- Brown tips: Occasionally from fluoride in tap water
- Wrinkled leaves: Underwatering (rare)
- Rarely affected by pests, but can get spider mites in dry conditions

## Special Features
- Excellent air purifier, removes toxins and releases oxygen at night
- Extremely low maintenance
- Can be divided when root-bound to create new plants
- Long-lived when properly cared for

## Growth Patterns
- Slow-growing but can live for decades
- New leaves emerge from the soil as pointed spears
- Can occasionally produce small, fragrant flowers on mature plants
`,
    tags: ["drought-tolerant", "low-maintenance", "air-purifying", "watering", "light"]
  },
  "fiddle leaf fig": {
    content: `
# Fiddle Leaf Fig (Ficus lyrata) Care Guide

## Watering
- Allow top 2 inches of soil to dry between waterings
- Water thoroughly until it drains from bottom
- Consistent watering schedule is important
- Reduce watering in winter months
- Approximately once every 7-10 days during growing season

## Light
- Requires bright, indirect light
- Can tolerate a few hours of direct morning sun
- Rotate regularly for even growth
- Keep away from hot, direct afternoon sun which can scorch leaves

## Soil & Fertilizing
- Use well-draining, high-quality potting mix
- Add orchid bark or perlite to improve drainage
- Fertilize monthly during growing season (spring-summer)
- Use balanced liquid fertilizer diluted to half strength

## Common Issues
- Brown spots: Usually from overwatering or inconsistent watering
- Leaf drop: Often due to stress from environmental changes
- Yellowing leaves: Typically from overwatering
- Susceptible to root rot if overwatered

## Humidity & Temperature
- Prefers moderate to high humidity (40-60%)
- Keep away from drafts, heaters, and air conditioners
- Maintain temperatures between c. 65-75\xB0F
- Mist leaves occasionally or use a humidifier in dry environments

## Special Notes
- Dislikes being moved and may drop leaves when relocated
- Clean large leaves regularly with a damp cloth to remove dust
- Can grow quite tall (6+ feet) when happy
- New leaves emerge from the top in a reddish sheath
`,
    tags: ["watering", "light", "humidity", "temperamental", "leaf health"]
  },
  "peace lily": {
    content: `
# Peace Lily (Spathiphyllum) Care Guide

## Watering
- Keep soil consistently moist but not soggy
- Water when the top inch of soil feels dry
- Very communicative plant - leaves will droop when thirsty
- Use room temperature water to avoid shocking roots
- Water about once a week, adjusting based on conditions

## Light
- Thrives in medium to low indirect light
- Can tolerate fluorescent lighting, making it perfect for offices
- Too much direct sun will scorch leaves
- Insufficient light will reduce or prevent flowering

## Soil & Fertilizing
- Use rich, well-draining potting mix
- Add organic matter like coco coir for moisture retention
- Fertilize lightly every 6-8 weeks during growing season
- Use balanced houseplant fertilizer at half strength

## Flowers
- Produces distinctive white "flowers" (actually modified leaves called spathes)
- More likely to flower with proper care and sufficient light
- Flowers can last for weeks or months
- Remove spent flowers at the base when they turn green

## Humidity & Air Purification
- Prefers high humidity (50%+)
- Excellent air purifier - removes common household toxins
- Mist regularly or use a pebble tray to increase humidity
- Keep away from cold drafts

## Common Issues
- Brown leaf tips: Usually from tap water minerals or low humidity
- Yellow leaves: Typically from overwatering
- No flowers: Often due to insufficient light
- Very susceptible to spider mites in dry conditions

## Toxicity
- Contains calcium oxalate crystals
- Toxic to pets and humans if ingested
- Can cause irritation to mouth and digestive system
`,
    tags: ["watering", "humidity", "air-purifying", "flowering", "low-light"]
  },
  "zz plant": {
    content: `
# ZZ Plant (Zamioculcas zamiifolia) Care Guide

## Watering
- Extremely drought tolerant thanks to rhizomatous roots
- Allow soil to dry completely between waterings
- Water approximately once every 3-4 weeks
- Reduce further in winter to once every 6-8 weeks
- More likely to die from overwatering than underwatering

## Light
- Highly adaptable to various light conditions
- Grows well in low to bright indirect light
- Avoid direct sunlight which can burn leaves
- One of the best plants for low light conditions
- Growth will be slower in lower light

## Soil & Fertilizing
- Use well-draining potting mix
- Add extra perlite for better drainage
- Fertilize only 2-3 times per year during growing season
- Use balanced houseplant fertilizer at half strength

## Growth Habits
- Slow-growing but very long-lived
- New stems emerge directly from the soil
- Glossy, waxy leaves are naturally shiny without polish
- Can grow to 2-3 feet tall and wide when mature

## Special Features
- Nearly indestructible - perfect for beginners
- Can tolerate neglect for long periods
- Excellent air purifier
- Very rarely affected by pests or diseases

## Propagation
- Can be propagated from leaf cuttings (slow process)
- Division of rhizomes when repotting is more reliable
- Patience required as it's a slow grower

## Toxicity
- Contains calcium oxalate crystals
- Toxic to pets and humans if ingested
- Keep away from children and pets
`,
    tags: ["drought-tolerant", "low-maintenance", "low-light", "air-purifying", "watering"]
  },
  "aloe vera": {
    content: `
# Aloe Vera Care Guide

## Watering
- Water deeply but infrequently
- Allow soil to dry completely between waterings
- Water approximately every 3 weeks, less in winter
- Signs of overwatering: soft, mushy leaves
- Signs of underwatering: thin, curled leaves

## Light
- Prefers bright, indirect light
- Can tolerate some direct sunlight when acclimated
- Insufficient light causes leggy growth
- South or west-facing window is ideal

## Soil & Container
- Use well-draining cactus or succulent mix
- Add extra perlite or pumice for better drainage
- Always use pots with drainage holes
- Terracotta pots are excellent as they absorb excess moisture

## Fertilizing
- Fertilize sparingly - only 2-3 times per year
- Use diluted succulent fertilizer in spring and summer
- Do not fertilize in fall and winter

## Medicinal Properties
- Gel from leaves has soothing properties for minor burns and skin irritations
- Harvest by cutting outer mature leaves at the base
- Split leaf lengthwise to access the gel
- Fresh gel is most effective

## Propagation
- Produces offsets ("pups") around the base
- Carefully separate pups when they're a few inches tall
- Allow cut end to callus for 1-2 days before planting
- Water sparingly until established

## Common Issues
- Brown, mushy roots: Overwatering
- Brown, crispy leaf tips: Underwatering or too much direct sun
- Stretching/leaning: Insufficient light
- Flat, thin leaves: Underwatering
`,
    tags: ["medicinal", "drought-tolerant", "watering", "light", "propagation"]
  },
  "orchid": {
    content: `
# Phalaenopsis Orchid Care Guide

## Watering
- Water only when potting medium is dry
- Run water through the pot for 15-30 seconds
- Allow all water to drain completely
- Never leave standing water in decorative pot
- Water approximately once per week, less in winter

## Light
- Bright, indirect light is essential
- East or shaded west window is ideal
- Leaves should be bright green, not dark
- Yellow leaves may indicate too much light
- No leaf growth may indicate insufficient light

## Growing Medium
- Do not use regular potting soil
- Use specialty orchid bark mix or sphagnum moss
- Needs excellent airflow around roots
- Repot every 1-2 years as medium breaks down

## Humidity & Air Circulation
- Prefers humidity of 50-70%
- Use humidifier or pebble tray to increase humidity
- Good air circulation prevents root rot
- Avoid misting leaves as this can cause fungal issues

## Fertilizing
- "Weekly, weakly" approach - diluted fertilizer frequently
- Use orchid-specific fertilizer at quarter strength
- Do not fertilize when not in active growth
- Flush medium monthly to prevent salt buildup

## Blooming
- Flowers last 2-3 months when cared for properly
- After blooming, cut spike above node for potential reblooming
- Cut at base if spike turns brown
- Typically blooms 1-2 times per year
- Temperature drop at night (10\xB0F) can trigger blooming

## Common Issues
- Wrinkled leaves: Underwatering
- Yellow, soft leaves: Overwatering
- No blooms: Insufficient light or improper temperature range
- Root rot: Visible as brown, mushy roots instead of plump, green ones
`,
    tags: ["watering", "humidity", "flowering", "light", "air circulation"]
  },
  "succulent": {
    content: `
# General Succulent Care Guide

## Watering
- "Soak and dry" method - thorough watering then complete drying
- Allow soil to dry completely between waterings
- Water approximately every 2-3 weeks, much less in winter
- Signs of overwatering: soft, mushy, translucent leaves
- Signs of underwatering: wrinkled, shriveled leaves

## Light
- Most succulents need bright, direct light for at least 6 hours daily
- South or west-facing windows are ideal
- Insufficient light causes etiolation (stretching)
- Some may need protection from intense afternoon sun
- Colorful varieties need more light to maintain vibrant colors

## Soil & Containers
- Use specially formulated succulent/cactus soil
- Add extra perlite, pumice, or coarse sand for better drainage
- Always use pots with drainage holes
- Terracotta pots are excellent as they wick away excess moisture
- Shallow, wide pots often better than deep ones

## Fertilizing
- Fertilize sparingly during growing season (usually spring/summer)
- Use diluted succulent/cactus fertilizer at half strength
- Do not fertilize during dormant periods
- Many succulents need little to no fertilizer

## Propagation
- Most propagate easily from leaves or stem cuttings
- Allow cuttings to callus (dry) for 2-3 days before planting
- Lay leaf cuttings on top of soil, don't bury
- Root development can take weeks to months
- Minimal watering until roots are established

## Seasonal Care
- Many succulents have seasonal growth patterns
- Reduce water significantly in winter
- Protect from frost as most are not cold-hardy
- Watch for signs of dormancy (slowed growth)
- Increase water gradually when active growth resumes

## Common Varieties
- Echeveria: Rosette-forming with powdery coating
- Haworthia: Often striped, tolerates lower light
- Sedum: Trailing or upright, very easy to propagate
- Crassula (Jade): Tree-like growth, thick stems
`,
    tags: ["drought-tolerant", "watering", "light", "propagation", "soil"]
  },
  "fern": {
    content: `
# Fern Care Guide

## Watering
- Keep soil consistently moist but not soggy
- Never allow soil to dry out completely
- Water when top inch of soil begins to feel dry
- Use room temperature water to avoid shock
- Increase watering frequency during hot, dry periods

## Light
- Prefer medium to low indirect light
- Avoid direct sunlight which can scorch fronds
- Too little light causes sparse, slow growth
- North or east-facing windows are ideal
- Can thrive under fluorescent lights

## Humidity
- High humidity is essential (50-70%+)
- Use humidifier for best results
- Pebble trays provide local humidity
- Mist fronds in the morning, not evening
- Grouping plants increases ambient humidity
- Brown, crispy tips indicate insufficient humidity

## Soil & Fertilizing
- Use rich, organic potting mix with good moisture retention
- Add peat moss or coco coir to improve moisture retention
- Fertilize monthly during growing season (spring-summer)
- Use balanced liquid fertilizer at half strength
- Do not fertilize in winter

## Pruning
- Remove damaged or brown fronds at the base
- Trim to shape sparingly
- New fronds unfurl from the center of the plant
- Leave old fronds until completely brown to allow nutrient reabsorption

## Common Types
- Boston Fern: Arching fronds, more tolerant of dry air
- Bird's Nest Fern: Wavy, tongue-like fronds, less demanding
- Maidenhair Fern: Delicate, requires consistent moisture
- Staghorn Fern: Epiphytic, can be mounted on boards
- Button Fern: Compact, withstands drier conditions

## Common Issues
- Brown fronds: Usually from low humidity or inconsistent watering
- Yellowing fronds: Often overwatering or poor drainage
- Pest susceptibility: Check for spider mites in dry conditions
- Sparse growth: Typically from insufficient light
`,
    tags: ["humidity", "watering", "indirect light", "moisture", "tropical"]
  },
  "cactus": {
    content: `
# Cactus Care Guide

## Watering
- Water sparingly - only when soil is completely dry
- During growing season, water approximately every 2-4 weeks
- In winter dormancy, reduce to once every 6-8 weeks or less
- "Soak and dry" method - thorough watering, then complete drying
- Always err on the side of underwatering

## Light
- Most cacti need bright, direct sunlight
- Minimum 4-6 hours of direct sun daily
- South or west-facing windows are ideal
- Rotate regularly for even growth
- Inadequate light causes weak, etiolated growth
- Acclimate gradually to outdoor summer sun to prevent sunburn

## Soil & Containers
- Extremely well-draining soil is essential
- Commercial cactus mix or regular potting soil with 50% added perlite
- Always use pots with drainage holes
- Unglazed terracotta pots are ideal for wicking away moisture
- Choose pots only slightly larger than the plant

## Fertilizing
- Fertilize sparingly during active growth (spring/summer)
- Use cactus-specific fertilizer at half strength
- Never fertilize in winter or when dormant
- Excessive fertilizer can cause weak, unsightly growth

## Seasonal Care
- Most cacti have winter dormancy period
- Reduce water and stop fertilizing during dormancy
- Some may need cooler temperatures to initiate blooming
- Gradually resume normal care when growth continues in spring

## Handling & Safety
- Always use thick gloves or folded newspaper when handling
- Some have nearly invisible glochids (hair-like spines)
- Long tweezers or tongs can help with repotting
- Keep away from children and pets

## Common Issues
- Soft, mushy stems: Almost always from overwatering
- Corky scars: Normal aging process in many species
- Lack of growth: Normal during dormancy or insufficient light
- Shriveling: Underwatering (rare) or root problems
- Pests: Watch for mealybugs and scale insects
`,
    tags: ["drought-tolerant", "light", "watering", "dormancy", "desert plants"]
  },
  "calathea": {
    content: `
# Calathea/Maranta (Prayer Plant) Care Guide

## Watering
- Keep soil consistently moist but not soggy
- Water when top inch of soil begins to dry
- Use only filtered, distilled or rainwater
- Extremely sensitive to fluoride and chlorine in tap water
- Water approximately once per week, adjusting to conditions

## Light
- Bright, indirect light is ideal
- Protect from direct sunlight which can fade patterns
- Too little light causes patterns to fade and reduced leaf movement
- North or east-facing windows work well
- Can tolerate moderate low light but will show reduced growth

## Humidity
- Requires high humidity (60%+)
- Use humidifier for best results
- Pebble trays provide some local humidity
- Regular misting helps but isn't sufficient alone
- Group with other plants to create humid microclimate
- Brown leaf edges indicate insufficient humidity

## Soil & Fertilizing
- Rich, well-draining potting mix
- Add peat moss or coco coir for moisture retention
- Fertilize monthly during growing season only
- Use balanced liquid fertilizer at quarter to half strength
- Flush soil every few months to prevent mineral buildup

## Unique Features
- Nyctinasty - leaves fold up at night (prayer-like movement)
- Vibrant patterns and colors vary by species
- Common varieties: Calathea orbifolia, C. medallion, Maranta leuconeura
- Sensitive to environmental changes and drafts

## Common Issues
- Crispy brown edges: Low humidity or mineral buildup from tap water
- Curling leaves: Underwatering or low humidity
- Yellowing leaves: Overwatering or direct sunlight
- Fading patterns: Too much light or aging leaves
- Spider mites: Common pest, especially in dry conditions
- Leaf not moving/opening: Low light or underwatering
`,
    tags: ["humidity", "leaf pattern", "filtered water", "tropical", "prayer plant"]
  }
};
function getIssueAdvice(issue, plantType) {
  const issueLower = issue.toLowerCase();
  if (issueLower.includes("yellow") && (issueLower.includes("leaf") || issueLower.includes("leaves"))) {
    return `Yellow leaves are most commonly caused by overwatering. Ensure you're allowing the soil to dry appropriately between waterings. Check that your pot has proper drainage and that water isn't collecting in the saucer.
    
Other potential causes include:
- Nutrient deficiency (especially nitrogen)
- Too much direct sunlight
- Pest infestation (check under leaves for insects)
- Natural aging (if only affecting older, lower leaves)

For your specific plant, reduce watering frequency and monitor for improvement over the next 2-3 weeks.`;
  }
  if (issueLower.includes("brown") && (issueLower.includes("tip") || issueLower.includes("edge"))) {
    return `Brown leaf tips or edges most commonly indicate low humidity or inconsistent watering. This is especially common with tropical plants.

Try these solutions:
- Increase humidity around your plant (use a humidifier or pebble tray)
- Use filtered water instead of tap water (minerals in tap water can cause browning)
- Maintain a more consistent watering schedule
- Ensure the plant isn't near heating vents or drafty windows

The existing brown areas won't return to green, but new growth should be healthy once the environment is adjusted.`;
  }
  if (issueLower.includes("drooping") || issueLower.includes("wilting")) {
    return `Drooping or wilting leaves typically indicate either underwatering or overwatering:

If the soil is dry several inches down:
- Your plant needs water immediately
- Consider increasing watering frequency slightly
- Ensure water is penetrating through all the soil, not just running down the sides of the pot

If the soil is still moist:
- You may be overwatering, causing root stress
- Allow the soil to dry out more between waterings
- Check that the pot has proper drainage
- Look for signs of root rot (dark, mushy roots with an unpleasant smell)

Recovery from severe wilting can take time, so be patient after adjusting your care routine.`;
  }
  if (issueLower.includes("spots")) {
    if (issueLower.includes("brown") || issueLower.includes("black")) {
      return `Brown or black spots on leaves can be caused by several issues:

Fungal infection:
- Remove affected leaves
- Improve air circulation around the plant
- Avoid getting water on the leaves when watering
- Consider a fungicide if the problem persists

Bacterial infection:
- Isolate the plant from others
- Remove and dispose of affected leaves
- Avoid misting or overhead watering
- Ensure good air circulation

Sunburn:
- Move plant away from direct, intense sunlight
- Provide filtered light instead

Water spots:
- If spots appear after watering, minerals in your water may be causing damage
- Consider using filtered or distilled water`;
    }
    if (issueLower.includes("white") || issueLower.includes("powder")) {
      return `White spots or powdery substance on leaves typically indicates powdery mildew or a pest infestation:

Powdery mildew (fungal infection):
- Improve air circulation around the plant
- Reduce humidity around the foliage (while maintaining appropriate humidity for the plant type)
- Remove severely affected leaves
- Apply a fungicide specifically formulated for powdery mildew

Pest infestation (likely mealybugs or scale):
- Isolate the plant from others
- Wipe leaves with a cotton swab dipped in 70% isopropyl alcohol
- For serious infestations, treat with insecticidal soap or neem oil
- Repeat treatments weekly until resolved`;
    }
  }
  if (issueLower.includes("stretching") || issueLower.includes("leggy")) {
    return `Stretching or leggy growth almost always indicates insufficient light. Plants naturally grow toward light sources and will become elongated when trying to reach adequate light.

Solutions:
- Move your plant to a brighter location
- Rotate the plant regularly to encourage even growth
- Consider supplemental grow lights if adequate natural light isn't available
- For severely leggy plants, pruning may encourage fuller growth once lighting is corrected

Once in better light, new growth should be more compact, but the stretched portions won't revert to a more compact form.`;
  }
  if (issueLower.includes("pest") || issueLower.includes("bug") || issueLower.includes("insect")) {
    return `For pest infestations, proper identification is key to effective treatment:

Common houseplant pests and treatments:

Spider mites:
- Tiny spider-like pests that cause stippling on leaves; may create fine webbing
- Increase humidity (they prefer dry conditions)
- Spray plants with water to dislodge mites
- Apply insecticidal soap or neem oil

Mealybugs:
- White, cottony insects found in leaf joints and under leaves
- Remove with cotton swab dipped in 70% isopropyl alcohol
- Treat with insecticidal soap or neem oil

Scale:
- Small, brown, shell-like insects that attach to stems and leaves
- Physically remove with fingernail or cotton swab with alcohol
- Treat with horticultural oil

Fungus gnats:
- Small flying insects in the soil
- Allow soil to dry thoroughly between waterings
- Use sticky traps
- Treat soil with BTI (Bacillus thuringiensis israelensis) products

For any pest treatment, repeat applications every 7-10 days for at least three treatments to break the life cycle.`;
  }
  return `For your issue regarding "${issue}", first observe these best practices:

1. Examine the plant thoroughly, including stems, under leaves, and soil surface
2. Consider recent changes in care, location, or environment
3. Document the progression of symptoms with photos
4. Isolate the plant if you suspect pests or disease

General troubleshooting steps:
- Check watering habits (over or under watering is the most common issue)
- Evaluate light conditions
- Inspect for pests
- Consider temperature and humidity levels
- Look for signs of outgrowing current pot

If symptoms worsen or the plant's condition deteriorates rapidly, consider consulting with a local plant specialist or garden center.`;
}
function getDescriptionAdvice(description) {
  const descLower = description.toLowerCase();
  let advice = "";
  if (descLower.includes("window") || descLower.includes("light")) {
    if (descLower.includes("south") || descLower.includes("west")) {
      advice += `You mentioned a south or west-facing location, which typically provides bright or direct light. Monitor your plant for signs of sun stress (scorching or bleaching of leaves) especially during summer months when light is most intense. Consider a sheer curtain to filter the strongest midday and afternoon light.

`;
    } else if (descLower.includes("north") || descLower.includes("east")) {
      advice += `Your north or east-facing location provides gentler light, which works well for many houseplants. If your plant shows signs of stretching toward the light, it may need a brighter spot or rotating regularly.

`;
    } else if (descLower.includes("low light") || descLower.includes("dark")) {
      advice += `You've described a low light environment. Consider low-light tolerant plants like snake plants, ZZ plants, or pothos. Most flowering plants and those with variegated leaves will need brighter conditions to thrive. You might want to consider supplemental grow lights if natural light is limited.

`;
    }
  }
  if (descLower.includes("water") || descLower.includes("moist") || descLower.includes("dry")) {
    if (descLower.includes("forget") || descLower.includes("busy")) {
      advice += `Since you mentioned you sometimes forget to water or have a busy schedule, consider plants that tolerate irregular watering like succulents, ZZ plants, snake plants, or pothos. Setting calendar reminders or using a moisture meter can help establish a better watering routine.

`;
    } else if (descLower.includes("overwater") || descLower.includes("too much water")) {
      advice += `You mentioned concerns about overwatering. Always check that soil is dry to the appropriate depth before watering again. Consider using pots with drainage holes and well-draining soil mixes. A moisture meter can be helpful for those who tend to overwater.

`;
    }
  }
  if (descLower.includes("humid") || descLower.includes("bathroom") || descLower.includes("kitchen")) {
    advice += `Your description indicates a potentially humid environment. Plants like ferns, calatheas, and other tropical varieties would likely thrive in these conditions. If you're growing plants that prefer lower humidity, ensure good air circulation to prevent fungal issues.

`;
  } else if (descLower.includes("dry") || descLower.includes("heat") || descLower.includes("air conditioner")) {
    advice += `Your home environment sounds like it may be on the drier side. Consider using a humidifier or pebble trays for humidity-loving plants. Plants like succulents, cacti, and snake plants will naturally do better in drier conditions.

`;
  }
  if (descLower.includes("cat") || descLower.includes("dog") || descLower.includes("pet")) {
    advice += `You mentioned having pets. It's important to verify that your plants are non-toxic to animals. Some pet-friendly options include spider plants, Boston ferns, areca palms, and calathea varieties. Avoid lilies, pothos, philodendrons, and many other common houseplants that can be toxic if ingested by pets.

`;
  }
  if (advice === "") {
    advice = `Based on your description, continue to observe how your plant responds to its current care routine and environment. Make small adjustments as needed based on your plant's signals (leaf color, growth patterns, soil moisture). Taking progress photos every few weeks can help you track subtle changes in your plant's health and growth.`;
  }
  return advice;
}
function suggestWateringFrequency(plantName, plantSpecies) {
  const normalizedPlantName = plantName.toLowerCase().trim();
  const normalizedSpecies = plantSpecies ? plantSpecies.toLowerCase().trim() : "";
  const defaultFrequency = 7;
  const searchString = `${normalizedPlantName} ${normalizedSpecies}`.toLowerCase();
  if (searchString.includes("monstera") || searchString.includes("deliciosa")) {
    return 7;
  }
  if (searchString.includes("fiddle leaf") || searchString.includes("ficus lyrata")) {
    return 7;
  }
  if (searchString.includes("pothos") || searchString.includes("epipremnum")) {
    return 10;
  }
  if (searchString.includes("snake plant") || searchString.includes("sansevieria")) {
    return 21;
  }
  if (searchString.includes("zz plant") || searchString.includes("zamioculcas")) {
    return 21;
  }
  if (searchString.includes("peace lily") || searchString.includes("spathiphyllum")) {
    return 5;
  }
  if (searchString.includes("orchid") || searchString.includes("phalaenopsis")) {
    return 7;
  }
  if (searchString.includes("aloe") || searchString.includes("cactus") || searchString.includes("succulent") || searchString.includes("haworthia")) {
    return 14;
  }
  if (searchString.includes("fern") || searchString.includes("calathea") || searchString.includes("maranta") || searchString.includes("prayer plant")) {
    return 3;
  }
  return defaultFrequency;
}
function getBasicCareInstructions(plantName, plantSpecies) {
  const normalizedPlantName = plantName.toLowerCase().trim();
  const plantTypes = Object.keys(plantCareDatabase);
  const matchingPlant = plantTypes.find(
    (plant) => normalizedPlantName.includes(plant) || plantSpecies && plantSpecies.toLowerCase().includes(plant)
  );
  if (matchingPlant && matchingPlant !== "default") {
    const plantInfo = plantCareDatabase[matchingPlant];
    const content = plantInfo.content;
    const sections = content.split("##").slice(0, 3).join("##");
    return sections.replace(
      new RegExp(matchingPlant, "gi"),
      plantName
    );
  } else {
    return `
# Care Guide for ${plantName}${plantSpecies ? ` (${plantSpecies})` : ""}

## Watering
- Check the top 1-2 inches of soil; water when dry
- Use room temperature water to avoid shocking roots
- Adjust watering frequency based on season and environment

## Light
- Most houseplants prefer bright, indirect light
- Avoid direct sunlight which can scorch leaves
- Rotate plants regularly to ensure even growth
`;
  }
}
async function getAIRecommendation({
  plantName,
  plantSpecies,
  careIssue,
  plantDescription
}) {
  const normalizedPlantName = plantName.toLowerCase().trim();
  let content = "";
  let tags = [];
  const plantTypes = Object.keys(plantCareDatabase);
  const matchingPlant = plantTypes.find(
    (plant) => normalizedPlantName.includes(plant) || plantSpecies && plantSpecies.toLowerCase().includes(plant)
  );
  if (matchingPlant && matchingPlant !== "default") {
    const plantInfo = plantCareDatabase[matchingPlant];
    content = plantInfo.content;
    tags = plantInfo.tags;
    content = content.replace(
      new RegExp(matchingPlant, "gi"),
      plantName
    );
    if (careIssue) {
      content += `

## Specific Issue: ${careIssue}
`;
      content += getIssueAdvice(careIssue, matchingPlant);
    }
  } else {
    content = plantCareDatabase.default.content;
    tags = plantCareDatabase.default.tags;
    content = `# Care Guide for ${plantName}
` + content.substring(content.indexOf("\n"));
    if (plantSpecies) {
      content = content.replace(
        "# Care Guide",
        `# Care Guide for ${plantName} (${plantSpecies})`
      );
    }
    if (careIssue) {
      content += `

## Specific Issue: ${careIssue}
`;
      content += getIssueAdvice(careIssue);
    }
  }
  if (plantDescription) {
    content += `

## Based on Your Description
`;
    content += `You mentioned: "${plantDescription}"

`;
    content += getDescriptionAdvice(plantDescription);
  }
  content += `

---

This care guide is specifically tailored for your ${plantName}. Adjust recommendations based on your specific growing conditions and observe how your plant responds. Remember that each plant is unique, and care requirements may vary slightly based on your home environment.`;
  return {
    content,
    tags
  };
}

// server/routes.ts
import { z as z2 } from "zod";
var isAuthenticated = (req, res, next) => {
  if (req.user && req.user.id) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
var createBasicReminderBodySchema = z2.object({
  reminderType: z2.string(),
  dueDate: z2.coerce.date()
});
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/auth/me", isAuthenticated, (req, res) => {
    res.json({ data: req.user });
  });
  app2.get("/api/plants", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const plants2 = await storage.getPlantsByUserId(userId);
      res.json(plants2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plants", error });
    }
  });
  app2.get("/api/plants/:id", isAuthenticated, async (req, res) => {
    try {
      const plantId = parseInt(req.params.id, 10);
      if (isNaN(plantId)) {
        return res.status(400).json({ message: "Invalid plant ID format" });
      }
      const plant = await storage.getPlant(plantId);
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      const userId = req.user.id;
      if (plant.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json(plant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plant", error });
    }
  });
  app2.post("/api/plants", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const requestData = { ...req.body, userId };
      if (!requestData.waterFrequency) {
        requestData.waterFrequency = suggestWateringFrequency(
          requestData.name,
          requestData.species
        );
      }
      const validation = insertPlantSchema.safeParse(requestData);
      if (!validation.success) {
        console.error("Plant data validation failed:", validation.error.flatten().fieldErrors);
        return res.status(400).json({
          message: "Invalid plant data",
          errors: validation.error.flatten().fieldErrors
        });
      }
      const plant = await storage.createPlant(validation.data);
      const careInstructions = getBasicCareInstructions(plant.name, plant.species);
      const title = `Care Guide for ${plant.name}`;
      const tags = ["watering", "light", "care", "basic"];
      await storage.createAiRecommendation({
        userId,
        plantId: plant.id,
        title,
        content: careInstructions,
        tags
      });
      res.status(201).json(plant);
    } catch (error) {
      console.error("Error in POST /api/plants:", error);
      res.status(500).json({ message: "Failed to create plant", error });
    }
  });
  app2.put("/api/plants/:id", isAuthenticated, async (req, res) => {
    try {
      const plantId = parseInt(req.params.id, 10);
      if (isNaN(plantId)) {
        return res.status(400).json({ message: "Invalid plant ID format" });
      }
      const plant = await storage.getPlant(plantId);
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      const userId = req.user.id;
      if (plant.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const updatedPlant = await storage.updatePlant(plantId, req.body);
      res.json(updatedPlant);
    } catch (error) {
      res.status(500).json({ message: "Failed to update plant", error });
    }
  });
  app2.delete("/api/plants/:id", isAuthenticated, async (req, res) => {
    try {
      const plantId = parseInt(req.params.id, 10);
      if (isNaN(plantId)) {
        return res.status(400).json({ message: "Invalid plant ID format" });
      }
      const plant = await storage.getPlant(plantId);
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      const userId = req.user.id;
      if (plant.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const deleted = await storage.deletePlant(plantId);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete plant" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete plant", error });
    }
  });
  app2.get("/api/plants/:id/care-logs", isAuthenticated, async (req, res) => {
    try {
      const plantId = parseInt(req.params.id, 10);
      if (isNaN(plantId)) {
        return res.status(400).json({ message: "Invalid plant ID format" });
      }
      const plant = await storage.getPlant(plantId);
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      const userId = req.user.id;
      if (plant.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const careLogs2 = await storage.getCareLogsByPlantId(plantId);
      res.json(careLogs2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch care logs", error });
    }
  });
  app2.post("/api/care-logs", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const validation = insertCareLogSchema.safeParse({ ...req.body, userId });
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid care log data", errors: validation.error.flatten().fieldErrors });
      }
      const plantId = validation.data.plantId;
      const plant = await storage.getPlant(plantId);
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      if (plant.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const careLog = await storage.createCareLog(validation.data);
      res.status(201).json(careLog);
    } catch (error) {
      console.error("Error in POST /api/care-logs:", error);
      res.status(500).json({ message: "Failed to add care log", error });
    }
  });
  app2.put("/api/care-logs/:logId", isAuthenticated, async (req, res) => {
    try {
      const logId = parseInt(req.params.logId, 10);
      if (isNaN(logId)) {
        return res.status(400).json({ message: "Invalid log ID format" });
      }
      const careLog = await storage.getCareLogById(logId);
      if (!careLog) {
        return res.status(404).json({ message: "Care log not found" });
      }
      const userId = req.user.id;
      if (careLog.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const updatedCareLog = await storage.updateCareLog(logId, req.body);
      res.json(updatedCareLog);
    } catch (error) {
      res.status(500).json({ message: "Failed to update care log", error });
    }
  });
  app2.delete("/api/care-logs/:logId", isAuthenticated, async (req, res) => {
    try {
      const logId = parseInt(req.params.logId, 10);
      if (isNaN(logId)) {
        return res.status(400).json({ message: "Invalid log ID format" });
      }
      const careLog = await storage.getCareLogById(logId);
      if (!careLog) {
        return res.status(404).json({ message: "Care log not found" });
      }
      const userId = req.user.id;
      if (careLog.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const deleted = await storage.deleteCareLog(logId);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete care log" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete care log", error });
    }
  });
  app2.get("/api/plants/:id/reminders", isAuthenticated, async (req, res) => {
    try {
      const plantId = parseInt(req.params.id, 10);
      if (isNaN(plantId)) {
        return res.status(400).json({ message: "Invalid plant ID format" });
      }
      const reminders2 = await storage.getRemindersByPlantId(plantId);
      res.json(reminders2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reminders", error });
    }
  });
  app2.post("/api/plants/:plantId/reminders/basic", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const plantIdParams = parseInt(req.params.plantId, 10);
      if (isNaN(plantIdParams)) {
        return res.status(400).json({ message: "Invalid plant ID format" });
      }
      const validation = createBasicReminderBodySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input", errors: validation.error.issues });
      }
      const plant = await storage.getPlant(plantIdParams);
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      if (plant.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      await storage.createReminder({
        userId,
        plantId: plantIdParams,
        reminderType: validation.data.reminderType,
        dueDate: validation.data.dueDate
        // Pass dueDate
      });
      res.status(201).json({ message: "Basic reminder created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create reminder", error });
    }
  });
  app2.post("/api/plants/:plantId/reminders", isAuthenticated, async (req, res) => {
    try {
      const plantId = parseInt(req.params.plantId, 10);
      if (isNaN(plantId)) {
        return res.status(400).json({ message: "Invalid plant ID format" });
      }
      const userId = req.user.id;
      const plant = await storage.getPlant(plantId);
      if (!plant || plant.userId !== userId) {
        return res.status(403).json({ message: "Forbidden or plant not found" });
      }
      const reminderData = { ...req.body, plantId, userId };
      const validation = insertReminderSchema.safeParse(reminderData);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid reminder data", errors: validation.error.flatten().fieldErrors });
      }
      const reminder = await storage.createReminder(validation.data);
      res.status(201).json(reminder);
    } catch (error) {
      res.status(500).json({ message: "Failed to create reminder", error });
    }
  });
  app2.put("/api/reminders/:reminderId", isAuthenticated, async (req, res) => {
    try {
      const reminderId = parseInt(req.params.reminderId, 10);
      if (isNaN(reminderId)) {
        return res.status(400).json({ message: "Invalid reminder ID format" });
      }
      const reminder = await storage.getReminderById(reminderId);
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      const userId = req.user.id;
      if (reminder.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const updatedReminder = await storage.updateReminder(reminderId, req.body);
      res.json(updatedReminder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update reminder", error });
    }
  });
  app2.delete("/api/reminders/:reminderId", isAuthenticated, async (req, res) => {
    try {
      const reminderId = parseInt(req.params.reminderId, 10);
      if (isNaN(reminderId)) {
        return res.status(400).json({ message: "Invalid reminder ID format" });
      }
      const reminder = await storage.getReminderById(reminderId);
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      const userId = req.user.id;
      if (reminder.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const deleted = await storage.deleteReminder(reminderId);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete reminder" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete reminder", error });
    }
  });
  app2.get("/api/ai-recommendations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const recommendations = await storage.getAiRecommendationsByUserId(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error in GET /api/ai-recommendations:", error);
      res.status(500).json({ message: "Failed to fetch AI recommendations", error });
    }
  });
  app2.post("/api/ai-recommendations/generate", isAuthenticated, async (req, res) => {
    try {
      const requestSchema = z2.object({
        plantId: z2.number().optional(),
        plantName: z2.string(),
        plantSpecies: z2.string().optional(),
        careIssue: z2.string().optional(),
        plantDescription: z2.string().optional()
      });
      const validation = requestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request data", errors: validation.error });
      }
      const userId = req.user.id;
      const { plantId, plantName, plantSpecies, careIssue, plantDescription } = validation.data;
      if (plantId) {
        const plant = await storage.getPlant(plantId);
        if (!plant) {
          return res.status(404).json({ message: "Plant not found" });
        }
        if (plant.userId !== userId) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      const aiResponse = await getAIRecommendation({
        plantName,
        plantSpecies,
        careIssue,
        plantDescription
      });
      let title = `Care tips for your ${plantName}`;
      if (careIssue) {
        title = `${plantName}: ${careIssue.slice(0, 1).toUpperCase() + careIssue.slice(1)}`;
      }
      const recommendation = await storage.createAiRecommendation({
        userId,
        plantId,
        title,
        content: aiResponse.content,
        tags: aiResponse.tags
      });
      res.status(201).json(recommendation);
    } catch (error) {
      console.error("AI recommendation error:", error);
      res.status(500).json({ message: "Failed to generate AI recommendation", error });
    }
  });
  app2.delete("/api/ai-recommendations/:id", isAuthenticated, async (req, res) => {
    try {
      const recommendationId = parseInt(req.params.id, 10);
      if (isNaN(recommendationId)) {
        return res.status(400).json({ message: "Invalid recommendation ID format" });
      }
      const userId = req.user.id;
      const recommendation = await storage.getAiRecommendationById(recommendationId);
      if (!recommendation) {
        return res.status(404).json({ message: "Recommendation not found" });
      }
      if (recommendation.userId !== userId) {
        return res.status(404).json({ message: "Recommendation not found or not authorized" });
      }
      const deleted = await storage.deleteAiRecommendation(recommendationId);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Recommendation not found or could not be deleted" });
      }
    } catch (error) {
      console.error(`Error in DELETE /api/ai-recommendations/${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to delete AI recommendation", error: error.message });
    }
  });
  app2.post("/api/ai-recommendations/:id/read", isAuthenticated, async (req, res) => {
    try {
      const recommendationId = parseInt(req.params.id, 10);
      if (isNaN(recommendationId)) {
        return res.status(400).json({ message: "Invalid recommendation ID format" });
      }
      const recommendation = await storage.getAiRecommendationById(recommendationId);
      if (!recommendation) {
        return res.status(404).json({ message: "Recommendation not found" });
      }
      const userId = req.user.id;
      if (recommendation.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const updatedRecommendation = await storage.updateAiRecommendationReadStatus(recommendationId, true);
      res.json(updatedRecommendation);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark recommendation as read", error });
    }
  });
  app2.get("/api/user", isAuthenticated, async (req, res) => {
    if (req.user) {
      res.json(req.user);
    } else {
      console.error("[/api/user] Error: req.user is undefined even after isAuthenticated. Check authMiddleware.");
      res.status(404).json({ message: "User profile not found after authentication." });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  server: {
    fs: {
      strict: false
    }
  },
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
var viteLogger = createLogger();
var __filename_current_module = fileURLToPath2(import.meta.url);
var __dirname_of_bundle = path2.dirname(__filename_current_module);
var projectRoot = path2.resolve(__dirname_of_bundle, "..");
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, httpServer) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server: httpServer },
    allowedHosts: true,
    fs: {
      strict: false
    }
  };
  const configForViteServer = {
    root: path2.resolve(projectRoot, "client"),
    resolve: {
      alias: {
        "@": path2.resolve(projectRoot, "client", "src"),
        "@shared": path2.resolve(projectRoot, "shared"),
        "@assets": path2.resolve(projectRoot, "attached_assets")
      }
    },
    plugins: vite_config_default.plugins,
    server: {
      ...vite_config_default.server,
      ...serverOptions,
      fs: {
        ...vite_config_default.server?.fs || {},
        ...serverOptions.fs
      }
    },
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
      }
    },
    appType: "custom"
  };
  const vite = await createViteServer(configForViteServer);
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(projectRoot, "client", "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(projectRoot, "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "a_very_secret_cat_keyboard_string",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      // Use secure cookies in production
      httpOnly: true,
      // Helps prevent XSS
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  })
);
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5001;
  server.listen({
    port,
    host: "127.0.0.1"
  }, () => {
    log(`\u{1F680} Server ready at http://127.0.0.1:${port}`);
  });
})();
//# sourceMappingURL=index.js.map

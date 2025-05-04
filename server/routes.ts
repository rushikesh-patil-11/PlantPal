import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertPlantSchema, 
  insertCareLogSchema, 
  insertReminderSchema 
} from "@shared/schema";
import { getAIRecommendation } from "./perplexity";
import { z } from "zod";
import { add } from "date-fns";

// Middleware to check if user is authenticated
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Plant routes
  app.get("/api/plants", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const plants = await storage.getPlantsByUserId(userId);
      res.json(plants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plants", error });
    }
  });
  
  app.get("/api/plants/:id", isAuthenticated, async (req, res) => {
    try {
      const plantId = parseInt(req.params.id);
      const plant = await storage.getPlant(plantId);
      
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      
      if (plant.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(plant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plant", error });
    }
  });
  
  app.post("/api/plants", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validation = insertPlantSchema.safeParse({ ...req.body, userId });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid plant data", errors: validation.error });
      }
      
      const plant = await storage.createPlant(validation.data);
      
      // Auto-create a watering reminder based on the plant's water frequency
      const dueDate = add(new Date(), { days: plant.waterFrequency });
      await storage.createReminder({
        userId,
        plantId: plant.id,
        reminderType: "watering",
        dueDate
      });
      
      res.status(201).json(plant);
    } catch (error) {
      res.status(500).json({ message: "Failed to create plant", error });
    }
  });
  
  app.put("/api/plants/:id", isAuthenticated, async (req, res) => {
    try {
      const plantId = parseInt(req.params.id);
      const plant = await storage.getPlant(plantId);
      
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      
      if (plant.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedPlant = await storage.updatePlant(plantId, req.body);
      res.json(updatedPlant);
    } catch (error) {
      res.status(500).json({ message: "Failed to update plant", error });
    }
  });
  
  app.delete("/api/plants/:id", isAuthenticated, async (req, res) => {
    try {
      const plantId = parseInt(req.params.id);
      const plant = await storage.getPlant(plantId);
      
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      
      if (plant.userId !== req.user!.id) {
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
  
  // Care log routes
  app.get("/api/plants/:id/care-logs", isAuthenticated, async (req, res) => {
    try {
      const plantId = parseInt(req.params.id);
      const plant = await storage.getPlant(plantId);
      
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      
      if (plant.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const careLogs = await storage.getCareLogsByPlantId(plantId);
      res.json(careLogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch care logs", error });
    }
  });
  
  app.post("/api/care-logs", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validation = insertCareLogSchema.safeParse({ ...req.body, userId });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid care log data", errors: validation.error });
      }
      
      const plant = await storage.getPlant(validation.data.plantId);
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      
      if (plant.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const careLog = await storage.createCareLog(validation.data);
      
      // If this is a watering activity, create a new reminder for the next watering
      if (validation.data.activityType === "watering") {
        const dueDate = add(new Date(), { days: plant.waterFrequency });
        await storage.createReminder({
          userId,
          plantId: plant.id,
          reminderType: "watering",
          dueDate
        });
      }
      
      res.status(201).json(careLog);
    } catch (error) {
      res.status(500).json({ message: "Failed to create care log", error });
    }
  });
  
  // Reminder routes
  app.get("/api/reminders", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const reminders = await storage.getRemindersByUserId(userId);
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reminders", error });
    }
  });
  
  app.get("/api/reminders/upcoming", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const reminders = await storage.getUpcomingRemindersByUserId(userId);
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming reminders", error });
    }
  });
  
  app.post("/api/reminders", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validation = insertReminderSchema.safeParse({ ...req.body, userId });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid reminder data", errors: validation.error });
      }
      
      const plant = await storage.getPlant(validation.data.plantId);
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      
      if (plant.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const reminder = await storage.createReminder(validation.data);
      res.status(201).json(reminder);
    } catch (error) {
      res.status(500).json({ message: "Failed to create reminder", error });
    }
  });
  
  app.post("/api/reminders/:id/complete", isAuthenticated, async (req, res) => {
    try {
      const reminderId = parseInt(req.params.id);
      const updatedReminder = await storage.markReminderAsCompleted(reminderId);
      
      if (!updatedReminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      res.json(updatedReminder);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete reminder", error });
    }
  });
  
  // AI Recommendation routes
  app.get("/api/ai-recommendations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const recommendations = await storage.getAiRecommendationsByUserId(userId);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI recommendations", error });
    }
  });
  
  app.post("/api/ai-recommendations/generate", isAuthenticated, async (req, res) => {
    try {
      const requestSchema = z.object({
        plantId: z.number().optional(),
        plantName: z.string(),
        plantSpecies: z.string().optional(),
        careIssue: z.string().optional(),
        plantDescription: z.string().optional()
      });
      
      const validation = requestSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request data", errors: validation.error });
      }
      
      const userId = req.user!.id;
      const { plantId, plantName, plantSpecies, careIssue, plantDescription } = validation.data;
      
      // If plantId is provided, verify the plant belongs to the user
      if (plantId) {
        const plant = await storage.getPlant(plantId);
        if (!plant) {
          return res.status(404).json({ message: "Plant not found" });
        }
        
        if (plant.userId !== userId) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      // Get AI recommendation
      const aiResponse = await getAIRecommendation({
        plantName,
        plantSpecies,
        careIssue,
        plantDescription
      });
      
      // Create a title from the plant name and issue
      let title = `Care tips for your ${plantName}`;
      if (careIssue) {
        title = `${plantName}: ${careIssue.slice(0, 1).toUpperCase() + careIssue.slice(1)}`;
      }
      
      // Store the recommendation
      const recommendation = await storage.createAiRecommendation({
        userId,
        plantId: plantId,
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
  
  app.post("/api/ai-recommendations/:id/read", isAuthenticated, async (req, res) => {
    try {
      const recommendationId = parseInt(req.params.id);
      const updatedRecommendation = await storage.markAiRecommendationAsRead(recommendationId);
      
      if (!updatedRecommendation) {
        return res.status(404).json({ message: "Recommendation not found" });
      }
      
      res.json(updatedRecommendation);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark recommendation as read", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

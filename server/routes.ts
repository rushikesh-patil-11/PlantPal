import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.ts";
import { setupAuth } from "./auth.ts";
import { 
  insertPlantSchema, 
  insertCareLogSchema, 
  insertReminderSchema, 
  User as AppUser 
} from "@shared/schema";
import { 
  getAIRecommendation, 
  suggestWateringFrequency, 
  getBasicCareInstructions 
} from "./perplexity";
import { z } from "zod";
import { add } from "date-fns";

// Extend Express Request type to include the user property
interface AuthenticatedRequest extends Request {
  user?: AppUser; 
}

// Middleware to check if user is authenticated
const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.id) { 
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Schema for the request body of the basic reminder creation route
const createBasicReminderBodySchema = z.object({
  reminderType: z.string(), 
  dueDate: z.coerce.date(),    
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes and middleware
  setupAuth(app); 
  
  // Route to get the current authenticated application user
  app.get("/api/auth/me", isAuthenticated, (req: AuthenticatedRequest, res: Response) => {
    // isAuthenticated middleware ensures req.user is populated if token is valid
    // req.user here is the AppUser from our database
    res.json({ data: req.user }); 
  });

  // Plant routes
  app.get("/api/plants", isAuthenticated, async (req: AuthenticatedRequest, res) => { 
    try {
      const userId = req.user!.id; 
      const plants = await storage.getPlantsByUserId(userId);
      res.json(plants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plants", error });
    }
  });
  
  app.get("/api/plants/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => { 
    try {
      const plantId = parseInt(req.params.id, 10);
      if (isNaN(plantId)) {
        return res.status(400).json({ message: "Invalid plant ID format" });
      }
      const plant = await storage.getPlant(plantId);
      
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      
      const userId = req.user!.id;
      if (plant.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(plant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plant", error });
    }
  });
  
  app.post("/api/plants", isAuthenticated, async (req: AuthenticatedRequest, res) => { 
    try {
      const userId = req.user!.id;
      
      // Extract data from the request
      const requestData = { ...req.body, userId };
      
      // If waterFrequency is not provided, suggest it based on plant name and species
      if (!requestData.waterFrequency) {
        requestData.waterFrequency = suggestWateringFrequency(
          requestData.name, 
          requestData.species
        );
      }
      
      // Validate the plant data
      const validation = insertPlantSchema.safeParse(requestData);
      
      if (!validation.success) {
        console.error("Plant data validation failed:", validation.error.flatten().fieldErrors);
        return res.status(400).json({ 
          message: "Invalid plant data", 
          errors: validation.error.flatten().fieldErrors 
        });
      }
      
      // Create the plant
      const plant = await storage.createPlant(validation.data);
      
      // Auto-generate care instructions and create an AI recommendation
      const careInstructions = getBasicCareInstructions(plant.name, plant.species);
      
      // Create a title for the care instructions
      const title = `Care Guide for ${plant.name}`;
      
      // Extract tags from the care instructions
      const tags = ["watering", "light", "care", "basic"];
      
      // Store the recommendation
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
  
  app.put("/api/plants/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => { 
    try {
      const plantId = parseInt(req.params.id, 10);
      if (isNaN(plantId)) {
        return res.status(400).json({ message: "Invalid plant ID format" });
      }
      const plant = await storage.getPlant(plantId);
      
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      
      const userId = req.user!.id;
      if (plant.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedPlant = await storage.updatePlant(plantId, req.body);
      res.json(updatedPlant);
    } catch (error) {
      res.status(500).json({ message: "Failed to update plant", error });
    }
  });
  
  app.delete("/api/plants/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => { 
    try {
      const plantId = parseInt(req.params.id, 10);
      if (isNaN(plantId)) {
        return res.status(400).json({ message: "Invalid plant ID format" });
      }
      const plant = await storage.getPlant(plantId);
      
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      
      const userId = req.user!.id;
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
  
  // Care log routes
  app.get("/api/plants/:id/care-logs", isAuthenticated, async (req: AuthenticatedRequest, res) => { 
    try {
      const plantId = parseInt(req.params.id, 10);
      if (isNaN(plantId)) {
        return res.status(400).json({ message: "Invalid plant ID format" });
      }
      const plant = await storage.getPlant(plantId);
      
      if (!plant) {
        return res.status(404).json({ message: "Plant not found" });
      }
      
      const userId = req.user!.id;
      if (plant.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const careLogs = await storage.getCareLogsByPlantId(plantId);
      res.json(careLogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch care logs", error });
    }
  });
  
  app.post("/api/care-logs", isAuthenticated, async (req: AuthenticatedRequest, res) => { 
    try {
      const userId = req.user!.id;
      const validation = insertCareLogSchema.safeParse({ ...req.body, userId });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid care log data", errors: validation.error.flatten().fieldErrors });
      }
      
      // plantId from validation.data is already a number due to schema validation
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
  
  app.put("/api/care-logs/:logId", isAuthenticated, async (req: AuthenticatedRequest, res) => { 
    try {
      const logId = parseInt(req.params.logId, 10);
      if (isNaN(logId)) {
        return res.status(400).json({ message: "Invalid log ID format" });
      }
      const careLog = await storage.getCareLogById(logId);
      
      if (!careLog) {
        return res.status(404).json({ message: "Care log not found" });
      }
      
      const userId = req.user!.id;
      if (careLog.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedCareLog = await storage.updateCareLog(logId, req.body);
      res.json(updatedCareLog);
    } catch (error) {
      res.status(500).json({ message: "Failed to update care log", error });
    }
  });
  
  app.delete("/api/care-logs/:logId", isAuthenticated, async (req: AuthenticatedRequest, res) => { 
    try {
      const logId = parseInt(req.params.logId, 10);
      if (isNaN(logId)) {
        return res.status(400).json({ message: "Invalid log ID format" });
      }
      const careLog = await storage.getCareLogById(logId);
      
      if (!careLog) {
        return res.status(404).json({ message: "Care log not found" });
      }
      
      const userId = req.user!.id;
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
  
  // Reminder routes
  app.get("/api/plants/:id/reminders", isAuthenticated, async (req: AuthenticatedRequest, res) => { 
    try {
      const plantId = parseInt(req.params.id, 10);
      if (isNaN(plantId)) {
        return res.status(400).json({ message: "Invalid plant ID format" });
      }
      const reminders = await storage.getRemindersByPlantId(plantId);
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reminders", error });
    }
  });
  
  app.post("/api/plants/:plantId/reminders/basic", isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
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
        dueDate: validation.data.dueDate, // Pass dueDate
      });
      res.status(201).json({ message: "Basic reminder created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create reminder", error });
    }
  });
  
  app.post("/api/plants/:plantId/reminders", isAuthenticated, async (req: AuthenticatedRequest, res) => { 
    try {
      const plantId = parseInt(req.params.plantId, 10);
      if (isNaN(plantId)) {
        return res.status(400).json({ message: "Invalid plant ID format" });
      }
      const userId = req.user!.id;

      // Validate that the plant exists and belongs to the user
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
  
  app.put("/api/reminders/:reminderId", isAuthenticated, async (req: AuthenticatedRequest, res) => { 
    try {
      const reminderId = parseInt(req.params.reminderId, 10);
      if (isNaN(reminderId)) {
        return res.status(400).json({ message: "Invalid reminder ID format" });
      }
      const reminder = await storage.getReminderById(reminderId);
      
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      const userId = req.user!.id;
      if (reminder.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedReminder = await storage.updateReminder(reminderId, req.body);
      res.json(updatedReminder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update reminder", error });
    }
  });
  
  app.delete("/api/reminders/:reminderId", isAuthenticated, async (req: AuthenticatedRequest, res) => { 
    try {
      const reminderId = parseInt(req.params.reminderId, 10);
      if (isNaN(reminderId)) {
        return res.status(400).json({ message: "Invalid reminder ID format" });
      }
      const reminder = await storage.getReminderById(reminderId);
      
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      const userId = req.user!.id;
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
  
  // AI Recommendation routes
  app.get("/api/ai-recommendations", isAuthenticated, async (req: AuthenticatedRequest, res) => { 
    try {
      const userId = req.user!.id;
      const recommendations = await storage.getAiRecommendationsByUserId(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error in GET /api/ai-recommendations:", error);
      res.status(500).json({ message: "Failed to fetch AI recommendations", error });
    }
  });

  app.post("/api/ai-recommendations/generate", isAuthenticated, async (req: AuthenticatedRequest, res) => { 
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

  // Delete an AI recommendation
  app.delete("/api/ai-recommendations/:id", isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const recommendationId = parseInt(req.params.id, 10);
      if (isNaN(recommendationId)) {
        return res.status(400).json({ message: "Invalid recommendation ID format" });
      }

      const userId = req.user!.id;
      const recommendation = await storage.getAiRecommendationById(recommendationId);

      if (!recommendation) {
        return res.status(404).json({ message: "Recommendation not found" });
      }

      if (recommendation.userId !== userId) {
        // To prevent leaking information about existence, also return 404
        // Or, if explicit authorization error is preferred: return res.status(403).json({ message: "Forbidden" });
        return res.status(404).json({ message: "Recommendation not found or not authorized" });
      }

      const deleted = await storage.deleteAiRecommendation(recommendationId);
      if (deleted) {
        res.status(204).send(); // Successfully deleted, no content to return
      } else {
        // This case might occur if the item was deleted by another request between fetch and delete,
        // or if there's a db issue not throwing an error but failing to delete.
        res.status(404).json({ message: "Recommendation not found or could not be deleted" });
      }
    } catch (error) {
      console.error(`Error in DELETE /api/ai-recommendations/${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to delete AI recommendation", error: (error as Error).message });
    }
  });

  app.post("/api/ai-recommendations/:id/read", isAuthenticated, async (req: AuthenticatedRequest, res: Response) => { 
    try {
      const recommendationId = parseInt(req.params.id, 10);
      if (isNaN(recommendationId)) {
        return res.status(400).json({ message: "Invalid recommendation ID format" });
      }
      
      const recommendation = await storage.getAiRecommendationById(recommendationId); 
      if (!recommendation) {
        return res.status(404).json({ message: "Recommendation not found" });
      }

      const userId = req.user!.id;

      if (recommendation.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedRecommendation = await storage.updateAiRecommendationReadStatus(recommendationId, true);
      res.json(updatedRecommendation);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark recommendation as read", error });
    }
  });

  // User routes
  app.get("/api/user", isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
    // The isAuthenticated middleware ensures that req.user is populated.
    // If req.user exists, it means the token was valid, and authMiddleware
    // successfully fetched or created the application user.
    if (req.user) {
      res.json(req.user);
    } else {
      // This case should ideally not be reached if isAuthenticated and authMiddleware work correctly.
      // It implies a potential issue in the auth flow upstream.
      console.error("[/api/user] Error: req.user is undefined even after isAuthenticated. Check authMiddleware.");
      res.status(404).json({ message: "User profile not found after authentication." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

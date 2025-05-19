import { 
  users, 
  plants, 
  careLogs, 
  reminders, 
  aiRecommendations, 
  type User, 
  type InsertUser, 
  type Plant, 
  type InsertPlant, 
  type CareLog, 
  type InsertCareLog,
  type Reminder,
  type InsertReminder,
  type AiRecommendation,
  type InsertAiRecommendation
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);
const sessionStoreConfig = {
  checkPeriod: 86400000, // prune expired entries every 24h
  stale: false
};

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Plant operations
  getPlant(id: number): Promise<Plant | undefined>;
  getPlantsByUserId(userId: number): Promise<Plant[]>;
  createPlant(plant: InsertPlant): Promise<Plant>;
  updatePlant(id: number, plant: Partial<Plant>): Promise<Plant | undefined>;
  deletePlant(id: number): Promise<boolean>;
  
  // Care log operations
  getCareLogsByPlantId(plantId: number): Promise<CareLog[]>;
  getCareLogsByUserId(userId: number): Promise<CareLog[]>;
  createCareLog(careLog: InsertCareLog): Promise<CareLog>;
  
  // Basic plant reminder operations
  createBasicReminder(plantId: number, type: string): Promise<void>;
  getBasicReminders(plantId: number): Promise<any[]>;
  
  // AI recommendation operations
  getAiRecommendationsByUserId(userId: number): Promise<AiRecommendation[]>;
  getAiRecommendationsByPlantId(plantId: number): Promise<AiRecommendation[]>;
  createAiRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation>;
  markAiRecommendationAsRead(id: number): Promise<AiRecommendation | undefined>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private plantsData: Map<number, Plant>;
  private careLogsData: Map<number, CareLog>;
  private remindersData: Map<number, Reminder>;
  private aiRecommendationsData: Map<number, AiRecommendation>;
  
  sessionStore: session.SessionStore;
  userIdCounter: number;
  plantIdCounter: number;
  careLogIdCounter: number;
  reminderIdCounter: number;
  aiRecommendationIdCounter: number;
  
  constructor() {
    this.usersData = new Map();
    this.plantsData = new Map();
    this.careLogsData = new Map();
    this.remindersData = new Map();
    this.aiRecommendationsData = new Map();
    
    this.sessionStore = new MemoryStore(sessionStoreConfig);
    
    this.userIdCounter = 1;
    this.plantIdCounter = 1;
    this.careLogIdCounter = 1;
    this.reminderIdCounter = 1;
    this.aiRecommendationIdCounter = 1;
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.usersData.set(id, user);
    return user;
  }
  
  // Plant operations
  async getPlant(id: number): Promise<Plant | undefined> {
    return this.plantsData.get(id);
  }
  
  async getPlantsByUserId(userId: number): Promise<Plant[]> {
    return Array.from(this.plantsData.values()).filter(
      (plant) => plant.userId === userId
    );
  }
  
  async createPlant(insertPlant: InsertPlant): Promise<Plant> {
    const id = this.plantIdCounter++;
    const createdAt = new Date();
    const plant: Plant = { ...insertPlant, id, createdAt, lastWatered: null };
    this.plantsData.set(id, plant);
    return plant;
  }
  
  async updatePlant(id: number, updates: Partial<Plant>): Promise<Plant | undefined> {
    const plant = this.plantsData.get(id);
    if (!plant) return undefined;
    
    const updatedPlant = { ...plant, ...updates };
    this.plantsData.set(id, updatedPlant);
    return updatedPlant;
  }
  
  async deletePlant(id: number): Promise<boolean> {
    return this.plantsData.delete(id);
  }
  
  // Care log operations
  async getCareLogsByPlantId(plantId: number): Promise<CareLog[]> {
    return Array.from(this.careLogsData.values())
      .filter((log) => log.plantId === plantId)
      .sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime()); // Sort by date desc
  }
  
  async getCareLogsByUserId(userId: number): Promise<CareLog[]> {
    return Array.from(this.careLogsData.values())
      .filter((log) => log.userId === userId)
      .sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime()); // Sort by date desc
  }
  
  async createCareLog(insertCareLog: InsertCareLog): Promise<CareLog> {
    const id = this.careLogIdCounter++;
    const performedAt = new Date();
    const careLog: CareLog = { ...insertCareLog, id, performedAt };
    this.careLogsData.set(id, careLog);
    
    // If this is a watering activity, update the plant's lastWatered date
    if (insertCareLog.activityType === 'watering') {
      const plant = await this.getPlant(insertCareLog.plantId);
      if (plant) {
        await this.updatePlant(plant.id, { lastWatered: performedAt });
      }
    }
    
    return careLog;
  }
  
  // Reminder operations
  async getRemindersByUserId(userId: number): Promise<Reminder[]> {
    return Array.from(this.remindersData.values())
      .filter((reminder) => reminder.userId === userId)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()); // Sort by due date asc
  }
  
  async getUpcomingRemindersByUserId(userId: number): Promise<Reminder[]> {
    const now = new Date();
    return Array.from(this.remindersData.values())
      .filter((reminder) => 
        reminder.userId === userId && 
        reminder.dueDate >= now && 
        !reminder.completed
      )
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()); // Sort by due date asc
  }
  
  async getRemindersByPlantId(plantId: number): Promise<Reminder[]> {
    return Array.from(this.remindersData.values())
      .filter((reminder) => reminder.plantId === plantId)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()); // Sort by due date asc
  }
  
  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = this.reminderIdCounter++;
    const createdAt = new Date();
    const reminder: Reminder = { 
      ...insertReminder, 
      id, 
      createdAt, 
      completed: false 
    };
    this.remindersData.set(id, reminder);
    return reminder;
  }
  
  async markReminderAsCompleted(id: number): Promise<Reminder | undefined> {
    const reminder = this.remindersData.get(id);
    if (!reminder) return undefined;
    
    const updatedReminder = { ...reminder, completed: true };
    this.remindersData.set(id, updatedReminder);
    return updatedReminder;
  }
  
  // AI recommendation operations
  async getAiRecommendationsByUserId(userId: number): Promise<AiRecommendation[]> {
    return Array.from(this.aiRecommendationsData.values())
      .filter((rec) => rec.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by date desc
  }
  
  async getAiRecommendationsByPlantId(plantId: number): Promise<AiRecommendation[]> {
    return Array.from(this.aiRecommendationsData.values())
      .filter((rec) => rec.plantId === plantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by date desc
  }
  
  async createAiRecommendation(insertRec: InsertAiRecommendation): Promise<AiRecommendation> {
    const id = this.aiRecommendationIdCounter++;
    const createdAt = new Date();
    const recommendation: AiRecommendation = { 
      ...insertRec, 
      id, 
      createdAt, 
      read: false 
    };
    this.aiRecommendationsData.set(id, recommendation);
    return recommendation;
  }
  
  async markAiRecommendationAsRead(id: number): Promise<AiRecommendation | undefined> {
    const recommendation = this.aiRecommendationsData.get(id);
    if (!recommendation) return undefined;
    
    const updatedRecommendation = { ...recommendation, read: true };
    this.aiRecommendationsData.set(id, updatedRecommendation);
    return updatedRecommendation;
  }
}

import { SupabaseStorage } from './supabaseStorage';

// Use Supabase for storage instead of memory storage
export const storage = new SupabaseStorage();

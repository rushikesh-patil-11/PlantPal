import { 
  users, 
  plants, 
  careLogs, 
  aiRecommendations, 
  type User, 
  type InsertUser, 
  type Plant, 
  type InsertPlant, 
  type CareLog, 
  type InsertCareLog,
  type AiRecommendation,
  type InsertAiRecommendation
} from "@shared/schema";
import { supabase } from '@shared/supabase';
import session from "express-session";
import { IStorage } from './storage';
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class SupabaseStorage implements IStorage {
  sessionStore: any;
  
  constructor() {
    // Use memory store for session (can be replaced with PostgreSQL store later)
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !data) return undefined;
    return data as User;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
      
    if (error || !data) return undefined;
    return data as User;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(insertUser)
      .select()
      .single();
      
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return data as User;
  }
  
  // Plant operations
  async getPlant(id: number): Promise<Plant | undefined> {
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !data) return undefined;
    return data as Plant;
  }
  
  async getPlantsByUserId(userId: number): Promise<Plant[]> {
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });
      
    if (error) throw new Error(`Failed to get plants: ${error.message}`);
    return data as Plant[] || [];
  }
  
  async createPlant(insertPlant: InsertPlant): Promise<Plant> {
    const { data, error } = await supabase
      .from('plants')
      .insert(insertPlant)
      .select()
      .single();
      
    if (error) throw new Error(`Failed to create plant: ${error.message}`);
    return data as Plant;
  }
  
  async updatePlant(id: number, updates: Partial<Plant>): Promise<Plant | undefined> {
    const { data, error } = await supabase
      .from('plants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error || !data) return undefined;
    return data as Plant;
  }
  
  async deletePlant(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('plants')
      .delete()
      .eq('id', id);
      
    return !error;
  }
  
  // Care log operations
  async getCareLogsByPlantId(plantId: number): Promise<CareLog[]> {
    const { data, error } = await supabase
      .from('care_logs')
      .select('*')
      .eq('plantId', plantId)
      .order('performedAt', { ascending: false });
      
    if (error) throw new Error(`Failed to get care logs: ${error.message}`);
    return data as CareLog[] || [];
  }
  
  async getCareLogsByUserId(userId: number): Promise<CareLog[]> {
    const { data, error } = await supabase
      .from('care_logs')
      .select('*')
      .eq('userId', userId)
      .order('performedAt', { ascending: false });
      
    if (error) throw new Error(`Failed to get care logs: ${error.message}`);
    return data as CareLog[] || [];
  }
  
  async createCareLog(insertCareLog: InsertCareLog): Promise<CareLog> {
    const { data, error } = await supabase
      .from('care_logs')
      .insert(insertCareLog)
      .select()
      .single();
      
    if (error) throw new Error(`Failed to create care log: ${error.message}`);
    
    // If this is a watering activity, update the plant's lastWatered date
    if (insertCareLog.activityType === 'watering') {
      const plant = await this.getPlant(insertCareLog.plantId);
      if (plant) {
        await this.updatePlant(plant.id, { lastWatered: new Date() });
      }
    }
    
    return data as CareLog;
  }
  
  // Reminder operations - keeping interface but not implementing
  async getRemindersByUserId(): Promise<[]> {
    return [];
  }
  
  async getUpcomingRemindersByUserId(): Promise<[]> {
    return [];
  }
  
  async getRemindersByPlantId(): Promise<[]> {
    return [];
  }
  
  async createReminder(): Promise<any> {
    throw new Error('Calendar functionality has been removed');
  }
  
  async markReminderAsCompleted(): Promise<undefined> {
    return undefined;
  }
  
  // AI recommendation operations
  async getAiRecommendationsByUserId(userId: number): Promise<AiRecommendation[]> {
    const { data, error } = await supabase
      .from('ai_recommendations')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });
      
    if (error) throw new Error(`Failed to get AI recommendations: ${error.message}`);
    return data as AiRecommendation[] || [];
  }
  
  async getAiRecommendationsByPlantId(plantId: number): Promise<AiRecommendation[]> {
    const { data, error } = await supabase
      .from('ai_recommendations')
      .select('*')
      .eq('plantId', plantId)
      .order('createdAt', { ascending: false });
      
    if (error) throw new Error(`Failed to get AI recommendations: ${error.message}`);
    return data as AiRecommendation[] || [];
  }
  
  async createAiRecommendation(insertRec: InsertAiRecommendation): Promise<AiRecommendation> {
    const { data, error } = await supabase
      .from('ai_recommendations')
      .insert(insertRec)
      .select()
      .single();
      
    if (error) throw new Error(`Failed to create AI recommendation: ${error.message}`);
    return data as AiRecommendation;
  }
  
  async markAiRecommendationAsRead(id: number): Promise<AiRecommendation | undefined> {
    const { data, error } = await supabase
      .from('ai_recommendations')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();
      
    if (error || !data) return undefined;
    return data as AiRecommendation;
  }
}
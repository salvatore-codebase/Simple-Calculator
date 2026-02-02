import { db } from "./db";
import {
  calculations,
  type InsertCalculation,
  type Calculation
} from "@shared/schema";
import { desc } from "drizzle-orm";

export interface IStorage {
  getCalculations(): Promise<Calculation[]>;
  createCalculation(calculation: InsertCalculation): Promise<Calculation>;
  clearCalculations(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getCalculations(): Promise<Calculation[]> {
    return await db.select()
      .from(calculations)
      .orderBy(desc(calculations.createdAt))
      .limit(50);
  }

  async createCalculation(insertCalculation: InsertCalculation): Promise<Calculation> {
    const [calculation] = await db
      .insert(calculations)
      .values(insertCalculation)
      .returning();
    return calculation;
  }

  async clearCalculations(): Promise<void> {
    await db.delete(calculations);
  }
}

export const storage = new DatabaseStorage();

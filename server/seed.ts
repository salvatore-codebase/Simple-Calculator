import { storage } from "./storage";

export async function seedDatabase() {
  const existing = await storage.getCalculations();
  if (existing.length === 0) {
    await storage.createCalculation({ expression: "2 + 2", result: "4" });
    await storage.createCalculation({ expression: "10 * 5", result: "50" });
    await storage.createCalculation({ expression: "100 / 4", result: "25" });
  }
}

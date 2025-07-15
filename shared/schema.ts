import { pgTable, text, serial, integer, boolean, date, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  totalLeaves: integer("total_leaves").notNull().default(15),
  usedLeaves: integer("used_leaves").notNull().default(0),
});

export const customHolidays = pgTable("custom_holidays", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  name: text("name").notNull(),
});

export const selectedDestinations = pgTable("selected_destinations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  countryCode: text("country_code").notNull(),
  countryName: text("country_name").notNull(),
});

export const vacationPlans = pgTable("vacation_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  leaveDaysUsed: integer("leave_days_used").notNull(),
  leaveType: text("leave_type").notNull().default("full"), // "full", "half", "quarter"
  destinations: json("destinations").$type<string[]>().notNull(),
  notes: text("notes"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  totalLeaves: true,
  usedLeaves: true,
});

export const insertCustomHolidaySchema = createInsertSchema(customHolidays).pick({
  userId: true,
  date: true,
  name: true,
});

export const insertDestinationSchema = createInsertSchema(selectedDestinations).pick({
  userId: true,
  countryCode: true,
  countryName: true,
});

export const insertVacationPlanSchema = createInsertSchema(vacationPlans).pick({
  userId: true,
  title: true,
  startDate: true,
  endDate: true,
  leaveDaysUsed: true,
  leaveType: true,
  destinations: true,
  notes: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type CustomHoliday = typeof customHolidays.$inferSelect;
export type InsertCustomHoliday = z.infer<typeof insertCustomHolidaySchema>;
export type SelectedDestination = typeof selectedDestinations.$inferSelect;
export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type VacationPlan = typeof vacationPlans.$inferSelect;
export type InsertVacationPlan = z.infer<typeof insertVacationPlanSchema>;

// Types for external data
export interface Holiday {
  date: string;
  name: string;
  type: 'public' | 'religious' | 'observance';
  country: string;
  countryCode: string;
}

export interface NewsItem {
  title: string;
  url: string;
  publishedAt: string;
  source: string;
}

export interface CountryInfo {
  code: string;
  name: string;
  nameKr: string;
  emoji: string;
  region: string;
  popular: boolean;
}

export interface TravelInsight {
  countryCode: string;
  countryName: string;
  month: number;
  year: number;
  suitabilityScore: number;
  weather: string;
  weatherScore: 'good' | 'fair' | 'poor';
  flightCost: string;
  flightCostScore: 'low' | 'medium' | 'high';
  crowdLevel: string;
  crowdScore: 'low' | 'medium' | 'high';
  events: Array<{
    name: string;
    dates: string;
  }>;
}

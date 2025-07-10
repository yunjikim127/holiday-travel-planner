import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCustomHolidaySchema, 
  insertDestinationSchema,
  insertVacationPlanSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.patch("/api/user/:id", async (req, res) => {
    try {
      const updates = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(parseInt(req.params.id), updates);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  // Custom holidays routes
  app.get("/api/user/:userId/custom-holidays", async (req, res) => {
    try {
      const holidays = await storage.getCustomHolidays(parseInt(req.params.userId));
      res.json(holidays);
    } catch (error) {
      res.status(500).json({ message: "Failed to get custom holidays" });
    }
  });

  app.post("/api/custom-holidays", async (req, res) => {
    try {
      const holiday = insertCustomHolidaySchema.parse(req.body);
      const newHoliday = await storage.createCustomHoliday(holiday);
      res.json(newHoliday);
    } catch (error) {
      res.status(400).json({ message: "Invalid holiday data" });
    }
  });

  app.delete("/api/custom-holidays/:id", async (req, res) => {
    try {
      await storage.deleteCustomHoliday(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete holiday" });
    }
  });

  // Destinations routes
  app.get("/api/user/:userId/destinations", async (req, res) => {
    try {
      const destinations = await storage.getSelectedDestinations(parseInt(req.params.userId));
      res.json(destinations);
    } catch (error) {
      res.status(500).json({ message: "Failed to get destinations" });
    }
  });

  app.post("/api/destinations", async (req, res) => {
    try {
      const destination = insertDestinationSchema.parse(req.body);
      const newDestination = await storage.addDestination(destination);
      res.json(newDestination);
    } catch (error) {
      res.status(400).json({ message: "Invalid destination data" });
    }
  });

  app.delete("/api/user/:userId/destinations/:countryCode", async (req, res) => {
    try {
      await storage.removeDestination(parseInt(req.params.userId), req.params.countryCode);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove destination" });
    }
  });

  // Vacation plans routes
  app.get("/api/user/:userId/vacation-plans", async (req, res) => {
    try {
      const plans = await storage.getVacationPlans(parseInt(req.params.userId));
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to get vacation plans" });
    }
  });

  app.post("/api/vacation-plans", async (req, res) => {
    try {
      const plan = insertVacationPlanSchema.parse(req.body);
      const newPlan = await storage.createVacationPlan(plan);
      res.json(newPlan);
    } catch (error) {
      res.status(400).json({ message: "Invalid vacation plan data" });
    }
  });

  app.patch("/api/vacation-plans/:id", async (req, res) => {
    try {
      const updates = insertVacationPlanSchema.partial().parse(req.body);
      const plan = await storage.updateVacationPlan(parseInt(req.params.id), updates);
      res.json(plan);
    } catch (error) {
      res.status(400).json({ message: "Invalid vacation plan data" });
    }
  });

  app.delete("/api/vacation-plans/:id", async (req, res) => {
    try {
      await storage.deleteVacationPlan(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vacation plan" });
    }
  });

  // External data routes
  app.get("/api/holidays/:countryCode/:year", async (req, res) => {
    try {
      const holidays = await storage.getHolidays(req.params.countryCode, parseInt(req.params.year));
      res.json(holidays);
    } catch (error) {
      res.status(500).json({ message: "Failed to get holidays" });
    }
  });

  app.get("/api/news/travel", async (req, res) => {
    try {
      const news = await storage.getTravelNews();
      res.json(news);
    } catch (error) {
      res.status(500).json({ message: "Failed to get travel news" });
    }
  });

  app.get("/api/news/holidays", async (req, res) => {
    try {
      const news = await storage.getHolidayNews();
      res.json(news);
    } catch (error) {
      res.status(500).json({ message: "Failed to get holiday news" });
    }
  });

  app.get("/api/insights/:countryCode/:month/:year", async (req, res) => {
    try {
      const insights = await storage.getTravelInsights(
        req.params.countryCode,
        parseInt(req.params.month),
        parseInt(req.params.year)
      );
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: "Failed to get travel insights" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

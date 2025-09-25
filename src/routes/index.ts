import { Application } from "express";
import { 
  SalesController, 
  UserController, 
  CommissionController, 
  TargetsController 
} from "../controllers";
import { SeedService } from "../services/seedService";

const salesController = new SalesController();
const userController = new UserController();
const commissionController = new CommissionController();
const targetsController = new TargetsController();

export const setRoutes = (app: Application) => {
  // Health check route
  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "OK",
      message: "Sales Performance Analytics API is running",
      version: "1.0.0",
      endpoints: {
        users: "/api/users",
        sales: "/api/sales",
        targets: "/api/targets",
        commission: "/api/commission"
      }
    });
  });

  // User routes
  app.post("/api/users", userController.createUser.bind(userController));
  app.get("/api/users", userController.getUsers.bind(userController));
  app.get("/api/users/:id", userController.getUserById.bind(userController));
  app.put("/api/users/:id/region", userController.updateUserRegion.bind(userController));
  app.delete("/api/users/:id", userController.deleteUser.bind(userController));

  // Sales routes
  app.post("/api/sales", salesController.createSale.bind(salesController));
  app.post("/api/sales/bulk", salesController.bulkImportSales.bind(salesController));
  app.get("/api/sales", salesController.getSales.bind(salesController));
  app.get("/api/sales/:id", salesController.getSaleById.bind(salesController));

  // Targets routes
  app.post("/api/targets", targetsController.createTarget.bind(targetsController));
  app.get("/api/targets", targetsController.getTargets.bind(targetsController));
  app.get("/api/targets/:id", targetsController.getTargetById.bind(targetsController));
  app.put("/api/targets/:id", targetsController.updateTarget.bind(targetsController));
  app.delete("/api/targets/:id", targetsController.deleteTarget.bind(targetsController));

  // Commission routes
  app.get("/api/commission/:userId/:month/:year", commissionController.getCommission.bind(commissionController));
  app.get("/api/commission/:userId/summary", commissionController.getCommissionSummary.bind(commissionController));

  // Development/Testing routes
  app.post("/api/seed", async (req, res) => {
    try {
      await SeedService.seedSampleData();
      res.status(200).json({
        success: true,
        message: "Sample data seeded successfully"
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Failed to seed data",
        details: [{ field: "server", message: error.message }]
      });
    }
  });

  app.delete("/api/seed", async (req, res) => {
    try {
      await SeedService.clearAllData();
      res.status(200).json({
        success: true,
        message: "All data cleared successfully"
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: "Failed to clear data",
        details: [{ field: "server", message: error.message }]
      });
    }
  });
};

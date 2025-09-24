import { Application } from "express";
import { SalesController } from "../controllers";

const salesController = new SalesController();

export const setRoutes = (app: Application) => {
  // Sales routes
  app.post("/api/sales", salesController.createSale.bind(salesController));
  app.post(
    "/api/sales/bulk-import",
    salesController.bulkImportSales.bind(salesController)
  );
  app.get(
    "/api/sales/commission",
    salesController.getCommission.bind(salesController)
  );

  // Health check route
  app.get("/api/health", (req, res) => {
    res
      .status(200)
      .json({
        status: "OK",
        message: "Sales Performance Analytics API is running",
      });
  });
};

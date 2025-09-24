import { Request, Response } from "express";
import { SalesModel, ISale } from "../models/sales";
import { UserModel, IUser } from "../models/user";
import { CommissionService } from "../services/commissionService";

export class SalesController {
  private commissionService: CommissionService;

  constructor() {
    this.commissionService = new CommissionService(0.1); // Example commission rate
  }

  public async createSale(req: Request, res: Response): Promise<void> {
    try {
      const saleData = req.body;
      const sale = new SalesModel(saleData);
      await sale.save();
      res.status(201).json(sale);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  public async bulkImportSales(req: Request, res: Response): Promise<void> {
    try {
      const salesData = req.body;
      const result = await SalesModel.insertMany(salesData);
      res.status(200).json({ importedCount: result.length });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  public async getCommission(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string;
      const sales = await SalesModel.find({ userId });
      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      const commission = this.commissionService.calculateTotalCommission(
        sales,
        user
      );
      res.status(200).json({ userId, commission });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

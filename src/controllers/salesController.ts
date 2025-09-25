import { Request, Response } from "express";
import { SalesModel, ISale } from "../models/sales";
import { UserModel } from "../models/user";
import { CommissionService } from "../services/commissionService";
import { ValidationService } from "../services/validationService";
import { CreateSaleRequest, ErrorResponse, SuccessResponse } from "../types";
import mongoose from "mongoose";

export class SalesController {
  private commissionService: CommissionService;

  constructor() {
    this.commissionService = new CommissionService();
  }

  public async createSale(req: Request, res: Response): Promise<void> {
    try {
      const saleData: CreateSaleRequest = req.body;
      
      // Validate input data
      const validationErrors = ValidationService.validateSaleData(saleData);
      if (validationErrors.length > 0) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Validation failed",
          details: validationErrors
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Check if user exists
      const user = await UserModel.findById(saleData.user_id);
      if (!user) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Validation failed",
          details: [{ field: "user_id", message: "User not found" }]
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Create new sale
      const sale = new SalesModel({
        user_id: saleData.user_id,
        amount: saleData.amount,
        date: new Date(saleData.date),
        product_category: saleData.product_category,
        commission_rate: saleData.commission_rate || 5
      });

      await sale.save();

      const successResponse: SuccessResponse<ISale> = {
        success: true,
        data: sale
      };

      res.status(201).json(successResponse);
    } catch (error: any) {
      console.error("Error creating sale:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        error: "Internal server error",
        details: [{ field: "server", message: error.message }]
      };
      res.status(500).json(errorResponse);
    }
  }

  public async bulkImportSales(req: Request, res: Response): Promise<void> {
    try {
      const salesData: CreateSaleRequest[] = req.body;
      
      if (!Array.isArray(salesData)) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Validation failed",
          details: [{ field: "body", message: "Request body must be an array" }]
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Validate bulk data
      const { valid, errors } = ValidationService.validateBulkSalesData(salesData);
      
      if (valid.length === 0) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "No valid sales data provided",
          details: errors.flatMap(e => e.errors)
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Process bulk sales
      const results = await this.commissionService.processBulkSales(valid);

      const successResponse: SuccessResponse<{
        success: number;
        errors: Array<{ index: number, error: string }>;
        validationErrors: Array<{ index: number, errors: any[] }>;
      }> = {
        success: true,
        data: {
          success: results.success,
          errors: results.errors,
          validationErrors: errors
        }
      };

      res.status(200).json(successResponse);
    } catch (error: any) {
      console.error("Error bulk importing sales:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        error: "Internal server error",
        details: [{ field: "server", message: error.message }]
      };
      res.status(500).json(errorResponse);
    }
  }

  public async getSales(req: Request, res: Response): Promise<void> {
    try {
      const { user_id, start_date, end_date, product_category } = req.query;
      
      // Build filter object
      const filter: any = {};
      if (user_id) filter.user_id = user_id;
      if (product_category) filter.product_category = product_category;
      
      if (start_date || end_date) {
        filter.date = {};
        if (start_date) filter.date.$gte = new Date(start_date as string);
        if (end_date) filter.date.$lte = new Date(end_date as string);
      }

      const sales = await SalesModel.find(filter)
        .populate('user_id', 'name email region')
        .select('-__v')
        .sort({ date: -1 });
      
      const successResponse: SuccessResponse<ISale[]> = {
        success: true,
        data: sales
      };

      res.status(200).json(successResponse);
    } catch (error: any) {
      console.error("Error fetching sales:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        error: "Internal server error",
        details: [{ field: "server", message: error.message }]
      };
      res.status(500).json(errorResponse);
    }
  }

  public async getSaleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Validation failed",
          details: [{ field: "id", message: "Invalid sale ID format" }]
        };
        res.status(400).json(errorResponse);
        return;
      }

      const sale = await SalesModel.findById(id)
        .populate('user_id', 'name email region')
        .select('-__v');
      
      if (!sale) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Sale not found",
          details: [{ field: "id", message: "Sale with this ID does not exist" }]
        };
        res.status(404).json(errorResponse);
        return;
      }

      const successResponse: SuccessResponse<ISale> = {
        success: true,
        data: sale
      };

      res.status(200).json(successResponse);
    } catch (error: any) {
      console.error("Error fetching sale:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        error: "Internal server error",
        details: [{ field: "server", message: error.message }]
      };
      res.status(500).json(errorResponse);
    }
  }
}

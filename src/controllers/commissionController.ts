import { Request, Response } from "express";
import { CommissionService } from "../services/commissionService";
import { ErrorResponse, SuccessResponse, CommissionCalculation } from "../types";

export class CommissionController {
  private commissionService: CommissionService;

  constructor() {
    this.commissionService = new CommissionService();
  }

  public async getCommission(req: Request, res: Response): Promise<void> {
    try {
      const { userId, month, year } = req.params;

      // Validate parameters
      const errors: Array<{ field: string, message: string }> = [];

      if (!userId) {
        errors.push({ field: "userId", message: "User ID is required" });
      }

      const monthNum = parseInt(month);
      if (!month || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        errors.push({ field: "month", message: "Month must be a number between 1 and 12" });
      }

      const yearNum = parseInt(year);
      if (!year || isNaN(yearNum) || yearNum < 2020) {
        errors.push({ field: "year", message: "Year must be a number and 2020 or later" });
      }

      if (errors.length > 0) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Validation failed",
          details: errors
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Calculate commission
      const commission = await this.commissionService.calculateCommission(userId, monthNum, yearNum);

      const successResponse: SuccessResponse<CommissionCalculation> = {
        success: true,
        data: commission
      };

      res.status(200).json(successResponse);
    } catch (error: any) {
      console.error("Error calculating commission:", error);
      
      let statusCode = 500;
      let errorMessage = "Internal server error";
      
      if (error.message === "User not found") {
        statusCode = 404;
        errorMessage = "User not found";
      }

      const errorResponse: ErrorResponse = {
        success: false,
        error: errorMessage,
        details: [{ field: "server", message: error.message }]
      };
      res.status(statusCode).json(errorResponse);
    }
  }

  public async getCommissionSummary(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { year } = req.query;

      if (!userId) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Validation failed",
          details: [{ field: "userId", message: "User ID is required" }]
        };
        res.status(400).json(errorResponse);
        return;
      }

      const yearNum = year ? parseInt(year as string) : new Date().getFullYear();
      
      if (isNaN(yearNum) || yearNum < 2020) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Validation failed",
          details: [{ field: "year", message: "Year must be a number and 2020 or later" }]
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Calculate commission for each month of the year
      const monthlyCommissions: CommissionCalculation[] = [];
      
      for (let month = 1; month <= 12; month++) {
        try {
          const commission = await this.commissionService.calculateCommission(userId, month, yearNum);
          monthlyCommissions.push(commission);
        } catch (error: any) {
          // Skip months where user doesn't exist or has no data
          if (error.message !== "User not found") {
            throw error;
          }
        }
      }

      // Calculate yearly totals
      const yearlyTotal = monthlyCommissions.reduce((sum, commission) => sum + commission.totalCommission, 0);
      const yearlySales = monthlyCommissions.reduce((sum, commission) => sum + commission.totalSales, 0);
      const monthsHitTarget = monthlyCommissions.filter(commission => commission.targetHit).length;

      const summary = {
        userId,
        year: yearNum,
        monthlyCommissions,
        yearlyTotal,
        yearlySales,
        monthsHitTarget,
        averageMonthlyCommission: monthlyCommissions.length > 0 ? yearlyTotal / monthlyCommissions.length : 0
      };

      const successResponse: SuccessResponse<typeof summary> = {
        success: true,
        data: summary
      };

      res.status(200).json(successResponse);
    } catch (error: any) {
      console.error("Error calculating commission summary:", error);
      
      let statusCode = 500;
      let errorMessage = "Internal server error";
      
      if (error.message === "User not found") {
        statusCode = 404;
        errorMessage = "User not found";
      }

      const errorResponse: ErrorResponse = {
        success: false,
        error: errorMessage,
        details: [{ field: "server", message: error.message }]
      };
      res.status(statusCode).json(errorResponse);
    }
  }
}

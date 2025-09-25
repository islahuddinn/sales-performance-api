import { Request, Response } from "express";
import { TargetModel, ITarget } from "../models/targets";
import { UserModel } from "../models/user";
import { ValidationService } from "../services/validationService";
import { CreateTargetRequest, ErrorResponse, SuccessResponse } from "../types";
import mongoose from "mongoose";

export class TargetsController {
  public async createTarget(req: Request, res: Response): Promise<void> {
    try {
      const targetData: CreateTargetRequest = req.body;
      
      // Validate input data
      const validationErrors = ValidationService.validateTargetData(targetData);
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
      const user = await UserModel.findById(targetData.user_id);
      if (!user) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Validation failed",
          details: [{ field: "user_id", message: "User not found" }]
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Check if target already exists for this user/month/year
      const existingTarget = await TargetModel.findOne({
        user_id: targetData.user_id,
        month: targetData.month,
        year: targetData.year
      });

      if (existingTarget) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Validation failed",
          details: [{ field: "target", message: "Target already exists for this user/month/year" }]
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Create new target
      const target = new TargetModel({
        user_id: targetData.user_id,
        month: targetData.month,
        year: targetData.year,
        target_amount: targetData.target_amount
      });

      await target.save();

      const successResponse: SuccessResponse<ITarget> = {
        success: true,
        data: target
      };

      res.status(201).json(successResponse);
    } catch (error: any) {
      console.error("Error creating target:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        error: "Internal server error",
        details: [{ field: "server", message: error.message }]
      };
      res.status(500).json(errorResponse);
    }
  }

  public async getTargets(req: Request, res: Response): Promise<void> {
    try {
      const { user_id, month, year } = req.query;
      
      // Build filter object
      const filter: any = {};
      if (user_id) filter.user_id = user_id;
      if (month) filter.month = parseInt(month as string);
      if (year) filter.year = parseInt(year as string);

      const targets = await TargetModel.find(filter)
        .populate('user_id', 'name email region')
        .select('-__v')
        .sort({ year: -1, month: -1 });
      
      const successResponse: SuccessResponse<ITarget[]> = {
        success: true,
        data: targets
      };

      res.status(200).json(successResponse);
    } catch (error: any) {
      console.error("Error fetching targets:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        error: "Internal server error",
        details: [{ field: "server", message: error.message }]
      };
      res.status(500).json(errorResponse);
    }
  }

  public async getTargetById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Validation failed",
          details: [{ field: "id", message: "Invalid target ID format" }]
        };
        res.status(400).json(errorResponse);
        return;
      }

      const target = await TargetModel.findById(id)
        .populate('user_id', 'name email region')
        .select('-__v');
      
      if (!target) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Target not found",
          details: [{ field: "id", message: "Target with this ID does not exist" }]
        };
        res.status(404).json(errorResponse);
        return;
      }

      const successResponse: SuccessResponse<ITarget> = {
        success: true,
        data: target
      };

      res.status(200).json(successResponse);
    } catch (error: any) {
      console.error("Error fetching target:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        error: "Internal server error",
        details: [{ field: "server", message: error.message }]
      };
      res.status(500).json(errorResponse);
    }
  }

  public async updateTarget(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { target_amount } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Validation failed",
          details: [{ field: "id", message: "Invalid target ID format" }]
        };
        res.status(400).json(errorResponse);
        return;
      }

      if (typeof target_amount !== 'number' || target_amount < 0) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Validation failed",
          details: [{ field: "target_amount", message: "Target amount must be a positive number" }]
        };
        res.status(400).json(errorResponse);
        return;
      }

      const target = await TargetModel.findById(id);
      if (!target) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Target not found",
          details: [{ field: "id", message: "Target with this ID does not exist" }]
        };
        res.status(404).json(errorResponse);
        return;
      }

      target.target_amount = target_amount;
      await target.save();

      const successResponse: SuccessResponse<ITarget> = {
        success: true,
        data: target
      };

      res.status(200).json(successResponse);
    } catch (error: any) {
      console.error("Error updating target:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        error: "Internal server error",
        details: [{ field: "server", message: error.message }]
      };
      res.status(500).json(errorResponse);
    }
  }

  public async deleteTarget(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Validation failed",
          details: [{ field: "id", message: "Invalid target ID format" }]
        };
        res.status(400).json(errorResponse);
        return;
      }

      const target = await TargetModel.findById(id);
      if (!target) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Target not found",
          details: [{ field: "id", message: "Target with this ID does not exist" }]
        };
        res.status(404).json(errorResponse);
        return;
      }

      await TargetModel.findByIdAndDelete(id);

      const successResponse: SuccessResponse<{ message: string }> = {
        success: true,
        data: { message: "Target deleted successfully" }
      };

      res.status(200).json(successResponse);
    } catch (error: any) {
      console.error("Error deleting target:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        error: "Internal server error",
        details: [{ field: "server", message: error.message }]
      };
      res.status(500).json(errorResponse);
    }
  }
}

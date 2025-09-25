import { Request, Response } from "express";
import { UserModel, IUser } from "../models/user";
import { ValidationService } from "../services/validationService";
import { CreateUserRequest, ErrorResponse, SuccessResponse } from "../types";
import mongoose from "mongoose";

export class UserController {
  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;
      
      // Validate input data
      const validationErrors = ValidationService.validateUserData(userData);
      if (validationErrors.length > 0) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Validation failed",
          details: validationErrors
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Check if email already exists
      const existingUser = await UserModel.findOne({ email: userData.email });
      if (existingUser) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Validation failed",
          details: [{ field: "email", message: "Email already exists" }]
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Create new user
      const user = new UserModel({
        name: userData.name,
        email: userData.email,
        region: userData.region,
        hire_date: new Date(userData.hire_date),
        status: 'active',
        current_region_start_date: new Date()
      });

      await user.save();

      const successResponse: SuccessResponse<IUser> = {
        success: true,
        data: user
      };

      res.status(201).json(successResponse);
    } catch (error: any) {
      console.error("Error creating user:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        error: "Internal server error",
        details: [{ field: "server", message: error.message }]
      };
      res.status(500).json(errorResponse);
    }
  }

  public async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { region, status } = req.query;
      
      // Build filter object
      const filter: any = {};
      if (region) filter.region = region;
      if (status) filter.status = status;

      const users = await UserModel.find(filter).select('-__v');
      
      const successResponse: SuccessResponse<IUser[]> = {
        success: true,
        data: users
      };

      res.status(200).json(successResponse);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        error: "Internal server error",
        details: [{ field: "server", message: error.message }]
      };
      res.status(500).json(errorResponse);
    }
  }

  public async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Validation failed",
          details: [{ field: "id", message: "Invalid user ID format" }]
        };
        res.status(400).json(errorResponse);
        return;
      }

      const user = await UserModel.findById(id).select('-__v');
      if (!user) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "User not found",
          details: [{ field: "id", message: "User with this ID does not exist" }]
        };
        res.status(404).json(errorResponse);
        return;
      }

      const successResponse: SuccessResponse<IUser> = {
        success: true,
        data: user
      };

      res.status(200).json(successResponse);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        error: "Internal server error",
        details: [{ field: "server", message: error.message }]
      };
      res.status(500).json(errorResponse);
    }
  }

  public async updateUserRegion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { region } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Validation failed",
          details: [{ field: "id", message: "Invalid user ID format" }]
        };
        res.status(400).json(errorResponse);
        return;
      }

      // Validate region
      const validRegions = ['north', 'south', 'east', 'west'];
      if (!region || !validRegions.includes(region)) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Validation failed",
          details: [{ field: "region", message: "Region must be one of: north, south, east, west" }]
        };
        res.status(400).json(errorResponse);
        return;
      }

      const user = await UserModel.findById(id);
      if (!user) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "User not found",
          details: [{ field: "id", message: "User with this ID does not exist" }]
        };
        res.status(404).json(errorResponse);
        return;
      }

      // Update region and current_region_start_date
      user.region = region;
      user.current_region_start_date = new Date();
      await user.save();

      const successResponse: SuccessResponse<IUser> = {
        success: true,
        data: user
      };

      res.status(200).json(successResponse);
    } catch (error: any) {
      console.error("Error updating user region:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        error: "Internal server error",
        details: [{ field: "server", message: error.message }]
      };
      res.status(500).json(errorResponse);
    }
  }

  public async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "Validation failed",
          details: [{ field: "id", message: "Invalid user ID format" }]
        };
        res.status(400).json(errorResponse);
        return;
      }

      const user = await UserModel.findById(id);
      if (!user) {
        const errorResponse: ErrorResponse = {
          success: false,
          error: "User not found",
          details: [{ field: "id", message: "User with this ID does not exist" }]
        };
        res.status(404).json(errorResponse);
        return;
      }

      // Soft delete by setting status to inactive
      user.status = 'inactive';
      await user.save();

      const successResponse: SuccessResponse<{ message: string }> = {
        success: true,
        data: { message: "User deactivated successfully" }
      };

      res.status(200).json(successResponse);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      const errorResponse: ErrorResponse = {
        success: false,
        error: "Internal server error",
        details: [{ field: "server", message: error.message }]
      };
      res.status(500).json(errorResponse);
    }
  }
}

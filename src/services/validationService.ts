import { Request, Response, NextFunction } from 'express';
import { ValidationError, CreateUserRequest, CreateSaleRequest, CreateTargetRequest } from '../types';

export class ValidationService {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateAmount(amount: number): boolean {
    return amount > 0 && Number.isFinite(amount) && Number(amount.toFixed(2)) === amount;
  }

  static validateDate(date: string): boolean {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }

  static validateUserData(data: CreateUserRequest): ValidationError[] {
    const errors: ValidationError[] = [];

    // Name validation
    if (!data.name || typeof data.name !== 'string') {
      errors.push({ field: 'name', message: 'Name is required' });
    } else if (data.name.length < 2 || data.name.length > 50) {
      errors.push({ field: 'name', message: 'Name must be between 2 and 50 characters' });
    }

    // Email validation
    if (!data.email || typeof data.email !== 'string') {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!this.validateEmail(data.email)) {
      errors.push({ field: 'email', message: 'Email format is invalid' });
    }

    // Region validation
    const validRegions = ['north', 'south', 'east', 'west'];
    if (!data.region || !validRegions.includes(data.region)) {
      errors.push({ field: 'region', message: 'Region must be one of: north, south, east, west' });
    }

    // Hire date validation
    if (!data.hire_date || typeof data.hire_date !== 'string') {
      errors.push({ field: 'hire_date', message: 'Hire date is required' });
    } else if (!this.validateDate(data.hire_date)) {
      errors.push({ field: 'hire_date', message: 'Hire date format is invalid' });
    } else {
      const hireDate = new Date(data.hire_date);
      const today = new Date();
      if (hireDate > today) {
        errors.push({ field: 'hire_date', message: 'Hire date cannot be in the future' });
      }
    }

    return errors;
  }

  static validateSaleData(data: CreateSaleRequest): ValidationError[] {
    const errors: ValidationError[] = [];

    // User ID validation
    if (!data.user_id || typeof data.user_id !== 'string') {
      errors.push({ field: 'user_id', message: 'User ID is required' });
    }

    // Amount validation
    if (typeof data.amount !== 'number') {
      errors.push({ field: 'amount', message: 'Amount must be a number' });
    } else if (data.amount <= 0) {
      errors.push({ field: 'amount', message: 'Amount must be positive' });
    } else if (!this.validateAmount(data.amount)) {
      errors.push({ field: 'amount', message: 'Amount must have at most 2 decimal places' });
    }

    // Date validation
    if (!data.date || typeof data.date !== 'string') {
      errors.push({ field: 'date', message: 'Date is required' });
    } else if (!this.validateDate(data.date)) {
      errors.push({ field: 'date', message: 'Date format is invalid' });
    } else {
      const saleDate = new Date(data.date);
      const today = new Date();
      const oneYearFromNow = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
      if (saleDate > oneYearFromNow) {
        errors.push({ field: 'date', message: 'Date cannot be more than 1 year in the future' });
      }
    }

    // Product category validation
    const validCategories = ['software', 'hardware', 'consulting', 'support'];
    if (!data.product_category || !validCategories.includes(data.product_category)) {
      errors.push({ field: 'product_category', message: 'Product category must be one of: software, hardware, consulting, support' });
    }

    // Commission rate validation (optional)
    if (data.commission_rate !== undefined) {
      if (typeof data.commission_rate !== 'number') {
        errors.push({ field: 'commission_rate', message: 'Commission rate must be a number' });
      } else if (data.commission_rate < 0 || data.commission_rate > 20) {
        errors.push({ field: 'commission_rate', message: 'Commission rate must be between 0 and 20' });
      }
    }

    return errors;
  }

  static validateTargetData(data: CreateTargetRequest): ValidationError[] {
    const errors: ValidationError[] = [];

    // User ID validation
    if (!data.user_id || typeof data.user_id !== 'string') {
      errors.push({ field: 'user_id', message: 'User ID is required' });
    }

    // Month validation
    if (typeof data.month !== 'number') {
      errors.push({ field: 'month', message: 'Month must be a number' });
    } else if (data.month < 1 || data.month > 12) {
      errors.push({ field: 'month', message: 'Month must be between 1 and 12' });
    }

    // Year validation
    if (typeof data.year !== 'number') {
      errors.push({ field: 'year', message: 'Year must be a number' });
    } else if (data.year < 2020) {
      errors.push({ field: 'year', message: 'Year must be 2020 or later' });
    }

    // Target amount validation
    if (typeof data.target_amount !== 'number') {
      errors.push({ field: 'target_amount', message: 'Target amount must be a number' });
    } else if (data.target_amount < 0) {
      errors.push({ field: 'target_amount', message: 'Target amount must be positive' });
    }

    return errors;
  }

  static validateBulkSalesData(salesData: CreateSaleRequest[]): { valid: CreateSaleRequest[], errors: Array<{ index: number, errors: ValidationError[] }> } {
    const valid: CreateSaleRequest[] = [];
    const errors: Array<{ index: number, errors: ValidationError[] }> = [];

    salesData.forEach((sale, index) => {
      const validationErrors = this.validateSaleData(sale);
      if (validationErrors.length === 0) {
        valid.push(sale);
      } else {
        errors.push({ index, errors: validationErrors });
      }
    });

    return { valid, errors };
  }
}
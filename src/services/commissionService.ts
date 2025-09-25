import { ISale, SalesModel } from "../models/sales";
import { IUser, UserModel } from "../models/user";
import { ITarget, TargetModel } from "../models/targets";
import { CommissionCalculation } from "../types";
import mongoose from "mongoose";

export class CommissionService {
  private readonly BASE_COMMISSION_RATE = 0.05; // 5%
  private readonly TIER_BONUS_10K = 0.02; // 2% for >$10K
  private readonly TIER_BONUS_25K = 0.04; // 4% for >$25K (replaces 2%)
  private readonly STREAK_BONUS_PER_MONTH = 0.01; // 1% per month
  private readonly MAX_STREAK_BONUS = 0.05; // 5% max
  private readonly PERFORMANCE_PENALTY = 0.02; // 2% penalty

  private readonly REGIONAL_MULTIPLIERS = {
    north: 1.1,
    south: 0.95,
    east: 1.0,
    west: 1.05
  };

  async calculateCommission(
    userId: string, 
    month: number, 
    year: number
  ): Promise<CommissionCalculation> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const target = await TargetModel.findOne({ user_id: userId, month, year });
    const targetAmount = target?.target_amount || 0;

    // Get sales for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    const sales = await SalesModel.find({
      user_id: userId,
      date: { $gte: startDate, $lte: endDate }
    });

    const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);

    // Calculate base commission
    const baseCommission = totalSales * this.BASE_COMMISSION_RATE;

    // Calculate tier bonus
    let tierBonus = 0;
    if (totalSales > 25000) {
      tierBonus = totalSales * this.TIER_BONUS_25K;
    } else if (totalSales > 10000) {
      tierBonus = totalSales * this.TIER_BONUS_10K;
    }

    // Calculate regional multiplier
    const regionalMultiplier = this.REGIONAL_MULTIPLIERS[user.region];

    // Calculate streak bonus
    const streakBonus = await this.calculateStreakBonus(userId, month, year);

    // Calculate performance penalty
    const performancePenalty = await this.calculatePerformancePenalty(userId, month, year);

    // Handle mid-month region transfers
    const regionTransfers = await this.calculateRegionTransfers(userId, month, year, sales);

    // Calculate total commission
    let totalCommission = baseCommission * regionalMultiplier + tierBonus + streakBonus - performancePenalty;

    // Apply region transfer adjustments if any
    if (regionTransfers.length > 0) {
      totalCommission = regionTransfers.reduce((sum, transfer) => sum + transfer.commission, 0) + tierBonus + streakBonus - performancePenalty;
    }

    return {
      userId,
      month,
      year,
      totalSales,
      baseCommission,
      tierBonus,
      regionalMultiplier,
      streakBonus,
      performancePenalty,
      totalCommission: Math.max(0, totalCommission), // Ensure non-negative
      targetHit: totalSales >= targetAmount,
      regionTransfers: regionTransfers.length > 0 ? regionTransfers : undefined
    };
  }

  private async calculateStreakBonus(userId: string, month: number, year: number): Promise<number> {
    let streakMonths = 0;
    let currentMonth = month;
    let currentYear = year;

    while (streakMonths < this.MAX_STREAK_BONUS / this.STREAK_BONUS_PER_MONTH) {
      const target = await TargetModel.findOne({ 
        user_id: userId, 
        month: currentMonth, 
        year: currentYear 
      });
      
      if (!target) break;

      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
      
      const sales = await SalesModel.find({
        user_id: userId,
        date: { $gte: startDate, $lte: endDate }
      });

      const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
      
      if (totalSales >= target.target_amount) {
        streakMonths++;
        currentMonth--;
        if (currentMonth < 1) {
          currentMonth = 12;
          currentYear--;
        }
      } else {
        break;
      }
    }

    return Math.min(streakMonths * this.STREAK_BONUS_PER_MONTH, this.MAX_STREAK_BONUS);
  }

  private async calculatePerformancePenalty(userId: string, month: number, year: number): Promise<number> {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    const target = await TargetModel.findOne({ 
      user_id: userId, 
      month: prevMonth, 
      year: prevYear 
    });
    
    if (!target) return 0;

    const startDate = new Date(prevYear, prevMonth - 1, 1);
    const endDate = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999);
    
    const sales = await SalesModel.find({
      user_id: userId,
      date: { $gte: startDate, $lte: endDate }
    });

    const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const targetPercentage = totalSales / target.target_amount;

    return targetPercentage < 0.5 ? this.PERFORMANCE_PENALTY : 0;
  }

  private async calculateRegionTransfers(
    userId: string, 
    month: number, 
    year: number, 
    sales: ISale[]
  ): Promise<Array<{ region: string, sales: number, days: number, commission: number }>> {
    const user = await UserModel.findById(userId);
    if (!user) return [];

    // Check if user had region transfer during this month
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
    
    if (user.current_region_start_date > monthStart && user.current_region_start_date <= monthEnd) {
      const transferDate = user.current_region_start_date;
      const daysInMonth = new Date(year, month, 0).getDate();
      const daysBeforeTransfer = Math.floor((transferDate.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));
      const daysAfterTransfer = daysInMonth - daysBeforeTransfer;

      // Get previous region (this would need to be stored in a region history table)
      // For now, we'll assume we can determine this from the user's current region
      // In a real implementation, you'd need a region history table
      
      const salesBeforeTransfer = sales.filter(sale => sale.date < transferDate);
      const salesAfterTransfer = sales.filter(sale => sale.date >= transferDate);

      const salesBeforeAmount = salesBeforeTransfer.reduce((sum, sale) => sum + sale.amount, 0);
      const salesAfterAmount = salesAfterTransfer.reduce((sum, sale) => sum + sale.amount, 0);

      // This is a simplified version - in reality you'd need to track region history
      return [
        {
          region: 'previous_region', // This would be the actual previous region
          sales: salesBeforeAmount,
          days: daysBeforeTransfer,
          commission: salesBeforeAmount * this.BASE_COMMISSION_RATE * this.REGIONAL_MULTIPLIERS['north'] // Placeholder
        },
        {
          region: user.region,
          sales: salesAfterAmount,
          days: daysAfterTransfer,
          commission: salesAfterAmount * this.BASE_COMMISSION_RATE * this.REGIONAL_MULTIPLIERS[user.region]
        }
      ];
    }

    return [];
  }

  async processBulkSales(salesData: any[]): Promise<{ 
    success: number, 
    errors: Array<{ index: number, error: string }> 
  }> {
    const results = { success: 0, errors: [] as Array<{ index: number, error: string }> };

    for (let i = 0; i < salesData.length; i++) {
      try {
        const saleData = salesData[i];
        
        // Check if user exists
        const user = await UserModel.findById(saleData.user_id);
        if (!user) {
          results.errors.push({ index: i, error: 'User not found' });
          continue;
        }

        // Check for duplicates (same user, amount, date, product_category)
        const existingSale = await SalesModel.findOne({
          user_id: saleData.user_id,
          amount: saleData.amount,
          date: new Date(saleData.date),
          product_category: saleData.product_category
        });

        if (existingSale) {
          results.errors.push({ index: i, error: 'Duplicate sale found' });
          continue;
        }

        // Create and save the sale
        const sale = new SalesModel({
          user_id: saleData.user_id,
          amount: saleData.amount,
          date: new Date(saleData.date),
          product_category: saleData.product_category,
          commission_rate: saleData.commission_rate || 5
        });

        await sale.save();
        results.success++;
      } catch (error: any) {
        results.errors.push({ index: i, error: error.message });
      }
    }

    return results;
  }
}

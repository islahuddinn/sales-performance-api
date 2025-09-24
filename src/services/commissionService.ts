import { ISale } from "../models/sales";
import { IUser } from "../models/user";

export class CommissionService {
  private commissionRate: number;

  constructor(commissionRate: number) {
    this.commissionRate = commissionRate;
  }

  calculateCommission(sale: ISale, user: IUser): number {
    if (!sale || !user) {
      throw new Error("Sale and User must be provided");
    }
    return sale.amount * this.commissionRate;
  }

  calculateTotalCommission(sales: ISale[], user: IUser): number {
    if (!sales || sales.length === 0 || !user) {
      throw new Error("Sales and User must be provided");
    }
    return sales.reduce(
      (total, sale) => total + this.calculateCommission(sale, user),
      0
    );
  }
}

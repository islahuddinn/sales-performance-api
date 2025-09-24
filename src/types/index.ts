export interface CreateUserRequest {
    username: string;
    password: string;
    email: string;
}

export interface CreateSaleRequest {
    userId: string;
    amount: number;
    date: string;
}

export interface CommissionCalculation {
    userId: string;
    totalSales: number;
    commissionRate: number;
    commissionAmount: number;
}
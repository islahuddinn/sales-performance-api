export interface CreateUserRequest {
    name: string;
    email: string;
    region: 'north' | 'south' | 'east' | 'west';
    hire_date: string;
}

export interface CreateSaleRequest {
    user_id: string;
    amount: number;
    date: string;
    product_category: 'software' | 'hardware' | 'consulting' | 'support';
    commission_rate?: number;
}

export interface CreateTargetRequest {
    user_id: string;
    month: number;
    year: number;
    target_amount: number;
}

export interface CommissionCalculation {
    userId: string;
    month: number;
    year: number;
    totalSales: number;
    baseCommission: number;
    tierBonus: number;
    regionalMultiplier: number;
    streakBonus: number;
    performancePenalty: number;
    totalCommission: number;
    targetHit: boolean;
    regionTransfers?: Array<{
        region: string;
        sales: number;
        days: number;
        commission: number;
    }>;
}

export interface ValidationError {
    field: string;
    message: string;
}

export interface ErrorResponse {
    success: false;
    error: string;
    details: ValidationError[];
}

export interface SuccessResponse<T = any> {
    success: true;
    data: T;
}
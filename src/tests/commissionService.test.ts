import { CommissionService } from "../services/commissionService";
import { UserModel } from "../models/user";
import { SalesModel } from "../models/sales";
import { TargetModel } from "../models/targets";
import mongoose from "mongoose";

// Mock mongoose models
jest.mock("mongoose");
jest.mock("../models/user", () => ({
  UserModel: {
    findById: jest.fn(),
    find: jest.fn(),
    insertMany: jest.fn(),
    deleteMany: jest.fn(),
  },
}));
jest.mock("../models/sales", () => ({
  SalesModel: {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    insertMany: jest.fn(),
    deleteMany: jest.fn(),
  },
}));
jest.mock("../models/targets", () => ({
  TargetModel: {
    findOne: jest.fn(),
    find: jest.fn(),
    insertMany: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

describe("CommissionService", () => {
  let commissionService: CommissionService;
  let mockUser: any;
  let mockSales: any[];
  let mockTarget: any;

  beforeEach(() => {
    commissionService = new CommissionService();

    // Mock user data
    mockUser = {
      _id: "user123",
      name: "Alice Johnson",
      email: "alice@company.com",
      region: "north",
      hire_date: new Date("2024-01-15"),
      status: "active",
      current_region_start_date: new Date("2024-01-15"),
    };

    // Mock sales data
    mockSales = [
      {
        _id: "sale1",
        user_id: "user123",
        amount: 5000,
        date: new Date("2024-12-01"),
        product_category: "software",
        commission_rate: 5,
      },
      {
        _id: "sale2",
        user_id: "user123",
        amount: 3000,
        date: new Date("2024-12-05"),
        product_category: "hardware",
        commission_rate: 5,
      },
      {
        _id: "sale3",
        user_id: "user123",
        amount: 8000,
        date: new Date("2024-12-10"),
        product_category: "consulting",
        commission_rate: 5,
      },
    ];

    // Mock target data
    mockTarget = {
      _id: "target123",
      user_id: "user123",
      month: 12,
      year: 2024,
      target_amount: 20000,
    };

    // Setup mocks
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
    (TargetModel.findOne as jest.Mock).mockResolvedValue(mockTarget);
    (SalesModel.find as jest.Mock).mockResolvedValue(mockSales);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("calculateCommission", () => {
    it("should calculate commission correctly for North region with tier bonus", async () => {
      // Mock sales totaling $16,000 (above $10K tier)
      const highSales = [
        { ...mockSales[0], amount: 8000 },
        { ...mockSales[1], amount: 8000 },
      ];
      (SalesModel.find as jest.Mock).mockResolvedValue(highSales);

      const result = await commissionService.calculateCommission(
        "user123",
        12,
        2024
      );

      expect(result.userId).toBe("user123");
      expect(result.month).toBe(12);
      expect(result.year).toBe(2024);
      expect(result.totalSales).toBe(16000);
      expect(result.baseCommission).toBe(800); // 16000 * 0.05
      expect(result.tierBonus).toBe(320); // 16000 * 0.02 (>10K tier)
      expect(result.regionalMultiplier).toBe(1.1); // North region
      expect(result.targetHit).toBe(false); // 16000 < 20000
    });

    it("should calculate commission correctly for South region", async () => {
      mockUser.region = "south";
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await commissionService.calculateCommission(
        "user123",
        12,
        2024
      );

      expect(result.regionalMultiplier).toBe(0.95); // South region
    });

    it("should calculate commission correctly for East region", async () => {
      mockUser.region = "east";
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await commissionService.calculateCommission(
        "user123",
        12,
        2024
      );

      expect(result.regionalMultiplier).toBe(1.0); // East region
    });

    it("should calculate commission correctly for West region", async () => {
      mockUser.region = "west";
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await commissionService.calculateCommission(
        "user123",
        12,
        2024
      );

      expect(result.regionalMultiplier).toBe(1.05); // West region
    });

    it("should apply tier bonus for sales > $25,000", async () => {
      const highSales = [
        { ...mockSales[0], amount: 15000 },
        { ...mockSales[1], amount: 15000 },
      ];
      (SalesModel.find as jest.Mock).mockResolvedValue(highSales);

      const result = await commissionService.calculateCommission(
        "user123",
        12,
        2024
      );

      expect(result.totalSales).toBe(30000);
      expect(result.tierBonus).toBe(1200); // 30000 * 0.04 (>25K tier)
    });

    it("should handle user not found", async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        commissionService.calculateCommission("nonexistent", 12, 2024)
      ).rejects.toThrow("User not found");
    });

    it("should handle no target set", async () => {
      (TargetModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await commissionService.calculateCommission(
        "user123",
        12,
        2024
      );

      expect(result.targetHit).toBe(false);
    });

    it("should calculate streak bonus correctly", async () => {
      // Mock previous month target and sales (user hit target)
      const prevTarget = {
        ...mockTarget,
        month: 11,
        year: 2024,
        target_amount: 15000,
      };
      const prevSales = [{ ...mockSales[0], amount: 16000 }];

      (TargetModel.findOne as jest.Mock)
        .mockResolvedValueOnce(mockTarget) // Current month target
        .mockResolvedValueOnce(prevTarget); // Previous month target

      (SalesModel.find as jest.Mock)
        .mockResolvedValueOnce(mockSales) // Current month sales
        .mockResolvedValueOnce(prevSales); // Previous month sales

      const result = await commissionService.calculateCommission(
        "user123",
        12,
        2024
      );

      expect(result.streakBonus).toBe(0.01); // 1% streak bonus
    });

    it("should apply performance penalty for previous month < 50% target", async () => {
      // Mock previous month with low sales
      const prevTarget = {
        ...mockTarget,
        month: 11,
        year: 2024,
        target_amount: 20000,
      };
      const prevSales = [{ ...mockSales[0], amount: 8000 }]; // 40% of target

      (TargetModel.findOne as jest.Mock)
        .mockResolvedValueOnce(mockTarget) // Current month target
        .mockResolvedValueOnce(prevTarget); // Previous month target

      (SalesModel.find as jest.Mock)
        .mockResolvedValueOnce(mockSales) // Current month sales
        .mockResolvedValueOnce(prevSales); // Previous month sales

      const result = await commissionService.calculateCommission(
        "user123",
        12,
        2024
      );

      expect(result.performancePenalty).toBe(0.02); // 2% penalty
    });
  });

  describe("processBulkSales", () => {
    it("should process valid sales successfully", async () => {
      const bulkSales = [
        {
          user_id: "user123",
          amount: 1000,
          date: "2024-12-01",
          product_category: "software",
        },
        {
          user_id: "user123",
          amount: 2000,
          date: "2024-12-02",
          product_category: "hardware",
        },
      ];

      // Mock successful save
      const mockSave = jest.fn().mockResolvedValue({});
      (SalesModel as any).mockImplementation(() => ({ save: mockSave }));

      const result = await commissionService.processBulkSales(bulkSales);

      expect(result.success).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle invalid user IDs in bulk sales", async () => {
      const bulkSales = [
        {
          user_id: "nonexistent",
          amount: 1000,
          date: "2024-12-01",
          product_category: "software",
        },
      ];

      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      const result = await commissionService.processBulkSales(bulkSales);

      expect(result.success).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe("User not found");
    });

    it("should detect duplicate sales", async () => {
      const bulkSales = [
        {
          user_id: "user123",
          amount: 1000,
          date: "2024-12-01",
          product_category: "software",
        },
      ];

      // Mock existing sale
      (SalesModel.findOne as jest.Mock).mockResolvedValue({ _id: "existing" });

      const result = await commissionService.processBulkSales(bulkSales);

      expect(result.success).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe("Duplicate sale found");
    });
  });
});

import request from "supertest";
import express from "express";
import { SalesController } from "../controllers/salesController";
import { UserModel } from "../models/user";
import { SalesModel } from "../models/sales";
import { CommissionService } from "../services/commissionService";
import { ValidationService } from "../services/validationService";

// Mock dependencies
jest.mock("../models/user", () => ({
  UserModel: {
    findById: jest.fn(),
    find: jest.fn(),
    insertMany: jest.fn(),
    deleteMany: jest.fn(),
  },
}));
jest.mock("../models/sales", () => ({
  SalesModel: jest.fn().mockImplementation(() => ({
    save: jest.fn(),
  })),
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  insertMany: jest.fn(),
  deleteMany: jest.fn(),
}));
jest.mock("../services/commissionService", () => ({
  CommissionService: jest.fn().mockImplementation(() => ({
    processBulkSales: jest.fn(),
  })),
}));
jest.mock("../services/validationService", () => ({
  ValidationService: {
    validateSaleData: jest.fn(),
    validateBulkSalesData: jest.fn(),
  },
}));

describe("SalesController", () => {
  let app: express.Application;
  let salesController: SalesController;
  let mockUser: any;
  let mockSale: any;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    salesController = new SalesController();

    // Setup routes
    app.post("/api/sales", salesController.createSale.bind(salesController));
    app.post(
      "/api/sales/bulk",
      salesController.bulkImportSales.bind(salesController)
    );
    app.get("/api/sales", salesController.getSales.bind(salesController));
    app.get(
      "/api/sales/:id",
      salesController.getSaleById.bind(salesController)
    );

    // Mock user data
    mockUser = {
      _id: "user123",
      name: "Alice Johnson",
      email: "alice@company.com",
      region: "north",
      hire_date: new Date("2024-01-15"),
      status: "active",
    };

    // Mock sale data
    mockSale = {
      _id: "sale123",
      user_id: "user123",
      amount: 1000,
      date: "2024-12-01T00:00:00.000Z",
      product_category: "software",
      commission_rate: 5,
      createdAt: "2025-09-25T05:27:04.128Z",
      updatedAt: "2025-09-25T05:27:04.128Z",
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/sales", () => {
    it("should create a sale successfully", async () => {
      const saleData = {
        user_id: "user123",
        amount: 1000,
        date: "2024-12-01",
        product_category: "software",
        commission_rate: 5,
      };

      // Mock validation
      (ValidationService.validateSaleData as jest.Mock).mockReturnValue([]);

      // Mock user exists
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

      // Mock sale save
      const mockSave = jest.fn().mockResolvedValue(mockSale);
      (SalesModel as any).mockImplementation(() => ({ save: mockSave }));

      const response = await request(app)
        .post("/api/sales")
        .send(saleData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockSale);
    });

    it("should return validation errors for invalid data", async () => {
      const invalidSaleData = {
        user_id: "user123",
        amount: -100, // Invalid negative amount
        date: "2024-12-01",
        product_category: "software",
      };

      const validationErrors = [
        { field: "amount", message: "Amount must be positive" },
      ];

      (ValidationService.validateSaleData as jest.Mock).mockReturnValue(
        validationErrors
      );

      const response = await request(app)
        .post("/api/sales")
        .send(invalidSaleData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Validation failed");
      expect(response.body.details).toEqual(validationErrors);
    });

    it("should return error for non-existent user", async () => {
      const saleData = {
        user_id: "nonexistent",
        amount: 1000,
        date: "2024-12-01",
        product_category: "software",
      };

      (ValidationService.validateSaleData as jest.Mock).mockReturnValue([]);
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post("/api/sales")
        .send(saleData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details[0].message).toBe("User not found");
    });
  });

  describe("POST /api/sales/bulk", () => {
    it("should process bulk sales successfully", async () => {
      const bulkSalesData = [
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

      const validationResult = {
        valid: bulkSalesData,
        errors: [],
      };

      (ValidationService.validateBulkSalesData as jest.Mock).mockReturnValue(
        validationResult
      );

      const mockCommissionService = {
        processBulkSales: jest.fn().mockResolvedValue({
          success: 2,
          errors: [],
        }),
      };

      // Replace the commission service instance
      (salesController as any).commissionService = mockCommissionService;

      const response = await request(app)
        .post("/api/sales/bulk")
        .send(bulkSalesData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBe(2);
      expect(response.body.data.errors).toHaveLength(0);
    });

    it("should handle mixed valid/invalid bulk sales", async () => {
      const bulkSalesData = [
        {
          user_id: "user123",
          amount: 1000,
          date: "2024-12-01",
          product_category: "software",
        },
        {
          user_id: "user123",
          amount: -500, // Invalid
          date: "2024-12-02",
          product_category: "hardware",
        },
      ];

      const validationResult = {
        valid: [bulkSalesData[0]],
        errors: [
          {
            index: 1,
            errors: [{ field: "amount", message: "Amount must be positive" }],
          },
        ],
      };

      (ValidationService.validateBulkSalesData as jest.Mock).mockReturnValue(
        validationResult
      );

      const mockCommissionService = {
        processBulkSales: jest.fn().mockResolvedValue({
          success: 1,
          errors: [],
        }),
      };

      (salesController as any).commissionService = mockCommissionService;

      const response = await request(app)
        .post("/api/sales/bulk")
        .send(bulkSalesData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBe(1);
      expect(response.body.data.validationErrors).toHaveLength(1);
    });

    it("should return error for non-array request body", async () => {
      const response = await request(app)
        .post("/api/sales/bulk")
        .send({ invalid: "data" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details[0].message).toBe(
        "Request body must be an array"
      );
    });
  });

  describe("GET /api/sales", () => {
    it("should return sales list", async () => {
      const mockSales = [mockSale];
      (SalesModel.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockSales),
          }),
        }),
      });

      const response = await request(app).get("/api/sales").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockSales);
    });

    it("should filter sales by user_id", async () => {
      const mockSales = [mockSale];
      (SalesModel.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockSales),
          }),
        }),
      });

      const response = await request(app)
        .get("/api/sales?user_id=user123")
        .expect(200);

      expect(SalesModel.find).toHaveBeenCalledWith({ user_id: "user123" });
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/sales/:id", () => {
    it("should return sale by ID", async () => {
      (SalesModel.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockSale),
        }),
      });

      const response = await request(app)
        .get("/api/sales/507f1f77bcf86cd799439011") // Valid ObjectId format
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockSale);
    });

    it("should return error for invalid sale ID", async () => {
      const response = await request(app)
        .get("/api/sales/invalid-id")
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details[0].message).toBe("Invalid sale ID format");
    });

    it("should return error for non-existent sale", async () => {
      (SalesModel.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(null),
        }),
      });

      const response = await request(app)
        .get("/api/sales/507f1f77bcf86cd799439011")
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.details[0].message).toBe(
        "Sale with this ID does not exist"
      );
    });
  });
});

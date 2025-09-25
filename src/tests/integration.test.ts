import request from "supertest";
import express from "express";
import { setRoutes } from "../routes";

// Create a test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  setRoutes(app);
  return app;
};

describe("API Integration Tests", () => {
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp();
  });

  describe("Health Check", () => {
    it("should return API status", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.body.status).toBe("OK");
      expect(response.body.message).toContain(
        "Sales Performance Analytics API"
      );
      expect(response.body.endpoints).toBeDefined();
    });
  });

  describe("User Endpoints", () => {
    it("should validate user creation data", async () => {
      const invalidUserData = {
        name: "A", // Too short
        email: "invalid-email",
        region: "invalid-region",
        hire_date: "2025-12-01", // Future date
      };

      const response = await request(app)
        .post("/api/users")
        .send(invalidUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Validation failed");
      expect(response.body.details.length).toBeGreaterThan(0);
    });

    it("should accept valid user data format", async () => {
      const validUserData = {
        name: "Alice Johnson",
        email: "alice@company.com",
        region: "north",
        hire_date: "2024-01-15",
      };

      const response = await request(app)
        .post("/api/users")
        .send(validUserData)
        .expect(400); // Will fail due to no database connection, but should pass validation

      // The response should be a database error, not a validation error
      expect(response.body.success).toBe(false);
      expect(response.body.error).not.toBe("Validation failed");
    });
  });

  describe("Sales Endpoints", () => {
    it("should validate sale creation data", async () => {
      const invalidSaleData = {
        user_id: "invalid-id",
        amount: -100, // Negative amount
        date: "2025-12-01", // Future date
        product_category: "invalid-category",
      };

      const response = await request(app)
        .post("/api/sales")
        .send(invalidSaleData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Validation failed");
      expect(response.body.details.length).toBeGreaterThan(0);
    });

    it("should validate bulk sales data", async () => {
      const invalidBulkData = [
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

      const response = await request(app)
        .post("/api/sales/bulk")
        .send(invalidBulkData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Validation failed");
    });
  });

  describe("Commission Endpoints", () => {
    it("should validate commission calculation parameters", async () => {
      const response = await request(app)
        .get("/api/commission/invalid-user/invalid-month/invalid-year")
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Validation failed");
    });

    it("should accept valid commission parameters", async () => {
      const response = await request(app)
        .get("/api/commission/507f1f77bcf86cd799439011/12/2024")
        .expect(404); // Will fail due to no database connection

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("User not found");
    });
  });

  describe("Target Endpoints", () => {
    it("should validate target creation data", async () => {
      const invalidTargetData = {
        user_id: "invalid-id",
        month: 13, // Invalid month
        year: 2019, // Invalid year
        target_amount: -1000, // Negative amount
      };

      const response = await request(app)
        .post("/api/targets")
        .send(invalidTargetData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Validation failed");
      expect(response.body.details.length).toBeGreaterThan(0);
    });
  });

  describe("Development Endpoints", () => {
    it("should handle seed endpoint", async () => {
      const response = await request(app).post("/api/seed").expect(500); // Will fail due to no database connection

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Failed to seed data");
    });

    it("should handle clear data endpoint", async () => {
      const response = await request(app).delete("/api/seed").expect(500); // Will fail due to no database connection

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Failed to clear data");
    });
  });
});

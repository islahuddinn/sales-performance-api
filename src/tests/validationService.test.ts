import { ValidationService } from "../services/validationService";
import {
  CreateUserRequest,
  CreateSaleRequest,
  CreateTargetRequest,
} from "../types";

describe("ValidationService", () => {
  describe("validateEmail", () => {
    it("should return true for valid email", () => {
      expect(ValidationService.validateEmail("test@example.com")).toBe(true);
      expect(
        ValidationService.validateEmail("user.name+tag@domain.co.uk")
      ).toBe(true);
    });

    it("should return false for invalid email", () => {
      expect(ValidationService.validateEmail("invalid-email")).toBe(false);
      expect(ValidationService.validateEmail("test@")).toBe(false);
      expect(ValidationService.validateEmail("@example.com")).toBe(false);
    });
  });

  describe("validateAmount", () => {
    it("should return true for valid amounts", () => {
      expect(ValidationService.validateAmount(100)).toBe(true);
      expect(ValidationService.validateAmount(100.5)).toBe(true);
      expect(ValidationService.validateAmount(0.01)).toBe(true);
    });

    it("should return false for invalid amounts", () => {
      expect(ValidationService.validateAmount(-100)).toBe(false);
      expect(ValidationService.validateAmount(0)).toBe(false);
      expect(ValidationService.validateAmount(100.123)).toBe(false); // More than 2 decimal places
    });
  });

  describe("validateDate", () => {
    it("should return true for valid dates", () => {
      expect(ValidationService.validateDate("2024-12-01")).toBe(true);
      expect(ValidationService.validateDate("2024-12-01T10:30:00Z")).toBe(true);
    });

    it("should return false for invalid dates", () => {
      expect(ValidationService.validateDate("invalid-date")).toBe(false);
      expect(ValidationService.validateDate("2024-13-01")).toBe(false);
    });
  });

  describe("validateUserData", () => {
    it("should return no errors for valid user data", () => {
      const validUserData: CreateUserRequest = {
        name: "Alice Johnson",
        email: "alice@company.com",
        region: "north",
        hire_date: "2024-01-15",
      };

      const errors = ValidationService.validateUserData(validUserData);
      expect(errors).toHaveLength(0);
    });

    it("should return errors for invalid name", () => {
      const invalidUserData: CreateUserRequest = {
        name: "A", // Too short
        email: "alice@company.com",
        region: "north",
        hire_date: "2024-01-15",
      };

      const errors = ValidationService.validateUserData(invalidUserData);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("name");
      expect(errors[0].message).toContain("between 2 and 50 characters");
    });

    it("should return errors for invalid email", () => {
      const invalidUserData: CreateUserRequest = {
        name: "Alice Johnson",
        email: "invalid-email",
        region: "north",
        hire_date: "2024-01-15",
      };

      const errors = ValidationService.validateUserData(invalidUserData);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("email");
      expect(errors[0].message).toContain("Email format is invalid");
    });

    it("should return errors for invalid region", () => {
      const invalidUserData: CreateUserRequest = {
        name: "Alice Johnson",
        email: "alice@company.com",
        region: "invalid-region" as any,
        hire_date: "2024-01-15",
      };

      const errors = ValidationService.validateUserData(invalidUserData);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("region");
      expect(errors[0].message).toContain("Region must be one of");
    });

    it("should return errors for future hire date", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidUserData: CreateUserRequest = {
        name: "Alice Johnson",
        email: "alice@company.com",
        region: "north",
        hire_date: futureDate.toISOString().split("T")[0],
      };

      const errors = ValidationService.validateUserData(invalidUserData);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("hire_date");
      expect(errors[0].message).toContain("cannot be in the future");
    });
  });

  describe("validateSaleData", () => {
    it("should return no errors for valid sale data", () => {
      const validSaleData: CreateSaleRequest = {
        user_id: "user123",
        amount: 1000,
        date: "2024-12-01",
        product_category: "software",
        commission_rate: 5,
      };

      const errors = ValidationService.validateSaleData(validSaleData);
      expect(errors).toHaveLength(0);
    });

    it("should return errors for negative amount", () => {
      const invalidSaleData: CreateSaleRequest = {
        user_id: "user123",
        amount: -100,
        date: "2024-12-01",
        product_category: "software",
      };

      const errors = ValidationService.validateSaleData(invalidSaleData);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("amount");
      expect(errors[0].message).toContain("Amount must be positive");
    });

    it("should return errors for invalid product category", () => {
      const invalidSaleData: CreateSaleRequest = {
        user_id: "user123",
        amount: 1000,
        date: "2024-12-01",
        product_category: "invalid-category" as any,
      };

      const errors = ValidationService.validateSaleData(invalidSaleData);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("product_category");
      expect(errors[0].message).toContain("Product category must be one of");
    });

    it("should return errors for commission rate out of range", () => {
      const invalidSaleData: CreateSaleRequest = {
        user_id: "user123",
        amount: 1000,
        date: "2024-12-01",
        product_category: "software",
        commission_rate: 25, // Invalid: > 20%
      };

      const errors = ValidationService.validateSaleData(invalidSaleData);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("commission_rate");
      expect(errors[0].message).toContain(
        "Commission rate must be between 0 and 20"
      );
    });

    it("should return errors for date more than 1 year in future", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      const invalidSaleData: CreateSaleRequest = {
        user_id: "user123",
        amount: 1000,
        date: futureDate.toISOString().split("T")[0],
        product_category: "software",
      };

      const errors = ValidationService.validateSaleData(invalidSaleData);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("date");
      expect(errors[0].message).toContain(
        "Date cannot be more than 1 year in the future"
      );
    });
  });

  describe("validateTargetData", () => {
    it("should return no errors for valid target data", () => {
      const validTargetData: CreateTargetRequest = {
        user_id: "user123",
        month: 12,
        year: 2024,
        target_amount: 20000,
      };

      const errors = ValidationService.validateTargetData(validTargetData);
      expect(errors).toHaveLength(0);
    });

    it("should return errors for invalid month", () => {
      const invalidTargetData: CreateTargetRequest = {
        user_id: "user123",
        month: 13, // Invalid month
        year: 2024,
        target_amount: 20000,
      };

      const errors = ValidationService.validateTargetData(invalidTargetData);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("month");
      expect(errors[0].message).toContain("Month must be between 1 and 12");
    });

    it("should return errors for invalid year", () => {
      const invalidTargetData: CreateTargetRequest = {
        user_id: "user123",
        month: 12,
        year: 2019, // Invalid year (< 2020)
        target_amount: 20000,
      };

      const errors = ValidationService.validateTargetData(invalidTargetData);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("year");
      expect(errors[0].message).toContain("Year must be 2020 or later");
    });

    it("should return errors for negative target amount", () => {
      const invalidTargetData: CreateTargetRequest = {
        user_id: "user123",
        month: 12,
        year: 2024,
        target_amount: -1000, // Invalid negative amount
      };

      const errors = ValidationService.validateTargetData(invalidTargetData);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe("target_amount");
      expect(errors[0].message).toContain("Target amount must be positive");
    });
  });

  describe("validateBulkSalesData", () => {
    it("should separate valid and invalid sales", () => {
      const bulkSalesData: CreateSaleRequest[] = [
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
        {
          user_id: "user123",
          amount: 2000,
          date: "2024-12-03",
          product_category: "consulting",
        },
      ];

      const result = ValidationService.validateBulkSalesData(bulkSalesData);

      expect(result.valid).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].index).toBe(1);
      expect(result.errors[0].errors[0].field).toBe("amount");
    });

    it("should handle empty array", () => {
      const result = ValidationService.validateBulkSalesData([]);

      expect(result.valid).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle all invalid data", () => {
      const invalidSalesData: CreateSaleRequest[] = [
        {
          user_id: "user123",
          amount: -100,
          date: "invalid-date",
          product_category: "invalid-category" as any,
        },
      ];

      const result = ValidationService.validateBulkSalesData(invalidSalesData);

      expect(result.valid).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].errors.length).toBeGreaterThan(0);
    });
  });
});

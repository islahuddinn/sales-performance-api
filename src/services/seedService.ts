import { UserModel } from "../models/user";
import { SalesModel } from "../models/sales";
import { TargetModel } from "../models/targets";
import mongoose from "mongoose";

export class SeedService {
  static async seedSampleData(): Promise<void> {
    try {
      console.log("🌱 Starting to seed sample data...");

      // Clear existing data
      await UserModel.deleteMany({});
      await SalesModel.deleteMany({});
      await TargetModel.deleteMany({});

      // Create sample users
      const sampleUsers = [
        {
          name: "Alice Johnson",
          email: "alice@company.com",
          region: "north" as const,
          hire_date: new Date("2024-01-15"),
          status: "active" as const,
          current_region_start_date: new Date("2024-01-15")
        },
        {
          name: "Bob Chen",
          email: "bob@company.com",
          region: "south" as const,
          hire_date: new Date("2024-03-01"),
          status: "active" as const,
          current_region_start_date: new Date("2024-03-01")
        },
        {
          name: "Carol Williams",
          email: "carol@company.com",
          region: "east" as const,
          hire_date: new Date("2024-02-10"),
          status: "active" as const,
          current_region_start_date: new Date("2024-02-10")
        },
        {
          name: "David Brown",
          email: "david@company.com",
          region: "west" as const,
          hire_date: new Date("2024-04-05"),
          status: "active" as const,
          current_region_start_date: new Date("2024-04-05")
        }
      ];

      const users = await UserModel.insertMany(sampleUsers);
      console.log(`✅ Created ${users.length} users`);

      // Create sample targets for December 2024
      const sampleTargets = [
        { user_id: users[0]._id, month: 12, year: 2024, target_amount: 20000 },
        { user_id: users[1]._id, month: 12, year: 2024, target_amount: 15000 },
        { user_id: users[2]._id, month: 12, year: 2024, target_amount: 18000 },
        { user_id: users[3]._id, month: 12, year: 2024, target_amount: 22000 }
      ];

      await TargetModel.insertMany(sampleTargets);
      console.log(`✅ Created ${sampleTargets.length} targets`);

      // Create sample sales for December 2024
      const sampleSales = [
        // Alice's sales (North region)
        {
          user_id: users[0]._id,
          amount: 5000,
          date: new Date("2024-12-01"),
          product_category: "software" as const,
          commission_rate: 5
        },
        {
          user_id: users[0]._id,
          amount: 3000,
          date: new Date("2024-12-05"),
          product_category: "hardware" as const,
          commission_rate: 5
        },
        {
          user_id: users[0]._id,
          amount: 8000,
          date: new Date("2024-12-10"),
          product_category: "consulting" as const,
          commission_rate: 5
        },
        {
          user_id: users[0]._id,
          amount: 4000,
          date: new Date("2024-12-15"),
          product_category: "support" as const,
          commission_rate: 5
        },

        // Bob's sales (South region)
        {
          user_id: users[1]._id,
          amount: 2500,
          date: new Date("2024-12-02"),
          product_category: "software" as const,
          commission_rate: 5
        },
        {
          user_id: users[1]._id,
          amount: 4500,
          date: new Date("2024-12-08"),
          product_category: "hardware" as const,
          commission_rate: 5
        },
        {
          user_id: users[1]._id,
          amount: 6000,
          date: new Date("2024-12-12"),
          product_category: "consulting" as const,
          commission_rate: 5
        },
        {
          user_id: users[1]._id,
          amount: 2000,
          date: new Date("2024-12-18"),
          product_category: "support" as const,
          commission_rate: 5
        },

        // Carol's sales (East region)
        {
          user_id: users[2]._id,
          amount: 3500,
          date: new Date("2024-12-03"),
          product_category: "software" as const,
          commission_rate: 5
        },
        {
          user_id: users[2]._id,
          amount: 5500,
          date: new Date("2024-12-07"),
          product_category: "hardware" as const,
          commission_rate: 5
        },
        {
          user_id: users[2]._id,
          amount: 7000,
          date: new Date("2024-12-14"),
          product_category: "consulting" as const,
          commission_rate: 5
        },
        {
          user_id: users[2]._id,
          amount: 2000,
          date: new Date("2024-12-20"),
          product_category: "support" as const,
          commission_rate: 5
        },

        // David's sales (West region)
        {
          user_id: users[3]._id,
          amount: 4000,
          date: new Date("2024-12-04"),
          product_category: "software" as const,
          commission_rate: 5
        },
        {
          user_id: users[3]._id,
          amount: 6000,
          date: new Date("2024-12-09"),
          product_category: "hardware" as const,
          commission_rate: 5
        },
        {
          user_id: users[3]._id,
          amount: 8000,
          date: new Date("2024-12-16"),
          product_category: "consulting" as const,
          commission_rate: 5
        },
        {
          user_id: users[3]._id,
          amount: 4000,
          date: new Date("2024-12-22"),
          product_category: "support" as const,
          commission_rate: 5
        }
      ];

      await SalesModel.insertMany(sampleSales);
      console.log(`✅ Created ${sampleSales.length} sales`);

      // Create targets for November 2024 (for streak bonus testing)
      const novemberTargets = [
        { user_id: users[0]._id, month: 11, year: 2024, target_amount: 18000 },
        { user_id: users[1]._id, month: 11, year: 2024, target_amount: 12000 },
        { user_id: users[2]._id, month: 11, year: 2024, target_amount: 15000 },
        { user_id: users[3]._id, month: 11, year: 2024, target_amount: 20000 }
      ];

      await TargetModel.insertMany(novemberTargets);
      console.log(`✅ Created ${novemberTargets.length} November targets`);

      // Create November sales (users hitting targets for streak bonus)
      const novemberSales = [
        {
          user_id: users[0]._id,
          amount: 19000,
          date: new Date("2024-11-15"),
          product_category: "software" as const,
          commission_rate: 5
        },
        {
          user_id: users[1]._id,
          amount: 13000,
          date: new Date("2024-11-20"),
          product_category: "hardware" as const,
          commission_rate: 5
        },
        {
          user_id: users[2]._id,
          amount: 16000,
          date: new Date("2024-11-25"),
          product_category: "consulting" as const,
          commission_rate: 5
        },
        {
          user_id: users[3]._id,
          amount: 21000,
          date: new Date("2024-11-30"),
          product_category: "support" as const,
          commission_rate: 5
        }
      ];

      await SalesModel.insertMany(novemberSales);
      console.log(`✅ Created ${novemberSales.length} November sales`);

      console.log("🎉 Sample data seeding completed successfully!");
      console.log("\n📊 Sample Data Summary:");
      console.log(`👥 Users: ${users.length}`);
      console.log(`🎯 Targets: ${sampleTargets.length + novemberTargets.length}`);
      console.log(`💰 Sales: ${sampleSales.length + novemberSales.length}`);
      console.log("\n🔍 You can now test the commission calculations!");

    } catch (error) {
      console.error("❌ Error seeding sample data:", error);
      throw error;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      console.log("🧹 Clearing all data...");
      await UserModel.deleteMany({});
      await SalesModel.deleteMany({});
      await TargetModel.deleteMany({});
      console.log("✅ All data cleared");
    } catch (error) {
      console.error("❌ Error clearing data:", error);
      throw error;
    }
  }
}

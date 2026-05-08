import mongoose from "mongoose";
import config from "../config/config";
import { Categories } from "../modules/categories/categories.model";
import { Products } from "../modules/products/products.model";
import * as fs from "fs";
import * as path from "path";
import { loadJson } from "./helpers";
import { User } from "../modules/users/users.model";
import bcrypt from "bcrypt";

const seed = async () => {
  try {
    await mongoose.connect(config.dbUri);
    console.log("Connected to database");

    // Clear existing data
    await Promise.all([
      Categories.deleteMany({}),
      Products.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log("Cleared existing data");

    // Seed users (if needed, not shown here)
    const usersData = loadJson("users.json");

    // Hash passwords before inserting users
    for (const user of usersData) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }

    await User.insertMany(usersData);
    console.log("Seeded users");

    // Seed categories
    const categoriesData = loadJson("category.json");
    const insertedCategories = await Categories.insertMany(categoriesData);
    console.log("Seeded categories");

    // Map category names to their ObjectIds
    const categoryMap = Object.fromEntries(
      insertedCategories.map((cat) => [cat.name, cat._id]),
    );

    // Seed products
    const productsData = loadJson("product.json");
    // Replace category name with ObjectId and validate
    const productsWithCategoryIds = productsData.map((product: any) => {
      const categoryId = categoryMap[product.category];
      if (!categoryId) {
        throw new Error(
          `Category not found for product: ${product.name} (category: ${product.category})`,
        );
      }
      return {
        ...product,
        category: categoryId,
      };
    });
    await Products.insertMany(productsWithCategoryIds);
    console.log("Seeded products");

    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seed();

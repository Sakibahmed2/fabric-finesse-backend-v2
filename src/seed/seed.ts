import mongoose from "mongoose";
import config from "../config/config";
import { Categories } from "../modules/categories/categories.model";
import { Products } from "../modules/products/products.model";
import * as fs from "fs";
import * as path from "path";
import { loadJson } from "./helpers";

const seed = async () => {
  try {
    await mongoose.connect(config.dbUri);
    console.log("Connected to database");

    // Clear existing data
    await Promise.all([Categories.deleteMany({}), Products.deleteMany({})]);
    console.log("Cleared existing data");

    // Seed categories
    const categoriesData = loadJson("category.json");
    const insertedCategories = await Categories.insertMany(categoriesData);
    console.log("Seeded categories");

    // Map category names to their ObjectIds
    const categoryMap = Object.fromEntries(
      insertedCategories.map((cat) => [cat.name, cat._id])
    );

    // Seed products
    const productsData = loadJson("product.json");
    // Replace category name with ObjectId and validate
    const productsWithCategoryIds = productsData.map((product: any) => {
      const categoryId = categoryMap[product.category];
      if (!categoryId) {
        throw new Error(
          `Category not found for product: ${product.name} (category: ${product.category})`
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

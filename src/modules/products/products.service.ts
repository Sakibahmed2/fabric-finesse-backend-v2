import mongoose from "mongoose";
import { buildQuery } from "../../builder/queryBuilder";
import { Categories } from "../categories/categories.model";
import { Products } from "./products.model";
import { TProducts } from "./products.type";

const createProducts = async (payload: TProducts) => {
  // check if slug exists
  const isSlugExists = await Products.findOne({ slug: payload.slug });
  if (isSlugExists) {
    throw new Error("Product with this slug already exists");
  }

  // Validate category: must not be empty array or missing
  if (
    !payload.category ||
    (Array.isArray(payload.category) && payload.category.length === 0)
  ) {
    throw new Error("Category is required and cannot be empty");
  }

  // check if category exists
  const isCategoryExists = await Categories.findById(payload.category);
  if (!isCategoryExists) {
    throw new Error("Category not found");
  }

  const slug = payload.slug.toLowerCase().replace(/ /g, "-");
  payload.slug = slug;

  const result = await Products.create(payload);
  return result;
};

const getAllProducts = async (query: any) => {
  // Support both 'category' (single) and 'categories' (array) in query
  let sanitizedCategories: string[] | undefined = undefined;
  if (Array.isArray(query.categories) && query.categories.length > 0) {
    sanitizedCategories = query.categories;
  } else if (
    typeof query.categories === "string" &&
    query.categories !== "null" &&
    query.categories !== ""
  ) {
    sanitizedCategories = [query.categories];
  } else if (query.category && query.category !== "null") {
    sanitizedCategories = [query.category];
  }

  // Accept both 'colors' and 'sizes' as arrays or single values
  const sanitizedColors =
    Array.isArray(query.colors) && query.colors.length > 0
      ? query.colors
      : typeof query.colors === "string" &&
        query.colors !== "null" &&
        query.colors !== ""
      ? [query.colors]
      : undefined;
  const sanitizedSizes =
    Array.isArray(query.sizes) && query.sizes.length > 0
      ? query.sizes
      : typeof query.sizes === "string" &&
        query.sizes !== "null" &&
        query.sizes !== ""
      ? [query.sizes]
      : undefined;

  const filters: Record<string, any> = {};
  if (sanitizedCategories && sanitizedCategories.length > 0) {
    // Convert all to ObjectId if valid
    const categoryIds = sanitizedCategories.map((cat) =>
      mongoose.Types.ObjectId.isValid(cat)
        ? new mongoose.Types.ObjectId(cat)
        : cat
    );
    filters.category = { $in: categoryIds };
  }
  if (sanitizedColors) filters.colors = { $in: sanitizedColors };
  if (sanitizedSizes) filters.sizes = { $in: sanitizedSizes };

  const { filter, page, limit, skip } = buildQuery({
    search: query.search,
    searchFields: ["name", "description", "slug", "sizes", "colors"],
    page: query.page,
    limit: query.limit,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    filters,
  });

  const products = await Products.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
        pipeline: [{ $project: { name: 1 } }],
      },
    },
    { $unwind: "$category" },
    {
      $sort:
        query.sort && Object.keys(query.sort).length
          ? query.sort
          : { createdAt: -1 },
    },
    { $skip: skip },
    { $limit: limit },
  ]);

  const total = await Products.countDocuments(filter);

  return {
    result: products,
    pagination: {
      total,
      page,
      limit,
    },
  };
};

const getSingleProductWithSlug = async (slug: string) => {
  // check if product with slug exists
  const isProductExist = await Products.findOne({ slug }).populate("category");
  if (!isProductExist) {
    throw new Error("Product not found");
  }

  return isProductExist;
};

const getProductById = async (id: string) => {
  const product = await Products.findById(id).populate("category");
  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

const updateProductById = async (id: string, payload: Partial<TProducts>) => {
  const updatedProduct = await Products.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!updatedProduct) {
    throw new Error("Product not found");
  }

  return updatedProduct;
};

const deleteProduct = async (id: string) => {
  const deletedProduct = await Products.findByIdAndDelete(id);
  if (!deletedProduct) {
    throw new Error("Product not found");
  }
  return deletedProduct;
};

export const productService = {
  createProducts,
  getAllProducts,
  getSingleProductWithSlug,
  getProductById,
  updateProductById,
  deleteProduct,
};

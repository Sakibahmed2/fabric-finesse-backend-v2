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
  const { filter, page, limit, skip } = buildQuery({
    search: query.search,
    searchFields: ["name", "description", "slug"],
    page: query.page,
    limit: query.limit,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    filters: {
      ...(query.category && { category: query.category }),
    },
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

import { Products } from "./products.model";
import { TProductQuery, TProducts } from "./products.type";

const createProducts = async (payload: TProducts) => {
  // check if slug exists
  const isSlugExists = await Products.findOne({ slug: payload.slug });
  if (isSlugExists) {
    throw new Error("Product with this slug already exists");
  }

  const slug = payload.slug.toLowerCase().replace(/ /g, "-");
  payload.slug = slug;

  const result = await Products.create(payload);
  return result;
};

const getAllProducts = async (query: TProductQuery) => {
  const filter: Record<string, any> = {};

  if (query.category) {
    filter.category = query.category;
  }
  if (query.minPrice && query.maxPrice) {
    filter.price = {
      $gte: Number(query.minPrice),
      $lte: Number(query.maxPrice),
    };
  }
  if (query.search) {
    filter.name = { $regex: query.search, $options: "i" };
    filter.description = { $regex: query.search, $options: "i" };
    filter.$or = [{ slug: filter.slug }];
  }

  const skip =
    query.page && query.limit
      ? (Number(query.page) - 1) * Number(query.limit)
      : 0;
  const limit = query.limit ? Number(query.limit) : 10;

  const products = await Products.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    { $skip: skip },
    { $limit: limit },
  ]);

  const pagination = {
    page: query.page ? Number(query.page) : 1,
    limit: limit,
    total: await Products.countDocuments(filter),
  };

  return {
    products,
    pagination,
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

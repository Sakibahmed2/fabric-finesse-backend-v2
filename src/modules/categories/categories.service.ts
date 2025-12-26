import { buildQuery } from "../../builder/queryBuilder";
import { Categories } from "./categories.model";
import { TCategory } from "./categories.type";

const createCategory = async (categoryData: TCategory) => {
  // Check if category with the same name already exists
  const isCategoryExist = await Categories.findOne({ name: categoryData.name });
  if (isCategoryExist) {
    throw new Error("Category already exists");
  }

  const result = await Categories.create(categoryData);
  return result;
};

const getAllCategories = async (query: any) => {
  const { filter, page, limit, sort } = buildQuery({
    search: query.search,
    searchFields: ["name"],
    page: query.page,
    limit: query.limit,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    filters: {},
  });

  const result = await Categories.aggregate([
    { $match: filter },
    {
      $sort: Object.keys(sort).length ? sort : { createdAt: -1 },
    },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ]);

  const total = await Categories.countDocuments(filter);

  if (total === 0) {
    throw new Error("No categories found");
  }

  return {
    result,
    pagination: {
      total,
      page,
      limit,
    },
  };
};

const getCategoryById = async (id: string) => {
  const category = await Categories.findById(id);
  if (!category) {
    throw new Error("Category not found");
  }
  return category;
};

const updateCategory = async (id: string, updateData: Partial<TCategory>) => {
  const updatedCategory = await Categories.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  if (!updatedCategory) {
    throw new Error("Category not found");
  }
  return updatedCategory;
};

const deleteCategory = async (id: string) => {
  const deletedCategory = await Categories.findByIdAndDelete(id);
  if (!deletedCategory) {
    throw new Error("Category not found");
  }
  return deletedCategory;
};

export const categoriesService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { categoriesService } from "./categories.service";

const createCategory = catchAsync(async (req, res) => {
  const { name } = req.body;
  const result = await categoriesService.createCategory({ name });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

const getAllCategories = catchAsync(async (req, res) => {
  const result = await categoriesService.getAllCategories(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Categories retrieved successfully",
    data: result,
  });
});

const getCategoryById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await categoriesService.getCategoryById(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category retrieved successfully",
    data: result,
  });
});

const updateCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const result = await categoriesService.updateCategory(
    id as string,
    updateData
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await categoriesService.deleteCategory(id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category deleted successfully",
    data: result,
  });
});

export const categoriesController = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};

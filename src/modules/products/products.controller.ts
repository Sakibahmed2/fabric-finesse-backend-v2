import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { productService } from "./products.service";
import { TProducts } from "./products.type";

const createProducts = catchAsync(async (req, res) => {
  const payload: TProducts = req.body;
  const result = await productService.createProducts(payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});

const getAllProducts = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await productService.getAllProducts(query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Products retrieved successfully",
    data: result,
  });
});

const getSingleProductWithSlug = catchAsync(async (req, res) => {
  const { slug } = req.params;
  const result = await productService.getSingleProductWithSlug(slug as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

const getProductById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await productService.getProductById(id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product retrieved successfully",
    data: result,
  });
});

const updateProductById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload: Partial<TProducts> = req.body;
  const result = await productService.updateProductById(id as string, payload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product updated successfully",
    data: result,
  });
});

const deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await productService.deleteProduct(id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Product deleted successfully",
    data: result,
  });
});

export const productsController = {
  createProducts,
  getAllProducts,
  getSingleProductWithSlug,
  getProductById,
  updateProductById,
  deleteProduct,
};

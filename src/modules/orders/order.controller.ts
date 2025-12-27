import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { orderService } from "./order.service";

const createOrder = catchAsync(async (req, res) => {
  const result = await orderService.createOrder(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Order created successfully",
    data: result,
  });
});

const getAllOrders = catchAsync(async (req, res) => {
  const result = await orderService.getAllOrders(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Orders retrieved successfully",
    data: result,
  });
});

const getSingleOrderByUserId = catchAsync(async (req, res) => {
  const { user_id } = req.params;
  const result = await orderService.getSingleOrderByUserId(user_id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Order retrieved successfully",
    data: result,
  });
});

const deleteOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await orderService.deleteOrder(id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Order deleted successfully",
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await orderService.updateOrderStatus(id as string, status);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Order status updated successfully",
    data: result,
  });
});

export const orderController = {
  createOrder,
  getAllOrders,
  getSingleOrderByUserId,
  deleteOrder,
  updateOrderStatus,
};

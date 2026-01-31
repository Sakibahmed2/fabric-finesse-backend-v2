import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { couponService } from "./coupon.service";
import { TCoupon } from "./coupon.type";

const createCoupon = catchAsync(async (req, res) => {
  const payload: TCoupon = req.body;
  const result = await couponService.createCoupon(payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Coupon created successfully",
    data: result,
  });
});

const getAllCoupons = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await couponService.getAllCoupons(query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupons retrieved successfully",
    data: result,
  });
});

const getCouponById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await couponService.getCouponById(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon retrieved successfully",
    data: result,
  });
});

const getCouponByCode = catchAsync(async (req, res) => {
  const { code } = req.params;
  const result = await couponService.getCouponByCode(code as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon retrieved successfully",
    data: result,
  });
});

const updateCouponById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload: Partial<TCoupon> = req.body;
  const result = await couponService.updateCouponById(id as string, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon updated successfully",
    data: result,
  });
});

const deleteCoupon = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await couponService.deleteCoupon(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon deleted successfully",
    data: result,
  });
});

const validateCoupon = catchAsync(async (req, res) => {
  const { code, userId, orderAmount } = req.body;

  if (!code || !userId || !orderAmount) {
    throw new Error("Code, userId, and orderAmount are required");
  }

  const result = await couponService.validateCoupon(code, userId, orderAmount);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon validated successfully",
    data: result,
  });
});

const applyCoupon = catchAsync(async (req, res) => {
  const { code, userId, orderAmount } = req.body;

  if (!code || !userId || !orderAmount) {
    throw new Error("Code, userId, and orderAmount are required");
  }

  const result = await couponService.applyCoupon(code, userId, orderAmount);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon applied successfully",
    data: result,
  });
});

const getCouponStats = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await couponService.getCouponStats(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Coupon statistics retrieved successfully",
    data: result,
  });
});

export const couponController = {
  createCoupon,
  getAllCoupons,
  getCouponById,
  getCouponByCode,
  updateCouponById,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
  getCouponStats,
};

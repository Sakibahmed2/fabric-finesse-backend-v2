import mongoose from "mongoose";
import { Coupon } from "./coupon.model";
import { TCoupon, TCouponValidation } from "./coupon.type";

const createCoupon = async (payload: TCoupon) => {
  // Check if coupon code already exists
  const isCouponExists = await Coupon.findOne({ code: payload.code });
  if (isCouponExists) {
    throw new Error("Coupon with this code already exists");
  }

  // Convert code to uppercase
  payload.code = payload.code.toUpperCase().trim();

  // Validate percentage coupon
  if (payload.type === "percentage" && payload.value > 100) {
    throw new Error("Percentage discount cannot exceed 100%");
  }

  // Validate fixed coupon
  if (payload.type === "fixed" && payload.value < 0) {
    throw new Error("Fixed discount cannot be negative");
  }

  const result = await Coupon.create(payload);
  return result;
};

const getAllCoupons = async (query: any) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter: Record<string, any> = {};

  // Filter by type if provided
  if (query.type && ["percentage", "fixed"].includes(query.type)) {
    filter.type = query.type;
  }

  // Search by code
  if (query.search) {
    filter.code = { $regex: query.search, $options: "i" };
  }

  // Filter active coupons (still have redemptions available)
  if (query.active === "true") {
    filter.$expr = {
      $lt: [{ $size: "$redemptions" }, "$totalCoupon"],
    };
  }

  const coupons = await Coupon.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Coupon.countDocuments(filter);

  return {
    result: coupons,
    pagination: {
      total,
      page,
      limit,
    },
  };
};

const getCouponById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid coupon ID");
  }

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new Error("Coupon not found");
  }

  return coupon;
};

const getCouponByCode = async (code: string) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (!coupon) {
    throw new Error("Coupon not found");
  }

  return coupon;
};

const updateCouponById = async (id: string, payload: Partial<TCoupon>) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid coupon ID");
  }

  // Check if coupon exists
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new Error("Coupon not found");
  }

  // If updating code, check if new code already exists
  if (payload.code && payload.code !== coupon.code) {
    const isCouponExists = await Coupon.findOne({ code: payload.code });
    if (isCouponExists) {
      throw new Error("Coupon with this code already exists");
    }
    payload.code = payload.code.toUpperCase().trim();
  }

  // Validate percentage coupon
  if (payload.type === "percentage" && payload.value && payload.value > 100) {
    throw new Error("Percentage discount cannot exceed 100%");
  }

  // Validate fixed coupon
  if (payload.type === "fixed" && payload.value && payload.value < 0) {
    throw new Error("Fixed discount cannot be negative");
  }

  const updatedCoupon = await Coupon.findByIdAndUpdate(id, payload, {
    new: true,
  });

  return updatedCoupon;
};

const deleteCoupon = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid coupon ID");
  }

  const deletedCoupon = await Coupon.findByIdAndDelete(id);
  if (!deletedCoupon) {
    throw new Error("Coupon not found");
  }

  return deletedCoupon;
};

const validateCoupon = async (
  code: string,
  userId: string,
  orderAmount: number,
): Promise<TCouponValidation> => {
  // Find coupon by code
  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

  if (!coupon) {
    return {
      isValid: false,
      message: "Invalid coupon code",
    };
  }

  // Check if coupon has reached total redemption limit
  if (coupon.redemptions.length >= coupon.totalCoupon) {
    return {
      isValid: false,
      message: "This coupon has reached its redemption limit",
    };
  }

  // Check minimum order amount
  if (orderAmount < coupon.minOrder) {
    return {
      isValid: false,
      message: `Minimum order amount of $${coupon.minOrder} required to use this coupon`,
    };
  }

  // Check per-user limit
  const userRedemptions = coupon.redemptions.filter(
    (redemption) => redemption.user.toString() === userId,
  );

  if (userRedemptions.length >= coupon.perUserLimit) {
    return {
      isValid: false,
      message: `You have already used this coupon ${coupon.perUserLimit} time(s)`,
    };
  }

  // Calculate discount
  let discount = 0;
  if (coupon.type === "percentage") {
    discount = (orderAmount * coupon.value) / 100;
  } else {
    discount = coupon.value;
  }

  // Ensure discount doesn't exceed order amount
  discount = Math.min(discount, orderAmount);

  return {
    isValid: true,
    message: "Coupon is valid",
    discount: Math.round(discount * 100) / 100, // Round to 2 decimal places
  };
};

const applyCoupon = async (
  code: string,
  userId: string,
  orderAmount: number,
) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const validation = await validateCoupon(code, userId, orderAmount);

  if (!validation.isValid) {
    throw new Error(validation.message);
  }

  // Add redemption record
  const coupon = await Coupon.findOneAndUpdate(
    { code: code.toUpperCase().trim() },
    {
      $push: {
        redemptions: {
          user: new mongoose.Types.ObjectId(userId),
          usedAt: new Date(),
        },
      },
    },
    { new: true },
  );

  return {
    coupon,
    discount: validation.discount,
  };
};

const getCouponStats = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid coupon ID");
  }

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new Error("Coupon not found");
  }

  const totalRedemptions = coupon.redemptions.length;
  const remainingRedemptions = coupon.totalCoupon - totalRedemptions;
  const redemptionRate =
    coupon.totalCoupon > 0
      ? ((totalRedemptions / coupon.totalCoupon) * 100).toFixed(2)
      : 0;

  // Get unique users who used the coupon
  const uniqueUsers = new Set(coupon.redemptions.map((r) => r.user.toString()))
    .size;

  return {
    coupon,
    stats: {
      totalRedemptions,
      remainingRedemptions,
      redemptionRate: `${redemptionRate}%`,
      uniqueUsers,
    },
  };
};

export const couponService = {
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

import { Schema } from "mongoose";

export type TCouponType = "percentage" | "fixed";

export type TRedemptionCoupon = {
  user: Schema.Types.ObjectId;
  usedAt: Date;
};

export type TCoupon = {
  code: string;
  type: TCouponType;
  value: number;
  minOrder: number;
  totalCoupon: number;
  perUserLimit: number;
  redemptions: TRedemptionCoupon[];
};

export type TCouponValidation = {
  isValid: boolean;
  message?: string;
  discount?: number;
};

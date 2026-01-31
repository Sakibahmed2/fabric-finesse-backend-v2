import { model, Schema } from "mongoose";
import { TCoupon } from "./coupon.type";

const couponSchema = new Schema<TCoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["percentage", "fixed"],
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrder: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalCoupon: {
      type: Number,
      required: true,
      min: 1,
    },
    perUserLimit: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    redemptions: {
      type: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          usedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const Coupon = model<TCoupon>("Coupon", couponSchema);

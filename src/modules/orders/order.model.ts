import { model, Schema, version } from "mongoose";
import { ORDER_STATUSES, TOrder } from "./order.type";

const orderSchema = new Schema<TOrder>(
  {
    order_id: {
      type: String,
      required: true,
      unique: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product_id: {
          type: Schema.Types.ObjectId,
          ref: "Products",
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
        size: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    delivery_fee: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Order = model<TOrder>("Order", orderSchema);

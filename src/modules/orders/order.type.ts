import { Types } from "mongoose";

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "delivered",
  "cancelled",
] as const;

export type TOrderStatus = (typeof ORDER_STATUSES)[number];

export type TOrder = {
  order_id: string;
  user_id: Types.ObjectId;
  items: [
    {
      product_id: Types.ObjectId;
      color: string;
      size: string;
      quantity: number;
    }
  ];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: (typeof ORDER_STATUSES)[number];
  address: string;
};

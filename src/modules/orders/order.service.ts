import { buildQuery, TQueryParams } from "../../builder/queryBuilder";
import { User } from "../users/users.model";
import { Order } from "./order.model";
import { TOrder, TOrderStatus } from "./order.type";

const createOrder = async (orderData: TOrder) => {
  // Check if user exists
  const isUserExists = await User.findOne({ _id: orderData.user_id });
  if (!isUserExists) {
    throw new Error("User does not exist");
  }

  const order_id = `ORD-${Date.now()}`;
  orderData.order_id = order_id;

  const result = await Order.create(orderData);
  return result;
};

const getAllOrders = async (query: any) => {
  const { filter, page, limit, skip, sort } = buildQuery({
    search: query.search,
    searchFields: ["order_id", "status"],
    page: query.page,
    limit: query.limit,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    filters: {
      ...(query.status && { status: query.status }),
    },
  });

  const result = await Order.aggregate([
    { $match: filter },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user_id",
        pipeline: [{ $project: { name: 1, email: 1 } }],
      },
    },
    { $unwind: "$user_id" },
    {
      $lookup: {
        from: "products",
        localField: "products",
        foreignField: "_id",
        as: "products",
        pipeline: [{ $project: { name: 1, price: 1, images: 1 } }],
      },
    },
    { $unwind: "$products" },
    { $sort: sort || { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ]);

  const total = await Order.countDocuments(filter);

  return {
    result,
    pagination: {
      total,
      page,
      limit,
    },
  };
};

const getSingleOrderByUserId = async (user_id: string) => {
  const result = await Order.findOne({ user_id })
    .populate("user_id", "name email")
    .populate("products", "name price images");
  if (!result) {
    throw new Error("Order not found");
  }

  return result;
};

const deleteOrder = async (id: string) => {
  const result = await Order.findByIdAndDelete(id);
  if (!result) {
    throw new Error("Order not found");
  }

  return result;
};

const updateOrderStatus = async (id: string, status: TOrderStatus) => {
  const result = await Order.findByIdAndUpdate(id, { status }, { new: true });

  if (!result) {
    throw new Error("Order not found");
  }

  return result;
};

export const orderService = {
  createOrder,
  getAllOrders,
  getSingleOrderByUserId,
  deleteOrder,
  updateOrderStatus,
};

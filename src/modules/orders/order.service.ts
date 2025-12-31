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
    searchFields: ["order_id", "status", "address"],
    page: query.page,
    limit: query.limit,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    filters: {
      ...(query.status && { status: query.status }),
    },
  });

  // Use Mongoose's populate for user and items.product_id
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate({ path: "user_id", select: "name email" })
      .populate({ path: "items.product_id", select: "name price images" })
      .sort(sort || { createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return {
    result: orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getSingleOrderByUserId = async (user_id: string) => {
  const orders = await Order.find({ user_id })
    .populate({ path: "user_id", select: "name email" })
    .populate({ path: "items.product_id", select: "name price images" });
  return orders;
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

  console.log({ id, status });

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

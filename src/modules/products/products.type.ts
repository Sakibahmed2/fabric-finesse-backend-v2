import { Types } from "mongoose";

export type TProducts = {
  name: string;
  slug: string;
  category: Types.ObjectId;
  price: number;
  discountPrice?: number;
  description: string;
  images: string[];
  stock: number;
};

export type TProductQuery = {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  limit?: string;
  page?: string;
};

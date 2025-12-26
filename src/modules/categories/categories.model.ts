import { model, Schema } from "mongoose";
import { TCategory } from "./categories.type";

const categoriesSchema = new Schema<TCategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Categories = model<TCategory>("Category", categoriesSchema);

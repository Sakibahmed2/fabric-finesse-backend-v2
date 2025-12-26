import { model, Schema } from "mongoose";
import { TUsers } from "./user.type";
import { USER_ROLE } from "../../constants/constants";

const userSchema = new Schema<TUsers>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.USER,
    },
  },
  { timestamps: true }
);

export const User = model<TUsers>("User", userSchema);

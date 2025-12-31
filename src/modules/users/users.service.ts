import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../config/config";
import { TUsers } from "./user.type";
import { User } from "./users.model";

const registerUser = async (payload: TUsers) => {
  const exists = await User.findOne({ email: payload.email });

  if (exists) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const result = await User.create({
    ...payload,
    password: hashedPassword,
  });

  return result;
};

const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const jwtPayload = {
    userId: user._id,
    role: user.role,
  };

  const token = jwt.sign(
    jwtPayload,
    config.jwtSecret as string,
    { expiresIn: config.expiresIn } as jwt.SignOptions
  );

  return { token };
};

const getAllUsers = async () => {
  const users = await User.find().select("-password");
  return users;
};

export const UsersService = {
  registerUser,
  loginUser,
  getAllUsers,
};

import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UsersService } from "./users.service";

const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const userData = { name, email, password };

  const result = await UsersService.registerUser(userData);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await UsersService.loginUser(
    req.body.email,
    req.body.password
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UsersService.getAllUsers();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

export const UsersController = {
  register,
  login,
  getAllUsers,
};

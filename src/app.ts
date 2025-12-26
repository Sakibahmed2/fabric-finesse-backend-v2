import express from "express";
import { userRouter } from "./modules/users/users.routes";
import { productsRouter } from "./modules/products/products.routes";
import sendResponse from "./utils/sendResponse";
import { categoriesRouter } from "./modules/categories/categories.routes";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/categories", categoriesRouter);

// Not Found Middleware
app.use((req, res, next) => {
  sendResponse(res, {
    statusCode: 404,
    success: false,
    message: "Not Found",
  });

  next();
});

// Global Error Handling Middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Global Error Handler:", err);
    sendResponse(res, {
      statusCode: err.statusCode || 500,
      success: false,
      message: err.message || "Internal Server Error",
    });
    next();
  }
);

export default app;

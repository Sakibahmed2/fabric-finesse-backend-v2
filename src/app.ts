import express from "express";
import { userRouter } from "./modules/users/users.routes";
import { productsRouter } from "./modules/products/products.routes";
import sendResponse from "./utils/sendResponse";
import { categoriesRouter } from "./modules/categories/categories.routes";
import { orderRouter } from "./modules/orders/order.routes";
import cors from "cors";
import { couponRouter } from "./modules/coupons/coupon.routes";
import { paymentRouter } from "./modules/payments/payment.routes";
import config from "./config/config";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://fabric-finesse-frontend.vercel.app",
  config.frontendUrl,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.options(/.*/, cors());

// Routes
app.use("/api/v1/", userRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/coupons", couponRouter);
app.use("/api/v1/payments", paymentRouter);

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
    next: express.NextFunction,
  ) => {
    console.error("Global Error Handler:", err);
    sendResponse(res, {
      statusCode: err.statusCode || 500,
      success: false,
      message: err.message || "Internal Server Error",
    });
    next();
  },
);

export default app;

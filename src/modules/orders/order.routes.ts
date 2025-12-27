import { Router } from "express";
import { orderController } from "./order.controller";

const router = Router();

router.post("/", orderController.createOrder);
router.get("/", orderController.getAllOrders);
router.get("/user/:user_id", orderController.getSingleOrderByUserId);
router.delete("/:id", orderController.deleteOrder);
router.patch("/:id/status", orderController.updateOrderStatus);

export const orderRouter = router;

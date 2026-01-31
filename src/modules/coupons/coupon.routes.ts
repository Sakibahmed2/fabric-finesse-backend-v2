import { Router } from "express";
import { couponController } from "./coupon.controller";

const router = Router();

router.post("/", couponController.createCoupon);
router.get("/", couponController.getAllCoupons);
router.post("/validate", couponController.validateCoupon);
router.post("/apply", couponController.applyCoupon);
router.get("/code/:code", couponController.getCouponByCode);
router.get("/:id/stats", couponController.getCouponStats);
router.get("/:id", couponController.getCouponById);
router.put("/:id", couponController.updateCouponById);
router.delete("/:id", couponController.deleteCoupon);

export const couponRouter = router;

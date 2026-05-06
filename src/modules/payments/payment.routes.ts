import { Router } from "express";
import { paymentController } from "./payment.controller";

const router = Router();

router.post("/init/:orderId", paymentController.initPayment);

router
  .route("/success")
  .post(paymentController.successPayment)
  .get(paymentController.successPayment);

router
  .route("/fail")
  .post(paymentController.failPayment)
  .get(paymentController.failPayment);

router
  .route("/cancel")
  .post(paymentController.cancelPayment)
  .get(paymentController.cancelPayment);

router
  .route("/ipn")
  .post(paymentController.ipnPayment)
  .get(paymentController.ipnPayment);

export const paymentRouter = router;

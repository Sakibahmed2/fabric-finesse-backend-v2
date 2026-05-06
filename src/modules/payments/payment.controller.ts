import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import config from "../../config/config";
import { paymentService } from "./payment.service";

const getPayloadValue = (payload: Record<string, unknown>, key: string) => {
  const value = payload[key];
  if (Array.isArray(value)) {
    return value[0] ? String(value[0]) : "";
  }
  return value ? String(value) : "";
};

const buildFrontendPaymentStatusUrl = (
  status: "success" | "failed" | "cancelled",
  payload: Record<string, unknown>,
  orderId?: string,
) => {
  const redirectUrl = new URL("/payment/status", config.frontendUrl);
  redirectUrl.searchParams.set("status", status);

  const transactionId = getPayloadValue(payload, "tran_id");
  if (transactionId) {
    redirectUrl.searchParams.set("transactionId", transactionId);
  }

  if (orderId) {
    redirectUrl.searchParams.set("orderId", orderId);
  }

  return redirectUrl.toString();
};

const initPayment = catchAsync(async (req, res) => {
  const { orderId } = req.params;

  const result = await paymentService.initPayment(orderId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "SSLCommerz payment initialized successfully",
    data: result,
  });
});

const successPayment = catchAsync(async (req, res) => {
  const payload = { ...req.query, ...req.body };
  const result = await paymentService.handleSuccessPayment(payload);

  const redirectUrl = buildFrontendPaymentStatusUrl(
    "success",
    payload,
    String(result.order._id),
  );

  res.redirect(302, redirectUrl);
});

const failPayment = catchAsync(async (req, res) => {
  const payload = { ...req.query, ...req.body };
  const result = await paymentService.handleFailedPayment(payload);

  const redirectUrl = buildFrontendPaymentStatusUrl(
    "failed",
    payload,
    String(result._id),
  );

  res.redirect(302, redirectUrl);
});

const cancelPayment = catchAsync(async (req, res) => {
  const payload = { ...req.query, ...req.body };
  const result = await paymentService.handleCancelledPayment(payload);

  const redirectUrl = buildFrontendPaymentStatusUrl(
    "cancelled",
    payload,
    String(result._id),
  );

  res.redirect(302, redirectUrl);
});

const ipnPayment = catchAsync(async (req, res) => {
  const payload = { ...req.query, ...req.body };
  const result = await paymentService.handleIpn(payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "IPN processed successfully",
    data: result,
  });
});

export const paymentController = {
  initPayment,
  successPayment,
  failPayment,
  cancelPayment,
  ipnPayment,
};

import config from "../../config/config";
import { User } from "../users/users.model";
import { Order } from "../orders/order.model";

type TSslInitResponse = {
  status: string;
  failedreason?: string;
  GatewayPageURL?: string;
};

type TSslValidationResponse = {
  status?: string;
  tran_id?: string;
  val_id?: string;
};

type TPaymentCallbackPayload = Record<string, unknown>;

const SSL_PAYMENT_BASE_URL = "https://sandbox.sslcommerz.com";

const ensureSslCredentials = () => {
  if (!config.sslStoreId || !config.sslStorePassword) {
    throw new Error(
      "SSLCommerz credentials are missing in environment variables",
    );
  }
};

const getPayloadValue = (payload: TPaymentCallbackPayload, key: string) => {
  const value = payload[key];
  if (Array.isArray(value)) {
    return value[0] ? String(value[0]) : "";
  }
  return value ? String(value) : "";
};

const generateTransactionId = () =>
  `TXN-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const initPayment = async (orderId: string) => {
  ensureSslCredentials();

  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.payment_status === "paid") {
    throw new Error("Order already paid");
  }

  const user = order.user_id ? await User.findById(order.user_id) : null;
  const transactionId = order.transaction_id || generateTransactionId();

  if (!order.transaction_id) {
    order.transaction_id = transactionId;
    await order.save();
  }

  const data = {
    store_id: config.sslStoreId,
    store_passwd: config.sslStorePassword,
    total_amount: String(order.total),
    currency: "BDT",
    tran_id: transactionId,
    success_url: `${config.baseUrl}/payments/success`,
    fail_url: `${config.baseUrl}/payments/fail`,
    cancel_url: `${config.baseUrl}/payments/cancel`,
    ipn_url: `${config.baseUrl}/payments/ipn`,
    shipping_method: "NO",
    product_name: "Fabric Finesse Order",
    product_category: "Ecommerce",
    product_profile: "general",
    cus_name: user?.name || "Customer",
    cus_email: user?.email || "customer@example.com",
    cus_add1: order.address,
    cus_phone: order.phone,
    value_a: String(order._id),
  };

  const params = new URLSearchParams(
    Object.entries(data).reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {}),
  );

  const response = await fetch(`${SSL_PAYMENT_BASE_URL}/gwprocess/v4/api.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const result = (await response.json()) as TSslInitResponse;

  if (!response.ok || result.status !== "SUCCESS" || !result.GatewayPageURL) {
    throw new Error(
      result.failedreason || "Failed to initialize SSLCommerz payment",
    );
  }

  return {
    gatewayUrl: result.GatewayPageURL,
    transactionId,
  };
};

const validateWithSslCommerz = async (valId: string) => {
  ensureSslCredentials();

  const url = new URL(
    `${SSL_PAYMENT_BASE_URL}/validator/api/validationserverAPI.php`,
  );
  url.searchParams.append("val_id", valId);
  url.searchParams.append("store_id", config.sslStoreId as string);
  url.searchParams.append("store_passwd", config.sslStorePassword as string);
  url.searchParams.append("v", "1");
  url.searchParams.append("format", "json");

  const response = await fetch(url.toString());
  const result = (await response.json()) as TSslValidationResponse;

  return result;
};

const handleSuccessPayment = async (payload: TPaymentCallbackPayload) => {
  const transactionId = getPayloadValue(payload, "tran_id");
  const valId = getPayloadValue(payload, "val_id");

  if (!transactionId) {
    throw new Error("Transaction id is missing in success callback");
  }

  const order = await Order.findOne({ transaction_id: transactionId });
  if (!order) {
    throw new Error("Order not found for this transaction");
  }

  if (order.payment_status === "paid") {
    return {
      order,
      message: "Payment already verified",
    };
  }

  let sslValidation: TSslValidationResponse | null = null;
  if (valId) {
    sslValidation = await validateWithSslCommerz(valId);
    const validationStatus = (sslValidation.status || "").toUpperCase();
    if (validationStatus !== "VALID" && validationStatus !== "VALIDATED") {
      throw new Error("SSLCommerz validation failed");
    }

    if (sslValidation.tran_id && sslValidation.tran_id !== transactionId) {
      throw new Error("Transaction mismatch during SSLCommerz validation");
    }
  }

  order.payment_status = "paid";
  await order.save();

  return {
    order,
    validation: sslValidation,
  };
};

const handleFailedPayment = async (payload: TPaymentCallbackPayload) => {
  const transactionId = getPayloadValue(payload, "tran_id");

  if (!transactionId) {
    throw new Error("Transaction id is missing in fail callback");
  }

  const order = await Order.findOne({ transaction_id: transactionId });
  if (!order) {
    throw new Error("Order not found for this transaction");
  }

  order.payment_status = "cancelled";
  await order.save();

  return order;
};

const handleCancelledPayment = async (payload: TPaymentCallbackPayload) => {
  const transactionId = getPayloadValue(payload, "tran_id");

  if (!transactionId) {
    throw new Error("Transaction id is missing in cancel callback");
  }

  const order = await Order.findOne({ transaction_id: transactionId });
  if (!order) {
    throw new Error("Order not found for this transaction");
  }

  order.payment_status = "cancelled";
  await order.save();

  return order;
};

const handleIpn = async (payload: TPaymentCallbackPayload) => {
  const status = getPayloadValue(payload, "status").toUpperCase();
  const transactionId = getPayloadValue(payload, "tran_id");

  if (!transactionId) {
    throw new Error("Transaction id is missing in IPN payload");
  }

  const order = await Order.findOne({ transaction_id: transactionId });
  if (!order) {
    throw new Error("Order not found for this transaction");
  }

  if (status === "VALID" || status === "VALIDATED") {
    order.payment_status = "paid";
  } else if (status === "FAILED" || status === "CANCELLED") {
    order.payment_status = "cancelled";
  }

  await order.save();

  return order;
};

export const paymentService = {
  initPayment,
  handleSuccessPayment,
  handleFailedPayment,
  handleCancelledPayment,
  handleIpn,
};

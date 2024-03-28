const express = require("express");
const payment = express.Router();
const { createCheckoutSession, webhook , cancelSubscriptionController } = require("../controllers/paymentController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

payment.post("/create-checkout-session", jwtMiddleware, createCheckoutSession);
payment.post("/webhook", webhook);
payment.post("/cancel-subscription", jwtMiddleware, cancelSubscriptionController);

module.exports = payment;

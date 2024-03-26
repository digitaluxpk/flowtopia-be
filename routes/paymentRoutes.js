const express = require("express");
const payment = express.Router();
const { createCheckoutSession, webhook } = require("../controllers/paymentController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

payment.post("/create-checkout-session", jwtMiddleware, createCheckoutSession);
payment.post("/webhook", webhook);

module.exports = payment;

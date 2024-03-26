const express = require("express");

const subscription = express.Router();

const { findSubscription } = require("../controllers/subscriptionController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");

subscription.get("/findSubscription", jwtMiddleware, findSubscription);

module.exports = subscription;

const Subscription = require("../models/subscriptionModel");

const findSubscription= async (req, res) => {
    const userId = req.user.id;
    try {
        const subscription = await Subscription
            .findOne({ userId: userId }).select("-_id, -userId")
            .sort({ createdAt: -1 })
            .exec();
        res.status(200).json(subscription);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { findSubscription };

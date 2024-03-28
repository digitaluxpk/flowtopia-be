const Subscription = require("../models/subscriptionModel");
const User = require("../models/userModel");
const stripe=require("stripe")(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
    const { id, email } = req.user;
    try {
        const customer = await stripe.customers.create({
            email: email // Use the email to create a customer
        });

        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            payment_method_types: [ "card" ],
            line_items: [
                {
                    price: process.env.BASIC_PlAN_ID,
                    quantity: 1
                }
            ],
            mode: "subscription",
            metadata: {
                user: id
            },
            success_url: `${process.env.CLIENT_URL}/dashboard/settings/billing`,
            cancel_url: `${process.env.CLIENT_URL}/dashboard/settings/billing`
        });

        res.status(200).json({ session: session });

    } catch (error) {
        const statusCode = error.response && error.response.status;
        const errorMessage = error.message;

        if (statusCode === 402) {
            res.status(402).json({ error: "Your credit card was declined." });
        } else {
            res.status(500).json({ error: errorMessage });
        }
    }
};

const webhook= async (req, res) => {
    try {
        // Retrieve the raw request body
        let payload = JSON.stringify(req.body);
        payload = JSON.parse(payload);
        const event = await stripe.events.retrieve(payload.id);
        const customerId  = event?.data?.object?.metadata?.user;

        // Handle the payment failure event
        if (event.type === "charge.failed" || event.type === "charge.expired" || event.type === "payment_intent.payment_failed" || event.type === "invoice.payment_failed") {
            await User.findOneAndUpdate({ _id: customerId }, { subscriptionStatus: false });

            res.status(404).json({ status: 404, message: "Payment failed" });

        }
        const id=event.data.object.customer;
        // Handle the payment success event
        if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded" || event.type === "invoice.payment_succeeded") {
            await Subscription.create(
                { userId: customerId, isActive:true, endDate: new Date(new Date().setDate(new Date().getDate() + 30)), startDate: new Date(), type: "monthly" , customerId:id },
                { new: true }
            );

            await User.findOneAndUpdate({ _id: customerId }, { subscriptionStatus: true });
            res.status(200).json({ status: 200, message: "Payment success" });

        }
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const cancelSubscription = async (customerId) => {
    try {
        // Retrieve the customer's subscription
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            // Only retrieve active subscriptions
            status: "active",
            limit: 1 // Limit to 1 subscription (assuming the user has only one subscription)
        });

        // If there's an active subscription, cancel it
        if (subscriptions.data.length > 0) {
            const subscriptionId = subscriptions.data[0].id;
            await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
            return true; // Subscription canceled successfully
        } else {
            return false; // No active subscription found
        }
    } catch (error) {
        console.error("Error canceling subscription:", error);
        throw new Error("Failed to cancel subscription");
    }
};

const cancelSubscriptionController = async (req, res) => {
    const { id } = req.user;
    const subData=await Subscription
        .findOne({ userId: id }).select("-_id, -userId")
        .sort({ createdAt: -1 })
        .exec();

    try {

        const result = await cancelSubscription(subData.customerId);

        if (result) {
            await User.findOneAndUpdate({ _id: id }, { subscriptionStatus: false });

            await Subscription.findOneAndUpdate({ userId: id, isActive: true }, { isActive: false });
            res.status(200).json({ message: "Subscription canceled successfully" });

        }
        else {
            res.status(404).json({ error: "No active subscription found" });
        }
    }

    catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { createCheckoutSession, webhook ,cancelSubscriptionController };

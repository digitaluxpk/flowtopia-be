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

            res.status(404).json({ status: 404, message: "Payment failed" });

        }
        // Handle the payment success event
        if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded" || event.type === "invoice.payment_succeeded") {
            await Subscription.create(
                { userId: customerId, status: "active", endDate: new Date(new Date().setDate(new Date().getDate() + 30)), startDate: new Date(), type: "monthly" },
                { new: true }
            );

            await User.findOneAndUpdate({ _id: customerId }, { subscriptionStatus: true });
            res.status(200).json({ status: 200, message: "Payment success" });

        }
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { createCheckoutSession, webhook };

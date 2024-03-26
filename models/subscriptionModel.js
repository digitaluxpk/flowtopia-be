
const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    status: {
        type: String
    },
    type: {
        type: String
    },

    endDate: {
        type: Date
    },
    startDate: {
        type: Date,
        default: Date.now
    }
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;

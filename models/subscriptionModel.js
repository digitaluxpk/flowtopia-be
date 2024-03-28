
const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
    customerId: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    isActive: {
        type: Boolean
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

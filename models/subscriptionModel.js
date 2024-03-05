const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    planId: {
        type: Schema.Types.ObjectId,
        ref: "Plan"
    },
    status: {
        type: String,
        required: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    }
}, { timestamps: true });

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = { Subscription };

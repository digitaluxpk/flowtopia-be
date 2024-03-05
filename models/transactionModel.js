const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    subscriptionId: {
        type: Schema.Types.ObjectId,
        ref: "Subscription"
    },
    amount: {
        type: Number
    },
    date: {
        type: Date
    },
    status: {
        type: String
    },
    paymentType: {
        type: String
    }
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = { Transaction };


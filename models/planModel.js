const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const planSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    promo: {
        type: Number
    },
    features: {
        type: Array
    }
}, { timestamps: true });

const Plan = mongoose.model("Plan", planSchema);

module.exports = { Plan } ;

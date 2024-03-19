const mongoose = require("mongoose");

const optionsdataSchema = new mongoose.Schema({
    contract: {
        type: String
    },
    activity_type: {
        type: String
    },
    timestamp: {
        type: Number
    },
    strike_price: {
        type: Number
    },
    is_call: {
        type: Boolean
    },
    is_put: {
        type: Boolean
    },
    expiration_date: {
        type: Array
    },
    underlying_symbol: {
        type: String
    },
    sentiment: {
        type: String
    },
    total_value: {
        type: Number
    },
    total_size: {
        type: Number
    },
    average_price: {
        type: Number
    },
    ask_price_at_execution: {
        type: Number
    },
    bid_price_at_execution: {
        type: Number
    },
    underlying_price_at_execution: {
        type: Number
    },
    side: {
        type: String
    }
});

const OptionsData = mongoose.model("Options_data", optionsdataSchema);

module.exports = OptionsData;

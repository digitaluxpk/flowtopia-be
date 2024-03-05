const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const widgetSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    settings: {
        type: Schema.Types.Mixed
    },
    dataFeedId: {
        type: String
    }
}, { timestamps: true });

const Widget = mongoose.model("Widget", widgetSchema);

module.exports = { Widget };

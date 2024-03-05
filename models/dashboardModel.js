const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dashboardSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    name: {
        type: String,
        required: true
    },
    widgets: [
        {
            type: Schema.Types.ObjectId,
            ref: "Widget"
        }
    ]
}, { timestamps: true });

const Dashboard = mongoose.model("Dashboard", dashboardSchema);

module.exports = { Dashboard };

// address model relationship with user model
//     },
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    city: {
        type: String
    },
    state: {
        type: String
    },
    country: {
        type: String
    },
    postalCode: {
        type: String
    },
    fullAddress: {
        type: String
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

const Address=  mongoose.model("Address", addressSchema);
module.exports = Address;

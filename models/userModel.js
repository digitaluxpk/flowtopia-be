const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    confirmedCode: {
        type: Number
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    profileImage: {
        type: String
    },
    phoneNumber: {
        type: String
    },

    address: {
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
        }

    },

    settings: {
        darkMode: {
            type: String,
            default: "light"
        },
        notificationPreference: {
            type: String,
            default: "english"
        }
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;

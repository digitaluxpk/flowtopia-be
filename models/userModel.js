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
        type: Number,
        default: null
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    profileImage: {
        type: String,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    description:{
        type:String
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
    phoneNumbar: {
        type: String,
        default: null

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

    updated_at: {
        type: Date,
        default: null
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;

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
    },
    employmentStatus:{
        type:String,
        default:null
    },
    businessName:{
        type:String,
        default:null
    },
    NatureOfBusiness:{
        type:String,
        default:null
    },
    affiliation:{
        q1:{
            type:Boolean,
            default:false
        },
        q2:{
            type:Boolean,
            default:false
        },
        q3:{
            type:Boolean,
            default:false
        }

    },
    flowtopiaTerms:{
        type:Boolean,
        default:false
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;

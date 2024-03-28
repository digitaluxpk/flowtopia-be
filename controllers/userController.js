const { Email } = require("../helpers/email");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const uploadToS3 = require("../helpers/uploadToS3");
const Address = require("../models/addressModel");
const Subscription = require("../models/subscriptionModel");

const userRegister = async (req, res) => {
    try {
        // Add express-validator checks here
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: 400, message: errors.array() });
        }
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ status: 400, message: "User already exists" });
        } else {
            const code = Math.floor(Math.random() * 9000) + 1000;
            const msg = {
                to: email,
                from: process.env.ADMINEMAIL,
                subject: "Email Confirmation Code",
                text: `Your confirmation code is ${code}`,
                html: `Welcome to our website, Your confirmation code is <strong>${code}</strong>`
            };
            const result =await Email(msg);

            if (!result){
                return res.status(404).json({ status: 404, message: "Email not sent try again later" });
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = await new User({
                name,
                email,
                password: hashedPassword,
                confirmedCode: code,
                isConfirmed: false
            });
            await user.save();

            return res.status(200).json({
                status: 200,
                message: "User registered successfully Check your Email"
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const confirmedCode = async (req, res) => {
    // Add express-validator checks here
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 400, message: errors.array() });
    }

    const { email, code } = req.body;
    try {

        const user = await User.findOne({ email, confirmedCode: code });

        if (user) {
            user.isConfirmed = true;
            await user.save();

            res
                .status(200)
                .json({ status: 200, message: "User confirmed successfully" });
        } else {
            res.status(400).json({ status: 400, message: "Invalid code" });
        }
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

const resendCode = async (req, res) => {
    // Add express-validator checks here
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 400, message: errors.array() });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        const code = Math.floor(Math.random() * 9000) + 1000;
        const msg = {
            to: email,
            from: process.env.ADMINEMAIL,
            subject: "Email Confirmation Code",
            text: `Your confirmation code is ${code}`,
            html: `Welcome to our website, Your confirmation code is <strong>${code}</strong>`
        };

        const result =await Email(msg);

        if (!result){
            return res.status(404).json({ status: 404, message: "Email not sent try again later" });
        }
        user.confirmedCode = code;
        await user.save();
        return res.status(200).json({
            status: 200,
            message: "Check your email for confirmation code"
        });
    }
    return res.status(400).json({ status: 400, message: "Email not found" });
};

const userLogin = async (req, res) => {
    // Add express-validator checks here
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 400, message: errors.array() });
    }
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user) {
        if (!user.isConfirmed) {
            return res
                .status(400)
                .json({ status: 400, message: "User Email is not confirmed" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: 400, message: "Wrong password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        delete user._doc.password;
        res.status(200).json({ status: 200, token, user });
    } else {
        return res.status(400).json({ status: 400, message: "Email not found" });
    }
};

const forgotPassword = async (req, res) => {
    // Add express-validator checks here
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 400, message: errors.array() });
    }
    const { email } = req.body;
    const user = await User.findOne({
        email
    });
    if (user) {
        const resetUrlToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });
        const resetUrl = `${process.env.CLIENT_URL}/setnewpassword?token=${resetUrlToken}`;
        const msg = {
            to: email,
            from: process.env.RESET_PASSWORD_SENDER_EMAIL,
            subject: "Reset Password",
            text: `Reset your password by clicking on this link ${resetUrl}`,
            html: `Reset your password by clicking on this link <a href="${resetUrl}">${resetUrl}</a>`
        };
        const result =await Email(msg);

        if (!result){
            return res.status(404).json({ status: 404, message: "Email not sent try again later" });
        }
        return res.status(200).json({
            status: 200,
            message: "Check your email for reset link"
        });
    }
    return res.status(400).json({ status: 400, message: "Email not found" });
};

const resetPassword = async (req, res) => {
    // Add express-validator checks here
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 400, message: errors.array() });
    }
    try {
        const { password } = req.body;
        const { token } = req.params;

        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
            user.isConfirmed = true;
            await user.save();
            return res
                .status(200)
                .json({ status: 200, message: "Password reset successfully" });
        }
        return res.status(400).json({ status: 400, message: "Invalid token" });
    } catch (error) {
        return res
            .status(500)
            .json({ status: 500, message: "Token expired or invalid" });
    }
};

const uploadImage=async (req, res) => {
    try {
        const file = req.file;
        const id = req.user._id;
        // Upload file to S3
        const s3Response = await uploadToS3(file);

        if (!s3Response) {
            return res.status(404).json({ status:404, message: "Profile image upload failed" });
        }
        // Update user's profileImage in MongoDB

        const user = await User.findOneAndUpdate(
            { _id: id },
            { profileImage: s3Response.Location },
            { new: true }
        );

        await user.save();
        delete user._doc.password;

        res.status(200).json({ message: "Profile image uploaded successfully" });
    } catch (error) {

        res.status(500).json({ message: "Internal Server Error" });
    }
};

const userUpdatePersonalInfo = async (req, res) => {
    const userId = req.user._id;
    const { name, phoneNumber, address, email } = req.body;

    try {
        // Check if the provided email is already associated with another user
        if (email) {
            const userExists = await User.exists({ email: email });
            if (userExists) {
                return res.status(400).json({ status: 400, message: "User already exists" });
            }
        }

        // Update user data
        const updatedUser = await User.findByIdAndUpdate(userId, { name, phoneNumber, email }, { new: true })
            .select("-password -confirmedCode -isConfirmed -id -created_at -updated_at -__v -_id");

        // Find or create address data for the user
        let userAddress = await Address.findOneAndUpdate({ userid: userId }, { ...address }, { new: true });

        if (!userAddress) {
            userAddress = new Address({
                userid: userId,
                ...address
            });
            await userAddress.save();
        }

        res.status(200).json({ user: updatedUser, address: userAddress });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
//update user password
const userUpdatePassword = async (req, res) => {
    try {
        const id = req.user._id;
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(id);
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: 400, message: "Wrong password" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({ status: 200, message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Update user employment or affiliation or flowtopiaTerms
const userUpdateEmployment = async (req, res) => {
    try {
        const id = req.user._id;
        const { employmentStatus, businessName, NatureOfBusiness, affiliation, flowtopiaTerms } = req.body;
        let user = await User.findById(id);
        if (!user) {
            return res.status(400).json({ status: 400, message: "User not found" });
        }
        user = await User.findByIdAndUpdate(id, {
            $set: {
                affiliation: {
                    q1: affiliation?.q1 ,
                    q2: affiliation?.q2 ,
                    q3: affiliation?.q3
                },
                employmentStatus: employmentStatus || user.employmentStatus,
                businessName: businessName || user.businessName,
                NatureOfBusiness: NatureOfBusiness || user.NatureOfBusiness,
                flowtopiaTerms: flowtopiaTerms || user.flowtopiaTerms
            }
        }, { new: true }).select("-password -confirmedCode -isConfirmed -id -created_at -updated_at -__v -_id");

        if (!user) {
            return res.status(400).json({ status: 400, message: "User not found" });
        }

        // Remove password, confirmedCode, and isConfirmed from user object

        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password -confirmedCode -isConfirmed -id -created_at -updated_at -__v -_id");
        const address = await Address.findOne({ userid: req.user._id }).select("-_id -userid -__v");
        const subscription= await Subscription.findOne({ userId: req.user._id }).select("-_id, -userId")
            .sort({ createdAt: -1 })
            .exec();
        res.status(200).json({ user, address , subscription });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
module.exports = {
    userRegister,
    confirmedCode,
    resendCode,
    userLogin,
    forgotPassword,
    resetPassword,
    uploadImage,
    userUpdatePersonalInfo,
    userUpdatePassword,
    userUpdateEmployment,
    getUserProfile
};

const { Email } = require("../helpers/email");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

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

module.exports = {
    userRegister,
    confirmedCode,
    resendCode,
    userLogin,
    forgotPassword,
    resetPassword
};

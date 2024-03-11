//jwtMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const jwtMiddleware = async (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        return res.status(401).json({ status: 401, message: "No token, authorization denied" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};
module.exports = jwtMiddleware;

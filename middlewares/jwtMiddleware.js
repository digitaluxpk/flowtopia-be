//jwtMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const jwtMiddleware = async (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ status: 401, message: "Unauthorized access, no token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ status: 401, message: "Token expired" });
        }
        res.status(401).json({ status: 401, message: "Invalid token" });
    }
};
module.exports = jwtMiddleware;

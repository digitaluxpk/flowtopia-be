const fs = require("fs").promises;
const User = require("../models/userModel");

const readJson = async (req, res) => {
    try {
        const data = await fs.readFile("unified_customers.json", "utf8");
        const users = JSON.parse(data);
        const userDocuments = users.map(user => ({
            name: user.name,
            email: user.email,
            password: Math.random().toString(36).slice(-8), // Consider hashing this before saving
            description: user.description,
            created_at: user.created_at
        }));
        await User.insertMany(userDocuments);

        res.json({ message: "Data uploaded successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { readJson };

const fs = require("fs").promises;
const User = require("../models/userModel");

const readJson = async (req, res) => {
    try {
        console.log("Reading JSON file");

        const data = await fs.readFile("unified_customers.json", "utf8");
        const users = JSON.parse(data);

        for (const user of users) {
            const { name, email, description, created_at } = user;
            console.log(name, email, description, created_at);
            
            // generate password for each user randomly
            const password = Math.random().toString(36).slice(-8);

            try {
                const newUser = new User({
                    name,
                    email,
                    password,
                    description,
                    created_at
                });
                await newUser.save();
            } catch (error) {
                console.log(error);
                return res.status(500).json({ error: error.message });
            }
        }

        res.json({ message: "Data uploaded successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { readJson };

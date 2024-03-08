const express = require("express");
const app = express();
require("dotenv").config();
const helmet = require("helmet");

const cors = require("cors");
const { connectToMongoDB } = require("./database/db");
const userRoutes = require("./routes/userRoutes");

// Middlewares
app.use(helmet());
app.use(
    cors({
        origin: "*",
        credentials: true
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectToMongoDB();

// Routes
app.get("/", (req, res) => {
    res.send("Welcome to the API");
});
app.use("/api/user", userRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});

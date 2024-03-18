const express = require("express");
const app = express();
require("dotenv").config();
const helmet = require("helmet");
const cors = require("cors");
const { connectToMongoDB } = require("./database/db");
const userRoutes = require("./routes/userRoutes");
const { createServer } = require("http");
const server = createServer(app);
const socketIo = require("socket.io");
const { emitRealTimeData, watchOptionsDataChanges } = require("./helpers/realTimeData");
const io = socketIo(server);

// Socket.IO connection event
io.on("connection", (socket) => {
    console.log("A user csonnected");
    socket.on("getRealTimeData", async () => {
        emitRealTimeData(socket);
    });
});
// Start watching for changes in the MongoDB collection
watchOptionsDataChanges(io);
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
    res.json({ message: "Welcome to the Flowtopia API" });
});
app.use("/api/user", userRoutes);

// Server
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});

const express = require("express");
const app = express();
require("dotenv").config();

const cors = require("cors");
const { connectToMongoDB } = require("./database/db");
const userRoutes = require("./routes/userRoutes");
app.use(
    cors({
        origin: "*",
        credentials: true
    })
);
// const {SSE} = require('sse');
const { realTimeData } = require("./controllers/chartsData");
const WebSocket = require("ws");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectToMongoDB();

// Routes
app.use("/api/user", userRoutes);

//
// SSE endpoint
const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws) => {
    ws.on("message", (message) => {
        // console.log("Received message:", message);
    });

    const interval = setInterval(() => {
        realTimeData()
            .then((eventData) => {
                // console.log(eventData);
                ws.send(JSON.stringify(eventData)); // Convert eventData to a string and send it to the client
            })
            .catch((error) => {
                // console.error(error);
                ws.close();
            });
    }, 2000);

    ws.on("close", () => {
        clearInterval(interval);
    });
});

app.get("/websocket", (req, res) => {
    res.sendFile(__dirname + "/websocket.html");
});

app.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
    });
});

app.get("/realtimedata", realTimeData);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    // console.log(`Server is running at port ${port}`);
});

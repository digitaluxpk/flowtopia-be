const OptionsData = require("../models/optionsdataModel");
const moment = require("moment");

const emitRealTimeData = async (socket) => {
    try {
        // Get the current date
        const currentDate = moment().startOf("day");

        // Find the latest entry in the database
        const latestEntry = await OptionsData.findOne().sort({ timestamp: -1 });

        if (!latestEntry) {
            // If there's no data in the database, return empty array or handle as per your requirement
            return socket.emit("realTimeDataResponse", []);
        }

        // Get the date of the latest entry
        const latestEntryDate = moment.unix(latestEntry.timestamp).startOf("day");

        // Check if the latest entry is from today
        if (currentDate.isSame(latestEntryDate)) {
            // If the latest entry is from today, return all data for today
            const dataForToday = await OptionsData.find({ timestamp: { $gte: latestEntryDate.unix() }, underlying_symbol: { $nin: [ "SPX", "SPXW" ] }  }).sort({ timestamp: -1 });
            return socket.emit("realTimeDataResponse", dataForToday);
        } else {
            // If there's no data for today, return all entries for the last inserted date
            const dataForLastInsertedDate = await OptionsData.find({ timestamp: { $gte: latestEntryDate.unix(), $lt: latestEntryDate.endOf("day").unix() } , underlying_symbol: { $nin: [ "SPX", "SPXW" ] } }).sort({ timestamp: -1 });
            return socket.emit("realTimeDataResponse", dataForLastInsertedDate);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        socket.emit("realTimeDataError", { status: 500, error: "Internal Server Error" });
    }
};

// Listen for changes in the MongoDB collection using change streams
const watchOptionsDataChanges = async (io) => {
    try {
        const changeStream = await OptionsData.watch();

        // Error handling for the change stream
        changeStream.on("error", (error) => {
            console.error("Change stream error:", error);
            io.emit("realTimeDataError", { error: "Internal Server Error" });
        });

        // Use async/await with changeStream.on to handle async operations
        changeStream.on("change", async (change) => {
            if (change.operationType === "insert") {
                try {
                    const data = await OptionsData.findOne({ _id: change.documentKey._id, underlying_symbol: { $nin: [ "SPX" , "SPXW" ] } });
                    console.log("RealTimeData:", data);
                    if (data) {
                        io.emit("realTimeDataUpdate", data);
                    }
                } catch (error) {
                    console.error("Error processing change:", error);
                    io.emit("realTimeDataError", { status:500, error: "Internal Server Error" });
                }
            }
        });
    } catch (error) {
        console.error("Error watching options data changes:", error);
        io.emit("realTimeDataError", { error: "Internal Server Error" });
    }
};

module.exports = { emitRealTimeData , watchOptionsDataChanges };


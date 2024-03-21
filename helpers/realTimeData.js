const OptionsData = require("../models/optionsdataModel");

const emitRealTimeData = async (socket) => {
    try {
        // const timestampThreshold = Date.now() - (4 * 60 * 60 * 1000); // Example: Retrieve data updated within the last minute
        const data = await OptionsData.find({ underlying_symbol: { $nin: [ "SPX" , "SPXW" ] } }).sort({ timestamp: -1 }).limit(100);
        socket.emit( "realTimeDataResponse", data);
    }
    catch (error) {
        socket.emit("realTimeDataError", { status:500, error: "Internal Server Error" });
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
                    io.emit("realTimeDataError", {status:500, error: "Internal Server Error" });
                }
            }
        });
    } catch (error) {
        console.error("Error watching options data changes:", error);
        io.emit("realTimeDataError", { error: "Internal Server Error" });
    }
};

module.exports = { emitRealTimeData , watchOptionsDataChanges };


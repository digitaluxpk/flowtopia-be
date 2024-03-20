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
        const changeStream = OptionsData.watch();

        changeStream.on("change", (change) => {
            io.emit("realTimeData", change.fullDocument);
        });
    } catch (error) {
        console.error("Error watching options data changes:", error);
        io.emit("realTimeDataError", { error: "Internal Server Error" });
    }
};

module.exports = { emitRealTimeData , watchOptionsDataChanges };


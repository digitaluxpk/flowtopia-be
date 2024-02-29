const  intrinioSDK =require("intrinio-sdk");
intrinioSDK.ApiClient.instance.authentications["ApiKeyAuth"].apiKey = process.env.INTRINIO_API_KEY;
intrinioSDK.ApiClient.instance.enableRetries = true;

const realTimeData = async (res) => {
    return new Promise((resolve, reject) => {
        const opts = {
            source: null,
            type: null,
            strike: null,
            strikeGreaterThan: null,
            strikeLessThan: null,
            volumeGreaterThan: null,
            volumeLessThan: null,
            openInterestGreaterThan: null,
            openInterestLessThan: null,
            moneyness: null,
            stockPriceSource: null,
            model: null,
            showExtendedPrice: null
        };
        const options = new intrinioSDK.OptionsApi();
        const symbol = "SPXW";
        let expiration = new Date();
        expiration = expiration.toISOString().split("T")[0];
        options
            .getOptionsChainRealtime(symbol, expiration, opts)
            .then((data) => {
                const filteredData = data.chain.map((item) => {
                    const time = item.price.ask_timestamp;
                    const side = item.price.ask > item.price.bid ? "Buy" : "Sell";
                    const spot = item.stats.underlying_price;
                    const premium = item.price.last;
                    const symb = item.option.ticker;
                    const cp = item.option.type === "call" ? "Calls" : "Puts";
                    const strk = item.option.strike;
                    const exp = item.option.expiration;
                    const price = item.price.last;

                    return { time, side, spot, premium, symb, cp, strk, exp, price };
                });

                // console.log(filteredData);
                resolve(filteredData);
                res.json(filteredData);
            })
            .catch(function (error) {
                // console.error(error);
                reject(error);
            });
    });
};

module.exports = { realTimeData };

const CoinbasePro = require('coinbase-pro')
const CandleStick = require('../models/candlestick')

/**
 * A historical service class, using Coinbase API to gather historical rates
 *  of the desired cryptocurrency and parse them using the Candlestick model
 */
class HistoricalService {

    /**
     * Constructor of historical service class
     * @param {*} {start, end, interval, product} the destructed set of Start time, End time, Interval time, and Product type to query historical rates
     */
    constructor({start, end, interval, product}) {
        this.start = start
        this.end = end
        this.interval = interval
        this.product = product
        this.client = new CoinbasePro.PublicClient();
    }

    /**
     * Main function to get historical rates and parsed them as candlesticks
     * @returns a list of historical rates between the initialized time domain, represented in candlesticks
     */
    async getData() {
        const intervals = this.createRequest()
        const result = await this.performIntervals(intervals)
        console.log('Total:', result.length)

        const filtered = this.filterData(result)
        console.log('Filtered:', filtered.length)

        const candlesticks = filtered.map((x) => {
            return new CandleStick({
                interval: this.interval,
                startTime: new Date(x[0] * 1e3),
                low:    x[1],
                high:   x[2],
                open:   x[3],
                close:  x[4],
                volume: x[5]
            })
        })

        return candlesticks
    }

    /**
     * Helper function to help filter out duplicated time stamps
     * @param {*} data the historical data to filter out
     * @returns the filtered historical data
     */
    filterData(data) {
        const timeStamp = {}
        return data.filter((x) => {
            const str = `${x[0]}`
            if (timeStamp[str] !== undefined) {
                return false
            }
            timeStamp[str] = true
            return true
        })
    }

    /**
     * Create a list of intervals to process, based on the initialized interval, start and end time
     * @returns a list of intervals to create the historical rates on
     */
    createRequest(){
        const max = 300
        const delta = (this.end.getTime() - this.start.getTime()) * 1e-3 // difference in seconds
        const numInterval = delta/this.interval         // # of intervals between start and end
        const numRequest = Math.ceil(numInterval/max)   // # of request(s)
        // console.log(delta, numInterval, numRequest)

        const intervals = Array(numRequest).fill().map( (_, reqNum) => {
            const size = this.interval * 300 * 1e3
            // each request number uses a different start time, each spaced out by declared size
            const start = new Date(this.start.getTime() + (reqNum * size))
            // last request number uses the current end time, else make a new end point for each interval of declared size
            const end = (reqNum + 1 === numRequest) ? this.end : new Date(start.getTime() + size)

            return {start, end}
        })
        return intervals
    }

    /**
     * Perform a single historical rate request, based on the start and end time
     * @param {*} {start, end} the destructured Start and End time to request the rates 
     * @returns the historical rates of the given time interval
     */
    async performRequest({ start, end }){
        /* Example of a history entry:
         *        Time        Low       High      Open     Close      Volume
         *     [ 1654727100, 30285.47, 30305.58, 30295.25, 30300.14, 9.69855446 ] 
         * NOTE: will give history in descending time */
        const result = await this.client.getProductHistoricRates(this.product, 
            {
                start, 
                end, 
                granularity: this.interval
            })
        return result
    }

    /**
     * Recursively perform the historical-rate request on a list of intervals, with a delay in-between
     * @param {*} intervals the list of intervals that we will execute the request on
     * @returns a list of historical rates in the given intervals
     */
    async performIntervals(intervals) {
        if (intervals.length == 0) { return [] }

        const interval = intervals[0]
        console.log(interval)
        const result = await this.performRequest(interval)
        console.log(result.length)

        /* For Coinbase: https://help.coinbase.com/en/pro/other-topics/api/faq-on-api
           We timeout each request for 1/3 second, up to 3 request per second */
        await timeout(1/3 * 1e3) 
        const next = await this.performIntervals(intervals.slice(1))
        return result.reverse().concat(next) // NOTE: we reverse the result for ascending time order
    }
}

/**
 * Standard time-out function for API limit
 * @param {*} ms the time in miliseconds
 * @returns a Promise on timing out
 */
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = HistoricalService
const CoinbasePro = require('coinbase-pro')

/**
 * Standard time-out function for API limit
 * @param {*} ms the time in miliseconds
 * @returns a Promise on timing out
 */
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class HistoricalService {

    /**
     * Constructor of historical service class
     * @param {*} {start, end, interval, product} the destructed set of Start time, End time, Interval time, and Product to query historical rates
     */
    constructor({start, end, interval, product}) {
        this.start = start
        this.end = end
        this.interval = interval
        this.product = product
        this.client = new CoinbasePro.PublicClient();
    }

    /**
     * Main function to get historical rates
     * @returns a list of historical rates between the initialized time domain
     */
    async getData() {
        const intervals = this.createRequest()
        const result = await this.performIntervals(intervals)
        console.log('Total:', result.length)

        const timeStamp = {}
        const filtered = result.filter((x, i) => {
            const str = `${x[0]}`
            if (timeStamp[str] !== undefined) { 
                return false 
            }
            timeStamp[str] = true
            return true
        })

        console.log('Filtered:', filtered.length)

        return filtered
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
        return result.reverse().concat(next)
    }
}

module.exports = HistoricalService
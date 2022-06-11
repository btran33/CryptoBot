
class CandleStick {
    /**
     * Default constructor of the candlestick model class
     * @param {*} {low, high, open, close, price, interval, startTime, volume} 
     * Destructed set of low, high, open and close price, as well as the interval, start time, and volume 
     */
    constructor({ low, high, open, close, price, interval, startTime = new Date(), volume }) {
            this.low = low || price
            this.high = high || price
            this.open = open || price
            this.close = close || price
            this.interval = interval
            this.startTime = startTime
            this.volume = volume || 0
            this.state = close ? 'close' : 'open'
    }

    /**
     * Helper function to get the average price of a candlestick
     * @returns the average price of the candlestick
     */
    average() {
        return (this.close + this.low + this.high) / 3
    }
}

module.exports = exports = CandleStick
/**
 * The class representing a candlestick in the historical rates of a cryptocurrency
 */
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
            this.volume = volume || 1e-5
            this.state = close ? 'close' : 'open'
    }

    /**
     * Helper function to get the average price of a candlestick
     * @returns the average price of the candlestick
     */
    average() {
        return (this.close + this.low + this.high) / 3
    }

    /**
     * Function to update our candlestick, given the price, volume and time input
     * @param {*} {price, volume, time} Destructed set of new price, volume, and time 
     */
    onPrice({ price, volume, time = new Date() }) {
        if (this.state === 'closed') { 
            throw new Error('Adding to closed candlestick!') 
        }
        
        this.volume += volume

        if (this.high < price) { this.high = price }
        if (this.low > price) { this.low = price }

        this.close = price

        const delta = (time - this.startTime) * 1e-3 // JS time is in milisecs

        if (delta >= this.interval) {
            this.state = 'close'
        }
    }
}

module.exports = exports = CandleStick
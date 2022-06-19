const Trade = require('../models/trade')
const Position = require('../models/position')

/**
 * Abstract class for general strategy, will be the blueprint for
 * future strategies where we extends from this class
 */
class Strategy {

    /**
     * Constructor for a strategy
     * @param {[function: (x) => {buySignalHandler(x)}
     *          function: (x) => {sellSignalHandler(x)}]} {onBuySignal, onSellSignal} the functions to handle buy/sell signal
     */
    constructor({ onBuySignal, onSellSignal }){
        this.onBuySignal = onBuySignal
        this.onSellSignal = onSellSignal
        this.positions = {}
    }

    /**
     * The abstract main function to run the stratergy
     * @param {*} {sticks, time} the candlesticks of historical rates, and the time the function is called
     */
    async run({ sticks, time }){}

    /**
     * Helper function to get all current positions of the strategy
     * @returns an array of positions that the strategy is currently keeping track of
     */
    getPositions(){
        return Object.keys(this.positions).map((k) => this.positions[k])
    }

    /**
     * Function to return all our open positions 
     * @returns an array of open positions
     */
    openPosition() {
        return this.getPositions().filter(p => p.state === 'open')
    }

    /**
     * Create an opening position
     * @param {*} {price, time, amount, id} the current price, time of creation, amount to buy, and ID of the position
     */
    async positionOpened({ price, time, amount, id }) {
        const trade = new Trade({ price, time, size: amount })
        const position = new Position({ trade, id })
        this.positions[id] = position
    }

    /**
     * Create a closing position
     * @param {*} {price, time, amount, id} the current price, time of creation, amount to sell, and ID of the position
     */
    async positionClosed({ price, time, amount, id }) {
        const trade = new Trade({ price, time, size: amount })
        const position = this.positions[id]

        if (position) {
            position.close({ trade })
        }
    }
}

module.exports = Strategy
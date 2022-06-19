/**
 * The class representing a trade in the market
 */
class Trade {
    /**
     * Constructor of a trade object
     * @param {*} { price, time, size } the destructed set of the trade's price, time of trade, and trade amount
     */
    constructor({ price, time, size }){
        this.price = price
        this.time = time
        this.size = size
    }
}

module.exports = Trade
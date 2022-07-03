const colors = require('colors/safe')

/**
 * The class representing our position in the market
 */
class Position {

    /**
     * The constructor of the market position, default to 'open' position
     * @param {*} {trade, id} destructed set of our trade object and the ID of the trade 
     */
    constructor({ trade, id }) {
        this.state = 'open'
        this.enter = trade
        this.id = id
    }

    /**
     * Helper function to close the position with a trade
     * @param {*} trade the trade object that will close the position
     */
    close({ trade }) {
        this.state = 'closed'
        this.exit = trade
    }

    /**
     * Helper function to calculate the profit of the enter and exit trade
     * @returns the calculated profit of the trade, fee included
     */
    profit() {
        // TODO: fix the fee of tradings
        const fee = 0.0025
        const entrance = (this.enter.price) * (this.enter.size + fee)

        if (this.exit) {
            const exit = (this.exit.price)  * (this.exit.size - fee)
            return exit - entrance
        }
        return 0
    }

    /**
     * Function to return our profit in 2-decimal placed string
     * @returns calculated profit in 2-decimal placed string
     */
    profitString() {
        return this.profit().toFixed(2)
    }

    /**
     * Print the position's information, including enter & exit price and time, as well as the profit
     */
    print() {
        const enter = `Enter | ${colors.yellow(this.enter.price.toFixed(2))} ${this.enter.size} = $${colors.green((this.enter.price * this.enter.size).toFixed(2))} | ${this.enter.time.toLocaleString('en-US')}`
        const exit = this.exit ? `Exit | ${colors.magenta(this.exit.price.toFixed(2))} ${this.exit.size} = $${colors.green((this.exit.price * this.exit.size).toFixed(2))} | ${this.exit.time.toLocaleString('en-US')}` : ''

        var profit = ''
        if (this.state === 'closed'){
            const prof = `${this.profitString()}`
            const colored = this.profit() > 0 ? colors.green(prof) : colors.red(prof)
            profit = `Profit: ${colored}`
        }

        console.log(`${enter} --- ${exit} --- ${profit}`)
    }
}

module.exports = Position
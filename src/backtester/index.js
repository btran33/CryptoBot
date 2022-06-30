const Runner = require('../runner')
const randomstring = require('randomstring')
const colors = require('colors/safe')

/**
 * The class representing the backtester for our strategies
 */
class BackTester extends Runner {
    /**
     * Begin the backtester
     */
    async begin() {
        try{
            const history = await this.historical.getData()

            await Promise.all(history.map((stick, index) => {
                const sticks = history.slice(0, index + 1)
                return this.strategy.run({
                    sticks,
                    time: stick.startTime
                })
            }))

            this.printPositions()
            this.printProfit()

        } catch (e) {
            console.log('BackTester Error:', e)
        }
    }

    /**
     * The backtester's on-buy-signal handler
     * @param {*} { price, time } the destructed set of the price and time to open the position
     */
    async onBuySignal({ price, time }) {
        console.log('BUY SIGNAL')
        const id = randomstring.generate(20)
        this.strategy.positionOpened({
            price, 
            time,
            amount: 1.0,
            id: id
        })
    }

    /**
     * The backtester's on-sell-signal handler
     * @param {*} { price, size, position, time } the destructed set of price, time, amount, and current position to close said position
     */
    async onSellSignal({ price, size, position, time }) {
        console.log('SELL SIGNAL')
        this.strategy.positionClosed({
            price,
            time,
            amount: size,
            id: position.id
        })
    }
}

module.exports = BackTester
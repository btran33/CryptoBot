const Runner = require('../runner')
const Ticker = require('../ticker')

class Trader extends Runner {

    constructor(data){
        super(data)
        this.ticker = new Ticker({
            product: this.product,
            onTick: async (tick) => { await this.onTick(tick) },
            onError:      (error) => { this.onError(error) }
        })
    }

    async begin() {
        const history = await this.historical.getData()
        this.ticker.begin()
    }

    /**
     * The trader's on-buy-signal handler
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
     * The trader's on-sell-signal handler
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

    async onTick(tick) {
        console.log(tick)
    }

    onError(error) {
        console.log(error)
    }
}

module.exports = exports = Trader
const Candlestick = require('../models/candlestick')
const Runner = require('../runner')
const Ticker = require('../ticker')
const randomstring = require('randomstring')
const colors = require('colors/safe')

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
        this.currentCandle = null 
        this.history = await this.historical.getData()
        this.ticker.begin()
    }

    /**
     * The trader's on-buy-signal handler
     * @param {*} { price, time } the destructed set of the price and time to open the position
     */
     async onBuySignal({ price, time }) {
        console.log(colors.green('BUY SIGNAL!'))
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
        console.log(colors.cyan('SELL SIGNAL!'))
        this.strategy.positionClosed({
            price,
            time,
            amount: size,
            id: position.id
        })
    }

    /**
     * Handle the incoming ticks of the market live-feed
     * @param {*} tick 
     */
    async onTick(tick) {
        const parseTime = Date.parse(tick.time)
        const time = isNaN(parseTime) ? new Date() : new Date(parseTime)
        const price = parseFloat(tick.price)
        const volume = parseFloat(tick.last_size)
        console.log(`\nTime: ${time}    Price: $${price.toFixed(2)}    Volume: ${volume}`)
        
        try {
            // update/create our current candlestick
            if (this.currentCandle) {
                console.log('Updating current candlestick...')
                this.currentCandle.onPrice({ price, volume, time })
            } else {
                console.log('Creating current candlestick...')
                this.currentCandle = new Candlestick({
                    price: price,
                    volume: volume,
                    interval: this.interval,
                    startTime: time
                })
            }

            // copy and push our current candle onto the history
            const sticks = this.history.slice()
            sticks.push(this.currentCandle)

            // run our strategy
            await this.strategy.run({ sticks, time})
            console.log(`Successfully ran ${this.strategyType} strategy!`)
            this.printPositions()

            // update history to have our new candle
            if (this.currentCandle.state === 'closed') {
                const candle = this.currentCandle
                this.currentCandle = null
                this.history.push(candle)

                this.printProfit()
            }
        } catch (err) {
            console.log('Tick-handler Error:', err)
        }
    }

    onError(error) {
        console.log(error)
    }
}

module.exports = exports = Trader
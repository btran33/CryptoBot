const Candlestick = require('../models/candlestick')
const Runner = require('../runner')
const Ticker = require('../ticker')
const Broker = require('../broker')
const randomstring = require('randomstring')
const colors = require('colors/safe')

/**
 * A class representing the Trader in the market. Extended from the Runner class,
 * this utilizes real-time feed, a broker to organize trades, and the initialized strategy,
 * to analyze the market and signal the broker when to buy/sell.
 */
class Trader extends Runner {
    constructor(data){
        super(data)

        this.isLive = data.live
        this.funds = data.funds
        this.totalProfit = 0
        this.ticker = new Ticker({
            product: this.product,
            onTick: async (tick) => { await this.onTick(tick) },
            onError:      (error) => { this.onError(error) }
        })
        this.broker = new Broker({ isLive: this.isLive, product: this.product })
    }
    
    /**
     * Start up the trader
     */
    async begin() {
        this.currentCandle = null 
        this.history = await this.historical.getData()  // get the historical data
        this.ticker.begin()                             // start the feed
        this.broker.begin()                             // start the broker
    }

    /**
     * The trader's on-buy-signal handler
     * @param {*} { price, time } the destructed set of the price and time to open the position
     */
     async onBuySignal({ price, time }) {
        console.log(colors.green('BUY SIGNAL!'))
        const result = await this.broker.buy({ price, funds: this.funds })
        if (!result) {
            console.log('No result on buying :(')
            return
        }

        const id = randomstring.generate(20)
        this.strategy.positionOpened({
            price: result.price, 
            time, 
            amount: result.size, 
            id
        })
    }

    /**
     * The trader's on-sell-signal handler
     * @param {*} { price, size, position, time } the destructed set of price, time, amount, and current position to close said position
     */
    async onSellSignal({ price, size, position, time }) {
        console.log(colors.cyan('SELL SIGNAL!'))
        const result = await this.broker.sell({ price, size })
        if (!result) {
            console.log('No result on selling :(')
            return
        }
        // TODO: decide if bot should update allowable funds on every positive sell
        // this.funds = result.price * result.size // update funds
        this.totalProfit += ((result.price * result.size).toFixed(2)) - this.funds
        
        this.strategy.positionClosed({
            price: result.price, 
            time, 
            amount: result.size, 
            id: position.id
        })

        console.log(result.price * result.size)
    }
    
    /**
     * Handle the incoming ticks of the market live-feed
     * @param {*} tick the live tick of the trades, an example of the format is: 
     * {
        type: 'ticker',
        sequence: 562428992,
        product_id: 'BTC-USD',
        price: '20110.77',
        open_24h: '22000',
        volume_24h: '363.16891040',
        low_24h: '10020.65',
        high_24h: '22222',
        volume_30d: '50487.66038240',
        best_bid: '20059.60',
        best_ask: '20110.77',
        side: 'buy',
        time: '2022-06-30T00:50:58.113766Z',
        trade_id: 39118692,
        last_size: '0.00063481'
        }
     */
    async onTick(tick) {
        // logging each tick's info
        const parseTime = Date.parse(tick.time)
        const time = isNaN(parseTime) ? new Date() : new Date(parseTime)
        const price = parseFloat(tick.price)
        const volume = parseFloat(tick.last_size)
        const side = tick.side === 'buy' ? colors.magenta(tick.side) : colors.red(tick.side)
        console.log(`\nTime: ${time.toLocaleString('en-US')}    Price: $${colors.yellow(price.toFixed(2))}`)
        console.log(`Volume: ${colors.blue(volume)}    Total: $${colors.green((price * volume).toFixed(2))}     Side: ${side}`)
        
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
            console.log(`Successfully ran ${this.strategyType} strategy! Current profit: $${this.totalProfit}`)
            this.printPositions()

            // update history to have our new candle
            if (this.currentCandle.state === 'closed') {
                const candle = this.currentCandle
                this.currentCandle = null
                this.history.push(candle)

                this.printProfit()
                const positions = this.strategy.getPositions()
                const total = positions.reduce((r, p) => {
                    return r +  p.profit()
                }, 0)
                console.log(`---------------------------------------------------------------------- ${total}`)
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
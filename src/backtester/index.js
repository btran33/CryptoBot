const CandleStick = require('../models/candlestick')
const Historical = require('../historical')
const { SimpleStrategy, SimpleMACD, Factory } = require('../strategy')
const randomstring = require('randomstring')
const colors = require('colors/safe')
 
class BackTester {
    constructor({ start, end, interval, product, strategyType }) {
        this.startTime = start
        this.endTime = end
        this.interval = interval
        this.product = product
        this.strategyType = strategyType
        this.historical = new Historical({
            start, end, interval, product
        })
    }

    async begin() {
        try{
            const history = await this.historical.getData()
            this.strategy = Factory.create(this.strategyType, {
                onBuySignal: (x) => { this.onBuySignal(x) },
                onSellSignal: (x) => { this.onSellSignal(x) }
            })

            await Promise.all(history.map((stick, index) => {
                const sticks = history.slice(0, index + 1)
                return this.strategy.run({
                    sticks,
                    time: stick.startTime
                })
            }))

            const positions = this.strategy.getPositions()
            positions.forEach((p) => {
                p.print()
            })

            console.log(positions.length, 'Positions')

            positions.forEach((p, i) => {
                if (p.enter === undefined || p.exit === undefined){
                    console.log(`${i}th`, p)
                }
            })

            const total = positions.reduce((r, p) => {
                return r +  p.profit()
            }, 0)

            const prof = `${total}`
            const colored = total > 0 ? colors.green(prof) : colors.red(prof)
            console.log(`Total: ${colored}`)

        } catch (e) {
            console.log('BackTester Error:', e)
        }
    }

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
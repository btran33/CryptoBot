const Historical = require('../historical')
const { Factory } = require('../strategy')
const colors = require('colors/safe')
/**
 * Abstract class for the automation logic of buy/sell in the market
 * (Currently extended to backtester and trader class)
 */
class Runner {
    constructor({ start, end, interval, product, strategyType }) {
        this.startTime = start
        this.endTime = end
        this.interval = interval
        this.product = product
        this.strategyType = strategyType
        this.historical = new Historical({
            start, end, interval, product
        })

        
        this.strategy = Factory.create(this.strategyType, {
            onBuySignal: (x) => { this.onBuySignal(x) },
            onSellSignal: (x) => { this.onSellSignal(x) }
        })
    }

    printPositions() {
        const positions = this.strategy.getPositions()
        positions.forEach((p) => {
            p.print()
        })
        console.log(positions.length, 'Positions')
        // positions.forEach((p, i) => {
        //     if (p.enter === undefined || p.exit === undefined){
        //         console.log(`${i}th`, p)
        //     }
        // })
    }

    printProfit() {
        const positions = this.strategy.getPositions()
        const total = positions.reduce((r, p) => {
            return r +  p.profit()
        }, 0)

        const prof = `${total}`
        const colored = total > 0 ? colors.green(prof) : colors.red(prof)
        console.log(`Total: ${colored}`)
    }

    async begin() {}
    async onBuySignal(data) {}
    async onSellSignal(data) {}
}

module.exports = exports = Runner
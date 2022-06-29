const Historical = require('../historical')
const { Factory } = require('../strategy')

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

    async begin() {}
    async onBuySignal(data) {}
    async onSellSignal(data) {}
}

module.exports = exports = Runner
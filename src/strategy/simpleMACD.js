const Strategy = require('./strategy');
const tulind = require('tulind')

/**
 * Simplified Moving-Average Convergence/Divergence indicator strategy
 */
class SimpleMACD extends Strategy {
    async run({ sticks, time }) {
        const prices = sticks.map(stick => stick.average())

        const shortPeriod = 12
        const longPeriod  = 26
        const signalPeriod = 9
        const indicator = tulind.indicators.macd.indicator
        const results = await indicator([prices], [shortPeriod, longPeriod, signalPeriod])

        // const macd = results[0]
        // const signal = results[1]
        const histogram = results[2] // generated from subtracting macd-signal from macd
        const length = histogram.length
        if (length < 2) return

        const last = histogram[length - 1]
        const penUltimate = histogram[length - 2]

        const boundary = 0.5 // adjust boundary to vary the cross-over point
        const wasAbove = penUltimate > boundary
        const wasBelow = penUltimate < -boundary
        const isAbove = last > boundary
        const isBelow = last < -boundary

        const open = this.openPosition()
        const price = sticks[sticks.length - 1].close

        // only buy with no open positions
        if (open.length == 0) {
            /* when histogram results of the last 2 candlesticks indicate
               a cross-over to diverge, it's a good time to buy (probably) */
            if (wasAbove && isBelow) {
                this.onBuySignal({
                    price, 
                    time
                })
            }
        } else {
            open.forEach(position => {
                /* when histogram results of the last 2 candlesticks indicate
                   a cross-over to converge, it's a good time to buy (probably) */
                if (wasBelow && isAbove) {
                    if (position.enter.price * 1.01 < price) {
                        this.onSellSignal({
                            price,
                            size: position.enter.size,
                            position,
                            time
                        })
                    }
                } 
                /* otherwise, a stop-loss of 85% of original price is implemented,
                   minimizing our loss when the indicator is wrong */
                if (position.enter.price * 0.85 > price) {
                    this.onSellSignal({
                        price,
                        size: position.enter.size,
                        position,
                        time
                    })
                }
            })
        }   
    }
}

module.exports = SimpleMACD
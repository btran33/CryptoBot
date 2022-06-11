const Strategy = require("./strategy");

/**
 * Simple strategy that will guarantee to lose your life savings.
 * We look at the last two candlesticks, and we will buy/sell if the market price go down/up
 */
class SimpleStrategy extends Strategy {
    async run({ sticks, curTime }) {
        const stickLength = sticks.length
        if (stickLength < 20) return

        const last = sticks[stickLength - 1]
        const penUltimate = sticks[stickLength - 2]
        const close = last.close

        const open = this.openPosition()

        if (open.length == 0) {
            if (last < penUltimate) {
                this.onBuySignal({ price, amount: 1 })
            }
        } else {
            if (last > penUltimate) {
                open.forEach(p => {
                    this.onSellSignal({ price, size: p.enter.size})
                });
            }
        }
        
    }
}

module.exports = SimpleStrategy
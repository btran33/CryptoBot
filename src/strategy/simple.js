const Strategy = require("./strategy");

/**
 * Simple strategy that will guarantee to lose your life savings.
 * We look at the last two candlesticks, and we will buy/sell if the market price go down/up
 */
class SimpleStrategy extends Strategy {
    async run({ sticks, time }) {
        const stickLength = sticks.length
        if (stickLength < 20) return

        const last = sticks[stickLength - 1].close
        const penUltimate = sticks[stickLength - 2].close
        const exit_price = last

        const open = this.openPosition()

        /* General strategy to buy when the last & penultimate candlesticks' price
           indicate a drop/rise in price, indicating the time to buy/sell */
        if (open.length == 0) {
            if (last < penUltimate) {
                
                this.onBuySignal({
                    price: exit_price, 
                    time 
                })
            }
        } else {
            if (last > penUltimate) {
                open.forEach(p => {
                    // if (p.enter.price * 1.01 < exit_price){
                        this.onSellSignal({ 
                            price: exit_price, 
                            size: p.enter.size, 
                            position: p,
                            time
                        })
                    // }
                });
            }
        }
        
    }
}

module.exports = SimpleStrategy
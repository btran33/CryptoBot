const colors = require('colors/safe')

class Position {
    constructor({ trade, id }) {
        this.state = 'open'
        this.enter = trade
        this.id = id
    }

    close({ trade }) {
        this.state = 'closed'
        this.exit = trade
    }

    profit() {
        const fee = 0.0025
        const entrance = (this.enter.price) * (1 + fee)

        if (this.exit) {
            const exit = (this.exit.price)  * (1 - fee)
            return exit - entrance
        }
        return 0
    }

    profitString() {
        return this.profit().toFixed(2)
    }

    print() {
        const enter = `Enter | ${colors.yellow(this.enter.price.toFixed(2))} | ${this.enter.time}`
        const exit = this.exit ? `Exit | ${colors.magenta(this.exit.price.toFixed(2))} | ${this.exit.time}` : ''

        var profit = ''
        if (this.state === 'closed'){
            const prof = `${this.profitString()}`
            const colored = this.profit() > 0 ? colors.green(prof) : colors.red(prof)
            profit = `Profit: ${colored}`
        }

        console.log(`${enter} --- ${exit} --- ${profit}`)
    }
}

module.exports = Position
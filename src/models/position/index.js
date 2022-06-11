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
}

module.exports = Position
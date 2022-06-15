const Simple = require('./simple')
const MACD = require('./simpleMACD')

exports.create = function(strategy, data) {
    switch (strategy) {
        case 'macd':
            return new MACD(data)
        case 'simple':
            return new Simple(data)
        default:
            return new MACD(data)
    }
}
const Simple = require('./simple')
const MACD = require('./simpleMACD')

/**
 * The function to generate a strategy based on the input
 * @param {*} strategy the name of the strategy ('macd', 'simple')
 * @param {*} data the data needed to pass into each strategy's constructor
 * @returns the strategy object of the respective chosen strategy
 */
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
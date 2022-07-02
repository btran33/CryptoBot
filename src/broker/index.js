const Coinbase = require('coinbase-pro')
const Feed = require('../feed')
const config = require('../configuration')
const uuid = require('uuid')

const key = config.get('COINBASE_API_KEY')
const secret = config.get('COINBASE_API_SECRET')
const passphrase = config.get('COINBASE_API_PASSPHRASE')
const apiURL = config.get('COINBASE_API_URL')
/**
 * Broker class to organize trades
 */
class Broker {
    constructor({ isLive, orderType = 'market', product }) {
        this.isLive = isLive
        this.orderType = orderType
        this.product = product
        this.feed = new Feed({
            product,
            onUpdate: async (data) => { await this.onUpdate(data) },
            onError:        (error) => { this.onError(error) }
        })
        this.client = new Coinbase.AuthenticatedClient(key, secret, passphrase, apiURL)
        this.state = 'idle'
        this.tokens = {}
        this.callbacks = {}
        this.orders = {}
    }

    begin() {
        this.state = 'running'
        this.feed.begin()
    }

    async onUpdate(data) {
        try {
            switch (data) {
                case 'received':
                    console.log('Sale received!')
                    await this.handleReceived(data)
                    break
                case 'done':
                    console.log('Sale finished!')
                    await this.handleDone(data)
                    break
                case 'match':
                    console.log('Sale matched!')
                    await this.handleMatch(data)
                    break
                default:
                    break
            }
        } catch (error) {
            console.log(error)
        }
    }

    /**
     * Handle when order is received
     * @param {*} data 
     */
    async handleReceived(data) {
        const clientId = data['client_oid']
        const orderId = data['order_id']
        const side = data['side']

        if (this.tokens[clientId] === side) {
            data.filledPrice = 0
            data.filledSize = 0
            this.orders[orderId] = data
        }
    }

    /**
     * Handle when order is matched
     * @param {*} data 
     */
    async handleMatch(data) {
        const orderId = data['taker_order_id']
        const price = parseFloat(data['price'])
        const time = new Date(data['time'])
        const amount = parseFloat(data['size'])

        if (this.orders[orderId]) {
            this.orders[orderId].filledPrice += (price * amount)
            this.orders[orderId].filledSize += amount
        }
    }

    /**
     * Handle when order is completed
     * @param {*} data 
     */
    async handleDone(data) {
        const orderId = data['order_id']
        const side = data['side']
        const time = new Date(data['time'])
        const order = this.orders[orderId]

        if (order) {
            const orderData = {
                time,
                order: order.id,
                size: order.filledSize,
                price: (order.filledPrice / order.filledSize),
                funds: (order.filledPrice * order.filledSize)
            }
        }

        const token = order['client_oid']
        const lock = this.callbacks[token]
        lock(orderData)
    }

    onError(error) {
    }

    async buy({ price, funds }) {
        if (!this.isLive) {
            return { 
                price: price,
                size : funds / price
            }
        }

        if (this.state !== 'running') { return }
        this.state = 'buying'
        
        const token = uuid()
        this.tokens[token] = 'buy'

        const lock = () => {
            return new Promise((resolve, reject) => {
                this.callbacks[token] = resolve
            })
        }
        const data = this.generateMarketData({ token, funds })
        const order = await this.client.buy(data)

        if (order.message) {
            this.state = 'running'
            throw new Error(order.message)
        }

        const filled = await lock()
        return filled
    }

    async sell({ price, size }) {
        if (!this.isLive) {
            return {
                price: price,
                size: size,
                funds : price * size 
            }
        }

        if (this.state !== 'running') { return }
        this.state = 'selling'

        const token = uuid()
        this.tokens[token] = 'sell'

        const lock = () => {
            return new Promise((resolve, reject) => {
                this.callbacks[token] = resolve
            })
        }

        const data = this.generateMarketData({ token, size })
        const order = await this.client.sell(data)

        if(order.message){
            this.state = 'running'
            throw new Error(order.message)
        }

        const filled = await lock()
        return filled
    }

    generateMarketData({ token, funds, size }) {
        const order = {
            product_id: this.product,
            type: 'market',
            client_oid: token,
        }

        const amount = funds ? { funds } : { size }
        return Object.assign(order, amount)
    }
}

module.exports = exports = Broker
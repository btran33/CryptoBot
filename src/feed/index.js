const CoinbasePro = require('coinbase-pro')
const config = require('../configuration')

// user-authentication info (make sure to include in config.json with the indicated keys)
const key = config.get('COINBASE_API_KEY')
const secret = config.get('COINBASE_API_SECRET')
const passphrase = config.get('COINBASE_API_PASSPHRASE')
const wsURL = config.get('COINBASE_WS_URL')

/**
 * A class representing the user-authenticated live-feed on selling/trading of a product in the market
 */
class Feed {
    constructor({ product, onUpdate, onError }) {
        this.product = product
        this.onUpdate = onUpdate
        this.onError = onError
        this.running = false
    }

    /**
     * Start up the feed
     */
    async begin() {
        this.running = true
        this.socket = new CoinbasePro.WebsocketClient(
            [this.product],
            wsURL,
            { key, secret, passphrase },
            { 
                channels: ['user', 'heartbeat']
            }
        )

        this.socket.on('message', data => {
            if (data.type === 'heartbeat') { return }
            this.onUpdate(data)
        })

        this.socket.on('error', error => {
            this.onError(error)
            this.socket.connect()
        })

        this.socket.on('close', () => {
            if (this.running) {
                this.socket.connect()
            }
        })
    }

    /**
     * Stop the feed
     */
    async stop() {
        this.running = false
        this.socket.close()
    }
}

module.exports = exports = Feed
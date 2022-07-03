const CoinbasePro = require('coinbase-pro')
const config = require('../configuration')

const wsURL = config.get('COINBASE_WS_URL')
/**
 * The class to set up a non-user-authenticated live-feed on selling/trading of a product in the market
 */
class Ticker {
    constructor({ product, onTick, onError }) {
        this.product = product
        this.onTick = onTick
        this.onError = onError
        this.running = false
    }

    /**
     * Start up the feed
     */
    begin() {
        this.running = true
        this.client = new CoinbasePro.WebsocketClient(
            [this.product],
            wsURL,
            null,
            { 
                channels : ['ticker', 'heartbeat'] 
            }
        );
            
        this.client.on('message', async data => {
            if (data.type === 'ticker') {
                await this.onTick(data)
            }
        })

        this.client.on('error', err => {
            this.onError(err)
            this.client.connect()
        })

        this.client.on('close', () => {
            if (this.running) {
                this.client.connect()
            }
        })
    }

    /**
     * Stop the feed
     */
    stop() {
        this.running = false
        this.client.close()
    }
}

module.exports = Ticker
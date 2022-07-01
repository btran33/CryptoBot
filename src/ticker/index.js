const CoinbasePro = require('coinbase-pro')
const config = require('../configuration')

const wsURL = config.get('COINBASE_WS_URL')
/**
 * The class to set up a live feed on selling/trading of a product in the crypto market
 */
class Ticker {
    constructor({ product, onTick, onError }) {
        this.product = product
        this.onTick = onTick
        this.onError = onError
        this.running = false
    }

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

    stop() {
        this.running = false
        this.client.close()
    }
}

module.exports = Ticker
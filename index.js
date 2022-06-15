const program = require('commander')
const config = require('./src/configuration')
const historical = require('./src/historical')
const BackTester = require('./src/backtester')

// Get the current and yesterday's time as the default for Commander
const now = new Date()
const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1e3)) // js use miliseconds

program.version('1.0.0')
       .option('-i, --interval <int>', 'Interval in seconds for candlestick, mainly a multiple of 60', 300)
       .option('-p, --product <string>', 'Desired product identifier', 'BTC-USD')
       .option('-s, --start <int>', 'Start time in Unix seconds', toDate, yesterday)
       .option('-e, --end <int>', 'End time in Unix seconds', toDate, now)
       .option('-t, --strategy <string>', 'Strategy type, in string', 'macd')
       .parse(process.argv)

/**
 * Simple function to convert time in miliseconds to Date class
 * @param {*} ms time in miliseconds
 * @returns the Date object with the initial time information
 */
function toDate(ms) {
    return new Date(ms * 1e3)
}

const main = async function () {
    console.log(program.opts())
    
    const { interval, product, start, end, strategy } = program.opts()

    const tester = new BackTester({ 
        start, end, interval, product, strategyType: strategy 
    })

    await tester.begin()
}

/* For authenticated client, will utilized later down the line */
// const key = config.get('COINBASE_API_KEY')
// const secret = config.get('COINBASE_API_SECRET')
// const passphrase = config.get('COINBASE_API_PASSPHRASE')
// const apiURL = config.get('COINBASE_API_URL')
// const auth_client = new CoinbasePro.AuthenticatedClient(key, secret, 
//                                                         passphrase, apiURL);

main()
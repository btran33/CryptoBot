const program = require('commander')
const config = require('./configuration')
const historical = require('./src/historical')

// Get the current and yesterday's time as the default for Commander
const now = new Date()
const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1e3)) // js use miliseconds

program.version('1.0.0')
       .option('-i, --interval [int]', 'Interval in seconds for candlestick', 300)
       .option('-p, --product <string>', 'Desired product identifier', 'BTC-USD')
       .option('-s, --start <int>', 'Start time in Unix seconds', toDate, yesterday)
       .option('-e, --end <int>', 'End time in Unix seconds', toDate, now)
       .parse(process.argv)

/**
 * Simple function to convert time in miliseconds to Date class
 * @param {*} ms time in miliseconds
 * @returns 
 */
function toDate(ms) {
    return new Date(ms * 1e3)
}

const main = async function () {
    console.log(program.opts())
    
    const { interval, product, start, end } = program.opts()

    const service = new historical({start, end, interval, product})
    const data = await service.getData()

    // console.log(data[0])
    // console.log(data[1])
}

/* For authenticated client, will utilized later down the line */
// const key = config.get('COINBASE_API_KEY')
// const secret = config.get('COINBASE_API_SECRET')
// const passphrase = config.get('COINBASE_API_PASSPHRASE')
// const apiURL = config.get('COINBASE_API_URL')
// const auth_client = new CoinbasePro.AuthenticatedClient(key, secret, 
//                                                         passphrase, apiURL);

main()
const config = require('../../config.json')

// Get env variables first, if it doesn't exist then use config variables
exports.get = (key) => process.env[key] || config[key]
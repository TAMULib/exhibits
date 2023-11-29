process.env.NODE_ENV = process.env.NODE_ENV || 'development'

import { toWebpackConfig } from './environment'
// const environment = require('./environment')

export default toWebpackConfig()
// module.exports = environment.toWebpackConfig()

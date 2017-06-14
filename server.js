/* eslint no-console: 0 */

import express from 'express'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'

import config from './webpack.config.dev'

const app = express()
const compiler = webpack(config)
const PORT = process.env.PORT || 3000

const devMiddleware = webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
  stats: { colors: true }
})


app.use(devMiddleware)

app.use(webpackHotMiddleware(compiler))

app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
const server = app.listen(PORT, 'localhost', err => {
  if (err) return console.error(err)

  console.log(`Listening at http://localhost:${PORT}`)
});

process.on('SIGTERM', () => {
  console.log('Stopping dev server')
  devMiddleware.close()
  server.close(() => process.exit(0))
})

const watson = require('./services/watson')
const { Router } = require('express')

const routes = new Router()

routes.get('/session', watson.createSession)

routes.post('/message', watson.sendMessage)

module.exports = routes
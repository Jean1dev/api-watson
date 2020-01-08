require('express-async-errors')
const express = require('express')
const routes = require('./routes')

class App {

    constructor() {
        this.server = express()
        this.middlewares()
        this.routes()
        this.exceptionHandler()
    }

    middlewares() {
        this.server.use(express.json())
    }

    routes() {
        this.server.use('/assistant', routes)
        this.server.use(routes)
    }

    exceptionHandler() {}
}

module.exports = new App().server
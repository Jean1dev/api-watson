require('express-async-errors')
const express = require('express')
const routes = require('./routes')
const youch = require('youch')

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

    exceptionHandler() {
        this.server.use(async (err, req, res, next) => {
            const errors = await new youch(err, req).toJSON()
            console.log(errors)

            return res.status(500).json({ error: 'Internal server error' })
        })
    }
}

module.exports = new App().server
const express = require('express')
const logger = require('./middleware/logger')
const endpoints = require('./routes/endpoint.js')
const colors = require('colors')

const app = express()

app.use(express.json())
app.use(logger)

app.use("/api/v1/", endpoints)

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => { console.log(`server running in ${process.env.NODE_ENV} on port ${PORT}...😃`.blue.bold) })

process.on('unhandledRejection', (err, promise) => {
    console.log(`Opps unhandled rejection😟\nError : ${err.message}`.red)
    server.close(() => { process.exit(1) })
})
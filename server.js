// require things
const express = require('express')
const app = express()

const fs = require('fs')

const morgan = require('morgan')

const args = require('minimist')(process.argv.slice(2), {
    default: {port: 5555, debug: false, log: true}
})
// initialize the args
const help = args.help
const port = args.port
const debug = args.debug
const log = args.log

const Database = require('better-sqlite3')

console.log(help,port,debug,log)
if (help) {
    // print help message
    console.log(`server.js [options]

    --port	Set the port number for the server to listen on. Must be an integer
                between 1 and 65535.
  
    --debug	If set to \`true\`, creates endlpoints /app/log/access/ which returns
                a JSON access log from the database and /app/error which throws 
                an error with the message "Error test successful." Defaults to 
                \`false\`.
  
    --log		If set to false, no log files are written. Defaults to true.
                Logs are always written to database.
  
    --help	Return this message and exit.`)
    process.exit(0)
} else {
    // create database
    const db = new Database('log.db')

    // create table
    const sqlInit = `CREATE TABLE IF NOT EXISTS accesslog (id INTEGER PRIMARY KEY,
            remoteaddr TEXT, remoteuser TEXT, time TEXT, method TEXT, url TEXT, protocol TEXT,
            httpversion TEXT, secure TEXT, status INTEGER, referer TEXT, useragent TEXT
        )`;
    db.exec(sqlInit)

    // create app server
    const server = app.listen(port, () => {
        console.log('App listening on port %PORT%'.replace("%PORT%", port))
    })

    const addData = (req, res, next) => {
        let logdata = {
            remoteaddr: req.ip,
            remoteuser: req.user,
            time: Date.now(),
            method: req.method,
            url: req.url,
            protocol: req.protocol,
            httpversion: req.httpVersion,
            secure: req.secure,
            status: res.statusCode,
            referer: req.headers['referer'],
            useragent: req.headers['user-agent']
        }
        const prep = db.prepare(`INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol,
            httpversion, secure, status, referer, useragent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        prep.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, 
            logdata.protocol, logdata.httpversion, log.secure, logdata.status, logdata.referer, logdata.useragent)
        next()
    }

    // middleware adds data to table
    app.use( (req, res, next) => {
        // Your middleware goes here.
        addData(req, res, next)
        res.status(200)
    })

    // if debug is true
    if (debug) {
        // endpoint /app/log/access
        app.get('/app/log/access', (req, res) => {
            // return stuff in db
            const getprep = db.prepare(`SELECT * FROM accesslog`).all()
            res.status(200).json(getprep)
        })

        // endpoint /app/error
        app.get('/app/error', (req, res) => {
            // error out
            throw new Error("Error test successful.")
        })
    }

    // if log is true
    if (log == true) {
        // Use morgan for logging to files
        // Create a write stream to append (flags: 'a') to a file
        const accessLog = fs.createWriteStream('access.log', { flags: 'a' })
        // Set up the access logging middleware
        app.use(morgan('combined', { stream: accessLog }))
    }
}


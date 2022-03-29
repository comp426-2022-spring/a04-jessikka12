// require things
const express = require('express')
const app = express()

const args = require('minimist')(process.argv.slice(2))
const help = args.help

const Database = require('better-sqlite3')


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
} else {
    // initialize the args
    const port = args.port || 3000
    const debug = args.debug || false
    const log = args.log || true
    
    // create database
    const db = new Database('log.db')

    // create table
    // let logdata = {
    //     remoteaddr: req.ip,
    //     remoteuser: req.user,
    //     time: Date.now(),
    //     method: req.method,
    //     url: req.url,
    //     protocol: req.protocol,
    //     httpversion: req.httpVersion,
    //     secure: req.secure,
    //     status: res.statusCode,
    //     referer: req.headers['referer'],
    //     useragent: req.headers['user-agent']
    // }
    const sqlInit = `
        CREATE TABLE IF NOT EXISTS accesslog (
            remoteaddr TEXT, remoteuser TEXT, time TEXT, method TEXT, url TEXT, protocol TEXT,
            httpversion TEXT, secure TEXT, status TEXT, referer TEXT, useragent TEXT
        )`;
        db.exec(sqlInit)
        console.log('made the table')

    // create app server
    const server = app.listen(port, () => {
        console.log('App listening on port %PORT%'.replace("%PORT%", port))
    })
    
}


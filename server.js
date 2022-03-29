// require things
const express = require('express')
const app = express()

const args = require('minimist')(process.argv.slice(2))
const help = args.help

if (help) {
    console.log('server.js [options]\n')
    console.log('  --port\tSet the port number for the server to listen on. Must be an integer')
    console.log('              between 1 and 65535.\n')
    console.log('  --debug\tIf set to `true`, creates endlpoints /app/log/access/ which returns')
    console.log('              a JSON access log from the database and /app/error which throws ')
    console.log('              an error with the message "Error test successful." Defaults to ')
    console.log('			  `false`.\n')
    console.log('  --log\t\tIf set to false, no log files are written. Defaults to true.')
    console.log('			  Logs are always written to database.\n')
    console.log('  --help\tReturn this message and exit.')
} else {
    const port = args.port || 3000
    const debug = args.debug || false
    const log = args.log || true

    // create app server
    const server = app.listen(port, () => {
        console.log('App listening on port %PORT%'.replace("%PORT%", port))
    })
    
}


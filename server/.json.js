module.exports = 
{
    "load": {
        "num": "../engine/num",
        "equ": "../engine/equ",
        "lib": "../engine/lib",
        "dbs": "./dbs/mongo",
        "fmt": "../engine/fmt",
        "emu": "../engine/emu",
        "sys": "../engine/sys",
        "net": "../engine/net"
    },
    "json": {
        "dbs": "./dbs/mongo.json",
        "fmt": "../engine/fmt.json",
        "emu": "../engine/emu.json",
        "sys": "../engine/sys.json",
        "net": "../engine/net.json"
    },
    "crt": "server/ssl/.crt",
    "key": "server/ssl/.key",
    "auth": {
        "load": "auth.js",
        "head": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
            "Access-Control-Max-Age": 2592000
        },
        "host": "127.0.0.1",
        "port": 3000
    },
    "data": {
        "load": "data.js",
        "head": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
            "Access-Control-Max-Age": 2592000
        },
        "host": "127.0.0.1",
        "port": 3001
    },
    "game": {
        "load": "game.js",
        "host": "127.0.0.1",
        "port": 3002
    }
}
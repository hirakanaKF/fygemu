/*
Project: fygemu
Authors: hirakana@kf
*/

// Libraries
const
    process = require("process"),
    fs = require("fs/promises"),
    https = require("https"),
    cfg = require("./.json")
;

let gAesKw, gAesIv, gEcdE, gEcdD, gSvcJson = "";

const 

    gData = {},

    Num = require(cfg.load.num),
    Net = require(cfg.load.net),

    srvop = {

        // Set AES key
        "": m => {
            gAesKw = Buffer.from(m[0], "base64");
            gAesIv = Buffer.from(m[1], "base64");
            gEcdE = m[2];
            gEcdD = m[3];
        },

        // Emu parameter update
        [Num.$DsEmuUpdate]: m => {
            gSvcJson = Net.load(m, null);
        },

        // Sys parameter update
        [Num.$DsSysUpdate]: m => {
            gSvcJson = Net.load(null, m);
        }
    },

    webop = async (req, res) => {

        // Data server only allows GET requests
        if (req.method != "GET") { return res.writeHead(403); }

        // const url = req.url.slice(1);
        
        // 
        res.writeHead(200, cfg.data.head);
        res.write(gSvcJson);
        res.end();
    }
;

// Server message handler
process.on("message", m => { for (const k in m) { srvop[k](m[k]); } });

// Initialize data
Net.constructor(require(cfg.json.net), Num);
gSvcJson = Net.load(
    emu = require(cfg.json.emu),
    sys = require(cfg.json.sys)
);

// Initialize Services
Promise.all([
    fs.readFile(cfg.crt),
    fs.readFile(cfg.key)
])

// WebSocket Server Setup
.then(r => {

    const {host, port} = cfg.data;

    // Start https server
    https.createServer({cert: r[0], key: r[1]}, webop)
    .listen({host, port}, () => {
        console.log(`[Info] Data server boot at https://${host}:${port}.`);
    });
    
})

// Fatal Error
.catch((e) => {
    console.log("[Error] Data server has encounter a fatal error.");
    console.trace(e);
});

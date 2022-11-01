/*
Project: fygemu
Authors: hirakana@kf
*/

// Libraries
const
    process = require("process"),
    crypto = require("crypto"),
    fs = require("fs/promises"),
    https = require("https"),
    ws = require("ws"),
    cfg = require("./.json")
;

let gAesKw, gAesIv, gEcdE, gEcdD;

// Numbers
Object.assign(
    global,
    require(cfg.load.num)
);

// Macros
Object.assign(
    global,
    require(cfg.load.equ)
);

// Game Kernel
const
    Lib = require(cfg.load.lib),
    Dbs = require(cfg.load.dbs),
    Fmt = require(cfg.load.fmt),
    Emu = require(cfg.load.emu),
    Sys = require(cfg.load.sys)
;

// Initialize Engine
Lib.constructor();
Dbs.constructor(require(cfg.json.dbs));
Fmt.constructor(require(cfg.json.fmt), Lib, Dbs);
Emu.constructor(require(cfg.json.emu), Lib, Fmt);
Sys.constructor(require(cfg.json.sys), Lib, Emu, Dbs, ws.WebSocket);

const 

    srvop = {
        "": m => {
            gAesKw = Buffer.from(m[0], "base64");
            gAesIv = Buffer.from(m[1], "base64");
            gEcdE = m[2];
            gEcdD = m[3];
        }
    },

    wsclose = function (e) {
        console.log(`[Info] Client ${this.id} disconnected.`);
        this.dt();
    },

    wserror = function (e) {
        console.log(`[Error] Client ${this.id} error:`);
        console.trace(e);
        this.dt();
    },

    wsmessage = function (m) {
        try {
            this.op(this.dec(m));
        }
        catch (e) {
            console.log(`[Warning] Recieved invalid payload from client ${this.id}:\n${m}\n\nError:`);
            console.trace(e);
        }
    };
;

// Server message handler
process.on("message", m => { for (const k in m) { srvop[k](m[k]); } });

// Initialize Services
Promise.all([
    fs.readFile(cfg.crt),
    fs.readFile(cfg.key)
])

// WebSocket Server Setup
.then(r => {

    const 
        srv = https.createServer({cert: r[0], key: r[1]}),  // HTTPS Server
        wss = new ws.WebSocketServer({server: srv}),        // WebSocket Server
        {host, port} = cfg.game
    ;

    ws.WebSocket.prototype.enc = JSON.stringify;
    ws.WebSocket.prototype.dec = JSON.parse;

    // Should never occur
    wss.on("close", () => {
        console.log("[Info] Server closed.");
    });

    // Should never occur
    wss.on("error", (e) => {
        console.log("[Error] Server error.\n", e);
    });

    // Signin / Signup attempt
    wss.on("connection", (s, r) => {
        try {
            const
                aes = crypto.createDecipheriv("aes-256-cbc", gAesKw, gAesIv),
                b = Buffer.concat([
                    aes.update(Buffer.from(r.url.slice(1), "base64")),
                    aes.final()
                ])
            ;
            
            if (
                !crypto.verify("sha256", b.subarray(64), {
                    key: gEcdE,
                    dsaEncoding: "ieee-p1363"
                }, b.subarray(0, 64)) ||
                b.readDoubleLE(64) < Date.now()
            ) {
                return s.close();
            }

            s.ct(b.subarray(72, b.indexOf(0, 72)).toString("utf-8"), b.subarray(80));
        }
        catch (e) {
            return s.close();
        }
        s.on("close", wsclose.bind(s));
        s.on("error", wserror.bind(s));
        s.on("message", wsmessage.bind(s));
    });

    // Start https server
    srv.listen({host, port}, () => {
        console.log(`[Info] Game server boot on https://${host}:${port}.`);
        console.log(`[Info] Game websocket listen on `, wss.address())
    });
    
})

// Fatal Error
.catch((e) => {
    console.log("[Error] Game server has encounter a fatal error.");
    console.trace(e);

    Promise.all([
        Dbs.fini(), Sys.fini(ws.WebSocket)
    ]);
});

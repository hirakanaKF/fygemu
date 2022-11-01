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
    cfg = require("./.json")
;

const 
    Num = require(cfg.load.num),
    Dbs = require(cfg.load.dbs)
;

let gAesKw, gAesIv, gEcdE, gEcdD;

// Initialize Engine
Dbs.constructor(require(cfg.json.dbs));

const 

    srvop = {
        "": m => {
            gAesKw = Buffer.from(m[0], "base64");
            gAesIv = Buffer.from(m[1], "base64");
            gEcdE = m[2];
            gEcdD = m[3];
        }
    },

    svcop = {
        [Num.$SoIdIn]: Dbs.idGet,
        [Num.$SoIdUp]: (n, p) => Dbs.idNew(crypto.randomBytes(10), n, p, "")
    }

    webop = async (req, res) => {
        let t = "", p;
        try {
            const [type, name, pass] = JSON.parse(
                new TextDecoder().decode(
                    Buffer.from(req.url.slice(1), "base64")
                )
            );

            p = await svcop[type](name, pass);
            t += type;
        }
        catch (e) {
            // console.trace(e);
        }

        if (!p) {
            res.writeHead(403, cfg.auth.head);
            res.end();
            return;
        }

        const 
            b = Buffer.alloc(16 + p.length)         // 8 + 8
            aes = crypto.createCipheriv("aes-256-cbc", gAesKw, gAesIv)
        ;
        b.writeDoubleLE(Date.now() + 60000);        // This token will be vaild for 60s
        b.writeBigInt64LE(0n, 8);                   // Zero-out
        b.write(t, 8);                              // Operation type
        p.copy(b, 16);                              // Ident data
        
        res.writeHead(200, cfg.auth.head);
        res.write(`wss://${cfg.game.host}:${cfg.game.port}/${Buffer.concat([
                aes.update(
                    crypto.sign("sha256", b, {
                        key: gEcdD,
                        dsaEncoding: "ieee-p1363"   // Fixed-length signature
                    })
                ),
                aes.update(b),
                aes.final()
        ]).toString("base64")}`);
        res.end();
    }
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

    const {host, port} = cfg.auth;

    // Start https server
    https.createServer({cert: r[0], key: r[1]}, webop)
    .listen({host, port}, () => {
        console.log(`[Info] Auth server boot at https://${host}:${port}.`);
    });
    
})

// Fatal Error
.catch((e) => {
    console.log("[Error] Auth server has encoutered a fatal error.");
    console.trace(e);
});

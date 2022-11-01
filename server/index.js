/*
Project: fygemu
Authors: hirakana@kf
*/

const
    cp = require("child_process"),
    crypto = require("crypto"),

    // Server config
    cfg = require("./.json"),

    // Server processes
    $ = {
        auth: cp.fork(__dirname + "/" + cfg.auth.load),
        data: cp.fork(__dirname + "/" + cfg.data.load),
        game: cp.fork(__dirname + "/" + cfg.game.load)
    },
    cpSend = m => {
        for (const k in m) { $[k].send(m); }
    }
;

// Temporarie keys
crypto.generateKeyPair("ec", {
    namedCurve: "secp256k1",
    // modulusLength: 4096,
    publicKeyEncoding: {
        type: "spki",
        format: "pem",
    },
    privateKeyEncoding: {
        type: "pkcs8",
        format: "pem"
    }
}, (_, e, d) => {
    const salt = [
        crypto.randomBytes(32).toString("base64"),
        crypto.randomBytes(16).toString("base64"),
        e,
        d
    ];
    for (const p of Object.values($)) {
        p.on("message", cpSend);
        p.send({
            "": salt
        });
    }
});








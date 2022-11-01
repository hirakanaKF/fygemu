
const 

// -----------------------------------------------------------------------------------------------------------------------------------------------------
//  * Imports * 
// -----------------------------------------------------------------------------------------------------------------------------------------------------
    fs = require("fs/promises"),
    webpack = require("webpack"),
    memfs = require("memfs"),

// -----------------------------------------------------------------------------------------------------------------------------------------------------
//  * Config * 
// -----------------------------------------------------------------------------------------------------------------------------------------------------
    cfg = {},

// -----------------------------------------------------------------------------------------------------------------------------------------------------
//  * Utilities * 
// -----------------------------------------------------------------------------------------------------------------------------------------------------

    // fs::readFile callback
    fread = k => fs.readFile(k, {encoding: "utf8"}),

    // See https://stackoverflow.com/questions/4402220/regex-to-minimize-css
    cssMinify = (d) => d
        .replace( /\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, '' )
        .replace( / {2,}/g, ' ' )
        .replace( / ([{:}]) /g, '$1' )
        .replace( /([;,]) /g, '$1' )
        .replace( / !/g, '!' ),
        
    // Volume
    vol = memfs.createFsFromVolume(new memfs.Volume())
;

console.log();

fread(process.argv[2])
.then(
    (r, e) => {
        Object.assign(cfg, JSON.parse(r));
        return Promise.all(cfg.src.map(fread));
    }
)
.then(
    (r, e) => {
        const cwd = process.cwd() + "/";
        let s;
        r.splice(0, 0, "(()=>{"); r.push("})()"); s = r.join(";\n");
        for (const p of cfg.pp ?? []) {
            const P = require(cwd + p);
            for (const k in P) {
                s = s.replace(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g"), P[k]);
            }
        }
        vol.writeFileSync("/.js", s, {encoding: "utf8", flag: "w"})
        return Promise.all([
            Promise.all(cfg.css.map(fread)),
            Promise.all(cfg.csss.map(fread)),
            Promise.all(cfg.cssm.map(fread))
        ]);
    }
)
.then((r, e) => {
    const 
        cc = webpack({
            mode: "production",
            entry: "/.js",
            output: {
                path: "/",
                filename: ".js" // .js cannot be removed.
            }
        }),
        [css, csss, cssm] = r
    ;
    cc.inputFileSystem = vol;
    cc.outputFileSystem = vol;
    cc.run((error, stats) => {
        if (error) { console.log(error) }
        if (stats && stats.jsonon) { console.log(stats.jsonon()); }
        fs.writeFile(cfg.dst, 
`<!--Project: fygemu | Authors: hirakana@kf-->
<!DOCTYPE html>
<html class="os-windows screen-desktop-wide device-desktop">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta http-equiv="Expires" content="0"/>
<meta http-equiv="cache-control" content="max-age=0"/>
<meta name="keywords" content="">
<meta name="description" content="">
</head>
<body></body>
<style id="sun">${csss.map(cssMinify).join("\n")}</style>
<style id="moon" disabled="">${cssm.map(cssMinify).join("\n")}</style>
<style>${css.map(cssMinify).join("\n")}</style>
<script>${vol.readFileSync("/.js")}</script>
</html>`
        );
    });
    // cc.close(() => {});
})
;

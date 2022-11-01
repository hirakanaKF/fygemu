/*
Project: fygemu
Authors: hirakana@kf
*/

(() => {
    
    // Firefox
    window.WebSocket ??= window.MozWebSocket;
    
    let ws;

    const 
    
    wcls = () => svcLoad({[$CoSysPage]: ["login"]}),
    werr = (m) => { console.log("[Error] Websocket error:\n", m), wcls(); },
    wmsg = (m) => svcLoad(JSON.parse(m.data)),
    wctor = (u) => {
        ws = new WebSocket(u);
        ws.onmessage = wmsg; ws.onclose = wcls; ws.onerror = werr;
    },
    wdtor = () => {
        if (ws && ws.readyState == WebSocket.OPEN) { ws.close(); }
        wcls();
    },
    
    vtNull = {
        
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * User API *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        
        // User: Login
        [$SoIdIn]: async (key, pwd) => {
            wctor(`wss://localhost:8080/i|${key}|${new SHA3().calc(pwd).digest()}`);
        },
        
        // User: Signup
        [$SoIdUp]: async (key, pwd) => {
            wctor(`wss://localhost:8080/u|${key}|${new SHA3().calc(pwd).digest()}`);
        },
        
        // User: Logout.
        [$SoIdOut]: async () => {
            wdtor();
        }

    };
    
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Initialization *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    Server.__proto__ = vtNull;


})();
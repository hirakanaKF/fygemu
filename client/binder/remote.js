/*
Project: fygemu
Authors: hirakana@kf
*/

(() => {
    
    // Firefox
    window.WebSocket ??= window.MozWebSocket;
    
    let ws, gSvcJson = {};

    const 
    
    wcls = () => {
        svcReset();
        Client[$CoSysPage]("login");
        Client[$CoSysReset]();
        Server.__proto__ = vtNull; Server._ = !!0;
    },
    werr = m => { console.log("[Error] Websocket error:\n", m), wcls(); },
    wmsg = m => svcLoad(JSON.parse(m.data)),
    wopen = e => {
        Server.__proto__ = vtWeb; Server._ = !0;
    },
    wctor = u => {
        ws = new WebSocket(u);
        ws.onopen = wopen; ws.onmessage = wmsg; ws.onclose = wcls; ws.onerror = werr;
    },
    wdtor = () => {
        if (ws && ws.readyState == WebSocket.OPEN) { ws.close(); }
        wcls();
    },
    wsend = function (a) {
        this.send(JSON.stringify(a));
    },
    pwpath = (op, key, pwd) => btoa(
        String.fromCharCode.apply(
            null, new TextEncoder().encode(
                JSON.stringify([
                    op, key, new SHA3().calc(pwd).digest()
                ])
            )
        )
    ),
    dsLdr = () => {
        Client[$CoPkInit](
            gSvcJson[$NetRankMax],
            gSvcJson[$NetTrailMin],
            gSvcJson[$NetDrugCost]
        );
        Client[$CoEquipInit](
            gSvcJson[$NetActorBst],
            gSvcJson[$NetActorPst],
            gSvcJson[$NetEquipPst],
            gSvcJson[$NetEquipLimit],
            gSvcJson[$NetFruitLimit],
            gSvcJson[$NetCraftItems],
            gSvcJson[$NetSpawnItems],
            gSvcJson[$NetAmassItems],
            gSvcJson[$NetSpawnItems],
            gSvcJson[$NetActorExp],
            gSvcJson[$NetActorElt],
            gSvcJson[$NetEquipForgeCost],
            gSvcJson[$NetEquipForgeMul],
            gSvcJson[$NetEquipForgeCap],
            gSvcJson[$NetFruitForgeCost],
            gSvcJson[$NetFruitForgeMul],
            gSvcJson[$NetFruitForgeCap],
            gSvcJson[$NetAuraCost]
        );
        Client[$CoWishInit](
            gSvcJson[$NetWishLimit],
            gSvcJson[$NetWishDaily],
            gSvcJson[$NetWishCost]
        );
        Client[$CoGiftInit](
            gSvcJson[$NetGiftCost]
        );
        Client[$CoShopInit](
            gSvcJson[$NetShopItem],
            gSvcJson[$NetShopBack],
            gSvcJson[$NetItemMax]
        );
    }
    
    vtNull = {
        
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * User API *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        
        // User: Login
        [$SoIdIn]: async (key, pwd) => 
            fetch(`${USR.Host}${pwpath($SoIdIn, key, pwd)}`)
            .then(r => {
                if (r.status == 200) { return r.text().then(r => wctor(r)); }

                console.log("[Error] Something goes wrong on signin.");
            })
        ,
        
        // User: Signup
        [$SoIdUp]: async (key, pwd) => 
            fetch(`${USR.Host}${pwpath($SoIdUp, key, pwd)}`)
            .then(r => {
                if (r.status == 200) { return r.text().then(r => wctor(r)); }

                console.log("[Error] Something goes wrong on signin.");
            })
        ,
        
        // User: Logout.
        [$SoIdOut]: async () => {
            wdtor(ws);
        },

        [$SoDataLdr]: async n => {
            if (gSvcJson[$NetDataDate] >= n) { return dsLdr(); }
            
            fetch(USR.Data)
            .then(r => {
                if (r.status == 200) {
                    return r.json()
                        .then(r => { gSvcJson = r; dsLdr(); })
                    ;
                }

                console.log("[Error] Could not recieve data from data server.");
                console.log(r);
            })
        }
    },

    vtWeb = {

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Base Class *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        ...vtNull,
        
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Monitor API *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        
        // Debug: Load local server state from json object.
        [$SoRpLoad]: async d => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoRpLoad]: [d]},
                {[$SoRpLoad]: _}
            );
            return _;
        },

        // Debug: Dump local server state to json object.
        [$SoRpSave]: async () => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoRpSave]: []},
                {[$SoRpSave]: _}
            );
            return _;
        },

        // Debug: Load external emu.json
        // [$SoGmCfgEmu]: async d => Kernel.constructor(d),

        // Debug: Load external sys.json
        // [$SoGmCfgSvc]: async d => Object.assign(SYS, d),

        // Debug: Load external usr.json
        [$SoGmCfgUsr]: async d => Object.assign(USR, d),

        // Debug: Load external res.json
        [$SoGmCfgRes]: async d => {
            RES_CH.splice(0, RES_CH.length, ...(d.Actor ?? []));
            RES_EQ.splice(0, RES_EQ.length, ...(d.Equip ?? []));
            RES_IT.splice(0, RES_IT.length, ...(d.Item ?? []));

            // Attempt to reload all images in document
            for (const el of document.getElementsByTagName("img")) {
                if (el.onreset) { el.onreset(); }
            }
            for (const el of document.getElementsByClassName("btn fyg_colpzbg fyg_ec")) {
                if (el.onreset) { el.onreset(); }
            }
        },
        
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * GM API (Internally used while rendering the GM panels.) *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------

        // Debug: Get arena settings.
        [$SoGmArena]: async () => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoGmArena]: []},
                {[$SoGmArena]: _}
            );
            return _;
        },

        // Debug: Evaluate unit stats.
        [$SoGmUnit]: async (i, d) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoGmUnit]: [i, d]},
                {[$SoGmUnit]: _}
            );
            return _;
        },

        // Debug: Evaluate card stats.
        [$SoGmActor]: async (i, d) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoGmActor]: [i, d]},
                {[$SoGmActor]: _}
            );
            return _;
        },

        // Debug: Evaluate equip stats.
        [$SoGmEquip]: async (i, d) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoGmEquip]: [i, d]},
                {[$SoGmEquip]: _}
            );
            return _;
        },

        // Debug: Setup battle.
        [$SoGmBattle]: async (A, L, R) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoGmBattle]: [A, L, R]},
                {[$SoGmBattle]: _}
            );
            return _;
        },
        
        // Debug: Setup dice war.
        [$SoGmRoll]: async (N, L, R) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoGmRoll]: [N, L, R]},
                {[$SoGmRoll]: _}
            );
            return _;
        },
        
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * GM *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------

        // Debug: Set vip
        [$SoGmVipSet]: async (s, b) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoGmVipSet]: [s, b]},
                {[$SoGmVipSet]: _}
            );
            return _;
        },

        // Debug: Set self rank
        [$SoGmRankSet]: async d => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoGmRankSet]: [d]},
                {[$SoGmRankSet]: _}
            );
            return _;
        },

        // Debug: Set self progress
        [$SoGmProgSet]: async d => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoGmProgSet]: [d]},
                {[$SoGmProgSet]: _}
            );
            return _;
        },

        // Debug: Set self fuel
        [$SoGmFuelSet]: async d => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoGmFuelSet]: [d]},
                {[$SoGmFuelSet]: _}
            );
            return _;
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * User *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------

        // User: Logout.
        // Does not exist in the original fyg.
        [$SoIdOut]: async () => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoIdOut]: []},
                {[$SoIdOut]: _}
            );
            wdtor();
            return _;
        },

        // User: Set display name
        // Implements the function of the button on Client.index.
        [$SoIdName]: async (name) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoIdName]: [name]},
                {[$SoIdName]: _}
            );
            return _;
        },

        // User: Set password
        [$SoIdPass]: async (pass) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoIdPass]: [pwdHash(pass)]},
                {[$SoIdPass]: _}
            );
            return _;
        },

        // User: Daily bonus
        [$SoIdDaily]: async () => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoIdDaily]: []},
                {[$SoIdDaily]: _}
            );
            return _;
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * PK *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        
        // This function implements jgjg(1) in the original game.
        //
        [$SoPkPvP]: async (r = 5) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoPkPvP]: [r]},
                {[$SoPkPvP]: _}
            );
            return _;
        },
        
        // This function implements jgjg(2) in the original game.
        [$SoPkPvE]: async (r = 5) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoPkPvE]: [r]},
                {[$SoPkPvE]: _}
            );
            return _;
        },

        // 
        [$SoPkPvB]: async (r = 5) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoPkPvB]: [r]},
                {[$SoPkPvB]: _}
            );
            return _;
        },

        // This function implements gox() in the original game.
        // Search for resource when progress is less than the requirement is allowed; in this case, rank will be decreased.
        [$SoPkGain]: async (r = 10) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoPkGain]: [r]},
                {[$SoPkGain]: _}
            );
            return _;
        },

        // Refuel
        [$SoPkDrug]: async () => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoPkDrug]: []},
                {[$SoPkDrug]: _}
            );
            return _;
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Actor *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        
        // Set fight
        [$SoAcFgt]: async (a) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoAcFgt]: [a]},
                {[$SoAcFgt]: _}
            );
            return _;
        },

        // Level up card with shell
        [$SoAcExp]: async (k, n) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoAcExp]: [k, n]},
                {[$SoAcExp]: _}
            );
            return _;
        },
        
        // Aura up card with item
        [$SoAcElt]: async (k, n) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoAcElt]: [k, n]},
                {[$SoAcElt]: _}
            );
            return _;
        },

        // Set stats point
        [$SoAcSet]: async d => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoAcSet]: [d]},
                {[$SoAcSet]: _}
            );
            return _;
        },
        
        // Break actor card
        [$SoAcBrk]: async (a) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoAcBrk]: [a]},
                {[$SoAcBrk]: _}
            );
            return _;
        },

        // Card spawn
        [$SoAcSpw]: async (a, l) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoAcSpw]: [a, l]},
                {[$SoAcSpw]: _}
            );
            return _;
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Equip *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        
        // Equip: Break
        [$SoEcBrk]: async d => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoEcBrk]: [d]},
                {[$SoEcBrk]: _}
            );
            return _;
        },

        // Equip: Forge
        [$SoEcFrg]: async (a, m) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoEcFrg]: [a, m]},
                {[$SoEcFrg]: _}
            );
            return _;
        },

        // Equip: Smelt
        [$SoEcSml]: async d => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoEcSml]: [d]},
                {[$SoEcSml]: _}
            );
            return _;
        },

        // Equip: Craft
        [$SoEcCrf]: async (a, l) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoEcCrf]: [a, l]},
                {[$SoEcCrf]: _}
            );
            return _;
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Fruit *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------

        // Fruit: Break
        [$SoFcBrk]: async (a) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoFcBrk]: [a]},
                {[$SoFcBrk]: _}
            );
            return _;
        },

        // Fruit: Forge
        [$SoFcFrg]: async (a, m) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoFcFrg]: [a, m]},
                {[$SoFcFrg]: _}
            );
            return _;
        },
        
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Gem *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        
        // Gem: Mine
        [$SoGcMine]: async (d, k, n) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoGcMine]: [d, k, n]},
                {[$SoGcMine]: _}
            );
            return _;
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Wish *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------

        // Wish
        [$SoWpDrop]: async (d, n) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoWpDrop]: [d, n]},
                {[$SoWpDrop]: _}
            );
            return _;
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Gift *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------

        // Gift: Draw
        [$SoGpFlip]: async (i) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoGpFlip]: [i]},
                {[$SoGpFlip]: _}
            );
            return _;
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Shop *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------

        [$SoScBack]: async (i, n) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoScBack]: [i, n]},
                {[$SoScBack]: _}
            );
            return _;
        },

        [$SoScItem]: async (i, n) => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoScItem]: [i, n]},
                {[$SoScItem]: _}
            );
            return _;
        },
        
        [$SoScCoin]: async () => {
            const _ = svcPromise();
            svcCall(
                wsend.bind(ws),
                {[$SoScCoin]: []},
                {[$SoScCoin]: _}
            );
            return _;
        }
    }

    ;
    
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Initialization *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    for (const k in vtWeb) { vtNull[k] ||= nullAsync; }
    Server[$SvcRemote] = vtNull;
    Server._ = !!0;
    Server.$ = 0;

})();
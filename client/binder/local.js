/*
Project: fygemu
Authors: hirakana@kf
*/

//
// * About This Script *
// 
// Server call layer, used to communicates with the server.
//
// In this version of game runs without an actual server, which means everything would be done on your browser.
// Therefore we implement the server functions here.
//
// Also note that client side should not have access to Engine/*.js, as they should be handled on the server side.
// Make sure not to use them outside of this script in case you are trying to customizing client side scripts.
//
// By default, you will have to save your "server" state manually via GM-Client API or so.
// Otherwise everything just go away forever after the page closed.
// It should be fairly easy to modify this script to hold everything in the local storage.
//
// Finally, this project may not become usable in near future.
// Our implementation could be sligtly different compared to the original game.
//


(() => {

    // Virtual database
    const Report = (function () {

        const 
            $ = {}, _ = {}, 
            pIdent = {}, pUser = {}, pActor = {}, pEquip = {}, pFruit = {},
            pGems = {}, pWish = {}, pGift = {}, pDice = {}, pFight = {}, pRecord = {}
        ;
        
        $.pIdent = pIdent;
        $.pUser = pUser;
        $.pActor = pActor;
        $.pEquip = pEquip;
        $.pFruit = pFruit;
        $.pGems = pGems;
        $.pWish = pWish;
        $.pGift = pGift;
        $.pDice = pDice;
        $.pFight = pFight;
        $.pRecord = pRecord;
        $.__proto__ = _;

        // The name index for pIdent
        Object.defineProperty(
            pIdent, "$", {value: {N: {}}, writable: false, enumerable: false}
        );

        // The rank index for pFight
        Object.defineProperty(
            pFight, "$", {value: {rank: {}}, writable: false, enumerable: false}
        );

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Types *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        const idMap = x => x, strMap = x => ""+x;

        // Serializer : JSON
        _.DB = _.JS = {
            _id: strMap,
            obj: x => x.json ? x.json() : x,
            u32: idMap,
            u64: strMap,
            f32: idMap,
            f64: idMap,
            u32a: idMap,
            u64a: x => x.map(strMap),
            f64a: idMap,
            f64d: Object.entries,
            f64e: idMap,
            str: idMap,
            stra: idMap,
            date: x => x.getTime()
        },

        // Deserializer : Javascript Object
        _.JO = {
            _id: idMap,
            obj: idMap,
            u32: idMap,
            u64: x => BigInt(x),
            f32: idMap,
            f64: idMap,
            u32a: idMap,
            u64a: x => x.map(BigInt),
            f64a: idMap,
            f64d: Object.fromEntries,
            f64e: idMap,
            str: idMap,
            stra: idMap,
            date: x => new Date(x)
        };

        _.lock = async (i) => {
            // Functions are atomic in javascript.
            // if (_.pLock) { throw "[Warning] Failed when acquiring database lock."; };
            // _.pLock = !0;
            return i;
        };

        _.unlock = async (i) => {
            // Functions are atomic in javascript.
            // pLock = !1;
            return ;
        };
        
        _.idGet = async (N, P) => {
            // Query with N
            const S = pIdent.$.N[N];
            if (!S) { return ; }

            // Primary index and check password
            const u = pIdent[S.keys().next().value];
            if (!u || u.P != P) { return ; }
            return u;
        };
        
        _.idSet = async (i, N) => {
            const u = pIdent[i];
            if (!u) { return; }

            // Check collision
            const D = (I[N] ??= new Set());
            if (D.size) { return ; }
            D.add(i);

            // Update row
            u.N = N;

            // Update index
            const I = pIdent.$.N, S = I[N];
            if (S) { S.delete(i); }

            return u;
        };

        _.idNew = async (i0, i1, N, P, G) => {
            // Check if username already exists
            const I = pIdent.$.N, S = I[N];
            if (S && S.size) {
                // throw "[Warning] User already exists.";
                return ;
            }

            const 
                i = btoa(
                    String.fromCharCode(...[
                        Number(i0 >> 56n & 0xffn),
                        Number(i0 >> 48n & 0xffn),
                        Number(i0 >> 40n & 0xffn),
                        Number(i0 >> 32n & 0xffn),
                        Number(i0 >> 24n & 0xffn),
                        Number(i0 >> 16n & 0xffn),
                        Number(i0 >>  8n & 0xffn),
                        Number(i0        & 0xffn),
                        Number(i1 >> 56n & 0xffn),
                        Number(i1 >> 48n & 0xffn),
                        Number(i1 >> 40n & 0xffn),
                        Number(i1 >> 32n & 0xffn),
                        Number(i1 >> 24n & 0xffn),
                        Number(i1 >> 16n & 0xffn),
                        Number(i1 >>  8n & 0xffn),
                        Number(i1        & 0xffn)
                    ])
                ),
                u = {_id: i, N: N, P: P, G: G}
            ;

            _.db1Set(pIdent, i, u);
            _.db1Set(pUser, i, new Engine.User().bson());
            _.db1Set(pGems, i, new Engine.Gems().bson());
            _.db1Set(pWish, i, new Engine.Wish().bson());
            _.db1Set(pGift, i, {});
            _.db1Set(pDice, i, new Engine.Dice().bson());
            _.db1Set(pFight, i, new Engine.Fight().bson());
            _.db1Set(pRecord, i, new Engine.Record().bson());
            return u;
        };

        _.db1Get = async (p, i) => {
            return p[i] ?? {};
        };

        _.db1Set = async (p, i, d) => {
            const W = p.$, r = (p[i] ??= {});
            for (const k in W) {
                const w = W[k];
                if (k in d) {
                    (w[r[k]] ??= new Set()).delete(i);
                    (w[d[k]] ??= new Set()).add(i);
                }
            }
            return Object.assign(r, d);
        };

        _.db1Inc = async (p, i, d, m) => {
            const W = p.$, r = (p[i] ??= {});
            for (const k in W) {
                const w = W[k];
                if (k in d) {(w[r[k]] ??= new Set()).delete(i);}
            }
            for (const k in d) { r[k] += d[k] * m; }
            for (const k in W) {
                const w = W[k];
                if (k in d) {(w[r[k]] ??= new Set()).add(i);}
            }
            return r;
        };

        _.db1Rng = async (p, k, v, n) => {
            const r = [], w = p.$[k][v];
            
            // We still have no O(log(n)) random access to Set in ES6+, thus we access the pool sequentially in client version.
            while (n--) {
                const i = w.keys().next().value, u = p[i];
                r.push(u); w.delete(i); w.add(i);
            }
            return r;
        };

        _.db2Get = async (p, i, a) => {
            const r = p[i];
            if (!r) { return {}; }
            const A = [];
            for (const k of a) {
                const v = r[k << 0];
                if (v) { A.push([k, r[k]]); }
            }
            if (!A.length) { return {}; }
            return Object.fromEntries(A);
        };

        _.db2Set = async (p, i, d) => {
            const r = p[i] ??= {};
            for (const k in d) { r[k << 0] = d[k]; }
            return !0;
        };

        _.db2Del = async (p, i, a) => {
            const r = p[i];
            if (r) { a.forEach(j => delete r[j << 0]); }
            return !0;
        };

        _.ftFuel = async (i, r) => {
            const T = pFight[i];
            if (!T || T.fuel <= 0) { return; }
            T.fuel -= r;
            return T;
        };

        _.ftDrug = async (i, r) => {
            const T = pFight[i];
            if (!T || T.drug <= 0) { return; }
            T.fuel = Math.max(T.fuel, 0) + T.drug;
            T.drug = Math.max(T.drug - r, 0);
            return T;
        };

        _.ftRank = async (i, r, p) => {
            const T = pFight[i];
            if (!T) { return; }
            T.rank = ""+r;
            T.prog = p;
            return T;
        };
        
        _.ftProg = async (i, r) => {
            const T = pFight[i];
            if (!T) { return; }
            T.prog = Math.max(T.prog + r, 0);
            return T;
        };

        _.ftCost = async (i, r, c, m) => {
            const T = pFight[i];
            if (!T || T.fuel <= 0) { return; }

            T.fuel -= r;
            if (T.prog > 0) {
                T.prog = Math.max(T.prog - c, 0);
            }
            else {
                if (T.rank < 1n) { return T; }
                T.prog = m;
                T.rank--;
            }
            return T;
        };

        _.utCost = async (i, d, m) => {
            const T = pUser[i];
            if (!T) { return; }
            for (const k in d) { if (T[k] < d[k] * m) { return; } }
            for (const k in d) { T[k] -= d[k] * m; }
            return T;
        };

        _.utCost2 = async (i, k, d, m, l) => {
            const T = pUser[i];
            if (!T) { return; }
            const t = T[k], s = m + t;
            if (l > 0 && s > l) { return; }
            const n = s * s * s - t * t * t;
            for (const k in d) { if (T[k] < d[k] * n) { return; } }
            for (const k in d) { T[k] -= d[k] * n; }
            T[k] += m;
            return T;
        };

        _.utGain = async (i, d, m, day) => {
            const T = pUser[i];
            if (!T) { return; }
            const 
                t = new Date().getTime(),
                pa = (k, n) => { T[k] += n; }, 
                pt = (k, n) => {
                    const l = n * day, w = T[k];
                    T[k] = (w > t ? w : t) + l;
                }
                j = {svip: pt, bvip: pt}
            ;
            for (const k in d) { (j[k] ?? pa)(k, d[k] * m); }
            return T;
        };

        _.utShop = async (i) => {
            const T = pUser[i];
            if (!T || T.shop <= 0) { return; }
            T.coin3 += T.shop; T.shop = 0;
            return T;
        };

        _.acExp = async (i, j, r, m) => {
            const A = pActor[i];
            if (!A) { return {}; }

            const c = A[j];
            if (!c) { return {}; }

            const n = c.exp + r;
            c.exp = n; c.L = Math.min(Math.sqrt(n), m);
            return {[j]: c};
        };

        _.acElt = async (i, j, r) => {
            const A = pActor[i];
            if (!A) { return {}; }

            const c = A[j];
            if (!c) { return {}; }

            c.F = Math.max(c.F, r);
            return {[j]: c};
        };

        _.acGrow = async (i, a, r) => {
            const A = pActor[i];
            if (!A) { return; }
            for (const k of a) { A[k].G += r; }
            return;
        };

        _.gpFlip = async (i, k) => {
            const A = pGift[i];
            if (!A) { return; }
            const T = A[k];
            if (!T || T.n) { return; }
            T.n = 1;
            return T;
        };

        // Rebuild index
        _.idx = async () => {
            for (const k in $) {
                const p = $[k], W = p.$;
                for (const k in W) {
                    const w = W[k] = {};
                    for (const i in p) {
                        (w[p[i][k]] ??= new Set()).add(i);
                    }
                }
            }
        }

        _.from = async (d) => {
            Object.assign($, d);
            return _.idx();
        };

        _.json = async () => {
            return $;
        };

        _.bson = async () => {
            return $;
        };
        
        return $;

    })()

    // Virtual socket client
    class Socks {
        close () {}
        send (T) { svcLoad(T); }
        dec (x) { return x; }
        enc (x) { return x; }
    };

    Engine.constructor(EMU, FMT, Report);
    System.constructor(SYS, Engine, Report, Socks);
    
    const
        gSocks = new Socks(),

        // Password hashing
        pwdHash = p => new SHA3().calc(p).digest()
    ;

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Initialization *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    {
        const i = USR.ID;
        Report.pIdent[i] = {_id: i, N: USR.Name, P: pwdHash(USR.PW), G: "root"};
        Report.pUser[i] = new Engine.User().from({
            coin1: Number.MAX_SAFE_INTEGER, coin2: Number.MAX_SAFE_INTEGER, coin3: Number.MAX_SAFE_INTEGER, 
            exp: 2000 * 2000,
            actor: 300, equip: 300, fruit: 300,
            craft: 10000, spawn: 10000, amass: 10000,
            "3309": 10000, "3310": 10000
        }).bson();
        Report.pGems[i] = new Engine.Gems().bson();
        Report.pWish[i] = new Engine.Wish().bson();
        Report.pGift[i] = {};
        Report.pDice[i] = new Engine.Dice().bson();
        Report.pFight[i] = new Engine.Fight().bson();
        Report.pRecord[i] = new Engine.Record().bson();
        Report.idx();
    }
    console.log(Report);
    
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Server Calls *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------

    const
    
    vtNull = {

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Monitor API *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        
        // Debug: Load local server state from json object.
        [$SoRpLoad]: async (d, T) => {
            svcLock($SoRpLoad, T);
            gSocks.op({[$SoRpLoad]: [d]});
        },

        // Debug: Dump local server state to json object.
        [$SoRpSave]: async T => {
            svcLock($SoRpSave, T);
            gSocks.op({[$SoRpSave]: []});
        },

        // Debug: Load external emu.json
        [$SoGmCfgEmu]: async d => Engine.constructor(d),

        // Debug: Load external svc.json
        [$SoGmCfgSvc]: async d => Object.assign(SYS, d),

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
            for (const el of document.getElementsByClassName("btn fyg_colpzbg fyg_mp3")) {
                if (el.onreset) { el.onreset(); }
            }
        },
        
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * GM API (Internally used while rendering the GM panels.) *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------

        // Debug: Get arena settings.
        [$SoGmArena]: async T => {
            svcLock($SoGmArena, T);
            gSocks.op({[$SoGmArena]: []});
        },

        // Debug: Evaluate unit stats.
        [$SoGmUnit]: async (i, d, T) => {
            svcLock($SoGmUnit, T);
            gSocks.op({[$SoGmUnit]: [i, d]});
        },

        // Debug: Evaluate card stats.
        [$SoGmActor]: async (i, d, T) => {
            svcLock($SoGmActor, T);
            gSocks.op({[$SoGmActor]: [i, d]});
        },

        // Debug: Evaluate equip stats.
        [$SoGmEquip]: async (i, d, T) => {
            svcLock($SoGmEquip, T);
            gSocks.op({[$SoGmEquip]: [i, d]});
        },

        // Debug: Setup battle.
        [$SoGmBattle]: async (A, L, R, T) => {
            svcLock($SoGmBattle, T);
            gSocks.op({[$SoGmBattle]: [A, L, R]});
        },
        
        // Debug: Setup dice war.
        [$SoGmRoll]: async (N, L, R, T) => {
            svcLock($SoGmRoll, T);
            gSocks.op({[$SoGmRoll]: [N, L, R]});
        },

        // Debug: Console debug.
        /*
        gmBattleTest: async () => {

            const 
                unitA = new Engine.Unit(), unitB = new Engine.Unit(),
                cardA = unitA.Card, cardB = unitB.Card
            ;

            unitA.mGrowth = 1000000;
            cardA.mStr = cardA.mAgi = cardA.mInt = cardA.mVit = cardA.mSpr = cardA.mMnd = 99999;
            
            cardB.mSpr = cardB.mVit = 999999;

            unitA.set();
            unitB.set();

            unitA.nPowRatP = unitA.nPowRatM = unitA.nSpdRat = unitA.nRecRat = unitA.nHpRat = unitA.nSdRat = unitA.nAtkRatP = unitA.nAtkRatM = 
            unitA.nLchRat = unitA.nRflRat = unitA.nCrtRat = unitA.nSklRat = unitA.nDodRat = unitA.nEvaRat = unitA.nDefRatP = unitA.nDefRatM = Infinity;

            Object.keys(Engine.EmuArt1Kind).forEach((k) => unitA.nArt1.add(+k));
            Object.keys(Engine.EmuArt2Kind).forEach((k) => unitA.nArt2.add(+k));
            Object.keys(Engine.EmuArt3Kind).forEach((k) => unitA.nArt3.add(+k));
            Object.keys(Engine.EmuEquipKind).forEach((k) => unitA.nMyst.add(+k));
            Object.keys(Engine.EmuAuraKind).forEach((k) => unitA.nAura.add(+k));
            Object.keys(Engine.EmuStatusKind).forEach((k) => unitA["b"+k] = !0);

            // Edge case testing
            unitA.cHpRecRat = unitA.cSdRecRat = unitA.cPowRatP = unitA.cPowRatM = unitA.cSpdRat =
            unitA.cAtkRatP = unitA.cAtkRatM = unitA.cAtkRatC = unitA.cAtkFixP = unitA.cAtkFixM = unitA.cAtkFixC = 
            unitA.cDefRatP = unitA.cDefRatM = unitA.cDefFixP = unitA.cDefFixM =
            unitA.cSklRat = unitA.cCrtRat = unitA.cEvaRat = unitA.cDodRat = unitA.cLchRat = unitA.cRflRat = Infinity;
            unitA.cUndead = 1; unitA.cDodge = 2; unitA.cMirror = 7;

            // Object.keys(Engine.EmuArt1Kind).forEach((k) => unitB.nArt1.add(+k));
            // Object.keys(Engine.EmuArt2Kind).forEach((k) => unitB.nArt2.add(+k));
            // Object.keys(Engine.EmuArt3Kind).forEach((k) => unitB.nArt3.add(+k));
            Object.keys(Engine.EmuEquipKind).forEach((k) => unitB.nMyst.add(+k));
            // Object.keys(Engine.EmuAuraKind).forEach((k) => unitB.nAura.add(+k));
            unitB.nArt2.add(3002);
            unitB.nArt2.add(3008);
            unitB.nAura.add(901);

            Client[$CoGmBattle](
                Engine.setBattle(new Engine.Arena(), [
                    Engine.Team([unitA, unitA], 0),
                    Engine.Team([unitB, unitB], 0)
                ])
            );
        },
        */

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * User API *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------

        // User: Login.
        // Does not exist in the original fyg.
        [$SoIdIn]: async (name, pwd) => {
            await gSocks.ct("i", name, pwdHash(pwd));
            Server.__proto__ = vtWeb;
        },

        // User: Signup.
        // Does not exist in the original fyg.
        [$SoIdUp]: async (name, pwd) => {
            await gSocks.ct("u", name, pwdHash(pwd));
            Server.__proto__ = vtWeb;
        },
        
        // User: Logout.
        // Does not exist in the original fyg.
        [$SoIdOut]: async () => {
            gSocks.dt();
            Server.__proto__ = vtNull;
        }

    },

    vtWeb = {

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Base Class *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        ...vtNull,
        
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * GM *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------

        // Debug: Set vip
        [$SoGmVipSet]: async (s, b, T) => {
            svcLock($SoGmVipSet, T);
            gSocks.op({[$SoGmVipSet]: [s, b]});
        },

        // Debug: Set self rank
        [$SoGmRankSet]: async (d, T) => {
            svcLock($SoGmRankSet, T);
            gSocks.op({[$SoGmRankSet]: [d]});
        },

        // Debug: Set self progress
        [$SoGmProgSet]: async (d, T) => {
            svcLock($SoGmRankSet, T);
            gSocks.op({[$SoGmProgSet]: [d]}, T);
        },

        // Debug: Set self fuel
        [$SoGmFuelSet]: async (d, T) => {
            svcLock($SoGmFuelSet, T);
            gSocks.op({[$SoGmFuelSet]: [d]}, T);
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * User *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------

        // User: Logout.
        // Does not exist in the original fyg.
        [$SoIdOut]: async T => {
            delete gSocks.vt;
            
            // Back to the default account
            svcLock($SoIdOut, T);
            gSocks.op({[$SoIdOut]: []});
            Server.__proto__ = vtNull;
        },

        // User: Set display name
        // Implements the function of the button on Client.index.
        [$SoIdName]: async (name, T) => {
            svcLock($SoIdName, T);
            gSocks.op({[$SoIdName]: [name]});
        },

        // User: Set password
        [$SoIdPass]: async (pass, T) => {
            svcLock($SoIdPass, T);
            gSocks.op({[$SoIdPass]: [pwdHash(pass)]});
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * PK *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        
        // This function implements jgjg(1) in the original game.
        //
        [$SoPkPvP]: async (r = 5, T = null) => {
            svcLock($SoPkPvP, T);
            gSocks.op({[$SoPkPvP]: [r]});
        },
        
        // This function implements jgjg(2) in the original game.
        [$SoPkPvE]: async (r = 5, T = null) => {
            svcLock($SoPkPvE, T);
            gSocks.op({[$SoPkPvE]: [r]});
        },

        // 
        [$SoPkPvB]: async (r = 5, T = null) => {
            svcLock($SoPkPvB, T);
            gSocks.op({[$SoPkPvB]: [r]});
        },

        // This function implements gox() in the original game.
        // Search for resource when progress is less than the requirement is allowed; in this case, rank will be decreased.
        [$SoPkGain]: async (r = 10, T = null) => {
            svcLock($SoPkGain, T);
            gSocks.op({[$SoPkGain]: [r]});
        },

        // Refuel
        [$SoPkDrug]: async T => {
            svcLock($SoPkDrug, T);
            gSocks.op({[$SoPkDrug]: []});
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Actor *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        
        // Set fight
        [$SoAcFgt]: async (a, T) => {
            svcLock($SoAcFgt, T);
            gSocks.op({[$SoAcFgt]: [a]});
        },

        // Level up card with shell
        [$SoAcExp]: async (k, n, T) => {
            svcLock($SoAcExp, T);
            gSocks.op({[$SoAcExp]: [k, n]});
        },
        
        // Aura up card with item
        [$SoAcElt]: async (k, n, T) => {
            svcLock($SoAcElt, T);
            gSocks.op({[$SoAcElt]: [k, n]});
        },

        // Set stats point
        [$SoAcSet]: async (d, T) => {
            svcLock($SoAcSet, T);
            gSocks.op({[$SoAcSet]: [d]});
        },
        
        // Break actor card
        [$SoAcBrk]: async (a, T) => {
            svcLock($SoAcBrk, T);
            gSocks.op({[$SoAcBrk]: [a]});
        },

        // Card spawn
        [$SoAcSpw]: async (a, l, T) => {
            svcLock($SoAcSpw, T);
            gSocks.op({[$SoAcSpw]: [a, l]});
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Equip *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        
        // Equip: Break
        [$SoEcBrk]: async (d, T) => {
            svcLock($SoEcBrk, T);
            gSocks.op({[$SoEcBrk]: [d]});
        },

        // Equip: Smelt
        [$SoEcSml]: async (d, T) => {
            svcLock($SoEcSml, T);
            gSocks.op({[$SoEcSml]: [d]});
        },

        // Equip: Craft
        [$SoEcCrf]: async (a, l, T) => {
            svcLock($SoEcCrf, T);
            gSocks.op({[$SoEcCrf]: [a, l]});
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Fruit *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------

        // Fruit: Break
        [$SoFcBrk]: async (a, T) => {
            svcLock($SoFcBrk, T);
            gSocks.op({[$SoFcBrk]: [a]});
        },

        // Fruit: Forge
        [$SoFcFrg]: async (a, m, T) => {
            svcLock($SoFcFrg, T);
            gSocks.op({[$SoFcFrg]: [a, m]});
        },
        
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Gem *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        
        // Gem: Mine
        [$SoGcMine]: async (d, k, n, T) => {
            svcLock($SoGcMine, T);
            gSocks.op({[$SoGcMine]: [d, k, n]});
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Wish *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------

        // Wish
        [$SoWpDrop]: async (d, n, T) => {
            svcLock($SoWpDrop, T);
            gSocks.op({[$SoWpDrop]: [d, n]});
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Gift *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------

        // Gift: Draw
        [$SoGpFlip]: async (i, T) => {
            svcLock($SoGpFlip, T);
            gSocks.op({[$SoGpFlip]: [i]});
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Shop *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------

        [$SoScBack]: async (i, n, T) => {
            svcLock($SoScBack, T);
            gSocks.op({[$SoScBack]: [i, n]});
        },

        [$SoScItem]: async (i, n, T) => {
            svcLock($SoScItem, T);
            gSocks.op({[$SoScItem]: [i, n]});
        },
        
        [$SoScCoin]: async T => {
            svcLock($SoScCoin, T);
            gSocks.op({[$SoScCoin]: []});
        }
        
    }

    ;

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Initialization *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    for (const k in vtWeb) { vtNull[k] ||= nullAsync; }
    Server.__proto__ = vtNull;

})();

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
// Also note that client side should not have access to Kernel/*.js, as they should be handled on the server side.
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

        _._idEqu = (i0, i1) => i0 == i1;
        
        _._idKey = i => i;

        _.idGet = async (N, P) => {
            // Query with N
            const S = pIdent.$.N[N];
            if (!S) { return ; }

            // Primary index and check password
            const u = pIdent[S.keys().next().value];
            if (!u || u.P != P) { return ; }

            return u;
        };

        _.idNew = async (A, N, P, G) => {

            // Check if username already exists
            const I = pIdent.$.N, S = I[N];
            if (S && S.size) { return ; }

            const 
                i = btoa(String.fromCharCode(...A)),
                u = {_id: i, N: N, P: P, G: G}
                db1Set = _.db1Set
            ;

            db1Set(pIdent, i, u);
            return u;
        };
        
        _.usrGet = async u => {
            const i = u._id;
            return [
                u,
                pUser[i],
                pActor[i],
                pEquip[i],
                pFruit[i],
                pGems[i],
                pWish[i],
                pGift[i],
                pDice[i],
                pFight[i],
                pRecord[i]
            ];
        };

        _.usrNew = async (u, user, gems, wish, dice, fight, record) => {
            const db1Set = _.db1Set, i = u._id;
            return Promise.all([
                u,
                db1Set(pUser, i, user),
                pActor[i] ??= {},
                pEquip[i] ??= {},
                pFruit[i] ??= {},
                db1Set(pGems, i, gems),
                db1Set(pWish, i, wish),
                pGift[i] ??= {},
                db1Set(pDice, i, dice),
                db1Set(pFight, i, fight),
                db1Set(pRecord, i, record)
            ]);
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
        _.db1IncEx = async (p, i, d, m, l) => {
            const W = p.$, r = (p[i] ??= {});
            for (const k in W) {
                const w = W[k];
                if (k in d) {(w[r[k]] ??= new Set()).delete(i);}
            }
            for (const k in d) { r[k] = Math.min(r[k] + d[k] * m, l[k] ?? 0); }
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
                r.push(Object.assign({}, {_id: i}, u)); w.delete(i); w.add(i);
            }
            return r;
        };

        _.db2Get = async (p, i, a) => {
            const r = p[i];
            if (!r) { return; }
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
            if (!r) { return !!0; }
            a.forEach(j => delete r[j << 0]);
            return !0;
        };

        _.db2Pop = async (p, i, a) => {
            const r = p[i];
            if (!r) { return; }

            const A = [];
            for (const k of a) {
                const v = r[k << 0];
                if (v) { 
                    A.push([k, r[k]]);
                    delete r[k];
                }
            }
            return Object.fromEntries(A);
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
            const n = s * s - t * t;
            for (const k in d) { if (T[k] < d[k] * n) { return; } }
            for (const k in d) { T[k] -= d[k] * n; }
            T[k] += m;
            return T;
        };

        _.utCost3 = async (i, k, d, m, l) => {
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
            return c;
        };

        _.acElt = async (i, j, r) => {
            const A = pActor[i];
            if (!A) { return {}; }

            const c = A[j];
            if (!c) { return {}; }

            c.F = Math.max(c.F, r);
            return c;
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

        _.from = async d => {
            for (const k in $) { Object.assign($[k], d[k] ?? {}); }
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
    class EmuSocket {
        close () {}
        send (T) { svcLoad(T); }
        dec (x) { return x; }
        enc (x) { return x; }
    };

    Engine.constructor();
    Format.constructor(FMT, Engine, Report);
    Kernel.constructor(EMU, Engine, Format);
    System.constructor(SYS, Engine, Kernel, Report, EmuSocket);
    Driver.constructor(NET, globalThis);
    
    const

        // Emulated socket
        gSocks = new EmuSocket(),

        // Password hashing
        pwdHash = p => new SHA3().calc(p).digest()
    ;

    let gSvcJson = {};

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Initialization *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    {
        const i = USR.ID;
        Report.pIdent[i] = {_id: i, N: USR.Name, P: pwdHash(USR.PW), G: "root"};
        Report.pUser[i] = new Kernel.User().from({
            coin1: Number.MAX_SAFE_INTEGER, coin2: Number.MAX_SAFE_INTEGER, coin3: Number.MAX_SAFE_INTEGER, 
            exp: 2000 * 2000,
            actor: 300, equip: 300, fruit: 300,
            craft: 10000, spawn: 10000, amass: 10000,
            "3309": 10000, "3310": 10000
        }).bson();
        Report.pGems[i] = new Kernel.Gems().bson();
        Report.pWish[i] = new Kernel.Wish().bson();
        Report.pGift[i] = {};
        Report.pDice[i] = new Kernel.Dice().bson();
        Report.pFight[i] = new Kernel.Fight().bson();
        Report.pRecord[i] = new Kernel.Record().bson();
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
        [$SoRpLoad]: async d => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
                {[$SoRpLoad]: [d]},
                {[$SoRpLoad]: _}
            );
            return _;
        },

        // Debug: Dump local server state to json object.
        [$SoRpSave]: async () => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
                {[$SoRpSave]: []},
                {[$SoRpSave]: _}
            );
            return _;
        },

        // Debug: Load external emu.json
        [$SoGmCfgEmu]: async d => Kernel.constructor(d, FMT, Engine, Report),

        // Debug: Load external sys.json
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
                gSocks.op.bind(gSocks),
                {[$SoGmArena]: []},
                {[$SoGmArena]: _}
            );
            return _;
        },

        // Debug: Evaluate unit stats.
        [$SoGmUnit]: async (i, d) => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
                {[$SoGmUnit]: [i, d]},
                {[$SoGmUnit]: _}
            );
            return _;
        },

        // Debug: Evaluate card stats.
        [$SoGmActor]: async (i, d) => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
                {[$SoGmActor]: [i, d]},
                {[$SoGmActor]: _}
            );
            return _;
        },

        // Debug: Evaluate equip stats.
        [$SoGmEquip]: async (i, d) => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
                {[$SoGmEquip]: [i, d]},
                {[$SoGmEquip]: _}
            );
            return _;
        },

        // Debug: Setup battle.
        [$SoGmBattle]: async (A, L, R) => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
                {[$SoGmBattle]: [A, L, R]},
                {[$SoGmBattle]: _}
            );
            return _;
        },
        
        // Debug: Setup dice war.
        [$SoGmRoll]: async (N, L, R) => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
                {[$SoGmRoll]: [N, L, R]},
                {[$SoGmRoll]: _}
            );
            return _;
        },

        // Debug: Console debug.
        /*
        gmBattleTest: async () => {

            const 
                unitA = new Kernel.Unit(), unitB = new Kernel.Unit(),
                cardA = unitA.Actor, cardB = unitB.Actor
            ;

            unitA.mGrowth = 1000000;
            cardA.mStr = cardA.mAgi = cardA.mInt = cardA.mVit = cardA.mSpr = cardA.mMnd = 99999;
            
            cardB.mSpr = cardB.mVit = 999999;

            unitA.set();
            unitB.set();

            unitA.nPowRatP = unitA.nPowRatM = unitA.nSpdRat = unitA.nRecRat = unitA.nHpRat = unitA.nSdRat = unitA.nAtkRatP = unitA.nAtkRatM = 
            unitA.nLchRat = unitA.nRflRat = unitA.nCrtRat = unitA.nSklRat = unitA.nDodRat = unitA.nEvaRat = unitA.nDefRatP = unitA.nDefRatM = Infinity;

            Object.keys(Kernel.EmuArt1Kind).forEach((k) => unitA.nArt1.add(+k));
            Object.keys(Kernel.EmuArt2Kind).forEach((k) => unitA.nArt2.add(+k));
            Object.keys(Kernel.EmuArt3Kind).forEach((k) => unitA.nArt3.add(+k));
            Object.keys(Kernel.EmuEquipKind).forEach((k) => unitA.nMyst.add(+k));
            Object.keys(Kernel.EmuAuraKind).forEach((k) => unitA.nAura.add(+k));
            Object.keys(Kernel.EmuStatusKind).forEach((k) => unitA["b"+k] = !0);

            // Edge case testing
            unitA.cHpRecRat = unitA.cSdRecRat = unitA.cPowRatP = unitA.cPowRatM = unitA.cSpdRat =
            unitA.cAtkRatP = unitA.cAtkRatM = unitA.cAtkRatC = unitA.cAtkFixP = unitA.cAtkFixM = unitA.cAtkFixC = 
            unitA.cDefRatP = unitA.cDefRatM = unitA.cDefFixP = unitA.cDefFixM =
            unitA.cSklRat = unitA.cCrtRat = unitA.cEvaRat = unitA.cDodRat = unitA.cLchRat = unitA.cRflRat = Infinity;
            unitA.cUndead = 1; unitA.cDodge = 2; unitA.cMirror = 7;

            // Object.keys(Kernel.EmuArt1Kind).forEach((k) => unitB.nArt1.add(+k));
            // Object.keys(Kernel.EmuArt2Kind).forEach((k) => unitB.nArt2.add(+k));
            // Object.keys(Kernel.EmuArt3Kind).forEach((k) => unitB.nArt3.add(+k));
            Object.keys(Kernel.EmuEquipKind).forEach((k) => unitB.nMyst.add(+k));
            // Object.keys(Kernel.EmuAuraKind).forEach((k) => unitB.nAura.add(+k));
            unitB.nArt2.add(3002);
            unitB.nArt2.add(3008);
            unitB.nAura.add(901);

            Client[$CoGmBattle](
                Kernel.setBattle(new Kernel.Arena(), [
                    Kernel.Team([unitA, unitA], 0),
                    Kernel.Team([unitB, unitB], 0)
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
            await Report.idGet(name, pwdHash(pwd))
                .then(u => {
                    if (!u) { return; }
                    gSocks.ct($SoIdIn, u);
                    Server.__proto__ = vtWeb; Server._ = !0;
                })
             ;
        },

        // User: Signup.
        // Does not exist in the original fyg.
        [$SoIdUp]: async (name, pwd) => {
            const
                i0 = Engine.rngBigInt(), i1 = Engine.rngBigInt()
            ;

            await Report.idNew(
                [
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
                ],
                name,
                pwdHash(pwd),
                ""
            )
            .then(u => {
                if (!u) { return ; }
                gSocks.ct($SoIdUp, u);
                Server.__proto__ = vtWeb; Server._ = !0;
            });

        },
        
        // User: Logout.
        // Does not exist in the original fyg.
        [$SoIdOut]: async () => {
            gSocks.dt();
            svcReset();
            Client[$CoSysPage]("login");
            Client[$CoSysReset]();
            Server.__proto__ = vtNull; Server._ = !!0;
        },

        [$SoDataLdr]: async n => {
            if (!(gSvcJson[$NetDataDate] >= n)) {
                gSvcJson = JSON.parse(Driver.load(EMU, SYS));
            }

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
        [$SoGmVipSet]: async (s, b) => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
                {[$SoGmVipSet]: [s, b]},
                {[$SoGmVipSet]: _}
            );
            return _;
        },

        // Debug: Set self rank
        [$SoGmRankSet]: async d => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
                {[$SoGmRankSet]: [d]},
                {[$SoGmRankSet]: _}
            );
            return _;
        },

        // Debug: Set self progress
        [$SoGmProgSet]: async d => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
                {[$SoGmProgSet]: [d]},
                {[$SoGmProgSet]: _}
            );
            return _;
        },

        // Debug: Set self fuel
        [$SoGmFuelSet]: async d => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
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
            delete gSocks.vt;
            
            svcCall(
                gSocks.op.bind(gSocks),
                {[$SoIdOut]: []},
                {[$SoIdOut]: _}
            );
            svcReset();
            Client[$CoSysPage]("login");
            Client[$CoSysReset]();
            Server.__proto__ = vtNull; Server._ = !!0;
            return _;
        },

        // User: Set display name
        // Implements the function of the button on Client.index.
        [$SoIdName]: async (name) => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
                {[$SoIdName]: [name]},
                {[$SoIdName]: _}
            );
            return _;
        },

        // User: Set password
        [$SoIdPass]: async (pass) => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
                {[$SoIdPass]: [pwdHash(pass)]},
                {[$SoIdPass]: _}
            );
            return _;
        },

        // User: Daily bonus
        [$SoIdDaily]: async () => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
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
                gSocks.op.bind(gSocks),
                {[$SoPkPvP]: [r]},
                {[$SoPkPvP]: _}
            );
            return _;
        },
        
        // This function implements jgjg(2) in the original game.
        [$SoPkPvE]: async (r = 5) => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
                {[$SoPkPvE]: [r]},
                {[$SoPkPvE]: _}
            );
            return _;
        },

        // 
        [$SoPkPvB]: async (r = 5) => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
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
                gSocks.op.bind(gSocks),
                {[$SoPkGain]: [r]},
                {[$SoPkGain]: _}
            );
            return _;
        },

        // Refuel
        [$SoPkDrug]: async () => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
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
                gSocks.op.bind(gSocks),
                {[$SoAcFgt]: [a]},
                {[$SoAcFgt]: _}
            );
            return _;
        },

        // Level up card with shell
        [$SoAcExp]: async (k, n) => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
                {[$SoAcExp]: [k, n]},
                {[$SoAcExp]: _}
            );
            return _;
        },
        
        // Aura up card with item
        [$SoAcElt]: async (k, n) => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
                {[$SoAcElt]: [k, n]},
                {[$SoAcElt]: _}
            );
            return _;
        },

        // Set stats point
        [$SoAcSet]: async d => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
                {[$SoAcSet]: [d]},
                {[$SoAcSet]: _}
            );
            return _;
        },
        
        // Break actor card
        [$SoAcBrk]: async (a) => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
                {[$SoAcBrk]: [a]},
                {[$SoAcBrk]: _}
            );
            return _;
        },

        // Card spawn
        [$SoAcSpw]: async (a, l) => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
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
                gSocks.op.bind(gSocks),
                {[$SoEcBrk]: [d]},
                {[$SoEcBrk]: _}
            );
            return _;
        },

        // Equip: Forge
        [$SoEcFrg]: async (a, m) => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
                {[$SoEcFrg]: [a, m]},
                {[$SoEcFrg]: _}
            );
            return _;
        },

        // Equip: Smelt
        [$SoEcSml]: async d => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
                {[$SoEcSml]: [d]},
                {[$SoEcSml]: _}
            );
            return _;
        },

        // Equip: Craft
        [$SoEcCrf]: async (a, l) => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
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
                gSocks.op.bind(gSocks),
                {[$SoFcBrk]: [a]},
                {[$SoFcBrk]: _}
            );
            return _;
        },

        // Fruit: Forge
        [$SoFcFrg]: async (a, m) => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
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
                gSocks.op.bind(gSocks),
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
                gSocks.op.bind(gSocks),
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
                gSocks.op.bind(gSocks),
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
                gSocks.op.bind(gSocks),
                {[$SoScBack]: [i, n]},
                {[$SoScBack]: _}
            );
            return _;
        },

        [$SoScItem]: async (i, n) => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
                {[$SoScItem]: [i, n]},
                {[$SoScItem]: _}
            );
            return _;
        },
        
        [$SoScCoin]: async () => {
            const _ = svcPromise();
            svcCall(
                gSocks.op.bind(gSocks),
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
    Server[$SvcLocal] = vtNull;
    Server._ = !!0;

})();

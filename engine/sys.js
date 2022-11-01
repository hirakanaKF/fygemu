/*
Project: fygemu
Authors: hirakana@kf
*/

// Setup
(global.System ?? exports).constructor = function (Data, Emu, Dbs, Wsc) {

    /*
    collection Ident {
        string _id; // Internal id (which is required for MongoDB)
        string N;   // Display name
        string P;   // Password
        string G;   // Group id
    }
    */

    class Actor extends Emu.ObjBase {

        constructor (k) {
            super();
            this.mExp = 0;
            this.mCard = new Emu.Card(k);
            this.mAuras = new Emu.Aura();
            this.mEquips = Array(4).fill(0xffffffff);
            this.mFruits = [];
        }

        from (data) {
            this.mCard.from(data).set();
            this.mAuras.from(data.auras);
            this.mEquips = data.equip;
            this.mFruits = data.fruit;
            return this;
        }

        json () {
            const u32 = Dbs.JS.u32, f = x => x >= 0 ? u32(x) : 0xffffffff;
            return {
                ...this.mCard.json(),
                exp: this.mExp,
                auras: this.mAuras.json(),
                equip: this.mEquips.map(f),
                fruit: this.mFruits.map(f)
            }
        }

        bson () {
            const u32 = Dbs.DB.u32, f = x => x >= 0 ? u32(x) : 0xffffffff;
            return {
                ...this.mCard.bson(),
                exp: this.mExp,
                auras: this.mAuras.bson(),
                equip: this.mEquips.map(f),
                fruit: this.mFruits.map(f)
            }
        }

    }

    class ActorArr extends Emu.ArrBase {
        
        from (d) {
            for (const i in d) { this[i] = new Actor().from(d[i] ?? {}); }
            return this;
        }
    }

    class ActorVec extends Emu.VecBase {

        from (d) {
            for (const i in d) { this[i] = new Actor().from(d[i] ?? {}); }
            return this;
        }
    }

    const 

        gRngVec = {},

        gActorAll = Object.keys(Array(Data.num.actor).fill()),
        gEquipAll = Object.keys(Array(Data.num.equip).fill()),
        gFruitAll = Object.keys(Array(Data.num.fruit).fill()),

        gNullUser = new Emu.User(),
        gNullAmulet = new Emu.Amulet(),
        gNullWish = new Emu.Wish(),
        gNullDice = new Emu.Dice(),
        gNullGems = new Emu.Gems(),

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Callbacks *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        dbUser = r => {
            const u = new Emu.User().from(r ?? {});
            u.set();
            return u;
        },
        dbActorArr = r => new ActorArr().from(Object.values(r)),
        dbActorVec = r => new ActorVec().from(r),
        dbEquipArr = r => new Emu.EquipArr().from(Object.values(r)),
        dbEquipVec = r => new Emu.EquipVec().from(r),
        dbFruitArr = r => new Emu.FruitArr().from(Object.values(r)),
        dbFruitVec = r => new Emu.FruitVec().from(r),
        dbWish = r => new Emu.Wish().from(r ?? {}),
        dbGift = r => r ?? {},
        dbDice = r => new Emu.Dice().from(r ?? {}),
        dbFight = r => new Emu.Fight().from(r ?? {}),
        dbFightArr = r => new Emu.FightArr().from(r ?? {}),
        dbRecord = r => new Emu.Record().from(r ?? {}),

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Report *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        
        // Deserialize data in JSON to database
        rpLoad = async (s, d) => Dbs.from(d),

        // Serialize data of database to JSON
        rpSave = async (s) => Dbs.json()
            .then(d => { return {[$CoGmDl]: [d]}; })
        ,

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Debug *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------

        gmArena = async (s) => {
            return {
                [$CoGmArena]: new Emu.Arena().json()
            };
        },

        gmUnit = async (s, i, d) => {
            const m = new Emu.Unit().from(d);
            m.set();
            return {
                [$CoGmUnit]: [i, m.json()]
            };
        },

        gmActor = async (s, i, d) => {
            const m = new Emu.Card().from(d);
            m.set();
            return {
                [$CoGmActor]: [i, m.json()]
            };
        },

        gmEquip = async (s, i, d) => {
            const m = new Emu.Equip().from(d);
            m.set();
            return {
                [$CoGmEquip]: [i, m.json()]
            };
        },
        
        gmBattle = async (s, Z, L, R) => {
            const A = new Emu.Arena();
            L = L.map(u => new Emu.Unit().from(u));
            R = R.map(u => new Emu.Unit().from(u));
            return {
                [$CoGmBattle]: [
                    Emu.setBattle(Z ? A.from(Z) : A, [
                        Emu.Team(L, L.reduce((x, u) => x | u.mIsPVE, 0)),
                        Emu.Team(R, R.reduce((x, u) => x | u.mIsPVE, 0))
                    ])
                ]
            };
        },

        gmRoll = async (s, N, L, R) => {
            return {
                [$CoGmRoller]: [
                    Emu.setRoller(
                        N,
                        new Emu.Dice().from(L),
                        new Emu.Dice().from(R)
                    )
                ]
            };
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Helper *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        
        // Card generating algorithm
        // Skill, Quality, Build ~ beta(2, 2)
        _acGen = (i, u, D, G) => {

            const 
                out = {}, req = {}, K = G.Kind, m = u.mActor,
                t = new Date().getTime(), bvip = u.mBVip < t, svip = u.mSVip < t,
                va = G.Vl + (svip ? G.Vs : 0) + (bvip ? G.Vb : 0), vm = G.Vh - va,
                sa = G.Sl + (svip ? G.Ss : 0) + (bvip ? G.Sb : 0), sm = G.Sh - sa,
                ba = G.Bl + (svip ? G.Bs : 0) + (bvip ? G.Bb : 0), bm = G.Bh - ba,
                rngNumber = Emu.rngNumber, rngBeta22 = Emu.rngBeta22
            ;

            for (const i of D) {
                if (i >= m) { continue; }
                const 
                    k = K[rngNumber(K.length)], a = new Actor(k), c = a.mCard,
                    v = rngBeta22(), s = rngBeta22(), b = rngBeta22(), q = v + s + b
                ;
                c.mTrait = v * vm + va;
                c.mSkill = s * sm + sa;
                c.mBuild = b * bm + ba;
                c.mValue = q + q;
                c.mRank = q < 1.0925 ?
                    q > 0.60 ? 1 : 2 :
                    q < 1.5775 ? 3 : q < 1.925 ? 4 : 5
                ;
                
                // Calculate point
                c.set();
                
                out[i] = a.json(); req[i] = a.bson();
            }
            return Dbs.db2Set(Dbs.pActor, i, req).then(r => r && out);
        },
                
        // Equip generating algorithm
        // Level, Quality ~ beta(2, 2)
        _ecGen = (i, u, D, G) => {
            const 
                emu = Emu.EmuEquipKind, P = G.Kind, K = Object.keys(P), m = u.mEquip,
                t = new Date().getTime(), bvip = u.mBVip < t, svip = u.mSVip < t,
                rngNumber = Emu.rngNumber, rngBigInt = Emu.rngBigInt, rngBeta22 = Emu.rngBeta22,
                out = {}, req = {}
            ;

            for (const i of D) {
                if (i >= m) { continue; }

                const 
                    e = new Emu.Equip(), k = K[rngNumber(K.length)], E = G[P[k]],
                    lo = E.L, hi = E.H, sp = E.M, T = emu[k].stats,
                    r = rngBigInt()
                ;

                e.mKind = k;

                // Level
                e.mLevel = Math.min(rngBeta22() * u.mGrade, G.Cap);

                // Quality
                let q = lo + (svip ? E.S : 0) + (bvip ? E.B : 0);
                q += rngBeta22() * (hi - q);

                // Generate attribute multipliers
                e.mAttr = (gRngVec[T.length] ??= Emu.RngVec(T.length))(q, E.Q, E.A);

                // Mystery check
                // Both vip grant user additional 1 check when it misses.
                e.mValue = q += (
                    e.mMyst = (
                        (r & 0xffffn) < sp || 
                        (bvip && (r >> 0x10n & 0xffffn) < sp) || 
                        (svip && (r >> 0x20n & 0xffffn) < sp)
                    )
                );

                // This is slightly different from the original game, in order to support arbitrarilly number of attributes.
                // Original: 200, 318.5, 420, 515.5, 585 -> 0.00, 1.20, 2.185, 3.155, 4.85
                e.mRank = q < 2.185 ?
                        q > 1.20 ? 1 : 2 :
                        q < 3.155 ? 3 : q < 3.85 ? 4 : 5;

                // Calculate stats
                e.set();

                out[i] = e.json(); req[i] = e.bson();
            }
            return Dbs.db2Set(Dbs.pEquip, i, req).then(r => r && out);
        },

        // Fruit generating algorithm
        // 
        _fcGen = (i, u, D, G) => {
            const 
                K = G.Kind, A = G.Attr, m = u.mFruit,
                add = G.Lo, mul = G.Hi - G.Lo, out = {}, req = {}
            ;

            for (const k in D) {
                if (+k >= m) { continue; }

                const e = D[k];
                if (!e) { continue; }

                const d = new Emu.Fruit(), r = e.mValue * (Emu.rngBeta22() * mul + add);
                for (const kind in K) {
                    const data = K[kind], q = r - data.Min;
                    if (q < 0) { continue; }

                    const a = data.Attr, attr = a[Emu.rngNumber(a.length)], T = A[attr]; 
                    d.mKind = kind; d.mValue = q;
                    d.mRank = Math.min(Math.floor(data.Rank * q) + 1, 5);
                    d.mStat[attr] = T.Lvl * e.mLevel + T.Mul * d.mValue + T.Add;
                    out[k] = d.json(); req[k] = d.bson();
                    break;
                }
            }

            return Dbs.db2Set(Dbs.pFruit, i, req).then(r => r && out);
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * GM *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        gmVipSet = async (s, sv, bv) => {
            return {[$CoSysUsr]: await Dbs.db1Set(Dbs.pUser, s.id, {svip: sv, bvip: bv})};
        },

        gmRankSet = async (s, d) => {
            await Dbs.db1Set(Dbs.pFight, s.id, {rank: d});
            return {
                [$CoSysRank]: [d],
                [$CoPkRank]: [d]
            };
        },

        gmProgSet = async (s, d) => {
            await Dbs.db1Set(Dbs.pFight, s.id, {prog: d});
            return {[$CoPkProg]: [d]};
        },

        gmFuelSet = async (s, d) => {
            await Dbs.db1Set(Dbs.pFight, s.id, {fuel: d});
            return {[$CoPkFuel]: [d]};
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Ident *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        
        idOut = async (s) => {
            s.dt();
        },

        idName = async (s, d) => {
            let u;
            try {
                u = await Dbs.db1Set(Dbs.pIdent, s.id, {N: d});
            }
            catch (e) {
                // Error handling?
                return {};
            }
            return {[$CoSysUsr]: [u]};
        },

        idPass = async (s, d) => {
            await Dbs.db1Set(Dbs.pIdent, s.id, {P: d});
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * PK *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        
        pkPvPEx = async (s, cfg) => {
            cfg = Object.assign({}, Data.pvp, cfg);

            // Fuel check
            let r = cfg.Rate;
            const tl = await Dbs.ftFuel(s.id, r);
            if (!tl) { return; }

            // Fuel comsumed
            const m = new Emu.Fight().from(tl);
            if (m.mFuel < 0) { r += m.mFuel; m.mFuel = 0; }

            // Match a player
            const res = {[$CoPkFuel]: [m.mFuel]}, tr = await Dbs.db1Rng(Dbs.pFight, "rank", m.mRank, 1);
            
            // Empty match (perhaps do something?)
            if (tr.length != 1) { return res; }

            // Prepare for battle
            const 
                a = new Emu.Fight().from(tr[0]),
                li = s.id, ri = a._id,

                // Query user, card and wish
                [lUser, lWish, rUser, rWish] = await Promise.all([
                    Dbs.db1Get(Dbs.pUser, li).then(dbUser),
                    Dbs.db1Get(Dbs.pWish, li).then(dbWish),
                    Dbs.db1Get(Dbs.pUser, ri).then(dbUser),
                    Dbs.db1Get(Dbs.pWish, ri).then(dbWish)
                ]),

                lFight = m.mFight.filter(i => i < lUser.mActor), 
                rFight = a.mFight.filter(i => i < rUser.mActor),

                [lActor, rActor] = await Promise.all([
                    Dbs.db2Get(Dbs.pActor, li, lFight).then(dbActorArr),
                    Dbs.db2Get(Dbs.pActor, ri, rFight).then(dbActorArr),
                ]),
            
                // Query equip and fruit
                [lEquip, lFruit, rEquip, rFruit] = await Promise.all([
                    Dbs.db2Get(Dbs.pEquip, li, lActor.map(a => a.mEquips).flat().filter(i => i < lUser.mEquip)).then(dbEquipVec),
                    Dbs.db2Get(Dbs.pFruit, li, lActor.map(a => a.mFruits).flat().filter(i => i < lUser.mFruit)).then(dbFruitVec),
                    Dbs.db2Get(Dbs.pEquip, li, rActor.map(a => a.mEquips).flat().filter(i => i < rUser.mEquip)).then(dbEquipVec),
                    Dbs.db2Get(Dbs.pFruit, li, rActor.map(a => a.mFruits).flat().filter(i => i < rUser.mFruit)).then(dbFruitVec)
                ]),

                LE = Data.ecLmt, LF = Data.fcLmt,
                d = Emu.setBattle(new Emu.Arena(), [
                    Emu.Team(
                        lActor.map(r => {
                            const 
                                a = {},
                                e = r.mEquips.map((i, n) => {
                                    const e = lEquip[i]; delete lEquip[i];
                                    return (e && LE[""+e.mKind] == n) ? e : null;
                                })
                            ;
                            r.mFruits.forEach(i => {
                                const e = lFruit[i]; delete lFruit[i];
                                if (!e) { return; }
                                const A = e.mStat;
                                for (const k in A) { a[k] = Emu.numCast(Math.min((a[k] ?? 0) + A[k], LF[k])); }
                            });
                            const u = new Emu.Unit(lUser, r.mCard, e, new Emu.Amulet().from(a), lWish, r.mAuras, gNullDice, gNullGems, 0);
                            return u.set(); // Dice and Gems are reserved for now.
                        }), 0
                    ),
                    Emu.Team(
                        rActor.map(r => {
                            const 
                                a = {},
                                e = r.mEquips.map((i, n) => {
                                    const e = rEquip[i]; delete rEquip[i];
                                    return (e && LE[""+e.mKind] == n) ? e : null;
                                })
                            ;
                            r.mFruits.forEach(i => {
                                const e = rFruit[i]; delete rFruit[i];
                                if (!e) { return; }
                                const A = e.mStat;
                                for (const k in A) { a[k] = Emu.numCast(Math.min((a[k] ?? 0) + A[k], LF[k])); }
                            });
                            const u = new Emu.Unit(rUser, r.mCard, e, new Emu.Amulet().from(a), rWish, r.mAuras, gNullDice, gNullGems, 0);
                            u.set();
                            return u; // Dice and Gems are reserved for now.
                        }), 0
                    )
                ]),
                lg = cfg.Grow * r / lFight.length,
                rg = cfg.Grow * r / rFight.length,
                Q = [
                    Dbs.acGrow(li, lFight, lg),
                    Dbs.acGrow(ri, rFight, rg)
                    .then(r => {
                        const s = wsc[ri];
                        if (!s) { return; }
                        s.cb({equip: {grow: [rg]}});
                    })
                ]
            ;

            // Progress change
            {
                const i = d.sign, lp = cfg.Gain[i] * r, rp = cfg.Give[i] * r;
                if (lp) {
                    Q.push(
                        Dbs.ftProg(li, lp).then(r => res[$CoPkProg] = [r.prog])
                    );
                }
                if (rp) {
                    Q.push(
                        Dbs.ftProg(ri, rp)
                        .then(r => {
                            const s = wsc[ri];
                            if (!s) { return; }
                            s.cb({[$CoPkProg]: [r.prog]});
                        })
                    );
                }
            }
            
            res[$CoEquipGrow] = [lg];
            res[$CoPkLog] = [d];

            await Promise.all(Q);

            return res;
        },

        pkPvEEx = async (s, cfg) => {
            cfg = Object.assign({}, Data.pve, cfg);

            // Fuel check
            let r = cfg.Rate;
            const t = await Dbs.ftFuel(s.id, r);
            if (!t) { return; }

            // Fuel comsumed
            const m = new Emu.Fight().from(t);
            if (m.mFuel < 0) { r += m.mFuel; m.mFuel = 0; }
            
            const
                // Response payload
                res = {[$CoPkFuel]: [m.mFuel]},

                // Match an enemy
                data = cfg.Enemy, rd = data[Emu.rngNumber(data.length)], // Randomly pick up a enemy
                rc = new Emu.Card(rd.kind), ra = new Emu.Aura(rd.aura),
                ru = new Emu.Unit(gNullUser, rc, [], gNullAmulet, gNullWish, ra, gNullDice, gNullGems, 0) // We do not need user, amulet or wish for enemies
            ;

            // We have no plan on implementing dynamic enemy level for now.
            // Simple lerp is used instead.
            rc.mLevel = Math.floor(Number(m.mRank) * rd.rank + m.mProg * rd.prog);    // Lv = R * rank + P * prog
            rc.mTrait = rd.elite;                                                     // Quality = E * prog * prog
            ru.set();

            // Prepare for battle
            const 
                li = s.id, 

                // Query user, card and wish
                [lUser, lWish] = await Promise.all([
                    Dbs.db1Get(Dbs.pUser, li).then(dbUser),
                    Dbs.db1Get(Dbs.pWish, li).then(dbWish)
                ]),

                lFight = m.mFight.filter(i => i < lUser.mActor),
                lActor = await Dbs.db2Get(Dbs.pActor, li, lFight).then(dbActorArr), 
            
                // Query equip and fruit
                [lEquip, lFruit] = await Promise.all([
                    Dbs.db2Get(Dbs.pEquip, li, lActor.map(a => a.mEquips).flat().filter(i => i < lUser.mEquip)).then(dbEquipVec),
                    Dbs.db2Get(Dbs.pFruit, li, lActor.map(a => a.mFruits).flat().filter(i => i < lUser.mFruit)).then(dbFruitVec)
                ]),
                LE = Data.ecLmt, LF = Data.fcLmt,
                d = Emu.setBattle(new Emu.Arena(), [
                    Emu.Team(
                        lActor.map(r => {
                            const 
                                a = {},
                                e = r.mEquips.map((i, n) => {
                                    const e = lEquip[i]; delete lEquip[i];
                                    return (e && LE[""+e.mKind] == n) ? e : null;
                                })
                            ;
                            r.mFruits.forEach(i => {
                                const e = lFruit[i];
                                if (!e) { return; }
                                const A = e.mStat;
                                for (const k in A) { a[k] = Emu.numCast(Math.min((a[k] ?? 0) + A[k], LF[k])); }
                            });

                            const u = new Emu.Unit(lUser, r.mCard, e, new Emu.Amulet().from(a), lWish, r.mAuras, 1);
                            return u.set();
                        }), 1
                    ),
                    Emu.Team([ru], 0)
                ]),
                lg = cfg.Grow * r / lFight.length,
                Q = [Dbs.acGrow(li, lFight, lg)]
            ;
            
            res[$CoEquipGrow] = [lg];
            res[$CoPkLog] = [d];

            // Progress change
            {
                const lp = cfg.Gain[d.sign] * r;
                if (lp) {
                    Q.push(
                        Dbs.ftProg(li, lp)
                        .then(r => res[$CoPkProg] = [r?.prog ?? 0])
                    );
                }
            }

            await Promise.all(Q);

            return res;
        },

        pkPvBEx = async (s, cfg) => {
            cfg = Object.assign({}, Data.pvb, cfg);

            // Fuel check
            let r = cfg.Rate;
            const t = await Dbs.ftFuel(s.id, r);
            if (!t) { return; }

            // Response payload
            const 
                m = new Emu.Fight().from(t),
                res = {[$CoPkFuel]: [m.mFuel]}
            ;

            // Fuel check
            if (m.mFuel < 0 || m.mProg < Data.trail) { return res; }
            
            const
                // Match an enemy
                data = cfg.Enemy, rd = data[Emu.rngNumber(data.length)], // Randomly pick up a enemy
                rc = new Emu.Card(rd.kind), ra = new Emu.Aura(rd.aura),
                ru = new Emu.Unit(gNullUser, rc, [], gNullAmulet, gNullWish, ra, gNullDice, gNullGems, 0) // We do not need user, amulet or wish for enemies
            ;

            // Simple lerp is used instead.
            // We have no plan on implementing dynamic enemy level for now.
            rc.mLevel = Math.floor(Number(m.mRank) * rd.rank + rd.base);                // Lv = R * rank + base
            rc.mTrait = rd.elite;                                                       // Quality = elite
            ru.set();

            // Prepare for battle
            const 
                li = s.id,

                // Query user, card and wish
                [lUser, lWish] = await Promise.all([
                    Dbs.db1Get(Dbs.pUser, li).then(dbUser),
                    Dbs.db1Get(Dbs.pWish, li).then(dbWish)
                ]),

                lFight = m.mFight.filter(i => i < lUser.mActor),
                lActor = await Dbs.db2Get(Dbs.pActor, li, lFight).then(dbActorArr),
            
                // Query equip and fruit
                [lEquip, lFruit] = await Promise.all([
                    Dbs.db2Get(Dbs.pEquip, li, lActor.map(a => a.mEquips).flat().filter(i => i < lUser.mEquip)).then(dbEquipVec),
                    Dbs.db2Get(Dbs.pFruit, li, lActor.map(a => a.mFruits).flat().filter(i => i < lUser.mFruit)).then(dbFruitVec)
                ]),
                
                LE = Data.ecLmt, LF = Data.fcLmt,
                d = Emu.setBattle(new Emu.Arena(), [
                    Emu.Team(
                        lActor.map(r => {
                            const 
                                a = {},
                                e = r.mEquips.map((i, n) => {
                                    const e = lEquip[i]; delete lEquip[i];
                                    return (e && LE[""+e.mKind] == n) ? e : null;
                                })
                            ;
                            r.mFruits.forEach(i => {
                                const e = lFruit[i]; delete lFruit[i];
                                if (!e) { return; }
                                const A = e.mStat;
                                for (const k in A) { a[k] = Emu.numCast(Math.min((a[k] ?? 0) + A[k], LF[k])); }
                            });
                            
                            const u = new Emu.Unit(lUser, r.mCard, e, new Emu.Amulet().from(a), lWish, r.mAuras, 1);
                            return u.set();
                            
                        }), 1
                    ),
                    Emu.Team([ru], 0)
                ])
            ;
            
            res[$CoPkLog] = [d];

            // Rank change
            {
                const n = m.mRank + 1;
                if (d.sign == 1n && !(n >= Data.rank)) {
                    await Dbs.ftRank(li, n, 0)
                        .then(r => res[$CoPkRank] = [r?.rank ?? 0]);
                }
            }

            return res;
        },

        pkGainEx = async (s, cfg) => {
            cfg = Object.assign({}, Data.res, cfg);

            // Fuel check
            let r = cfg.Rate;
            const t = await Dbs.ftCost(s.id, r, cfg.Cost * r, Data.trail);
            if (!t) { return; }

            // Fuel comsumed
            const m = new Emu.Fight().from(t);
            if (m.mFuel < 0) { r += m.mFuel; m.mFuel = 0; }

            // Reward formula
            const 
                p = m.mProg,
                n = r * (cfg.Rank * Number(m.mRank) + cfg.Prog * p / (Data.trail + p)),
                u = await Dbs.db1Inc(Dbs.pUser, s.id, cfg.Gain, n)
            ;

            return {
                [$CoSysUsr]: [u ? dbUser(u).set().json() : {}],
                [$CoPkFight]: [m.bson()]
            };

        },

        pkDrugEx = async (s, cfg) => {
            cfg = Object.assign({}, Data.drug, cfg);

            // Cost
            const rc = await Dbs.utCost(s.id, cfg.Cost, 1);
            if (!rc) { return; }
            const res = {[$CoSysUsr]: [rc]};

            // Fuel
            const rf = await Dbs.ftDrug(s.id, cfg.Decay);
            if (rf) { res[$CoPkFuel] = [rf.fuel]; res[$CoPkDrug] = [rf.drug]; }

            return res;
        },

        pkPvP = async (s) => pkPvPEx(s),

        pkPvE = async (s) => pkPvEEx(s),

        pkPvB = async (s) => pkPvBEx(s),

        pkGain = async (s) => pkGainEx(s),

        pkDrug = async (s) => pkDrugEx(s),

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Cards *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------

        // Fight
        acFgt = async (s, a) => {
            const r = await Dbs.db1Set(Dbs.pFight, s.id, {fight: a.slice(0, 1)});
            return r && {[$CoEquipFight]: [r.fight]};
        },

        // Level up
        acExp = async (s, i, n) => {
            if (!(n > 0)) { return; }

            const G = Data.acExp, r = await Dbs.utCost(s.id, G.Cost, n);
            if (!r) { return; }
            const u = dbUser(r);

            return {
                [$CoSysUsr]: [u],
                [$CoEquipAcc]: [
                    (await Dbs.acExp(s.id, i, n, Math.min(G.Cap, u.mGrade)).then(dbActorVec)).json()
                ]
            };
        },

        // Aura up
        acElt = async (s, i, n) => {
            if (!(n >= 1)) { return; }

            const G = Data.acElt, r = await Dbs.utCost(s.id, G.Cost, n);
            if (!r) { return; }
            const u = dbUser(r), rngBeta13 = Emu.rngBeta13;

            let f = 0;
            n = Math.min(Math.floor(n), Number.MAX_SAFE_INTEGER);
            do {
                f = Math.max(rngBeta13() * G.Cap, f);
            } while (--n > 0);

            return {
                [$CoSysUsr]: [u],
                [$CoEquipAcc]: [
                    (await Dbs.acElt(s.id, i, f).then(dbActorVec)).json()
                ]
            };
        },

        // Merge cards to the specified card
        //  - Inherits: Exp, Flair, Growth
        acMrg = async (s, t, a) => {
            const i = s.id, r1 = await Dbs.db2Get(Dbs.pActor, i, a);
            if (!r1 || !(await Dbs.db2Del(Dbs.pActor, i, a))) { return; }

            const res = {[$CoEquipAcd]: [a]}, r0 = await Dbs.db2Get(Dbs.pActor, i, [t]);
            if (!r0) { return res; }

            const a0 = dbActorVec(r0), a1 = dbActorVec(r1), b0 = a0[t], c0 = b0.mCard;
            for (const k in a1) {
                const b1 = a1[k], c1 = b1.mCard;
                b0.mExp += b1.mExp;
                c0.mGrowth = Math.max(c0.mGrowth, c1.mGrowth);
            }
            c0.mLevel = Math.sqrt(b0.mExp);
            if (await Dbs.db2Set(Dbs.pActor, i, a0.bson())) {
                res[$CoEquipAcc] = [a0.json()];
            };
            
            return res;
        },

        // Breaks cards
        //  - Returns coin
        acBrk = async (s, a) => {
            const i = s.id, r = await Dbs.db2Get(Dbs.pActor, i, a);
            if (!r || !(await Dbs.db2Del(Dbs.pActor, i, a))) { return; }

            const T = dbActorArr(r), P = {q: 0, exp: 0, G: 0}, D = Data.acBrk, p = {};
            for (const t of T) {
                const c = t.mCard;
                P.exp += t.mExp; P.q += c.mValue; P.G += c.mGrowth;
            }
            P[""] = T.length;
            for (const k in D) {
                const d = D[k];
                let v = 0;
                for (const k in d) { v += d[k] * P[k]; }
                p[k] = v;
            }

            return {
                [$CoSysUsr]: [await Dbs.db1Inc(Dbs.pUser, i, p, 1)],
                [$CoEquipAcd]: [a]
            };
        },

        // Spawn card
        acSpw = async (s, a, l) => {
            // Validate request
            const n = a.length;
            if (!n) { return; }

            const cfg = Data.acSpw[l];
            if (!cfg) { return; }

            const i = s.id, r = await Dbs.utCost(i, cfg.Cost, n);
            if (!r) { return; }
            
            // Generate card and write to database
            const res = {[$CoSysUsr]: [r]};
            await _acGen(i, dbUser(r), a, cfg)
            .then(v => v && (res[$CoEquipAcc] = [v]));

            // Notify client
            return res;
        },

        // Set card
        acSet = async (s, d) => {
            if (!d) { return; }

            const i = s.id, r = await Dbs.db2Get(Dbs.pActor, i, Object.keys(d));
            if (!r) { return; }

            const out = {}, req = {}, A = dbActorVec(r);
            for (const k in A) {
                const 
                    a = A[k], c = a.mCard, p = d[k],
                    str = Number(p.str), agi = Number(p.agi), int = Number(p.int), vit = Number(p.vit), spr = Number(p.spr), mnd = Number(p.mnd), aura = p.aura, equip = p.equip, fruit = p.fruit
                ;
                let m = 0;

                c.set();
                if (str >= 0 && agi >= 0 && int >= 0 && vit >= 0 && spr >= 0 && mnd >= 0 && (str + agi + int + vit + spr + mnd) <= c.nPoint) {
                    c.mStr = str; c.mAgi = agi; c.mInt = int;
                    c.mVit = vit; c.mSpr = spr; c.mMnd = mnd;
                    m = 1;
                }
    
                // Aura set
                if (aura && aura.length <= c.mSkill) {
                    const E = Emu.EmuAuraKind;
                    if (aura.reduce((a, k) => a + E[k].cost, 0) <= c.mFlair) {
                        a.mAuras.from(aura); m = 1;
                    }
                }
    
                // Equip set (no check here)
                if (equip && equip.length == 4) {
                    a.mEquips = equip; m = 1;
                }
    
                // Fruit set (no check here)
                if (fruit && fruit.length <= c.mBuild) {
                    a.mFruits = fruit; m = 1;
                }

                if (m) { req[k] = a.bson(); out[k] = a.json(); }
            }

            if (await Dbs.db2Set(Dbs.pActor, i, req)) {
                return {[$CoEquipAcc]: [out]};
            }
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Equipments / Fruits *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------

        // Break equip
        ecBrk = async (s, a) => {
            // 
            const i = s.id, r = await Dbs.db2Get(Dbs.pEquip, i, a);
            if (!r || !(await Dbs.db2Del(Dbs.pEquip, i, a))) { return; }

            // 
            const ea = dbEquipArr(r), D = Data.ecBrk, dm = D.Mul, da = D.Add;
            return {
                [$CoSysUsr]: [await Dbs.db1Inc(Dbs.pUser, i, D.Gain, ea.reduce((a, t) => a + t.mValue * dm, ea.length * da))],
                [$CoEquipEcd]: [a]
            };
        },

        // Equip craft
        ecCrf = async (s, a, l) => {
            // Validate request
            const n = a.length;
            if (!n) { return; }

            const cfg = Data.ecCrf[l];
            if (!cfg) { return; }

            const i = s.id, r = await Dbs.utCost(i, cfg.Cost, n);
            if (!r) { return; }
            
            // Generate equipments and write to database
            const res = {[$CoSysUsr]: [r]};
            await _ecGen(i, dbUser(r), a, cfg)
                .then(v => v && (res[$CoEquipEcc] = [v]));

            // Notify client
            return res;
        },

        // Smelt equips
        ecSml = async (s, d) => {
            // Validate request
            const a = Object.keys(d);
            if (!a || !a.length) { return; }

            // Remove equipments from the database
            const i = s.id, r = await Dbs.db2Get(Dbs.pEquip, i, a);
            if (!r || !(await Dbs.db2Del(Dbs.pEquip, i, a))) { return; }

            const u = await Dbs.db1Get(Dbs.pUser, i);
            if (!u) { return; }

            const p = {}, q = dbEquipVec(r), res = {[$CoEquipEcd]: [a]};
            for (const k in q) { p[d[k]] = q[k]; }

            // Generate fruit and write to database
            await _fcGen(i, dbUser(u), p, Data.ecSml)
                .then(r => r && (res[$CoEquipFcc] = [r]));
                
            // Notify client
            return res;
        },

        fcBrk = async (s, a) => {
            // 
            const i = s.id, r = await Dbs.db2Get(Dbs.pFruit, i, a);
            if (!r || !(await Dbs.db2Del(Dbs.pFruit, i, a))) { return; }

            // 
            const fa = dbFruitArr(r), D = Data.fcBrk, dm = D.Mul, da = D.Add, P = D.Kind;
            return {
                [$CoSysUsr]: [await Dbs.db1Inc(Dbs.pUser, i, D.Gain, fa.reduce((a, t) => a + t.mValue * dm + (P[t.mKind] ?? 0), fa.length * da))],
                [$CoEquipFcd]: [a]
            };
        },

        /* Forge fruits
            a: Array<Number>
                Index of fruit
            m: Number
                Payment multiplier
        */
        fcFrg = async (s, a, m) => {

            // Validate request
            if (!a || !a.length || !(m > 0)) { return; }

            // Cost
            const cfg = Data.fcFrg, i = s.id, u = await Dbs.utCost(i, cfg.Cost, m);
            if (!u) { return; }

            // Check for fruit and cost
            const 
                C = cfg.Mul, cap = cfg.Cap, res = {[$CoSysUsr]: [u]},
                E = await Dbs.db2Get(Dbs.pFruit, i, a).then(dbFruitVec), F = []
            ;
            for (const k in E) {
                const e = E[k], n = ++e.mLevel;
                if (n > cap) { continue; }
                if ((m -= n * C[E.mKind]) < 0) { break; }
                F.push(k);
            }

            // Forge
            const kind = cfg.Kind, attr = cfg.Attr, out = {}, req = {};
            for (const k of F) {
                const e = E[k], T = kind[""+e.mKind], a = T[Emu.rngNumber(T.length)], A = attr[a];
                e.mStat[a] = (e.mStat[a] ?? 0) + A.Mul * e.mValue + A.Add;
                out[k] = e.json(); req[k] = e.bson();
            }

            // 
            await Dbs.db2Set(Dbs.pFruit, i, req)
                .then(r => r && (res[$CoEquipFcc] = [out]));

            return res;
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Gems *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        
        /* Mining gems
            l: Number
                Level of mining
            n: Number
                Payment multiplier
        */
        gcMine = async (s, l, k, n) => {
            if (!(n >= 1) || !Emu.EmuGemKind[k]) { return; }

            const cfg = Data.gcMine[l];
            if (!cfg) { return; }

            const u = await Dbs.utCost(s.id, cfg.Cost, n);
            if (!u) { return; }
            
            // Server side check
            /*
            const
                res = {[$CoSysUsr]: [u]},
                p = {}, G = Emu.EmuGemKind, L = Object.keys(G)
            ;
            (gRngVec[L.length] ??= Emu.RngVec(L.length))(1, n, 0).forEach((v, i) => { p[L[i]] = v; });
            */
           const res = {[$CoSysUsr]: [u]}, f = Emu.rngBeta22;
           let m = 0;
           while (--n >= 0) { m += f() * cfg.Mul + cfg.Add; }

            await Dbs.db1Inc(Dbs.pGems, s.id, {[k]: m}, 1)
                .then(r => r && (res[$CoSysGem] = [r]));

            return res;
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Wish Pool *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        
        /* Wish
            d: Object<String, Number>
                Number of each kind of pool
            m: Number
                Payment multiplier
        */
        wpDrop = async (s, d, m) => {
            if (!(m > 0)) { return; }

            const 
                cfg = Data.wpDrop, 
                u = await Dbs.utCost2(s.id, "wish", cfg.Cost, m, cfg.Cap)
            ;
            if (!u) { return; }
            
            // Server side check
            const p = {};
            for (const k in d) {
                const n = d[k];
                if ((m -= n) < 0) { break; } // n, c may not be valid Number
                p[k] = n;
            }

            return Dbs.db1Inc(Dbs.pWish, s.id, p, 1)
                .then(r => r && {[$CoSysUsr]: [u], [$CoWishSet]: [r, u.wish]});
        },
        
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Gift Pool *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------

        /* Gift
            k: Number
                Card ID
            m: Number
                Payment multiplier
        */
        gpFlip = async (s, k) => {
            if (!(k >= 0)) { return; }

            const 
                cfg = Data.gift, res = {},
                u = await Dbs.utCost2(s.id, "gift", cfg.Cost, 1, cfg.Cap)
            ;
            if (!u) { return; }
            
            // Server side check
            res[$CoSysUsr] = [u];

            return Dbs.gpFlip(s.id, k)
                .then(r => {
                    res[$CoGiftFlip] = [k, r];
                    return r && Dbs.utGain(s.id, {[r.k]: r.v}, 1, Data.day)
                })
                .then(r => {
                    if (r) { res[$CoSysUsr] = [r]; }
                    return res;
                });
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Shop Center *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------

        // 
        scBack = async (s, k, n) => {
            const cfg = Data.scBack[k], l = Data.num[k];
            if (!k || !l) { return ; }

            return Dbs.utCost2(s.id, k, cfg, n, l)
                .then(r => r && {[$CoSysUsr]: [r]});
        },

        // 
        scItem = async (s, i, n) => {
            if (!(n > 0)) { return; }

            const cfg = Data.scItem[i];
            if (!cfg || n <= 0) { return; }

            return Dbs.utCost(s.id, cfg.Cost, n)
                .then(r => r && Dbs.utGain(s.id, cfg.Gain, n, Data.day))
                .then(r => r && {[$CoSysUsr]: [r]});
        },

        // 
        scCoin = async (s) => {
            return Dbs.utShop(s.id)
                .then(r => r && {[$CoSysUsr]: [r]});
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Connection *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        
        // Daily bonus
        setup = async (r) => {

            // Data
            const 
                [uid, user, actor, equip, fruit, gems, wish, gift, dice, fight, record] = r,
                t = new Date().getTime(), g = Data.gift, gsum = {}, gshow = {}
            ;

            // Daily reset
            if (user.mDaily < t) {
                const 
                    n = Data.day,
                    rngUniform = Emu.rngUniform, 
                    rngShuffle = Emu.rngShuffle
                ;

                // Set update timer
                user.mDaily = t - t % n + n;

                // Quota
                user.mWish = 0; user.mGift = 0;
                user.mShop = Data.scCoin;

                // Fuel
                fight.mFuel = Data.drug.Init; fight.mDrug = Data.drug.Drug;

                // Gift
                {
                    const 
                        grow = g.Grow, data = g.Data,
                        geff = g.Gems, T = {"L": user.mGrade, "": 1},
                        num = {}, p = Object.keys(data)
                    ;
                    
                    for (const k in Emu.EmuGemKind) {
                        const n = gems[k] ?? 0;
                        T[k] = n / (n + (geff[k] ?? 0) + 1);
                    }

                    rngShuffle(p);
                    data.forEach((k, i) => {
                        const r = rngUniform() * 5 + 1;
                        if (!(k in num)) {
                            const gk = grow[k];
                            let n = 0;
                            for (const m in gk) { n += gk[m] * (T[m] ?? 0); }
                            num[k] = n;
                        }
                        const v = num[k] * r;
                        gsum[k] = (gsum[k] ?? 0) + v;
                        gift[p[i]] = {
                            n: 0, k: k, v: v,
                            r: Math.floor(r)
                        };
                    });
                }

                // Update database
                Dbs.db1Set(Dbs.pUser, uid, user.bson());
                Dbs.db1Set(Dbs.pFight, uid, fight.bson());
                Dbs.db2Set(Dbs.pGift, uid, gift);
            }
            else {
                for (const i in g.Data) {
                    const t = gift[i];
                    gsum[t.k] = (gsum[t.k] ?? 0) + t.v;
                    if (t.n) { gshow[i] = t; }
                }
            }

            return {
                // Header
                [$CoSysPage]: ["index"],
                [$CoSysUsr]: [user.json()],
                [$CoSysGem]: [gems],

                [$CoPkFight]: [fight.json()],
                [$CoPkCost]: [Data.drug.Cost],
                [$CoPkData]: [Data.rank, Data.trail],

                [$CoEquipFight]: [fight.mFight],
                [$CoEquipAcc]: [actor.json()],
                [$CoEquipEcc]: [equip.set().json()],
                [$CoEquipFcc]: [fruit.json()],
                [$CoEquipData]: [Emu.ActorStats, Emu.EmuEquipStats, Data.ecLmt, Data.fcLmt, Emu.LvlBase],
                [$CoEquipCost]: [
                    Data.acSpw.map(d => d.Cost),
                    Data.ecCrf.map(d => d.Cost),
                    Data.gcMine.map(d => d.Cost),
                    [Data.acExp, Data.acElt],
                    [Data.fcFrg.Cost, Data.fcFrg.Mul, Data.fcFrg.Cap]
                ],
                
                [$CoWishSet]: [wish.json(), 0],
                [$CoWishMax]: [Data.wpDrop.Kind, Data.wpDrop.Cap],
                [$CoWishCost]: [Data.wpDrop.Cost],

                [$CoGiftData]: [gsum, gshow],
                [$CoGiftCost]: [g.Cost],

                [$CoShopSet]: [Data.scItem, Data.scBack, Data.num],

                // Record & Change log
                [$CoIndexSet]: [record.json()]
            };
        },

        // signin
        signin = async (k, p) => 
            Dbs.idGet(k, p)
            .then(u => {
                if (!u) { throw `[Warning] Failed login attempt ${k}:${p}.`;}
                return u;
            })
        ,

        // sinup
        signup = async (k, p) => Dbs.idNew(
            Emu.rngBigInt(), Emu.rngBigInt(), k, p, ""
        ),

        // Operation table
        opUser = {
            /* Id */
            [$SoIdOut]: idOut,
            [$SoIdName]: idName,
            [$SoIdPass]: idPass,

            /* PK */
            [$SoPkPvP]: pkPvP, 
            [$SoPkPvE]: pkPvE, 
            [$SoPkPvB]: pkPvB, 
            [$SoPkGain]: pkGain, 
            [$SoPkDrug]: pkDrug,

            /* Actor Card*/
            [$SoAcFgt]: acFgt, 
            [$SoAcSet]: acSet, 
            [$SoAcExp]: acExp,
            [$SoAcElt]: acElt,
            [$SoAcBrk]: acBrk, 
            [$SoAcSpw]: acSpw,

            /* Equip Card */
            [$SoEcBrk]: ecBrk, 
            [$SoEcCrf]: ecCrf, 
            [$SoEcSml]: ecSml,
            
            /* Fruit Card */
            [$SoFcBrk]: fcBrk, 
            [$SoFcFrg]: fcFrg, 

            /* Gems */
            [$SoGcMine]: gcMine, 
            
            /* Wish Pool */
            [$SoWpDrop]: wpDrop,
            
            /* Gift Pool*/
            [$SoGpFlip]: gpFlip,

            /* Shop Center */
            [$SoScBack]: scBack, 
            [$SoScItem]: scItem, 
            [$SoScCoin]: scCoin
        },
        opRoot = {
            /* Base class */
            ...opUser,

            /* Report */
            [$SoRpLoad]: rpLoad, 
            [$SoRpSave]: rpSave,

            /* GM */
            [$SoGmArena]: gmArena,
            [$SoGmUnit]: gmUnit,
            [$SoGmActor]: gmActor,
            [$SoGmEquip]: gmEquip,
            [$SoGmBattle]: gmBattle,
            [$SoGmRoll]: gmRoll,
            [$SoGmVipSet]: gmVipSet,
            [$SoGmRankSet]: gmRankSet,
            [$SoGmProgSet]: gmProgSet,
            [$SoGmFuelSet]: gmFuelSet,

            /* PK */
            [$SoPkPvP]: pkPvPEx,
            [$SoPkPvE]: pkPvEEx, 
            [$SoPkPvB]: pkPvBEx, 
            [$SoPkGain]: pkGainEx, 
            [$SoPkDrug]: pkDrugEx
        },
        opt = {
            "": {__proto__: opUser},
            "user": {__proto__: opUser},
            "root": {__proto__: opRoot}
        },

        // Server connection callback
        jpt = { i: signin, u: signup },   // Connection type
        wsc = {}                            // User client table

    ;

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Initialization *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    {
        const P = Wsc.prototype;

        P.vt = {__proto__: opRoot};

        P.ct = function (t, k, p) {
            const _ = this;
            return jpt[t](k, p)
                .then(u => {
                    const uid = u._id, s = wsc[uid];
                    if (s) { s.terminate(); }
                    _.vt = opt[u.G] ?? opUser;
                    wsc[_.id = uid] = _;
                    return Promise.all([
                        Dbs.lock(uid),
                        Dbs.db1Get(Dbs.pUser, uid).then(dbUser),
                        Dbs.db2Get(Dbs.pActor, uid, gActorAll).then(dbActorVec),
                        Dbs.db2Get(Dbs.pEquip, uid, gEquipAll).then(dbEquipVec),
                        Dbs.db2Get(Dbs.pFruit, uid, gFruitAll).then(dbFruitVec),
                        Dbs.db1Get(Dbs.pGems, uid),
                        Dbs.db1Get(Dbs.pWish, uid).then(dbWish),
                        Dbs.db2Get(Dbs.pGift, uid, Object.keys(Data.gift.Data)).then(dbGift),
                        Dbs.db1Get(Dbs.pDice, uid).then(dbDice),
                        Dbs.db1Get(Dbs.pFight, uid).then(dbFight),
                        Dbs.db1Get(Dbs.pRecord, uid).then(dbRecord),
                    ]);
                })
                .then(setup)
                .then(_.cb.bind(_))
                .then(() => Dbs.unlock(_.id))
                .catch(e => {
                    console.trace(e);
                    _.dt();
                })
            ;
        };

        P.dt = function () {
            this.cb({[$CoSysPage]: ["login"], [$CoSysReset]: []});
            this.close();
            delete wsc[this.id];
        };

        P.cb = async function (T) {
            return T && this.send(this.enc(T));
        };

        P.op = async function (T) {
            const P = this.vt, Z = this.cb.bind(this);

            for (const k in T) {
                // In case other task is runing, reject.
                if (this.k) {
                    await Z({[$CoError]: [k, $CbRejected]});
                    continue;
                }

                // Otherwise process the operation
                this.k = k;
                await P[k](this, ...T[k])
                    .catch(e => {
                        console.log(`[Warning] Exception occurs when during handling request from ${this.id}:`);
                        console.trace(e);
                        return {[$CoError]: [k, $CbRejected]};
                    })
                    .then(Z)
                ; 

                // Release lock
                this.k = null;
            }
        };

        P.onclose = function (e) {
            console.log(`[Info] Client ${this.id} disconnected:\n${e}\n`);
            this.dt();
        };

        P.onerror = function (e) {
            console.trace(`[Error] Client ${this.id} error:\n${e}\n`);
            this.dt();
        };

        P.onmessage = function (m) {
            try {
                this.op(this.dec(m));
            }
            catch (e) {
                console.trace(`[Warning] Recieved invalid payload from client ${this.id}:\n${m}\n\nError:\n${e}\n`);
            }
        };
    }

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Exports *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // this.__proto__ = {};
    
};

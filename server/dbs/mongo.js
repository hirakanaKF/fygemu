/*
Project: fygemu
Authors: hirakana@kf
*/

const mdb = require("mongodb");

// Setup database layer
exports.constructor = function (Data) {

    let pRoot, pDb, pIdent, pUser, pActor, pEquip, pFruit, pGems, pWish, pGift, pDice, pFight, pRecord, pLock;

    const 
        bson = mdb.BSON,
        idMap = x => x,
        u32Db = x => new mdb.Int32(x),
        u32DbA = x => x.map(u32Db),
        u32Jo = x => x & 0xffffffff,
        u32JoA = x => x.map(u32Jo),
        u64Db = x => new mdb.Long(x),
        u64DbA = x => x.map(u64Db),
        u64Jo = x => BigInt(x) & 0xffffffffffffffffn,
        u64JoA = x => x.map(u64Jo),
        f64Db = x => new mdb.Double(x),
        f64DbA = x => x.map(f64Db),
        strJo = x => ""+x,
        strJoA = x => x.map(strJo),
        iidsub = r => r.insertedId,
        idVec = a => {
            const r = {};
            for (const e of a) {
                const {_id, ...d} = e, t = _id.id; // Access to underlying buffer of the ObjectId
                r[t[10] << 8 | t[11]] = d;
            }
            return r;
        },
        id2 = (i, x) => {
            const z = new mdb.ObjectId(i), p = z.id;
            p[10] = x >> 0x8; p[11] = x & 0xff;
            return z;
        },
        mdbValUpd = x => x.value,
        mdbOptGet = {projection: {_id: 0}},
        mdbOptUpd = {returnDocument: "after", upsert: !0, projection: {_id: 0}},
        mdbOptSet = {returnDocument: "after", projection: {_id: 0}}
    ;

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Exports *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------

    this.__proto__ = {

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Types *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        
        // Database
        DB: {
            _id: idMap,
            obj: x => x.bson ? x.bson() : x,
            u32: u32Db,
            u64: u64Db,
            f32: f64Db, // MongoDB driver does not support float type.
            f64: f64Db,
            u32a: u32DbA,
            u64a: u64DbA,
            f64a: f64DbA,
            f64d: x => Object.entries(x).map(a => [a[0], f64Db(a[1])]),
            f64e: x => x.map(a => [a[0], f64Db(a[1])]),
            str: idMap,
            stra: idMap,
            date: idMap 
        },

        // JSON
        JS: {
            _id: idMap,
            obj: x => x.json ? x.json() : x,
            u32: strJo,
            u64: strJo,
            f32: idMap,
            f64: idMap,
            u32a: strJoA,
            u64a: strJoA,
            f64a: idMap,
            f64d: Object.entries,
            f64e: x => x.map(a => [a[0], a[1]]),
            str: idMap,
            stra: idMap,
            date: x => x.getTime()
        },

        // Javascript Object
        JO: {
            _id: idMap,
            obj: idMap,
            u32: u32Jo,
            u64: u64Jo,
            f32: idMap,
            f64: idMap,
            u32a: u32JoA,
            u64a: u64JoA,
            f64a: idMap,
            f64d: Object.fromEntries,
            f64e: idMap,
            str: idMap,
            stra: idMap,
            date: x => new Date(x)
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Initialization *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        
        from: async (d) => {
            console.log("[Error] Dbs.from cannot be used on real server");
        },

        json: async () => {
            console.log("[Error] Dbs.json cannot be used on real server");
        },
        
        bson: async () => {
            console.log("[Error] Dbs.bson cannot be used on real server");
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Lock *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // 
        lock: async (i) => pLock.insertOne({_id: i}).then(iidsub),
        unlock: async (i) => pLock.deleteOne({_id: i}),

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Ident *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // 
        _idEqu: (i0, i1) => i0.toString() == i1.toString(),
        _idKey: i => i.toString(),

        idGet: async (k, p) => {
            const u = await pIdent.findOne({N: k, P: p});
            return u && bson.serialize(u);
        },

        idNew: async (A, N, P, G) => {
            const u = {
                _id: new mdb.ObjectId(Buffer.concat([A, Buffer.alloc(2, 0)])),
                N, P, G
            };
            return pIdent.insertOne(u)
                .then(r => r.acknowledged ? bson.serialize(u) : null)
            ;
        },

        usrGet: async (p, ac, ec, fc, gc) => {
            const u = bson.deserialize(p), i = u._id;
            return Promise.all([
                u,
                pUser.findOne({_id: i}, mdbOptGet),
                pActor.find({_id: {$in: ac.map(id2.bind(null, i))}}).toArray().then(idVec),
                pEquip.find({_id: {$in: ec.map(id2.bind(null, i))}}).toArray().then(idVec),
                pFruit.find({_id: {$in: fc.map(id2.bind(null, i))}}).toArray().then(idVec),
                pGems.findOne({_id: i}, mdbOptGet),
                pWish.findOne({_id: i}, mdbOptGet),
                pGift.find({_id: {$in: gc.map(id2.bind(null, i))}}).toArray().then(idVec),
                pDice.findOne({_id: i}, mdbOptGet),
                pFight.findOne({_id: i}, mdbOptGet),
                pRecord.findOne({_id: i}, mdbOptGet)
            ])
            .catch(e => null)
        },
        usrNew: async (p, user, gems, wish, dice, fight, record) => {
            const u = bson.deserialize(p), i = u._id;
            return Promise.all([
                u,
                pUser.findOneAndUpdate({_id: i}, {$set: {...user, name: u.N}}, mdbOptUpd).then(mdbValUpd),
                [],
                [],
                [],
                pGems.findOneAndUpdate({_id: i}, {$set: gems}, mdbOptUpd).then(mdbValUpd),
                pWish.findOneAndUpdate({_id: i}, {$set: wish}, mdbOptUpd).then(mdbValUpd),
                pGift.findOneAndUpdate({_id: i}, {$set: {}}, mdbOptUpd).then(mdbValUpd),
                pDice.findOneAndUpdate({_id: i}, {$set: dice}, mdbOptUpd).then(mdbValUpd),
                pFight.findOneAndUpdate({_id: i}, {$set: fight}, mdbOptUpd).then(mdbValUpd),
                pRecord.findOneAndUpdate({_id: i}, {$set: record}, mdbOptUpd).then(mdbValUpd)
            ])
            .catch(e => null)
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * DB1 *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // _id = uid
        // Shared for Wish, Record, Dice, Item
        // 
        db1Get: async (p, i) => p.findOne({_id: i}, mdbOptGet),
        db1Set: async (p, i, d) => p.findOneAndUpdate({_id: i}, {$set: d}, mdbOptUpd).then(mdbValUpd),
        db1Rng: async (p, k, v, n) => p.aggregate([
            { $match: {[k]: v} },
            { $sample: {size: n} }
        ]).toArray(),  // This require 4.2+
        db1Inc: async (p, i, d, m) => {
            const c = {};
            for (const k in d) { c[k] = d[k] * m; }
            return p.findOneAndUpdate(
                    {_id: i},
                    {$inc: c},
                    mdbOptSet
                )
                .then(mdbValUpd)
            ;
        },
        db1IncEx: async (p, i, d, m, l) => {
            const c = {};
            for (const k in d) { c[k] = {$min: [{$add: ["$"+k, d[k] * m]}, l[k] ?? 0]}; }
            return p.findOneAndUpdate(
                    {_id: i},
                    [{$set: c}],
                    mdbOptSet
                )
                .then(mdbValUpd)
            ;
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * DB2 *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        //  - _id = uid + idx
        // Shared for Actor, Equip, Fruit, Gift
        // 
        db2Get: async (p, i, a) => 
            p.find({_id: {$in: a.map(id2.bind(null, i))}}).toArray()
            .then(r => r.length ? idVec(r) : null)
        ,
        db2Set: async (p, i, d) => {
            const q = [];
            for (const k in d) {
                const v = d[k];
                q.push({updateOne: {
                    filter: {_id: id2(i, k)},
                    update: {$set: v},
                    upsert: !0
                }});
            }
            return p.bulkWrite(q, mdbOptUpd).then(r => r.ok);
        },
        db2Del: async (p, i, a) => p.deleteMany(
            {_id: {$in: a.map(id2.bind(null, i))}}
        ).then(r => r.acknowledged),
        db2Pop: async (p, i, a) => {
            const A = a.map(id2.bind(null, i));

            const r = await p.find({_id: {$in: A}}).toArray();
            if (!r.length) { return; }

            const s = await p.deleteMany({_id: {$in: A}});
            return s.acknowledged ? idVec(r) : {};
        },

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Fight *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // 
        //
        ftFuel: async (i, r) => pFight.findOneAndUpdate(
            {_id: i, fuel: {$gt: 0}},
            [{
                $set: {
                    // fuel: {$max: [{$add: ["$fuel", -r]}, 0]}
                    fuel: {$add: ["$fuel", -r]}
                }
            }],
            mdbOptSet
        ).then(mdbValUpd),

        ftDrug: async (i, r) => pFight.findOneAndUpdate(
            {_id: i, drug: {$gt: 0}},
            [{
                $set: {
                    fuel: {$add: [{$max: ["$fuel", 0]}, "$drug"]},
                    drug: {$add: ["$drug", -r]}
                }
            }],
            mdbOptSet
        ).then(mdbValUpd),

        ftRank: async (i, r) => pFight.findOneAndUpdate(
            {_id: i},
            [{
                $set: {rank: r, prog: 0}
            }],
            mdbOptSet
        ).then(mdbValUpd),
        
        ftProg: async (i, r) => pFight.findOneAndUpdate(
            {_id: i},
            [{
                $set: {
                    prog: {$max: [{$add: ["$prog", r]}, 0]}
                }
            }],
            mdbOptSet
        ).then(mdbValUpd),

        ftCost: async (i, r, c, m) => pFight.findOneAndUpdate(
            {_id: i, prog: {$gt: 0}, fuel: {$gt: 0}},
            [{
                $set: {
                    fuel: {$add: ["$fuel", -r]},
                    prog: {$max: [{$add: ["$prog", -c]}, 0]}
                }
            }],
            mdbOptSet
        )
        .then(
            x => x.value ? x : pFight.findOneAndUpdate(
                {_id: i, prog: {$lte: 0}, fuel: {$gt: 0}},
                [{
                    $set: {
                        fuel: {$add: ["$fuel", -r]},
                        rank: {$max: [{$add: ["$rank", -1]}, 0]},
                        prog: {$cond: {
                            if: {$gt: ["$rank", 0]},
                            then: m,
                            else: 0
                        }}
                    }
                }],
                mdbOptSet
            )
        )
        .then(mdbValUpd),

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * User *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // 
        //

        // Item cost
        utCost: async (i, d, m) => {
            const p = {_id: i}, c = {};
            for (const k in d) {
                const n = d[k] * m;
                p[k] = {$gte: n}; c[k] = -n;
            }
            return pUser.findOneAndUpdate(
                p,
                {$inc: c},
                mdbOptSet
            )
            .then(mdbValUpd);
        },

        // Item cost
        utCost2: async (i, k, d, m, l) => {
            const p = [], $k = "$"+k, c = {[k]: {$add: [$k, m]}};
            if (l > 0) { p.push({$lte: [$k, l - m]}); }
            for (const l in d) {
                const 
                    n = d[l] * m, $l = "$"+l,
                    expr = {$sum: [n * m, {$multiply: [$k, n + n]}]}
                ;
                p.push({$gte: [$l, expr]}); c[l] = {$subtract: [$l, expr]};
            }
            return pUser.findOneAndUpdate(
                {_id: i, $expr: {$and: p}},
                [{$set: c}],
                mdbOptSet
            )
            .then(mdbValUpd);
        },

        // Item cost
        utCost3: async (i, k, d, m, l) => {
            const p = [], $k = "$"+k, c = {[k]: {$add: [$k, m]}}, m2 = m * m;
            if (l > 0) { p.push({$lte: [$k, l - m]}); }
            for (const l in d) {
                const 
                    n = d[l] * m, $l = "$"+l,
                    expr = {$sum: [n * m2, {$multiply: [$k, 3 * n * m]}, {$multiply: [$k, $k, 3 * n]}]}
                ;
                p.push({$gte: [$l, expr]}); c[l] = {$subtract: [$l, expr]};
            }
            return pUser.findOneAndUpdate(
                {_id: i, $expr: {$and: p}},
                [{$set: c}],
                mdbOptSet
            )
            .then(mdbValUpd);
        },

        // Item gain
        utGain: async (i, d, m, day) => {
            const 
                c = {}, t = new Date().getTime(),
                pa = (k, n) => {
                    return {$add: [k, n]};
                }, 
                pt = (k, n) => {
                    const l = n * day;
                    return {$max: [{$add: [k, l]}, t + l]};
                }
                j = {svip: pt, bvip: pt}
            ;
            for (const k in d) {
                c[k] = (j[k] ?? pa)("$"+k, d[k] * m);
            }
            return pUser.findOneAndUpdate(
                {_id: i},
                [{$set: c}],
                mdbOptSet
            )
            .then(mdbValUpd);
        },
        
        // Shoping
        utShop: async (i) => pUser.findOneAndUpdate(
            {_id: i, shop: {$gt: 0}},
            [{
                $set: {
                    coin3: {$add: ["$coin3", "$shop"]},
                    shop: 0
                }
            }],
            mdbOptSet
        )
        .then(mdbValUpd)
        ,

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Actor *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // 
        //

        acExp: async (i, j, r, m) => pActor.findOneAndUpdate(
            {_id: id2(i, j)},
            [{
                $set: {
                    exp: {$add: ["$exp", r]},
                    L: {$min: [{$sqrt: {$add: ["$exp", r]}}, m]}
                }
            }],
            mdbOptSet
        )
        .then(mdbValUpd),

        acElt: async (i, j, r) => pActor.findOneAndUpdate(
            {_id: id2(i, j)},
            [{
                $set: {
                    F: {$max: ["$F", r]}
                }
            }],
            mdbOptSet
        )
        .then(mdbValUpd),

        acGrow: async (i, a, r) => pActor.updateMany(
            {_id: {$in: a.map(id2.bind(null, i))}},
            [{
                $set: {
                    G: {$add: ["$G", r]}
                }
            }],
            mdbOptSet
        ),

        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // * Gift *
        // --------------------------------------------------------------------------------------------------------------------------------------------------------
        // 
        //

        gpFlip: async (i, k) => pGift.findOneAndUpdate(
            {_id: id2(i, k), n: {$eq: 0}},
            {$set: {n: 1}},
            mdbOptSet
        )
        .then(mdbValUpd)

    };

    // Connect to mongodb
    mdb.MongoClient.connect(Data.url)
    
    // Initialize database and collections
    .then(db => {
        
        pRoot = db;
        console.log("[Info] Database connected.");
        
        const T = Data.db, P = [];
        pDb = db.db(T[""]);
        this.pIdent = pIdent = pDb.collection(T.ident);
        this.pUser = pUser = pDb.collection(T.user);
        this.pActor = pActor = pDb.collection(T.actor);
        this.pEquip = pEquip = pDb.collection(T.equip);
        this.pFruit = pFruit = pDb.collection(T.fruit);
        this.pGems = pGems = pDb.collection(T.gems);
        this.pWish = pWish = pDb.collection(T.wish);
        this.pGift = pGift = pDb.collection(T.gift);
        this.pDice = pDice = pDb.collection(T.dice);
        this.pFight = pFight = pDb.collection(T.fight);
        this.pRecord = pRecord = pDb.collection(T.record);

        // Create indexs
        pIdent.createIndex({N: 1}, {unique: true});
        pFight.createIndex({rank: 1}, {unique: false});

        // Remove all of previous locks.
        // drop() is way faster than remove().
        P.push(
            pDb.dropCollection(T.lock)
            .then(() => { pLock = pDb.collection(T.lock); })
            .catch(() => { pLock = pDb.collection(T.lock); })
        );

        return Promise.all(P);
    })

    // All done
    .then(() => {
        console.log("[Info] Database initialized.");
    });
    
};

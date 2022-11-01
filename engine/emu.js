/*
Project: fygemu
Authors: hirakana@kf
*/

// Setup
(global.Engine ?? exports).constructor = function (Data, Fmt, Dbs) {

    // SHA3 (a.k.a. Keccak)
    class SHA3 {
        T = new TextEncoder();
        C = new BigUint64Array(5);
        D = new BigUint64Array(5);
        N = new BigUint64Array(25);
        RC = [
            0x1n, 0x8082n, 0x808an, 0x80008000n, 0x808bn,
            0x80000001n, 0x80008081n, 0x8009n, 0x8an, 0x88n,
            0x80008009n, 0x8000000an, 0x8000808bn, 0x8bn, 0x8089n,
            0x8003n, 0x8002n, 0x80n, 0x800an, 0x8000000an,
            0x80008081n, 0x8080n
        ];
        RR = [0n, 1n, 30n, 28n, 27n, 4n, 12n, 6n, 23n, 20n, 3n, 10n, 11n, 25n, 7n, 9n, 13n, 15n, 21n, 8n, 18n, 2n, 29n, 24n, 14n];
        RP = [0n, 10n, 20n, 5n, 15n, 16n, 1n, 11n, 21n, 6n, 7n, 17n, 2n, 12n, 22n, 23n, 8n, 18n, 3n, 13n, 14n, 24n, 9n, 19n, 4n];
        mState = new BigUint64Array(25);

        rol32 = (s, n) => (s << n) | (s >> (32n - n)) & 0xffffffffn;

        calc (s) {
            const
                A = this.T.bsonode(s), n = A.byteLength,
                B = this.mState, C = this.C, D = this.D, N = this.N, RC = this.RC, RR = this.RR, RP = this.RP,
                rol32 = this.rol32, I1 = [1, 2, 3, 4, 0], I2 = [2, 3, 4, 0, 1], I4 = [4, 0, 1, 2, 3]
            ;
            let i, x, y, z;
            for (i = 0; i < n; i += 8) {
                for (x = 0; x < 8; x++) {
                    y = i + x << 2;
                    B[x] ^= BigInt((A[y] || 0) | ((A[y + 1] || 0) << 8) | ((A[y + 2] || 0) << 16) | ((A[y + 3] || 0) << 24)); // Lazy padding
                }
                for (y = 0; y < 22; y++) {
                    for (x = 0; x < 5; x++) {
                        C[x] = B[x] ^ B[x + 5] ^ B[x + 10] ^ B[x + 15] ^ B[x + 20]; 
                    }
                    for (x = 0; x < 5; x++) {
                        D[x] = C[I4[x]] ^ rol32(C[I1[x]], 1n);
                    }
                    for (x = 0; x < 25; x += 5) {
                        for (z = 0; z < 5; z++) {
                            const xz = x + z;
                            N[RP[xz]] = rol32(B[xz] ^ D[z], RR[xz]);
                        }
                    }
                    for (x = 0; x < 5; x++) {
                        for (z = 0; z < 25; z += 5) {
                            B[z + x] = N[z + x] ^ ((~N[z + I1[x]]) & (N[z + I2[x]]));
                        }
                    }
                    B[0] ^= RC[y];
                }
            }

            return this;
        }

        digest () {
            const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", B = this.mState, R = Array(128);
            let i, n = 0;
            for (i = 0; i < 8; i++) {
                const w0 = B[i], w1 = B[i + 8], w2 = B[i + 16];
                R[n++] = A[w0 & 63n]; R[n++] = A[w0 >> 6n & 63n]; R[n++] = A[w0 >> 12n & 63n]; R[n++] = A[w0 >> 18n & 63n]; R[n++] = A[w0 >> 24n & 63n];
                R[n++] = A[w1 & 63n]; R[n++] = A[w1 >> 6n & 63n]; R[n++] = A[w1 >> 12n & 63n]; R[n++] = A[w1 >> 18n & 63n]; R[n++] = A[w1 >> 24n & 63n];
                R[n++] = A[w2 & 63n]; R[n++] = A[w2 >> 6n & 63n]; R[n++] = A[w2 >> 12n & 63n]; R[n++] = A[w2 >> 18n & 63n]; R[n++] = A[w2 >> 24n & 63n];
                R[n++] = A[(w0 >> 30n) | (w1 >> 30n << 2n) | (w2 >> 30n << 4n) & 63n];
            }
            return R.join("");
        }
    }

    // Mersenne-Twister
    class MT {

        mIndex = 0n;

        // Default to MT19937-64
        // Note that 2 ** (n * w) - 1 must be a Mersenne prime
        constructor ({
            w = 64n, n = 312n, m = 156n,
            r = 31n, a = 0xB5026F5AA96619E9n,
            u = 29n, d = 0x5555555555555555n,
            s = 17n, b = 0x71D67FFFEDA60000n,
            t = 37n, c = 0xFFF7EEE000000000n,
            l = 43n, f = 0x5851F42D4C957F2Dn
        }) {
            this.w = w; this.n = n; this.m = m;
            this.r = r; this.a = a;
            this.u = u; this.d = d;
            this.s = s; this.b = b;
            this.t = t; this.c = c;
            this.l = l; this.f = f;
            this.mState = new BigUint64Array(Number(n));
            this.mMskAl = (1n << w) - 1n;
            this.mMskLo = (1n << r) - 1n;
            this.mMskHi = this.mMskAl ^ this.mMskLo;
        }

        // Twist
        twist () {
            const A = this.mState, a = this.a, n = this.n, lo = this.mMskLo, hi = this.mMskHi;
            let i = 0n, j = 1n, m = this.m;
            do {
                const x = (A[i] & hi) | (A[j] & lo), y = x >> 1n;
                A[i] = A[m] ^ (x & 1n ? y ^ a : y);
                if (++m >= n) { m = 0n; }
                if (++j >= n) { j = 0n; }
            } while (++i < n);
            this.mIndex = 0n;
        }

        // Seed
        seed (x = 0n) {
            const A = this.mState, n = this.n, f = this.f, w = this.w - 2n;
            A[n] = x;
            for (let i = 1n; i < n; i++) { A[i] = x = f * ((x ^ (x >> w)) + i); }
            this.twist();
        }

        // Roll
        step () {
            let y = this.mState[this.mIndex];
            y = y ^ ((y >> this.u) & this.d);
            y = y ^ ((y << this.s) & this.b);
            y = y ^ ((y << this.t) & this.c);
            y = y ^ (y >> this.l);
            if (++this.mIndex >= this.n) { this.twist(); }
            return y & this.mMskAl;
        }
    }

    const 
        Rules = Data.Rule,
        ActorStats = Data.ActorStats,
        EmuActorKind = Data.Actors,
        EmuStatusKind = Data.Status,
        EmuEquipKind = Data.Equips,
        EmuEquipStats = Data.EquipStats,
        EmuEquipStatAdd = EmuEquipStats.Add,
        EmuEquipStatMul = EmuEquipStats.Mul,
        EmuEquipRankKind = Data.EquipRanks,
        EmuAuraKind = Data.Auras,
        EmuArt1Kind = Data.Art1,
        EmuArt2Kind = Data.Art2,
        EmuArt3Kind = Data.Art3,
        EmuGemKind = Data.Gem,

        EftBase = Rules.EffectBase,
        LvlBase = Rules.FactorBase,

        NumMin = Rules.UseNumbers ? Number.MIN_VALUE : 1,
        NumMax = Rules.UseNumbers ? Number.MAX_VALUE : Number.MAX_SAFE_INTEGER,
        Mtx22 = [1, 0, 0, 1],
        Mtx33 = [1, 0, 0, 0, 1, 0, 0, 0, 1],
        Rng = new MT({}),

        idSub = x => x,
        numCast = Rules.UseNumbers ? idSub                                  : Math.floor,
        numStat = Rules.UseNumbers ? idSub                                  : x => Math.round(x * 100.0) * 0.01, // TODO: Probably have rounding error to deal with?
        eftMul1 = EftBase ? (x) => -Math.expm1(-x * EftBase)                : (x) => x * 0.01,
        eftMul2 = EftBase ? (l, x) => -l * Math.expm1(-x * EftBase)         : (l, x) => numCast(l * x) * 0.01,
        eftMul3 = EftBase ? (l, x, r) => -l * Math.expm1(-x * EftBase) * r  : (l, x, r) => numCast(l * x) * (0.01 * r),
        eftMadd = EftBase ? (l, x) => l * Math.exp(x * EftBase)             : (l, x) => l * (1 + x * 0.01),
        eftAmul = EftBase ? (l, x) => l * Math.exp(x * EftBase)             : (l, x) => l * ((100 + x) * 0.01),

        lvlPow  = (p => {
            return {
                0.5: Math.sqrt,
                0.3333333333333333: Math.cbrt
            }[p] ?? p != 1 ? x => Math.pow(x, p) : idSub;
        })(Math.exp(LvlBase) ?? 0),

        // Fisher-Yates
        rngShuffle = (A) => {
            let n = BigInt(A.length);
            while (n) {
                const i = Rng.step() % n; n--;
                [A[n], A[i]] = [A[i], A[n]];
            }
            return A;
        },

        // Generate raw BigInt
        rngBigInt = () => Rng.step(),

        // Generate integer number
        rngNumber = (n) => Number(Rng.step() % BigInt(n)),

        // Uniform([0, 1])
        rngUniform = () => Number(Rng.step() & ((1n << 53n) - 1n)) * 1.1102230246251565e-16,

        // Exponential(1)
        rngExp1 = () => -Math.log(1 - rngUniform()),

        // Beta(2, 2)
        // We employ the 2nd ordered statistic of 3 uniform to generate a random variable follows beta(2, 2).
        rngBeta22 = () => {
            const a = rngUniform(), b = rngUniform(), c = rngUniform();
            return (a > b) ? 
                (b > c) ? b : (a > c) ? c : a :
                (a > c) ? a : (b > c) ? c : b ;
        },

        // Beta(1, 3)
        // We employ the 1st ordered statistic of 3 uniform to generate a random variable follows beta(2, 2).
        rngBeta13 = () => {
            const a = rngUniform(), b = rngUniform(), c = rngUniform();
            return (a > b) ? 
                (b > c) ? c : b :
                (a > c) ? c : a ;
        }
    ;

    class ObjBase extends Object {

        constructor () {
            super();

            const T = Dbs.JO, D = this.$;
            for (const k in D) {
                const [t, l, b, c] = D[k];
                this[k] = T[t](c); 
            }
        }

        clr () {
            const T = Dbs.JO, D = this.$;
            for (const k in D) {
                const [t, l, b, c] = D[k];
                if (!(b & 8)) { this[k] = (b & 4) ? this[k].clr() : T[t](c); }
            }
            return this;
        }

        set () { return this; }

        from (d) {
            const T = Dbs.JO, D = this.$;
            for (const k in D) {
                const [t, l, b, c] = D[k], v = T[t](d[l] ?? d[k] ?? c), a = this[k];
                this[k] = b & 4 ? a.from(v) : v ?? a;
            }
            return this;
        }

        json () {
            const T = Dbs.JS, D = this.$, d = {};
            for (const k in D) {
                const [t, l, b, c] = D[k];
                if (b & 2) { d[l] = T[t](this[k]); }
            }
            return d;
        }

        bson () {
            const T = Dbs.DB, D = this.$, d = {};
            for (const k in D) {
                const [t, l, b, c] = D[k];
                if (b & 1) { d[l] = T[t](this[k]); }
            }
            return d;
        }
    }
    Object.defineProperty(
        ObjBase.prototype, "$", {value: {}, writable: false, enumerable: false}
    );

    class ArrBase extends Array {
        
        clr () {
            for (const a of this) { a.clr(); }
            return this;
        }

        set () {
            for (const a of this) { a.set(); }
            return this;
        }

        from (d) {
            for (const k in d) { this[k] = d[k]; }
            return this;
        }

        json () {
            return this.map(t => t && t.json());
        }

        bson () {
            return this.map(t => t && t.bson());
        }
    }
    
    class VecBase extends ObjBase {

        clr () {
            for (const k in this) { this[k].clr(); }
            return this;
        }

        set () {
            for (const k in this) { this[k].set(); }
            return this;
        }
        
        json () {
            const d = {};
            for (const i in this) { d[i] = this[i].json(); }
            return d;
        }

        bson () {
            const d = {};
            for (const i in this) { d[i] = this[i].bson(); }
            return d;
        }
    }

    class SetBase extends Set {

        clr () {
            this.clear();
            return this;
        }

        set () { return this; }

        from (d) {
            this.clear();
            for (const k of d) { this.add(k); }
            return this;
        }

        json () {
            return [...this];
        }

        bson () {
            return [...this];
        }
    }

    class MapBase extends ObjBase {

        json () {
            const R = {};
            for (const k in Object.keys(this)) { R[k] = this[k] && this[k].json(); }
            return R;
        }

        // bson () {}
    }

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Card * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class Card extends ObjBase {
        
        constructor (kind = 0n) {
            super();
            this.mKind = kind;
        }

        set () {
            const [m, a] = (EmuActorKind[""+this.mKind] ?? {}).point ?? [0, 0];
            this.nPoint = numCast(eftMadd(this.mLevel * m + a, this.mTrait));
            return this;
        }
    };
    Object.defineProperty(
        Card.prototype, "$", {value: Fmt.card, writable: false, enumerable: false}
    );

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Equip * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class Equip extends ObjBase {

        set () {
            let Q = this.mAttr;
            const A = EmuEquipKind[this.mKind].stats, L = lvlPow(this.mLevel), N = Q.length - A.length;
            if (N > 0) { Q.splice(0, N); }
            if (N < 0) { Q.splice(Q.length, 0, ...Array(-N).fill(0)); }
            this.mAttr = Q;
            this.mStat = Q.map((q, i) => {
                const [attrKind, attrMul, attrAdd] = A[i];
                // return [attrKind, numCast((attrMul * L * 0.1 + attrAdd * 0.1) * (q * 0.1)) * 0.1]
                return [attrKind, numCast((attrMul * L + attrAdd) * (q * 0.01) * 10) * 0.1]
            })
            return this;
        }
    }
    Object.defineProperty(
        Equip.prototype, "$", {value: Fmt.equip, writable: false, enumerable: false}
    );

    class EquipArr extends ArrBase {
        
        from (d) {
            this.splice(0, this.length, ...d.map(v => v && new Equip().from(v)));
            return this;
        }
    }

    class EquipVec extends VecBase {

        from (d) {
            for (const i in d) { this[i] = new Equip().from(d[i]); }
            return this;
        }
    }

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Fruit * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    
    class Fruit extends ObjBase {}
    Object.defineProperty(
        Fruit.prototype, "$", {value: Fmt.fruit, writable: false, enumerable: false}
    );
    
    class FruitArr extends ArrBase {
        
        from (d) {
            this.splice(0, this.length, ...d.map(v => v && new Fruit().from(v)));
            return this;
        }
    }

    class FruitVec extends VecBase {

        from (d) {
            for (const i in d) { this[i] = new Fruit().from(d[i]); }
            return this;
        }
    }

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Wish * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class Wish extends ObjBase {}
    Object.defineProperty(
        Wish.prototype, "$", {value: Fmt.wish, writable: false, enumerable: false}
    );

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Amulet * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class Amulet extends ObjBase {}
    Object.defineProperty(
        Amulet.prototype, "$", {value: Fmt.amulet, writable: false, enumerable: false}
    );

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Die * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    
    class Dice extends ObjBase {}
    Object.defineProperty(
        Dice.prototype, "$", {value: Fmt.dice, writable: false, enumerable: false}
    );

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Gem * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    
    class Gems extends ObjBase {}
    Object.defineProperty(
        Gems.prototype, "$", {value: Object.fromEntries(Object.keys(EmuGemKind).map(k => [k, ["f64", k, 3, 0]])), writable: false, enumerable: false}
    );

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * User * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class User extends ObjBase {

        set () {
            this.mGrade = Math.sqrt(this.mExp);
            return this;
        }
    }
    Object.defineProperty(
        User.prototype, "$", {value: Fmt.user, writable: false, enumerable: false}
    );

    class Fight extends ObjBase {}
    Object.defineProperty(
        Fight.prototype, "$", {value: Fmt.fight, writable: false, enumerable: false}
    );

    class FightArr extends ArrBase {
        
        from (d) {
            for (const i in d) { this[i] = new Fight().from(r[i] ?? {}); }
            return this;
        }
    }
    
    class Record extends ObjBase {}
    Object.defineProperty(
        Record.prototype, "$", {value: Fmt.record, writable: false, enumerable: false}
    );

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Aura * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class Aura extends SetBase {

        flip (aura) {
            const r = this.has(aura);
            (r) ? this.delete(aura) : this.add(aura);
            return r;
        }
    }

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Unit * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class Unit extends ObjBase {
        
        constructor (user = null, card = null, equip = null, amulet = null, wishs = null, auras = null, dice = null, gems = null, pve = 0) {
            super();
            
            this.mUser = user ?? new User();
            this.mCard = card ?? new Card();
            this.mEquip = equip ?? new EquipArr();
            this.mAmulet = amulet ?? new Amulet();
            this.mWish = wishs ?? new Wish();
            this.mAura = auras ?? new Aura();
            this.mDice = dice ?? new Dice();
            this.mGems = gems ?? new Gems();
            this.nArt1 = new SetBase(); this.nArt2 = new SetBase(); this.nArt3 = new SetBase();
            this.nAura = new SetBase(); this.nMyst = new SetBase();
            this.mIsPVE = pve;
        }

        setCard () {
            const u = this.mUser, c = this.mCard, a = this.mAmulet, l = c.mLevel, q = c.mTrait, C = {};

            c.set();
            this.nLevel = l; this.nActor = c.mKind; this.nTrait = q; this.nSkill = c.mSkill; this.nBuild = c.mBuild; this.nGrowth = c.mGrowth;
            C.str = lvlPow(this.nStr = numCast(c.mStr + a.mStr)); 
            C.agi = lvlPow(this.nAgi = numCast(c.mAgi + a.mAgi));
            C.int = lvlPow(this.nInt = numCast(c.mInt + a.mInt));
            C.vit = lvlPow(this.nVit = numCast(c.mVit + a.mVit));
            C.spr = lvlPow(this.nSpr = numCast(c.mSpr + a.mSpr));
            C.mnd = lvlPow(this.nMnd = numCast(c.mMnd + a.mMnd));
            C.L = lvlPow(this.nGrade = u.mGrade); this.nHandyAtk = lvlPow(u.mAtk); this.nHandyDef = lvlPow(u.mDef);
            C[""] = -1;

            {
                const P1 = {}, P2 = {};
                ActorStats.forEach(R => {
                    const cc = R.cc;
                    for (const r of cc) {
                        let c = 0;
                        for (const k in r) { c += C[k] * r[k]; }
                        if (c < 0) { return; }
                    }
                    const p0 = R.p0, p1 = R.p1, p2 = R.p2;
                    for (const k in p0) { this[k] += p0[k]; }
                    for (const k in p1) {
                        const A = p1[k], M = (P1[k] ??= {});
                        for (const l in A) { M[l] = (M[l] || 0) + A[l];} 
                    }
                    for (const k in p2) {
                        const A = p2[k], M = (P2[k] ??= {});
                        for (const l in A) {
                            const Al = A[l], Ml = (M[l] ??= {});
                            for (const m in Al) { Ml[m] = (Ml[m] || 0) + Al[m]; }
                        }
                    }
                });

                for (const k in P1) {
                    const x = C[k], A = P1[k];
                    for (const l in A) { this[l] += numStat(A[l] * x); }
                }
                for (const k in P2) {
                    const x = C[k], A = P2[k];
                    for (const l in A) {
                        const Al = A[l], x2 = C[l] * x;
                        for (const m in Al) { this[m] += numStat(Al[m] * x2); }
                    }
                }
            }

            {
                const actor = EmuActorKind[""+this.nActor];
                if (!actor) { return; }

                const S = actor.stats, F = actor.flags, L = eftMadd(lvlPow(l), q);
                for (const attr in S ?? {}) {
                    const [m, a] = S[attr];
                    if (attr in this) { this[attr] += numStat(m * L) + a; }
                }
                for (const kind in F ?? {}) {
                    const p = this[kind];
                    for (const k of F[kind]) { p.add(k); }
                }
            }
        }

        pushEquip () {
            const stats = {...this}, equips = this.mEquip;

            equips.forEach((e) => {
                if (!e) { return; }
                e.set();

                const E = EmuEquipKind[""+e.mKind], D = {};
                e.mStat.forEach(T => {
                    const [k, r] = T;
                    D[k] = (D[k] ?? 0) + r;
                })
                for (const k in D) {
                    const r = D[k], M = EmuEquipStatMul[k] ?? {}, A = EmuEquipStatAdd[k] ?? {};

                    for (const k1 in M) {
                        const N = M[k1];

                        for (const k2 in N) {
                            this[k1] += numStat(r * N[k2] * stats[k2]);
                        }
                    }

                    for (const k1 in A) {
                        this[k1] += numStat(r * A[k1]);
                    }
                }

                if (e.mMyst) {
                    const F = E.flags ?? {};
                    for (const k in F) { F[k].forEach(a => this[k].add(a)); }
                }
            });
        }

        setAmulet () {
            const a = this.mAmulet;
            this.nPowRatP = a.mPowP; this.nPowRatM = a.mPowM; this.nPowRatC = a.mPowC; this.nPowRatS = a.mPowS;
            this.nResRatP = a.mResP; this.nResRatM = a.mResM; this.nResRatC = a.mResC; this.nResRatS = a.mResS;
            this.nAtkFixP = a.mAtkP; this.nAtkFixM = a.mAtkM; this.nDefFixP = a.mDefP; this.nDefFixM = a.mDefM; 
            this.nCrtFix = a.mCrt; this.nSklFix = a.mSkl; this.nDodFix = a.mDod; this.nEvaFix = a.mEva;
            this.nSpdRat = a.mSpd; this.nRecRat = a.mRec; this.nHpRat = a.mHp; this.nSdRat = a.mSd; this.nLchFix = a.mLch; this.nRflFix = a.mRfl;
        }

        setAura () {
            const S = this.nAura;
            for (const k of this.mAura) {
                const F = EmuAuraKind[k].flags;
                for (const k in F) { F[k].forEach(a => this[k].add(a)); }
            }
        }

        set () {
            this.clr();
            this.setCard();
            this.pushEquip();
            this.setAmulet();
            this.setAura();
            return this;
        }
    };
    {
        const _ = Fmt.unit;
        for (const k in EmuStatusKind) {
            _["c"+k] = ["f64", "$Num"+k, 3, 0];
            _["b"+k] = ["f64", "$Fix"+k, 3, false];
        }
        Object.defineProperty(
            Unit.prototype, "$", {value: _, writable: false, enumerable: false}
        );
    }

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Fighter Status * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class StatusNull {
        mInt = 0; mNow = 0; mMax = 0; mMin = 0;
        constructor (d) {
            this.mInt = this.mNow = this.mMax = this.mMin = d;
            this.mInc = this.mDec = this.nInc = this.nDec = 0;
        }
        init (d) { ; }
        now () { return this.mInt; }
        inc (d) { ; }
        dec (d) { ; }
        set (d) { ; }
        count () { ; }
        apply () { ; }
        floor (d) { ; }
        ceil (d) { ; }
        setTurn (d) { ; }
        incTurn (d) { ; }
        decTurn (d) { ; }
        setImpl (d) { ; }
        incImpl (d) { ; }
        decImpl (d) { ; }
    }

    class StatusBase extends StatusNull {
        setTurn (d) { this.mNow = d; }
        incTurn (d) { this.mNow += d; }
        decTurn (d) { this.mNow -= d; }
        setImpl (d) { this.mInt = d; this.mNow = d; }
        incImpl (d) { this.mInt += d; this.mNow += d; }
        decImpl (d) { this.mInt -= d; this.mNow -= d; }
        floor (d) { this.mInt = Math.max(this.mInt, d); this.mNow = Math.max(this.mNow, d); }
        ceil (d) { this.mInt = Math.min(this.mInt, d); this.mNow = Math.min(this.mNow, d); }
        apply () { this.mNow = this.mMax = this.mMin = this.mInt; }
    }

    class StatusFlag extends StatusBase {
        mCtr = {};
        set (d) { this.mInt = d; this.mCtr[d] = this.mCtr[d] + 1 || 1; this.mMax++; }
        count () { this.mInt = this.mNow; }
        apply () {
            let n = Math.random() * this.mMax;
            const T = this.mCtr;
            for (const d in T) { if ((n -= T[d]) < 0) { this.mNow = this.mInt = d; break; } }
            this.mCtr = {}; this.mMax = 0;
        }
    }

    class StatusNumber extends StatusBase {
        mInc = 0; mDec = 0; nInc = 0; nDec = 0;
        now () { return this.mNow + this.nInc + this.nDec; }
        inc (d) { this.nInc += d; }
        dec (d) { this.nDec += d; }
        set (d) { 
            d -= this.mNow;
            this.nInc = 0; this.nDec = 0;
            (d < 0) ? this.nDec = d : this.nInc = d;
        }
        count () {
            const i = Math.max(this.mInc, this.nInc), d = Math.max(this.mDec, this.nDec);
            this.mInc = i; this.nInc = 0;
            this.mDec = d; this.nDec = 0;
            this.mMax = this.mNow + i;
            this.mMin = this.mNow - d;
        }
        apply () {
            this.mNow = this.mInt = this.mInt + this.mInc - this.mDec;
            this.mInc = 0; this.mDec = 0;
        }
    }

    const StatusCtor = {
        "": StatusBase,
        "Flag": StatusFlag,
        "Number": StatusNumber
    };

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Battle Engine * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class Fighter {

        constructor (u) {

            const 
                w = u.mWish,
                mPowMulP = u.nPowMulP, mPowAddP = u.nPowAddP + w.mPowP * 5,
                mPowMulM = u.nPowMulM, mPowAddM = u.nPowAddM + w.mPowM * 5,
                mPowMulA = u.nPowMulA, mPowAddA = u.nPowAddA,
                mFlags = new SetBase()
            ;
            
            this.mName = u.mUser.mName; this.mActor = u.nActor; this.mEquip = u.mEquip; this.mAura = u.mAura;
            this.mLevel = u.nLevel; this.mGrowth = u.nGrowth; this.mIsPVE = u.mIsPVE;
            this.mFlags = mFlags;

            this.mStr = u.nStr; this.mAgi = u.nAgi; this.mInt = u.nInt; this.mVit = u.nVit; this.mSpr = u.nSpr; this.mMnd = u.nMnd;
            this.mHpNow = this.mHpFix = this.mHpMax = u.nHpMaxMul + u.nHpMaxAdd + w.mHpMax * 12; this.mHpRat = u.nHpRat;
            this.mSdNow = this.mSdFix = this.mSdMax = u.nSdMaxMul + u.nSdMaxAdd + w.mSdMax * 20; this.mSdRat = u.nSdRat;
            this.mHpHealRat = u.nHpHealRat; this.mHpHealFix = u.nHpHealMul + u.nHpHealAdd;
            this.mSdHealRat = u.nSdHealRat; this.mSdHealFix = u.nSdHealMul + u.nSdHealAdd;
            this.mHpRecRat = this.mSdRecRat = u.nRecRat;
            this.mPowMulP = mPowMulP; this.mPowAddP = mPowAddP; this.mPowRatP = u.nPowRatP; 
            this.mPowMulM = mPowMulM; this.mPowAddM = mPowAddM; this.mPowRatM = u.nPowRatM;
            this.mPowMulA = mPowMulA; this.mPowAddA = mPowAddA; this.mPowRatC = u.nPowRatC; this.mPowRatS = u.nPowRatS; 
            this.mAtkRatP = u.nAtkRatP + u.nAtkFixP; this.mAtkMulP = u.nAtkMulP; this.mAtkAddP = u.nAtkAddP + w.mAtkP; this.mAtkFixP = 0;
            this.mAtkRatM = u.nAtkRatM + u.nAtkFixM; this.mAtkMulM = u.nAtkMulM; this.mAtkAddM = u.nAtkAddM + w.mAtkM; this.mAtkFixM = 0;
            this.mAtkRatC = u.nAtkRatC; this.mAtkMulC = u.nAtkMulC; this.mAtkAddC = u.nAtkAddC; this.mAtkFixC = 0;
            this.mDefRatP = u.nDefRatP + u.nDefFixP; this.mDefMulP = u.nDefMulP; this.mDefAddP = u.nDefAddP + w.mDefP; this.mDefFixP = 0; 
            this.mDefRatM = u.nDefRatM + u.nDefFixM; this.mDefMulM = u.nDefMulM; this.mDefAddM = u.nDefAddM + w.mDefM; this.mDefFixM = 0;
            this.mResP = u.nResMulP + u.nResAddP; this.mResRatP = u.nResRatP;
            this.mResM = u.nResMulM + u.nResAddM; this.mResRatM = u.nResRatM;
            this.mResRatC = u.nResRatC; this.mResRatS = u.nResRatS;
            this.mSpd = u.nSpdMul + u.nSpdAdd + w.mSpd; this.mSpdRat = u.nSpdRat;
            
            this.mSklRat = u.nSklRat + u.nSklFix; this.mSklMul = u.nSklMul; this.mSklAdd = u.nSklAdd; 
            this.mCrtRat = u.nCrtRat + u.nCrtFix; this.mCrtMul = u.nCrtMul; this.mCrtAdd = u.nCrtAdd;
            this.mEvaRat = u.nEvaRat + u.nEvaFix; this.mEvaMul = u.nEvaMul; this.mEvaAdd = u.nEvaAdd;
            this.mDodRat = u.nDodRat + u.nDodFix; this.mDodMul = u.nDodMul; this.mDodAdd = u.nDodAdd;
            this.mLchRat = u.nLchRat + u.nLchFix; this.mRflRat = u.nRflRat + u.nRflFix;
            
            // Wish
            this.mHpPot = w.mHpPot; this.mSdPot = w.mSdPot;
            this.mAura101 = w.mAura101; this.mAura102 = w.mAura102; this.mAura103 = w.mAura103;

            // Handicap
            this.nHandyAtk = u.nHandyAtk; this.nHandyDef = u.nHandyDef;

            // Special attributes
            this.mLifeMax = this.mHpMax + this.mSdMax;
            this.mPowP = this.mPowM = this.mPowA = this.mPowPM = this.mSpdNow = 0;
            this.mTurn = this.mWait = 0;
            this.nHpMin = this.nSdMin = -Infinity;
            this.mDpr = 1.0; this.mDps = 1.0;
            this.mHhr = 1.0; this.mShr = 1.0;

            // State 
            this.nPowP = this.nPowM = this.nPowA = this.nDmgH = this.nDmgS = this.nRecH = this.nRecS = 
            this.nDecH = this.nDecS = this.nDmgHP = this.nDmgHM = this.nDmgHA = this.nDmgSP = this.nDmgSM = this.nDmgSA = this.nResHP = this.nResHM = this.nResSP = this.nResSM = 0;
            this.nVecH = this.nVecS = [];
            this.nIsAct = !1;

            // Processes
            this[$StIpMulN] = []; this[$StIpAddN] = [];
            this[$StApSetL] = []; this[$StApSetR] = [];
            this[$StBpAtkL] = []; this[$StBpAtkR] = [];
            this[$StBpCrtL] = []; this[$StBpCrtR] = [];
            this[$StBpSklL] = []; this[$StBpSklR] = [];
            this[$StBpDefL] = []; this[$StBpDefR] = [];
            this[$StBpPowL] = []; this[$StBpPowR] = [];
            this[$StBpDmgL] = []; this[$StBpDmgR] = [];
            this[$StDpSetL] = []; this[$StDpSetR] = [];
            this[$StEpSetL] = []; this[$StEpSetR] = [];

            // Temporaries (power)
            this.pp = this.pm = this.pa =
            // Temporaries (resist)
            this.rp = this.rm = 
            // Temporaries (flags)
            this.crt = this.skl =
            // Temporaries (attack)
            this.arp = this.afp = this.arm = this.afm = this.arc = this.arp = 
            // Temporaries (defend)
            this.brp = this.bfp = this.brm = this.bfp = 0;
            // Temporaries (ratio)
            this.hpr = this.hmr = this.spr = this.smr = 1;
            // Algorithm
            this.mDefFull = 0.75;
            this.mSdDmgP = 1.5; this.mSdDmgM = 1.0;
            this.mCrtScl = 1.0; this.mCrtDiv = 1.0; this.mSklScl = 1.0; this.mSklDiv = 1.0;
            this.mRflMtL = Array.from(Mtx33); this.mRflMtR = Array.from(Mtx33);
            this.mLchMtL = Array.from(Mtx22); this.mLchMtR = Array.from(Mtx22);

            // Flags
            {
                const {Art1, Art2, Art3, Aura, Myst} = this.Eft;
                for (const k of u.nArt1) { mFlags.add(Art1[k]); }
                for (const k of u.nArt2) { mFlags.add(Art2[k]); }
                for (const k of u.nArt3) { mFlags.add(Art3[k]); }
                for (const k of u.nAura) { mFlags.add(Aura[k]); }
                for (const k of u.nMyst) { mFlags.add(Myst[k]); }
            }
            
            // Status
            for (const k in EmuStatusKind) {
                this[k] = new ((u["b"+k]) ? StatusNull : StatusCtor[EmuStatusKind[k].kind])(u["c"+k] || 0);
            }

            // Random State
            this.mRng = new MT({});
            this.mRng.seed(Rng.step());

            // Response
            this.nMsg = [];
            this.nDbg = [];
        }

        dtor () {
            ;
        }

        // Reset all status
        reset () {
            // Health / Shield
            const
                h = numCast(eftMadd(this.mHpFix, this.mHpRat)),
                s = numCast(eftMadd(this.mSdFix, this.mSdRat)),
                pp = this.mPowMulP + this.mPowAddP,
                pm = this.mPowMulM + this.mPowAddM,
                pa = this.mPowMulA + this.mPowAddA
            ;
            this.mHpNow = this.mHpMax = h;
            this.mSdNow = this.mSdMax = s;
            this.mLifeMax = h + s;
            this.mPowP = pp; this.mPowM = pm; this.mPowA = pa;
            this.mPowPM = pp + pm;

            // Status
            this.HpMax.setImpl(h); this.SdMax.setImpl(s);
            this.PowFixP.setImpl(pp); this.PowFixM.setImpl(pm); this.PowFixA.setImpl(pa);
            this.HpRecRat.setImpl(this.mHpRecRat);
            this.SdRecRat.setImpl(this.mSdRecRat);
            this.PowRatP.setImpl(this.mPowRatP);
            this.PowRatM.setImpl(this.mPowRatM);
            this.PowRatC.setImpl(this.mPowRatC);
            this.PowRatS.setImpl(this.mPowRatS);
            this.ResRatP.setImpl(this.mResRatP);
            this.ResRatM.setImpl(this.mResRatM);
            this.ResRatC.setImpl(this.mResRatC);
            this.ResRatS.setImpl(this.mResRatS);
            this.AtkRatP.setImpl(this.mAtkRatP);
            this.AtkRatM.setImpl(this.mAtkRatM);
            this.AtkRatC.setImpl(this.mAtkRatC);
            this.AtkFixP.setImpl(this.mAtkFixP);
            this.AtkFixM.setImpl(this.mAtkFixM);
            this.AtkFixC.setImpl(this.mAtkFixC);
            this.DefRatP.setImpl(this.mDefRatP);
            this.DefRatM.setImpl(this.mDefRatM);
            this.DefFixP.setImpl(this.mDefFixP);
            this.DefFixM.setImpl(this.mDefFixM);
            this.SpdRat.setImpl(this.mSpdRat);
            this.SklRat.setImpl(this.mSklRat);
            this.CrtRat.setImpl(this.mCrtRat);
            this.EvaRat.setImpl(this.mEvaRat);
            this.DodRat.setImpl(this.mDodRat);
            this.LchRat.setImpl(this.mLchRat);
            this.RflRat.setImpl(this.mRflRat);
        }

        // Critical
        isC (that) {
            if (this.NoCrt.now() > 0) { return this.crt = 0; }

            const 
                l = this.mCrtMul + this.mCrtAdd,
                m = l - (l + that.mDodMul + that.mDodAdd) * this.mCrtScl,
                n = ((m > 0) ? 100 * m / (this.mCrtDiv + m) : 0) + this.CrtRat.now() - that.DodRat.now(),
                p = this.rndUni(n)
            ;
            return this.crt |= p;
        }

        // Skill activation
        isS (that) {
            if (this.NoSkl.now() > 0) { return this.skl = 0; }

            const 
                l = this.mSklMul + this.mSklAdd,
                m = l - (l + that.mEvaMul + that.mEvaAdd) * this.mSklScl,
                n = ((m > 0) ? 100 * m / (this.mSklDiv + m) : 0) + this.SklRat.now() - that.EvaRat.now(),
                p = this.rndUni(n)
            ;
            return this.skl |= p;
        }

        // Tick timer
        tick () {
            return this.mSpdNow += Math.max(numCast(eftMadd(this.mSpd, this.SpdRat.now())), NumMin);
        }

        // Clear temporaries
        flush () {
            this.uiClear();
            
            this.nPowP = this.nPowM = this.nPowA = this.nDmgH = this.nDmgS = this.nRecH = this.nRecS = 
            this.nDmgHP = this.nDmgHM = this.nDmgHA = this.nDmgSP = this.nDmgSM = this.nDmgSA = this.nResHP = this.nResHM = this.nResSP = this.nResSM = 0;
            this.nIsAct = !1;
        }

        apSetN () {

            // Recover
            this.nRecH = (((eftMul2(this.mHpMax, this.mHpHealRat) || 0)) + this.mHpHealFix) * this.mHhr * this.mDps;
            this.nRecS = (((eftMul2(this.mSdMax, this.mSdHealRat) || 0)) + this.mSdHealFix) * this.mShr * this.mDps;

            // Clear damage component
            this.nVecH.fill(0); this.nVecS.fill(0);
            
            // Status Locks
            this.NoCrt.decImpl(1); this.NoSkl.decImpl(1); this.NoRec.decImpl(1);
            this.NoCrt.floor(0); this.NoSkl.floor(0); this.NoRec.floor(0);
        }

        // Action
        apSetL () {
            this.apSetN();
            this.nIsAct = !0;
        }

        // Action
        apSetR () {
            this.apSetN();
            
            // Potion
            if (this.mHpPot && this.mHpMax * 0.8 > this.mHpNow) {
                this.nRecH += this.mHpMax * this.mHpPot * 0.005;
                this.mHpPot = 0;
                this.uiAddHpPot();
            }
            if (this.mSdPot && this.mSdMax * 0.8 > this.mSdNow) {
                this.nRecS += this.mSdMax * this.mSdPot * 0.005;
                this.mSdPot = 0;
                this.uiAddSdPot();
            }
        }

        // Battle
        bpSet () {
            this.pp = 0; this.pm = 0; this.pa = 0; this.rp = this.mResP; this.rm = this.mResM;
            this.arp = this.AtkRatP.now(); this.afp = this.AtkFixP.now(); this.arm = this.AtkRatM.now(); this.afm = this.AtkFixM.now(); 
            this.brp = this.DefRatP.now(); this.bfp = this.DefFixP.now(); this.brm = this.DefRatM.now(); this.bfm = this.DefFixM.now(); 
            this.arc = this.AtkRatC.now(), this.afc = this.AtkFixC.now();
            this.crt = 0; this.skl = 0;
        }

        // Attack
        bpAtk (that) {
            this.pp = this.mPowP; this.pm = this.mPowM; this.pa = this.mPowA;
        }

        // Critical
        bpCrt (that) {
            this.pp += this.pp;
            this.pm = numCast(this.pm * 1.5);
            this.pa += this.pa;
            this.arp += this.arc; this.afp += this.afc;
            this.arm += this.arc; this.afm += this.afc;
            this.uiAddAct("Crt");
        }

        // Defend
        bpDef (that) {
            const r = Math.min(this.RflRat.now(), 150);
            if (r > 0) {
                const ml = that.mRflMtL, mr = this.mRflMtR, pp = that.pp, pm = that.pm, pa = that.pa;
                this.pp += eftMul2(pp * ml[0] * mr[0] + pm * ml[1] * mr[1] + pa * ml[2] * mr[2], r);
                this.pm += eftMul2(pp * ml[3] * mr[3] + pm * ml[4] * mr[4] + pa * ml[5] * mr[5], r);
                this.pa += eftMul2(pp * ml[6] * mr[6] + pm * ml[7] * mr[7] + pa * ml[8] * mr[8], r);
                this.uiAddAct("Rfl");
            }
        }

        // Damage multiplier
        bpScl (that) {
            const
                rp = this.PowRatP.now() - that.ResRatP.now(),
                rm = this.PowRatM.now() - that.ResRatM.now()
            ;
            if (rp) { this.pp = numCast(eftMadd(this.pp, rp) || 0); }
            if (rm) { this.pm = numCast(eftMadd(this.pm, rm) || 0); }
        }

        // Display power
        bpPow (that) {

            // Critical
            if (this.crt) {
                const r = this.PowRatC.now() - that.ResRatC.now();
                this.pp = numCast(eftMadd(this.pp, r) || 0);
                this.pm = numCast(eftMadd(this.pm, r) || 0);
                this.pa = numCast(eftMadd(this.pa, r) || 0);
            }

            // Skill
            if (this.skl) {
                const r = this.PowRatS.now() - that.ResRatS.now();
                this.pp = numCast(eftMadd(this.pp, r) || 0);
                this.pm = numCast(eftMadd(this.pm, r) || 0);
                this.pa = numCast(eftMadd(this.pa, r) || 0);
            }

            // Handicap
            if (!this.mIsPVE) {
                const 
                    ha = (this.nHandyAtk - that.nHandyAtk) * 3, 
                    hd = (this.nHandyDef - that.nHandyDef) * 3
                ;
                if (ha > 0) {
                    this.pp = numCast(eftMadd(this.pp, ha) || 0);
                    this.pm = numCast(eftMadd(this.pm, ha) || 0);
                    this.pa = numCast(eftMadd(this.pa, ha) || 0);
                }
                if (hd < 0) {
                    this.pp = numCast(eftMadd(this.pp, hd) || 0);
                    this.pm = numCast(eftMadd(this.pm, hd) || 0);
                    this.pa = numCast(eftMadd(this.pa, hd) || 0);
                }
            }

            // Team multiplier
            this.nPowP += this.pp * this.mDps;
            this.nPowM += this.pm * this.mDps;
            this.nPowA += this.pa * this.mDps;
        }

        // Defense ratio calculation
        bpDmg (that) {
            let hpr, hmr, spr, smr;

            hpr = numCast((
                numCast(eftAmul(this.bfp, this.brp - that.arp || 0)) - that.afp || 0
            ) * 0.1);
            hmr = numCast((
                numCast(eftAmul(this.bfm, this.brm - that.arm || 0)) - that.afm || 0
            ) * 0.1);

            hpr = Math.min(hpr * 0.01, this.mDefFull);
            hmr = Math.min(hmr * 0.01, this.mDefFull);
            spr = hpr * 0.5;
            smr = hmr * 0.5;

            this.hpr = (hpr < 0) ? 1.3 : 1 - hpr;
            this.hmr = (hmr < 0) ? 1.3 : 1 - hmr;
            this.spr = (spr < 0) ? 1.3 : 1 - spr;
            this.smr = (smr < 0) ? 1.3 : 1 - smr;
        }

        // Summarize damage
        bpEnd (that) {
            const 
                hp = that.pp * this.hpr * this.mDps || 0, 
                hm = that.pm * this.hmr * this.mDps || 0,
                ha = that.pa * this.mDps || 0,
                sp = that.pp * this.mSdDmgP * this.spr * this.mDps || 0,
                sm = that.pm * this.mSdDmgM * this.smr * this.mDps || 0,
                sa = that.pa * this.mDps || 0,
                rp = this.rp * this.mDps || 0,
                rm = this.rm * this.mDps || 0,
                ht = Math.max(hp - rp, 0) + Math.max(hm - rm, 0) + ha,
                st = Math.max(sp - rp, 0) + Math.max(sm - rm, 0) + sa
            ;
            this.nDmgHP += hp; this.nDmgHM += hm; this.nDmgHA += ha;
            this.nDmgSP += sp; this.nDmgSM += sm; this.nDmgSA += sa;
            this.nResHP += rp; this.nResHM += rm;
            this.nResSP += rp; this.nResSM += rm;
            this.nVecH[that.I] += ht; this.nVecS[that.I] += st;
            this.nDecH += ht; this.nDecS += st;
        }

        // Collect and estimate total damage
        cpSet () {
            let h = 0, s = this.mSdNow;

            // Infinite shield
            if (s > NumMax) {
                const s = Math.max(this.nDmgSM - this.nResSM, 0) + Math.max(this.nDmgSP - this.nResSM, 0) + this.nDmgSA;
                this.nDecH = 0; 
                this.nDecS = (s >= this.nDecS) ? 1 : s / this.nDecS || 0;
                return;
            }

            // Magical damage
            {
                let hd = this.nDmgHM;
                if (s > 0) {
                    let sd = this.nDmgSM - this.nResSM;
                    if (sd <= 0) { hd = 0; }
                    else if (s >= sd) { s = s - sd; hd = 0; }
                    else { hd = numCast(hd * (1 - s / sd)); s = 0; }
                }
                if ((hd -= this.nResHM) > 0) { h += hd; }
            }

            // Physical damage
            {
                let hd = this.nDmgHP;
                if (s > 0) {
                    let sd = this.nDmgSP - this.nResSP;
                    if (sd <= 0) { hd = 0; }
                    else if (s >= sd) { s = s - sd; hd = 0; }
                    else { hd = numCast(hd * (1 - s / sd)); s = 0; }
                }
                if ((hd -= this.nResHP) > 0) { h += hd; }
            }

            // Absolute damage
            {
                let hd = this.nDmgHA;
                if (s > 0) {
                    let sd = this.nDmgSA;
                    if (sd <= 0) { hd = 0; }
                    else if (s >= sd) { s = s - sd; hd = 0; }
                    else { hd = numCast(hd * (1 - s / sd)); s = 0; }
                }
                if (hd > 0) { h += hd; }
            }

            // Shield damage
            s = this.mSdNow - s;

            // Set damage
            // This should be done before the overkill check
            this.nDmgH = h; this.nDmgS = s;

            // Damage ratio
            if (Rules.NoOverkill) {
                h = Math.min(h, this.mHpNow, this.mHpNow - this.nHpMin);
                s = Math.min(s, this.mSdNow - this.nSdMin);
            }
            this.nDecH = (h >= this.nDecH) ? 1 : h / this.nDecH || 0;
            this.nDecS = (s >= this.nDecS) ? 1 : s / this.nDecS || 0;
        }

        // Dead check and leech calculation
        dpSet (mt) {
            if (this.nDmgH >= this.mHpNow) { this.nRecH = 0; this.nRecS = 0; return 0; }
            
            const r = this.LchRat.now();
            if (r > 0) {
                const I = this.I, [HH, HS, SH, SS] = mt;
                let h = 0, s = 0;
                for (const B of this.E) {
                    for (const b of B) {
                        h += eftMul3(b.nVecH[I] * b.nDecH || 0, r, HH);
                        h += eftMul3(b.nVecH[I] * b.nDecH || 0, r, HS);
                        s += eftMul3(b.nVecH[I] * b.nDecH || 0, r, SH);
                        s += eftMul3(b.nVecS[I] * b.nDecS || 0, r, SS);
                    }
                }
                this.nRecH += h;
                this.nRecS += s;
            }
            
            return 1;
        }

        // End phase
        epSetL () {
            this.mWait = 0;
            this.mTurn++;
        }

        // End phase
        epSetR () {
            this.mWait++;
        }

        // Finalize changes
        apply () {
            let h = this.mHpNow, s = this.mSdNow,
                hr = this.nRecH, sr = this.nRecS,
                hd = this.nDmgH, sd = this.nDmgS
            ;
            
            // Status
            for (const k in EmuStatusKind) {
                const v = EmuStatusKind[k], show = v.show, debug = v.debug, x = this[k];
                x.apply();
                if (x[show]) { this.uiAddStatus(k, x[show]); }
                if (debug) { this.nDbg.push([k, x[debug]]); }
            }

            // Setup
            const 
                hm = this.HpMax.now(), sm = this.SdMax.now(),
                pp = this.PowFixP.now(), pm = this.PowFixM.now(), pa = this.PowFixA.now()
            ;
            this.mHpMax = hm; this.mSdMax = sm; this.mLifeMax = hm + sm;
            this.mPowP = pp; this.mPowM = pm; this.mPowA = pa; this.mPowPM = pp + pm;

            // Calculate recover
            if (this.NoRec.now()) { hr = 0; sr = 0; }
            this.nRecH = hr = Math.max(eftMadd(hr, this.HpRecRat.now()), 0);
            this.nRecS = sr = Math.max(eftMadd(sr, this.SdRecRat.now()), 0);

            // Health
            if (h <= NumMax) {
                h += hr;                                                        // Health recover
                hd = Math.min(hd, h - this.nHpMin || 0);                        // Health lock
                if (Rules.NoOverkill && h < hd) { hd = h; }                     // Prevent overkill
                this.mHpNow = h = (h > hd) ? Math.min(h - hd, hm) : 0;          // Apply damage
                this.nDmgH = hd;                                                // Show damage

                // Infinite damage
                if (hd > NumMax) {
                    this.nDmgS = hd;
                    this.mSdNow = 0;
                    return 1;
                }
            }

            // Shield
            if (s <= NumMax) {
                s += sr;                                                        // Shield recover
                sd = Math.min(sd, s - this.nSdMin || 0);                        // Shield lock
                if (Rules.NoOverkill && s < sd) { sd = s; }                     // Prevent overkill
                this.mSdNow = s = (s > sd) ? Math.min(s - sd, sm) : 0;          // Apply damage
                this.nDmgS = sd;                                                // Show damage
            }

            // Real dead check
            return !(h > 0);
        }

        rndUni (n) {
            return this.mRng.step() < numCast(184467440737095520 * n); // 2**64 * 0.01 * n
        }

        rndNum (n) {
            return Number(this.mRng.step() % BigInt(n));
        }

        uiClear () {
            this.nMsg = [];
            this.nDbg = [];
        }

        uiAddHpPot () {
            this.nMsg.push(["hpot", "", "", ""]);
        }

        uiAddSdPot () {
            this.nMsg.push(["spot", "", "", ""]);
        }

        uiAddStatus (i, m = "", w = "") {
            this.nMsg.push(["stat", i, m, w]);
        }

        uiAddAct (i, m = "", w = "") {
            this.nMsg.push(["act", i, m, w]);
        }

        uiAddArt1 (i, m = "", w = "") {
            this.nMsg.push(["art1", i, m, w]);
        }

        uiAddArt2 (i, m = "", w = "") {
            this.nMsg.push(["art2", i, m, w]);
        }

        uiAddArt3 (i, m = "", w = "") {
            this.nMsg.push(["art3", i, m, w]);
        }

        uiAddAura (i, m = "", w = "") {
            this.nMsg.push(["aura", i, m, w]);
        }

        uiHpBar () {
            const hn = this.mHpNow, hm = this.mHpMax;

            return hn > 0 ? hn < hm ?
                Math.ceil(hn / hm * 100) :
                100 : 0
            ;
        }

        uiSdBar () {
            const sn = this.mSdNow, sm = this.mSdMax;

            return sn > 0 ? sn < sm ?
                Math.ceil(sn / sm * 100) :
                100 : 0
            ;
        }

    }
    Fighter.prototype.Eft = {
        Art1: {
            "3000": 0x000bb8n,
            "3001": 0x000bb9n,
            "3002": 0x000bban,
            "3003": 0x000bbbn,
            "3004": 0x000bbcn,
            "3005": 0x000bbdn,
            "3006": 0x000bben,
            "3007": 0x000bbfn,
            "3008": 0x000bc0n,
            "3009": 0x000bc1n,
            "3010": 0x000bc2n,
            "3011": 0x000bc3n
        },
        Art2: {
            "3000": 0x100bb8n,
            "3001": 0x100bb9n,
            "3002": 0x100bban,
            "3003": 0x100bbbn,
            "3004": 0x100bbcn,
            "3005": 0x100bbdn,
            "3006": 0x100bben,
            "3007": 0x100bbfn,
            "3008": 0x100bc0n,
            "3009": 0x100bc1n,
            "3010": 0x100bc2n,
            "3011": 0x100bc3n
        },
        Art3: {
            "3000": 0x200bb8n,
            "3001": 0x200bb9n,
            "3002": 0x200bban,
            "3003": 0x200bbbn,
            "3004": 0x200bbcn,
            "3005": 0x200bbdn,
            "3006": 0x200bben,
            "3007": 0x200bbfn,
            "3008": 0x200bc0n,
            "3009": 0x200bc1n,
            "3010": 0x200bc2n,
            "3011": 0x200bc3n
        },
        Aura: {
            "101": 0x800065n,
            "102": 0x800066n,
            "103": 0x800067n,
            "104": 0x800068n,
            "105": 0x800069n,
            "201": 0x8000c9n,
            "202": 0x8000can,
            "203": 0x8000cbn,
            "204": 0x8000ccn,
            "205": 0x8000cdn,
            "206": 0x8000cen,
            "207": 0x8000cfn,
            "301": 0x80012dn,
            "302": 0x80012en,
            "303": 0x80012fn,
            "304": 0x800130n,
            "305": 0x800131n,
            "306": 0x800132n,
            "307": 0x800133n,
            "308": 0x800134n,
            "309": 0x800135n,
            "401": 0x800191n,
            "402": 0x800192n,
            "403": 0x800193n,
            "404": 0x800194n,
            "405": 0x800195n,
            "406": 0x800196n,
            "407": 0x800197n,
            "408": 0x800198n,
            "901": 0x800385n
        },
        Myst: {
            "901": 0xc00385n,
            "902": 0xc00386n,
            "903": 0xc00387n,
            "2101": 0xc00835n,
            "2102": 0xc00836n,
            "2103": 0xc00837n,
            "2104": 0xc00838n,
            "2105": 0xc00839n,
            "2106": 0xc0083an,
            "2107": 0xc0083bn,
            "2108": 0xc0083cn,
            "2109": 0xc0083dn,
            "2110": 0xc0083en,
            "2111": 0xc0083fn,
            "2112": 0xc00840n,
            "2201": 0xc00899n,
            "2202": 0xc0089an,
            "2203": 0xc0089bn,
            "2204": 0xc0089cn,
            "2205": 0xc0089dn,
            "2206": 0xc0089en,
            "2301": 0xc008fdn,
            "2302": 0xc008fen,
            "2303": 0xc008ffn,
            "2304": 0xc00900n,
            "2305": 0xc00901n,
            "2306": 0xc00902n,
            "2307": 0xc00903n,
            "2401": 0xc00961n,
            "2402": 0xc00962n,
            "2403": 0xc00963n,
            "2404": 0xc00964n,
            "2405": 0xc00965n
        }
    };

    // -------------------------------------------------------------------------------
    //  * Arena *
    // -------------------------------------------------------------------------------
    
    class Arena extends ObjBase {

        // Rules
        Clock = Rules.Clock;
        Scales = Rules.Scales; Rounds = Rules.Rounds; 
        SklAdd = Rules.SklAdd; CrtAdd = Rules.CrtAdd;
        SklOff = Rules.SklOff; CrtOff = Rules.CrtOff;
        HpHeal = Rules.HpHeal; SdHeal = Rules.SdHeal;
        RflMtL = Rules.RflMtL; RflMtR = Rules.RflMtR;
        LchMtL = Rules.LchMtL; LchMtR = Rules.LchMtR;
        SpdMin = Rules.SpdMin;

        // Teams
        AO = []; AA = []; mDpr = 1; mDps = 1;
        TSort = (l, r) => r.mSpdNow - l.mSpdNow; TCost = 0;
        PSort = (l, r) => (l > r) - (l < r);

        // -------------------------------------------------------------------------------
        //  * Setup *
        // -------------------------------------------------------------------------------
        
        // Initialize callback graph.
        // This should be called after changing Arena.prototype.Eft.
        constructor () {
            super();
        }

        // Setup teams
        team (team) {
            const 
                AO = team.flat(), CA = this.CrtAdd, CO = this.CrtOff, SA = this.SklAdd, SO = this.SklOff,
                AN = AO.length, RR = 1 / Math.max(AN * 0.5, 1), RS = this.Scales * RR,
                RflMtL = this.RflMtL, RflMtR = this.RflMtR, LchMtL = this.LchMtL, LchMtR = this.LchMtR;
            ;
            this.AA = team;
            this.AO = AO;
            this.AU = [];
            for (const i in AO) {
                const u = AO[i];
                u.I = i;
                u.mCrtScl = CO; u.mCrtDiv = CA;
                u.mSklScl = SO; u.mSklDiv = SA;
                u.nVecH = new Array(AN).fill(0);
                u.nVecS = new Array(AN).fill(0);
                u.mDpr = RR; u.mDps = RS;
                u.mRflMtL = Array.from(RflMtL); u.mRflMtR = Array.from(RflMtR);
                u.mLchMtL = Array.from(LchMtL); u.mLchMtR = Array.from(LchMtR);
            }
            this.mDpr = RR; this.mDps = RS;
        }

        // Reset objects to their initial state
        ipSet () {
            const AO = this.AO, AU = this.AA.map(t => new Set(t)), eft = this.Eft, hook = this.Flow;

            // Array of sets of all alive fighters.
            this.AU = AU;

            // Setup attacking target.
            AU.forEach((t, i) => {
                const E = [...AU];
                E.splice(i, 1);
                for (const a of t) { a.E = E; }
            });

            // Setup callbacks for all fighters.
            {
                // Add time flag
                const t = this.Clock, x = (t < 21600000 || t >= 68400000) ? 0x1000000n : 0x1000001n;

                // Initialize callbacks for all fighters.
                for (const a of AO) {
                    const cflags = a.mFlags;
                    cflags.add(x);
                    for (const k of hook) { a[k] = new Map(); }
                    for (const k of cflags) {
                        const T = eft.get(k);
                        if (!T) { continue; }
                        for (const [C, D, p] of T) {
                        __lbNextCheck:
                            for (const cc of C) {
                                for (const k of cc) {
                                    if (!cflags.has(k)) { continue __lbNextCheck; }
                                }
                                for (const [k, i] of D) { a[k].set(i, p); }
                                break;
                            }
                        }
                    }
                    for (const k of hook) {
                        const Q = a[k];
                        a[k] = [...Q.keys()].sort(this.PSort).map(Q.get.bind(Q));
                    }
                    a.mAtkFixP = a.mAtkMulP; a.mAtkFixM = a.mAtkMulM; a.mAtkFixC = a.mAtkMulC;
                    a.mDefFixP = a.mDefMulP; a.mDefFixM = a.mDefMulM;
                }
            }

            // Run callbacks with base stats.
            for (const a of AO) {
                for (const p of a[$StIpMulN]) { p(a); }
            }

            // Apply additional stats.
            for (const a of AO) {
                a.mAtkFixP += a.mAtkAddP; a.mAtkFixM += a.mAtkAddM; a.mAtkFixC += a.mAtkAddC;
                a.mDefFixP += a.mDefAddP; a.mDefFixM += a.mDefAddM;
            }

            // Run callbacks with additional stats.
            for (const a of AO) {
                for (const p of a[$StIpAddN]) { p(a); }
            }
            
            // Initialize all fighters.
            for (const a of AO) {
                a.reset();
            }
        }

        // Action Phase > Setup step
        apSetL (a) {
            a.apSetL();
            for (const p of a[$StApSetL]) { p(a); }
        }

        // Action Phase > Setup step
        apSetR (a) {
            a.apSetR();
            for (const p of a[$StApSetR]) { p(a); }
        }

        // Battle phase > Setup step
        bpSet (a, b) {
            a.bpSet(); b.bpSet();
        }

        // Battle phase > Attack step
        bpAtk (a, b) {
            a.bpAtk(b);
            for (const p of a[$StBpAtkL]) { p(a, b); }
            for (const p of b[$StBpAtkR]) { p(b, a); }
            if (a.isC(b)) {
                a.bpCrt(b);
                for (const p of a[$StBpCrtL]) { p(a, b); }
                for (const p of b[$StBpCrtR]) { p(b, a); }
            }
            for (const p of a[$StBpSklL]) { p(a, b); }
            for (const p of b[$StBpSklR]) { p(b, a); }
            a.bpScl(b); b.bpScl(a);
        }
        
        // Battle phase > Defend step
        bpDef (a, b) {
            b.bpDef(a);
            for (const p of a[$StBpDefL]) { p(a, b); }
            for (const p of b[$StBpDefR]) { p(b, a); }
        }
        
        // Battle phase > Adjust step
        bpPow (a, b) {
            for (const p of a[$StBpPowL]) { p(a, b); }
            for (const p of b[$StBpPowR]) { p(b, a); }
            a.bpPow(b); b.bpPow(a);
        }

        // Battle phase > Damage step
        bpDmg (a, b) {
            a.bpDmg(b); b.bpDmg(a);
            for (const p of a[$StBpDmgL]) { p(a, b); }
            for (const p of b[$StBpDmgR]) { p(b, a); }
            a.bpEnd(b); b.bpEnd(a);
            for (const k in EmuStatusKind) { a[k].count(); b[k].count(); }
        }

        // Check phase > Setup step
        cpSetL (a) {
            a.cpSet();
            for (const p of a[$StCpSetL]) { p(a); }
        }

        // Check phase > Setup step
        cpSetR (a) {
            a.cpSet();
            for (const p of a[$StCpSetR]) { p(a); }
        }

        // Damage phase > Setup step
        dpSetL (a) {
            if (a.dpSet(a.mLchMtL)) { for (const p of a[$StDpSetL]) { p(a); } }
        }

        // Damage phase > Setup step
        dpSetR (a) {
            if (a.dpSet(a.mLchMtR)) { for (const p of a[$StDpSetR]) { p(a); } }
        }

        // End phase > Setup step
        epSetL (a) {
            a.epSetL();
            for (const p of a[$StEpSetL]) { p(a); }
        }
        
        // End phase > Setup step
        epSetR (a) {
            a.epSetR();
            for (const p of a[$StEpSetR]) { p(a); }
        }

        // Action Phase
        apEnt (AL, AR) {
            for (const a of AL) { this.apSetL(a); }
            for (const a of AR) { this.apSetR(a); }

            // Speed floor
            if (EftBase) { return; }
            for (const U of this.AU) { 
                for (const u of U) { u.SpdRat.floor(this.SpdMin); }
            }
        }

        // Battle Phase
        bpEnt (AL, AR) {
            for (const a of AL) {
                for (const B of a.E) {
                    for (const b of B) {
                        this.bpSet(a, b);
                        this.bpAtk(a, b);
                        this.bpDef(a, b);
                        this.bpPow(a, b);
                        this.bpDmg(a, b);
                    }
                }
            }
        }

        // Check Phase
        cpEnt (AL, AR) {
            for (const a of AL) { this.cpSetL(a); }
            for (const a of AR) { this.cpSetR(a); }
        }

        // Damage Phase
        dpEnt (AL, AR) {
            for (const a of AL) { this.dpSetL(a); }
            for (const a of AR) { this.dpSetR(a); }
        }

        // End Phase
        epEnt (AL, AR) {
            for (const a of AL) { this.epSetL(a); }
            for (const a of AR) { this.epSetR(a); }
        }

        // Timer
        freeze (AL, AR) {
            const AU = this.AU, NU = AU.reduce((x, t) => x + t.size, 0);
            
            // Timer
            let timer = 0;
            if (NU) {
                const Tr = 1 / NU;
                for (const U of AU) {
                    for (const u of U) {
                        u.mHhr = this.HpHeal; u.mShr = this.SdHeal;
                        timer += u.tick() * Tr;
                    }
                }
            }
            timer ||= 0;

            // Left / Right Separation
            {
                const it = AU.values();
                for (const t of it) {
                    if (!t.size) { continue; }
                    for (const u of t) { ((u.mSpdNow < timer) ? AR : AL).push(u); }
                    break;
                }
                for (const t of it) {
                    // (Infinity <= Infinity) = true
                    // (Infinity - Infinity <= 0) = (Nan <= 0) = false
                    // Note that mSpdNow is Infinity <=> REN activated in last round, we need the latter in this case.
                    for (const u of t) { ((u.mSpdNow - timer <= 0) ? AR : AL).push(u); }
                }
            }
            rngShuffle(AL).sort(this.TSort);
            rngShuffle(AR).sort(this.TSort);
            timer = AL.length;
            timer = timer ? AL[timer - 1].mSpdNow : 0;
            AL.forEach(a => a.mSpdNow = a.mSpdNow - timer || 0);
        }

        // Apply all changes
        thaw () {
            const AU = this.AU;
            let r = 0n;
            for (const i in AU) {
                const U = AU[i];
                for (const u of U) { u.apply() && U.delete(u); }
                r |= BigInt(U.size > 0) << BigInt(i);
            }
            return r;
        }

        flush () {
            for (const a of this.AO) { a.flush(); }
        }

        // Step one round
        step () {
            const AL = [], AR = [];
            this.freeze(AL, AR);
            this.apEnt(AL, AR);
            this.bpEnt(AL, AR);
            this.cpEnt(AL, AR);
            this.dpEnt(AL, AR);
            this.epEnt(AL, AR);
            return this.thaw();
        }
    }

    /*
    --------------------------------------------------------------------------------------------------------------------------------------------------------
    * Callback System *
    --------------------------------------------------------------------------------------------------------------------------------------------------------
    This system handles all effects in the game, including actor skills, auras and mysteries.
    
    It works roughly like:

                          Runs
        Arena.constructor ---> Effect table
                                    |
                                    | Setup
                      Runs          |
        Arena.**** --------> Fighter callbacks

    In the following sections, we will clarify how to program an arena callback in effect table.

    --------------------------------------------------------------------------------------------------------------------------------------------------------
    * Priority *
    --------------------------------------------------------------------------------------------------------------------------------------------------------
    All callbacks would executed in ascending order of priority.
    To make whole thing easier to maintain, all kinds of hooks shares the same encoding format:

            | (1) | (2) | (3) | (4)  |
        0x  |  00 |  0  |  0  | 0000 | n

    (1) Priority:
        - Controls the execution order of callbacks. 
        The higher priority given, the later it would get called.

    (2) Kind:
        - 0: Art1
        - 1: Art2
        - 2: Art3
        - 8: Aura
        - c: Myst
        - Other values are reserved.

    (3) Slot
        - The internal priority of the same type. These are unused for now.
            - To be clear, in case an effect requires multiple callbacks within the same priority, they would be in order of 0x0, ..., 0xf.
    
    (4) Id:
        - The id of the effect. In general, the game tends to handle newer effects later.

    Note that priority should always in BigInt.

    --------------------------------------------------------------------------------------------------------------------------------------------------------
    * Writing fighter callbacks *
    --------------------------------------------------------------------------------------------------------------------------------------------------------

    For each fighter in target, the following hooks are available:

        | (1) | (2) | (3) |
        p | *p  | *** |  *  |

        - Ip: Initial Phase     [ order | N (unit) ]
            >> Mul : Multiply step  // Callbacks that been executed once before addtional stats added.
            >> Add : Addition step  // Callbacks that been executed once after addtional stats added.
        - Ap: Action Phase      [ order | L (act) -> R (rest) ]
            >> Set : Setup step     // After setting up everythings for a new turn.
        - Bp: Battle Phase      [ order | L (attacker, defender) -> R (defender, attacker)]
            >> Atk : Attack step    // Base attack and passive skills.
            >> Crt : Critical step  // Only called when critical occurs.
            >> Skl : Skill step     // Active skills and some specific auras.
            >> Def : Defend step    // Rights after the reflect calculation.
            >> Pow : Adjust step    // Betweens damage multipliers calculated and power fixed.
            >> Dmg : Damage step    // Rights before the damage accumlated.
        - Cp: Check Phase       [ order | L (act) -> R (rest) ]
            >> Set : Setup step     // Right after the battle phase ends, before the dead check.
        - Dp: Damage Phase      [ order | L (act) -> R (rest) ]
            >> Set : Setup step     // These callbacks only called when the first dead check succeed.
        - Ep: End Phase         [ order | L (act) -> R (rest) ]
            >> Ent : Setup step     // After the end phase ends.

        Valid steps are:
            $StIpMulN  $StIpAddN
            $StApSetL  $StApSetR 
            $StBpAtkL  $StBpAtkR 
            $StBpCrtL  $StBpCrtR 
            $StBpSklL  $StBpSklR 
            $StBpDefL  $StBpDefR 
            $StBpPowL  $StBpPowR 
            $StBpDmgL  $StBpDmgR 
            $StCpSetL  $StCpSetR
            $StDpSetL  $StDpSetR 
            $StEpSetL  $StEpSetR 

    All of them are in type of Map<priority, function>.

    --------------------------------------------------------------------------------------------------------------------------------------------------------
    * Status *
    --------------------------------------------------------------------------------------------------------------------------------------------------------
        TBA?

    */
    Object.defineProperty(
        Arena.prototype, "$", {value: Fmt.arena, writable: false, enumerable: false}
    );
    Arena.prototype.Flow = [
        $StIpMulN, $StIpAddN,
        $StApSetL, $StApSetR,
        $StBpAtkL, $StBpAtkR,
        $StBpCrtL, $StBpCrtR,
        $StBpSklL, $StBpSklR,
        $StBpDefL, $StBpDefR,
        $StBpPowL, $StBpPowR,
        $StBpDmgL, $StBpDmgR,
        $StCpSetL, $StCpSetR,
        $StDpSetL, $StDpSetR,
        $StEpSetL, $StEpSetR
    ];
    Arena.prototype.Eft = new Map([
        
        // -------------------------------------------------------------------------------
        //  * Actor Skill 1 *
        // -------------------------------------------------------------------------------
        
        // WU 1
        [0x000bb8n, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00000bb8n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    const n = a.mGrowth, m = n + 100;
                    a.pp += m; a.pm += m;
                    a.uiAddArt1(3000, "+" + n);
                }
            ]
        ]],

        // MO 1
        [0x000bb9n, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00000bb9n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    
                    let t0 = a.mInt, t1 = a.mSpr;
                    if (t0 < t1) {
                        const t = t0;
                        t0 = t1; t1 = t;
                    }
                    a.pm += numCast(
                        (numCast(a.mPowM * 0.35) + numCast(a.mSdMax * 0.05)) * numCast(
                            Math.min(t0 * 50 / t1 || 100, 1100) * 0.01
                        )
                    );
                    a.uiAddArt1(3001);
                }
            ]
        ]],

        // LIN 1
        [0x000bban, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00000bban]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    const n = a.mPowP * 3; // , m = n * a.mDps;
                    a.pp += n; a.pm += n; // a.nRecH += m; a.nRecS += m;
                    a.uiAddArt1(3002);
                }
            ]
        ]],

        // AI 1
        [0x000bbbn, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00000bbbn]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    const n = b.Flare.now();
                    a.pa += numCast((b.mHpNow + b.mSdNow) * 0.13 * n);
                    b.Flare.dec(n);
                    a.uiAddArt1(3003);
                }
            ]
        ]],

        // MENG 
        [0x000bbcn, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00000bbcn]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    b.Light.inc(7);
                    const n = b.Light.now();
                    a.pm += numCast(a.mPowM * n * 0.25);
                    b.SpdRat.dec(numCast(n * 0.5));
                    if (!EftBase) { b.SpdRat.floor(-100); }
                    a.uiAddArt1(3004);
                }
            ]
        ]],

        // WEI 1
        [0x000bbdn, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00000bbdn]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    a.Dodge.set(1);
                    a.uiAddArt1(3005);
                }
            ]
        ]],

        // YI 1
        [0x000bben, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00000bben]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    const sd = b.mSdNow, hp = b.mHpNow,
                        n = numCast(((sd > hp) ? sd : hp) * 0.15);
                    a.pa += n;
                    a.nRecH += numCast(n * a.mDps);
                    a.uiAddArt1(3006);
                }
            ]
        ]],

        // MING 1
        [0x000bbfn, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00000bbfn]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    const n = a.mHpMax - a.mHpNow || 0;
                    a.pm += n; a.nRecH += numCast(n * 0.5 * a.mDps);
                    a.uiAddArt1(3007);
                }
            ]
        ]],

        // MIN 1
        [0x000bc0n, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00000bc0n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    const n = a.rndNum(3);
                    a.Mirror.set(1 << n);
                    a.uiAddArt1(3008, n, "Art3008");
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpDmgL, 0xff000bc0n],
                    [$StBpDmgR, 0xff000bc0n]
                ], (a, b) => {
                    const n = a.Mirror.now();
                    if (n & 1) { b.pp = 0; }
                    if (n & 2) { b.pm = 0; }
                    if (n & 4) { b.pa = 0; }
                }
            ]
        ]],

        // XI 1
        [0x000bc1n, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00000bc1n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    const n = a.mPowP * 3 * (1 + 0.01 * (numCast((a.mHpMax - a.mHpNow) * 100 / a.mHpMax) || 0));
                    if (
                        a.mHpNow + a.mSdNow < numCast(a.mLifeMax * 0.1) ||
                        b.mHpNow + b.mSdNow < numCast(b.mLifeMax * 0.1)
                    ) { a.pa += n; }
                    else { a.pp += n; }
                    a.uiAddArt1(3009);
                }
            ]
        ]],

        // XIA 1
        [0x000bc2n, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00000bc2n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    a.pm += eftMul2(a.mPowM * 2, 100 + Math.min(numCast(b.mDefFixM, 0.1), 200));
                    a.uiAddArt1(3010);
                }
            ]
        ]],

        // YA 1
        [0x000bc3n, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x02000bc3n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    const h = numCast(b.mHpMax * 0.05 * a.mDps), s = numCast(b.mSdMax * 0.05 * a.mDps), n = h + s;

                    b.HpMax.dec(h); b.SdMax.dec(s);
                    a.PowFixP.inc(n);
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00000bc3n]
                ], (a, b) => {
                    if (!a.skl) { return; }
                    const h = numCast(b.mHpMax * 0.05 * a.mDps), s = numCast(b.mSdMax * 0.05 * a.mDps);
                    a.pp += (a.mPowP + h + s) * 3; // After Increase
                    a.uiAddArt1(3011);
                }
            ]
        ]],

        // MU 1
        [0x000f3dn, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00000f3dn]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    a.pp += a.mPowP * 5;
                    a.uiAddArt1(3901);
                }
            ]
        ]],

        // ZHU 1
        [0x000f3en, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00000f3en]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    a.pm += a.mPowM * 5;
                    a.uiAddArt1(3902);
                }
            ]
        ]],

        // DENG 1
        [0x000f3fn, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00000f3fn]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    a.pm += numCast(a.mSdMax * 0.4);
                    a.uiAddArt1(3903);
                }
            ]
        ]],

        // SHOU 1
        [0x000f40n, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00000f40n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    a.pp += numCast(a.mHpMax * 0.4);
                    a.uiAddArt1(3904);
                }
            ]
        ]],

        // YU 1
        [0x000f41n, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00000f41n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    a.pp += a.mPowP * 5;
                    a.uiAddArt1(3905);
                }
            ]
        ]],

        // HAO 1
        [0x000f42n, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00000f42n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    a.pp += numCast(a.mHpMax * 0.4);
                    a.uiAddArt1(3906);
                }
            ]
        ]],

        // LIU 1
        [0x000f43n, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00000f43n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    a.pp += numCast(a.mHpMax * 0.4);
                    a.uiAddArt1(3907);
                }
            ]
        ]],

        // SHI 1
        [0x000f44n, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00000f44n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    a.pp += a.mPowP * 3;
                    a.pm += a.mPowM * 3;
                    a.pa += a.mPowP + a.mPowM;
                    a.uiAddArt1(3908);
                }
            ]
        ]],
        
        // -------------------------------------------------------------------------------
        //  * Actors Skill 2 *
        // -------------------------------------------------------------------------------
        
        // WU 2
        [0x100bb8n, [
            // After aura CI, but before adding additive stats.
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x01100bb8n]
                ], a => {
                    a.mDefFixP = numCast(a.mDefFixP * 1.15);
                    a.mDefFixM = numCast(a.mDefFixM * 1.15);
                    a.mHpRat += 30; a.mSdRat += 30;
                }
            ]
        ]],

        // MO 2
        [0x100bb9n, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00100bb9n]
                ], a => {
                    a.mSdRat += 40;
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpAtkR, 0x00100bb9n]
                ], (a, b) => {
                    a.pm += numCast(a.mPowM * 0.55) + numCast(a.mSdMax * 0.07) || 0;
                    a.uiAddArt2(3001);
                }
            ]
        ]],

        // LIN 2
        [0x100bban, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00100bban]
                ], a => {
                    a.Undead.setImpl(1);
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StEpSetR, 0x01100bban]
                ], a => {
                    if (a.Undead.now() > 0 && (a.mHpNow <= a.nDmgH)) {
                        a.nDmgH = a.nDmgS = 0;
                        a.Undead.decImpl(1);
                        a.uiAddArt2(3002);
                    }
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpCrtL, 0x00100bban]
                ], a => {
                    if (a.Undead.now() > 0 && (a.crt)) {
                        a.pp += a.mHpMax * 0.5;
                        a.Undead.decImpl(1);
                        a.uiAddArt2(3002);
                    }
                }
            ]
        ]],

        // AI 2
        [0x100bbbn, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00100bbbn]
                ], a => {
                    a.mLchRat += 15;
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x00100bbbn]
                ], (a, b) => {
                    a.pa += numCast(a.mPowPM * 180 * 0.0025);
                }
            ]
        ]],

        // MENG 2
        [0x100bbcn, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00100bbcn]
                ], a => {
                    a.mSdRat += 30;
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpPowR, 0x00100bbcn]
                ], (a, b) => {
                    b.Light.inc(1); b.SpdRat.dec(2);
                }
            ]
        ]],

        // WEI 2
        [0x100bbdn, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00100bbdn]
                ], a => {
                    a.mSklRat += 10;
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00100bbdn]
                ], (a, b) => {
                    if (a.Dodge.now() > 0) { a.pp = numCast(a.pp * 1.4); }
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpDmgR, 0x01100bbdn]
                ], (a, b) => {
                    if (a.Dodge.now() > 0) {
                        b.pp = numCast(b.pp * 0.1);
                        b.pm = numCast(b.pm * 0.1);
                        b.pa = numCast(b.pa * 0.1);
                        a.Dodge.dec(1);
                        a.uiAddArt2(3005);
                    }
                }
            ]
        ]],

        // YI 2
        [0x100bben, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x00100bben]
                ], (a, b) => {
                    a[(b.nDefFixP > b.nDefFixM) ? "pm" : "pp"] += numCast(a.mPowPM * 1.4);
                }
            ]
        ]],

        // MING 2
        [0x100bbfn, [
            // After additive stats added.
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x00100bbfn]
                ], a => {
                    a.mHpRat += 90;
                    a.mDefFixP = numCast(a.mDefFixP * 0.5);
                    a.mDefFixM = numCast(a.mDefFixM * 0.5);
                }
            ]
        ]],

        // MIN 2
        [0x100bc0n, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00100bc0n]
                ], a => {
                    a.Sight.setImpl(1);
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StApSetL, 0x00100bc0n]
                ], a => {
                    a.Sight.setImpl(0);
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpDmgR, 0x00100bc0n]
                ], (a, b) => {
                    if (a.Sight.now() < 1) { return; }
                    a.Sight.dec(1);
                    b.pp = 0; b.pm = 0; b.pa = 0;
                    a.uiAddArt2(3008);
                }
            ]
        ]],

        // XI 2
        [0x100bc1n, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00100bc1n]
                ], a => {
                    a.mHpRat += 10;
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x00100bc1n]
                ], (a, b) => {
                    a.crt ||= (b.mHpNow + b.mSdNow < numCast(b.mLifeMax * 0.5));
                }
            ]
        ]],

        // XIA 2
        [0x100bc2n, [
            // XIA 2 should get evaluagted at last?
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x01100bc2n]
                ], a => {
                    // ... and in order of port id?
                    let n = 0, m = 0;
                    for (const B of a.E) {
                        for (const b of B) { (a.mPowMulM + a.mPowAddM > b.mPowMulM + b.mPowAddM) ? n++ : m++; }
                    }
                    const q = Math.min(0.3 / (n + m), Number.MAX_VALUE);
                    a.mPowMulM += numCast(a.mPowMulM * n * q);
                    a.mPowAddM += numCast(a.mPowAddM * n * q);
                    a.mSpd += numCast(a.mSpd * m * q);
                }
            ]
        ]],

        // YA 2
        [0x100bc3n, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x01100bc3n]
                ], (a, b) => {
                    a.pp += numCast(a.mPowPM * ((a.mTurn + b.mTurn) * 0.2 + 0.2));
                }
            ]
        ]],

        // MU 2
        [0x100f3dn, []],

        // ZHU 2
        [0x100f3en, []],

        // DENG 2
        [0x100f3fn, []],

        // SHOU 2
        [0x100f3en, []],

        // YU 2
        [0x100f3fn, []],

        // HAO 2
        [0x100f40n, []],

        // LIU 2
        [0x100f41n, []],

        // SHI 2
        [0x100f42n, []],
        
        // -------------------------------------------------------------------------------
        //  * Actors Skill 3 *
        // -------------------------------------------------------------------------------

        // WU 3
        [0x200bb8n, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00200bb8n]
                ], a => {
                    a.mPowRatP += 30;
                    a.mPowRatM += 30;
                    a.mSpdRat += 30;
                }
            ]
        ]],

        // MO 3
        [0x200bb9n, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x02200bb9n] // After BI and MO
                ], a => {
                    a.mAtkFixM += numCast((a.mInt + a.mSpr) * 0.2);
                }
            ]
        ]],

        // LIN3
        [0x200bban, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00200bban]
                ], a => {
                    a.mHpRat += 30;
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StApSetL, 0x00200bban],
                    [$StApSetR, 0x00200bban]
                ], a => {
                    // const n = numCast(a.mHpMax * ((a.mHpNow < numCast(a.mHpMax * 0.3)) ? 0.04 : 0.02) * a.mDps);
                    // a.mHpNow += n;
                    // a.uiAddArt3(3002, "+" + Math.floor(n));
                    a.nRecH += numCast(a.mHpMax * ((a.mHpNow < numCast(a.mHpMax * 0.3)) ? 0.06 : 0.03) * a.mDps);
                }
            ]
        ]],

        // AI 3
        [0x200bbbn, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00200bbbn]
                ], a => {
                    a.mLchRat += 15;
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x00200bbbn]
                ], (a, b) => {
                    b.Flare.inc(1);
                }
            ]
        ]],

        // MENG 3
        [0x200bbcn, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x00200bbcn]
                ], (a, b) => {
                    b.Light.inc(2);
                    a.pm += numCast((a.mSdMax * 0.03 + a.mPowM * 0.03) * b.Light.now() || 0);
                    b.SpdRat.dec(1);
                }
            ]
        ]],

        // WEI 3
        [0x200bbdn, [
            // After active skills
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00200bbd]
                ], (a, b) => {
                    a.pp += numCast(b.mLifeMax * 0.21);
                    // a.pm = numCast(a.pm * 0.3);
                }
            ]
        ]],

        // YI 3
        [0x200bben, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00200bben]
                ], a => {
                    a.mHpRat += 20;
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StApSetL, 0x00200bben]
                ], a => {
                    a.HpRecRat.floor(0);
                    a.SdRecRat.floor(0);
                    a.SpdRat.floor(0);
                }
            ]
        ]],

        // MING 3
        [0x200bbfn, [
            [
                [
                    []
                ],
                [
                    [$StBpDefL, 0x01200bbfn],
                    [$StBpDefR, 0x01200bbfn]
                ], (a, b) => {
                    a.pp += numCast(b.pp * 0.4);
                    a.pm += numCast(b.pm * 0.4);
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StEpSetL, 0x00200bbfn],
                    [$StEpSetR, 0x00200bbfn]
                ], a => {
                    let h = 0, s = 0;
                    for (const B of a.E) {
                        for (const b of B) {
                            h += numCast(b.nRecH * 0.6);
                            s += numCast(b.nRecS * 0.6);
                        }
                    }
                    a.nRecH += h * a.mDpr;
                    a.nRecS += s * a.mDpr;
                }
            ]
        ]],

        // MIN 3
        [0x200bc0n, [
            [
                [
                    []
                ],
                [
                    [$StBpCrtL, 0x00200bc0n]
                ], (a, b) => {
                    a.pp += numCast(a.pp * 0.55);
                    a.pm += numCast(a.pm * 0.55);
                    a.pa += numCast(a.pa * 0.55);
                }
            ]
        ]],

        // XI 3
        [0x200bc1n, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00200bc1n]
                ], a => {
                    a.mHpFix += numCast(a.mGrowth);
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x0020bc1n]
                ], (a, b) => {
                    const m = a.mHpMax, n = a.mHpNow;
                    if (numCast(m * 0.5) > n) { a.pp += m - n; }
                }
            ]
        ]],

        // XIA 3
        [0x200bc2n, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x02200bc2n] // After BI and MO
                ], a => {
                    let n = 0;
                    for (const B of a.E) {
                        for (const b of B) { n += b.mDefFixP; }
                    }
                    a.mAtkFixM += numCast(n * a.mDpr * 0.35);
                    a.mSdFix += numCast(a.mGrowth);
                }
            ]
        ]],
        
        // YA 3
        [0x200bc3n, [
            [
                [
                    [0x1000000n]
                ],
                // Evaluated last
                [
                    [$StIpAddN, 0x0120bc3n]
                ], a => {
                    const p = -30 * a.mDpr;
                    for (const B of a.E) {
                        for (const b of B) {
                            b.mPowMulP = eftMadd(b.mPowMulP, p); b.mPowAddP = eftMadd(b.mPowAddP, p);
                            b.mPowMulM = eftMadd(b.mPowMulM, p); b.mPowAddM = eftMadd(b.mPowAddM, p);
                            b.mSpd = eftMadd(b.mSpd, p);
                        }
                    }
                }
            ],
            [
                [
                    [0x1000001n]
                ],
                [
                    [$StIpAddN, 0x0120bc3n]
                ], a => {
                    a.mDefFixP = numCast(a.mDefFixP * 1.2);
                    a.mDefFixM = numCast(a.mDefFixM * 1.2);
                }
            ]
        ]],

        // MU 3
        [0x200f3dn, []],

        // ZHU 3
        [0x200f3en, []],

        // DENG 3
        [0x200f3fn, []],

        // SHOU 3
        [0x200f3en, []],

        // YU 3
        [0x200f3fn, []],

        // HAO 3
        [0x200f40n, []],

        // LIU 3
        [0x200f41n, []],

        // SHI 3
        [0x200f42n, []],

        // -------------------------------------------------------------------------------
        //  * Auras *
        // -------------------------------------------------------------------------------

        // SHI
        [0x800065n, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00800065n]
                ], a => {
                    const t = numCast(a.mLevel * 2 * (1 + a.mAura101 * 0.05));
                    a.mResP += t; a.mResM += t;
                }
            ]
        ]],

        // XIN
        [0x800066n, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00800066n]
                ], a => {
                    const t = numCast(a.mLevel * 10 * (1 + a.mAura102 * 0.05));
                    a.mHpFix += t; a.mSdFix += t;
                }
            ]
        ]],

        // FENG
        [0x800067n, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00800067n]
                ], a => {
                    const t = numCast(a.mLevel * 5 * (1 + a.mAura103 * 0.05));
                    a.mPowAddP += t; a.mPowAddM += t;
                }
            ]
        ]],

        // TIAO
        [0x800068n, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00800068n]
                ], a => {
                    const r = a.mDpr, l = a.mLevel, x = a.E.reduce((t, e) => { e.forEach(b => { t += Math.max(b.mLevel - l, 0); }); return t; }, 0);
                    let p2 = numCast((x + x) * r), p10 = numCast(x * 10 * r);
                    if (a.mIsPVE && x > 100) { p2 = 200; p10 = 1000; }
                    a.mAtkFixP += p2; a.mAtkFixM += p2; a.mPowAddP += p10; a.mPowAddM += p10;
                }
            ]
        ]],

        // YA
        [0x800069n, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00800069n]
                ], a => {
                    const r = a.mDpr, l = a.mLevel, x = a.E.reduce((t, e) => { e.forEach(b => { t += Math.max(l - b.mLevel, 0); }); return t; }, 0);
                    let p3 = numCast(x * 3.0 * r);
                    if (a.mIsPVE && x > 100) { p3 = 300; }
                    a.mDefFixP += p3; a.mDefFixM += p3; a.mSpd += p3; 
                }
            ]
        ]],
        
        // BI
        [0x8000c9n, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x018000c9n]
                ], a => {
                    a.mAtkRatP = numCast(a.mAtkRatP * 1.15);
                    a.mAtkFixP = numCast(a.mAtkFixP * 1.15);
                }
            ]
        ]],
        
        // MO
        [0x8000can, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x018000can]
                ], a => {
                    a.mAtkRatM = numCast(a.mAtkRatM * 1.15);
                    a.mAtkFixM = numCast(a.mAtkFixM * 1.15);
                }
            ]
        ]],

        // DUN
        [0x8000cbn, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x008000cbn]
                ], a => {
                    a.mSdDmgP = 1.25;
                }
            ]
        ]],

        // XUE
        [0x8000ccn, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x008000ccn]
                ], a => {
                    a.mHpRecRat += 10; a.mSdRecRat += 10;
                    a.mLchRat += 10;
                }
            ]
        ]],

        // XIAO
        [0x8000cdn, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x008000cdn]
                ], (a, b) => {
                    a.pa += numCast(b.mHpMax * 0.015) + numCast(b.mSdMax * 0.015);
                }
            ]
        ]],

        // SHENG
        [0x8000cen, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x008000cen]
                ], a => {
                    a.mDefFull = 0.8;
                }
            ]
        ]],
        
        // E
        [0x8000cfn, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x018000cfn]
                ], (a, b) => {
                    if (!a.rndUni(1)) { return; }
                    a.pp += a.mPowP * 30;
                    a.pm += a.mPowM * 30;
                    a.uiAddAura(207);
                }
            ]
        ]],

        // SHANG
        [0x80012dn, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x0080012dn]
                ], a => {
                    const p = -70 * a.mDpr;
                    for (const B of a.E) {
                        for (const b of B) {
                            b.mHpRecRat += p;
                        }
                    }
                }
            ]
        ]],

        // SHEN
        [0x80012en, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x0080012en]
                ], a => {
                    const p = -70 * a.mDpr;
                    for (const B of a.E) {
                        for (const b of B) {
                            b.mSdRecRat += p;
                        }
                    }
                }
            ]
        ]],

        // CI
        [0x80012fn, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x0080012fn]
                ], a => {
                    a.mDefFixP = numCast(a.mDefFixP * 1.1);
                    a.mDefFixM = numCast(a.mDefFixM * 1.1);
                    a.mRflRat += 10;
                }
            ]
        ]],

        // REN
        [0x800130n, [
            [
                [
                    []
                ],
                [
                    [$StEpSetR, 0x00800130n]
                ], a => {
                    let p = 0, q = 0;
                    for (const B of a.E) {
                        for (const b of B) {
                            p += b.mAgi; q++;
                        }
                    }
                    if (a.mWait * a.mDpr < (6 * q * a.mAgi > p ? 3 : 4)) { return; }
                    a.mSpdNow = Infinity;
                    a.uiAddAura(304);
                }
            ]
        ]],

        // RE
        [0x800131n, [
            [
                [
                    []
                ],
                [
                    [$StCpSetL, 0x00800131n]
                ], a => {
                    a.SpdRat.inc(9);
                }
            ]
        ]],

        // DIAN
        [0x800132n, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x00800132n]
                ], a => {
                    a.mDefFixP = numCast(a.mDefFixP * 1.3);
                    a.mDefFixM = numCast(a.mDefFixM * 1.3);
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpPowL, 0x0180132n],
                    [$StBpPowR, 0x0180132n]
                ], (a, b) => {
                    a.pp = numCast(a.pp * 0.7);
                    a.pm = numCast(a.pm * 0.7);
                    a.uiAddAura(306);
                }
            ]
        ]],

        // WU
        [0x800133n, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x0080133n]
                ], (a, b) => {
                    if ((a.mTurn + b.mTurn) < 15) { return; }
                    a.pa += numCast(a.mPowPM * 0.25);
                }
            ]
        ]],

        // ZHI
        [0x800134n, [
            [
                [
                    []
                ],
                [
                    [$StBpDmgL, 0x00800134n],
                    [$StBpDmgR, 0x00800134n]
                ], (a, b) => {
                    if (a.hpr > 0.9) { a.hpr = 0.9; }
                    if (a.hmr > 0.9) { a.hmr = 0.9; }
                    if (a.spr > 0.95) { a.spr = 0.95; }
                    if (a.smr > 0.95) { a.smr = 0.95; }
                }
            ]
        ]],

        // SHAN
        [0x800135n, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x00800135n] // Before JU?
                ], a => {
                    a.mSpd = 1;
                }
            ]
        ]],

        // FEI
        [0x800191n, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x00800191n]
                ], (a, b) => {
                    a.pp += numCast(a.mHpMax * 0.18);
                    a.uiAddAura(401);
                }
            ]
        ]],

        // BO
        [0x800192n, [
            [
                [
                    []
                ],
                [
                    [$StApSetL, 0x00800192n],
                    [$StApSetR, 0x00800192n]
                ], a => {
                    if (a.mSdNow <= a.mSdMax * 0.7 || a.mHpNow <= a.mHpMax * 0.7) { return; }
                    a.AtkRatM.incTurn(30);
                    a.uiAddAura(402);
                }
            ]
        ]],

        // JU
        [0x800193n, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x00800193n]
                ], a => {
                    a.mSpd = numCast(a.mSpd * 1.3);
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpCrtL, 0x00800193n]
                ], (a, b) => {
                    const 
                        m = numCast(eftMadd(a.mSpd, a.SpdRat.now()) || 0),
                        n = numCast(eftMadd(b.mSpd, b.SpdRat.now()) || 0);
                    a.pa += numCast(m * ((m > n * 3) ? 12 : 9) * 0.2);
                    a.uiAddAura(403);
                }
            ]
        ]],

        // HONG
        [0x800194n, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x00800194n],
                    [$StBpAtkR, 0x00800194n]
                ], (a, b) => {
                    const t = numCast(a.mLevel * 0.5);
                    if (a.arp < 40) { a.arp = 40; }
                    else { a.afp += t; }
                    if (a.arm < 40) { a.arm = 40; }
                    else { a.afm += t; }
                }
            ]
        ]],

        // JUE
        [0x800195n, [
            [
                [
                    []
                ],
                [
                    [$StBpDmgL, 0x00800195n],
                    [$StBpDmgR, 0x00800195n]
                ], (a, b) => {
                    b.pp = numCast(b.pp * 0.8);
                    b.pm = numCast(b.pm * 0.8);
                    b.pa = numCast(b.pa * 0.8);
                }
            ]
        ]],

        // HOU
        [0x800196n, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x01800196n]
                ], (a, b) => {
                    if (a.mWait < 1) { return; }
                    const n = 1 + a.mWait * 0.24;
                    a.pp = numCast(a.pp * n);
                    a.pm = numCast(a.pm * n);
                    a.pa = numCast(a.pa * n);
                    a.uiAddAura(406);
                }
            ]
        ]],

        // DUNH
        [0x800197n, [
            [
                [
                    []
                ],
                [
                    [$StBpPowL, 0x00800197n],
                    [$StBpPowR, 0x00800197n]
                ], (a, b) => {
                    b.arp = numCast(b.arp * 0.65);
                    b.arm = numCast(b.arm * 0.65);
                }
            ]
        ]],

        // ZI
        [0x800198n, [
            [
                [
                    []
                ],
                [
                    [$StBpPowL, 0x01800198n]
                ], (a, b) => {
                    const r = (a.mTurn) ? 0.9 : 1.5;
                    a.pp = numCast(a.pp * r);
                    a.pm = numCast(a.pm * r);
                    a.pa = numCast(a.pa * r);

                    if (!a.mTurn) { a.uiAddAura(408); }
                }
            ]
        ]],

        // DI
        [0x800385n, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00800385n]
                ], a => {
                    const r = a.mRflMtL;
                    for (const i in r) { r[i] *= 0.5; }
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpDmgL, 0x00800385n],
                    [$StBpDmgR, 0x00800385n]
                ], (a, b) => {
                    b.pp = numCast(b.pp * 0.1);
                    b.pm = numCast(b.pm * 0.1);
                    b.pa = numCast(b.pa * 0.12);
                }
            ]/*,
            [
                [
                    []
                ],
                [
                    [$StApSetL, 0x00800385n],
                    [$StApSetR, 0x00800385n]
                ], a => {
                    a.nHpMin = a.mHpNow - numCast(a.mHpMax * 0.3) || 0;
                    a.nSdMin = a.mSdNow - numCast(a.mSdMax * 0.3) || 0;
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpDefL, 0x00800385n]
                ], (a, b) => {
                    b.pp = numCast(b.pp * 0.4);
                    b.pm = numCast(b.pm * 0.4);
                    b.pa = numCast(b.pa * 0.4);
                }
            ]
            */
        ]],
        
        // -------------------------------------------------------------------------------
        //  * Mystery Equips *
        // -------------------------------------------------------------------------------

        // CHERRY
        [0xc00385n, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x00c00385n]
                ], a => {
                    const n = a.mLevel, m = n * 10;
                    a.mHpFix += m; a.mSdFix += m;
                    a.mHpHealFix += m; a.mSdHealFix += m;
                    a.mResP += n; a.mResM += n;
                }
            ]
        ]],

        // GRAPE
        [0xc00386n, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x00c00386n]
                ], a => {
                    const n = a.mLevel, m = n * 10;
                    a.mHpFix += m; a.mSdFix += m;
                    a.mHpHealFix += m; a.mSdHealFix += m;
                    a.mResP += n; a.mResM += n;
                }
            ]
        ]],

        // APPLE
        [0xc00387n, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x00c00387n]
                ], a => {
                    const n = a.mLevel, m = n * 10;
                    a.mHpFix += m; a.mSdFix += m;
                    a.mHpHealFix += m; a.mSdHealFix += m;
                    a.mResP += n; a.mResM += n;
                }
            ]
        ]],

        // SWORD
        [0xc00835n, []],

        // BOW
        [0xc00836n, []],

        // STAFF
        [0xc00837n, []],

        // BLADE
        [0xc00838n, [
            [
                [
                    []
                ],
                [
                    [$StBpCrtL, 0x00c00838n]
                ], (a, b) => {
                    a.pa += numCast(a.PowFixP.now() * 0.5); // numCast((a.mPowMulP + a.mPowAddP) * 0.5);
                }
            ]
        ]],

        // ASSBOW
        [0xc00839n, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x00c00839n]
                ], (a, b) => {
                    a.pp += numCast(b.mSdNow * 0.3);
                }
            ]
        ]],

        // DAGGER
        [0xc0083an, [
            [
                [
                    [0x100bbbn]
                ],
                [
                    [$StBpAtkL, 0x00100bbbn] // Replace AI 2 if presents
                ], (a, b) => {
                    const t = a.mPowPM * 9, d = t * 20 + t * b.Flare.now() * 3 || 0;
                    a.pa += numCast(d * 0.0025);
                }
            ],
            [
                [
                    [0x200bbbn]
                ],
                [
                    [$StBpAtkL, 0x00200bbbn] // Replace AI 3 if presents
                ], (a, b) => {
                    b.Flare.inc(2);
                }
            ]
        ]],
        
        // WAND
        [0xc0083bn, [
            [
                [
                    [0x000bb9n]
                ],
                [
                    [$StBpSklL, 0x00000bb9n] // Replace MO 1 if presents
                ], (a, b) => {
                    if (a.NoSkl.now() > 0 || (a.mTurn && (!G.isS(a, b)))) { return; }

                    // const n = numCast(
                    //     Math.max(Math.min(a.mPowMulM - b.mPowMulM, 7000), 0) * 0.1
                    // ), m = (numCast(a.mPowM * 0.6) + numCast(a.mSdMax * 0.04)) * (1 + n * 0.01);
                    // a.pm += numCast(m) + numCast(m * 0.6);
                    
                    let t0 = a.mInt, t1 = a.mSpr;

                    if (t0 < t1) {
                        const t = t0;
                        t0 = t1; t1 = t;
                    }
                    const m = numCast(
                        (numCast(a.mPowM * 0.35) + numCast(a.mSdMax * 0.05)) * numCast(
                            Math.min(t0 * 50 / t1 || 100, 1100) * 0.01
                        )
                    );
                    a.pm += numCast(m) + numCast(m * 0.4);
                    
                    a.uiAddArt1(3001);
                }
            ]
        ]],

        // SHIELD
        [0xc0083cn, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00c0083cn]
                ], a => {
                    const p = -40 * a.mDpr;
                    for (const B of a.E) {
                        for (const b of B) {
                            b.mHpRecRat += p; b.mSdRecRat += p;
                        }
                    }
                }
            ]
        ]],

        // CLAYMORE
        [0xc0083dn, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x00c0083dn]
                ], (a, b) => {
                    a.crt = !0;
                }
            ]
        ]],

        // SPEAR
        [0xc0083en, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x00c0083en]
                ], (a, b) => {
                    a.pm += numCast(b.mHpNow * 0.3);
                }
            ]
        ]],

        // LONGSWORD
        [0xc0083fn, [
            [
                [
                    [0x100bben]
                ],
                [
                    [$StBpAtkL, 0x00100bben] // Replace YI 2 if present
                ], (a, b) => {
                    const n = numCast(a.mPowPM * 1.4);
                    a.pp += n; a.pm += n;
                }
            ]
        ]],

        // LONGSTAFF
        [0xc00840n, [
            [
                [
                    [0x200bc2n]
                ],
                [
                    [$StIpAddN, 0x02200bc2n] // Replace XIA 3 if present
                ], a => {
                    let n = 0, m = 0;
                    for (const B of a.E) {
                        for (const b of B) { n += b.mDefFixP; m += b.mDefFixM; }
                    }
                    a.mAtkFixM += numCast((n * 0.35 + m * 0.15) * a.mDpr);
                    a.mSdFix += numCast(a.mGrowth);
                }
            ]
        ]],

        // GLOVES
        [0xc00899n, []],

        // BRACELET
        [0xc0089an, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x00c0089an]
                ], (a, b) => {
                    if (a.crt && !a.rndUni(20)) { return; }
                    a.pm += a.pm;
                    a.uiAddAct("Equip2202");
                }
            ]
        ]],

        // VULTURE
        [0xc0089bn, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00c0089bn]
                ], a => {
                    a.mLchMtL[1] += a.mLchMtL[3] * 0.2;
                    a.mLchMtR[1] += a.mLchMtR[3] * 0.2;
                }
            ]
        ]],

        // RING
        [0xc0089cn, [
            [
                [
                    [0x000bb8n]
                ],
                [
                    [$StBpAtkL, 0x00c0089cn]
                ], (a, b) => {
                    const n = numCast((a.mGrowth + 100) * 0.2)
                    a.pp += n; a.pm += n;
                }
            ]
        ]],

        // DEVOUR
        [0xc0089dn, [
            [
                [
                    [0x200bbfn]
                ],
                [
                    [$StEpSetL, 0x00200bbfn],
                    [$StEpSetR, 0x00200bbfn]
                ], a => {
                    let h = 0, s = 0;
                    for (const B of a.E) {
                        for (const b of B) {
                            h += numCast(b.nRecH * 0.6) + numCast(b.nRecS * 0.3);
                            s += numCast(b.nRecS * 0.6);
                        }
                    }
                    a.nRecH += h * a.mDpr;
                    a.nRecS += s * a.mDpr;
                }
            ]
        ]],

        // REFRACT
        [0xc0089en, [
            [
                [
                    [0x100bc0n]
                ],
                [
                    [$StBpDmgL, 0x00100bc0n]
                ], (a, b) => {
                    if (b.mSdNow < b.mSdMax || b.mHpNow < b.mHpMax) { return; }
                    a.Sight.inc(1);
                }
            ],
            [
                [
                    [0x100bc0n]
                ],
                [
                    [$StBpDmgR, 0x00100bc0n]
                ], (a, b) => {
                    if (a.Sight.now() < 1) { return; }
                    a.Sight.dec(1);
                    b.pp = 0; b.pm = 0; b.pa = 0;
                    a.uiAddArt2(3008);
                }
            ]
        ]],

        // PLATE
        [0xc008fdn, []],

        // LEATHER
        [0xc008fen, []],
        
        // CLOTH
        [0xc008ffn, []],

        // CLOAK
        [0xc00900n, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00c00900n]
                ], a => {
                    a.mSdRat += 50;
                }
            ]
        ]],

        // THORN
        [0xc00901n, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00c00901n]
                ], a => {
                    a.mRflRat += 25;
                }
            ]
        ]],

        // WOOD
        [0xc00902n, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkR, 0x00c00902n]
                ], (a, b) => {
                    a.nRecH += numCast(a.mHpMax * 0.05 * a.mDps);
                }
            ]
        ]],

        // CAPE
        [0xc00903n, [
            [
                [
                    []
                ],
                [
                    [$StBpPowR, 0x00c00903n]
                ], (a, b) => {
                    const n = Math.min(numCast(b.pp * 0.5), NumMax);
                    b.pp -= n; b.pm += n;
                }
            ]
        ]],

        // SCARF
        [0xc00961n, []],

        // TIARA
        [0xc00962n, [
            [
                [
                    [0x100bbcn]
                ],
                [
                    [$StIpMulN, 0x00100bbcn] // Replace MENG 2 if presents
                ], a => {
                    a.mSdRat += 15;
                }
            ],
            [
                [
                    [0x100bbcn]
                ],
                [
                    [$StBpPowR, 0x00100bbcn] // Replace MENG 2 if presents
                ], (a, b) => {
                    b.Light.inc(1); b.SpdRat.dec(4);
                }
            ]
        ]],
        
        // RIBBON
        [0xc00963n, [
            [
                [
                    [0x200bban]
                ],
                [
                    [$StApSetL, 0x00200bban], // Replace LIN 3 if presents
                    [$StApSetR, 0x00200bban]
                ], a => {
                    a.nRecH += numCast(a.mHpMax * 0.06 * a.mDps);
                }
            ]/*,
            [
                [
                    [0x200bban]
                ],
                [
                    [$StCpSetL, 0x00200bban],
                    [$StCpSetR, 0x00200bban]
                ], a => {
                    const n = numCast(a.mHpMax * 0.08 * a.mDps);
                    a.mHpNow += n;
                    a.uiAddArt3(3002, "+" + Math.floor(n));
                }
            ]
            */
        ]],

        // WITCHER
        [0xc00964n, [
            [
                [
                    [0x200bbdn]
                ],
                [
                    [$StBpSklL, 0x00200bbdn]  // Replace WEI 3 if presents
                ], (a, b) => {
                    a.pp += numCast(b.mLifeMax * 0.147);
                    // a.pm = numCast(a.pm * 0.3);
                    a.pa += numCast(b.mLifeMax * 0.063);
                }
            ]
        ]],

        // FIERCE
        [0xc00965n, [
            // Evaluated last
            [
                [
                    [0x200bc3n]
                ],
                [
                    [$StIpAddN, 0x0120bc3n]   // Replace YA 3 if presents
                ], a => {
                    const p = -30 * a.mDpr;
                    for (const B of a.E) {
                        for (const b of B) {
                            b.mPowMulP = eftMadd(b.mPowMulP, p); b.mPowAddP = eftMadd(b.mPowAddP, p);
                            b.mPowMulM = eftMadd(b.mPowMulM, p); b.mPowAddM = eftMadd(b.mPowAddM, p);
                            b.mSpd = eftMadd(b.mSpd, p);
                        }
                        a.mDefFixP = numCast(a.mDefFixP * 1.2);
                        a.mDefFixM = numCast(a.mDefFixM * 1.2);
                    }
                }
            ]
        ]]

    ]);
    
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Initialization *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    Rng.seed(BigInt(Date.now())); // this.seed(BigInt(+Data.Seed || 0));

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Exports *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    const gInfoEquipNull = {k: 0, r: 0, l: ""};
    this.__proto__ = {
        Rules,
        ActorStats, 
        EmuActorKind, EmuStatusKind,
        EmuEquipKind, EmuEquipStats, EmuEquipStatAdd, EmuEquipStatMul, EmuEquipRankKind,
        EmuAuraKind,
        EmuArt1Kind, EmuArt2Kind, EmuArt3Kind,
        EmuGemKind,

        EftBase, LvlBase, NumMin, NumMax,

        idSub, numCast, 
        eftMul1, eftMul2, eftMul3, eftMadd, eftAmul,

        // Random Number Generator
        rngShuffle, rngNumber, rngBigInt, rngUniform, rngExp1, rngBeta22, rngBeta13, 
        
        // Construct an vector randomizer within N-dimensional cube
        // Should support N <= 16 (one could generalize this for any N by chaning bit counting algorithm below)
        // Keep in mind that the complexity is (2^N) for both time and space, so even if we could support large N, the cost would not be reasonable
        //
        // TODO:
        //   The result does not seemed to be distributed uniformly?
        //
        RngVec: (n) => {

            // Initialize lookup table
            const N = BigInt(n), NN = Number(N), T = Array(n).fill().map(() => []);
            n = (1n << BigInt(N)) - 1n;
            while (n--) {
                // Counting set bit of the 16-bit number
                let i = n - ((n >> 1n) & 0x5555n);
                i = (i & 0x3333n) + ((i >> 2n) & 0x3333n);
                T[(((i + (i >> 4n)) & 0xf0fn) * 0x101n) >> 0x8n & 0xffn].push(n);
            }

            // Returning a function:
            // Generates n-dimensional vector in the intersection of:
            //  - v0 + ... + vn = m
            //  - 0 < vi < 1
            // And then transform it to c1 * vi + c0
            return (m, c1, c0) => {
                const R = Array(NN);

                // If m is not in the possible range, return dummy value
                if (m >= NN) { return R.fill(c1 + c0); }
                R.fill(c0);
                if (m <= 0) { return R; }

                // Generate uniform weight of each vertex from the unit simplex
                const 
                    n = Math.floor(m), r = m - n, t = T[n], l = NN - n,
                    A = Array(t.length * l - 1).fill().map(rngUniform).sort()
                ;
                A.unshift(0); A.push(1);
                
                // Calculate the sampling point with scale factors
                let p0 = 0, p1 = 0;
                for (const n of t) {
                    let a = 0, b = N;
                    p1 = p0 + l;
                    do {
                        a += (A[p0] = (A[p0 + 1] - A[p0]) * c1);
                    } while (++p0 < p1);
                    while (b--) {
                        R[b] += (n >> b & 1n) ? a : A[--p1] * r;
                    }
                }
                return R;
            };
        },

        SHA3, MT, 
        
        ObjBase, ArrBase, VecBase, SetBase, MapBase,

        Card, Equip, Fruit, Aura, Wish, Amulet, Dice, Gems, User, Unit, Fighter, Arena, Fight, FightArr, Record,
        EquipArr, EquipVec, FruitArr, FruitVec,

        Team: (unit = [], mode = 0) => {
            const T = unit.map(u => new Fighter(u));
            T.mode = mode;
            return T;
        },

        setBattle: (a, cfg) => {
    
            const T = {}, G = [];
            let nRoundNow = 1n;
        
            a.team(cfg);
            a.ipSet();
    
            const aa = a.AA;
        
            // Show information
            T.team = aa.map(t =>
                t.map(u => {
                    return {
                        nm: u.mName, at: u.mActor, lv: u.mLevel, 
                        hp: u.mHpMax, sd: u.mSdMax,
                        sp: u.mSpd,
                        pp: u.mPowP, pm: u.mPowM,
                        dp: u.mDefFixP, dm: u.mDefFixM,
                        eq: u.mEquip.map(e => {
                            return e ? { k: e.mKind, r: e.mRank, l: e.mLevel } : gInfoEquipNull;
                        }),
                        fa: [...u.mAura]
                    };
                })
            );
            T.mode = cfg.map(t => t.mode);
            T.game = G;
        
            let winner;
            do {
                // Step forward
                winner = a.step();
        
                // Push battle log
                G.push(aa.map(t => t.map(u => {
                    return {
                        act: u.nIsAct,
                        msg: u.nMsg, dbg: Rules.VerboseAll ? u.nDbg : null,
                        pa: u.nPowP, ma: u.nPowM, aa: u.nPowA, hd: u.nDmgH, hr: u.nRecH, sd: u.nDmgS, sr: u.nRecS,
                        hpn: u.mHpNow, sdn: u.mSdNow,
                        hpr: u.uiHpBar(), sdr: u.uiSdBar()
                    };
                })));
        
                // Reset temerories
                a.flush();
        
                // Run until winner is power of 2 or 0
            } while ((winner & winner - 1n) && nRoundNow++ < a.Rounds);
        
            // Result
            T.sign = winner;
    
            return T;
        },

        setRoller: (N, L, R) => {
            const T = {}, G = [];

            T.info = N ?? "";

            // Start
            T.game = G;
            const mL = L.mLp, mR = R.mLp;
            let nL = mL, nR = mR;
            do {
                const pL = rngNumber(6) + 1, pR = rngNumber(6) + 1;
                let dL = 0, dR = 0, aL = "", aR = "";
                if (pL > pR) {
                    if (pR == 5) { dL = -R.mRfl; aR = "Rfl"; }
                    else {
                        dR = -L.mAtk;
                        if (pL == 4) { dL = L.mLch; aL = "Lch"; }
                        else if (pL == 6) { dR -= L.mCrt; aL = "Crt"; }
                        if (pR == 3) { dR += R.mDef; aR = "Def"; }
                    }
                }
                else if (pR > pL) {
                    if (pL == 5) { dR = -L.mRfl; aL = "Rfl"; }
                    else {
                        dL = -R.mAtk;
                        if (pR == 4) { dR = R.mLch; aR = "Lch"; }
                        else if (pR == 6) { dL -= R.mCrt; aR = "Crt"; }
                        if (pL == 3) { dL += L.mDef; aL = "Def"; }
                    }
                }
                else {
                    if (pL <= 3) { dL = L.mRul; dR = R.mRul; }
                    else { dL = -R.mRul; dR = -L.mRul; }
                }

                // Apply
                nL += dL; nR += dR;

                // Record
                G.push([pL, mL, nL, dL, aL, pR, mR, nR, dR, aR]);
                
                // Loop until someone run of life point.
            } while (nL > 0 && nR > 0);

            // If left hand side aLive, win; otherwise lose.
            T.sign = (nL > 0);

            return T;
        }
    }
}

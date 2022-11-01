/*
Project: fygemu
Authors: hirakana@kf
*/

// Setup
(globalThis.window ? (window.Kernel ??= {}) : exports).constructor = function (Data, Lib, Fmt) {

    const 

        {MT, Rng, rngNumber, rngUniform, rngShuffle} = Lib,
        {
            ObjBase, ArrBase, VecBase, SetBase, MapBase,
            Fruit, Wish, Amulet, Dice, Fight, Record, Aura,
            FruitArr, FruitVec, FightArr,
            StatusNull, StatusCtor
        } = Fmt,

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
        EmuGemKind = Data.Gem,

        Mtx22 = [1, 0, 0, 1],
        Mtx33 = [1, 0, 0, 0, 1, 0, 0, 0, 1],

        gInfoEquipNull = {k: 0, r: 0, l: ""}
    ;

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Actor * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class Actor extends Fmt.Actor {
        
        set () {
            const [m, a] = (EmuActorKind[""+this.mKind] ?? {}).point ?? [0, 0];
            this.nPoint = $EquActorPoint(m, a, this.mLevel, this.mTrait);
            return this;
        }
    };

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Equip * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class Equip extends Fmt.Equip {

        set () {
            let Q = this.mAttr;
            const A = EmuEquipKind[this.mKind].stats, L = $EquEquipLevel(this.mLevel), N = Q.length - A.length;
            if (N > 0) { Q.splice(0, N); }
            if (N < 0) { Q.splice(Q.length, 0, ...Array(-N).fill(0)); }
            this.mAttr = Q;
            this.mStat = Q.map((q, i) => {
                const [attrKind, attrMul, attrAdd] = A[i];
                return [attrKind, $EquEquipStats(attrMul, attrAdd, L, q)]
            })
            return this;
        }
    }

    class EquipArr extends Fmt.EquipArr {}
    Object.defineProperty(
        EquipArr.prototype, "$", {value: Equip, writable: false, enumerable: false}
    );

    class EquipVec extends Fmt.EquipVec {}
    Object.defineProperty(
        EquipVec.prototype, "$", {value: Equip, writable: false, enumerable: false}
    );

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Gem * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    
    class Gems extends Fmt.Gems {}
    Object.defineProperty(
        Gems.prototype, "$", {value: Object.fromEntries(Object.keys(EmuGemKind).map(k => [k, ["f64", k, 3, 0]])), writable: false, enumerable: false}
    );

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * User * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class User extends Fmt.User {

        set () {
            // This could not be changed alone, see server/dbs/mongodb.js
            this.mGrade = Math.sqrt(this.mExp);
            return this;
        }
    }

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Unit * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class Unit extends Fmt.Unit {
        
        constructor (user = null, actor = null, equip = null, amulet = null, wishs = null, auras = null, dice = null, gems = null, pve = 0) {
            super();
            
            this.mUser = user ?? new User();
            this.mActor = actor ?? new Actor();
            this.mEquip = equip ?? new EquipArr();
            this.mAmulet = amulet ?? new Amulet();
            this.mWish = wishs ?? new Wish();
            this.mAura = auras ?? new Aura();
            this.mDice = dice ?? new Dice();
            this.mGems = gems ?? new Gems();
            this.nFlags = new SetBase();
            this.mIsPVE = pve;
        }

        setActor () {
            const u = this.mUser, c = this.mActor, a = this.mAmulet, l = c.mLevel, q = c.mTrait, C = {};

            c.set();
            this.nLevel = l; this.nActor = c.mKind; this.nTrait = q; this.nSkill = c.mSkill; this.nBuild = c.mBuild; this.nGrowth = c.mGrowth;
            C.str = $EquUnitPoint(this.nStr = $EquNumCast(c.mStr + a.mStr)); 
            C.agi = $EquUnitPoint(this.nAgi = $EquNumCast(c.mAgi + a.mAgi));
            C.int = $EquUnitPoint(this.nInt = $EquNumCast(c.mInt + a.mInt));
            C.vit = $EquUnitPoint(this.nVit = $EquNumCast(c.mVit + a.mVit));
            C.spr = $EquUnitPoint(this.nSpr = $EquNumCast(c.mSpr + a.mSpr));
            C.mnd = $EquUnitPoint(this.nMnd = $EquNumCast(c.mMnd + a.mMnd));
            C.L = $EquUnitPoint(this.nGrade = u.mGrade);
            C[""] = -1;
            
            this.nHandyAtk = $EquUnitPoint(u.mAtk);
            this.nHandyDef = $EquUnitPoint(u.mDef);

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
                    for (const l in A) { this[l] += $EquEmuRound2(A[l] * x); }
                }
                for (const k in P2) {
                    const x = C[k], A = P2[k];
                    for (const l in A) {
                        const Al = A[l], x2 = C[l] * x;
                        for (const m in Al) { this[m] += $EquEmuRound2(Al[m] * x2); }
                    }
                }
            }

            {
                const actor = EmuActorKind[""+this.nActor];
                if (!actor) { return; }

                const S = actor.stats, F = this.nFlags, L = $EquUnitStats(l, q);
                for (const attr in S ?? {}) {
                    const [m, a] = S[attr];
                    if (attr in this) { this[attr] += $EquEmuRound2(m * L) + a; }
                }
                for (const k of c.mFlags) { F.add(k); }
            }
        }

        setEquip () {
            const stats = {...this}, equips = this.mEquip;

            equips.forEach(e => {
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
                            this[k1] += $EquEmuRound2(r * N[k2] * stats[k2]);
                        }
                    }

                    for (const k1 in A) {
                        this[k1] += $EquEmuRound2(r * A[k1]);
                    }
                }
                const F = this.nFlags;
                for (const k of e.mFlags) { F.add(k); }
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
            const F = this.nFlags;
            for (const k of this.mAura) {
                for (const i of EmuAuraKind[k].flags) { F.add(i); }
            }
        }

        set () {
            this.clr();
            this.setActor();
            this.setEquip();
            this.setAmulet();
            this.setAura();
            return this;
        }
    };
    {
        const _ = Object.assign({}, Fmt.Unit.prototype.$);
        for (const k in EmuStatusKind) {
            _["c"+k] = ["f64", "$Num"+k, 3, 0];
            _["b"+k] = ["f64", "$Fix"+k, 3, false];
        }
        Object.defineProperty(
            Unit.prototype, "$", {value: _, writable: false, enumerable: false}
        );
    }

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Battle Engine * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class Fighter {

        constructor (u) {

            const 
                w = u.mWish,
                mPowMulP = u.nPowMulP, mPowAddP = u.nPowAddP + w.mPowP * 5,
                mPowMulM = u.nPowMulM, mPowAddM = u.nPowAddM + w.mPowM * 5,
                mPowMulA = u.nPowMulA, mPowAddA = u.nPowAddA
            ;
            
            this.mName = u.mUser.mName; this.mActor = u.nActor; this.mEquip = u.mEquip; this.mAura = u.mAura;
            this.mLevel = u.nLevel; this.mGrowth = u.nGrowth; this.mIsPVE = u.mIsPVE;
            this.mFlags = new SetBase(u.nFlags);

            this.mStr = u.nStr; this.mAgi = u.nAgi; this.mInt = u.nInt; this.mVit = u.nVit; this.mSpr = u.nSpr; this.mMnd = u.nMnd;
            this.mHpNow = this.mHpFix = this.mHpMax = u.nHpMaxMul + u.nHpMaxAdd + w.mHpMax * 12; this.mHpRat = u.nHpRat + $EquNumCast(w.mHpMax * 0.01);
            this.mSdNow = this.mSdFix = this.mSdMax = u.nSdMaxMul + u.nSdMaxAdd + w.mSdMax * 20; this.mSdRat = u.nSdRat + $EquNumCast(w.mSdMax * 0.01);
            this.mHpHealRat = u.nHpHealRat; this.mHpHealFix = u.nHpHealMul + u.nHpHealAdd;
            this.mSdHealRat = u.nSdHealRat; this.mSdHealFix = u.nSdHealMul + u.nSdHealAdd;
            this.mHpRecRat = this.mSdRecRat = u.nRecRat;
            this.mPowMulP = mPowMulP; this.mPowAddP = mPowAddP; this.mPowRatP = u.nPowRatP + $EquNumCast(w.mPowP * 0.01); 
            this.mPowMulM = mPowMulM; this.mPowAddM = mPowAddM; this.mPowRatM = u.nPowRatM + $EquNumCast(w.mPowM * 0.01);
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
            this.mHpPotNow = this.mHpPotMax = w.mHpPot; 
            this.mSdPotNow = this.mSdPotMax = w.mSdPot;
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
            this.isc = this.iss = this.isd = this.ise = 
            this.crt = this.skl =
            // Temporaries (attack)
            this.arp = this.afp = this.arm = this.afm = this.arc = this.afc = 
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
                h = $EquUnitHpMax(this.mHpFix, this.mHpRat),
                s = $EquUnitSdMax(this.mSdFix, this.mSdRat),
                pp = this.mPowMulP + this.mPowAddP,
                pm = this.mPowMulM + this.mPowAddM,
                pa = this.mPowMulA + this.mPowAddA
            ;
            this.mHpNow = this.mHpMax = h;
            this.mSdNow = this.mSdMax = s;
            this.mLifeMax = h + s;
            this.mPowP = pp; this.mPowM = pm; this.mPowA = pa;
            this.mPowPM = pp + pm;
            this.mHpPotNow = this.mHpPotMax;
            this.mSdPotNow = this.mHpPotMax;

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
            if (this.NoCrt.now() > 0) { return 0; }
            
            if (this.isc) {
                if (!that.isd) { return this.crt = 1; }
            }
            else if (that.isd) { return 0; }

            const 
                l = this.mCrtMul + this.mCrtAdd,
                m = l - (l + that.mDodMul + that.mDodAdd) * this.mCrtScl,
                n = ((m > 0) ? $EquNumCast(100 * m / (this.mCrtDiv + m)) : 0) + this.CrtRat.now() - that.DodRat.now(),
                p = this.rndUni(n)
            ;
            this.crt |= p;
            return p;
        }

        // Skill activation
        isS (that) {
            if (this.NoSkl.now() > 0) { return 0; }

            if (this.iss) {
                if (!that.ise) { return this.skl = 1; }
            }
            else if (that.ise) { return 0; }

            const 
                l = this.mSklMul + this.mSklAdd,
                m = l - (l + that.mEvaMul + that.mEvaAdd) * this.mSklScl,
                n = ((m > 0) ? $EquNumCast(100 * m / (this.mSklDiv + m)) : 0) * (1 + 0.01 * (this.SklRat.now() - that.EvaRat.now())),
                p = this.rndUni(n)
            ;
            this.skl |= p;
            return p;
        }

        // Tick timer
        tick () {
            return this.mSpdNow += Math.max($EquUnitSpd(this.mSpd, this.SpdRat.now()), $EquNumMin);
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
            this.nRecH = $EquUnitHpHeal(this.mHpMax, this.mHpHealRat, this.mHpHealFix) * this.mHhr * this.mDps;
            this.nRecS = $EquUnitSdHeal(this.mSdMax, this.mSdHealRat, this.mSdHealFix) * this.mShr * this.mDps;

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
            if (this.mHpPotNow > 0 && this.mHpMax * 0.8 > this.mHpNow) {
                this.nRecH += this.mHpMax * this.mHpPotNow * 0.005;
                this.mHpPotNow = 0;
                this.uiAddHpPot();
            }
            if (this.mSdPotNow && this.mSdMax * 0.8 > this.mSdNow) {
                this.nRecS += this.mSdMax * this.mSdPotNow * 0.005;
                this.mSdPotNow = 0;
                this.uiAddSdPot();
            }
        }

        // Battle
        bpSet () {
            this.pp = 0; this.pm = 0; this.pa = 0; this.rp = this.mResP; this.rm = this.mResM;
            this.arp = this.AtkRatP.now(); this.afp = this.AtkFixP.now(); this.arm = this.AtkRatM.now(); this.afm = this.AtkFixM.now(); 
            this.brp = this.DefRatP.now(); this.bfp = this.DefFixP.now(); this.brm = this.DefRatM.now(); this.bfm = this.DefFixM.now(); 
            this.arc = this.AtkRatC.now(), this.afc = this.AtkFixC.now();
            this.isc = 0; this.iss = 0; this.isd = 0; this.ise = 0; this.crt = 0; this.skl = 0;
        }

        // Attack
        bpAtk (that) {
            this.pp = this.mPowP; this.pm = this.mPowM; this.pa = this.mPowA;
        }

        // Critical
        bpCrt (that) {
            this.pp += this.pp;
            this.pm = $EquNumCast(this.pm * 1.5);
            this.pa += this.pa;
            this.arp += this.arc; this.afp += this.afc;
            this.arm += this.arc; this.afm += this.afc;
            this.uiAddAct($MsgActCrt);
        }

        // Defend
        bpDef (that) {
            const r = Math.min(this.RflRat.now(), 150);
            if (r > 0) {
                const ml = that.mRflMtL, mr = this.mRflMtR, pp = that.pp, pm = that.pm, pa = that.pa;
                this.pp += $EquUnitRfl(pp * ml[0] * mr[0] + pm * ml[1] * mr[1] + pa * ml[2] * mr[2], r);
                this.pm += $EquUnitRfl(pp * ml[3] * mr[3] + pm * ml[4] * mr[4] + pa * ml[5] * mr[5], r);
                this.pa += $EquUnitRfl(pp * ml[6] * mr[6] + pm * ml[7] * mr[7] + pa * ml[8] * mr[8], r);
                this.uiAddAct($MsgActRfl);
            }
        }

        // Damage multiplier
        bpScl (that) {
            const
                rp = this.PowRatP.now() - that.ResRatP.now(),
                rm = this.PowRatM.now() - that.ResRatM.now()
            ;
            if (rp) { this.pp = $EquUnitScl(this.pp, rp); }
            if (rm) { this.pm = $EquUnitScl(this.pm, rm); }
        }

        // Display power
        bpPow (that) {

            // Critical
            if (this.crt) {
                const r = this.PowRatC.now() - that.ResRatC.now();
                this.pp = $EquUnitScl(this.pp, r);
                this.pm = $EquUnitScl(this.pm, r);
                this.pa = $EquUnitScl(this.pa, r);
            }

            // Skill
            if (this.skl) {
                const r = this.PowRatS.now() - that.ResRatS.now();
                this.pp = $EquUnitScl(this.pp, r);
                this.pm = $EquUnitScl(this.pm, r);
                this.pa = $EquUnitScl(this.pa, r);
            }

            // Handicap
            if (!this.mIsPVE) {
                const 
                    ha = (this.nHandyAtk - that.nHandyAtk) * 3, 
                    hd = (this.nHandyDef - that.nHandyDef) * 3
                ;
                if (ha > 0) {
                    this.pp = $EquUnitScl(this.pp, ha);
                    this.pm = $EquUnitScl(this.pm, ha);
                    this.pa = $EquUnitScl(this.pa, ha);
                }
                if (hd < 0) {
                    this.pp = $EquUnitScl(this.pp, hd);
                    this.pm = $EquUnitScl(this.pm, hd);
                    this.pa = $EquUnitScl(this.pa, hd);
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

            hpr = $EquUnitDef(that.arp, that.afp, this.brp, this.bfp);
            hmr = $EquUnitDef(that.arm, that.afm, this.brm, this.bfm);

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
            // this.nVecH[that.I] += ht; this.nVecS[that.I] += st;
            this.nDecH += ht; this.nDecS += st;
        }

        // Collect and estimate total damage
        cpSet () {
            let h = 0, s = this.mSdNow;

            // Infinite shield
            if (s > $EquNumMax) {
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
                    else { hd = $EquNumCast(hd * (1 - s / sd)); s = 0; }
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
                    else { hd = $EquNumCast(hd * (1 - s / sd)); s = 0; }
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
                    else { hd = $EquNumCast(hd * (1 - s / sd)); s = 0; }
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
            
            /*
            const r = this.LchRat.now();
            if (r > 0) {
                const I = this.I, [HH, HS, SH, SS] = mt;
                let h = 0, s = 0;
                for (const B of this.E) {
                    for (const b of B) {
                        h += $EquUnitLch(b.nVecH[I] * b.nDecH || 0, r, HH);
                        s += $EquUnitLch(b.nVecH[I] * b.nDecH || 0, r, HS);
                        h += $EquUnitLch(b.nVecS[I] * b.nDecS || 0, r, SH);
                        s += $EquUnitLch(b.nVecS[I] * b.nDecS || 0, r, SS);
                    }
                }
                this.nRecH += h;
                this.nRecS += s;
            }
            */

            const r = this.LchRat.now();
            if (r > 0) {
                const 
                    pp = this.nPowP, pm = this.nPowM, pa = this.nPowA,
                    [HH, HS, SH, SS] = mt
                ;
                this.nRecH += 
                    $EquUnitLch(pp + pa || 0, r, HH) +
                    $EquUnitLch(pm + pa || 0, r, HS)
                ;
                this.nRecS += 
                    $EquUnitLch(pp + pa || 0, r, SH) +
                    $EquUnitLch(pm + pa || 0, r, SS)
                ;
            }
            
            return !0;
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
            this.nRecH = hr = Math.max($EquUnitHpRec(hr, this.HpRecRat.now()), 0);
            this.nRecS = sr = Math.max($EquUnitSdRec(sr, this.SdRecRat.now()), 0);

            // Health
            if (h <= $EquNumMax) {
                h += hr;                                                        // Health recover
                hd = Math.min(hd, h - this.nHpMin || 0);                        // Health lock
                if (Rules.NoOverkill && h < hd) { hd = h; }                     // Prevent overkill
                this.mHpNow = h = (h > hd) ? Math.min(h - hd, hm) : 0;          // Apply damage
                this.nDmgH = hd;                                                // Show damage

                // Infinite damage
                if (hd > $EquNumMax) {
                    this.nDmgS = hd;
                    this.mSdNow = 0;
                    return 1;
                }
            }

            // Shield
            if (s <= $EquNumMax) {
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
            return this.mRng.step() < $EquNumCast(184467440737095520 * n); // 2**64 * 0.01 * n
        }

        uiClear () {
            this.nMsg = [];
            this.nDbg = [];
        }

        uiAddHpPot () {
            this.nMsg.push([$BmHpot, "", ""]);
        }

        uiAddSdPot () {
            this.nMsg.push([$BmSpot, "", ""]);
        }

        uiAddStatus (i, m = "") {
            this.nMsg.push([$BmStat, i, m]);
        }

        uiAddAct (i, m = "") {
            this.nMsg.push([$BmAct, i, m]);
        }

        uiAddSkl (i, m = "") {
            this.nMsg.push([$BmSkl, i, m]);
        }

        uiAddSklEx (i, m = "") {
            this.nMsg.push([$BmSklEx, i, m]);
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

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Arena * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class Arena extends Fmt.Arena {

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
            const AO = this.AO, AU = this.AA.map(t => new Set(t)), ept = this.Ept, eft = this.Eft, hook = this.Flow;

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
                const t = this.Clock, x = (t < 21600000 || t >= 68400000) ? $FlDay : $FlNight;

                // Pre-callbacks for ability check.
                for (const a of AO) {
                    const cflags = a.mFlags;
                    cflags.add(x);
                    for (const k of hook) { a[k] = new Map(); }
                    for (const k of cflags) {
                        const T = ept.get(k);
                        if (!T) { continue; }
                        for (const [C, p] of T) {
                        __lbNextCheck:
                            for (const cc of C) {
                                for (const k of cc) {
                                    if (!cflags.has(k)) { continue __lbNextCheck; }
                                }
                                p(a);
                                break;
                            }
                        }
                    }
                }

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
            const r = this.SpdMin;
            if (r < $EquNumMin) { return; }
            for (const U of this.AU) { 
                for (const u of U) { u.SpdRat.floor(r); }
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

            | (1) | (2) |   (3)    | 
        0x  |  0  |  0  |  000000  | n

    (1) Priority:
        - Controls the execution order of callbacks. 
        The higher priority given, the later it would get called.

    (2) Kind:
        - 0: Aura
        - 4: Myst
        - 8: Arts
        - Other values are reserved.

    (3) Id:
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
    Arena.prototype.Ept = new Map([
        
        // ZOU
        [0x000044d, [
            [
                [
                    []
                ], a => {
                    for (const B of a.E) {
                        for (const b of B) {
                            b.mFlags.add(0x000044d);
                        }
                    }
                }
            ]
        ]],

        // PIAO
        [0x000044e, [
            [
                [
                    []
                ], a => {
                    for (const B of a.E) {
                        for (const b of B) {
                            b.mFlags.add(0x000044e);
                        }
                    }
                }
            ]
        ]],

        // PEN
        [0x000044f, [
            [
                [
                    []
                ], a => {
                    for (const B of a.E) {
                        for (const b of B) {
                            b.mFlags.add(0x000044f);
                        }
                    }
                }
            ]
        ]]
    ]);
    Arena.prototype.Eft = new Map([        

        // -------------------------------------------------------------------------------
        //  * Auras *
        // -------------------------------------------------------------------------------

        // SHI
        [0x0000065, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00000065n]
                ], a => {
                    const t = $EquNumCast(a.mLevel * 2 * (1 + a.mAura101 * 0.05));
                    a.mResP += t; a.mResM += t;
                }
            ]
        ]],

        // XIN
        [0x0000066, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00000066n]
                ], a => {
                    const t = $EquNumCast(a.mLevel * 10 * (1 + a.mAura102 * 0.05));
                    a.mHpFix += t; a.mSdFix += t;
                }
            ]
        ]],

        // FENG
        [0x0000067, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00000067n]
                ], a => {
                    const t = $EquNumCast(a.mLevel * 5 * (1 + a.mAura103 * 0.05));
                    a.mPowAddP += t; a.mPowAddM += t;
                }
            ]
        ]],

        // TIAO
        [0x0000068, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00000068n]
                ], a => {
                    const r = a.mDpr, l = a.mLevel, x = a.E.reduce((t, e) => { e.forEach(b => { t += Math.max(b.mLevel - l, 0); }); return t; }, 0);
                    let p2 = $EquNumCast((x + x) * r), p10 = $EquNumCast(x * 10 * r);
                    if (a.mIsPVE && x > 100) { p2 = 200; p10 = 1000; }
                    a.mAtkFixP += p2; a.mAtkFixM += p2; a.mPowAddP += p10; a.mPowAddM += p10;
                }
            ]
        ]],

        // YA
        [0x0000069, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00000069n]
                ], a => {
                    const r = a.mDpr, l = a.mLevel, x = a.E.reduce((t, e) => { e.forEach(b => { t += Math.max(l - b.mLevel, 0); }); return t; }, 0);
                    let p3 = $EquNumCast(x * 3.0 * r);
                    if (a.mIsPVE && x > 100) { p3 = 300; }
                    a.mDefFixP += p3; a.mDefFixM += p3; a.mSpd += p3; 
                }
            ]
        ]],
        
        // BI
        [0x00000c9, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x100000c9n]
                ], a => {
                    a.mAtkRatP = $EquNumCast(a.mAtkRatP * 1.15);
                    a.mAtkFixP = $EquNumCast(a.mAtkFixP * 1.15);
                }
            ]
        ]],
        
        // MO
        [0x00000ca, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x100000can]
                ], a => {
                    a.mAtkRatM = $EquNumCast(a.mAtkRatM * 1.15);
                    a.mAtkFixM = $EquNumCast(a.mAtkFixM * 1.15);
                }
            ]
        ]],

        // DUN
        [0x00000cb, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x000000cbn]
                ], a => {
                    a.mSdDmgP = 1.25;
                }
            ]
        ]],

        // XUE
        [0x00000cc, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x000000ccn]
                ], a => {
                    a.mHpRecRat += 10; a.mSdRecRat += 10;
                    a.mLchRat += 10;
                }
            ]
        ]],

        // XIAO
        [0x00000cd, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x000000cdn]
                ], (a, b) => {
                    a.pa += $EquNumCast(b.mHpMax * 0.015) + $EquNumCast(b.mSdMax * 0.015);
                }
            ]
        ]],

        // SHENG
        [0x00000ce, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x000000cen]
                ], a => {
                    a.mDefFull = 0.8;
                }
            ]
        ]],
        
        // E
        [0x00000cf, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x010000cfn]
                ], (a, b) => {
                    if (!a.rndUni(1)) { return; }
                    a.pp += a.mPowP * 30;
                    a.pm += a.mPowM * 30;
                    a.uiAddSkl(0x00000cf);
                }
            ]
        ]],

        // SHANG
        [0x000012d, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x0000012dn]
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
        [0x000012e, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x0000012en]
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
        [0x000012f, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x0000012fn]
                ], a => {
                    a.mDefFixP = $EquNumCast(a.mDefFixP * 1.1);
                    a.mDefFixM = $EquNumCast(a.mDefFixM * 1.1);
                    a.mRflRat += 10;
                }
            ]
        ]],

        // REN
        [0x0000130, [
            [
                [
                    []
                ],
                [
                    [$StEpSetR, 0x00000130n]
                ], a => {
                    let p = 0, q = 0;
                    for (const B of a.E) {
                        for (const b of B) {
                            p += b.mAgi; q++;
                        }
                    }
                    if (a.mWait * a.mDpr < (6 * q * a.mAgi > p ? 3 : 4)) { return; }
                    a.mSpdNow = Infinity;
                    a.uiAddSkl(0x0000130);
                }
            ]
        ]],

        // RE
        [0x0000131, [
            [
                [
                    []
                ],
                [
                    [$StBpDmgL, 0x00000131n]
                ], a => {
                    a.SpdRat.inc(9);
                }
            ]
        ]],

        // DIAN
        [0x0000132, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x01000132n] // After arts
                ], a => {
                    a.mDefFixP = $EquNumCast(a.mDefFixP * 1.3);
                    a.mDefFixM = $EquNumCast(a.mDefFixM * 1.3);
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpPowL, 0x0100132n],
                    [$StBpPowR, 0x0100132n]
                ], (a, b) => {
                    a.pp = $EquNumCast(a.pp * 0.7);
                    a.pm = $EquNumCast(a.pm * 0.7);
                    a.uiAddSkl(0x0000132);
                }
            ]
        ]],

        // WU
        [0x0000133, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x00000133n]
                ], (a, b) => {
                    if ((a.mTurn + b.mTurn) < 15) { return; }
                    a.pa += $EquNumCast(a.mPowPM * 0.25);
                }
            ]
        ]],

        // ZHI
        [0x0000134, [
            [
                [
                    []
                ],
                [
                    [$StBpDmgL, 0x00000134n],
                    [$StBpDmgR, 0x00000134n]
                ], (a, b) => {
                    if (a.hpr > 0.9) { a.hpr = 0.9; }
                    if (a.hmr > 0.9) { a.hmr = 0.9; }
                    if (a.spr > 0.95) { a.spr = 0.95; }
                    if (a.smr > 0.95) { a.smr = 0.95; }
                }
            ]
        ]],

        // SHAN
        [0x0000135, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x00000135n] // Before JU?
                ], a => {
                    a.mSpd = 1;
                }
            ]
        ]],

        // FEI
        [0x0000191, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x00000191n]
                ], (a, b) => {
                    a.pp += $EquNumCast(a.mHpMax * 0.18);
                    a.uiAddSkl(0x0000191);
                }
            ]
        ]],

        // BO
        [0x0000192, [
            [
                [
                    []
                ],
                [
                    [$StApSetL, 0x00000192n],
                    [$StApSetR, 0x00000192n]
                ], a => {
                    if (a.mSdNow <= a.mSdMax * 0.7 || a.mHpNow <= a.mHpMax * 0.7) { return; }
                    a.AtkRatM.incTurn(30);
                    a.uiAddSkl(0x0000192);
                }
            ]
        ]],

        // JU
        [0x0000193, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x00000193n]
                ], a => {
                    a.mSpd = $EquNumCast(a.mSpd * 1.3);
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpCrtL, 0x00000193n]
                ], (a, b) => {
                    const 
                        m = $EquUnitSpd(a.mSpd, a.SpdRat.now()),
                        n = $EquUnitSpd(b.mSpd, b.SpdRat.now());
                    a.pa += $EquNumCast(m * ((m > n * 3) ? 12 : 9) * 0.2);
                    a.uiAddSkl(0x0000193);
                }
            ]
        ]],

        // HONG
        [0x0000194, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x00000194n],
                    [$StBpAtkR, 0x00000194n]
                ], (a, b) => {
                    const t = $EquNumCast(a.mLevel * 0.5);
                    if (a.arp < 40) { a.arp = 40; }
                    else { a.afp += t; }
                    if (a.arm < 40) { a.arm = 40; }
                    else { a.afm += t; }
                }
            ]
        ]],

        // JUE
        [0x0000195, [
            [
                [
                    []
                ],
                [
                    [$StBpDmgL, 0x00000195n],
                    [$StBpDmgR, 0x00000195n]
                ], (a, b) => {
                    b.pp = $EquNumCast(b.pp * 0.8);
                    b.pm = $EquNumCast(b.pm * 0.8);
                    b.pa = $EquNumCast(b.pa * 0.8);
                }
            ]
        ]],

        // HOU
        [0x0000196, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x10000196n]
                ], (a, b) => {
                    if (a.mWait < 1) { return; }
                    const n = 1 + a.mWait * 0.24;
                    a.pp = $EquNumCast(a.pp * n);
                    a.pm = $EquNumCast(a.pm * n);
                    a.pa = $EquNumCast(a.pa * n);
                    a.uiAddSkl(0x0000196);
                }
            ]
        ]],

        // DUNH
        [0x0000197, [
            [
                [
                    []
                ],
                [
                    [$StBpPowL, 0x00000197n],
                    [$StBpPowR, 0x00000197n]
                ], (a, b) => {
                    b.arp = $EquNumCast(b.arp * 0.65);
                    b.arm = $EquNumCast(b.arm * 0.65);
                }
            ]
        ]],

        // ZI
        [0x0000198, [
            [
                [
                    []
                ],
                [
                    [$StBpPowL, 0x10000198n]
                ], (a, b) => {
                    const r = (a.mTurn) ? 0.9 : 1.5;
                    a.pp = $EquNumCast(a.pp * r);
                    a.pm = $EquNumCast(a.pm * r);
                    a.pa = $EquNumCast(a.pa * r);

                    if (!a.mTurn) { a.uiAddSkl(0x0000198); }
                }
            ]
        ]],

        // DI
        [0x0000385, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x00000385n]
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
                    [$StBpDmgL, 0x00000385n],
                    [$StBpDmgR, 0x00000385n]
                ], (a, b) => {
                    b.pp = $EquNumCast(b.pp * 0.1);
                    b.pm = $EquNumCast(b.pm * 0.1);
                    b.pa = $EquNumCast(b.pa * 0.12);
                }
            ]/*,
            [
                [
                    []
                ],
                [
                    [$StApSetL, 0x00000385n],
                    [$StApSetR, 0x00000385n]
                ], a => {
                    a.nHpMin = a.mHpNow - $EquNumCast(a.mHpMax * 0.3) || 0;
                    a.nSdMin = a.mSdNow - $EquNumCast(a.mSdMax * 0.3) || 0;
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpDefL, 0x00000385n]
                ], (a, b) => {
                    b.pp = $EquNumCast(b.pp * 0.4);
                    b.pm = $EquNumCast(b.pm * 0.4);
                    b.pa = $EquNumCast(b.pa * 0.4);
                }
            ]
            */
        ]],

        // ZOU
        [0x000044d, [
            [
                [
                    []
                ],
                [
                    [$StBpPowL, 0x1000044dn],
                    [$StBpPowR, 0x1000044dn]
                ], (a, b) => {
                    const r = -0.7 + 0.2 * (a.mTurn + b.mTurn);
                    a.pp += $EquNumCast(a.pp * r);
                    a.pm += $EquNumCast(a.pm * r);
                    a.pa += $EquNumCast(a.pa * r);
                }
            ]
        ]],

        // PIAO
        [0x000044e, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x0000044en]
                ], a => {
                    a.Ticket.setImpl(1);
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StEpSetL, 0x2000044en],
                    [$StEpSetR, 0x2000044en]
                ], a => {
                    if (a.Ticket.now() > 0 && (a.mHpNow <= a.nDmgH)) {
                        a.nDmgH = a.nDmgS = 0;
                        a.mHpNow = a.mHpMax;
                        a.mSdNow = a.mSdMax;
                        a.Ticket.decImpl(1);
                        a.uiAddSkl(0x00044e);
                    }
                    a.nRecH *= 0.2;
                    a.nRecS *= 0.2;
                }
            ],
        ]],

        // PEN
        [0x000044f, [
            [
                [
                    []
                ],
                [
                    [$StBpPowL, 0x1000044fn],
                    // [$StBpPowR, 0x1000044fn]
                ], (a, b) => {
                    const r = a.crt ? 0.4 : -0.4;
                    a.pp += $EquNumCast(a.pp * r);
                    a.pm += $EquNumCast(a.pm * r);
                    a.pa += $EquNumCast(a.pa * r);
                }
            ]
        ]],
        
        // -------------------------------------------------------------------------------
        //  * Mystery Equips *
        // -------------------------------------------------------------------------------

        // CHERRY
        [0x4038500, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x04038500n]
                ], a => {
                    const n = a.mLevel, m = n * 10;
                    a.mHpFix += m; a.mSdFix += m;
                    a.mHpHealFix += m; a.mSdHealFix += m;
                    a.mResP += n; a.mResM += n;
                }
            ]
        ]],

        // GRAPE
        [0x4038600, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x04038600n]
                ], a => {
                    const n = a.mLevel, m = n * 10;
                    a.mHpFix += m; a.mSdFix += m;
                    a.mHpHealFix += m; a.mSdHealFix += m;
                    a.mResP += n; a.mResM += n;
                }
            ]
        ]],

        // APPLE
        [0x4038700, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x04038700n]
                ], a => {
                    const n = a.mLevel, m = n * 10;
                    a.mHpFix += m; a.mSdFix += m;
                    a.mHpHealFix += m; a.mSdHealFix += m;
                    a.mResP += n; a.mResM += n;
                }
            ]
        ]],

        // SWORD
        [0x4083500, []],

        // BOW
        [0x4083600, []],

        // STAFF
        [0x4083700, []],

        // BLADE
        [0x4083800, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x14083800n] // After YA 1
                ], (a, b) => {
                    if (a.crt) { a.pa += $EquNumCast(a.PowFixP.now() * 0.5); } // After change (e.g., YA 1)
                }
            ]
        ]],

        // ASSBOW
        [0x4083900, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x04083900n]
                ], (a, b) => {
                    a.pp += $EquNumCast(b.mSdNow * 0.18);
                }
            ]
        ]],

        // DAGGER
        [0x4083a00, [
            [
                [
                    [0x80bbb01]
                ],
                [
                    [$StBpAtkL, 0x080bbb01n] // Replace AI 2 if presents
                ], (a, b) => {
                    b.Flare.inc(2);
                    b.PowRatP.dec(1); b.PowRatM.dec(1);
                }
            ],
            [
                [
                    [0x80bbb02]
                ],
                [
                    [$StBpAtkL, 0x080bbb02n] // Replace AI 3 if presents
                ], (a, b) => {
                    const t = a.mPowPM * 9, d = t * 20 + t * b.Flare.now() * 3 || 0;
                    a.pa += $EquNumCast(d * 0.0025);
                }
            ]
        ]],
        
        // WAND
        [0x4083b00, [
            [
                [
                    [0x80bb900]
                ],
                [
                    [$StBpAtkL, 0x04083b00n] // Extra skill check if MO 1 presents
                ], (a, b) => {
                    a.iss = !a.mTurn;
                }
            ],
            [
                [
                    [0x80bb900]
                ],
                [
                    [$StBpSklL, 0x080bb900n] // Replace MO 1 if presents
                ], (a, b) => {
                    if (!a.isS(b)) { return; }

                    // const n = $EquNumCast(
                    //     Math.max(Math.min(a.mPowMulM - b.mPowMulM, 7000), 0) * 0.1
                    // ), m = ($EquNumCast(a.mPowM * 0.6) + $EquNumCast(a.mSdMax * 0.04)) * (1 + n * 0.01);
                    // a.pm += $EquNumCast(m) + $EquNumCast(m * 0.6);
                    
                    let t0 = a.mInt, t1 = a.mSpr;

                    if (t0 < t1) {
                        const t = t0;
                        t0 = t1; t1 = t;
                    }
                    const m = 
                        ($EquNumCast(a.mPowM * 0.35) + $EquNumCast(a.mSdMax * 0.05)) * $EquNumCast(
                            Math.min(t0 * 50 / t1 || 100, 1100) * 0.01
                        ),
                        n = $EquNumCast(m)
                    ;

                    a.pm += n + $EquNumCast(n * 0.4);
                    
                    a.uiAddSkl(0x80bb900);
                }
            ]
        ]],

        // SHIELD
        [0x4083c00, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x04083c00n]
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
        [0x4083d00, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x04083d00n]
                ], (a, b) => {
                    a.isc = !0;
                }
            ]
        ]],

        // SPEAR
        [0x4083e00, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x04083e00n]
                ], (a, b) => {
                    a.pm += $EquNumCast(b.mHpNow * 0.18);
                }
            ]
        ]],

        // LONGSWORD
        [0x4083f00, [
            [
                [
                    [0x80bbe01]
                ],
                [
                    [$StBpAtkL, 0x080bbe01n] // Replace YI 2 if present
                ], (a, b) => {
                    const n = $EquNumCast(a.mPowPM * 1.4);
                    a.pp += n; a.pm += n;
                }
            ]
        ]],

        // LONGSTAFF
        [0x4084000, [
            [
                [
                    [0x80bc202n]
                ],
                [
                    [$StIpAddN, 0x080bc202n] // Replace XIA 3 if present
                ], a => {
                    let n = 0, m = 0;
                    for (const B of a.E) {
                        for (const b of B) { n += b.mDefFixP; m += b.mDefFixM; }
                    }
                    a.mAtkFixM += $EquNumCast((n * 0.35 + m * 0.15) * a.mDpr);
                    a.mSdFix += $EquNumCast(a.mGrowth);
                }
            ]
        ]],

        // GLOVES
        [0x4089900, []],

        // BRACELET
        [0x4089a00, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x04089a00n]
                ], (a, b) => {
                    if (!a.crt || !a.rndUni(20)) { return; }
                    a.pm += a.pm;
                    a.uiAddAct($MsgActEc2202);
                }
            ]
        ]],

        // VULTURE
        [0x4089b00, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x04089b00n]
                ], a => {
                    a.mLchMtL[1] += a.mLchMtL[3] * 0.25;
                    a.mLchMtR[1] += a.mLchMtR[3] * 0.25;
                }
            ]
        ]],

        // RING
        [0x4089c00, [
            [
                [
                    [0x80bb800]
                ],
                [
                    [$StBpAtkL, 0x04089c00n] // Extra damage if WU 1 Presents
                ], (a, b) => {
                    const n = $EquNumCast((a.mGrowth + 100) * 0.2)
                    a.pp += n; a.pm += n;
                }
            ]
        ]],

        // DEVOUR
        [0x4089d00, [
            [
                [
                    [0x80bbf02]
                ],
                [
                    [$StEpSetL, 0x080bbf02n], // Replace MING 3 if presents
                    [$StEpSetR, 0x080bbf02n]
                ], a => {
                    let h = 0, s = 0;
                    for (const B of a.E) {
                        for (const b of B) {
                            h += $EquNumCast(b.nRecH * 0.6) + $EquNumCast(b.nRecS * 0.3);
                            s += $EquNumCast(b.nRecS * 0.6);
                        }
                    }
                    a.nRecH += h * a.mDpr;
                    a.nRecS += s * a.mDpr;
                }
            ]
        ]],

        // REFRACT
        [0x4089e00, [
            [
                [
                    [0x80bc001]
                ],
                [
                    [$StBpDmgL, 0x080bc001n] // Replace MIN 2 if present
                ], (a, b) => {
                    if (b.mSdNow < b.mSdMax || b.mHpNow < b.mHpMax) { return; }
                    a.Sight.inc(1);
                }
            ],
            [
                [
                    [0x80bc001]
                ],
                [
                    [$StBpDmgR, 0x080bc001n] // Replace MIN 2 if present
                ], (a, b) => {
                    if (a.Sight.now() < 1) { return; }
                    a.Sight.dec(1);
                    b.pp = 0; b.pm = 0; b.pa = 0;
                    a.uiAddSkl(0x80bc001);
                }
            ]
        ]],

        // PLATE
        [0x408fd00, []],

        // LEATHER
        [0x408fe00, []],
        
        // CLOTH
        [0x408ff00, []],

        // CLOAK
        [0x4090000, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x04090000n]
                ], a => {
                    a.mSdRat += 50;
                }
            ]
        ]],

        // THORN
        [0x4090100, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x04090100n]
                ], a => {
                    a.mRflRat += 25;
                }
            ]
        ]],

        // WOOD
        [0x4090200, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkR, 0x04090200n]
                ], (a, b) => {
                    a.nRecH += $EquNumCast(a.mHpMax * 0.05 * a.mDps);
                }
            ]
        ]],

        // CAPE
        [0x4090300, [
            [
                [
                    []
                ],
                [
                    [$StBpPowR, 0x04090300n]
                ], (a, b) => {
                    const n = Math.min($EquNumCast(b.pp * 0.5), $EquNumMax);
                    b.pp -= n; b.pm += n;
                }
            ]
        ]],

        // SCARF
        [0x4096100, []],

        // TIARA
        [0x4096200, [
            [
                [
                    [0x80bbc02]
                ],
                [
                    [$StIpMulN, 0x080bbc02n] // Replace MENG 3 if presents
                ], a => {
                    a.mSdRat += 15;
                }
            ],
            [
                [
                    [0x80bbc02]
                ],
                [
                    [$StBpPowR, 0x080bbc02n] // Replace MENG 3 if presents
                ], (a, b) => {
                    b.Light.inc(1); b.SpdRat.dec(4);
                }
            ]
        ]],
        
        // RIBBON
        [0x4096300, [
            [
                [
                    [0x80bba01]
                ],
                [
                    [$StApSetL, 0x080bba01n], // Replace LIN 2 if presents
                    [$StApSetR, 0x080bba01n]
                ], a => {
                    a.nRecH += $EquNumCast(a.mHpMax * 0.06 * a.mDps);
                }
            ]/*,
            [
                [
                    [0x80bba01]
                ],
                [
                    [$StCpSetL, 0x080bba01n],
                    [$StCpSetR, 0x080bba01n]
                ], a => {
                    const n = $EquNumCast(a.mHpMax * 0.08 * a.mDps);
                    a.mHpNow += n;
                    a.uiAddSkl(0x80bba01, "+" + Math.floor(n));
                }
            ]
            */
        ]],

        // WITCHER
        [0x4096400, [
            [
                [
                    [0x80bbd02]
                ],
                [
                    [$StBpSklL, 0x080bbd02n]  // Replace WEI 3 if presents
                ], (a, b) => {
                    a.pp += $EquNumCast(b.mLifeMax * 0.147);
                    // a.pm = $EquNumCast(a.pm * 0.3);
                    a.pa += $EquNumCast(b.mLifeMax * 0.063);
                }
            ]
        ]],

        // FIERCE
        [0x4096500, [
            // Evaluated last
            [
                [
                    [0x80bc302]
                ],
                [
                    [$StIpAddN, 0x080bc302n]   // Replace YA 3 if presents
                ], a => {
                    const p = -30 * a.mDpr;
                    for (const B of a.E) {
                        for (const b of B) {
                            b.mPowMulP = $EquUnitStats(b.mPowMulP, p); b.mPowAddP = $EquUnitStats(b.mPowAddP, p);
                            b.mPowMulM = $EquUnitStats(b.mPowMulM, p); b.mPowAddM = $EquUnitStats(b.mPowAddM, p);
                            b.mSpd = $EquUnitStats(b.mSpd, p);
                        }
                        a.mDefFixP = $EquNumCast(a.mDefFixP * 1.2);
                        a.mDefFixM = $EquNumCast(a.mDefFixM * 1.2);
                    }
                }
            ]
        ]],
        
        // -------------------------------------------------------------------------------
        //  * Actor Skills *
        // -------------------------------------------------------------------------------
        
        // WU 1
        [0x80bb800, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x080bb800n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    const n = a.mGrowth, m = n + 100;
                    a.pp += m; a.pm += m;
                    a.uiAddSkl(0x80bb800, "+" + n);
                }
            ]
        ]],
        
        // WU 2
        [0x80bb801, [
            // After aura CI, but before adding additive stats.
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x080bb801n]
                ], a => {
                    a.mDefFixP = $EquNumCast(a.mDefFixP * 1.15);
                    a.mDefFixM = $EquNumCast(a.mDefFixM * 1.15);
                    a.mHpRat += 30; a.mSdRat += 30;
                }
            ]
        ]],
        
        // WU 3
        [0x80bb802, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x080bb802n]
                ], a => {
                    a.mPowRatP += 30;
                    a.mPowRatM += 30;
                    a.mSpdRat += 30;
                }
            ]
        ]],

        // MO 1
        [0x80bb900, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x080bb900n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    
                    let t0 = a.mInt, t1 = a.mSpr;
                    if (t0 < t1) {
                        const t = t0;
                        t0 = t1; t1 = t;
                    }
                    a.pm += $EquNumCast(
                        ($EquNumCast(a.mPowM * 0.35) + $EquNumCast(a.mSdMax * 0.05)) * $EquNumCast(
                            Math.min(t0 * 50 / t1 || 100, 1100) * 0.01
                        )
                    );
                    a.uiAddSkl(0x80bb900);
                }
            ]
        ]],

        // MO 2
        [0x80bb901, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x080bb901n]
                ], a => {
                    a.mAtkFixM += $EquNumCast((a.mInt + a.mSpr) * 0.2);
                }
            ]
        ]],
        
        // MO 3
        [0x80bb902, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x080bb902n]
                ], a => {
                    a.mSdRat += 25;
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpAtkR, 0x080bb902n]
                ], (a, b) => {
                    a.pm += $EquNumCast(a.mPowM * 0.55) + $EquNumCast(a.mSdMax * 0.07) || 0;
                    a.uiAddSkl(0x80bb902);
                }
            ]
        ]],

        // LIN 1
        [0x80bba00, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x080bba00n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    const n = a.mPowP * 2.2; // , m = n * a.mDps;
                    a.pp += n; a.pm += n; // a.nRecH += m; a.nRecS += m;
                    a.uiAddSkl(0x80bba00);
                }
            ]
        ]],
        
        // LIN 2
        [0x80bba01, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x080bba01n]
                ], a => {
                    a.mHpRat += 30;
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StApSetL, 0x080bba01n],
                    [$StApSetR, 0x080bba01n]
                ], a => {
                    // const n = $EquNumCast(a.mHpMax * ((a.mHpNow < $EquNumCast(a.mHpMax * 0.3)) ? 0.04 : 0.02) * a.mDps);
                    // a.mHpNow += n;
                    // a.uiAddSkl(0x80bba01, "+" + Math.floor(n));
                    a.nRecH += $EquNumCast(a.mHpMax * ((a.mHpNow < $EquNumCast(a.mHpMax * 0.3)) ? 0.06 : 0.03) * a.mDps);
                }
            ]
        ]],

        // LIN 3
        [0x80bba02, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x080bba02n]
                ], a => {
                    a.Undead.setImpl(1);
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StEpSetR, 0x180bba02n]
                ], a => {
                    if (a.Undead.now() > 0 && (a.mHpNow <= a.nDmgH)) {
                        a.nDmgH = a.nDmgS = 0;
                        a.Undead.decImpl(1);
                        a.uiAddSkl(0x80bba02);
                    }
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpCrtL, 0x080bba02n]
                ], a => {
                    if (a.Undead.now() > 0 && (a.crt)) {
                        a.pp += a.mHpMax * 0.5;
                        a.Undead.decImpl(1);
                        a.uiAddSkl(0x80bba02);
                    }
                }
            ]
        ]],

        // AI 1
        [0x80bbb00, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x080bbb00n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    const n = b.Flare.now();
                    a.pa += $EquNumCast((b.mHpNow + b.mSdNow) * 0.13 * n);
                    b.Flare.dec(n);
                    a.uiAddSkl(0x80bbb00);
                }
            ]
        ]],
        
        // AI 2
        [0x80bbb01, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x080bbb01n]
                ], (a, b) => {
                    b.Flare.inc(1);
                    b.PowRatP.dec(1); b.PowRatM.dec(1);
                }
            ]
        ]],
        
        // AI 3
        [0x80bbb02, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x080bbb02n]
                ], a => {
                    a.mLchRat += 15;
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x080bbb02n]
                ], (a, b) => {
                    a.pa += $EquNumCast(a.mPowPM * 180 * 0.0025);
                }
            ]
        ]],

        // MENG 1
        [0x80bbc00, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x080bbc00n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    b.Light.inc(7);
                    const n = b.Light.now();
                    a.pm += $EquNumCast(a.mPowM * n * 0.25);
                    b.SpdRat.dec($EquNumCast(n * 0.5));
                    b.SpdRat.floor(-100);
                    a.uiAddSkl(0x80bbc00);
                }
            ]
        ]],
        
        // MENG 2
        [0x80bbc01, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x080bbc01n]
                ], (a, b) => {
                    b.Light.inc(2);
                    a.pm += $EquNumCast((a.mSdMax * 0.03 + a.mPowM * 0.03) * b.Light.now() || 0);
                    b.SpdRat.dec(1);
                }
            ]
        ]],
        
        // MENG 3
        [0x80bbc02, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x080bbc02n]
                ], a => {
                    a.mSdRat += 30;
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpPowR, 0x080bbc02n]
                ], (a, b) => {
                    b.Light.inc(1); b.SpdRat.dec(2);
                }
            ]
        ]],

        // WEI 1
        [0x80bbd00, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x080bbd00n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    a.Dodge.set(1);
                    a.uiAddSkl(0x80bbd00);
                }
            ]
        ]],
        
        // WEI 2
        [0x80bbd01, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x080bbd01n]
                ], a => {
                    a.mSklRat += a.mSklRat * 0.1 + 10;
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x180bbd01n]
                ], (a, b) => {
                    if (a.Dodge.now() > 0) { a.pp = $EquNumCast(a.pp * 1.4); }
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpDmgR, 0x180bbd01n]
                ], (a, b) => {
                    if (a.Dodge.now() > 0) {
                        b.pp = $EquNumCast(b.pp * 0.1);
                        b.pm = $EquNumCast(b.pm * 0.1);
                        b.pa = $EquNumCast(b.pa * 0.1);
                        a.Dodge.dec(1);
                        a.uiAddSkl(0x80bbd01);
                    }
                }
            ]
        ]],
        
        // WEI 3
        [0x80bbd02, [
            // After active skills
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x080bbd02n]
                ], (a, b) => {
                    a.pp += $EquNumCast(b.mLifeMax * 0.21);
                    // a.pm = $EquNumCast(a.pm * 0.3);
                }
            ]
        ]],

        // YI 1
        [0x80bbe00, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x080bbe00n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    const sd = b.mSdNow, hp = b.mHpNow,
                        n = $EquNumCast(((sd > hp) ? sd : hp) * 0.15);
                    a.pa += n;
                    a.nRecH += $EquNumCast(n * a.mDps);
                    a.uiAddSkl(0x80bbe00);
                }
            ]
        ]],
        
        // YI 2
        [0x80bbe01, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x080bbe01n]
                ], (a, b) => {
                    a[(b.nDefFixP > b.nDefFixM) ? "pm" : "pp"] += $EquNumCast(a.mPowPM * 1.4);
                }
            ]
        ]],
        
        // YI 3
        [0x80bbe02, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x080bbe02n]
                ], a => {
                    a.mHpRat += 20;
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StApSetL, 0x080bbe02n]
                ], a => {
                    a.HpRecRat.floor(0);
                    a.SdRecRat.floor(0);
                    a.SpdRat.floor(0);
                }
            ]
        ]],

        // MING 1
        [0x80bbf00, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x080bbf00n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    const n = a.mHpMax - a.mHpNow || 0;
                    a.pm += n; a.nRecH += $EquNumCast(n * 0.5 * a.mDps);
                    a.uiAddSkl(0x80bbf00);
                }
            ]
        ]],
        
        // MING 2
        [0x80bbf01, [
            // After additive stats added.
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x080bbf01n]
                ], a => {
                    a.mHpRat += 90;
                    a.mDefFixP = $EquNumCast(a.mDefFixP * 0.5);
                    a.mDefFixM = $EquNumCast(a.mDefFixM * 0.5);
                }
            ]
        ]],
        
        // MING 3
        [0x80bbf02, [
            [
                [
                    []
                ],
                [
                    [$StBpDefL, 0x080bbf02n],
                    [$StBpDefR, 0x080bbf02n]
                ], (a, b) => {
                    a.pp += $EquNumCast(b.pp * 0.4);
                    a.pm += $EquNumCast(b.pm * 0.4);
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StEpSetL, 0x080bbf02n],
                    [$StEpSetR, 0x080bbf02n]
                ], a => {
                    let h = 0, s = 0;
                    for (const B of a.E) {
                        for (const b of B) {
                            h += $EquNumCast(b.nRecH * 0.6);
                            s += $EquNumCast(b.nRecS * 0.6);
                        }
                    }
                    a.nRecH += h * a.mDpr;
                    a.nRecS += s * a.mDpr;
                }
            ]
        ]],

        // MIN 1
        [0x80bc000, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x080bc000n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    const n = a.mRng.number(3);
                    a.Mirror.set(1 << n);
                    a.uiAddSklEx(0x80bc000, [$MsgActAc3008P, $MsgActAc3008M, $MsgActAc3008A][n]);
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpDmgL, 0xf80bc000n],
                    [$StBpDmgR, 0xf80bc000n]
                ], (a, b) => {
                    const n = a.Mirror.now();
                    if (n & 1) { b.pp = 0; }
                    if (n & 2) { b.pm = 0; }
                    if (n & 4) { b.pa = 0; }
                }
            ]
        ]],
        
        // MIN 2
        [0x80bc001, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x080bc001n]
                ], a => {
                    a.Sight.setImpl(1);
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StApSetL, 0x080bc001n]
                ], a => {
                    a.Sight.setImpl(0);
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpDmgR, 0x080bc001n]
                ], (a, b) => {
                    if (a.Sight.now() < 1) { return; }
                    a.Sight.dec(1);
                    b.pp = 0; b.pm = 0; b.pa = 0;
                    a.uiAddSkl(0x80bc001);
                }
            ]
        ]],
        
        // MIN 3
        [0x80bc002, [
            [
                [
                    []
                ],
                [
                    [$StBpCrtL, 0x080bc002n]
                ], (a, b) => {
                    a.pp += $EquNumCast(a.pp * 0.55);
                    a.pm += $EquNumCast(a.pm * 0.55);
                    a.pa += $EquNumCast(a.pa * 0.55);
                }
            ]
        ]],

        // XI 1
        [0x80bc100, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x080bc100n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    const n = a.mPowP * 3 * (1 + 0.01 * ($EquNumCast((a.mHpMax - a.mHpNow) * 100 / a.mHpMax) || 0));
                    if (
                        a.mHpNow + a.mSdNow < $EquNumCast(a.mLifeMax * 0.1) ||
                        b.mHpNow + b.mSdNow < $EquNumCast(b.mLifeMax * 0.1)
                    ) { a.pa += n; }
                    else { a.pp += n; }
                    a.uiAddSkl(0x80bc100);
                }
            ]
        ]],
        
        // XI 2
        [0x80bc101, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x080bc101n]
                ], a => {
                    a.mLchRat += 10;
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x080bc101n]
                ], (a, b) => {
                    a.isc ||= (b.mHpNow + b.mSdNow < $EquNumCast(b.mLifeMax * 0.5));
                }
            ]
        ]],
        
        // XI 3
        [0x80bc102, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x080bc102n]
                ], a => {
                    a.mHpRat += $EquNumCast(a.mGrowth * 0.0005);
                }
            ],
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x080bc102n]
                ], (a, b) => {
                    const m = a.mHpMax, n = a.mHpNow;
                    if ($EquNumCast(m * 0.5) > n) { a.pp += m - n; }
                }
            ]
        ]],

        // XIA 1
        [0x80bc200, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x080bc200n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    a.pm += $EquNumCast(a.mPowM * 2 * (100 + Math.min($EquNumCast(b.mDefFixM, 0.1), 200))) * 0.01;
                    a.uiAddSkl(0x80bc200);
                }
            ]
        ]],
        
        // XIA 2
        [0x80bc201, [
            [
                [
                    []
                ],
                [
                    [$StIpMulN, 0x080bc201n]
                ], a => {
                    // ... in order of port id?
                    let n = 0, m = 0;
                    for (const B of a.E) {
                        for (const b of B) { (a.mPowMulM + a.mPowAddM > b.mPowMulM + b.mPowAddM) ? n++ : m++; }
                    }
                    const q = Math.min(0.3 / (n + m), Number.MAX_VALUE);
                    a.mPowMulM += $EquNumCast(a.mPowMulM * n * q);
                    a.mPowAddM += $EquNumCast(a.mPowAddM * n * q);
                    a.mSpd += $EquNumCast(a.mSpd * m * q);
                }
            ]
        ]],
        
        // XIA 3
        [0x80bc202, [
            [
                [
                    []
                ],
                [
                    [$StIpAddN, 0x080bc202n]
                ], a => {
                    const g = $EquNumCast(a.mGrowth * 0.0002);
                    let n = 0;
                    for (const B of a.E) {
                        for (const b of B) { n += b.mDefFixP; }
                    }
                    a.mAtkFixM += $EquNumCast(n * a.mDpr * 0.35);
                    a.mSdRat += g; a.mPowRatM += g;
                }
            ]
        ]],

        // YA 1
        [0x80bc300, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x080bc300n]
                ], (a, b) => {
                    
                    if (!a.isS(b)) { return; }
                    const h = $EquNumCast(b.mHpMax * 0.05 * a.mDps), s = $EquNumCast(b.mSdMax * 0.05 * a.mDps), n = h + s;

                    b.HpMax.dec(h); b.SdMax.dec(s);
                    a.pp += (a.mPowP + n) * 3; // After Increase
                    a.PowFixP.inc(n);
                    a.uiAddSkl(0x80bc300);
                }
            ]
        ]],
        
        // YA 2
        [0x80bc301, [
            [
                [
                    []
                ],
                [
                    [$StBpAtkL, 0x080bc301n]
                ], (a, b) => {
                    a.pp += $EquNumCast(a.mPowPM * ((a.mTurn + b.mTurn) * 0.2 + 0.2));
                }
            ]
        ]],
                
        // YA 3
        [0x80bc302, [
            [
                [
                    [$FlDay]
                ],
                // Evaluated last
                [
                    [$StIpAddN, 0x080bc302n]
                ], a => {
                    const p = -30 * a.mDpr;
                    for (const B of a.E) {
                        for (const b of B) {
                            b.mPowMulP = $EquUnitStats(b.mPowMulP, p); b.mPowAddP = $EquUnitStats(b.mPowAddP, p);
                            b.mPowMulM = $EquUnitStats(b.mPowMulM, p); b.mPowAddM = $EquUnitStats(b.mPowAddM, p);
                            b.mSpd = $EquUnitStats(b.mSpd, p);
                        }
                    }
                }
            ],
            [
                [
                    [$FlNight]
                ],
                [
                    [$StIpAddN, 0x080bc302n]
                ], a => {
                    a.mDefFixP = $EquNumCast(a.mDefFixP * 1.2);
                    a.mDefFixM = $EquNumCast(a.mDefFixM * 1.2);
                }
            ]
        ]],

        // MU 1
        [0x80f3d00, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x080f3d00n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    a.pp += a.mPowP * 5;
                    a.uiAddSkl(0x80f3d00);
                }
            ]
        ]],
        
        // MU 2
        [0x80f3d01, []],
        
        // MU 3
        [0x80f3d02, []],

        // ZHU 1
        [0x80f3e00, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x080f3e00n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    a.pm += a.mPowM * 5;
                    a.uiAddSkl(0x80f3e00);
                }
            ]
        ]],

        // ZHU 2
        [0x80f3e01, []],

        // ZHU 3
        [0x80f3e02, []],

        // DENG 1
        [0x80f3f00, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x080f3f00n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    a.pm += $EquNumCast(a.mSdMax * 0.4);
                    a.uiAddSkl(0x80f3f00);
                }
            ]
        ]],

        // DENG 2
        [0x80f3f01, []],

        // DENG 3
        [0x80f3f02, []],

        // SHOU 1
        [0x80f4000, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x080f4000n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    a.pp += $EquNumCast(a.mHpMax * 0.4);
                    a.uiAddSkl(0x80f4000);
                }
            ]
        ]],

        // SHOU 2
        [0x80f3e01, []],

        // SHOU 3
        [0x80f3e02, []],

        // YU 1
        [0x80f4100, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x080f4100n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    a.pp += a.mPowP * 5;
                    a.uiAddSkl(0x80f4100);
                }
            ]
        ]],

        // YU 2
        [0x80f3f01, []],

        // YU 3
        [0x80f3f02, []],

        // HAO 1
        [0x80f4200, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x080f4200n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    a.pp += $EquNumCast(a.mHpMax * 0.4);
                    a.uiAddSkl(0x80f4200);
                }
            ]
        ]],

        // HAO 2
        [0x80f4001, []],

        // HAO 3
        [0x80f4002, []],

        // LIU 1
        [0x80f4300, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x080f4300n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    a.pp += $EquNumCast(a.mHpMax * 0.4);
                    a.uiAddSkl(0x80f4300);
                }
            ]
        ]],

        // LIU 2
        [0x80f4101, []],

        // LIU 3
        [0x80f4102, []],

        // SHI 1
        [0x80f4400, [
            [
                [
                    []
                ],
                [
                    [$StBpSklL, 0x080f4400n]
                ], (a, b) => {
                    if (!a.isS(b)) { return; }
                    a.pp += a.mPowP * 3;
                    a.pm += a.mPowM * 3;
                    a.pa += a.mPowP + a.mPowM;
                    a.uiAddSkl(0x80f4400);
                }
            ]
        ]],

        // SHI 2
        [0x80f4201, []],

        // SHI 3
        [0x80f4202, []]

    ]);
    
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Initialization *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Exports *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    this.__proto__ = {
        Rules,
        ActorStats, 
        EmuActorKind, EmuStatusKind,
        EmuEquipKind, EmuEquipStats, EmuEquipStatAdd, EmuEquipStatMul, EmuEquipRankKind,
        EmuGemKind,
        
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

        ObjBase, ArrBase, VecBase, SetBase, MapBase,

        Actor, Equip, Fruit, Aura, Wish, Amulet, Dice, Gems, User, Unit, Fighter, Arena, Fight, FightArr, Record,
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
                        nm: u.mName, at: ""+u.mActor, lv: u.mLevel, 
                        hp: u.mHpMax, sd: u.mSdMax,
                        sp: u.mSpd,
                        pp: u.mPowP, pm: u.mPowM,
                        dp: u.mDefFixP, dm: u.mDefFixM,
                        eq: u.mEquip.map(e => {
                            return e ? { k: ""+e.mKind, r: e.mRank, l: e.mLevel } : gInfoEquipNull;
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
            T.sign = ""+winner; // Convert to string
            
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

/*
Project: fygemu
Authors: hirakana@kf
*/

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

class StatusFlag extends StatusNull {
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
//  * Battle Object * 
// -----------------------------------------------------------------------------------------------------------------------------------------------------

class BattleObject {

    constructor (u) {

        const 
            mPowMulP = u.nPowMulP, mPowAddP = u.nPowAddP,
            mPowMulM = u.nPowMulM, mPowAddM = u.nPowAddM,
            mPowMulA = u.nPowMulA, mPowAddA = u.nPowAddA
        ;

        this.mName = u.mName; this.mActor = u.nActor; this.mEquips = u.mEquips;
        this.mFlags = u.nFlags; this.mLevel = u.nLevel;
        this.mGrowth = u.nGrowth; this.mIsPVE = u.mIsPVE;

        this.mHpNow = this.mHpFix = this.mHpMax = u.nHpMaxMul + u.nHpMaxAdd; this.mHpRat = u.nHpRat;
        this.mSdNow = this.mSdFix = this.mSdMax = u.nSdMaxMul + u.nSdMaxAdd; this.mSdRat = u.nSdRat;
        this.mHpHealRat = u.nHpHealRat; this.mHpHealFix = u.nHpHealMul + u.nHpHealAdd;
        this.mSdHealRat = u.nSdHealRat; this.mSdHealFix = u.nSdHealMul + u.nSdHealAdd;
        this.mHpRecRat = this.mSdRecRat = u.nRecRat;
        this.mPowMulP = mPowMulP; this.mPowAddP = mPowAddP; this.mPowP = mPowMulP + mPowAddP; this.mPowRatP = u.nPowRatP; 
        this.mPowMulM = mPowMulM; this.mPowAddP = mPowAddM; this.mPowM = mPowMulM + mPowAddM; this.mPowRatM = u.nPowRatM;
        this.mPowMulA = mPowMulA; this.mPowAddP = mPowAddA; this.mPowA = mPowMulA + mPowAddA;
        this.mAtkRatP = u.nAtkRatP; this.mAtkMulP = u.nAtkMulP; this.mAtkAddP = u.nAtkAddP; this.mAtkFixP = 0;
        this.mAtkRatM = u.nAtkRatM; this.mAtkMulM = u.nAtkMulM; this.mAtkAddM = u.nAtkAddM; this.mAtkFixM = 0;
        this.mAtkRatC = u.nAtkRatC; this.mAtkMulC = u.nAtkMulC; this.mAtkAddC = u.nAtkAddC; this.mAtkFixC = 0;
        this.mDefRatP = u.nDefRatP + u.nDefFixP; this.mDefMulP = u.nDefMulP; this.mDefAddP = u.nDefAddP; this.mDefFixP = 0; 
        this.mDefRatM = u.nDefRatM + u.nDefFixM; this.mDefMulM = u.nDefMulM; this.mDefAddM = u.nDefAddM; this.mDefFixM = 0;
        this.mResP = u.nResMulP + u.nResAddP; this.mResM = u.nResMulM + u.nResAddM;
        this.mSpd = u.nSpdAdd + u.nSpdMul; this.mSpdRat = u.nSpdRat;
        
        this.mSklRat = u.nSklRat + u.nSklFix; this.mSklMul = u.nSklMul; this.mSklAdd = u.nSklAdd; 
        this.mCrtRat = u.nCrtRat + u.nCrtFix; this.mCrtMul = u.nCrtMul; this.mCrtAdd = u.nCrtAdd;
        this.mEvaRat = u.nEvaRat + u.nEvaFix; this.mEvaMul = u.nEvaMul; this.mEvaAdd = u.nEvaAdd;
        this.mDodRat = u.nDodRat + u.nDodFix; this.mDodMul = u.nDodMul; this.mDodAdd = u.nDodAdd;
        this.mLchRat = u.nLchRat + u.nLchFix; this.mRflRat = u.nRflRat + u.nRflFix;
        
        // Wish
        this.mHpPot = u.nWishHpPot;
        this.mSdPot = u.nWishSdPot;
        this.mAura101 = u.nWishAura101;
        this.mAura102 = u.nWishAura102;
        this.mAura103 = u.nWishAura103;
        this.mPowBuf = u.nWishPowBuf;
        this.mLifeuf = u.nWishLifeBuf;

        // Special attributes
        this.mLifeMax = this.mHpMax + this.mSdMax;
        this.mPowPM = this.mSpdNow = 0;
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
        this.pApSetL = []; this.pApSetR = [];
        this.pBpAtkL = []; this.pBpAtkR = [];
        this.pBpCrtL = []; this.pBpCrtR = [];
        this.pBpSklL = []; this.pBpSklR = [];
        this.pBpDefL = []; this.pBpDefR = [];
        this.pBpPowL = []; this.pBpPowR = [];
        this.pBpDmgL = []; this.pBpDmgR = [];
        this.pDpSetL = []; this.pDpSetR = [];
        this.pEpSetL = []; this.pEpSetR = [];

        // Temporaries (power)
        this.pp = this.pm = this.pa =
        // Temporaries (resist)
        this.rp = this.rm = 
        // Temporaries (flags)
        this.crt = 
        // Temporaries (attack)
        this.arp = this.afp = this.arm = this.afm = this.arc = this.arp = 
        // Temporaries (defend)
        this.brp = this.bfp = this.brm = this.bfp = 0;
        // Temporaries (ratio)
        this.hpr = this.hmr = this.spr = this.smr = 1;
        // Algorithm
        this.mDefFull = 0.9;
        this.mSdDmgP = 1.5; this.mSdDmgM = 1.0;
        
        // Status
        for (const k in gEmuStatusKind) {
            this[k] = new ((u["b"+k]) ? StatusNull : StatusCtor[gEmuStatusKind[k].kind])(u["c"+k] || 0);
        }
    }

    dtor () {
        ;
    }

    // Reset all status
    reset () {
        // Status
        this.HpRecRat.setImpl(this.mHpRecRat);
        this.SdRecRat.setImpl(this.mSdRecRat);
        this.PowRatP.setImpl(this.mPowRatP);
        this.PowRatM.setImpl(this.mPowRatM);
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

        // Health / Shield
        this.mHpNow = this.mHpMax = gNumberCast(this.mHpFix * gEffectMadd(this.mHpRat));
        this.mSdNow = this.mSdMax = gNumberCast(this.mSdFix * gEffectMadd(this.mSdRat));
        this.mLifeMax = this.mHpMax + this.mSdMax;
    }

    // Tick timer
    tick () {
        return this.mSpdNow += Math.max(gNumberCast(this.mSpd * gEffectMadd(this.SpdRat.now())), gNumberMin);
    }

    // Clear temporaries
    clear () {
        this.uiClear();
        
        this.nPowP = this.nPowM = this.nPowA = this.nDmgH = this.nDmgS = this.nRecH = this.nRecS = 
        this.nDmgHP = this.nDmgHM = this.nDmgHA = this.nDmgSP = this.nDmgSM = this.nDmgSA = this.nResHP = this.nResHM = this.nResSP = this.nResSM = 0;
        this.nIsAct = !1;
    }

    apSetN () {
        this.nRecH = gNumberCast((gNumberCast((gEffectMul2(this.mHpMax, this.mHpHealRat) || 0)) + this.mHpHealFix) * this.mHhr * this.mDps);
        this.nRecS = gNumberCast((gNumberCast((gEffectMul2(this.mSdMax, this.mSdHealRat) || 0)) + this.mSdHealFix) * this.mShr * this.mDps);
        
        // Potion
        if (this.mHpPot && gNumberCast(this.mHpMax * 0.8) > this.mHpNow) {
            this.nRecH += gNumberCast(this.mHpMax * this.mHpPot * 0.02);
            this.mHpPot = 0;
            this.uiAddHpPot();
        }
        if (this.mSdPot && gNumberCast(this.mSdMax * 0.8) > this.mSdNow) {
            this.nRecS += gNumberCast(this.mSdMax * this.mSdPot * 0.02);
            this.mSdPot = 0;
            this.uiAddSdPot();
        }

        // Speed floor
        if (!gEffectBase) { this.SpdRat.floor(this.SpdMin); }

        // Clear damage component
        this.nVecH.fill(0); this.nVecS.fill(0);
    }

    // Action
    apSetL () {
        this.apSetN();
        this.nIsAct = !0;
    }

    // Action
    apSetR () {
        this.apSetN();
    }

    // Battle
    bpSet () {
        this.pp = 0; this.pm = 0; this.pa = 0; this.rp = this.mResP; this.rm = this.mResM;
        this.arp = this.AtkRatP.now(); this.afp = this.AtkFixP.now(); this.arm = this.AtkRatM.now(); this.afm = this.AtkFixM.now(); 
        this.brp = this.DefRatP.now(); this.bfp = this.DefFixP.now(); this.brm = this.DefRatM.now(); this.bfm = this.DefFixM.now(); 
        this.arc = this.AtkRatC.now(), this.afc = this.AtkFixC.now();
        this.crt = 0;
    }

    // Attack
    bpAtk (that) {
        this.pp = this.mPowP; this.pm = this.mPowM; this.pa = this.mPowA; 
        this.crt = this.C[that.I] + this.CrtRat.now() - that.CrtRat.now() >= this.rand() * 100;
    }

    // Critical
    bpCrt (that) {
        this.pp += gNumberCast(this.pp);
        this.pm += gNumberCast(this.pm * 0.5);
        this.pa += gNumberCast(this.pa);
        this.arp += this.arc; this.afp += this.afc;
        this.arm += this.arc; this.afm += this.afc;
        this.uiAddAct("Crt");
    }

    // Defend
    bpDef (that) {
        const r = this.RflRat.now();
        if (r > 0) {
            this.pm = gEffectMul2(that.pp + gNumberCast(that.pm * 0.7) + that.pa, r);
            this.uiAddAct("Rfl");
        }
    }

    // Damage multiplier
    bpScl () {
        this.pp = gNumberCast(this.pp * gEffectMadd(this.PowRatP.now()) || 0);
        this.pm = gNumberCast(this.pm * gEffectMadd(this.PowRatM.now()) || 0);
    }

    // Display power
    bpPow () {
        this.nPowP += gNumberCast(this.pp * this.mDps);
        this.nPowM += gNumberCast(this.pm * this.mDps);
        this.nPowA += gNumberCast(this.pa * this.mDps);
    }

    // Defense ratio calculation
    bpDmg (that) {
        let hpr, hmr, spr, smr;

        hpr = gNumberCast((
            gNumberCast(this.bfp * gEffectAmul(this.brp - that.arp || 0)) - that.afp || 0
        ) * 0.1);
        hmr = gNumberCast((
            gNumberCast(this.bfm * gEffectAmul(this.brm - that.arm || 0)) - that.afm || 0
        ) * 0.1);

        hpr = Math.min(hpr * 0.01, this.mDefFull);
        hmr = Math.min(hmr * 0.01, this.mDefFull);
        spr = hpr * 0.4;
        smr = hmr * 0.4;

        this.hpr = (hpr < 0) ? 1.3 : 1 - hpr;
        this.hmr = (hmr < 0) ? 1.3 : 1 - hmr;
        this.spr = (spr < 0) ? 1.6 : 1 - spr;
        this.smr = (smr < 0) ? 1.6 : 1 - smr;
    }

    // Summarize damage
    bpEnd (that) {
        const 
            hp = gNumberCast(that.pp * this.hpr * this.mDps || 0), 
            hm = gNumberCast(that.pm * this.hmr * this.mDps || 0),
            ha = gNumberCast(that.pa * this.mDps || 0),
            sp = gNumberCast(that.pp * that.mSdDmgP * this.spr * this.mDps || 0),
            sm = gNumberCast(that.pm * that.mSdDmgM * this.smr * this.mDps || 0),
            sa = gNumberCast(that.pa * this.mDps || 0),
            rp = gNumberCast(this.rp * this.mDps || 0),
            rm = gNumberCast(this.rm * this.mDps || 0),
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

    // Collect and Estimate total damage
    cpSet () {
        const mMirror = this.Mirror.now(), immP = mMirror & 1, immM = mMirror & 2, immA = mMirror & 4;
        let h = 0, s = this.mSdNow;

        // Infinite shield
        if (s > gNumberMax) {
            const s = 
                ((immM) ? 0 : Math.max(this.nDmgSM - this.nResSM, 0)) + 
                ((immP) ? 0 : Math.max(this.nDmgSP - this.nResSM, 0)) +
                ((immA) ? 0 : this.nDmgSA)
            ;
            this.nDecH = 0; 
            this.nDecS = (s >= this.nDecS) ? 1 : s / this.nDecS || 0;
            return;
        }

        // Magical damage
        if (!immM) {
            let hd = this.nDmgHM;
            if (s > 0) {
                let sd = this.nDmgSM - this.nResSM;
                if (sd > 0) {
                    if (sd <= 0) { hd = 0; }
                    else if (s >= sd) { s = s - sd; hd = 0; }
                    else { hd = gNumberCast(hd * (1 - s / sd)); s = 0; }
                }
            }
            if ((hd -= this.nResHM) > 0) { h += hd; }
        }

        // Physical damage
        if (!immP) {
            let hd = this.nDmgHP;
            if (s > 0) {
                let sd = this.nDmgSP - this.nResSP;
                if (sd <= 0) { hd = 0; }
                else if (s >= sd) { s = s - sd; hd = 0; }
                else { hd = gNumberCast(hd * (1 - s / sd)); s = 0; }
            }
            if ((hd -= this.nResHP) > 0) { h += hd; }
        }

        // Absolute damage
        if (!immA) {
            let hd = this.nDmgHA;
            if (s > 0) {
                let sd = this.nDmgSA;
                if (sd <= 0) { hd = 0; }
                else if (s >= sd) { s = s - sd; hd = 0; }
                else { hd = gNumberCast(hd * (1 - s / sd)); s = 0; }
            }
            if (hd > 0) { h += hd; }
        }

        // Shield damage
        s = this.mSdNow - s;

        // Set damage
        // This should be done before the overkill check
        this.nDmgH = h; this.nDmgS = s;

        // Damage ratio
        if (gRules.NoOverkill) {
            h = Math.min(h, this.mHpNow, this.mHpNow - this.nHpMin);
            s = Math.min(s, this.mSdNow - this.nSdMin);
        }
        this.nDecH = (h >= this.nDecH) ? 1 : h / this.nDecH || 0;
        this.nDecS = (s >= this.nDecS) ? 1 : s / this.nDecS || 0;
    }

    // Dead check and leech calculation
    dpSet () {
        if (this.nDmgH >= this.mHpNow) { this.nRecH = 0; this.nRecS = 0; return 0; }
        
        const r = this.LchRat.now();
        if (r > 0) {
            const I = this.I;
            let h = 0, s = 0;
            for (const B of this.E) {
                for (const b of B) {
                    h += gNumberCast(gEffectMul2(b.nVecH[I] * b.nDecH || 0, r));
                    s += gNumberCast(gEffectMul3(b.nVecS[I] * b.nDecS || 0, r, 0.8));
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
        for (const k in gEmuStatusKind) {
            const v = gEmuStatusKind[k], show = v.show, debug = v.debug, x = this[k];
            x.apply();
            if (x[show]) { this.uiAddStatus(k, x[show]); }
            if (debug) { this.uiDebugStatus(k, x[debug]); }
        }

        // Calculate recover
        this.nRecH = hr = Math.max(gNumberCast(hr * gEffectMadd(this.HpRecRat.now())), 0);
        this.nRecS = sr = Math.max(gNumberCast(sr * gEffectMadd(this.SdRecRat.now())), 0);

        // Health
        if (h <= gNumberMax) {
            h += hr;                                                        // Health recover
            hd = Math.min(hd, h - this.nHpMin || 0);                        // Health lock
            if (gRules.NoOverkill && h < hd) { hd = h; }                    // Prevent overkill
            this.mHpNow = h = (h > hd) ? Math.min(h - hd, this.mHpMax) : 0; // Apply damage
            this.nDmgH = hd;                                                // Show damage

            // Infinite damage
            if (hd > gNumberMax) {
                this.nDmgS = hd;
                this.mSdNow = 0;
                return 1;
            }
        }

        // Shield
        if (s <= gNumberMax) {
            s += sr;                                                        // Shield recover
            sd = Math.min(sd, s - this.nSdMin || 0);                        // Shield lock
            if (gRules.NoOverkill && s < sd) { sd = s; }                    // Prevent overkill
            this.mSdNow = s = (s > sd) ? Math.min(s - sd, this.mSdMax) : 0; // Apply damage
            this.nDmgS = sd;                                                // Show damage
        }

        // Real dead check
        return h <= 0;
    }

    rand () {
        return Math.random();
    }

    uiPush () {}
    uiClear () {}
    uiDebugStatus (i, m = "") {}
    uiAddStatus (i, m = "") {}
    uiAddAct (i, m = "") {}
    uiAddHpPot () {}
    uiAddSdPot () {}
    uiAddArt1 (i, m = "") {}
    uiAddArt2 (i, m = "") {}
    uiAddArt3 (i, m = "") {}
    uiAddAura (i, m = "") {}

    uiShow () {
        return "";
    }

}

// -----------------------------------------------------------------------------------------------------------------------------------------------------
//  * Effect Object * 
// -----------------------------------------------------------------------------------------------------------------------------------------------------
/*

--------------------------------------------------------------------------------------------------------------------------------------------------------
 * Steps *
--------------------------------------------------------------------------------------------------------------------------------------------------------

      | (1) | (2) | (3) |
    p | *p  | *** |  *  |

    - Sp: Action Phase       [ order | L (act) -> R (rest) ]
        >> Set : Setup step     // After setting up everythings for a new turn.
    - Bp: Battle Phase      [ order | L (attacker, defender) -> R (defender, attacker)]
        >> Atk : Attack step     // Base attack and passive skills.
        >> Crt : Critical step   // Only called when critical occurs.
        >> Skl : Skill step      // Active skills and some specific auras.
        >> Def : Defend step     // Rights after the reflect calculation.
        >> Pow : Adjust step     // Betweens damage multipliers calculated and power fixed.
        >> Dmg : Damage step     // Rights before the damage accumlated.
    - Cp: Check Phase       [ order | L (act) -> R (rest) ]
        >> Set : Setup step     // Right after the battle phase ends, before the dead check.
    - Dp: Damage Phase      [ order | L (act) -> R (rest) ]
        >> Set : Estimat step   // These callbacks only called when the first dead check succeed.
    - Ep: End Phase         [ order | L (act) -> R (rest) ]
        >> Ent : Setup step     // After the end phase ends.

    Valid steps are:
        pApSetL  pApSetR 
        pBpAtkL  pBpAtkR 
        pBpCrtL  pBpCrtR 
        pBpSklL  pBpSklR 
        pBpDefL  pBpDefR 
        pBpPowL  pBpPowR 
        pBpDmgL  pBpDmgR 
        pCpSetL  pCpSetR
        pDpSetL  pDpSetR 
        pEpSetL  pEpSetR 

--------------------------------------------------------------------------------------------------------------------------------------------------------
 * Priority *
--------------------------------------------------------------------------------------------------------------------------------------------------------

        | (1) | (2) | (3)  |
    0x  |  0  |  0  | 0000 |

 (1) Priority:
    - Controls the execution order of callbacks. 
      The higher priority it have been given, the later the callback get called.
 (2) Kind:
    - 0: Art1
    - 1: Art2
    - 2: Art3
    - 3: Aura
    - 4: Myst
    - Other values are reserved for future.
 (3) Slot Id:
    - First 2 bits stands for the slot, the internal priority of the same type. These are unused for now.
      If an effect requires multiple callbacks within the same priority, they would be in order of 0x0000, 0x4000, 0x8000, 0xc000.
    - The rest stands for the id of the effect. In general, the game tends to handle newer effects later.

--------------------------------------------------------------------------------------------------------------------------------------------------------
 * Status *
--------------------------------------------------------------------------------------------------------------------------------------------------------

All effect function follows the same signiture, (arena, target) => function || undefined;
    - "arena" refers to a instance of ArenaObject or it's super-classes.
    - "target" refers to a set of instances of BattleObject or it's super-classes who have the effect.
    - All stats of target is the base stat on the first call.
    - In case the effect returns a function, it will be called again right after additional stats added.
    - Effect functions are processed in it's insertion order. Assigning a new definition to an existing effect slot would not change that.

*/
const ArenaEffect = {
    
    // -------------------------------------------------------------------------------
    //  * Actors Skill 1 *
    // -------------------------------------------------------------------------------
    "Art1": {
        
        // WU 1
        3000: (_, A) => {
            const p = (a, b) => {
                    if (a.S[b.I] + a.SklRat.now() - b.EvaRat.now() <= a.rand() * 100) { return; }
                    const n = a.mGrowth * 2 + 100;
                    a.pp += n; a.pm += n;
                    a.uiAddArt1(3000, "+" + n);
            };
            for (const a of A) { a.pBpSklL.set(0x000BB8n, p); }
        },

        // MO 1
        3001: (_, A) => {
            const p = (a, b) => {
                    if (a.S[b.I] + a.SklRat.now() - b.EvaRat.now() <= a.rand() * 100) { return; }

                    const n = gNumberCast(
                        Math.max(Math.min(a.mPowMulM - b.mPowMulM, 7000), 0) * 0.1
                    ), m = (gNumberCast(a.mPowM * 0.6) + gNumberCast(a.mSdMax * 0.04)) * (1 + n * 0.01);

                    a.pm += gNumberCast(m);
                    a.uiAddArt1(3001);
            };
            for (const a of A) { a.pBpSklL.set(0x000BB9n, p); }
        },

        // LIN 1
        3002: (_, A) => {
            const p = (a, b) => {
                if (a.S[b.I] + a.SklRat.now() - b.EvaRat.now() <= a.rand() * 100) { return; }
                const n = a.mPowP * 3, m = gNumberCast(n * a.mDps);
                a.pp += n; a.nRecH += m; a.nRecS += m;
                a.uiAddArt1(3002);
            };
            for (const a of A) { a.pBpSklL.set(0x000BBAn, p); }
        },
        
        // AI 1
        3003: (_, A) => {
            const p = (a, b) => {
                if (a.S[b.I] + a.SklRat.now() - b.EvaRat.now() <= a.rand() * 100) { return; }
                const n = b.Flare.now();
                a.pa += gNumberCast((b.mHpMax + b.mSdMax) * 0.13 * n);
                b.Flare.dec(n);
                a.uiAddArt1(3003);
            };
            for (const a of A) { a.pBpSklL.set(0x000BBBn, p); }
        },

        // MENG 1
        3004: (_, A) => {
            const p = (a, b) => {
                if (a.S[b.I] + a.SklRat.now() - b.EvaRat.now() <= a.rand() * 100) { return; }
                b.Light.inc(7);
                const n = b.Light.now();
                a.pm += gNumberCast(a.mPowM * n * 0.2);
                b.SpdRat.dec(gNumberCast(n * 0.5));
                if (!gEffectBase) { b.SpdRat.floor(-100); }
                a.uiAddArt1(3004);
            };
            for (const a of A) { a.pBpSklL.set(0x000BBCn, p); }
        },

        // WEI 1
        3005: (_, A) => {
            const p = (a, b) => {
                if (a.S[b.I] + a.SklRat.now() - b.EvaRat.now() <= a.rand() * 100) { return; }
                a.Dodge.set(1);
                a.uiAddArt1(3005);
            };
            for (const a of A) { a.pBpSklL.set(0x000BBDn, p); }
        },

        // YI 1
        3006: (_, A) => {
            const p = (a, b) => {
                if (a.S[b.I] + a.SklRat.now() - b.EvaRat.now() <= a.rand() * 100) { return; }
                const sd = b.mSdNow, hp = b.mHpNow,
                    n = gNumberCast(((sd > hp) ? sd : hp) * 0.15);
                a.pa += n;
                a.nRecH += gNumberCast(n * a.mDps);
                a.uiAddArt1(3006);
            };
            for (const a of A) { a.pBpSklL.set(0x000BBEn, p); }
        },

        // MING 1
        3007: (_, A) => {
            const p = (a, b) => {
                if (a.S[b.I] + a.SklRat.now() - b.EvaRat.now() <= a.rand() * 100) { return; }
                const n = a.mHpMax - a.mHpNow || 0;
                a.pm += n; a.nRecH += gNumberCast(n * a.mDps);
                a.uiAddArt1(3007);
            };
            for (const a of A) { a.pBpSklL.set(0x000BBFn, p); }
        },

        // MIN 1
        3008: (_, A) => {
            const p = (a, b) => {
                if (a.S[b.I] + a.SklRat.now() - b.EvaRat.now() <= a.rand() * 100) { return; }
                const n = Math.floor(a.rand() * 3);
                a.Mirror.set(1 << n);
                a.uiAddArt1(3008, gMsgActUIInfo.Art3008[n]);
            };
            for (const a of A) { a.pBpSklL.set(0x000BC0n, p); }
        },

        // XI 1
        3009: (_, A) => {
            const p = (a, b) => {
                if (a.S[b.I] + a.SklRat.now() - b.EvaRat.now() <= a.rand() * 100) { return; }
                a.pp += gNumberCast(a.mHpNow * 0.5);
                a.HpRecRat.inc(30);
                a.uiAddArt1(3009);
            };
            for (const a of A) { a.pBpSklL.set(0x000BC1n, p); }
        },

        // MU 1
        3901: (_, A) => {
            const p = (a, b) => {
                if (a.S[b.I] + a.SklRat.now() - b.EvaRat.now() <= a.rand() * 100) { return; }
                a.pp += a.mPowP * 5;
                a.uiAddArt1(3901);
            };
            for (const a of A) { a.pBpSklL.set(0x000F3Dn, p); }
        },

        // ZHU 1
        3902: (_, A) => {
            const p = (a, b) => {
                if (a.S[b.I] + a.SklRat.now() - b.EvaRat.now() <= a.rand() * 100) { return; }
                a.pm += a.mPowM * 5;
                a.uiAddArt1(3902);
            };
            for (const a of A) { a.pBpSklL.set(0x000F3En, p); }
        },

        // DENG 1
        3903: (_, A) => {
            const p = (a, b) => {
                if (a.S[b.I] + a.SklRat.now() - b.EvaRat.now() <= a.rand() * 100) { return; }
                a.pm += gNumberCast(a.mSdMax * 0.4);
                a.uiAddArt1(3903);
            };
            for (const a of A) { a.pBpSklL.set(0x000F3Fn, p); }
        },

        // SHOU 1
        3904: (_, A) => {
            const p = (a, b) => {
                if (a.S[b.I] + a.SklRat.now() - b.EvaRat.now() <= a.rand() * 100) { return; }
                a.pp += gNumberCast(a.mHpMax * 0.4);
                a.uiAddArt1(3904);
            };
            for (const a of A) { a.pBpSklL.set(0x000F40n, p); }
        },

        // YU 1
        3905: (_, A) => {
            const p = (a, b) => {
                if (a.S[b.I] + a.SklRat.now() - b.EvaRat.now() <= a.rand() * 100) { return; }
                a.pp += a.mPowP * 5;
                a.uiAddArt1(3905);
            };
            for (const a of A) { a.pBpSklL.set(0x000F41n, p); }
        },

        // HAO 1
        3906: (_, A) => {
            const p = (a, b) => {
                if (a.S[b.I] + a.SklRat.now() - b.EvaRat.now() <= a.rand() * 100) { return; }
                a.pp += gNumberCast(a.mHpMax * 0.4);
                a.uiAddArt1(3906);
            };
            for (const a of A) { a.pBpSklL.set(0x000F42n, p); }
        }
    },

    // -------------------------------------------------------------------------------
    //  * Actors Skill 2 *
    // -------------------------------------------------------------------------------
    "Art2": {

        // WU 2
        3000: (_, A) => {
            for (const a of A) {
                a.mDefFixP = gNumberCast(a.mDefFixP * 1.15);
                a.mDefFixM = gNumberCast(a.mDefFixM * 1.15);
                a.mHpRat += 30; a.mSdRat += 30;
            };
        },

        // MO 2
        3001: (_, A) => {
            const p = (a, b) => {
                a.pm += gNumberCast(a.mSdMax * 0.12) || 0;
                a.uiAddArt2(3001);
            };
            for (const a of A) {
                a.mSdFix += gNumberCast(a.mPowMulM * 1.8);
                a.pBpDefR.set(0x010BB9n, p);
            }
        },

        // LIN 2
        3002: (_, A) => {
            const p = (a) => {
                if (a.Undead.now() > 0 && (a.mHpNow <= a.nDmgH)) {
                    a.nDmgH = a.nDmgS = 0;
                    a.Undead.decImpl(1);
                    a.uiAddArt2(3002);
                }
            }
            for (const a of A) {
                a.Undead.setImpl(1);
                a.pEpSetL.set(0x110BBAn, p); a.pEpSetR.set(0x110BBAn, p);
            }
        },

        // AI 2
        3003: (_, A) => {
            const 
                p = (a, b) => {
                    a.pa += gNumberCast(a.mPowPM * 180 * 0.0025);
                }
            ;
            for (const a of A) { a.mLchRat += 15; a.pBpAtkL.set(0x010BBBn, p); }
        },

        // MENG 2
        3004: (_, A) => {
            const p = (a, b) => { b.Light.inc(1); b.SpdRat.dec(2); };
            for (const a of A) { a.pBpPowR.set(0x010BBCn, p); a.mSdRat += 30; }
        },

        // WEI 2
        3005: (_, A) => {
            const 
                p1 = (a, b) => {
                    if (a.Dodge.now() > 0) { a.pp = gNumberCast(a.pp * 1.4); }
                },
                p2 = (a, b) => {
                    if (a.Dodge.now() > 0) {
                        b.pp = gNumberCast(b.pp * 0.1);
                        b.pm = gNumberCast(b.pm * 0.1);
                        b.pa = gNumberCast(b.pa * 0.1);
                        a.Dodge.dec(1);
                        a.uiAddArt2(3005);
                    }
                }
            ;
            for (const a of A) {
                a.mSklRat += 10;
                a.pBpSklL.set(0x010BBDn, p1); a.pBpDmgR.set(0x110BBDn, p2);
            }
        },

        // YI 2
        3006: (_, A) => {
            const p = (a, b) => {
                a[(b.nDefFixP > b.nDefFixM) ? "pm" : "pp"] += gNumberCast(a.mPowPM * 1.4);
            };
            for (const a of A) { a.pBpAtkL.set(0x010BBEn, p); }
        },

        // MING 2
        3007: (_, A) => {
            return () => {
                for (const a of A) {
                    a.mHpRat += 90;
                    a.mDefFixP = gNumberCast(a.mDefFixP * 0.3);
                    a.mDefFixM = gNumberCast(a.mDefFixM * 0.3);
                }
            }
        },

        // MIN 2
        3008: (_, A) => {
            const 
                p1 = (a) => {
                    a.Sight.setImpl(0);
                },
                p2 = (a, b) => {
                    if (a.Sight.now() < 1) { return; }
                    a.pp = gNumberCast(a.pp * 0.45);
                    a.pm = gNumberCast(a.pm * 0.45);
                    a.pa = gNumberCast(a.pa * 0.45);
                },
                p3 = (a, b) => {
                    if (a.Sight.now() < 1) { return; }
                    a.Sight.dec(1);
                    b.pp = 0; b.pm = 0; b.pa = 0;
                    a.uiAddArt2(3008);
                }
            ;
            for (const a of A) {
                a.Sight.setImpl(4);
                a.pApSetL.set(0x010BC0n, p1);
                a.pBpPowL.set(0x010BC0n, p2); a.pBpPowR.set(0x010BC0n, p2);
                a.pBpDmgL.set(0x010BC0n, p3); a.pBpDmgR.set(0x010BC0n, p3);
            }
        },

        // XI 2
        3009: (_, A) => {
            const p = (a, b) => {
                a.crt ||= (b.mHpNow + b.mSdNow < gNumberCast(b.mLifeMax * 0.5));
            };
            for (const a of A) {
                a.mHpRat += 10;
                a.pBpAtkL.set(0x010BC1n, p);
            }
        },

        // MU 2
        3901: (_, A) => {},

        // ZHU 2
        3902: (_, A) => {},

        // DENG 2
        3903: (_, A) => {},

        // SHOU 2
        3904: (_, A) => {},

        // YU 2
        3905: (_, A) => {},

        // HAO 2
        3906: (_, A) => {}

    },

    // -------------------------------------------------------------------------------
    //  * Actors Skill 3 *
    // -------------------------------------------------------------------------------
    "Art3": {

        // WU 3
        3000: (_, A) => {
            for (const a of A) { a.mPowRatP += 30; a.mPowRatM += 30; a.mSpdRat += 30; }
        },

        // MO 3
        3001: (_, A) => {
            for (const a of A) { a.mSdRat += 35; }
        },

        // LIN 3
        3002: (_, A) => {
            const p = (a) => {
                    const n = gNumberCast(a.mHpMax * ((h < gNumberCast(a.mHpMax * 0.3)) ? 0.04 : 0.02) * a.mDps);
                    this.mHpNow += n;
                    a.uiAddArt3(3002, "+" + Math.floor(n));
            };
            for (const a of A) { a.mHpRat += 30; a.pCpSetL.set(0x020BBAn, p); a.pCpSetR.set(0x020BBAn, p); }
        },

        // AI 3
        3003: (_, A) => {
            const 
                p = (a, b) => { b.Flare.inc(1); }
            ;
            for (const a of A) {
                a.mLchRat += 15;
                a.pBpAtkL.set(0x020BBBn, p);
            }
        },

        // MENG 3
        3004: (_, A) => {
            const p = (a, b) => {
                b.Light.inc(2);
                a.pm += gNumberCast(a.mSdMax * 0.03 * b.Light.now() || 0);
                b.SpdRat.dec(1);
            };
            for (const a of A) { a.pBpAtkL.set(0x020BBCn, p); }
        },

        // WEI 3
        3005: (_, A) => {
            const 
                p = (a, b) => {
                    a.pp += gNumberCast(b.mLifeMax * 0.14);
                    a.pm = gNumberCast(a.pm * 0.3);
                }
            ;
            for (const a of A) { a.pBpSklL.set(0x020BBDn, p); }
        },

        // YI 3
        3006: (_, A) => {
            const p = (a) => {
                a.HpRecRat.floor(0);
                a.SdRecRat.floor(0);
                a.SpdRat.floor(0);
            };
            for (const a of A) {
                a.mHpRat += 20;
                a.pApSetL.set(0x020BBEn, p); a.pApSetR.set(0x020BBEn, p);
            }
        },

        // MING 3
        3007: (_, A) => {
            const
                p0 = (a, b) => {
                    a.pp += gNumberCast(b.pp * 0.4);
                    a.pm += gNumberCast(b.pm * 0.4);
                },
                p1 = (a) => {
                    let h = 0, s = 0;
                    for (const B of a.E) {
                        for (const b of B) {
                            h += gNumberCast(b.nRecH * 0.6);
                            s += gNumberCast(b.nRecS * 0.6);
                        }
                    }
                    a.nRecH += h * a.mDpr;
                    a.nRecS += s * a.mDpr;
                }
            ;
            for (const a of A) {
                a.pBpPowL.set(0x020BBFn, p0); a.pBpPowR.set(0x020BBFn, p0);
                a.pEpSetL.set(0x020BBFn, p1); a.pEpSetR.set(0x020BBFn, p1);
            }
        },

        // MIN 3
        3008: (_, A) => {
            const p = (a, b) => {
                a.pp += gNumberCast(a.pp * 0.5);
                a.pm += gNumberCast(a.pm * 0.5);
                a.pa += gNumberCast(a.pa * 0.5);
            };
            for (const a of A) { a.pBpCrtL.set(0x020BC0n, p); }
        },

        // XI 3
        3009: (_, A) => {
            const p = (a, b) => {
                const m = a.mHpMax, n = a.mHpNow;
                if (gNumberCast(m * 0.5) > n) { a.pp += m - n; }
            };
            for (const a of A) {
                a.mHpFix += a.mGrowth;
                a.pBpAtkL.set(0x020BC1n, p);
            }
        },

        // MU 3
        3901: (_, A) => {},

        // ZHU 3
        3902: (_, A) => {},

        // DENG 3
        3903: (_, A) => {},

        // SHOU 3
        3904: (_, A) => {},

        // YU 3
        3905: (_, A) => {},

        // HAO 3
        3906: (_, A) => {}

    },

    // -------------------------------------------------------------------------------
    //  * Auras *
    // -------------------------------------------------------------------------------
    "Aura": {

        // SHI
        101: (_, A) => {
            for (const a of A) {
                const t = gNumberCast(a.mLevel * 2 * (1 + a.mAura101 * 0.05));
                a.mResP += t; a.mResM += t;
            }
        },

        // XIN
        102: (_, A) => {
            for (const a of A) {
                const t = gNumberCast(a.mLevel * 10 * (1 + a.mAura102 * 0.05));
                a.mHpFix += t; a.mSdFix += t;
            }
        },

        // FENG
        103: (_, A) => {
            for (const a of A) {
                const t = gNumberCast(a.mLevel * 5 * (1 + a.mAura103 * 0.05));
                a.mPowP += t; a.mPowM += t;
            }
        },

        // TIAO
        104: (_, A) => {
            return () => {
                const AO = _.AO, R = _.mDpr;
                for (const a of A) {
                    const l = a.mLevel, 
                        x = a.E.reduce((t, e) => { e.forEach(b => { t += Math.max(b.mLevel - l, 0); }); return t; }, 0),
                        p2 = gNumberCast((x + x) * R), p10 = gNumberCast(x * 10 * R);
                    a.mPowP += p2; a.mPowM += p2; a.mAtkFixP += p10; a.mAtkFixM += p10;
                }
            };
        },

        // YA
        105: (_, A) => {
            const AO = _.AO, R = _.mDpr;
            for (const a of A) {
                const l = a.mLevel, 
                    x = a.E.reduce((t, e) => { e.forEach(b => { t += Math.max(l - b.mLevel, 0); }); return t; }, 0),
                    p3 = gNumberCast((x + x + x) * R);
                a.mDefFixP += p3; a.mDefFixM += p3; a.mSpd += p3; 
            }
        },

        // BI
        201: (_, A) => {
            return () => {
                for (const a of A) {
                    a.mAtkRatP = gNumberCast(a.mAtkRatP * 1.15);
                    a.mAtkFixP = gNumberCast(a.mAtkFixP * 1.15);
                }
            };
        },

        // MO
        202: (_, A) => {
            return () => {
                for (const a of A) {
                    a.mAtkRatM = gNumberCast(a.mAtkRatM * 1.15);
                    a.mAtkFixM = gNumberCast(a.mAtkFixM * 1.15);
                }
            };
        },

        // DUN
        203: (_, A) => {
            for (const a of A) { a.mSdDmgP = 1.25; }
        },

        // XUE
        204: (_, A) => {
            for (const a of A) {
                a.mHpHealRat += 10; a.mSdHealRat += 10; a.mLchRat += 10;
            }
        },

        // XIAO
        205: (_, A) => {
            const p = (a, b) => {
                a.pa += gNumberCast(b.mHpMax * 0.015) + gNumberCast(b.mSdMax * 0.015);
            };
            for (const a of A) { a.pBpAtkL.set(0x0300CDn, p); }
        },

        // SHENG
        206: (_, A) => {
            for (const a of A) { a.mDefFull = 0.95; }
        },

        // E
        207: (_, A) => {
            const p = (a, b) => {
                if (a.rand() * 100 >= 1) { return; }
                a.pp += a.mPowP * 30;
                a.pm += a.mPowM * 30;
                a.uiAddAura(207);
            };
            for (const a of A) { a.pBpAtkL.set(0x1300CFn, p); }
        },

        // SHANG
        301: (_, A) => {
            const n = A.size, r0 = gNumberCast(n * 75 * _.mDpr), r1 = gNumberCast((n - 1) * 75 * _.mDpr);
            for (const b of _.AO) { b.mHpRecRat -= A.has(b) ? r1 : r0; }
        },

        // SHEN
        302: (_, A) => {
            const n = A.size, r0 = gNumberCast(n * 75 * _.mDpr), r1 = gNumberCast((n - 1) * 75 * _.mDpr);
            for (const b of _.AO) { b.mSdRecRat -= A.has(b) ? r1 : r0; }
        },

        // CI
        303: (_, A) => {
            for (const a of A) {
                a.mDefFixP = gNumberCast(a.mDefFixP * 1.1);
                a.mDefFixM = gNumberCast(a.mDefFixM * 1.1);
                a.mRflRat += 20;
            }
        },

        // REN
        304: (_, A) => {
            const p = (a) => {
                if (a.mWait < 3) { return; }
                a.mSpdNow = Infinity;
                a.uiAddAura(304);
            };
            for (const a of A ) { a.pEpSetR.set(0x030130n, p); }
        },

        // RE
        305: (_, A) => {
            const p = (a) => { a.SpdRat.inc(9); };
            for (const a of A) { a.pCpSetL.set(0x030131n, p); }
        },

        // DIAN
        306: (_, A) => {
            const p = (a, b) => {
                a.pp = gNumberCast(a.pp * 0.7);
                a.pm = gNumberCast(a.pm * 0.7);
                a.uiAddAura(306);
            };

            return () => {
                for (const a of A) {
                    a.mDefFixP = gNumberCast(a.mDefFixP * 1.3);
                    a.mDefFixM = gNumberCast(a.mDefFixM * 1.3);
                    a.pBpPowL.set(0x130132n, p); a.pBpPowR.set(0x130132n, p);
                }
            };
        },

        // WU
        307: (_, A) => {
            const p = (a, b) => {
                if (_.nRound < 15) { return; }
                a.pa += gNumberCast(a.mPowPM * 0.15);
            };
            for (const a of A) { a.pBpAtkL.set(0x030133n, p); }
        },

        // ZHI
        308: (_, A) => {
            const p = (a, b) => {
                if (a.rhp < 1) { a.rhp = 1; }
                if (a.rhm < 1) { a.rhm = 1; }
                if (a.rsp < 1) { a.rsp = 1; }
                if (a.rsm < 1) { a.rsm = 1; }
            };
            for (const a of A) { a.pBpDmgL.set(0x030134n, p); a.pBpDmgR.set(0x030134n, p); }
        },

        // FEI
        401: (_, A) => {
            const p = (a, b) => {
                a.pp += gNumberCast(b.mHpMax * 0.18);
                a.uiAddAura(401);
            };
            for (const a of A) { a.pBpAtkL.set(0x030192n, p); }
        },

        // BO
        402: (_, A) => {
            const p = (a) => {
                if (a.mHpNow < a.mHpMax) { return; }
                a.AtkRatM.incTurn(32);
                a.uiAddAura(402);
            };
            for (const a of A) { a.pApSetL.set(0x030192n, p); a.pApSetR.set(0x030192n, p); }
        },

        // JU
        403: (_, A) => {
            const p = (a, b) => {
                const 
                    m = gNumberCast(a.mSpd * gEffectMadd(a.SpdRat.now()) || 0),
                    n = gNumberCast(b.mSpd * gEffectMadd(b.SpdRat.now()) || 0);
                a.pa += gNumberCast(m * ((m > n * 3) ? 12 : 9) * 0.2);
                a.uiAddAura(403);
            };
            for (const a of A) { a.pBpCrtL.set(0x030193n, p); }
            return () => {
                for (const a of A) { a.mSpd = gNumberCast(a.mSpd * 1.3); }
            };
        },

        // HONG
        404: (_, A) => {
            const p = (a, b) => {
                const t = gNumberCast(a.mLevel * 0.5);
                if (a.arp < 40) { a.arp = 40; }
                else { a.afp += t; }
                if (a.arm < 40) { a.arm = 40; }
                else { a.afm += t; }
            };
            for (const a of A) { a.pBpAtkL.set(0x030194n, p); a.pBpAtkR.set(0x030194n, p); }
        },

        // JUE
        405: (_, A) => {
            const p = (a, b) => {
                b.pp = gNumberCast(b.pp * 0.8);
                b.pm = gNumberCast(b.pm * 0.8);
                b.pa = gNumberCast(b.pa * 0.7);
            };
            for (const a of A) { a.pBpDmgL.set(0x030195n, p); a.pBpDmgR.set(0x030195n, p); }
        },

        // HOU
        406: (_, A) => {
            const p = (a, b) => {
                if (a.mWait < 1) { return; }
                const n = 1 + a.mWait * 0.24;
                a.pp = gNumberCast(a.pp * n);
                a.pm = gNumberCast(a.pm * n);
                a.pa = gNumberCast(a.pa * n);
                a.uiAddAura(406);
            };
            for (const a of A) { a.pBpSklL.set(0x130196n, p); }
        },

        // DUNH
        407: (_, A) => {
            const p = (a, b) => {
                b.arp = gNumberCast(b.arp * 0.65);
                b.arm = gNumberCast(b.arm * 0.65);
            };
            for (const a of A) { a.pBpPowL.set(0x030197n, p); a.pBpPowL.set(0x030197n, p); }
        },
        
        // ZI
        408: (_, A) => {
            const p = (a, b) => {
                const r = (a.mTurn) ? 0.9 : 1.5;
                a.pp = gNumberCast(a.pp * r);
                a.pm = gNumberCast(a.pm * r);
                a.pa = gNumberCast(a.pa * r);
            };
            for (const a of A) { a.pBpPowL.set(0x130198n, p); }
        },
        
        // DI
        901: (_, A) => {
            const
                p1 = (a) => {
                    a.nHpMin = a.mHpNow - gNumberCast(a.mHpMax * 0.3) || 0;
                    a.nSdMin = a.mSdNow - gNumberCast(a.mSdMax * 0.3) || 0;
                },
                p2 = (a, b) => {
                    b.pp = gNumberCast(b.pp * 0.4);
                    b.pm = gNumberCast(b.pm * 0.4);
                    b.pa = gNumberCast(b.pa * 0.4);
                }
            ;
            for (const a of A) {
                a.pApSetL.set(0x030385n, p1); a.pApSetR.set(0x030385n, p1);
                a.pBpDefL.set(0x030385n, p2);
            }
        }

    },
    
    // -------------------------------------------------------------------------------
    //  * Mystery Equips *
    // -------------------------------------------------------------------------------
    "Myst": {

        // SWORD
        2101: (_, A) => {},

        // BOW
        2102: (_, A) => {},

        // STAFF
        2103: (_, A) => {},

        // BLADE
        2104: (_, A) => {
            const p = (a, b) => { a.pa += gNumberCast((a.mPowMulP + a.mPowAddP) * 0.5); };
            for (const a of A) { a.pBpCrtL.set(0x040838n, p); }
        },

        // ASSBOW
        2105: (_, A) => {
            const p = (a, b) => { a.pp += gNumberCast(b.mSdNow * 0.3); };
            for (const a of A) { a.pBpAtkL.set(0x040839n, p); }
        },

        // DAGGER
        2106: (_, A) => {
            const 
                p1 = (a, b) => {
                    const t = a.mPowPM * 9, d = t * 20 + t * b.Flare.now() * 3 || 0;
                    a.pa += gNumberCast(d * 0.0025);
                },
                p2 = (a, b) => { b.Flare.inc(2); }
            ;
            for (const a of A) { 
                if (a.pBpAtkL.get(0x010BBBn)) { a.pBpAtkL.set(0x010BBBn, p1); }
                if (a.pBpAtkL.get(0x020BBBn)) { a.pBpAtkL.set(0x020BBBn, p2); }
            }
        },

        // WAND
        2107: (_, A) => {
            const p = (a, b) => {
                if (a.mTurn && (a.S[b.I] + a.SklRat.now() - b.EvaRat.now() <= a.rand() * 100)) { return; }

                const n = gNumberCast(
                    Math.max(Math.min(a.mPowMulM - b.mPowMulM, 7000), 0) * 0.1
                ), m = (gNumberCast(a.mPowM * 0.6) + gNumberCast(b.mSdMax * 0.04)) * (1 + n * 0.01);

                a.pm += gNumberCast(m) + gNumberCast(m * 0.6);
                a.uiAddArt1(3001);
            };
            for (const a of A) {
                if (a.pBpSklL.get(0x000BB9n)) { a.pBpSklL.set(0x000BB9n, p); }
            }
        },

        // SHIELD
        2108: (_, A) => {
            const n = A.size, 
                r0 = gNumberCast(n * 40 * _.mDpr),
                r1 = gNumberCast((n - 1) * 40 * _.mDpr)
            ;
            for (const b of _.AO) {
                if (A.has(b)) { b.mHpRecRat -= r1; b.mSdRecRat -= r1; continue; }
                b.mHpRecRat -= r0; b.mSdRecRat -= r0;
            }
        },

        // CLAYMORE
        2109: (_, A) => {
            const p = (a, b) => { a.crt = !0; };
            for (const a of A) { a.pBpAtkL.set(0x04083Dn, p); }
        },

        // SPEAR
        2110: (_, A) => {
            const p = (a, b) => { a.pm += gNumberCast(b.mHpNow * 0.3); };
            for (const a of A) { a.pBpAtkL.set(0x04083En, p); }
        },

        // GLOVES
        2201: (_, A) => {},

        // BRACELET
        2202: (_, A) => {
            const p = (a, b) => {
                if (a.rand() * 100 >= 20) { return; }
                a.pm += a.pm;
                a.uiAddAct("Equip2202");
            };
            for (const a of A) { a.pBpSklL.set(0x04089An, p); }
        },

        // VULTURE
        2203: (_, A) => {
            const p = (a) => {
                const r = a.LchRat.now();
                if (r <= 0) { return; }

                const I = a.I;
                let h = 0;
                for (const B of a.E) {
                    for (const b of B) { h += gNumberCast(gEffectMul3(b.nVecS[I] * b.nDecS || 0, r, 0.16)); }
                }
                a.nRecH += h;
            };
            for (const a of A) { a.pDpSetL.set(0x04089Bn, p); a.pDpSetR.set(0x04089Bn, p); }
        },

        // RING
        2204: (_, A) => {
            const p = (a, b) => {
                const n = gNumberCast((a.mGrowth * 2 + 100) * 0.2)
                a.pp += n; a.pm += n;
            };
            for (const a of A) {
                if (a.pBpSklL.get(0x000BB8n)) { a.pBpAtkL.set(0x000BB8n, p); } }
        },

        // DEVOUR
        2205: (_, A) => {
            const p = (a) => {
                let h = 0, s = 0;
                for (const B of a.E) {
                    for (const b of B) {
                        h += gNumberCast(b.nRecH * 0.6) + gNumberCast(b.nRecS * 0.3);
                        s += gNumberCast(b.nRecS * 0.6);
                    }
                }
                a.nRecH += h * a.mDpr;
                a.nRecS += s * a.mDpr;
            };
            for (const a of A) {
                if (a.pEpSetL.get(0x020BBFn)) { a.pEpSetL.set(0x020BBFn, p); }
                if (a.pEpSetR.get(0x020BBFn)) { a.pEpSetR.set(0x020BBFn, p); }
            }
        },

        // PLATE
        2301: (_, A) => {},

        // LEATHER
        2302: (_, A) => {},

        // CLOTH
        2303: (_, A) => {},

        // CLOAK
        2304: (_, A) => {
            for (const a of A) { a.mSdRat += 50; }
        },

        // THORN
        2305: (_, A) => {
            for (const a of A) { a.mRflRat += 30; }
        },

        // WOOD
        2306: (_, A) => {
            const p = (a, b) => { a.nRecH += gNumberCast(a.mHpMax * 0.1 * a.mDps); };
            for (const a of A) { a.pBpAtkR.set(0x040902n, p); }
        },

        // CAPE
        2307: (_, A) => {
            const p = (a, b) => {
                const n = Math.min(gNumberCast(b.pp * 0.5), gNumberMax);
                b.pp -= n; b.pm += n;
            };
            for (const a of A) { a.pBpPowR.set(0x040903n, p); }
        },

        // SCARF
        2401: (_, A) => {},

        // TIARA
        2402: (_, A) => {
            const p = (a, b) => { b.Light.inc(1); b.SpdRat.dec(4); };
            for (const a of A) {
                if (a.pBpPowR.get(0x010BBCn)) { a.pBpPowR.set(0x010BBCn, p); a.mSdRat += 15; }
            }
        },

        // RIBBON
        2403: (_, A) => {
            const p = (a) => {
                const n = gNumberCast(a.mHpMax * 0.05 * a.mDps);
                this.mHpNow += n;
                a.uiAddArt3(3002, "+" + Math.floor(n));
            };
            for (const a of A) {
                if (a.pCpSetL.get(0x020BBAn)) { a.pCpSetL.set(0x020BBAn, p); } 
                if (a.pCpSetR.get(0x020BBAn)) { a.pCpSetR.set(0x020BBAn, p); }
            }
        }

    },

};


// -----------------------------------------------------------------------------------------------------------------------------------------------------
//  * Arena Object * 
// -----------------------------------------------------------------------------------------------------------------------------------------------------

class ArenaObject {

    // Rules
    Scales = gRules.ScaleFactor; Rounds = gRules.RoundMax; 
    SklAdd = gRules.SklAdd; CrtAdd = gRules.CrtAdd;
    SklOff = gRules.SklOff; CrtOff = gRules.CrtOff;
    HpHeal = gRules.HpHeal; SdHeal = gRules.SdHeal;
    RflMul = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ];
    LchMul = [
        1, 0,
        0, 1
    ];
    SpdMin = gRules.SpdMin;

    // Teams
    AO = []; AA = []; mDpr = 1; mDps = 1;
    TSort = (l, r) => r.mSpdNow - l.mSpdNow; TCost = 0;
    PSort = (l, r) => (l > r) - (l < r);

    // -------------------------------------------------------------------------------
    //  * Setup *
    // -------------------------------------------------------------------------------
    
    #calcOffset () {
        const 
            AO = this.AO, CA = this.CrtAdd, CO = this.CrtOff, SA = this.SklAdd, SO = this.SklOff,
            AN = AO.length, RR = 1 / Math.max(AN * 0.5, 1), RS = this.Scales * RR;

        AO.forEach((l) => {
            const C = l.mCrtMul + l.mCrtAdd;
            const S = l.mSklMul + l.mSklAdd;
            l.C = AO.map((r) => {
                const t = Math.max(C - gNumberCast((C + r.mDodMul + r.mDodAdd) * CO) || 0, 0);
                return gNumberCast(100 * t / (t + CA));
            });
            l.S = AO.map((r) => {
                const t = Math.max(S - gNumberCast((S + r.mEvaMul + r.mEvaAdd) * SO) || 0, 0);
                return gNumberCast(100 * t / (t + SA));
            });
            l.nVecH = new Array(AN).fill(0);
            l.nVecS = new Array(AN).fill(0);
            l.mDpr = RR; l.mDps = RS;
        });
        this.mDpr = RR; this.mDps = RS;
    }

    // Setup rules
    rule (rule) {
        this.Rounds = rule.Rounds; this.Scales = rule.Scales;
        this.SklAdd = rule.SklAdd; this.CrtAdd = rule.CrtAdd;
        this.SklOff = rule.SklOff; this.CrtOff = rule.CrtOff;
        this.HpHeal = rule.HpHeal; this.SdHeal = rule.SdHeal;
        this.RflMul = rule.RflMul; this.LchMul = rule.LchMul;
        this.SpdMin = rule.SpdMin;
        this.#calcOffset();
    }

    // Setup teams
    team (team) {
        const AO = team.flat();
        this.AA = team;
        this.AO = AO;
        this.AU = [];
        AO.forEach((u, i) => {u.I = i});
        this.#calcOffset();
    }

    // Reset objects to their initial state
    ipSet () {
        const AO = this.AO, AU = this.AA.map(t => new Set(t)), P = [], Q = {};

        this.AU = AU;
        AU.forEach((t, i) => {
            const E = [...AU];
            E.splice(i, 1);
            for (const a of t) { a.E = E;}
        });
        for (const kind in ArenaEffect) {
            const p = ArenaEffect[kind], q = {};
            Q[kind] = q;
            for (const k in p) { q[k] = new Set(); }
        }
        for (const a of AO) {
            const cflags = a.mFlags;
            for (const kind in ArenaEffect) {
                const p = cflags[kind], q = Q[kind];
                for (const k of p) { q[k] && q[k].add(a); }
            }
            a.pApSetL = new Map(); a.pApSetR = new Map();
            a.pBpAtkL = new Map(); a.pBpAtkR = new Map();
            a.pBpCrtL = new Map(); a.pBpCrtR = new Map();
            a.pBpSklL = new Map(); a.pBpSklR = new Map();
            a.pBpDefL = new Map(); a.pBpDefR = new Map();
            a.pBpPowL = new Map(); a.pBpPowR = new Map();
            a.pBpDmgL = new Map(); a.pBpDmgR = new Map();
            a.pCpSetL = new Map(); a.pCpSetR = new Map();
            a.pDpSetL = new Map(); a.pDpSetR = new Map();
            a.pEpSetL = new Map(); a.pEpSetR = new Map();
            a.mAtkFixP = a.mAtkMulP; a.mAtkFixM = a.mAtkMulM; a.mAtkFixC = a.mAtkMulC;
            a.mDefFixP = a.mDefMulP; a.mDefFixM = a.mDefMulM;

            // Wish
            if (!a.mIsPVE) { continue; }
            const m = a.mPowBuf * 5, n = a.mLifeBuf * 5;
            this.mPowRatP += m; this.mPowRatM += m;
            this.mHpRat += n; this.mSdRat += n;
        }
        for (const kind in ArenaEffect) { 
            const p = ArenaEffect[kind], q = Q[kind];
            for (const k in p) {
                const x = p[k](this, q[k]);
                if (x) { P.push(x); }
            }
        }
        for (const a of AO) {
            a.mAtkFixP += a.mAtkAddP; a.mAtkFixM += a.mAtkAddM; a.mAtkFixC += a.mAtkAddC;
            a.mDefFixP += a.mDefAddP; a.mDefFixM += a.mDefAddM;
        }
        for (const p of P) { p(); }
        for (const a of AO) {
            a.mPowPM = a.mPowP + a.mPowM;
            for (const k of [
                "pApSetL", "pApSetR",
                "pBpAtkL", "pBpAtkR",
                "pBpCrtL", "pBpCrtR",
                "pBpSklL", "pBpSklR",
                "pBpDefL", "pBpDefR",
                "pBpPowL", "pBpPowR",
                "pBpDmgL", "pBpDmgR",
                "pCpSetL", "pCpSetR",
                "pDpSetL", "pDpSetR",
                "pEpSetL", "pEpSetR"
            ]) { 
                const p = a[k];
                a[k] = [...p.keys()].sort(this.PSort).map(p.get.bind(p));
             }
            a.reset();
        }
    }

    // Action Phase > Setup step
    apSetL (a) {
        for (const p of a.pApSetL) { p(a); }
        a.apSetL();
    }

    // Action Phase > Setup step
    apSetR (a) {
        for (const p of a.pApSetR) { p(a); }
        a.apSetR();
    }

    // Battle phase > Setup step
    bpSet (a, b) {
        a.bpSet(); b.bpSet();
    }

    // Battle phase > Attack step
    bpAtk (a, b) {
        a.bpAtk(b);
        for (const p of a.pBpAtkL) { p(a, b); }
        for (const p of b.pBpAtkR) { p(b, a); }
        if (a.crt) {
            a.bpCrt(b);
            for (const p of a.pBpCrtL) { p(a, b); }
            for (const p of b.pBpCrtR) { p(b, a); }
        }
        for (const p of a.pBpSklL) { p(a, b); }
        for (const p of b.pBpSklR) { p(b, a); }
        a.bpScl();
    }
    
    // Battle phase > Defend step
    bpDef (a, b) {
        b.bpDef(a);
        for (const p of a.pBpDefL) { p(a, b); }
        for (const p of b.pBpDefR) { p(b, a); }
        b.bpScl();
    }
    
    // Battle phase > Adjust step
    bpPow (a, b) {
        for (const p of a.pBpPowL) { p(a, b); }
        for (const p of b.pBpPowR) { p(b, a); }
        a.bpPow(); b.bpPow();
    }

    // Battle phase > Damage step
    bpDmg (a, b) {
        a.bpDmg(b); b.bpDmg(a);
        for (const p of a.pBpDmgL) { p(a, b); }
        for (const p of b.pBpDmgR) { p(b, a); }
        a.bpEnd(b); b.bpEnd(a);
        for (const k in gEmuStatusKind) { a[k].count(); b[k].count(); }
    }

    // Check phase > Setup step
    cpSetL (a) {
        a.cpSet();
        for (const p of a.pCpSetL) { p(a); }
    }

    // Check phase > Setup step
    cpSetR (a) {
        a.cpSet();
        for (const p of a.pCpSetR) { p(a); }
    }

    // Damage phase > Setup step
    dpSetL (a) {
        if (a.dpSet()) { for (const p of a.pDpSetL) { p(a); } }
    }

    // Damage phase > Setup step
    dpSetR (a) {
        if (a.dpSet()) { for (const p of a.pDpSetR) { p(a); } }
    }

    // End phase > Setup step
    epSetL (a) {
        a.epSetL();
        for (const p of a.pEpSetL) { p(a); }
    }
    
    // End phase > Setup step
    epSetR (a) {
        a.epSetR();
        for (const p of a.pEpSetR) { p(a); }
    }

    // Action Phase
    apEnt (AL, AR) {
        AL.forEach(this.apSetL); AR.forEach(this.apSetR);
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
        AL.forEach(this.cpSetL); AR.forEach(this.cpSetR);
    }

    // Damage Phase
    dpEnt (AL, AR) {
        AL.forEach(this.dpSetL); AR.forEach(this.dpSetR);
    }

    // End Phase
    epEnt (AL, AR) {
        AL.forEach(this.epSetL); AR.forEach(this.epSetR);
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
        gArrayShuffle(AL).sort(this.TSort);
        gArrayShuffle(AR).sort(this.TSort);
        timer = AL.length;
        timer = timer ? AL[timer - 1].mSpdNow : 0;
        AL.forEach(a => a.mSpdNow = a.mSpdNow - timer || 0);
    }

    // Apply all changes
    thaw () {
        const AU = this.AU;
        let r = 0;
        for (const i in AU) {
            const U = AU[i];
            for (const u of U) { u.apply() && U.delete(u); }
            r |= (U.size > 0) << i;
        }
        return r;
    }

    clear () {
        for (const a of this.AO) { a.clear(); }
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

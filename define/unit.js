/*
Project: fygemu
Authors: hirakana@kf
*/

class Unit extends ObjBase {
    
    constructor () {
        super();
        this.mName = gUsrJson.ID || "";
        this.mCard = new Card();
        this.mEquips = [];
        this.mAmulet = new Amulet();
        this.mWishs = new Wish();
        this.mAuras = new Aura();
        this.mIsPVE = 0;
        this.clr();
        for (const k in gEmuStatusKind) { this["c"+k] = 0; this["b"+k] = !1; }
    }

    clr () {

        this.nHpMaxMul = this.nHpMaxAdd = this.nHpHealRat = this.nHpHealMul = this.nHpHealAdd = 
        this.nSdMaxMul = this.nSdMaxAdd = this.nSdHealRat = this.nSdHealMul = this.nSdHealAdd =
        this.nPowMulP = this.nPowAddP = this.nPowMulM = this.nPowAddM = this.nPowMulA = this.nPowAddA = this.nSpdMul = this.nSpdAdd = 
        this.nAtkRatP = this.nAtkMulP = this.nAtkAddP = this.nAtkRatM = this.nAtkMulM = this.nAtkAddM = this.nAtkRatC = this.nAtkMulC = this.nAtkAddC =
        this.nDefRatP = this.nDefMulP = this.nDefAddP = this.nDefRatM = this.nDefMulM = this.nDefAddM = this.nResMulP = this.nResAddP = this.nResMulM = this.nResAddM =
        this.nCrtRat = this.nSklRat = this.nSklMul = this.nSklAdd = this.nCrtMul = this.nCrtAdd =
        this.nDodRat = this.nEvaRat = this.nEvaMul = this.nEvaAdd = this.nDodMul = this.nDodAdd =  
        this.nLchRat = this.nRflRat = 

        this.nLevel = this.nActor = this.nQuality = this.nSkill = this.nGrowth = 
        this.nStr = this.nAgi = this.nInt = this.nVit = this.nSpr = this.nMnd = 

        this.nPowRatP = this.nPowRatM = this.nSpdRat = this.nRecRat = this.nHpRat = this.nSdRat = 
        this.nLchFix = this.nRflFix = this.nCrtFix = this.nSklFix = this.nDodFix = this.nEvaFix = this.nDefFixP = this.nDefFixM = 
        
        this.nWishHpPot = this.nWishSdPot = this.nWishAura101 = this.nWishAura102 = this.nWishAura103 = this.nWishPowBuf = this.nWishLifeBuf = 0;
        this.nArt1 = new Set(); this.nArt2 = new Set(); this.nArt3 = new Set();
        this.nAura = new Set(); this.nMyst = new Set();
        this.nFlags = {
            "Art1": this.nArt1,
            "Art2": this.nArt2,
            "Art3": this.nArt3,
            "Aura": this.nAura,
            "Myst": this.nMyst
        };
    }

    setCard () {
        const c = this.mCard, a = this.mAmulet, l = c.mLevel;
        this.nLevel = l; this.nActor = c.mActor; this.nQuality = c.mQuality; this.nSkill = c.mSkill; this.nGrowth = c.mGrowth;
        this.nStr = gNumberCast(c.mStr + a.mStr); this.nAgi = gNumberCast(c.mAgi + a.mAgi); this.nInt = gNumberCast(c.mInt + a.mInt);
        this.nVit = gNumberCast(c.mVit + a.mVit); this.nSpr = gNumberCast(c.mSpr + a.mSpr); this.nMnd = gNumberCast(c.mMnd + a.mMnd);
        
        const T = {...this};

        for (const attr in gBaseStatAdd) {
            const x = T[attr], A = gBaseStatAdd[attr];
            if (x === undefined) { continue; }
            for (const stat in A) { this[stat] += gNumberCast(A[stat] * x); }
        }

        for (const attr in gBaseStatMul) {
            const x = T[attr], A = gBaseStatMul[attr];
            if (x === undefined) { continue; }
            for (const stat in A) {
                const a = this[stat];
                if (a === undefined) { continue; }
                this[stat] = gNumberCast(a * (1 + A[stat] * x));
            }
        }

        {
            const flags = this.nFlags, actor = gEmuActorKind[this.nActor], S = actor.stats, F = actor.flags;
            if (!actor) { return; }
            for (const attr in S || {}) {
                const [m, a] = S[attr];
                if (attr in this) { this[attr] += gNumberCast(m * l) + a; }
            }
            for (const kind in F || {}) {
                const p = flags[kind];
                for (const k of F[kind]) { p.add(k); }
            }
        }
    }

    setEquip () {
        const stats = {...this}, equips = this.mEquips, S = this.nMyst;

        equips.forEach((e) => {
            e.set();

            const R = e.mStats;

            gEmuEquipKind[e.mKind].stats.forEach((a, i) => {
                const k = a[0], M = gEmuEquipStatMul[k] || {}, A = gEmuEquipStatAdd[k] || {}, r = R[i];

                for (const k1 in M) {
                    const N = M[k1];

                    for (const k2 in N) {
                        this[k1] += gNumberCast(r * N[k2] * stats[k2]);
                    }
                }

                for (const k1 in A) {
                    this[k1] += gNumberCast(r * A[k1]);
                }

            })

            if (e.mSpecial) { S.add(e.mKind); }
        });
    }

    setAmulet () {
        const a = this.mAmulet;
        this.nPowRatP = a.mPowP; this.nPowRatM = a.mPowM; this.nSpdRat = a.mSpd; this.nRecRat = a.mRec; this.nHpRat = a.mHp; this.nSdRat = a.mSd;
        this.nLchFix = a.mLch; this.nRflFix = a.mRfl; this.nCrtFix = a.mCrt; this.nSklFix = a.mSkl; this.nDefFixP = a.mDefP; this.nDefFixM = a.mDefM; 
    }

    setWish () {
        const w = this.mWishs;
        this.nWishHpPot = w.mHpPot; this.nWishSdPot = w.mSdPot;
        this.nWishAura101 = w.mAura101; this.nWishAura102 = w.mAura102; this.nWishAura103 = w.mAura103;
        this.nWishPowBuf = w.mPowBuf; this.nWishLifeBuf = w.mLifeBuf;
    }

    setAura () {
        const S = this.nAura;
        this.mAuras.forEach((i) => S.add(i));
    }

    set () {
        this.clr();
        this.setCard();
        this.setEquip();
        this.setAmulet();
        this.setWish();
        this.setAura();
    }

    flipArt1 (flag) {
        const flags = this.nArt1, r = flags.has(flag);
        (r) ? flags.delete(flag) : flags.add(flag);
        return r;
    }

    flipArt2 (flag) {
        const flags = this.nArt2, r = flags.has(flag);
        (r) ? flags.delete(flag) : flags.add(flag);
        return r;
    }

    flipArt3 (flag) {
        const flags = this.nArt3, r = flags.has(flag);
        (r) ? flags.delete(flag) : flags.add(flag);
        return r;
    }

    flipAura (flag) {
        const flags = this.nAura, r = flags.has(flag);
        (r) ? flags.delete(flag) : flags.add(flag);
        return r;
    }

    flipMyst (flag) {
        const flags = this.nMyst, r = flags.has(flag);
        (r) ? flags.delete(flag) : flags.add(flag);
        return r;
    }

    fromJson (data) {
        for (const k in data) {
            const v = data[k];

            if (!(k in this)) { continue; }
            
            switch (k) {
            case "mCard":
            case "mAmulet":
            case "mWishs":
                this[k].fromJson(v);
                continue;

            case "mEquips":
                this.mEquips = v.map((e) => new Equip().fromJson(e));
                continue;
                
            case "mAuras":
                this.mAuras = new Aura(v);
                continue;

            case "nFlags":
                {
                    const
                        nArt1 = new Set(v.Art1), nArt2 = new Set(v.Art2), nArt3 = new Set(v.Art3),
                        nAura = new Set(v.Aura), nMyst = new Set(v.Myst)
                    ;
                    this.nArt1 = nArt1; this.nArt2 = nArt2; this.nArt3 = nArt3;
                    this.nAura = nAura; this.nMyst = nMyst;
                    this.nFlags = {
                        "Art1": nArt1,
                        "Art2": nArt2,
                        "Art3": nArt3,
                        "Aura": nAura,
                        "Myst": nMyst
                    }
                }
            case "nArt1":
            case "nArt2":
            case "nArt3":
            case "nAura":
            case "nMyst":
                continue;

            default:
                this[k] = v;
            }
        }

        return this;
    }

    toJson () {
        const R = {...this};
        
        R.mAuras = [...this.mAuras];
        R.nFlags = {
            "Art1": [...this.nArt1],
            "Art2": [...this.nArt2],
            "Art3": [...this.nArt3],
            "Aura": [...this.nAura],
            "Myst": [...this.nMyst]
        };
        delete R.nArt1, R.nArt2, R.nArt3, R.nAura, R.nMyst;
        return R;
    }

    flip (flag) {
        const flags = this.nFlags, r = flags.has(flag);
        (r) ? flags.delete(flag) : flags.add(flag);
        return r;
    }
};

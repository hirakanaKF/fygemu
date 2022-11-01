/*
Project: fygemu
Authors: hirakana@kf
*/

class Equip {
    
    constructor () {
        this.mKind = 0;
        this.mLevel = 0;
        this.mQuality = [];
        this.mStats = [];
        this.mSpecial = 0;
        this.mRank = 1;
        this.clr();
    }

    clr () {
        ;
    }

    set () {
        const A = gEmuEquipKind[this.mKind].stats, L = this.mLevel, Q = this.mQuality, R = this.mStats;
        for (const i in Q) {
            const [attrKind, attrMul, attrAdd, attrRat] = A[i];
            R[i] = gNumberCast(gNumberCast(attrMul * L + attrAdd) * attrRat * (Q[i] * 0.01));
        }
    }

    copy (d) {
        this.mKind = d.mKind;
        this.mLevel = d.mLevel;
        this.mQuality = [...d.mQuality];
        this.mStats = [...d.mStats];
        this.mSpecial = d.mSpecial;
        this.mRank = d.mRank;
    }

    setLevel (level) {
        this.mLevel = level;
        this.set();
        return level;
    }

    setKind (kind) {
        const A = gEmuEquipKind[kind].stats, N = A.length, L = this.mLevel, Qs = this.mQuality, Qd = new Array(N), Rd = new Array(N);

        this.mKind = kind;
        this.mQuality = Qd;
        this.mStats = Rd;
        for (const i in A) {
            const [attrKind, attrMul, attrAdd, attrRat] = A[i], q = Qs[i] || 0;
            Qd[i] = q;
            Rd[i] = gNumberCast(gNumberCast(attrMul * L + attrAdd) * attrRat * (q * 0.01));
        };
    }

    setQuality (i, q) {
        try {
            this.mQuality[i] = q;
        }
        catch {
            return 0;
        }

        const 
            [attrKind, attrMul, attrAdd, attrRat] = gEmuEquipKind[this.mKind].stats[i],
            t = gNumberCast(gNumberCast(attrMul * this.mLevel + attrAdd) * attrRat * (q * 0.01))
        ;

        this.mStats[i] = t;
        return t;
    }

    fromJson (data) {

        for (const k in data) {
            if (k in this) { this[k] = data[k]; }
        }

        return this;
    }

    toJson () {
        return this;
    }
};


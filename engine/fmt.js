/*
Project: fygemu
Authors: hirakana@kf
*/

// Setup
(globalThis.window ? (window.Format ??= {}) : exports).constructor = function (Data, Lib, Dbs) {

    const 
        {rngUniform} = Lib,
        {JO, JS, DB} = Dbs
    ;

    class ObjBase extends Object {

        constructor () {
            super();

            const D = this.$;
            for (const k in D) {
                const [t, l, b, c] = D[k];
                this[k] = JO[t](c); 
            }
        }

        clr () {
            const D = this.$;
            for (const k in D) {
                const [t, l, b, c] = D[k];
                if (!(b & 8)) { this[k] = (b & 4) ? this[k].clr() : JO[t](c); }
            }
            return this;
        }

        set () { return this; }

        from (d) {
            const D = this.$;
            for (const k in D) {
                const [t, l, b, c] = D[k], v = JO[t](d[l] ?? c), a = this[k];
                this[k] = b & 4 ? a.from(v) : v ?? a;
            }
            return this;
        }

        json () {
            const D = this.$, d = {};
            for (const k in D) {
                const [t, l, b, c] = D[k];
                if (b & 2) { d[l] = JS[t](this[k]); }
            }
            return d;
        }

        bson () {
            const D = this.$, d = {};
            for (const k in D) {
                const [t, l, b, c] = D[k];
                if (b & 1) { d[l] = DB[t](this[k]); }
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
            this.splice(0, this.length, ...d.map(v => v && new this.$().from(v)));
            return this;
        }

        json () {
            return this.map(t => t && t.json());
        }

        bson () {
            return this.map(t => t && t.bson());
        }
    }
    Object.defineProperty(
        ArrBase.prototype, "$", {value: ObjBase, writable: false, enumerable: false}
    );
    
    class VecBase extends ObjBase {

        clr () {
            for (const k in this) { this[k].clr(); }
            return this;
        }

        set () {
            for (const k in this) { this[k].set(); }
            return this;
        }

        from (d) {
            for (const i in d) { this[i] = new this.$().from(d[i]); }
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
    Object.defineProperty(
        VecBase.prototype, "$", {value: ObjBase, writable: false, enumerable: false}
    );

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
    //  * Actor * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class Actor extends ObjBase {
        
        constructor (kind = 0n) {
            super();
            this.mKind = kind;
        }
    };
    Object.defineProperty(
        Actor.prototype, "$", {value: Data.card, writable: false, enumerable: false}
    );

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Equip * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class Equip extends ObjBase {}
    Object.defineProperty(
        Equip.prototype, "$", {value: Data.equip, writable: false, enumerable: false}
    );

    class EquipArr extends ArrBase {}
    Object.defineProperty(
        EquipArr.prototype, "$", {value: Equip, writable: false, enumerable: false}
    );

    class EquipVec extends VecBase {}
    Object.defineProperty(
        EquipVec.prototype, "$", {value: Equip, writable: false, enumerable: false}
    );

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Fruit * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    
    class Fruit extends ObjBase {}
    Object.defineProperty(
        Fruit.prototype, "$", {value: Data.fruit, writable: false, enumerable: false}
    );
    
    class FruitArr extends ArrBase {}
    Object.defineProperty(
        FruitArr.prototype, "$", {value: Fruit, writable: false, enumerable: false}
    );

    class FruitVec extends VecBase {}
    Object.defineProperty(
        FruitVec.prototype, "$", {value: Fruit, writable: false, enumerable: false}
    );

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Wish * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class Wish extends ObjBase {}
    Object.defineProperty(
        Wish.prototype, "$", {value: Data.wish, writable: false, enumerable: false}
    );

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Amulet * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class Amulet extends ObjBase {}
    Object.defineProperty(
        Amulet.prototype, "$", {value: Data.amulet, writable: false, enumerable: false}
    );

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Die * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    
    class Dice extends ObjBase {}
    Object.defineProperty(
        Dice.prototype, "$", {value: Data.dice, writable: false, enumerable: false}
    );

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Gem * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    
    class Gems extends ObjBase {}

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * User * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class User extends ObjBase {}
    Object.defineProperty(
        User.prototype, "$", {value: Data.user, writable: false, enumerable: false}
    );

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Fight * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class Fight extends ObjBase {}
    Object.defineProperty(
        Fight.prototype, "$", {value: Data.fight, writable: false, enumerable: false}
    );

    class FightArr extends ArrBase {}
    Object.defineProperty(
        FightArr.prototype, "$", {value: Fight, writable: false, enumerable: false}
    );

    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    //  * Record * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------
    class Record extends ObjBase {}
    Object.defineProperty(
        Record.prototype, "$", {value: Data.record, writable: false, enumerable: false}
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
            this.nFlags = new SetBase();;
            this.mIsPVE = pve;
        }
    };
    Object.defineProperty(
        Unit.prototype, "$", {value: Data.unit, writable: false, enumerable: false}
    );

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
            let n = rngUniform() * this.mMax;
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
    //  * Arena * 
    // -----------------------------------------------------------------------------------------------------------------------------------------------------

    class Arena extends ObjBase {}
    Object.defineProperty(
        Arena.prototype, "$", {value: Data.arena, writable: false, enumerable: false}
    );
    
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Initialization *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Exports *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    this.__proto__ = {
        ObjBase, ArrBase, VecBase, SetBase, MapBase,
        Actor, Equip, Fruit, Wish, Amulet, Dice, Gems, User, Unit, Fight, Record, Aura, Arena,
        EquipArr, EquipVec, FruitArr, FruitVec, FightArr,
        StatusNull, StatusBase, StatusFlag, StatusNumber, StatusCtor
    }
}

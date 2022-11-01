/*
Project: fygemu
Authors: hirakana@kf
*/

class ObjBase extends Object {

    fromJson (d) {
        for (const k in d) { this[k] = d[k]; }
        return this;
    }

    toJson () {
        return {...this}
    }
}

class SetBase extends Set {

}

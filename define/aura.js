/*
Project: fygemu
Authors: hirakana@kf
*/

class Aura extends SetBase {

    flip (aura) {
        const r = this.has(aura);
        (r) ? this.delete(aura) : this.add(aura);
        return r;
    }

}

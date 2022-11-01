/*
Project: fygemu
Authors: hirakana@kf
*/

class Wish extends ObjBase {

    constructor (d) {
        super(d);
        this.clr();
    }

    clr () {
        this.mHpPot = this.mSdPot = this.mAura101 = this.mAura102 = this.mAura103 = this.mPowBuf = this.mLifeBuf = 0;
    }

    set () {
        ;
    }

}

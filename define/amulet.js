/*
Project: fygemu
Authors: hirakana@kf
*/

class Amulet extends ObjBase {

    constructor (d) {
        super(d);
        this.clr();
    }

    clr () {
        this.mStr = this.mAgi = this.mInt = this.mVit = this.mSpr = this.mMnd =
        this.mPowP = this.mPowM = this.mSpd = this.mRec = this.mHp = this.mSd = 
        this.mLch = this.mRfl = this.mCrt = this.mSkl = this.mDefP = this.mDefM = 0;
    }

    set () {
        ;
    }

}

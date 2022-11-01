/*
Project: fygemu
Authors: hirakana@kf
*/

class Card extends ObjBase {
    
    constructor (d) {
        super(d);
        this.clr();
    }

    clr () {
        this.mLevel = this.mActor = this.mQuality = this.mSkill = this.mGrowth = 
        this.mStr = this.mAgi = this.mInt = this.mVit = this.mSpr = this.mMnd = 0;
    }

    set () {
        ;
    }
};

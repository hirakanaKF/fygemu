/*
Project: fygemu
Authors: hirakana@kf
*/

(() => {

    let mCost = {}, mCeil = {}, mLmt = 0, mMul = 0, nMul = 0;

    const 

        mNow = {},
        mAdd = {},

        mNum = {},
        mName = {},
        mDesc = {},

        // Wish
        elWish = uiPanel4({root: {tag: "div", classList: "fyg_wish row"}, body: [{tag: "div", classList: "panel-body"}, {tag: "div", classList: "panel-body fyg_lh30"}]}),
        elWishBtnA = document.createElement("div"),
        elWishBtnB = document.createElement("button"),
        elWishRow1 = document.createElement("div"),
        elWishRow2 = document.createElement("div"),
        elWishRow3 = document.createElement("div"),
        elWishRow4 = document.createElement("div"),

        // Manual
        elManual = uiPanel4({root: {tag: "div", classList: "fyg_wish row"}, panel: {tag: "div", classList: "panel panel-info"}})

        uiSetWish = (d) => {
            for (const k in d) {
                const el = mNum[k];
                if (!el) { continue; }
                el.innerHTML = d[k];
            }
        },
        
        uiSyncCost = () => {
            const T = [], m = mMul + nMul, n = m * m - mMul * mMul;
            for (const k in mCost) { T.push(mCost[k] * n + " " + gMsgItemName[k]); }
            elWishBtnB.lastChild.textContent = T.join(" + ");
        },

        uiReset = () => {
            elWishBtnB.lastChild.textContent = "";
            for (const A of LYT_WISH.Order) {
                for (const k of A) { mNum[k].innerHTML = ""; }
            };
            uiSetWish(USR.Wish); elWishBtnB.lastChild.innerHTML = USR.WishCost;
            mLmt = 0; mMul = 0; nMul = 0;
        }
    ;

    // Wish
    elWish[2].append(elWishBtnA, elWishRow1, elWishRow2, elWishRow3, elWishRow4);
    elWishRow1.classList = elWishRow2.classList = elWishRow3.classList = elWishRow4.classList = "col-xs-12 col-md-3";
    elWishBtnA.classList = "col-xs-12 fyg_tc"; elWishBtnA.append(elWishBtnB);
    elWishBtnB.classList = "btn btn-block btn-lg btn-success"; elWishBtnB.type = "button";
    elWishBtnB.onclick = () => {
        const m = mMul + nMul, n = m * m - mMul * mMul, p = {};
        for (const k in mAdd) {
            if (mAdd[k] > 0) { p[k] = mAdd[k]; }
        }
        if (nMul) {
            Client[$CoSysPay](mCost, n)
                .then(d => d && Server[$SoWpDrop](p, nMul))
            ;
        }
    }
    elWishBtnB.append("", document.createElement("br"), "");

    {
        const rank = [
            [elWishRow1, "", "fyg_colpz01bg"],
            [elWishRow1, "alert-primary ", "fyg_colpz02bg"],
            [elWishRow2, "alert-success ", "fyg_colpz03bg"],
            [elWishRow3, "alert-warning ", "fyg_colpz04bg"],
            [elWishRow4, "alert-danger ", "fyg_colpz05bg"]
        ];
        LYT_WISH.Order.forEach((A, i) => {
            const [dst, alert, button] = rank[i];
            for (const k of A) {
                const 
                    el = uiTipTop4({root: {classList: `col-xs-12 alert ${alert}fyg_mp8 fyg_f14 tip-top`}}),
                    et = document.createElement("span"), en = document.createElement("span"),
                    ea = document.createElement("button"), eb = document.createElement("button"),
                    f = t => {
                        if (mLmt <= 0) { return; }
                        const n = nMul + t - mAdd[k];
                        if (n > mLmt - gUser.wish) { return; }
                        nMul = n;
                        mAdd[k] = t;
                        mNum[k].innerHTML = uiNumCast(mNow[k]) + (t && `(+${t})`);
                        uiSyncCost();
                    }
                ;
                dst.append(el); el.append(ea, et, eb, en);
                ea.classList = `fyg_wpl btn ${button}`; ea.innerHTML = "－"; 
                eb.classList = `fyg_wpr btn ${button}`; eb.innerHTML = "＋";
                en.classList = "pull-right fyg_f24";

                mNum[k] = en; mName[k] = et; mDesc[k] = el.inner;
                mNow[k] = mAdd[k] = 0;
                ea.onclick = () => f(Math.max(mAdd[k] - 1, 0));
                eb.onclick = () => f(Math.min(mAdd[k] + 1, (mCeil[k] ?? mNow[k]) - mNow[k]));
            }
        });
    }

    // Manual
    elManual[1].innerHTML = "";
    
    elWish.onload = () => {
        elWish[0].innerHTML = gMsgData[$MsgNameWishPool];
        elWish[1].innerHTML = gMsgData[$MsgDescWishPool];
        elWishBtnB.firstChild.textContent = gMsgData[$MsgNameWishBtn];
        uiSyncCost();
        for (const k in mName) { mName[k].innerHTML = gMsgWishName[k] ?? k; }
        for (const k in mDesc) { mDesc[k].innerHTML = gMsgWishDesc[k] ?? k; }
    }
    
    elManual.onload = () => {
        elManual[0].innerHTML = gMsgData[$MsgNameManual];
    }

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Initialization *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    uiReset();
    eSvcRoot.append(elWish, elManual);

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Exports *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    Client[$CoWishReset] = uiReset;
    Client[$CoWishInit] = (d, l, c) => {
        mCeil = d; mLmt = l;
        mCost = {...c};
        delete mCost.wish;
        uiSyncCost();
    };
    Client[$CoWishSet] = (d, n) => {
        for (const k in d) {
            mNow[k] = d[k]; mAdd[k] = 0;
            mNum[k].innerHTML = uiNumCast(d[k]);
        }
        mMul = n; nMul = 0;
        uiSyncCost();
    };
    
})();

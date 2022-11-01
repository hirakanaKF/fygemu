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
        elWish = uiPanel4({root: {tag: "div", classList: "fyg_wish row"}, body: [{tag: "div", classList: "panel-body"}, {tag: "div", classList: "panel-body fyg_lh30 row"}]}),
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
            const T = [], m = mMul + nMul, n = m * m * m - mMul * mMul * mMul;
            for (const k in mCost) { T.push(mCost[k] * n + " " + gMsgGiftName[k]); }
            elWishBtnB.lastChild.textContent = T.join(" + ");
        },

        uiReset = () => {
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
        const m = mMul + nMul, n = m * m * m - mMul * mMul * mMul, p = {};
        for (const k in mAdd) {
            if (mAdd[k] > 0) { p[k] = mAdd[k]; }
        }
        Client[$CoSysPay](mCost, n) && Server[$SoWpDrop](p, nMul);
    }
    elWishBtnB.append("", document.createElement("br"), "");

    {
        const rank = [
            [elWishRow1, "", "fyg_colpz01bg"],
            [elWishRow1, "alert-primary ", "fyg_colpz02bg"],
            [elWishRow2, "alert-success ", "fyg_colpz03bg"],
            [elWishRow3, "alert-warning ", "fyg_colpz04bg"],
            [elWishRow4, "alert-danger ", "fyg_colpz05bg"]
        ]
        LYT_WISH.Order.forEach((A, i) => {
            const [dst, alert, button] = rank[i];
            for (const k in A) {
                const 
                    l = A[k], 
                    el = uiTipTop4({root: {classList: `col-xs-12 alert ${alert}fyg_mp8 fyg_f14 tip-top`}}),
                    et = document.createElement("span"), en = document.createElement("span"),
                    ea = document.createElement("button"), eb = document.createElement("button"),
                    f = t => {
                        const n = nMul + t - mAdd[l];
                        if (n > mLmt) { return; }
                        nMul = n;
                        mAdd[l] = t;
                        mNum[l].innerHTML = uiNumCast(mNow[l]) + (t && `(+${t})`);
                        uiSyncCost();
                    }
                ;
                dst.append(el); el.append(ea, et, eb, en);
                ea.classList = `fyg_wpl btn ${button}`; ea.innerHTML = "－"; 
                eb.classList = `fyg_wpr btn ${button}`; eb.innerHTML = "＋";
                en.classList = "pull-right fyg_f24";

                mNum[l] = en; mName[k] = et; mDesc[k] = el.inner;
                mNow[l] = mAdd[l] = 0;
                ea.onclick = () => f(Math.max(mAdd[l] - 1, 0));
                eb.onclick = () => f(Math.min(mAdd[l] + 1, mCeil[l] ?? mNow[l] - mNow[l]));
            }
        });
    }

    // Manual
    elManual[1].innerHTML = "";
    
    elWish.onload = () => {
        elWish[0].innerHTML = gMsgPanelName.WishPool;
        elWish[1].innerHTML = gMsgPanelDesc.WishPool;
        elWishBtnB.firstChild.textContent = gMsgPanelName.WishBtn;
        {
            const T = [];
            for (const k in mCost) { T.push(mCost[k] + " " + gMsgGiftName[k]); }
            elWishBtnB.lastChild.textContent = T.join(" + ") || "";
        }
        for (const k in mName) { mName[k].innerHTML = gMsgWishName[k] ?? k; }
        for (const k in mDesc) { mDesc[k].innerHTML = gMsgWishDesc[k] ?? k; }
    }
    
    elManual.onload = () => {
        elManual[0].innerHTML = gMsgPanelName.Manual;
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
    Client[$CoWishSet] = (d, n) => {
        for (const k in d) {
            mNow[k] = d[k]; mAdd[k] = 0;
            mNum[k].innerHTML = uiNumCast(d[k]);
        }
        mMul = n; nMul = 0;
        uiSyncCost();
    };
    Client[$CoWishMax] = (d, l) => {
        mCeil = d; mLmt = l;
    };
    Client[$CoWishCost] = d => {
        mCost = {...d};
        delete mCost.wish;
        uiSyncCost();
    };
    
})();

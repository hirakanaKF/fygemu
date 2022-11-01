/*
Project: fygemu
Authors: hirakana@kf
*/

(() => {
    
    let mGiftSum = {}, mCostNum = {}, mCostMul = 0, mCostMsg = ""; // mGiftNum = {}

    const

        mGiftData = Array(16).fill(3).map(Array),
        mCallback = mGiftData.map(
            (_, i) => () => Client[$CoSysPay](mCostNum, 3 * mCostMul * mCostMul + 3 * mCostMul + 1)
                .then(d => d && 
                    Server[$SoGpFlip](i)
                    .then(d => {
                        switch (d) {
                        case $CbResolved:
                            {
                                const [kind, type, value] = mGiftData[i];
                                return Client[$CoSysGot]({[kind]: value}, 1, $MsgHintItGet);
                            }
                        case $CbRejected:
                            ;// Error
                        }
                    })
                )
        ),
        pNullSub = function () { this.blur(); },
        
        elPool = uiPanel4({root: {tag: "div", classList: "fyg_gift row"}, panel: {tag: "div", classList: "panel panel-primary"}}),
        elPoolInfo = document.createElement("div"),
        elPoolSum = document.createElement("h2"),
        // elPoolNum = document.createElement("h4"),

        elBody = uiPanel4({root: {tag: "div", classList: "fyg_gift row"}, panel: {tag: "div", classList: "panel panel-primary"}, head: {tag: "div", classList: "panel-heading css-debug"}}),

        elManual = uiPanel4({root: {tag: "div", classList: "fyg_gift row"}, panel: {tag: "div", classList: "panel panel-info"}}),

        giftJpt = {
            "aura": n => n.toFixed ? n.toFixed(2) : n
        },

        uiRenderInfo = () => {
            const h2 = [], h4 = [];
            for (const k in mGiftSum) { h2.push(`${mGiftSum[k]}${gMsgItemUnit[k] ?? ""}${gMsgItemName[k] ?? ""}`); }
            // for (const k in mGiftNum) { h4.push(`${mGiftNum[k]}${gMsgItemUnit[k] ?? ""}${gMsgItemName[k] ?? ""}`); }
            elPoolSum.innerHTML = gMsgData[$MsgNameGiftTotal] + h2.join(" + ");
            // elPoolNum.innerHTML = gMsgData[$MsgNameGiftBase] + h4.join(" + ");
        },

        uiRenderData = () => {
            const T = [];
            for (const k in mCostNum) { T.push((giftJpt[k] ?? uiNumCast)(mCostNum[k] * (3 * mCostMul * mCostMul + 3 * mCostMul + 1)) + " " + gMsgItemName[k]); }
            mCostMsg = T.join(" + ") || "　";
            
            const E = elBody[1].children;
            for (const i in mGiftData) {
                const [kind, type, value] = mGiftData[i], el = E[i];
                if (kind) {
                    el.classList = "col-xs-6 col-md-3 btn btn-lg btn-" + gCssCardClass[type];
                    el.innerHTML = `${gMsgItemName[kind] || kind} + ${value}${gMsgItemUnit[kind] || ""}`;
                    el.onclick = pNullSub; el.blur();
                }
                else {
                    el.classList = "col-xs-6 col-md-3 btn btn-lg fyg_cost"; el.innerHTML = mCostMsg;
                    el.onclick = mCallback[i];
                }
            }
        },

        uiReset = () => {
            const data = USR.Gift.Data;
            mGiftSum = USR.Gift.Sum; // mGiftNum = USR.Gift.Num;
            mCostMsg = USR.Gift.Cost || "　"; mAuraNum = 1;
            mGiftData.forEach((t, i) => {
                const d = data[i];
                t.fill("");
                if (d) { t[0] = d.kind || ""; t[1] = d.type || 0; t[2] = d.value || ""; }
            });
            uiRenderInfo();
            uiRenderData();
        }
    ;

    elPool[1].append(elPoolInfo);
    elPoolInfo.classList = "btn-group"; elPoolInfo.append(elPoolSum); // , elPoolNum);
    elPoolSum.classList = "text-primary";
    
    elBody[1].append(...mGiftData.map((x, i) => {
        const el = document.createElement("button");
        el.classList = "col-xs-6 col-md-3 btn btn-lg"; el.style = "padding:10rem 1rem;margin-bottom:0.5rem;transform: matrix(0.984375, 0, 0, 0.984375, 0, 0);"; el.type = "button";
        return el;
    }));
    
    elManual[1].innerHTML = "";

    elPool.onload = () => {
        const T = [];
        elPool[0].innerHTML = gMsgData[$MsgNameGiftPool];
        for (const k in mCostNum) { T.push(mCostNum[k] + " " + gMsgItemName[k]); }
        mCostMsg = T.join(" + ") || "　";
        uiRenderData(); uiRenderInfo();
    };

    elManual.onload = () => {
        elManual[0].innerHTML = gMsgData[$MsgNameManual];
        uiRenderInfo();
    };

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Initialization *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    uiReset();
    eSvcRoot.append(elPool, elBody, elManual);

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Exports *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    
    Client[$CoGiftReset] = uiReset;

    Client[$CoGiftInit] = d => {
        mCostNum = d;
        uiRenderData();
    };

    Client[$CoGiftData] = (gsum, d) => {
        mGiftSum = {}; // mGiftNum = {}; 
        mGiftData.forEach(a => a.fill(null));
        mCostMul = 0;

        for (const k in gsum) { mGiftSum[k] = (giftJpt[k] ?? uiNumCast)(gsum[k]); }
        // for (const k in gnum) { mGiftNum[k] = (giftJpt[k] ?? uiNumCast)(gnum[k]); }
        for (const i in d) {
            const {k, r, v} = d[i];
            mGiftData[i] = [k, r, (giftJpt[k] ?? uiNumCast)(v)];
            mCostMul++;
        }
        uiRenderInfo(); uiRenderData();
    };

    Client[$CoGiftFlip] = (i, d) => {
        const {k, r, v} = d;
        mGiftData[i] = [k, r, (giftJpt[k] ?? uiNumCast)(v)];
        mCostMul++; 
        uiRenderData();
    };

})();

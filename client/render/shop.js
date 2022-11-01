/*
Project: fygemu
Authors: hirakana@kf
*/

(() => {

    const 

        mItem = Array(32).fill().map(uiShopItem),
        mBack = Array(32).fill().map(uiShopBack),

        // Body
        elBody = document.createElement("div"),

        // Update Log
        elUpdate = uiPanel4({root: {tag: "div", classList: "fyg_shop col-xs-12"}, panel: {tag: "div", classList: "panel"}}),

        // Left
        elVip = uiPanel4({root: {tag: "div", classList: "fyg_shop col-xs-12 col-md-3"}, panel: {tag: "div", classList: "panel panel-primary"}, body: [{tag: "div", classList: "panel-body"}, {tag: "div", classList: "panel-body fyg_nw", style: "max-height: 64rem;"}, {tag: "div", classList: "panel-body"}]}),
        
        // Middle
        elDice = uiPanel4({root: {tag: "div", classList: "fyg_shop col-xs-12 col-md-6"}, panel: {tag: "div", classList: "panel panel-primary"}, body: [{tag: "div", classList: "panel-body"}, {tag: "div", classList: "panel-body fyg_nw", style: "max-height: 64rem;"}, {tag: "div", classList: "panel-body"}]}),

        // Right
        elBuy = uiPanel4({root: {tag: "div", classList: "fyg_shop col-xs-12 col-md-3"}, panel: {tag: "div", classList: "panel panel-primary"}}),
        elBuyBtn = document.createElement("button"),
        elBuyIcon = document.createElement("i"),

        // Manual
        elManual = uiPanel4({root: {tag: "div", classList: "fyg_shop row"}, panel: {tag: "div", classList: "panel panel-info"}}),

        bbuy = function () {
            const {p, m, n, i} = this;
            if (m > 0) {
                Client[$CoSysPay](p, m)
                    .then(d => d && 
                        Server[$SoScBack](i, n)
                        .then(d => {
                            switch (d) {
                            case $CbResolved:
                                return Client[$CoSysGot]({[i]: n}, 1, $MsgHintItGet);
                            case $CbRejected:
                                ; // Error
                            }
                        })
                    )
                ;
            }
        },

        uiShowBack = (d, m) => {
            for (const el of mBack) { el.clr(); }
            let i = 0;
            for (const k in d) { mBack[i].dt(k, d[k], m[k] ?? 0); mBack[i].open(!0); i++; }
        },

        ibuy = function () {
            if (this.n > 0) {
                const {g, p, n, i} = this;
                Client[$CoSysPay](p, n)
                    .then(d => d && 
                        Server[$SoScItem](i, n)
                        .then(d => {
                            switch (d) {
                            case $CbResolved:
                                return Client[$CoSysGot](g, n, $MsgHintItGet);
                            case $CbRejected:
                                ; // Error
                            }
                        })
                    )
                ;
            }
        },

        uiShowItem = d => {
            for (const el of mItem) { el.clr(); }
            d.forEach((t, i) => { mItem[i].dt(i, t); mItem[i].open(!0); });
        },

        uiReset = () => {
            uiShowItem(USR.Shop.Item);
            uiShowBack(USR.Shop.Back);
            elBuyBtn.disabled = !1;
        }
    ;

    elBody.classList = "fyg_shop row";
    elBody.append(elUpdate, elVip, elDice, elBuy);

    elVip[2].append(...mBack); mBack.forEach(el => el.cb(bbuy));
    elDice[2].append(...mItem); mItem.forEach(el => el.cb(ibuy));
    
    elBuy[1].append(elBuyBtn);
    elBuyBtn.classList = "btn btn-block btn-lg btn-success"; elBuyBtn.type = "button"; elBuyBtn.append(elBuyIcon, "");
    elBuyBtn.onclick = () => Server[$SoScCoin]();
    elBuyIcon.classList = "icon icon-diamond icon-2x";

    elBody.onload = () => {
        elUpdate[0].innerHTML = gMsgData[$MsgNameShopUpdate];
        elVip[0].innerHTML = gMsgData[$MsgNameShopVip];
        elDice[0].innerHTML = gMsgData[$MsgNameShopDice];
        elBuy[0].innerHTML = gMsgData[$MsgNameShopBuy];
        elBuyBtn.lastChild.textContent = gMsgData[$MsgNameShopBuyBtn];
        mBack.forEach(el => el.onload());
        mItem.forEach(el => el.onload());
    };

    elManual.onload = () => {
        elManual[0].innerHTML = gMsgData[$MsgNameManual];
    };
    
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Initialization *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    eSvcRoot.append(elBody, elManual);

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Exports *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    Client[$CoShopReset] = uiReset;
    Client[$CoShopInit] = (item, back, num) => {
        uiShowItem(item);
        uiShowBack(back, num);
    };
    Client[$CoShopUsr] = () => { mBack.forEach(el => el.onload()); }
    Client[$CoShopEnable] = b => elBuyBtn.disabled = !b;

})();

/*
Project: fygemu
Authors: hirakana@kf
*/

(() => {
    
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Conponents *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------

    const 

        // 
        gOnLoad = () => {},

        // css
        gPageCss = " { display: block; }",
        gDemoCss = ".fyg_debug { display: none; }",

        // I/O
        elIoBar = document.createElement("div"),

        // CSS
        elPageStyle = document.createElement("style"),
        elDemoStyle = document.createElement("style"),

        // Header
        elHead = document.createElement("div"),
        elHead1 = document.createElement("div"),
        elHead2 = document.createElement("div"),
        elHead3 = document.createElement("div"),
        elTool = document.createElement("div"),
        elInfo = document.createElement("div"),
        elInfoId = document.createElement("span"),
        elInfoRank = document.createElement("span"),
        elInfoLevel = document.createElement("span"),
        elInfoSVip = document.createElement("span"),
        elInfoBvip = document.createElement("span"),
        elLang = document.createElement("div"),
        elLine = document.createElement("hr"),
        elPage = document.createElement("div"),
        elPage1 = document.createElement("div"),
        elPage2 = document.createElement("div"),
        elWallet = document.createElement("div"),
        elCoin1 = document.createElement("h5"),
        elCoin2 = document.createElement("h5"),
        elCoin3 = document.createElement("h5"),
        elCoin1N = document.createElement("span"),
        elCoin2N = document.createElement("span"),
        elCoin3N = document.createElement("span"),

        // Footer
        elFoot = document.createElement("div"),
        elFootLogout = document.createElement("a"),
        elFootChange = document.createElement("a"),
        elFootByebye = document.createElement("a"),

        // Modal
        elModal = document.createElement("div"),
        elBack = document.createElement("div")
    ;

    elRoot.style = `width:96%;${gUsrJson.ScreenWidth > 0 ? ` max-width:${gUsrJson.ScreenWidth}px;` : "" } margin: 0 auto;`;

    // I/O
    elIoBar.style = "display: none;";
    elIoBar.append(elIoReader, elIoWriter);
    elIoReader.type = "file";
    
    // Header
    elHead.classList = "fyg_head row";
    elHead.append(elHead1);
    elHead1.classList = "panel";
    elHead1.append(elHead2);
    elHead2.classList = "panel-body";
    elHead2.append(elHead3);
    elHead3.classList = "row";
    elHead3.append(elTool, elWallet);

    // Tool
    elTool.classList = "col-md-10";
    elTool.append(elInfo, document.createElement("hr"), elLang, elLine, elPage);
    
    // Meta
    elInfo.style = "letter-spacing: 2px;";
    elInfo.append(elInfoId, " ", elInfoRank, " ", elInfoLevel, " ", elInfoSVip, " ", elInfoBvip);
    elInfoId.classList = "fyg_colpz06 fyg_f24";
    elInfoRank.classList = "label label-primary";
    elInfoLevel.classList = "label label-primary";
    elInfoSVip.classList = "label label-danger";
    elInfoBvip.classList = "label label-warning";

    // Lang
    elLang.classList = "btn-group fyg_debug";
    Object.entries(gMsgJsons).forEach((A) => {
        const [k, v] = A, e = document.createElement("button");

        e.type = "button";
        e.classList = "btn btn-lg";
        e.innerHTML = v.Name;
        e.onclick = () => { uiSetLang(k); };
        elLang[k] = e;
        elLang.append(e);
    });

    // Line
    elLine.classList = "fyg_debug";

    // Page
    elPage.append(elPage1, " ", elPage2);
    elPage1.classList = "btn-group";
    ["pk"].forEach((k) => {
        const e = document.createElement("button");
        
        e.type = "button";
        e.classList = "btn btn-lg";
        e.onclick = () => { uiSetPage(k); };
        elPage[k] = e;
        elPage1.append(e);
    });
    elPage2.classList = "btn-group";
    ["equip", "wish", "beach", "gift", "shop"].forEach((k) => {
        const e = document.createElement("button");
        
        e.type = "button";
        e.classList = "btn btn-lg";
        e.onclick = () => { uiSetPage(k); };
        elPage[k] = e;
        elPage2.append(e);
    });

    // Wallet
    elWallet.classList = "col-md-2";
    elWallet.style = "letter-spacing: 1px;";
    elWallet.append(elCoin1, elCoin2, elCoin3);
    elCoin1.classList = "with-padding hl-gray";
    elCoin2.classList = "with-padding hl-gray";
    elCoin3.classList = "with-padding hl-gray";
    elCoin1N.classList = "fyg_f14 fyg_fr";
    elCoin2N.classList = "fyg_f14 fyg_fr";
    elCoin3N.classList = "fyg_f14 fyg_fr";

    // Footer
    elFoot.classList = "fyg_foot row fyg_lh60 fyg_tc";
    elFoot.append(elFootLogout, " ", elFootChange, " ", elFootByebye);
    elFootLogout.classList = "label label-primary label-outline";
    elFootLogout.onclick = () => uiSetPage("login");
    elFootChange.classList = "label label-outline";
    elFootChange.onclick = () => uiSetPage("index");
    elFootByebye.classList = "label label-outline";
    elFootByebye.onclick = () => uiSetPage("byebye");

    // Modal
    elModal.classList = "modal fade load-indicator";
    elBack.classList = "modal-backdrop fade";
    elBack.style = "display: none;";

    document.body.append(elPageStyle, elDemoStyle, elIoBar, elRoot, elBack);

    elRoot.firstChild ? elRoot.insertBefore(elHead, elRoot.firstChild) : elRoot.append(elHead);
    elRoot.append(elFoot);

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Renderers *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------

    elHead.onload = () => {
        elPage.pk.innerHTML = gMsgPanelName.fygPk;
        elPage.equip.innerHTML = gMsgPanelName.fygEquip;
        elPage.wish.innerHTML = gMsgPanelName.fygWish;
        elPage.beach.innerHTML = gMsgPanelName.fygBeach;
        elPage.gift.innerHTML = gMsgPanelName.fygGift;
        elPage.shop.innerHTML = gMsgPanelName.fygShop;
        
        elInfoId.innerHTML = gUsrJson.ID;
        elInfoRank.innerHTML = gMsgPanelName.fygRank + "：" + gUsrJson.Rank;
        elInfoLevel.innerHTML = gMsgPanelName.fygLevel + "：" + gUsrJson.Level;
        elInfoSVip.innerHTML = gUsrJson.SVip;
        elInfoBvip.innerHTML = gUsrJson.BVip;

        elCoin1.innerHTML = "";
        elCoin2.innerHTML = "";
        elCoin3.innerHTML = "";
        elCoin1.append(gMsgPanelName.fygCoin1, "：", elCoin1N);
        elCoin2.append(gMsgPanelName.fygCoin2, "：", elCoin2N);
        elCoin3.append(gMsgPanelName.fygCoin3, "：", elCoin3N);
        elCoin1N.innerHTML = gUsrJson.Coin1;
        elCoin2N.innerHTML = gUsrJson.Coin2;
        elCoin3N.innerHTML = gUsrJson.Coin3;
    };

    elFoot.onload = () => {
        elFootLogout.innerHTML = gMsgPanelName.fygLogout;
        elFootChange.innerHTML = gMsgPanelName.fygIndex;
        elFootByebye.innerHTML = gMsgPanelName.fygByebye;
    };

    elInfo.onclick = () => {
        elDemoStyle.innerHTML = elDemoStyle.innerHTML ? "" : gDemoCss;
    };

    const 

    uiSetPage = (page) => {

        const e = elPage[page];
        if (elPage._c) { elPage._c.remove("btn-primary"); }
        if (e) { elPage._c = e.classList; e.classList.add("btn-primary"); }

        elPageStyle.innerHTML = (gLytCss[page] || gLytCss[""]) + gPageCss;
    },

    uiSetLang = (lang) => {

        const e = elLang[lang], meta = document.getElementsByTagName("meta");
        if (elLang._c) { elLang._c.remove("btn-primary"); }
        if (e) { elLang._c = e.classList; e.classList.add("btn-primary"); }

        gMsgJson = gMsgJsons[lang] || gMsgZzJson;
        gMsgMetaData = gMsgJson.MetaData,
        gMsgPanelName = gMsgJson.PanelName;
        gMsgPanelDesc = gMsgJson.PanelDesc;
        gMsgAttrName = gMsgJson.AttrName;
        gMsgAttrInfo = gMsgJson.AttrInfo;
        gMsgActUIInfo = gMsgJson.ActUIInfo;
        gMsgActorName = gMsgJson.ActorName;
        gMsgArt1Name = gMsgJson.Art1Name;
        gMsgArt2Name = gMsgJson.Art2Name;
        gMsgArt3Name = gMsgJson.Art3Name;
        gMsgStatusName = gMsgJson.StatusName;
        gMsgEquipName = gMsgJson.EquipName;
        gMsgEquipDesc = gMsgJson.EquipDesc;
        gMsgEquipMyst = gMsgJson.EquipMyst;
        gMsgEquipAttrName = gMsgJson.EquipAttrName;
        gMsgEquipRankName = gMsgJson.EquipRankName;
        gMsgAuraName = gMsgJson.AuraName;
        gMsgAuraDesc = gMsgJson.AuraDesc;

        document.title = gMsgMetaData.Title;
        meta.keywords.content = gMsgMetaData.Keywords;
        meta.description.content = gMsgMetaData.Description;

        for (const e of elRoot.children) { (e.onload || gOnLoad)(); }
    };

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Initialization *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------

    uiSetLang(gUsrJson.Locale);
    uiSetPage(gUsrJson.Page);

})();

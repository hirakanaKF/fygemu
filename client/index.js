/*
Project: fygemu
Authors: hirakana@kf
*/

(() => {

    let mRank = 0, mProc;

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Conponents *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------

    const 

    // Dummy onload callback
    gOnLoad = () => {},
    
    mGems = {},

    // css
    gPageCss = " { display: block; }",
    gDemoCss = ".css-debug { display: none; }",

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
    elInfoBVip = document.createElement("span"),
    elLang = document.createElement("div"),
    elLangBtn = document.createElement("button"),
    elLangList = document.createElement("ul"),
    elStyle = document.createElement("div"),
    elStyleBtn = document.createElement("button"),
    elStyleList = document.createElement("ul"),
    elPage = document.createElement("div"),
    elPage1 = document.createElement("div"),
    elPage2 = document.createElement("div"),
    elWallet = document.createElement("div"),
    elCoin1 = document.createElement("h5"),
    elCoin2 = document.createElement("h5"),
    elCoin3 = document.createElement("h5"),
    elCoin1Num = document.createElement("span"),
    elCoin2Num = document.createElement("span"),
    elCoin3Num = document.createElement("span"),

    // Footer
    elFoot = document.createElement("div"),
    elFootService = document.createElement("a"),
    elFootLogout = document.createElement("a"),
    elFootChange = document.createElement("a"),
    elFootStats = document.createElement("a"),
    elFootByebye = document.createElement("a"),

    // Modal
    elModal = document.createElement("div"),
    elBack = document.createElement("div"),

    // Vip
    uiVipProc = () => {
        let x = !1;
        const 
            t = new Date().getTime(),
            mSVip = (gUser.svip || 0) - t,
            mBVip = (gUser.bvip || 0) - t
        ;
        elInfoSVip.style.display = "none";
        elInfoBVip.style.display = "none";
        if (mSVip > 0) {
            elInfoSVip.innerHTML = gMsgPanelPrefix.SVip+Math.ceil(mSVip * 1.1574074074074074e-8)+gMsgPanelSuffix.SVip;
            elInfoSVip.style.display = "";  x = !0;
        }
        if (mBVip > 0) {
            elInfoBVip.innerHTML = gMsgPanelPrefix.BVip+Math.ceil(mBVip * 1.1574074074074074e-8)+gMsgPanelSuffix.BVip;
            elInfoBVip.style.display = "";  x = !0;
        }

        // Lazy refresh
        if (x) { mProc = setTimeout(mProc, Math.min(mSVip, mBVip)); }
    },

    // Reset
    uiReset = () => {
        if (mProc) { clearTimeout(mProc); mProc = null; }
        elInfoId.innerHTML = USR.ID;
        elInfoRank.lastChild.textContent = mRank = USR.Rank;
        elInfoLevel.lastChild.textContent = USR.Level;
        elInfoSVip.innerHTML = USR.SVip; elInfoSVip.style.display = USR.SVip ? "" : "none";
        elInfoBVip.innerHTML = USR.BVip; elInfoBVip.style.display = USR.BVip ? "" : "none";
        elCoin1Num.innerHTML = USR.Coin1;
        elCoin2Num.innerHTML = USR.Coin2;
        elCoin3Num.innerHTML = USR.Coin3;
    },

    // Set page
    uiPageSet = (page) => {

        const e = elPage[page];
        if (elPage._c) { elPage._c.remove("btn-primary"); }
        if (e) { elPage._c = e.classList; e.classList.add("btn-primary"); }

        elPageStyle.innerHTML = (LYT_CSS[page] || LYT_CSS[""]) + gPageCss;
    },

    // Set language
    uiLangSet = (lang) => {

        const meta = document.getElementsByTagName("meta");
        elLangBtn.innerHTML = elLang[lang].innerHTML;

        gSetLang(lang);

        document.title = gMsgMetaData.Title;
        meta.keywords.content = gMsgMetaData.Keywords;
        meta.description.content = gMsgMetaData.Description;

        for (const e of eSvcRoot.children) { (e.onload || gOnLoad)(); }
    }

    ;

    // The root element
    eSvcRoot.style = `width:96%;${USR.ScreenWidth > 0 ? ` max-width:${USR.ScreenWidth}px;` : "" } margin: 0 auto;`;

    // I/O
    elIoBar.style = "display: none;";
    elIoBar.append(eIoReader, eIoWriter);
    eIoReader.type = "file";
    
    // Header
    elHead.classList = "fyg_head row";
    elHead.append(elHead1);
    elHead1.classList = "panel";
    elHead1.append(elHead2);
    elHead2.classList = "panel-body";
    elHead2.append(elHead3);
    elHead3.classList = "row";
    elHead3.append(elTool, elLang, elStyle, elWallet);

    // Tool
    elTool.classList = "col-md-10";
    elTool.append(elInfo, document.createElement("hr"), elPage);
    
    // Meta
    elInfo.style = "letter-spacing: 2px;";
    elInfo.append(elInfoId, " ", elInfoRank, " ", elInfoLevel, " ", elInfoSVip, " ", elInfoBVip);
    elInfoId.classList = "fyg_colpz06 fyg_f24";
    elInfoRank.classList = "label label-primary";
    elInfoRank.append("", "：", "");
    elInfoLevel.classList = "label label-primary";
    elInfoLevel.append("", "：", "");
    elInfoSVip.classList = "label label-danger";
    elInfoBVip.classList = "label label-warning";

    // Lang
    elLang.classList = "btn-group col-md-1";
    elLang.append(elLangBtn, elLangList);

    elLangBtn.classList = "btn btn-lg col-xs-12 dropdown-toggle";
    elLangList.classList = "dropdown-menu";
    Object.entries(MSG).forEach((A) => {
        const [k, v] = A, l = document.createElement("li"), e = document.createElement("a");

        elLangList.append(l);
        l.append(e);

        e.innerHTML = v.Name;
        e.onmousedown = uiLangSet.bind(null, k);
        elLang[k] = e;
    });

    // Style
    elStyle.classList = "btn-group col-md-1";
    elStyle.append(elStyleBtn, elStyleList);

    elStyleBtn.classList = "btn btn-lg col-xs-12 dropdown-toggle";
    elStyleList.classList = "dropdown-menu";
    {
        const 
            elIcon = document.createElement("i"),
            cssSun = document.getElementById("sun"), iconSun = document.createElement("i"),
            cssMoon = document.getElementById("moon"), iconMoon = document.createElement("i")
        ;
        elIcon.classList = "icon icon-sun";
        iconSun.classList = "icon icon-sun";
        iconMoon.classList = "icon icon-moon";

        elStyleBtn.append(elIcon);
        [[cssMoon, cssSun, iconSun], [cssSun, cssMoon, iconMoon]].forEach((A) => {
            const [css0, css1, icon] = A, l = document.createElement("li"), e = document.createElement("a");
    
            elStyleList.append(l);
            l.append(e);
    
            e.append(icon);
            e.onmousedown = () => {
                css1.disabled = !(css0.disabled = !0);
                elIcon.classList = icon.classList;
            };
        });
        
        cssMoon.disabled = !0;
    }
    

    // Page
    elPage.classList = "col-xs-12 col-md-6";
    elPage.append(elPage1, " ", elPage2);
    elPage1.classList = "btn-group";
    ["pk"].forEach((k) => {
        const e = document.createElement("button");
        
        e.type = "button";
        e.classList = "btn btn-lg";
        e.onclick = uiPageSet.bind(null, k);
        elPage[k] = e;
        elPage1.append(e);
    });
    elPage2.classList = "btn-group";
    ["equip", "wish", "gift", "shop"].forEach((k) => {
        const e = document.createElement("button");
        
        e.type = "button";
        e.classList = "btn btn-lg";
        e.onclick = () => { uiPageSet(k); };
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
    elCoin1.append("", "：", elCoin1Num);
    elCoin2.append("", "：", elCoin2Num);
    elCoin3.append("", "：", elCoin3Num);
    elCoin1Num.classList = "fyg_f14 fyg_fr";
    elCoin2Num.classList = "fyg_f14 fyg_fr";
    elCoin3Num.classList = "fyg_f14 fyg_fr";

    // Footer
    elFoot.classList = "fyg_foot row fyg_lh60 fyg_tc";
    elFoot.append(elFootService, " ", elFootLogout, " ", elFootChange, " ", elFootStats,  " ", elFootByebye);
    elFootService.classList = "css-debug label label-warning label-outline";
    elFootService.onclick = () => uiPageSet("gm");
    elFootLogout.classList = "label label-primary label-outline";
    elFootLogout.onclick = () => Server[$SoIdOut]();
    elFootChange.classList = "label label-outline";
    elFootChange.onclick = () => uiPageSet("index");
    elFootStats.classList = "css-debug label label-success label-outline";
    elFootStats.onclick = () => uiPageSet("stat");
    elFootByebye.classList = "label label-outline";
    elFootByebye.onclick = () => uiPageSet("byebye");

    // Modal
    elModal.classList = "modal fade load-indicator";
    elBack.classList = "modal-backdrop fade";
    elBack.style = "display: none;";
    
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Renderers *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------

    elHead.onload = () => {
        elPage.pk.innerHTML = gMsgPanelName.fygPk;
        elPage.equip.innerHTML = gMsgPanelName.fygEquip;
        elPage.wish.innerHTML = gMsgPanelName.fygWish;
        // elPage.beach.innerHTML = gMsgPanelName.fygBeach;
        elPage.gift.innerHTML = gMsgPanelName.fygGift;
        elPage.shop.innerHTML = gMsgPanelName.fygShop;
        
        elInfoRank.firstChild.textContent = gMsgPanelName.fygRank; 
        elInfoLevel.firstChild.textContent = gMsgPanelName.fygLevel;
        elCoin1.firstChild.textContent = gMsgPanelName.fygCoin1;
        elCoin2.firstChild.textContent = gMsgPanelName.fygCoin2;
        elCoin3.firstChild.textContent = gMsgPanelName.fygCoin3;

        elInfoRank.lastChild.textContent = gMsgRankName[mRank] ?? mRank;
    };

    elInfo.onclick = () => {
        elDemoStyle.innerHTML = elDemoStyle.innerHTML ? "" : gDemoCss;
    };

    elFoot.onload = () => {
        elFootService.innerHTML = gMsgPanelName.fygSvc;
        elFootLogout.innerHTML = gMsgPanelName.fygLogout;
        elFootChange.innerHTML = gMsgPanelName.fygIndex;
        elFootStats.innerHTML = gMsgPanelName.fygStats;
        elFootByebye.innerHTML = gMsgPanelName.fygByebye;
    };
    
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Initialization *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    document.body.append(elPageStyle, elDemoStyle, elIoBar, eSvcRoot, elModal, elBack);

    eSvcRoot.firstChild ? eSvcRoot.insertBefore(elHead, eSvcRoot.firstChild) : eSvcRoot.append(elHead);
    eSvcRoot.append(elFoot);

    uiReset();

    // https://stackoverflow.com/questions/5580876/navigator-language-list-of-all-languages
    uiLangSet(USR.Locale ? USR.Locale[navigator.language] ?? USR.Locale ?? "zz" : "zz");
    uiPageSet(USR.Page ?? "gm");

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Exports *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    Client[$CoError] = svcError;
    Client[$CoSysReset] = () => {
        for (const k in gUser) { delete gUser[k]; }
        uiReset();
        Client[$CoPkReset]();
        Client[$CoEquipReset]();
        Client[$CoWishReset]();
        Client[$CoGiftReset]();
        Client[$CoShopReset]();
    };
    Client[$CoSysLang] = uiLangSet;
    Client[$CoSysPage] = uiPageSet;
    Client[$CoSysPay] = (d, m) => {
        for (const k in d) {
            if (gUser[k] >= d[k] * m) { continue; }
            return 0;
        }
        return 1;
    };
    Client[$CoSysUsr] = u => {
        Object.assign(gUser, u);
        elInfoId.innerHTML = gUser.name;
        elInfoLevel.lastChild.textContent = uiNumCast(gUser.grade);
        elCoin1Num.innerHTML = uiNumCast(gUser.coin1);
        elCoin2Num.innerHTML = uiNumCast(gUser.coin2);
        elCoin3Num.innerHTML = uiNumCast(gUser.coin3);
        Client[$CoEquipUsr]();
        Client[$CoShopUsr]();
        uiVipProc();
    };
    Client[$CoSysGem] = d => {
        Object.assign(mGems, d);
        Client[$CoEquipGem](d);
    };
    Client[$CoSysRank] = r => {
        mRank = r;
        elInfoRank.lastChild.textContent = gMsgRankName[r] ?? r;
    };

})();

/*
Project: fygemu
Authors: hirakana@kf
*/

(() => {

    let mRank = 0, mDayProc, mVipProc, mModalProc, mModalFade, mModalHint = [];

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Conponents *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------

    const 

    // Dummy onload callback
    gOnLoad = () => {},
    
    mGems = {}, mBrs = [""],

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
    elWallet = uiItemH5s(LYT_FYG.Wallet, "："),
    elDepot = uiItems(LYT_FYG.Depot),
    elBill = uiItemH5s(LYT_FYG.Bill, " x "),

    // Footer
    elFoot = document.createElement("div"),
    elFootService = document.createElement("a"),
    elFootLogout = document.createElement("a"),
    elFootChange = document.createElement("a"),
    elFootStats = document.createElement("a"),
    elFootByebye = document.createElement("a"),

    // Modal
    elModal = document.createElement("div"),
    elModalOuter = document.createElement("div"),
    elModalInner = document.createElement("div"),
    elModalBody = document.createElement("div"),
    elModalFoot = document.createElement("div"),
    elModalOkay = document.createElement("button"),
    elModalExit = document.createElement("button"),
    elModalExitIcon = document.createElement("i"),
    elBack = document.createElement("div"),

    // Set wallet
    uiItemSet = (p, f) => {
        for (const k in p) {
            const v = uiNumCast(p[k]), e1 = elWallet[k], e2 = elDepot[k];
            if (e1) { e1.num(v, !0); } // Stuffs in wallet should always been shown
            if (e2) { e2.num(v, f); }
        }
    },

    // Daily clock
    uiDayProc = () => {
        const t = new Date().getTime() - gUser.daily;
        if (t <= 0) { return Server[$SoIdDaily](); }
        if (mDayProc) { clearTimeout(mDayProc); }
        mDayProc = setTimeout(uiDayProc, t);
    },

    // Vip clock
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
            elInfoSVip.innerHTML = gMsgData[$MsgPreSVip]+Math.ceil(mSVip * 1.1574074074074074e-8)+gMsgData[$MsgSufSVip];
            elInfoSVip.style.display = "";  x = !0;
        }
        if (mBVip > 0) {
            elInfoBVip.innerHTML = gMsgData[$MsgPreBVip]+Math.ceil(mBVip * 1.1574074074074074e-8)+gMsgData[$MsgSufBVip];
            elInfoBVip.style.display = "";  x = !0;
        }

        // Lazy refresh
        if (x) {
            if (mVipProc) { clearTimeout(mVipProc); }
            mVipProc = setTimeout(uiVipProc, Math.min(mSVip, mBVip));
        }
    },

    // Remove the modal immediately
    uiModalRemove = () => {
        elModal.style.display = "none";
        elBack.style.display = "none";
        mModalFade = null;
    },

    // Resolve modal promise
    uiModalResolve = r => {
        if (mModalProc) { mModalProc(r); mModalProc = null; }
    },

    // Start modal promise
    uiModalPromise = t => new Promise((resolve, reject) => {
        mModalProc = resolve;
        if (t > 0) { setTimeout(uiModalExit.bind(null, 0), t); }
    }),

    // Fade in modal
    uiModalFadeIn = () => {
        elModal.classList.add("in"); elModal.style.display = "";
        elBack.classList.add("in"); elBack.style.display = "block";
        if (mModalFade) { clearTimeout(mModalFade); mModalFade = null; }
    },

    // Fade out modal
    uiModalFadeOut = () => {
        elModal.classList.remove("in");
        elBack.classList.remove("in");
        mModalFade = setTimeout(uiModalRemove, 500);
    },

    // Render modal content
    uiModalRender = a => {
        elModalBody.innerHTML = "";
        let l = a.length;
        for (const k of a) {
            elModalBody.append(gMsgData[k] ?? k);
            elModalBody.append(mBrs[--l] ??= document.createElement("br"));
        }
    },

    // Exit modal normally
    uiModalExit = r => { uiModalResolve(r); uiModalFadeOut(); },

    // Reset
    uiReset = () => {
        if (mDayProc) { clearTimeout(mDayProc); mDayProc = null; }
        if (mVipProc) { clearTimeout(mVipProc); mVipProc = null; }
        uiModalResolve(); uiModalRemove();
        elInfoId.innerHTML = USR.ID;
        elInfoRank.lastChild.textContent = mRank = USR.Rank;
        elInfoLevel.lastChild.textContent = USR.Level;
        elInfoSVip.innerHTML = USR.SVip; elInfoSVip.style.display = USR.SVip ? "" : "none";
        elInfoBVip.innerHTML = USR.BVip; elInfoBVip.style.display = USR.BVip ? "" : "none";
        uiItemSet(USR.Item, !0);
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

        document.title = gMsgData[$MsgMetaTitle];
        meta.keywords.content = gMsgData[$MsgMetaKeywords];
        meta.description.content = gMsgData[$MsgMetaDescription];

        uiModalRender(mModalHint);
        elModalOkay.innerHTML = gMsgData[$MsgNameConfirm];
        for (const e of eSvcRoot.children) { (e.onload ?? gOnLoad)(); }
        for (const e of elBill.children) { e.onload(); }
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
            [cssSun, cssMoon] = document.getElementsByName("_"), 
            iconSun = document.createElement("i"), iconMoon = document.createElement("i")
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
    elWallet.classList = "col-md-2"; elWallet.style.letterSpacing = "1px";
    elWallet.onclick = () => { Client[$CoSysModal](elDepot); };

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
    elModal.classList = "fyg_modal fade load-indicator"; elModal.style.display = "none"; elModal.append(elModalOuter);    
    elModalOuter.classList = "modal-dialog"; elModalOuter.append(elModalInner);
    elModalInner.classList = "modal-content"; elModalInner.append(elModalExit, elModalBody, elModalFoot);
    elModalBody.classList = "modal-body";
    elModalFoot.classList = "modal-footer"; elModalFoot.append(elModalOkay);
    elModalOkay.classList = "btn btn-block btn-success"; elModalOkay.type = "button";
    elModalExit.classList = "btn btn-link fyg_exit"; elModalExit.append(elModalExitIcon);
    elModalExitIcon.classList = "icon icon-times";
    elBack.classList = "modal-backdrop fade"; elBack.style.display = "none";

    elBack.onclick = e => e.target == elBack && uiModalExit(0);
    elModalOkay.onclick = uiModalExit.bind(null, 1);
    elModalExit.onclick = uiModalExit.bind(null, 0);
    
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Renderers *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------

    elHead.onload = () => {
        elPage.pk.innerHTML = gMsgData[$MsgFygPk];
        elPage.equip.innerHTML = gMsgData[$MsgFygEquip];
        elPage.wish.innerHTML = gMsgData[$MsgFygWish];
        elPage.gift.innerHTML = gMsgData[$MsgFygGift];
        elPage.shop.innerHTML = gMsgData[$MsgFygShop];
        
        elInfoRank.firstChild.textContent = gMsgData[$MsgFygRank];
        elInfoLevel.firstChild.textContent = gMsgData[$MsgFygLevel];
        elInfoRank.lastChild.textContent = gMsgRankName[mRank] ?? mRank;
        for (const el of elWallet.children) { (el.onload ?? nullSync)(); }
        for (const el of elDepot.children) { (el.onload ?? nullSync)(); }
    };

    elInfo.onclick = () => {
        elDemoStyle.innerHTML = elDemoStyle.innerHTML ? "" : gDemoCss;
    };

    elFoot.onload = () => {
        elFootService.innerHTML = gMsgData[$MsgFygSvc];
        elFootLogout.innerHTML = gMsgData[$MsgFygLogout];
        elFootChange.innerHTML = gMsgData[$MsgFygIndex];
        elFootStats.innerHTML = gMsgData[$MsgFygStats];
        elFootByebye.innerHTML = gMsgData[$MsgFygByebye];
    };
    
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Initialization *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    document.body.append(elPageStyle, elDemoStyle, elIoBar, eSvcRoot, eSvcBack, elModal, elBack);

    eSvcRoot.firstChild ? eSvcRoot.insertBefore(elHead, eSvcRoot.firstChild) : eSvcRoot.append(elHead);
    eSvcRoot.append(elFoot);

    uiReset();

    // https://stackoverflow.com/questions/5580876/navigator-language-list-of-all-languages
    uiLangSet(USR.Locale ? USR.Locale[navigator.language] ?? USR.Locale ?? "zz" : "zz");
    uiPageSet(USR.Page ?? "gm");


    // Server
    Server.__proto__ = USR.Online && Server[$SvcRemote] || Server[$SvcLocal] || Server[$SvcRemote];

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Exports *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    Client[$CoError] = nullSync;
    Client[$CoDataVer] = n => Server[$SoDataLdr](n);
    Client[$CoSysModal] = (...m) => {
        // In case modal is disabled
        if (USR.SkipHints) { return Promise.resolve(1); }

        // In case we are in demo mode, always return false.
        if (!Server._) { return Promise.resolve(0); }

        uiModalResolve(0);
        uiModalRender(mModalHint = m);
        uiModalFadeIn();
        return uiModalPromise(0);
    };
    Client[$CoSysReset] = () => {
        for (const k in gUser) { delete gUser[k]; }
        uiReset();
        Client[$CoIndexReset]();
        Client[$CoPkReset]();
        Client[$CoEquipReset]();
        Client[$CoWishReset]();
        Client[$CoGiftReset]();
        Client[$CoShopReset]();
    };
    Client[$CoSysLang] = uiLangSet;
    Client[$CoSysPage] = uiPageSet;
    Client[$CoSysPay] = (d, m) => {
        let r = 0;

        // Reset display
        for (const el of elBill.children) { el.num(0); }

        // Setup cost and check
        for (const k in d) {
            const n = d[k] * m, t = gUser[k], el = elBill[k];
            if (el) { el.num(uiNumber(t) - uiNumber(t - n)); }
            if (t < n) { r = 1; }
        }

        // If item does not enough, show error message
        if (r) {
            return Client[$CoSysModal]($MsgHintItBuy, elBill)
                .then(d => {
                    if (d) { uiPageSet("shop"); }
                    return 0;
                })
            ;
        }

        // Otherwise pop-up a confirm window.
        return Client[$CoSysModal]($MsgHintItUse, elBill);
    };
    Client[$CoSysGot] = (d, m, i) => {
        // Reset display
        for (const el of elBill.children) { el.num(0); }

        // Setup gain
        for (const k in d) {
            const n = d[k] * m, el = elBill[k];
            if (el) { el.num(n); }
        }

        // Show up the popup
        return Client[$CoSysModal](i, elBill);
    };
    Client[$CoSysUsr] = (u, m) => {
        if (gMsgData[m]) {
            let r = 0;
            const P = {};
            for (const k in u) {
                const n = uiNumber(u[k]) - uiNumber(gUser[k] ?? 0);
                if (n > 0) { P[k] = n; r++; }
            }
            if (r) { Client[$CoSysGot](P, 1, m); }
        }
        Object.assign(gUser, u);
        elInfoId.innerHTML = gUser.name;
        elInfoLevel.lastChild.textContent = uiNumCast(gUser.grade);
        uiItemSet(gUser, 0);
        Client[$CoIndexUsr]();
        Client[$CoEquipUsr]();
        Client[$CoShopUsr]();
        uiDayProc();
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

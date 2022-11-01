/*
Project: fygemu
Authors: hirakana@kf
*/

(() => {

    let 
        elFocus, mBackup = {}, mCommit = {}, mAvatar, mFight = [], mAmul = {}, mFlair = 0, mSkill = 0, mAmass, mMyst = "", // Focus
        mGrade, BST = {}, PST = [], EST = {}, LE = {}, // Status and limits
        mAcExp = {}, mAcElt = {}, // Actor
        mEcFrgCost = {}, mEcFrgMul = 0, mEcFrgCap = 0, // Equip
        mFcFrgCost = {}, mFcFrgMul = {}, mFcFrgCap = 0, // Fruit
        mAuraCost = {}
    ;

    const 

        // Css
        gEditCls = "btn-warning",

        // State
        mAuras = new Set(),
        elCrf = Array(8).fill().map(uiShopItem),
        elSpw = Array(8).fill().map(uiShopItem),
        elAms = Array(8).fill().map(uiShopItem),

        // Components
        elBody = document.createElement("div"),

        elLeft = document.createElement("div"),
        elRight = document.createElement("div"),

        // Status
        elStatus = uiPanel3({panel: {tag: "div", classList: "panel panel-primary"}, head: {tag: "div", classList: "panel-heading css-debug"}, body: [{tag: "div", classList: "panel-body load-indicator"}]}),
        elStatusHead = document.createElement("div"),
        elStatusEdit = document.createElement("button"),
        elStatusEditIcon = document.createElement("i"),
        elStatusInfo = document.createElement("div"),
        elStatusName = document.createElement("span"),
        elStatusLevel = document.createElement("span"),
        elStatusLevelText = document.createTextNode(""),
        elStatusImg = document.createElement("img"),
        elStatusArts = uiArt3(),
        elStatusAttrs = document.createElement("div"),
        pStatusRef = {},

        elEditorImg = document.createElement("img"),

        // Editor
        elEditor = uiPanel3({
            panel: {tag: "div", classList: "panel panel-primary"}, head: {tag: "div", classList: "panel-heading css-debug"},
            body: [{tag: "ul", classList: "nav nav-secondary nav-justified"}, {tag: "div", classList: "panel-body"}]
        }),

        elAuraDraw = uiItemH5i(Array(256).fill("aura"), ""),

        // Front
        elWears = uiFront(6, uiWear),
        elFight = uiFront(6, uiActor),
        elCarry = uiFront(20, uiFruit),

        // Back
        elItem = uiItems(LYT_EQUIP.Items),
        elActor = uiBack(512, uiActor),
        elEquip = uiBack(512, uiEquip),
        elFruit = uiBack(512, uiFruit),
        elActor_ = uiBack(512, uiActor),
        elEquip_ = uiBack(512, uiEquip),
        elFruit_ = uiBack(512, uiFruit),

        // Dummy
        elDummy = uiActor(),

        // Manual
        elManual = uiPanel4({root: {tag: "div", classList: "fyg_equip row"}, panel: {tag: "div", classList: "panel panel-info"}}),

        pOp = {},

        // Set editor focus
        uiAvatar = K => {
            mAvatar = K = K ?? 0;
            elStatusName.innerHTML = gMsgActorName[K] ?? K;
            elStatusImg.src = gUsrPath(RES_CH, K, "N");
            elEditorImg.src = gUsrPath(RES_CH, K, "C"); 
            pEdit.msgs.name.innerHTML = gMsgActorName[K] ?? "";
        },
        
        // Stats
        uiStatsClr = () => {
            elStatusLevelText.textContent = "";
            for (const k in pStatusRef) { pStatusRef[k].textContent = ""; }
        }
        
        uiStatsSet = d => {
            elStatusLevelText.textContent = uiNumCast(d.L) ?? "";
            for (const k in d) {
                const el = pStatusRef[k];
                if (el) { el.textContent = uiNumFix2(d[k]); }
            }
        },

        // Item
        uiItemClr = () => {
            for (const el of elItem.children) { el.num(0); }
        }

        uiItemSet = d => {
            for (const k in d) {
                const el = elItem[k];
                if (el) { el.num(uiNumCast(d[k])); }
            }
        },

        uiCardQuery = (E) => {
            const A = [], M = E.M;
            M.forEach((e, i) => { if (e.checked) { A.push(i); } });
            return A;
        },
        
        uiCardSort = (E) => E.append(...[...E.children].sort(E.F)),

        // 
        uiFrontClr = (E) => {
            for (const el of E.M) { el.clr(); }
        },

        uiFrontSet = (E, d) => {
            const M = E.M;
            for (const i in d) {
                const e = d[i], el = M[i];
                if (!el) { continue; }
                if (!e) { el.clr(); continue; }
                el.open(!0); el.set(e);
            }
        },

        uiFrontSlotSet = (E, n) => {
            let i = E.N;
            const M = E.M;
            while (i < n) { M[i++].show(!0); }
            while (i > n) { M[--i].show(!1); }
            E.N = n;
        },
        
        uiBackAlloc = (E, l) => {
            const A = [], N = E.N;
            for (const k of E.L) {
                if (k < N) {
                    A.push(k);
                    if (--l <= 0) { break; }
                }
            }
            return A;
        },

        // 
        uiBackDel = (E, a) => {
            const {L, M} = E;
            for (const k of a) {
                const i = +k, el = M[i];
                if (!el || L.has(i)) { continue; }
                L.add(i); el.clr(el); E.removeChild(el);
            }
        },

        uiBackClr = (E) => {
            const {M, L} = E;
            E.innerHTML = ""; M.forEach((el, i) => { el.clr(); L.add(i); el.show(!0); });
        },

        uiBackSet = (E, d) => {
            const {L, M} = E;
            for (const k in d) {
                const i = +k, e = d[i], el = M[i];
                if (!el) { continue; }
                if (!e) { 
                    if (!L.has(i)) { E.removeChild(el); el.clr(); L.add(i); }
                    continue; 
                }

                E.append(el); el.open(!0); L.delete(i);
                el.set(e);
            }
            uiCardSort(E);
        },

        uiBackShow = (E, a, b) => {
            for (const i of a) { E.M[i].show(b); }
        },

        uiBackSlotSet = (E, n) => {
            E.N = n > 0 ? n : 0; 
        },

        uiCardMirror = (DE, SE, A) => {
            const M = SE.M;
            uiBackClr(DE);
            uiBackSet(DE, Object.fromEntries(
                A.map((i, n) => [n, M[i]])
            ));
        },

        uiActorSize = (...a) => {
            pOp.acSize.lastChild.innerHTML = a.map(uiNumCast).join("");
        },

        uiEquipSize = (...a) => {
            pOp.ecSize.lastChild.innerHTML = a.map(uiNumCast).join("");
        },

        uiFruitSize = (...a) => {
            pOp.fcSize.lastChild.innerHTML = a.map(uiNumCast).join("");
        },

        uiAmulSet = d => {
            const elAmulet = pEquip.lastChild;
            for (const k in d) { elAmulet[k].attr.num.textContent = uiNumCast(d[k]); }
        },

        uiAmulMax = m => {
            const elAmulet = pEquip.lastChild;
            for (const k in m) { elAmulet[k].attr.max.textContent = uiNumCast(m[k]); }
        },

        uiAuraNumSet = d => {
            mSkill = d; pAura.attr.skill.textContent = d;  
        },
        
        uiAuraPointSet = d => {
            const q = uiNumber((+d || 0) * 100), p = uiNumFix2(q * 0.01), m = mAcElt.Cap ?? 0;
            pAura.attr.h1Point.innerHTML = p+"%／"+m+"%";
            pAura.attr.point.textContent = p+"%";
            pAura.attr.prog.set(q / m || 0);
            mFlair = d;
        },
        
        uiAuraSet = d => {
            mAuras.clear();
            for (const kind of d) { mAuras.add(kind); }
            for (const kinds of LYT_EQUIP.Auras) {
                for (const kind of kinds) {
                    const data = pAura[kind];
                    if (!data) { continue; }

                    const cl = data.panel.classList;
                    mAuras.has(+kind) ? cl.add("btn-primary") : cl.remove("btn-primary");
                }
            }
        },

        uiAuraCostSet = d => {
            for (const kinds of LYT_EQUIP.Auras) {
                for (const kind of kinds) {
                    const n = d[kind] || 0;
                    pAura[kind].cost.textContent = ""+n;
                    mAuraCost[kind] = n;
                }
            }
        }

        uiGemSet = d => {
            const p = pGem.nC;
            for (const kind of LYT_EQUIP.Gems) {
                const el = p[kind];
                if (!el) { continue; }
                if (kind in d) { el.innerHTML = uiNumCast(d[kind]); }
            }
        },
        
        uiGemSetText = d => {
            const p = pGem.nC;
            for (const kind of LYT_EQUIP.Gems) {
                const el = p[kind];
                if (!el) { continue; }
                if (kind in d) { el.innerHTML = d[kind]; }
            }
        },

        uiCommitStat = (k, n) => {
            
            const 
                A = LYT_FYG.Stat,
                i = elFocus.i,
                p = elFocus.p,
                m = uiNumber(
                    Math.min(n, p - A.reduce((n, k) => n + elFocus[k] ?? 0, 0) + elFocus[k])
                ),
                c = mBackup[i] ??= {},
                d = (mCommit[i] ??= {}).stat ??= Array(A.length).fill(0)
            ;

            for (const i in A) {
                const l = A[i];
                if (!(l in c)) { c[k] = elFocus[l]; }
                d[l] = elFocus[l];
                if (l == k) { d[l] = elFocus[l] = m; }
            }
            uiFocusEval();

            return m;
        },

        uiFocusEval = () => {
            if (!elFocus) { return; }

            const {K, L, Q, S, B, F, G, Z, p, auras, equip, fruit} = elFocus, EM = elEquip.M, FM = elFruit.M;

            mMyst = Z[$ActorMystIndex] ?? 0;
            {

                // 
                // Editor update
                // 

                const pe = pEdit.attr;

                pe.level.innerHTML = uiNumCast(L);
                {
                    const l = +uiNumCast(L), p = L * L - l * l, q = l + l + 1;
                    pe.exp.textContent = `${p} / ${q}`; pe.bar.set(p * 100 / q || 0);
                }
                pe.value.innerHTML = uiNumFix1(Q);
                pe.skill.innerHTML = uiNumCast(S);
                pe.build.innerHTML = uiNumCast(B);
                pe.growth.innerHTML = uiNumCast(G);
                pe.myst.style.display = mMyst && "none";
                pEdit.msgs.myst.innerHTML = $EquSkillDesc(mMyst);
                pe.max.innerHTML = uiNumCast(p);
                {
                    const 
                        n = LYT_FYG.Stat.reduce((n, k) => n + elFocus[k] ?? 0, 0), r = p ? 100 / p : 0;
                    ;
                    pe.used.innerHTML = uiNumCast(n);
                    pe.free.innerHTML = uiNumCast(p - n);
                    for (const k of LYT_FYG.Stat) {
                        const p = elFocus[k], [elNum, elProg] = pe[k];
                        elNum.value = p; elNum.n = p; elProg.set(p * r);
                    }
                }    

                //
                // Evaluate Amulet
                //
                mAmul = {};
                fruit.forEach(i => {
                    const e = FM[i];
                    if (!e) { return; }

                    e.S.forEach(T => {
                        const [k, r] = T;
                        mAmul[k] = (mAmul[k] ?? 0) + r;
                    });
                });
                for (const k of LYT_EQUIP.Amulets) {
                    pEquip.lastChild[k].attr.num.textContent = uiNumFix1(mAmul[k] ?? 0);
                }
                
                elStatusArts.set(...Z);
                pEdit.msgs.arts.set(...Z);

                //
                // Evaluate status
                //

                // Actor
                const 
                    X = {L: L},
                    C = {L: $EquUnitPoint(mGrade), "": -1}, 
                    P1 = {}, P2 = {},
                    ESM = EST.Mul ?? {}, ESA = EST.Add ?? {}
                ;
                
                for (const k of LYT_FYG.Stat) {
                    C[k] = $EquUnitPoint(elFocus[k] + (mAmul[k] ?? 0));
                }
                for (const k in pStatusRef) { X[k] = 0; }

                PST.forEach(R => {
                    const cc = R.cc;
                    for (const r of cc) {
                        let c = 0;
                        for (const k in r) { c += C[k] * r[k]; }
                        if (c < 0) { return; }
                    }
                    const p0 = R.p0, p1 = R.p1, p2 = R.p2;
                    for (const k in p0) { X[k] = (X[k] ?? 0) + p0[k]; }
                    for (const k in p1) {
                        const A = p1[k], M = (P1[k] ??= {});
                        for (const l in A) { M[l] = (M[l] ?? 0) + A[l];} 
                        P1[k] = M;
                    }
                    for (const k in p2) {
                        const A = p2[k], M = (P2[k] ??= {});
                        for (const l in A) {
                            const Al = A[l], Ml = (M[l] ??= {});
                            for (const m in Al) { Ml[m] = (Ml[m] ?? 0) + Al[m]; }
                        }
                    }
                });

                for (const k in P1) {
                    const x = C[k], A = P1[k];
                    for (const l in A) { X[l] = (X[l] ?? 0) + $EquEmuRound2(A[l] * x); }
                }
                for (const k in P2) {
                    const x = C[k], A = P2[k];
                    for (const l in A) {
                        const Al = A[l], x2 = (C[l] ?? 0) * x;
                        for (const m in Al) { X[m] = (X[m] ?? 0) + $EquEmuRound2(Al[m] * x2); }
                    }
                }

                {
                    const S = BST[K];
                    if (!S) { return; }
    
                    const r = $EquUnitStats(L, Q);
                    for (const l in S) {
                        const [m, a] = S[l];
                        if (l in X) { X[l] += $EquEmuRound2(m * r) + a; }
                    }
                }
                
                // Equip
                const W = {...X};
                equip.forEach(i => {
                    const e = EM[i];
                    if (!e) { return; }
    
                    const D = {};
                    e.S.forEach(T => {
                        const [k, r] = T;
                        D[k] = (D[k] ?? 0) + r;
                    });
                    for (const k in D) {
                        const r = D[k], M = ESM[k] ?? {}, A = ESA[k] ?? {};
    
                        for (const k1 in M) {
                            const N = M[k1] ?? {};
    
                            for (const k2 in N) {
                                X[k1] = (X[k1] ?? 0) + +uiNumFix2(r * N[k2] * (W[k2] ?? 0));
                            }
                        }
    
                        for (const k1 in A) {
                            X[k1] = (X[k1] ?? 0) + +uiNumFix2(r * A[k1]);
                        }
                    }
                });

                uiStatsSet(X);

                // Aura
                uiAuraPointSet(F);
            }
        },

        uiCrfShow = d => {
            for (const el of elCrf) { el.clr(); }
            d.forEach((t, i) => { elCrf[i].dt(i, {Gain: {[`Lv${i}`]: 0}, Cost: t}); elCrf[i].open(!0); });
        },

        _crf = function () {
            const n = +this.n, A = uiBackAlloc(elEquip, n);
            if (A.length != n) { return; }

            Client[$CoSysPay](this.p, n)
                .then(d => d && 
                    Server[$SoEcCrf](A, this.i)
                    .then(d => {
                        switch (d) {
                        case $CbResolved:
                            uiCardMirror(elEquip_, elEquip, A);
                            return Client[$CoSysModal]($MsgHintEcGet, elEquip_);
                        case $CbRejected:
                            ; // Error message
                        }
                    })
                )   
            ;
        },

        uiSpwShow = d => {
            for (const el of elSpw) { el.clr(); }
            d.forEach((t, i) => { elSpw[i].dt(i, {Gain: {[`Lv${i}`]: 0}, Cost: t}); elSpw[i].open(!0); });
        },

        _spw = function () {
            const n = +this.n, A = uiBackAlloc(elActor, n);
            if (A.length != n) { return; }

            Client[$CoSysPay](this.p, n)
                .then(d => d && 
                    Server[$SoAcSpw](A, this.i)
                    .then(d => {
                        switch (d) {
                        case $CbResolved:
                            uiCardMirror(elActor_, elActor, A);
                            return Client[$CoSysModal]($MsgHintAcGet, elActor_);
                        case $CbRejected:
                            ; // Error message
                        }
                    })
                )
            ;
        },

        uiAmsShow = d => {
            for (const el of elAms) { el.clr(); }
            d.forEach((t, i) => { elAms[i].dt(i, {Gain: {[`Lv${i}`]: 0}, Cost: t}); elAms[i].open(!0); });
        },

        _ams = function () {
            const n = +this.n;
            if (mAmass) { 
                Client[$CoSysPay](this.p, n)
                    .then(d => d && Server[$SoGcMine](this.i, mAmass, n));
            }
        },

        uiFocusSet = function () {
            if (elFocus.i == this.i) { return; }

            elStatusEdit.disabled = (
                (elFocus = elActor.M[this.i] ?? elDummy) == elDummy
            ) || !this.K;

            uiAvatar(elFocus.K);
            uiFrontClr(elWears); uiFrontClr(elCarry);
            uiAuraNumSet(Math.floor(elFocus.S));
            uiFrontSlotSet(elCarry, Math.floor(elFocus.B));
            {
                const EM = elEquip.M, FM = elFruit.M;

                uiFrontSet(elWears, elFocus.equip.map(i => EM[i]));
                uiFrontSet(elCarry, elFocus.fruit.map(i => FM[i]));
            }
            uiAuraSet(elFocus.auras); uiAuraPointSet(elFocus.F);

            uiFocusEval();
        },

        uiViewMode = () => {
            const 
                [lEquip, lActor, lGem, lEdit, lAura] = elEditor[1].children
            ;

            lActor.style.display = lGem.style.display = "";
            lAura.style.display = lEdit.style.display = "none";
            lEquip.lastChild.onclick();
            pOp.ecWear.style.display = "none";
            pOp.fcWear.style.display = "none";
        },

        uiEditMode = () => {
            const 
                [lEquip, lActor, lGem, lEdit, lAura] = elEditor[1].children
            ;

            lActor.style.display = lGem.style.display = "none";
            lAura.style.display = lEdit.style.display = "";
            lEquip.lastChild.onclick();
            pOp.ecWear.style.display = "";
            pOp.fcWear.style.display = "";
        },

        // Reset
        uiReset = () => {
            elFocus = elDummy; elStatusEdit.disabled = !0;
            BST = {}; PST = []; EST = {}; LE = {};
            uiItemClr();
            uiFrontClr(elWears); uiFrontClr(elFight); uiFrontClr(elCarry);
            uiBackClr(elActor); uiBackClr(elEquip); uiBackClr(elFruit);
            uiStatsClr(); uiStatsSet(USR.Stats);
            uiAvatar(USR.Avatar); uiItemSet(USR.Item);
            uiFrontSlotSet(elWears, USR.WearsSlot); uiFrontSet(elWears, USR.Wear);
            uiFrontSlotSet(elFight, USR.FightSlot); uiBackSet(elFight, USR.Fight);
            uiFrontSlotSet(elCarry, USR.CarrySlot); uiBackSet(elCarry, USR.Back);
            uiBackSlotSet(elActor, USR.ActorSlot); uiBackSet(elActor, USR.Actor); uiActorSize(USR.ActorSize ?? "");
            uiBackSlotSet(elEquip, USR.EquipSlot); uiBackSet(elEquip, USR.Equip); uiActorSize(USR.EquipSize ?? "");
            uiBackSlotSet(elFruit, USR.FruitSlot); uiBackSet(elFruit, USR.Fruit); uiActorSize(USR.FruitSize ?? "");
            uiAmulSet(USR.Amulet), uiAmulMax(USR.AmuletMax);
            uiAuraSet(USR.Aura.Item);
            uiAuraNumSet(USR.Aura.Slot);
            uiAuraPointSet(USR.Aura.Point ?? {});
            uiAuraCostSet(USR.Aura.Cost ?? {});
            uiGemSetText(USR.Gem);
            uiCrfShow(USR.Craft.Item ?? []);
            uiSpwShow(USR.Spawn.Item ?? []);
            uiAmsShow(USR.Amass.Item ?? []);
            uiViewMode(); elStatusEdit.classList.remove(gEditCls);
        }
    ;

    elBody.classList = "fyg_equip row";
    elBody.append(elLeft, elRight);

    elLeft.classList = "col-xs-12 col-md-3";
    elLeft.append(elStatus);
    elRight.classList = "col-xs-12 col-md-9";
    elRight.append(elEditor);

    // Status
    elStatus[1].append(elStatusHead, elStatusInfo, elStatusImg, elStatusArts, elWears, elStatusAttrs);
    elStatusHead.classList = elStatusInfo.classList = "row text-info fyg_f24 fyg_lh60";
    elStatusHead.append(elStatusEdit);
    elStatusInfo.append(elStatusName, elStatusLevel);
    elStatusEdit.classList = "btn pull-right"; elStatusEdit.append(elStatusEditIcon); elStatusEditIcon.classList = "icon-search";
    elStatusEdit.onclick = () => {
        const C = elStatusEdit.classList;
        if (C.contains(gEditCls)) {
            if (mCommit && Object.keys(mCommit).length) {
                Server[$SoAcSet](mCommit)
                    .then(d => {
                        switch (d) {
                        case $CbResolved:
                            break;
                        case $CbRejected:
                            {
                                const A = elActor.M, E = elEquip.M, F = elFruit.M;

                                for (const i in mBackup) {
                                    const u = A[i];
                                    if (!u) { continue; }
                                    Object.assign(u, mBackup[i]);
                                }
                                for (const el of E) { el.show(!0); }
                                for (const el of F) { el.show(!0); }
                                for (const u of A) {
                                    for (const i of u.equip) { const el = E[i]; if (el) { el.show(!1); } }
                                    for (const i of u.fruit) { const el = F[i]; if (el) { el.show(!1); } }
                                }
                                uiFocusEval();
                                uiAuraSet(elFocus?.auras ?? []);
                            }
                        }
                        mBackup = {}; mCommit = {};
                    })
                ;
            }
            C.remove(gEditCls); uiViewMode();
            return;
        }
        C.add(gEditCls); uiEditMode();
    };
    elStatusName.style = "font-size:42px;"; elStatusLevel.classList = "pull-right"; elStatusLevel.append("", " ", elStatusLevelText, " ", "");
    elStatusImg.classList = "fyg_stand";
    elStatusImg.onerror = uiImgError;
    elStatusImg.onreset = () => elStatusImg.src = gUsrPath(RES_CH, mAvatar, "N");
    
    elWears.classList = "fyg_tc";
    elStatusAttrs.classList = "row fyg_tl"; elStatusAttrs.style = "padding-top:1rem;";
    elStatusAttrs.append(...LYT_EQUIP.Status.map(t => uiStats(pStatusRef, t.kind, t.type, t.attr)));

    // Editor
    uiNaviPair(elEditor[1], elEditor[2], 0, 5);
    const [pEquip, pActor, pGem, pEdit, pAura] = elEditor[2].children;

    {

        // Equip
        {
            const
                elEquipStock = document.createElement("div"),
                elEquipStockHead = document.createElement("p"),
                elEquipStockName = document.createElement("span"),
                elEquipDiv = document.createElement("div"),
                elEquipDivL = document.createElement("div"),
                elEquipDivR = document.createElement("div"),
                elEquipWear = document.createElement("button"),
                elEquipForge = document.createElement("button"),
                elEquipSmelt = document.createElement("button"),
                elEquipBreak = document.createElement("button"),
                elEquipSizeDiv = document.createElement("span"),
                elEquipSize = document.createElement("span"),
                elEquipSortDiv = document.createElement("span"),
                elEquipSort = document.createElement("select"),
                elFruitDiv = document.createElement("div"),
                elFruitDivL = document.createElement("div"),
                elFruitDivR = document.createElement("div"),
                elFruitWear = document.createElement("button"),
                elFruitForge = document.createElement("button"),
                elFruitBreak = document.createElement("button"),
                elFruitSizeDiv = document.createElement("span"),
                elFruitSize = document.createElement("span"),
                elFruitSortDiv = document.createElement("div"),
                elFruitSort = document.createElement("select"),
                // elEquipStockFoot = document.createElement("div"),
                elFruitStock = document.createElement("div"),
                elFruitStockHead = document.createElement("p"),
                elFruitStockName = document.createElement("span"),
                elAmulet = document.createElement("div"),
                elAmuletHead = document.createElement("div"),
                elAmuletName = document.createElement("div"),
                elAmuletMain = document.createElement("div")
            ;
            pEquip.append(elEquipStock, elFruitStock, elAmulet);
            elEquipStock.classList = "alert alert-success"; elEquipStock.append(elEquipStockHead, elEquipDiv, document.createElement("hr"), elItem, elEquip); // , document.createElement("hr"), elEquipStockFoot);
            elEquipStockHead.classList = "fyg_tr"; elEquipStockHead.append(elEquipStockName);
            elEquipStockName.classList = "fyg_f24"; // elEquipStockFoot.classList = "fyg_lh40 fyg_tc text-gray";
            elEquipDiv.classList = "col-xs-12 fyg_mp3"; elEquipDiv.append(elEquipDivL, elEquipDivR);
            elEquipDivL.classList = "col-xs-12 col-md-8"; elEquipDivL.append(elEquipWear, elEquipForge, elEquipBreak, elEquipSmelt);
            elEquipDivR.classList = "col-xs-12 col-md-4"; elEquipDivR.append(elEquipSizeDiv, elEquipSortDiv);
            elEquipWear.classList = "col-xs-2 btn btn-success fyg_mp8"; elEquipWear.onclick = () => {
                const E = elFocus.equip, EM = {}, A = Array(elWears.N).fill(), {N, M} = elEquip;
                (mBackup[elFocus.i] ??= {}).equip ??= [...E];
                elWears.M.forEach((e, n) => {
                    if (!e.checked) { return; }
                    const i = E[n];
                    if (i >= 0) { M[i].show(!0); E[n] = $Empty; }
                    e.clr(); uiCardChk(e);
                });
                M.slice(0, N).forEach((e, i) => {
                    if (e.checked) {
                        const n = LE[e.K];
                        if (n >= 0) { A[n] = i; }
                        uiCardChk(e);
                    }
                });
                A.forEach((i, n) => {
                    if (!(i >= 0)) { return; }
                    const d = M[E[n]], e = M[i];
                    if (d) { d.show(!0); }
                    E[n] = i; EM[n] = M[i]; e.show(!1);
                });
                uiFrontSet(elWears, EM);
                (mCommit[elFocus.i] ??= {}).equip = E;
                uiFocusEval();
            };
            elEquipForge.classList = "col-xs-2 btn btn-warning fyg_mp8"; elEquipForge.onclick = () => {
                const A = [], EM = elEquip.M;
                let m = 0;
                EM.forEach((el, i) => {
                    if (el.checked) {
                        const L = el.L + 1, cap = Math.min(mGrade, mEcFrgCap);
                        if (!(L < cap - 1)) {
                            uiCardChk(el);
                            if (L > cap) { return; }
                        }
                        m += 1 + L * mEcFrgMul; A.push(i);
                    }
                })
                if (A.length) { 
                    Client[$CoSysPay](mEcFrgCost, m)
                        .then(d => d && 
                            Server[$SoEcFrg](A, m)
                            .then(d => {
                                switch (d) {
                                case $CbResolved:
                                    uiCardMirror(elEquip_, elEquip, A);
                                    return Client[$CoSysModal]($MsgHintEcUpd, elEquip_);
                                case $CbRejected:
                                    ; // Error message
                                }
                            })
                        )
                    ;
                }
            };
            elEquipBreak.classList = "col-xs-2 btn btn-danger fyg_mp8"; elEquipBreak.onclick = () => {
                const A = uiCardQuery(elEquip);
                if (A.length) {
                    uiCardMirror(elEquip_, elEquip, A);
                    Client[$CoSysModal]($MsgHintEcUse, elEquip_)
                        .then(d => d && Server[$SoEcBrk](A))
                    ;
                }
            };
            elEquipSmelt.classList = "col-xs-2 btn btn-primary fyg_mp8"; elEquipSmelt.onclick = () => {
                const A = uiCardQuery(elEquip), T = {};
                if (!A.length) { return; }
                const B = uiBackAlloc(elFruit, A.length);
                if (B.length != A.length) { return; }
                B.forEach((k, i) => T[A[i]] = k);

                uiCardMirror(elEquip_, elEquip, A);
                Client[$CoSysModal]($MsgHintEcUse, elEquip_)
                    .then(d => {
                        if (!d) { return ; }
                        Server[$SoEcSml](T)
                            .then(d => {
                                switch (d) {
                                case $CbResolved:
                                    uiCardMirror(elFruit_, elFruit, B);
                                    return Client[$CoSysModal]($MsgHintFcGet, elFruit_);
                                case $CbRejected:
                                    ; // Error message
                                }
                            })
                        ;
                    })
                ;
            };
            
            elEquipSizeDiv.classList = "col-xs-12 fyg_f14 fyg_fr fyg_nw";
            elEquipSizeDiv.append("", elEquipSize);
            elEquipSize.classList = "col-xs-7 fyg_fr fyg_tr";

            elEquipSortDiv.classList = "col-xs-12 fyg_f14 fyg_fr fyg_nw";
            elEquipSortDiv.append("", elEquipSort);
            elEquipSort.classList = "col-xs-7 fyg_fr";
            elEquipSort.append(...LYT_EQUIP.Sort.map(k => {
                const el = document.createElement("option");
                el.value = k;
                return el;
            }));
            elEquipSort.onchange = () => {
                elEquip.F = uiSortTbl[elEquipSort.value] ?? elEquip.F;
                uiCardSort(elEquip);
            };

            elFruitDiv.classList = "col-xs-12 fyg_mp3"; elFruitDiv.append(elFruitDivL, elFruitDivR);
            elFruitDivL.classList = "col-xs-12 col-md-8"; elFruitDivL.append(elFruitWear, elFruitForge, elFruitBreak);
            elFruitDivR.classList = "col-xs-12 col-md-4"; elFruitDivR.append(elFruitSizeDiv, elFruitSortDiv);
            elFruitWear.classList = "col-xs-2 btn btn-success fyg_mp8"; elFruitWear.onclick = () => {
                const F = elFocus.fruit, L = elCarry.N, E = Array(L).fill($Empty), EM = {}, {N, M} = elFruit;
                (mBackup[elFocus.i] ??= {}).fruit ??= F; elFocus.fruit = E;
                let a = 0, i;
                elCarry.M.slice(0, L).forEach((e, n) => {
                    const i = F[n], d = M[i];
                    if (e.checked) {
                        if (d) { d.show(!0); }
                        return;
                    }
                    if (d) { E[a] = i; EM[a] = d; a++; }
                });
                for (i = 0; i < N; i++) {
                    const e = M[i];
                    if (!e.checked) { continue; }
                    E[a] = i; EM[a] = e; e.show(!1); uiCardChk(e);
                    if (++a >= L) { break; }
                }
                uiFrontClr(elCarry); uiFrontSet(elCarry, EM);
                (mCommit[elFocus.i] ??= {}).fruit = E;
                uiFocusEval();
            };
            elFruitForge.classList = "col-xs-2 btn btn-warning fyg_mp8"; elFruitForge.onclick = () => {
                const A = [], FM = elFruit.M;
                let m = 0;
                FM.forEach((el, i) => {
                    if (el.checked) {
                        const L = el.L + 1;
                        if (!(L < mFcFrgCap)) {
                            uiCardChk(el);
                            if (L != mFcFrgCap) { return; }
                        }
                        m += L * mFcFrgMul[el.K]; A.push(i);
                    }
                })
                if (A.length) { 
                    Client[$CoSysPay](mFcFrgCost, m)
                        .then(d => d && 
                            Server[$SoFcFrg](A, m)
                            .then(d => {
                                switch (d) {
                                case $CbResolved:
                                    uiCardMirror(elFruit_, elFruit, A);
                                    return Client[$CoSysModal]($MsgHintFcUpd, elFruit_);
                                case $CbRejected:
                                    ; // Error message
                                }
                            })
                        )
                    ;
                }
            };
            elFruitBreak.classList = "col-xs-2 btn btn-danger fyg_mp8"; elFruitBreak.onclick = () => {
                const A = uiCardQuery(elFruit);
                if (A.length) {
                    uiCardMirror(elFruit_, elFruit, A);
                    Client[$CoSysModal]($MsgHintFcUse, elFruit_)
                        .then(d => d && Server[$SoFcBrk](A))
                    ;
                }
            };

            elFruitSizeDiv.classList = "col-xs-12 fyg_f14 fyg_fr fyg_nw";
            elFruitSizeDiv.append("", elFruitSize);
            elFruitSize.classList = "col-xs-7 fyg_fr fyg_tr";
            
            elFruitSortDiv.classList = "col-xs-12 fyg_f14 fyg_fr fyg_nw";
            elFruitSortDiv.append("", elFruitSort);
            elFruitSort.classList = "col-xs-7 fyg_fr";
            elFruitSort.append(...LYT_EQUIP.Sort.map(k => {
                const el = document.createElement("option");
                el.value = k;
                return el;
            }));
            elFruitSort.onchange = () => {
                const F = uiSortTbl[elFruitSort.value];
                elFruit.F = F ?? elFruit.F;
                elCarry.F = F ?? elCarry.F;
                uiCardSort(elFruit); uiCardSort(elCarry);
            };

            elFruitStock.classList = "alert alert-danger"; elFruitStock.append(elFruitStockHead, elFruitDiv, document.createElement("hr"), elCarry, elFruit);
            elFruitStockHead.classList = "fyg_tr"; elFruitStockHead.append(elFruitStockName);
            elFruitStockName.classList = "fyg_f24"; 
            elAmulet.classList = "alert"; elAmulet.append(elAmuletHead, document.createElement("hr"), elAmuletMain);
            elAmuletHead.classList = "fyg_tr"; elAmuletHead.append(elAmuletName);
            elAmuletName.classList = "fyg_f24"; elAmuletMain.classList = "row";
            
            for (const k of LYT_EQUIP.Amulets) {
                const m = document.createElement("div"), l = document.createElement("p"), r = document.createElement("span");

                elAmuletMain.append(m);
                m.classList = "col-xs-12 col-md-4"; m.append(l);
                l.classList = "with-padding fyg_f14"; l.append("", r);
                r.classList = "pull-right"; r.append("+", "", "", "（Max ", "", "）");
                elAmulet[k] = {
                    attr: {num: r.childNodes[1], max: r.childNodes[4]},
                    msgs: {name: l.firstChild, unit: r.childNodes[2]}
                };
            }
            elEquipStock.name = elEquipStockName; elFruitStock.name = elFruitStockName; elAmulet.name = elAmuletName;
            pOp.ecWear = elEquipWear; pOp.ecFrg = elEquipForge; pOp.ecBrk = elEquipBreak; pOp.ecSml = elEquipSmelt; pOp.ecSize = elEquipSizeDiv; pOp.ecSort = elEquipSortDiv;
            pOp.fcWear = elFruitWear; pOp.fcFrg = elFruitForge; pOp.fcBrk = elFruitBreak; pOp.fcSize = elFruitSizeDiv; pOp.fcSort = elFruitSortDiv;
        }

        // Cards
        {
            const
                elFightMain = document.createElement("div"),
                elFightHead = document.createElement("p"),
                elFightName = document.createElement("span"),
                elActorStock = document.createElement("div"),
                elActorHead = document.createElement("p"),
                elActorName = document.createElement("span"),
                elActorDiv = document.createElement("div"),
                elActorDivL = document.createElement("div"),
                elActorDivR = document.createElement("div"),
                elActorWear = document.createElement("button"),
                elActorBreak = document.createElement("button"),
                elActorSizeDiv = document.createElement("span"),
                elActorSize = document.createElement("span"),
                elActorSortDiv = document.createElement("span"),
                elActorSort = document.createElement("select")
                // elActorFoot = document.createElement("div")
            ;
            pActor.append(elFightMain, elActorStock);

            elFightMain.classList = "alert alert-primary"; elFightMain.append(elFightHead, document.createElement("hr"), elFight);
            elFightHead.classList = "fyg_tr"; elFightHead.append(elFightName);
            elFightName.classList = "fyg_f24";

            elActorStock.classList = "alert alert-info"; elActorStock.append(elActorHead, elActorDiv, document.createElement("hr"), elActor);
            elActorHead.classList = "fyg_tr"; elActorHead.append(elActorName);
            elActorName.classList = "fyg_f24"; // elActorFoot.classList = "fyg_lh40 fyg_tc text-gray";
            elActorDiv.classList = "col-xs-12 fyg_mp3"; elActorDiv.append(elActorDivL, elActorDivR);
            elActorDivL.classList = "col-xs-12 col-md-8"; elActorDivL.append(elActorWear, elActorBreak);
            elActorDivR.classList = "col-xs-12 col-md-4"; elActorDivR.append(elActorSizeDiv, elActorSortDiv);
            elActorWear.classList = "col-xs-2 btn btn-success fyg_mp8"; elActorWear.onclick = () => {
                const A = uiCardQuery(elActor);
                if (A.length) {
                    Server[$SoAcFgt](A);
                    A.forEach(i => uiCardChk(elActor.M[i]));
                }
            };
            elActorBreak.classList = "col-xs-2 btn btn-danger fyg_mp8"; elActorBreak.onclick = () => {
                const A = uiCardQuery(elActor);
                if (A.length) {
                    uiCardMirror(elActor_, elActor, A);
                    Client[$CoSysModal]($MsgHintEcUse, elActor_)
                        .then(d => d && Server[$SoAcBrk](A))
                    ;
                }
            };

            elActorSizeDiv.classList = "col-xs-12 fyg_f14 fyg_fr fyg_nw";
            elActorSizeDiv.append("", elActorSize);
            elActorSize.classList = "col-xs-7 fyg_fr fyg_tr";

            elActorSortDiv.classList = "col-xs-12 fyg_f14 fyg_fr fyg_nw";
            elActorSortDiv.append("", elActorSort);
            elActorSort.classList = "col-xs-7 fyg_fr";
            elActorSort.append(...LYT_EQUIP.Sort.map(k => {
                const el = document.createElement("option");
                el.value = k;
                return el;
            }));
            elActorSort.onchange = () => {
                const f = uiSortTbl[elActorSort.value] ?? elActor.F;
                elActor.F = f; elFight.F = f;
                uiCardSort(elFight); uiCardSort(elActor);
            };

            elFightMain.name = elFightName; elActorStock.name = elActorName; 
            pOp.acWear = elActorWear; pOp.acBrk = elActorBreak; pOp.acSize = elActorSizeDiv; pOp.acSort = elActorSortDiv;
        }

        // Auras
        {
            const 
                main = document.createElement("div"),
                
                feed = uiTipTop4({root: {classList: "row hl-special tip-top", style: "border: medium none;"}, inner: {classList: "tooltip-inner", style: "max-width: 100%"}}),
                feedL = document.createElement("div"), feedR = document.createElement("div"),
                prog = uiProgBar({prog: {classList: "progress", style: "height:2.8rem;border: solid #EF8D7A 0.2rem;padding:0.2rem;background-color:#F8CEC6;"}, bar: {classList: "progress-bar progress-bar-danger", role: "progressbar"}}),
                feedNum = document.createElement("input"), feedBtn = document.createElement("span"),

                h1Point = document.createElement("h1"),
                info = document.createElement("div"),
                h3Info = document.createElement("h3"),
                point = document.createTextNode(""),
                skill = document.createTextNode(""),

                h3Prefix = document.createTextNode(""),
                h3Middle = document.createTextNode(""),
                h3Suffix = document.createTextNode(""),
                skillPrefix = document.createTextNode(""),
                skillSuffix = document.createTextNode(""),
                pointPrefix = document.createTextNode(""),
                pointSuffix = document.createTextNode("")
            ;

            pAura.append(feed, document.createElement("hr"), info);

            feed.append(h1Point, feedL, feedR);
            h1Point.classList = "fyg_mp8";
            feedL.classList = "col-xs-8"; feedR.classList = "col-xs-4 fyg_lh24";
            feedL.append(prog); feedR.append(feedNum, feedBtn);
            feedNum.classList = "col-xs-6"; feedBtn.classList = "col-xs-6 btn btn-success";
            feedNum.value = 0;
            feedBtn.onclick = () => {
                const n = +feedNum.value || 0;
                if (n >= 1) { 
                    if (elFocus) {
                        Client[$CoSysPay](mAcElt.Cost, n)
                            .then(d => d && Server[$SoAcElt](elFocus.i, n))
                        ;
                    }
                }
            };
            
            info.classList = "alert alert-info"; info.append(h3Info);
            h3Info.append(h3Prefix, pointPrefix, "：", point, " ", pointSuffix, h3Middle, skillPrefix, "：", skill, " ", skillSuffix, h3Suffix);
            main.classList = "row";
            for (const kinds of LYT_EQUIP.Auras) {
                const root = document.createElement("div");

                pAura.append(root);
                root.classList = "col-md-3";

                for (const kind of kinds) {
                    const 
                        panel = uiTipTop4({
                            root: {classList: "btn tip-top", style: "padding:1rem; margin: 1rem; width: 100%;"},
                            tip: {classList: "tooltip tooltip-info fade top tip-text"},
                            inner: {classList: "tooltip-inner", style: "max-width: 100%;"}
                        }),
                        icon = document.createElement("i"),
                        badge = document.createElement("span"),
                        name = document.createTextNode(""),
                        cost = document.createTextNode("0")
                    ;

                    panel.onclick = () => {
                        (mBackup[elFocus.i] ??= {}).aura ??= elFocus.aura;
                        if (mAuras.delete(+kind)) {
                            panel.classList.remove("btn-primary");
                        }
                        else {
                            if (
                                mAuras.size < mSkill && 
                                [...mAuras].reduce((n, k) => n + mAuraCost[k], mAuraCost[kind]) <= mFlair && 
                                mAuras.add(+kind)
                            ) {
                                panel.classList.add("btn-primary");
                            }
                        }
                    };
                    panel.classList = "btn tip-top"; panel.style = "padding:1rem; margin: 1rem; width: 100%;";
                    icon.classList = "icon icon-bookmark-empty";
                    badge.classList = "label label-badge";

                    root.append(panel);
                    panel.append(icon, " ", name, " ", badge);
                    badge.append("", " ", cost, " ", "");

                    pAura[kind] = {panel: panel, name: name, desc: panel.inner, badge: badge, cost: cost};
                }
            }

            pAura.attr = {h1Point: h1Point, point: point, skill: skill, prog: prog};
            pAura.msgs = {
                feedName: feedBtn, feedDesc: feed.inner,
                h3Prefix: h3Prefix, h3Suffix: h3Suffix, h3Middle: h3Middle,
                skillPrefix: skillPrefix, skillSuffix: skillSuffix,
                pointPrefix: pointPrefix, pointSuffix: pointSuffix
            }
        }

        // Gem
        {
            const 
                forge = uiPanel3({head: {tag: "div", classList: "panel-heading css-debug"}, body: [{tag: "div", classList: "panel-body", style: "width:100%; margin:1rem 0;"}]}),
                spawn = uiPanel3({head: {tag: "div", classList: "panel-heading css-debug"}, body: [{tag: "div", classList: "panel-body", style: "width:100%; margin:1rem 0;"}]}),
                amass = uiPanel3({head: {tag: "div", classList: "panel-heading css-debug"}, body: [{tag: "div", classList: "panel-body", style: "width:100%; margin:1rem 0;"}]}),
                forgeRow = document.createElement("div"), forgeHead = document.createElement("div"), forgeMisc = document.createElement("div"),
                forgeLeft = document.createElement("div"),  forgeRight = document.createElement("div"), forgeDown = document.createElement("div"),
                // forgeBtnL = document.createElement("button"), forgeBtnR = document.createElement("button"), 
                spawnRow = document.createElement("div"), spawnHead = document.createElement("div"), spawnMisc = document.createElement("div"),
                spawnLeft = document.createElement("div"), spawnRight = document.createElement("div"), spawnDown = document.createElement("div"),
                // spawnBtnL = document.createElement("button"), spawnBtnR = document.createElement("button"), 
                amassRow = document.createElement("div"), amassHead = document.createElement("div"), amassMisc = document.createElement("div"),
                amassMain = document.createElement("div"), amassDown = document.createElement("div"), 

                forgeName = document.createElement("span"), forgeDesc = document.createElement("span"), 
                forgeVal = document.createTextNode(""), forgeProg = uiProgBar({}),
                spawnName = document.createElement("span"), spawnDesc = document.createElement("span"), 
                spawnProg = uiProgBar({}), spawnVal = document.createTextNode(""),
                amassName = document.createElement("span"), amassDesc = document.createElement("span"), amassVal = document.createTextNode(""),
                amassProg = uiProgBar({}),

                nA = {val: forgeVal, bar: forgeProg}, mA = {name: forgeName, desc: forgeDesc}, 
                nB = {val: spawnVal, bar: spawnProg}, mB = {name: spawnName, desc: spawnDesc}, 
                nC = {val: amassVal, bar: amassProg}, mC = {name: amassName, desc: amassDesc}
            ;
            
            pGem.nA = nA; pGem.mA = mA;
            pGem.nB = nB; pGem.mB = mB;
            pGem.nC = nC; pGem.mC = mC;
            pGem.append(forge, spawn, amass);
            forge[1].append(forgeRow); spawn[1].append(spawnRow); amass[1].append(amassRow);
            forgeRow.classList = spawnRow.classList = amassRow.classList = "row";
            forgeRow.append(forgeHead, forgeMisc, forgeLeft, forgeRight, forgeDown);
            forgeHead.classList = "col-sm-4"; forgeMisc.classList = "col-sm-8 fyg_tr";
            forgeLeft.classList = "col-sm-6 fyg_fl fyg_tl"; forgeRight.classList = "col-sm-6 fyg_fr fyg_tr"; forgeDown.classList = "col-sm-12";
            forgeHead.append(forgeName); forgeMisc.append(forgeDesc); forgeHead.style = "min-height: 5rem;"; forgeMisc.style = "min-height: 5rem;"; 
            forgeDown.append(document.createElement("hr"), ...elCrf);
            forgeName.classList = "fyg_f24"; forgeName.append("", " （", forgeVal, "）");

            spawnRow.append(spawnHead, spawnMisc, spawnLeft, spawnRight, spawnDown);
            spawnHead.classList = "col-sm-4"; spawnMisc.classList = "col-sm-8 fyg_tr";
            spawnLeft.classList = "col-sm-6 fyg_fl fyg_tl"; spawnRight.classList = "col-sm-6 fyg_fr fyg_tr"; spawnDown.classList = "col-sm-12";
            spawnHead.append(spawnName); spawnMisc.append(spawnDesc); spawnHead.style = "min-height: 5rem;"; spawnMisc.style = "min-height: 5rem;"; 
            spawnDown.append(document.createElement("hr"), ...elSpw);
            spawnName.classList = "fyg_f24"; spawnName.append("", " （", spawnVal, "）");

            amassRow.append(amassHead, amassMisc, amassMain, amassDown);
            amassHead.classList = "col-sm-4"; amassMisc.classList = "col-sm-8 fyg_tr"; amassMain.classList = "col-xs-12"; amassDown.classList = "col-sm-12";
            amassHead.append(amassName); amassMisc.append(amassDesc); 
            amassDown.append(document.createElement("hr"), ...elAms);
            // amassDown.append(document.createElement("hr"), amassProg); 
            amassHead.style = "min-height: 5rem;"; amassMisc.style = "min-height: 5rem;"; 
            for (const kind of LYT_EQUIP.Gems) {
                const div = document.createElement("div"), btn = document.createElement("button"), name = document.createTextNode(""), num = document.createElement("span");

                amassMain.append(div);
                div.classList = "col-sm-2 fyg_tc"; div.append(btn);
                btn.classList = "col-xs-12 btn"; btn.type = "button";
                btn.append(name, document.createElement("br"), num);
                nC[kind] = num; num.classList = "fyg_f18"; num.innerHTML = "-";
                mC[kind] = name;
                btn.onclick = () => {
                    mAmass = kind;
                    for (const el of amassMain.children) { el.firstChild.classList.remove("btn-success"); }
                    btn.blur(); btn.classList.add("btn-success");
                };
            }
            amassName.classList = "fyg_f24"; amassName.append("", " （", amassVal, "）");
            
        }
        
        // Editor
        {

            const 
                elRoot = document.createElement("div"),
                elInfo = document.createElement("div"),
                elInfoL = document.createElement("div"),
                elInfoR = document.createElement("div"),
                elLevel = document.createElement("div"), elLevelDiv = document.createElement("div"),
                elValue = document.createElement("div"), elValueDiv = document.createElement("div"),
                elSkill = document.createElement("div"), elSkillDiv = document.createElement("div"),
                elBuild = document.createElement("div"), elBuildDiv = document.createElement("div"),
                elGrowth = document.createElement("div"), elGrowthDiv = document.createElement("div"),
                elMyst = document.createElement("div"), 
                elLevelL = document.createElement("div"), elLevelR = document.createElement("div"), 
                elExp = uiTipTop4({root: {classList: "col-xs-12 tip-top", style: "border: none;"}, inner: {classList: "tooltip-inner", style: "max-width: 100%"}}),
                elFeed = uiTipTop4({root: {classList: "col-xs-12 input-group tip-top", style: "display: table;"}, inner: {classList: "tooltip-inner", style: "max-width: 100%"}}),
                elPoints = document.createElement("div"),
                elInputs = document.createElement("div"),

                elExpBar = uiProgBar({prog: {classList: "progress", style: "height:2.8rem;border: solid #8D7AEF 0.2rem;padding:0.2rem;background-color:#CEC6F8;"}, bar: {classList: "progress-bar progress-bar-primary", role: "progressbar"}}),
                elFeedNum = document.createElement("input"), elFeedBtn = document.createElement("span"),

                elName = document.createElement("span"),
                elArts = uiArt3(),
                elLevelNum = document.createElement("i"), elLevelName = document.createElement("span"), elLevelDesc = document.createElement("p"),
                elValueNum = document.createElement("i"), elValueName = document.createElement("span"), elValueDesc = document.createElement("p"),
                elSkillNum = document.createElement("i"), elSkillName = document.createElement("span"), elSkillDesc = document.createElement("p"),
                elBuildNum = document.createElement("i"), elBuildName = document.createElement("span"), elBuildDesc = document.createElement("p"),
                elGrowthNum = document.createElement("i"), elGrowthName = document.createElement("span"), elGrowthDesc = document.createElement("p"),
                elPointFree = document.createElement("span"), elPointFreeNum = document.createElement("span"),
                elPointMax = document.createElement("span"), elPointMaxNum = document.createElement("span"),
                elPointUsed = document.createElement("span"), elPointUsedNum = document.createElement("span"),

                attr = {
                    level: elLevelNum, exp: elExp.inner, bar: elExpBar, value: elValueNum, skill: elSkillNum, build: elBuildNum, growth: elGrowthNum, myst: elMyst,
                    free: elPointFreeNum, max: elPointMaxNum, used: elPointUsedNum
                },
                msgs = {
                    name: elName, arts: elArts,
                    levelName: elLevelName, valueName: elValueName, skillName: elSkillName, buildName: elBuildName, growthName: elGrowthName, feedName: elFeedBtn,
                    levelDesc: elLevelDesc, valueDesc: elValueDesc, skillDesc: elSkillDesc, buildDesc: elBuildDesc, growthDesc: elGrowthDesc, feedDesc: elFeed.inner,
                    myst: elMyst, free: elPointFree, max: elPointMax, used: elPointUsed
                }
            ;

            pEdit.append(elRoot);
            elRoot.append(elEditorImg, elInfo, elArts, elLevel, elValue, elSkill, elBuild, elGrowth, elMyst, elPoints, elInputs);
            elEditorImg.style = "padding: 2rem"; elEditorImg.onerror = uiImgError; elEditorImg.onreset = () => elEditorImg.src = gUsrPath(RES_CH, mAvatar, "C");
            elInfo.classList = "row"; elInfo.append(elInfoL, elInfoR);
            elInfoL.classList = "col-xs-12 col-md-3"; elInfoL.append(elName);
            elInfoR.classList = "col-md-9";
            elName.classList = "text-info fyg_f24"; elName.style = "font-size: 45px";
            elLevel.classList = "alert alert-primary with-icon"; elLevel.append(elLevelNum, elLevelDiv);
            elLevelNum.classList = "icon icon-angle-down text-primary";
            elLevelDiv.classList = "content"; elLevelDiv.append(elLevelName, elLevelDesc, elLevelL, elLevelR);
            elLevelName.classList = "fyg_f24";
            elLevelL.classList = "col-md-8"; elLevelL.append(elExp);
            elLevelR.classList = "col-md-4"; elLevelR.append(elFeed);
            elValue.classList = "alert alert-primary with-icon"; elValue.append(elValueNum, elValueDiv);
            elValueNum.classList = "icon icon-angle-down text-primary";
            elValueDiv.classList = "content"; elValueDiv.append(elValueName, elValueDesc);
            elValueName.classList = "fyg_f24";
            elSkill.classList = "alert alert-primary with-icon"; elSkill.append(elSkillNum, elSkillDiv);
            elSkillNum.classList = "icon icon-angle-down text-primary";
            elSkillDiv.classList = "content"; elSkillDiv.append(elSkillName, elSkillDesc);
            elSkillName.classList = "fyg_f24";
            elBuild.classList = "alert alert-primary with-icon"; elBuild.append(elBuildNum, elBuildDiv);
            elBuildNum.classList = "icon icon-angle-down text-primary";
            elBuildDiv.classList = "content"; elBuildDiv.append(elBuildName, elBuildDesc);
            elBuildName.classList = "fyg_f24";
            elGrowth.classList = "alert alert-primary with-icon"; elGrowth.append(elGrowthNum, elGrowthDiv);
            elGrowthNum.classList = "icon icon-angle-down text-primary";
            elGrowthDiv.classList = "content"; elGrowthDiv.append(elGrowthName, elGrowthDesc);
            elGrowthName.classList = "fyg_f24";
            elMyst.classList = "alert alert-danger fyg_f18";

            elPoints.classList = "btn-group fyg_lh60 col-xs-12 fyg_nw"; elPoints.append(elPointFree, elPointFreeNum, " ", elPointMax, elPointMaxNum, " ", elPointUsed, elPointUsedNum);
            elPointFree.classList = "with-padding bg-default"; elPointFreeNum.classList = "with-padding bg-success";
            elPointMax.classList = "with-padding bg-default"; elPointMaxNum.classList = "with-padding bg-danger";
            elPointUsed.classList = "with-padding bg-default"; elPointUsedNum.classList = "with-padding bg-primary";

            elExp.append(elExpBar);
            elFeed.append(elFeedNum, elFeedBtn);
            elFeedNum.classList = "form-control"; elFeedBtn.classList = "btn input-group-addon";
            elFeedNum.value = 0;
            elFeedNum.onblur = () => {
                const 
                    m = Math.min(Math.floor(mGrade), mAcExp.Cap) - elFocus.L,
                    n = Math.min(m * m, +elFeedNum.value || 0)
                ;
                elFeedNum.value = n;
            };
            elFeedBtn.onclick = () => {
                const 
                    m = Math.min(Math.floor(mGrade), mAcExp.Cap) - elFocus.L,
                    n = Math.min(m * m, +elFeedNum.value || 0),
                    c = mAcExp.Cost
                ;
                if (n > 0 && c) { 
                    Client[$CoSysPay](c, n)
                        .then(d => {
                            if (d) {
                                Server[$SoAcExp](elFocus.i, n);
                                elFeedNum.value = 0;
                            }
                        })
                    ;
                }
            };

            elInputs.classList = "row"; 
            for (const k of LYT_FYG.Stat) {
                const 
                    elL = document.createElement("div"), elR = document.createElement("div"),
                    elG = uiTipTop4({root: {classList: "input-group tip-top", style: "display: table;"}, inner: {classList: "tooltip-inner", style: "max-width: 100%"}}),
                    elNum = document.createElement("input"), elProg = uiProgBar({}), elName = document.createElement("span")
                ;

                elInputs.append(elL, elR);
                elL.classList = "col-xs-12 col-md-3";
                elR.classList = "col-xs-12 col-md-9";
                elL.append(elG); elR.append(elProg); elG.append(elNum, elName);
                elNum.classList = "form-control"; elName.classList = "input-group-addon";
                elNum.prog = elProg;
                elNum.onblur = function () { if (elFocus) { this.value = uiCommitStat(k, +this.value || 0); }};
                attr[k] = [elNum, elProg];
                msgs[k] = [elName, elG.inner];
            }

            pEdit.attr = attr;
            pEdit.msgs = msgs;
        }
    }

    // Manual
    elManual[1].innerHTML = ``; // `1。卡片级别通过沙滩掉落的经验球升级，每级获得3点可分配属性，在“我的属性”页面分配。<br>`;

    elBody.onload = () => {
        const navi = elEditor[1].children;

        elStatusName.innerHTML = gMsgActorName[mAvatar] || mAvatar;
        elStatusLevel.firstChild.textContent = gMsgData[$MsgPreLevel];
        elStatusLevel.lastChild.textContent = gMsgData[$MsgSufLevel];
        elStatusArts.set(mAvatar);
        for (const el of elWears.children) { el.onload(); }
        for (const el of elStatusAttrs.children) { el.onload(); }

        navi[0].firstChild.innerHTML = gMsgData[$MsgNameEquip];
        navi[1].firstChild.innerHTML = gMsgData[$MsgNameCard];
        navi[2].firstChild.innerHTML = gMsgData[$MsgNameGems];
        navi[3].firstChild.innerHTML = gMsgData[$MsgNameCard];
        navi[4].firstChild.innerHTML = gMsgData[$MsgNameAura];

        {
            const 
                [elEquipStock, elFruitStock, elAmulet] = pEquip.children, [elFightMain, elActorStock] = pActor.children,
                elAcSort = pOp.acSort, elEcSort = pOp.ecSort, elFcSort = pOp.fcSort
            ;
            elFightMain.name.innerHTML = gMsgData[$MsgNameFightSquad];
            elActorStock.name.innerHTML = gMsgData[$MsgNameActorStock];
            elEquipStock.name.innerHTML = gMsgData[$MsgNameEquipStock];
            elFruitStock.name.innerHTML = gMsgData[$MsgNameFruitStock];
            pOp.acWear.innerHTML = pOp.ecWear.innerHTML = pOp.fcWear.innerHTML = gMsgData[$MsgNameEquipSet];
            pOp.ecFrg.innerHTML = gMsgData[$MsgNameEquipForge];
            pOp.ecSml.innerHTML = gMsgData[$MsgNameEquipSmelt];
            pOp.fcFrg.innerHTML = gMsgData[$MsgNameEquipForge];
            pOp.acBrk.innerHTML = pOp.ecBrk.innerHTML = pOp.fcBrk.innerHTML = gMsgData[$MsgNameEquipBreak];
            pOp.acSize.firstChild.textContent = gMsgData[$MsgNameSize];
            elAcSort.firstChild.textContent = gMsgData[$MsgNameSort];
            for (const el of elAcSort.lastChild.children) { el.innerHTML = gMsgData[uiSortMsg[el.value]] ?? el.value; }
            pOp.ecSize.firstChild.textContent = gMsgData[$MsgNameSize];
            elEcSort.firstChild.textContent = gMsgData[$MsgNameSort];
            for (const el of elEcSort.lastChild.children) { el.innerHTML = gMsgData[uiSortMsg[el.value]] ?? el.value; }
            pOp.fcSize.firstChild.textContent = gMsgData[$MsgNameSize];
            elFcSort.firstChild.textContent = gMsgData[$MsgNameSort];
            for (const el of elFcSort.lastChild.children) { el.innerHTML = gMsgData[uiSortMsg[el.value]] ?? el.value; }
            elAmulet.name.innerHTML = gMsgData[$MsgNameEquipAmulet];
            for (const el of elItem.children) { el.onload(); }
            for (const el of elEquip.children) { el.onload(); }
            for (const el of elCarry.children) { el.onload(); }
            for (const k of LYT_EQUIP.Amulets) { 
                const msgs = elAmulet[k].msgs;
                msgs.name.textContent = gMsgFruitAttrName[k];
                msgs.unit.textContent = gMsgFruitAttrUnit[k];
            }
        }

        {
            {
                const msg = pEdit.msgs;
                msg.name.innerHTML = gMsgActorName[mAvatar] ?? "";
                msg.arts.set(mAvatar);
                msg.feedName.innerHTML = gMsgData[$MsgNameEditFeed]; msg.feedDesc.innerHTML = gMsgData[$MsgDescEditFeed];
                msg.levelName.innerHTML = gMsgData[$MsgNameEditLevel]; msg.valueName.innerHTML = gMsgData[$MsgNameEditTrait]; msg.skillName.innerHTML = gMsgData[$MsgNameEditSkill]; msg.buildName.innerHTML = gMsgData[$MsgNameEditBuild]; msg.growthName.innerHTML = gMsgData[$MsgNameEditGrowth];
                msg.levelDesc.innerHTML = gMsgData[$MsgDescEditLevel]; msg.valueDesc.innerHTML = gMsgData[$MsgDescEditTrait]; msg.skillDesc.innerHTML = gMsgData[$MsgDescEditSkill]; msg.buildDesc.innerHTML = gMsgData[$MsgDescEditBuild]; msg.growthDesc.innerHTML = gMsgData[$MsgDescEditGrowth];
                for (const k of LYT_FYG.Stat) {
                    const [elName, elDesc] = msg[k];
                    elName.innerHTML = gMsgStatName[k] ?? ""; elDesc.innerHTML = gMsgStatDesc[k] ?? "";
                }
                msg.myst.innerHTML = $EquSkillDesc(mMyst);
                msg.free.innerHTML = gMsgData[$MsgNameEditPointFree]; msg.used.innerHTML = gMsgData[$MsgNameEditPointUsed];
                msg.max.innerHTML = gMsgData[$MsgNameEditPointMax]; // msg.commit.textContent = gMsgData[$MsgNameEditCommit];
            }
        }
        
        {
            const msgs = pAura.msgs, P = LYT_FYG.Auras;

            msgs.feedName.innerHTML = gMsgData[$MsgNameEnlight]; msgs.feedDesc.innerHTML = gMsgData[$MsgDescEnlight];
            msgs.h3Prefix.textContent = gMsgData[$MsgPreAuraH3]; msgs.h3Middle.textContent = gMsgData[$MsgMidAuraH3]; msgs.h3Suffix.textContent = gMsgData[$MsgSufAuraH3];
            msgs.pointPrefix.textContent = gMsgData[$MsgPreAuraPoint]; msgs.pointSuffix.textContent = gMsgData[$MsgSufAuraPoint];
            msgs.skillPrefix.textContent = gMsgData[$MsgPreSkill]; msgs.skillSuffix.textContent = gMsgData[$MsgSufSkill];

            for (const kinds of LYT_EQUIP.Auras) {
                for (const kind of kinds) {
                    const data = pAura[kind], k = P[kind];
                    if (!data) { continue; }
                    data.name.textContent = $EquSkillName(k);
                    data.desc.innerHTML = $EquSkillDesc(k);
                    data.badge.firstChild.textContent = gMsgData[$MsgPreAuraCost];
                    data.badge.lastChild.textContent = gMsgData[$MsgSufAuraCost];
                }
            }
        }
        
        {
            const mA = pGem.mA, mB = pGem.mB, mC = pGem.mC;
            mA.name.firstChild.textContent = gMsgData[$MsgNameCraft]; mA.desc.innerHTML = gMsgData[$MsgDescCraft]; // mA.usual.innerHTML = gMsgData[$MsgNameCraftUsual]; mA.force.innerHTML = gMsgData[$MsgNameCraftSuper];
            mB.name.firstChild.textContent = gMsgData[$MsgNameSpawn]; mB.desc.innerHTML = gMsgData[$MsgDescSpawn]; // mB.usual.innerHTML = gMsgData[$MsgNameSpawnUsual]; mB.force.innerHTML = gMsgData[$MsgNameSpawnSuper];
            mC.name.firstChild.textContent = gMsgData[$MsgNameAmass]; mC.desc.innerHTML = gMsgData[$MsgDescAmass]; 
            for (const kind of LYT_EQUIP.Gems) {
                mC[kind].textContent = gMsgGemName[kind] ?? kind;
            }
        }
            
        for (const el of elFight.M) { el.onload(); }
        for (const el of elCarry.M) { el.onload(); }
        for (const el of elActor.M) { el.onload(); }
        for (const el of elEquip.M) { el.onload(); }
        for (const el of elFruit.M) { el.onload(); }
        for (const el of elActor_.M) { el.onload(); }
        for (const el of elEquip_.M) { el.onload(); }
        for (const el of elFruit_.M) { el.onload(); }
        elCrf.forEach(el => el.onload());
        elSpw.forEach(el => el.onload());
        elAms.forEach(el => el.onload());
        for (const el of elAuraDraw.children) { el.onload(); }
    }

    elManual.onload = () => {
        elManual[0].innerHTML = gMsgData[$MsgNameManual];
    };

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Initialization *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    uiReset();
    elActor.M.forEach((el, i) => { el.ondblclick = uiFocusSet; el.i = i; });
    elFight.M.forEach((el, i) => { el.ondblclick = uiFocusSet; el.i = 0; });
    elCrf.forEach(e => { e.cb(_crf); });
    elSpw.forEach(e => { e.cb(_spw); });
    elAms.forEach(e => { e.cb(_ams); });
    eSvcRoot.append(elBody, elManual);

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Exports *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    Client[$CoEquipReset] = uiReset;
    Client[$CoEquipInit] = (
        bst, pst, est, le, lf,
        crf, spw, ams,
        acExp, acElt, 
        ecFrgCost, ecFrgMul, ecFrgCap,
        fcFrgCost, fcFrgMul, fcFrgCap, 
        zc
    ) => {
        BST = bst; PST = pst; EST = est; LE = le;
        uiAmulMax(lf);
        uiFocusEval();

        uiCrfShow(crf); uiSpwShow(spw); uiAmsShow(ams);
        mAcExp = acExp; mAcElt = acElt; 
        mEcFrgCost = ecFrgCost, mEcFrgMul = ecFrgMul; mEcFrgCap = ecFrgCap;
        mFcFrgCost = fcFrgCost, mFcFrgMul = fcFrgMul; mFcFrgCap = fcFrgCap;
        uiAuraCostSet(zc);
        uiAuraPointSet(elFocus?.F ?? 0);
    };
    Client[$CoEquipGem] = uiGemSet;
    Client[$CoEquipAcc] = d => {
        const E = elEquip.M, F = elFruit.M;
        for (const i in d) {
            const u = d[i];
            if (!u) { continue; }
            for (const i of u.equip) { const el = E[i]; if (el) { el.show(!1); } }
            for (const i of u.fruit) { const el = F[i]; if (el) { el.show(!1); } }
        }
        uiBackSet(elActor, d); uiFocusEval();
        uiActorSize(elActor.children.length, "／", elActor.N);
    };
    Client[$CoEquipAcd] = d => {
        const E = elEquip.M, F = elFruit.M;
        for (const i of d) {
            const u = elActor.M[i];
            if (!u) { continue; }
            for (const i of u.equip) { const el = E[i]; if (el) { el.show(!0); } }
            for (const i of u.fruit) { const el = F[i]; if (el) { el.show(!0); } }
        }
        uiBackDel(elActor, d); uiFocusEval();
        uiActorSize(elActor.children.length, "／", elActor.N);
    };
    Client[$CoEquipEcc] = d => {
        uiBackSet(elEquip, d); uiFocusEval();
        uiEquipSize(elEquip.children.length, "／", elEquip.N);
    };
    Client[$CoEquipEcd] = d => {
        uiBackDel(elEquip, d); uiFocusEval();
        uiEquipSize(elEquip.children.length, "／", elEquip.N);
    };
    Client[$CoEquipFcc] = d => {
        uiBackSet(elFruit, d); uiFocusEval();
        uiFruitSize(elFruit.children.length, "／", elFruit.N);
    };
    Client[$CoEquipFcd] = d => {
        uiBackDel(elFruit, d); uiFocusEval();
        uiFruitSize(elFruit.children.length, "／", elFruit.N);
    };
    Client[$CoEquipUsr] = () => {
        const 
            {grade, actor, equip, fruit, craft, spawn, amass} = gUser,
            pa = pGem.nA, pb = pGem.nB, pc = pGem.nC
        ;
        mGrade = grade;
        uiBackSlotSet(elActor, actor); uiActorSize(elActor.children.length, "／", actor);
        uiBackSlotSet(elEquip, equip); uiEquipSize(elEquip.children.length, "／", equip);
        uiBackSlotSet(elFruit, fruit); uiFruitSize(elFruit.children.length, "／", fruit);
        pa.val.textContent = uiNumCast(craft)+"%"; pa.bar.set(craft);
        pb.val.textContent = uiNumCast(spawn)+"%"; pb.bar.set(spawn);
        pc.val.textContent = uiNumCast(amass)+"%"; pc.bar.set(amass);
        uiItemSet(gUser);
    };
    Client[$CoEquipGrow] = n => {
        const AM = elActor.M, FM = elFight.M;
        mFight.forEach((k, i) => { AM[k].G += n; FM[i].G += n; });
    };
    Client[$CoEquipFight] = a => {
        const D = elFight.M, S = elActor.M;
        uiBackShow(elActor, mFight, !0);
        uiBackShow(elActor, mFight = a, 0);
        uiFrontSet(elFight, a.map((i, x) => S[D[x].i = i]));
    };
    Client[$CoEquipAura] = a => {
        const l = a.length;
        for (let i = 0; i < l; i++) {
            const el = elAuraDraw[i];
            if (!el) { break; }
            el.num(uiNumFix2(a[i]), !0);
        }
        for (let i = l; i < 256; i++) { elAuraDraw[i].num(0); }
        Client[$CoSysModal]($MsgHintAcElt, elAuraDraw);
    };
    Client[$CoEquipView] = uiViewMode;
    Client[$CoEquipEdit] = uiEditMode;

})();

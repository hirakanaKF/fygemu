/*
Project: fygemu
Authors: hirakana@kf
*/

(() => {

    let 
        elFocus, mBackup = {}, mCommit = {}, mAvatar, mFight = [], mAmul = {}, mSkill = 0, mAmass, // Focus
        mGrade, BST = [], EST = {}, LE = {}, LB = 0, // Status and limits
        mAcExp = {}, mAcElt = {},
        mFcFrgCost = {}, mFcFrgMul = {}, mFcFrgCap = 0 // Fruit
    ;

    const 

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

        // Front
        elWears = uiFront(6, uiWear),
        elFight = uiFront(6, uiActor),
        elCarry = uiFront(20, uiFruit),

        // Back
        elItem = uiItems(LYT_EQUIP.Items),
        elActor = uiBack(512, uiActor),
        elEquip = uiBack(512, uiEquip),
        elFruit = uiBack(512, uiFruit),

        // Dummy
        elDummy = uiActor(),

        // Manual
        elManual = uiPanel4({root: {tag: "div", classList: "fyg_equip row"}, panel: {tag: "div", classList: "panel panel-info"}}),

        pOp = {},

        // Set editor focus
        uiAvatar = (K) => {
            mAvatar = K = K ?? 0;
            elStatusName.innerHTML = gMsgActorName[K] ?? K;
            elStatusImg.src = gUsrPath(RES_CH, K, "N");
            elStatusArts.set(K);
            elEditorImg.src = gUsrPath(RES_CH, K, "C"); 
            pEdit.msgs.name.innerHTML = gMsgActorName[mAvatar] ?? "";
            pEdit.msgs.arts.set(mAvatar);
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

        // 
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
            const q = uiNumber((+d || 0) * 100), p = q * 0.01, m = mAcElt.Cap ?? 0;
            pAura.attr.h1Point.innerHTML = pAura.attr.point.textContent = p+"%／"+m+"%";
            pAura.attr.prog.set(q / m || 0);
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

        uiBackupStat = e => {
            const p = mBackup[e.i] ??= {};
            p.str ??= e.str; p.agi ??= e.agi; p.int ??= e.int;
            p.vit ??= e.vit; p.spr ??= e.spr; p.mnd ??= e.mnd;
        },

        uiCommitStat = e => {
            const p = mCommit[e.i] ??= {};
            p.str = e.str; p.agi = e.agi; p.int = e.int;
            p.vit = e.vit; p.spr = e.spr; p.mnd = e.mnd;
        },

        uiFocusEval = () => {
            if (!elFocus) { return; }

            const {L, Q, S, B, F, G, p, str, agi, int, vit, spr, mnd, auras, equip, fruit} = elFocus, EM = elEquip.M, FM = elFruit.M;

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
                pe.str.value = str; pe.agi.value = agi; pe.int.value = int;
                pe.vit.value = vit; pe.spr.value = spr; pe.mnd.value = mnd;
                pe.max.innerHTML = uiNumCast(p);
                {
                    const 
                        n = str + agi + int + vit + spr + mnd, r = p ? 100 / p : 0;
                    ;
                    pe.used.innerHTML = uiNumCast(n);
                    pe.free.innerHTML = uiNumCast(p - n);
                    pe.str.n = str; pe.strp.set(str * r);
                    pe.agi.n = agi; pe.agip.set(agi * r);
                    pe.int.n = int; pe.intp.set(int * r);
                    pe.vit.n = vit; pe.vitp.set(vit * r);
                    pe.spr.n = spr; pe.sprp.set(spr * r);
                    pe.mnd.n = mnd; pe.mndp.set(mnd * r);
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

                //
                // Evaluate status
                //

                // Actor
                const 
                    X = {L: L},
                    C = {
                        str: Math.pow(+uiNumCast(str + (mAmul.str ?? 0)), LB),
                        agi: Math.pow(+uiNumCast(agi + (mAmul.agi ?? 0)), LB), 
                        int: Math.pow(+uiNumCast(int + (mAmul.int ?? 0)), LB),
                        vit: Math.pow(+uiNumCast(vit + (mAmul.vit ?? 0)), LB), 
                        spr: Math.pow(+uiNumCast(spr + (mAmul.spr ?? 0)), LB), 
                        mnd: Math.pow(+uiNumCast(mnd + (mAmul.mnd ?? 0)), LB),
                        L: Math.pow(mGrade, LB), "": -1
                    }, 
                    P1 = {}, P2 = {},
                    ESM = EST.Mul ?? {}, ESA = EST.Add ?? {}
                ;
                
                for (const k in pStatusRef) { X[k] = 0; }

                BST.forEach(R => {
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
                    for (const l in A) { X[l] = (X[l] ?? 0) + +uiNumFix2(A[l] * x); }
                }
                for (const k in P2) {
                    const x = C[k], A = P2[k];
                    for (const l in A) {
                        const Al = A[l], x2 = (C[l] ?? 0) * x;
                        for (const m in Al) { X[m] = (X[m] ?? 0) + +uiNumFix2(Al[m] * x2); }
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
            if (Client[$CoSysPay](this.p, n)) { Server[$SoEcCrf](A, this.i); }
        },

        uiSpwShow = d => {
            for (const el of elSpw) { el.clr(); }
            d.forEach((t, i) => { elSpw[i].dt(i, {Gain: {[`Lv${i}`]: 0}, Cost: t}); elSpw[i].open(!0); });
        },

        _spw = function () {
            const n = +this.n, A = uiBackAlloc(elActor, n);
            if (A.length != n) { return; }
            if (Client[$CoSysPay](this.p, n)) { Server[$SoAcSpw](A, this.i); }
        },

        uiAmsShow = d => {
            for (const el of elAms) { el.clr(); }
            d.forEach((t, i) => { elAms[i].dt(i, {Gain: {[`Lv${i}`]: 0}, Cost: t}); elAms[i].open(!0); });
        },

        _ams = function () {
            const n = +this.n;
            if (mAmass && Client[$CoSysPay](this.p, n)) { Server[$SoGcMine](this.i, mAmass, n); }
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

            Server[$SoAcSet](mCommit, {
                $CbResolved: () => {
                    mBackup = {}; mCommit = {};
                },
                $CbRejected: () => {
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
                    mBackup = {}; mCommit = {};
                },
            });
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
            BST = [], EST = {}, LE = {};
            uiItemClr();
            uiFrontClr(elWears); uiFrontClr(elFight); uiFrontClr(elCarry);
            uiBackClr(elActor); uiBackClr(elEquip); uiBackClr(elFruit);
            uiStatsClr(); uiStatsSet(USR.Stats);
            uiAvatar(USR.Avatar); uiItemSet(USR.Item);
            uiFrontSlotSet(elWears, USR.WearsSlot); uiFrontSet(elWears, USR.Wear);
            uiFrontSlotSet(elFight, USR.FightSlot); uiBackSet(elFight, USR.Fight);
            uiFrontSlotSet(elCarry, USR.CarrySlot); uiBackSet(elCarry, USR.Back);
            uiBackSlotSet(elActor, USR.ActorSlot); uiBackSet(elActor, USR.Actor);
            uiBackSlotSet(elEquip, USR.EquipSlot); uiBackSet(elEquip, USR.Equip);
            uiBackSlotSet(elFruit, USR.FruitSlot); uiBackSet(elFruit, USR.Fruit);
            uiAmulSet(USR.Amulet), uiAmulMax(USR.AmuletMax);
            uiGemSetText(USR.Gem);
            uiCrfShow(USR.Craft.Item ?? []);
            uiSpwShow(USR.Spawn.Item ?? []);
            uiAmsShow(USR.Amass.Item ?? []);
            uiViewMode();
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
        const C = elStatusEdit.classList, p = "btn-warning";
        if (C.contains(p)) {
            C.remove(p); uiViewMode();
            return;
        }
        C.add(p); uiEditMode();
    };
    elStatusName.style = "font-size:42px;"; elStatusLevel.classList = "pull-right"; elStatusLevel.append("", " ", elStatusLevelText, " ", "");
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
                elStock = document.createElement("div"),
                elStockHead = document.createElement("p"),
                elStockName = document.createElement("span"),
                elEquipDiv = document.createElement("div"),
                elEquipWear = document.createElement("button"),
                elEquipSmelt = document.createElement("button"),
                elEquipBreak = document.createElement("button"),
                elEquipSortDiv = document.createElement("span"),
                elEquipSort = document.createElement("select"),
                elFruitDiv = document.createElement("div"),
                elFruitWear = document.createElement("button"),
                elFruitForge = document.createElement("button"),
                elFruitBreak = document.createElement("button"),
                elFruitSortDiv = document.createElement("div"),
                elFruitSort = document.createElement("select"),
                // elStockFoot = document.createElement("div"),
                elCarryMain = document.createElement("div"),
                elCarryHead = document.createElement("p"),
                elCarryName = document.createElement("span"),
                elAmulet = document.createElement("div"),
                elAmuletHead = document.createElement("div"),
                elAmuletName = document.createElement("div"),
                elAmuletMain = document.createElement("div")
            ;
            pEquip.append(elStock, elCarryMain, elAmulet);
            elStock.classList = "alert alert-success"; elStock.append(elStockHead, elEquipDiv, document.createElement("hr"), elItem, elEquip); // , document.createElement("hr"), elStockFoot);
            elStockHead.classList = "fyg_tr"; elStockHead.append(elStockName);
            elStockName.classList = "fyg_f24"; // elStockFoot.classList = "fyg_lh40 fyg_tc text-gray";
            elEquipDiv.classList = "col-xs-12 fyg_mp3"; elEquipDiv.append(elEquipWear, elEquipSmelt, elEquipBreak, elEquipSortDiv);
            elEquipWear.classList = "col-xs-12 col-md-2 btn btn-success fyg_mp8"; elEquipWear.onclick = () => {
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
            elEquipSmelt.classList = "col-xs-12 col-md-2 btn btn-warning fyg_mp8"; elEquipSmelt.onclick = () => {
                const A = uiCardQuery(elEquip), T = {};
                if (!A.length) { return; }
                const B = uiBackAlloc(elFruit, A.length);
                if (B.length != A.length) { return; }
                B.forEach((k, i) => T[A[i]] = k);
                Server[$SoEcSml](T);
            };
            elEquipBreak.classList = "col-xs-12 col-md-2 btn btn-danger fyg_mp8"; elEquipBreak.onclick = () => {
                const A = uiCardQuery(elEquip);
                if (A.length) { Server[$SoEcBrk](A); }
            };
            elEquipSortDiv.classList = "col-xs-12 col-md-4 fyg_fr fyg_nw";
            elEquipSortDiv.append("", elEquipSort);
            elEquipSort.classList = "col-xs-8 fyg_fr";
            elEquipSort.append(...LYT_EQUIP.Sort.map(k => {
                const el = document.createElement("option");
                el.value = k;
                return el;
            }));
            elEquipSort.onchange = () => {
                elEquip.F = uiSortTbl[elEquipSort.value] ?? elEquip.F;
                uiCardSort(elEquip);
            };
            elFruitDiv.classList = "col-xs-12 fyg_mp3"; elFruitDiv.append(elFruitWear, elFruitForge, elFruitBreak, elFruitSortDiv);
            elFruitWear.classList = "col-xs-12 col-md-2 btn btn-success fyg_mp8"; elFruitWear.onclick = () => {
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
            elFruitForge.classList = "col-xs-12 col-md-2 btn btn-warning fyg_mp8"; elFruitForge.onclick = () => {
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
                if (A.length && Client[$CoSysPay](mFcFrgCost, m)) { Server[$SoFcFrg](A, m); }
            };
            elFruitBreak.classList = "col-xs-12 col-md-2 btn btn-danger fyg_mp8"; elFruitBreak.onclick = () => {
                const A = uiCardQuery(elFruit);
                if (A.length) { Server[$SoFcBrk](A); }
            };
            elFruitSortDiv.classList = "col-xs-12 col-md-4 fyg_fr fyg_nw";
            elFruitSortDiv.append("", elFruitSort);
            elFruitSort.classList = "col-xs-8 fyg_fr";
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
            elCarryMain.classList = "alert alert-danger"; elCarryMain.append(elCarryHead, elFruitDiv, document.createElement("hr"), elCarry, elFruit);
            elCarryHead.classList = "fyg_tr"; elCarryHead.append(elCarryName);
            elCarryName.classList = "fyg_f24"; 
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
            elStock.name = elStockName; elCarryMain.name = elCarryName; elAmulet.name = elAmuletName;
            pOp.ecWear = elEquipWear; pOp.ecSml = elEquipSmelt; pOp.ecBrk = elEquipBreak; pOp.ecSort = elEquipSortDiv;
            pOp.fcWear = elFruitWear; pOp.fcFrg = elFruitForge; pOp.fcBrk = elFruitBreak; pOp.fcSort = elFruitSortDiv;
        }

        // Cards
        {
            const
                elActorMain = document.createElement("div"),
                elActorHead = document.createElement("p"),
                elActorName = document.createElement("span"),
                elActorDiv = document.createElement("div"),
                elActorWear = document.createElement("button"),
                elActorBreak = document.createElement("button"),
                elActorSortDiv = document.createElement("span"),
                elActorSort = document.createElement("select"),
                // elActorFoot = document.createElement("div"),
                elFightMain = document.createElement("div"),
                elFightHead = document.createElement("p"),
                elFightName = document.createElement("span")
            ;
            pActor.append(elActorMain, elFightMain);
            elActorMain.classList = "alert alert-info"; elActorMain.append(elActorHead, elActorDiv, document.createElement("hr"), elActor);
            elActorHead.classList = "fyg_tr"; elActorHead.append(elActorName);
            elActorName.classList = "fyg_f24"; // elActorFoot.classList = "fyg_lh40 fyg_tc text-gray";
            elActorDiv.classList = "col-xs-12 fyg_mp3"; elActorDiv.append(elActorWear, elActorBreak, elActorSortDiv);
            elActorWear.classList = "col-xs-12 col-md-2 btn btn-success fyg_mp8"; elActorWear.onclick = () => {
                const A = uiCardQuery(elActor);
                if (A.length) {
                    Server[$SoAcFgt](A);
                    A.forEach(i => uiCardChk(elActor.M[i]));
                }
            };
            elActorBreak.classList = "col-xs-12 col-md-2 btn btn-danger fyg_mp8"; elActorBreak.onclick = () => {
                const A = uiCardQuery(elActor);
                if (A.length) { Server[$SoAcBrk](A); }
            };
            elActorSortDiv.classList = "col-xs-12 col-md-4 fyg_fr fyg_nw";
            elActorSortDiv.append("", elActorSort);
            elActorSort.classList = "col-xs-8 fyg_fr";
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
            elFightMain.classList = "alert alert-primary"; elFightMain.append(elFightHead, document.createElement("hr"), elFight);
            elFightHead.classList = "fyg_tr"; elFightHead.append(elFightName);
            elFightName.classList = "fyg_f24";
            elActorMain.name = elActorName; elFightMain.name = elFightName; 
            pOp.acWear = elActorWear; pOp.acBrk = elActorBreak; pOp.acSort = elActorSortDiv;
        }

        // Auras
        {
            const 
                feed = uiTipTop4({root: {classList: "col-xs-12 tip-top", style: "height: 4rem; border: medium none;"}, inner: {classList: "tooltip-inner", style: "max-width: 100%"}}),
                prog = uiProgBar({prog: {classList: "progress", style: "height:2.8rem;border: solid #EF8D7A 0.2rem;padding:0.2rem;background-color:#F8CEC6;"}, bar: {classList: "progress-bar progress-bar-danger", role: "progressbar"}}),
                main = document.createElement("div"),

                h1Point = document.createElement("h1"),
                feedBtn = document.createElement("button"),
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

            pAura.append(feed, h1Point, prog, document.createElement("hr"), info);

            feed.append(feedBtn); feedBtn.classList = "btn btn-success col-xs-12"; 
            feedBtn.onclick = () => {
                if (elFocus && Client[$CoSysPay](mAcElt.Cost, 1)) { Server[$SoAcElt](elFocus.i, 1); }
            };
            info.classList = "alert alert-info"; info.append(h3Info);
            h3Info.append(h3Prefix, pointPrefix, " ", point, " ", pointSuffix, h3Middle, skillPrefix, " ", skill, " ", skillSuffix, h3Suffix);
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
                        cost = document.createTextNode(""+(LYT_EQUIP.AuraCost[kind] || 0))
                    ;

                    panel.onclick = () => {
                        (mBackup[elFocus.i] ??= {}).aura ??= elFocus.aura;
                        mAuras.delete(+kind) ? panel.classList.remove("btn-primary") : (mAuras.size < mSkill) && mAuras.add(+kind) && panel.classList.add("btn-primary");
                        (mCommit[elFocus.i] ??= {}).aura = [...mAuras];
                    };
                    panel.classList = "btn tip-top"; panel.style = "padding:1rem; margin: 1rem; width: 100%;";
                    icon.classList = "icon icon-bookmark-empty";
                    badge.classList = "label label-badge";

                    root.append(panel);
                    panel.append(icon, " ", name, " ", badge);
                    badge.append("", " ", cost, " ", "");

                    pAura[kind] = {panel: panel, name: name, desc: panel.inner, badge: badge};
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
                forge = uiPanel3({head: {tag: "div", classList: "panel-heading css-debug"}, body: [{tag: "div", classList: "panel-body", style: "100%;margin:10px 0;background-color:#ffffff;"}]}),
                spawn = uiPanel3({head: {tag: "div", classList: "panel-heading css-debug"}, body: [{tag: "div", classList: "panel-body", style: "100%;margin:10px 0;background-color:#ffffff;"}]}),
                amass = uiPanel3({head: {tag: "div", classList: "panel-heading css-debug"}, body: [{tag: "div", classList: "panel-body", style: "100%;margin:10px 0;background-color:#ffffff;"}]}),
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
            // forgeDown.append(document.createElement("hr"), forgeProg); 
            // forgeLeft.append(forgeBtnL); forgeRight.append(forgeBtnR); 
            //forgeBtnL.classList = "btn btn-success"; forgeBtnR.classList = "btn btn-info"; forgeBtnL.append(forgeUsual); forgeBtnR.append(forgeForce);
            forgeName.classList = "fyg_f24"; forgeName.append("", " （", forgeVal, "）");
            // forgeUsual.classList = "icon"; forgeForce.classList = "icon icon-diamond";
            // forgeBtnL.onclick = () => Server[$SoEcCrf](1); 
            // forgeBtnR.onclick = () => Server[$SoEcCrf](2);

            spawnRow.append(spawnHead, spawnMisc, spawnLeft, spawnRight, spawnDown);
            spawnHead.classList = "col-sm-4"; spawnMisc.classList = "col-sm-8 fyg_tr";
            spawnLeft.classList = "col-sm-6 fyg_fl fyg_tl"; spawnRight.classList = "col-sm-6 fyg_fr fyg_tr"; spawnDown.classList = "col-sm-12";
            spawnHead.append(spawnName); spawnMisc.append(spawnDesc); spawnHead.style = "min-height: 5rem;"; spawnMisc.style = "min-height: 5rem;"; 
            spawnDown.append(document.createElement("hr"), ...elSpw);
            // spawnDown.append(document.createElement("hr"), spawnProg);
            // spawnLeft.append(spawnBtnL); spawnRight.append(spawnBtnR);
            // spawnBtnL.classList = "btn btn-success"; spawnBtnR.classList = "btn btn-info"; spawnBtnL.append(spawnUsual); spawnBtnR.append(spawnForce);
            spawnName.classList = "fyg_f24"; spawnName.append("", " （", spawnVal, "）");
            // spawnUsual.classList = "icon"; spawnForce.classList = "icon icon-diamond";
            // spawnBtnL.onclick = () => Server[$SoAcSpw](0); 
            // spawnBtnR.onclick = () => Server[$SoAcSpw](1);

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
                    for (const el of amassMain.children) { el.classList.remove("btn-success"); }
                    btn.classList.add("btn-success");
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
                elLevelL = document.createElement("div"), elLevelR = document.createElement("div"), 
                elExp = uiTipTop4({root: {classList: "col-xs-12 tip-top", style: "border: none;"}, inner: {classList: "tooltip-inner", style: "max-width: 100%"}}),
                elFeed = uiTipTop4({root: {classList: "col-xs-12 input-group tip-top", style: "display: table;"}, inner: {classList: "tooltip-inner", style: "max-width: 100%"}}),
                elPoints = document.createElement("div"),
                elInputs = document.createElement("div"),

                elStrL = document.createElement("div"), elStrR = document.createElement("div"),
                elAgiL = document.createElement("div"), elAgiR = document.createElement("div"),
                elIntL = document.createElement("div"), elIntR = document.createElement("div"),
                elVitL = document.createElement("div"), elVitR = document.createElement("div"),
                elSprL = document.createElement("div"), elSprR = document.createElement("div"),
                elMndL = document.createElement("div"), elMndR = document.createElement("div"),
                elStrG = uiTipTop4({root: {classList: "input-group tip-top", style: "display: table;"}, inner: {classList: "tooltip-inner", style: "max-width: 100%"}}),
                elAgiG = uiTipTop4({root: {classList: "input-group tip-top", style: "display: table;"}, inner: {classList: "tooltip-inner", style: "max-width: 100%"}}),
                elIntG = uiTipTop4({root: {classList: "input-group tip-top", style: "display: table;"}, inner: {classList: "tooltip-inner", style: "max-width: 100%"}}),
                elVitG = uiTipTop4({root: {classList: "input-group tip-top", style: "display: table;"}, inner: {classList: "tooltip-inner", style: "max-width: 100%"}}),
                elSprG = uiTipTop4({root: {classList: "input-group tip-top", style: "display: table;"}, inner: {classList: "tooltip-inner", style: "max-width: 100%"}}),
                elMndG = uiTipTop4({root: {classList: "input-group tip-top", style: "display: table;"}, inner: {classList: "tooltip-inner", style: "max-width: 100%"}}),

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
                elStrNum = document.createElement("input"), elStrProg = uiProgBar({}), elStrName = document.createElement("span"),
                elAgiNum = document.createElement("input"), elAgiProg = uiProgBar({}),elAgiName = document.createElement("span"),
                elIntNum = document.createElement("input"), elIntProg = uiProgBar({}), elIntName = document.createElement("span"),
                elVitNum = document.createElement("input"), elVitProg = uiProgBar({}), elVitName = document.createElement("span"),
                elSprNum = document.createElement("input"), elSprProg = uiProgBar({}), elSprName = document.createElement("span"),
                elMndNum = document.createElement("input"), elMndProg = uiProgBar({}), elMndName = document.createElement("span")
                // elCommit = document.createElement("button"), elCommitIcon = document.createElement("i")
            ;

            pEdit.append(elRoot); // elRoot.style.display = "none";
            elRoot.append(elEditorImg, elInfo, elArts, elLevel, elValue, elSkill, elBuild, elGrowth, elPoints, elInputs); //, elCommit);
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
                    m = Math.min(mGrade, mAcExp.Cap) - elFocus.L,
                    n = Math.min(m * m, +elFeedNum.value || 0)
                ;
                elFeedNum.value = n;
            };
            elFeedBtn.onclick = () => {
                const 
                    m = Math.min(mGrade, mAcExp.Cap) - elFocus.L,
                    n = Math.min(m * m, +elFeedNum.value || 0),
                    c = mAcExp.Cost
                ;
                if (n > 0 && c && Client[$CoSysPay](c, n)) { Server[$SoAcExp](elFocus.i, n) }
                elFeedNum.value = 0;
            };
            elInputs.classList = "row"; elInputs.append(elStrL, elStrR, elAgiL, elAgiR, elIntL, elIntR, elVitL, elVitR, elSprL, elSprR, elMndL, elMndR);
            elStrL.classList = elAgiL.classList = elIntL.classList = elVitL.classList = elSprL.classList = elMndL.classList = "col-xs-12 col-md-3";
            elStrR.classList = elAgiR.classList = elIntR.classList = elVitR.classList = elSprR.classList = elMndR.classList = "col-xs-12 col-md-9";
            elStrL.append(elStrG); elStrR.append(elStrProg); elStrG.append(elStrNum, elStrName);
            elStrNum.classList = "form-control"; elStrName.classList = "input-group-addon";
            elAgiL.append(elAgiG); elAgiR.append(elAgiProg); elAgiG.append(elAgiNum, elAgiName);
            elAgiNum.classList = "form-control"; elAgiName.classList = "input-group-addon";
            elIntL.append(elIntG); elIntR.append(elIntProg); elIntG.append(elIntNum, elIntName);
            elIntNum.classList = "form-control"; elIntName.classList = "input-group-addon";
            elVitL.append(elVitG); elVitR.append(elVitProg); elVitG.append(elVitNum, elVitName);
            elVitNum.classList = "form-control"; elVitName.classList = "input-group-addon";
            elSprL.append(elSprG); elSprR.append(elSprProg); elSprG.append(elSprNum, elSprName);
            elSprNum.classList = "form-control"; elSprName.classList = "input-group-addon";
            elMndL.append(elMndG); elMndR.append(elMndProg); elMndG.append(elMndNum, elMndName);
            elMndNum.classList = "form-control"; elMndName.classList = "input-group-addon";
            // elCommit.classList = "btn btn-block btn-lg btn-warning"; elCommit.type = "button";
            // elCommit.append(elCommitIcon, " ", "");
            // elCommitIcon.classList = "icon icon-edit icon-2x";
            
            elStrNum.prog = elStrProg; elAgiNum.prog = elAgiProg; elIntNum.prog = elIntProg;
            elVitNum.prog = elVitProg; elSprNum.prog = elSprProg; elMndNum.prog = elMndProg;

            elStrNum.onblur = function () { if (elFocus) { uiBackupStat(elFocus); elFocus.str = +this.value || 0; uiCommitStat(elFocus); uiFocusEval(); }};
            elAgiNum.onblur = function () { if (elFocus) { uiBackupStat(elFocus); elFocus.agi = +this.value || 0; uiCommitStat(elFocus); uiFocusEval(); }};
            elIntNum.onblur = function () { if (elFocus) { uiBackupStat(elFocus); elFocus.int = +this.value || 0; uiCommitStat(elFocus); uiFocusEval(); }};
            elVitNum.onblur = function () { if (elFocus) { uiBackupStat(elFocus); elFocus.vit = +this.value || 0; uiCommitStat(elFocus); uiFocusEval(); }};
            elSprNum.onblur = function () { if (elFocus) { uiBackupStat(elFocus); elFocus.spr = +this.value || 0; uiCommitStat(elFocus); uiFocusEval(); }};
            elMndNum.onblur = function () { if (elFocus) { uiBackupStat(elFocus); elFocus.mnd = +this.value || 0; uiCommitStat(elFocus); uiFocusEval(); }};

            pEdit.attr = {
                level: elLevelNum, exp: elExp.inner, bar: elExpBar, value: elValueNum, skill: elSkillNum, build: elBuildNum, growth: elGrowthNum,
                str: elStrNum, agi: elAgiNum, int: elIntNum, vit: elVitNum, spr: elSprNum, mnd: elMndNum,
                strp: elStrProg, agip: elAgiProg, intp: elIntProg, vitp: elVitProg, sprp: elSprProg, mndp: elMndProg,
                free: elPointFreeNum, max: elPointMaxNum, used: elPointUsedNum
            };
            pEdit.msgs = {
                name: elName, arts: elArts,
                levelName: elLevelName, valueName: elValueName, skillName: elSkillName, buildName: elBuildName, growthName: elGrowthName, feedName: elFeedBtn,
                levelDesc: elLevelDesc, valueDesc: elValueDesc, skillDesc: elSkillDesc, buildDesc: elBuildDesc, growthDesc: elGrowthDesc, feedDesc: elFeed.inner,
                strName: elStrName, agiName: elAgiName, intName: elIntName, vitName: elVitName, sprName: elSprName, mndName: elMndName,
                strDesc: elStrG.inner, agiDesc: elAgiG.inner, intDesc: elIntG.inner, vitDesc: elVitG.inner, sprDesc: elSprG.inner, mndDesc: elMndG.inner,
                free: elPointFree, max: elPointMax, used: elPointUsed //, commit: elCommit.lastChild
            };

        }
    }

    // Manual
    elManual[1].innerHTML = ``; // `1。卡片级别通过沙滩掉落的经验球升级，每级获得3点可分配属性，在“我的属性”页面分配。<br>`;

    elBody.onload = () => {
        const navi = elEditor[1].children;

        elStatusName.innerHTML = gMsgActorName[mAvatar] || mAvatar;
        elStatusLevel.firstChild.textContent = gMsgPanelPrefix.Level;
        elStatusLevel.lastChild.textContent = gMsgPanelSuffix.Level;
        elStatusArts.set(mAvatar);
        for (const el of elWears.children) { el.onload(); }
        for (const el of elStatusAttrs.children) { el.onload(); }

        navi[0].firstChild.innerHTML = gMsgPanelName.Equip;
        navi[1].firstChild.innerHTML = gMsgPanelName.Card;
        navi[2].firstChild.innerHTML = gMsgPanelName.Gems;
        navi[3].firstChild.innerHTML = gMsgPanelName.Card;
        navi[4].firstChild.innerHTML = gMsgPanelName.Aura;

        {
            const 
                [elStock, elCarryMain, elAmulet] = pEquip.children, [elActorMain, elFightMain] = pActor.children,
                elAcSort = pOp.acSort, elEcSort = pOp.ecSort, elFcSort = pOp.fcSort
            ;
            elStock.name.innerHTML = gMsgPanelName.EquipStock;
            pOp.acWear.innerHTML = pOp.ecWear.innerHTML = pOp.fcWear.innerHTML = gMsgPanelName.EquipSet;
            pOp.ecSml.innerHTML = gMsgPanelName.EquipSmelt;
            pOp.fcFrg.innerHTML = gMsgPanelName.EquipForge;
            pOp.acBrk.innerHTML = pOp.ecBrk.innerHTML = pOp.fcBrk.innerHTML = gMsgPanelName.EquipBreak;
            elAcSort.firstChild.textContent = gMsgPanelName.Sort;
            for (const el of elAcSort.lastChild.children) { el.innerHTML = gMsgPanelName[el.value] ?? el.value; }
            elEcSort.firstChild.textContent = gMsgPanelName.Sort;
            for (const el of elEcSort.lastChild.children) { el.innerHTML = gMsgPanelName[el.value] ?? el.value; }
            elFcSort.firstChild.textContent = gMsgPanelName.Sort;
            for (const el of elFcSort.lastChild.children) { el.innerHTML = gMsgPanelName[el.value] ?? el.value; }
            elCarryMain.name.innerHTML = gMsgPanelName.EquipBack;
            elAmulet.name.innerHTML = gMsgPanelName.EquipAmulet;
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
                msg.feedName.innerHTML = gMsgPanelName.EditFeed; msg.feedDesc.innerHTML = gMsgPanelDesc.EditFeed;
                msg.levelName.innerHTML = gMsgPanelName.EditLevel; msg.valueName.innerHTML = gMsgPanelName.EditTrait; msg.skillName.innerHTML = gMsgPanelName.EditSkill; msg.buildName.innerHTML = gMsgPanelName.EditBuild; msg.growthName.innerHTML = gMsgPanelName.EditGrowth;
                msg.levelDesc.innerHTML = gMsgPanelDesc.EditLevel; msg.valueDesc.innerHTML = gMsgPanelDesc.EditTrait; msg.skillDesc.innerHTML = gMsgPanelDesc.EditSkill; msg.buildDesc.innerHTML = gMsgPanelDesc.EditBuild; msg.growthDesc.innerHTML = gMsgPanelDesc.EditGrowth;
                msg.strName.innerHTML = gMsgStatName.Str; msg.agiName.innerHTML = gMsgStatName.Agi; msg.intName.innerHTML = gMsgStatName.Int;
                msg.vitName.innerHTML = gMsgStatName.Vit; msg.sprName.innerHTML = gMsgStatName.Spr; msg.mndName.innerHTML = gMsgStatName.Mnd;
                msg.strDesc.innerHTML = gMsgStatDesc.Str; msg.agiDesc.innerHTML = gMsgStatDesc.Agi; msg.intDesc.innerHTML = gMsgStatDesc.Int;
                msg.vitDesc.innerHTML = gMsgStatDesc.Vit; msg.sprDesc.innerHTML = gMsgStatDesc.Spr; msg.mndDesc.innerHTML = gMsgStatDesc.Mnd;
                msg.free.innerHTML = gMsgPanelName.EditPointFree; msg.used.innerHTML = gMsgPanelName.EditPointUsed;
                msg.max.innerHTML = gMsgPanelName.EditPointMax; // msg.commit.textContent = gMsgPanelName.EditCommit;
            }
        }
        
        {
            const msgs = pAura.msgs;

            msgs.feedName.innerHTML = gMsgPanelName.Enlight; msgs.feedDesc.innerHTML = gMsgPanelDesc.Enlight;
            msgs.h3Prefix.textContent = gMsgPanelPrefix.AuraH3; msgs.h3Middle.textContent = gMsgPanelMiddle.AuraH3; msgs.h3Suffix.textContent = gMsgPanelSuffix.AuraH3;
            msgs.pointPrefix.textContent = gMsgPanelPrefix.AuraPoint; msgs.pointSuffix.textContent = gMsgPanelSuffix.AuraPoint;
            msgs.skillPrefix.textContent = gMsgPanelPrefix.Skill; msgs.skillSuffix.textContent = gMsgPanelSuffix.Skill;
            // msgs.commit.innerHTML = gMsgPanelName.AuraCommit;

            for (const kinds of LYT_EQUIP.Auras) {
                for (const kind of kinds) {
                    const data = pAura[kind];
                    if (!data) { continue; }
                    data.name.textContent = gMsgAuraName[kind];
                    data.desc.innerHTML = gMsgAuraDesc[kind];
                    data.badge.firstChild.textContent = gMsgPanelPrefix.AuraCost;
                    data.badge.lastChild.textContent = gMsgPanelSuffix.AuraCost;
                }
            }
        }
        
        {
            const mA = pGem.mA, mB = pGem.mB, mC = pGem.mC;
            mA.name.firstChild.textContent = gMsgPanelName.Craft; mA.desc.innerHTML = gMsgPanelDesc.Craft; // mA.usual.innerHTML = gMsgPanelName.CraftUsual; mA.force.innerHTML = gMsgPanelName.CraftSuper;
            mB.name.firstChild.textContent = gMsgPanelName.Spawn; mB.desc.innerHTML = gMsgPanelDesc.Spawn; // mB.usual.innerHTML = gMsgPanelName.SpawnUsual; mB.force.innerHTML = gMsgPanelName.SpawnSuper;
            mC.name.firstChild.textContent = gMsgPanelName.Amass; mC.desc.innerHTML = gMsgPanelDesc.Amass; 
            for (const kind of LYT_EQUIP.Gems) {
                mC[kind].textContent = gMsgGemName[kind] ?? kind;
            }
        }
            
        for (const el of elFight.M) { el.onload(); }
        for (const el of elCarry.M) { el.onload(); }
        for (const el of elActor.M) { el.onload(); }
        for (const el of elEquip.M) { el.onload(); }
        for (const el of elFruit.M) { el.onload(); }
        elCrf.forEach(el => el.onload());
        elSpw.forEach(el => el.onload());
        elAms.forEach(el => el.onload());
    }

    elManual.onload = () => {
        elManual[0].innerHTML = gMsgPanelName.Manual;
    };

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Initialization *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    uiReset();
    elActor.M.forEach((el, i) => { el.onfocus = uiFocusSet; el.i = i; });
    elFight.M.forEach((el, i) => { el.onfocus = uiFocusSet; el.i = 0; });
    elCrf.forEach(e => { e.cb(_crf); });
    elSpw.forEach(e => { e.cb(_spw); });
    elAms.forEach(e => { e.cb(_ams); });
    eSvcRoot.append(elBody, elManual);

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Exports *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    Client[$CoEquipReset] = uiReset;
    Client[$CoEquipCost] = (spw, crf, ams, ac, fc) => {
        uiCrfShow(crf); uiSpwShow(spw); uiAmsShow(ams);
        [mAcExp, mAcElt] = ac; 
        [mFcFrgCost, mFcFrgMul, mFcFrgCap] = fc;
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
    };
    Client[$CoEquipData] = (b, e, le, lf, lb) => {
        BST = b; EST = e; LE = le; LB = Math.exp(lb || 0);
        uiAmulMax(lf);
        uiFocusEval();
    };
    Client[$CoEquipEcc] = d => {
        uiBackSet(elEquip, d); uiFocusEval();
    };
    Client[$CoEquipEcd] = d => {
        uiBackDel(elEquip, d); uiFocusEval();
    };
    Client[$CoEquipFcc] = d => {
        uiBackSet(elFruit, d); uiFocusEval();
    };
    Client[$CoEquipFcd] = d => {
        uiBackDel(elFruit, d); uiFocusEval();
    };
    Client[$CoEquipUsr] = () => {
        const 
            {grade, actor, equip, fruit, craft, spawn, amass} = gUser,
            pa = pGem.nA, pb = pGem.nB, pc = pGem.nC
        ;
        mGrade = grade;
        uiBackSlotSet(elActor, actor);
        uiBackSlotSet(elEquip, equip);
        uiBackSlotSet(elFruit, fruit);
        pa.val.textContent = uiNumCast(craft)+"%"; pa.bar.set(craft);
        pb.val.textContent = uiNumCast(spawn)+"%"; pb.bar.set(spawn);
        pc.val.textContent = uiNumCast(amass)+"%"; pc.bar.set(amass);
        uiItemSet(gUser);
    };
    Client[$CoEquipGrow] = n => {
        console.log(n);
    };
    Client[$CoEquipFight] = a => {
        const D = elFight.M, S = elActor.M;
        uiBackShow(elActor, mFight, !0);
        uiBackShow(elActor, mFight = a, 0);
        uiFrontSet(elFight, a.map((i, x) => S[D[x].i = i]));
    };
    Client[$CoEquipAura] = uiAuraSet;
    Client[$CoEquipView] = uiViewMode;
    Client[$CoEquipEdit] = uiEditMode;

})();

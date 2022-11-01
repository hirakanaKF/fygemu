/*
Project: fygemu
Authors: hirakana@kf
*/

(() => {

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Conponents *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------

    let 
        gEditorNode, gEditorUnit, gEditorCard, gEditorEquip, gEditorAuras, gEditorWishs, gEditorAmulet, gEditorNavi, gEditorBody
    ;

    const 
    
    // Battle
    gArena = new ArenaObject(),

    // Dashboard
    elBoard = document.createElement("div"),
    elBoard1 = document.createElement("div"),
    elBoard2 = document.createElement("div"),
    elBoardLeft = document.createElement("div"),
    elBoardRankTxt = document.createTextNode(""),
    elBoardRank = document.createElement("span"),
    elBoardProgTxt = document.createTextNode(""),
    elBoardProg = document.createElement("span"),
    elBoardMiddle = document.createElement("div"),
    elBoardBattle = document.createElement("button"),
    elBoardBattleName = document.createElement("span"),
    elBoardBattleDesc = document.createTextNode(""),
    elBoardLoader = document.createElement("button"),
    elBoardLoaderName = document.createElement("span"),
    elBoardLoaderDesc = document.createTextNode(""),
    elBoardButton1 = document.createElement("button"),
    elBoardButton1Name = document.createElement("span"),
    elBoardButton1Desc = document.createTextNode(""),
    elBoardButton2 = document.createElement("button"),
    elBoardButton2Name = document.createElement("span"),
    elBoardButton2Desc = document.createTextNode(""),
    elBoardButton3 = document.createElement("button"),
    elBoardButton3Name = document.createElement("span"),
    elBoardButton3Desc = document.createTextNode(""),
    elBoardRight = document.createElement("div"),
    elBoardFuelTxt = document.createTextNode(""),
    elBoardFuel = document.createElement("span"),
    elBoardMisc = document.createElement("div"),
    elBoardRecover = document.createElement("button"),
    elBoardConfirmU = document.createElement("ul"),
    elBoardConfirmL = document.createElement("li"),
    elBoardConfirmA = document.createElement("a"),
    elBoardNpcStrTxt = document.createTextNode(""),
    elBoardNpcStr = document.createElement("span"),

    // Config
    elConfig = document.createElement("div"),
    elConfigPanel = document.createElement("div"),
    elConfigHead = document.createElement("div"),
    elConfigBody = document.createElement("div"),
    elConfigLeft = document.createElement("div"),
    elConfigLeftHead = document.createElement("div"),
    elConfigLeftImport = document.createElement("button"),
    elConfigLeftExport = document.createElement("button"),
    elConfigLeftCreate = document.createElement("button"),
    elConfigLeftUnit = document.createElement("div"),
    elConfigRight = document.createElement("div"),
    elConfigRightHead = document.createElement("div"),
    elConfigRightImport = document.createElement("button"),
    elConfigRightExport = document.createElement("button"),
    elConfigRightCreate = document.createElement("button"),
    elConfigRightUnit = document.createElement("div"),

    // Editor
    elEditorMeta = document.createElement("div"),
    elEditorInfo = document.createElement("div"),
    elEditorConfirm = document.createElement("button"),
    elEditorClose = document.createElement("button"),
    elEditorLine = document.createElement("hr"),
    elEditorKind = document.createElement("select"),
    elEditorPoint = document.createElement("div"),
    elEditorPointLeft = document.createElement("span"),
    elEditorPointRight = document.createElement("span"),
    elEditorSkill = document.createElement("div"),
    elEditorSkillLeft = document.createElement("span"),
    elEditorSkillRight = document.createElement("span"),
    elEditorImage = document.createElement("img"),
    elEditorMain = document.createElement("div"),
    elEditorNavi = document.createElement("ul"),
    elEditorNaviActor = document.createElement("li"),
    elEditorNaviEquip = document.createElement("li"),
    elEditorNaviAuras = document.createElement("li"),
    elEditorNaviWishs = document.createElement("li"),
    elEditorNaviAmulet = document.createElement("li"),
    elEditorActor = document.createElement("div"),
    elEditorEquip = document.createElement("div"),
    elEditorEquipList = document.createElement("div"),
    elEditorEquipCreate = document.createElement("button"),
    elEditorEquipRemove = document.createElement("button"),
    elEditorAuras = document.createElement("div"),
    elEditorWishs = document.createElement("div"),
    elEditorAmulet = document.createElement("div"),

    // Output
    elOutput = document.createElement("div"),
    elOutputPanel = document.createElement("div"),
    elOutputHead = document.createElement("div"),
    elOutputBody = document.createElement("div"),

    // Manual
    elManual = document.createElement("div"),

    // Import single unit
    emuPkUnitImport = (el, set) => {
        elIoReader.value = "";
        elIoReader.onchange = () => elIoReader.files[0].text().then(
            (d) => {
                let a = JSON.parse(d);

                // In case input is an array, import the very first object
                if (a.length) { a = a[0]; }

                // Import
                el._unit.fromJson(a);
                if (set) { el._unit.set(); }
                emuPkUnitUpdate(el);
            }
        );
        elIoReader.click();
    },

    // Export single unit
    emuPkUnitExport = (el, set) => {
        if (set) { el._unit.set(); }
        elIoWriter.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(el._unit.toJson(), null, 4));
        elIoWriter.download = ".json";
        elIoWriter.click();
    },

    // Update single unit
    emuPkUnitUpdate = (el) => {
        const unit = el._unit, _stats = el._stats, _wish = el._wish, _status = el._status;

        el._icon.src = gUsrPath(gUsrActorMap, unit.nActor, "Z");

        {
            const Z = _stats.children;
            let i = 0;
            Z[i++].innerHTML = gMsgPanelName.Stats;

            for (const k in gLytPk.Unit) {
                const [L, R] = Z[i++].children, A = R.children, v = gLytPk.Unit[k];

                L.innerHTML = gMsgAttrName[k] || k;
                for (const j in v) {
                    A[j].value = unit[v[j]];
                }
            }

            const [flag1, flag2, flag3, flag4, flag5] = Z[++i].children;
            {
                const A = flag1.children, flags = unit.nArt1;
                let j = 0;
                for (const k in gEmuArt1Kind) {
                    const e = A[j++];
                    e.innerHTML = gMsgArt1Name[k] || k;
                    e.classList = flags.has(+k) ? "btn btn-primary" : "btn";
                }
            }
            {
                const A = flag2.children, flags = unit.nArt2;
                let j = 0;
                for (const k in gEmuArt2Kind) {
                    const e = A[j++];
                    e.innerHTML = gMsgArt2Name[k] || k;
                    e.classList = flags.has(+k) ? "btn btn-primary" : "btn";
                }
            }
            {
                const A = flag3.children, flags = unit.nArt3;
                let j = 0;
                for (const k in gEmuArt3Kind) {
                    const e = A[j++];
                    e.innerHTML = gMsgArt3Name[k] || k;
                    e.classList = flags.has(+k) ? "btn btn-primary" : "btn";
                }
            }
            {
                const A = flag4.children, flags = unit.nAura;
                let j = 0;
                for (const k in gEmuAuraKind) {
                    const e = A[j++];
                    e.innerHTML = gMsgAuraName[k] || k;
                    e.classList = flags.has(+k) ? "btn btn-primary" : "btn";
                }
            }
            {
                const A = flag5.children, flags = unit.nMyst;
                let j = 0;
                for (const k in gEmuEquipKind) {
                    const e = A[j++];
                    e.innerHTML = gMsgEquipName[k] || k;
                    e.classList = flags.has(+k) ? "btn btn-primary" : "btn";
                }
            }
        }

        el._equip.firstChild.innerHTML = gMsgPanelName.Equip;
        el._equipc.innerHTML = gMsgPanelName.Create;
        el._equipr.innerHTML = gMsgPanelName.Remove;
        [...el._equipl.children].forEach(emuPkEquipUpdate);

        {
            const Z = _wish.children, T = gLytPk.UnitWishs;
            let i = 0;
            Z[i++].innerHTML = gMsgPanelName.Wish;

            for (const k in T) {
                const [L, R] = Z[i++].children;

                L.innerHTML = gMsgAttrName[k] || k;
                R.value = unit[T[k]];
            }
        }

        {
            const Z = _status.children;
            let i = 0;
            Z[i++].innerHTML = gMsgPanelName.Status;
            for (const k in gEmuStatusKind) {
                Z[i++].innerHTML = gMsgStatusName[k] || k;
                Z[i++].value = unit["c"+k] || 0;
                Z[i++].checked = unit["b"+k] || !1;
            }
        }
        
        el._pvel.innerHTML =  "PVE:";
        el._pver.checked = unit.mIsPVE;
        el._namel.innerHTML = gMsgAttrName.mName;
        el._namer.value = unit.mName;
        el._import.innerHTML = gMsgPanelName.Import;
        el._export.innerHTML = gMsgPanelName.Export;
        el._editor.innerHTML = gMsgPanelName.Editor;
        el._remove.innerHTML = gMsgPanelName.Remove;

    },
    
    // Add an unit to array
    emuPkUnitCtor = (E, d) => {
        const
            unit = new Unit(),
            el = document.createElement("div"),
            _details = document.createElement("div"),
            _unitl = document.createElement("div"),
            _head = document.createElement("div"),
            _icon = document.createElement("img"),
            _unitr = document.createElement("details"),
            _summary = document.createElement("summary"),
            _stats = document.createElement("details"),
            _wish = document.createElement("details"),
            _equip = document.createElement("details"),
            _equipc = document.createElement("button"),
            _equipr = document.createElement("button"),
            _equipl = document.createElement("div"),
            _status = document.createElement("details"),
            _pvel = document.createElement("span"),
            _pver = document.createElement("input"),
            _namel = document.createElement("span"),
            _namer = document.createElement("input"),
            _import = document.createElement("button"),
            _export = document.createElement("button"),
            _editor = document.createElement("button"),
            _remove = document.createElement("button")
        ;

        if (d) { unit.fromJson(d); }

        el.classList = "row fyg_cc";
        el._selected = !0;
        el._head = _head; el._icon = _icon; el._unitr = _unitr;
        el._summary = _summary; el._stats = _stats; el._wish = _wish; el._status = _status; el._details = _details;
        el._equip = _equip;  el._equipc = _equipc; el._equipr = _equipr; el._equipl = _equipl;
        el._pvel = _pvel; el._pver = _pver; el._namel = _namel; el._namer = _namer;
        el._import = _import; el._export = _export; el._editor = _editor; el._remove = _remove;
        el.append(_unitl, _unitr);
        _unitl.classList = "col-xs-12 col-md-2 fyg_lh24";
        _unitl.append(_head, _pvel, _pver);
        _head.classList = "col-xs-4 col-md-12 btn btn-primary";
        _head.onclick = () => { el._selected = el._selected ? (_head.classList.remove('btn-primary'), !!0) : (_head.classList.add('btn-primary'), !0); } ;
        _head.append(_icon);
        _icon.draggable = !0;
        _icon.classList = "col-xs-12";
        _icon.style = "cursor: pointer;";
        _icon._elem = el;
        _icon.ondragstart = emuPkUnitDrag;
        _icon.onerror = () => { _icon.src = gImage; }
        _unitr.classList = "col-xs-12 col-md-10 fyg_lh18";
        _unitr.append(_summary, _details);
        _summary.append(document.createElement("br"), _namel, _namer, _editor, _import, _export, _remove);
        _details.classList = "col-xs-12";
        _details.append(_stats, document.createElement("hr"), _equip, document.createElement("hr"), _wish, document.createElement("hr"), _status, document.createElement("hr"));
        _pvel.classList = "col-xs-4 col-md-8";
        _pver.classList = "col-xs-4 col-md-4";
        _pver.type = "checkbox";
        _pver.onchange = () => { _pver.blur(); unit.mIsPVE = _pver.checked; }
        _namel.classList = "col-xs-4 col-md-2";
        _namer.classList = "col-xs-8 col-md-8";
        _namer.type = "string";
        _namer.onchange = () => { unit.mName = _namer.value; }
        _import.onclick = (e) => emuPkUnitImport(el, e.ctrlKey == gUsrJson.RawUnit);
        _export.onclick = (e) => emuPkUnitExport(el, e.ctrlKey == gUsrJson.RawUnit);
        _editor.onclick = () => emuPkEditorOpen(el);
        _remove.onclick = () => emuPkUnitDtor(E, el);
        _import.classList = _export.classList = _editor.classList = _remove.classList = "col-xs-11 col-md-2";
        _import.style = _export.style = _editor.style = _remove.style = "padding:1% 0 1% 0; margin:2% 4% 2% 4%;";

        // Draw details
        {
            const 
                summary = document.createElement("summary"),
                flags = document.createElement("div"),
                flag1 = document.createElement("div"),
                flag2 = document.createElement("div"),
                flag3 = document.createElement("div"),
                flag4 = document.createElement("div"),
                flag5 = document.createElement("div")
            ;

            _stats.append(summary);

            // Attributes
            for (const k in gLytPk.Unit) {
                const v = gLytPk.Unit[k], entry = document.createElement("div"), desc = document.createElement("span"), value = document.createElement("span");
                let sep = "";

                _stats.append(entry);

                entry.classList = "row";
                entry.append(desc, value);
                value.classList = "fyg_fr fyg_tr";

                for (const a of v) {
                    const box = document.createElement("input");
                    box.type = "string";
                    box.classList = "fyg_tr";
                    box.onchange = () => { box.value = unit[a] = +box.value || 0; }

                    value.append(sep, box);
                    sep = "+";
                }
            }

            _stats.append(document.createElement("hr"), flags);
            
            // Actor change
            {
                const e = _stats.children[1].children[1].children[0];
                e.onchange = () => { const v = +e.value || 0; e.value = unit.nActor = v; _icon.src = gUsrPath(gUsrActorMap, v, "Z"); }
            }
            
            // Flags
            flags.classList = "row";
            flags.append(flag1, flag2, flag3, flag4, flag5);
            flag1.classList = flag2.classList = flag3.classList = "col-md-4";
            flag4.classList = flag5.classList = "col-md-6";
            flag1.append(...Object.keys(gEmuArt1Kind).map((k) => {
                const box = document.createElement("div");
                box.classList = "btn";
                box.style = +k ? "padding:1px;margin:1px;" : "display: none;";
                box.onclick = () => unit.flipArt1(+k) ? box.classList.remove("btn-primary") : box.classList.add("btn-primary");
                return box;
            }));
            flag2.append(...Object.keys(gEmuArt2Kind).map((k) => {
                const box = document.createElement("div");
                box.classList = "btn";
                box.style = +k ? "padding:1px;margin:1px;" : "display: none;";
                box.onclick = () => unit.flipArt2(+k) ? box.classList.remove("btn-primary") : box.classList.add("btn-primary");
                return box;
            }));
            flag3.append(...Object.keys(gEmuArt3Kind).map((k) => {
                const box = document.createElement("div");
                box.classList = "btn";
                box.style = +k ? "padding:1px;margin:1px;" : "display: none;";
                box.onclick = () => unit.flipArt3(+k) ? box.classList.remove("btn-primary") : box.classList.add("btn-primary");
                return box;
            }));
            flag4.append(...Object.keys(gEmuAuraKind).map((k) => {
                const box = document.createElement("div");
                box.classList = "btn";
                box.style = +k ? "padding:1px;margin:1px;" : "display: none;";
                box.onclick = () => unit.flipAura(+k) ? box.classList.remove("btn-primary") : box.classList.add("btn-primary");
                return box;
            }));
            flag5.append(...Object.keys(gEmuEquipKind).map((k) => {
                const box = document.createElement("div");
                box.classList = "btn";
                box.style = +k ? "padding:1px;margin:1px;" : "display: none;";
                box.onclick = () => unit.flipMyst(+k) ? box.classList.remove("btn-primary") : box.classList.add("btn-primary");
                return box;
            }));
            
        }

        // Draw equip
        _equip.append(document.createElement("summary"), _equipc, _equipr, _equipl);
        _equipc.classList = "col-xs-11 col-md-5 btn";
        _equipc.style = "margin: 0 4%;";
        _equipc.onclick = () => emuPkEquipCtor(_equipl, null);
        _equipc.ondragover = emuDragOver;
        _equipc.ondrop = () => {
            const equip = new Equip();
            equip.copy(_equipl._drag._d);
            emuPkEquipCtor(_equipl, equip);
        }
        _equipr.classList = "col-xs-11 col-md-5 btn";
        _equipr.style = "margin: 0 4%;";
        _equipr.ondragover = emuDragOver;
        _equipr.ondrop = (e) => emuPkEquipDtor(_equipl, _equipl._drag);
        _equipr.onclick = () => emuPkEquipDtor(_equipl, _equipl.lastChild);
        _equipl.ondragover = emuDragOver;
        _equipl.ondrop = (e) => emuDrop(_equipl, _equipl, e);
        _equipl.classList = "col-xs-12 fyg_list";
        unit.mEquips.forEach((e) => emuPkEquipCtor(_equipl, e));

        // Draw wish
        {
            const summary = document.createElement("summary"), T = gLytPk.UnitWishs;
            
            _wish.append(summary);

            // Attributes
            for (const k in T) {
                const entry = document.createElement("div"), desc = document.createElement("span"), value = document.createElement("input");

                _wish.append(entry);

                entry.classList = "col-xs-12";
                entry.append(desc, value);
                desc.classList = "col-xs-6 fyg_tl";
                value.classList = "col-xs-6 fyg_tr";
                value.type = "string";
                value.onchange = () => { value.value = unit[T[k]] = +value.value || 0; };
            }
        }
        
        // Draw status
        _status.append(document.createElement("summary"));
        for (const k in gEmuStatusKind) {
            const l = document.createElement("span"), m = document.createElement("input"), r = document.createElement("input"), kn = "c"+k, kl = "b"+k;
            _status.append(l, m, r);
            l.classList = "col-xs-8";
            m.classList = "col-xs-3 fyg_tr";
            m.type = "string";
            m.onchange = () => { m.value = unit[kn] = +m.value; }
            r.classList = "col-xs-1";
            r.type = "checkbox";
            r.onchange = () => { r.blur(); unit[kl] = r.checked; }
        }
        
        el._unit = unit;

        emuPkUnitUpdate(el);
        E.append(el);

        return el;
    },

    // Remove an unit from array
    emuPkUnitDtor = (E, e) => {
        if (e) { E.removeChild(e); }
    },

    // DragStart callback
    emuPkUnitDrag = (e) => {
        emuDrag(elConfig, e.target._elem);
    },

    // Import from array
    emuPkUnitImportAll = (E, set) => {
        elIoReader.value = "";
        elIoReader.onchange = (set) ?
            () => elIoReader.files[0].text().then(
                (d) => {
                    const A = JSON.parse(d);
    
                    // Import single card
                    if (!A.length) { 
                        const el = emuPkUnitCtor(E, A);
                        el._unit.set();
                        emuPkUnitUpdate(el);
                        return ;
                    }
    
                    // Replace whole array
                    E.innerHTML = "";
                    A.forEach((a) => {
                        const el = emuPkUnitCtor(E, a);
                        el._unit.set();
                        emuPkUnitUpdate(el);
                    });
                }
            ):
            () => elIoReader.files[0].text().then(
                (d) => {
                    const A = JSON.parse(d);
    
                    // Import single card
                    if (!A.length) { return emuPkUnitCtor(E, A); }
    
                    // Replace whole array
                    E.innerHTML = "";
                    A.forEach((a) => emuPkUnitCtor(E, a));
                }
            )
        ;
        elIoReader.click();
    },

    // Export to array
    emuPkUnitExportAll = (E, set) => {
        f = set ? (e) => e._unit.set() || e._unit.toJson() : (e) => e._unit.toJson();
        elIoWriter.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify([...E.children].map(f), null, 4));
        elIoWriter.download = ".json";
        elIoWriter.click();
    },

    // Add an equip to array
    emuPkEquipCtor = (E, d) => {
        const
            equip = d || (new Equip()),
            el = document.createElement("div"),
            _icon = document.createElement("div"),
            _main = document.createElement("div"),
            _head = document.createElement("div"),
            _levell = document.createElement("span"),
            _levelr = document.createElement("input"),
            _rank = document.createElement("select"),
            _kind = document.createElement("select"),
            _attrs = document.createElement("div"),
            _myst = document.createElement("span"),
            _desc = document.createElement("span"),

        _updateAttr = (i, q) => {
            const e = _attrs.children[i], [el, em, er] = e.childNodes, x = (q > 100) ? (q > 130) ? "danger" : (q > 120) ? "warning" : "success" : (q > 80) ? "info" : "primary";

            e.classList = "col-xs-12 fyg_mp0 fyg_xlxx" + x;
            em.textContent = " " + equip.setQuality(i, q);
            er.classList = "bg-" + x;
            er.firstElementChild.value = q;
        },

        _updateAttrs = () => {
            const C = _attrs.children, A = gEmuEquipKind[equip.mKind].stats, Q = equip.mQuality, R = equip.mStats, Cn = C.length, An = A.length;
            let i = 0;
            
            while (i < Cn) {
                const I = i++, e = C[I];

                e.style.display = "";
                try {
                    const q = Q[I] || 0, k = A[I][0], x = (q > 100) ? (q > 130) ? "danger" : (q > 120) ? "warning" : "success" : (q > 80) ? "info" : "primary";
                    const [el, em, er] = e.childNodes;
                    e.classList = "col-xs-12 fyg_mp0 fyg_xlxx" + x;
                    el.textContent = gMsgEquipAttrName[k] || k;
                    em.textContent = " " + (R[I] || 0);
                    er.classList = "bg-" + x;
                    er.firstElementChild.value = q;
                }
                catch {
                    e.style.display = "none";
                }
            }
            while (i < An) {
                const 
                    e = document.createElement("p"), er = document.createElement("span"), v = document.createElement("input"),
                    I = i++, q = Q[I] || 0, k = A[I][0], x = (q > 100) ? (q > 130) ? "danger" : (q > 120) ? "warning" : "success" : (q > 80) ? "info" : "primary"
                ;

                _attrs.append(e);
                e.classList = "col-xs-12 fyg_mp0 fyg_xlxx" + x;
                e.append(gMsgEquipAttrName[k] || k, " " + (R[I] || 0), er);
                er.classList = "bg-" + x;
                er.style = "width: 33%; float: right;";
                er.append(" ", v, "% ");
                v.classList = "fyg_tr";
                v.style = "width: 66%; margin-left: 5%";
                v.type = "string";
                v.value = q;
                v.onchange = () => _updateAttr(I, +v.value || 0);
            }
        }

        _update = () => {
            _icon.style.backgroundImage = `url(${gUsrPath(gUsrEquipMap, equip.mKind, equip.mRank)})`;
            _updateAttrs();
            _myst.innerHTML = gMsgEquipMyst[equip.mKind];
            _desc.innerHTML = gMsgEquipDesc[equip.mKind];
        }

        ;

        el.classList = "col-xs-12 alert alert-primary";
        el.append(_icon, _main);
        _icon.draggable = !0;
        _icon.classList = "col-xs-12 col-md-1 btn fyg_colpzbg fyg_mp3";
        _icon.ondragstart = (e) => emuDrag(el.parentElement, el);
        _icon.onclick = () => {
            const a = _attrs.style;
            _icon.blur();
            if (a.display) {
                a.display = (equip.mSpecial ? _myst : _desc).style.display = "";
                return ;
            }
            a.display = _desc.style.display = _myst.style.display = "none";
        }
        _icon.append(document.createElement("br"), equip.mLevel);
        _main.classList = "fyg_equip-editor";
        _main.append(_head, _attrs, _desc, _myst);
        _head.classList = `fyg_nw with-padding fyg_colpz0${equip.mRank}bg`;
        _head.style = "margin: 0.5rem 0;"
        _head.append(_levell, _levelr, _rank, _kind);
        _levell.innerHTML = "Lv. "
        _levelr.classList = "fyg_tr";
        _levelr.style = "width: 20%";
        _levelr.value = equip.mLevel;
        _levelr.onchange = () => { _icon.lastChild.textContent = _levelr.value = equip.setLevel(+_levelr.value); _updateAttrs(); };
        {
            const i = equip.mRank;
            _rank.append(...Object.keys(gEmuEquipRankKind).map((k) => {
                const e = document.createElement("option"), v = +k;
                e.value = v; e.selected = v == i;
                return e;
            }));
        }
        _rank.onchange = () => {
            const r = +_rank.value || 0; equip.mRank = r;
            _head.classList = `fyg_nw with-padding fyg_colpz0${r}bg`;
            _icon.style.backgroundImage = `url(${gUsrPath(gUsrEquipMap, equip.mKind, r)})`;
        }
        _kind.onchange = () => { equip.setKind(+_kind.value || 0); emuPkEquipUpdate(el); };
        {
            const i = equip.mKind;
            _kind.append(...Object.keys(gEmuEquipKind).map((k) => {
                const e = document.createElement("option"), v = +k;
                e.value = v; e.selected = v == i;
                return e;
            }));
        }
        _attrs.style.display = "none";
        _myst.classList = "col-xs-12 bg-danger with-padding";
        _myst.style = "margin: 0.5rem 0; display: none;";
        _myst.onclick = () => { equip.mSpecial = !1; _desc.style.display = ""; _myst.style.display = "none"; };
        _desc.classList = "col-xs-12 bg-info with-padding";
        _desc.style = "margin: 0.5rem 0; display: none;";
        _desc.onclick = () => { equip.mSpecial = !0; _desc.style.display = "none"; _myst.style.display = ""; };
        el._d = equip; el._rank = _rank; el._kind = _kind; el._update = _update;
        emuPkEquipUpdate(el);
        E.append(el);

        return el;
    },

    // Remove an equip to array
    emuPkEquipDtor = (E, e) => {
        if (e) { E.removeChild(e); }
    },

    // Update messages in an equip
    emuPkEquipUpdate = (e) => {
        const ck = e._kind.children, cr = e._rank.children;
        Object.keys(gEmuEquipRankKind).forEach((k, i) => { cr[i].innerHTML = gMsgEquipRankName[k] || k; });
        Object.keys(gEmuEquipKind).forEach((k, i) => { ck[i].innerHTML = gMsgEquipName[k] || k; });
        e._update();
    },

    // Open the editor
    emuPkEditorOpen = (e) => {
        const u = e._unit;
        gEditorNode = e;
        gEditorUnit = u;
        gEditorCard = u.mCard;
        gEditorAuras = u.mAuras;
        gEditorWishs = u.mWishs;
        gEditorAmulet = u.mAmulet;

        const kind = gEditorCard.mActor;

        // Load unit stats
        Object.keys(gEmuActorKind).forEach((k, i) => {
            elEditorKind.children[i].selected = (kind == +k);
        });
        elEditorEquipList.append(...e._equipl.children);
        Object.values(gLytPk.EditorActor).forEach((k, i) => {
            elEditorActor.children[i].lastChild.value = gEditorCard[k];
        });
        Object.keys(gEmuAuraKind).forEach((k, i) => {
            const c = elEditorAuras.children[i].classList;
            gEditorAuras.has(+k) ?  c.add("btn-primary") : c.remove("btn-primary");
        });
        Object.values(gLytPk.EditorWishs).forEach((k, i) => {
            elEditorWishs.children[i].lastChild.value = gEditorWishs[k];
        });
        Object.values(gLytPk.EditorAmulet).forEach((k, i) => {
            elEditorAmulet.children[i].lastChild.value = gEditorAmulet[k];
        });
        emuPkEditorSyncImage();
        emuPkEditorSyncPoint();
        emuPkEditorSyncSkill();

        // Switch to page
        elEditorMeta.style.display = "block";
        elEditorMain.style.display = "block";
        elConfigLeft.style.display = "none";
        elConfigRight.style.display = "none";
    },

    // Close the editor
    emuPkEditorClose = () => {
        // Clear all equips
        gEditorNode._equipl.append(...elEditorEquipList.children);

        // Switch back to configuration panel
        elEditorMeta.style.display = "none";
        elEditorMain.style.display = "none";
        elConfigLeft.style.display = "block";
        elConfigRight.style.display = "block";
    },

    // Close the editor, with writting to card stats
    emuPkEditorConfirm = () => {
        gEditorUnit.mEquips = [...elEditorEquipList.children].map((e) => e._d);
        gEditorUnit.set();
        emuPkUnitUpdate(gEditorNode);
        emuPkEditorClose();
    },

    //
    emuPkEditorSyncImage = () => {
        const kind = gEditorCard.mActor;
        elEditorImage.src = gUsrPath(gUsrActorMap, kind, "N");
    },

    // 
    emuPkEditorSyncPoint = () => {
        const 
            pnow = gEditorCard.mStr + gEditorCard.mAgi + gEditorCard.mInt + gEditorCard.mVit + gEditorCard.mSpr + gEditorCard.mMnd,
            pmax = gNumberCast((gEditorCard.mLevel * 3 + 6) * (1 + gEditorCard.mQuality * 0.01))
        ;

        elEditorPointRight.classList = (pnow > pmax) ? "col-xs-12 col-md-6 with-padding bg-danger fyg_tc" : "col-xs-12 col-md-6 with-padding bg-success fyg_tc";
        elEditorPointRight.innerHTML = `${pnow} / ${pmax}`;
    },

    //
    emuPkEditorSyncSkill = () => {
        const snow = gEditorAuras.size, smax = gEditorCard.mSkill;

        elEditorSkillRight.classList = (snow > smax) ? "col-xs-12 col-md-6 with-padding bg-danger fyg_tc" : "col-xs-12 col-md-6 with-padding bg-success fyg_tc";
        elEditorSkillRight.innerHTML = `${snow} / ${smax}`;
    }

    ;

    // Dashboard
    elBoard.classList = "fyg_pk row";
    elBoard.append(elBoard1);
    elBoard1.classList = "panel panel-primary";
    elBoard1.append(elBoard2);
    elBoard2.classList = "row panel-body";
    elBoard2.append(elBoardLeft, elBoardMiddle, elBoardRight);
    elBoardLeft.classList = "col-md-2 fyg_tc";
    elBoardLeft.append(
        elBoardRankTxt, document.createElement("br"), elBoardRank, document.createElement("br"), document.createElement("br"),
        elBoardProgTxt, document.createElement("br"), elBoardProg
    );
    elBoardRank.classList = "fyg_colpz05";
    elBoardRank.style = "font-size: 4.8rem; font-weight: 900;";
    elBoardProg.classList = "fyg_colpz02";
    elBoardProg.style = "font-size: 3.2rem; font-weight: 900;";
    elBoardMiddle.classList = "col-md-8";
    elBoardMiddle.style = "max-height: 24.5rem; overflow: scroll;";
    elBoardMiddle.append(elBoardBattle, elBoardLoader, elBoardButton1, elBoardButton2, elBoardButton3);
    elBoardBattle.type = elBoardLoader.type = elBoardButton1.type = elBoardButton2.type = elBoardButton3.type = "button";
    elBoardBattle.classList = elBoardLoader.classList = "fyg_debug btn btn-block fyg_lh30";
    elBoardButton1.classList = elBoardButton2.classList = elBoardButton3.classList = "btn btn-block fyg_lh30";
    elBoardBattle.append(elBoardBattleName, document.createElement("br"), elBoardBattleDesc);
    elBoardLoader.append(elBoardLoaderName, document.createElement("br"), elBoardLoaderDesc);
    elBoardButton1.append(elBoardButton1Name, document.createElement("br"), elBoardButton1Desc);
    elBoardButton2.append(elBoardButton2Name, document.createElement("br"), elBoardButton2Desc);
    elBoardButton3.append(elBoardButton3Name, document.createElement("br"), elBoardButton3Desc);
    elBoardBattleName.classList = elBoardLoaderName.classList = elBoardButton1Name.classList = elBoardButton2Name.classList = elBoardButton3Name.classList = "fyg_f18";
    elBoardBattle.onclick = (e) => elBoardBattle.blur() || emuStartBattle();
    elBoardLoader.onclick = (e) => { elBoardLoader.blur(); elIoReader.value = ""; elIoReader.value=''; elIoReader.onchange = () => elIoReader.files[0].text().then(logLoader); elIoReader.click();};
    elBoardButton1.onclick = (e) => elBoardButton1.blur();
    elBoardButton2.onclick = (e) => elBoardButton2.blur();
    elBoardButton3.onclick = (e) => elBoardButton3.blur();
    elBoardRight.classList = "col-md-2 fyg_tc";
    elBoardRight.append(
        elBoardFuelTxt, document.createElement("br"), elBoardFuel, document.createElement("br"), 
        elBoardMisc,document.createElement("br"), document.createElement("br"), 
        elBoardNpcStrTxt, document.createElement("br"), elBoardNpcStr, document.createElement("br"), document.createElement("br")
    );
    elBoardFuel.classList = "fyg_colpz03";
    elBoardFuel.style = "font-size: 3.2rem; font-weight: 900;";
    elBoardMisc.classList = "btn-group";
    elBoardMisc.append(elBoardRecover, elBoardConfirmU);
    elBoardRecover.type = "button";
    elBoardRecover.classList = "btn btn-success btn-lg dropdown-toggle";
    elBoardConfirmU.classList = "dropdown-menu";
    elBoardConfirmU.append(elBoardConfirmL);
    elBoardConfirmL.append(elBoardConfirmA);
    elBoardConfirmA.style = "color: #EA644A;";
    elBoardNpcStr.classList = "fyg_colpz04";
    elBoardNpcStr.style = "font-size: 3.2rem; font-weight: 900;";

    // Config
    elConfig.classList = "fyg_pk row fyg_debug";
    elConfig.append(elConfigPanel);
    elConfigPanel.classList = "panel panel-primary";
    elConfigPanel.append(elConfigHead, elConfigBody);
    elConfigHead.classList = "panel-heading";
    elConfigHead.onclick = () => { elConfigBody.style.display = elConfigBody.style.display ? "" : "none"; };
    elConfigBody.classList = "panel-body";
    elConfigBody.style = "display: none;";
    elConfigBody.append(elConfigLeft, elConfigRight, elEditorMeta, elEditorMain);
    
    elConfigLeft.classList = "col-xs-12 col-md-6 alert alert-danger fyg_cl";
    elConfigLeft.append(elConfigLeftHead, elConfigLeftUnit);
    elConfigLeftHead.append(elConfigLeftCreate, elConfigLeftImport, elConfigLeftExport);
    elConfigLeftImport.style = "width: 30%; padding: 1%; margin: 0.25rem 1%;";
    elConfigLeftImport.onclick = (e) => emuPkUnitImportAll(elConfigLeftUnit, e.ctrlKey == gUsrJson.RawUnit);
    elConfigLeftExport.style = "width: 30%; padding: 1%; margin: 0.25rem 2%;";
    elConfigLeftExport.onclick = (e) => emuPkUnitExportAll(elConfigLeftUnit, e.ctrlKey == gUsrJson.RawUnit);
    elConfigLeftCreate.style = "width: 30%; padding: 1%; margin: 0.25rem 2%;";
    elConfigLeftCreate.onclick = () => emuPkUnitCtor(elConfigLeftUnit, null);
    elConfigLeftCreate.ondragover = emuDragOver;
    elConfigLeftCreate.ondrop = () => emuPkUnitCtor(elConfigLeftUnit, elConfig._drag._unit);
    elConfigLeftUnit.classList = "fyg_list";
    elConfigLeftUnit.ondragover = emuDragOver;
    elConfigLeftUnit.ondrop = (e) => emuDrop(elConfig, elConfigLeftUnit, e);
    elConfigRight.classList = "col-xs-12 col-md-6 alert alert-info fyg_cr";
    elConfigRight.append(elConfigRightHead, elConfigRightUnit);
    elConfigRightHead.append(elConfigRightCreate, elConfigRightImport, elConfigRightExport);
    elConfigRightImport.style = "width: 30%; padding: 1%; margin: 0.25rem 1%;";
    elConfigRightImport.onclick = (e) => emuPkUnitImportAll(elConfigRightUnit, e.ctrlKey == gUsrJson.RawUnit);
    elConfigRightExport.style = "width: 30%; padding: 1%; margin: 0.25rem 2%;";
    elConfigRightExport.onclick = (e) => emuPkUnitExportAll(elConfigRightUnit, e.ctrlKey == gUsrJson.RawUnit);
    elConfigRightCreate.style = "width: 30%; padding: 1%; margin: 0.25rem 2%;";
    elConfigRightCreate.onclick = () => emuPkUnitCtor(elConfigRightUnit, null);
    elConfigRightCreate.ondragover = emuDragOver;
    elConfigRightCreate.ondrop = () => emuPkUnitCtor(elConfigRightUnit, elConfig._drag._unit);
    elConfigRightUnit.classList = "fyg_list";
    elConfigRightUnit.ondragover = emuDragOver;
    elConfigRightUnit.ondrop = (e) => emuDrop(elConfig, elConfigRightUnit, e);

    // Editor
    gEditorNavi = elEditorNaviActor;
    gEditorBody = elEditorActor;
    elEditorMeta.classList = "col-xs-12 col-md-3"
    elEditorMeta.style.display = "none";
    elEditorMeta.append(elEditorInfo);
    elEditorInfo.classList = "col-xs-12 col-md-11 panel panel-primary";
    elEditorInfo.append(elEditorClose, elEditorConfirm, elEditorLine, elEditorImage, elEditorKind, elEditorPoint, elEditorSkill);
    elEditorConfirm.classList = "col-xs-5 fyg_lh40";
    elEditorConfirm.style = `padding: 1%; margin: 1% 4%;`;
    elEditorConfirm.onclick = emuPkEditorConfirm;
    elEditorClose.classList = "col-xs-5 fyg_lh40";
    elEditorClose.style = `padding: 1%; margin: 1% 4%;`;
    elEditorClose.onclick = emuPkEditorClose;
    elEditorLine.classList = "row";
    elEditorKind.classList = "col-xs-6 col-md-12";
    for (const k in gEmuActorKind) {
        const e = document.createElement("option");
        e.value = +k;
        elEditorKind.append(e);
    }
    elEditorKind.onchange = () => { elEditorKind.value = gEditorCard.mActor = +elEditorKind.value; emuPkEditorSyncImage();}
    elEditorPoint.classList = "col-xs-6 col-md-12 btn-group fyg_nw";
    elEditorPoint.append(elEditorPointLeft, elEditorPointRight);
    elEditorPointLeft.classList = "col-xs-12 col-md-6 with-padding bg-default fyg_tc";
    elEditorSkill.classList = "col-xs-6 col-md-12 btn-group";
    elEditorSkill.append(elEditorSkillLeft, elEditorSkillRight);
    elEditorSkillLeft.classList = "col-xs-12 col-md-6 with-padding bg-default fyg_tc";
    elEditorImage.classList = "col-xs-6 col-md-12";
    elEditorImage.onerror = () => { elEditorImage.src = gImage; };

    elEditorMain.classList = "col-xs-12 col-md-9 panel panel-primary";
    elEditorMain.style.display = "none";
    elEditorMain.append(elEditorNavi, elEditorActor, elEditorEquip, elEditorAuras, elEditorWishs, elEditorAmulet);
    elEditorNavi.classList = " nav nav-secondary nav-justified";
    elEditorNavi.append(elEditorNaviActor, elEditorNaviEquip, elEditorNaviAuras, elEditorNaviWishs, elEditorNaviAmulet);
    for (const [el, er] of [
        [elEditorNaviActor, elEditorActor],
        [elEditorNaviEquip, elEditorEquip],
        [elEditorNaviAuras, elEditorAuras],
        [elEditorNaviWishs, elEditorWishs],
        [elEditorNaviAmulet, elEditorAmulet],
    ]) {
        const a = document.createElement("a");

        a.classList = "fyg_f14";
        a.onclick = () => {
            gEditorNavi.classList = "";
            gEditorBody.style.display = "none";
            gEditorNavi = el; el.classList = "active";
            gEditorBody = er;
            er.style.display = "block";
        };
        el.classList = "";
        el.append(a);
        er.classList = "col-xs-12 load-indicator";
        er.style = "padding: 1%; display: none";
    }
    gEditorNavi.classList = "active";
    gEditorBody.style.display = "block";

    for (const k in gLytPk.EditorActor) {
        const v = gLytPk.EditorActor[k], d = document.createElement("div"), l = document.createElement("span"), r = document.createElement("input");
        d.classList = "col-xs-12 col-md-12";
        l.classList = "col-xs-4 fyg_nw";
        r.classList = "col-xs-8 fyg_tr";
        r.type = "string";
        if (v == "mSkill") {
            r.onblur = () => { r.value = gEditorCard[v] = +r.value; emuPkEditorSyncSkill(); };
        }
        else {
            r.onblur = () => { r.value = gEditorCard[v] = +r.value; emuPkEditorSyncPoint(); };
        }
        elEditorActor.append(d);
        d.append(l, r);
    }
    elEditorEquip.append(elEditorEquipCreate, elEditorEquipRemove, document.createElement("hr"), elEditorEquipList);
    elEditorEquipCreate.classList = "col-xs-11 col-md-5 btn";
    elEditorEquipCreate.style = "margin: 0 4%;";
    elEditorEquipCreate.onclick = () => emuPkEquipCtor(elEditorEquipList, null);
    elEditorEquipCreate.ondragover = emuDragOver;
    elEditorEquipCreate.ondrop = () => {
        const equip = new Equip();
        equip.copy(elEditorEquipList._drag._d);
        emuPkEquipCtor(elEditorEquipList, equip);
    }
    elEditorEquipRemove.classList = "col-xs-11 col-md-5 btn";
    elEditorEquipRemove.style = "margin: 0 4%;";
    elEditorEquipRemove.ondragover = emuDragOver;
    elEditorEquipRemove.ondrop = () => emuPkEquipDtor(elEditorEquipList, elEditorEquipList._drag);
    elEditorEquipRemove.onclick = () => emuPkEquipDtor(elEditorEquipList, elEditorEquipList.lastChild);
    elEditorEquipList.ondragover = emuDragOver;
    elEditorEquipList.ondrop = (e) => emuDrop(elEditorEquipList, elEditorEquipList, e);
    elEditorEquipList.classList = "col-xs-12 fyg_list";
    elEditorAuras.append(...Object.keys(gEmuAuraKind).map((k) => {
        const box = document.createElement("div"), icon = document.createElement("i"), desc = document.createElement("span"), v = +k;
        
        box.classList = "btn";
        box.style = v ? "padding: 1%; margin: 1%;" : "display: none;";
        box.onclick = () => {
            gEditorAuras.has(v) ? (gEditorAuras.delete(v) && box.classList.remove("btn-primary")) : (gEditorAuras.add(v) && box.classList.add("btn-primary"));
            emuPkEditorSyncSkill();
        }
        box.append(icon, document.createElement("br"), desc);
        icon.classList = "icon icon-bookmark-empty fyg_f14";
        desc.classList = "label label-badge";
        elEditorAuras[v] = desc;
        return box;
    }));
    for (const k in gLytPk.EditorWishs) {
        const v = gLytPk.EditorWishs[k], d = document.createElement("div"), l = document.createElement("div"), r = document.createElement("input");
        d.classList = "col-xs-12 col-md-6";
        l.classList = "col-xs-6 fyg_nw";
        r.classList = "col-xs-6 fyg_tr";
        r.type = "string";
        r.onblur = () => { r.value = gEditorWishs[v] = +r.value; };
        elEditorWishs.append(d);
        d.append(l, r);
    }
    for (const k in gLytPk.EditorAmulet) {
        const v = gLytPk.EditorAmulet[k], d = document.createElement("div"), l = document.createElement("div"), r = document.createElement("input");
        d.classList = "col-xs-12 col-md-4";
        l.classList = "col-xs-4 fyg_nw";
        r.classList = "col-xs-8 fyg_tr";
        r.type = "string";
        r.onblur = () => { r.value = gEditorAmulet[v] = +r.value; };
        elEditorAmulet.append(d);
        d.append(l, r);
    }

    // Output
    elOutput.classList = "fyg_pk row";
    elOutput.append(elOutputPanel);
    elOutputPanel.classList = "panel panel-primary";
    elOutputPanel.append(elOutputHead, elOutputBody);
    elOutputHead.classList = "panel-heading";
    elOutputHead.onclick = () => { elOutputBody.style.display = elOutputBody.style.display ? "" : "none"; };
    elOutputBody.classList = "panel-body";
    elOutputBody.style = "max-height: 108rem; overflow-x: hidden; overflow-y: scroll; display: none;";

    // Manual
    elManual.classList = "fyg_pk row";

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Battle Loader *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------

    const logLoader = (msg) => {
        elOutputBody.innerHTML = msg.replaceAll("col-md", "col-xs").split(/ys\/icon\/z\/z|\.gif/g).map(
            (s, i) => (i & 1) ? gUsrPath(gUsrEquipMap, ...s.split("_")) : s
        ).join("");
        const elPanelR = document.getElementsByClassName("col-xs-7 fyg_tr")[0], elPanelL = document.getElementsByClassName("col-xs-7 fyg_tl")[0];
        const 
            nameR = elPanelR.children[0].innerText.split("（"), nameL = elPanelL.children[0].innerText.split("（"),
            kindR = gEmuActorKeys[nameR[1].includes("野怪") ? nameR[0] : nameR[1].at(-2)],
            kindL = gEmuActorKeys[nameL[1].includes("野怪") ? nameL[0] : nameL[1][0]]
        ;
        elPanelR.style.backgroundImage = `url(${gUsrPath(gUsrActorMap, kindR, "R")})`;
        elPanelL.style.backgroundImage = `url(${gUsrPath(gUsrActorMap, kindL, "L")})`;
        elPanelL.style.backgroundPosition = elPanelR.style.backgroundPosition = "center";
        elPanelL.style.backgroundSize = elPanelR.style.backgroundSize = "contain";
        elPanelL.style.backgroundRepeat = elPanelR.style.backgroundRepeat = "no-repeat";
    };

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Battle Engine *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------

    class Fighter extends BattleObject {

        constructor (c, i) {
            super(c, i);
            this.nUiStack = {};
            this.nUiDebug = new Set();
        }

        uiPush (k) {
            this.nUiStack[k] = (this.nUiStack[k] || 0n) + 1n;
        }

        uiClear () {
            this.nUiStack = {};
            this.nUiDebug.clear();
        }
    
        uiDebugStatus (i, m = "") {
            this.nUiDebug.add(
                `<b>${gMsgStatusName[i] || i}:${m}</b>`
            );
        }
    
        uiAddStatus (i, m = "") {
            this.uiPush(
                `<i class="icon icon-unlink"><b>${gMsgStatusName[i] || i}${gMsgActUIInfo.StatusPrefix}${m}${gMsgActUIInfo.StatusSuffix}</b></i>`
            );
        }

        uiAddAct (i, m = "") {
            this.uiPush(
                `<i class="icon icon-location-arrow"><b>${gMsgActUIInfo[i] || i}${m}</b></i>`
            );
        }
    
        uiAddHpPot () {
            this.uiPush(
                `<i class="icon icon-bookmark-empty text-success"><b>${gMsgActUIInfo.HpPot}</b></i>`
            );
        }
    
        uiAddSdPot () {
            this.uiPush(
                `<i class="icon icon-bookmark-empty text-success"><b>${gMsgActUIInfo.SdPot}</b></i>`
            );
        }
    
        uiAddArt1 (i, m = "") {
            this.uiPush(
                `<i class="icon icon-location-arrow"><b>${gMsgArt1Name[i]}${gMsgActUIInfo.SkillPrefix}${m}${gMsgActUIInfo.SkillSuffix}</b></i>`
            );
        }
    
        uiAddArt2 (i, m = "") {
            this.uiPush(
                `<i class="icon icon-location-arrow"><b>${gMsgArt2Name[i]}${gMsgActUIInfo.SkillPrefix}${m}${gMsgActUIInfo.SkillSuffix}</b></i>`
            );
        }
    
        uiAddArt3 (i, m = "") {
            this.uiPush(
                `<i class="icon icon-location-arrow"><b>${gMsgArt3Name[i]}${gMsgActUIInfo.SkillPrefix}${m}${gMsgActUIInfo.SkillSuffix}</b></i>`
            );
        }
    
        uiAddAura (i, m = "") {
            this.uiPush(
                `<i class="icon icon-bookmark-empty"><b>${gMsgAuraName[i]}${gMsgActUIInfo.AuraPrefix}${m}${gMsgActUIInfo.AuraSuffix}</b></i>`
            );
        }
    
        uiShow () {
            const S = this.nUiStack;
            return Object.keys(S).map(k => S[k] > 1n ? `${k}<i><b>×${S[k]}</b></i>` : k).join("&nbsp");
        }

        uiDebug () {
            return [...this.nUiDebug].join("&nbsp");
        }
    
        uiDrawDmg () {
            const pa = this.nPowP, ma = this.nPowM, aa = this.nPowA, hd = this.nDmgH, hr = this.nRecH, sd = this.nDmgS, sr = this.nRecS;
    
            return `
            ${(pa > 0) ? `<i class="icon icon-bolt text-danger fyg_f14">${Math.floor(pa)}</i>&nbsp;&nbsp;` : ""}
            ${(ma > 0) ? `<i class="icon icon-bolt text-primary fyg_f14">${Math.floor(ma)}</i>&nbsp;&nbsp;` : ""}
            ${(aa > 0) ? `<i class="icon icon-bolt text-warning fyg_f14">${Math.floor(aa)}</i>&nbsp;&nbsp;` : ""}
            ${(hd > 0) ? `<i class="icon icon-minus text-danger fyg_f14">${Math.floor(hd)}</i>&nbsp;&nbsp;` : ""}
            ${(hr > 0) ? `<i class="icon icon-plus text-danger fyg_f14">${Math.floor(hr)}</i>&nbsp;&nbsp;` : ""}
            ${(sd > 0) ? `<i class="icon icon-minus text-info fyg_f14">${Math.floor(sd)}</i>&nbsp;&nbsp;` : ""}
            ${(sr > 0) ? `<i class="icon icon-plus text-info fyg_f14">${Math.floor(sr)}</i>&nbsp;&nbsp;` : ""}
            `
        }
    
        uiDrawLife () {
            return `<span class="fyg_f14 text-info">${Math.ceil(this.mSdNow)}</span> | <span class="fyg_f14 text-danger">${Math.ceil(this.mHpNow)}</span>`
        }

        uiHpBarWidth () {
            const hn = this.mHpNow, hm = this.mHpMax;

            if (hn <= 0) { return 0; }
            if (hn >= hm) { return 100; }
            if (hm <= 0) { return 0; }
            return Math.ceil(Math.min(hn / hm, 1) * 100);
        }

        uiSdBarWidth () {
            const sn = this.mSdNow, sm = this.mSdMax;

            if (sn <= 0) { return 0; }
            if (sn >= sm) { return 100; }
            if (sm <= 0) { return 0; }
            return Math.ceil(Math.min(sn / sm, 1) * 100);
        }
    }

    // Dummy card for battle in case no card was selected
    gEditorUnit = new Unit();
    
    // Start battle with current configurations
    window.emuStartBattle = () => {

        const L = [], R = [], T = [];
        let pvel = !1, pver = !1, nRoundNow = 1;
        
        // Left Team
        for (const el of elConfigLeftUnit.children) {
            if (!el._selected) { continue; }

            const u = new Fighter(el._unit);
            L.push(u);
            pvel |= u.mIsPVE;
        }

        // Right Team
        for (const el of elConfigRightUnit.children) {
            if (!el._selected) { continue; }

            const u = new Fighter(el._unit);
            R.push(u);
            pver |= u.mIsPVE;
        }

        gArena.team([L, R]);
        gArena.ipSet();

        // Show Versus Message
        {

            T.push(
`
    <div class="row"><div class="row">
    <div class="col-xs-12 col-md-6 fyg_fl">
    ${L.map((u) => {
        const a = u.mFlags.Aura;
        let i = 0;

        return `
    <div class="alert alert-danger" style="background-color:#ffffff;border:1px #EA644A solid; height: 16rem; overflow: scroll;"><div class="row">
    <div class="col-md-7 fyg_tr fyg_fr" style="background-image: url(&quot;${gUsrPath(gUsrActorMap, u.mActor, "R")}&quot;); background-position: center; background-size: contain; background-repeat:no-repeat;">
    <span class="fyg_f18">${pver ? `${gMsgActorName[u.mActor]}（Lv.${u.mLevel} ${gMsgAttrInfo.mIsPVE}）` : `${u.mName}（Lv.${u.mLevel} ${gMsgActorName[u.mActor]}）`}</span><br>
        [${gMsgAttrInfo.mHpMax}:${Math.ceil(u.mHpMax)}] [${gMsgAttrInfo.mSdMax}:${Math.ceil(u.mSdMax)}]<br>
        [${gMsgAttrInfo.mSpd}:${Math.ceil(u.mSpd)}]<br>
        [${gMsgAttrInfo.mPowP}:${Math.ceil(u.mPowP)}] [${gMsgAttrInfo.mPowM}:${Math.ceil(u.mPowM)}]<br>
        [${gMsgAttrInfo.mDefP}:${Math.ceil(u.mDefFixP)}] [${gMsgAttrInfo.mDefM}:${Math.ceil(u.mDefFixM)}]<br>
        <br>
    </div>
    <div class="col-md-5 fyg_tl">
        <div class="fyg_nw" style="min-height: 6.75rem;">
        ${u.mEquips.map(
            (e) => `<button type="button" class="btn fyg_colpzbg fyg_mp3" title="${gMsgEquipName[e.mKind]}" style="width: 47px; height: 47px; background-image: url(${gUsrPath(gUsrEquipMap, e.mKind, e.mRank)});" ><br>${e.mLevel}</button>`
        ).join("")}
        </div><br>
        ${Object.keys(gEmuAuraKind).map(
            (n) => a.has(+n) ? `|${gMsgAuraName[n]}|${(++i < 3) ? "" : (i = 0, "<br>")}` : ""
        ).join("")}
    </div></div></div>
    `}).join("")}
    </div>
    <div class="col-xs-12 col-md-6 fyg_fr">
    ${R.map((u) => {
        const a = u.mFlags.Aura;
        let i = 0;
        
        return `
    <div class="alert alert-info" style="background-color:#ffffff;border:1px #03B8CF solid; height: 16rem; overflow: scroll;"><div class="row">
    <div class="col-md-7 fyg_tl fyg_fl" style="background-image: url(&quot;${gUsrPath(gUsrActorMap, u.mActor, "L")}&quot;); background-position: center; background-size: contain; background-repeat:no-repeat;">
    <span class="fyg_f18">${pvel ? `${gMsgActorName[u.mActor]}（${gMsgAttrInfo.mIsPVE} Lv.${u.mLevel}）` : `${u.mName}（${gMsgActorName[u.mActor]} Lv.${u.mLevel}）`}</span><br>
        [${gMsgAttrInfo.mHpMax}:${Math.ceil(u.mHpMax)}] [${gMsgAttrInfo.mSdMax}:${Math.ceil(u.mSdMax)}]<br>
        [${gMsgAttrInfo.mSpd}:${Math.ceil(u.mSpd)}]<br>
        [${gMsgAttrInfo.mPowP}:${Math.ceil(u.mPowP)}] [${gMsgAttrInfo.mPowM}:${Math.ceil(u.mPowM)}]<br>
        [${gMsgAttrInfo.mDefP}:${Math.ceil(u.mDefFixP)}] [${gMsgAttrInfo.mDefM}:${Math.ceil(u.mDefFixM)}]<br>
        <br>
    </div>
    <div class="col-md-5 fyg_tr">
        <div class="fyg_nw" style="min-height: 6.75rem;">
        ${u.mEquips.map(
            (e) => `<button type="button" class="btn fyg_colpzbg fyg_mp3" title="${gMsgEquipName[e.mKind]}" style="width: 47px; height: 47px; background-image: url(${gUsrPath(gUsrEquipMap, e.mKind, e.mRank)});" ><br>${e.mLevel}</button>`
        ).join("")}
        </div><br>
        ${Object.keys(gEmuAuraKind).map(
            (n) => a.has(+n) ? `|${gMsgAuraName[n]}|${(++i < 3) ? "" : (i = 0, "<br>")}` : ""
        ).join("")}
    </div></div></div>
    `}).join("")}
    </div></div>
`
            );
        }

        let winner;
        do {
            winner = gArena.step();

            // Display
            T.push(`
            <div class="row"  max-height: 62rem; overflow: scroll;">
            <div class="col-xs-6 fyg_tr fyg_fl">
            ${L.map((u) => `
            <div class="col-xs-12 fyg_fr"><p class="row fyg_mp0 fyg_nw fyg_lh30${u.nIsAct ? " with-padding bg-special" : ""}" style="border-radius:0 2rem 2rem 0;">&nbsp;${u.uiShow()}&nbsp;&nbsp;&nbsp;</p></div>
            ${gRules.VerboseAll ? `<div class="col-xs-12 fyg_fr"><p class="row alert-primary fyg_mp0 fyg_nw fyg_lh30" style="border-radius:0 2rem 2rem 0;">&nbsp;${u.uiDebug()}&nbsp;&nbsp;&nbsp;</p></div>` : ""}
            <div class="col-xs-3 fyg_tc fyg_fr fyg_nw">${u.uiDrawLife()}</div><div class="col-xs-9 fyg_fl"><p class="fyg_mp0 fyg_nw fyg_lh30 fyg_tr">&nbsp;${u.uiDrawDmg()}</p></div>
            <div class="col-xs-12 fyg_fr"><p class="row bg-blue fyg_pvedt fyg_mp0 fyg_fr" style="width:${u.uiSdBarWidth()}%;"></p></div>
            <div class="col-xs-12 fyg_fr"><p class="row bg-red fyg_pvedt fyg_mp0 fyg_fr" style="width:${u.uiHpBarWidth()}%;"></p></div>
            `).join("")}
            </div>
            <div class="col-xs-6 fyg_tl fyg_fr">
            ${R.map((u) => `
            <div class="col-xs-12 fyg_fr"><p class="row fyg_mp0 fyg_nw fyg_lh30${u.nIsAct ? " with-padding bg-special" : ""}" style="border-radius:2rem 0 0 2rem;">&nbsp;${u.uiShow()}&nbsp;&nbsp;&nbsp;</p></div>
            ${gRules.VerboseAll ? `<div class="col-xs-12 fyg_fr"><p class="row alert-primary fyg_mp0 fyg_nw fyg_lh30" style="border-radius:2rem 0 0 2rem;">&nbsp;${u.uiDebug()}&nbsp;&nbsp;&nbsp;</p></div>` : ""}
            <div class="col-xs-3 fyg_tc fyg_fl fyg_nw">${u.uiDrawLife()}</div><div class="col-xs-9 fyg_fl"><p class="fyg_mp0 fyg_nw fyg_lh30 fyg_tl">&nbsp;${u.uiDrawDmg()}</p></div>
            <div class="col-xs-12 fyg_tc fyg_fl"><p class="row bg-blue fyg_pvedt fyg_mp0 fyg_fl" style="width:${u.uiSdBarWidth()}%;"></p></div>
            <div class="col-xs-12 fyg_tc fyg_fl"><p class="row bg-red fyg_pvedt fyg_mp0 fyg_fl" style="width:${u.uiHpBarWidth()}%;"></p></div>
            `).join("")}
            </div>
            </div>
            <hr style="border-top: 0.1rem solid #e5e5e5;">
            `);

            gArena.clear();

        } while (winner > 2 && nRoundNow++ < gArena.Rounds);

        switch (winner) {

        // Round over
        case 3:
            T.push(`
            <div class="row">
        <div class="col-xs-12">&nbsp;</div>
        <div class="col-xs-12"><div class="alert alert-info with-icon" style="border:1px #03B8CF solid;"><h4>${gMsgPanelDesc.PKRoundOver}</h4></div></div>
        </div>
            `);

        // Draw
        case 0:

        // Attacker died
        case 2:
            T.push(`
            <div class="row">
    <div class="col-xs-12">&nbsp;</div>
    <div class="col-xs-12"><div class="alert alert-info with-icon fyg_tc" style="border:1px #03B8CF solid;"><i class="icon icon-frown"></i><h2>${(pvel ? R.map(u => gMsgActorName[u.mActor]) : R.map(u => u.mName)).join(" & ")}${gMsgPanelDesc.PKWinner}</h2></div></div>
    </div>
            `);
            break;

        // Defender died
        case 1:
            T.push(`
            <div class="row">
    <div class="col-xs-12">&nbsp;</div>
    <div class="col-xs-12"><div class="alert alert-danger with-icon fyg_tc" style="border:1px #EA644A solid;"><i class="icon icon-smile"></i><h2>${(pver ? L.map(u => gMsgActorName[u.mActor]) : L.map(u => u.mName)).join(" & ")}${gMsgPanelDesc.PKWinner}</h2></div></div>
    </div>
            `);
        }

        T.push(`
        </div></div>
        `)

        // Fill results to the battle log.
        elOutputBody.innerHTML = T.join("");
    };

    // API: Console Debug
    window.emuSelfTest = () => {

        elConfigLeftUnit.innerHTML = "";
        elConfigRightUnit.innerHTML = "";
        const l = emuPkUnitCtor(elConfigLeftUnit);
        const r = emuPkUnitCtor(elConfigRightUnit);

        const 
            unitA = l._unit, unitB = r._unit,
            cardA = unitA.mCard, cardB = unitB.mCard
        ;

        unitA.mGrowth = 1000000;
        cardA.mStr = cardA.mAgi = cardA.mInt = cardA.mVit = cardA.mSpr = cardA.mMnd = 99999;
        
        cardB.mSpr = cardB.mVit = 999999;

        unitA.set();
        unitB.set();

        unitA.nPowRatP = unitA.nPowRatM = unitA.nSpdRat = unitA.nRecRat = unitA.nHpRat = unitA.nSdRat = unitA.nAtkRatP = unitA.nAtkRatM = 
        unitA.nLchRat = unitA.nRflRat = unitA.nCrtRat = unitA.nSklRat = unitA.nDodRat = unitA.nEvaRat = unitA.nDefRatP = unitA.nDefRatM = Infinity;

        Object.keys(gEmuArt1Kind).forEach((k) => unitA.nArt1.add(+k));
        Object.keys(gEmuArt2Kind).forEach((k) => unitA.nArt2.add(+k));
        Object.keys(gEmuArt3Kind).forEach((k) => unitA.nArt3.add(+k));
        Object.keys(gEmuEquipKind).forEach((k) => unitA.nMyst.add(+k));
        Object.keys(gEmuAuraKind).forEach((k) => unitA.nAura.add(+k));
        Object.keys(gEmuStatusKind).forEach((k) => unitA["b"+k] = !0);

        // Edge case testing
        unitA.cHpRecRat = unitA.cSdRecRat = unitA.cPowRatP = unitA.cPowRatM = unitA.cSpdRat =
        unitA.cAtkRatP = unitA.cAtkRatM = unitA.cAtkRatC = unitA.cAtkFixP = unitA.cAtkFixM = unitA.cAtkFixC = 
        unitA.cDefRatP = unitA.cDefRatM = unitA.cDefFixP = unitA.cDefFixM =
        unitA.cSklRat = unitA.cCrtRat = unitA.cEvaRat = unitA.cDodRat = unitA.cLchRat = unitA.cRflRat = Infinity;
        unitA.cUndead = 1; unitA.cDodge = 2; unitA.cMirror = 7;

        // Object.keys(gEmuArt1Kind).forEach((k) => unitB.nArt1.add(+k));
        // Object.keys(gEmuArt2Kind).forEach((k) => unitB.nArt2.add(+k));
        // Object.keys(gEmuArt3Kind).forEach((k) => unitB.nArt3.add(+k));
        Object.keys(gEmuEquipKind).forEach((k) => unitB.nMyst.add(+k));
        // Object.keys(gEmuAuraKind).forEach((k) => unitB.nAura.add(+k));
        unitB.nArt2.add(3002);
        unitB.nArt2.add(3008);
        unitB.nAura.add(901);

        emuPkUnitUpdate(l);
        emuPkUnitUpdate(r);
        emuPkUnitCtor(elConfigLeftUnit, unitA);
        emuPkUnitCtor(elConfigRightUnit, unitB);

        emuStartBattle();
    }

    elRoot.append(elBoard, elConfig, elOutput, elManual);

    elBoard.onload = () => {
        elBoardRankTxt.textContent = gMsgPanelName.Rank;
        elBoardRank.innerHTML = gUsrJson.Rank;
        elBoardProgTxt.textContent = gMsgPanelName.Prog;
        elBoardProg.innerHTML = gUsrJson.Prog;
        elBoardBattleName.innerHTML = gMsgPanelName.PkBattle;
        elBoardBattleDesc.textContent = gMsgPanelDesc.PkBattle;
        elBoardLoaderName.innerHTML = gMsgPanelName.PkLoader;
        elBoardLoaderDesc.textContent = gMsgPanelDesc.PkLoader;
        elBoardButton1Name.innerHTML = gMsgPanelName.PkButton1;
        elBoardButton1Desc.textContent = gMsgPanelDesc.PkButton1;
        elBoardButton2Name.innerHTML = gMsgPanelName.PkButton2;
        elBoardButton2Desc.textContent = gMsgPanelDesc.PkButton2;
        elBoardButton3Name.innerHTML = gMsgPanelName.PkButton3;
        elBoardButton3Desc.textContent = gMsgPanelDesc.PkButton3;
        elBoardFuelTxt.textContent = gMsgPanelName.Fuel;
        elBoardFuel.innerHTML = gUsrJson.Fuel;
        elBoardRecover.innerHTML =gMsgPanelName.Recover;
        elBoardConfirmA.innerHTML = gMsgPanelName.RecoverA + gUsrJson.Cost + gMsgPanelName.RecoverB;
        elBoardNpcStrTxt.textContent = gMsgPanelName.NpcStr;
        elBoardNpcStr.innerHTML = gUsrJson.NpcLv;
    };

    elConfig.onload = () => {
        elConfigHead.innerHTML = gMsgPanelName.Config;
        
        elConfigLeftImport.innerHTML = elConfigRightImport.innerHTML = gMsgPanelName.Import;
        elConfigLeftExport.innerHTML = elConfigRightExport.innerHTML = gMsgPanelName.Export;
        elConfigLeftCreate.innerHTML = elConfigRightCreate.innerHTML = gMsgPanelName.Create;
        [...elConfigLeftUnit.children].forEach(emuPkUnitUpdate);
        [...elConfigRightUnit.children].forEach(emuPkUnitUpdate);

        elEditorConfirm.innerHTML = gMsgPanelName.Confirm;
        elEditorClose.innerHTML = gMsgPanelName.Close;
        Object.keys(gEmuActorKind).forEach((k, i) => {
            elEditorKind.children[i].innerHTML = gMsgActorName[k];
        });
        elEditorPointLeft.innerHTML = gMsgAttrName.mPoint || "mPoint";
        elEditorSkillLeft.innerHTML = gMsgAttrName.mSkill || "mSkill";
        elEditorNaviActor.firstChild.innerHTML = gMsgPanelName.Card;
        elEditorNaviEquip.firstChild.innerHTML = gMsgPanelName.Equip;
        elEditorNaviAuras.firstChild.innerHTML = gMsgPanelName.Aura;
        elEditorNaviWishs.firstChild.innerHTML = gMsgPanelName.Wish;
        elEditorNaviAmulet.firstChild.innerHTML = gMsgPanelName.Amulet;
        Object.keys(gLytPk.EditorActor).forEach((k, i) => {
            elEditorActor.children[i].firstChild.innerHTML = gMsgAttrName[k] || k;
        });
        [...elEditorEquipList.children].forEach(emuPkEquipUpdate);
        elEditorEquipCreate.innerHTML = gMsgPanelName.Create;
        elEditorEquipRemove.innerHTML = gMsgPanelName.Remove;
        Object.keys(gEmuAuraKind).forEach((k, i) => {
            const E = elEditorAuras.children[i], A = E.children;
            E.title = gMsgAuraDesc[k];
            A[0].innerHTML = `&nbsp;${gMsgAuraName[k]}`;
            A[2].innerHTML = `${gMsgPanelName.Require} ${gEmuAuraKind[k].cost} ${gMsgPanelName.Point}`;
        });
        Object.keys(gLytPk.EditorWishs).forEach((k, i) => {
            elEditorWishs.children[i].firstChild.innerHTML = gMsgAttrName[k] || k;
        });
        Object.keys(gLytPk.EditorAmulet).forEach((k, i) => {
            elEditorAmulet.children[i].firstChild.innerHTML = gMsgAttrName[k] || k;
        });

    };

    elOutput.onload = () => {
        elOutputHead.innerHTML = gMsgPanelName.Output;
    };

    elManual.onload = () => {
        elManual.innerHTML = `
<div class="panel panel-info">
<div class="panel-heading">
    ${gMsgPanelName.Manual}
</div>
<div class="panel-body">
    <i class="icon icon-bolt text-danger">${gMsgPanelDesc.ManPowerP}</i>&nbsp;&nbsp;
    <i class="icon icon-bolt text-primary">${gMsgPanelDesc.ManPowerM}</i>&nbsp;&nbsp;
    <i class="icon icon-bolt text-warning">${gMsgPanelDesc.ManPowerA}</i>&nbsp;&nbsp;
    <i class="icon icon-minus text-danger">${gMsgPanelDesc.ManDamageH}</i>&nbsp;&nbsp;
    <i class="icon icon-minus text-info">${gMsgPanelDesc.ManDamageS}</i>&nbsp;&nbsp;
    <i class="icon icon-plus text-danger">${gMsgPanelDesc.ManRecoverH}</i>&nbsp;&nbsp;
    <i class="icon icon-plus text-info">${gMsgPanelDesc.ManRecoverS}</i>
    <br><br>
    ${gMsgPanelDesc.Manual}
</div>
</div>
        `;
    };


})();


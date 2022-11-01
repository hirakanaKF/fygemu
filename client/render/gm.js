/*
Project: fygemu
Authors: hirakana@kf
*/

(() => {
    
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Conponents *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------

    let 
        gEditorNode, gEditorUnit, gEditorUser, gEditorActor, gEditorAuras, gEditorWishs, gEditorAmulet, gEditorGems, gEditorDice, gEditorNavi, gEditorBody,
        gBattleData, gRollerData
    ;

    const 

    gReqIt = (function *() {
        do {
            for (const c of "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=") { yield c; }
        } while (!0);
    })(),
    gReqArg = {},

    // Unit template
    gRule = window.Kernel ? Kernel.Rules : {"Clock":0,"Scales":1,"Rounds":256,"SklAdd":256,"CrtAdd":256,"SklOff":1.0,"CrtOff":1.0,"HpHeal":1.0,"SdHeal":1.0,"RflMtL":[1,0,0,0,1,0,0,0,0],"RflMtR":[1,0,0,0,1,0,0,0,0],"LchMtL":[1,0,0,1],"LchMtR":[1,0,0,1],"SpdMin":-Number.MAX_VALUE},

    // Dashboard
    elBoard = uiPanel4({root: {tag: "div", classList: "fyg_gm row css-debug"}, panel: {tag: "div", classList: "panel panel-primary"}, body: [{tag: "div", classList: "panel-body", style: "max-height: 108rem; overflow-x: hidden; overflow-y: scroll;"}], hide: !0}),
    elBoardSvcLoad = document.createElement("button"),
    elBoardSvcSave = document.createElement("button"),
    elBoardSvcEmu = document.createElement("button"),
    elBoardSvcSvc = document.createElement("button"),
    elBoardSvcRes = document.createElement("button"),
    elBoardSvcUsr = document.createElement("button"),

    // Config
    elConfig = uiPanel4({root: {tag: "div", classList: "fyg_gm row css-debug"}, panel: {tag: "div", classList: "panel panel-primary"}, body: [{tag: "div", classList: "panel-body", style: "max-height: 108rem; overflow-x: hidden; overflow-y: scroll;"}], hide: !0}),
    elBtnBattle = uiButton3({}),
    elBtnLoader = uiButton3({}),
    elBtnRoller = uiButton3({}),
    elConfigRule = document.createElement("div"),
    elConfigRuleEnable = document.createElement("input"),
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
    elEditorMyst = document.createElement("input"),
    elEditorPoint = document.createElement("div"),
    elEditorPointLeft = document.createElement("span"),
    elEditorPointRight = document.createElement("span"),
    elEditorSkill = document.createElement("div"),
    elEditorSkillLeft = document.createElement("span"),
    elEditorSkillRight = document.createElement("span"),
    elEditorImage = document.createElement("img"),
    elEditorMain = document.createElement("div"),
    elEditorNavi = document.createElement("ul"),
    elEditorNaviUser = document.createElement("li"),
    elEditorNaviActor = document.createElement("li"),
    elEditorNaviEquip = document.createElement("li"),
    elEditorNaviAuras = document.createElement("li"),
    elEditorNaviWishs = document.createElement("li"),
    elEditorNaviAmulet = document.createElement("li"),
    elEditorUser = document.createElement("div"),
    elEditorActor = document.createElement("div"),
    elEditorEquip = document.createElement("div"),
    elEditorEquipList = document.createElement("div"),
    elEditorEquipCreate = document.createElement("button"),
    elEditorEquipRemove = document.createElement("button"),
    elEditorAuras = document.createElement("div"),
    elEditorWishs = document.createElement("div"),
    elEditorAmulet = document.createElement("div"),
    elEditorGemsDiv = document.createElement("details"),
    elEditorGems = document.createElement("div"),
    elEditorDiceDiv = document.createElement("details"),
    elEditorDice = document.createElement("div"),

    // Output
    elOutput = uiPanel4({root: {tag: "div", classList: "fyg_gm row css-debug"}, panel: {tag: "div", classList: "panel panel-primary"}, body: [{tag: "div", classList: "panel-body", style: "max-height: 108rem; overflow-x: hidden; overflow-y: scroll;"}, {tag: "div", classList: "panel-body", style: "max-height: 108rem; overflow-x: hidden; overflow-y: scroll;"}, {tag: "div", classList: "panel-body", style: "max-height: 108rem; overflow-x: hidden; overflow-y: scroll;"}], hide: !0}),
    
    // 
    reqPush = (d) => {
        const i = gReqIt.next().value;
        gReqArg[i] = d;
        return i;
    },

    // Generate output from an response.
    uiDrawLog = (msg) => {
        const out = elOutput[2];
        out.innerHTML = msg.replaceAll("btn fyg_colpzbg fyg_mp3", "btn fyg_colpzbg fyg_ec").replaceAll("col-md", "col-xs").split(/ys\/icon\/z\/z|\.gif/g).map(
            (s, i) => (i & 1) ? gUsrPath(RES_EQ, ...s.split("_")) : s
        ).join("");

        {
            const elPanel = out.getElementsByClassName("col-xs-7 fyg_tr")[0];
            if (elPanel) {
                const name = elPanel.children[0].innerText.split(/（|）/g), kind = gLdrJson.ActorKeys[name[1].includes("野怪") ? name[2] : name[1].split(" ").at(-1)], s = elPanel.parentElement.parentElement.style;
                s.backgroundPosition = "center";  s.backgroundSize = "contain"; s.backgroundRepeat = "no-repeat"; s.height = "15rem"; s.overflowY = "scroll";
                s.backgroundImage = `url(${gUsrPath(RES_CH, kind, "L")})`;
            }
        }

        {        
            const elPanel = out.getElementsByClassName("col-xs-7 fyg_tl")[0];
            if (elPanel) {
                const name = elPanel.children[0].innerText.split(/（|）/g), kind = gLdrJson.ActorKeys[name[1].includes("野怪") ? name[0] : name[1].split(" ")[0]], s = elPanel.parentElement.parentElement.style;
                s.backgroundPosition = "center";  s.backgroundSize = "contain"; s.backgroundRepeat = "no-repeat"; s.height = "15rem"; s.overflowY = "scroll";
                s.backgroundImage = `url(${gUsrPath(RES_CH, kind, "R")})`;
            }
        }
    },
    
    // Add an unit to array
    uiUnitCtor = (E, d) => {
        const
            unit = Object.assign(JSON.parse($GmBaseUnit), d ?? {}),
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
            _gems = document.createElement("details"),
            _dice = document.createElement("details"),
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

        el.classList = "row fyg_cc";
        el._sel = !1;
        el._head = _head; el._icon = _icon; el._unitr = _unitr;
        el._summary = _summary; el._stats = _stats; el._wish = _wish; el._status = _status; el._details = _details;
        el._equip = _equip;  el._equipc = _equipc; el._equipr = _equipr; el._equipl = _equipl; el._gems = _gems; el._dice = _dice;
        el._pvel = _pvel; el._pver = _pver; el._namel = _namel; el._namer = _namer;
        el._import = _import; el._export = _export; el._editor = _editor; el._remove = _remove;
        el.append(_unitl, _unitr);
        _unitl.classList = "col-xs-12 col-md-2 fyg_lh24";
        _unitl.append(_head, _pvel, _pver);
        _head.classList = "col-xs-4 col-md-12 btn";
        _head.onclick = () => { el._sel = el._sel ? (_head.classList.remove('btn-primary'), !!0) : (_head.classList.add('btn-primary'), !0); } ;
        _head.append(_icon);
        _icon.draggable = !0;
        _icon.classList = "col-xs-12"; _icon.style = "cursor: pointer;"; _icon._elem = el;
        _icon.ondragstart = uiUnitDrag; _icon.onerror = uiImgError;
        _unitr.classList = "col-xs-12 col-md-10 fyg_lh18";
        _unitr.append(_summary, _details);
        _summary.append(document.createElement("br"), _namel, _namer, _editor, _import, _export, _remove);
        _details.classList = "col-xs-12";
        _details.append(
            _stats, document.createElement("hr"), 
            _equip, document.createElement("hr"), 
            _wish, document.createElement("hr"), 
            _gems, document.createElement("hr"), 
            _dice, document.createElement("hr"), 
            _status, document.createElement("hr")
        );
        _pvel.classList = "col-xs-4 col-md-8"; _pver.classList = "col-xs-4 col-md-4"; _pver.type = "checkbox";
        _namel.classList = "col-xs-4 col-md-2";
        _namer.classList = "col-xs-8 col-md-8"; _namer.type = "string";
        _import.onclick = (e) => uiUnitImport(el, e.ctrlKey == USR.RawUnit);
        _export.onclick = (e) => uiUnitExport(el, e.ctrlKey == USR.RawUnit);
        _editor.onclick = () => uiEditorOpen(el);
        _remove.onclick = () => uiUnitDtor(E, el);
        _import.classList = _export.classList = _editor.classList = _remove.classList = "col-xs-11 col-md-2";
        _import.style = _export.style = _editor.style = _remove.style = "padding:1% 0 1% 0; margin:2% 4% 2% 4%;";

        // Draw details
        {
            const flags = document.createElement("div");

            // Attributes
            _namer.onchange = () => { unit.User.name = _namer.value; }
            _pver.onchange = () => { _pver.blur(); unit.$Mode = _pver.checked; }
            _stats.append(document.createElement("summary"));
            for (const k in LYT_GM.Unit) {
                const v = LYT_GM.Unit[k], entry = document.createElement("div"), desc = document.createElement("span"), value = document.createElement("span");
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
                e.onchange = () => { const v = +e.value || 0; e.value = unit.$Actor = v; _icon.src = gUsrPath(RES_CH, v, "Z"); }
                e.onreset = () => _icon.src = gUsrPath(RES_CH, unit.$Actor, "Z");
            }
            
            // Flags
            flags.classList = "row";
            {
                const S = document.createElement("div"), T = LYT_GM.UnitFlag, D = new Set(unit.$Flag);
                el._Flag = D;
                flags.append(S);
                S.append(...T.map(k => {
                    const box = document.createElement("div");
                    box.classList = "btn col-xs-3"; box.style = "";
                    box.onclick = () => {
                        D.delete(k) ? box.classList.remove("btn-primary") : (D.add(k), box.classList.add("btn-primary"));
                        unit.$Flag = [...D];
                    }
                    return box;
                }));
            }
        }

        // Draw equip
        _equip.append(document.createElement("summary"), _equipc, _equipr, _equipl);
        _equipc.classList = "col-xs-11 col-md-5 btn";
        _equipc.style = "margin: 0 4%;";
        _equipc.onclick = () => uiEquipCtor(_equipl);
        _equipc.ondragover = uiElemDragOver;
        _equipc.ondrop = () => uiEquipCopy(_equipl, _equipl._drag._d)
        _equipr.classList = "col-xs-11 col-md-5 btn";
        _equipr.style = "margin: 0 4%;";
        _equipr.ondragover = uiElemDragOver;
        _equipr.ondrop = (e) => uiEquipDtor(_equipl, _equipl._drag);
        _equipr.onclick = () => uiEquipDtor(_equipl, _equipl.lastChild);
        _equipl.ondragover = uiElemDragOver;
        _equipl.ondrop = (e) => uiElemDrop(_equipl, _equipl, e);
        _equipl.classList = "col-xs-12 fyg_ls";
        unit.Equip.forEach((e) => uiEquipCtor(_equipl, e));

        // Draw wish, gems, dice
        for (const [S, T, D] of [
            [_wish, LYT_GM.UnitWishs, unit.Wish],
            [_dice, LYT_GM.UnitDice, unit.Dice],
            [_gems, LYT_GM.UnitGems, unit.Gems]
        ]) {
            S.append(document.createElement("summary"));

            // Attributes
            for (const k of T) {
                const entry = document.createElement("div"), desc = document.createElement("span"), value = document.createElement("input");
                S.append(entry);
                entry.classList = "col-xs-12";
                entry.append(desc, value);
                desc.classList = "col-xs-6 fyg_tl";
                value.classList = "col-xs-6 fyg_tr"; value.type = "string";
                value.onchange = () => { value.value = D[k] = +value.value || 0; };
            }
        }
        
        // Draw status
        _status.append(document.createElement("summary"));
        for (const k of LYT_GM.UnitStatus) {
            const l = document.createElement("span"), m = document.createElement("input"), r = document.createElement("input"), kn = "c"+k, kl = "b"+k;
            _status.append(l, m, r);
            l.classList = "col-xs-8";
            m.classList = "col-xs-3 fyg_tr"; m.type = "string";
            m.onchange = () => { m.value = unit[kn] = +m.value; }
            r.classList = "col-xs-1"; r.type = "checkbox";
            r.onchange = () => { r.blur(); unit[kl] = r.checked; }
        }
        
        el._unit = unit;
        uiUnitUpdate(el);

        E.append(el);
        return el;
    },

    // Remove an unit from array
    uiUnitDtor = (E, e) => {
        if (e) { E.removeChild(e); }
    },

    uiUnitCopy = (E, d) => uiUnitCtor(E, JSON.parse(JSON.stringify(d))),

    // DragStart callback
    uiUnitDrag = (e) => {
        uiElemDrag(elConfig, e.target._elem);
    },
    
    uiUnitCalcParse = d => {
        const 
            L = d.replaceAll("\r", "").split("\n").map(l => l.replace(/\/\/.*/g, "")),
            A = [], {ActorAbbr, AmulAbbr, EquipAbbr, AuraAbbr} = gLdrJson
        ;
        let p0 = -1, p1;

        L.push("");
        for (p1 in L) {
            if (L[p1].replace(/\s+/g, "")) { continue; }
            if (p1 - p0 < 5) { p0 = p1; continue; }
            
            const unit = JSON.parse($GmBaseUnit), {User, Actor, Equip, Amulet, Wish, Aura} = unit;
            A.push(unit);
            {
                const [k, l, g, s, q] = L[++p0].split(/\s+/g), kind = ActorAbbr[k] ?? "0";
                Actor.K = kind; Actor.Z = LYT_GM.ActorArts[kind] ?? [];
                Actor.L = +l || 0; User.grade = +g || 0; Actor.S = +s || 0; Actor.Q = +q || 0; 
            }
            {
                const [_, ph, ps, a1, a2, a3, pp, pm, hp, sd, sp, ap, am, dp, dm] = L[++p0].split(/\s+/g);
                Wish.ph = +ph || 0; Wish.ps = +ps || 0;
                Wish.a1 = +a1 || 0; Wish.a2 = +a2 || 0; Wish.a3 = +a3 || 0; 
                Wish.pp = +pp || 0; Wish.pm = +pm || 0; Wish.hp = +hp || 0; Wish.sd = +sd || 0;
                Wish.sp = +sp || 0; Wish.ap = +ap || 0; Wish.am = +am || 0; Wish.dp = +dp || 0; Wish.dm = +dm || 0;
            }
            {
                const A = L[++p0].split(/\s+/g);
                let n = A.length - 2;
                while (n > 1) {
                    const v = +A[n--] || 0, a = AmulAbbr[A[n--]] ?? "";
                    for (const k of a) { Amulet[k] = v; }
                }
            }
            {
                const A = L[++p0].split(/\s+/g), L = LYT_FYG.Stat;
                for (const i in L) { Actor[L[i]] = +A[i] || 0; }
            }
            {
                const A = L[--p1].split(/\s+/g);
                Actor.S = +A.shift() || 0;
                for (const k of A) { Aura.push(+AuraAbbr[k] || 0); }
            }
            while (++p0 < p1) {
                const [k, l, t0, t1, t2, t3, m] = L[p0].split(/\s+/g),
                    kind = EquipAbbr[k] ?? "0",
                    q0 = +t0 || 0, q1 = +t1 || 0, q2 = +t2 || 0, q3 = +t3 || 0,
                    q = q0 + q1 + q2 + q3 + (+m || 0) * 100
                ;
                Equip.push({
                    K: kind,
                    R: q < 420 ?
                        q > 318.5 ? 1 : 2 :
                        q < 515.5 ? 3 : q < 585 ? 4 : 5,
                    L: +l || 0,
                    Q: [q0, q1, q2, q3],
                    Z: m ? LYT_GM.EquipMyst[kind] : [],
                    S: [["", 0], ["", 0], ["", 0], ["", 0]]
                });
            }
            p0++;
        }
        return A;
    },

    uiUnitLoadSet = (e, a) => {
        Server[$SoGmUnit](reqPush(e), a);
        uiUnitUpdate(e);
    },

    uiUnitLoadBatchSet = (E, A) => {
        // Import single card
        if (!A.length) {
            const el = uiUnitCtor(E, A);
            return uiUnitLoadSet(el, A);
        }

        // Replace whole array
        E.innerHTML = "";
        A.forEach(a => {
            const el = uiUnitCtor(E, a);
            uiUnitLoadSet(el, a);
        });
    },

    uiUnitLoadRaw = (e, a) => {
        // Setup unit
        const unit = e._unit, out = {...a};
        for (const k of ["User", "Actor", "Amulet", "Wish", "Dice", "Gems"]) {
            const s = a[k], d = unit[k];
            if (s) {
                for (const l in d) { delete d[l]; }
                Object.assign(d, s);
            }
            out[k] = d;
        }
        for (const k of ["Equip"]){
            const s = a[k], d = unit[k];
            if (s) { for (const i in s) { d[i] = s[i]; } }
            out[k] = d;
        }
        {
            const s = a.$Flag, d = unit.$Flag;
            d.splice(0, d.length);
            for (const i of s) { d.push(i); }
            out.$Flag = d;
        }
        for (const k in unit) { delete unit[k]; }
        Object.assign(unit, out);

        // Update components
        uiUnitUpdate(e);
    },

    uiUnitLoadBatchRaw = (E, A) => {
        // Import single card
        if (!A.length) { return uiUnitCtor(E, A); }
            
        // Replace whole array
        E.innerHTML = "";
        A.forEach((a) => uiUnitCtor(E, a));
    },

    // Import from array
    uiUnitImportAll = (E, set) => {
        eIoReader.value = "";
        eIoReader.onchange = 
            () => eIoReader.files[0].text().then(
                d => {
                    let A;
                    for (const p of [
                        JSON.parse,
                        uiUnitCalcParse
                    ]) {
                        try { A = p(d); break; }
                        catch { ; }
                    }
                    return (set ? uiUnitLoadBatchSet : uiUnitLoadBatchRaw)(E, A);
                }
            )
        ;
        eIoReader.click();
    },

    // Import single unit
    uiUnitImport = (el, set) => {
        eIoReader.value = "";
        eIoReader.onchange = () => eIoReader.files[0].text().then(
            d => {
                let a;

                // Parse
                for (const p of [
                    JSON.parse,
                    uiUnitCalcParse
                ]) {
                    try { a = p(d); break; }
                    catch { ; }
                }

                // In case input is an array, import the very first object
                if (a.length) { a = a[0]; }

                // Import
                return (set ? uiUnitLoadSet : uiUnitLoadRaw)(el, a);
            }
        );
        eIoReader.click();
    },

    // Export single unit
    uiUnitExport = el => {
        eIoWriter.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(el._unit, null, 4));
        eIoWriter.download = ".json";
        eIoWriter.click();
    },

    // Update single unit
    uiUnitUpdate = el => {
        const unit = el._unit, equip = unit.Equip, _stats = el._stats;

        el._icon.src = gUsrPath(RES_CH, unit.$Actor, "Z");
        el._icon.onreset = () => gUsrPath(RES_CH, unit.$Actor, "Z");

        {
            const Z = _stats.children;
            let i = 0;
            Z[i++].innerHTML = gMsgData[$MsgNameStats];

            for (const k in LYT_GM.Unit) {
                const [L, R] = Z[i++].children, A = R.children, v = LYT_GM.Unit[k];
                L.innerHTML = gMsgAttrName[k] ?? k;
                for (const j in v) { A[j].value = unit[v[j]]; }
            }
            {
                const S = Z[++i].firstChild.children, T = LYT_GM.UnitFlag, D = el._Flag, C = unit.$Flag;
                D.clear();
                for (const k of C) { D.add(k); }
                T.forEach((k, j) => {
                    const e = S[j];
                    e.innerHTML = $EquSkillName(k);
                    e.classList = D.has(k) ? "btn btn-primary col-xs-3" : "btn col-xs-3";
                });
            }
        }

        el._equip.firstChild.innerHTML = gMsgData[$MsgNameEquip];
        el._equipc.innerHTML = gMsgData[$MsgNameCreate];
        el._equipr.innerHTML = gMsgData[$MsgNameRemove];
        [...el._equipl.children].forEach((e, i) => {            
            Object.assign(e._d, equip[i]);
            uiEquipUpdate(e);
        });

        for (const [Z, S, T, D, W] of [
            [$MsgNameWish, el._wish.children, LYT_GM.UnitWishs, unit.Wish, gMsgWishName],
            [$MsgNameDice, el._dice.children, LYT_GM.UnitDice, unit.Dice, gMsgDiceAttr],
            [$MsgNameGems, el._gems.children, LYT_GM.UnitGems, unit.Gems, gMsgGemName]
        ]) {
            let i = 0;
            S[i++].innerHTML = gMsgData[Z];
            for (const k of T) {
                const [L, R] = S[i++].children;
                L.innerHTML = W[k] ?? k; R.value = D[k];
            }
        }

        {
            const Z = el._status.children;
            let i = 0;
            Z[i++].innerHTML = gMsgData[$MsgNameStatus];
            for (const k of LYT_GM.UnitStatus) {
                Z[i++].innerHTML = gMsgStatusName[k] ?? k;
                Z[i++].value = unit["$Num"+k] || 0;
                Z[i++].checked = unit["$Fix"+k] || !1;
            }
        }
        
        el._pvel.innerHTML =  "PVE:";
        el._pver.checked = unit.$Mode;
        el._namel.innerHTML = gMsgAttrName.Name ?? "Name";
        el._namer.value = unit.User.name;
        el._import.innerHTML = gMsgData[$MsgNameImport];
        el._export.innerHTML = gMsgData[$MsgNameExport];
        el._editor.innerHTML = gMsgData[$MsgNameEditor];
        el._remove.innerHTML = gMsgData[$MsgNameRemove];

    },

    // Export to array
    uiUnitExportAll = (E) => {
        eIoWriter.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify([...E.children].map(el => el._unit), null, 4));
        eIoWriter.download = ".json";
        eIoWriter.click();
    },

    // Add an equip to array
    uiEquipCtor = (E, d) => {
        const
            equip = Object.assign(JSON.parse($GmBaseEquip), d ?? {}),
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

        _eval = () => {
            Server[$SoGmEquip](reqPush(el), equip);
        },

        _evalAttr = (i, q) => {
            const 
                e = _attrs.children[i], [el, em, er] = e.childNodes, {Mul, Add, Tier} = LYT_FYG.Equip,
                x = (q > Tier[1]) ? (q > Tier[3]) ? "danger" : (q > Tier[2]) ? "warning" : "success" : (q > Tier[0]) ? "info" : "primary"
            ;

            e.classList = "col-xs-12 fyg_mp0 fyg_xlxx" + x;
            er.classList = "bg-" + x;
            er.firstElementChild.value = q;
            equip.Q[i] = (q - Add) / Mul;
            _eval();
        }

        ;

        el.classList = "col-xs-12 alert alert-primary";
        el.append(_icon, _main);
        el._update = () => {
            _icon.style.backgroundImage = `url(${gUsrPath(RES_EQ, equip.K, equip.R)})`;
            _myst.innerHTML = $EquSkillDesc((LYT_GM.EquipMyst[equip.K] ?? [])[$EquipMystIndex]);
            _desc.innerHTML = gMsgEquipDesc[equip.K] ?? equip.K;

            const C = _attrs.children, Q = equip.Q, R = equip.S, Cn = C.length, Rn = R.length, {Mul, Add, Tier} = LYT_FYG.Equip;
            let i = 0;
        
            while (i < Cn) {
                const I = i++, e = C[I];

                e.style.display = "";
                try {
                    const q = Q[I] || 0, [k, r] = R[I], x = (q > Tier[1]) ? (q > Tier[3]) ? "danger" : (q > Tier[2]) ? "warning" : "success" : (q > Tier[0]) ? "info" : "primary";
                    const [el, em, er] = e.childNodes;
                    e.classList = "col-xs-12 fyg_mp0 fyg_xlxx" + x;
                    el.textContent = gMsgEquipAttrName[k] ?? k;
                    em.textContent = " " + (r || 0);
                    er.classList = "bg-" + x;
                    er.firstElementChild.value = q * Mul + Add;
                }
                catch {
                    e.style.display = "none";
                }
            }
            while (i < Rn) {
                const 
                    e = document.createElement("p"), er = document.createElement("span"), v = document.createElement("input"),
                    I = i++, q = Q[I] || 0, [k, r] = R[I], x = (q > Tier[1]) ? (q > Tier[3]) ? "danger" : (q > Tier[2]) ? "warning" : "success" : (q > Tier[0]) ? "info" : "primary"
                ;

                _attrs.append(e);
                e.classList = "col-xs-12 fyg_mp0 fyg_xlxx" + x;
                e.append(gMsgEquipAttrName[k] ?? k, " " + (r || 0), er);
                er.classList = "bg-" + x;
                er.style = "width: 33%; float: right;";
                er.append(" ", v, "% ");
                v.classList = "fyg_tr";
                v.style = "width: 66%; margin-left: 5%";
                v.type = "string";
                v.value = q * Mul + Add;
                v.onchange = () => _evalAttr(I, +v.value || 0);
            }
        };

        _icon.draggable = !0;
        _icon.classList = "col-xs-12 col-md-1 btn fyg_colpzbg fyg_ec";
        _icon.ondragstart = (e) => uiElemDrag(el.parentElement, el);
        _icon.onclick = () => {
            const a = _attrs.style;
            _icon.blur();
            if (a.display) {
                a.display = (equip.Z.length > $EquipMystIndex ? _myst : _desc).style.display = "";
                return ;
            }
            a.display = _desc.style.display = _myst.style.display = "none";
        };
        _icon.onreset = () => _icon.style.backgroundImage = `url(${gUsrPath(RES_EQ, equip.K, equip.R)})`;
        _icon.append(document.createElement("br"), equip.L);
        _main.classList = "fyg_eqedit";
        _main.append(_head, _attrs, _desc, _myst);
        _head.classList = `fyg_nw with-padding fyg_colpz0${equip.R}bg`;
        _head.style = "margin: 0.5rem 0;"
        _head.append(_levell, _levelr, _rank, _kind);
        _levell.innerHTML = "Lv. "
        _levelr.classList = "fyg_tr";
        _levelr.style = "width: 20%";
        _levelr.value = equip.L;
        _levelr.onchange = () => { _icon.lastChild.textContent = _levelr.value = equip.L = +_levelr.value; _eval(); };
        {
            const i = equip.R;
            _rank.append(...LYT_GM.EquipRank.map((k) => {
                const e = document.createElement("option"), v = +k;
                e.value = v; e.selected = v == i;
                return e;
            }));
        }
        _rank.onchange = () => {
            const r = +_rank.value || 0; equip.R = r;
            _head.classList = `fyg_nw with-padding fyg_colpz0${r}bg`;
            _icon.style.backgroundImage = `url(${gUsrPath(RES_EQ, equip.K, r)})`;
        }
        _kind.onchange = () => {
            const k = _kind.value
            equip.K = k;
            if (_myst.style.display) { equip.Z = LYT_GM.EquipMyst[k]; }
            _eval();
        };
        {
            const i = equip.K;
            _kind.append(...LYT_GM.EquipKind.map(k => {
                const e = document.createElement("option");
                e.value = k; e.selected = k == i;
                return e;
            }));
        }
        _attrs.style.display = "none";
        _myst.classList = "col-xs-12 bg-danger with-padding";
        _myst.style = "margin: 0.5rem 0; display: none;";
        _myst.onclick = () => { equip.Z = []; _desc.style.display = ""; _myst.style.display = "none"; };
        _desc.classList = "col-xs-12 bg-info with-padding";
        _desc.style = "margin: 0.5rem 0; display: none;";
        _desc.onclick = () => { equip.Z = LYT_GM.EquipMyst[equip.K]; _desc.style.display = "none"; _myst.style.display = ""; };
        el._d = equip; el._rank = _rank; el._kind = _kind;
        uiEquipUpdate(el);
        E.append(el);

        return el;
    },

    // Remove an equip to array
    uiEquipDtor = (E, e) => {
        if (e) { E.removeChild(e); }
    },

    uiEquipCopy = (E, d) => uiEquipCtor(E, JSON.parse(JSON.stringify(d))),

    // Update messages in an equip
    uiEquipUpdate = (e) => {
        const ck = e._kind.children, cr = e._rank.children;
        LYT_GM.EquipRank.forEach((k, i) => { cr[i].innerHTML = gMsgEquipRankName[k] ?? k; });
        LYT_GM.EquipKind.forEach((k, i) => { ck[i].innerHTML = gMsgEquipName[k] ?? k; });
        e._update();
    },

    // Open the editor
    uiEditorOpen = (e) => {
        const u = e._unit;
        gEditorNode = e;
        gEditorUnit = u;
        gEditorUser = u.User;
        gEditorActor = u.Actor;
        gEditorAuras = new Set(u.Aura);
        gEditorWishs = u.Wish;
        gEditorAmulet = u.Amulet;
        gEditorGems = u.Gems;
        gEditorDice = u.Dice;

        const kind = gEditorActor.K;

        // Load unit stats
        LYT_GM.ActorKind.forEach((k, i) => {
            elEditorKind.children[i].selected = (kind == k);
        });
        elEditorEquipList.append(...e._equipl.children);
        Object.values(LYT_GM.EditorUser).forEach((k, i) => {
            elEditorUser.children[i].lastChild.value = gEditorUser[k];
        });
        Object.values(LYT_GM.EditorActor).forEach((k, i) => {
            elEditorActor.children[i].lastChild.value = gEditorActor[k];
        });
        elEditorMyst.checked = gEditorActor.Z.length > $ActorMystIndex;
        LYT_GM.EditorAura.forEach((k, i) => {
            const c = elEditorAuras.children[i].classList;
            gEditorAuras.has(+k) ?  c.add("btn-primary") : c.remove("btn-primary");
        });
        LYT_GM.EditorWishs.forEach((k, i) => {
            elEditorWishs.children[i].lastChild.value = gEditorWishs[k];
        });
        LYT_GM.EditorAmulet.forEach((k, i) => {
            elEditorAmulet.children[i].lastChild.value = gEditorAmulet[k];
        });
        LYT_GM.EditorGems.forEach((k, i) => {
            elEditorGems.children[i].lastChild.value = gEditorGems[k];
        });
        LYT_GM.EditorDice.forEach((k, i) => {
            elEditorDice.children[i].lastChild.value = gEditorDice[k];
        });
        Server[$SoGmActor](7, gEditorActor);

        // Switch to page
        elEditorMeta.style.display = "block";
        elEditorMain.style.display = "block";
        elConfigLeft.style.display = "none";
        elConfigRight.style.display = "none";
    },

    // Close the editor
    uiEditorClose = () => {
        // Set auras
        gEditorUnit.Aura = [...gEditorAuras];

        // Clear all equips
        gEditorNode._equipl.append(...elEditorEquipList.children);

        // Switch back to configuration panel
        elEditorMeta.style.display = "none";
        elEditorMain.style.display = "none";
        elConfigLeft.style.display = "block";
        elConfigRight.style.display = "block";
    },

    // Close the editor, with writting to card stats
    uiEditorConfirm = () => {
        gEditorUnit.Equip = [...elEditorEquipList.children].map((e) => e._d);
        uiEditorClose();
        Server[$SoGmUnit](reqPush(gEditorNode), gEditorUnit);
    },

    //
    uiEditorSyncImage = () => {
        const kind = gEditorActor.K;
        elEditorImage.src = gUsrPath(RES_CH, kind, "N");
    },

    // 
    uiEditorSyncPoint = () => {
        const 
            pnow = LYT_FYG.Stat.reduce((n, k) => n + gEditorActor[k] ?? 0, 0),
            pmax = gEditorActor.p
        ;

        elEditorPointRight.classList = (pnow > pmax) ? "col-xs-12 col-md-6 with-padding bg-danger fyg_tc" : "col-xs-12 col-md-6 with-padding bg-success fyg_tc";
        elEditorPointRight.innerHTML = `${pnow} / ${pmax}`;
    },

    //
    uiEditorSyncSkill = () => {
        const snow = gEditorAuras.size, smax = gEditorActor.S;

        elEditorSkillRight.classList = (snow > smax) ? "col-xs-12 col-md-6 with-padding bg-danger fyg_tc" : "col-xs-12 col-md-6 with-padding bg-success fyg_tc";
        elEditorSkillRight.innerHTML = `${snow} / ${smax}`;
    }

    ;
    
    // Dashboard
    elBoard[1].append(elBoardSvcLoad, elBoardSvcSave, elBoardSvcEmu, elBoardSvcSvc, elBoardSvcUsr, elBoardSvcRes);
    elBoardSvcLoad.classList = "btn btn-danger col-xs-6 fyg_lh30 fyg_f18";
    elBoardSvcSave.classList = "btn btn-success col-xs-6 fyg_lh30 fyg_f18";
    elBoardSvcEmu.classList = elBoardSvcSvc.classList = elBoardSvcUsr.classList = elBoardSvcRes.classList = "btn col-xs-3 fyg_lh_30 fyg_f18";
    elBoardSvcLoad.onclick = () => {
        eIoReader.value = "";
        eIoReader.onchange = () => eIoReader.files[0].text().then(JSON.parse).then((d) => Server[$SoRpLoad](d) && elBoardSvcLoad.blur());
        eIoReader.click();
    };
    elBoardSvcSave.onclick = () => Server[$SoRpSave]();
    elBoardSvcEmu.onclick = () => {
        eIoReader.value = "";
        eIoReader.onchange = () => eIoReader.files[0].text().then(JSON.parse).then((d) => Server[$SoGmCfgEmu](d) || elBoardSvcEmu.blur());
        eIoReader.click();
    };
    elBoardSvcSvc.onclick = () => {
        eIoReader.value = "";
        eIoReader.onchange = () => eIoReader.files[0].text().then(JSON.parse).then((d) => Server[$SoGmCfgSvc](d) || elBoardSvcSvc.blur());
        eIoReader.click();
    };
    elBoardSvcUsr.onclick = () => {
        eIoReader.value = "";
        eIoReader.onchange = () => eIoReader.files[0].text().then(JSON.parse).then((d) => Server[$SoGmCfgUsr](d) || elBoardSvcUsr.blur());
        eIoReader.click();
    };
    elBoardSvcRes.onclick = () => {
        eIoReader.value = "";
        eIoReader.onchange = () => eIoReader.files[0].text().then(JSON.parse).then((d) => Server[$SoGmCfgRes](d) || elBoardSvcRes.blur());
        eIoReader.click();
    };
    
    // Config
    elBtnBattle.onclick = (e) => {
        const L = [], R = [];

        elBtnBattle.disabled = !0;
        
        // Left Team
        for (const el of elConfigLeftUnit.children) {
            if (!el._sel) { continue; }
            L.push(el._unit);
        }

        // Right Team
        for (const el of elConfigRightUnit.children) {
            if (!el._sel) { continue; }
            R.push(el._unit);
        }

        // Fill results to the battle log.
        Server[$SoGmBattle](elConfigRuleEnable.checked ? gRule : null, L, R).then(() => {
            elBtnBattle.blur();
            elBtnBattle.disabled = !1;
        });
    };
    elBtnLoader.onclick = (e) => { elBtnLoader.blur(); eIoReader.value = ""; eIoReader.value=''; eIoReader.onchange = () => eIoReader.files[0].text().then(uiDrawLog); eIoReader.click();};
    elBtnRoller.onclick = (e) => {
        let N, L, R;

        elBtnRoller.disabled = !0;
        
        // Left Team
        for (const el of elConfigLeftUnit.children) {
            if (!el._sel) { continue; }
            L = el._unit.Dice; break;
        }

        // Right Team
        for (const el of elConfigRightUnit.children) {
            if (!el._sel) { continue; }
            R = el._unit.Dice; N = el._unit.User.name; break;
        }

        // Check if valid
        if (!L || !R) {
            elBtnRoller.disabled = !1;
            return;
        }

        // Fill results to the battle log.
        Server[$SoGmRoll](N, L, R).then(() => {
            elBtnRoller.blur();
            elBtnRoller.disabled = !1;
        });
    };

    elConfig[1].append(elConfigRule, elConfigLeft, elConfigRight, elEditorMeta, elEditorMain);
    elConfigRule.classList = "col-xs-12 alert fyg_cc";
    elConfigRule.append(elConfigRuleEnable);
    elConfigRuleEnable.classList = "row col-xs-12"; elConfigRuleEnable.type = "checkbox";
    for (const k in LYT_GM.Arena) {
        const v = LYT_GM.Arena[k], d = document.createElement("div"), l = document.createElement("div"), r = document.createElement("input");
        d.classList = "col-xs-12 col-md-3";
        l.classList = "col-xs-6 fyg_nw"; l.innerHTML = k;
        r.classList = "col-xs-6 fyg_tr"; r.type = "string"; r.value = gRule[v];
        if (gRule[v].length) {
            r.onblur = () => { r.value = gRule[v] = r.value.split(",").map(n => +n); };
        }
        else {
            r.onblur = () => { r.value = gRule[v] = +r.value; };
        }
        elConfigRule.append(d);
        d.append(l, r);
    }
    elConfigLeft.classList = "col-xs-12 col-md-6 alert alert-danger fyg_cl";
    elConfigLeft.append(elConfigLeftHead, elConfigLeftUnit);
    elConfigLeftHead.append(elConfigLeftCreate, elConfigLeftImport, elConfigLeftExport);
    elConfigLeftImport.style = "width: 30%; padding: 1%; margin: 0.25rem 1%;";
    elConfigLeftImport.onclick = (e) => uiUnitImportAll(elConfigLeftUnit, e.ctrlKey == USR.RawUnit);
    elConfigLeftExport.style = "width: 30%; padding: 1%; margin: 0.25rem 2%;";
    elConfigLeftExport.onclick = (e) => uiUnitExportAll(elConfigLeftUnit);
    elConfigLeftCreate.style = "width: 30%; padding: 1%; margin: 0.25rem 2%;";
    elConfigLeftCreate.onclick = () => uiUnitCtor(elConfigLeftUnit);
    elConfigLeftCreate.ondragover = uiElemDragOver;
    elConfigLeftCreate.ondrop = () => uiUnitCopy(elConfigLeftUnit, elConfig._drag._unit);
    elConfigLeftUnit.classList = "fyg_ls";
    elConfigLeftImport.ondragover = elConfigLeftExport.ondragover = 
    elConfigLeftUnit.ondragover = uiElemDragOver;
    elConfigLeftImport.ondrop = elConfigLeftExport.ondrop = 
    elConfigLeftUnit.ondrop = (e) => uiElemDrop(elConfig, elConfigLeftUnit, e);
    elConfigRight.classList = "col-xs-12 col-md-6 alert alert-info fyg_cr";
    elConfigRight.append(elConfigRightHead, elConfigRightUnit);
    elConfigRightHead.append(elConfigRightCreate, elConfigRightImport, elConfigRightExport);
    elConfigRightImport.style = "width: 30%; padding: 1%; margin: 0.25rem 1%;";
    elConfigRightImport.onclick = (e) => uiUnitImportAll(elConfigRightUnit, e.ctrlKey == USR.RawUnit);
    elConfigRightExport.style = "width: 30%; padding: 1%; margin: 0.25rem 2%;";
    elConfigRightExport.onclick = (e) => uiUnitExportAll(elConfigRightUnit);
    elConfigRightCreate.style = "width: 30%; padding: 1%; margin: 0.25rem 2%;";
    elConfigRightCreate.onclick = () => uiUnitCtor(elConfigRightUnit);
    elConfigRightCreate.ondragover = uiElemDragOver;
    elConfigRightCreate.ondrop = () => uiUnitCopy(elConfigRightUnit, elConfig._drag._unit);
    elConfigRightUnit.classList = "fyg_ls";
    elConfigRightImport.ondragover = elConfigRightExport.ondragover = 
    elConfigRightUnit.ondragover = uiElemDragOver;
    elConfigRightImport.ondrop = elConfigRightExport.ondrop = 
    elConfigRightUnit.ondrop = (e) => uiElemDrop(elConfig, elConfigRightUnit, e);

    // Editor
    gEditorNavi = elEditorNaviUser;
    gEditorBody = elEditorUser;
    elEditorMeta.classList = "col-xs-12 col-md-3"
    elEditorMeta.style.display = "none";
    elEditorMeta.append(elEditorInfo);
    elEditorInfo.classList = "col-xs-12 col-md-11 panel panel-primary";
    elEditorInfo.append(elEditorClose, elEditorConfirm, elEditorLine, elEditorImage, elEditorKind, elEditorMyst, elEditorPoint, elEditorSkill);
    elEditorConfirm.classList = "col-xs-5 fyg_lh40";
    elEditorConfirm.style = `padding: 1%; margin: 1% 4%;`;
    elEditorConfirm.onclick = uiEditorConfirm;
    elEditorClose.classList = "col-xs-5 fyg_lh40";
    elEditorClose.style = `padding: 1%; margin: 1% 4%;`;
    elEditorClose.onclick = uiEditorClose;
    elEditorLine.classList = "row";
    elEditorKind.classList = "col-xs-5 col-md-9";
    for (const k of LYT_GM.ActorKind) {
        const e = document.createElement("option");
        e.value = k;
        elEditorKind.append(e);
    }
    elEditorKind.onchange = () => {
        const K = elEditorKind.value;
        elEditorKind.value = gEditorActor.K = K; 
        gEditorActor.Z = LYT_GM.ActorArts[gEditorActor.K].concat(elEditorMyst.checked ? LYT_GM.ActorMyst[gEditorActor.K] : []);
        Server[$SoGmActor](3, gEditorActor);
    };
    elEditorMyst.classList = "col-xs-1 col-md-3";
    elEditorMyst.type = "checkbox";
    elEditorMyst.onclick = () => gEditorActor.Z = LYT_GM.ActorArts[gEditorActor.K].concat(elEditorMyst.checked ? LYT_GM.ActorMyst[gEditorActor.K] : []);
    elEditorPoint.classList = "col-xs-6 col-md-12 btn-group fyg_nw";
    elEditorPoint.append(elEditorPointLeft, elEditorPointRight);
    elEditorPointLeft.classList = "col-xs-12 col-md-6 with-padding bg-default fyg_tc";
    elEditorSkill.classList = "col-xs-6 col-md-12 btn-group";
    elEditorSkill.append(elEditorSkillLeft, elEditorSkillRight);
    elEditorSkillLeft.classList = "col-xs-12 col-md-6 with-padding bg-default fyg_tc";
    elEditorImage.classList = "col-xs-6 col-md-12 fyg_stand";
    elEditorImage.onerror = uiImgError;
    elEditorImage.onreset = () => gEditorActor ? elEditorImage.src = gUsrPath(RES_CH, gEditorActor.K, "N") : 0;

    elEditorMain.classList = "col-xs-12 col-md-9 panel panel-primary";
    elEditorMain.style.display = "none";
    elEditorMain.append(elEditorNavi, elEditorUser, elEditorActor, elEditorEquip, elEditorAuras, elEditorWishs, elEditorAmulet);
    elEditorNavi.classList = " nav nav-secondary nav-justified";
    elEditorNavi.append(elEditorNaviUser, elEditorNaviActor, elEditorNaviEquip, elEditorNaviAuras, elEditorNaviWishs, elEditorNaviAmulet);
    for (const [el, er] of [
        [elEditorNaviUser, elEditorUser],
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

    for (const k in LYT_GM.EditorUser) {
        const v = LYT_GM.EditorUser[k], d = document.createElement("div"), l = document.createElement("span"), r = document.createElement("input");
        d.classList = "col-xs-12 col-md-12";
        l.classList = "col-xs-4 fyg_nw";
        r.classList = "col-xs-8 fyg_tr"; r.type = "string";
        r.onblur = () => { r.value = gEditorUser[v] = +r.value; };
        elEditorUser.append(d);
        d.append(l, r);
    }
    for (const k in LYT_GM.EditorActor) {
        const v = LYT_GM.EditorActor[k], d = document.createElement("div"), l = document.createElement("span"), r = document.createElement("input");
        d.classList = "col-xs-12 col-md-12";
        l.classList = "col-xs-4 fyg_nw";
        r.classList = "col-xs-8 fyg_tr";
        r.type = "string";
        switch (v) {
        case "L":
        case "Q":
            r.onblur = () => { r.value = gEditorActor[v] = +r.value; Server[$SoGmActor](2, gEditorActor); };
            break;
        case "S":
            r.onblur = () => { r.value = gEditorActor[v] = +r.value; uiEditorSyncSkill(); };
            break;
        default:
            r.onblur = () => { r.value = gEditorActor[v] = +r.value; uiEditorSyncPoint(); };
        }
        elEditorActor.append(d);
        d.append(l, r);
    }
    elEditorEquip.append(elEditorEquipCreate, elEditorEquipRemove, document.createElement("hr"), elEditorEquipList);
    elEditorEquipCreate.classList = "col-xs-11 col-md-5 btn";
    elEditorEquipCreate.style = "margin: 0 4%;";
    elEditorEquipCreate.onclick = () => uiEquipCtor(elEditorEquipList);
    elEditorEquipCreate.ondragover = uiElemDragOver;
    elEditorEquipCreate.ondrop = () => uiEquipCopy(elEditorEquipList, elEditorEquipList._drag._d);
    elEditorEquipRemove.classList = "col-xs-11 col-md-5 btn";
    elEditorEquipRemove.style = "margin: 0 4%;";
    elEditorEquipRemove.ondragover = uiElemDragOver;
    elEditorEquipRemove.ondrop = () => uiEquipDtor(elEditorEquipList, elEditorEquipList._drag);
    elEditorEquipRemove.onclick = () => uiEquipDtor(elEditorEquipList, elEditorEquipList.lastChild);
    elEditorEquipList.ondragover = uiElemDragOver;
    elEditorEquipList.ondrop = (e) => uiElemDrop(elEditorEquipList, elEditorEquipList, e);
    elEditorEquipList.classList = "col-xs-12 fyg_ls";
    elEditorAuras.append(...LYT_GM.EditorAura.map((k) => {
        const box = document.createElement("div"), icon = document.createElement("i"), desc = document.createElement("span"), v = +k;
        
        box.classList = "btn";
        box.style = "padding: 1%; margin: 1%;";
        box.onclick = () => {
            gEditorAuras.has(v) ? (gEditorAuras.delete(v) && box.classList.remove("btn-primary")) : (gEditorAuras.add(v) && box.classList.add("btn-primary"));
            uiEditorSyncSkill();
        }
        box.append(icon, document.createElement("br"), desc);
        icon.classList = "icon icon-bookmark-empty fyg_f14";
        desc.classList = "label label-badge";
        elEditorAuras[v] = desc;
        return box;
    }));
    for (const v of LYT_GM.EditorWishs) {
        const d = document.createElement("div"), l = document.createElement("div"), r = document.createElement("input");
        d.classList = "col-xs-12 col-md-6";
        l.classList = "col-xs-6 fyg_nw";
        r.classList = "col-xs-6 fyg_tr";
        r.type = "string";
        r.onblur = () => { r.value = gEditorWishs[v] = +r.value; };
        elEditorWishs.append(d);
        d.append(l, r);
    }
    for (const k of LYT_GM.EditorAmulet) {
        const d = document.createElement("div"), l = document.createElement("div"), r = document.createElement("input");
        d.classList = "col-xs-12 col-md-4";
        l.classList = "col-xs-4 fyg_nw";
        r.classList = "col-xs-8 fyg_tr";
        r.type = "string";
        r.onblur = () => { r.value = gEditorAmulet[k] = +r.value; };
        elEditorAmulet.append(d);
        d.append(l, r);
    }
    elEditorUser.append(elEditorGemsDiv, elEditorDiceDiv);
    elEditorGemsDiv.open = !0;
    elEditorGemsDiv.append(document.createElement("summary"), elEditorGems);
    for (const k of LYT_GM.EditorGems) {
        const d = document.createElement("div"), l = document.createElement("span"), r = document.createElement("input");
        d.classList = "col-xs-12 col-md-12";
        l.classList = "col-xs-4 fyg_nw";
        r.classList = "col-xs-8 fyg_tr";
        r.type = "string";
        r.onblur = () => { r.value = gEditorGems[k] = +r.value; };
        elEditorGems.append(d);
        d.append(l, r);
    }
    elEditorDiceDiv.open = !0;
    elEditorDiceDiv.append(document.createElement("summary"), elEditorDice);
    for (const k of LYT_GM.EditorDice) {
        const d = document.createElement("div"), l = document.createElement("span"), r = document.createElement("input");
        d.classList = "col-xs-12 col-md-12";
        l.classList = "col-xs-4 fyg_nw";
        r.classList = "col-xs-8 fyg_tr";
        r.type = "string";
        r.onblur = () => { r.value = gEditorDice[k] = +r.value; };
        elEditorDice.append(d);
        d.append(l, r);
    }

    // Output
    elOutput[1].append(elBtnBattle, elBtnLoader, elBtnRoller);

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Renderers *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------

    elBoard.onload = () => {
        elBoard[0].innerHTML = gMsgData[$MsgNameBoard];
        elBoardSvcLoad.innerHTML = gMsgData[$MsgNameGmLoad];
        elBoardSvcSave.innerHTML = gMsgData[$MsgNameGmSave];
        elBoardSvcEmu.innerHTML = gMsgData[$MsgNameGmEmu];
        elBoardSvcSvc.innerHTML = gMsgData[$MsgNameGmSvc];
        elBoardSvcUsr.innerHTML = gMsgData[$MsgNameGmUsr];
        elBoardSvcRes.innerHTML = gMsgData[$MsgNameGmRes];
    };

    elConfig.onload = () => {
        elConfig[0].innerHTML = gMsgData[$MsgNameConfig];
        
        elBtnBattle.setInfo(gMsgData[$MsgNameGmBattle], gMsgData[$MsgDescGmBattle]);
        elBtnLoader.setInfo(gMsgData[$MsgNameGmLoader], gMsgData[$MsgDescGmLoader]);
        elBtnRoller.setInfo(gMsgData[$MsgNameGmRoller], gMsgData[$MsgDescGmRoller]);
        
        elConfigLeftImport.innerHTML = elConfigRightImport.innerHTML = gMsgData[$MsgNameImport];
        elConfigLeftExport.innerHTML = elConfigRightExport.innerHTML = gMsgData[$MsgNameExport];
        elConfigLeftCreate.innerHTML = elConfigRightCreate.innerHTML = gMsgData[$MsgNameCreate];
        [...elConfigLeftUnit.children].forEach(uiUnitUpdate);
        [...elConfigRightUnit.children].forEach(uiUnitUpdate);

        elEditorConfirm.innerHTML = gMsgData[$MsgNameConfirm];
        elEditorClose.innerHTML = gMsgData[$MsgNameClose];
        LYT_GM.ActorKind.forEach((k, i) => {
            elEditorKind.children[i].innerHTML = gMsgActorName[k];
        });
        elEditorPointLeft.innerHTML = gMsgAttrName.Point ?? "Point";
        elEditorSkillLeft.innerHTML = gMsgAttrName.Skill ?? "Skill";
        elEditorNaviUser.firstChild.innerHTML = gMsgData[$MsgNameUser];
        elEditorNaviActor.firstChild.innerHTML = gMsgData[$MsgNameCard];
        elEditorNaviEquip.firstChild.innerHTML = gMsgData[$MsgNameEquip];
        elEditorNaviAuras.firstChild.innerHTML = gMsgData[$MsgNameAura];
        elEditorNaviWishs.firstChild.innerHTML = gMsgData[$MsgNameWish];
        elEditorNaviAmulet.firstChild.innerHTML = gMsgData[$MsgNameAmulet];
        Object.keys(LYT_GM.EditorUser).forEach((k, i) => {
            elEditorUser.children[i].firstChild.innerHTML = gMsgAttrName[k] ?? k;
        });
        Object.keys(LYT_GM.EditorActor).forEach((k, i) => {
            elEditorActor.children[i].firstChild.innerHTML = gMsgAttrName[k] ?? k;
        });
        [...elEditorEquipList.children].forEach(uiEquipUpdate);
        elEditorEquipCreate.innerHTML = gMsgData[$MsgNameCreate];
        elEditorEquipRemove.innerHTML = gMsgData[$MsgNameRemove];
        LYT_GM.EditorAura.forEach((k, i) => {
            const E = elEditorAuras.children[i], A = E.children, l = LYT_FYG.Auras[k];
            E.title = $EquSkillDesc(l);
            A[0].innerHTML = `&nbsp;${$EquSkillName(l)}`;
            A[2].innerHTML = `${gMsgData[$MsgPreAuraCost]} ${LYT_GM.AuraCost[k] ?? ""} ${gMsgData[$MsgSufAuraCost]}`;
        });
        LYT_GM.EditorWishs.forEach((k, i) => {
            elEditorWishs.children[i].firstChild.innerHTML = gMsgWishName[k] ?? k;
        });
        LYT_GM.EditorAmulet.forEach((k, i) => {
            elEditorAmulet.children[i].firstChild.innerHTML = gMsgFruitAttrName[k] ?? k;
        });
        elEditorGemsDiv.firstChild.innerHTML = gMsgData[$MsgNameGems];
        LYT_GM.EditorGems.forEach((k, i) => {
            elEditorGems.children[i].firstChild.innerHTML = gMsgGemName[k] ?? k;
        });
        elEditorDiceDiv.firstChild.innerHTML = gMsgData[$MsgNameDice];
        LYT_GM.EditorDice.forEach((k, i) => {
            elEditorDice.children[i].firstChild.innerHTML = gMsgDiceAttr[k] ?? k;
        });
    };

    elOutput.onload = () => {
        elOutput[0].innerHTML = gMsgData[$MsgNameOutput];
        elOutput[2].innerHTML = gBattleData ? uiRenderBattle(gBattleData) : "";
        elOutput[3].innerHTML = gRollerData ? uiRenderRoller(gRollerData) : "";
    };
    
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Initialization *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------

    eSvcRoot.append(elBoard, elConfig, elOutput);

    Client[$CoGmUnit] = (i, p) => {
        const el = gReqArg[i];
        if (!el) { return; }
        delete gReqArg[i];

        uiUnitLoadRaw(el, p);
    };
    Client[$CoGmActor] = (i, p) => {
        Object.assign(gEditorActor, p);
        if (i & 1) { uiEditorSyncImage(); }
        if (i & 2) { uiEditorSyncPoint(); }
        if (i & 4) { uiEditorSyncSkill(); }
    };
    Client[$CoGmEquip] = (i, p) => {
        const el = gReqArg[i];
        if (el) {
            delete gReqArg[i];
            Object.assign(el._d, p);
            uiEquipUpdate(el);
        }
    };
    Client[$CoGmBattle] = p => elOutput[2].innerHTML = uiRenderBattle(gBattleData = p) ?? "";
    Client[$CoGmRoller] = p => elOutput[3].innerHTML = uiRenderRoller(gRollerData = p) ?? "";
    Client[$CoGmDl] = d => {
        eIoWriter.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(d, null, 4));
        eIoWriter.download = ".json";
        eIoWriter.click();
        elBoardSvcSave.blur();
    };
    
})();

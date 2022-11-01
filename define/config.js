/*
Project: fygemu
Authors: hirakana@kf
*/

const 

    // Emulator
    gImage = gEmuJson.Image,
    gRules = gEmuJson.Rule,
    gBaseStatAdd = gEmuJson.BaseStat.Add,
    gBaseStatMul = gEmuJson.BaseStat.Mul,
    gEmuActorKind = gEmuJson.Actors,
    gEmuStatusKind = gEmuJson.Status,
    gEmuEquipKind = gEmuJson.Equips,
    gEmuEquipStatAdd = gEmuJson.EquipStats.Add,
    gEmuEquipStatMul = gEmuJson.EquipStats.Mul,
    gEmuEquipRankKind = gEmuJson.EquipRanks,
    gEmuAuraKind = gEmuJson.Auras,
    gEmuArt1Kind = gEmuJson.Art1,
    gEmuArt2Kind = gEmuJson.Art2,
    gEmuArt3Kind = gEmuJson.Art3,

    gNullSub = () => {},
    gIdMap = (x) => x,
    gNumberCast = gRules.UseNumbers ? gIdMap : Math.floor,
    gNumberMin = gRules.UseNumbers ? Number.MIN_VALUE : 1,
    gNumberMax = gRules.UseNumbers ? Number.MAX_VALUE : Number.MAX_SAFE_INTEGER,
    gEffectBase = gRules.EffectBase,
    gEffectMul1 = gEffectBase ? (x) => -Math.expm1(-x * gEffectBase)                : (x) => x * 0.01,
    gEffectMul2 = gEffectBase ? (l, x) => -l * Math.expm1(-x * gEffectBase)         : (l, x) => gNumberCast(l * x) * 0.01,
    gEffectMul3 = gEffectBase ? (l, x, r) => -l * Math.expm1(-x * gEffectBase) * r  : (l, x, r) => gNumberCast(l * x) * (0.01 * r),
    gEffectMadd = gEffectBase ? (x) => Math.exp(x * gEffectBase) : (x) => 1 + x * 0.01,
    gEffectAmul = gEffectBase ? (x) => Math.exp(x * gEffectBase) : (x) => (100 + x) * 0.01,
    gArrayShuffle = (A) => {
        for (let i = A.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [A[i], A[j]] = [A[j], A[i]];
        }
        return A;
    },

    // Layout
    gLytCss = gLytJson.$,
    gLytPk = gLytJson.pk,

    // Messages
    gMsgJsons = {
        "zz": gMsgZzJson,
        "cs": gMsgCsJson,
        "ct": gMsgCtJson,
        "jp": gMsgJpJson,
        "eu": gMsgEuJson
    },

    // User
    gUsrActorMap = gUsrJson.MapActor || [],
    gUsrEquipMap = gUsrJson.MapEquip || [],
    gUsrPath = (data, kind, mode) => {
        const X = ["", ""+mode, ""+kind, ""+mode, ""];
        for (const T of data) {
            let E = 0n;
            const DK = T.Kind, DM = T.Mode;
            if ("Dir" in T) { X[0] = T.Dir; }
            if ("Prefix" in T) { X[1] = T.Prefix; }
            if ("Symbol" in T) { X[2] = T.Symbol; }
            if ("Suffix" in T) { X[3] = T.Suffix; }
            if ("Ext" in T) { X[4] = T.Ext; }
            if (DK) {
                const K = DK[kind];
                if (K) {
                    const D = K.Mode;
                    if ("Prefix" in K) { X[1] = K.Prefix; }
                    if ("Symbol" in K) { X[2] = K.Symbol; }
                    if ("Suffix" in K) { X[3] = K.Suffix; }
                    if (D) {
                        const M = D[mode];
                        if (M) {
                            if ("Prefix" in M) { X[1] = M.Prefix; }
                            if ("Symbol" in M) { X[2] = M.Symbol; }
                            if ("Suffix" in M) { X[3] = M.Suffix; }
                            break;
                        }
                    }
                    E |= 1n;
                }
                E |= 2n;
            }
            if (DM) {
                const M = DM[mode];
                if (M) {
                    const D = M.Kind;
                    if ("Prefix" in M) { X[1] = M.Prefix; }
                    if ("Symbol" in M) { X[2] = M.Symbol; }
                    if ("Suffix" in M) { X[3] = M.Suffix; }
                    if (D) {
                        const K = D[kind];
                        if (K) {
                            if ("Prefix" in K) { X[1] = K.Prefix; }
                            if ("Symbol" in K) { X[2] = K.Symbol; }
                            if ("Suffix" in K) { X[3] = K.Suffix; }
                            break;
                        }
                    }
                    E |= 1n;
                }
                E |= 4n;
            }
            if (E == 7n) { break; }
        }
        return X.join("");
    },

    // Loader
    gEmuActorKeys = gEmuJson.ActorKeys,

    // Io
    elIoReader = document.createElement("input"),
    elIoWriter = document.createElement("a"),

    // Components
    elRoot = document.createElement("div"),
    
    // Dragstart callback
    emuDrag = (D, e) => {
        D._drag = e;
    },

    // Drop callback
    emuDrop = (D, E, e) => {
        const el = D._drag, y = e.clientY, y2 = y + y;

        if (!el) { return; }
        
        e.preventDefault();

        for (const et of E.children) {
            const R = et.getBoundingClientRect();
            if (R.top + R.bottom > y2) {
                return et.insertAdjacentElement("beforebegin", el);
            }
        }

        E.append(el);
        D._drag = null;
    },

    // Dragover callback
    emuDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }

;

let

    // Messages
    gMsgJson,
    gMsgMetaData,
    gMsgPanelName,
    gMsgPanelDesc,
    gMsgAttrName,
    gMsgAttrInfo,
    gMsgActUIInfo,
    gMsgActorName,
    gMsgArt1Name,
    gMsgArt2Name,
    gMsgArt3Name,
    gMsgStatusName,
    gMsgEquipName,
    gMsgEquipDesc,
    gMsgEquipMyst,
    gMsgEquipAttrName,
    gMsgEquipRankName,
    gMsgAuraName,
    gMsgAuraDesc

;


/*
Project: fygemu
Authors: hirakana@kf
*/

// SHA3 (a.k.a. Keccak)
class SHA3 {
    T = new TextEncoder();
    C = new BigUint64Array(5);
    D = new BigUint64Array(5);
    N = new BigUint64Array(25);
    RC = [
        0x1n, 0x8082n, 0x808an, 0x80008000n, 0x808bn,
        0x80000001n, 0x80008081n, 0x8009n, 0x8an, 0x88n,
        0x80008009n, 0x8000000an, 0x8000808bn, 0x8bn, 0x8089n,
        0x8003n, 0x8002n, 0x80n, 0x800an, 0x8000000an,
        0x80008081n, 0x8080n
    ];
    RR = [0n, 1n, 30n, 28n, 27n, 4n, 12n, 6n, 23n, 20n, 3n, 10n, 11n, 25n, 7n, 9n, 13n, 15n, 21n, 8n, 18n, 2n, 29n, 24n, 14n];
    RP = [0n, 10n, 20n, 5n, 15n, 16n, 1n, 11n, 21n, 6n, 7n, 17n, 2n, 12n, 22n, 23n, 8n, 18n, 3n, 13n, 14n, 24n, 9n, 19n, 4n];
    mState = new BigUint64Array(25);

    rol32 = (s, n) => (s << n) | (s >> (32n - n)) & 0xffffffffn;

    calc (s) {
        const
            A = this.T.encode(s), n = A.byteLength,
            B = this.mState, C = this.C, D = this.D, N = this.N, RC = this.RC, RR = this.RR, RP = this.RP,
            rol32 = this.rol32, I1 = [1, 2, 3, 4, 0], I2 = [2, 3, 4, 0, 1], I4 = [4, 0, 1, 2, 3]
        ;
        let i, x, y, z;
        for (i = 0; i < n; i += 8) {
            for (x = 0; x < 8; x++) {
                y = i + x << 2;
                B[x] ^= BigInt((A[y] || 0) | ((A[y + 1] || 0) << 8) | ((A[y + 2] || 0) << 16) | ((A[y + 3] || 0) << 24)); // Lazy padding
            }
            for (y = 0; y < 22; y++) {
                for (x = 0; x < 5; x++) {
                    C[x] = B[x] ^ B[x + 5] ^ B[x + 10] ^ B[x + 15] ^ B[x + 20]; 
                }
                for (x = 0; x < 5; x++) {
                    D[x] = C[I4[x]] ^ rol32(C[I1[x]], 1n);
                }
                for (x = 0; x < 25; x += 5) {
                    for (z = 0; z < 5; z++) {
                        const xz = x + z;
                        N[RP[xz]] = rol32(B[xz] ^ D[z], RR[xz]);
                    }
                }
                for (x = 0; x < 5; x++) {
                    for (z = 0; z < 25; z += 5) {
                        B[z + x] = N[z + x] ^ ((~N[z + I1[x]]) & (N[z + I2[x]]));
                    }
                }
                B[0] ^= RC[y];
            }
        }

        return this;
    }

    digest () {
        const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", B = this.mState, R = Array(128);
        let i, n = 0;
        for (i = 0; i < 8; i++) {
            const w0 = B[i], w1 = B[i + 8], w2 = B[i + 16];
            R[n++] = A[w0 & 63n]; R[n++] = A[w0 >> 6n & 63n]; R[n++] = A[w0 >> 12n & 63n]; R[n++] = A[w0 >> 18n & 63n]; R[n++] = A[w0 >> 24n & 63n];
            R[n++] = A[w1 & 63n]; R[n++] = A[w1 >> 6n & 63n]; R[n++] = A[w1 >> 12n & 63n]; R[n++] = A[w1 >> 18n & 63n]; R[n++] = A[w1 >> 24n & 63n];
            R[n++] = A[w2 & 63n]; R[n++] = A[w2 >> 6n & 63n]; R[n++] = A[w2 >> 12n & 63n]; R[n++] = A[w2 >> 18n & 63n]; R[n++] = A[w2 >> 24n & 63n];
            R[n++] = A[(w0 >> 30n) | (w1 >> 30n << 2n) | (w2 >> 30n << 4n) & 63n];
        }
        return R.join("");
    }
}

let gSvcCall;
const 

    // Client -> Server calls
    Server = {},

    // Server -> Client calls
    Client = {},

    // Dummy callback
    nullSync = () => {},
    nullAsync = async () => {},
    
    // Equipment
    gCssCardClass = {
        "1": "info",
        "2": "primary",
        "3": "success",
        "4": "warning",
        "5": "danger"
    },

    // Layout
    LYT_CSS = LYT.$,
    LYT_FYG = LYT.fyg,
    LYT_GM = LYT.gm,
    LYT_EQUIP = LYT.equip,
    LYT_WISH = LYT.wish,
    LYT_BEACH = LYT.beach,
    LYT_GIFT = LYT.gift,

    // User

    // Resource
    RES_CH = RES.Actor || [],
    RES_EQ = RES.Equip || [],
    RES_IT = RES.Item || [],
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
                    if ("Prefix" in K) { X[1] = K.Prefix; }
                    if ("Symbol" in K) { X[2] = K.Symbol; }
                    if ("Suffix" in K) { X[3] = K.Suffix; }
                    E |= 1n;
                }
            }
            if (DM) {
                const M = DM[mode];
                if (M) {
                    const D = M.Kind;
                    if ("Prefix" in M) { X[1] = M.Prefix; }
                    if ("Symbol" in M) { X[2] = M.Symbol; }
                    if ("Suffix" in M) { X[3] = M.Suffix; }
                    E |= 2n;
                }
            }
            if (E == 3) { break; }
        }
        return X.join("");
    },

    gSetLang = (lang) => {
        const msg = MSG[lang] ?? MSG.zz;
        window.gMsgMetaData = msg.MetaData,
        window.gMsgData = msg.Data;
        window.gMsgAttrName = msg.AttrName;
        window.gMsgActUIInfo = msg.ActUIInfo;
        window.gMsgDiceAttr = msg.DiceAttr;
        window.gMsgDiceInfo = msg.DiceInfo;
        window.gMsgActorName = msg.ActorName;
        window.gMsgActorDesc = msg.ActorDesc;
        window.gMsgSkillName = msg.SkillName;
        window.gMsgSkillDesc = msg.SkillDesc;
        window.gMsgStatusName = msg.StatusName;
        window.gMsgEquipName = msg.EquipName;
        window.gMsgEquipDesc = msg.EquipDesc;
        window.gMsgEquipAttrName = msg.EquipAttrName;
        window.gMsgEquipRankName = msg.EquipRankName;
        window.gMsgFruitName = msg.FruitName;
        window.gMsgFruitAttrName = msg.FruitAttrName;
        window.gMsgFruitAttrUnit = msg.FruitAttrUnit;
        window.gMsgFruitRankName = msg.FruitRankName;
        window.gMsgAuraName = msg.AuraName;
        window.gMsgAuraDesc = msg.AuraDesc;
        window.gMsgGemName = msg.GemName;
        window.gMsgItemName = msg.ItemName;
        window.gMsgItemDesc = msg.ItemDesc;
        window.gMsgItemUnit = msg.ItemUnit;
        window.gMsgRankName = msg.RankName;
        window.gMsgStatName = msg.StatName;
        window.gMsgStatDesc = msg.StatDesc;
        window.gMsgWishName = msg.WishName;
        window.gMsgWishDesc = msg.WishDesc;
    },

    // 
    gUser = {},

    // Io
    eIoReader = document.createElement("input"),
    eIoWriter = document.createElement("a"),

    // Components
    eSvcRoot = document.createElement("div"),
    eCursor = document.createElement("div"),
    zCursor = eCursor.style,
    eSvcBack = document.createElement("div"),
    eSvcSpin = document.createElement("i"),

    // Wait queue
    gSvcWait = [],

    // Service call
    svcCall = (op, arg, tbl) => {

        // If another call is running, throw the arguments into the queue.
        if (gSvcCall) { return gSvcWait.push(svcCall.bind(null, op, arg, tbl)); }

        // Setup backdrop first.
        eSvcBack.style.display = "";

        // Fire the message.
        gSvcCall = [arg, tbl]; op(arg);
    },

    // Call from server
    svcLoad = r => {

        const cb = [];

        // If this is a response of a message sent by client, setup the callback.
        if (r[$CoError] && gSvcCall) {
            const [arg, tbl] = gSvcCall;
            Client[$CoError] = d => {
                for (const k in d) {
                    const T = tbl[k];
                    if (!T) { return; }
                    cb.push(T.resolve.bind(null, d[k]));
                }
            };
            gSvcCall = null;
        }
        
        // Renderer callbacks.
        for (const k in r) {
            const T = Client[k], Q = r[k];
            if (!T || !Q) { continue; }
            T(...Q);
        }

        // Response callbacks.
        for (const f of cb) { f(); }
        
        // In case waiting queue is not empty, handle the first waiting message.
        const wait = gSvcWait.shift();
        if (wait) { return wait(); }

        // Remove the backdrop
        eSvcBack.style.display = "none";
    },

    // Force reset 
    svcReset = () => {
        
        // Clear waiting queue and lock
        gSvcCall = null; gSvcWait.length = 0;
        
        // Remove the backdrop
        eSvcBack.style.display = "none";
    },
    
    // Custom promise
    svcPromise = () => {
        const _ = {};
        return Object.assign(
            new Promise((resolve, reject) => {
                _.resolve = resolve; _.reject = reject;
            }), _
        );
    },

    // Dummy image (1x1 block)
    gImage = "data:image/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAOXRFWHRTb2Z0d2FyZQBNYXRwbG90bGliIHZlcnNpb24zLjUuMSwgaHR0cHM6Ly9tYXRwbG90bGliLm9yZy/YYfK9AAAACXBIWXMAAA9hAAAPYQGoP6dpAAAADUlEQVR4nGNgYGBgAAAABQABpfZFQAAAAABJRU5ErkJggg==",

    // Default callback when the image failed to load.
    uiImgError = function () { this.src = gImage; },

    // Truncate value for user interface.
    // Assume that is a Number, so floor, round, ceil, toFixed and etc..., would be available.
    // We use floor by default, and you may change it to whatever you like.
    uiNumber = Math.floor,

    // Truncate value for user interface with check.
    // If input is a Number (has property toFixed), then cast it via uiNumber.
    // Otherwise identity map.
    uiNumCast = (x) => x && x.toFixed ? uiNumber(x) : x,

    // New status display
    uiNumFix1 = (x) => x.toFixed ? x.toFixed(2) : x,
    uiNumFix2 = (x) => x.toFixed ? x.toFixed(2) : x,

    // Consturct a simple collapsible panel.
    uiPanel3 = ({
        panel = {tag: "div", classList: "panel"},
        head = {tag: "div", classList: "panel-heading"},
        body = [{tag: "div", classList: "panel-body"}],
        hide = ""
    }) => {
        hide = hide ? "none" : "";

        const
            el = document.createElement(panel.tag),
            elHead = document.createElement(head.tag),
            elBody = body.map((x, i) => {
                const e = document.createElement(x.tag);
                Object.assign(e, x);
                e.style.display = hide;
                el[i + 1] = e;
                return e
            });
        ;

        el[0] = elHead;
        Object.assign(el, panel);
        el.append(elHead, ...elBody);
        Object.assign(elHead, head);
        elHead.onclick = () => {
            hide = hide ? "" : "none";
            elBody.forEach((e) => e.style.display = hide)
        };

        return el;
    },

    // Consturct a collapsible panel with outer div.
    uiPanel4 = ({
        root = {tag: "div", classList: "row"},
        panel = {tag: "div", classList: "panel"},
        head = {tag: "div", classList: "panel-heading"},
        body = [{tag: "div", classList: "panel-body"}],
        hide = ""
    }) => {
        hide = hide ? "none" : "";

        const
            el = document.createElement(root.tag),
            elPanel = document.createElement(panel.tag),
            elHead = document.createElement(head.tag),
            elBody = body.map((x, i) => {
                const e = document.createElement(x.tag);
                Object.assign(e, x);
                e.style.display = hide;
                el[i + 1] = e;
                return e
            });
        ;

        el[0] = elHead;
        el.append(elPanel);
        Object.assign(el, root);
        elPanel.append(elHead, ...elBody);
        Object.assign(elPanel, panel);
        Object.assign(elHead, head);
        elHead.onclick = () => {
            hide = hide ? "" : "none";
            elBody.forEach((e) => e.style.display = hide);
        };

        return el;
    },

    // Construct a button with description.
    uiButton3 = ({
        root = {tag: "button", type: "button", classList: "btn btn-block fyg_lh30"},
        name = {tag: "span", classList: "fyg_f18"},
        desc = {tag: "span"}
    }) => {
        const
            el = document.createElement(root.tag),
            elName = document.createElement(name.tag),
            elDesc = document.createElement(desc.tag)
        ;
        
        Object.assign(el, root); el.append(elName, document.createElement("br"), elDesc);
        Object.assign(elName, name); Object.assign(elDesc, desc);
        el.setInfo = (title, desc) => { elName.innerHTML = title; elDesc.innerHTML = desc; };

        return el;
    },

    // Consturct a simple progress bar.
    uiProgBar = ({
        prog = {classList: "progress"}, bar = {classList: "progress-bar", role: "progressbar"}
    }) => {
        const elProg = document.createElement("div"), elBar = document.createElement("div");

        Object.assign(elProg, prog); Object.assign(elBar, bar);
        elProg.append(elBar);
        elBar.ariaValueMin = 0; elBar.ariaValueMax = 100; elBar.style.width = "100%";

        elProg.set = (x) => {
            x = (x > 100) ? 100 : (x < 0) ? 0 : x;
            elBar.ariaValueMin = x; elBar.style.width = `${x}%`;
        };

        return elProg; 
    },

    // Build navigation bar pair on n and b.
    // "n" stands for navi, and "b" stands for body.
    uiNaviPair = (n, b, a, m) => {
        let navi, body;

        do {
            const el = document.createElement("li"), er = document.createElement("div"), a = document.createElement("a");
    
            n.append(el); b.append(er);
            a.classList = "fyg_f18";
            a.onclick = () => {
                navi.classList = "";
                body.style.display = "none";
                navi = el; el.classList = "active";
                body = er;
                er.style.display = "block";
            };
            el.classList = "";
            el.append(a);
            er.classList = "col-xs-12 load-indicator";
            er.style = "padding: 1%; display: none";
        } while (--m);
        
        navi = n.children[a];
        body = b.children[a];
        navi.classList = "active";
        body.style.display = "block";
    },
    
    // Consturct a simple stats menu.
    uiStats = (ref, kind, type, attr) => {
        const 
            elStats = document.createElement("p"),
            elStatsName = document.createTextNode(""),
            elStatsText = document.createElement("span"),
            elStatsInfo = document.createElement("div"),
            elStatsArrow = document.createElement("div"),
            elStatsDesc = document.createElement("div")
        ;

        elStats.classList = `col-xs-12 with-padding hl-${type} text-${type} tip-top`; elStats.append(elStatsName, elStatsText, elStatsInfo);
        elStatsText.classList = "pull-right";
        elStatsInfo.classList = "tooltip fade top tip-text"; elStatsInfo.append(elStatsArrow, elStatsDesc);
        elStatsArrow.classList = "tooltip-arrow"; elStatsDesc.classList = "tooltip-inner"; elStatsDesc.style.maxWidth = "100%";
        for (const [a, t] of attr) {
            const s = document.createTextNode("");
            elStatsText.append(s, t); ref[a] = s;
        }

        elStats.onload = () => {
            elStatsName.textContent = gMsgStatName[kind] || kind;
            elStatsDesc.innerHTML = gMsgStatDesc[kind] || kind;
        };

        return elStats;
    },

    // Consturct a simple art menu.
    uiArt3 = () => {
        const 
            elArts = document.createElement("div"),
            elArt1 = document.createElement("div"),
            elArt1Name = document.createElement("p"),
            elArt1Info = document.createElement("div"),
            elArt1Arrow = document.createElement("div"),
            elArt1Desc = document.createElement("div"),
            elArt2 = document.createElement("div"),
            elArt2Name = document.createElement("p"),
            elArt2Info = document.createElement("div"),
            elArt2Arrow = document.createElement("div"),
            elArt2Desc = document.createElement("div"),
            elArt3 = document.createElement("div"),
            elArt3Name = document.createElement("p"),
            elArt3Info = document.createElement("div"),
            elArt3Arrow = document.createElement("div"),
            elArt3Desc = document.createElement("div")
        ;

        elArts.append(elArt1, elArt2, elArt3);
        elArt1.classList = "col-xs-4 tip-bottom"; elArt1.append(elArt1Name, elArt1Info);
        elArt1Name.classList = "with-padding hl-danger fyg_tc fyg_nw"; elArt1Info.classList = "popover fade bottom tip-text"; elArt1Info.append(elArt1Arrow, elArt1Desc);
        elArt1Arrow.classList = "arrow"; elArt1Desc.classList = "popover-content";
        elArt2.classList = "col-xs-4 tip-bottom"; elArt2.append(elArt2Name, elArt2Info);
        elArt2Name.classList = "with-padding hl-default fyg_tc fyg_nw"; elArt2Info.classList = "popover fade bottom tip-text"; elArt2Info.append(elArt2Arrow, elArt2Desc);
        elArt2Arrow.classList = "arrow"; elArt2Desc.classList = "popover-content";
        elArt3.classList = "col-xs-4 tip-bottom"; elArt3.append(elArt3Name, elArt3Info);
        elArt3Name.classList = "with-padding hl-default fyg_tc fyg_nw"; elArt3Info.classList = "popover fade bottom tip-text"; elArt3Info.append(elArt3Arrow, elArt3Desc);
        elArt3Arrow.classList = "arrow"; elArt3Desc.classList = "popover-content";

        elArts.set = (a1, a2, a3) => {
            elArt1Name.innerHTML = $EquSkillName(a1);
            elArt1Desc.innerHTML = $EquSkillDesc(a1);
            elArt2Name.innerHTML = $EquSkillName(a2);
            elArt2Desc.innerHTML = $EquSkillDesc(a2);
            elArt3Name.innerHTML = $EquSkillName(a3);
            elArt3Desc.innerHTML = $EquSkillDesc(a3);
        };

        return elArts;

    },

    // General tooltips
    uiTipTop4 = ({
        root = {classList: "tip"},
        tip = {classList: "tooltip fade top tip-text"},
        arrow = {classList: "tooltip-arrow"},
        inner = {classList: "tooltip-inner"}
    }) => {
        const 
            elRoot = document.createElement("div"),
            elTip = document.createElement("div"),
            elArrow = document.createElement("div"),
            elInner = document.createElement("div")
        ;

        Object.assign(elRoot, root);
        Object.assign(elTip, tip);
        Object.assign(elArrow, arrow);
        Object.assign(elInner, inner);
        elRoot.append(elTip);
        elTip.append(elArrow, elInner);

        elRoot.inner = elInner;
        return elRoot;
    },
    
    // Construct an simple item button.
    uiItem = K => {
        let N = 0;

        const
            elRoot = document.createElement("button"),
            elPanel = document.createElement("div"),
            elArrow = document.createElement("div"),
            elTitle = document.createElement("h3"),
            elInner = document.createElement("div"),
            elDesc = document.createElement("span"),
            elNum = document.createElement("span"),
            
            tnNum = document.createTextNode(""),
            tnName = document.createTextNode(""),

            icon = () => {
                elRoot.style.backgroundImage = `url(${gUsrPath(RES_IT, K, "0")})`;
            },

            kind = K => {
                K = k; icon();
                tnName.textContent = gMsgItemName[k] ?? k;
                elDesc.innerHTML = gMsgItemDesc[k] ?? k;
            },

            num = (n, f) => {
                elNum.innerHTML = n; tnNum.textContent = n;
                elRoot.style.display = (f || n > 0) ? "" : "none";
            }
        ;

        elRoot.classList = "btn fyg_colpzbg fyg_ec fyg_tc tip-bottom"; elRoot.style = "";
        elRoot.append(elNum, elPanel);
        elPanel.classList = "popover popover-warning fade bottom tip-text";
        elPanel.append(elArrow, elTitle, elInner);
        elArrow.classList = "arrow"; elTitle.classList = "popover-title"; elInner.classList = "popover-content";
        elTitle.append(tnName, " ×", tnNum);
        elInner.append(elDesc);
        elDesc.style = "font-weight: normal;";
        icon(); num(N);
        
        elRoot.kind = kind;
        elRoot.num = num;
        elRoot.onload = () => {
            tnName.textContent = gMsgItemName[K] ?? K;
            elDesc.innerHTML = gMsgItemDesc[K] ?? K;
        };
        elRoot.onreset = icon;

        return elRoot;
    },

    uiItems = (lyt) => {
        const el = document.createElement("div");
        for (const k of lyt) { el.append(el[k] = uiItem(k)); }
        return el;
    },
    
    // Construct an simple item row.
    uiItemH5 = (K, s) => {
        let N = 0;

        const
            elRoot = document.createElement("h5"),
            elNum = document.createElement("span"),
            elUnit = document.createElement("span"),
            
            tnNum = document.createTextNode(""),
            tnName = document.createTextNode(""),

            kind = K => {
                K = k;
                tnName.textContent = gMsgItemName[k] ?? k;
                elUnit.innerHTML = gMsgItemUnit[k] ?? k;
            },

            num = (n, f) => {
                elNum.innerHTML = n; tnNum.textContent = n;
                elRoot.style.display = (f || n > 0) ? "" : "none";
            }
        ;

        elRoot.classList = "with-padding hl-gray tip-bottom";
        elRoot.append(tnName, s, elUnit, elNum);
        elNum.classList = "fyg_f14 fyg_fr";
        elUnit.classList = "fyg_f14 fyg_fr";
        num(N);
        
        elRoot.kind = kind;
        elRoot.num = num;
        elRoot.onload = () => {
            tnName.textContent = gMsgItemName[K] ?? K;
            elUnit.innerHTML = gMsgItemUnit[K] ?? K;
        };
        elRoot.onreset = nullSync;

        return elRoot;
    },

    uiItemH5s = (lyt, sep) => {
        const el = document.createElement("div");
        el.classList = "fyg_wallet";
        for (const k of lyt) { el.append(el[k] = uiItemH5(k, sep)); }
        return el;
    },

    uiItemH5i = (lyt, sep) => {
        let i = 0;
        const el = document.createElement("div");
        el.classList = "fyg_wallet";
        for (const k of lyt) { el.append(el[i++] = uiItemH5(k, sep)); }
        return el;
    },

    //
    uiSortTbl = {
        "SortID": (a, b) => 0,
        "SortKB": (a, b) => a.K - b.K,
        "SortKL": (a, b) => b.K - a.K,
        "SortPB": (a, b) => a.V - b.V,
        "SortPL": (a, b) => b.V - a.V,
        "SortMB": (a, b) => a.K > b.K ? Infinity : a.K < b.K ? -Infinity : a.V - b.V,
        "SortML": (a, b) => b.K > a.K ? Infinity : b.K < a.K ? -Infinity : b.V - a.V
    },

    uiSortMsg = {
        "SortID": $MsgNameSortID,
        "SortKB": $MsgNameSortKB,
        "SortKL": $MsgNameSortKL,
        "SortPB": $MsgNameSortPB,
        "SortPL": $MsgNameSortPL,
        "SortMB": $MsgNameSortMB,
        "SortML": $MsgNameSortML
    },

    // Construct card container.
    uiBack = (n, ctor) => {
        const el = document.createElement("div"), A = Array(n).fill();
        el.F = uiSortTbl.SortID;
        el.N = 0;
        el.M = A.map(ctor);
        el.L = new Set(A.map((d, i) => +i));
        uiSelZone(el);

        return el;
    },

    uiFront = (n, ctor) => {
        const el = document.createElement("div"), A = Array(n).fill(), M = A.map(ctor);
        el.F = uiSortTbl.SortID;
        el.N = n;
        el.M = M;
        el.append(...M);
        uiSelZone(el);

        return el;
    },

    // Render card and return the root element.
    uiActor = () => {
        const
            elRoot = document.createElement("button"),
            elIcon = document.createElement("img"),
            elPanel = document.createElement("div"),
            elArrow = document.createElement("div"),
            elTitle = document.createElement("h3"),
            elInner = document.createElement("div"),
            elAttrs = document.createElement("div"),
            elTrait = document.createElement("p"),
            elTraitL = document.createElement("span"),
            elTraitR = document.createElement("span"),
            elSkill = document.createElement("p"),
            elSkillL = document.createElement("span"),
            elSkillR = document.createElement("span"),
            elBuild = document.createElement("p"),
            elBuildL = document.createElement("span"),
            elBuildR = document.createElement("span"),
            elFlair = document.createElement("p"),
            elFlairL = document.createElement("span"),
            elFlairR = document.createElement("span"),
            elDesc = document.createElement("p"),
            elMyst = document.createElement("p"),
            elLevel = document.createElement("span"),
            tnTraitL = document.createTextNode(""),
            tnTraitR = document.createTextNode(""),
            tnSkillL = document.createTextNode(""),
            tnSkillR = document.createTextNode(""),
            tnBuildL = document.createTextNode(""),
            tnBuildR = document.createTextNode(""),
            tnFlairL = document.createTextNode(""),
            tnFlairR = document.createTextNode(""),
            tnLevel = document.createTextNode(""),
            tnName = document.createTextNode(""),

            icon = () => {
                elIcon.src = gUsrPath(RES_CH, elRoot.K, "Z");
            },

            set = (d) => {
                const {i, K, R, V, L, Q, S, B, F, G, Z, p, exp, auras, equip, fruit} = d;

                elRoot.K = K; elRoot.R = R; elRoot.L = L; elRoot.V = V;
                elRoot.Q = Q; elRoot.S = S; elRoot.B = B; elRoot.F = F; elRoot.G = G; elRoot.Z = Z;
                elRoot.p = p;
                for (const k of LYT_FYG.Stat) { elRoot[k] = d[k] ?? 0; }
                elRoot.exp = exp ?? elRoot.exp;
                elRoot.auras = auras ?? elRoot.aruas;
                elRoot.equip = equip ?? elRoot.equip;
                elRoot.fruit = fruit ?? elRoot.fruit;

                // Kind
                tnName.textContent = gMsgActorName[K] ?? K;
                elDesc.innerHTML = gMsgActorDesc[K] ?? K;
                elMyst.innerHTML = $EquSkillDesc(Z[$ActorMystIndex]);
                elIcon.src = gUsrPath(RES_CH, K, "Z");
                
                // Rank
                elRoot.classList = `btn fyg_colpzbg btn-${gCssCardClass[R]} fyg_colpz0${R} fyg_actor tip-bottom`;
                elPanel.classList = `popover popover-${gCssCardClass[R]} fade botton tip-text`;

                // Level
                elLevel.innerHTML = tnLevel.textContent = uiNumber(L);

                // Trait, Skill, Build, Flair
                tnTraitL.textContent = uiNumFix1(d.Q); tnSkillL.textContent = uiNumber(d.S); tnBuildL.textContent = uiNumber(d.B); tnFlairL.textContent = uiNumFix2(d.F);

                // Myst
                elMyst.style.display = Z.length > $ActorMystIndex ? "" : "none";
            },

            open = b => {
                elLevel.style.display = elPanel.style.display = b ? "" : "none";
            },

            show = b => {
                elRoot.style.display = b ? "" : "none";
            },

            eval = () => {},

            clr = () => {
                set({K: 0, R: 1, V: 0, L: 0, Q: 0, S: 0, B: 0, F: 0, G: 0, Z: [], p: 0, exp: 0, auras: [], equip: [], fruit: []}); open(!1);
                elRoot.checked = !1; elRoot.style.boxShadow = "";
            }
        ;

        elRoot.style = "background-color:#FFFFFF;";
        elRoot.append(elLevel, document.createElement("br"), elIcon, elPanel);
        elLevel.classList = "fyg_f18"; elIcon.classList = "fyg_img"; elIcon.onerror = uiImgError;
        elPanel.append(elArrow, elTitle, elInner);
        elArrow.classList = "arrow"; elTitle.classList = "popover-title"; elInner.classList = "popover-content";
        elTitle.append("Lv.", tnLevel, " ", tnName);
        elInner.append(elAttrs, elDesc, elMyst);
        elAttrs.append(elTrait, elSkill, elBuild, elFlair);
        elTrait.append(elTraitL, elTraitR);
        elTrait.classList = "with-padding bg-special fyg_f14 fyg_nw";
        elTraitR.classList = "pull-right";
        elTraitR.append(tnTraitL, tnTraitR);
        elSkill.append(elSkillL, elSkillR);
        elSkill.classList = "with-padding bg-special fyg_f14 fyg_nw";
        elSkillR.classList = "pull-right";
        elSkillR.append(tnSkillL, tnSkillR);
        elBuild.append(elBuildL, elBuildR);
        elBuild.classList = "with-padding bg-special fyg_f14 fyg_nw";
        elBuildR.classList = "pull-right";
        elBuildR.append(tnBuildL, tnBuildR);
        elFlair.append(elFlairL, elFlairR);
        elFlair.classList = "with-padding bg-special fyg_f14 fyg_nw";
        elFlairR.classList = "pull-right";
        elFlairR.append(tnFlairL, tnFlairR);
        elDesc.style = "font-weight: normal;";
        elMyst.classList = "bg-danger with-padding";
        
        elRoot.set = set;
        elRoot.clr = clr;
        elRoot.open = open;
        elRoot.show = show;
        elRoot.eval = eval;
        elRoot.onload = () => {
            const {K, Z} = elRoot;
            tnName.textContent = gMsgActorName[K] ?? K;
            elDesc.innerHTML = gMsgActorDesc[K] ?? K; elMyst.innerHTML = $EquSkillDesc(Z[$ActorMystIndex]);
            elTraitL.innerHTML = gMsgData[$MsgPreTrait]; tnTraitR.textContent = gMsgData[$MsgSufTrait];
            elSkillL.innerHTML = gMsgData[$MsgPreSkill]; tnSkillR.textContent = gMsgData[$MsgSufSkill];
            elBuildL.innerHTML = gMsgData[$MsgPreBuild]; tnBuildR.textContent = gMsgData[$MsgSufBuild];
            elFlairL.innerHTML = gMsgData[$MsgPreFlair]; tnFlairR.textContent = gMsgData[$MsgSufFlair];
        };
        elRoot.onreset = icon;
        clr();

        return elRoot;  
    },

    // Render equipment and return the root element.
    uiEquip = () => {
        
        const
            elRoot = document.createElement("button"),
            elPanel = document.createElement("div"),
            elArrow = document.createElement("div"),
            elTitle = document.createElement("h3"),
            elInner = document.createElement("div"),
            elAttrs = document.createElement("p"),
            elMyst = document.createElement("p"),
            elDesc = document.createElement("p"),
            elLevel = document.createElement("span"),
            
            tnLevel = document.createTextNode(""),
            tnName = document.createTextNode(""),

            icon = () => {
                elRoot.style.backgroundImage = `url(${gUsrPath(RES_EQ, elRoot.K, elRoot.R)})`;
            },

            set = (d) => {
                const 
                    {K, R, L, V, Q, Z, S} = d,
                    {Mul, Add, Tier} = LYT_FYG.Equip
                ;
                
                elRoot.K = K; elRoot.R = R; elRoot.L = L;
                elRoot.V = V; elRoot.Q = Q; elRoot.Z = Z;
                elRoot.S = S;

                // Kind
                tnName.textContent = gMsgEquipName[K] ?? K;
                elMyst.innerHTML = $EquSkillDesc(Z[$EquipMystIndex]);
                elDesc.innerHTML = gMsgEquipDesc[K] ?? K;

                // Rank
                elPanel.classList = `popover popover-${gCssCardClass[R]} fade bottom tip-text`;

                // Level
                elLevel.innerHTML = tnLevel.textContent = uiNumCast(L);

                // Attr
                elAttrs.innerHTML = "";
                elAttrs.innerHTML = Q.map((q, i) => {
                    const [k, v] = S[i], r = (Tier[1] > 100) ? (q > Tier[3]) ? "danger" : (q > Tier[2]) ? "warning" : "success" : (q > Tier[0]) ? "info" : "primary";
                    return `<p class="fyg_xlxx${r}"><span>${gMsgEquipAttrName[k] || k}</span><span> ${uiNumFix2(v)}</span><span class="pull-right bg-${r}">&nbsp;${uiNumCast(q * Mul + Add)}%&nbsp;</span></p>`
                }).join("");

                // Myst
                elMyst.style.display = Z.length > $EquipMystIndex ? "" : "none";

                // Icon
                icon();
            },

            open = b => {
                elLevel.style.display = elPanel.style.display = b ? "" : "none";
            },

            show = b => {
                elRoot.style.display = b ? "" : "none";
            },

            clr = () => {
                set({K: 0, R: 1, L: 0, V: 0, Q: [], Z: [], S: []}); open(!1);
                elRoot.checked = !1; elRoot.style.boxShadow = "";
            }
        ;

        elRoot.classList = "btn fyg_colpzbg fyg_ec tip-bottom"; elRoot.style = "";
        elRoot.append(" ", document.createElement("br"), elLevel, elPanel);
        elPanel.append(elArrow, elTitle, elInner);
        elArrow.classList = "arrow"; elTitle.classList = "popover-title"; elInner.classList = "popover-content";
        elTitle.append("Lv.", tnLevel, " ", tnName);
        elInner.append(elAttrs, elMyst, elDesc);
        elMyst.classList = "bg-danger with-padding";
        elDesc.style = "font-weight: normal;";
        
        elRoot.set = set;
        elRoot.clr = clr;
        elRoot.open = open;
        elRoot.show = show;
        elRoot.onload = () => {
            const {K, Z} = elRoot, l = elAttrs.children;
            tnName.textContent = gMsgEquipName[K] ?? K;
            elRoot.S.map((x, i) => { l[i].firstChild.textContent = gMsgEquipAttrName[x[0]] ?? x[0]; });
            elMyst.innerHTML = $EquSkillName(Z[$EquipMystIndex]);
            elDesc.innerHTML = gMsgEquipDesc[K] ?? K;
        };
        elRoot.onreset = icon;
        clr();

        return elRoot;  
    },

    // Render fruit and return the root element.
    uiFruit = () => {
        const
            elRoot = document.createElement("button"),
            elPanel = document.createElement("div"),
            elArrow = document.createElement("div"),
            elTitle = document.createElement("h3"),
            elInner = document.createElement("div"),
            elLevel = document.createElement("span"),
            
            tnLevel = document.createTextNode(""),
            tnName = document.createTextNode(""),

            icon = () => {
                elRoot.style.backgroundImage = `url(${gUsrPath(RES_EQ, elRoot.K, elRoot.R)})`;
            },

            set = (d) => {
                const {K, R, L, V, S} = d;

                elRoot.K = K; elRoot.R = R; elRoot.L = L; elRoot.V = V;
                elRoot.S = S;

                // Kind
                tnName.textContent = gMsgFruitName[K] ?? K;

                // Rank
                elPanel.classList = `popover popover-${gCssCardClass[R]} fade bottom tip-text`;

                // Level
                elLevel.innerHTML = L; tnLevel.textContent = L;

                // Stats
                elInner.innerHTML = "";
                for (const [k, v] of S) {
                    const e = document.createElement("p"), l = document.createTextNode(gMsgFruitAttrName[k] || k), r = document.createElement("span");
                    e.classList = "with-padding bg-special fyg_f14 fyg_nw"; e.append(l, r);
                    r.classList = "pull-right"; r.append(`+ ${uiNumFix1(v)} `, gMsgFruitAttrUnit[k] ?? "");
                    elInner.append(e);
                }

                // Icon
                icon();
            },

            open = b => {
                elLevel.style.display = elPanel.style.display = b ? "" : "none";
            },

            show = b => {
                elRoot.style.display = b ? "" : "none";
            },

            clr = () => {
                set({K: 0, R: 1, L: 0, V: 0, S: []}); open(!1);
                elRoot.checked = !1; elRoot.style.boxShadow = "";
            }
        ;

        elRoot.classList = "btn fyg_colpzbg fyg_ec tip-bottom"; elRoot.style = "";
        elRoot.append(" ", document.createElement("br"), elLevel, elPanel);
        elPanel.append(elArrow, elTitle, elInner);
        elArrow.classList = "arrow"; elTitle.classList = "popover-title"; elInner.classList = "popover-content";
        elTitle.append(tnName, " +", tnLevel);
        
        elRoot.set = set;
        elRoot.clr = clr;
        elRoot.open = open;
        elRoot.show = show;
        elRoot.onload = () => {
            const l = elInner.children;
            let i = 0;
            tnName.textContent = gMsgFruitName[elRoot.K] || elRoot.K;
            for (const [k, v] of elRoot.S) {
                const el = l[i++];
                el.firstChild.textContent = gMsgFruitAttrName[k] ?? k; el.lastChild.lastChild.textContent = gMsgFruitAttrUnit[k] ?? "";
            };
        };
        elRoot.onreset = icon;
        clr();

        return elRoot;  
    },

    // Render equipment and return the root element.
    uiWear = () => {
        const
            elRoot = document.createElement("button"),
            elIcon = document.createElement("img"),
            elPanel = document.createElement("div"),
            elArrow = document.createElement("div"),
            elTitle = document.createElement("h3"),
            elInner = document.createElement("div"),
            elAttrs = document.createElement("div"),
            elMyst = document.createElement("p"),
            elDesc = document.createElement("p"),
            elLevel = document.createElement("span"),
            
            tnLevel = document.createTextNode(""),
            tnName = document.createTextNode(""),

            icon = () => {
                elIcon.src = gUsrPath(RES_EQ, elRoot.K, elRoot.R);
            },

            set = (d) => {
                const 
                    {K, R, L, V, Q, Z, S} = d,
                    {Mul, Add, Tier} = LYT_FYG.Equip
                ;
                
                elRoot.K = K; elRoot.R = R; elRoot.L = L;
                elRoot.V = V; elRoot.Q = Q; elRoot.Z = Z;
                elRoot.S = S;

                // Kind
                tnName.textContent = gMsgEquipName[K] ?? K;
                elMyst.innerHTML = $EquSkillName(Z[$EquipMystIndex]);
                elDesc.innerHTML = gMsgEquipDesc[K] ?? K;

                // Rank
                elRoot.classList = `btn fyg_colpzbg btn-${gCssCardClass[R]} fyg_colpz0${R} fyg_wear tip-bottom`;
                elPanel.classList = `popover popover-${gCssCardClass[R]} fade botton tip-text`;

                // Level
                elLevel.innerHTML = tnLevel.textContent = uiNumCast(L);

                // Attr
                elAttrs.innerHTML = "";
                elAttrs.innerHTML = Q.map((q, i) => {
                    const [k, v] = S[i], r = (q > Tier[1]) ? (q > Tier[3]) ? "danger" : (q > Tier[2]) ? "warning" : "success" : (q > Tier[0]) ? "info" : "primary";
                    return `<p class="fyg_xlxx${r}"><span>${gMsgEquipAttrName[k] ?? k}</span><span> ${uiNumCast(v)}</span><span class="pull-right bg-${r}">&nbsp;${uiNumber(q * Mul + Add)}%&nbsp;</span></p>`
                }).join("");

                // Myst
                elMyst.style.display = Z.length > $EquipMystIndex ? "" : "none";

                // Icon
                icon();
            },

            open = b => {
                elLevel.style.display = elPanel.style.display = b ? "" : "none";
            },

            show = b => {
                elRoot.style.display = b ? "" : "none";
            },

            clr = () => {
                set({K: 0, R: 1, L: 0, V: 0, Q: [], Z: [], S: []}); open(!1);
                elRoot.checked = !1; elRoot.style.boxShadow = "";
            }
        ;

        elRoot.style = "background-color:#FFFFFF;";
        elRoot.append(elLevel, document.createElement("br"), elIcon, elPanel);
        elLevel.classList = "fyg_f18"; elIcon.classList = "fyg_img"; elIcon.onerror = uiImgError;
        elPanel.append(elArrow, elTitle, elInner);
        elArrow.classList = "arrow"; elTitle.classList = "popover-title"; elInner.classList = "popover-content";
        elTitle.append("Lv.", tnLevel, " ", tnName);
        elInner.append(elAttrs, elMyst, elDesc);
        elMyst.classList = "bg-danger with-padding";
        elDesc.style = "font-weight: normal;";
        
        elRoot.set = set;
        elRoot.open = open;
        elRoot.show = show;
        elRoot.clr = clr;
        elRoot.onload = () => {
            const {K, Z} = elRoot, l = elAttrs.children;
            tnName.textContent = gMsgEquipName[K] ?? K;
            elRoot.S.forEach((x, i) => {l[i].firstChild.innerHTML = gMsgEquipAttrName[x[0]] ?? x[0];});
            elMyst.innerHTML = $EquSkillDesc(Z[$EquipMystIndex]);
            elDesc.innerHTML = gMsgEquipDesc[K] ?? K;
        };
        elRoot.onreset = icon;
        clr();

        return elRoot;  
    },

    uiCardChk = (el) => {
        el.style.boxShadow = (el.checked = !el.checked) ? "0 0 0.5rem 0.5rem gold" : "";
        el.blur();
    },

    // Construct selection zone
    uiSelZone = (el) => {

        let x0, x1, y0, y1, mov, end;

        const 

            _ret = () => {},

            _mov = (x, y) => {
                x1 = x + window.scrollX; y1 = y + window.scrollY;
                const [l, w] = (x0 > x1) ? [x1, x0 - x1] : [x0, x1 - x0];
                const [t, h] = (y0 > y1) ? [y1, y0 - y1] : [y0, y1 - y0];
                zCursor.left = l+"px"; zCursor.width = w+"px";
                zCursor.top = t+"px"; zCursor.height = h+"px";
            },

            _end = () => {
                zCursor.display = "none"; mov = _ret; end = _ret;
                const sx = window.scrollX, sy = window.scrollY;
                if (x0 > x1) { const t = x1; x1 = x0; x0 = t; }
                if (y0 > y1) { const t = y1; y1 = y0; y0 = t; }
                x0 -= sx; x1 -= sx; y0 -= sy; y1 -= sy;
                for (const e of el.children) {
                    const {left, top, right, bottom} = e.getBoundingClientRect();
                    if (x1 > left && y1 > top && x0 < right && y0 < bottom) { uiCardChk(e); }
                }
            },
            
            set = (x, y) => {
                x0 = x1 = x + window.scrollX; y0 = y1 = y + window.scrollY;
                zCursor.height = 0; zCursor.width = 0;
                zCursor.display = ""; mov = _mov; end = _end;
            }
        ;
        
        mov = _ret; end = _ret;

        el.onmousedown = (e) => set(e.clientX, e.clientY);
        el.ontouchstart = (e) => set(e.touches[0].clientX, e.touches[0].clientY);
        el.onmousemove = (e) => mov(e.clientX, e.clientY);
        el.ontouchmove = (e) => mov(e.touches[0].clientX, e.touches[0].clientY);
        el.onmouseup = el.onmouseleave = el.touchend = () => end();
        el.classList.add("szone");
    },

    // Construct shop item
    uiShopItem = () => {
        let P = {}, G = {};
        const
            elRoot = document.createElement("div"),
            elName = document.createElement("span"),
            elMark = document.createElement("span"),
            elInput = document.createElement("input"),
            elBuy = document.createElement("button"),

            eval = () => {
                const n = uiNumCast(elInput.value), T = [];
                for (const k in P) { T.push(n * P[k] + " " + gMsgItemName[k]); }
                elBuy.innerHTML = T.join(" + ") || "　";
                elInput.value = n; elBuy.n = n;
            },

            open = b => { elRoot.style.display = b ? "" : "none"; },
            
            data = (i, d) => {
                const T = [];
                G = d.Gain ?? {}; P = d.Cost ?? {};
                for (const k in G) {
                    const n = G[k];
                    if (!n) { T.push(gMsgItemName[k] ?? k); continue; }
                    T.push((gMsgItemName[k] ?? k) + "×" + G[k] + (gMsgItemUnit[k] ?? k));
                }
                elName.innerHTML = T.join(" + ");
                elBuy.i = i; elBuy.p = P; elBuy.g = G;
                eval();
            },

            call = d => elBuy.onclick = d;

            reset = () => {
                elName.innerHTML = ""; elBuy.innerHTML = "　"; P = {};
                elBuy.i = ""; elBuy.n = 1; elRoot.style.display = "none";
                elInput.value = 1;
            }
        ;
        
        elRoot.classList = "row alert fyg_lh24";
        elRoot.append(elName, elMark, elInput, elBuy);
        elName.classList = "col-md-3 col-xs-6"; elMark.classList = "col-md-1 col-xs-2 fyg_tr"; elInput.classList = "col-md-2 col-xs-4";
        elMark.innerHTML = "×";
        elBuy.classList = "col-md-6 col-xs-12";
        elRoot.open = open;
        elRoot.dt = data;
        elRoot.cb = call;
        elRoot.clr = reset;
        elInput.onblur = eval;
        elRoot.onload = () => {
            const n = uiNumCast(elInput.value), TC = [], TG = [];
            for (const k in P) { TC.push(n * P[k] + " " + gMsgItemName[k]); }
            elBuy.innerHTML = TC.join(" + ") || "　";
            for (const k in G) {
                const n = G[k];
                if (!n) { TG.push(gMsgItemName[k] ?? k); continue; }
                TG.push(gMsgItemName[k] + "×" + n + gMsgItemUnit[k]);
            }
            elName.innerHTML = TG.join(" + ");
        };
        reset();

        return elRoot;
    },

    // Construct shop item
    uiShopBack = () => {
        let P = {};
        const
            elRoot = document.createElement("div"),
            elName = document.createElement("span"),
            elMark = document.createElement("span"),
            elInput = document.createElement("input"),
            elBuy = document.createElement("button"),

            eval = () => {
                const 
                    l = gUser[elBuy.i] ?? 0, n = Math.min(elBuy.l - l, uiNumCast(elInput.value)), 
                    m = n * n + 2 * l * n, T = []
                ;
                for (const k in P) { T.push(m * P[k] + " " + gMsgItemName[k]); }
                elBuy.innerHTML = T.join(" + ") || "　";
                elInput.value = n; elBuy.n = n; elBuy.m = m;
            },

            open = b => { elRoot.style.display = b ? "" : "none"; },
            
            data = (i, p, l) => {
                elName.innerHTML = (gMsgItemName[i] ?? i); // + "×1" + (gMsgItemUnit[i] ?? i);
                elBuy.i = i; elBuy.p = P = p; elBuy.l = l;
                eval();
            },

            call = d => elBuy.onclick = d;

            reset = () => {
                elName.innerHTML = ""; elBuy.innerHTML = "　"; P = {};
                elBuy.i = ""; elBuy.n = 1; elRoot.style.display = "none";
                elInput.value = 1;
            }
        ;
        
        elRoot.classList = "row alert fyg_lh24";
        elRoot.append(elName, elMark, elInput, elBuy);
        elName.classList = "col-md-3 col-xs-6"; elMark.classList = "col-md-1 col-xs-2 fyg_tr"; elInput.classList = "col-md-2 col-xs-4";
        elMark.innerHTML = "×";
        elBuy.classList = "col-md-6 col-xs-12";
        elRoot.open = open;
        elRoot.dt = data;
        elRoot.cb = call;
        elRoot.clr = reset;
        elInput.onblur = eval;
        elRoot.onload = () => {
            const i = elBuy.i;
            elName.innerHTML = (gMsgItemName[i] ?? i); // + "×1" + (gMsgItemUnit[i] ?? i);
            eval();
        };
        reset();

        return elRoot;
    },
    
    // Dragstart callback
    uiElemDrag = (D, e) => {
        D._drag = e;
    },

    // Drop callback
    uiElemDrop = (D, E, e) => {
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
    uiElemDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    },

    // Render Battle
    // Only two teams supported at this point.
    gDummyBattle = {team: [[], []], mode: [0, 0], sign: -1, game: []},
    uiRenderBattle22 = (() => {
    const
        bmsgJpt = {
            [$BmStat]: (i, m) => `<i class="icon icon-unlink"><b>${gMsgStatusName[i] ?? i}${gMsgData[$MsgStatusPrefix]}${m}${gMsgData[$MsgStatusSuffix]}</b></i>`,
            [$BmAct]: (i, m) => `<i class="icon icon-location-arrow"><b>${gMsgData[i] ?? i}${m}</b></i>`,
            [$BmHpot]: (i, m) => `<i class="icon icon-bookmark-empty text-success"><b>${gMsgData[$MsgActHpPot]}</b></i>`,
            [$BmSpot]: (i, m) => `<i class="icon icon-bookmark-empty text-success"><b>${gMsgData[$MsgActSdPot]}</b></i>`,
            [$BmSkl]: (i, m) => `<i class="icon icon-location-arrow"><b>${$EquSkillName(i)}${gMsgData[$MsgSkillPrefix]}${m}${gMsgData[$MsgSkillSuffix]}</b></i>`,
            [$BmSklEx]: (i, m) => `<i class="icon icon-location-arrow"><b>${$EquSkillName(i)}${gMsgData[$MsgSkillPrefix]}${gMsgData[m] ?? m}${gMsgData[$MsgSkillSuffix]}</b></i>`
        },
        bmsgNop = (i, m) => "",
    
        bmsg = p => {
            const S = {};
            p.forEach((t) => {
                const [a, i, m] = t, k = (bmsgJpt[a] ?? bmsgNop)(i, m);
                S[k] = (S[k] || 0n) + 1n;
            });
            return Object.keys(S).map(k => S[k] > 1n ? `${k}<i><b>×${S[k]}</b></i>` : k).join("&nbsp");
        },
    
        bdbg = p => p.map((t) => {
            const [i, m] = t;
            return `<b>${gMsgStatusName[i] ?? i}:${m}</b>`
        }).join("&nbsp"),
    
        bdmg = p => `
        ${(p.pa > 0) ? `<i class="icon icon-bolt text-danger fyg_f14">${uiNumber(p.pa)}</i>&nbsp;&nbsp;` : ""}
        ${(p.ma > 0) ? `<i class="icon icon-bolt text-primary fyg_f14">${uiNumber(p.ma)}</i>&nbsp;&nbsp;` : ""}
        ${(p.aa > 0) ? `<i class="icon icon-bolt text-warning fyg_f14">${uiNumber(p.aa)}</i>&nbsp;&nbsp;` : ""}
        ${(p.hd > 0) ? `<i class="icon icon-minus text-danger fyg_f14">${uiNumber(p.hd)}</i>&nbsp;&nbsp;` : ""}
        ${(p.hr > 0) ? `<i class="icon icon-plus text-danger fyg_f14">${uiNumber(p.hr)}</i>&nbsp;&nbsp;` : ""}
        ${(p.sd > 0) ? `<i class="icon icon-minus text-info fyg_f14">${uiNumber(p.sd)}</i>&nbsp;&nbsp;` : ""}
        ${(p.sr > 0) ? `<i class="icon icon-plus text-info fyg_f14">${uiNumber(p.sr)}</i>&nbsp;&nbsp;` : ""}
        `,
    
        bval = p => `<span class="fyg_f14 text-info">${Math.ceil(p.sdn)}</span> | <span class="fyg_f14 text-danger">${Math.ceil(p.hpn)}</span>`
    ;

    return data => {
        const T = [], L = data.team[0], R = data.team[1], A = data.mode[0], B = data.mode[1];

        // Show Versus Message
        T.push(
        `
        <div class="row"><div class="row">
        <div class="col-xs-12 col-md-6 fyg_fl">
        ${L.map(u => {
            let i = 0;
        
            return `
        <div class="alert alert-danger" style="background-color:#ffffff;border:1px #EA644A solid; height: 18rem; overflow: scroll; background-image: url(&quot;${gUsrPath(RES_CH, u.at, "L")}&quot;); background-position: center; background-size: contain; background-repeat:no-repeat;"><div class="row">
        <div class="col-md-7 fyg_tr fyg_fr">
        <span class="fyg_f18">${B ? `${gMsgActorName[u.at]}（Lv.${uiNumber(u.lv)} ${gMsgData[$MsgAttrIsPVE]}）` : `${u.nm}（Lv.${uiNumber(u.lv)} ${gMsgActorName[u.at]}）`}</span><br>
            [${gMsgData[$MsgAttrHpMax]}:${Math.ceil(u.hp)}] [${gMsgData[$MsgAttrSdMax]}:${Math.ceil(u.sd)}]<br>
            [${gMsgData[$MsgAttrSpd]}:${Math.ceil(u.sp)}]<br>
            [${gMsgData[$MsgAttrPowP]}:${Math.ceil(u.pp)}] [${gMsgData[$MsgAttrPowM]}:${Math.ceil(u.pm)}]<br>
            [${gMsgData[$MsgAttrAtkP]}:${Math.ceil(u.ap)}] [${gMsgData[$MsgAttrAtkM]}:${Math.ceil(u.am)}]<br>
            [${gMsgData[$MsgAttrDefP]}:${Math.ceil(u.dp)}] [${gMsgData[$MsgAttrDefM]}:${Math.ceil(u.dm)}]<br>
            <br>
        </div>
        <div class="col-md-5 fyg_tl">
            <div class="fyg_nw" style="min-height: 6.75rem;">
            ${u.eq.map(
                (e) => `<button type="button" class="btn fyg_colpzbg fyg_ec" title="${gMsgEquipName[e.k]}" style="background-image: url(${gUsrPath(RES_EQ, e.k, e.r)});" ><br>${uiNumber(e.l)}</button>`
            ).join("")}
            </div><br>
            ${u.fa.sort().map(
                n => `|${$EquSkillName((LYT_FYG.Auras[n] ?? 0))}|${(++i < 3) ? "" : (i = 0, "<br>")}`
            ).join("")}
        </div></div></div>
        `}).join("")}
        </div>
        <div class="col-xs-12 col-md-6 fyg_fr">
        ${R.map(u => {
            let i = 0;
            
            return `
        <div class="alert alert-info" style="background-color:#ffffff;border:1px #03B8CF solid; height: 18rem; overflow: scroll; background-image: url(&quot;${gUsrPath(RES_CH, u.at, "R")}&quot;); background-position: center; background-size: contain; background-repeat:no-repeat;"><div class="row">
        <div class="col-md-7 fyg_tl fyg_fl">
        <span class="fyg_f18">${A ? `${gMsgActorName[u.at]}（${gMsgData[$MsgAttrIsPVE]} Lv.${uiNumber(u.lv)}）` : `${u.nm}（${gMsgActorName[u.at]} Lv.${uiNumber(u.lv)}）`}</span><br>
            [${gMsgData[$MsgAttrHpMax]}:${Math.ceil(u.hp)}] [${gMsgData[$MsgAttrSdMax]}:${Math.ceil(u.sd)}]<br>
            [${gMsgData[$MsgAttrSpd]}:${Math.ceil(u.sp)}]<br>
            [${gMsgData[$MsgAttrPowP]}:${Math.ceil(u.pp)}] [${gMsgData[$MsgAttrPowM]}:${Math.ceil(u.pm)}]<br>
            [${gMsgData[$MsgAttrAtkP]}:${Math.ceil(u.ap)}] [${gMsgData[$MsgAttrAtkM]}:${Math.ceil(u.am)}]<br>
            [${gMsgData[$MsgAttrDefP]}:${Math.ceil(u.dp)}] [${gMsgData[$MsgAttrDefM]}:${Math.ceil(u.dm)}]<br>
            <br>
        </div>
        <div class="col-md-5 fyg_tr">
            <div class="fyg_nw" style="min-height: 6.75rem;">
            ${u.eq.map(
                (e) => `<button type="button" class="btn fyg_colpzbg fyg_ec" title="${gMsgEquipName[e.k]}" style="background-image: url(${gUsrPath(RES_EQ, e.k, e.r)});" ><br>${uiNumber(e.l)}</button>`
            ).join("")}
            </div><br>
            ${u.fa.sort().map(
                n => `|${$EquSkillName((LYT_FYG.Auras[n] ?? 0))}|${(++i < 3) ? "" : (i = 0, "<br>")}`
            ).join("")}
        </div></div></div>
        `}).join("")}
        </div></div>
        `
        );
        
        // Battle log
        data.game.map(X => {
            const L = X[0], R = X[1];

            T.push(`
            <div class="row" style="max-height: 62rem; overflow: scroll;">
            <div class="col-xs-6 fyg_tr fyg_fl">
            ${L.map(u => `
            <div class="col-xs-12 fyg_fr"><p class="row fyg_mp0 fyg_nw fyg_lh30${u.act ? " with-padding bg-special" : ""}" style="border-radius:0 2rem 2rem 0;">&nbsp;${bmsg(u.msg)}&nbsp;&nbsp;&nbsp;</p></div>
            ${u.dbg ? `<div class="col-xs-12 fyg_fr"><p class="row alert-primary fyg_mp0 fyg_nw fyg_lh30" style="border-radius:0 2rem 2rem 0;">&nbsp;${bdbg(u.dbg)}&nbsp;&nbsp;&nbsp;</p></div>` : ""}
            <div class="col-xs-3 fyg_tc fyg_fr fyg_nw">${bval(u)}</div><div class="col-xs-9 fyg_fl"><p class="fyg_mp0 fyg_nw fyg_lh30 fyg_tr">&nbsp;${bdmg(u)}</p></div>
            <div class="col-xs-12 fyg_fr"><p class="row bg-blue fyg_pvedt fyg_mp0 fyg_fr" style="width:${u.sdr}%;"></p></div>
            <div class="col-xs-12 fyg_fr"><p class="row bg-red fyg_pvedt fyg_mp0 fyg_fr" style="width:${u.hpr}%;"></p></div>
            `).join("")}
            </div>
            <div class="col-xs-6 fyg_tl fyg_fr">
            ${R.map(u => `
            <div class="col-xs-12 fyg_fr"><p class="row fyg_mp0 fyg_nw fyg_lh30${u.act ? " with-padding bg-special" : ""}" style="border-radius:2rem 0 0 2rem;">&nbsp;${bmsg(u.msg)}&nbsp;&nbsp;&nbsp;</p></div>
            ${u.dbg ? `<div class="col-xs-12 fyg_fr"><p class="row alert-primary fyg_mp0 fyg_nw fyg_lh30" style="border-radius:2rem 0 0 2rem;">&nbsp;${bdbg(u.dbg)}&nbsp;&nbsp;&nbsp;</p></div>` : ""}
            <div class="col-xs-3 fyg_tc fyg_fl fyg_nw">${bval(u)}</div><div class="col-xs-9 fyg_fl"><p class="fyg_mp0 fyg_nw fyg_lh30 fyg_tl">&nbsp;${bdmg(u)}</p></div>
            <div class="col-xs-12 fyg_tc fyg_fl"><p class="row bg-blue fyg_pvedt fyg_mp0 fyg_fl" style="width:${u.sdr}%;"></p></div>
            <div class="col-xs-12 fyg_tc fyg_fl"><p class="row bg-red fyg_pvedt fyg_mp0 fyg_fl" style="width:${u.hpr}%;"></p></div>
            `).join("")}
            </div>
            </div>
            <hr style="border-top: 0.1rem solid #e5e5e5;">
            `);
        });

        // Result
        switch (data.sign) {
    
        // Draw
        case "0":
            T.push(`
            <div class="row">
    <div class="col-xs-12">&nbsp;</div>
    <div class="col-xs-12"><div class="alert with-icon fyg_tc" style="border:1px #BFBFBF solid;"><h2>${gMsgData[$MsgDescPKDraw]}</h2></div></div>
    </div>
            `);
            break;
    
        // Defender died
        case "1":
            T.push(`
            <div class="row">
    <div class="col-xs-12">&nbsp;</div>
    <div class="col-xs-12"><div class="alert alert-danger with-icon fyg_tc" style="border:1px #EA644A solid;"><i class="icon icon-smile"></i><h2>${(B ? L.map(u => gMsgActorName[u.at]) : L.map(u => u.nm)).join(" & ")}${gMsgData[$MsgDescPKWinner]}</h2></div></div>
    </div>
            `);
            break;
    
        // Attacker died
        case "2":
            T.push(`
            <div class="row">
    <div class="col-xs-12">&nbsp;</div>
    <div class="col-xs-12"><div class="alert alert-info with-icon fyg_tc" style="border:1px #03B8CF solid;"><i class="icon icon-frown"></i><h2>${(A ? R.map(u => gMsgActorName[u.at]) : R.map(u => u.nm)).join(" & ")}${gMsgData[$MsgDescPKWinner]}</h2></div></div>
    </div>
            `);
            break;

        // Round over
        case "3":
            T.push(`
            <div class="row">
        <div class="col-xs-12">&nbsp;</div>
        <div class="col-xs-12"><div class="alert with-icon" style="border:1px #BFBFBF solid;"><h4>${gMsgData[$MsgDescPKRoundOver]}</h4></div></div>
        </div>
            `);
        }
    
        // End of File
        T.push(`
        </div></div>
        `);
        
        // Concat to HTML
        return T.join("");
    }})(),
    
    uiRenderBattle23 = (() => {
        const
            bmsgJpt = {
                [$BmStat]: (i, m) => `<i class="icon icon-unlink"><b>${gMsgStatusName[i] ?? i}${gMsgData[$MsgStatusPrefix]}${m}${gMsgData[$MsgStatusSuffix]}</b></i>`,
                [$BmAct]: (i, m) => `<i class="icon icon-location-arrow"><b>${gMsgData[i] ?? i}${m}</b></i>`,
                [$BmHpot]: (i, m) => `<i class="icon icon-bookmark-empty text-success"><b>${gMsgData[$MsgActHpPot]}</b></i>`,
                [$BmSpot]: (i, m) => `<i class="icon icon-bookmark-empty text-success"><b>${gMsgData[$MsgActSdPot]}</b></i>`,
                [$BmSkl]: (i, m) => `<i class="icon icon-location-arrow"><b>${$EquSkillName(i)}${gMsgData[$MsgSkillPrefix]}${m}${gMsgData[$MsgSkillSuffix]}</b></i>`,
                [$BmSklEx]: (i, m) => `<i class="icon icon-location-arrow"><b>${$EquSkillName(i)}${gMsgData[$MsgSkillPrefix]}${gMsgData[m] ?? m}${gMsgData[$MsgSkillSuffix]}</b></i>`            }
            bmsgNop = (i, m) => "",
        
            bmsg = p => {
                const S = {};
                p.forEach((t) => {
                    const [a, i, m] = t, k = (bmsgJpt[a] ?? bmsgNop)(i, m);
                    S[k] = (S[k] || 0n) + 1n;
                });
                return Object.keys(S).map(k => S[k] > 1n ? `${k}<i><b>×${S[k]}</b></i>` : k).join("&nbsp");
            },
        
            bdbg = p => p.map((t) => {
                const [i, m] = t;
                return `<b>${gMsgStatusName[i] ?? i}:${m}</b>`
            }).join("&nbsp"),
        
            bbar = r => (r > 16) ? r * 0.5 : (r > 0) ? 8 : 3,

            bdmgl = p => `
            ${(p.hd > 0) ? `<i class="icon icon-minus text-danger fyg_f14">${uiNumber(p.hd)}</i>&nbsp;&nbsp;` : ""}
            ${(p.hr > 0) ? `<i class="icon icon-plus text-danger fyg_f14">${uiNumber(p.hr)}</i>&nbsp;&nbsp;` : ""}
            ${(p.sd > 0) ? `<i class="icon icon-minus text-info fyg_f14">${uiNumber(p.sd)}</i>&nbsp;&nbsp;` : ""}
            ${(p.sr > 0) ? `<i class="icon icon-plus text-info fyg_f14">${uiNumber(p.sr)}</i>&nbsp;&nbsp;` : ""}
            ${(p.aa > 0) ? `<i class="icon icon-bolt text-warning fyg_f14">${uiNumber(p.aa)}</i>&nbsp;&nbsp;` : ""}
            ${(p.ma > 0) ? `<i class="icon icon-bolt text-primary fyg_f14">${uiNumber(p.ma)}</i>&nbsp;&nbsp;` : ""}
            ${(p.pa > 0) ? `<i class="icon icon-bolt text-danger fyg_f14">${uiNumber(p.pa)}</i>&nbsp;&nbsp;` : ""}
            `,
        
            bdmgr = p => `
            ${(p.pa > 0) ? `<i class="icon icon-bolt text-danger fyg_f14">${uiNumber(p.pa)}</i>&nbsp;&nbsp;` : ""}
            ${(p.ma > 0) ? `<i class="icon icon-bolt text-primary fyg_f14">${uiNumber(p.ma)}</i>&nbsp;&nbsp;` : ""}
            ${(p.aa > 0) ? `<i class="icon icon-bolt text-warning fyg_f14">${uiNumber(p.aa)}</i>&nbsp;&nbsp;` : ""}
            ${(p.sr > 0) ? `<i class="icon icon-plus text-info fyg_f14">${uiNumber(p.sr)}</i>&nbsp;&nbsp;` : ""}
            ${(p.sd > 0) ? `<i class="icon icon-minus text-info fyg_f14">${uiNumber(p.sd)}</i>&nbsp;&nbsp;` : ""}
            ${(p.hr > 0) ? `<i class="icon icon-plus text-danger fyg_f14">${uiNumber(p.hr)}</i>&nbsp;&nbsp;` : ""}
            ${(p.hd > 0) ? `<i class="icon icon-minus text-danger fyg_f14">${uiNumber(p.hd)}</i>&nbsp;&nbsp;` : ""}
            `,
            
            bact = (a, b) => a + b.act
        ;
    
    return data => {
        const T = [], L = data.team[0], R = data.team[1], A = data.mode[0], B = data.mode[1];

        // Show Versus Message
        T.push(
        `
        <div class="row"><div class="row">
        <div class="col-xs-12 col-md-6 fyg_fl">
        ${L.map(u => {
            let i = 0;
        
            return `
        <div class="alert alert-danger" style="background-color:#ffffff;border:1px #EA644A solid; height: 18rem; overflow: scroll; background-image: url(&quot;${gUsrPath(RES_CH, u.at, "L")}&quot;); background-position: center; background-size: contain; background-repeat:no-repeat;"><div class="row">
        <div class="col-md-7 fyg_tr fyg_fr">
        <span class="fyg_f18">${B ? `${gMsgActorName[u.at]}（Lv.${uiNumber(u.lv)} ${gMsgData[$MsgAttrIsPVE]}）` : `${u.nm}（Lv.${uiNumber(u.lv)} ${gMsgActorName[u.at]}）`}</span><br>
            <p><span class="label label-danger label-outline fyg_f14">${uiNumber(u.hp)} ${gMsgData[$MsgAttrHpMax]}</span>&nbsp;<span class="label label-info label-outline fyg_f14">${uiNumber(u.sd)} ${gMsgData[$MsgAttrSdMax]}</span></p>
            <p><span class="label label-outline fyg_f14">${uiNumber(u.sp)} ${gMsgData[$MsgAttrSpd]}</span></p>
            <p><span class="label label-outline fyg_f14">${uiNumber(u.pp)} ${gMsgData[$MsgAttrPowP]}</span>&nbsp;<span class="label label-outline fyg_f14">${uiNumber(u.pm)} ${gMsgData[$MsgAttrPowM]}</span></p>
            <p><span class="label label-outline fyg_f14">${uiNumber(u.ap)} ${gMsgData[$MsgAttrAtkP]}</span>&nbsp;<span class="label label-outline fyg_f14">${uiNumber(u.am)} ${gMsgData[$MsgAttrAtkM]}</span></p>
            <p><span class="label label-outline fyg_f14">${uiNumber(u.dp)} ${gMsgData[$MsgAttrDefP]}</span>&nbsp;<span class="label label-outline fyg_f14">${uiNumber(u.dm)} ${gMsgData[$MsgAttrDefM]}</span></p>
            <br>
        </div>
        <div class="col-md-5 fyg_tl">
            <div class="fyg_nw" style="min-height: 6.75rem;">
            ${u.eq.map(
                (e) => `<button type="button" class="btn fyg_colpzbg fyg_ec" title="${gMsgEquipName[e.k]}" style="background-image: url(${gUsrPath(RES_EQ, e.k, e.r)});" ><br>${uiNumber(e.l)}</button>`
            ).join("")}
            </div><br>
            ${u.fa.sort().map(
                n => `|${$EquSkillName((LYT_FYG.Auras[n] ?? 0))}|${(++i < 3) ? "" : (i = 0, "<br>")}`
            ).join("")}
        </div></div></div>
        `}).join("")}
        </div>
        <div class="col-xs-12 col-md-6 fyg_fr">
        ${R.map(u => {
            let i = 0;
            
            return `
        <div class="alert alert-info" style="background-color:#ffffff;border:1px #03B8CF solid; height: 18rem; overflow: scroll; background-image: url(&quot;${gUsrPath(RES_CH, u.at, "R")}&quot;); background-position: center; background-size: contain; background-repeat:no-repeat;"><div class="row">
        <div class="col-md-7 fyg_tl fyg_fl">
        <span class="fyg_f18">${A ? `${gMsgActorName[u.at]}（${gMsgData[$MsgAttrIsPVE]} Lv.${uiNumber(u.lv)}）` : `${u.nm}（${gMsgActorName[u.at]} Lv.${uiNumber(u.lv)}）`}</span><br>
            <p><span class="label label-info label-outline fyg_f14">${uiNumber(u.sd)} ${gMsgData[$MsgAttrSdMax]}</span>&nbsp;<span class="label label-danger label-outline fyg_f14">${uiNumber(u.hp)} ${gMsgData[$MsgAttrHpMax]}</span></p>
            <p><span class="label label-outline fyg_f14">${uiNumber(u.sp)} ${gMsgData[$MsgAttrSpd]}</span></p>
            <p><span class="label label-outline fyg_f14">${uiNumber(u.pm)} ${gMsgData[$MsgAttrPowM]}</span>&nbsp;<span class="label label-outline fyg_f14">${uiNumber(u.pp)} ${gMsgData[$MsgAttrPowP]}</span></p>
            <p><span class="label label-outline fyg_f14">${uiNumber(u.am)} ${gMsgData[$MsgAttrAtkM]}</span>&nbsp;<span class="label label-outline fyg_f14">${uiNumber(u.ap)} ${gMsgData[$MsgAttrAtkP]}</span></p>
            <p><span class="label label-outline fyg_f14">${uiNumber(u.dm)} ${gMsgData[$MsgAttrDefM]}</span>&nbsp;<span class="label label-outline fyg_f14">${uiNumber(u.dp)} ${gMsgData[$MsgAttrDefP]}</span></p>
            <br>
        </div>
        <div class="col-md-5 fyg_tr">
            <div class="fyg_nw" style="min-height: 6.75rem;">
            ${u.eq.map(
                (e) => `<button type="button" class="btn fyg_colpzbg fyg_ec" title="${gMsgEquipName[e.k]}" style="background-image: url(${gUsrPath(RES_EQ, e.k, e.r)});" ><br>${uiNumber(e.l)}</button>`
            ).join("")}
            </div><br>
            ${u.fa.sort().map(
                n => `|${$EquSkillName((LYT_FYG.Auras[n] ?? 0))}|${(++i < 3) ? "" : (i = 0, "<br>")}`
            ).join("")}
        </div></div></div>
        `}).join("")}
        </div></div>
        `
        );
        
        // Battle log
        data.game.map(X => {
            const L = X[0], R = X[1];

            T.push(`
            <div class="row fyg_pvero ${L.reduce(bact, 0) >= R.reduce(bact, 0) ? "fyg_bodanger hl-danger" : "fyg_boinfo hl-info"}" style="max-height: 62rem; overflow: scroll;">
            <div class="col-xs-6 fyg_tr fyg_fl">
            ${L.map(u => `
            <p${u.act ? " class=\"bg-default\"" : ""}><span class="row fyg_mp0 fyg_nw">&nbsp;${bmsg(u.msg)}${u.act ? "&nbsp;&nbsp;&nbsp;<i class=\"icon icon-double-angle-right fyg_f18\"></i><i class=\"icon icon-double-angle-right fyg_f18\"></i>" : ""}</span></p>
            ${u.dbg ? `<p class="row alert-primary fyg_mp0 fyg_nw">&nbsp;${bdbg(u.dbg)}&nbsp;&nbsp;&nbsp;</p>` : ""}
            <p class="fyg_mp0 fyg_nw fyg_tr">&nbsp;${bdmgl(u)}</p>
            <div class="row fyg_mp0">
            <span class="bg-blue fyg_pvedt fyg_mp0 fyg_fr" style="width:${bbar(u.sdr)}%;">${Math.ceil(u.sdn)}</span>
            <span class="bg-red fyg_pvedt fyg_mp0 fyg_fr" style="width:${bbar(u.hpr)}%;">${Math.ceil(u.hpn)}</span>
            </div>
            `).join("")}
            </div>
            <div class="col-xs-6 fyg_tl fyg_fr">
            ${R.map(u => `
            <p${u.act ? " class=\"bg-default\"" : ""}><span class="row fyg_mp0 fyg_nw">&nbsp;${u.act ? "<i class=\"icon icon-double-angle-left fyg_f18\"></i><i class=\"icon icon-double-angle-left fyg_f18\"></i>&nbsp;&nbsp;&nbsp;" : ""}${bmsg(u.msg)}</span></p>
            ${u.dbg ? `<p class="row alert-primary fyg_mp0 fyg_nw">&nbsp;${bdbg(u.dbg)}&nbsp;&nbsp;&nbsp;</p>` : ""}
            <p class="fyg_mp0 fyg_nw fyg_tl">&nbsp;${bdmgr(u)}</p>
            <div class="row fyg_mp0">
            <span class="bg-red fyg_pvedt fyg_mp0 fyg_fl" style="width:${bbar(u.hpr)}%;">${Math.ceil(u.hpn)}</span>
            <span class="bg-blue fyg_pvedt fyg_mp0 fyg_fl" style="width:${bbar(u.sdr)}%;">${Math.ceil(u.sdn)}</span>
            </div>
            `).join("")}
            </div>
            </div>
            `);
        });

        // Result
        switch (data.sign) {
    
        // Draw
        case "0":
            T.push(`
            <div class="row">
    <div class="col-xs-12">&nbsp;</div>
    <div class="col-xs-12"><div class="alert with-icon fyg_tc" style="border:1px #BFBFBF solid;"><h2>${gMsgData[$MsgDescPKDraw]}</h2></div></div>
    </div>
            `);
            break;
    
        // Defender died
        case "1":
            T.push(`
            <div class="row">
    <div class="col-xs-12">&nbsp;</div>
    <div class="col-xs-12"><div class="alert alert-danger with-icon fyg_tc" style="border:1px #EA644A solid;"><i class="icon icon-smile"></i><h2>${(B ? L.map(u => gMsgActorName[u.at]) : L.map(u => u.nm)).join(" & ")}${gMsgData[$MsgDescPKWinner]}</h2></div></div>
    </div>
            `);
            break;
    
        // Attacker died
        case "2":
            T.push(`
            <div class="row">
    <div class="col-xs-12">&nbsp;</div>
    <div class="col-xs-12"><div class="alert alert-info with-icon fyg_tc" style="border:1px #03B8CF solid;"><i class="icon icon-frown"></i><h2>${(A ? R.map(u => gMsgActorName[u.at]) : R.map(u => u.nm)).join(" & ")}${gMsgData[$MsgDescPKWinner]}</h2></div></div>
    </div>
            `);
            break;

        // Round over
        case "3":
            T.push(`
            <div class="row">
        <div class="col-xs-12">&nbsp;</div>
        <div class="col-xs-12"><div class="alert with-icon" style="border:1px #BFBFBF solid;"><h4>${gMsgData[$MsgDescPKRoundOver]}</h4></div></div>
        </div>
            `);
        }
    
        // End of File
        T.push(`
        </div></div>
        `);
        
        // Concat to HTML
        return T.join("");
    }})(),

    uiRenderBattle = data => {
        return (USR.LogKind ? uiRenderBattle23 : uiRenderBattle22)(data);
    },

    uiRenderRoller = data => {
        const T = [];

        // Info
        T.push(`<div class="fyg_f18 fyg_lh40"><div class="col-xs-12 panel fyg_tc fyg_mp3"><i class="icon icon-flag text-warning"></i>${gMsgDiceInfo.Prefix+data.info+gMsgDiceInfo.Suffix}</div>`);

        // Round
        data.game.forEach(t => {
            const [pL, mL, nL, dL, aL, pR, mR, nR, dR, aR] = t, l = pL >= pR, r = !l;
            T.push(`
            <div class="col-xs-6"><div class="col-xs-11 panel fyg_mp3">
                <span class="text-success">${nL}/${mL}</span>
                <span class="fyg_fr">
                    <span class="text-${l ? "danger" : "primary"}">${gMsgDiceInfo[aL] ?? ""}</span>
                    ${dL ? dL < 0 ? `<span class="text-danger"><i class="icon icon-arrow-down"></i>${-dL}</span>` : `<span class="text-success"><i class="icon icon-arrow-up"></i>${dL}</span>` : ""}
                    <div class="label${l ? " label-danger" : ""}">${pL}</div>
                </span>
            </div></div>
            <div class="col-xs-6"><div class="col-xs-11 panel fyg_fr fyg_mp3">
                <span class="fyg_fl">
                <div class="label${r ? " label-primary" : ""}">${pR}</div>
                    ${dR ? dR < 0 ? `<span class="text-danger"><i class="icon icon-arrow-down"></i>${-dR}</span>` : `<span class="text-success"><i class="icon icon-arrow-up"></i>${dR}</span>` : ""}
                    <span class="text-${r ? "danger" : "primary"}">${gMsgDiceInfo[aR] ?? ""}</span>
                </span>
                <span class="text-success fyg_fr">${nR}/${mR}</span>
            </div></div>
            `);
        });

        // Result
        T.push(`<div class="col-xs-12 panel fyg_tc fyg_mp3 text-${data.sign ? 
            `danger"><i class="icon icon-star"></i>${gMsgDiceInfo.Win}` :
            `gray"><i class="icon icon-star"></i>${gMsgDiceInfo.Lose}`
        }</div></div>`);

        return T.join("");
    }

;

// --------------------------------------------------------------------------------------------------------------------------------------------------------
// * Initialization *
// --------------------------------------------------------------------------------------------------------------------------------------------------------
gSetLang("zz");
eCursor.classList = "sbox"; zCursor.display = "none"; eSvcRoot.append(eCursor);
eSvcBack.classList = "fyg_backdrop"; eSvcBack.style.display = "none"; eSvcBack.append(eSvcSpin);
eSvcSpin.classList = "fyg_spin icon icon-5x icon-spin icon-spinner";

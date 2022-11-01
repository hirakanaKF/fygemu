/*
Project: fygemu
Authors: hirakana@kf
*/

(() => {

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Conponents *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------

    let gRank, gData = gDummyBattle, mCost = USR.Cost, mProg = 0, mDrug = 0, mTop = 0, mTrail = 0;

    const 
    
    // Components
    elSvcRank = document.createElement("span"),
    elSvcProg = document.createElement("span"),
    elSvcFuel = document.createElement("span"),
    elSvcPveLv = document.createElement("span"),
    elSvcStone = document.createElement("span"),

    // Dashboard
    elBoard = document.createElement("div"),
    elBoard1 = document.createElement("div"),
    elBoard2 = document.createElement("div"),
    elBoardLeft = document.createElement("div"),
    elBoardRank = document.createTextNode(""),
    elBoardProg = document.createTextNode(""),
    elBoardMiddle = document.createElement("div"),
    elBoardButton1 = document.createElement("button"),
    elBoardButton1Name = document.createElement("span"),
    elBoardButton1Desc = document.createTextNode(""),
    elBoardButton2 = document.createElement("button"),
    elBoardButton2Name = document.createElement("span"),
    elBoardButton2Desc = document.createTextNode(""),
    elBoardButton3 = document.createElement("button"),
    elBoardButton3Name = document.createElement("span"),
    elBoardButton3Desc = document.createTextNode(""),
    elBoardButton4 = document.createElement("button"),
    elBoardButton4Name = document.createElement("span"),
    elBoardButton4Desc = document.createTextNode(""),
    elBoardRight = document.createElement("div"),
    elBoardFuel = document.createTextNode(""),
    elBoardMisc = document.createElement("div"),
    elBoardRecover = document.createElement("button"),
    elBoardConfirmU = document.createElement("ul"),
    elBoardConfirmL = document.createElement("li"),
    elBoardConfirmA = document.createElement("a"),
    elBoardPveLv = document.createTextNode(""),

    // Output
    elOutput = uiPanel4({root: {tag: "div", classList: "fyg_pk row"}, panel: {tag: "div", classList: "panel panel-primary"}}),

    // Manual
    elManual = uiPanel4({root: {tag: "div", classList: "fyg_pk row"}, panel: {tag: "div", classList: "panel panel-info"}}),

    uiRankSet = r => {
        gRank = r; elSvcRank.innerHTML = gMsgRankName[r] ?? r;
        Client[$CoSysRank](r); // Set header
    },

    uiProgSet = r => {
        mProg = r;
        elSvcProg.innerHTML = uiNumber(r)+"%"; elSvcPveLv.innerHTML = "+"+uiNumber(r);
        elBoardButton4.style.display = (!(gRank >= mTop) && mProg >= mTrail) ? "" : "none";
    },

    uiFuelSet = r => {
        elSvcFuel.innerHTML = uiNumber(r);
    },

    uiRecover = r => {
        const T = [];
        for (const k in r) { T.push(uiNumCast(r[k]) + " " + (gMsgGiftUnit[k] || "") + (gMsgGiftName[k] || "")); }
        elBoardConfirmA.innerHTML = gMsgPanelPrefix.PkRecover + uiNumCast(mDrug) + gMsgPanelMiddle.PkRecover + T.join(" + ") + gMsgPanelSuffix.PkRecover;
    },

    uiCostSet = r => {
        mCost = r;
        uiRecover();
    },

    uiDrugSet = r => {
        elBoardRecover.disabled = (mDrug = r) <= 0;
        uiRecover();
    },

    uiConfig = (n, r) => {
        mTop = n, mTrail = r;
        elBoardButton4.style.display = (!(gRank >= mTop) && mProg > mTrail) ? "" : "none";
    },

    // Reset
    uiReset = () => {
        elSvcRank.innerHTML = USR.Rank;
        elSvcProg.innerHTML = USR.Prog;
        elSvcFuel.innerHTML = USR.Fuel;
        elSvcPveLv.innerHTML = USR.PveLv;
        elBoardButton4.style.display = "";
        uiRecover(USR.Cost);
        gData = gDummyBattle; elOutput[1].innerHTML = uiRenderBattle(gDummyBattle);
    }

    ;

    // Components
    elSvcRank.classList = "fyg_colpz05";
    elSvcRank.style = "font-size: 4.8rem; font-weight: 900;";
    elSvcProg.classList = "fyg_colpz02";
    elSvcProg.style = "font-size: 3.2rem; font-weight: 900;";
    elSvcFuel.classList = "fyg_colpz03";
    elSvcFuel.style = "font-size: 3.2rem; font-weight: 900;";
    elSvcPveLv.classList = "fyg_colpz04";
    elSvcPveLv.style = "font-size: 3.2rem; font-weight: 900;";
    elSvcStone.innerHTML = "";

    // Dashboard
    elBoard.classList = "fyg_pk row";
    elBoard.append(elBoard1);
    elBoard1.classList = "panel panel-primary";
    elBoard1.append(elBoard2);
    elBoard2.classList = "row panel-body";
    elBoard2.append(elBoardLeft, elBoardMiddle, elBoardRight);
    elBoardLeft.classList = "col-md-2 fyg_tc";
    elBoardLeft.append(
        elBoardRank, document.createElement("br"), elSvcRank, document.createElement("br"), document.createElement("br"),
        elBoardProg, document.createElement("br"), elSvcProg
    );
    elBoardMiddle.classList = "col-md-8";
    elBoardMiddle.style = "max-height: 24.5rem; overflow: scroll;";
    elBoardMiddle.append(elBoardButton1, elBoardButton2, elBoardButton3, elBoardButton4);
    elBoardButton1.type = elBoardButton2.type = elBoardButton3.type = "button";
    elBoardButton1.classList = elBoardButton2.classList = elBoardButton3.classList = elBoardButton4.classList = "btn btn-block fyg_lh30";
    elBoardButton1.append(elBoardButton1Name, document.createElement("br"), elBoardButton1Desc);
    elBoardButton2.append(elBoardButton2Name, document.createElement("br"), elBoardButton2Desc);
    elBoardButton3.append(elBoardButton3Name, document.createElement("br"), elBoardButton3Desc);
    elBoardButton4.append(elBoardButton4Name, document.createElement("br"), elBoardButton4Desc);
    elBoardButton1Name.classList = elBoardButton2Name.classList = elBoardButton3Name.classList = elBoardButton4Name.classList = "fyg_f18";
    elBoardButton1.onclick = () => Server[$SoPkGain]().then(elBoardButton1.blur.bind(elBoardButton1));
    elBoardButton2.onclick = () => Server[$SoPkPvE]().then(elBoardButton2.blur.bind(elBoardButton2));
    elBoardButton3.onclick = () => Server[$SoPkPvP]().then(elBoardButton3.blur.bind(elBoardButton3));
    elBoardButton4.onclick = () => Server[$SoPkPvB]().then(elBoardButton4.blur.bind(elBoardButton4));
    elBoardRight.classList = "col-md-2 fyg_tc";
    elBoardRight.append(
        elBoardFuel, document.createElement("br"), elSvcFuel, document.createElement("br"), 
        elBoardMisc,document.createElement("br"), document.createElement("br"), 
        elBoardPveLv, document.createElement("br"), elSvcPveLv, document.createElement("br"), document.createElement("br")
    );
    elBoardMisc.classList = "btn-group row";
    elBoardMisc.append(elBoardRecover, elBoardConfirmU);
    elBoardRecover.type = "button";
    elBoardRecover.classList = "btn btn-success btn-lg dropdown-toggle";
    elBoardRecover.style.minWidth = "16rem";
    elBoardConfirmU.classList = "dropdown-menu";
    elBoardConfirmU.append(elBoardConfirmL);
    elBoardConfirmL.append(elBoardConfirmA);
    elBoardConfirmA.style = "color: #EA644A;";
    elBoardConfirmA.onmousedown = () => Client[$CoSysPay](mCost, 1) && Server[$SoPkDrug]().then(() => elBoardRecover.blur());
    
    // Output
    elOutput[1].style = "max-height: 108rem; overflow-x: hidden; overflow-y: scroll;";

    // Manual
    elManual[1].style = "max-height: 108rem; overflow-x: hidden; overflow-y: scroll;";

    elBoard.onload = () => {
        if (gRank) { elSvcRank.innerHTML = gMsgRankName[gRank]; }
        elBoardRank.textContent = gMsgPanelName.Rank;
        elBoardProg.textContent = gMsgPanelName.Prog;
        elBoardButton1Name.innerHTML = gMsgPanelName.PkButton1;
        elBoardButton1Desc.textContent = gMsgPanelDesc.PkButton1;
        elBoardButton2Name.innerHTML = gMsgPanelName.PkButton2;
        elBoardButton2Desc.textContent = gMsgPanelDesc.PkButton2;
        elBoardButton3Name.innerHTML = gMsgPanelName.PkButton3;
        elBoardButton3Desc.textContent = gMsgPanelDesc.PkButton3;
        elBoardButton4Name.innerHTML = gMsgPanelName.PkButton4;
        elBoardButton4Desc.textContent = gMsgPanelDesc.PkButton4;
        elBoardFuel.textContent = gMsgPanelName.Fuel;
        elBoardRecover.innerHTML = gMsgPanelName.Recover;
        uiRecover();
        elBoardPveLv.textContent = gMsgPanelName.PveLv;
    };

    elOutput.onload = () => {
        elOutput[0].innerHTML = gMsgPanelName.Output;
        elOutput[1].innerHTML = uiRenderBattle(gData);
    };

    elManual.onload = () => {
        elManual[0].innerHTML = gMsgPanelName.Manual;
        elManual[1].innerHTML = `
    <i class="icon icon-bolt text-danger">${gMsgPanelDesc.ManPowerP}</i>&nbsp;&nbsp;
    <i class="icon icon-bolt text-primary">${gMsgPanelDesc.ManPowerM}</i>&nbsp;&nbsp;
    <i class="icon icon-bolt text-warning">${gMsgPanelDesc.ManPowerA}</i>&nbsp;&nbsp;
    <i class="icon icon-minus text-danger">${gMsgPanelDesc.ManDamageH}</i>&nbsp;&nbsp;
    <i class="icon icon-minus text-info">${gMsgPanelDesc.ManDamageS}</i>&nbsp;&nbsp;
    <i class="icon icon-plus text-danger">${gMsgPanelDesc.ManRecoverH}</i>&nbsp;&nbsp;
    <i class="icon icon-plus text-info">${gMsgPanelDesc.ManRecoverS}</i>
    <br><br>
    ${gMsgPanelDesc.Manual}
    `;
    };

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Initialization *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    uiReset();
    eSvcRoot.append(elBoard, elOutput, elManual);

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Exports *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    Client[$CoPkReset] = uiReset;

    Client[$CoPkFight] =  r => {
        if ("rank" in r) { uiRankSet(r.rank); }
        if ("prog" in r) { uiProgSet(r.prog); }
        if ("fuel" in r) { uiFuelSet(r.fuel); }
        if ("drug" in r) { uiDrugSet(r.drug); }
        if ("fight" in r) { Client[$CoEquipFight](r.fight); }
    };
    Client[$CoPkRank] = uiRankSet;
    Client[$CoPkProg] = uiProgSet;
    Client[$CoPkFuel] = uiFuelSet;
    Client[$CoPkCost] = uiCostSet;
    Client[$CoPkDrug] = uiDrugSet;
    Client[$CoPkData] = uiConfig;
    Client[$CoPkLog] = r => { gData = r; elOutput[1].innerHTML = uiRenderBattle(r); };

})();


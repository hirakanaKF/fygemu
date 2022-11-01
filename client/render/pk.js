/*
Project: fygemu
Authors: hirakana@kf
*/

(() => {

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Conponents *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------

    let gData = gDummyBattle, mRank, mCost = USR.Cost, mProg = 0, mDrug = 0, mTop = 0, mTrail = 0;

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
    elBoardPveLv = document.createTextNode(""),

    // Output
    elOutput = uiPanel4({root: {tag: "div", classList: "fyg_pk row"}, panel: {tag: "div", classList: "panel panel-primary"}}),

    // Manual
    elManual = uiPanel4({root: {tag: "div", classList: "fyg_pk row"}, panel: {tag: "div", classList: "panel panel-info"}}),

    uiRankSet = r => {
        mRank = r; elSvcRank.innerHTML = gMsgRankName[r] ?? r;
        Client[$CoSysRank](r); // Set header
    },

    uiProgSet = r => {
        mProg = r;
        elSvcProg.innerHTML = uiNumber(r)+"%"; elSvcPveLv.innerHTML = "+"+uiNumber(r);
        elBoardButton4.style.display = (!(mRank >= mTop) && mProg >= mTrail) ? "" : "none";
    },

    uiFuelSet = r => {
        elSvcFuel.innerHTML = uiNumber(r);
    },

    uiCostSet = r => {
        mCost = r;
    },

    uiDrugSet = r => {
        elBoardRecover.disabled = (mDrug = r) <= 0;
    },

    uiConfig = (n, r) => {
        mTop = n, mTrail = r;
        elBoardButton4.style.display = (!(mRank >= mTop) && mProg > mTrail) ? "" : "none";
    },

    // Reset
    uiReset = () => {
        elSvcRank.innerHTML = USR.Rank;
        elSvcProg.innerHTML = USR.Prog;
        elSvcFuel.innerHTML = USR.Fuel;
        elSvcPveLv.innerHTML = USR.PveLv;
        elBoardButton4.style.display = "";
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
    elBoard2.classList = "panel-body";
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
    elBoardMisc.append(elBoardRecover);
    elBoardRecover.type = "button";
    elBoardRecover.classList = "btn btn-success btn-lg";
    elBoardRecover.style.minWidth = "16rem";
    elBoardRecover.onclick = () => Client[$CoSysPay](mCost, 1)
        .then(d => d && Server[$SoPkDrug]())
        .then(() => elBoardRecover.blur())
    ;
    
    // Output
    elOutput[1].style = "max-height: 108rem; overflow-x: hidden; overflow-y: scroll;";

    // Manual
    elManual[1].style = "max-height: 108rem; overflow-x: hidden; overflow-y: scroll;";

    elBoard.onload = () => {
        if (mRank) { elSvcRank.innerHTML = gMsgRankName[mRank]; }
        elBoardRank.textContent = gMsgData[$MsgNameRank];
        elBoardProg.textContent = gMsgData[$MsgNameProg];
        elBoardButton1Name.innerHTML = gMsgData[$MsgNamePkButton1];
        elBoardButton1Desc.textContent = gMsgData[$MsgDescPkButton1];
        elBoardButton2Name.innerHTML = gMsgData[$MsgNamePkButton2];
        elBoardButton2Desc.textContent = gMsgData[$MsgDescPkButton2];
        elBoardButton3Name.innerHTML = gMsgData[$MsgNamePkButton3];
        elBoardButton3Desc.textContent = gMsgData[$MsgDescPkButton3];
        elBoardButton4Name.innerHTML = gMsgData[$MsgNamePkButton4];
        elBoardButton4Desc.textContent = gMsgData[$MsgDescPkButton4];
        elBoardFuel.textContent = gMsgData[$MsgNameFuel];
        elBoardRecover.innerHTML = gMsgData[$MsgNameRecover];
        elBoardPveLv.textContent = gMsgData[$MsgNamePveLv];
    };

    elOutput.onload = () => {
        elOutput[0].innerHTML = gMsgData[$MsgNameOutput];
        elOutput[1].innerHTML = uiRenderBattle(gData);
    };

    elManual.onload = () => {
        elManual[0].innerHTML = gMsgData[$MsgNameManual];
        elManual[1].innerHTML = `
    <i class="icon icon-bolt text-danger">${gMsgData[$MsgDescManPowerP]}</i>&nbsp;&nbsp;
    <i class="icon icon-bolt text-primary">${gMsgData[$MsgDescManPowerM]}</i>&nbsp;&nbsp;
    <i class="icon icon-bolt text-warning">${gMsgData[$MsgDescManPowerA]}</i>&nbsp;&nbsp;
    <i class="icon icon-minus text-danger">${gMsgData[$MsgDescManDamageH]}</i>&nbsp;&nbsp;
    <i class="icon icon-minus text-info">${gMsgData[$MsgDescManDamageS]}</i>&nbsp;&nbsp;
    <i class="icon icon-plus text-danger">${gMsgData[$MsgDescManRecoverH]}</i>&nbsp;&nbsp;
    <i class="icon icon-plus text-info">${gMsgData[$MsgDescManRecoverS]}</i>
    <br><br>
    ${gMsgData[$MsgDescManual]}
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
    Client[$CoPkInit] = (rank, trail, drug) => {
        uiConfig(rank, trail);
        uiCostSet(drug);
    };
    Client[$CoPkFight] =  r => {
        if ("rank" in r) { uiRankSet(r.rank); }
        if ("prog" in r) { uiProgSet(r.prog); }
        if ("fuel" in r) { uiFuelSet(r.fuel); }
        if ("drug" in r) { uiDrugSet(r.drug); }
        if ("fight" in r) { Client[$CoEquipFight](r.fight); }
    };
    Client[$CoPkProg] = uiProgSet;
    Client[$CoPkFuel] = uiFuelSet;
    Client[$CoPkDrug] = uiDrugSet;
    Client[$CoPkLog] = r => { gData = r; elOutput[1].innerHTML = uiRenderBattle(r); };

})();


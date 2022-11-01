/*
Project: fygemu
Authors: hirakana@kf
*/

(() => {

    const 
        
        mRecord = {},

        elBody = document.createElement("div"),

        elLeft = document.createElement("div"),
        elRight = document.createElement("div"),

        // Record
        elRecord = uiPanel3({}),
        elRecordAll = document.createElement("p"),
        elRecordAllTxt = document.createElement("span"),
        elRecordPvP = document.createElement("p"),
        elRecordPvPTxt = document.createElement("span"),
        elRecordPvE = document.createElement("p"),
        elRecordPvETxt = document.createElement("span"),
        elRecordPvELv = document.createElement("p"),
        elRecordPvELvTxt = document.createElement("span"),
        elRecordTable = document.createElement("p"),
        elRecordLink = document.createElement("a"),

        // Change
        elChange = uiPanel3({}),

        // Rename
        elRename = uiPanel3({}),
        elRenameDiv = document.createElement("div"),
        elRenameInput = document.createElement("input"),
        elRenameSubmit = document.createElement("span"),
        elRenameDesc = document.createElement("p"),

        // Pass
        elRepass = uiPanel3({}),
        elRepassDiv = document.createElement("div"),
        elRepassInput = document.createElement("input"),
        elRepassSubmit = document.createElement("span"),
        elRepassDesc = document.createElement("p"),

        // Manual
        elManual = uiPanel4({root: {tag: "div", classList: "fyg_index row"}, panel: {tag: "div", classList: "panel panel-info"}}),

        uiSet = () => {
            const p = gMsgData[$MsgPreRecordWin], s = gMsgData[$MsgSufRecordWin];
            elRecordAllTxt.innerHTML = p+mRecord.Win+s+"/ "+mRecord.Sum;
            elRecordPvETxt.innerHTML = p+mRecord.PvEWin+s+"/ "+mRecord.PvESum;
            elRecordPvELvTxt.innerHTML = gMsgData[$MsgPreLevel]+mRecord.PvELv+gMsgData[$MsgSufLevel];
            elRecordPvPTxt.innerHTML = p+mRecord.PvPWin+s+"/ "+mRecord.PvPSum;
        },

        uiReset = () => {
            Object.assign(mRecord, USR.Record);
            uiSet();
            elRenameInput.value = ""; elRepassInput.value = "";
        }
    ;

    elBody.classList = "fyg_index row";
    elBody.append(elLeft, elRight);

    elLeft.classList = "col-md-3";
    elLeft.append(elRecord);
    elRight.classList = "col-md-9";
    elRight.append(elChange, elRename, elRepass);
    
    // Record
    elRecord[1].append(elRecordAll, elRecordPvE, elRecordPvELv, elRecordPvP, elRecordTable);
    elRecordAll.classList = elRecordPvE.classList = elRecordPvELv.classList = elRecordPvP.classList = "with-padding hl-gray"; elRecordTable.classList = "with-padding hl-gray fyg_tc fyg_f14";
    elRecordAll.append("", elRecordAllTxt); elRecordPvE.append("", elRecordPvETxt); elRecordPvELv.append("", elRecordPvELvTxt); elRecordPvP.append("", elRecordPvPTxt); elRecordTable.append(elRecordLink)
    elRecordAllTxt.classList = elRecordPvETxt.classList = elRecordPvELvTxt.classList = elRecordPvPTxt.classList = "fyg_fr";
    elRecordLink.onclick = () => Client[$CoSysPage]("stat");

    // Change
    elChange[1].style = "max-height: 40rem; overflow-x: hidden; overflow-y: scroll;";
    elChange[1].innerHTML = `<div class="alert">
    <h3>2022/10/19 </h3>
    好运奖励中，最后一张星沙牌变为贝壳牌。<br>
    原临时第二张光环牌改为贝壳牌，另外两张装备牌也临时改为贝壳牌，等待后续更新用其他物品替换。<br>
    卡片生成中的星沙生成取消，贝壳生成暂时没做，因为这个卡片生成功能待改，既然现在贝壳作为水面上的唯一货币了，可能会改回贝壳买卡片等级、技能位、品质，待定。<br>
    卡片重置改为每次花费30W贝壳，卡片重置加点第一次免费取消，因为已经不用星沙了。<br><br>
    至此，所有水面以上的星沙功能已经全部撤销或替换。<br>
    未来星沙来源，你要买我不拦着，但作为游戏初衷，建议大家使用外站货币转换，在外面有参与度，在这里有星沙用。<br>
    以后星沙功能无论添加和修改都将仅限于那个不在更新日志里提的页面，所以未来星沙改动更新日志不再说明，除非有哪一天把星沙放出来。<br><br>
    VIP叠加的更新再等等，本次更新主要是做最终切割，明天又要去医院，回来再写。（上次居家隔离就是因为去过的医院有确诊，这次希望别再碰到）。<br>
    这次填好运奖励的12张牌，即使临时做了两个原有功能的替代道具，依然一半牌都填不出来，让我对咕咕镇的内容贫瘠程度有了深刻的认识，后续会主要增加各种新东西，请挂机玩家做好循环挂机到明年的准备，你们静若处子的挂机，我动若脱兔的更新，大家都有美好的未来。<br>
</div>

<div class="alert">
    <h3>2022/10/14 </h3>
    想要白嫖双VIP吗？去SSS吧！<br><br>
    SSS段位现在自动获得BVIP和SVIP。<br>
    SS和S段位自动获得BVIP。<br><br>
    由于段位奖励的VIP不会暂停已有VIP的时间流逝（改不了，因为数据库里记录的不是VIP起始日期和天数，而是截止日期），后续会少量增加VIP重叠的奖励。<br>
    大概就是“战斗额外送一点贝壳（日常获取量10%以内）”之类的奖励，态度上安抚VIP流失玩家受伤的心灵，又不能太多，因为多给了又有逼氪党开团“逼人花钱叠VIP”了，体谅一下。<br>
    这个“后续”的时间会尽快，现在次密接被隔离了，更新时间不定。<br>
</div>

<div class="alert">
    <h3>2022/10/12 </h3>
    星沙锻造功能改为贝壳锻造，每次锻造需280W贝壳。<br>
    更新物品“锻造材料箱”。效果锻造装备进度条+50%。在好运奖励中抽取，替换原本一张沙滩装备牌。<br>
    如果今天更新前已经打开过好运奖励界面，它生成的牌池里是没有材料箱牌的。<br><br>
    搜刮的贝壳和经验不再相互随机，以前我不知道经验对名次敏感玩家的重要性，而现在就固定吧。<br>
    经验和贝壳不会随机相互波动，保证同段位每个人的获取量是一样的。<br>
    同时因为现在贝壳需求比较高，所以额外增加搜刮贝壳获取量的20%。<br>
    由于不再相互随机，挂机功能不再计入贝壳获取。<br><br>
    体力药水在某页面已经改为星沙购买，以后这些物品栏的东西我尽量不设高级货币购买，避免差异敏感玩家的落差感。<br>
    星沙购买体力药水明天才能开始，毕竟今天已购买玩家是用另一种货币买的，所以平衡一下，今日独占相当于额外次数，明天开始都是星沙。<br><br>
    最后一张星沙牌我不是很想替换为其他，毕竟有些人是需要星沙的，但为了今后完全屏蔽新玩家对星沙和另一种货币的感知，这个又必须做。<br>
    所以征求一下思路，有什么即屏蔽感知又不堵住这一条获取路径的办法。<br>
</div>

<div class="alert">
    <h3>2022/10/11 -2 </h3>
    商店卖2管（4瓶）体力本意是后面作为贝壳恢复的二选一方案，贝壳恢复给肝帝用，药水给金主用。<br>
    药水说明的“不健康”描述就是伏笔，用了不能用贝壳恢复，但会有额外贝壳获取，毕竟它成本折算是高于贝壳恢复的。<br>
    而当前更新的部分因为体力药水的代码和贝壳恢复不关联所以没有统一上限，就提醒了一下抽到药水可以重叠使用，毕竟算是后续更新前的一个良性BUG。<br>
    好像被理解成支持5管体力冲级了。。。不是，这里有等级上限的，你们冲到900以上的级别，就算下次开上限也开不到900+啊，为什么啊。<br><br>
    既然有误解就改正，现在改为日限每天只能买1次，且一次就只能买1瓶，对应“好运奖励抽不到药水就直接买1瓶”的金主。<br>
    暂时也不考虑金主的“药水替代贝壳”方案了，避免再被理解为鼓励五体。<br>
</div>

<div class="alert">
    <h3>2022/10/11 </h3>
    更新物品“体能刺激药水”。效果+50体力，该物品不占用贝壳恢复体力的次数，建议在当天使用完全部恢复次数后再用。<br>
    好运奖励中一张星沙牌替换为“体能刺激药水”（固定数量1瓶）。<br>
    如果今天更新前已经打开过好运奖励界面，它生成的牌池里是没有药水牌的。<br>
    10月12日好运奖励第一张牌送 1瓶 体能刺激药水，请考虑上面建议服用。<br><br>
    另，这次物品图标买错了，买了一套科技风的，下次找机会换一批。<br>
</div>`;

    // Rename
    elRename[1].append(elRenameDiv, elRenameDesc);
    elRenameDiv.append(elRenameInput, elRenameSubmit);
    elRenameDiv.classList = "input-group";
    elRenameInput.type = "text"; elRenameInput.classList = "form-control";
    elRenameSubmit.classList = "btn btn-default input-group-addon"; 
    elRenameSubmit.onclick = () => { Server[$SoIdName](elRenameInput.value); };
    elRenameDesc.classList = "text-muted";
    
    // Pass
    elRepass[1].append(elRepassDiv, elRepassDesc);
    elRepassDiv.append(elRepassInput, elRepassSubmit);
    elRepassDiv.classList = "input-group";
    elRepassInput.type = "text"; elRepassInput.classList = "form-control";
    elRepassSubmit.classList = "btn btn-default input-group-addon"; 
    elRepassSubmit.onclick = () => { Server[$SoIdPass](elRepassInput.value); };
    elRepassDesc.classList = "text-muted";
    
    elBody.onload = () => {
        elRecord[0].innerHTML = gMsgData[$MsgNameRecord];
        elRecordAll.firstChild.textContent = gMsgData[$MsgNameRecordNum];
        elRecordPvE.firstChild.textContent = gMsgData[$MsgNameRecordPvE];
        elRecordPvELv.firstChild.textContent = gMsgData[$MsgNameRecordPvELv];
        elRecordPvP.firstChild.textContent = gMsgData[$MsgNameRecordPvP];
        elRecordLink.innerHTML = gMsgData[$MsgNameRecordTable];
        elChange[0].innerHTML = gMsgData[$MsgNameChange];
        elRename[0].innerHTML = gMsgData[$MsgNameRename];
        elRepass[0].innerHTML = gMsgData[$MsgNameRepass];
        elRenameSubmit.innerHTML = gMsgData[$MsgNameSubmit];
        elRepassSubmit.innerHTML = gMsgData[$MsgNameSubmit];
        elRenameDesc.innerHTML = gMsgData[$MsgDescRename];
        elRepassDesc.innerHTML = gMsgData[$MsgDescRepass];
        uiSet();
    }

    elManual.onload = () => {
        elManual[0].innerHTML = gMsgData[$MsgNameManual];
    };

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Initialization *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    uiReset();
    eSvcRoot.append(elBody, elManual);

    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    // * Exports *
    // --------------------------------------------------------------------------------------------------------------------------------------------------------
    Client[$CoIndexReset] = uiReset;
    Client[$CoIndexSet] = d => {
        const
            pw = +(d.wp), pl = +(d.lp), pv = +(d.mp), pn = pw + pl,
            ew = +(d.we), el = +(d.le), ev = +(d.me), en = ew + el
        ;
        
        mRecord.Win = pw + ew; mRecord.Lose = pl + el; mRecord.Sum = pn + en;
        mRecord.PvEWin = ew; mRecord.PvELose = el; mRecord.PvESum = en; mRecord.PvELv = ev;
        mRecord.PvPWin = pw; mRecord.PvPLose = pl; mRecord.PvPSum = pn; mRecord.PvPLv = pv;
        uiSet();
    };
    Client[$CoIndexUsr] = () => {
        elRenameInput.value = gUser.name;
    };
})();

/*
Project: fygemu
Authors: hirakana@kf
*/

(() => {
    
    const elBody = document.createElement("div");
    elBody.classList = "fyg_stat";
    elBody.innerHTML = `<div class="row">
<div class="row">
	<div class="panel panel-primary">
	<div class="panel-heading">
	全站战绩统计
	</div>
	<div class="panel-body">
	<span class="text-danger">注意：10月1日清空历史战绩，重新开始统计胜率表。</span><br>
    表格查看方式为“纵列红色卡片”对“横行蓝色卡片”的胜率，区分进攻和防守。<br>
	胜率大于90%显示为深绿色、胜率大于70%显示为浅绿色、胜率小于30%显示为浅红色。空白表示对应战斗次数过少没有统计价值。<br>
	</div>
</div>
	
<div class="row">
<div class="panel panel-info">
<div class="panel-heading">
	卡片对战胜率统计（当前所在段位）
</div>
<div class="panel-body fyg_f14 fyg_lh30 fyg_tc">
    <div class="row">
		<div class="col-md-2 fyg_f18 text-danger">SSS段位</div>
		<div class="col-md-1 bg-primary">舞</div>
		<div class="col-md-1 bg-primary">默</div>
		<div class="col-md-1 bg-primary">琳</div>
		<div class="col-md-1 bg-primary">艾</div>
		<div class="col-md-1 bg-primary">梦</div>
		<div class="col-md-1 bg-primary">薇</div>
		<div class="col-md-1 bg-primary">伊</div>
		<div class="col-md-1 bg-primary">冥</div>
		<div class="col-md-1 bg-primary">命</div>
		<div class="col-md-1 bg-primary">希</div>
	</div>

		<div class="col-md-2 bg-danger">舞 (进攻)</div>
		<div class="col-md-1">63%</div>
		<div class="col-md-1">50%</div>
		<div class="col-md-1"><span class="with-padding hl-danger">30%</span></div>
		<div class="col-md-1">51%</div>
		<div class="col-md-1">36%</div>
		<div class="col-md-1">49%</div>
		<div class="col-md-1">62%</div>
		<div class="col-md-1"><span class="with-padding hl-danger">29%</span></div>
		<div class="col-md-1">41%</div>
		<div class="col-md-1"><span class="with-padding hl-danger">19%</span>&nbsp;</div>
		<div class="col-md-2 bg-danger">舞 (防守)</div>
		<div class="col-md-1">38%</div>
		<div class="col-md-1">36%</div>
		<div class="col-md-1">38%</div>
		<div class="col-md-1">37%</div>
		<div class="col-md-1">33%</div>
		<div class="col-md-1">36%</div>
		<div class="col-md-1"><span class="with-padding hl-danger">24%</span></div>
		<div class="col-md-1">33%</div>
		<div class="col-md-1">42%</div>
		<div class="col-md-1">31%&nbsp;</div>
		<div class="col-md-12">&nbsp;</div>
		
		<div class="col-md-2 bg-danger">默 (进攻)</div>
		<div class="col-md-1">64%</div>
		<div class="col-md-1">50%</div>
		<div class="col-md-1">41%</div>
		<div class="col-md-1">41%</div>
		<div class="col-md-1"><span class="with-padding hl-danger">24%</span></div>
		<div class="col-md-1"><span class="with-padding hl-success">89%</span></div>
		<div class="col-md-1">55%</div>
		<div class="col-md-1"><span class="with-padding hl-danger">16%</span></div>
		<div class="col-md-1">62%</div>
		<div class="col-md-1">51%&nbsp;</div>
		<div class="col-md-2 bg-danger">默 (防守)</div>
		<div class="col-md-1">50%</div>
		<div class="col-md-1">50%</div>
		<div class="col-md-1">56%</div>
		<div class="col-md-1">40%</div>
		<div class="col-md-1">31%</div>
		<div class="col-md-1"><span class="with-padding hl-success">88%</span></div>
		<div class="col-md-1"><span class="with-padding bg-success">91%</span></div>
		<div class="col-md-1"><span class="with-padding hl-danger">25%</span></div>
		<div class="col-md-1"><span class="with-padding hl-success">76%</span></div>
		<div class="col-md-1">63%&nbsp;</div>
		<div class="col-md-12">&nbsp;</div>
		
		<div class="col-md-2 bg-danger">琳 (进攻)</div>
		<div class="col-md-1">62%</div>
		<div class="col-md-1">44%</div>
		<div class="col-md-1"><span class="with-padding hl-danger">28%</span></div>
		<div class="col-md-1">40%</div>
		<div class="col-md-1"><span class="with-padding hl-success">80%</span></div>
		<div class="col-md-1"><span class="with-padding hl-success">79%</span></div>
		<div class="col-md-1"><span class="with-padding hl-danger">26%</span></div>
		<div class="col-md-1">42%</div>
		<div class="col-md-1"><span class="with-padding hl-success">88%</span></div>
		<div class="col-md-1"><span class="with-padding hl-danger">19%</span>&nbsp;</div>
		<div class="col-md-2 bg-danger">琳 (防守)</div>
		<div class="col-md-1"><span class="with-padding hl-success">70%</span></div>
		<div class="col-md-1">59%</div>
		<div class="col-md-1"><span class="with-padding hl-success">72%</span></div>
		<div class="col-md-1">46%</div>
		<div class="col-md-1"><span class="with-padding hl-success">86%</span></div>
		<div class="col-md-1"><span class="with-padding hl-success">79%</span></div>
		<div class="col-md-1"><span class="with-padding hl-danger">29%</span></div>
		<div class="col-md-1">60%</div>
		<div class="col-md-1"><span class="with-padding bg-success">93%</span></div>
		<div class="col-md-1">50%&nbsp;</div>
		<div class="col-md-12">&nbsp;</div>
		
		<div class="col-md-2 bg-danger">艾 (进攻)</div>
		<div class="col-md-1">63%</div>
		<div class="col-md-1">60%</div>
		<div class="col-md-1">54%</div>
		<div class="col-md-1">41%</div>
		<div class="col-md-1">50%</div>
		<div class="col-md-1"><span class="with-padding hl-danger">7%</span></div>
		<div class="col-md-1">69%</div>
		<div class="col-md-1">51%</div>
		<div class="col-md-1"><span class="with-padding hl-success">86%</span></div>
		<div class="col-md-1">59%&nbsp;</div>
		<div class="col-md-2 bg-danger">艾 (防守)</div>
		<div class="col-md-1">49%</div>
		<div class="col-md-1">59%</div>
		<div class="col-md-1">60%</div>
		<div class="col-md-1">59%</div>
		<div class="col-md-1">60%</div>
		<div class="col-md-1"><span class="with-padding hl-danger">8%</span></div>
		<div class="col-md-1"><span class="with-padding hl-danger">22%</span></div>
		<div class="col-md-1">61%</div>
		<div class="col-md-1"><span class="with-padding hl-success">86%</span></div>
		<div class="col-md-1">46%&nbsp;</div>
		<div class="col-md-12">&nbsp;</div>
		
		<div class="col-md-2 bg-danger">梦 (进攻)</div>
		<div class="col-md-1">67%</div>
		<div class="col-md-1">69%</div>
		<div class="col-md-1"><span class="with-padding hl-danger">14%</span></div>
		<div class="col-md-1">40%</div>
		<div class="col-md-1">49%</div>
		<div class="col-md-1"><span class="with-padding hl-danger">27%</span></div>
		<div class="col-md-1">62%</div>
		<div class="col-md-1">69%</div>
		<div class="col-md-1">53%</div>
		<div class="col-md-1">46%&nbsp;</div>
		<div class="col-md-2 bg-danger">梦 (防守)</div>
		<div class="col-md-1">64%</div>
		<div class="col-md-1"><span class="with-padding hl-success">76%</span></div>
		<div class="col-md-1"><span class="with-padding hl-danger">20%</span></div>
		<div class="col-md-1">50%</div>
		<div class="col-md-1">51%</div>
		<div class="col-md-1">36%</div>
		<div class="col-md-1"><span class="with-padding hl-success">81%</span></div>
		<div class="col-md-1"><span class="with-padding hl-success">81%</span></div>
		<div class="col-md-1"><span class="with-padding hl-success">74%</span></div>
		<div class="col-md-1">64%&nbsp;</div>
		<div class="col-md-12">&nbsp;</div>
		
		<div class="col-md-2 bg-danger">薇 (进攻)</div>
		<div class="col-md-1">64%</div>
		<div class="col-md-1"><span class="with-padding hl-danger">12%</span></div>
		<div class="col-md-1"><span class="with-padding hl-danger">21%</span></div>
		<div class="col-md-1"><span class="with-padding bg-success">92%</span></div>
		<div class="col-md-1">64%</div>
		<div class="col-md-1">51%</div>
		<div class="col-md-1"><span class="with-padding hl-success">74%</span></div>
		<div class="col-md-1"><span class="with-padding hl-danger">24%</span></div>
		<div class="col-md-1">58%</div>
		<div class="col-md-1">34%&nbsp;</div>
		<div class="col-md-2 bg-danger">薇 (防守)</div>
		<div class="col-md-1">51%</div>
		<div class="col-md-1"><span class="with-padding hl-danger">11%</span></div>
		<div class="col-md-1"><span class="with-padding hl-danger">21%</span></div>
		<div class="col-md-1"><span class="with-padding bg-success">93%</span></div>
		<div class="col-md-1"><span class="with-padding hl-success">73%</span></div>
		<div class="col-md-1">49%</div>
		<div class="col-md-1">61%</div>
		<div class="col-md-1">32%</div>
		<div class="col-md-1"><span class="with-padding hl-success">82%</span></div>
		<div class="col-md-1">53%&nbsp;</div>
		<div class="col-md-12">&nbsp;</div>
		
		<div class="col-md-2 bg-danger">伊 (进攻)</div>
		<div class="col-md-1"><span class="with-padding hl-success">76%</span></div>
		<div class="col-md-1"><span class="with-padding hl-danger">10%</span></div>
		<div class="col-md-1"><span class="with-padding hl-success">71%</span></div>
		<div class="col-md-1"><span class="with-padding hl-success">78%</span></div>
		<div class="col-md-1"><span class="with-padding hl-danger">19%</span></div>
		<div class="col-md-1">39%</div>
		<div class="col-md-1">60%</div>
		<div class="col-md-1"><span class="with-padding hl-danger">29%</span></div>
		<div class="col-md-1">49%</div>
		<div class="col-md-1">37%&nbsp;</div>
		<div class="col-md-2 bg-danger">伊 (防守)</div>
		<div class="col-md-1">38%</div>
		<div class="col-md-1">45%</div>
		<div class="col-md-1"><span class="with-padding hl-success">74%</span></div>
		<div class="col-md-1">31%</div>
		<div class="col-md-1">38%</div>
		<div class="col-md-1"><span class="with-padding hl-danger">26%</span></div>
		<div class="col-md-1">40%</div>
		<div class="col-md-1">40%</div>
		<div class="col-md-1"><span class="with-padding hl-success">72%</span></div>
		<div class="col-md-1">42%&nbsp;</div>
		<div class="col-md-12">&nbsp;</div>
		
		<div class="col-md-2 bg-danger">冥 (进攻)</div>
		<div class="col-md-1">67%</div>
		<div class="col-md-1"><span class="with-padding hl-success">75%</span></div>
		<div class="col-md-1">40%</div>
		<div class="col-md-1">39%</div>
		<div class="col-md-1"><span class="with-padding hl-danger">19%</span></div>
		<div class="col-md-1">68%</div>
		<div class="col-md-1">60%</div>
		<div class="col-md-1">37%</div>
		<div class="col-md-1"><span class="with-padding hl-success">82%</span></div>
		<div class="col-md-1">47%&nbsp;</div>
		<div class="col-md-2 bg-danger">冥 (防守)</div>
		<div class="col-md-1"><span class="with-padding hl-success">70%</span></div>
		<div class="col-md-1"><span class="with-padding hl-success">84%</span></div>
		<div class="col-md-1">58%</div>
		<div class="col-md-1">49%</div>
		<div class="col-md-1">31%</div>
		<div class="col-md-1"><span class="with-padding hl-success">76%</span></div>
		<div class="col-md-1"><span class="with-padding hl-success">70%</span></div>
		<div class="col-md-1">63%</div>
		<div class="col-md-1"><span class="with-padding bg-success">95%</span></div>
		<div class="col-md-1"><span class="with-padding hl-success">72%</span>&nbsp;</div>
		<div class="col-md-12">&nbsp;</div>
		
		<div class="col-md-2 bg-danger">命 (进攻)</div>
		<div class="col-md-1">58%</div>
		<div class="col-md-1"><span class="with-padding hl-danger">24%</span></div>
		<div class="col-md-1"><span class="with-padding hl-danger">7%</span></div>
		<div class="col-md-1"><span class="with-padding hl-danger">14%</span></div>
		<div class="col-md-1"><span class="with-padding hl-danger">26%</span></div>
		<div class="col-md-1"><span class="with-padding hl-danger">18%</span></div>
		<div class="col-md-1"><span class="with-padding hl-danger">28%</span></div>
		<div class="col-md-1"><span class="with-padding hl-danger">5%</span></div>
		<div class="col-md-1">41%</div>
		<div class="col-md-1">40%&nbsp;</div>
		<div class="col-md-2 bg-danger">命 (防守)</div>
		<div class="col-md-1">59%</div>
		<div class="col-md-1">38%</div>
		<div class="col-md-1"><span class="with-padding hl-danger">12%</span></div>
		<div class="col-md-1"><span class="with-padding hl-danger">14%</span></div>
		<div class="col-md-1">47%</div>
		<div class="col-md-1">42%</div>
		<div class="col-md-1">51%</div>
		<div class="col-md-1"><span class="with-padding hl-danger">18%</span></div>
		<div class="col-md-1">59%</div>
		<div class="col-md-1">52%&nbsp;</div>
		<div class="col-md-12">&nbsp;</div>
		
		<div class="col-md-2 bg-danger">希 (进攻)</div>
		<div class="col-md-1">69%</div>
		<div class="col-md-1">37%</div>
		<div class="col-md-1">50%</div>
		<div class="col-md-1">54%</div>
		<div class="col-md-1">36%</div>
		<div class="col-md-1">47%</div>
		<div class="col-md-1">58%</div>
		<div class="col-md-1"><span class="with-padding hl-danger">28%</span></div>
		<div class="col-md-1">48%</div>
		<div class="col-md-1">32%&nbsp;</div>
		<div class="col-md-2 bg-danger">希 (防守)</div>
		<div class="col-md-1"><span class="with-padding hl-success">81%</span></div>
		<div class="col-md-1">49%</div>
		<div class="col-md-1"><span class="with-padding hl-success">81%</span></div>
		<div class="col-md-1">41%</div>
		<div class="col-md-1">54%</div>
		<div class="col-md-1">66%</div>
		<div class="col-md-1">63%</div>
		<div class="col-md-1">53%</div>
		<div class="col-md-1">60%</div>
		<div class="col-md-1">68%&nbsp;</div>
		<div class="col-md-12">&nbsp;</div>
		</div>
</div>
</div>

</div>`;
    eSvcRoot.append(elBody);

})();


(()=>{
const $=s=>document.querySelector(s);
const CSRF=document.querySelector('meta[name=csrf]').content;
let MIS=[['ming','第1章 識破邀約'],['ticket','第1章 抽號碼牌'],['consult','第1章 櫃台諮詢'],['record','第1章 簽名確認'],['verify','第1章 查證管道']];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
async function api(url,method,body){
 const r=await fetch(url,{method:method||'GET',headers:{'Content-Type':'application/json','X-CSRF-Token':CSRF},body:body?JSON.stringify(body):undefined});
 if(r.status===401){location.reload();return}
 const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||r.status);return d}

async function loadChapters(){
 try{const r=await fetch('/api/chapters');if(!r.ok)return;const d=await r.json();
  d.chapters.forEach(c=>c.missions.forEach(m=>MIS.push([m.id,`第${c.id}章 ${m.name}`])))}catch(e){}}
async function loadStats(){
 const s=await api('/admin/api/stats');
 const card=(b,t)=>`<div class="card"><b>${esc(b)}</b><span>${t}</span></div>`;
 $('#stats').innerHTML=card(s.players,'玩家人數')+card(s.plays,'開始遊戲次數')+card(s.finished,'曾經通關的玩家')+card(s.avg_mistakes_finished==null?'—':s.avg_mistakes_finished,'通關者平均答錯次數')+card(s.questions,'櫃台自由提問（其中 '+s.questions_answered+' 題查得到）');
 const max=Math.max(1,s.players);
 $('#funnel').innerHTML=MIS.map(([k,n])=>`<div class="frow"><span>${n}</span><i><s style="width:${s.funnel[k]/max*100}%"></s></i><em>${s.funnel[k]} 人</em></div>`).join('');
}
async function loadPlayers(){
 const list=await api('/admin/api/players?q='+encodeURIComponent($('#q').value)+'&sort='+$('#sort').value);
 $('#empty').hidden=list.length>0;
 $('#players tbody').innerHTML=list.map(p=>`<tr data-id="${p.id}">
  <td class="num">${p.id}</td><td><b>${esc(p.name)}</b><br><span class="mut small">加入 ${esc(p.created_at)}</span></td>
  <td><span class="dots" title="${p.done.length}/${MIS.length}">${MIS.map(([k,n])=>`<i class="${p.done.includes(k)?'on':''}" title="${n}"></i>`).join('')}</span> <span class="num">${p.done.length}/${MIS.length}</span></td>
  <td class="num">${p.mistakes}</td>
  <td>${p.finished?`<span class="pill ok">${esc(p.rank||'已通關')}</span>`:'<span class="pill">未通關</span>'}</td>
  <td class="num">${p.plays}</td><td class="num">${esc(p.last_seen)}</td><td>${esc(p.note)}</td>
  <td><div class="acts"><button data-a="rename">改名</button><button data-a="note">備註</button><button data-a="reset">重設進度</button><button data-a="del" class="danger">刪除</button></div></td></tr>`).join('');
}
async function loadQs(){
 const list=await api('/admin/api/questions'+($('#unans').checked?'?unanswered=1':''));
 $('#qs tbody').innerHTML=list.length?list.map(q=>`<tr><td class="num">${esc(q.asked_at)}</td><td>${esc(q.player||'—')}</td><td>${esc(q.question)}</td><td>${esc(q.top_chunk||'—')}</td><td class="num">${q.top_score==null?'—':q.top_score}</td><td>${q.answered?'<span class="pill ok">已回答</span>':'<span class="pill bad">查不到</span>'}</td></tr>`).join(''):'<tr><td colspan="6" class="mut">沒有紀錄。</td></tr>';
}
$('#players').addEventListener('click',async e=>{
 const b=e.target.closest('button[data-a]');if(!b)return;
 const tr=b.closest('tr'),id=tr.dataset.id,name=tr.querySelector('b').textContent;
 try{
  if(b.dataset.a==='rename'){const n=prompt('新的名稱（1～12 個字）',name);if(n==null)return;await api('/admin/api/player/'+id,'POST',{name:n})}
  else if(b.dataset.a==='note'){const n=prompt('備註（最多 200 字）',tr.children[7].textContent);if(n==null)return;await api('/admin/api/player/'+id,'POST',{note:n})}
  else if(b.dataset.a==='reset'){if(!confirm('把「'+name+'」的進度、答錯次數與通關紀錄清空？'))return;await api('/admin/api/player/'+id+'/reset','POST',{})}
  else if(b.dataset.a==='del'){if(!confirm('刪除玩家「'+name+'」？這個動作無法復原。'))return;await api('/admin/api/player/'+id,'DELETE')}
  refresh();
 }catch(err){alert('操作失敗：'+err.message)}
});
let t=0;$('#q').addEventListener('input',()=>{clearTimeout(t);t=setTimeout(loadPlayers,250)});
$('#sort').addEventListener('change',loadPlayers);$('#unans').addEventListener('change',loadQs);
function refresh(){loadStats();loadPlayers();loadQs()}
loadChapters().then(refresh);
})();

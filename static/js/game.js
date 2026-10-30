(()=>{
const W=960,H=540,DPR=Math.min(2,window.devicePixelRatio||1);
const $=s=>document.querySelector(s);
const SERIF='"Noto Serif TC","Songti TC","PMingLiU","Noto Serif CJK TC",serif';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const esc=s=>String(s).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
function layer(){const c=document.createElement('canvas');c.width=W*DPR;c.height=H*DPR;const x=c.getContext('2d');x.scale(DPR,DPR);return [x,c]}
function lin(c,x0,y0,x1,y1,st){const g=c.createLinearGradient(x0,y0,x1,y1);st.forEach(s=>g.addColorStop(s[0],s[1]));return g}
function rad(c,x,y,r0,r1,st){const g=c.createRadialGradient(x,y,r0,x,y,r1);st.forEach(s=>g.addColorStop(s[0],s[1]));return g}
function rr(c,x,y,w,h,r,f){c.beginPath();c.roundRect(x,y,w,h,r);if(f){c.fillStyle=f;c.fill()}}
function ell(c,x,y,rx,ry,f){c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);if(f){c.fillStyle=f;c.fill()}}
function poly(c,pts,f){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();if(f){c.fillStyle=f;c.fill()}}
function shade(hex,a){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=a<0?0:255,p=Math.abs(a);r=Math.round(r+(f-r)*p);g=Math.round(g+(f-g)*p);b=Math.round(b+(f-b)*p);return`rgb(${r},${g},${b})`}

/* ===== 角色外觀（原創） ===== */
const LOOK={
 an:{skin:'#f3cfae',hc:'#2a2220',hair:'short',top:'#2f8f9d',top2:'#26737f',bot:'#3c4356',shoe:'#efe7da',outfit:'jacket',eye:'#4a3426'},
 ming:{skin:'#eab88f',hc:'#6a3a1c',hair:'spiky',top:'#e8873a',top2:'#cc702b',bot:'#46556e',shoe:'#ffffff',outfit:'hoodie',eye:'#3b2616'},
 clerk:{skin:'#f6d5bb',hc:'#33241f',hair:'bun',top:'#26365a',top2:'#26365a',bot:'#26365a',shoe:'#1c1c24',outfit:'blazer',skirt:1,eye:'#4a2f22',lash:1},
 guard:{skin:'#d9a67c',hc:'#8a8a92',hair:'short',top:'#2b3b5f',top2:'#2b3b5f',bot:'#232f4c',shoe:'#17171c',outfit:'uniform',cap:1,stache:1,eye:'#2a1c14'}
};
const WHO={'小安':LOOK.an,'阿明':LOOK.ming,'林小姐':LOOK.clerk,'王警衛':LOOK.guard};

function head(c,o,x,y,r,dir,mood,big){
 const up=dir==='u',side=dir==='l'?-1:dir==='r'?1:0,hc=o.hc,hs=o.hair;
 const hg=lin(c,x-r,y-r*1.3,x+r,y+r*2.4,[[0,shade(hc,.2)],[1,shade(hc,-.4)]]);
 c.fillStyle=hg;
 if(hs==='long'||hs==='bob'){const L=hs==='long'?2.5:1.4;c.beginPath();c.moveTo(x-r*1.05,y-r*.4);c.quadraticCurveTo(x-r*1.45,y+r*L*.9,x-r*.7,y+r*L);c.lineTo(x+r*.7,y+r*L);c.quadraticCurveTo(x+r*1.45,y+r*L*.9,x+r*1.05,y-r*.4);c.closePath();c.fill()}
 if(hs==='bun'){c.beginPath();c.arc(x,y-r*1.2,r*.48,0,7);c.fill();c.beginPath();c.moveTo(x-r*1.0,y-r*.2);c.quadraticCurveTo(x-r*1.1,y+r*.6,x-r*.8,y+r*.9);c.lineTo(x-r*.7,y);c.fill();c.beginPath();c.moveTo(x+r*1.0,y-r*.2);c.quadraticCurveTo(x+r*1.1,y+r*.6,x+r*.8,y+r*.9);c.lineTo(x+r*.7,y);c.fill()}
 if(up){ell(c,x,y,r*1.03,r*1.05,hg)}
 else{
  ell(c,x-r*.93,y+r*.12,r*.13,r*.2,o.skin);ell(c,x+r*.93,y+r*.12,r*.13,r*.2,o.skin);
  c.fillStyle=rad(c,x-r*.3,y-r*.35,r*.15,r*1.4,[[0,shade(o.skin,.25)],[.65,o.skin],[1,shade(o.skin,-.18)]]);
  c.beginPath();c.moveTo(x-r*.9,y-r*.1);c.quadraticCurveTo(x-r*.92,y+r*.75,x,y+r*1.04);c.quadraticCurveTo(x+r*.92,y+r*.75,x+r*.9,y-r*.1);c.quadraticCurveTo(x+r*.9,y-r,x,y-r);c.quadraticCurveTo(x-r*.9,y-r,x-r*.9,y-r*.1);c.fill();
  const ex=x+side*r*.22,ey=y+r*.1,sp=r*.4;
  for(const s of[-1,1]){const cx=ex+s*sp;
   if(big){
    ell(c,cx,ey,r*.2,r*.25,'#fff');
    ell(c,cx+side*r*.03,ey+r*.02,r*.15,r*.22,rad(c,cx,ey-r*.1,r*.02,r*.22,[[0,shade(o.eye,.4)],[1,o.eye]]));
    ell(c,cx+side*r*.03,ey+r*.03,r*.075,r*.12,'#0e0705');
    ell(c,cx-r*.05,ey-r*.09,r*.05,r*.055,'#fff');ell(c,cx+r*.06,ey+r*.08,r*.025,r*.025,'rgba(255,255,255,.8)');
    c.strokeStyle='#1b120d';c.lineWidth=r*.065;c.beginPath();c.ellipse(cx,ey,r*.2,r*.25,0,Math.PI*1.08,Math.PI*1.92);c.stroke();
    if(o.lash){c.lineWidth=r*.04;c.beginPath();c.moveTo(cx+s*r*.19,ey-r*.06);c.lineTo(cx+s*r*.3,ey-r*.12);c.stroke()}
   }else{ell(c,cx,ey,r*.11,r*.17,'#2a1c16');ell(c,cx-r*.03,ey-r*.06,r*.04,r*.05,'#fff')}
   c.strokeStyle=shade(hc,-.25);c.lineWidth=big?r*.065:r*.09;c.lineCap='round';c.beginPath();
   const by=ey-r*.4,x0=cx-r*.19,x1=cx+r*.19,inner=s<0?1:0;let y0=by,y1=by;
   if(mood==='worry'){if(inner)y1-=r*.1;else y0-=r*.1}
   c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();
   ell(c,cx+s*r*.12,y+r*.46,r*.18,r*.1,'rgba(235,120,110,.25)');
   if(o.glasses){c.strokeStyle='#222';c.lineWidth=r*.05;c.beginPath();c.arc(cx,ey,r*.27,0,7);c.stroke()}
  }
  const mx=x+side*r*.2,my=y+r*.6;
  c.strokeStyle='#a2524a';c.lineWidth=big?r*.06:r*.08;c.lineCap='round';
  if(mood==='open'){ell(c,mx,my,r*.14,r*.17,'#7b2a2c');if(big)ell(c,mx,my+r*.07,r*.09,r*.06,'#d9707a')}
  else if(mood==='worry'){c.beginPath();c.arc(mx,my+r*.12,r*.17,Math.PI*1.2,Math.PI*1.8);c.stroke()}
  else if(mood==='think'){c.beginPath();c.moveTo(mx-r*.12,my);c.lineTo(mx+r*.12,my-r*.03);c.stroke()}
  else{c.beginPath();c.arc(mx,my-r*.1,r*.2,Math.PI*.15,Math.PI*.85);c.stroke()}
  if(big){c.strokeStyle=shade(o.skin,-.28);c.lineWidth=r*.04;c.beginPath();c.moveTo(x+side*r*.2-r*.03,y+r*.3);c.quadraticCurveTo(x+side*r*.2+r*.06,y+r*.38,x+side*r*.2-r*.02,y+r*.42);c.stroke()}
  if(o.stache)ell(c,mx,my-r*.2,r*.28,r*.07,shade(hc,-.1));
  // 前髮
  const fr=(hs==='short'||hs==='spiky')?.12:0;
  c.fillStyle=lin(c,x-r,y-r*1.3,x+r,y+r*.3,[[0,shade(hc,.28)],[.5,hc],[1,shade(hc,-.32)]]);
  c.beginPath();c.moveTo(x-r*1.03,y+r*.3);c.quadraticCurveTo(x-r*1.22,y-r*1.32,x,y-r*1.24);c.quadraticCurveTo(x+r*1.22,y-r*1.32,x+r*1.03,y+r*.3);
  c.quadraticCurveTo(x+r*.95,y-r*(.1+fr),x+r*.72,y-r*(.46+fr));c.quadraticCurveTo(x+r*.35,y-r*(.36+fr),x+r*.02,y-r*(.72+fr));c.quadraticCurveTo(x-r*.35,y-r*(.36+fr),x-r*.72,y-r*(.46+fr));c.quadraticCurveTo(x-r*.95,y-r*(.1+fr),x-r*1.03,y+r*.3);c.fill();
 }
 if(hs==='spiky'){c.fillStyle=hc;[-.55,0,.55].forEach((k,i)=>poly(c,[[x+k*r-r*.28,y-r*1.1],[x+k*r+r*.05,y-r*(1.65-i%2*.2)],[x+k*r+r*.3,y-r*1.1]],hc))}
 c.strokeStyle='rgba(255,255,255,.22)';c.lineWidth=r*.1;c.lineCap='round';c.beginPath();c.arc(x-r*.1,y-r*.2,r*.82,Math.PI*1.15,Math.PI*1.55);c.stroke();
 if(o.cap){
  c.fillStyle=lin(c,x-r,y-r*1.5,x+r,y-r*.4,[[0,'#3d5282'],[1,'#1d2a48']]);
  c.beginPath();c.moveTo(x-r*1.1,y-r*.42);c.quadraticCurveTo(x-r*1.12,y-r*1.62,x,y-r*1.58);c.quadraticCurveTo(x+r*1.12,y-r*1.62,x+r*1.1,y-r*.42);c.closePath();c.fill();
  rr(c,x-r*1.12,y-r*.62,r*2.24,r*.26,r*.1,'#15203a');
  if(!up){c.beginPath();c.ellipse(x+side*r*.15,y-r*.34,r*.78,r*.17,0,0,Math.PI);c.fillStyle='#10182c';c.fill();ell(c,x+side*r*.15,y-r*1.0,r*.22,r*.22,'#e2bf7a')}
 }
}

function sprite(c,o,x,y,dir,t,mv,sc){
 c.save();c.translate(x,y);c.scale(sc||1,sc||1);
 const ph=mv?t*11:0,sw=Math.sin(ph),bob=mv?Math.abs(Math.cos(ph))*2.5:Math.sin(t*2.2)*.8,ty=-bob;
 ell(c,0,0,20,6,'rgba(0,0,0,.3)');
 for(const s of[-1,1]){const lift=mv?Math.max(0,sw*s)*6:0,lx=s*6-4.5;
  rr(c,lx,-40,9,34-lift,3,lin(c,lx,0,lx+9,0,[[0,shade(o.bot,.14)],[1,shade(o.bot,-.22)]]));
  rr(c,lx-1+(dir==='r'?2:dir==='l'?-2:0),-9-lift,11,8,3,o.shoe)}
 if(o.skirt){poly(c,[[-13,-48+ty],[13,-48+ty],[18,-20],[-18,-20]],lin(c,-18,0,18,0,[[0,shade(o.bot,.12)],[1,shade(o.bot,-.2)]]))}
 ell(c,0,-70+ty,5,3,o.skin);
 c.fillStyle=lin(c,-15,0,15,0,[[0,shade(o.top,.18)],[.5,o.top],[1,shade(o.top,-.28)]]);
 c.beginPath();c.moveTo(-14,-44+ty);c.quadraticCurveTo(-18,-62+ty,-12,-72+ty);c.lineTo(12,-72+ty);c.quadraticCurveTo(18,-62+ty,14,-44+ty);c.closePath();c.fill();
 const ot=o.outfit;
 if(ot==='jacket'){poly(c,[[-5,-72+ty],[5,-72+ty],[0,-60+ty]],'#f4efe6');c.strokeStyle=shade(o.top,-.35);c.lineWidth=1;c.beginPath();c.moveTo(0,-60+ty);c.lineTo(0,-44+ty);c.stroke()}
 if(ot==='hoodie'){ell(c,0,-72+ty,10,4.5,shade(o.top,-.2));c.strokeStyle='#fff';c.lineWidth=1;c.beginPath();c.moveTo(-3,-68+ty);c.lineTo(-3,-58+ty);c.moveTo(3,-68+ty);c.lineTo(3,-58+ty);c.stroke();rr(c,-9,-54+ty,18,8,3,shade(o.top,-.15))}
 if(ot==='blazer'){poly(c,[[-6,-72+ty],[6,-72+ty],[0,-56+ty]],'#fff');poly(c,[[-3,-70+ty],[3,-70+ty],[0,-64+ty]],'#c8352c');rr(c,5,-58+ty,6,3,1,'#e2bf7a')}
 if(ot==='uniform'){rr(c,-14,-73+ty,8,3,1,'#e2bf7a');rr(c,6,-73+ty,8,3,1,'#e2bf7a');ell(c,6,-62+ty,2.6,2.6,'#e2bf7a');c.fillStyle='#111';c.fillRect(-14,-47+ty,28,3);rr(c,-2,-48+ty,4,5,1,'#e2bf7a');poly(c,[[-4,-72+ty],[4,-72+ty],[0,-64+ty]],'#e8e8ee')}
 for(const s of[-1,1]){const a=mv?Math.sin(ph+(s>0?0:Math.PI))*5:0;
  rr(c,s*15-3.5+s*1,-70+ty+a*.2,7,27,3.5,lin(c,0,0,7,0,[[0,shade(o.top2,.1)],[1,shade(o.top2,-.25)]]));
  ell(c,s*16.5,-42+ty+a,3.6,3.6,o.skin)}
 rr(c,-4,-77+ty,8,8,2,o.skin);
 head(c,o,0,-88+ty,15,dir,o.mood||'smile',false);
 c.restore();
}

function bust(c,o,mood,w,h){
 c.clearRect(0,0,w,h);const cx=w/2,r=h*.19,hy=h*.37;
 if(o.outfit==='hoodie'){ell(c,cx,h*.66,r*1.15,r*.45,shade(o.top,-.25))}
 rr(c,cx-r*.32,hy+r*.7,r*.64,h*.3,r*.1,lin(c,cx-r*.3,0,cx+r*.3,0,[[0,shade(o.skin,-.12)],[.5,o.skin],[1,shade(o.skin,-.22)]]));
 c.beginPath();c.moveTo(cx-w*.5,h);c.lineTo(cx-w*.5,h*.86);c.quadraticCurveTo(cx-w*.46,h*.72,cx-w*.2,h*.68);c.lineTo(cx-r*.42,h*.63);c.lineTo(cx+r*.42,h*.63);c.lineTo(cx+w*.2,h*.68);c.quadraticCurveTo(cx+w*.46,h*.72,cx+w*.5,h*.86);c.lineTo(cx+w*.5,h);c.closePath();
 c.fillStyle=lin(c,0,h*.65,w,h,[[0,shade(o.top,.2)],[.5,o.top],[1,shade(o.top,-.3)]]);c.fill();
 ell(c,cx,h*.64,r*.45,r*.2,shade(o.skin,-.1));
 const ot=o.outfit;
 if(ot==='blazer'){
  poly(c,[[cx-r*.55,h*.655],[cx+r*.55,h*.655],[cx,h*.86]],'#fbfbfb');
  c.strokeStyle=shade(o.top,.25);c.lineWidth=3;c.beginPath();c.moveTo(cx-r*.55,h*.655);c.lineTo(cx-r*.1,h*.9);c.moveTo(cx+r*.55,h*.655);c.lineTo(cx+r*.1,h*.9);c.stroke();
  poly(c,[[cx-r*.3,h*.7],[cx+r*.3,h*.7],[cx+r*.12,h*.82],[cx-r*.12,h*.82]],'#c8352c');ell(c,cx,h*.715,r*.14,r*.09,'#a52a22');
  rr(c,cx+w*.16,h*.84,w*.14,h*.045,3,'#e2bf7a');
 }
 if(ot==='jacket'){poly(c,[[cx-r*.5,h*.65],[cx+r*.5,h*.65],[cx,h*.78]],'#f4efe6');c.strokeStyle=shade(o.top,-.35);c.lineWidth=3;c.beginPath();c.moveTo(cx,h*.78);c.lineTo(cx,h);c.stroke();c.strokeStyle=shade(o.top,.25);c.beginPath();c.moveTo(cx-r*.5,h*.65);c.lineTo(cx-r*.15,h*.78);c.moveTo(cx+r*.5,h*.65);c.lineTo(cx+r*.15,h*.78);c.stroke()}
 if(ot==='hoodie'){c.strokeStyle='#fff';c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(cx-r*.3,h*.7);c.lineTo(cx-r*.34,h*.88);c.moveTo(cx+r*.3,h*.7);c.lineTo(cx+r*.34,h*.88);c.stroke();ell(c,cx,h*.65,r*.5,r*.18,shade(o.top,-.3))}
 if(ot==='uniform'){poly(c,[[cx-r*.5,h*.65],[cx-r*.1,h*.65],[cx,h*.72],[cx-r*.2,h*.76]],'#e8e8ee');poly(c,[[cx+r*.5,h*.65],[cx+r*.1,h*.65],[cx,h*.72],[cx+r*.2,h*.76]],'#e8e8ee');poly(c,[[cx-r*.1,h*.72],[cx+r*.1,h*.72],[cx+r*.14,h*.9],[cx,h*.95],[cx-r*.14,h*.9]],'#8a2f22');ell(c,cx+w*.2,h*.82,w*.05,w*.05,'#e2bf7a');rr(c,cx-w*.42,h*.7,w*.18,h*.04,3,'#e2bf7a');rr(c,cx+w*.24,h*.7,w*.18,h*.04,3,'#e2bf7a')}
 head(c,o,cx,hy,r,'d',mood,true);
}
const pcv=$('#pc'),pctx=pcv.getContext('2d');pcv.width=220*DPR;pcv.height=270*DPR;pctx.scale(DPR,DPR);
function drawPortrait(o,m){bust(pctx,o,m,220,270)}

/* ===== 背景（程序繪製的原創場景） ===== */
const SERIFF=()=>`900 22px ${SERIF}`;
function brick(c,x,y,w,h,R,base,a){c.fillStyle=base;c.fillRect(x,y,w,h);for(let yy=y;yy<y+h;yy+=9){for(let xx=x+((yy-y)/9&1)*14;xx<x+w;xx+=28){c.fillStyle=R()<.5?`rgba(255,225,200,${.03+R()*a})`:`rgba(50,15,5,${.03+R()*a})`;c.fillRect(xx+1,yy+1,Math.min(26,x+w-xx-1),7)}}}
function archWin(c,x,y,w,h,frame){
 c.fillStyle=frame;c.beginPath();c.moveTo(x-5,y+h);c.lineTo(x-5,y+w/2);c.arc(x+w/2,y+w/2,w/2+5,Math.PI,0);c.lineTo(x+w+5,y+h);c.fill();
 c.beginPath();c.moveTo(x,y+h);c.lineTo(x,y+w/2);c.arc(x+w/2,y+w/2,w/2,Math.PI,0);c.lineTo(x+w,y+h);c.closePath();
 c.fillStyle=lin(c,x,y,x+w,y+h,[[0,'#ffe9b0'],[.5,'#f3c978'],[1,'#c98d3d']]);c.fill();
 c.save();c.clip();c.fillStyle='rgba(255,255,255,.2)';poly(c,[[x,y+h*.6],[x+w*.6,y],[x+w*.8,y],[x,y+h*.85]],'rgba(255,255,255,.18)');c.restore();
 c.strokeStyle=frame;c.lineWidth=3;c.beginPath();c.moveTo(x+w/2,y);c.lineTo(x+w/2,y+h);c.moveTo(x,y+h*.45);c.lineTo(x+w,y+h*.45);c.stroke();
}
function tree(c,x,y,s,R){
 rr(c,x-8*s,y-70*s,16*s,70*s,4,lin(c,x-8*s,0,x+8*s,0,[[0,'#6b4a2c'],[1,'#3d2917']]));
 ell(c,x,y+2,34*s,8*s,'rgba(0,0,0,.25)');
 for(let i=0;i<16;i++){const a=R()*6.28,d=R()*38*s,cx=x+Math.cos(a)*d,cy=y-105*s+Math.sin(a)*d*.8,rd=(20+R()*14)*s;ell(c,cx,cy,rd,rd*.9,rad(c,cx-rd*.3,cy-rd*.3,2,rd,[[0,['#8fbf5a','#7fb04e','#9bc766'][i%3]],[1,['#3f7a36','#357030','#46803a'][i%3]]]))}
}
function lamp(c,x,y){rr(c,x-3,y-150,6,150,2,'#2a2a30');rr(c,x-9,y-6,18,6,2,'#2a2a30');
 c.fillStyle='rgba(255,220,140,.25)';ell(c,x,y-162,40,40,rad(c,x,y-162,2,40,[[0,'rgba(255,225,150,.55)'],[1,'rgba(255,225,150,0)']]));
 poly(c,[[x-9,y-175],[x+9,y-175],[x+12,y-150],[x-12,y-150]],lin(c,x-12,0,x+12,0,[[0,'#ffe9a8'],[1,'#e9b64c']]));poly(c,[[x-12,y-175],[x,y-188],[x+12,y-175]],'#2a2a30')}
function planter(c,x,y,R){rr(c,x-20,y-28,40,28,4,lin(c,x-20,0,x+20,0,[[0,'#9a5a3a'],[1,'#6a3a24']]));ell(c,x,y-28,22,6,'#3c2616');for(let i=0;i<9;i++){const a=R()*6.28,d=R()*16;ell(c,x+Math.cos(a)*d,y-40+Math.sin(a)*8,9,10,['#4f9a46','#3f8a3c','#5aa64e'][i%3])}[['#e8575d',-8],['#ffd24a',6],['#fff',0]].forEach(([k,dx],i)=>ell(c,x+dx,y-48+i*3,4,4,k))}

function buildTown(){
 const [c,cv]=layer(),R=rng(11);
 c.fillStyle=lin(c,0,0,0,360,[[0,'#6fb0e4'],[.55,'#b9dcf2'],[1,'#f7ecd0']]);c.fillRect(0,0,W,400);
 c.fillStyle=rad(c,170,70,4,330,[[0,'rgba(255,248,214,.95)'],[1,'rgba(255,248,214,0)']]);c.fillRect(0,0,W,400);
 for(let i=0;i<8;i++){const cx=R()*W,cy=24+R()*80;for(let k=0;k<6;k++)ell(c,cx+k*26-60,cy+Math.sin(k*1.7)*8,38+R()*14,15+R()*6,'rgba(255,255,255,.55)')}
 for(let x=-10;x<W;x+=44){const h=70+R()*90;c.fillStyle=`rgba(${110+R()*20|0},${140+R()*20|0},${175},.38)`;c.fillRect(x,330-h,40,h+40);if(R()<.5)poly(c,[[x,330-h],[x+20,330-h-22],[x+40,330-h]],'rgba(110,140,175,.38)')}
 // 咖啡店
 const bx=30,bw=380,by=140;
 brick(c,bx,by,bw,210,R,lin(c,bx,0,bx+bw,0,[[0,'#b8634c'],[1,'#a05241']]),.12);
 rr(c,bx-10,by-24,bw+20,26,3,lin(c,0,by-24,0,by+2,[[0,'#8a4a3a'],[1,'#5f3226']]));c.fillStyle='rgba(255,255,255,.18)';c.fillRect(bx-10,by-24,bw+20,3);
 for(let i=0;i<3;i++){const wx=bx+46+i*114,wy=by+28;rr(c,wx-6,wy-6,68,86,4,'#f4ede0');rr(c,wx,wy,56,74,2,lin(c,wx,wy,wx+56,wy+74,[[0,'#d8ecf6'],[.5,'#9cc3dc'],[1,'#6e98b4']]));poly(c,[[wx,wy+50],[wx+30,wy],[wx+44,wy],[wx,wy+70]],'rgba(255,255,255,.28)');c.fillStyle='#f4ede0';c.fillRect(wx+27,wy,2,74);c.fillRect(wx,wy+36,56,2);
  rr(c,wx-8,wy+80,72,12,2,'#6a4328');for(let k=0;k<7;k++)ell(c,wx+2+k*9,wy+78,5,5,['#ee5a6a','#ffd24a','#f5f5f5','#ff8aa0'][k%4])}
 rr(c,bx+16,by+118,bw-32,92,2,lin(c,0,by+118,0,by+210,[[0,'#3a2418'],[1,'#20130c']]));
 rr(c,bx+30,by+128,150,70,2,lin(c,bx+30,0,bx+180,0,[[0,'#ffd88a'],[1,'#d9923f']]));c.fillStyle='rgba(60,30,10,.5)';for(let i=0;i<4;i++)c.fillRect(bx+40+i*34,by+150,22,36);
 const aw=by+104;for(let i=0;i<12;i++){const ax=bx+10+i*30;poly(c,[[ax,aw],[ax+30,aw],[ax+30,aw+22],[ax+15,aw+30],[ax,aw+22]],i%2?'#f5eee0':'#c8352c')}c.fillStyle='rgba(0,0,0,.18)';c.fillRect(bx+10,aw+20,360,6);
 rr(c,bx+bw-112,by+128,66,82,3,lin(c,0,0,66,0,[[0,'#7a4a28'],[1,'#53321a']]));rr(c,bx+bw-104,by+138,50,40,2,'rgba(255,225,160,.55)');ell(c,bx+bw-58,by+172,3,3,'#e2bf7a');
 rr(c,bx+bw-250,by+80,96,28,3,'#4a2b15');c.font=`900 17px ${SERIF}`;c.fillStyle='#f6dc9b';c.textAlign='center';c.fillText('小鎮咖啡',bx+bw-202,by+100);
 // 銀行
 const sx=478,sw=450,top=112;
 poly(c,[[sx-18,top+8],[sx+sw/2,28],[sx+sw+18,top+8]],lin(c,0,28,0,top,[[0,'#e6d9bd'],[1,'#cdbe9a']]));
 poly(c,[[sx+50,top],[sx+sw/2,52],[sx+sw-50,top]],lin(c,0,52,0,top,[[0,'#bfae86'],[1,'#d3c4a0']]));
 ell(c,sx+sw/2,86,19,19,'#8a6a2a');ell(c,sx+sw/2,86,16,16,lin(c,0,70,0,102,[[0,'#f6dc9b'],[1,'#c79a45']]));c.font=`900 18px ${SERIF}`;c.fillStyle='#5b3a10';c.textAlign='center';c.fillText('幸',sx+sw/2,93);
 c.fillStyle=lin(c,sx,0,sx+sw,0,[[0,'#d9ccae'],[.5,'#eadfc4'],[1,'#cfc19f']]);c.fillRect(sx,top,sw,340-top);
 c.fillStyle='rgba(90,70,30,.14)';for(let y=top+20;y<340;y+=22)c.fillRect(sx,y,sw,2);
 rr(c,sx-14,top,sw+28,20,2,lin(c,0,top,0,top+20,[[0,'#b6a57c'],[1,'#8c7c58']]));for(let x=sx-10;x<sx+sw+10;x+=11)c.fillRect(x,top+20,6,6);
 archWin(c,sx+38,170,52,112,'#a8966b');archWin(c,sx+sw-90,170,52,112,'#a8966b');
 rr(c,sx+98,128,254,38,4,'#1c4a3a');rr(c,sx+102,132,246,30,3,'#16392c');c.strokeStyle='#e2bf7a';c.lineWidth=2;c.strokeRect(sx+105,135,240,24);
 c.font=`900 23px ${SERIF}`;c.fillStyle='#f6dc9b';c.textAlign='center';c.textBaseline='alphabetic';c.fillText('幸 福 銀 行',sx+225,158);
 for(const cxp of[sx+14,sx+104,sx+sw-130,sx+sw-40]){const px=cxp,py=146;rr(c,px,py,26,190,3,lin(c,px,0,px+26,0,[[0,'#bfb08a'],[.35,'#f7efd8'],[1,'#b3a37c']]));c.fillStyle='rgba(120,100,60,.25)';for(let k=0;k<4;k++)c.fillRect(px+4+k*6,py+8,1.5,174);rr(c,px-5,py-8,36,12,2,'#e0d3b2');rr(c,px-5,330,36,10,2,'#c4b690')}
 // 門
 const dx=sx+225-48,dy=206;
 c.fillStyle='#a8966b';c.beginPath();c.moveTo(dx-8,340);c.lineTo(dx-8,dy+40);c.arc(dx+48,dy+40,56,Math.PI,0);c.lineTo(dx+104,340);c.fill();
 c.fillStyle='#4b2e18';c.beginPath();c.moveTo(dx,340);c.lineTo(dx,dy+40);c.arc(dx+48,dy+40,48,Math.PI,0);c.lineTo(dx+96,340);c.fill();
 c.fillStyle=lin(c,0,dy,0,340,[[0,'#ffe3a0'],[1,'#e9a84b']]);c.beginPath();c.moveTo(dx+8,332);c.lineTo(dx+8,dy+42);c.arc(dx+24,dy+42,16,Math.PI,0);c.lineTo(dx+42,332);c.fill();c.beginPath();c.moveTo(dx+54,332);c.lineTo(dx+54,dy+42);c.arc(dx+70,dy+42,16,Math.PI,0);c.lineTo(dx+88,332);c.fill();
 rr(c,dx+8,dy+112,34,4,0,'#4b2e18');rr(c,dx+54,dy+112,34,4,0,'#4b2e18');ell(c,dx+44,dy+110,2.5,6,'#e2bf7a');ell(c,dx+52,dy+110,2.5,6,'#e2bf7a');
 c.fillStyle=rad(c,dx+48,dy-10,2,50,[[0,'rgba(255,225,150,.7)'],[1,'rgba(255,225,150,0)']]);c.fillRect(dx-10,dy-60,116,100);
 for(let i=0;i<4;i++)rr(c,sx+225-62-i*6,334+i*5,124+i*12,6,2,i?'#c9bb98':'#e1d5b6');
 // 樹與地面
 tree(c,436,352,1.15,R);
 c.fillStyle=lin(c,0,345,0,392,[[0,'#dcd4c3'],[1,'#c3baa7']]);c.fillRect(0,345,W,50);c.fillStyle='rgba(0,0,0,.14)';c.fillRect(0,345,W,10);for(let x=0;x<W;x+=62){c.fillRect(x,355,1.5,38)}c.fillRect(0,372,W,1.5);
 c.fillStyle='#8f877a';c.fillRect(0,392,W,7);c.fillStyle='rgba(255,255,255,.25)';c.fillRect(0,392,W,2);
 c.fillStyle=lin(c,0,399,0,540,[[0,'#8d867c'],[1,'#6a655c']]);c.fillRect(0,399,W,141);
 for(let r=0,y=399;y<540;r++){const h=11+r*.9;for(let x=-(R()*20);x<W;x+=24){const w=19+R()*8,l=38+R()*16;rr(c,x,y,w,h-1.5,3,`hsl(${30+R()*10|0},${6+R()*8|0}%,${l}%)`);c.fillStyle='rgba(255,255,255,.12)';c.fillRect(x+2,y+1,w-4,1.5)}y+=h}
 const sh=lin(c,0,0,W,0,[[0,'rgba(20,10,0,0)'],[1,'rgba(20,10,0,0)']]);
 c.fillStyle=lin(c,0,399,0,430,[[0,'rgba(20,10,0,.28)'],[1,'rgba(20,10,0,0)']]);c.fillRect(0,399,W,31);
 lamp(c,455,396);lamp(c,905,396);planter(c,598,350,R);planter(c,806,350,R);
 // 長椅
 rr(c,130,372,90,6,2,'#6a4328');rr(c,130,380,90,5,2,'#8a5a36');c.fillRect(134,385,5,12);c.fillRect(211,385,5,12);rr(c,128,356,94,14,3,'#6a4328');
 c.textAlign='left';
 return cv;
}

function buildBank(){
 const [c,cv]=layer(),R=rng(5);
 c.fillStyle=lin(c,0,0,0,250,[[0,'#f0e4c8'],[1,'#d9c8a0']]);c.fillRect(0,0,W,250);
 c.fillStyle='rgba(140,110,60,.06)';for(let x=0;x<W;x+=40)c.fillRect(x,0,18,250);
 rr(c,0,0,W,18,0,lin(c,0,0,0,18,[[0,'#c5ae78'],[1,'#a58d58']]));c.fillStyle='rgba(255,255,255,.3)';c.fillRect(0,16,W,2);
 // 護牆板
 c.fillStyle=lin(c,0,150,0,250,[[0,'#7b4c2b'],[1,'#4a2b15']]);c.fillRect(0,150,W,100);c.fillStyle='#e2bf7a';c.fillRect(0,148,W,4);
 for(let x=14;x<W;x+=78){rr(c,x,162,64,76,3,'rgba(0,0,0,.18)');rr(c,x+3,165,58,70,2,lin(c,0,165,0,235,[[0,'#8a5a36'],[1,'#5a3519']]))}
 // 左側窗與光
 archWin(c,268,40,70,150,'#8a6a3a');
 // 公告欄
 rr(c,36,86,190,130,5,'#5b371d');rr(c,44,94,174,114,3,'#b88a52');c.fillStyle='rgba(60,30,10,.18)';for(let i=0;i<40;i++)c.fillRect(44+R()*170,94+R()*112,2,2);
 rr(c,58,104,70,52,2,'#fffaf0');rr(c,138,104,70,40,2,'#ffe9a8');rr(c,58,164,60,34,2,'#f3b6a8');rr(c,128,152,80,46,2,'#fffaf0');
 c.textAlign='center';c.font=`900 12px ${SERIF}`;c.fillStyle='#b3261e';c.fillText('防詐三警訊',93,122);c.fillText('165',173,128);c.fillStyle='#4a3a28';c.font='9px sans-serif';for(let i=0;i<3;i++)c.fillRect(66,130+i*7,54,2);for(let i=0;i<2;i++)c.fillRect(66,176+i*7,44,2);for(let i=0;i<3;i++)c.fillRect(136,166+i*7,64,2);
 [[93,104],[173,104],[88,164],[168,152]].forEach(p=>ell(c,p[0],p[1],3,3,'#c8352c'));
 // 櫃台後牆
 rr(c,740,62,190,188,2,'#6a4328');for(let i=0;i<4;i++){c.fillStyle='#4a2b15';c.fillRect(746,80+i*44,178,4);for(let k=0;k<11;k++){c.fillStyle=['#8a2f22','#2b4a7a','#e2bf7a','#2f6a4a','#b87a3a'][(k+i)%5];c.fillRect(750+k*16,56+i*44+14,12,26-((k*7)%6))}}
 rr(c,560,34,200,56,6,'#2a180c');rr(c,566,40,188,44,4,'#16392c');c.strokeStyle='#e2bf7a';c.lineWidth=2;c.strokeRect(570,44,180,36);c.font=`900 24px ${SERIF}`;c.fillStyle='#f6dc9b';c.fillText('幸福銀行',660,71);
 ell(c,520,62,26,26,'#e2bf7a');ell(c,520,62,22,22,'#faf3df');c.strokeStyle='#2b1b0e';c.lineWidth=2.5;c.beginPath();c.moveTo(520,62);c.lineTo(520,46);c.moveTo(520,62);c.lineTo(532,68);c.stroke();
 for(const sx of[240,412]){ell(c,sx,138,30,30,rad(c,sx,138,1,30,[[0,'rgba(255,225,150,.6)'],[1,'rgba(255,225,150,0)']]));rr(c,sx-5,128,10,20,4,'#ffe9a8')}
 // 地板（透視）
 const VPx=480,VPy=-120,fx=(kx,y)=>VPx+(kx-VPx)*(y-VPy)/(540-VPy);
 const ys=[];for(let j=0;j<=9;j++)ys.push(250+290*Math.pow(j/9,1.35));
 for(let j=0;j<9;j++)for(let k=0;k<32;k++){const a=-1440+k*120,b=a+120;poly(c,[[fx(a,ys[j]),ys[j]],[fx(b,ys[j]),ys[j]],[fx(b,ys[j+1]),ys[j+1]],[fx(a,ys[j+1]),ys[j+1]]],(j+k)&1?'#e9dec6':'#c6b799')}
 c.fillStyle=lin(c,0,250,0,540,[[0,'rgba(0,0,0,.28)'],[.35,'rgba(255,255,255,.04)'],[1,'rgba(255,255,255,.12)']]);c.fillRect(0,250,W,290);
 poly(c,[[fx(400,335),335],[fx(560,335),335],[fx(560,540),540],[fx(400,540),540]],lin(c,0,335,0,540,[[0,'#7a1a28'],[1,'#a02636']]));
 c.strokeStyle='#e2bf7a';c.lineWidth=2.5;[[404,556],[416,544]].forEach(([a,b],i)=>{c.beginPath();c.moveTo(fx(a,335),335);c.lineTo(fx(a,540),540);c.moveTo(fx(b,335),335);c.lineTo(fx(b,540),540);c.stroke()});
 c.fillStyle='rgba(226,191,122,.75)';for(let i=0;i<3;i++)poly(c,[[480,496+i*12],[498,506+i*12],[480,502+i*12],[462,506+i*12]],'rgba(226,191,122,.8)');
 // 取號機
 rr(c,118,306,64,96,8,lin(c,118,0,182,0,[[0,'#e8e8ec'],[1,'#a9aab4']]));rr(c,126,314,48,30,4,'#1b3a5a');c.fillStyle=lin(c,0,314,0,344,[[0,'#6fb7ff'],[1,'#2a6ab0']]);c.fillRect(128,316,44,26);c.font='900 14px sans-serif';c.fillStyle='#fff';c.fillText('取號',150,335);rr(c,132,356,36,8,2,'#2a2a30');rr(c,136,362,28,24,1,'#fffaf0');c.fillStyle='#c8352c';c.font='bold 9px sans-serif';c.fillText('A027',150,378);ell(c,150,402,34,6,'rgba(0,0,0,.25)');
 // 沙發
 ell(c,128,505,92,10,'rgba(0,0,0,.25)');rr(c,44,432,168,34,12,lin(c,0,432,0,466,[[0,'#7b1f2a'],[1,'#5e1520']]));rr(c,36,452,184,40,10,lin(c,0,452,0,492,[[0,'#8e2634'],[1,'#611622']]));rr(c,50,466,70,24,6,'#a02f3f');rr(c,134,466,70,24,6,'#a02f3f');rr(c,40,490,10,12,2,'#2a180c');rr(c,206,490,10,12,2,'#2a180c');
 // 盆栽
 for(const px of[72,898]){rr(c,px-20,334,40,30,5,lin(c,0,0,40,0,[[0,'#a9a29a'],[1,'#6d675f']]));for(let i=0;i<9;i++){const a=-1.2+i*.3;c.fillStyle=['#2f7a3a','#3f9048','#2a6a34'][i%3];c.beginPath();c.ellipse(px+Math.cos(a)*18-0,334-26+Math.sin(a)*6-i%3*3,6,24,a*.9,0,7);c.fill()}}
 // 光束
 c.save();c.globalCompositeOperation='screen';[[303,190]].forEach(([wx,wy])=>{c.fillStyle=lin(c,wx,wy,wx+160,470,[[0,'rgba(255,238,180,.38)'],[1,'rgba(255,238,180,0)']]);poly(c,[[wx-35,wy],[wx+35,wy],[wx+250,470],[wx+80,470]],c.fillStyle)});c.restore();
 c.textAlign='left';
 return cv;
}
function buildFront(){
 const [c,cv]=layer();
 const xs=[400,575,745,925];
 for(let i=0;i<3;i++){const a=xs[i],b=xs[i+1];c.fillStyle='rgba(200,230,242,.12)';c.fillRect(a,176,b-a,86);poly(c,[[a+10,262],[a+60,176],[a+86,176],[a+36,262]],'rgba(255,255,255,.1)');
  rr(c,(a+b)/2-14,158,28,18,3,'#2a180c');c.fillStyle='#e2bf7a';c.font=`900 13px ${SERIF}`;c.textAlign='center';c.fillText(String(i+1),(a+b)/2,172)}
 c.fillStyle='#b8923d';xs.forEach(x=>c.fillRect(x-3,170,6,92));c.fillRect(400,174,525,4);
 rr(c,396,258,534,16,3,lin(c,0,258,0,274,[[0,'#e9c58c'],[1,'#b98b50']]));
 c.fillStyle=lin(c,0,274,0,336,[[0,'#6a3f20'],[1,'#3d2312']]);c.fillRect(398,274,530,62);
 for(let i=0;i<3;i++){const a=xs[i]+10,w=xs[i+1]-xs[i]-20;rr(c,a,284,w,44,4,'rgba(0,0,0,.2)');rr(c,a+3,287,w-6,38,3,lin(c,0,287,0,325,[[0,'#7b4a28'],[1,'#53301a']]))}
 c.fillStyle='#d9b36a';c.fillRect(398,274,530,2);c.fillRect(398,332,530,3);
 c.fillStyle=lin(c,0,336,0,356,[[0,'rgba(0,0,0,.35)'],[1,'rgba(0,0,0,0)']]);c.fillRect(380,336,560,20);
 rr(c,430,248,34,12,2,'#e8e8ec');rr(c,805,244,30,16,2,'#fffaf0');
 return cv;
}
/* ===== 第 2～5 章場景（室內）===== */
function roomBase(o){
 const [c,cv]=layer(),R=rng(o.seed||3);
 c.fillStyle=lin(c,0,0,0,250,[[0,o.w1],[1,o.w2]]);c.fillRect(0,0,W,250);
 c.fillStyle='rgba(0,0,0,.045)';for(let x=0;x<W;x+=40)c.fillRect(x,0,18,250);
 rr(c,0,0,W,16,0,o.crown);c.fillStyle='rgba(255,255,255,.3)';c.fillRect(0,14,W,2);
 c.fillStyle=lin(c,0,150,0,250,[[0,o.p1],[1,o.p2]]);c.fillRect(0,150,W,100);c.fillStyle=o.trim;c.fillRect(0,148,W,4);
 for(let x=14;x<W;x+=78){rr(c,x,162,64,76,3,'rgba(0,0,0,.18)');rr(c,x+3,165,58,70,2,lin(c,0,165,0,235,[[0,shade(o.p1,.12)],[1,o.p2]]))}
 const VPx=480,VPy=-120,fx=(kx,y)=>VPx+(kx-VPx)*(y-VPy)/(540-VPy);
 const ys=[];for(let j=0;j<=9;j++)ys.push(250+290*Math.pow(j/9,1.35));
 for(let j=0;j<9;j++)for(let k=0;k<32;k++){const a=-1440+k*120,b=a+120;poly(c,[[fx(a,ys[j]),ys[j]],[fx(b,ys[j]),ys[j]],[fx(b,ys[j+1]),ys[j+1]],[fx(a,ys[j+1]),ys[j+1]]],(j+k)&1?o.t1:o.t2)}
 c.fillStyle=lin(c,0,250,0,540,[[0,'rgba(0,0,0,.28)'],[.35,'rgba(255,255,255,.04)'],[1,'rgba(255,255,255,.12)']]);c.fillRect(0,250,W,290);
 rr(c,410,500,140,40,6,o.mat);c.strokeStyle=o.trim;c.lineWidth=2;c.strokeRect(416,506,128,28);c.font=`900 15px ${SERIF}`;c.fillStyle=o.trim;c.textAlign='center';c.fillText('出　口',480,527);c.textAlign='left';
 return {c,cv,R,fx};
}
function pWin(c,x,y,w,h,fr){rr(c,x-6,y-6,w+12,h+12,5,fr);c.fillStyle=lin(c,0,y,0,y+h,[[0,'#8cc8f0'],[1,'#eaf3dd']]);c.fillRect(x,y,w,h);ell(c,x+w*.3,y+h*.3,w*.2,h*.07,'rgba(255,255,255,.7)');ell(c,x+w*.68,y+h*.42,w*.16,h*.06,'rgba(255,255,255,.6)');c.fillStyle=fr;c.fillRect(x+w/2-2,y,4,h);c.fillRect(x,y+h/2-2,w,4)}
function pSign(c,x,y,w,h,text,bg,fg,fs){fs=fs||22;rr(c,x,y,w,h,6,'#2a180c');rr(c,x+5,y+5,w-10,h-10,4,bg);c.strokeStyle='#e2bf7a';c.lineWidth=2;c.strokeRect(x+9,y+9,w-18,h-18);c.font=`900 ${fs}px ${SERIF}`;c.fillStyle=fg;c.textAlign='center';c.fillText(text,x+w/2,y+h/2+fs*.35);c.textAlign='left'}
function pDesk(c,x,y,w,h,top,front){ell(c,x+w/2,y+h+7,w/2,8,'rgba(0,0,0,.25)');rr(c,x,y,w,14,4,top);rr(c,x+4,y+12,w-8,h-12,3,front);c.fillStyle='rgba(255,255,255,.15)';c.fillRect(x+4,y+12,w-8,3);c.fillStyle='rgba(0,0,0,.18)';for(let i=1;i<Math.floor(w/70);i++)c.fillRect(x+i*70,y+16,2,h-22)}
function pMon(c,x,y,w,h,scr){rr(c,x,y,w,h,4,'#1c1c22');c.fillStyle=lin(c,0,y+3,0,y+h-3,scr||[[0,'#6fb7ff'],[1,'#2a6ab0']]);c.fillRect(x+3,y+3,w-6,h-6);rr(c,x+w/2-4,y+h,8,8,1,'#2a2a30');rr(c,x+w/2-14,y+h+7,28,4,2,'#2a2a30')}
function pPlant(c,x,y,R){rr(c,x-20,y-30,40,30,5,lin(c,x-20,0,x+20,0,[[0,'#a9a29a'],[1,'#6d675f']]));for(let i=0;i<9;i++){const a=-1.2+i*.3;c.fillStyle=['#2f7a3a','#3f9048','#2a6a34'][i%3];c.beginPath();c.ellipse(x+Math.cos(a)*18,y-32+Math.sin(a)*6-i%3*3,6,24,a*.9,0,7);c.fill()}}
function pChair(c,x,y,col){ell(c,x,y+16,14,4,'rgba(0,0,0,.25)');rr(c,x-11,y-12,22,20,5,col);rr(c,x-11,y-30,22,20,5,shade(col,-.15));rr(c,x-9,y+6,3,10,1,'#2a2a30');rr(c,x+6,y+6,3,10,1,'#2a2a30')}
function pRound(c,x,y,r,top){ell(c,x,y+r*.55,r*1.05,r*.35,'rgba(0,0,0,.25)');rr(c,x-4,y-6,8,r*.6,2,'#3a2a20');ell(c,x,y-8,r,r*.36,shade(top,-.25));ell(c,x,y-12,r,r*.36,top);ell(c,x-r*.3,y-14,r*.3,r*.1,'rgba(255,255,255,.25)')}
function pTerm(c,x,y){ell(c,x,y+4,28,6,'rgba(0,0,0,.28)');rr(c,x-6,y-40,12,42,3,'#555a66');rr(c,x-22,y-92,44,56,6,'#2b3140');rr(c,x-18,y-88,36,36,3,lin(c,0,y-88,0,y-52,[[0,'#6fb7ff'],[1,'#2a6ab0']]));c.font=`900 15px ${SERIF}`;c.fillStyle='#fff';c.textAlign='center';c.fillText('查詢',x,y-64);c.font='900 16px sans-serif';c.fillText('?',x,y-47);rr(c,x-14,y-45+22,28,6,2,'#e2bf7a');c.textAlign='left'}
function pBoard(c,x,y,w,h,R,n){rr(c,x,y,w,h,5,'#5b371d');rr(c,x+7,y+7,w-14,h-14,3,'#b88a52');for(let i=0;i<n;i++){const nx=x+12+R()*(w-52),ny=y+12+R()*(h-48);rr(c,nx,ny,30+R()*10,26+R()*12,1,['#fffaf0','#ffe9a8','#cfe8ff','#f6c8c0'][i%4]);c.fillStyle='rgba(60,40,20,.5)';for(let k=0;k<3;k++)c.fillRect(nx+4,ny+6+k*6,20,2);ell(c,nx+15,ny+2,2.6,2.6,'#c8352c')}}
function pShadeTop(c,y0,y1,a){c.fillStyle=lin(c,0,y0,0,y1,[[0,`rgba(0,0,0,${a})`],[1,'rgba(0,0,0,0)']]);c.fillRect(0,y0,W,y1-y0)}

function buildLoan(){
 const B=roomBase({seed:21,w1:'#eef0f2',w2:'#d6dce2',crown:'#9aa6b4',p1:'#4f6a86',p2:'#2f4258',trim:'#d9c58a',t1:'#e6e0d2',t2:'#c9c0aa',mat:'#2f4258'}),c=B.c,R=B.R;
 pWin(c,60,46,112,112,'#6e7f92');pWin(c,206,46,112,112,'#6e7f92');
 rr(c,346,56,200,142,5,'#2a3a4c');rr(c,352,62,188,130,3,'#f4f1e6');
 for(let i=0;i<3;i++)for(let j=0;j<2;j++){const x=360+i*60,y=70+j*60;rr(c,x,y,52,54,2,'#fffdf6');c.strokeStyle='#bfb59a';c.lineWidth=1;c.strokeRect(x,y,52,54);poly(c,[[x+6,y+24],[x+26,y+8],[x+46,y+24]],['#c8352c','#2f6a9a','#3f9048'][(i+j)%3]);rr(c,x+10,y+24,32,16,1,'#f1e2c0');rr(c,x+22,y+30,8,10,1,'#7a4a28');c.fillStyle='#4a3a28';c.font='bold 9px sans-serif';c.textAlign='center';c.fillText(['租','售','租','租','售','租'][i+j*3],x+26,y+51);c.textAlign='left'}
 pSign(c,560,26,200,58,'安居房屋','#1d3f6a','#f6dc9b',26);
 pBoard(c,776,62,96,150,R,7);rr(c,786,86,44,32,1,'#fff3c4');c.fillStyle='#b3261e';c.font=`900 11px ${SERIF}`;c.textAlign='center';c.fillText('快錢借你',808,100);c.fillText('月息3%',808,113);c.textAlign='left';
 for(const x of [60,110,160])pChair(c,x,324,'#3f6a9a');
 pDesk(c,560,300,240,52,'#b8956a','#7a5636');pMon(c,624,254,54,36);rr(c,700,284,44,14,2,'#fffdf6');c.font='bold 9px sans-serif';c.fillStyle='#2d2114';c.textAlign='center';c.fillText('周經理',722,295);c.textAlign='left';
 rr(c,414,300,4,40,1,'#555a66');rr(c,396,282,108,28,5,'#5a3a7a');c.font=`900 15px ${SERIF}`;c.fillStyle='#fff';c.textAlign='center';c.fillText('貸款諮詢',450,302);c.textAlign='left';pDesk(c,392,336,110,40,'#cdb58a','#8a6a46');
 pPlant(c,900,330,R);pPlant(c,38,470,R);
 pTerm(c,810,508);
 pShadeTop(c,250,300,.16);
 return B.cv;
}
function buildCafe(){
 const B=roomBase({seed:33,w1:'#f6e7cf',w2:'#e8d0a8',crown:'#8a5a30',p1:'#8a5a34',p2:'#5a3419',trim:'#e2bf7a',t1:'#b98a58',t2:'#a97a4a',mat:'#5a3419'}),c=B.c,R=B.R;
 for(let i=0;i<8;i++){c.fillStyle=i%2?'#c8352c':'#fffaf0';c.fillRect(46+i*20,30,20,26)}poly(c,[[46,56],[206,56],[196,70],[56,70]],'#a02620');
 pWin(c,56,76,140,90,'#6a4a2a');
 rr(c,320,60,170,132,5,'#3a2312');rr(c,326,66,158,120,3,'#1e3a2c');c.font=`900 16px ${SERIF}`;c.fillStyle='#f4efe0';c.textAlign='center';c.fillText('今日菜單',405,90);c.font='13px sans-serif';[['美式咖啡','60'],['拿鐵','85'],['手沖單品','120'],['起司蛋糕','95']].forEach((r,i)=>{c.textAlign='left';c.fillText(r[0],340,116+i*20);c.textAlign='right';c.fillText(r[1],470,116+i*20)});c.textAlign='left';
 c.fillStyle='#4a2b15';c.fillRect(520,78,420,6);c.fillRect(520,134,420,6);c.fillRect(520,190,420,6);for(let r=0;r<3;r++)for(let k=0;k<13;k++){rr(c,530+k*31,[56,112,168][r]+14,20,22,3,['#f4efe6','#e8c8a0','#c8a070','#f6e0d0'][(k+r)%4])}
 pSign(c,600,12,220,42,'小鎮咖啡','#3a2312','#f6dc9b',24);
 pDesk(c,500,288,420,58,'#7a4a28','#5a3419');rr(c,640,246,76,46,6,lin(c,0,246,0,292,[[0,'#c9ccd4'],[1,'#7a7e8a']]));rr(c,652,258,52,10,2,'#2a2a30');ell(c,732,272,10,10,'#e9e9ef');
 rr(c,770,252,100,40,4,'rgba(200,230,242,.55)');c.strokeStyle='#b8c8d0';c.lineWidth=2;c.strokeRect(770,252,100,40);rr(c,780,266,30,18,3,'#f0d8a8');rr(c,820,266,36,18,3,'#d8a898');
 rr(c,872,272,30,18,3,'#2a2a30');rr(c,876,266,22,8,2,'#444955');c.fillStyle='#4af';c.fillRect(884,278,6,2);
 pRound(c,170,452,52,'#e9d9b6');pChair(c,96,453,'#a0522d');pChair(c,244,453,'#a0522d');
 pPlant(c,60,360,R);pPlant(c,905,500,R);pPlant(c,420,500,R);
 pTerm(c,100,512);
 pShadeTop(c,250,300,.14);
 return B.cv;
}
function buildWealth(){
 const B=roomBase({seed:47,w1:'#e9efee',w2:'#cfdad8',crown:'#7a9a98',p1:'#2c5a58',p2:'#1d3f3e',trim:'#d9c58a',t1:'#93a7ac',t2:'#82979d',mat:'#1d3f3e'}),c=B.c,R=B.R;
 rr(c,330,44,300,132,6,'#14202a');rr(c,338,52,284,116,4,lin(c,0,52,0,168,[[0,'#102a3a'],[1,'#0b1a26']]));c.strokeStyle='#3a5a70';c.lineWidth=1;for(let i=1;i<5;i++){c.beginPath();c.moveTo(344,52+i*23);c.lineTo(616,52+i*23);c.stroke()}
 c.strokeStyle='#4ad08a';c.lineWidth=3;c.beginPath();[[350,140],[390,120],[430,128],[470,98],[510,108],[550,80],[590,70]].forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();c.font=`900 14px ${SERIF}`;c.fillStyle='#d9e8f0';c.fillText('理財中心・今日行情',350,74);
 pSign(c,190,96,130,42,'理財中心','#16392c','#f6dc9b',18);
 rr(c,650,52,206,148,5,'#2a180c');rr(c,656,58,194,136,3,'#fff8e6');c.textAlign='center';c.font=`900 17px ${SERIF}`;c.fillStyle='#16392c';c.fillText('新基金說明會',753,86);c.font=`900 21px ${SERIF}`;c.fillStyle='#c0392b';c.fillText('保證年報酬 10%！',753,124);c.font=`900 16px ${SERIF}`;c.fillText('穩賺不賠',753,152);c.font='11px sans-serif';c.fillStyle='#6a5a40';c.fillText('（今日限定優惠）',753,176);c.textAlign='left';
 pDesk(c,50,296,240,56,'#c8b090','#6a4a30');pMon(c,110,252,52,36);pMon(c,190,252,52,36);
 ell(c,480,452,230,46,'rgba(40,80,100,.5)');ell(c,480,452,200,38,'rgba(70,120,140,.35)');
 pPlant(c,40,500,R);pPlant(c,905,330,R);
 pTerm(c,900,512);
 pShadeTop(c,250,300,.16);
 return B.cv;
}
function buildHall(){
 const B=roomBase({seed:59,w1:'#f4f0d8',w2:'#e2dcb4',crown:'#8a9a6a',p1:'#6d8a5a',p2:'#4a6a3e',trim:'#e2d29a',t1:'#d8c49a',t2:'#c9b184',mat:'#4a6a3e'}),c=B.c,R=B.R;
 for(let i=0;i<14;i++){const x=40+i*66;poly(c,[[x,20],[x+66,20],[x+33,40]],['#e2574c','#f4c542','#4aa3df','#5cb85c'][i%4])}c.fillStyle='#7a6a3a';c.fillRect(0,18,W,3);
 rr(c,240,60,470,180,3,'#7a1f2a');for(let i=0;i<12;i++)rr(c,240+i*40,60,20,180,0,'rgba(0,0,0,.14)');
 pSign(c,300,74,360,70,'社區防詐宣導講座','#16392c','#f6dc9b',30);c.font='14px sans-serif';c.fillStyle='#fbf1dc';c.textAlign='center';c.fillText('停・看・聽　先查證，再行動　165 反詐騙專線',480,172);c.textAlign='left';
 poly(c,[[220,252],[740,252],[760,276],[200,276]],'#a98458');rr(c,200,276,560,12,2,'#7a5a36');rr(c,448,200,64,50,3,'#5a3a1e');rr(c,456,206,48,12,2,'#8a6a3e');
 pDesk(c,50,300,200,50,'#e8dcc0','#8a6a3e');pSign(c,100,262,100,30,'報名處','#d9b36a','#2a180c',16);
 pBoard(c,738,64,120,150,R,8);c.font=`900 16px ${SERIF}`;c.fillStyle='#b3261e';c.textAlign='center';c.fillText('165',798,112);c.font=`900 11px ${SERIF}`;c.fillText('防詐三警訊',798,132);c.textAlign='left';
 for(let k=0;k<6;k++){pChair(c,300+k*70,330,'#6a7a8a')}
 pPlant(c,40,330,R);pPlant(c,905,500,R);
 pTerm(c,80,512);
 pShadeTop(c,250,300,.12);
 return B.cv;
}

const VIG=(()=>{const [c,cv]=layer();c.fillStyle=rad(c,W/2,H*.5,H*.35,W*.62,[[0,'rgba(10,4,0,0)'],[1,'rgba(10,4,0,.45)']]);c.fillRect(0,0,W,H);return cv})();
let BG={};
function buildAll(){BG={town:buildTown(),bank:buildBank(),front:buildFront(),loan:buildLoan(),cafe:buildCafe(),wealth:buildWealth(),hall:buildHall()}}

/* ===== 遊戲狀態 ===== */
const MIS=[['ming','識破邀約：找出三大警訊'],['ticket','到銀行抽取號碼牌'],['consult','向櫃台諮詢（至少問 3 題）'],['record','簽名前確認紀錄'],['verify','向警衛學會查證管道']];
let LEARN={
 flags:'三大警訊：保證高報酬、保證保本、拉人頭／向多數人募集。',
 art29:'非銀行不得收受存款（銀行法第 29 條）；以投資等名義向多數人收款並給付不合理報酬，可能視為變相收受存款（第 29 條之 1）。',
 rate:'民法第 205 條：約定利率超過年息 16%，超過部分無效。10 萬一個月領 3 萬，年報酬約 360%。',
 deposit:'合法銀行存款有存款保險保障，每一存款人在同一家銀行最高 300 萬元；吸金業者沒有。',
 sign:'簽名只代表確認「紀錄與談話相符」，不是同意購買、加入或授權。沒當場回答的事要記成「後續回覆」。',
 call165:'遇到可疑投資，先停下來，撥 165 反詐騙專線查證；被催促「今天就要決定」更要小心。'
};
let PNAME='小安',PLAYER=null,MANUAL=null;
let S,mode='title',scene='town',keys={},T=0,last=0,typing=null,choices=null,tm=0,lastPor='',ovRes=null,ovPrev='world';
const P={x:150,y:455,dir:'r',mv:false};
const NPC={
 ming:{id:'ming',x:340,y:452,look:LOOK.ming,dir:'r',ph:.3,solid:1,sc:1},
 clerk:{id:'clerk',x:660,y:293,look:LOOK.clerk,dir:'d',ph:1.1,solid:0,sc:1},
 guard:{id:'guard',x:858,y:420,look:LOOK.guard,dir:'l',ph:2.2,solid:1,sc:1}
};
const SC={
 town:{b:[30,392,930,515],rects:[[100,0,0,0]],npcs:()=>[NPC.ming]},
 bank:{b:[40,345,920,515],rects:[[112,296,76,110],[36,430,190,80],[46,330,52,40],[872,330,52,40]],npcs:()=>[NPC.clerk,NPC.guard]}
};
function resetState(){S={m:{},asked:new Set(),learn:[],mistakes:0,min:0,greeted:false,called:'A024',cleared:{},chm:{},seen:{}}}
const done=n=>MIS.filter(m=>S.m[m[0]]).length;
function learn(k){if(!S.learn.includes(k))S.learn.push(k)}
function bump(m){S.min=Math.min(360,S.min+m);hud()}
function hud(){
 $('#mc').textContent=chDone(chOf(scene))+'/5';$('#locn').textContent=scene==='town'?'幸福鎮・中央廣場':scene==='bank'?'幸福銀行・大廳':((CHS[chOf(scene)-1]||{}).place||'');
 const t=9*60+S.min,h=t/60|0,m=t%60;$('#dig').textContent=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
 $('#hh').setAttribute('transform',`rotate(${(h%12)*30+m/2} 50 50)`);$('#mh').setAttribute('transform',`rotate(${m*6} 50 50)`);
}
(()=>{let s='';for(let i=0;i<12;i++){const a=i*Math.PI/6;s+=`<line x1="${50+Math.sin(a)*38}" y1="${50-Math.cos(a)*38}" x2="${50+Math.sin(a)*43}" y2="${50-Math.cos(a)*43}"/>`}$('#tk').innerHTML=s})();
let toastT=0;function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2800)}
function finish(id){if(S.m[id])return;S.m[id]=1;const n=MISN[id]||id;toast('任務完成：'+n);bump(15);sync()}
// 把進度回報給後端（玩家資料庫）；連不上就略過，不影響遊玩
function sync(extra){if(!PLAYER)return Promise.resolve();return fetch('/api/progress',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({id:PLAYER.id,token:PLAYER.token,done:CHS.flatMap(C=>C.mids).filter(id=>S.m[id]),mistakes:S.mistakes},extra||{}))}).catch(()=>{})}
function savedPlayer(){try{return JSON.parse(localStorage.getItem('bq_player')||'null')}catch(e){return null}}
function savePlayer(o){try{localStorage.setItem('bq_player',JSON.stringify(o))}catch(e){}}

/* ===== 移動與繪製 ===== */
function blocked(x,y){const s=SC[scene],b=s.b;if(x<b[0]||x>b[2]||y<b[1]||y>b[3])return true;for(const r of s.rects)if(x>r[0]&&x<r[0]+r[2]&&y>r[1]&&y<r[1]+r[3])return true;for(const n of s.npcs())if(n.solid&&Math.hypot(x-n.x,(y-n.y)*1.6)<26)return true;return false}
function update(dt){
 const k=keys;let dx=(k.arrowright||k.d?1:0)-(k.arrowleft||k.a?1:0),dy=(k.arrowdown||k.s?1:0)-(k.arrowup||k.w?1:0);
 P.mv=!!(dx||dy);if(!P.mv)return;const l=Math.hypot(dx,dy);dx/=l;dy/=l;const sp=175*dt;
 if(!blocked(P.x+dx*sp,P.y))P.x+=dx*sp;if(!blocked(P.x,P.y+dy*sp*.85))P.y+=dy*sp*.85;
 P.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u');
}
function spots(){return scene==='town'
 ?[{id:'ming',x:340,y:452,r:80,label:'對話'},{id:'door',x:702,y:392,r:62,label:'進入幸福銀行'}]
 :scene!=='bank'?chSpots()
 :[{id:'kiosk',x:150,y:418,r:64,label:'取號機'},{id:'clerk',x:660,y:293,r:82,label:'和櫃台對話'},{id:'guard',x:858,y:420,r:72,label:'對話'},{id:'board',x:130,y:350,r:62,label:'公告欄'},{id:'exit',x:480,y:514,r:66,label:'離開銀行'}]}
function chSpots(){
 const ch=chOf(scene),C=CHS[ch-1],g=SCN[scene];if(!C||!g||ch<2)return [];
 const cur=curIdx(C),lim=cur<0?C.ms.length-1:cur,out=[];
 C.ms.forEach((m,i)=>{if(i<=lim)out.push({id:'m'+i,mi:i,ch,x:m.x,y:m.y,r:m.obj?84:82,label:m.label})});
 out.push({id:'kb',x:g.kb[0],y:g.kb[1]-5,r:74,label:'金融小百科'},{id:'exit',x:480,y:514,r:54,label:'離開此處'});
 return out}
function nearest(){let b=null,bd=1e9;for(const s of spots()){const d0=Math.hypot(P.x-s.x,P.y-s.y);const d=d0+(s.mi==null&&scene!=='bank'&&scene!=='town'?40:0);if(d0<s.r&&d<bd){b=s;bd=d}}return b}
function render(){
 const c=ctx;c.setTransform(DPR,0,0,DPR,0,0);c.clearRect(0,0,W,H);
 c.drawImage(BG[scene],0,0,W,H);
 const L=[];
 SC[scene].npcs().forEach(n=>{if(n.id==='ming')n.dir=P.x<n.x?'l':'r';else if(n.face)n.dir=Math.abs(P.x-n.x)<36?'d':P.x<n.x?'l':'r';L.push({y:n.y,f:()=>sprite(c,n.look,n.x,n.y,n.dir,T+n.ph,false,n.sc)})});
 L.push({y:P.y,f:()=>sprite(c,LOOK.an,P.x,P.y,P.dir,T,P.mv,1)});
 if(scene==='bank')L.push({y:300,f:()=>{c.drawImage(BG.front,0,0,W,H);rr(c,438,118,86,28,3,'#0c0c10');c.font='bold 20px monospace';c.fillStyle='#ff4a3a';c.textAlign='center';c.fillText(S.called,481,140);c.textAlign='left'}});
 if(mode==='world'&&chOf(scene)>1&&CHS[chOf(scene)-1]){const C=CHS[chOf(scene)-1],ci=curIdx(C);if(ci>=0){const m=C.ms[ci],qy=(m.obj?m.y-62:m.y-132)+Math.sin(T*4)*4;L.push({y:9999,f:()=>{ell(c,m.x,qy,13,13,'#f4d98f');c.strokeStyle='#5b371d';c.lineWidth=3;c.stroke();c.font='900 18px sans-serif';c.fillStyle='#5b371d';c.textAlign='center';c.fillText('!',m.x,qy+6);c.textAlign='left'}})}}
 L.sort((a,b)=>a.y-b.y).forEach(o=>o.f());
 c.drawImage(VIG,0,0,W,H);
 if(mode==='world'){const s=nearest();if(s){const bx=P.x,by=P.y-128+Math.sin(T*5)*3;c.font='bold 15px sans-serif';const w=c.measureText(s.label).width+46;rr(c,bx-w/2,by-14,w,28,14,'rgba(30,16,6,.9)');c.strokeStyle='#e2bf7a';c.lineWidth=2;c.stroke();ell(c,bx-w/2+15,by,10,10,'#e2bf7a');c.fillStyle='#2a180c';c.textAlign='center';c.fillText('A',bx-w/2+15,by+5);c.fillStyle='#fbf1dc';c.textAlign='left';c.fillText(s.label,bx-w/2+31,by+5)}}
}
function frame(ts){T=ts/1000;const dt=Math.min(.05,T-last);last=T;if(mode==='world')update(dt);else P.mv=false;render();requestAnimationFrame(frame)}

/* ===== 對話系統 ===== */
function parse(t){t=String(t).split('小安').join(PNAME);const segs=[];t.split(/(\[\[.*?\]\])/).forEach(s=>{if(!s)return;const h=/^\[\[.*\]\]$/.test(s);segs.push({t:h?s.slice(2,-2):s,h})});return{segs,total:segs.reduce((a,s)=>a+s.t.length,0)}}
function renderTx(n){let left=n,html='';for(const s of typing.segs){if(left<=0)break;const t=s.t.slice(0,left);left-=s.t.length;html+=s.h?`<span class="hl">${esc(t)}</span>`:esc(t)}$('#tx').innerHTML=html}
function openDlg(name,mood){
 $('#dlg').hidden=false;const L=WHO[name];$('#nm').hidden=!name;$('#nm').textContent=name==='小安'?PNAME:name;$('#nm').classList.toggle('np',!L);
 $('#por').hidden=!L;$('#inner').classList.toggle('np',!L);
 if(L){const k=name+mood;if(k!==lastPor){drawPortrait(L,mood);lastPor=k}}
}
function startTalk(){mode='talk'}
function endTalk(){clearInterval(tm);typing=null;choices=null;$('#dlg').hidden=true;$('#ch').hidden=true;mode='world';lastPor=''}
function say(name,text,mood){mood=mood||'smile';return new Promise(res=>{
 openDlg(name,mood);$('#ch').hidden=true;choices=null;const p=parse(text);typing={segs:p.segs,total:p.total,n:0,done:false,res};$('#nx').hidden=true;renderTx(0);
 clearInterval(tm);tm=setInterval(()=>{if(!typing)return;typing.n++;renderTx(typing.n);if(typing.n>=typing.total){typing.done=true;clearInterval(tm);$('#nx').hidden=false}},24)})}
function ask(name,text,opts,mood,o){o=o||{};mood=mood||'smile';return new Promise(res=>{
 openDlg(name,mood);clearInterval(tm);
 if(!o.keep){const p=parse(text);typing={segs:p.segs,total:p.total,n:p.total,done:true,res:null};renderTx(p.total)}
 $('#nx').hidden=true;choices={opts,sel:o.sel||0,res};drawChoices()})}
function drawChoices(){const el=$('#ch');el.hidden=false;el.innerHTML=choices.opts.map((t,i)=>`<button type="button" data-i="${i}" class="${i===choices.sel?'sel':''}">${esc(t)}</button>`).join('')}
function pick(i){if(!choices)return;const r=choices.res;choices=null;$('#ch').hidden=true;r(i)}
function advance(){if(!typing)return;if(!typing.done){typing.n=typing.total;renderTx(typing.n);typing.done=true;clearInterval(tm);$('#nx').hidden=false}else if(typing.res){const r=typing.res;typing.res=null;r()}}
async function multi(name,text,items,mood){const sel=new Set();let cur=0,first=true;
 while(true){const opts=items.map((t,i)=>(sel.has(i)?'☑ ':'☐ ')+t).concat(['✔ 確定送出']);
  const i=await ask(name,text,opts,mood,{keep:!first,sel:cur});first=false;cur=i;if(i===items.length)return sel;sel.has(i)?sel.delete(i):sel.add(i)}}

/* ===== 覆蓋面板 ===== */
function showOv(html,setup){ovPrev=mode;mode='ov';$('#card').innerHTML=html;$('#ov').hidden=false;if(setup)setup();$('#card').scrollTop=0;return new Promise(r=>ovRes=r)}
function closeOv(){$('#ov').hidden=true;mode=ovPrev==='ov'?'world':ovPrev;const r=ovRes;ovRes=null;if(r)r()}
document.addEventListener('click',e=>{if(e.target.closest('[data-close]'))closeOv()});
function openMissions(){if(mode!=='world')return;
 const ch=chOf(scene),C=CHS[ch-1];let hint,list;
 if(ch===1){hint=!S.m.ming?'去找廣場上的阿明聊聊。':!S.m.ticket?'走進幸福銀行，在取號機抽號碼牌。':!S.m.consult?'到 2 號窗口找林小姐，至少問 3 個問題。':!S.m.record?'請林小姐整理諮詢紀錄，確認後簽名。':!S.m.verify?'找大廳的王警衛，請教查證方法。':S.cleared[1]?'第 1 章通關了！按左上角「地圖」前往下一章。':'回廣場向阿明回報結果。';list=MIS.map(m=>[m[0],m[1]])}
 else{const cur=curIdx(C);hint=cur<0?'本章已全部完成，按左上角「地圖」前往下一章。':C.ms[cur].hint;list=C.ms.map(m=>[m.id,m.name])}
 showOv(`<h2>任務清單・第 ${ch} 章</h2><p style="color:#6d5a40;margin:0 0 6px">下一步：<b>${hint}</b></p><ul style="list-style:none;padding:0">${list.map(m=>`<li>${S.m[m[0]]?'<span class="done">✔</span>':'☐'} ${esc(m[1])}</li>`).join('')}</ul><h3>已學到的重點</h3>${S.learn.length?'<ul>'+S.learn.map(k=>`<li>${esc(lt(k))}</li>`).join('')+'</ul>':'<p style="color:#6d5a40">和人物對話後，重點會記錄在這裡。</p>'}<div class="row"><button class="b" data-close type="button">關閉</button></div>`)}
function freeAskOv(){return showOv(`<h2>向櫃台提問</h2><p style="color:#6d5a40;margin:0">輸入問題，櫃台會從知識庫查詢。例如：私人借貸利息最高多少？被拉去投資要怎麼查證？</p>
 <div style="display:flex;gap:8px;margin-top:12px"><input id="fq" maxlength="200" autocomplete="off" placeholder="輸入你的問題" style="flex:1;min-width:0;font:inherit;padding:8px 10px;border:2px solid #a9803a;border-radius:6px;background:#fffaf0;color:#2d2114"><button class="b" id="fs" type="button">送出</button></div>
 <div id="fr" style="margin-top:12px"></div><div class="row"><button class="b" data-close type="button">關閉</button></div>`,()=>{
  const inp=$('#fq'),btn=$('#fs'),out=$('#fr');
  async function go(){const q=inp.value.trim();if(q.length<2){out.textContent='請輸入至少 2 個字。';return}
   btn.disabled=true;out.textContent='查詢中…';
   try{const r=await fetch('/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q,id:PLAYER&&PLAYER.id,token:PLAYER&&PLAYER.token})});if(!r.ok)throw new Error(r.status);const d=await r.json();
    out.innerHTML='<p style="white-space:pre-wrap">'+esc(d.answer)+'</p>'+(d.sources.length?'<h3>想看條文原文，點下面的出處</h3><ul>'+d.sources.map(s=>`<li><b>${esc(s.ref)}</b>　${esc(s.title)}${s.text&&s.text!==s.summary?`<details><summary>看完整條文</summary><div style="white-space:pre-wrap;font-size:13px;margin-top:4px">${esc(s.text)}</div></details>`:''}</li>`).join('')+'</ul>':'')}
   catch(e){out.textContent='目前連不上後端知識庫，請確認 Flask 已啟動。'}
   btn.disabled=false}
  btn.onclick=go;inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go()}});setTimeout(()=>inp.focus(),50)})}
async function manualOv(){
 if(!MANUAL){try{const r=await fetch('/api/manual');MANUAL=r.ok?await r.json():[]}catch(e){MANUAL=[]}}
 if(!MANUAL.length)return showOv('<h2>法規手冊</h2><p>目前連不上後端，或手冊資料還沒匯入。</p><div class="row"><button class="b" data-close type="button">關閉</button></div>');
 const cats=[...new Set(MANUAL.map(m=>m.cat))];
 return showOv(`<h2>法規手冊</h2><p style="color:#6d5a40;margin:0 0 8px">六大法規白話速查，共 ${MANUAL.length} 條。每條先講「這條在幹嘛」，專業內容收在最下面。</p>
 <div style="display:flex;gap:8px;flex-wrap:wrap"><select id="mcat" style="font:inherit;padding:6px 8px;border:2px solid #a9803a;border-radius:6px;background:#fffaf0;color:#2d2114"><option value="">全部法規</option>${cats.map(c=>`<option>${esc(c)}</option>`).join('')}</select>
 <input id="mq" placeholder="搜尋關鍵字，例如：保密、利率" autocomplete="off" style="flex:1;min-width:140px;font:inherit;padding:6px 10px;border:2px solid #a9803a;border-radius:6px;background:#fffaf0;color:#2d2114"></div>
 <div id="ml" style="margin-top:10px"></div><div class="row"><button class="b" data-close type="button">關閉</button></div>`,()=>{
  const f=(t,l)=>l?`<p><b>${t}</b>：${esc(l)}</p>`:'';const rk={'高風險':'#b3261e','中風險':'#a8680f','低風險':'#2d7a3e'};
  function draw(){const c=$('#mcat').value,q=$('#mq').value.trim();
   const L=MANUAL.filter(m=>(!c||m.cat===c)&&(!q||((m.plain||'')+(m.eg||'')+(m.todo||'')+m.title+m.summary+m.law+m.cat+m.violation+m.scene).includes(q))).slice(0,60);
   $('#ml').innerHTML=L.length?L.map(m=>`<details style="border-bottom:1px dashed #b89c68;padding:6px 0"><summary style="cursor:pointer"><b>${esc(m.cat)} ${esc(m.law)}</b>　${esc(m.title)} <span style="color:${rk[m.risk]||'#6d5a40'};font-size:12px">${esc(m.risk)}</span></summary><div style="font-size:14px;margin-top:6px">${m.plain?`<div style="background:#fff3cf;border:2px solid #d9b45a;border-radius:8px;padding:8px 10px"><p style="margin:0 0 6px"><b>白話說</b>：${esc(m.plain)}</p>${m.eg?`<p style="margin:0 0 6px"><b>舉個例子</b>：${esc(m.eg)}</p>`:''}${m.todo?`<p style="margin:0"><b>您可以這樣做</b>：${esc(m.todo)}</p>`:''}</div>`:''}<details style="margin-top:6px"><summary style="cursor:pointer;color:#6d5a40">專業版內容（條文重點、檢核、罰則）</summary>${f('條文重點',m.summary)}${f('適用環節',m.scene)}${f('檢核重點',m.checklist)}${f('常見違規',m.violation)}${f('法律效果',m.effect)}</details></div></details>`).join(''):'<p style="color:#6d5a40">沒有符合的條目。</p>'}
  $('#mcat').onchange=draw;$('#mq').oninput=draw;$('#mq').addEventListener('keydown',e=>e.stopPropagation());draw()})}
function posterOv(){learn('flags');learn('call165');return showOv(`<h2>防詐宣導海報</h2><h3>吸金三大警訊</h3><ul><li><span class="hl">保證高報酬</span>：遠高於一般銀行利率</li><li><span class="hl">保證保本</span>：說「穩賺不賠、隨時可領回」</li><li><span class="hl">拉人頭</span>：向多數人募集，或介紹新人有獎金</li></ul><h3>遇到可疑投資</h3><ul><li>先停下來，不要被「今天就要決定」催促</li><li>撥 <span class="hl">165</span> 反詐騙專線查證</li><li>保留對話與匯款紀錄</li></ul><div class="row"><button class="b" data-close type="button">關閉</button></div>`)}
function signOv(){return showOv(`<h2>諮詢紀錄確認單</h2><p style="color:#6d5a40;margin:0">幸福銀行・2 號窗口　諮詢人：${esc(PNAME)}</p>
 <h3>當場說明</h3>${S.asked.size?'<ul>'+QA.filter(q=>S.asked.has(q.id)&&q.type==='now').map(q=>`<li>${q.rec}</li>`).join('')+'</ul>':'<p>（無）</p>'}
 <h3>後續回覆</h3>${S.asked.has('q4')?'<ul><li>'+QA[3].rec+'</li></ul>':'<p>（無）</p>'}
 <h3>簽名前請逐項確認</h3>
 <label><input type="checkbox" class="ck"> 內容和剛才談的相符</label>
 <label><input type="checkbox" class="ck"> 「後續回覆」事項與時間已寫清楚</label>
 <label><input type="checkbox" class="ck"> 我知道簽名只是確認紀錄，不是同意購買或加入</label>
 <div class="sigbox" id="sb"><svg viewBox="0 0 200 60"><path d="M6 40 C20 6 34 6 30 36 C28 52 44 14 56 30 C62 40 70 40 80 24 C86 14 84 44 100 34 C112 26 120 24 130 38 C138 46 150 20 166 28 C176 33 184 30 194 24"/></svg></div>
 <div class="row"><button class="b" id="sg" type="button" disabled>簽名</button></div>`,()=>{
  const cks=[...document.querySelectorAll('.ck')],b=$('#sg');cks.forEach(k=>k.onchange=()=>b.disabled=!cks.every(x=>x.checked));
  b.onclick=async()=>{b.disabled=true;cks.forEach(k=>k.disabled=true);$('#sb').classList.add('go');await sleep(1900);closeOv()}})}

/* ===== 劇情 ===== */
let QA=[
 {id:'q1',q:'「幸福共享基金」是合法的嗎？',type:'now',rec:'非銀行不得收受存款；向多數人收款並約定不合理高報酬，可能視為變相收受存款（銀行法 §29、§29-1）。',
  a:[['我沒辦法直接判斷單一公司，但可以先說基本原則：[[非銀行不得經營收受存款業務]]（銀行法第 29 條）。','think'],['如果向多數人收錢，又約定[[與本金不成合理比例]]的報酬，法律上可能視為「[[變相收受存款]]」（第 29 條之 1）。','think']],learn:'art29'},
 {id:'q2',q:'「10 萬每月領 3 萬」有可能是真的嗎？',type:'now',rec:'10 萬每月領 3 萬＝年報酬約 360%，遠超過民法年息 16% 上限（§205），不可能「保證」。',
  a:[['算一下：10 萬一個月領 3 萬，一年 36 萬，[[年報酬率約 360%]]。','open'],['民法規定約定利率超過[[年息 16%]]，超過的部分無效（第 205 條）。真正的投資，沒有人能[[保證]]一定賺錢。','think']],learn:'rate'},
 {id:'q3',q:'錢放銀行，和放進這種基金，保障一樣嗎？',type:'now',rec:'合法銀行存款有存款保險（每戶每行最高 300 萬元）；吸金業者沒有這層保障。',
  a:[['合法銀行的存款有[[存款保險]]：同一存款人在同一家銀行，最高保額[[新臺幣 300 萬元]]。','smile'],['吸金業者不在存款保險的範圍內，錢被捲走，[[很可能拿不回來]]。','worry']],learn:'deposit'},
 {id:'q4',q:'可以幫我查這家公司的登記資料嗎？',type:'later',rec:'後續回覆：查證該公司登記與許可情形（3 個工作天內電話回覆）。',
  a:[['這個我需要[[向內部查證公司資料與許可情形]]，沒辦法當場給您確定的答案。','think'],['我會登記成[[後續回覆]]事項，[[三個工作天內]]電話聯絡您。您也可以先上[[金管會]]網站查詢合法銀行名單。','smile']],learn:null}
];
async function mingTalk(){
 startTalk();
 if(!S.m.ming){
  await say('阿明','小安！你來得正好！我朋友介紹了「幸福共享基金」，[[投資 10 萬，每個月保證領 3 萬]]！','open');
  await say('阿明','而且[[保證保本，隨時可以領回]]！再[[拉三個朋友加入]]，還有額外獎金喔！','open');
  await say('阿明','名額有限，我想今天就匯款！你要不要一起？','smile');
  await say('','（小安心想：聽起來怪怪的……先找出哪裡有問題吧。）');
  const items=['保證每個月領 3 萬（年報酬約 360%）','保證保本、隨時可以領回','拉人加入就有獎金','推薦的人是認識多年的朋友','簡章的圖片做得很漂亮'];
  while(true){
   const sel=await multi('','下面哪些是「可疑警訊」？（可複選，選完按「確定送出」）',items,'think');
   const bad=[3,4].filter(i=>sel.has(i)),miss=[0,1,2].filter(i=>!sel.has(i));
   if(!bad.length&&!miss.length)break;
   S.mistakes++;
   if(bad.length)await say('小安','（熟不熟、圖片美不美，都不能當成判斷依據。越熟的人，越容易讓人放下戒心。）','think');
   if(miss.length)await say('小安','（好像漏掉了。提示：[[高報酬]]、[[保本]]、[[拉人頭]]。）','think');
  }
  learn('flags');
  await say('小安','三個都是典型警訊！非銀行向多數人收錢，又約定不合理的高報酬，可能被視為「[[變相收受存款]]」。','think');
  await say('阿明','欸……可是我已經跟大家說要一起投了耶……','worry');
  await say('小安','先別匯款。我去銀行櫃台問問看，你在這裡等我。','smile');
  await say('阿明','好……拜託你了！','worry');
  finish('ming');endTalk();return;
 }
 if(done()<5){
  await say('阿明','銀行那邊問得怎麼樣了？','worry');
  await say('小安',!S.m.ticket?'我正要進去。先在大廳的取號機抽[[號碼牌]]。':!S.m.consult?'還在問。我要到[[2 號窗口]]找林小姐。':!S.m.record?'快好了，要請林小姐整理[[諮詢紀錄]]再簽名。':'差不多了，再去請教一下[[大廳的警衛]]。','smile');
  await say('阿明','好，我在這裡等你！','smile');endTalk();return;
 }
if(S.cleared[1]){await say('阿明','謝謝你，小安！我已經打過 165 了，也提醒朋友們不要再匯款。','open');endTalk();return}
 await say('小安','阿明，我問清楚了。那個基金，[[保證高報酬、保證保本、拉人頭]]三個警訊全中。','think');
 await say('阿明','真的假的……那我現在該怎麼辦？','worry');
 while(true){
  const i=await ask('阿明','你覺得我該怎麼做？',['先別匯款，也別再拉人；我們一起打 165 查證','先小額試試看，沒問題再加碼','不關我的事，你自己決定'],'worry');
  if(i===0)break;S.mistakes++;
  if(i===1)await say('阿明','可是……小額也是把錢交出去了，而且一開始有領到錢，很可能只是誘餌，讓人願意加碼。','think');
  else await say('阿明','你不幫我嗎……朋友之間，不是應該互相提醒嗎？','worry');
 }
 learn('call165');
 await say('阿明','好，我現在就[[撥 165]] 問問看，也不拉朋友了。謝謝你，小安！','open');
 await say('','（阿明收回了匯款的念頭，小安也完成了所有任務。）');
 endTalk();await chapterClear(1);
}
async function clerkTalk(){
 startTalk();
 if(!S.m.ticket){await say('林小姐','歡迎光臨幸福銀行～請先到旁邊的[[取號機]]抽一張號碼牌，我們再為您服務喔。','smile');endTalk();return}
 if(!S.greeted){S.greeted=true;S.called='A027';bump(10);
  await say('林小姐','[[A027]] 號的客人，請到 2 號窗口～您好，我是櫃台的林小姐，今天想辦理什麼呢？','smile');
  await say('小安','我朋友邀我投資一個「共享基金」，我想先問清楚，可以嗎？','worry');
  await say('林小姐','當然可以！我會把問題整理成[[諮詢紀錄]]：有[[當場說明]]的，也有需要[[後續回覆]]的，最後請您確認再簽名。','smile')}
 while(true){
  const opts=QA.map(q=>(S.asked.has(q.id)?'✓ ':'')+q.q),ids=QA.map(q=>q.id);
  if(S.asked.size>=3&&!S.m.record){opts.push('請幫我整理諮詢紀錄，我要確認');ids.push('rec')}
  opts.push('💬 自由提問（查詢知識庫）');ids.push('free');
  opts.push('📖 翻閱法規手冊');ids.push('manual');
  opts.push('先到這裡，謝謝');ids.push('bye');
  const i=await ask('林小姐',S.asked.size?'還有什麼想了解的嗎？':'請問想先了解什麼呢？',opts,'smile'),id=ids[i];
  if(id==='bye'){await say('林小姐',S.m.record?'慢走～有後續回覆我們會聯絡您。':'好的，想到問題隨時回來找我。','smile');break}
  if(id==='rec'){await recordFlow();continue}
  if(id==='free'){await freeAskOv();continue}
  if(id==='manual'){await manualOv();continue}
  const q=QA.find(x=>x.id===id);
  await say('小安',q.q.replace(/^✓ /,''),'think');
  for(const a of q.a)await say('林小姐',a[0],a[1]);
  await say('','（'+(q.type==='now'?'已記錄為「當場說明」':'已記錄為「後續回覆」')+'）');
  S.asked.add(id);if(q.learn)learn(q.learn);bump(10);
  if(S.asked.size>=3&&!S.m.consult){finish('consult');await say('林小姐','您問得很仔細！需要的話，我可以幫您把剛才的內容整理成[[諮詢紀錄]]。','smile')}
 }
 endTalk();
}
async function recordFlow(){
 await say('林小姐','好的，我整理好了。簽名前先確認一下——您覺得，在這份紀錄上簽名代表什麼呢？','think');
 while(true){
  const i=await ask('林小姐','簽名代表什麼？',['代表我同意加入那檔基金','代表我確認這份紀錄和剛才談的內容相符','代表我授權銀行幫我投資'],'think');
  if(i===1)break;S.mistakes++;
  await say('林小姐','不是喔。簽名[[只代表確認紀錄內容]]，不代表同意購買、加入或授權任何事。再想想看？','worry');
 }
 learn('sign');
 await say('林小姐','答對了！請看這份紀錄，三項都確認後再簽名。','smile');
 await signOv();
 finish('record');
 await say('林小姐','這是您的副本，請收好。[[後續回覆]]事項我們會依紀錄聯絡您。','smile');
 await say('林小姐','對了，出口旁的[[王警衛]]很懂防詐，建議您也請教他。','smile');
}
async function guardTalk(){
 startTalk();
 if(S.m.verify){await say('王警衛','記住啊：[[保證高報酬、保證保本、拉人頭]]，出現一個就先打 [[165]]！','smile');endTalk();return}
 await say('王警衛','歡迎！我是這裡的警衛王大哥。最近很多人被「高報酬」騙，我來考考你～','smile');
 while(true){
  const i=await ask('王警衛','遇到可疑的投資，可以撥哪支專線查證？',['110 報案專線','165 反詐騙諮詢專線','119 救護專線'],'smile');
  if(i===1)break;S.mistakes++;
  await say('王警衛',i===0?'110 是緊急報案用的。要[[查證與諮詢]]詐騙，專門的是另一支喔。':'119 是救護和消防。再想想～','worry');
 }
 await say('王警衛','沒錯！[[165 反詐騙諮詢專線]]，可以問「這是不是詐騙」。','open');
 while(true){
  const i=await ask('王警衛','朋友一直催你「今天就要決定」，最好怎麼做？',['先停下來，向可信管道查證','先匯一小筆試試看','把錢借給朋友讓他先投'],'think');
  if(i===0)break;S.mistakes++;
  await say('王警衛','催你快點決定，正是常見的手法。越急，越要[[停下來查證]]。','worry');
 }
 learn('call165');
 await say('王警衛','答對了！你已經是防詐小達人。','open');
 finish('verify');endTalk();
}
async function kioskUse(){
 startTalk();
 if(S.m.ticket)await say('','（你已經抽過號碼牌了：[[A027]]。現在叫到 '+S.called+'。）');
 else{await say('','（你按下「取號」，機器吐出一張號碼牌：[[A027]]。目前叫到 A024。）');finish('ticket')}
 endTalk();
}
async function enterBank(){
 if(!S.m.ming){startTalk();await say('小安','（先聽聽阿明怎麼說吧，他在廣場上。）','think');endTalk();return}
 warp('bank',480,478,'u');
}
async function warp(sc,x,y,d){mode='busy';$('#fade').style.opacity=1;await sleep(330);scene=sc;P.x=x;P.y=y;P.dir=d;hud();$('#fade').style.opacity=0;await sleep(300);mode='world'}
function act(s){
 if(s.mi!=null)chTalk(s.ch,s.mi);else if(s.id==='kb')kbUse();else if(s.id==='ming')mingTalk();else if(s.id==='door')enterBank();else if(s.id==='kiosk')kioskUse();else if(s.id==='clerk')clerkTalk();else if(s.id==='guard')guardTalk();
 else if(s.id==='board'){posterOv()}else if(s.id==='exit')warp('town',702,422,'d');
}
const scoreOf=m=>Math.max(0,1000-20*m);
async function ending(){
 const m=S.mistakes,sc=scoreOf(m),rank=m<=4?['🥇','金融守護者']:m<=12?['🥈','防詐小達人']:['🥉','努力小幫手'];
 await sync({finished:true,rank:rank[1]});
 const sec=(t,keys)=>`<h3>${t}</h3><ul>${keys.map(k=>`<li>${esc(lt(k))}</li>`).join('')}</ul>`;
 const all=sec('第 1 章・'+CHS[0].short,CH1_KEYS)+CHS.slice(1).map(C=>sec(`第 ${C.id} 章・${C.short}`,C.mids)).join('');
 await showOv(`<div class="medal">${rank[0]}</div><h2 style="text-align:center">全部 ${CHS.length} 章通關！</h2><p style="text-align:center;margin:0">稱號：<b>${rank[1]}</b></p><div class="score"><b>${sc}</b><span>分（滿分 1000，答錯 ${m} 次扣 ${m*20} 分）</span></div>${all}<p style="color:#6d5a40;font-size:13px">本遊戲為教育用的虛構情境，不是法律意見；個案請洽律師或撥 165。</p><div class="row"><button class="b" id="torank" type="button">結束遊戲，看排名</button></div>`,()=>{$('#torank').onclick=()=>{closeOv();gameOver(sc,rank)}});
}
async function gameOver(sc,rank){
 let lb=null;
 try{const q=PLAYER?`?id=${PLAYER.id}&token=${encodeURIComponent(PLAYER.token)}`:'';const r=await fetch('/api/leaderboard'+q);if(r.ok)lb=await r.json()}catch(e){}
 const rows=lb&&lb.top.length?lb.top.map(r=>`<tr class="${r.me?'me':''}"><td>${r.rank<=3?['🥇','🥈','🥉'][r.rank-1]:r.rank}</td><td>${esc(r.name)}${r.me?'（你）':''}</td><td>${r.score}</td></tr>`).join(''):'';
 const mine=lb&&lb.me?`<p style="text-align:center;margin:6px 0">你目前是第 <b>${lb.me.rank}</b> 名（共 ${lb.total} 人通關）</p>`:'';
 const body=lb?(rows?`<table class="rk"><thead><tr><th>名次</th><th>玩家</th><th>分數</th></tr></thead><tbody>${rows}</tbody></table>${mine}`:'<p style="text-align:center">還沒有排名資料。</p>'):'<p style="text-align:center;color:#6d5a40">目前無法連線到排名（需用 python app.py 啟動後端）。</p>';
 await showOv(`<h2 style="text-align:center">🏁 遊戲結束</h2><p style="text-align:center;margin:0">${esc(PNAME)}　${rank[0]} ${rank[1]}　<b>${sc}</b> 分</p><h3>目前排名</h3>${body}<p style="color:#6d5a40;font-size:12px;text-align:center">同分時，先通關的排在前面。</p><div class="row"><button class="b" id="again" type="button">再玩一次</button><button class="b" id="tohome" type="button">回到首頁</button></div>`,()=>{$('#again').onclick=()=>{closeOv();begin()};$('#tohome').onclick=()=>location.reload()});
}
async function begin(){
 const raw=($('#pname').value||'').replace(/\s+/g,' ').trim();
 if(!raw||raw.length>12){$('#perr').textContent=raw?'名稱最多 12 個字。':'請先輸入你的名稱。';$('#pname').focus();return}
 $('#perr').textContent='';PNAME=raw;
 const old=savedPlayer();PLAYER=null;
 try{const r=await fetch('/api/player',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:raw,id:old&&old.id,token:old&&old.token})});
  if(r.ok){PLAYER=await r.json();PNAME=PLAYER.name;savePlayer({id:PLAYER.id,token:PLAYER.token,name:PLAYER.name})}
  else savePlayer({name:raw})}catch(e){savePlayer({name:raw})}
 resetState();scene='town';P.x=150;P.y=455;P.dir='r';keys={};hud();$('#title').hidden=true;$('#mapb').hidden=false;mode='busy';
 await showStory();
 await navigate({first:true});
}

/* ===== 前情提要與闖關地圖 ===== */
const STORY=[
 '週六上午，小安的手機響了。朋友[[阿明]]傳來訊息：「快來廣場，我有好康要告訴你！」',
 '聽說有個「幸福共享基金」：投資 10 萬，[[每個月領 3 萬]]，還保證保本。阿明說名額有限，[[今天就要決定]]。',
 '小安覺得哪裡怪怪的，決定先到幸福銀行問清楚。接下來的旅程分成 [[5 個章節]]，每章 5 關，一路識破各種金融陷阱。'
];
const svgWrap=b=>`<svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb2d6"/><stop offset="1" stop-color="#f3dfae"/></linearGradient></defs><rect width="400" height="225" fill="url(#sky)"/>${b}</svg>`;
const ART=[
 svgWrap(`<rect y="170" width="400" height="55" fill="#8fbf84"/><rect x="130" y="22" width="140" height="190" rx="18" fill="#222"/><rect x="138" y="36" width="124" height="162" rx="8" fill="#f4efe2"/><circle cx="160" cy="62" r="11" fill="#e0a56a"/><rect x="178" y="52" width="76" height="22" rx="10" fill="#d8f0c8"/><text x="184" y="67" font-size="10" fill="#2d2114">快來廣場！</text><rect x="152" y="84" width="96" height="22" rx="10" fill="#d8f0c8"/><text x="158" y="99" font-size="10" fill="#2d2114">我有好康要說！</text><rect x="152" y="116" width="52" height="18" rx="9" fill="#fff"/><text x="160" y="129" font-size="10" fill="#888">…</text><g transform="translate(300 40)"><circle r="16" fill="#ffd36e" stroke="#7a4a28" stroke-width="3"/><text y="6" text-anchor="middle" font-size="18" font-weight="900" fill="#7a4a28">!</text></g>`),
 svgWrap(`<rect y="175" width="400" height="50" fill="#b99a62"/><rect x="95" y="28" width="210" height="160" rx="6" fill="#fff8e2" stroke="#7a4a28" stroke-width="4"/><text x="200" y="62" text-anchor="middle" font-size="20" font-weight="900" fill="#5b371d">幸福共享基金</text><text x="200" y="96" text-anchor="middle" font-size="16" fill="#2d2114">投資 10 萬</text><text x="200" y="118" text-anchor="middle" font-size="14" fill="#7a4a28">↓</text><text x="200" y="146" text-anchor="middle" font-size="22" font-weight="900" fill="#c0392b">每月領 3 萬</text><text x="200" y="170" text-anchor="middle" font-size="13" fill="#2d2114">保證保本・隨時可領回</text><g transform="rotate(-14 300 60)"><rect x="262" y="42" width="92" height="30" rx="4" fill="none" stroke="#c0392b" stroke-width="3"/><text x="308" y="63" text-anchor="middle" font-size="14" font-weight="900" fill="#c0392b">今天決定</text></g>`),
 svgWrap(`<rect y="180" width="400" height="45" fill="#b8b2a6"/><polygon points="90,72 200,34 310,72" fill="#7a4a28"/><rect x="100" y="72" width="200" height="14" fill="#e9dcc0"/><g fill="#f4ead2" stroke="#a9803a" stroke-width="2"><rect x="112" y="90" width="20" height="82"/><rect x="152" y="90" width="20" height="82"/><rect x="228" y="90" width="20" height="82"/><rect x="268" y="90" width="20" height="82"/></g><rect x="100" y="172" width="200" height="12" fill="#e9dcc0"/><rect x="182" y="112" width="36" height="60" rx="3" fill="#3a2312"/><text x="200" y="64" text-anchor="middle" font-size="13" font-weight="900" fill="#f6dc9b">幸福銀行</text><circle cx="344" cy="150" r="14" fill="#f2c9a0"/><rect x="332" y="164" width="24" height="34" rx="8" fill="#1f3a58"/><text x="344" y="100" text-anchor="middle" font-size="30" font-weight="900" fill="#fff" stroke="#2a180c" stroke-width="2">?</text>`)
];
function showPage(id){$('#stage').classList.add('paged');['story','chmap','gmap'].forEach(k=>{$('#'+k).hidden=k!==id});mode='menu'}
function hidePages(){$('#stage').classList.remove('paged');['story','chmap','gmap'].forEach(k=>{$('#'+k).hidden=true})}
let menuKeyH=null;
function showStory(){return new Promise(res=>{
 let i=0;const N=STORY.length;
 const draw=()=>{$('#st-art').innerHTML=ART[i];$('#st-no').textContent=`前情提要　${i+1} / ${N}`;
  $('#st-tx').innerHTML=parse(STORY[i]).segs.map(s=>s.h?`<span class="hl">${esc(s.t)}</span>`:esc(s.t)).join('');
  $('#st-dots').innerHTML=STORY.map((_,k)=>`<i class="${k===i?'on':''}"></i>`).join('');$('#st-next').textContent=i===N-1?'看章節地圖':'下一頁'};
 const end=()=>{menuKeyH=null;res()};
 const next=()=>{if(i>=N-1)end();else{i++;draw()}};
 $('#st-next').onclick=next;$('#st-skip').onclick=end;
 menuKeyH=k=>{if(k==='enter'||k===' '||k==='z'||k==='arrowright')next();else if(k==='escape')end();else if(k==='arrowleft'&&i>0){i--;draw()}};
 showPage('story');draw();$('#st-next').focus({preventScroll:true})})}

/* ===== 章節資料：第 1 章在程式裡，第 2～5 章由 /api/chapters 載入 ===== */
const MAPPOS=[[11,68],[31,36],[50,66],[69,36],[87,64]];
const STG=[
 {id:'ming',name:'識破邀約',place:'幸福鎮・中央廣場',desc:'聽阿明說完邀約，找出「高報酬」的三大警訊。',hint:'走到阿明旁邊，按 Z／Enter／A 對話。',sc:'town',x:260,y:455,d:'r'},
 {id:'ticket',name:'領取號碼牌',place:'幸福銀行・大廳',desc:'走進銀行，到取號機抽一張號碼牌。',hint:'取號機在大廳左邊，靠近後按 A。',sc:'bank',x:225,y:452,d:'l'},
 {id:'consult',name:'向櫃台諮詢',place:'幸福銀行・2 號窗口',desc:'向林小姐提問，至少問 3 個問題（也可以自由提問、翻法規手冊）。',hint:'走到櫃台前，按 A 和林小姐對話。',sc:'bank',x:660,y:360,d:'u'},
 {id:'record',name:'簽名前確認',place:'幸福銀行・2 號窗口',desc:'請林小姐整理諮詢紀錄，確認內容相符再簽名。',hint:'問完 3 題後，在櫃台選「整理諮詢紀錄」。',sc:'bank',x:660,y:360,d:'u'},
 {id:'verify',name:'學會查證',place:'幸福銀行・大廳',desc:'向王警衛學會「可疑投資該打哪支專線」。',hint:'走到警衛旁邊，按 A 對話。',sc:'bank',x:790,y:440,d:'r'}
].map((s,i)=>Object.assign(s,{px:MAPPOS[i][0],py:MAPPOS[i][1]}));
const CHS=[{id:1,title:'幸福銀行・識破高報酬',short:'識破高報酬',scene:'bank',place:'幸福銀行',law:'銀行法／民法',fraud:'高報酬吸金',stages:STG,mids:MIS.map(m=>m[0])}];
const MISN={},CL={},SCENE_CH={town:1,bank:1};
MIS.forEach(m=>MISN[m[0]]=m[1]);
const SCN={ // 第 2～5 章場景：可走範圍、擋住的家具、查詢站位置
 loan:{b:[40,345,920,515],rects:[[560,296,240,62],[390,334,114,46],[50,296,180,48],[786,430,48,80]],kb:[810,505]},
 cafe:{b:[40,345,920,515],rects:[[500,284,424,64],[118,420,104,44],[78,424,44,90]],kb:[100,505]},
 wealth:{b:[40,345,920,515],rects:[[50,292,244,62],[878,424,44,90]],kb:[900,505]},
 hall:{b:[40,345,920,515],rects:[[50,296,204,56],[58,424,44,90]],kb:[80,505]}
};
const chOf=sc=>SCENE_CH[sc]||1;
const chDone=ch=>CHS[ch-1]?CHS[ch-1].mids.filter(id=>S.m[id]).length:0;
const chCleared=ch=>!!CHS[ch-1]&&chDone(ch)===5;
const chUnlocked=ch=>ch===1||(!!CHS[ch-1]&&chCleared(ch-1));
const lt=k=>LEARN[k]||CL[k]||'';
function curIdx(C){return C.ms.findIndex(m=>!S.m[m.id])}
function registerChapters(d){
 Object.entries(d.cast||{}).forEach(([n,l])=>{LOOK[n]=l;WHO[n]=l});
 d.chapters.forEach(ch=>{
  const ms=ch.missions;
  const stages=ms.map((m,i)=>({id:m.id,name:m.name,place:ch.place,desc:m.desc,hint:m.hint,sc:ch.scene,x:m.stand[0],y:m.stand[1],d:m.stand[2],px:MAPPOS[i][0],py:MAPPOS[i][1]}));
  const C=Object.assign({},ch,{stages,mids:ms.map(m=>m.id),ms});
  C.npcs=ms.map((m,i)=>m.obj?null:{id:m.id,idx:i,x:m.x,y:m.y,look:LOOK[m.npc],dir:'d',ph:i*.7,solid:1,sc:1,face:1});
  ms.forEach(m=>{MISN[m.id]=m.name;CL[m.id]=m.learn});
  CHS[ch.id-1]=C;SCENE_CH[ch.scene]=ch.id;
  const g=SCN[ch.scene];
  SC[ch.scene]={b:g.b,rects:g.rects,npcs:()=>{const cur=curIdx(C),lim=cur<0?ms.length-1:cur;return C.npcs.filter(n=>n&&n.idx<=lim)}};
 });
}
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};

/* ===== 章節選擇頁 ===== */
function showChapters(o){o=o||{};return new Promise(res=>{
 const total=5,cleared=[1,2,3,4,5].filter(chCleared).length;
 let sel=Math.max(0,[1,2,3,4,5].findIndex(c=>chUnlocked(c)&&!chCleared(c)));if(sel<0)sel=0;
 $('#cs-prog').textContent=`${PNAME}的冒險　已通關 ${cleared} / ${total} 章`;$('#cs-back').hidden=!o.back;
 const draw=()=>{$('#cs-list').innerHTML=[1,2,3,4,5].map(n=>{const C=CHS[n-1],un=chUnlocked(n),cl=chCleared(n);
  const st=!C?'lock':cl?'done':un?'cur':'lock';
  return `<button type="button" class="cs-c ${st}${n-1===sel?' sel':''}" data-n="${n}" aria-label="第 ${n} 章 ${C?C.short:'尚未載入'}${cl?'，已通關':un?'':'，尚未解鎖'}"><span class="cs-n">${cl?'✓':un?n:'🔒'}</span><b>第 ${n} 章</b><span class="cs-t">${esc(C?C.short:'（需啟動後端）')}</span><span class="cs-l">${esc(C?C.law:'')}</span><span class="cs-f">${C&&un?`${chDone(n)} / 5 關`:C?`先通關第 ${n-1} 章`:''}</span></button>`}).join('');
  const C=CHS[sel],n=sel+1,un=chUnlocked(n);
  $('#cs-ti').textContent=C?`第 ${n} 章・${C.title}`:`第 ${n} 章`;
  $('#cs-ds').textContent=C?`場景：${C.place}　　主題：${C.law}　　小心：${C.fraud}`:'第 2～5 章的內容由後端提供，請用 python app.py 啟動後再開啟。';
  const go=$('#cs-go');go.disabled=!(C&&un);go.textContent=C&&chCleared(n)?'重新挑戰':'前往';
 };
 const done_=v=>{menuKeyH=null;res(v)};
 $('#cs-list').onclick=e=>{const b=e.target.closest('.cs-c');if(!b)return;sel=+b.dataset.n-1;draw();if(e.detail>1&&!$('#cs-go').disabled)done_(sel+1)};
 $('#cs-go').onclick=()=>{if(!$('#cs-go').disabled)done_(sel+1)};
 $('#cs-back').onclick=()=>done_(null);
 menuKeyH=k=>{if(k==='arrowright'||k==='arrowdown'){sel=Math.min(4,sel+1);draw()}else if(k==='arrowleft'||k==='arrowup'){sel=Math.max(0,sel-1);draw()}
  else if(k==='enter'||k===' '||k==='z'){if(!$('#cs-go').disabled)done_(sel+1)}else if(k==='escape'&&o.back)done_(null)};
 showPage('chmap');draw();$('#cs-go').focus({preventScroll:true})})}

/* ===== 關卡地圖（每章 5 關）===== */
const stgState=(ch,i)=>{const C=CHS[ch-1],S_=C.stages;return S.m[S_[i].id]?'done':(i===0||S.m[S_[i-1].id])?(S_.findIndex(s=>!S.m[s.id])===i?'cur':'open'):'lock'};
function showMap(o){o=o||{};const ch=o.ch||1,C=CHS[ch-1],ST=C.stages;return new Promise(res=>{
 let sel=Math.max(0,ST.findIndex(s=>!S.m[s.id]));
 const n=chDone(ch),all=n===5;if(all)sel=0;
 $('#gm-prog').textContent=`第 ${ch} 章・${C.short}　已通關 ${n} / 5`;$('#gm-back').hidden=!o.back;$('#gm-chs').hidden=!o.chs;
 const Q=ST.map(s=>[s.px*9.6,s.py*5.4]);
 const seg=(a,b)=>{const mx=(a[0]+b[0])/2;return `C ${mx} ${a[1]}, ${mx} ${b[1]}, ${b[0]} ${b[1]}`};
 let d=`M ${Q[0][0]} ${Q[0][1]}`,dn=d,any=false;
 for(let k=1;k<Q.length;k++){d+=' '+seg(Q[k-1],Q[k]);if(S.m[ST[k-1].id]){dn+=' '+seg(Q[k-1],Q[k]);any=true}}
 $('#gm-path').innerHTML=`<path d="${d}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="22" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#a9803a" stroke-width="7" stroke-dasharray="3 16" stroke-linecap="round"/>${any?`<path d="${dn}" fill="none" stroke="#3f9a55" stroke-width="9" stroke-linecap="round"/>`:''}`;
 $('#gm-nodes').innerHTML=ST.map((s,i)=>{const st=stgState(ch,i);return `<button type="button" class="gm-n ${st==='done'?'done':st==='lock'?'lock':st==='cur'?'cur':''}" data-i="${i}" style="left:${s.px}%;top:${s.py}%" aria-label="第 ${i+1} 關 ${s.name}${st==='done'?'，已通關':st==='lock'?'，尚未解鎖':''}"><span class="gm-c">${st==='done'?'✓':st==='lock'?'🔒':i+1}</span><span class="gm-l">${esc(s.name)}</span></button>`}).join('')
  +`<div class="gm-flag" style="left:93%;top:30%">🏁<br>${all?'本章通關！':'終點'}</div>`;
 const info=()=>{const s=ST[sel],st=stgState(ch,sel);
  document.querySelectorAll('.gm-n').forEach(b=>b.classList.toggle('sel',+b.dataset.i===sel));
  $('#gi-t').textContent=`第 ${sel+1} 關・${s.name}`;
  $('#gi-d').textContent=`${s.place}　${s.desc}`;
  $('#gi-h').textContent=st==='lock'?`先完成第 ${sel} 關「${ST[sel-1].name}」才會解鎖。`:st==='done'?'已通關，可以回去再看一次。':'提示：'+s.hint;
  const go=$('#gi-go');go.disabled=st==='lock';go.textContent=st==='done'?'再訪此關':'出發'};
 const finishMap=v=>{menuKeyH=null;res(v)};
 $('#gm-nodes').onclick=e=>{const b=e.target.closest('.gm-n');if(!b)return;sel=+b.dataset.i;info()};
 $('#gi-go').onclick=()=>{if(stgState(ch,sel)!=='lock')finishMap(sel)};
 $('#gm-back').onclick=()=>finishMap(null);
 $('#gm-chs').onclick=()=>finishMap('chs');
 menuKeyH=k=>{if(k==='arrowright'||k==='arrowdown'){sel=Math.min(4,sel+1);info()}else if(k==='arrowleft'||k==='arrowup'){sel=Math.max(0,sel-1);info()}
  else if(k==='enter'||k===' '||k==='z'){if(stgState(ch,sel)!=='lock')finishMap(sel)}else if(k==='escape'){finishMap(o.back?null:'chs')}};
 showPage('gmap');info();$('#gi-go').focus({preventScroll:true})})}

/* ===== 路線：章節選擇 → 關卡地圖 → 出發 ===== */
async function navigate(o){
 let ch=o.first?1:chOf(scene),pg=o.page||(o.first?'chs':'map');
 for(;;){
  if(pg==='chs'){const c=await showChapters({back:!o.first});if(c==null){hidePages();mode='world';return}ch=c;pg='map'}
  const r=await showMap({ch,back:!o.first,chs:true});
  if(r==='chs'){pg='chs';continue}
  if(r==null){hidePages();mode='world';return}
  await startStage(ch,r);return}
}
async function startStage(ch,i){
 const C=CHS[ch-1],s=C.stages[i];hidePages();
 await warp(s.sc,s.x,s.y,s.d);
 if(ch>1&&!S.seen[ch]){S.seen[ch]=1;startTalk();for(const t of C.intro||[])await say('',t);endTalk()}
 if(!S.hinted){S.hinted=1;startTalk();await say('','（移動：方向鍵／WASD 或畫面上的按鈕。靠近人物或物件，出現「A」提示時按 Z／Enter／A 互動。地圖可隨時用左上角「地圖」或 G 鍵開啟。）');endTalk()}
 toast(`第 ${ch} 章・第 ${i+1} 關：${s.name}`)}
async function openMap(pg){
 if(mode!=='world')return;
 mode='busy';await navigate({page:pg||'map'})}

/* ===== 第 2～5 章：和人物對話、答題、通關 ===== */
async function chTalk(ch,idx){
 const C=CHS[ch-1],m=C.ms[idx];startTalk();
 if(S.m[m.id]){await say(m.npc||'',m.again||'……',m.npc?'smile':'');endTalk();return}
 for(const l of m.intro)await say(l[0],l[1],l[2]);
 for(const q of m.quiz||[]){
  const who=q.who||m.npc||'小安',ord=shuffle(q.opts.map((_,i)=>i));
  while(true){
   const i=await ask(who,q.q,ord.map(k=>q.opts[k][0]),q.mood||'think'),k=ord[i];
   if(k===q.ok)break;
   S.mistakes++;const fb=q.opts[k][1];
   await say(who,who==='小安'?'（'+fb+'）':fb,who==='小安'?'think':'worry');
  }
 }
 for(const l of m.outro||[])await say(l[0],l[1],l[2]);
 learn(m.id);finish(m.id);endTalk();
 if(idx===C.ms.length-1)await chapterClear(ch);
}
async function kbUse(){
 startTalk();
 const i=await ask('','這是「金融小百科」查詢站，想怎麼查？',['💬 自由提問（問任何金融問題）','📖 翻閱法規手冊','先不用了'],'smile');
 if(i===0)await freeAskOv();else if(i===1)await manualOv();
 endTalk();
}
const CH1_KEYS=['flags','art29','rate','deposit','sign','call165'];
async function chapterClear(ch){
 const C=CHS[ch-1];if(S.cleared[ch])return;S.cleared[ch]=1;
 const prev=Object.values(S.chm).reduce((a,b)=>a+b,0);S.chm[ch]=S.mistakes-prev;sync();
 if(ch===5){ending();return}
 const mk=S.chm[ch],medal=mk<=1?'🥇':mk<=3?'🥈':'🥉';
 const keys=ch===1?CH1_KEYS:C.mids,pts=keys.map(k=>`<li>${esc(lt(k))}</li>`).join('');
 const next=CHS[ch],canNext=!!next;
 await showOv(`<div class="medal">${medal}</div><h2 style="text-align:center">第 ${ch} 章通關！</h2><p style="text-align:center;margin:0"><b>${esc(C.title)}</b>（本章答錯 ${mk} 次）</p><h3>這一章學到的重點</h3><ul>${pts}</ul><p style="color:#6d5a40;font-size:13px">${canNext?`下一章：第 ${ch+1} 章・${esc(next.title)}。按「前往下一章」，或到地圖挑戰。`:'第 2～5 章的內容需要後端提供；請用 python app.py 啟動後再繼續。'}</p><div class="row">${canNext?'<button class="b" id="nxch" type="button">前往下一章</button>':''}<button class="b" data-close type="button">留在這裡</button></div>`,()=>{
  const b=$('#nxch');if(b)b.onclick=()=>{closeOv();setTimeout(()=>openMap('chs'),60)}});
}

/* ===== 輸入 ===== */
function pressA(){
 if(mode==='talk'){choices?pick(choices.sel):advance()}
 else if(mode==='world'){const s=nearest();if(s)act(s)}
 else if(mode==='ov'){const b=$('#card [data-close]');if(b&&$('#ov').contains(b))closeOv()}
}
function nav(d){if(mode==='talk'&&choices){choices.sel=(choices.sel+d+choices.opts.length)%choices.opts.length;drawChoices()}}
addEventListener('keydown',e=>{
 const k=e.key.toLowerCase();if(mode==='title')return;
 if(mode==='menu'){if(menuKeyH){if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();menuKeyH(k)}return}
 if(mode==='ov'){if(k==='escape')closeOv();return}
 if(['arrowup','arrowdown','arrowleft','arrowright',' ','tab'].includes(k))e.preventDefault();
 keys[k]=1;if(e.repeat)return;
 if(k==='z'||k==='enter'||k===' ')pressA();
 else if(k==='g')openMap();
 else if(k==='m'||k==='x'||k==='escape')openMissions();
 else if(k==='arrowup'||k==='w')nav(-1);else if(k==='arrowdown'||k==='s')nav(1);
});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=0});
addEventListener('blur',()=>{keys={}});
$('#ch').addEventListener('pointerup',e=>{const b=e.target.closest('button');if(b){e.preventDefault();pick(+b.dataset.i)}});
$('#ch').addEventListener('pointermove',e=>{const b=e.target.closest('button');if(b&&choices&&+b.dataset.i!==choices.sel){choices.sel=+b.dataset.i;drawChoices()}});
$('#box').addEventListener('pointerup',()=>{if(mode==='talk'&&!choices)advance()});
$('#dp').addEventListener('contextmenu',e=>e.preventDefault());
document.querySelectorAll('#dp button').forEach(b=>{const k=b.dataset.k;
 b.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=1;if(k==='arrowup')nav(-1);if(k==='arrowdown')nav(1)});
 ['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,()=>{keys[k]=0}))});
$('#ba').addEventListener('pointerdown',e=>{e.preventDefault();pressA()});
$('#bm').addEventListener('click',openMissions);
$('#mapb').addEventListener('click',()=>openMap());
$('#med').addEventListener('click',openMissions);
$('#start').addEventListener('click',begin);
$('#pname').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')begin()});
{const sp=savedPlayer();if(sp&&sp.name)$('#pname').value=sp.name}

/* ===== 啟動 ===== */
const cv=$('#cv');cv.width=W*DPR;cv.height=H*DPR;const ctx=cv.getContext('2d');
resetState();buildAll();hud();requestAnimationFrame(frame);
// 從後端（SQLite）載入題目與重點；連不上時沿用上面內建的預設內容
fetch('/api/content').then(r=>r.ok?r.json():null).then(d=>{if(d&&d.qa&&d.qa.length){QA=d.qa;LEARN=d.learn}}).catch(()=>{});
if(document.fonts&&document.fonts.load){Promise.race([Promise.all([document.fonts.load('900 20px "Noto Serif TC"','幸福銀行小鎮咖啡防詐三警訊'),document.fonts.ready]),sleep(2500)]).then(buildAll).catch(()=>{})}
fetch('/api/chapters').then(r=>r.ok?r.json():null).then(d=>{if(d&&d.chapters&&d.chapters.length)registerChapters(d)}).catch(()=>{});
window.G={S:()=>S,warp,P,say,mode:()=>mode,openMap,navigate,CHS:()=>CHS,scene:()=>scene};
})();

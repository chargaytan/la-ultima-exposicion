// Panteón de tinta — arte del juego dibujado con código.
// Personajes en vista cenital pura (se giran hacia donde miran, mirando a +x).
// Arquitectura en vista oblicua desde arriba: se ve el techo y la cara sur.
// Unidades: 1 = 1 px del plano del juego. El origen de cada pieza es su base.
(function(){
'use strict';
const PAL={tinta:'#0a0e0d',noche:'#121a18',musgo:'#1f2a27',niebla:'#4b5e57',salvia:'#7f938b',
  hueso:'#d9d1bc',piedra:'#a39b87',piedraOsc:'#5c584c',ambar:'#f0b45a',ojo:'#f5ecaa'};

function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

function blobPath(c,cx,cy,rx,ry,seed,jit=.12,n=20,rot=0){
  const r=rng(seed),P=[],cr=Math.cos(rot),sr=Math.sin(rot);
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2,k=1+(r()*2-1)*jit,x=Math.cos(a)*rx*k,y=Math.sin(a)*ry*k;P.push([cx+x*cr-y*sr,cy+x*sr+y*cr])}
  const m=(p,q)=>[(p[0]+q[0])/2,(p[1]+q[1])/2];c.beginPath();const s=m(P[n-1],P[0]);c.moveTo(s[0],s[1]);
  for(let i=0;i<n;i++){const q=m(P[i],P[(i+1)%n]);c.quadraticCurveTo(P[i][0],P[i][1],q[0],q[1])}c.closePath();
}
function roughPoly(c,pts,seed,jit=1,closed=true){
  const r=rng(seed),out=[],N=pts.length-(closed?0:1);
  for(let i=0;i<N;i++){const p=pts[i],q=pts[(i+1)%pts.length],L=Math.hypot(q[0]-p[0],q[1]-p[1]),k=Math.max(1,Math.round(L/5));
    for(let j=0;j<k;j++){const t=j/k;out.push([p[0]+(q[0]-p[0])*t+(r()*2-1)*jit,p[1]+(q[1]-p[1])*t+(r()*2-1)*jit])}}
  if(!closed)out.push(pts[pts.length-1]);
  c.beginPath();out.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));if(closed)c.closePath();
}
// pinceladas cortas dentro del recorte actual
function brush(c,seed,box,col,n,len,ang,al,wd){
  const r=rng(seed),[x0,y0,x1,y1]=box;c.save();c.strokeStyle=col;c.lineCap='round';
  for(let i=0;i<n;i++){const x=x0+r()*(x1-x0),y=y0+r()*(y1-y0),a=ang+(r()-.5)*.7,l=len*(.5+r());
    c.globalAlpha=al*(.45+r()*.55);c.lineWidth=wd*(.6+r()*.8);c.beginPath();c.moveTo(x,y);
    c.quadraticCurveTo(x+Math.cos(a)*l*.5+(r()-.5)*l*.35,y+Math.sin(a)*l*.5+(r()-.5)*l*.35,x+Math.cos(a)*l,y+Math.sin(a)*l);c.stroke()}
  c.restore();
}
// rellena una forma, le pinta textura y la contornea con tinta irregular
function paint(c,path,fill,o={}){
  c.save();path();c.fillStyle=fill;c.fill();
  if(o.box){c.clip();const s=o.seed||1;
    if(o.dark)brush(c,s+7,o.box,o.dark,o.n||14,o.len||6,o.ang??-.6,.4,o.w||1.4);
    if(o.light)brush(c,s+3,o.box,o.light,Math.round((o.n||14)*.6),o.len||6,o.ang??-.6,.32,o.w||1.2)}
  c.restore();
  if(o.ink){c.save();path();c.strokeStyle=PAL.tinta;c.lineWidth=o.ink;c.lineJoin='round';c.globalAlpha=.9;c.stroke();c.restore()}
}
function shadow(c,x,y,rx,ry,al){c.save();c.translate(x,y);c.scale(1,ry/rx);const g=c.createRadialGradient(0,0,0,0,0,rx);
  g.addColorStop(0,`rgba(0,0,0,${al})`);g.addColorStop(.7,`rgba(0,0,0,${al*.6})`);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,rx,0,7);c.fill();c.restore()}
// dos ojos que brillan, separados en perpendicular a la mirada
function eyes(c,x,y,sep,r,al=1){
  for(const s of[-1,1]){const g=c.createRadialGradient(x,y+s*sep,0,x,y+s*sep,r*6);
    g.addColorStop(0,`rgba(245,236,170,${.5*al})`);g.addColorStop(1,'rgba(245,236,170,0)');c.fillStyle=g;c.fillRect(x-r*6,y+s*sep-r*6,r*12,r*12);
    c.fillStyle=`rgba(255,251,222,${al})`;c.beginPath();c.arc(x,y+s*sep,r,0,7);c.fill()}
}
function remolino(c,x,y,R,t,al){
  c.save();c.translate(x,y);c.rotate(t*.15);c.strokeStyle=`rgba(127,147,139,${al})`;c.lineWidth=R*.05;c.lineCap='round';c.beginPath();
  for(let i=0;i<=60;i++){const a=i/60*Math.PI*3.4,r=R*(1-i/70);const px=Math.cos(a)*r,py=Math.sin(a)*r*.7;i?c.lineTo(px,py):c.moveTo(px,py)}c.stroke();c.restore();
}

/* ---------------- personajes (cenital, miran hacia +x) ---------------- */
function fotografo(c,o={}){
  const mv=o.moving?1:0,sw=Math.sin((o.phase||0)*Math.PI*2)*mv;
  shadow(c,0,0,10,9,.5);
  c.fillStyle='#161a19';for(const s of[-1,1]){c.beginPath();c.ellipse(sw*s*4.4+.5,s*2.9,3.1,1.8,0,0,7);c.fill()}
  // chamarra
  paint(c,()=>blobPath(c,-1,0,5.3,7.6,11,.06,18),'#6b5434',{box:[-7,-9,5,9],dark:'#2b2215',light:'#a3845a',n:22,len:4,ang:1.4,ink:.9,seed:5});
  // franja del periódico en la espalda
  c.fillStyle='rgba(217,209,188,.6)';c.fillRect(-5.6,-3.4,1.3,6.8);
  // brazos al frente
  const ax=o.shoot?7.6:5.6+sw*.5;c.strokeStyle='#54412a';c.lineWidth=2.5;c.lineCap='round';
  for(const s of[-1,1]){c.beginPath();c.moveTo(0,s*5.6);c.quadraticCurveTo(ax*.6,s*5.2,ax,s*2);c.stroke()}
  // cámara y lente
  paint(c,()=>roughPoly(c,[[ax-1.2,-3.1],[ax+2.6,-3.1],[ax+2.6,3.1],[ax-1.2,3.1]],31,.25),'#141615',{ink:.6});
  c.fillStyle='#3b4240';c.beginPath();c.arc(ax+3.5,0,1.7,0,7);c.fill();
  c.fillStyle='rgba(240,180,90,.75)';c.beginPath();c.arc(ax+3.9,-.5,.55,0,7);c.fill();
  // lámpara sujeta a la cámara
  c.fillStyle=PAL.ambar;c.beginPath();c.arc(ax+1,-3.6,.9,0,7);c.fill();
  // cabeza
  c.fillStyle='#3a2c1b';c.beginPath();c.arc(.6,0,4.5,0,7);c.fill();
  paint(c,()=>blobPath(c,1,0,3.9,3.7,41,.12,14),'#16120f',{box:[-3,-4,5,4],light:'#3d3126',n:10,len:2.5,ang:3.1,ink:.7,seed:13});
  if(o.shoot&&o.flash){const g=c.createRadialGradient(ax+4,0,0,ax+4,0,18);g.addColorStop(0,'rgba(255,253,240,.95)');g.addColorStop(1,'rgba(255,253,240,0)');c.fillStyle=g;c.fillRect(ax-14,-18,36,36)}
}
function errante(c,t,o={}){
  const al=o.alpha??1;c.save();c.globalAlpha=al;
  const g=c.createRadialGradient(-4,0,0,-4,0,26);g.addColorStop(0,'rgba(127,147,139,.22)');g.addColorStop(1,'rgba(127,147,139,0)');c.fillStyle=g;c.fillRect(-30,-26,52,52);
  // cabello que se arrastra como tinta
  const r=rng(77);c.strokeStyle=PAL.tinta;c.lineCap='round';
  for(let i=0;i<18;i++){const off=(r()-.5)*9,L=16+r()*14,ph=r()*6,w=.5+r()*1.6;c.lineWidth=w;c.globalAlpha=al*(.45+r()*.55);c.beginPath();c.moveTo(1,off*.35);
    for(let k=1;k<=7;k++){const s=k/7;c.lineTo(1-L*s,off*(.35+s*1.1)+Math.sin(t*2.1+ph+s*4)*2.8*s)}c.stroke()}
  c.globalAlpha=al;
  paint(c,()=>blobPath(c,-2,0,6,4,88,.2,16),'#0c1110',{});
  // brazos larguísimos que buscan
  c.strokeStyle='#0c1110';
  for(const s of[-1,1]){const reach=17+Math.sin(t*1.6+s)*2.5,mid=s*(8+Math.sin(t+s)*1.5),end=s*(4.5+Math.sin(t*1.3+s)*1.2);
    c.lineWidth=1.3;c.beginPath();c.moveTo(0,s*3.4);c.quadraticCurveTo(reach*.5,mid,reach,end);c.stroke();
    c.lineWidth=.5;for(let f=-2;f<=2;f++){c.beginPath();c.moveTo(reach,end);c.quadraticCurveTo(reach+2.5,end+f*.8,reach+4.5,end+f*1.4);c.stroke()}}
  paint(c,()=>blobPath(c,2,0,3.4,3.1,91,.12,12),'#080b0a',{});
  eyes(c,3.7,0,1.2,.55,al);
  c.restore();
}
function perro(c,t,o={}){
  const ph=o.phase||0,run=o.moving?1:0;shadow(c,0,0,14,7,.5);
  const leg=(x,y,p)=>{const s=Math.sin(ph*Math.PI*2+p)*3.4*run,ey=Math.sign(y)*6.6;c.strokeStyle='#130d09';c.lineWidth=1.5;c.lineCap='round';
    c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+s*.4,(y+ey)/2,x+s,ey);c.stroke();c.fillStyle='#130d09';c.beginPath();c.arc(x+s,ey,.9,0,7);c.fill()};
  leg(5,2.6,0);leg(5,-2.6,Math.PI);leg(-6,2.6,Math.PI);leg(-6,-2.6,0);
  c.strokeStyle='#1c140e';c.lineWidth=1.2;c.lineCap='round';c.beginPath();c.moveTo(-9,0);c.quadraticCurveTo(-12,Math.sin(t*5)*2.2,-15,Math.sin(t*5+1)*3.2);c.stroke();
  const body=()=>{c.beginPath();c.moveTo(7,-2.3);c.quadraticCurveTo(4,-3.7,1.5,-3.3);c.quadraticCurveTo(-2,-2.1,-4,-2.4);c.quadraticCurveTo(-8,-3.3,-9.6,0);
    c.quadraticCurveTo(-8,3.3,-4,2.4);c.quadraticCurveTo(-2,2.1,1.5,3.3);c.quadraticCurveTo(4,3.7,7,2.3);c.closePath()};
  paint(c,body,'#2a1e15',{box:[-10,-4,8,4],dark:'#0e0a07',light:'#6a4f35',n:34,len:2.2,ang:Math.PI/2,ink:.8,seed:31});
  c.strokeStyle='rgba(150,118,84,.45)';c.lineWidth=.5;c.beginPath();c.moveTo(-8,0);c.lineTo(6,0);c.stroke();
  c.strokeStyle='rgba(10,7,5,.6)';for(let i=0;i<3;i++){c.beginPath();c.moveTo(-1+i*1.6,-2.8);c.quadraticCurveTo(-.4+i*1.6,0,-1+i*1.6,2.8);c.stroke()}
  paint(c,()=>{c.beginPath();c.moveTo(6,-2.5);c.quadraticCurveTo(10,-3.3,12,-1.6);c.lineTo(15.4,-.7);c.lineTo(15.8,0);c.lineTo(15.4,.7);c.lineTo(12,1.6);c.quadraticCurveTo(10,3.3,6,2.5);c.closePath()},'#231912',{box:[6,-3.5,16,3.5],light:'#5a4330',n:10,len:2,ang:0,ink:.7,seed:37});
  c.fillStyle='#0b0806';for(const s of[-1,1]){c.beginPath();c.moveTo(9.6,s*2);c.lineTo(6.8,s*4.6);c.lineTo(8.2,s*1.8);c.closePath();c.fill()}
  c.fillStyle='#050404';c.beginPath();c.arc(15.6,0,.6,0,7);c.fill();
  if(o.angry)eyes(c,11.8,0,1.3,.42);
}
function asaltante(c,t,o={}){
  const sw=Math.sin((o.phase||0)*Math.PI*2)*(o.moving?1:0),lg=o.lunge?3.5:0;shadow(c,0,0,10,9,.5);
  c.fillStyle='#121514';for(const s of[-1,1]){c.beginPath();c.ellipse(sw*s*4+.5,s*3,3,1.8,0,0,7);c.fill()}
  paint(c,()=>blobPath(c,-1,0,5,7.8,401,.1,18),'#38241f',{box:[-7,-9,5,9],dark:'#140c0a',light:'#5c3b31',n:20,len:4,ang:1.4,ink:.9,seed:41});
  c.strokeStyle='#2a1c18';c.lineWidth=2.4;c.lineCap='round';
  c.beginPath();c.moveTo(0,5.2);c.quadraticCurveTo(4,6.6,6.5+lg,4.6);c.stroke();
  c.beginPath();c.moveTo(0,-5.2);c.quadraticCurveTo(3,-6.2,4.2,-4.6);c.stroke();
  c.strokeStyle='#d9d1bc';c.lineWidth=.8;c.beginPath();c.moveTo(7.2+lg,4.6);c.lineTo(11.4+lg,3.3);c.stroke();
  paint(c,()=>{c.beginPath();c.moveTo(4.3,0);c.bezierCurveTo(4.1,-4.3,-1,-4.5,-3,-1.3);c.lineTo(-5.8,0);c.lineTo(-3,1.3);c.bezierCurveTo(-1,4.5,4.1,4.3,4.3,0);c.closePath()},'#221517',{ink:.7});
  c.fillStyle='#040505';c.beginPath();c.ellipse(3.4,0,1.2,2.3,0,0,7);c.fill();
}
function marinerito(c,t,o={}){
  const al=o.alpha??1;c.save();c.globalAlpha=al;
  const g=c.createRadialGradient(0,0,0,0,0,14);g.addColorStop(0,'rgba(217,222,212,.25)');g.addColorStop(1,'rgba(217,222,212,0)');c.fillStyle=g;c.fillRect(-14,-14,28,28);
  c.globalAlpha=al*.88;
  paint(c,()=>blobPath(c,-1,0,3.6,5.2,501,.08,14),'#cdd2c7',{box:[-5,-6,3,6],dark:'#8a938b',n:10,len:3,ang:1.4,ink:.6,seed:51});
  roughPoly(c,[[-4.7,-3.4],[-1.1,-2.8],[-1.1,2.8],[-4.7,3.4]],52,.15);c.fillStyle='#2a394a';c.fill();
  c.strokeStyle='#cdd2c7';c.lineWidth=.35;c.beginPath();c.moveTo(-4.2,-2.9);c.lineTo(-4.2,2.9);c.moveTo(-3.6,-2.7);c.lineTo(-3.6,2.7);c.stroke();
  c.fillStyle='#e6e5da';c.beginPath();c.arc(.6,0,3.1,0,7);c.fill();c.strokeStyle='#1c2228';c.lineWidth=.7;c.beginPath();c.arc(.6,0,2.2,0,7);c.stroke();
  c.fillStyle='#1c2228';c.beginPath();c.ellipse(3.5,0,1,2,0,0,7);c.fill();
  c.restore();
}

/* ---------------- objetos ---------------- */
function pilas(c){
  for(const[x,y,a,s]of[[-2.5,-1,.55,1],[2.5,1.5,.25,2]]){c.save();c.translate(x,y);c.rotate(a);shadow(c,1,1.2,6,2.4,.45);
    paint(c,()=>roughPoly(c,[[-4.2,-1.7],[4.2,-1.7],[4.2,1.7],[-4.2,1.7]],700+s,.1),'#1c201f',{ink:.4});
    c.fillStyle='#b4853e';c.fillRect(1.4,-1.7,2.8,3.4);c.fillStyle='#d9c189';c.fillRect(4.2,-.65,.8,1.3);
    c.fillStyle='rgba(255,255,255,.18)';c.fillRect(-4,-1.4,8,.6);c.restore()}
}
function vocho(c){
  shadow(c,1,2,24,12,.55);
  for(const[x,y]of[[11,-8],[11,8],[-11,-8],[-11,8]])paint(c,()=>blobPath(c,x,y,5.2,2.6,800+x+y,.06,12),'#aaa28c',{ink:.6});
  paint(c,()=>blobPath(c,0,0,20,8.2,811,.03,24),'#c8c0a9',{box:[-20,-9,20,9],dark:'#6b6453',light:'#e2dbc7',n:50,len:4,ang:0,ink:.9,seed:81});
  paint(c,()=>blobPath(c,-2,0,8.6,6.3,812,.03,18),'#d5cdb8',{box:[-11,-7,7,7],dark:'#7a7361',n:18,len:3,ang:0,ink:.6,seed:82});
  c.fillStyle='#1b2321';c.beginPath();c.ellipse(6.2,0,2.1,5.2,0,0,7);c.fill();c.beginPath();c.ellipse(-10.6,0,1.5,3.8,0,0,7);c.fill();
  c.fillStyle='#e9e3cf';for(const s of[-1,1]){c.beginPath();c.arc(18.2,s*5,1.2,0,7);c.fill()}
  c.strokeStyle='rgba(60,56,46,.7)';c.lineWidth=.4;c.beginPath();c.moveTo(9,0);c.lineTo(18,0);c.stroke();
}
function arbol(c,seed,R=40,shade=true){
  const draw=(col,al,ox,oy)=>{const r=rng(seed);c.save();c.translate(ox,oy);c.strokeStyle=col;c.globalAlpha=al;c.lineCap='round';
    const br=(x,y,a,len,w,d)=>{if(d>5||len<1.6)return;const x2=x+Math.cos(a)*len,y2=y+Math.sin(a)*len;c.lineWidth=w;c.beginPath();c.moveTo(x,y);
      c.quadraticCurveTo((x+x2)/2+(r()-.5)*len*.35,(y+y2)/2+(r()-.5)*len*.35,x2,y2);c.stroke();const k=2+(r()<.45?1:0);
      for(let i=0;i<k;i++)br(x2,y2,a+(r()-.5)*1.35,len*(.55+r()*.18),w*.62,d+1)};
    const n=5+Math.floor(r()*3);for(let i=0;i<n;i++)br(0,0,i/n*6.283+r()*.6,R*.36,3.4,0);
    c.fillStyle=col;c.beginPath();c.arc(0,0,3.8,0,7);c.fill();c.restore()};
  if(shade)draw('#000',.35,5,6);draw(PAL.tinta,1,0,0);
}
function lapida(c,seed){
  const r=rng(seed),lean=(r()-.5)*.25;shadow(c,2,3,7,3,.45);
  paint(c,()=>roughPoly(c,[[-5.5,-1],[5.5,-1],[5.5,7],[-5.5,7]],seed,.4),'#45423a',{box:[-6,-1,6,7],dark:'#24221d',n:10,len:3,ang:0,ink:.6,seed});
  c.save();c.translate(0,-1);c.transform(1,0,lean,1,0,0);
  paint(c,()=>{c.beginPath();c.moveTo(-4,0);c.lineTo(-4,-7);c.quadraticCurveTo(-4,-11,0,-11);c.quadraticCurveTo(4,-11,4,-7);c.lineTo(4,0);c.closePath()},'#8c8574',{box:[-4,-11,4,0],dark:'#4f4b41',light:'#b3ab97',n:12,len:2.5,ang:Math.PI/2,ink:.6,seed:seed+1});
  c.strokeStyle='rgba(40,38,32,.6)';c.lineWidth=.4;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-2.4,-6.5+i*1.6);c.lineTo(2.4,-6.5+i*1.6);c.stroke()}
  c.restore();
}
function cruz(c,seed){
  shadow(c,2,3,6,3,.45);
  paint(c,()=>roughPoly(c,[[-4.5,-1],[4.5,-1],[4.5,6],[-4.5,6]],seed,.3),'#4a463d',{ink:.5});
  paint(c,()=>roughPoly(c,[[-1,-1],[1,-1],[1,-14],[-1,-14]],seed+1,.15),'#bdb5a0',{ink:.5});
  paint(c,()=>roughPoly(c,[[-4,-10.5],[4,-10.5],[4,-8.6],[-4,-8.6]],seed+2,.15),'#bdb5a0',{ink:.5});
}

/* ---------------- tumbas (oblicuas) ---------------- */
function angel(c,x,y,s,raise){
  paint(c,()=>roughPoly(c,[[x-3.6,y-4],[x+3.6,y-4],[x+3.6,y+2.5],[x-3.6,y+2.5]],420+s,.2),'#8e8774',{ink:.6});
  paint(c,()=>roughPoly(c,[[x-3.6,y-7],[x+3.6,y-7],[x+3.6,y-4],[x-3.6,y-4]],423+s,.2),'#b3ab96',{ink:.6});
  for(const w of[-1,1])paint(c,()=>{c.beginPath();c.moveTo(x+w,y-12);c.quadraticCurveTo(x+w*6.5,y-19,x+w*5.4,y-9);c.quadraticCurveTo(x+w*3,y-8,x+w,y-9);c.closePath()},'#bab39e',{ink:.5});
  paint(c,()=>{c.beginPath();c.moveTo(x-2.3,y-6);c.quadraticCurveTo(x-2.7,y-13,x,y-14.2);c.quadraticCurveTo(x+2.7,y-13,x+2.3,y-6);c.closePath()},'#d2cbb5',{box:[x-3,y-15,x+3,y-6],dark:'#8a8370',n:8,len:2,ang:Math.PI/2,ink:.5,seed:430+s});
  c.fillStyle='#dcd5c0';c.beginPath();c.arc(x,y-15.6,1.6,0,7);c.fill();c.strokeStyle=PAL.tinta;c.lineWidth=.4;c.stroke();
  if(raise){c.strokeStyle='#d2cbb5';c.lineWidth=1;c.lineCap='round';c.beginPath();c.moveTo(x-1.4,y-12);c.lineTo(x-3,y-20);c.stroke()}
}
function t04(c){
  shadow(c,4,4,36,15,.5);
  paint(c,()=>roughPoly(c,[[-24,-53],[24,-53],[24,-29],[-24,-29]],401,.5),'#5f5a4d',{box:[-24,-53,24,-29],dark:'#2b2923',light:'#807868',n:44,len:6,ang:0,ink:1,seed:402});
  c.save();roughPoly(c,[[-24,-53],[24,-53],[24,-29],[-24,-29]],401,.5);c.clip();brush(c,403,[-22,-52,22,-31],'#33432f',22,5,0,.55,1.8);c.restore();
  paint(c,()=>roughPoly(c,[[-22,-28],[22,-28],[22,0],[-22,0]],404,.4),'#a39b87',{box:[-22,-28,22,0],dark:'#5c584c',light:'#c8c0a9',n:56,len:5,ang:Math.PI/2,ink:1,seed:405});
  paint(c,()=>roughPoly(c,[[-24.5,-31.5],[24.5,-31.5],[24.5,-26.5],[-24.5,-26.5]],406,.3),'#b7af9a',{box:[-25,-32,25,-26],dark:'#6a6557',n:22,len:3,ang:0,ink:.8,seed:407});
  c.strokeStyle='rgba(58,54,46,.85)';c.lineWidth=.45;for(let x=-23;x<23;x+=2.2){c.beginPath();c.arc(x+1.1,-29,1,0,7);c.stroke()}
  for(const x of[-19,-10,10,19]){c.fillStyle='rgba(215,207,186,.32)';c.fillRect(x-1.4,-25,2.8,25);c.fillStyle='rgba(58,54,46,.5)';c.fillRect(x+1,-25,.5,25);c.fillStyle='#c2baa4';c.fillRect(x-2.1,-26.4,4.2,2)}
  c.save();c.beginPath();c.moveTo(-6,0);c.lineTo(-6,-14);c.arc(0,-14,6,Math.PI,0);c.lineTo(6,0);c.closePath();c.fillStyle='#0c100f';c.fill();c.clip();
  c.strokeStyle='#3a413e';c.lineWidth=.6;for(let x=-5;x<=5;x+=1.6){c.beginPath();c.moveTo(x,0);c.lineTo(x,-21);c.stroke()}c.beginPath();c.moveTo(-6,-10);c.lineTo(6,-10);c.stroke();c.restore();
  c.strokeStyle='#c8c0a9';c.lineWidth=1;c.beginPath();c.arc(0,-14,6.8,Math.PI,0);c.stroke();
  for(let i=0;i<3;i++)paint(c,()=>roughPoly(c,[[-9+i,i*2.3],[9-i,i*2.3],[9-i,i*2.3+2.3],[-9+i,i*2.3+2.3]],410+i,.25),i%2?'#8b8471':'#98907c',{ink:.5});
  angel(c,-15,9,-1,true);angel(c,15,9,1,false);
}
function t06(c){
  shadow(c,3,3,28,12,.5);
  const N=18,front=[],back=[];
  for(let i=0;i<=N;i++){const a=Math.PI-i/N*Math.PI,x=Math.cos(a)*17,y=-Math.pow(Math.sin(a),.72)*30;front.push([x,y]);back.push([x,y-21])}
  const roof=()=>{c.beginPath();front.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));for(let i=N;i>=0;i--)c.lineTo(back[i][0],back[i][1]);c.closePath()};
  paint(c,roof,'#7a7567',{box:[-18,-53,18,0],dark:'#47433b',light:'#a8a290',n:46,len:6,ang:-Math.PI/2,ink:1,seed:601});
  c.strokeStyle='rgba(38,36,30,.55)';c.lineWidth=.6;for(let i=2;i<N;i+=3){c.beginPath();c.moveTo(front[i][0],front[i][1]);c.lineTo(back[i][0],back[i][1]);c.stroke()}
  const fac=()=>{c.beginPath();front.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath()};
  paint(c,fac,'#b0aa98',{box:[-17,-31,17,0],dark:'#6d685a',light:'#cfc8b4',n:40,len:4,ang:Math.PI/2,ink:1,seed:611});
  // vidrio en cuadros, con paños rotos
  c.save();c.beginPath();front.forEach(([x,y],i)=>{const X=x*.8,Y=y*.84;i?c.lineTo(X,Y):c.moveTo(X,Y)});c.closePath();c.fillStyle='#1b2a28';c.fill();c.clip();
  const r=rng(620);for(let gx=-14;gx<14;gx+=3.6)for(let gy=-26;gy<0;gy+=3.6){const v=r();if(v<.12){c.fillStyle='#050707';c.fillRect(gx,gy,3.6,3.6)}else if(v>.86){c.fillStyle='rgba(159,198,192,.25)';c.fillRect(gx,gy,3.6,3.6)}}
  c.strokeStyle='#c9c2ad';c.lineWidth=.6;for(let gx=-14.4;gx<15;gx+=3.6){c.beginPath();c.moveTo(gx,0);c.lineTo(gx,-30);c.stroke()}for(let gy=-3.6;gy>-30;gy-=3.6){c.beginPath();c.moveTo(-15,gy);c.lineTo(15,gy);c.stroke()}
  c.restore();
  // puerta con herrería y letrero
  paint(c,()=>roughPoly(c,[[-4.6,-12],[4.6,-12],[4.6,0],[-4.6,0]],630,.2),'#121614',{ink:.6});
  c.strokeStyle='#868b84';c.lineWidth=.5;for(const s of[-1,1]){c.beginPath();c.arc(s*2.2,-7,1.6,0,6);c.stroke();c.beginPath();c.arc(s*2.2,-3,1.6,3,9);c.stroke()}
  paint(c,()=>roughPoly(c,[[-7,-16],[7,-16],[7,-12.2],[-7,-12.2]],631,.15),'#c9c2ad',{ink:.5});
  c.fillStyle='#2b2822';c.font='bold 2.3px "Courier Prime",monospace';c.textAlign='center';c.textBaseline='middle';c.fillText('FAMILIA RIBE',0,-14.1);
  // cruz al frente de la cubierta
  c.strokeStyle='#d0c9b4';c.lineWidth=1.3;c.lineCap='round';c.beginPath();c.moveTo(0,-29);c.lineTo(0,-39);c.moveTo(-3,-35.5);c.lineTo(3,-35.5);c.stroke();
}

/* ---------------- suelo ---------------- */
function suelo(seed,size){
  const cv=document.createElement('canvas');cv.width=cv.height=size;const c=cv.getContext('2d'),r=rng(seed);
  c.fillStyle=PAL.musgo;c.fillRect(0,0,size,size);
  const layer=(n,col,len,wd,al)=>{for(let i=0;i<n;i++){const x=r()*size,y=r()*size,a=r()*6.28,l=len*(.5+r());c.strokeStyle=col;c.globalAlpha=al*(.4+r()*.6);c.lineWidth=wd*(.5+r());c.lineCap='round';
    for(const ox of[-size,0,size])for(const oy of[-size,0,size]){if(Math.abs(x+ox-size/2)>size*.75||Math.abs(y+oy-size/2)>size*.75)continue;c.beginPath();c.moveTo(x+ox,y+oy);c.quadraticCurveTo(x+ox+Math.cos(a+.5)*l*.5,y+oy+Math.sin(a+.5)*l*.5,x+ox+Math.cos(a)*l,y+oy+Math.sin(a)*l);c.stroke()}}};
  layer(500,'#141c1a',size*.05,size*.012,.6);layer(320,'#33433d',size*.04,size*.008,.5);layer(140,'#2e2a20',size*.03,size*.016,.6);
  for(let i=0;i<70;i++){const x=r()*size,y=r()*size;c.globalAlpha=.7;c.fillStyle=r()<.5?'#3a2d1f':'#4a3a26';c.beginPath();c.ellipse(x,y,size*.012,size*.006,r()*6,0,7);c.fill()}
  c.globalAlpha=1;return cv;
}
function grano(size){const cv=document.createElement('canvas');cv.width=cv.height=size;const c=cv.getContext('2d'),d=c.createImageData(size,size);
  for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}c.putImageData(d,0,0);return cv}
function camino(c,pts,w,seed){
  const r=rng(seed);c.save();c.lineCap='round';c.lineJoin='round';
  const line=()=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]))};
  line();c.strokeStyle='#0f1513';c.lineWidth=w+4;c.stroke();line();c.strokeStyle='#2b3431';c.lineWidth=w;c.stroke();
  for(let i=0;i<pts.length-1;i++){const[a,b]=[pts[i],pts[i+1]],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.round(L*w/22);
    const nx=-(b[1]-a[1])/L,ny=(b[0]-a[0])/L;
    for(let k=0;k<n;k++){const t=r(),o=(r()-.5)*w*.85,x=a[0]+(b[0]-a[0])*t+nx*o,y=a[1]+(b[1]-a[1])*t+ny*o,s=2+r()*2.2;
      paint(c,()=>blobPath(c,x,y,s,s*.8,Math.floor(r()*1e6),.18,8,r()*3),r()<.5?'#434d48':'#3a433f',{});
      c.strokeStyle='rgba(8,12,11,.6)';c.lineWidth=.5;blobPath(c,x,y,s,s*.8,k+i*999,.18,8);c.stroke()}}
  c.restore();
}

/*EXTRA*/
/* ---------------- piezas de arquitectura ---------------- */
function arcoPath(c,x,y,w,h,tipo){c.beginPath();c.moveTo(x-w/2,y);
  if(tipo==='ojiva'){const sp=Math.max(0,h-w*.8);c.lineTo(x-w/2,y-sp);c.quadraticCurveTo(x-w/2,y-h+w*.08,x,y-h);c.quadraticCurveTo(x+w/2,y-h+w*.08,x+w/2,y-sp)}
  else{const sp=Math.max(0,h-w/2);c.lineTo(x-w/2,y-sp);c.arc(x,y-sp,w/2,Math.PI,0)}
  c.lineTo(x+w/2,y);c.closePath()}
function puerta(c,x,y,w,h,tipo,marco){c.save();arcoPath(c,x,y,w,h,tipo);c.fillStyle='#0a0e0d';c.fill();c.clip();c.strokeStyle='#39403d';c.lineWidth=.5;
  for(let i=x-w/2+.8;i<x+w/2;i+=1.5){c.beginPath();c.moveTo(i,y);c.lineTo(i,y-h);c.stroke()}c.beginPath();c.moveTo(x-w/2,y-h*.45);c.lineTo(x+w/2,y-h*.45);c.stroke();c.restore();
  if(marco){c.strokeStyle=marco;c.lineWidth=.9;c.beginPath();const sp=tipo==='ojiva'?Math.max(0,h-w*.8):Math.max(0,h-w/2);c.moveTo(x-w/2-.6,y);c.lineTo(x-w/2-.6,y-sp);
    if(tipo==='ojiva'){c.quadraticCurveTo(x-w/2-.6,y-h-.5,x,y-h-1.2);c.quadraticCurveTo(x+w/2+.6,y-h-.5,x+w/2+.6,y-sp)}else c.arc(x,y-sp,w/2+.6,Math.PI,0);c.lineTo(x+w/2+.6,y);c.stroke()}}
function reja(c,x0,x1,y,h,col='#161c1a'){c.save();c.strokeStyle=col;c.lineWidth=.55;c.beginPath();c.moveTo(x0,y-h);c.lineTo(x1,y-h);c.moveTo(x0,y-.8);c.lineTo(x1,y-.8);
  for(let x=x0;x<=x1+.01;x+=1.5){c.moveTo(x,y);c.lineTo(x,y-h-1)}c.stroke();c.fillStyle=col;for(let x=x0;x<=x1+.01;x+=1.5){c.beginPath();c.moveTo(x-.5,y-h-.8);c.lineTo(x,y-h-2.3);c.lineTo(x+.5,y-h-.8);c.fill()}c.restore()}
function pinaculo(c,x,y,h,col){paint(c,()=>{c.beginPath();c.moveTo(x-1.5,y);c.lineTo(x-1.5,y-h*.5);c.lineTo(x,y-h);c.lineTo(x+1.5,y-h*.5);c.lineTo(x+1.5,y);c.closePath()},col,{ink:.5})}
function cruzS(c,x,y,h,col='#d0c9b4',aro){c.save();c.strokeStyle=col;c.lineWidth=1.1;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(x,y-h);c.moveTo(x-h*.3,y-h*.68);c.lineTo(x+h*.3,y-h*.68);c.stroke();
  if(aro){c.lineWidth=.5;c.beginPath();c.arc(x,y-h*.68,h*.18,0,7);c.stroke()}c.restore()}
function estatua(c,x,y,h,col='#d2cbb5',o={}){
  if(o.alas)for(const w of[-1,1])paint(c,()=>{c.beginPath();c.moveTo(x+w*h*.06,y-h*.74);c.quadraticCurveTo(x+w*h*.44,y-h*1.08,x+w*h*.36,y-h*.48);c.quadraticCurveTo(x+w*h*.2,y-h*.44,x+w*h*.06,y-h*.54);c.closePath()},'#bab39e',{ink:.4});
  paint(c,()=>{c.beginPath();c.moveTo(x-h*.17,y);c.quadraticCurveTo(x-h*.21,y-h*.74,x,y-h*.82);c.quadraticCurveTo(x+h*.21,y-h*.74,x+h*.17,y);c.closePath()},col,{box:[x-h*.22,y-h,x+h*.22,y],dark:'#857e6b',n:7,len:h*.16,ang:Math.PI/2,ink:.45,seed:Math.round(x*7+y*3)});
  c.fillStyle=col;c.beginPath();c.arc(x,y-h*.9,h*.11,0,7);c.fill();c.strokeStyle=PAL.tinta;c.lineWidth=.35;c.stroke();
  if(o.brazo){c.strokeStyle=col;c.lineWidth=h*.07;c.lineCap='round';c.beginPath();c.moveTo(x-h*.1,y-h*.66);c.lineTo(x-h*.2,y-h*1.08);c.stroke()}}
function pedestal(c,x,y,w,h,col,seed,cap='#bdb5a0'){
  paint(c,()=>roughPoly(c,[[x-w/2,y-h],[x+w/2,y-h],[x+w/2,y],[x-w/2,y]],seed,.2),col,{box:[x-w/2,y-h,x+w/2,y],dark:'#4f4b41',n:Math.max(4,w*h/6),len:2,ang:Math.PI/2,ink:.55,seed});
  paint(c,()=>roughPoly(c,[[x-w/2-.8,y-h-1.8],[x+w/2+.8,y-h-1.8],[x+w/2+.8,y-h],[x-w/2-.8,y-h]],seed+1,.12),cap,{ink:.5})}
function losa(c,x0,y0,x1,y1,col,seed){paint(c,()=>roughPoly(c,[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],seed,.4),col,{box:[x0,y0,x1,y1],dark:'#2e2c27',light:'#8f8877',n:Math.max(6,Math.round((x1-x0)*(y1-y0)/10)),len:3,ang:0,ink:.6,seed})}
function techoPlano(c,w,h,d,col,seed){paint(c,()=>roughPoly(c,[[-w/2,-h-d],[w/2,-h-d],[w/2,-h],[-w/2,-h]],seed,.4),col,{box:[-w/2,-h-d,w/2,-h],dark:'#2a2823',light:'#7f7867',n:Math.round(w*d/9),len:5,ang:0,ink:.9,seed:seed+1});
  c.save();roughPoly(c,[[-w/2,-h-d],[w/2,-h-d],[w/2,-h],[-w/2,-h]],seed,.4);c.clip();brush(c,seed+2,[-w/2,-h-d,w/2,-h],'#33432f',Math.round(w*d/30),5,0,.5,1.6);c.restore()}
function techoPico(c,w,h,d,col,seed){paint(c,()=>roughPoly(c,[[-w/2,-h-d],[w/2,-h-d],[w/2,-h],[-w/2,-h]],seed,.4),col,{box:[-w/2,-h-d,w/2,-h],dark:'#25231e',light:'#7a7362',n:Math.round(w*d/9),len:5,ang:-Math.PI/2,ink:.9,seed:seed+1});
  c.save();c.fillStyle='rgba(0,0,0,.25)';c.fillRect(0,-h-d,w/2,d);c.strokeStyle='rgba(15,14,12,.8)';c.lineWidth=.8;c.beginPath();c.moveTo(0,-h-d);c.lineTo(0,-h);c.stroke();c.restore()}
function fachada(c,w,h,gable,col,dk,lt,seed){const f=()=>{c.beginPath();c.moveTo(-w/2,0);c.lineTo(-w/2,-h);if(gable)c.lineTo(0,-h-gable);c.lineTo(w/2,-h);c.lineTo(w/2,0);c.closePath()};
  paint(c,f,col,{box:[-w/2,-h-gable,w/2,0],dark:dk,light:lt,n:Math.round(w*(h+gable)/11),len:4,ang:Math.PI/2,ink:1,seed})}

/* ---------------- tumbas ---------------- */
function t01(c){ // Purcell: monumento neogótico con escultura bajo arco, tres lápidas al pie
  shadow(c,4,0,32,14,.5);
  losa(c,-27,-30,27,6,'#3d3a33',101);
  reja(c,-27,27,-30,4);
  for(const x of[-14,0,14])losa(c,x-5,-4,x+5,3.5,'#a49c88',110+x);
  for(const s of[-1,1]){pedestal(c,s*19,-10,7,7,'#9a927e',120+s);pinaculo(c,s*19,-19,18,'#c4bca6')}
  pedestal(c,0,-6,14,12,'#c9c1ab',130,'#dad3bf');
  c.fillStyle='rgba(60,56,48,.55)';c.beginPath();c.arc(0,-12.5,2.4,0,7);c.fill();c.strokeStyle='#e0d9c5';c.lineWidth=.5;c.stroke();
  for(const s of[-1,1]){c.fillStyle='#d6cfba';c.fillRect(s*5.2-.9,-40,1.8,20.5);c.strokeStyle=PAL.tinta;c.lineWidth=.4;c.strokeRect(s*5.2-.9,-40,1.8,20.5)}
  estatua(c,0,-20,17,'#e2dbc7');
  paint(c,()=>{c.beginPath();c.moveTo(-7,-39);c.quadraticCurveTo(-7,-47,0,-51);c.quadraticCurveTo(7,-47,7,-39);c.closePath()},'#cfc8b3',{ink:.6});
  arcoPath(c,0,-39,9,8,'ojiva');c.fillStyle='rgba(10,14,13,.7)';c.fill();
  for(const s of[-1,1])pinaculo(c,s*7.4,-38,9,'#cfc8b3');cruzS(c,0,-50,6);
  reja(c,-27,27,6,4);
}
function t02(c){ // cantera café, ojiva, pináculos, reja verde y vitral azul
  shadow(c,5,2,26,12,.5);
  losa(c,-22,-2,22,12,'#3d3a33',201);
  techoPico(c,32,24,16,'#4f4337',202);
  fachada(c,32,24,10,'#866b52','#3e3024','#b0947a',203);
  for(const x of[-16,-9,9,16])pinaculo(c,x,-22,x*x>100?14:10,'#937860');
  c.fillStyle='#2c4f7c';c.beginPath();c.arc(0,-26,3.2,0,7);c.fill();c.strokeStyle='#c6ad8f';c.lineWidth=.45;
  for(let i=0;i<8;i++){const a=i/8*6.283;c.beginPath();c.moveTo(0,-26);c.lineTo(Math.cos(a)*3.2,-26+Math.sin(a)*3.2);c.stroke()}c.beginPath();c.arc(0,-26,3.2,0,7);c.stroke();
  puerta(c,0,0,10,18,'ojiva','#b0947a');
  cruzS(c,0,-34,6,'#c6ad8f');
  reja(c,-20,20,11,5,'#2f4a3a');
  c.strokeStyle='#3e6250';c.lineWidth=.7;for(const s of[-1,1]){c.beginPath();c.arc(s*3,6,2,0,7);c.stroke()}
}
function t03(c){ // capilla neogótica de mármol claro, cuatro remates, figuras
  shadow(c,5,2,32,13,.5);
  losa(c,-27,-2,27,10,'#3d3a33',301);
  techoPico(c,30,24,14,'#77736a',302);
  fachada(c,30,24,13,'#d3cdbd','#8f8a7d','#efeadc',303);
  for(const x of[-15,-9,9,15])pinaculo(c,x,-22,x*x>100?12:15,'#e0dbcd');
  pinaculo(c,0,-35,12,'#e8e3d6');cruzS(c,0,-46,6,'#ece7da');
  c.strokeStyle='#8f8a7d';c.lineWidth=.6;c.beginPath();c.arc(0,-28,2.6,0,7);c.stroke();c.fillStyle='#bdb8aa';c.beginPath();c.arc(0,-28,1.1,0,7);c.fill();
  puerta(c,0,0,10,17,'ojiva','#efeadc');
  reja(c,-22,22,9,4);
  for(const s of[-1,1]){pedestal(c,s*24,6,6,5,'#bdb8aa',310+s);estatua(c,s*24,-0.8,12,'#e3ded0')}
}
function t04b(c){t04(c)}
function t05(c){ // Cuauhtémoc Aguirre: reja, columnas delgadas, niño paje en lo alto
  shadow(c,3,0,26,12,.5);
  losa(c,-23,-26,23,8,'#323b30',501);
  const r=rng(509);for(let i=0;i<14;i++){const x=-20+r()*40,y=-22+r()*26;paint(c,()=>blobPath(c,x,y,2.5+r()*2,1.6+r(),510+i,.3,9),r()<.5?'#2b3b2c':'#3a4a33',{})}
  reja(c,-23,23,-26,4);
  pedestal(c,0,-2,11,9,'#866b52',520,'#9c8166');
  c.fillStyle='rgba(30,24,18,.55)';c.fillRect(-3.6,-8.6,7.2,4.2);
  for(const x of[-3.4,-1.1,1.1,3.4]){c.fillStyle='#8f745a';c.fillRect(x-.55,-37,1.1,26);c.strokeStyle=PAL.tinta;c.lineWidth=.3;c.strokeRect(x-.55,-37,1.1,26)}
  pedestal(c,0,-36,9,2,'#9c8166',530,'#a88d71');
  estatua(c,0,-39.8,9,'#d4cdb8');
  reja(c,-23,23,8,4);
  c.strokeStyle='#161c1a';c.lineWidth=.55;c.beginPath();c.moveTo(-23,8);c.lineTo(-23,-26);c.moveTo(23,8);c.lineTo(23,-26);c.stroke();
}
function t07(c){ // capilla de la escalinata: cúpula con franjas, cruz con aro, muro bajo
  shadow(c,5,3,30,14,.5);
  techoPlano(c,30,24,14,'#6b665a',701);
  // cúpula
  paint(c,()=>blobPath(c,0,-31,12,9,702,.03,24),'#b8b19d',{box:[-12,-41,12,-22],dark:'#6d6758',light:'#ddd6c2',n:30,len:3,ang:-Math.PI/2,ink:.9,seed:703});
  c.strokeStyle='rgba(70,66,56,.7)';c.lineWidth=.5;for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(i*3.4,-23);c.quadraticCurveTo(i*2.2,-36,0,-40);c.stroke()}
  cruzS(c,0,-38,10,'#ddd6c2',true);
  fachada(c,30,24,0,'#cbc4af','#7d7766','#ebe5d3',704);
  c.save();c.fillStyle='#ddd6c2';c.beginPath();c.arc(0,-19,3,0,7);c.fill();c.strokeStyle='#7d7766';c.lineWidth=.5;c.stroke();for(const s of[-1,1])estatua(c,s*6,-15.5,6,'#e4ddc9');c.restore();
  puerta(c,0,0,9,13,'medio','#ebe5d3');
  for(let i=0;i<5;i++)paint(c,()=>roughPoly(c,[[-6.5-i*.6,i*2.2],[6.5+i*.6,i*2.2],[6.5+i*.6,i*2.2+2.2],[-6.5-i*.6,i*2.2+2.2]],710+i,.2),i%2?'#9a937f':'#aaa38f',{ink:.45});
  for(const s of[-1,1]){const x0=s<0?-24:9,x1=s<0?-9:24;paint(c,()=>roughPoly(c,[[x0,4],[x1,4],[x1,9],[x0,9]],720+s,.3),'#a49d89',{ink:.6});
    c.fillStyle='#0d1211';for(let x=x0+2;x<x1-1;x+=4)c.fillRect(x,5.4,2,2.4)}
  for(const s of[-1,1])pinaculo(c,s*15,-22,6,'#cbc4af');
}
function ancla(c,x,y,h){c.save();c.strokeStyle='#bfb7a2';c.lineWidth=1.3;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(x+1.6,y-h);c.moveTo(x-2.6+.4,y-h*.78);c.lineTo(x+3.6,y-h*.82);c.stroke();
  c.beginPath();c.arc(x+.3,y-h*.18,h*.32,.15,Math.PI-.15);c.stroke();c.beginPath();c.arc(x+1.7,y-h-1.4,1.3,0,7);c.stroke();c.restore()}
function t08(c){ // Laroche: ancla contra columna truncada, y monumento con cruz
  shadow(c,4,1,36,13,.5);
  losa(c,-31,-6,31,9,'#3d3a33',801);
  // izquierda: Laroche
  pedestal(c,-13,0,11,9,'#a39b87',810,'#b8b09b');
  c.fillStyle='#d9d2bf';c.fillRect(-16.6,-6.2,7.2,3.6);c.strokeStyle='#5c584c';c.lineWidth=.3;c.strokeRect(-16.6,-6.2,7.2,3.6);
  paint(c,()=>{c.beginPath();c.moveTo(-15.2,-11);c.lineTo(-15.2,-27);c.lineTo(-13.6,-28.6);c.lineTo(-12.4,-26.8);c.lineTo(-10.8,-28);c.lineTo(-10.8,-11);c.closePath()},'#b1a994',{box:[-16,-29,-10,-11],dark:'#6b6556',n:6,len:3,ang:Math.PI/2,ink:.55,seed:815});
  ancla(c,-10,-11,15);
  // derecha: pedestal alto con cruz y lápida clara
  losa(c,7,0,21,8.5,'#cfc8b3',820);
  pedestal(c,14,-1,8,17,'#9e9681',825,'#b7af9a');cruzS(c,14,-19.8,13,'#d0c9b4');
}
function entrada(c){ // puerta del Panteón de Santiago, con paso al centro
  shadow(c,4,1,50,10,.5);
  techoPlano(c,92,30,10,'#5f5a4e',901);
  const body=()=>{c.beginPath();c.moveTo(-46,0);c.lineTo(-46,-30);c.lineTo(-14,-30);c.lineTo(0,-42);c.lineTo(14,-30);c.lineTo(46,-30);c.lineTo(46,0);c.lineTo(13,0);c.lineTo(13,-17);c.arc(0,-17,13,0,Math.PI,true);c.lineTo(-13,0);c.closePath()};
  paint(c,body,'#aaa28d',{box:[-46,-42,46,0],dark:'#5d584b',light:'#cdc5ae',n:110,len:4,ang:Math.PI/2,ink:1,seed:905});
  // reja abierta a los lados del paso
  c.strokeStyle='#2a302d';c.lineWidth=.6;for(const s of[-1,1]){for(let i=0;i<4;i++){const x=s*(11.8-i*1.4);c.beginPath();c.moveTo(x,0);c.lineTo(x,-17-Math.sqrt(Math.max(0,169-x*x))+1);c.stroke()}}
  for(const s of[-1,1]){puerta(c,s*29,0,10,19,'medio','#cdc5ae');pinaculo(c,s*14,-29,6,'#bdb5a0');pinaculo(c,s*44,-29,6,'#bdb5a0')}
  c.fillStyle='#0d1110';c.beginPath();c.arc(0,-34,2,0,7);c.fill();
  cruzS(c,0,-41,10,'#d8d0bb');
}
function muroH(c,x0,x1,y,h=9,seed=1){
  paint(c,()=>roughPoly(c,[[x0,y-h-4],[x1,y-h-4],[x1,y-h],[x0,y-h]],seed,.4),'#6a655a',{box:[x0,y-h-4,x1,y-h],dark:'#3a372f',n:Math.round((x1-x0)/3),len:3,ang:0,ink:.7,seed:seed+1});
  paint(c,()=>roughPoly(c,[[x0,y-h],[x1,y-h],[x1,y],[x0,y]],seed+2,.4),'#4f4b42',{box:[x0,y-h,x1,y],dark:'#24221d',light:'#6f6a5d',n:Math.round((x1-x0)*h/8),len:3,ang:0,ink:.8,seed:seed+3});
  c.strokeStyle='rgba(20,19,16,.6)';c.lineWidth=.4;for(let x=x0+6;x<x1;x+=12){c.beginPath();c.moveTo(x,y-h);c.lineTo(x,y);c.stroke()}
  for(let x=x0;x<=x1;x+=60){paint(c,()=>roughPoly(c,[[x-2.5,y-h-6],[x+2.5,y-h-6],[x+2.5,y],[x-2.5,y]],seed+x,.2),'#777265',{ink:.6})}
}
function muroV(c,x,y0,y1,seed=1){paint(c,()=>roughPoly(c,[[x-3,y0],[x+3,y0],[x+3,y1],[x-3,y1]],seed,.4),'#6a655a',{box:[x-3,y0,x+3,y1],dark:'#3a372f',n:Math.round((y1-y0)/3),len:3,ang:Math.PI/2,ink:.7,seed:seed+1});
  c.fillStyle='rgba(0,0,0,.3)';c.fillRect(x+3,y0,4,y1-y0)}
function farol(c){shadow(c,1,1,4,2,.5);c.fillStyle='#0c100f';c.fillRect(-.7,-13,1.4,13);c.fillStyle='#1b1d1a';c.fillRect(-2.4,-17,4.8,4.4);c.fillStyle='#f6c983';c.fillRect(-1.6,-16.2,3.2,2.8);c.fillStyle='#1b1d1a';c.beginPath();c.moveTo(-3,-17);c.lineTo(0,-19.5);c.lineTo(3,-17);c.fill()}
function nota(c,t){c.save();c.rotate(.25+Math.sin(t*1.5)*.05);shadow(c,1,1,5,3,.4);c.fillStyle='#e6dcc3';c.fillRect(-4,-5,8,10);c.fillStyle='#7a6f5a';for(let i=0;i<4;i++)c.fillRect(-3,-3+i*2,6,.45);c.restore()}
function camara(c){shadow(c,1,1,6,3,.5);c.fillStyle='#151716';c.fillRect(-4,-2.8,8,5.6);c.fillStyle='#3b4240';c.beginPath();c.arc(1,0,2,0,7);c.fill();c.fillStyle=PAL.ambar;c.beginPath();c.arc(-3,-3.2,.8,0,7);c.fill()}

window.ARTE={t01,t02,t03,t05,t07,t08,entrada,muroH,muroV,farol,nota,camara,reja,losa,pedestal,estatua,PAL,rng,blobPath,roughPoly,brush,paint,shadow,eyes,remolino,fotografo,errante,perro,asaltante,marinerito,pilas,vocho,arbol,lapida,cruz,t04,t06,suelo,grano,camino};
})();

// Tarjeta vertical (1080 × 1920) para historias: selfie con flash y el fantasma de Juanito detrás, más la franja del periódico.
window.TARJETA=(()=>{
const W=1080,H=1920,FOTO=1420;
const cargar=src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src});
let juanito=null,fondo=null;
async function recursos(){if(!juanito)juanito=await cargar('juanito.webp');if(!fondo)fondo=await cargar('juanito_fondo.jpg');
  try{await Promise.all(['400 60px "IM Fell English SC"','italic 400 40px "IM Fell English"','700 40px "Courier Prime"','600 40px "Spectral"'].map(f=>document.fonts.load(f)))}catch(e){}}
function cubrir(c,im,x,y,w,h,fx=.5,fy=.4){const k=Math.max(w/im.width,h/im.height),iw=im.width*k,ih=im.height*k;c.drawImage(im,x+(w-iw)*fx,y+(h-ih)*fy,iw,ih)}
// el look de las fotos del juego: flash de frente, negros verdosos, viñeta y grano
function flash(c,x,y,w,h,cx,cy){
  const d=c.getImageData(x,y,w,h),p=d.data,R=Math.hypot(w,h)*.55;
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const o=(j*w+i)*4,dist=Math.hypot(i-cx,j-cy)/R,luz=Math.max(0,1.25-dist*1.15);
    let r=p[o],g=p[o+1],b=p[o+2];const l=(r*.3+g*.59+b*.11)/255;
    const ct=v=>{v=v/255;v=(v-.5)*1.28+.5;return v};r=ct(r);g=ct(g);b=ct(b);
    const ex=.22+luz*1.25;r*=ex;g*=ex;b*=ex;
    const sh=Math.max(0,.35-l)*.25;r=r*(1-.12)+sh*.2;g=g+sh*.35;b=b+sh*.3;
    const n=(Math.random()-.5)*.07;p[o]=Math.min(255,Math.max(0,(r+n)*255));p[o+1]=Math.min(255,Math.max(0,(g+n)*255));p[o+2]=Math.min(255,Math.max(0,(b+n)*255))}
  c.putImageData(d,x,y);
  const v=c.createRadialGradient(x+cx,y+cy,h*.2,x+cx,y+cy,h*.85);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(2,6,5,.88)');c.fillStyle=v;c.fillRect(x,y,w,h)}
// Juanito: recorte de la referencia, semitransparente y con un halo azulado
function fantasma(c,x,y,h,al){if(!juanito)return;const w=juanito.width*h/juanito.height;
  c.save();c.globalAlpha=al*.35;c.filter='blur(16px) brightness(1.3)';c.drawImage(juanito,x,y,w,h);c.restore();
  c.save();c.globalAlpha=al;c.filter='blur(.7px) saturate(.7) brightness(1.55) contrast(1.15)';c.drawImage(juanito,x,y,w,h);c.restore();
  c.save();c.globalAlpha=al*.22;c.globalCompositeOperation='screen';c.filter='blur(5px)';c.drawImage(juanito,x,y,w,h);c.restore()}
function grano(c,x,y,w,h){x|=0;y|=0;w|=0;h|=0;const d=c.getImageData(x,y,w,h),p=d.data;for(let i=0;i<p.length;i+=4){const n=(Math.random()-.5)*18;p[i]+=n;p[i+1]+=n;p[i+2]+=n}c.putImageData(d,x,y)}
function sello(c,fecha){const t=`'${String(fecha.getFullYear()).slice(2)} ${String(fecha.getMonth()+1).padStart(2,'0')} ${String(fecha.getDate()).padStart(2,'0')}  ${String(fecha.getHours()).padStart(2,'0')}:${String(fecha.getMinutes()).padStart(2,'0')}`;
  c.save();c.font='700 50px "Courier Prime","Courier New",monospace';c.textAlign='right';c.fillStyle='#ff8a1f';c.shadowColor='rgba(255,120,20,.85)';c.shadowBlur=16;c.fillText(t,W-60,FOTO-60);c.restore()}
function lineas(c,txt,x,y,maxw,lh){const ws=txt.split(' ');let l='';for(const w of ws){const t=l?l+' '+w:w;if(c.measureText(t).width>maxw&&l){c.fillText(l,x,y);y+=lh;l=w}else l=t}if(l)c.fillText(l,x,y);return y}
function periodico(c,o){
  const y0=FOTO;c.fillStyle='#f3eee2';c.fillRect(0,y0,W,H-y0);
  c.fillStyle='#17140f';c.fillRect(0,y0,W,6);
  c.font='400 96px "IM Fell English SC",Georgia,serif';const vw=c.measureText('Vanguardia').width;c.font='700 30px "Courier Prime",monospace';const mw=c.measureText('MX').width;
  const vx=W/2-(vw+14+mw)/2;c.textAlign='left';c.fillStyle='#17140f';c.font='400 96px "IM Fell English SC",Georgia,serif';c.fillText('Vanguardia',vx,y0+118);
  c.font='700 30px "Courier Prime",monospace';c.fillStyle='#b8321f';c.fillText('MX',vx+vw+14,y0+86);
  c.fillStyle='#17140f';c.fillRect(70,y0+148,W-140,3);c.fillRect(70,y0+156,W-140,1.5);
  c.textAlign='center';c.font='700 27px "Courier Prime",monospace';c.fillStyle='#b8321f';c.fillText('ESPECIAL DE NOVIEMBRE · PANTEÓN DE SANTIAGO',W/2,y0+204);
  c.fillStyle='#17140f';c.font='600 66px "Spectral",Georgia,serif';c.fillText(o.titular,W/2,y0+290);
  c.font='italic 400 38px "IM Fell English",Georgia,serif';c.fillStyle='#3b362c';c.fillText(o.bajada,W/2,y0+346);
  c.font='700 28px "Courier Prime",monospace';c.fillStyle='#5a5446';c.fillText(('Fotografía: '+o.nombre).toUpperCase(),W/2,y0+400);
  c.font='italic 400 30px "IM Fell English",Georgia,serif';c.fillStyle='#8a8170';c.fillText('La última exposición · una experiencia de Vanguardia IA Hub',W/2,H-22)}
async function crear(o){await recursos();
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const c=cv.getContext('2d');
  c.fillStyle='#050807';c.fillRect(0,0,W,H);
  if(o.selfie){
    cubrir(c,o.selfie,0,0,W,FOTO,.5,.35);
    flash(c,0,0,W,FOTO,W*.5,FOTO*.42);
    // Juanito detrás del hombro, en el tercio derecho; el grano lo mete en la misma toma
    fantasma(c,W-480,FOTO*.16,FOTO*.47,.88);grano(c,W-500,FOTO*.14,500,FOTO*.5);
  }else{
    if(fondo){cubrir(c,fondo,0,0,W,FOTO,.567,.5);const v=c.createRadialGradient(W/2,FOTO*.5,FOTO*.25,W/2,FOTO*.5,FOTO*.8);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(2,6,5,.75)');c.fillStyle=v;c.fillRect(0,0,W,FOTO)}
    c.save();c.textAlign='center';c.font='italic 400 64px "IM Fell English",Georgia,serif';c.fillStyle='#f0b45a';c.shadowColor='#000';c.shadowBlur=18;c.fillText('Juanito te vio terminar.',W/2,170);c.restore()}
  sello(c,o.fecha||new Date());
  periodico(c,o);
  return cv}
return{crear,W,H}})();

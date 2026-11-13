/* ============================================================================================
   CAPITOLO 2 — prima parte (storia di Graziano, 12 nov):
   Nick si sveglia di giorno seduto sul divano (il libro e' nell'inventario), stordito. Ripensa al sogno
   (dialogo interiore) e decide di partire. Esterno: cerca le chiavi
   nelle tasche dell'impermeabile, le vede luccicare nel fango di una pozzanghera, prende l'ascia
   dal ceppo e smuove la terra per recuperarle. Poi la scena passa dentro l'auto (per ora si ferma li').
   Scene: capitolo2 (salotto: risveglio e dialogo interiore) -> c2-esterno -> c2-auto. (Il bagno e' stato tolto dalla storia il 12 nov.)  Prova: ?capitolo2
   ============================================================================================ */
(window.__ext=window.__ext||[]).push(function(A){
"use strict";
const M=A.motore;if(!M)return;
const {registraScena,sfx}=M,{g,W,H,RS,R,ell,clamp,lerp,hash,mkImg,CHARS,setHint,fadeTo,setScene,scenes}=A;
window.__C2=null;const C2={sveglio:false,specchio:false,pensato:false,visto:false,ascia:0,scavo:0,chiavi:false,tw:0};   // stato del capitolo 2
window.__C2=C2;const sm=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
const pausa=s=>new Promise(r=>setTimeout(r,s*1000));
/* (13 nov) i testi di Nick stanno in basso, nello stesso riquadro del capitolo 1, con la sua voce (clip Kokoro, indice voci-r2) */
function dn(s,p,testo,opz={}){return A.sayP(testo)}

/* ---------------- 1. salotto di giorno (risveglio) ---------------- */
const IMG_COAT=mkImg('img/emb/img_cappotto_sedia_r2.png'),IMG_HAT=mkImg('img/emb/img_cappello_sedia_r1.png');
const COAT={x:37,y:61,hx:54.5,hy:73.8};   // stessa posizione della notte (COAT_CH)
const SEAT_X=196,SEAT_Y=109,SEAT_K=.78,SC=2.05;   // come nel sogno: Nick seduto sul divano
function frameNick(c,name,x,yb,flip,alpha){   // disegna una posa dell'atlante del protagonista (interno) come nel sogno
  const ch=CHARS['protagonista-interno'],fr=ch&&ch.fr&&ch.fr[name];if(!fr||alpha<=0)return;
  const s=SC*SEAT_K/RS,dw=ch.w*s,dh=ch.h*s,ax=ch.ax*s;
  c.save();c.globalAlpha=alpha;c.translate(Math.round(x*RS)/RS,yb);c.scale(flip?-1:1,1);c.drawImage(ch.img,fr.x,fr.y,ch.w,ch.h,-ax,-dh,dw,dh);c.restore()}
const SAL={t0:1e9,seduto:1,posa:'seat_sleep',posa2:null,mix:0};   // figura seduta disegnata a mano finche' Nick non si alza

registraScena({
  id:'capitolo2',inventario:true,sfondo:'img/scene/giorno-baita-salotto.png',
  giocatore:'protagonista-interno',nomeGiocatore:'NICK',
  partenza:{x:186,y:110,dir:'W'},
  area:[[6,97],[234,97],[238,118],[2,118]],
  ostacoli:[[[58,89],[104,89],[104,100],[58,100]],[[124,87],[160,87],[160,99],[124,99]],[[188,92],[238,92],[238,106],[188,106]]],
  scala:()=>SC,
  superficie:'legno',superfici:[{poly:[[150,108],[190,104],[238,108],[238,118],[150,118]],tipo:'tappeto'}],
  ambiente:{stanza:1,vento:.08,pioggia:0,fuoco:0},
  suggerimento:'',
  sotto(gg){   // impermeabile e cappello sulla sedia, come la sera prima
    for(const [im,x,y] of [[IMG_COAT,COAT.x,COAT.y],[IMG_HAT,COAT.hx,COAT.hy]])if(im.complete&&im.naturalWidth)gg.drawImage(im,x,y,im.naturalWidth/RS,im.naturalHeight/RS)},
  sopra(gg,s){
    if(SAL.seduto>0){
      frameNick(gg,SAL.posa,SEAT_X,SEAT_Y,true,SAL.seduto*(1-SAL.mix));
      if(SAL.posa2)frameNick(gg,SAL.posa2,SEAT_X,SEAT_Y,true,SAL.seduto*SAL.mix)}
    const a=1-sm((s.t-SAL.t0)/2.4);if(a>0&&!C2.sveglio){gg.globalAlpha=a;R(0,0,W,H,'#000');gg.globalAlpha=1}},
  entra(s){   // (12 nov, seconda versione) niente bagno: si sveglia seduto sul divano, ripensa al sogno, si alza e si va fuori
    const p=s.giocatore;
    if(A.S&&A.refreshInv){A.S.inv=['book'];A.S.bookOpen=true;A.refreshInv()}   // il libro e' nell'inventario
    p.visibile=false;p.x=SEAT_X-6;p.y=SEAT_Y-1;p.dir='W';SAL.seduto=1;SAL.posa='seat_sleep';SAL.posa2=null;SAL.mix=0;   // la nuvoletta parte dalla testa di Nick seduto
    SAL.t0=1e9;
    s.sequenza(async()=>{
      // (12 nov) su iPhone l'audio si sblocca solo con un tocco: se si arriva dal link diretto (?capitolo2) si aspetta il tocco
      while(!(A.AU.ctx&&A.AU.ctx.state==='running')){setHint('TOCCA PER INIZIARE',true);await pausa(.2)}
      setHint('');SAL.t0=s.t;
            await pausa(3.2);
      for(const [a,b] of [['seat_sleep','seat_doze'],['seat_doze','seat_read_1']]){SAL.posa=a;SAL.posa2=b;
        for(let k=0;k<=20;k++){SAL.mix=k/20;await pausa(.05)}SAL.posa=b;SAL.posa2=null;SAL.mix=0;await pausa(.6)}
      C2.sveglio=true;
      for(const t of ['Che sonno… Dove sono?… Ah, la baita.','Che sogno strano… Era tutto così confuso.','Cos\'erano quei posti?',
        'Quel ponte… l\'ho riconosciuto. Era il Ponte del Diavolo.','Che significato ha?','E quel simbolo? Cosa significa?',
        'E cos\'è Settimo?','E quella donna? Chi è?','Non capisco…','Devo capirlo. Mi metto in viaggio.'])
        await dn(s,p,t,{frontale:false});
      await pausa(.4);sfx.alza();
      p.x=186;p.y=110;p.dir='W';p.visibile=true;
      for(let k=0;k<=12;k++){SAL.seduto=1-k/12;await pausa(.03)}
      SAL.seduto=0;C2.pensato=true;document.getElementById('bHint').style.display='none';await pausa(.8);
      s.vaiScena('c2-esterno',{x:152,y:98,dir:'S'})})}
});

/* ---------------- 3. esterno di giorno: le chiavi nella pozzanghera ---------------- */
const BG_EST=mkImg('img/scene/giorno-baita-esterno.png'),BG_EST2=mkImg('img/scene/giorno-baita-esterno-senza-ascia.png');
const IMG_ASCIA=mkImg('img/emb/ascia_r1.png');   // 18x12, tolta dallo stesso sfondo (_strumenti/c2_ascia.py)
const POZ={x:166,y:107},CAR_X=6;   // luccichio nella pozzanghera grande; auto come di notte (CAR_X=6, base 112)
function disegnaAscia(gg,hx,hy,ang,flip){   // l'ascia e' presa per il fondo del manico (in alto a destra nello sprite: 17,1)
  if(!(IMG_ASCIA.complete&&IMG_ASCIA.naturalWidth))return;
  gg.save();gg.translate(hx,hy);if(flip)gg.scale(-1,1);gg.rotate(ang);gg.drawImage(IMG_ASCIA,-17,-1);gg.restore()}
function stella(gg,x,y,k){   // luccichio: croce di luce che pulsa
  if(k<=0)return;const L=Math.round(1+k*3);gg.globalAlpha=Math.min(1,.35+k);
  R(x-L,y,L*2+1,1,'#fff6d0');R(x,y-L,1,L*2+1,'#fff6d0');R(x,y,1,1,'#ffffff');gg.globalAlpha=1}
const FANGO=[];   // schizzi di fango durante lo scavo

registraScena({
  id:'c2-esterno',inventario:true,
  giocatore:'protagonista-esterno',nomeGiocatore:'NICK',
  partenza:{x:152,y:98,dir:'S'},
  area:[[2,96],[238,96],[238,119],[2,119]],
  ostacoli:[[[2,99],[78,99],[78,114],[2,114]],[[204,96],[232,96],[232,101],[204,101]]],
  prof:[96,119,.98,1.12],audioPassi:false,   // (12 nov) fuori dalla baita i passi non fanno rumore
  superficie:'fango',superfici:[{poly:[[138,104],[186,104],[186,111],[138,111]],tipo:'pozzanghera'},{poly:[[78,96],[112,96],[112,101],[78,101]],tipo:'pozzanghera'}],
  ambiente:{stanza:0,vento:.18,pioggia:0,fuoco:0},
  suggerimento:'TOCCA PER CAMMINARE',
  disegnaSfondo(gg){const im=C2.ascia?BG_EST2:BG_EST;if(im.complete&&im.naturalWidth)gg.drawImage(im,0,0,W,H);else R(0,0,W,H,'#3a5a7a')},
  oggetti:[{img:'img/emb/auto164_34retro_d69.png',x:CAR_X,y:112-30,w:69,h:30,baseY:112}],
  sotto(gg,s){
    ell(CAR_X+35,111,38,2.5,'#05060a',.4);   // ombra dell'auto
    if(!C2.chiavi&&C2.tw){const k=Math.max(0,Math.sin(s.t*2.6))**6;stella(gg,POZ.x,POZ.y,k)}},   // luccichio nel fango
  sopra(gg,s){
    const p=s.giocatore;if(!p)return;
    for(let i=FANGO.length-1;i>=0;i--){const f=FANGO[i];f.t+=1/60;f.x+=f.vx/60;f.y+=f.vy/60;f.vy+=90/60;if(f.t>.7){FANGO.splice(i,1);continue}R(Math.round(f.x),Math.round(f.y),1,1,f.c)}
    if(C2.ascia===1){   // ascia in mano mentre cammina: lungo il fianco, lama in basso
      const fl=p.dir==='W',sw=p.state==='walk'?Math.sin(p.fase*Math.PI*2)*.12:0;
      disegnaAscia(gg,p.x+(fl?-2:2),p.y-17,-1.1+sw,fl)}   // angolo -1,1: manico verticale, lama in basso
    if(C2.ascia===2){   // scavo: posa accovacciata, l'ascia raspa il fango davanti a Nick
      const s0=p.scala()/RS,ac=CHARS['protagonista-esterno'],ax=ac?ac.ax:65.5,hh=ac?ac.h:130;
      const giu=p.seq&&p.seq[p.si]&&p.seq[p.si][0]==='reach';
      const hx=giu?p.x+(98-ax)*s0:p.x+(72-ax)*s0,hy=giu?p.y-(hh-116)*s0:p.y-(hh-90)*s0;
      disegnaAscia(gg,hx,hy,giu?.12:1.0,true)}},   // giu': lama sul fango davanti; su: lama sollevata in avanti
  punti:[
    {nome:'LA POZZANGHERA',rect:[140,101,46,11],cammina:{x:156,y:110,dir:'E'},visibile:()=>C2.tw&&!C2.chiavi,usa:async(s,p)=>{
      if(!C2.visto){await dn(s,p,'Le chiavi dell\'auto! Ma sono immerse nel fango.');await dn(s,p,'Come le recupero senza sporcarmi?');C2.visto=true;return}
      if(!C2.ascia)await dn(s,p,'Come le recupero senza sporcarmi?')}},
    {nome:'L\'ASCIA',rect:[208,72,26,16],cammina:{x:206,y:104,dir:'E'},visibile:()=>C2.visto&&!C2.ascia,usa:async(s,p)=>{
      await dn(s,p,'L\'ascia! È lo strumento ideale.');
      p.dir='E';await new Promise(r=>{p.pickUp();setTimeout(()=>{C2.ascia=1;sfx.raccogli()},450);setTimeout(r,1300)});
      if(!(await p.vaiA(150,110,false,'E')))return;p.dir='E';
      // smuove la terra: braccio giu' (raspa) e su, con schizzi di fango
      C2.ascia=2;const N=4;p.state='act';p.seq=[];for(let i=0;i<N;i++)p.seq.push(['crouch',.32],['reach',.42]);p.seq.push(['crouch',.4],['#',0]);p.seq=p.seq.filter(a=>a[0]==='#'||p.has(a[0]));p.si=0;p.st=0;
      for(let i=0;i<N;i++){await pausa(.32+.12);sfx.passo('fango',1);for(let j=0;j<6;j++)FANGO.push({x:POZ.x-2+Math.random()*4,y:POZ.y,vx:(Math.random()-.3)*30,vy:-25-Math.random()*25,t:0,c:Math.random()<.5?'#4a3424':'#2e2016'});await pausa(.3)}
      C2.chiavi=true;sfx.chiavi();await pausa(.9);
      C2.ascia=0;   // l'ascia resta a terra accanto alla pozzanghera? per ora non si disegna piu'
      s.vaiScena('c2-auto')}}],
  entra(s){
    const p=s.giocatore;FANGO.length=0;
    s.sequenza(async()=>{
      await pausa(1.2);await p.vaiA(150,106,false,'S');p.dir='S';
      sfx.stoffa();await pausa(.5);sfx.stoffa();await pausa(.4);
      await dn(s,p,'Le chiavi dell\'auto… Non sono nelle tasche.');
      C2.tw=1;s.hint()})}
});

/* ---------------- 4. dentro l'auto (per ora la scena si ferma qui) ---------------- */
const IMG_CAR=mkImg('img/emb/img_car_164.png'),IMG_WHEEL=mkImg('img/emb/img_wheel_164.png');
registraScena({
  id:'c2-auto',area:[[0,0],[2,0],[2,2],[0,2]],   // nessuna camminata
  disegnaSfondo(gg,s){
    // dal parabrezza: il bosco e i monti dello stesso sfondo di giorno, ingranditi
    if(BG_EST2.complete&&BG_EST2.naturalWidth)gg.drawImage(BG_EST2,0,26,120,60,0,0,W,H);else R(0,0,W,H,'#6a9ac8');
    if(IMG_CAR.complete&&IMG_CAR.naturalWidth)gg.drawImage(IMG_CAR,0,0);
    if(IMG_WHEEL.complete&&IMG_WHEEL.naturalWidth){const hw=IMG_WHEEL.naturalWidth,hh=IMG_WHEEL.naturalHeight,ws=.62,dw=Math.round(hw*ws),dh=Math.round(hh*ws),cy=Math.round(hh*.47*ws);
      gg.save();gg.translate(68,97);const wx0=-Math.round(dw/2),wy0=-cy;gg.drawImage(IMG_WHEEL,wx0,wy0,dw,dh);gg.drawImage(IMG_WHEEL,0,hh-1,hw,1,wx0,wy0+dh,dw,70);gg.restore()}
    gg.globalAlpha=.10;R(0,0,W,H,'#ffe0a0');gg.globalAlpha=1},   // luce del giorno nell'abitacolo
  ambiente:{stanza:.4,vento:.05,pioggia:0,fuoco:0},
  suggerimento:'',
  entra(s){   // dentro l'auto: Nick dice «Partiamo!», parte il motore, dissolvenza al nero e si passa alle strade di montagna
    s.occupato=true;document.getElementById('bHint').style.display='none';setTimeout(()=>sfx.portaChiude(),300);setTimeout(()=>sfx.chiavi(),1300);
    s.sequenza(async()=>{
      await pausa(2.2);
      const dit=A.sayP('Partiamo!');await pausa(.9);
      for(let k=0;k<7;k++){A.tone(64+k*3,.2,'sawtooth',.05,80+k*4);await pausa(.17)}   // il motorino d'avviamento
      A.setEng&&A.setEng(.7,true);await pausa(.5);await dit;
      A.fadeTo(1,1.3,()=>{A.setScene('c2-strada');A.fadeTo(0,.9)});await pausa(2)})}
});

/* ---------------- 5. inseguimento da dietro sulle prime due strade di montagna (13 nov, seconda versione) ----------------
   Strada in prospettiva (stessa idea del capitolo 1: la curvatura dipende dai metri percorsi e la strada si piega riga per riga),
   ma vista da dietro l'auto, di giorno. Lo sfondo lontano e' preso dalle due strade dipinte (strada-autunno, strada-alpi).
   L'auto e' grande in basso: da dietro in rettilineo, di tre quarti in curva (specchiata per le curve a sinistra). */
const IMG_RETRO=mkImg('img/emb/auto164_retro.png'),IMG_R34=mkImg('img/emb/auto164_34retro_d69.png');
const NRAW=240,HZ=46,ZC=6.4,PXM=38,LANE=3.6,ZN=4.8,VEL=27;   // orizzonte (riga), distanza dell'auto dalla camera (m), px per metro a p=1, mezza corsia, m/s
const sm1=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
const CH=[
 {nome:'autunno',img:mkImg('img/scene/strada-autunno.png'),y0:5,dur:9.5,
  k:w=>sm1(w/45)*(.0078*Math.sin(w*.031)+.0042*Math.sin(w*.0107+1.2)),
  suolo:['#5a3418','#7a4a22','#a06a32'],asf:['#3e404c','#4c4f5c'],haze:'#c49a68',foglie:['#c8791e','#a8541a','#d9a52a','#8c4a1a','#e0b040'],
  alberi:['#c8791e','#e0a030','#a8541a','#7a3a14','#d9a52a'],conifere:['#1a2a1c','#22361f'],muro:false},
 {nome:'alpi',img:mkImg('img/scene/strada-alpi.png'),y0:4,dur:10,
  k:w=>sm1(w/45)*(.0105*Math.sin(w*.027+.6)+.0035*Math.sin(w*.012)),
  suolo:['#6a4226','#8a5a30','#b07840'],asf:['#46485a','#54566a'],haze:'#c89a94',foglie:['#b87a3a','#d9a060','#8a5a30','#c8791e'],
  alberi:['#1a2a1c','#22361f'],conifere:['#16241a','#1e3020'],muro:true}];
const CT={fade:1.0,gap:.5};
const CS={t0:0,k:-1,tab:null,D:0,cam:0,xc:1.8,head:0,fumo:[],foglie:[],acc:0,tre:false,fine:false,ang:0};
window.__CS=CS;
function tabella(r){   // direzione dell'auto (radianti) = curvatura sommata lungo la strada, ogni metro
  const T=new Float32Array(2200);let h=0;for(let w=1;w<T.length;w++){h+=r.k(w);T[w]=h}return T}
const fh=(T,D)=>{const i=Math.floor(clamp(D,0,2198)),f=D-i;return T[i]+(T[i+1]-T[i])*f};
const mixc=(a,b,t)=>{const p=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)),A=p(a),B=p(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')};
function nuovaStrada(k){CS.k=k;CS.tab=tabella(CH[k]);CS.D=0;CS.cam=1.8;CS.xc=1.8;CS.fumo=[];CS.foglie=[];CS.tre=false;CS.alt=0}
function blob(gg,cx,cy,rx,ry,col){   // macchia a pixel: righe orizzontali (nessuna sfumatura)
  rx=Math.max(1,rx);ry=Math.max(1,ry);gg.fillStyle=col;for(let y=-Math.floor(ry);y<=Math.floor(ry);y++){const w=Math.round(rx*Math.sqrt(1-(y*y)/(ry*ry+.01)));gg.fillRect(Math.round(cx-w),Math.round(cy+y),Math.max(1,w*2),1)}}
function disegnaAlbero(gg,x,y,sc,ro,tipo){   // x,y = piede dell'albero; sc = px per metro
  const F=(a,b,w,h,c)=>{gg.fillStyle=c;gg.fillRect(Math.round(a),Math.round(b),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
  F(x-.22*sc,y-2.4*sc,.44*sc,2.4*sc,'#2a1a10');
  if(tipo==='c'){const col=ro.conifere,st=Math.max(1,Math.round(sc*.3));for(let i=0;i<4;i++){const w=(3.3-i*.7)*sc,h=2*sc,yy=y-(1.5+i*1.5)*sc;
      for(let r=0;r<h;r+=st){const ww=w*(1-r/h);F(x-ww/2,yy-h+r,ww,st,col[i%2]);F(x-ww/2,yy-h+r,Math.max(1,ww*.22),st,'#0e1810')}}}
  else{const col=ro.alberi,c0=y-4.6*sc,h=hash(ro.x*3.7);
    blob(gg,x,c0,2.2*sc,1.9*sc,col[3%col.length]);            // massa scura sotto
    for(let i=0;i<6;i++){const a=i*2.3+h*6,rx=Math.cos(a)*1.4*sc,ry=Math.sin(a*1.3)*1.1*sc-.2*sc,rr=(1.1+.35*Math.sin(a*2))*sc;blob(gg,x+rx,c0+ry,rr,rr*.82,col[i%3])}   // chiome chiare
    blob(gg,x-.7*sc,c0-1.1*sc,.7*sc,.5*sc,col[1%col.length])}}
registraScena({
  id:'c2-strada',area:[[0,0],[2,0],[2,2],[0,2]],suggerimento:'',
  ambiente:{stanza:0,vento:.35,pioggia:0,fuoco:0},
  disegnaSfondo(gg,s){
    const k=CS.k<0?0:CS.k,r=CH[k];if(!CS.tab)return;
    const D=CS.D,cam=CS.cam,pan=fh(CS.tab,D)*PXM*ZN*.9+Math.sin(s.t*.4)*0,NR=120-HZ;
    // fondale: striscia alta del dipinto, ingrandita 1,25x e fatta scorrere in orizzontale con la direzione dell'auto (senza giunture)
    if(r.img.complete&&r.img.naturalWidth){const sw=NRAW/1.25,sx=clamp((NRAW-sw)/2+pan/1.25*-1,0,NRAW-sw),sh=(HZ+2)/1.25;
      gg.drawImage(r.img,sx,r.y0,sw,sh,0,0,NRAW,HZ+2)}
    else R(0,0,W,HZ,'#9a7a60');
    // nebbiolina all'orizzonte
    for(let y=HZ-9;y<HZ+1;y++){gg.globalAlpha=(y-(HZ-9))/10*.7;R(0,y,W,1,r.haze)}gg.globalAlpha=1;
    // curvatura lungo la strada (somma doppia: la strada si piega riga per riga)
    const lt=s.lt||(s.lt=new Float32Array(NR+2));let lat=0,dl=0,pz=0;
    for(let i=NR;i>=0;i--){const p=Math.max(i/NR,.025),zz=ZN/p;if(i<NR){const dz=zz-pz;dl+=r.k(D+pz)*dz;lat+=dl*dz}pz=zz;lt[i]=lat}
    s.latAt=p=>{if(p>=1)return 0;const f=clamp(p,0,1)*NR,i=Math.floor(f),a=lt[i],b=lt[Math.min(NR,i+1)];return a+(b-a)*(f-i)};
    const cxAt=p=>120+PXM*p*(s.latAt(p)-cam),hw=p=>1+PXM*p*LANE;
    const dashF=w=>Math.floor(w/12)*4.5+Math.min(((w%12)+12)%12,4.5);
    for(let y=HZ;y<120;y++){
      const p=(y-HZ)/NR+.002,c=cxAt(p),half=hw(p),w=D+ZN/p,sd=.25+.75*Math.pow(p,.7),band=Math.floor(w/5)%2;
      gg.globalAlpha=1;R(0,y,W,1,mixc(mixc(r.suolo[0],r.suolo[1],clamp(sd+(band?.08:-.04),0,1)),r.haze,p<.34?(1-p/.34)*.7:0));   // terra d'autunno a fasce chiare e scure, sfumata nella foschia in lontananza
      for(let i=0;i<7;i++){const wq=Math.floor(w/2.2)+i*53,h=hash(wq*1.7+i),fxw=(hash(wq*.37+i*5)*2-1)*14;   // foglie a terra: attaccate al suolo (la loro posizione e' in metri), larghe quanto serve
        const fx=c+PXM*p*fxw*(fxw<0?1:1);if(h>.5&&Math.abs(fxw)*PXM*p>half*1.02)R(fx,y,Math.max(1,Math.round(p*2.2)),1,r.foglie[(wq+i)%r.foglie.length])}
      if(r.muro){const mw=PXM*p*.7;R(c-half-mw-1,y,mw+1,1,mixc('#6a6074','#9a90a0',sd));R(c-half-mw-1,y,1,1,'#3a3446')}
      R(c-half,y,half*2,1,mixc(r.asf[0],r.asf[1],clamp(sd*.8+(band?.12:0),0,1)));
      const ew=1+Math.floor(p*1.6);R(c-half,y,ew,1,'#d8d8de');R(c+half-ew,y,ew,1,'#d8d8de');
      {const wa=D+ZN/(p+1/NR),cov=(dashF(w)-dashF(wa))/Math.max(.01,w-wa);if(cov>.02){const lw=Math.max(1,p*PXM*.16);gg.globalAlpha=Math.min(1,cov);R(c-lw/2,y,lw,1,'#e0b82a');gg.globalAlpha=1}}}
    gg.globalAlpha=1;
    // alberi (e pali) ai lati: dal piu' lontano al piu' vicino; l'auto si disegna nel punto giusto dell'ordine
    const lista=[];
    for(let n=0;n<14;n++){const w0=Math.floor(D/14)*14+n*14,z=w0-D;if(z>2.2&&z<190){lista.push({z,x:LANE+.7,palo:1});if(r.muro)lista.push({z,x:-(LANE+.9),palo:1})}}   // paletti bianchi e rossi: danno la velocita'
    for(let n=0;n<48;n++){const w0=Math.floor(D/8)*8+n*8;for(const lato of [-1,1]){const h=hash(w0*3+lato*11+k*5),dist=(LANE+2.4+h*13)*lato,z=w0+hash(w0+lato)*8-D;
      if(z>2.2&&z<190&&hash(w0*5+lato*3)>.25)lista.push({z,x:dist,t:(hash(w0*7+lato)<(k===1?.9:.4))?'c':'a',n:w0})}}
    lista.push({z:ZC,car:true});lista.sort((a,b)=>b.z-a.z);
    for(const o of lista){const p=ZN/o.z,y=HZ+p*NR,xx=cxAt(p)+PXM*p*(o.car?(CS.xc-cam):o.x);
      if(o.car){s.carPos={x:xx-PXM*p*(CS.xc-cam)+PXM*p*(CS.xc-cam),y,p};continue}
      if(o.palo){const hh=Math.max(1,PXM*p*1.0),ww=Math.max(1,PXM*p*.12);g.fillStyle='#e8e8ee';g.fillRect(Math.round(xx),Math.round(y-hh),Math.round(ww),Math.round(hh));g.fillStyle='#c03028';g.fillRect(Math.round(xx),Math.round(y-hh),Math.round(ww),Math.max(1,Math.round(hh*.3)));continue}
      if(xx<-60||xx>W+60)continue;const nf=clamp(1-o.z/180,0,1);gg.globalAlpha=.35+.65*nf;
      disegnaAlbero(gg,xx,y,PXM*p*.95,{alberi:r.alberi,conifere:r.conifere,x:o.n},o.t);gg.globalAlpha=1;
      if(r.muro&&o.x<0&&false){}}
    gg.globalAlpha=1;
    // auto
    const cp=s.carPos;if(cp){const kk=r.k(D+ZC),tre=CS.tre,im=tre?IMG_R34:IMG_RETRO;
      if(im.complete&&im.naturalWidth){const larg=(tre?3.1:1.85)*PXM*cp.p,sc=larg/im.naturalWidth,w=im.naturalWidth*sc,h=im.naturalHeight*sc,bump=Math.sin(s.t*21)*.45*cp.p+Math.sin(s.t*8.3)*.3*cp.p;
        const cxx=cp.x;ell(cxx,cp.y+.5,w*.5,Math.max(1.5,h*.1),'#000',.4);
        gg.save();gg.translate(Math.round(cxx),Math.round(cp.y+bump));gg.rotate(clamp(kk*40,-.09,.09)*(tre?.5:1));if(tre&&kk<0)gg.scale(-1,1);gg.imageSmoothingEnabled=false;
        gg.drawImage(im,Math.round(-w/2),Math.round(-h),Math.round(w),Math.round(h));gg.restore()}}
    // foglie secche portate dal vento (nel mondo, vengono verso di noi) e sollevate dalle ruote; fumo di scarico
    for(const f of CS.foglie){const z=f.z,p=ZN/Math.max(1.5,z);if(p<.04)continue;const sx=cxAt(Math.min(p,1.4))+PXM*p*(f.x-cam),sy=HZ+p*NR-f.y*PXM*p;
      const a=clamp(1-f.t/f.life,0,1);gg.globalAlpha=Math.min(1,a*1.5);R(sx,sy,p>.4?3:2,p>.4?2:1,f.c)}
    for(const f of CS.fumo){const a=.55*(1-f.t/1.2);if(a<=0)continue;gg.globalAlpha=a;const q=Math.round(f.r);R(f.x-q/2,f.y-q/2,Math.max(1,q),Math.max(1,q),f.t<.4?'#c4c4cc':'#8e8e98')}
    gg.globalAlpha=1;
    // dissolvenze: dal nero all'inizio di ogni strada, al nero alla fine
    const tl=CS.tl||0;let a=0;if(tl<CT.fade)a=1-sm1(tl/CT.fade);else if(tl>r.dur-.6)a=sm1((tl-(r.dur-.6))/.6);
    if(CS.stop)a=1;if(a>0){gg.globalAlpha=a;R(0,0,W,H,'#000');gg.globalAlpha=1}},
  entra(s){CS.t0=0;CS.fine=false;CS.stop=false;nuovaStrada(0);CS.tl=0;s.occupato=true;document.getElementById('bHint').style.display='none';A.setEng&&A.setEng(.9,true)},
  aggiorna(s,dt){
    const seg=CH.map(r=>r.dur+CT.gap);let k=0,t0=0;const t=s.t;while(k<CH.length-1&&t>=t0+seg[k]){t0+=seg[k];k++}
    if(k!==CS.k)nuovaStrada(k);const r=CH[k];CS.tl=t-t0;
    const fine=t>=seg.reduce((a,b)=>a+b,0)-CT.gap;CS.stop=CS.tl>=r.dur&&k===CH.length-1||fine;
    if(fine&&!CS.fine){CS.fine=true;A.setEng&&A.setEng(0,false);A.setHint('CONTINUA…',true)}
    if(CS.stop||CS.tl>=r.dur)return;
    const v=VEL*clamp(.55+CS.tl/2.2,.55,1);CS.D+=v*dt;const D=CS.D;
    const kk=r.k(D+ZC),kn=r.k(D+ZC+14);
    // posizione sulla corsia: oscilla piano, in curva tira un po' verso l'esterno; la camera la segue in ritardo
    const bersaglio=1.8-kn*45*2+Math.sin(s.t*.85)*.28+Math.sin(s.t*2.3)*.07;CS.xc+=(bersaglio-CS.xc)*Math.min(1,dt*3.2);
    CS.cam+=(CS.xc-CS.cam)*Math.min(1,dt*1.7);
    CS.tre=CS.tre?Math.abs(kn)>.0034:Math.abs(kn)>.0052;
    if(A.AU.engO&&A.AU.ctx)A.AU.engO.frequency.setTargetAtTime(52+Math.abs(kn)*3800+7*Math.sin(t*3),A.AU.ctx.currentTime,.15);
    const cp=s.carPos;
    if(cp){const tre=CS.tre,larg=(tre?3.1:1.85)*PXM*cp.p,lato=tre&&kk<0?-1:1;
      CS.acc+=dt*44;while(CS.acc>=1){CS.acc--;const ox=(tre?-.40:-.30)*larg*lato;CS.fumo.push({x:cp.x+ox,y:cp.y-(tre?3.6:4.2)*cp.p*1.1,vx:-2*lato*Math.random()-1+Math.sin(t*1.4)*1.5,vy:5+Math.random()*9,t:0,r:1.1+Math.random()*.7})}
      CS.fumo.forEach(f=>{f.t+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.r+=dt*3});CS.fumo=CS.fumo.filter(f=>f.t<1.2);
      // foglie sollevate dalle ruote
      if(Math.random()<dt*52)CS.foglie.push({kind:'r',z:ZC-.2,x:CS.xc+(Math.random()-.5)*2.4,y:.1,vy:2.4+Math.random()*2.4,vx:(Math.random()-.5)*5,t:0,life:.9+Math.random()*.8,c:r.foglie[Math.floor(Math.random()*r.foglie.length)]})}
    // foglie nel vento: dal fondo verso di noi
    if(Math.random()<dt*26)CS.foglie.push({kind:'v',z:60+Math.random()*50,x:(Math.random()-.5)*26,y:.3+Math.random()*2.6,vy:0,vx:(Math.random()-.5)*2,t:0,life:5,c:r.foglie[Math.floor(Math.random()*r.foglie.length)]});
    for(const f of CS.foglie){f.t+=dt;f.z-=(f.kind==='v'?VEL*clamp(.55+CS.tl/2.2,.55,1):VEL*.45)*dt;f.x+=f.vx*dt;if(f.kind==='r'){f.y+=f.vy*dt;f.vy-=7*dt}else f.y+=Math.sin(f.t*3+f.x)*.8*dt}
    CS.foglie=CS.foglie.filter(f=>f.t<f.life&&f.z>1.6&&f.y>-.2)}
});

/* da fine capitolo 1 (sogno) al capitolo 2 */
window.__capitolo2=A.capitolo2=()=>{for(const k in C2)C2[k]=typeof C2[k]==='boolean'?false:0;fadeTo(1,1.8,()=>{setScene('capitolo2');fadeTo(0,.01)})};
});

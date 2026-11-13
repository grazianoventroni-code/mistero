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
const {registraScena,sfx}=M,{g,W,H,RS,R,ell,clamp,lerp,mkImg,CHARS,setHint,fadeTo,setScene,scenes}=A;
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

/* ---------------- 5. le prime due strade di montagna: l'auto sfreccia tra le curve (visto da dietro) ---------------- */
/* Percorsi letti sulle immagini 240x120 (punti x,y della mezzeria della strada, dal basso verso l'orizzonte).
   Per cambiare le strade basta cambiare questo elenco (altre: strada-lago, strada-arrivo-ponte). */
const IMG_RETRO=mkImg('img/emb/auto164_retro.png'),IMG_R34=mkImg('img/emb/auto164_34retro_d69.png');
const ROADS=[
 {img:mkImg('img/scene/strada-autunno.png'),dur:7.2,y0:32,path:[[118,121],[165,116],[196,110],[205,103],[196,97],[172,94],[150,92],[138,88],[132,83],[138,79],[150,78],[158,80]]},
 {img:mkImg('img/scene/strada-alpi.png'),dur:8,y0:30,path:[[168,121],[170,112],[160,105],[140,99],[128,92],[128,85],[142,81],[159,77],[160,70],[148,65],[137,61],[139,55],[132,51],[128,48]]}];
const RT={fade:.9,gap:.45};   // dissolvenza iniziale e pausa nera tra le due strade
const RP=window.__RP={fumo:[],foglie:[],acc:0,acc2:0,cur:-1,len:[],tot:[],h:0,hx:0};
function lunghezze(r){let t=0;const L=[0];for(let i=1;i<r.path.length;i++){t+=Math.hypot(r.path[i][0]-r.path[i-1][0],(r.path[i][1]-r.path[i-1][1])*2);L.push(t)}return L}   // la y conta il doppio: prospettiva
function su(r,u){const L=r.L||(r.L=lunghezze(r)),d=u*L[L.length-1];let i=1;while(i<L.length-1&&L[i]<d)i++;const f=(d-L[i-1])/Math.max(1e-6,L[i]-L[i-1]);
  const a=r.path[i-1],b=r.path[i];return {x:lerp(a[0],b[0],f),y:lerp(a[1],b[1],f),dx:b[0]-a[0],dy:b[1]-a[1]}}
const FOGLIE_COL=['#c8791e','#a8541a','#d9a52a','#8c4a1a','#e0b040'];
registraScena({
  id:'c2-strada',area:[[0,0],[2,0],[2,2],[0,2]],suggerimento:'',
  ambiente:{stanza:0,vento:.35,pioggia:0,fuoco:0},
  disegnaSfondo(gg,s){const k=RP.cur<0?0:RP.cur,im=ROADS[k].img;if(im.complete&&im.naturalWidth)gg.drawImage(im,0,0,W,H);else R(0,0,W,H,'#2a2018')},
  entra(s){RP.fumo=[];RP.foglie=[];RP.cur=0;RP.h=0;RP.finito=false;s.occupato=true;document.getElementById('bHint').style.display='none';A.setEng&&A.setEng(.9,true)},
  aggiorna(s,dt){
    const t=s.t,seg=ROADS.map(r=>r.dur+RT.gap);let k=0,t0=0;while(k<ROADS.length-1&&t>=t0+seg[k]){t0+=seg[k];k++}
    if(k!==RP.cur){RP.cur=k;RP.fumo=[];RP.foglie=[];RP.h=0}
    const r=ROADS[k],tl=t-t0,fine=t>=seg.reduce((a,b)=>a+b,0)-RT.gap;
    RP.k=k;RP.tl=tl;RP.corre=tl>=RT.fade*.4&&tl<r.dur;
    if(fine&&!RP.finito){RP.finito=true;A.setEng&&A.setEng(0,false);s.hint();A.setHint('CONTINUA…',true)}
    if(!RP.corre)return;
    const u=clamp(tl/r.dur,0,1),P=su(r,clamp(u,0,.999)),Q=su(r,clamp(u+.035,0,.999));
    const sc=clamp(.62*(P.y-r.y0)/(121-r.y0),.1,.62);
    const ang=Math.atan2(Q.x-P.x,-(Q.y-P.y)*2.2);RP.h+=(ang-RP.h)*Math.min(1,dt*5);RP.sc=sc;RP.x=P.x;RP.y=P.y;RP.ang=RP.h;
    if(A.AU.engO&&A.AU.ctx){A.AU.engO.frequency.setTargetAtTime(48+Math.abs(RP.h)*26+8*Math.sin(t*3),A.AU.ctx.currentTime,.15)}   // il motore sale in curva
    // scarico: fumo che resta indietro (verso chi guarda) e si allarga
    RP.acc+=dt*34;while(RP.acc>=1){RP.acc--;const tre=!!RP.tre,off=(tre?(RP.h<0?.30:-.30):-.27)*64*sc;   // il tubo di scarico e' in basso a sinistra (a destra se l'immagine e' specchiata)
      RP.fumo.push({x:P.x+off,y:P.y-2.5*sc,vx:-3-Math.random()*6+Math.sin(t*1.3)*2,vy:6+Math.random()*10,t:0,r:.7+Math.random()*.6})}
    // foglie secche sollevate dal vento dell'auto
    RP.acc2+=dt*(r.dur>0?46:0);while(RP.acc2>=1){RP.acc2--;RP.foglie.push({x:P.x+(Math.random()-.5)*40*sc,y:P.y+Math.random()*3*sc,vx:(Math.random()-.5)*46,vy:-(18+Math.random()*44),t:0,life:.9+Math.random()*.9,c:FOGLIE_COL[Math.floor(Math.random()*FOGLIE_COL.length)],big:Math.random()<.4,z:sc})}
    for(const f of RP.fumo){f.t+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.r+=dt*2.6}
    for(const f of RP.foglie){f.t+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt+f.t*30*dt;f.vy+=34*dt;f.vx*=1-dt*.8}
    RP.fumo=RP.fumo.filter(f=>f.t<1.1);RP.foglie=RP.foglie.filter(f=>f.t<f.life)},
  sopra(gg,s){
    const t=s.t;if(RP.cur<0)return;
    for(const f of RP.fumo){const a=.5*(1-f.t/1.1);if(a<=0)continue;gg.globalAlpha=a;const q=Math.round(f.r);R(Math.round(f.x-q/2),Math.round(f.y-q/2),Math.max(1,q),Math.max(1,q),f.t<.35?'#b8b8c0':'#8e8e98')}
    gg.globalAlpha=1;
    if(RP.corre&&RP.sc){   // auto: dritta da dietro, in curva di tre quarti (specchiata a sinistra); ombra e piccoli sobbalzi
      const sc=RP.sc,h=RP.h;RP.tre=RP.tre?Math.abs(h)>.2:Math.abs(h)>.32;const tre=RP.tre,im=tre?IMG_R34:IMG_RETRO;   // isteresi: niente scatti tra le due viste
      if(im.complete&&im.naturalWidth){
        const w=im.naturalWidth*sc*(tre?.92:1),hh=im.naturalHeight*sc*(tre?.92:1),bump=Math.sin(t*23)*.35*sc+Math.sin(t*9.7)*.25*sc;
        ell(RP.x,RP.y+.5,w*.46,Math.max(1,hh*.12),'#000',.38);
        gg.save();gg.translate(Math.round(RP.x),Math.round(RP.y+bump));gg.rotate(clamp(h*.12,-.08,.08));
        if(tre&&h<0)gg.scale(-1,1);
        gg.imageSmoothingEnabled=false;gg.drawImage(im,Math.round(-w/2),Math.round(-hh),Math.round(w),Math.round(hh));gg.restore()}}
    for(const f of RP.foglie){const a=1-f.t/f.life;if(a<=0)continue;gg.globalAlpha=Math.min(1,a*1.6);R(Math.round(f.x),Math.round(f.y),f.big?2:1,1,f.c)}
    gg.globalAlpha=1;
    // dissolvenze: dal nero all'inizio di ogni strada, al nero alla fine
    const r=ROADS[RP.cur],tl=RP.tl||0;let a=0;if(tl<RT.fade)a=1-sm(tl/RT.fade);else if(tl>r.dur-.5)a=sm((tl-(r.dur-.5))/.5);if(!RP.corre&&tl>=r.dur)a=1;
    if(a>0){gg.globalAlpha=a;R(0,0,W,H,'#000');gg.globalAlpha=1}}
});

/* da fine capitolo 1 (sogno) al capitolo 2 */
window.__capitolo2=A.capitolo2=()=>{for(const k in C2)C2[k]=typeof C2[k]==='boolean'?false:0;fadeTo(1,1.8,()=>{setScene('capitolo2');fadeTo(0,.01)})};
});

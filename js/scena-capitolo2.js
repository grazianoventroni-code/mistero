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
window.__C2=null;const C2={ponteDetto:false,ponteVisto:false,sveglio:false,specchio:false,pensato:false,visto:false,ascia:0,scavo:0,chiavi:false,tw:0};   // stato del capitolo 2
window.__C2=C2;const sm=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
const pausa=s=>new Promise(r=>setTimeout(r,s*1000));
/* (13 nov) i testi di Nick stanno in basso, nello stesso riquadro del capitolo 1, con la sua voce (clip Kokoro, indice voci-r2) */
function dn(s,p,testo,opz={}){return A.sayP(testo,true)}   // (16 nov) i testi avanzano da soli, in fretta

/* ---------------- 1. salotto di giorno (risveglio) ---------------- */
const IMG_COAT=mkImg('img/emb/img_cappotto_sedia_r2.png'),IMG_HAT=mkImg('img/emb/img_cappello_sedia_r1.png');
const COAT={x:37,y:61,hx:54.5,hy:73.8};   // stessa posizione della notte (COAT_CH)
const SEAT_X=204,SEAT_Y=107,SEAT_K=.78,SC=2.05;   // come nel sogno: Nick seduto sul divano
function frameNick(c,name,x,yb,flip,alpha){   // disegna una posa dell'atlante del protagonista (interno) come nel sogno
  const ch=CHARS['protagonista-interno'],fr=ch&&ch.fr&&ch.fr[name];if(!fr||alpha<=0)return;
  const s=SC*SEAT_K/RS,dw=ch.w*s,dh=ch.h*s,ax=ch.ax*s;
  c.save();c.globalAlpha=alpha;c.translate(Math.round(x*RS)/RS,yb);c.scale(flip?-1:1,1);c.drawImage(ch.img,fr.x,fr.y,ch.w,ch.h,-ax,-dh,dw,dh);c.restore()}

/* ---------------- (15 nov) rumori ambiente di giorno: uccelli fuori, vento tra i tronchi, legno che scricchiola, stufa che si raffredda ---------------- */
const AMBG={tb:2,tc:9,ts:6,tl:10,tg:4,tp:20};
/* ---- (15 nov) AMBIENTE STEREO: ogni suono nasce in un punto del campo (pan -1..1), ha una distanza (piu' lontano = piu' cupo, piu' piano, piu' riverbero) e, per gli uccelli, un canto
   fatto con una piccola modulazione di frequenza (timbro vivo, non onda pura). Dentro la baita gli uccelli si sentono attraverso la parete (filtrati) dalle finestre a destra e a sinistra. */
const rnd=(a,b)=>a+Math.random()*(b-a);
function nota(f,d,vol,pan,dist,dentro,glide=1.1){const c=A.AU.ctx,t=c.currentTime,o=c.createOscillator(),m=c.createOscillator(),mg=c.createGain(),g2=c.createGain(),lp=c.createBiquadFilter();
  o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(200,f*glide),t+d);
  m.frequency.value=f*2.01;mg.gain.value=f*(.10+.12*Math.random());m.connect(mg);mg.connect(o.frequency);
  g2.gain.setValueAtTime(0,t);g2.gain.linearRampToValueAtTime(vol*(1-.65*dist)*(dentro?.45:1),t+.012);g2.gain.exponentialRampToValueAtTime(.0001,t+d);
  lp.type='lowpass';lp.frequency.value=(dentro?2600:9500)-6200*dist;o.connect(lp);lp.connect(g2);A.uscita(g2,pan,.18+.7*dist);
  o.start(t);m.start(t);o.stop(t+d+.03);m.stop(t+d+.03)}
const seq=(lista,pan,dist,dentro)=>{let t=0;for(const [f,d,v,gl,gap] of lista){const tt=t,pp=pan+rnd(-.03,.03);setTimeout(()=>nota(f,d,v,pp,dist,dentro,gl||1.1),tt*1000);t+=d+(gap??.04)}};
const SPECIE={
  cincia(pan,dist,dentro){const a=rnd(4300,5400),b=a*.82;seq([[a,.07,.034,.95],[b,.07,.034,1.05],[a,.07,.034,.95],[b,.07,.034,1.05],[a,.07,.03,.95],[b,.07,.03,1.05]],pan,dist,dentro)},
  fringuello(pan,dist,dentro){const l=[];let f=rnd(5000,5600);for(let i=0;i<13;i++){l.push([f,.045,.03-i*.0005,.96,.012]);f*=.975}l.push([3300,.09,.028,1.1,.05],[3900,.12,.026,.9,0]);seq(l,pan,dist,dentro)},
  merlo(pan,dist,dentro){const l=[];let f=rnd(1700,2300);for(let i=0;i<rnd(4,8);i++){f=Math.max(1400,Math.min(3200,f*rnd(.8,1.28)));l.push([f,rnd(.14,.32),.03,rnd(.8,1.25),rnd(.04,.16)])}seq(l,pan,dist,dentro)},
  cuculo(pan,dist,dentro){const l=[];for(let i=0;i<Math.floor(rnd(2,5));i++)l.push([790,.26,.036,.8,.1],[640,.3,.036,.9,.35]);seq(l,pan,Math.max(dist,.6),dentro)},
  picchio(pan,dist,dentro){for(let i=0;i<9;i++)setTimeout(()=>{A.nburst(1700,5,.012,.05*(1-dist*.6),'bandpass',pan,.4+.4*dist)},i*70+rnd(-6,6))}
};
function ambienteGiorno(dt,dentro){
  if(!A.AU.ctx||A.AU.muted||A.AU.ctx.state!=='running')return;
  AMBG.tb-=dt;if(AMBG.tb<=0){AMBG.tb=(dentro?3:1.6)+Math.random()*(dentro?6:3.5);
    const x=Math.random(),k=x<.34?'cincia':x<.6?'fringuello':x<.84?'merlo':x<.94?'cuculo':'picchio';
    const pan=dentro?(Math.random()<.5?-.55:.7)+rnd(-.15,.15):rnd(-.95,.95),dist=dentro?rnd(.3,.7):rnd(.05,.8);
    SPECIE[k](pan,dist,dentro);if(k==='cincia'&&Math.random()<.45)setTimeout(()=>SPECIE.cincia(-pan*.8,Math.min(1,dist+.25),dentro),rnd(500,1200))}   // un secondo uccello risponde dall'altra parte
  if(dentro){
    AMBG.tc-=dt;if(AMBG.tc<=0){AMBG.tc=rnd(16,36);const pan=rnd(-.8,.8),f=rnd(90,150);   // legno che scricchiola: sega lenta che scende, rumore stretto che la segue
      A.tone(f*1.25,rnd(.5,.9),'sawtooth',.012,f*.78,pan,.35);setTimeout(()=>A.tone(f*1.6,.25,'triangle',.008,f*1.2,pan,.35),rnd(120,300));A.nburst(rnd(300,520),7,.4,.012,'bandpass',pan,.3)}
    AMBG.ts-=dt;if(AMBG.ts<=0){AMBG.ts=rnd(6,15);const n=1+Math.floor(Math.random()*3);   // la stufa che si raffredda: tic metallici a destra
      for(let i=0;i<n;i++)setTimeout(()=>{A.nburst(rnd(1700,2600),8,.022,.04,'bandpass',.3,.25);A.tone(rnd(1200,1700),.05,'sine',.012,rnd(900,1200),.3,.3)},i*rnd(110,260))}
    AMBG.tl-=dt;if(AMBG.tl<=0){AMBG.tl=rnd(18,34);A.nburst(rnd(220,320),1.2,2.2,.012,'lowpass',rnd(.2,.5),.5)}   // soffio d'aria nel camino
    AMBG.tp-=dt;if(AMBG.tp<=0){AMBG.tp=rnd(25,50);const p0=rnd(-.9,.9);for(let i=0;i<3;i++)setTimeout(()=>A.nburst(rnd(900,1400),1.5,.18,.012,'bandpass',p0+i*.1,.3),i*rnd(180,360))}   // passi leggeri sul tetto, uno scoiattolo
  }else{
    AMBG.tg-=dt;if(AMBG.tg<=0){AMBG.tg=rnd(7,15);const p0=rnd(-1,1);A.nburst(rnd(700,1200),.7,rnd(1.4,2.4),.02,'bandpass',p0,.5);setTimeout(()=>A.nburst(rnd(2600,4200),.9,rnd(1,1.8),.012,'bandpass',-p0,.5),rnd(100,400))}   // folate tra gli abeti, da un lato all'altro
    AMBG.tl-=dt;if(AMBG.tl<=0){AMBG.tl=rnd(10,22);for(let i=0;i<4;i++)setTimeout(()=>A.nburst(rnd(2500,4500),2,.06,.012,'bandpass',rnd(-.9,.9),.4),i*rnd(60,220))}   // foglie che frusciano
  }}
const SAL={t0:1e9,seduto:1,posa:'seat_nb_sleep',posa2:null,mix:0};   // figura seduta disegnata a mano finche' Nick non si alza

registraScena({
  id:'capitolo2',inventario:true,sfondo:'img/scene/giorno-baita-salotto.png',
  giocatore:'protagonista-interno',nomeGiocatore:'NICK',
  partenza:{x:186,y:110,dir:'W'},
  area:[[6,97],[234,97],[238,118],[2,118]],
  ostacoli:[[[58,89],[104,89],[104,100],[58,100]],[[124,87],[160,87],[160,99],[124,99]],[[188,92],[238,92],[238,106],[188,106]]],
  rif:[110,SC],   // (15 nov) prospettiva: a y=110 Nick ha scala 2,05 (come da seduto); orizzonte = occhi di un uomo in piedi (PROSP)
  superficie:'legno',superfici:[{poly:[[150,108],[190,104],[238,108],[238,118],[150,118]],tipo:'tappeto'}],
  ambiente:{stanza:0,vento:.4,foglie:.5,aria:1,pioggia:0,fuoco:0},   // (15 nov) niente ronzio a 50 Hz: aria nei tronchi + uccelli, scricchiolii e tic della stufa (ambienteGiorno)
  aggiorna(s,dt){ambienteGiorno(dt,true)},
  suggerimento:'',senzaEtichette:true,
  sotto(gg){   // impermeabile e cappello sulla sedia, come la sera prima
    for(const [im,x,y] of [[IMG_COAT,COAT.x,COAT.y],[IMG_HAT,COAT.hx,COAT.hy]])if(im.complete&&im.naturalWidth)gg.drawImage(im,x,y,im.naturalWidth/RS,im.naturalHeight/RS)},
  sopra(gg,s){
    if(SAL.seduto>0){
      frameNick(gg,SAL.posa,SEAT_X,SEAT_Y,true,SAL.seduto*(1-SAL.mix));
      if(SAL.posa2)frameNick(gg,SAL.posa2,SEAT_X,SEAT_Y,true,SAL.seduto*SAL.mix)}
    },   // (14 nov) niente schiarita dal nero: al risveglio e' subito giorno pieno
  entra(s){   // (12 nov, seconda versione) niente bagno: si sveglia seduto sul divano, ripensa al sogno, si alza e si va fuori
    const p=s.giocatore;
    if(A.S&&A.refreshInv){A.S.inv=['book'];A.S.bookOpen=true;A.refreshInv()}   // il libro e' nell'inventario
    p.visibile=false;p.x=SEAT_X-6;p.y=SEAT_Y-1;p.dir='W';SAL.seduto=1;SAL.posa='seat_nb_sleep';SAL.posa2=null;SAL.mix=0;   // la nuvoletta parte dalla testa di Nick seduto
    SAL.t0=1e9;
    s.sequenza(async()=>{
      // (12 nov) su iPhone l'audio si sblocca solo con un tocco: se si arriva dal link diretto (?capitolo2) si aspetta il tocco
      while(!(A.AU.ctx&&A.AU.ctx.state==='running')){setHint('TOCCA PER INIZIARE',true);await pausa(.2)}
      setHint('');SAL.t0=s.t;A.sting('alba');setTimeout(()=>A.musicStart('mattino',7),6500);   // intermezzo: il mattino, poi il tema del mattino
            await pausa(3.2);
      for(const [a,b] of [['seat_nb_sleep','seat_nb_doze'],['seat_nb_doze','seat_nb_wake']]){SAL.posa=a;SAL.posa2=b;
        for(let k=0;k<=20;k++){SAL.mix=k/20;await pausa(.05)}SAL.posa=b;SAL.posa2=null;SAL.mix=0;await pausa(.6)}
      C2.sveglio=true;FIATO.suona('protagonista-interno','sospiro',1,.85);
      let kk=0;
      for(const t of ['Che sonno… Dove sono?… Ah, la baita.','Che sogno strano… Era tutto così confuso.','Cos\'erano quei posti?',
        'Quel ponte… l\'ho riconosciuto. Era il Ponte del Diavolo.','Che significato ha?','E quel simbolo? Cosa significa?',
        'E cos\'è Settimo?','E quella donna? Chi è?','Non capisco…','Devo capirlo. Mi metto in viaggio.'])
        {if(kk===3)A.sting('ponte');if(kk===5)A.sting('simbolo');if(kk===7)A.sting('donna');kk++;
        await dn(s,p,t,{frontale:false})}
      A.sting('scoperta',.7);await pausa(.4);sfx.alza();FIATO.suona('protagonista-interno','sforzo',1,.85);
      p.x=186;p.y=110;p.dir='W';p.visibile=true;
      for(let k=0;k<=12;k++){SAL.seduto=1-k/12;await pausa(.03)}
      SAL.seduto=0;C2.pensato=true;document.getElementById('bHint').style.display='none';await pausa(.8);
      s.vaiScena('c2-esterno',{x:152,y:98,dir:'S'})})}
});

/* ---------------- 3. esterno di giorno: le chiavi nella pozzanghera ---------------- */
const BG_EST=mkImg('img/scene/giorno-baita-esterno.png'),BG_EST2=mkImg('img/scene/giorno-baita-esterno-senza-ascia.png');
const IMG_ASCIA=mkImg('img/emb/ascia_r2.png');   // 18x14, dal foglio ascia-sola del 14 nov (prima 18x12 tolta dallo sfondo) (_strumenti/c2_ascia.py)
const POZ={x:166,y:107},CAR_X=6;
/* (15 nov) l'auto e' un oggetto reale (Alfa 164: alta 1,45 m, sprite 3/4 posteriore 69x30 = 20,7 px/m a quel disegno): la sua misura sullo schermo viene dai px/m del pavimento
   alla quota della base (112), con la STESSA prospettiva che scala Nick: orizzonte = occhi di un uomo in piedi */
const PR_EST={yr:107,sr:1.047},YH_EST=PROSP.orizzonte(PR_EST.yr,PR_EST.sr);   // orizzonte della scena = occhi di un uomo in piedi (PROSP)
/* (15 nov) AUTO IN PROSPETTIVA: l'Alfa 164 (4,55 x 1,83 x 1,43 m) e' una scatola in 3D proiettata con la stessa camera che scala Nick; lo sprite (3/4 posteriore, disegnato a 21,4 gradi dall'asse)
   e' scalato sulla scatola proiettata, e l'angolo dell'asse e' scelto perche' da quel punto si veda proprio sotto 21,4 gradi. Punti di fuga: asse dell'auto e perpendicolare (griglia con ?griglia). */
const IMG_AUTO34=mkImg('img/emb/auto164_34retro_d69.png');
const AUTO={xs:40,ys:107.3,sc:null};   // centro dell'impronta a terra, in px di schermo
function disegnaAscia(gg,hx,hy,ang,flip){   // l'ascia e' presa per il fondo del manico (in alto a destra nello sprite: 17,1)
  if(!(IMG_ASCIA.complete&&IMG_ASCIA.naturalWidth))return;
  gg.save();gg.translate(hx,hy);if(flip)gg.scale(-1,1);gg.rotate(ang);gg.drawImage(IMG_ASCIA,-17,-1);gg.restore()}
function stella(gg,x,y,k){   // luccichio: croce di luce che pulsa
  if(k<=0)return;const L=Math.round(1+k*3);gg.globalAlpha=Math.min(1,.35+k);
  R(x-L,y,L*2+1,1,'#fff6d0');R(x,y-L,1,L*2+1,'#fff6d0');R(x,y,1,1,'#ffffff');gg.globalAlpha=1}

/* ---------------- (16 nov) la gatta Mia: compare da destra, cammina tranquilla, si ferma al centro, si gira verso di noi, miagola, riprende e sparisce a sinistra ---------------- */
const MIA={fatto:false};
function vaiLibero(m,x,y){return new Promise(r=>{m.path=[[x,y]];m.arrivo=null;const iv=setInterval(()=>{if(!m.path.length){clearInterval(iv);r()}},60)})}
/* (17 nov) quando Mia miagola Nick si toglie il cappello e si gratta la testa (pose cap_1..5 dall'atlante) */
function gagCappello(s){const p=s.giocatore;if(!p||!p.has||!p.has('cap_1'))return;
  p.fermaCamminata&&p.fermaCamminata(false);p.dir='S';p.axe=false;p.state='act';
  p.seq=[['cap_1',.55],['cap_2',.5],['cap_3',.42],['cap_4',.42],['cap_3',.42],['cap_2',.42],['cap_4',.42],['cap_5',.7],['#',0]];p.si=0;p.st=0;
  FIATO.suona('protagonista-esterno','sorpresa',1,1);setTimeout(()=>FIATO.suona('protagonista-esterno','dubbio',1,.9),1500)}
async function passaMia(s){
  const m=s.attori&&s.attori.mia;if(!m){MIA.fatto=true;return}
  m.x=262;m.y=116;m.dir='W';m.corsa=false;m.vel=22;m.visibile=true;
  await vaiLibero(m,122,116);                       // attraversa fino al centro
  m.dir='S';await pausa(.7);                        // si gira verso chi guarda
  try{A.motore.suonaClip('audio/versi/miao_mia_v3.mp3')}catch(e){}
  gagCappello(s);
  m.talking=true;const iv=setInterval(()=>{m.bocca=1+Math.floor(Math.random()*4)},120);await pausa(1.4);clearInterval(iv);m.talking=false;m.bocca=1;
  await pausa(.6);m.dir='W';
  await vaiLibero(m,-40,116);m.visibile=false;MIA.fatto=true}
const FANGO=[];   // schizzi di fango durante lo scavo

registraScena({
  id:'c2-esterno',inventario:true,
  giocatore:'protagonista-esterno',nomeGiocatore:'NICK',
  partenza:{x:152,y:98,dir:'S'},
  attori:[{nome:'mia',etichetta:'MIA',x:262,y:116,dir:'W'}],   // (16 nov) la gatta Mia attraversa la scena prima della partenza
  area:[[2,96],[238,96],[238,119],[2,119]],
  ostacoli:[[[2,99],[78,99],[78,114],[2,114]],[[204,96],[232,96],[232,101],[204,101]]],
  rif:[107,1.047],audioPassi:false,   // (15 nov) prospettiva: a y=107 Nick ha scala 1,047 (33 px) -> orizzonte y~75,8; la scala cresce scendendo, come l'auto   // (12 nov) fuori dalla baita i passi non fanno rumore
  superficie:'fango',superfici:[{poly:[[138,104],[186,104],[186,111],[138,111]],tipo:'pozzanghera'},{poly:[[78,96],[112,96],[112,101],[78,101]],tipo:'pozzanghera'}],
  ambiente:{stanza:0,vento:.5,foglie:1,aria:.35,pioggia:0,fuoco:0},
  aggiorna(s,dt){ambienteGiorno(dt,false)},
  suggerimento:'',
  disegnaSfondo(gg){const im=C2.ascia?BG_EST2:BG_EST;if(im.complete&&im.naturalWidth)gg.drawImage(im,0,0,W,H);else R(0,0,W,H,'#3a5a7a')},
  oggetti:[{baseY:112,disegna(gg){AUTO.sc=PROSP.disegnaAuto(gg,IMG_AUTO34,YH_EST,AUTO.xs,AUTO.ys,21.4)||AUTO.sc}}],
  scatolaAuto:()=>PROSP.scatola(YH_EST,AUTO.xs,AUTO.ys,21.4),
  sotto(gg,s){
    if(AUTO.sc)ell((AUTO.sc.x0+AUTO.sc.x1)/2,AUTO.sc.y1-1,(AUTO.sc.x1-AUTO.sc.x0)*.52,2.5,'#05060a',.4);   // ombra dell'auto
    if(!C2.chiavi&&C2.tw){const k=Math.max(0,Math.sin(s.t*2.6))**6;stella(gg,POZ.x,POZ.y,k)}},   // luccichio nel fango
  sopra(gg,s){
    const p=s.giocatore;if(!p)return;
    for(let i=FANGO.length-1;i>=0;i--){const f=FANGO[i];f.t+=1/60;f.x+=f.vx/60;f.y+=f.vy/60;f.vy+=90/60;if(f.t>.7){FANGO.splice(i,1);continue}R(Math.round(f.x),Math.round(f.y),1,1,f.c)}
    p.axe=C2.ascia>0;   // (15 nov) l'ascia e' nelle pose di Nick ('_axe'): camminata, fermo, ascia sollevata (crouch) e abbassata sul fango (reach)
    },
  senzaEtichette:true,   // (16 nov) niente scritte sugli oggetti ("la pozzanghera", "l'ascia"...)
  /* le chiavi (dopo lo scavo) stanno nell'inventario: si trascinano sull'auto */
  hintTargets:(s,id)=>id==='chiavi'&&AUTO.sc?[[Math.round(AUTO.sc.x0),Math.round(AUTO.sc.y0),Math.round(AUTO.sc.x1-AUTO.sc.x0),Math.round(AUTO.sc.y1-AUTO.sc.y0)]]:[],
  dropItem:(s,id,x,y)=>{
    const c=AUTO.sc;if(id!=='chiavi'||!c||s.occupato||!MIA.fatto||x<c.x0-3||x>c.x1+3||y<c.y0-3||y>c.y1+3){A.sfx.no();return}
    const p=s.giocatore;A.removeItem('chiavi');sfx.chiavi();
    s.sequenza(async()=>{await p.vaiA(Math.min(94,c.x1+10),110,false,'W');p.dir='W';await pausa(.35);sfx.portaApre&&sfx.portaApre();s.vaiScena('c2-auto')})},
  punti:[
    {nome:'LA POZZANGHERA',rect:[140,101,46,11],cammina:{x:156,y:110,dir:'E'},visibile:()=>C2.tw&&!C2.chiavi,usa:async(s,p)=>{
      if(!C2.ascia){A.say(C2.visto?"Come le recupero senza sporcarmi?":"Le chiavi dell'auto! Ma sono immerse nel fango. Come le recupero senza sporcarmi?");C2.visto=true}}},
    {nome:'ASCIA',rect:[204,70,32,22],cammina:{x:206,y:104,dir:'E'},visibile:()=>C2.visto&&!C2.ascia&&!C2.chiavi,usa:async(s,p)=>{   // (17 nov) l'ascia si puo' usare solo DOPO aver capito che le chiavi sono nella pozzanghera (C2.visto)
      /* (16 nov) un solo tocco: Nick va all'ascia, la prende, va alla pozzanghera e scava, senza pause ne' frasi da aspettare */
      C2.visto=true;A.say("L'ascia! È lo strumento ideale.");
      p.dir='E';p.pickUp();await pausa(.45);C2.ascia=1;sfx.raccogli();A.sting('tonfo');await pausa(.55);
      const ok=await p.vaiA(150,110,false,'E');if(!ok)return;p.dir='E';
      // smuove la terra: ascia sollevata (crouch) e abbassata sul fango (reach), con schizzi di fango
      C2.ascia=2;const N=4;p.state='act';p.seq=[];for(let i=0;i<N;i++)p.seq.push(['crouch',.32],['reach',.42]);p.seq.push(['crouch',.4],['#',0]);p.seq=p.seq.filter(a=>a[0]==='#'||p.has(a[0]));p.si=0;p.st=0;
      for(let i=0;i<N;i++){await pausa(.32+.12);sfx.passo('fango',1);A.nburst(rnd(380,560),1.0,.16,.05,'lowpass',.1,.15);FIATO.suona('protagonista-esterno','scavo',.9,1);for(let j=0;j<6;j++)FANGO.push({x:POZ.x-2+Math.random()*4,y:POZ.y,vx:(Math.random()-.3)*30,vy:-25-Math.random()*25,t:0,c:Math.random()<.5?'#4a3424':'#2e2016'});await pausa(.3)}
      C2.chiavi=true;sfx.chiavi();A.sting('scoperta');A.giveItem('chiavi');   // le chiavi finiscono nell'inventario
      await pausa(.6);C2.ascia=0;
      A.say("Le chiavi! Ora posso andare.");passaMia(s)}}],
  entra(s){
    const p=s.giocatore;FANGO.length=0;A.musicStop(4);MIA.fatto=false;if(s.attori&&s.attori.mia)s.attori.mia.visibile=false;
    s.sequenza(async()=>{
      await pausa(1.0);await p.vaiA(150,106,false,'S');p.dir='S';
      sfx.stoffa();await pausa(.5);sfx.stoffa();await pausa(.3);A.sting('scintilla');
      C2.tw=1;A.say("Le chiavi dell'auto… Non sono nelle tasche.")})}
});

/* ---------------- 4. dentro l'auto (per ora la scena si ferma qui) ---------------- */
const IMG_CAR=mkImg('img/emb/img_car_164.png'),IMG_WHEEL=mkImg('img/emb/img_wheel_164.png');
registraScena({
  id:'c2-auto',area:[[0,0],[2,0],[2,2],[0,2]],   // nessuna camminata
  disegnaSfondo(gg,s){
    // dal parabrezza: il bosco e i monti dello stesso sfondo di giorno, ingranditi
    if(BG_EST2.complete&&BG_EST2.naturalWidth)gg.drawImage(BG_EST2,0,26,120,60,0,0,W,H);else R(0,0,W,H,'#6a9ac8');
    if(IMG_CAR.complete&&IMG_CAR.naturalWidth)gg.drawImage(IMG_CAR,0,0);
    {const d=A.drive;if(d&&d.gauges){d.gauges(.9+.12*Math.sin(s.t*3.1));d.radio(s.t)}}   // (16 nov) quadro strumenti e autoradio accesi, come nella guida notturna
    if(IMG_WHEEL.complete&&IMG_WHEEL.naturalWidth){const hw=IMG_WHEEL.naturalWidth,hh=IMG_WHEEL.naturalHeight,ws=.62,dw=Math.round(hw*ws),dh=Math.round(hh*ws),cy=Math.round(hh*.47*ws);
      gg.save();gg.translate(68,97);const wx0=-Math.round(dw/2),wy0=-cy;gg.drawImage(IMG_WHEEL,wx0,wy0,dw,dh);gg.drawImage(IMG_WHEEL,0,hh-1,hw,1,wx0,wy0+dh,dw,70);gg.restore()}
    gg.globalAlpha=.10;R(0,0,W,H,'#ffe0a0');gg.globalAlpha=1},   // luce del giorno nell'abitacolo
  ambiente:{stanza:.4,vento:.05,pioggia:0,fuoco:0},
  suggerimento:'',
  entra(s){   // dentro l'auto: Nick dice «Partiamo!», parte il motore, dissolvenza al nero e si passa alle strade di montagna
    s.occupato=true;document.getElementById('bHint').style.display='none';setTimeout(()=>sfx.portaChiude(),300);filmEl().load();setTimeout(()=>sfx.chiavi(),1300);
    s.sequenza(async()=>{
      await pausa(2.2);
      const dit=A.sayP('Partiamo!');A.sting('partenza');await pausa(.9);
      for(let k=0;k<7;k++){A.tone(64+k*3,.2,'sawtooth',.05,80+k*4);await pausa(.17)}   // il motorino d'avviamento
      A.setEng&&A.setEng(.7,true);await pausa(.5);await dit;
      A.fadeTo(1,1.3,()=>{A.setScene('c2-strada');A.fadeTo(0,.9)});await pausa(2)})}
});

/* ---------------- 5. filmato della guida sulla strada alpina (14 nov) ----------------
   Non e' piu' una scena disegnata dal gioco: e' un filmato (video/guida-alpina_r6.mp4, 10 s, H.264) fatto con _strumenti/film_guida.py
   sul dipinto strada-alpi.png: l'auto percorre la strada, la camera la segue. Si sovrappone all'area di gioco con la riproduzione nativa
   del telefono (muto, inline); il motore si sente col Web Audio del gioco. Se il filmato non parte si passa subito a «CONTINUA…». */
const FILM_SRC='video/guida-alpina_r6.mp4',FILM_SRC2='video/guida-ponte_r5.mp4';   // (16 nov) secondo filmato: la strada lungo il fiume, verso il Ponte del Diavolo (stessa prospettiva e stesso moto, senza foglie)
const FILM_CURVE=[0.03, 0.09, 0.09, 0.09, 0.09, 0.09, 0.28, 0.3, 0.24, 0.36, 0.5, 0.48, 0.17, 0.3, 0.79, 1.21, 1.06, 0.34, 0.48, 1.2, 1.82, 1.96, 1.24, 0.23, 0.08, 0.86, 1.85, 0.83, 0.54, 2.08, 6.72, 23.71, 5.1, 4.03, 3.98, 3.98, 3.98, 3.98];   // quanto la strada gira, ogni 8 fotogrammi: guida il suono del motore
const FILM_CURVE2=[0.71,0.7,0.64,0.63,0.62,0.62,0.62,0.62,0.62,0.62,0.62,0.62,0.62,0.62,0.62,0.62,0.6,0.58,0.59,0.6,0.62,0.64,0.67,0.7,0.73,0.78,0.83,0.9,0.99,1.13,1.34,1.76,3.08,4.15,4.2,4.21,4.21,4.21];
const FILM={el:null,partito:false,finito:false,t0:0,i:0,curva:null};
const FILM_LISTA=[{src:FILM_SRC,curva:FILM_CURVE},{src:FILM_SRC2,curva:FILM_CURVE2}];
function filmAvvia(s,i){const v=filmEl();FILM.i=i;FILM.partito=false;FILM.finito=false;FILM.t0=performance.now();FILM.curva=FILM_LISTA[i].curva;
  v.onended=()=>filmFine(s);v.onerror=()=>filmFine(s);if(v.getAttribute('src')!==FILM_LISTA[i].src){v.src=FILM_LISTA[i].src;v.load()}
  filmPosiziona(v);v.style.display='block';try{v.currentTime=0}catch(e){}const p=v.play();if(p&&p.catch)p.catch(()=>filmFine(s))}
function filmEl(){
  if(FILM.el)return FILM.el;
  const v=document.createElement('video');v.src=FILM_SRC;v.muted=true;v.defaultMuted=true;v.playsInline=true;v.preload='auto';v.controls=false;
  v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');v.setAttribute('muted','');v.setAttribute('disablepictureinpicture','');
  v.style.cssText='position:absolute;display:none;z-index:4;background:#000;pointer-events:none;image-rendering:pixelated;object-fit:fill';
  A.wrap.appendChild(v);FILM.el=v;return v}
function filmPosiziona(v){   // lo stesso rettangolo in cui il gioco disegna la scena (240x120 logici)
  const r=A.cv.getBoundingClientRect(),w=A.wrap.getBoundingClientRect(),vw=A.view(),k=vw.k;
  v.style.left=(r.left-w.left+(r.width-vw.DW*k)/2+vw.OX*k)+'px';v.style.top=(r.top-w.top+(r.height-H*k)/2)+'px';v.style.width=(W*k)+'px';v.style.height=(H*k)+'px'}
function filmFine(s){if(FILM.finito)return;FILM.finito=true;if(FILM.i<FILM_LISTA.length-1){FILM.finito=false;filmAvvia(s,FILM.i+1);return}   // (16 nov) a fine del primo filmato parte il secondo, senza tocchi
  A.setEng&&A.setEng(0,false);A.musicStop(3);if(FILM.el)FILM.el.style.display='none';s.vaiScena('c2-ponte',{x:200,y:108,dir:'W'})}   // (17 nov) dopo i filmati: Nick e' fuori, al Ponte del Diavolo
registraScena({
  id:'c2-strada',canSkip:()=>!FILM.finito,skip:s=>{try{FILM.el&&FILM.el.pause()}catch(e){}FILM.i=FILM_LISTA.length-1;FILM.finito=false;filmFine(s)},area:[[0,0],[2,0],[2,2],[0,2]],suggerimento:'',
  ambiente:{stanza:0,vento:.3,pioggia:0,fuoco:0},
  disegnaSfondo(gg){R(0,0,W,H,'#000')},
  entra(s){
    A.say('');s.occupato=true;document.getElementById('bHint').style.display='none';filmAvvia(s,0);
    A.setEng&&A.setEng(.7,true);A.musicStart('viaggio',3)},   // (16 nov) musica di viaggio autunnale, anni '80, sotto il filmato
  aggiorna(s,dt){
    const v=FILM.el;if(!v||FILM.finito)return;filmPosiziona(v);
    if(v.currentTime>.05)FILM.partito=true;
    if(!FILM.partito&&performance.now()-FILM.t0>6000)return filmFine(s);   // non e' partito: si va avanti
    if(v.ended||(v.duration>0&&v.currentTime>=v.duration-.04))return filmFine(s);
    const cv_=FILM.curva||FILM_CURVE,c=cv_[Math.min(cv_.length-1,Math.floor(v.currentTime*30/8))]||0;
    A.engHz&&A.engHz(36+22*Math.min(1,c)+1.5*Math.sin(s.t*2.2))}   // (16 nov) il rombo segue la curva e non si ferma mai
});

/* ---------------- (17 nov) Ponte del Diavolo (var3): Nick e' fuori; a sinistra dei segnali, sulla strada, il furgone dei panini con Doc dentro ----------------
   Prospettiva: l'orizzonte si ricava dai segnali (palo con base y=95, cartello in alto y=40: ~3,2 m) -> orizzonte y=68; Nick a y=95 ha scala 0,907 (30 px).
   Il furgone (sprite 348x223 = 5 m di lunghezza, disegnato a 94 px con un uomo di 33 px) con la base a y=112 ha 27,5 px/m -> scala 1,46 = 137x88 px.
   Doc (atlante: figura alta 128 px) e' dietro il bancone dello sportello: 1,75 m a 27,5 px/m = 48 px; si vede dal petto in su (il bancone lo copre). */
const PONTE={furg:mkImg('img/emb/furgone_panini_hd.png'),YR:95,SR:.907,BASE:108,RUOTE:114,giu:0,df:-1,nf:-1,muto:false,docF:mkImg('img/emb/doc_fusibile_r1.png'),nickF:mkImg('img/emb/nick_fusibile_r1.png'),verso:0,tv:4};
window.__PONTE=PONTE;
function linea(gg,x0,y0,x1,y1,w,c){gg.strokeStyle=c;gg.lineWidth=w;gg.lineCap='square';gg.beginPath();gg.moveTo(Math.round(x0),Math.round(y0));gg.lineTo(Math.round(x1),Math.round(y1));gg.stroke()}
function disegnaFurgone(gg,s){
  const im=PONTE.furg;if(!(im.complete&&im.naturalWidth))return;
  const yh=PROSP.orizzonte(PONTE.YR,PONTE.SR),ppm=(PONTE.BASE-yh)/PROSP.HC,k=ppm*5/348,w=348*k,h=223*k,x0=0,y0=PONTE.RUOTE-212*k;
  gg.drawImage(im,x0,y0,w,h);
  const doc=A.CHARS['doc-ritorno-al-futuro'];if(!doc||!doc.ready||!doc.img.naturalWidth)return;
  const t=s.t,talk=PONTE.verso>0||!!(s.attori['doc-ritorno-al-futuro']&&s.attori['doc-ritorno-al-futuro'].talking),n=talk?'talk_S_'+(1+Math.floor(t*6)%4):'idle_S_'+(1+Math.floor(t*1.2)%4),fr=doc.fr[n]||doc.fr.front;if(!fr)return;
  const ds=ppm*1.75/128,dw=doc.w*ds,dh=doc.h*ds,cx=x0+235*k,top=y0+68*k,fy=top-2*ds+PONTE.giu*42;   // giu: 0 in piedi, 1 inginocchiato dietro il bancone
  if(PONTE.giu>=1)return;   // la testa (riga 2 del fotogramma) sta sotto la tenda
  gg.save();gg.beginPath();gg.rect(x0+190*k,y0+60*k,112*k,(138-60)*k);gg.clip();
  gg.imageSmoothingEnabled=false;
  if(PONTE.df>=0&&PONTE.docF.complete&&PONTE.docF.naturalWidth){const q=PONTE.df===1&&talk?2:PONTE.df;gg.drawImage(PONTE.docF,q*125,0,125,131,cx-69*ds,fy,125*ds,131*ds)}   // pose nuove: 0 fusibile al petto, 1 braccio teso, 2 braccio teso che parla
  else gg.drawImage(doc.img,fr.x,fr.y,doc.w,doc.h,cx-doc.ax*ds,fy,dw,dh);gg.restore()}
/* (18 nov) RUMORI DA OFFICINA / FERRAMENTA dietro il bancone, SENZA note musicali: tutto rumore filtrato, niente toni puliti.
   - colpo di martello su metallo: scoppio di rumore + risonanze strettissime (banda stretta, Q alto) che decadono in fretta = "clang" sordo e secco, piu' un tonfo grave
   - trapano: raffica rauca (rumore + onda quadra bassa modulata a scatti), come un trapano a percussione che morde
   - smerigliatrice: rumore largo e acuto con scintille; cricchetto: serie di scatti; lamiere e utensili che cadono
   forte=true: il primo, fragoroso. */
function rumoriAttrezzi(dur,forte){
  const T=A.tone,N=A.nburst,R_=Math.random,vf=forte?1:.5;
  const clang=(pan,v)=>{N(2500+R_()*2500,.6,.03,.8*v*vf,'highpass',pan,.2);for(const f of [680+R_()*400,1450+R_()*600,2900+R_()*900])N(f,22,.12+R_()*.1,.5*v*vf,'bandpass',pan,.25);T(70,.12,'sine',.35*v*vf,38,pan,.1)};
  const maglio=(pan)=>{clang(pan,1);if(forte)setTimeout(()=>clang(-pan,.5),70)};
  const trapano=(pan)=>{for(let i=0;i<10;i++)setTimeout(()=>{T(150+R_()*20,.07,'square',.1*vf,170,pan,.1);N(1800+R_()*900,1.2,.07,.28*vf,'bandpass',pan,.1)},i*70)};
  const smeriglio=(pan)=>{N(4200,.5,1.2,.3*vf,'bandpass',pan,.2);N(9000,.5,1.1,.14*vf,'highpass',pan,.2);for(let i=0;i<12;i++)setTimeout(()=>N(6000+R_()*4000,3,.02,.3*vf,'highpass',pan,.1),i*95)};
  const cricchetto=(pan)=>{for(let i=0;i<8;i++)setTimeout(()=>{N(3000+R_()*600,6,.015,.4*vf,'bandpass',pan,.05);N(900,4,.02,.25*vf,'bandpass',pan,.05)},i*60)};
  const lamiera=(pan)=>{N(1100,.7,.35,.35*vf,'bandpass',pan,.35);for(let i=0;i<7;i++)setTimeout(()=>N(1200+R_()*3000,12,.06,.4*vf,'bandpass',pan,.3),i*60+R_()*30)};
  const cadutaUtensile=(pan)=>{clang(pan,.6);setTimeout(()=>clang(pan,.35),130);setTimeout(()=>clang(pan,.2),250)};
  const fondo=()=>{for(let k=0;k<Math.ceil(dur/.45);k++)setTimeout(()=>{N(110+R_()*30,.7,.6,.22*vf,'lowpass',0,.1)},k*450)};fondo();   // brontolio di fondo dell'officina
  let t=.1,ritmo=forte?.45:.6;
  while(t<dur){const r=R_(),pan=(R_()*2-1)*.35;
    if(r<.42){const n=forte?3+Math.floor(R_()*4):2+Math.floor(R_()*2);for(let q=0;q<n;q++)setTimeout(()=>maglio(pan),(t+q*ritmo*.6)*1000);t+=n*ritmo*.6+.2}
    else if(r<.6){setTimeout(()=>trapano(pan),t*1000);t+=.85}
    else if(r<.72){setTimeout(()=>smeriglio(pan),t*1000);t+=1.2}
    else if(r<.82){setTimeout(()=>cricchetto(pan),t*1000);t+=.6}
    else if(r<.92){setTimeout(()=>cadutaUtensile(pan),t*1000);t+=.6}
    else{setTimeout(()=>lamiera(pan),t*1000);t+=.6}
    ritmo=Math.max(.3,ritmo*.97)}}
/* Nick di spalle che prende il fusibile (pose nuove nick_fusibile_r1: 0 fermo, 1 mano aperta, 2 con il fusibile): disegnato al posto dello sprite normale, stessa scala e stessi piedi */
function disegnaNickFusibile(gg,s){const p=s.giocatore,im=PONTE.nickF;if(!p||PONTE.nf<0||!(im.complete&&im.naturalWidth))return;
  const sc=p.scala()/RS,dw=124*sc,dh=130*sc;ell(p.x,p.y,dw*.2,Math.max(1,dh*.035),'#000',.38);
  gg.save();gg.imageSmoothingEnabled=false;gg.drawImage(im,PONTE.nf*124,0,124,130,Math.round((p.x-65*sc)*RS)/RS,Math.round((p.y-dh)*RS)/RS,dw,dh);gg.restore()}
async function giuDoc(a,b,dur){const n=Math.max(1,Math.round(dur/.04));for(let i=0;i<=n;i++){PONTE.giu=a+(b-a)*(i/n);await pausa(.04)}}
async function scenaPanino(s){
  const p=s.giocatore,d=s.attori['doc-ritorno-al-futuro'];PONTE.muto=true;
  await pausa(.6);await p.vaiA(54,118,false,'S');p.dir='S';await pausa(.7);
  if(!/[?&]consegna/.test(location.search)){   // link diretto ?c2-ponte&consegna: parte dalla consegna del fusibile
  await s.dici(p,'Ho fatto tutti quei chilometri per niente… Ma cosa mi è passato per la testa?',{});     // guarda verso il giocatore
  await pausa(.4);p.dir='N';await pausa(.6);
  await s.dici(p,'Ho anche una fame da lupi. Mi mangerò un panino.',{frontale:false});
  await pausa(.5);await s.dici(p,'Un hamburger triplo con formaggio e cetriolini, per favore.',{frontale:false});
  await s.dici(d,'Subito!',{});
  await giuDoc(0,1,.7);                              // si inginocchia dietro il bancone e sparisce
  rumoriAttrezzi(10,true);await pausa(2.2);
  p.dir='S';gagCappello(s);await pausa(5.2);          // Nick guarda il giocatore e si toglie il cappello, come con la gatta
  p.dir='N';await pausa(2.8);
  await giuDoc(1,0,.6);
  await s.dici(d,'Niente da fare, non arriva gas alla piastra. Il flusso canalizzatore sta facendo di nuovo le bizze.',{});
  await s.dici(p,'Flusso canalizzatore? Ma di che parli? Io voglio il mio panino!',{frontale:false});
  await s.dici(d,'È un macchinario di mia invenzione, serve a far arrivare il gas dall\'altra parte del ponte senza bisogno di tubi!',{});
  await s.dici(p,'Non facevi prima a parcheggiare il furgone dall\'altra parte del ponte?',{frontale:false});
  await s.dici(d,'Grande Giove! È un\'idea geniale! Ma così non avrei potuto testare il mio macchinario!',{});
  await s.dici(p,'Vabbè, io ho fame, che si fa?',{frontale:false});
  await s.dici(d,'Io non posso lasciare il furgone incustodito. Fammi un favore: vai dall\'altra parte del ponte, scendi le scale e…',{});
  await giuDoc(0,1,.5);rumoriAttrezzi(1.3,false);await pausa(1.4);await giuDoc(1,0,.5);   // sparisce un attimo (rovista) e ricompare con un fusibile in mano
  }
  else await giuDoc(0,1,.1),await giuDoc(1,0,.4);
  PONTE.df=0;await pausa(.5);PONTE.df=1;await pausa(.45);   // Doc tende il braccio con il fusibile in mano
  await s.dici(d,'Cambia questo fusibile al flusso canalizzatore, tutto riprenderà a funzionare come prima.',{});
  p.visibile=false;PONTE.nf=0;await pausa(.3);PONTE.nf=1;await pausa(.5);   // poi Nick, sempre di spalle, tende il braccio...
  PONTE.nf=2;PONTE.df=-1;await pausa(.9);                                      // ...e prende il fusibile in mano (Doc ritira il braccio)
  PONTE.nf=0;await pausa(.6);PONTE.nf=-1;p.visibile=true;p.dir='N';await pausa(.3);
  A.sting('scoperta',.7);A.giveItem('fusibile');C2.fusibile=true;PONTE.muto=false;PONTE.tv=4;
  await pausa(1.6);s.vaiScena('c2-ponte-film',{x:188,y:116,dir:'N'})}   // si avvia verso il ponte: filmato
registraScena({
  id:'c2-ponte',inventario:true,sfondo:'img/scene/ponte-diavolo-var3.png',
  giocatore:'protagonista-esterno',nomeGiocatore:'NICK',
  attori:[{nome:'doc-ritorno-al-futuro',etichetta:'DOC',x:-50,y:-50,dir:'S',visibile:false}],   // solo per caricare l'atlante: Doc e' disegnato dentro il furgone
  partenza:{x:200,y:108,dir:'W'},
  area:[[2,117],[146,117],[146,99],[238,99],[238,119],[2,119]],
  ostacoli:[],
  rif:[PONTE.YR,PONTE.SR],audioPassi:false,
  ambiente:{stanza:0,vento:.45,foglie:.4,aria:.35,pioggia:0,fuoco:0},
  aggiorna(s,dt){ambienteGiorno(dt,false);const d=s.attori['doc-ritorno-al-futuro'];if(d)d.visibile=false;
    // Doc non e' interagibile: fa solo dei versetti in sottofondo, con la sua voce
    PONTE.tn=(PONTE.tn??6)-dt;if(PONTE.tn<=0&&!C2.ponteDetto){PONTE.tn=7+Math.random()*6;FIATO.suona('protagonista-esterno',Math.random()<.5?'dubbio':'sospiro',1,.8)}
    if(PONTE.verso>0)PONTE.verso-=dt;PONTE.tv-=dt;if(PONTE.tv<=0&&!PONTE.muto){PONTE.tv=5+Math.random()*7;PONTE.verso=1.1;const t=['sforzo','sorpresa','dubbio','sospiro','sforzo'];FIATO.suona('doc-ritorno-al-futuro',t[Math.floor(Math.random()*t.length)],1,.55)}
    const p=s.giocatore;if(p&&C2.ponteDetto&&!C2.ponteVisto&&!s.occupato&&p.x<10){C2.ponteVisto=true;s.vaiScena('c2-ponte-vista',{x:226,y:112,dir:'W'})}},
  suggerimento:'',senzaEtichette:true,
  sopra(gg,s){disegnaNickFusibile(gg,s);if(C2.ponteDetto&&!C2.ponteVisto&&Math.floor(s.t*2.2)%2===0){   // freccia lampeggiante a sinistra: da li' si va al ponte
      const dx=Math.round(Math.sin(s.t*5)*1.5);gg.save();gg.translate(dx,0);
      for(const [c,o] of [['#05060a',1],['#ffd23a',0]]){gg.fillStyle=c;gg.beginPath();gg.moveTo(3-o,52);gg.lineTo(14,45-o);gg.lineTo(14,49);gg.lineTo(25+o,49);gg.lineTo(25+o,55);gg.lineTo(14,55);gg.lineTo(14,59+o);gg.closePath();gg.fill()}
      gg.restore()}},
  oggetti:[{baseY:PONTE.RUOTE,disegna(gg,s){disegnaFurgone(gg,s)}}],
  entra(s){fadeTo(0,2.5);const p=s.giocatore;
    if(/[?&](panino|consegna)/.test(location.search)&&!C2.fusibile)C2.ponteVisto=true;   // link diretto ?c2-ponte&panino: salta alla scena del panino e del fusibile
    if(C2.ponteVisto&&!C2.fusibile){s.sequenza(()=>scenaPanino(s))}   // tornato dal ponte: la scena del panino
    else if(!C2.ponteVisto)s.sequenza(async()=>{await pausa(1.0);C2.ponteDetto=true;await dn(s,p,'Vediamo se il mio sogno aveva ragione.')})},   // subito: parla e compare la freccia
  punti:[{nome:'',rect:[0,36,56,46],cammina:{x:5,y:118,dir:'W'},visibile:()=>C2.ponteDetto&&!C2.ponteVisto,usa:async(s,p)=>{C2.ponteVisto=true;s.vaiScena('c2-ponte-vista',{x:226,y:112,dir:'W'})}}]
});

/* la visuale del Ponte del Diavolo senza simbolo: a sinistra del furgone */
registraScena({
  id:'c2-ponte-vista',inventario:true,sfondo:'img/scene/ponte-senza-simboli.png',
  giocatore:'protagonista-esterno',nomeGiocatore:'NICK',
  partenza:{x:226,y:112,dir:'W'},
  area:[[2,114],[100,114],[130,108],[238,104],[238,119],[2,119]],ostacoli:[],
  rif:[112,1],audioPassi:false,
  ambiente:{stanza:0,vento:.35,foglie:.2,aria:.4,pioggia:0,fuoco:0},
  aggiorna(s,dt){ambienteGiorno(dt,false)},
  suggerimento:'',senzaEtichette:true,
  entra(s){fadeTo(0,2);const p=s.giocatore;
    s.sequenza(async()=>{await pausa(.4);await p.vaiA(150,112,false,'N');p.dir='N';await pausa(2.2);
      for(const t of ['Nulla…','Che stupido!','Sono venuto sin qui… cosa mi aspettavo di trovare?','Per uno stupido sogno…'])await dn(s,p,t);
      FIATO.suona('protagonista-esterno','sospiro',1,.9);await pausa(.8);
      s.vaiScena('c2-ponte',{x:6,y:118,dir:'E'})})}
});

/* ---------------- (18 nov) FILMATO: il Ponte del Diavolo (var2) ----------------
   Vista dall'imbocco: la strada del ponte sale e si restringe verso il fondo. Camera a foro stenopeico: orizzonte y=40 (punto di fuga del ponte), F=330, 1,6 m;
   ogni punto del pavimento e' (profondita' Z in m, corsia f tra bordo sinistro e destro): y = 40 + F*1,6/Z, x = bordo sx(y) + (bordo dx - bordo sx)*f.
   Lara cammina verso di noi sul lato destro (f=.62), Nick va nel verso opposto sul lato sinistro (f=.30), a 1,6 m/s: scala e passo seguono la prospettiva
   (rif [100,2.016] = orizzonte 40). Si incontrano a meta' ponte: Lara dice "Ehilà!" (voce vera) e prosegue fino a sparire a destra; Nick si ferma, si volta e commenta. */
const PF={F:330,HC:1.6,YH:40,V:1.6};
const BORDO_SX=[[40,102],[48,108],[60,113],[75,128],[90,136],[120,138]];
function bordoSx(y){const P=BORDO_SX;if(y<=P[0][0])return P[0][1];for(let i=1;i<P.length;i++)if(y<=P[i][0])return P[i-1][1]+(P[i][1]-P[i-1][1])*(y-P[i-1][0])/(P[i][0]-P[i-1][0]);return P[P.length-1][1]}
const bordoDx=y=>112+(y-45)/.37;
const yZ=z=>PF.YH+PF.F*PF.HC/z;
function corsia(z,f){const y=yZ(z),l=bordoSx(y),r=bordoDx(y);return [l+(r-l)*f,y]}
const FP={};
const LARA_WALK=mkImg('img/emb/lara_walk_r1.png');   // camminata vera (8 pose, gambe che alternano): sostituisce le walk_S dell'atlante, che erano 4 pose ripetute con la stessa gamba avanti
function muovi(p,z,f,dir,fermo,dt){const [x,y]=corsia(z,f);p.x=x;p.y=y;p.dir=dir;
  if(fermo){p.state='idle';return}p.state='walk';p.v=1;p.bob=p.n==='lara-croft'?1.5:1.0;p.fase+=PF.V*(dt||1/30)/1.5}   // (18 nov) il ciclo del passo (due passi = 1,5 m) avanza con la distanza REALE percorsa: la camminata si vede anche in lontananza
registraScena({
  id:'c2-ponte-film',sfondo:'img/scene/ponte-diavolo-var2.png',
  giocatore:'protagonista-esterno',nomeGiocatore:'NICK',partenza:{x:188,y:116,dir:'N'},
  attori:[{nome:'lara-croft',etichetta:'LARA',x:140,y:60,dir:'S'}],
  area:[[0,0],[2,0],[2,2],[0,2]],rif:[100,2.016],audioPassi:false,
  ambiente:{stanza:0,vento:.35,foglie:.3,aria:.4,pioggia:0,fuoco:0},suggerimento:'',senzaEtichette:true,
  entra(s){Object.assign(FP,{patch:false,t:0,zn:6.95,zl:33,incontro:false,laraFine:false,nickFermo:false,fine:false});s.occupato=true;document.getElementById('bHint').style.display='none';fadeTo(0,1.2)},
  aggiorna(s,dt){
    const n=s.giocatore,l=s.attori['lara-croft'];if(!n||!l)return;FP.t+=dt;
    if(!FP.patch&&LARA_WALK.complete&&LARA_WALK.naturalWidth&&l.c&&l.c.ready){FP.patch=true;const c0=l.c,fr={...c0.fr};for(let i=0;i<8;i++)fr['walk_S_'+(i+1)]={x:i*c0.w,y:0,w:c0.w,h:c0.h};l.c={...c0,img:LARA_WALK,fr}}
    if(FP.t<.7){muovi(n,FP.zn,.30,'N',true);muovi(l,FP.zl,.62,'S',true);return}
    if(!FP.nickFermo){FP.zn+=PF.V*dt;muovi(n,FP.zn,.30,'N',false,dt)}else{n.state='idle'}
    if(!FP.laraFine){FP.zl-=PF.V*dt;muovi(l,FP.zl,.62+.16*Math.max(0,Math.min(1,(yZ(FP.zl)-108)/14)),'S',false,dt);if(l.x>246){FP.laraFine=true;l.visibile=false}}
    if(!FP.incontro&&FP.zn>=FP.zl-.3){FP.incontro=true;FP.nickFermo=true;
      s.dici(l,'Ehilà!',{clip:'audio/versi/lara_ehila_r1.mp3',frontale:false});   // (voce vera) Lara saluta e continua a camminare
      s.sequenza(async()=>{await pausa(1.1);n.dir='S';await pausa(.7);await s.dici(n,'Eppure mi pare di averla già vista.',{});await pausa(1.4);FP.fine=true;s.vaiScena('c2-scale',{x:150,y:60,dir:'S'})})}}   // (18 nov) vaiScena fa gia' la sua dissolvenza: una dissolvenza in piu' bloccava il passaggio alle scale
});

/* ---------------- (18 nov) FILMATO: Nick scende le scale (var1) ----------------
   Camera alta, dall'alto della scalinata: la rampa scende in diagonale verso l'alto-sinistra dello schermo (si allontana dalla camera) e finisce nello spiazzo.
   Nick parte dalla CIMA (in basso, vicino alla camera: grande), scende la rampa verso SINISTRA (pose di profilo dall'alto, un abbassamento a ogni gradino), in fondo GIRA e
   va verso il CENTRO dello spiazzo (pose da dietro e dall'alto). Altezza: ~35 px in cima, ~25 px nello spiazzo (stessa prospettiva dello sfondo).
   Pose: nick_scale_r2.png (ChatGPT gventroni, _strumenti/c2_nick_scale2.py): celle 0-3 profilo sinistro che scende, 4-7 da dietro che cammina. */
const NS={img:mkImg('img/emb/nick_scale_r2.png'),t:0,fine:false};
const NS_PERCORSO=[[138,117],[104,101],[76,87],[86,77],[104,67],[121,60]];   // cima della rampa -> fondo della rampa -> centro dello spiazzo
const NS_RAMPA=2;   // indice del punto in cui finisce la rampa (qui Nick gira)
function nsPos(d){let acc=0;for(let i=1;i<NS_PERCORSO.length;i++){const a=NS_PERCORSO[i-1],b=NS_PERCORSO[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<=acc+L){const u=(d-acc)/L;return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,i-1,acc]}acc+=L}const e=NS_PERCORSO[NS_PERCORSO.length-1];return [e[0],e[1],NS_PERCORSO.length,acc]}
const NS_LUNG=NS_PERCORSO.reduce((t,p,i)=>i?t+Math.hypot(p[0]-NS_PERCORSO[i-1][0],p[1]-NS_PERCORSO[i-1][1]):0,0);
const NS_V=13.5,NS_T1=1.1,NS_T2=1.2,NS_TC=(NS_LUNG-NS_V*(NS_T1+NS_T2)/2)/NS_V,NS_TOT=NS_T1+NS_TC+NS_T2;   // partenza e arresto morbidi: accelera, va a regime, rallenta
const NS_DTURN=NS_PERCORSO.slice(0,NS_RAMPA+1).reduce((t,p,i)=>i?t+Math.hypot(p[0]-NS_PERCORSO[i-1][0],p[1]-NS_PERCORSO[i-1][1]):0,0);
function nsDist(t){if(t<=0)return 0;if(t<NS_T1)return NS_V*t*t/(2*NS_T1);if(t<NS_T1+NS_TC)return NS_V*NS_T1/2+NS_V*(t-NS_T1);
  const u=t-NS_T1-NS_TC;if(u<NS_T2)return NS_V*NS_T1/2+NS_V*NS_TC+NS_V*(u-u*u/(2*NS_T2));return NS_LUNG}
registraScena({
  id:'c2-scale',sfondo:'img/scene/ponte-diavolo-var1.png',area:[[0,0],[2,0],[2,2],[0,2]],suggerimento:'',senzaEtichette:true,
  ambiente:{stanza:0,vento:.25,foglie:.1,aria:.3,pioggia:0,fuoco:0},
  entra(s){NS.t=0;NS.fine=false;s.occupato=true;document.getElementById('bHint').style.display='none';A.say('');fadeTo(0,1.2)},
  aggiorna(s,dt){NS.t+=dt;if(!NS.fine&&NS.t>.8+NS_TOT+2.2){NS.fine=true;fadeTo(1,1.4,()=>{A.setHint('CONTINUA…',true)})}},
  sopra(gg,s){
    const im=NS.img;if(!(im.complete&&im.naturalWidth))return;const tt=Math.max(0,NS.t-.8),d=nsDist(tt),[x,y0,seg]=nsPos(d),camminando=tt>0&&tt<NS_TOT-.05;
    const hLog=22+(y0-40)*.17,sc=hLog/34,w=120/RS*sc,h=150/RS*sc;
    const passoR=d/15,passoD=d/19,rampa=d<NS_DTURN;   // una mezza falcata ogni ~7,5 px sulla rampa (un gradino), ~9,5 px sul piano
    const dip=camminando?(rampa?Math.abs(Math.sin(passoR*Math.PI*2))*1.7:Math.abs(Math.sin(passoD*Math.PI*2))*.6):0;
    const ox=x,oy=y0+dip*sc;ell(ox,oy+.6,7*sc,2*sc,'#000',.35);
    const disegna=(f,a)=>{gg.globalAlpha=a;gg.imageSmoothingEnabled=false;gg.drawImage(im,f*120,0,120,150,Math.round(ox-w/2),Math.round(oy-h+sc),w,h)};
    gg.save();
    const fP=camminando||d<NS_DTURN?Math.floor(passoR*4)%4:0,fD=4+(camminando?Math.floor(passoD*4)%4:0);
    if(d<NS_DTURN)disegna(fP,1);
    else if(d<NS_DTURN+9){const u=(d-NS_DTURN)/9;disegna(fP,1-u);disegna(fD,u)}   // la svolta: dissolvenza dalle pose di profilo a quelle da dietro
    else disegna(fD,1);
    gg.restore()}
});

/* (18 nov) il LIBRO resta nell'inventario per tutta la durata del gioco: ogni scena del capitolo 2 controlla che ci sia (anche se si entra da un link diretto) */
function assicuraLibro(){const S=A.S;if(S&&S.inv&&!S.inv.includes('book')){S.inv.unshift('book');S.bookOpen=true;if(A.refreshInv)A.refreshInv()}}
for(const id of ['capitolo2','c2-esterno','c2-auto','c2-strada','c2-ponte','c2-ponte-vista','c2-ponte-film','c2-scale']){const sc=scenes[id];if(sc&&sc.cfg){const e=sc.cfg.entra;sc.cfg.entra=function(s){assicuraLibro();return e?e.call(this,s):undefined}}}
/* da fine capitolo 1 (sogno) al capitolo 2 */
window.__capitolo2=A.capitolo2=()=>{for(const k in C2)C2[k]=typeof C2[k]==='boolean'?false:0;fadeTo(1,1.8,()=>{setScene('capitolo2');fadeTo(0,9)})};   // (14 nov) la velocita' e' al secondo: 9 = schiarita in un decimo di secondo (prima 0,01: nero per minuti)
});

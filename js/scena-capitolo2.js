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
window.__C2=null;const C2={ritorno:false,ponteDetto:false,ponteVisto:false,sveglio:false,specchio:false,pensato:false,visto:false,ascia:0,scavo:0,chiavi:false,tw:0};   // stato del capitolo 2
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
  }else if(!(C2.ritorno||C2.finale||C2.corsaFinale)){   // (19 nov) dalla corsa sul ponte in poi niente "folate tra gli abeti" e fruscio di foglie: non c'entrano con il ponte di pietra
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
const IMG_AUTO34=mkImg('img/emb/auto164_34retro_hd.png');   // (18 nov) versione ad alta risoluzione (420 px), come gli sfondi a 480x240
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
function gagCappello(s,muto){const p=s.giocatore;if(!p||!p.has||!p.has('cap_1'))return;
  p.fermaCamminata&&p.fermaCamminata(false);p.dir='S';p.axe=false;p.state='act';
  p.seq=[['cap_1',.55],['cap_2',.5],['cap_3',.42],['cap_4',.42],['cap_3',.42],['cap_2',.42],['cap_4',.42],['cap_5',.7],['#',0]];p.si=0;p.st=0;
  if(muto)return;   // con Mia Nick non emette versi: si sente solo il miagolio
  FIATO.suona('protagonista-esterno','sorpresa',1,1);setTimeout(()=>FIATO.suona('protagonista-esterno','dubbio',1,.9),1500)}
async function passaMia(s){
  const m=s.attori&&s.attori.mia;if(!m){MIA.fatto=true;return}
  m.x=262;m.y=116;m.dir='W';m.corsa=false;m.vel=22;m.visibile=true;
  await vaiLibero(m,122,116);                       // attraversa fino al centro
  m.dir='S';await pausa(.7);                        // si gira verso chi guarda
  try{A.motore.suonaClip('audio/versi/miao_mia_v4.mp3',1.2)}catch(e){}
  gagCappello(s,true);
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
    if(AUTO.sc)PROSP.ombraAuto(gg,AUTO.sc);   // ombra dell'auto (la stessa della scena di notte)
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
    if(IMG_CAR.complete&&IMG_CAR.naturalWidth)gg.drawImage(IMG_CAR,0,0,W,H);
    {const d=A.drive;if(d&&d.gauges){d.gauges(.9+.12*Math.sin(s.t*3.1));d.radio(s.t)}}   // (16 nov) quadro strumenti e autoradio accesi, come nella guida notturna
    if(IMG_WHEEL.complete&&IMG_WHEEL.naturalWidth){const hw=IMG_WHEEL.naturalWidth,hh=IMG_WHEEL.naturalHeight,ws=.31,dw=Math.round(hw*ws),dh=Math.round(hh*ws),cy=Math.round(hh*.47*ws);
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
const PONTE={furg:mkImg('img/emb/furgone_panini_hd.png'),YR:95,SR:.907,BASE:108,RUOTE:114,giu:0,df:-1,nf:-1,muto:false,docF:mkImg('img/emb/doc_fusibile_r1.png'),nickF:mkImg('img/emb/nick_fusibile_r1.png'),docA:mkImg('img/emb/doc_attrezzo_r1.png'),nickA:mkImg('img/emb/nick_attrezzo_r1.png'),radio:null,verso:0,tv:4};
PONTE.docF0=PONTE.docF;PONTE.nickF0=PONTE.nickF;window.__PONTE=PONTE;
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
  const T=A.tone,N=A.nburst,R_=Math.random,vf=forte?1.9:.5;   // (18 nov) forte = fragore caotico da officina
  const clang=(pan,v)=>{N(2500+R_()*2500,.6,.03,.8*v*vf,'highpass',pan,.2);for(const f of [680+R_()*400,1450+R_()*600,2900+R_()*900])N(f,22,.12+R_()*.1,.5*v*vf,'bandpass',pan,.25);T(70,.12,'sine',.35*v*vf,38,pan,.1)};
  const maglio=(pan)=>{clang(pan,1);if(forte)setTimeout(()=>clang(-pan,.5),70)};
  const trapano=(pan)=>{for(let i=0;i<10;i++)setTimeout(()=>{T(150+R_()*20,.07,'square',.1*vf,170,pan,.1);N(1800+R_()*900,1.2,.07,.28*vf,'bandpass',pan,.1)},i*70)};
  const smeriglio=(pan)=>{N(4200,.5,1.2,.3*vf,'bandpass',pan,.2);N(9000,.5,1.1,.14*vf,'highpass',pan,.2);for(let i=0;i<12;i++)setTimeout(()=>N(6000+R_()*4000,3,.02,.3*vf,'highpass',pan,.1),i*95)};
  const cricchetto=(pan)=>{for(let i=0;i<8;i++)setTimeout(()=>{N(3000+R_()*600,6,.015,.4*vf,'bandpass',pan,.05);N(900,4,.02,.25*vf,'bandpass',pan,.05)},i*60)};
  const lamiera=(pan)=>{N(1100,.7,.35,.35*vf,'bandpass',pan,.35);for(let i=0;i<7;i++)setTimeout(()=>N(1200+R_()*3000,12,.06,.4*vf,'bandpass',pan,.3),i*60+R_()*30)};
  const cadutaUtensile=(pan)=>{clang(pan,.6);setTimeout(()=>clang(pan,.35),130);setTimeout(()=>clang(pan,.2),250)};
  const fondo=()=>{for(let k=0;k<Math.ceil(dur/.45);k++)setTimeout(()=>{N(110+R_()*30,.7,.6,.22*vf,'lowpass',0,.1)},k*450)};fondo();   // brontolio di fondo dell'officina
  const corsia=(t0,r0)=>{let t=t0,ritmo=r0;
  while(t<dur){const r=R_(),pan=(R_()*2-1)*.35;
    if(r<.42){const n=forte?3+Math.floor(R_()*4):2+Math.floor(R_()*2);for(let q=0;q<n;q++)setTimeout(()=>maglio(pan),(t+q*ritmo*.6)*1000);t+=n*ritmo*.6+.2}
    else if(r<.6){setTimeout(()=>trapano(pan),t*1000);t+=.85}
    else if(r<.72){setTimeout(()=>smeriglio(pan),t*1000);t+=1.2}
    else if(r<.82){setTimeout(()=>cricchetto(pan),t*1000);t+=.6}
    else if(r<.92){setTimeout(()=>cadutaUtensile(pan),t*1000);t+=.6}
    else{setTimeout(()=>lamiera(pan),t*1000);t+=.6}
    ritmo=Math.max(.2,ritmo*.97)}};
  corsia(.1,forte?.32:.6);if(forte){corsia(.25,.27);corsia(.4,.37);setTimeout(()=>{for(let i=0;i<5;i++)setTimeout(()=>cadutaUtensile((R_()*2-1)*.5),i*220)},dur*500)}}
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
/* (18 nov) I DUE BLUES BROTHERS davanti al furgone mangiano (solo nel finale, quando Nick ritorna dal ponte): l'ALTO un hot dog, il BASSO un toast.
   Strisce 8 pose (ChatGPT gventroni, _strumenti/bb_mangia.py): 0 panino in basso, 1 sale, 2 vicino alla bocca, 3 morso, 4 bocca piena, 5-6 mastica (guance gonfie), 7 ridiscende. Piedi sul fondo della cella. */
const BB={alto:{img:mkImg('img/emb/bb_alto_mangia_r1.png'),H:1.85,x:112,f:0},basso:{img:mkImg('img/emb/bb_basso_mangia_r1.png'),H:1.68,x:140,f:1.7}};
const BB_DUR=[1.0,.3,.3,.5,.55,.5,.5,.45],BB_TOT=BB_DUR.reduce((a,b)=>a+b,0);
function disegnaBB(gg,s){if(!C2.corsaFinale)return;const yh=PROSP.orizzonte(PONTE.YR,PONTE.SR),y=117,ppm=(y-yh)/PROSP.HC;
  for(const k of ['alto','basso']){const b=BB[k],im=b.img;if(!(im.complete&&im.naturalWidth))continue;
    if(k==='alto'&&(BBS.dbav||BBS.bigl>=0)){disegnaDanPair(gg,s,ppm);continue}   // (19 nov) Dan: Nick lo afferra / scrive il biglietto (coppia Nick+Dan)
    let t=(s.t+b.f)%BB_TOT,i=0;while(i<7&&t>=BB_DUR[i]){t-=BB_DUR[i];i++}
    const cw=im.naturalWidth/8,ch=im.naturalHeight,hh=b.H*ppm,dw=hh*cw/ch;ell(b.x,y+.4,dw*.4,1.5,'#000',.32);
    gg.save();gg.imageSmoothingEnabled=true;gg.imageSmoothingQuality='high';
    if(k==='basso'&&C2.bav){const g=bavGeom(ppm),j=Math.sin(s.t*38)*.5;ell(g.x0+g.dw*.5,y+.4,g.dw*.45,1.6,'#000',.32);   // Nick afferra John per il bavero (immagine speculare: Nick a destra)
      gg.imageSmoothingEnabled=false;gg.translate(g.x0+j,y-g.hh);gg.scale(-1,1);gg.drawImage(BAV,-g.dw,0,g.dw,g.hh)}
    else gg.drawImage(im,Math.floor(i)*cw,0,cw,ch,b.x-dw/2,y-hh,dw,hh);gg.restore()}}
/* (18 nov) SCONTRO: Nick afferra John per il bavero (ChatGPT gventroni, _strumenti/bb_bavero.py). Immagine originale: Nick a sinistra, John a destra; qui e' speculare (Nick a destra) perche' Nick arriva da destra */
const BAV=mkImg('img/emb/nick_john_bavero_r2.png');
function bavGeom(ppm){const hh=1.86*ppm,dw=hh*103/138,x0=BB.basso.x-dw*.22;return{hh,dw,x0,nx:x0+dw*.73}}
const DAN={nome:'dan',etichetta:'DAN',talking:false,bocca:1},JOHN={nome:'john',etichetta:'JOHN',talking:false,bocca:1};
async function scenaBB(s,p){const yh=PROSP.orizzonte(PONTE.YR,PONTE.SR),ppm=(117-yh)/PROSP.HC,g=bavGeom(ppm),F={frontale:false},Z={frontale:false,animale:true};   // Z = solo scritto (nessun borbottio): i Blues Brothers dicono a voce SOLO "Ehiiii"
  BB.basso.x=140;BBS.dbav=false;BBS.bigl=-1;
  await s.dici(DAN,'Siamo in missione per conto di Dio, mi aspettavo di mangiare qualcosa di meglio.',Z);await pausa(.3);
  await s.dici(JOHN,"Questo toast alle cavallette non è male in fondo! Certo non è la frittura mista di Settimo ma mi accontento!",Z);
  A.sting('scoperta',.5);await pausa(.2);
  await p.vaiA(g.nx,117,true,'W');p.corsa=false;p.visibile=false;C2.bav=true;A.sting('simbolo',.5);   // Nick scatta e lo afferra
  await s.dici(p,"Settimo?! Cos'è Settimo?? Chi è? Rispondi!",F);
  C2.bav=false;p.x=g.nx;p.y=117;p.dir='W';p.visibile=true;await pausa(.4);   // lo rilascia
  await s.dici(JOHN,'Ehiiii…',{clip:'audio/versi/john_ehi_r3.mp3',frontale:false});
  await s.dici(JOHN,'amico, calma, che ti prende? Non ti agitare, ti fa male sai?',F);
  await s.dici(JOHN,"Chi è Settimo dici? Mio fratello qui ci ha lavorato l'anno scorso come lavapiatti.",F);
  await s.dici(JOHN,'In realtà non lavava nulla e i piatti li svuotava, ma sono dettagli.',F);
  await s.dici(p,'Dove si trova?! Che posto è?',F);
  await s.dici(DAN,'Ehiiii…',{clip:'audio/versi/dan_ehi_r3.mp3',frontale:false});
  await s.dici(DAN,'amico, sai, ci ho fatto il lavapiatti lì! Sta giù a Firenze.',F);await scenaDan(s,p,ppm,F,Z)}

/* (19 nov) DAN: Nick lo afferra per il bavero ("A Firenze dove?"), Dan scrive l'indirizzo su un bloc notes e gli da' il BIGLIETTO (finisce nell'inventario).
   Immagini ChatGPT gventroni (_strumenti/bb_dan.py): nick_dan_bavero_r1 (singola) e dan_biglietto_r1 (striscia di 8 coppie, Dan a sinistra, Nick a destra). */
const BBS={dbav:false,bigl:-1};window.__BBS=BBS;
const DANI={bav:mkImg('img/emb/nick_dan_bavero_r2.png'),big:mkImg('img/emb/dan_biglietto_r2.png')};
const DANM={bav:{w:103,h:137,dt:0,db:136,dc:25,nc:76.5},big:{w:119,h:139,dt:1,db:137,dc:26.5,nc:92}};   // cella, testa e piedi di Dan, centro di Dan e di Nick (px dell'immagine)
function danGeom(k,ppm){const m=DANM[k],sc=BB.alto.H*ppm/(m.db-m.dt);return{sc,m,x0:BB.alto.x-m.dc*sc,y0:117-m.db*sc,nx:BB.alto.x+(m.nc-m.dc)*sc}}
function disegnaDanPair(gg,s,ppm){const k=BBS.dbav?'bav':'big',im=DANI[k];if(!(im.complete&&im.naturalWidth))return;
  const g=danGeom(k,ppm),m=g.m,fr=BBS.dbav?0:Math.max(0,BBS.bigl),j=BBS.dbav?Math.sin(s.t*38)*.5:0;
  ell(BB.alto.x+(m.nc-m.dc)*g.sc*.5,117.4,m.w*g.sc*.4,1.6,'#000',.32);
  gg.save();gg.imageSmoothingEnabled=false;gg.drawImage(im,fr*m.w,0,m.w,m.h,g.x0+j,g.y0,m.w*g.sc,m.h*g.sc);gg.restore()}
async function scenaDan(s,p,ppm,F,Z){const gb=danGeom('bav',ppm),gs=danGeom('big',ppm),sm01=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
  await pausa(.3);
  const pr=p.vaiA(gb.nx,119,true,'W');   // Nick corre davanti a John (che si scansa a destra) fino a Dan
  for(let k=1;k<=20;k++){BB.basso.x=140+16*sm01(k/20);await pausa(.045)}
  await pr;p.corsa=false;p.visibile=false;BBS.dbav=true;A.sting('simbolo',.5);
  await s.dici(p,'A Firenze? A Firenze dove? Sii più preciso!',F);
  BBS.dbav=false;BBS.bigl=0;await pausa(.5);   // lo lascia: Dan si aggiusta la giacca
  await s.dici(DAN,'Ehiii.',{clip:'audio/versi/dan_ehi_r3.mp3',frontale:false});
  const DUR=[.7,.7,.7,.8,.9,.7,.9,1.3];   // 0 giacca, 1 mano in tasca, 2 estrae bloc notes e penna, 3-4 scrive, 5 strappa il foglio, 6 porge il biglietto, 7 Nick lo mette in tasca
  const an=(async()=>{for(let i=0;i<8;i++){BBS.bigl=i;if(i===7){A.sting('scoperta',.6);A.giveItem('biglietto')}await pausa(DUR[i])}})();
  await s.dici(DAN,"Stai calmo amico, ti scrivo l'indirizzo.",F);await an;
  BBS.bigl=-1;p.x=gs.nx;p.y=117;p.dir='W';p.visibile=true;await pausa(.6);
  await scenaDoc(s,p,F)}   // poi Doc chiama Nick: regalo dell'attrezzo; infine Nick sparisce a sinistra e parte il filmato
/* (19 nov) DOC: "Ehi, non vuoi il tuo panino?" -> "No, non c'e' tempo." -> sparisce sotto il banco e ricompare con l'ATTREZZO (torcia multiuso con cacciaviti), stesse pose e movimenti dello scambio del fusibile
   (strisce doc_attrezzo_r1 / nick_attrezzo_r1: stessa struttura di doc_fusibile_r1 / nick_fusibile_r1). L'attrezzo resta per sempre nell'inventario. La radio del furgone suona il Rawhide fino a che Nick non sparisce. */
async function scenaDoc(s,p,F){const d=s.attori['doc-ritorno-al-futuro'];PONTE.muto=true;
  await s.dici(d,"Ehi, non vuoi il tuo panino? È gratis per l'aiuto che mi hai dato!",{});
  await s.dici(p,"No, non c'è tempo.",F);
  await s.dici(d,'Va bene, allora ti devo fare un regalo perlomeno. Aspetta.',{});
  await giuDoc(0,1,.7);rumoriAttrezzi(1.6,false);await pausa(1.6);await giuDoc(1,0,.5);      // sparisce sotto il banco e ricompare con l'attrezzo in mano
  p.visibile=true;await p.vaiA(54,118,false,'N');p.dir='N';await pausa(.3);
  PONTE.docF=PONTE.docA;PONTE.nickF=PONTE.nickA;                                               // pose con l'attrezzo al posto del fusibile
  PONTE.df=0;await pausa(.5);PONTE.df=1;await pausa(.45);
  await s.dici(d,'Ecco, tieni.',{});
  p.visibile=false;PONTE.nf=0;await pausa(.3);PONTE.nf=1;await pausa(.5);
  PONTE.nf=2;PONTE.df=-1;A.sting('scoperta',.7);A.giveItem('attrezzo');await pausa(.9);
  PONTE.nf=0;await pausa(.6);PONTE.nf=-1;p.visibile=true;p.dir='N';await pausa(.3);
  await s.dici(p,"Ehm… che cos'è?",F);
  await s.dici(d,"Com'è che cos'è? È l'attrezzo!",{});
  await s.dici(p,'Ok, ok, grazie! Ora devo andare! Addio!',F);
  await s.dici(d,'Ci vediamo… in futuro!',{});
  await p.vaiA(236,118,true,'E');p.corsa=false;p.visibile=false;                                // Nick sparisce a DESTRA dello schermo (correzione 19 nov)
  if(PONTE.radio){try{PONTE.radio.pause()}catch(e){}PONTE.radio=null}
  PONTE.docF=PONTE.docF0;PONTE.nickF=PONTE.nickF0;
  s.vaiScena('c2-viaggio')}
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
  oggetti:[{baseY:PONTE.RUOTE,disegna(gg,s){disegnaFurgone(gg,s)}},{baseY:117,disegna(gg,s){disegnaBB(gg,s)}}],
  entra(s){fadeTo(0,2.5);const p=s.giocatore;
    if(/[?&]dan/.test(location.search)){C2.ritorno=true;C2.corsaFinale=true;C2.ponteVisto=true}   // (19 nov) link diretto ?c2-ponte&dan: salta alla scena dei Blues Brothers e di Dan
    if(C2.ritorno){   // (18 nov) ritorno dalle scale: Nick riattraversa il ponte e arriva davanti al furgone
      C2.ponteVisto=true;s.occupato=true;document.getElementById('bHint').style.display='none';PONTE.muto=false;
      if(C2.corsaFinale){A.musicStop&&A.musicStop(2.5);try{if(PONTE.radio)PONTE.radio.pause();PONTE.radio=A.motore.suonaClip('audio/musica/rawhide_radio.mp3',.9)}catch(e){}}   // (19 nov) il Rawhide dall'autoradio del furgone, di sottofondo e gracchiante
      s.sequenza(async()=>{await p.vaiA(C2.corsaFinale?172:100,117,!!C2.corsaFinale,C2.corsaFinale?'W':'N');p.corsa=false;p.dir=C2.corsaFinale?'W':'N';await pausa(1.2);if(C2.corsaFinale)await scenaBB(s,p);A.setHint('CONTINUA…',true)});return}
    if(/[?&](panino|consegna)/.test(location.search)&&!C2.fusibile)C2.ponteVisto=true;   // link diretto ?c2-ponte&panino: salta alla scena del panino e del fusibile
    if(C2.ponteVisto&&!C2.fusibile){s.sequenza(()=>scenaPanino(s))}   // tornato dal ponte: la scena del panino
    else if(!C2.ponteVisto)s.sequenza(async()=>{await pausa(1.0);C2.ponteDetto=true;await dn(s,p,'Vediamo se il mio sogno aveva ragione.')})},   // subito: parla e compare la freccia
  punti:[{nome:'',rect:[0,36,56,46],cammina:{x:5,y:118,dir:'W'},visibile:()=>C2.ponteDetto&&!C2.ponteVisto,usa:async(s,p)=>{C2.ponteVisto=true;s.vaiScena('c2-ponte-vista',{x:226,y:112,dir:'W'})}}]
});


/* ---------------- (19 nov) VIAGGIO IN AUTO VERSO FIRENZE ----------------
   Dopo il biglietto di Dan Nick corre a destra e parte UN filmato (video/viaggio.mp4, sei spezzoni uniti da _strumenti/aggiorna_viaggio.py; ognuno fatto con
   _strumenti/film_auto.py, stesso motore dei filmati della guida): l'Alfa 164 esce dallo slargo sulla strada del ponte e svolta a sinistra verso il ponte,
   poi la strada E35 con FIRENZE sull'asfalto, la strada con il portale verde, il casello (stile retro), il piazzale e il casello al tramonto dove si ferma.
   Rombo del motore (Web Audio, segue velocita' e curve) e fischio delle gomme negli intervalli indicati. Poi scena c2-casello: Igor lavora nella cabina. */
const VIAGGIO=[{"t0":0.0,"v":[8.0,12.7,17.5,25.8,35.3,43.6,50.7,57.8,62.3,65.7,69.1,72.5],"c":[0.09,3.0,3.0,3.0,3.0,0.22,0.0,0.0,0.0,0.0,0.0,0.0],"sq":[[0.15000000000000002,1.2000000000000002,0.9]]},{"t0":3.0,"v":[40.0,40.9,41.9,42.8,43.8,44.7,45.7,46.6,47.6,48.5,49.5,50.4],"c":[0.0,0.0,0.0,0.78,1.06,0.28,0.99,0.56,0.0,0.0,0.0,0.0],"sq":[[0.75,1.7249999999999999,0.55]]},{"t0":6.0,"v":[40.0,40.9,41.9,42.8,43.8,44.7,45.7,46.6,47.6,48.5,49.5,50.4],"c":[0.0,0.0,0.19,1.87,0.07,1.82,1.85,0.43,1.78,0.38,0.0,0.0],"sq":[[0.675,1.4249999999999998,0.5],[1.6500000000000001,2.4749999999999996,0.55]]},{"t0":9.0,"v":[26.7,26.0,25.4,24.8,24.1,22.8,21.3,19.8,18.3,16.7,15.2,13.7],"c":[0.28,2.3,2.03,0.85,2.16,1.44,0.16,0.0,0.0,0.0,0.0,0.0],"sq":[[0.22499999999999998,1.275,0.6],[2.0250000000000004,2.8499999999999996,0.6]]},{"t0":12.0,"v":[20.0,19.5,19.1,18.6,18.1,17.6,17.2,16.7,16.2,15.7,15.3,14.8],"c":[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],"sq":[[1.7999999999999998,2.7,0.45]]},{"t0":15.0,"v":[9.3,9.2,9.0,8.9,8.7,8.0,6.6,5.2,3.7,1.7,0.0,0.0],"c":[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],"sq":[[1.4249999999999998,2.55,0.8]]}]; // VIAGGIO-DATI (generato da _strumenti/aggiorna_viaggio.py)
const VG={fin:false,partito:false,t0:0,sq:0};
function gommeSuono(dur,vol){const U=A.AU;if(!U||!U.ctx||U.muted||U.ctx.state!=='running')return;const c=U.ctx,t=c.currentTime+.01,f0=880+Math.random()*160;
  const o=c.createOscillator(),o2=c.createOscillator(),lf=c.createOscillator(),lg=c.createGain(),g=c.createGain(),f=c.createBiquadFilter();
  o.type='sawtooth';o2.type='square';
  o.frequency.setValueAtTime(f0,t);o.frequency.linearRampToValueAtTime(f0*1.38,t+dur*.45);o.frequency.linearRampToValueAtTime(f0*1.12,t+dur);
  o2.frequency.setValueAtTime(f0*1.5,t);o2.frequency.linearRampToValueAtTime(f0*2.05,t+dur*.45);o2.frequency.linearRampToValueAtTime(f0*1.68,t+dur);
  f.type='bandpass';f.frequency.value=1750;f.Q.value=2.2;lf.frequency.value=22;lg.gain.value=.035*vol;lf.connect(lg);lg.connect(g.gain);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.075*vol,t+.14);g.gain.setValueAtTime(.075*vol,t+Math.max(.2,dur-.3));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(f);o2.connect(f);f.connect(g);g.connect(U.master);
  if(U.buf){const n=c.createBufferSource(),nf=c.createBiquadFilter(),ng=c.createGain();n.buffer=U.buf;n.loop=true;nf.type='bandpass';nf.frequency.value=2600;nf.Q.value=.9;
    ng.gain.setValueAtTime(.0001,t);ng.gain.linearRampToValueAtTime(.05*vol,t+.12);ng.gain.setValueAtTime(.05*vol,t+Math.max(.2,dur-.3));ng.gain.exponentialRampToValueAtTime(.0001,t+dur);n.connect(nf);nf.connect(ng);ng.connect(U.master);n.start(t);n.stop(t+dur+.05)}
  for(const n of [o,o2,lf]){n.start(t);n.stop(t+dur+.05)}}
function viaggioAvvia(s){const v=filmEl();VG.fin=false;VG.off=false;VG.partito=false;VG.sq=0;VG.t0=performance.now();
  v.onended=()=>viaggioFine(s);v.onerror=()=>viaggioFine(s);if(v.getAttribute('src')!=='video/viaggio.mp4'){v.src='video/viaggio.mp4';v.load()}
  filmPosiziona(v);v.style.display='block';try{v.currentTime=0}catch(e){}const p=v.play();if(p&&p.catch)p.catch(()=>viaggioFine(s))}
function viaggioFine(s){if(VG.fin)return;VG.fin=true;A.setEng&&A.setEng(0,false);A.musicStop(3);if(FILM.el){try{FILM.el.pause()}catch(e){}FILM.el.style.display='none'}s.vaiScena('c2-casello')}
registraScena({
  id:'c2-viaggio',canSkip:()=>!VG.fin,skip:s=>{viaggioFine(s)},area:[[0,0],[2,0],[2,2],[0,2]],suggerimento:'',
  ambiente:{stanza:0,vento:.3,pioggia:0,fuoco:0},
  disegnaSfondo(gg){R(0,0,W,H,'#000')},
  entra(s){A.say('');s.occupato=true;document.getElementById('bHint').style.display='none';viaggioAvvia(s);A.setEng&&A.setEng(.8,true);A.musicStart('viaggio',3)},
  aggiorna(s,dt){const v=FILM.el;if(!v||VG.fin)return;filmPosiziona(v);
    if(v.currentTime>.05)VG.partito=true;
    if(!VG.partito&&performance.now()-VG.t0>6000)return viaggioFine(s);
    if(v.ended||(v.duration>0&&v.currentTime>=v.duration-.04))return viaggioFine(s);
    const t=v.currentTime;let sg=VIAGGIO[0];for(const q of VIAGGIO)if(t>=q.t0)sg=q;if(!sg)return;
    const n=Math.min(sg.v.length-1,Math.max(0,Math.floor((t-sg.t0)*30/8))),vel=sg.v[n]||0,c=sg.c[n]||0;
    if(sg===VIAGGIO[VIAGGIO.length-1]&&vel<.4&&n>2){if(!VG.off){VG.off=true;A.setEng&&A.setEng(0,false);A.musicStop(1.5)}}   // l'auto e' ferma al casello: niente piu' rumori
    else A.engHz&&A.engHz(31+.9*vel+7*Math.min(1,c)+1.4*Math.sin(s.t*2.2));
    for(const q of VIAGGIO)for(const x of q.sq){const t0=q.t0+x[0];if(t>=t0&&t<t0+.6&&!x.f){x.f=1;gommeSuono(x[1]-x[0],x[2])}}}
});
/* casello al tramonto: la scena finale del viaggio (sfondo = ultimo fotogramma del filmato, con l'auto ferma alla cabina); Igor lavora dietro il vetro della cabina */
registraScena({
  id:'c2-casello',sfondo:'img/scene/casello-tramonto-arrivo.png',
  attori:[{nome:'igor',etichetta:'IGOR',x:-50,y:-50,dir:'S',visibile:false}],   // solo per caricare l'atlante: Igor e' disegnato dietro il vetro
  area:[[0,0],[2,0],[2,2],[0,2]],suggerimento:'',senzaEtichette:true,
  ambiente:{stanza:0,vento:.2,pioggia:0,fuoco:0},
  aggiorna(s,dt){const a=s.attori.igor;if(a)a.visibile=false},
  sopra(gg,s){const ig=A.CHARS['igor'];if(!ig||!ig.ready||!ig.img.naturalWidth)return;const t=s.t,sc=IGOR_G.h/ig.h;
    // fase 0 (0-3,2 s): Igor lavora DENTRO la cabina, dietro il vetro, con l'auto ferma; fase 1: esce dal retro (da dietro l'armadietto grigio a sinistra), cammina fino alla cabina e resta in piedi, a figura intera
    if(t<IGOR_G.t1){const talk=Math.floor(t/1.6)%3===2,n=talk?'talk_S_'+(1+Math.floor(t*6)%4):'idle_S_'+(1+Math.floor(t*1.1)%4),fr=ig.fr[n]||ig.fr.front;if(!fr)return;
      gg.save();gg.beginPath();gg.rect(IGOR_G.rx,IGOR_G.ry,IGOR_G.rw,IGOR_G.rh);gg.clip();gg.imageSmoothingEnabled=false;
      gg.drawImage(ig.img,fr.x,fr.y,ig.w,ig.h,IGOR_G.x-ig.ax*sc,IGOR_G.fy-ig.h*sc,ig.w*sc,ig.h*sc);
      gg.globalAlpha=.3;gg.fillStyle='#1c3a3a';gg.fillRect(IGOR_G.rx,IGOR_G.ry,IGOR_G.rw,IGOR_G.rh);   // vetro: leggera tinta verde e riflesso
      gg.globalAlpha=.16;gg.fillStyle='#fff';gg.beginPath();gg.moveTo(IGOR_G.rx+2,IGOR_G.ry);gg.lineTo(IGOR_G.rx+5,IGOR_G.ry);gg.lineTo(IGOR_G.rx+1,IGOR_G.ry+IGOR_G.rh);gg.lineTo(IGOR_G.rx,IGOR_G.ry+IGOR_G.rh);gg.fill();gg.restore();return}
    if(t<IGOR_G.t1+.5)return;   // il vetro e' vuoto: Igor sbuca dalla FESSURA (x~203) camminando DI PROFILO; appena e' a figura intera si gira DI FRONTE e va verso l'auto; arrivato si ferma di nuovo DI PROFILO
    const u=Math.min(1,(t-IGOR_G.t1-.5)/IGOR_G.dur),ph=(t-IGOR_G.t1)*7,uA=IGOR_G.uA;let x,y,n;
    if(u<uA){const a=u/uA;x=IGOR_G.ex0+(IGOR_G.xm-IGOR_G.ex0)*a;y=IGOR_G.ey0+(IGOR_G.ym-IGOR_G.ey0)*a;n='walk'+(1+Math.floor(ph)%6)}                      // esce dalla fessura: profilo
    else if(u<1){const b=(u-uA)/(1-uA),e=b*b*(3-2*b);x=IGOR_G.xm+(IGOR_G.ex1-IGOR_G.xm)*e;y=IGOR_G.ym+(IGOR_G.ey1-IGOR_G.ym)*e;n='walk_S_'+(1+Math.floor(ph)%8)}   // a figura intera: di fronte
    else{x=IGOR_G.ex1;y=IGOR_G.ey1;n='right'}                                                                                // fermo accanto all'auto: di profilo
    const fr=ig.fr[n]||ig.fr.front;if(!fr)return;
    const pxm=(y-62)/1.8,k=IGOR_G.alt*pxm/ig.h;   // prospettiva (orizzonte y=62, camera 1,8 m): alto 1,6 m, come l'auto accanto a lui
    ell(x,y+.4,pxm*.25,1.6,'#000',.3);
    const rv=Math.max(0,Math.min(1,(y-IGOR_G.r0)/(IGOR_G.r1-IGOR_G.r0))),cl=IGOR_G.cx0*(1-rv),cr=IGOR_G.cx1+(W-IGOR_G.cx1)*rv;   // la fessura si "apre" man mano che esce: niente figura tagliata di colpo
    gg.save();gg.beginPath();gg.rect(cl,0,cr-cl,H);gg.clip();gg.imageSmoothingEnabled=false;   // finche' e' nella fessura si vede solo cio' che passa fra i due elementi
    gg.drawImage(ig.img,fr.x,fr.y,ig.w,ig.h,x-ig.ax*k,y-ig.h*k,ig.w*k,ig.h*k);gg.restore()},
  entra(s){A.say('');s.occupato=true;fadeTo(0,.5);document.getElementById('bHint').style.display='none';setTimeout(()=>{try{sfx.portaApre&&sfx.portaApre()}catch(e){}},3150);s.sequenza(async()=>{await pausa(7.5);A.setHint('CONTINUA…',true)})}
});
const IGOR_G={x:134,fy:97,h:46,rx:129,ry:46,rw:10,rh:26,t1:3.2,dur:4.0,ex0:201,xm:204,ex1:207,ey0:100,ym:111,ey1:114,cx0:199.5,cx1:205.5,r0:101,r1:109,alt:1.6,uA:.5};   // Igor nella cabina: centro, piedi, altezza (px logici) e riquadro del vetro

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
const PF={F:330,HC:1.6,YH:40,V:1.6,VL:2.0};   // VL: velocita' di Lara (passo deciso)
const BORDO_SX=[[40,102],[48,108],[60,113],[75,128],[90,136],[120,138]];
function bordoSx(y){const P=BORDO_SX;if(y<=P[0][0])return P[0][1];for(let i=1;i<P.length;i++)if(y<=P[i][0])return P[i-1][1]+(P[i][1]-P[i-1][1])*(y-P[i-1][0])/(P[i][0]-P[i-1][0]);return P[P.length-1][1]}
const bordoDx=y=>112+(y-45)/.37;
const yZ=z=>PF.YH+PF.F*PF.HC/z;
function corsia(z,f){const y=yZ(z),l=bordoSx(y),r=bordoDx(y);return [l+(r-l)*f,y]}
const FP={};
const MELA_IMG=mkImg('img/emb/mela_r2.png');   // (18 nov) la mela rossa che cade a Lara dopo l'Ehila'
const LARA_WALK=mkImg('img/emb/lara_walk_r1.png');   // camminata vera (8 pose, gambe che alternano): sostituisce le walk_S dell'atlante, che erano 4 pose ripetute con la stessa gamba avanti
function muovi(p,z,f,dir,fermo,dt,vel){const [x,y]=corsia(z,f);p.x=x;p.y=y;p.dir=dir;
  if(fermo){p.state='idle';return}p.state='walk';p.v=1;p.bob=p.n==='lara-croft'?0:1.0;p.fase+=(vel||PF.V)*(dt||1/30)/1.5}   // (18 nov) Lara senza saltello: i piedi restano sul terreno   // (18 nov) il ciclo del passo (due passi = 1,5 m) avanza con la distanza REALE percorsa: la camminata si vede anche in lontananza
registraScena({
  id:'c2-ponte-film',sfondo:'img/scene/ponte-diavolo-var2.png',
  giocatore:'protagonista-esterno',nomeGiocatore:'NICK',partenza:{x:188,y:116,dir:'N'},
  attori:[{nome:'lara-croft',etichetta:'LARA',x:140,y:60,dir:'S'}],
  area:[[0,0],[2,0],[2,2],[0,2]],rif:[100,2.016],audioPassi:false,
  ambiente:{stanza:0,vento:.35,foglie:.3,aria:.4,pioggia:0,fuoco:0},suggerimento:'',senzaEtichette:true,
  punti:[FP.melaPunto={nome:'',rect:[0,0,0,0],visibile:()=>!!FP.melaPronta&&!FP.melaRaccolta,cammina:{x:0,y:0,dir:'E'},usa:async(s,p)=>{
    FP.melaRaccolta=true;const mx=FP.mela.x-13;p.dir='E';if(Math.abs(mx-p.x)>2){p.state='walk';p.v=1;await new Promise(r=>{const iv=setInterval(()=>{p.fase+=.03*1.6/1.5;p.x+=Math.sign(mx-p.x)*Math.min(Math.abs(mx-p.x),.9);if(Math.abs(mx-p.x)<.5){clearInterval(iv);r()}},30)})}
    p.state='idle';p.dir='E';p.pickUp();await pausa(.7);FP.mela=null;sfx.raccogli();A.sting('scoperta',.5);A.giveItem('mela');C2.mela=true;await pausa(1.4);FP.fine=true;s.vaiScena('c2-scale',{x:150,y:60,dir:'S'})}}],
  sopra(gg,s){const m=FP.mela;if(!m||!MELA_IMG.complete||!MELA_IMG.naturalWidth)return;
    const w=Math.max(4,6*(m.y-40)/60),h0=.9*(m.y-40)/1.6,u=(FP.t-m.t0)/.5;let h=0;
    if(u<0)return;if(u<1)h=h0*(1-u*u);else if(u<1.35)h=h0*.12*Math.sin(Math.PI*(u-1)/.35);
    ell(m.x,m.y+.4,w*.5,1,'#000',.3);gg.save();gg.imageSmoothingEnabled=false;gg.drawImage(MELA_IMG,Math.round(m.x-w/2),Math.round(m.y-h-w+1),w,w);
    if(FP.melaPronta&&!FP.melaRaccolta&&Math.sin(FP.t*5)>.3){gg.fillStyle='#fff';const cx=Math.round(m.x+w*.3),cy=Math.round(m.y-w-1);gg.fillRect(cx-2,cy,5,1);gg.fillRect(cx,cy-2,1,5)}
    gg.restore()},
  entra(s){Object.assign(FP,{mela:null,melaCaduta:false,melaT:0,melaPronta:false,melaRaccolta:false,attesaMela:false,patch:false,t:0,zn:6.95,zl:40,alphaL:1,incontro:false,laraFine:false,nickFermo:false,fine:false});s.occupato=true;document.getElementById('bHint').style.display='none';fadeTo(0,1.2)},
  aggiorna(s,dt){
    const n=s.giocatore,l=s.attori['lara-croft'];if(!n||!l)return;FP.t+=dt;
    if(!l._alfa){const d0=l.draw.bind(l);l.draw=function(sc){g.save();g.globalAlpha=FP.alphaL;d0(sc);g.restore()};l._alfa=1}   // Lara emerge dalla lontananza (trasparenza che sale)
    if(!FP.patch&&LARA_WALK.complete&&LARA_WALK.naturalWidth&&l.c&&l.c.ready){FP.patch=true;const c0=l.c,fr={...c0.fr};for(let i=0;i<8;i++)fr['walk_S_'+(i+1)]={x:i*c0.w,y:0,w:c0.w,h:c0.h};l.c={...c0,img:LARA_WALK,fr}}
    if(!FP.nickFermo){FP.zn+=PF.V*dt;muovi(n,FP.zn,.30,'N',false,dt)}else{n.state='idle'}
    if(!FP.laraFine){FP.zl-=PF.VL*dt;muovi(l,FP.zl,.62+.16*Math.max(0,Math.min(1,(yZ(FP.zl)-108)/14)),'S',false,dt,PF.VL);if(l.x>246){FP.laraFine=true;l.visibile=false}}
    if(FP.melaT&&!FP.mela&&!FP.melaCaduta&&FP.t>=FP.melaT){FP.melaCaduta=true;FP.mela={x:l.x+1,y:l.y,t0:FP.t};setTimeout(()=>{A.tone(210,.09,'sine',.05,120,.2,.3);A.nburst(900,4,.02,.02,'bandpass',.2,.3)},500);setTimeout(()=>{A.tone(260,.05,'sine',.025,170,.2,.3)},690)}
    if(FP.mela&&!FP.melaPronta&&!FP.melaRaccolta&&FP.t>=FP.mela.t0+.75){FP.melaPronta=true;const m=FP.mela,w=Math.max(4,6*(m.y-40)/60);FP.melaPunto.rect=[Math.round(m.x-7),Math.round(m.y-12),14,14];FP.melaPunto.cammina={x:n.x,y:n.y,dir:'E'}}
    if(!FP.incontro&&FP.zn>=FP.zl-.3){FP.incontro=true;FP.nickFermo=true;
      s.dici(l,'Ehilà!',{clip:'audio/versi/lara_ehila_r1.mp3',frontale:false});FP.melaT=FP.t+.6;   // (voce vera) Lara saluta e continua a camminare
      s.sequenza(async()=>{await pausa(1.1);n.dir='S';await pausa(.7);await s.dici(n,'Eppure mi pare di averla già vista.',{});await pausa(1.0);FP.attesaMela=true;const nx=n.x,ny=n.y;n.vaiA=async(x,y)=>x===nx&&y===ny})}}   // (18 nov) ora Nick puo' raccogliere la mela: il filmato prosegue verso le scale solo dopo   // (18 nov) vaiScena fa gia' la sua dissolvenza: una dissolvenza in piu' bloccava il passaggio alle scale
});

/* ---------------- (18 nov) FILMATO: il ritorno. Dopo il motore del Flusso Canalizzatore Nick risale le scale e ritraversa il ponte verso di noi (stessa visuale e stessa prospettiva del
   filmato dell'incontro con Lara), poi arriva al furgone. Nick percorre la corsia sinistra da lontano (Z=30 m) a vicino (Z=6,95 m). ---------------- */
const RIT={zn:30,t:0,fine:false};
registraScena({
  id:'c2-ritorno',sfondo:'img/scene/ponte-diavolo-var2.png',
  giocatore:'protagonista-esterno',nomeGiocatore:'NICK',partenza:{x:120,y:60,dir:'S'},
  area:[[0,0],[2,0],[2,2],[0,2]],rif:[100,2.016],audioPassi:false,
  ambiente:{stanza:0,vento:.35,foglie:.3,aria:.4,pioggia:0,fuoco:0},suggerimento:'',senzaEtichette:true,
  entra(s){Object.assign(RIT,{zn:30,t:0,fine:false,v:C2.corsaFinale?4.6:2.4});if(C2.corsaFinale&&s.giocatore)s.giocatore.corsa=true;s.occupato=true;document.getElementById('bHint').style.display='none';fadeTo(0,1.0)},
  aggiorna(s,dt){const n=s.giocatore;if(!n)return;RIT.t+=dt;
    if(RIT.zn>6.95){RIT.zn-=RIT.v*dt;n.corsa=!!C2.corsaFinale;muovi(n,RIT.zn,.30,'S',false,dt,RIT.v)}
    else if(!RIT.fine){RIT.fine=true;n.state='idle';s.sequenza(async()=>{await pausa(.3);s.vaiScena('c2-ponte',C2.corsaFinale?{x:238,y:112,dir:'W'}:{x:6,y:118,dir:'E'})})}}   // (18 nov) nel finale Nick arriva al furgone da DESTRA
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
  aggiorna(s,dt){NS.t+=dt;if(!NS.fine&&NS.t>.8+NS_TOT+2.2){NS.fine=true;s.vaiScena('c2-capra',{x:176,y:109,dir:'W'})}},   // (18 nov) dalle scale alla scena della capra
  sopra(gg,s){
    const im=NS.img;if(!(im.complete&&im.naturalWidth))return;const tt=Math.max(0,NS.t-.8),d=nsDist(tt),[x,y0,seg]=nsPos(d),camminando=tt>0&&tt<NS_TOT-.05;
    const hLog=32+(y0-40)*.22,sc=hLog/34,w=120/RS*sc,h=150/RS*sc;
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

/* ---------------- (18 nov) SCENA DELLA CAPRA (var5): omaggio a Broken Sword ----------------
   Il tavolo e' quello dello sfondo (a sinistra, piedi a y~95). Accanto al tavolo, PIU' VICINO ALLO SCHERMO (y 107), il macchinario con il Flusso Canalizzatore
   (generatore con il pannello sul fianco sinistro); la capra e' legata al tavolo con una corda. Prospettiva: orizzonte y=40 (rif [100,2.016]), px/m=(y-40)/1,6.
   Per ora SOLO la messa in scena: la logica della capra (cariche, corda, soluzione) va definita con l'utente. */
function s_capraNick(){const sc=scenes['c2-capra'];return sc&&sc.giocatore}
function s_capraCapra(){const sc=scenes['c2-capra'];return sc&&sc.attori&&sc.attori.capra}
/* STATO: nutrita = la capra ha mangiato la mela (smette di attaccare); on = il macchinario ha il fusibile (vibra e ronza); busy = sequenza in corso */
const CAPS={nutrita:false,on:false,busy:false,t:0,last:0,hum:null};
const CAPRA={mac:mkImg('img/emb/macchinario_flusso_r3.png'),macOff:mkImg('img/emb/macchinario_flusso_r3_off.png'),MX:50,MY:112,TX:51,TY:96,GX:98,GY:99,L:60,YX:.177,YY:.407};
/* pose nuove (ChatGPT, account gventroni): nick_spavento_r1 (8 celle 124x150), capra_cariche_r2 (8 celle 160x110), capra_mangia_r1 (8 celle 160x110), nick_offre_r1 (4 celle 160x150)
   capra: 0 bela, 1 testa bassa, 2-4 carica, 5 frenata a fine corda, 6 sbuffa, 7 torna indietro | mangia: 0 annusa, 1 morde, 2-5 mastica, 6 deglutisce, 7 soddisfatta
   Nick: spavento 0 sorpreso, 1 salto, 2 atterra, 3-6 passi indietro, 7 ansima | offre 0 mela sul palmo, 1 palmo vuoto, 2 rilassato, 3 tocca il cappello */
const CAP_P={nick:mkImg('img/emb/nick_spavento_r1.png'),capra:mkImg('img/emb/capra_cariche_r2.png'),mangia:mkImg('img/emb/capra_mangia_r1.png'),offre:mkImg('img/emb/nick_offre_r1.png'),atl:mkImg('img/char-r19/capra.png'),tesa:mkImg('img/emb/capra_tesa_r1.png'),cammina:mkImg('img/emb/capra_cammina_r1.png'),n:-1,c:-1,m:-1,o:-1,t:-1,w:-1,davanti:false};   // t = pose con la corda TESA, w = camminata all'indietro
/* punto dove finisce la corda dello sprite (coda a terra), in px della cella: la corda del tavolo si attacca LI' (e' la stessa corda legata al collo della capra) */
const CODA={t:[[14,63],[23,63],[0,59],[30,60]],w:[[36,103],[43,101],[34,102],[43,102],[44,102],[38,102]],idle:[17,75],c:[[39,100],[36,101],[32,101],[51,101],[20,101],[9,90],[40,100],[38,101]],m:[[44,102],[45,101],[44,102],[44,102],[45,102],[44,102],[45,102],[45,102]]};
window.__CAP={CAPS,CAP_P,CAPRA,ronzio};   // (debug)
const capraPose=()=>[CAP_P.nick,CAP_P.capra,CAP_P.mangia,CAP_P.offre,CAP_P.atl,CAP_P.tesa,CAP_P.cammina].every(i=>i.complete&&i.naturalWidth>0);
function disegnaPosa(g,a,img,i,CW,CH,sh,sx0=0,ax=CW/2){if(!a||i<0)return;const sc=a.scala(),w=CW/RS*sc,h=CH/RS*sc;ell(a.x,a.y+.6,sh*sc,2*sc,'#000',.35);
  g.save();g.imageSmoothingEnabled=false;g.drawImage(img,sx0+i*CW,0,CW,CH,Math.round(a.x-ax/CW*w),Math.round(a.y-h+sc),Math.round(w),Math.round(h));g.restore()}
/* ronzio del motore (rumore + onde gravi, nessuna musica): parte quando si inserisce il fusibile; si spegne da solo quando la scena non e' piu' attiva */
/* (18 nov) musichetta 8 bit del macchinario: ciclo di 4 battute in loop finche' si resta nella scena (stesso controllo del ronzio) */
function musicaMacchinario(){
  const au=A.AU;if(!au||!au.ctx||au.muted||CAPS.mus)return;const c=au.ctx;CAPS.mus=true;
  A.motore.caricaClip('audio/musica/macchinario.mp3').then(b=>{if(!b){CAPS.mus=false;return}
    const src=c.createBufferSource(),gn=c.createGain();src.buffer=b;src.loop=true;gn.gain.setValueAtTime(.0001,c.currentTime);gn.gain.linearRampToValueAtTime(.32,c.currentTime+1.2);src.connect(gn);gn.connect(au.master||c.destination);src.start();
    const wd=setInterval(()=>{if(performance.now()-CAPS.last>700||au.muted){clearInterval(wd);const t=c.currentTime;gn.gain.cancelScheduledValues(t);gn.gain.setValueAtTime(gn.gain.value,t);gn.gain.linearRampToValueAtTime(.0001,t+.5);try{src.stop(t+.6)}catch(e){}CAPS.mus=false}},300)})}
window.musicaMacchinario=musicaMacchinario;
function ronzio(){
  const au=A.AU;if(!au||!au.ctx||CAPS.hum||au.muted)return;const c=au.ctx,t=c.currentTime,out=au.master||c.destination;
  const gm=c.createGain(),lp=c.createBiquadFilter(),o1=c.createOscillator(),o2=c.createOscillator(),og=c.createGain(),lfo=c.createOscillator(),lg=c.createGain(),lfo2=c.createOscillator(),lg2=c.createGain();
  lp.type='lowpass';lp.frequency.value=300;lp.Q.value=1.2;o1.type='sawtooth';o2.type='square';og.gain.value=.32;
  o1.frequency.setValueAtTime(26,t);o1.frequency.linearRampToValueAtTime(47,t+1.4);o2.frequency.setValueAtTime(52,t);o2.frequency.linearRampToValueAtTime(94,t+1.4);
  lfo.frequency.value=13;lg.gain.value=.012;lfo.connect(lg);lg.connect(gm.gain);             // pulsazione del motore
  lfo2.frequency.value=3.1;lg2.gain.value=90;lfo2.connect(lg2);lg2.connect(lp.frequency);      // il tono respira
  gm.gain.setValueAtTime(.0001,t);gm.gain.linearRampToValueAtTime(.05,t+1.2);
  const n=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const ns=c.createBufferSource();ns.buffer=n;ns.loop=true;const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=170;bp.Q.value=.9;const ng=c.createGain();ng.gain.value=.45;
  o1.connect(lp);o2.connect(og);og.connect(lp);ns.connect(bp);bp.connect(ng);ng.connect(lp);lp.connect(gm);gm.connect(out);
  [o1,o2,lfo,lfo2,ns].forEach(x=>x.start(t));CAPS.hum={gm,stop(){const tt=c.currentTime;gm.gain.cancelScheduledValues(tt);gm.gain.setValueAtTime(gm.gain.value,tt);gm.gain.linearRampToValueAtTime(.0001,tt+.4);[o1,o2,lfo,lfo2,ns].forEach(x=>{try{x.stop(tt+.5)}catch(e){}})}};
  const wd=setInterval(()=>{if(performance.now()-CAPS.last>700){clearInterval(wd);if(CAPS.hum){CAPS.hum.stop();CAPS.hum=null}}},300)}
async function CAPRA_CARICA(s,p){   // la capra PUNTA Nick, carica fino al limite della corda (che si tende) e Nick si spaventa e arretra
  const g=s.attori.capra;if(!g||!capraPose())return;
  const x0=CAPRA.GX,y0=CAPRA.GY;p.dir='W';p.state='idle';await pausa(.15);
  const px=p.x,py=p.y;p.visibile=false;g.visibile=false;CAP_P.n=0;CAP_P.c=0;
  try{A.motore.suonaClip('audio/versi/bela_v2.mp3')}catch(e){}
  await pausa(1.0);CAP_P.c=1;await pausa(.8);                        // bela, poi testa bassa e zoccolo che raspa
  const gx=Math.min(px-14,122),gy=Math.max(y0,Math.min(py-3,108));CAP_P.davanti=true;let t=0;
  const caricaP=new Promise(r=>{const iv=setInterval(()=>{t+=.03;const u=Math.min(1,t/.38);g.x=x0+(gx-x0)*u;g.y=y0+(gy-y0)*u;if(u<.5){CAP_P.t=-1;CAP_P.c=2+Math.floor(t/.09)%3}else{CAP_P.c=-1;CAP_P.t=Math.floor(t/.09)%2}if(u>=1){clearInterval(iv);r()}},30)});
  (async()=>{await pausa(.12);FIATO.suona('protagonista-esterno','sorpresa',1,1);CAP_P.n=1;await pausa(.32);CAP_P.n=2;await pausa(.2);
    for(let k=0;k<8;k++){CAP_P.n=3+k%4;const xs=p.x;await new Promise(r=>{let tt=0;const iv=setInterval(()=>{tt+=.03;p.x=xs+3*Math.min(1,tt/.16);if(tt>=.16){clearInterval(iv);r()}},30)})}
    CAP_P.n=7})();
  await caricaP;CAP_P.c=-1;CAP_P.t=2;await pausa(.5);CAP_P.t=3;
  await pausa(.6);CAP_P.davanti=false;CAP_P.t=-1;
  const dur=Math.max(1.8,Math.hypot(gx-x0,gy-y0)/20);   // arretra CAMMINANDO: il ciclo di passi in senso inverso (guarda Nick e va all'indietro)
  await new Promise(r=>{let tr=0;const iv=setInterval(()=>{tr+=.03;const u=Math.min(1,tr/dur);g.x=gx+(x0-gx)*u;g.y=gy+(y0-gy)*u;CAP_P.w=5-Math.floor(tr/.2)%6;if(u>=1){clearInterval(iv);r()}},30)});CAP_P.w=-1;
  await pausa(.3);g.x=x0;g.y=y0;g.dir='S';CAP_P.c=-1;p.visibile=true;p.dir='W';p.state='idle';CAP_P.n=-1}
async function CAPRA_MANGIA(s,p){   // Nick offre la mela, la capra la mangia (e da quel momento non attacca piu')
  CAPS.busy=true;await s.sequenza(async()=>{
    const g=s.attori.capra;A.removeItem('mela');C2.mela=false;
    await p.vaiA(g.x+60,g.y+7,false,'W');p.dir='W';await pausa(.2);
    p.visibile=false;g.visibile=false;CAP_P.o=0;CAP_P.m=0;await pausa(1.0);                 // annusa la mela sul palmo
    CAP_P.o=1;CAP_P.m=1;A.tone(260,.06,'square',.03,140,.1,.3);await pausa(.55);
    for(const f of [2,3,4,5,4,5,2,3]){CAP_P.m=f;if(f>2)CAP_P.o=2;A.nburst(2400+Math.random()*600,5,.05,.05,'bandpass',.1,.3);A.tone(150,.05,'square',.02,95,.1,.3);await pausa(.34)}   // mastica
    CAP_P.m=6;await pausa(.8);CAP_P.m=7;CAP_P.o=3;await pausa(.9);                          // deglutisce, e' soddisfatta; Nick tocca il cappello
    p.visibile=true;p.dir='W';p.state='idle';CAP_P.o=-1;CAPS.nutrita=true});
  CAPS.busy=false}
async function CAPRA_FUSIBILE(s,p){   // il fusibile viene inserito nel Flusso Canalizzatore: il macchinario vibra e ronza
  CAPS.busy=true;await s.sequenza(async()=>{
    await p.vaiA(14,116,false,'E');p.dir='E';A.removeItem('fusibile');C2.fusibile=false;
    p.state='act';p.seq=[['reach',1.1],['#',0]];p.si=0;p.st=0;await pausa(.55);
    A.tone(900,.05,'square',.05,520,.3,.3);A.nburst(3200,6,.03,.05,'bandpass',.3,.3);await pausa(.25);A.tone(130,.18,'sawtooth',.04,60,.3,.3);
    CAPS.on=true;ronzio();await pausa(1.2);p.state='idle';p.dir='E';
    await pausa(.9);await s.dici(p,'Vediamo se da qui riesco a vedere il furgone dei panini.',{frontale:false});   // (18 nov) poi: ponte con il simbolo inciso, primo piano, corsa verso il furgone
    C2.finale=true;await pausa(.3);s.vaiScena('c2-simbolo',{x:70,y:117,dir:'W'})});
  CAPS.busy=false}
registraScena({
  id:'c2-capra',inventario:true,sfondo:'img/scene/ponte-diavolo-var5.png',
  giocatore:'protagonista-esterno',nomeGiocatore:'NICK',partenza:{x:176,y:109,dir:'W'},
  attori:[{nome:'capra',etichetta:'CAPRA',x:CAPRA.GX,y:CAPRA.GY,dir:'S',k:.8}],
  area:[[2,100],[90,78],[170,78],[238,100],[238,119],[2,119]],
  ostacoli:[[[14,88],[54,88],[54,96],[14,96]],[[24,107],[76,107],[76,114],[24,114]]],
  rif:[100,2.016],audioPassi:false,
  ambiente:{stanza:0,vento:.2,foglie:.1,aria:.3,pioggia:0,fuoco:0},suggerimento:'',senzaEtichette:true,
  oggetti:[
    {baseYf:s=>s.giocatore?s.giocatore.y:0,disegna(g,s){const p=s.giocatore;if(!capraPose())return;if(CAP_P.n>=0)disegnaPosa(g,p,CAP_P.nick,CAP_P.n,124,150,7);else if(CAP_P.o>=0)disegnaPosa(g,p,CAP_P.offre,CAP_P.o,160,150,7)}},
    {baseYf:s=>{const c=s.attori&&s.attori.capra,n=s.giocatore;return CAP_P.davanti&&n?n.y+.5:(c?c.y:0)},disegna(g,s){const c=s.attori&&s.attori.capra;if(!capraPose())return;   // la capra e' SEMPRE disegnata con queste pose (anche ferma) cosi' la corda combacia
      if(CAP_P.t>=0)disegnaPosa(g,c,CAP_P.tesa,CAP_P.t,230,92,11,0,140);else if(CAP_P.w>=0)disegnaPosa(g,c,CAP_P.cammina,CAP_P.w,160,110,11);else if(CAP_P.c>=0)disegnaPosa(g,c,CAP_P.capra,CAP_P.c,160,110,11);else if(CAP_P.m>=0)disegnaPosa(g,c,CAP_P.mangia,CAP_P.m,160,110,11);else disegnaPosa(g,c,CAP_P.atl,0,91,85,11,182)}},
    {baseY:CAPRA.MY,disegna(g){const im=CAPRA.mac;if(!(im.complete&&im.naturalWidth))return;   // macchinario (1,2 m di larghezza in prospettiva); acceso: vibra
      const w=1.2*(CAPRA.MY-40)/1.6,h=w*im.naturalHeight/im.naturalWidth,X=CAPRA.MX-w/2,Y=CAPRA.MY-h+1;ell(CAPRA.MX,CAPRA.MY+.5,w*.5,1.6,'#000',.35);
      const ox=CAPS.on?Math.round(Math.sin(CAPS.t*95)*.8):0,oy=CAPS.on?Math.round(Math.sin(CAPS.t*61+1.3)*.6):0;
      const tt=CAPS.t,acc=CAPS.on?Math.sin(tt*15)>-.2:((tt/1.3)%1)<.58||(((tt*7)%1)<.2&&((tt/1.3)%1)>.8);   // i neon LAMPEGGIANO: a ritmo veloce quando e' acceso, a luce irregolare da spento
      g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';const im2=acc||!(CAPRA.macOff.complete&&CAPRA.macOff.naturalWidth)?im:CAPRA.macOff;g.drawImage(im2,Math.round(X+ox),Math.round(Y+oy),Math.round(w),Math.round(h));
      const gx=X+w*CAPRA.YX+ox,gy=Y+h*CAPRA.YY+oy,a=acc?(CAPS.on?.75:.42):.04;   // bagliore neon dei tubi
      g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(gx,gy,0,gx,gy,w*.22);gr.addColorStop(0,`rgba(110,215,255,${a})`);gr.addColorStop(1,'rgba(110,215,255,0)');g.fillStyle=gr;g.fillRect(gx-w*.25,gy-w*.25,w*.5,w*.5);g.restore()}},
    {baseY:300,disegna(g,s){return;   // (18 nov) freccia gialla TOLTA dopo l'accensione del motore (Graziano) — era: lampeggiante sulle scale: da li' si torna indietro
      const dx=Math.round(Math.sin(CAPS.t*5)*1.2);g.save();g.translate(150+dx,40);for(const [c,o] of [['#05060a',1],['#ffd23a',0]]){g.fillStyle=c;g.beginPath();g.moveTo(0,-8-o);g.lineTo(-8-o,0);g.lineTo(-3,0);g.lineTo(-3,7+o);g.lineTo(3,7+o);g.lineTo(3,0);g.lineTo(8+o,0);g.closePath();g.fill()}g.restore()}},
    {baseY:CAPRA.TY,disegna(g,s){const c=s.attori&&s.attori.capra;if(!c||!capraPose())return;   // la corda dello sprite continua a terra fino al piede del tavolo (dietro il macchinario): lenta a riposo, tesa quando la capra tira
      let CW=91,CH=85,AX=45.5,t=CODA.idle,teso=false;if(CAP_P.t>=0){CW=230;CH=92;AX=140;t=CODA.t[CAP_P.t];teso=true}else if(CAP_P.w>=0){CW=160;CH=110;AX=80;t=CODA.w[CAP_P.w]}else if(CAP_P.c>=0){CW=160;CH=110;AX=80;t=CODA.c[CAP_P.c]}else if(CAP_P.m>=0){CW=160;CH=110;AX=80;t=CODA.m[CAP_P.m]}
      const sc=c.scala(),w=CW/RS*sc,h=CH/RS*sc,x1=c.x-AX/CW*w+t[0]/CW*w,y1=c.y-h+sc+t[1]/CH*h,x0=CAPRA.TX,y0=CAPRA.TY,d=Math.hypot(x1-x0,y1-y0),tn=Math.min(1,d/CAPRA.L),amp=teso?0:2.6*Math.sqrt(Math.max(0,1-tn*tn));
      /* corda disegnata come quella dello sprite (pixel da 1/4 di px logico): contorno viola scuro, bordo cremisi, corpo corallo e filo di luce crema */
      g.save();const q=v=>Math.round(v*4)/4,CL=[['#46103a',-.5],['#b92241',-.25],['#e45744',0],['#e45744',.25],['#6a1f43',.5]],n=Math.max(8,Math.ceil(Math.abs(x1-x0)*4));
      for(let i=0;i<=n;i++){const u=i/n,x=q(x0+(x1-x0)*u),y=y0+(y1-y0)*u+Math.sin(u*Math.PI*3)*amp*Math.sin(Math.PI*u);
        for(const [col,dy] of CL){g.fillStyle=col;g.fillRect(x,q(y+dy),.25,.25)}
        if(Math.floor(i/5)%3===0){g.fillStyle='#fde1b9';g.fillRect(x,q(y-.25),.25,.25)}}g.restore()}}
  ],
  /* ogni volta che Nick si avvicina alla capra (finche' non ha mangiato la mela) lei lo attacca */
  aggiorna(s,dt){CAPS.t+=dt;CAPS.last=performance.now();
    if(CAPS.nutrita||CAPS.busy||s.occupato||!capraPose())return;const p=s.giocatore,g=s.attori.capra;
    if(p&&g&&Math.abs(p.x-CAPRA.GX)<46&&Math.abs(p.y-CAPRA.GY)<26){CAPS.busy=true;p.path=[];p.arrivo=null;p.state='idle';s.sequenza(async()=>{try{await CAPRA_CARICA(s,p)}finally{CAPS.busy=false}})}},
  punti:[{nome:'',rect:[128,26,46,46],cammina:{x:150,y:80,dir:'N'},visibile:()=>CAPS.on&&!C2.finale,usa:async(s,p)=>{C2.ritorno=true;p.dir='N';await pausa(.4);s.vaiScena('c2-ritorno')}},
    {nome:'',rect:[20,72,58,42],get cammina(){return CAPS.nutrita?{x:14,y:116,dir:'E'}:{x:150,y:111,dir:'W'}},usa:async(s,p)=>{if(!CAPS.nutrita){CAPS.busy=true;try{await CAPRA_CARICA(s,p)}finally{CAPS.busy=false}}}}],
  /* trascinando dall'inventario: la MELA sulla capra, il FUSIBILE sul macchinario */
  hintTargets:(s,id)=>id==='mela'&&!CAPS.nutrita?[[78,56,40,46]]:(id==='fusibile'&&!CAPS.on?[[22,76,58,40]]:[]),
  dropItem:(s,id,x,y)=>{
    if(s.occupato||CAPS.busy||!capraPose()){A.sfx.no();return}const p=s.giocatore,g=s.attori.capra;
    if(id==='mela'&&!CAPS.nutrita&&x>=74&&x<=124&&y>=50&&y<=104){CAPRA_MANGIA(s,p);return}
    if(id==='fusibile'&&!CAPS.on&&x>=20&&x<=82&&y>=74&&y<=118){if(CAPS.nutrita)CAPRA_FUSIBILE(s,p);else{CAPS.busy=true;s.sequenza(async()=>{try{await p.vaiA(150,111,false,'W');await CAPRA_CARICA(s,p)}finally{CAPS.busy=false}})}return}
    A.sfx.no()},
  entra(s){   // arriva con tutto l'inventario: libro, fusibile e mela (anche da link diretto)
    if(s.attori.capra)s.attori.capra.visibile=false;   // lo sprite normale e' sostituito dalle pose (anche da fermo)
    Object.assign(CAPS,{nutrita:false,on:false,busy:false,t:0});if(CAPS.hum){CAPS.hum.stop();CAPS.hum=null}CAP_P.n=CAP_P.c=CAP_P.m=CAP_P.o=CAP_P.t=CAP_P.w=-1;CAP_P.davanti=false;
    const rip=window.__ripresa;window.__ripresa=false;   // ripresa da salvataggio: non rimetto nell'inventario gli oggetti di prova
    const S=A.S;if(S&&S.inv&&!rip&&/[?&]c2-capra/.test(location.search)){let m=false;for(const id of ['book','fusibile','mela'])if(!S.inv.includes(id)){S.inv.push(id);m=true}S.bookOpen=true;if(m&&A.refreshInv)A.refreshInv()}
    if(C2.finale){   // (18 nov) FILMATO FINALE: macchinario acceso, capra sazia; Nick corre fino alle scale, le sale e poi corre lungo il ponte verso il furgone
      Object.assign(CAPS,{nutrita:true,on:true});ronzio();const p=s.giocatore;s.occupato=true;document.getElementById('bHint').style.display='none';
      s.sequenza(async()=>{await pausa(.9);p.vaiA(150,80,true,'N');await pausa(2.3);   // (18 nov) corre verso le scale: il filmato si interrompe PRIMA che le raggiunga
        C2.ritorno=true;C2.corsaFinale=true;s.vaiScena('c2-ritorno')})}
    fadeTo(0,1.6)}
});

/* ---------------- (18 nov) FINALE DELLA SCENA DELLA CAPRA: il ponte con il simbolo inciso (davvero esiste) e il primo piano di Nick con il vortice alla Hitchcock ---------------- */
const SIMB={t:0,x:57,y:50};   // posizione del simbolo celtico sul muro dell'arco (px logici)
registraScena({
  id:'c2-simbolo',sfondo:'img/scene/ponte-simbolo-inciso.png',
  giocatore:'protagonista-esterno',nomeGiocatore:'NICK',partenza:{x:70,y:117,dir:'W'},
  area:[[4,106],[72,106],[72,119],[4,119]],ostacoli:[],rif:[112,1.7],audioPassi:false,
  ambiente:{stanza:0,vento:.3,foglie:.2,aria:.4,pioggia:0,fuoco:0},suggerimento:'',senzaEtichette:true,
  aggiorna(s,dt){SIMB.t+=dt;ambienteGiorno(dt,false)},
  sopra(gg,s){const k=SIMB.lampo||0;if(k<=0)return;gg.save();gg.globalCompositeOperation='lighter';   // il simbolo si accende appena Nick lo vede
    const a=Math.min(1,k)*(.55+.2*Math.sin(SIMB.t*9));for(let i=0;i<6;i++){gg.globalAlpha=a*.12;gg.fillStyle='#9fffd0';gg.beginPath();gg.arc(SIMB.x,SIMB.y,6+i*3.2,0,6.283);gg.fill()}gg.restore()},
  entra(s){const p=s.giocatore;s.occupato=true;document.getElementById('bHint').style.display='none';SIMB.t=0;SIMB.lampo=0;fadeTo(0,1.6);
    s.sequenza(async()=>{await pausa(1.4);await p.vaiA(46,116,false,'E');p.dir='E';await pausa(2.2);   // si ferma davanti al muretto e guarda il fiume (a destra)
      p.dir='N';await pausa(.9);                                                           // poi si gira: ecco il simbolo
      A.musicStart&&A.musicStart('mystery',3);A.sting('simbolo');                                // rivelazione e tensione (provvisorio: musiche gia' presenti)
      for(let i=0;i<=20;i++){SIMB.lampo=i/20;await pausa(.05)}await pausa(1.0);A.sting('scoperta',.6);await pausa(1.6);
      s.vaiScena('c2-primopiano')})}
});
const VOLTO=mkImg('img/emb/nick_primo_piano_r1.png');
const PRIMO={t:0,salta:false,fin:true};
const RIGHE_PRIMO=['Ma allora è tutto vero!',"Ma com'è possibile? Cosa significa tutto questo?",'Che devo fare ora?',"La torre dell'orologio, la chiesa nera… non ho idea di dove siano.",'Non so nemmeno se sono reali.','E quella donna…'];
function vortice(gg,cx,cy,t){   // spirale rotante in leggera trasparenza che nasce dalla fronte e si allarga (effetto vertigine)
  const q=v=>Math.round(v*4)/4,R=Math.min(210,t*60);gg.save();gg.globalCompositeOperation='lighter';
  for(let k=0;k<4;k++)for(let r=1;r<R;r+=.3){const th=k*1.5708+r*.07-t*1.9,x=cx+Math.cos(th)*r*1.45,y=cy+Math.sin(th)*r*.78,f=1-r/Math.max(R,1),a=.30*Math.pow(Math.max(0,f),.6)*Math.min(1,r/5);
    if(x<-2||x>W+2||y<-2||y>H+2)continue;gg.globalAlpha=a;gg.fillStyle=(k+Math.floor(r/9))%2?'#cfe6ff':'#a8ffe0';gg.fillRect(q(x),q(y),1,1)}
  gg.restore()}
registraScena({
  id:'c2-primopiano',giocatore:'protagonista-esterno',nomeGiocatore:'NICK',partenza:{x:120,y:60,dir:'S'},
  canSkip:()=>!PRIMO.fin,skip:s=>{if(PRIMO.fin)return;PRIMO.salta=true;PRIMO.fin=true;M.Dialogo.azzera();C2.finale=true;s.vaiScena('c2-capra',{x:14,y:116,dir:'E'})},   // (19 nov) pulsante SALTA anche nel primo piano con la spirale
  area:[[0,0],[2,0],[2,2],[0,2]],suggerimento:'',senzaEtichette:true,ambiente:{stanza:0,vento:0,pioggia:0,fuoco:0},
  disegnaSfondo(gg,s){R(0,0,W,H,'#05060a');const t=PRIMO.t,im=VOLTO;if(!(im.complete&&im.naturalWidth))return;
    const z=1+.16*Math.min(1,t/14)+.01*Math.sin(t*2.1),hh=122*z,ww=hh*im.naturalWidth/im.naturalHeight,x=120-ww/2+Math.sin(t*37)*.12,y=H-hh+3*z;   // lo zoom lento accompagna la vertigine
    const g2=gg.createRadialGradient(120,60,10,120,60,120);g2.addColorStop(0,'#1a2030');g2.addColorStop(1,'#05060a');gg.fillStyle=g2;gg.fillRect(0,0,W,H);
    gg.save();gg.imageSmoothingEnabled=true;gg.imageSmoothingQuality='high';gg.drawImage(im,x,y,ww,hh);gg.restore();
    vortice(gg,x+ww*.508,y+hh*.25,t)},
  aggiorna(s,dt){PRIMO.t+=dt},
  entra(s){const p=s.giocatore;PRIMO.t=0;PRIMO.salta=false;PRIMO.fin=false;p.visibile=false;s.occupato=true;document.getElementById('bHint').style.display='none';fadeTo(0,.5);
    s.sequenza(async()=>{await pausa(1.6);for(const t of RIGHE_PRIMO){if(PRIMO.salta)return;await s.dici(p,t,{frontale:false});if(PRIMO.salta)return;await pausa(.5)}
      if(PRIMO.salta)return;await pausa(.8);if(PRIMO.salta)return;PRIMO.fin=true;C2.finale=true;s.vaiScena('c2-capra',{x:14,y:116,dir:'E'})})}
});

/* (18 nov) il LIBRO resta nell'inventario per tutta la durata del gioco: ogni scena del capitolo 2 controlla che ci sia (anche se si entra da un link diretto) */
function assicuraLibro(){const S=A.S;if(S&&S.inv&&!S.inv.includes('book')){S.inv.unshift('book');S.bookOpen=true;if(A.refreshInv)A.refreshInv()}}
for(const id of ['capitolo2','c2-esterno','c2-auto','c2-strada','c2-ponte','c2-ponte-vista','c2-ponte-film','c2-scale','c2-ritorno','c2-capra','c2-simbolo','c2-primopiano']){const sc=scenes[id];if(sc&&sc.cfg){const e=sc.cfg.entra;sc.cfg.entra=function(s){assicuraLibro();if(id==='c2-primopiano'||(C2.finale&&(id==='c2-capra'||id==='c2-ritorno')))A.musicStart&&A.musicStart('mystery',2);   // (19 nov) la musica della rivelazione continua dopo la spirale, fino al furgone
      return e?e.call(this,s):undefined}}}
/* da fine capitolo 1 (sogno) al capitolo 2 */
window.__capitolo2=A.capitolo2=()=>{for(const k in C2)C2[k]=typeof C2[k]==='boolean'?false:0;fadeTo(1,1.8,()=>{setScene('capitolo2');fadeTo(0,9)})};   // (14 nov) la velocita' e' al secondo: 9 = schiarita in un decimo di secondo (prima 0,01: nero per minuti)
});

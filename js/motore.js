/* ============================================================================================
   MOTORE DELLE SCENE CAMMINABILI, DEI MOVIMENTI, DEI SUONI E DEL PARLATO
   Si carica prima del gioco e si aggancia alla fine dello script principale: window.__ext.push(fn) -> fn(API).
   Contenuto:
     1. Suoni: passi per superficie (legno, pietra, piastrelle, erba, fango, tappeto, ghiaia, pozzanghera), effetti, ambienti.
     2. Mappa: area calpestabile con ostacoli, ricerca del percorso (A*) e percorso "tirato".
     3. Pers: personaggio che segue i percorsi, anima il passo in base alla distanza, scala con la profondita', fa i passi.
     4. Voci + Dialogo: nuvolette di parlato con macchina da scrivere, bocca sincronizzata, tre voci (blip, sintesi italiana del
        telefono, clip registrate), scelte multiple, narrazione.
     5. Scena: scena camminabile configurabile (sfondo, area, ostacoli, superfici, punti toccabili, uscite, personaggi,
        oggetti in profondita', ambienti) + registraScena().
   ============================================================================================ */
(window.__ext=window.__ext||[]).push(function(A){
"use strict";
const {g,W,H,RS,R,txt,ell,clamp,lerp,hash,inPoly,nearOnPoly,Actor,loadChar,CHARS,say,setHint,fade,fadeTo,setScene,scenes,mkImg,AU,tone,nburst,sfx,view,now,cv,wrap}=A;

/* ============================================================ 1. SUONI */
const noise=(f,q,d,v,t='bandpass',pan=0)=>{ // come nburst, ma con panning leggero (piedi sinistro/destro)
  if(!AU.ctx)return;const c=AU.ctx,t0=c.currentTime,s=c.createBufferSource();s.buffer=AU.buf;
  const fl=c.createBiquadFilter();fl.type=t;fl.frequency.value=f;fl.Q.value=q;const gn=c.createGain();
  gn.gain.setValueAtTime(v,t0);gn.gain.exponentialRampToValueAtTime(.001,t0+d);s.connect(fl);fl.connect(gn);
  let out=gn;if(pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;gn.connect(p);out=p}
  out.connect(AU.master);s.start(t0,Math.random()*1.5);s.stop(t0+d+.05)};
const PASSI={
  legno:(v,r,p)=>{noise(r?240:190,1.3,.075,.55*v,'lowpass',p);noise(1100+Math.random()*300,1.6,.025,.10*v,'bandpass',p);
    if(Math.random()<.14)tone(130+Math.random()*60,.14,'sawtooth',.010*v,100+Math.random()*30)},
  pietra:(v,r,p)=>{noise(2000+Math.random()*400,2.2,.035,.22*v,'bandpass',p);noise(480,1,.05,.2*v,'lowpass',p)},
  piastrelle:(v,r,p)=>{noise(2700+Math.random()*500,3,.03,.2*v,'bandpass',p);noise(700,1,.05,.14*v,'lowpass',p);tone(1900+Math.random()*300,.025,'triangle',.008*v)},
  erba:(v,r,p)=>{noise(650,.8,.1,.2*v,'lowpass',p);noise(3800,.7,.07,.05*v,'highpass',p)},
  fango:(v,r,p)=>{noise(280,1,.15,.38*v,'lowpass',p);tone(170,.11,'sine',.035*v,85);noise(900,1,.05,.08*v,'bandpass',p)},
  tappeto:(v,r,p)=>{noise(170,.8,.09,.22*v,'lowpass',p)},
  ghiaia:(v,r,p)=>{for(let i=0;i<5;i++)setTimeout(()=>noise(2200+Math.random()*2000,1,.03,.07*v,'highpass',p),i*13)},
  pozzanghera:(v,r,p)=>{noise(950,1,.13,.22*v,'bandpass',p);tone(520,.09,'sine',.03*v,240);noise(300,1,.12,.2*v,'lowpass',p)}
};
sfx.passo=(sup='legno',vol=1,corsa=false,piede=0)=>{if(!AU.ctx||AU.muted)return;(PASSI[sup]||PASSI.legno)(vol*(corsa?1.25:1)*(.85+Math.random()*.3),corsa,piede?.18:-.18)};
// effetti
Object.assign(sfx,{
  portaApre(){tone(95,.55,'sawtooth',.045,160);noise(260,1,.25,.22,'lowpass');setTimeout(()=>noise(1800,2,.08,.07,'bandpass'),120)},
  portaChiude(){noise(170,1,.22,.7,'lowpass');tone(70,.25,'sine',.25,45);setTimeout(()=>noise(1400,2,.04,.1,'bandpass'),40)},
  portaChiusa(){for(let i=0;i<3;i++)setTimeout(()=>{noise(2400,3,.03,.18,'bandpass');tone(310,.05,'square',.012,260)},i*85)},
  siede(){noise(240,1,.2,.32,'lowpass');noise(1500,1,.12,.05,'bandpass')},
  alza(){noise(300,1,.16,.22,'lowpass');noise(2600,1,.06,.04,'highpass')},
  raccogli(){noise(3400,1,.13,.1,'highpass');setTimeout(()=>sfx.take&&sfx.take(),70)},
  bussa(){for(let i=0;i<3;i++)setTimeout(()=>{noise(260,1,.1,.6,'lowpass');tone(150,.08,'sine',.2,90)},i*190)},
  cigolio(){tone(210,.5,'sawtooth',.025,330);tone(215,.5,'square',.012,335)},
  campanello(){[880,1320,1760].forEach((f,i)=>setTimeout(()=>tone(f,.5,'sine',.05-i*.012),i*8))},
  chiavi(){for(let i=0;i<5;i++)setTimeout(()=>{noise(4200+Math.random()*1500,3,.03,.09,'bandpass')},i*45+Math.random()*30)},
  carta(){noise(5200,1,.18,.1,'highpass');noise(2800,1,.1,.06,'bandpass')},
  clic(){noise(2400,3,.02,.15,'bandpass');tone(1200,.02,'square',.01)},
  cassetto(){noise(380,1,.28,.3,'lowpass');tone(110,.25,'sawtooth',.03,90)},
  interruttore(){noise(3000,4,.015,.2,'bandpass');setTimeout(()=>noise(2200,4,.02,.12,'bandpass'),60)},
  stoffa(){noise(1800,.7,.18,.05,'bandpass')}
});
// ambienti: vento e brusio di stanza (pioggia e fuoco usano le funzioni gia' esistenti del gioco)
const AMB={vento:null,stanza:null};
function ambiente(o={}){
  if(!AU.ctx)return;const c=AU.ctx,t=c.currentTime;
  if(!AMB.vento){const s=c.createBufferSource();s.buffer=AU.buf;s.loop=true;const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=520;bp.Q.value=.7;
    const gn=c.createGain();gn.gain.value=0;const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=.13;lg.gain.value=220;lfo.connect(lg);lg.connect(bp.frequency);
    s.connect(bp);bp.connect(gn);gn.connect(AU.master);s.start();lfo.start();AMB.vento=gn}
  if(!AMB.stanza){const o1=c.createOscillator(),o2=c.createOscillator(),gn=c.createGain();o1.frequency.value=50;o2.frequency.value=100.4;gn.gain.value=0;o1.connect(gn);o2.connect(gn);gn.connect(AU.master);o1.start();o2.start();AMB.stanza=gn}
  AMB.vento.gain.setTargetAtTime((o.vento||0)*.05,t,.8);AMB.stanza.gain.setTargetAtTime((o.stanza||0)*.012,t,.8);
  if(A.setRain&&o.pioggia!==undefined)A.setRain(o.pioggia,!!o.pioggiaDentro);
  if(A.setFire&&o.fuoco!==undefined)A.setFire(o.fuoco)}

/* ============================================================ 2. MAPPA E PERCORSI */
class Mappa{
  constructor(area,ostacoli=[],cell=3){
    this.area=area;this.ost=ostacoli;this.cell=cell;
    const xs=area.map(p=>p[0]),ys=area.map(p=>p[1]);
    this.x0=Math.floor(Math.min(...xs));this.y0=Math.floor(Math.min(...ys));
    this.nx=Math.ceil((Math.max(...xs)-this.x0)/cell)+1;this.ny=Math.ceil((Math.max(...ys)-this.y0)/cell)+1;
    this.gr=new Uint8Array(this.nx*this.ny);
    for(let j=0;j<this.ny;j++)for(let i=0;i<this.nx;i++)this.gr[j*this.nx+i]=this.libero(this.x0+i*cell,this.y0+j*cell)?1:0}
  libero(x,y){if(!inPoly(this.area,x,y))return false;for(const o of this.ost)if(inPoly(o,x,y))return false;return true}
  visibile(ax,ay,bx,by){const d=Math.hypot(bx-ax,by-ay),n=Math.max(1,Math.ceil(d/1.2));
    for(let i=1;i<=n;i++)if(!this.libero(ax+(bx-ax)*i/n,ay+(by-ay)*i/n))return false;return true}
  cella(x,y){return [clamp(Math.round((x-this.x0)/this.cell),0,this.nx-1),clamp(Math.round((y-this.y0)/this.cell),0,this.ny-1)]}
  vicina(x,y){ // punto libero piu' vicino (a una cella libera)
    if(this.libero(x,y))return [x,y];
    let best=null,bd=1e9;for(let j=0;j<this.ny;j++)for(let i=0;i<this.nx;i++)if(this.gr[j*this.nx+i]){
      const px=this.x0+i*this.cell,py=this.y0+j*this.cell,d=(px-x)*(px-x)+(py-y)*(py-y);if(d<bd){bd=d;best=[px,py]}}
    return best||[x,y]}
  percorso(ax,ay,bx,by){
    const [sx,sy]=this.vicina(ax,ay),[tx,ty]=this.vicina(bx,by);
    if(this.visibile(sx,sy,tx,ty))return [[tx,ty]];
    const nx=this.nx,ny=this.ny,gr=this.gr,[si,sj]=this.cella(sx,sy),[ti,tj]=this.cella(tx,ty);
    const S=sj*nx+si,T=tj*nx+ti,gs=new Float32Array(nx*ny).fill(1e9),came=new Int32Array(nx*ny).fill(-1),open=[S],inOpen=new Uint8Array(nx*ny),closed=new Uint8Array(nx*ny);
    gs[S]=0;inOpen[S]=1;const hh=n=>{const i=n%nx,j=(n/nx)|0;return Math.hypot(i-ti,j-tj)};
    let found=false;
    while(open.length){
      let bi=0,bf=1e18;for(let k=0;k<open.length;k++){const n=open[k],f=gs[n]+hh(n);if(f<bf){bf=f;bi=k}}
      const cur=open.splice(bi,1)[0];inOpen[cur]=0;if(cur===T){found=true;break}closed[cur]=1;
      const ci=cur%nx,cj=(cur/nx)|0;
      for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const i=ci+di,j=cj+dj;if(i<0||j<0||i>=nx||j>=ny)continue;
        const n=j*nx+i;if(!gr[n]||closed[n])continue;
        if(di&&dj&&(!gr[cj*nx+i]||!gr[j*nx+ci]))continue;   // niente scorciatoie sugli angoli
        const ng=gs[cur]+(di&&dj?1.414:1);if(ng<gs[n]){gs[n]=ng;came[n]=cur;if(!inOpen[n]){inOpen[n]=1;open.push(n)}}}}
    if(!found)return [[tx,ty]];
    const cells=[];for(let n=T;n!==-1;n=came[n])cells.push([this.x0+(n%nx)*this.cell,this.y0+((n/nx)|0)*this.cell]);cells.reverse();
    // percorso tirato: dal punto corrente salto al punto piu' lontano che si vede in linea retta
    const out=[];let px=sx,py=sy,i=0;
    while(i<cells.length-1){let k=cells.length-1;while(k>i&&!this.visibile(px,py,cells[k][0],cells[k][1]))k--;
      if(k===i)k=i+1;out.push(cells[k]);px=cells[k][0];py=cells[k][1];i=k}
    if(out.length){out[out.length-1]=[tx,ty]}else out.push([tx,ty]);
    return out}}

/* ============================================================ 3. PERSONAGGIO */
class Pers extends Actor{
  constructor(nome,x,y,scena){
    super(nome,x,y);this.scena=scena;this.path=[];this.fase=0;this.vel=27;this.corsa=false;this.arrivo=null;this.passoN=0;
    this.bocca=0;this.piede=0;this.nome=nome;this.colore='#e8dfc0';this.visibile=true}
  scala(){return this.scena?this.scena.scala(this.y):1.5}
  altezza(){const c=this.c;return c&&c.ready?c.h/RS*this.scala():40}   // altezza in px logici
  vaiA(x,y,corri=false,dir=null){
    if(this.state==='sit'){this.standUp()}
    this.fermaCamminata(false);
    const m=this.scena&&this.scena.mappa;this.path=m?m.percorso(this.x,this.y,x,y):[[x,y]];this.corsa=!!corri;this.arrivo=dir;
    return new Promise(r=>{this._res=r;if(this.seq)this.pending=null})}
  fermaCamminata(ok){this.path=[];if(this._res){const r=this._res;this._res=null;r(!!ok)}}
  guarda(d){this.dir=d;return this}
  guardaVerso(x,y){const dx=x-this.x,dy=y-this.y;this.dir=Math.abs(dx)>=Math.abs(dy)*.6?(dx>=0?'E':'W'):(dy>=0?'S':'N');return this}
  aspetta(s){return new Promise(r=>setTimeout(r,s*1000))}
  azione(nome){return new Promise(r=>{ // sedersi, raccogliere, indicare con attesa
    if(nome==='siedi')this.sitDown();else if(nome==='alzati')this.standUp();else if(nome==='raccogli')this.pickUp();else if(nome==='indica')this.pointAt();
    const t=nome==='siedi'?.5:nome==='alzati'?.5:nome==='raccogli'?1.3:1.6;setTimeout(r,t*1000)})}
  update(dt){
    this.t+=dt;
    if(this.seq){this.st+=dt;let cur=this.seq[this.si];
      while(cur&&cur[1]>0&&this.st>=cur[1]){this.st-=cur[1];this.si++;cur=this.seq[this.si]}
      if(!cur||cur[0]==='#'){this.seq=null;this.state='idle'}else return}
    if(!this.path.length){if(this.state==='walk'){this.state='idle';this.v=0}return}
    const [tx,ty]=this.path[0],dx=tx-this.x,dy=ty-this.y,d=Math.hypot(dx,dy),s=this.scala();
    this.v=Math.min(1,this.v+dt*4);
    const vel=this.vel*(s/1.45)*(this.corsa?1.9:1)*(.45+.55*this.v)*(this.path.length===1&&d<5?Math.max(.5,d/5):1),step=Math.min(vel*dt,d);
    if(d<.6){this.path.shift();if(!this.path.length){this.state='idle';this.v=0;if(this.arrivo)this.dir=this.arrivo;const r=this._res;this._res=null;if(r)r(true)}return}
    this.x+=dx/d*step;this.y+=dy/d*step;this.lastD=d+(this.path.length-1)*50;this.state='walk';
    const horiz=this.dir==='E'||this.dir==='W';
    if(horiz?Math.abs(dy)>Math.abs(dx)*1.5:Math.abs(dx)>Math.abs(dy)*.8)this.dir=Math.abs(dx)>=Math.abs(dy)*(horiz?1.5:.8)?(dx>0?'E':'W'):(dy>0?'S':'N');
    else if(horiz)this.dir=dx>0?'E':'W';else this.dir=dy>0?'S':'N';
    // passo: la fase del ciclo avanza con la distanza percorsa (niente piedi che scivolano) e a ogni mezzo ciclo scatta il suono
    const ciclo=Math.max(14,this.altezza()*.78)*(this.corsa?.62:1);
    const f0=this.fase;this.fase+=step/ciclo;
    if(Math.floor(this.fase*2)!==Math.floor(f0*2)){this.piede^=1;if(this.scena)this.scena.passo(this)}}
  pose(){
    const f=this.c.fr,d=this.dir,E=d==='E'||d==='W',flip=d==='W',stat={S:'front',N:'back',E:'right',W:'left'}[d];
    if(this.seq&&this.seq[this.si]&&this.seq[this.si][0])return {n:this.seq[this.si][0],flip,dy:0};
    if(this.state==='sit'&&this.seats().length)return {n:this.seats()[this.seatI%this.seats().length],flip,dy:0};
    if(this.state==='walk'){
      const key=E?'walk_E_':'walk_'+d+'_',a=[];for(let i=1;f[key+i];i++)a.push(key+i);
      if(!a.length&&E)for(let i=1;f['walk'+i];i++)a.push('walk'+i);
      if(a.length){const r=this.corsa;   // la corsa e' lo stesso ciclo della camminata, piu' veloce, con rimbalzo e busto inclinato in avanti
        return {n:a[Math.floor((this.fase%1)*a.length)%a.length],flip,dy:r?-Math.abs(Math.sin(this.fase*Math.PI*2))*1.5*this.v:0,rot:r&&E?.11*this.v:0}}
      return {n:stat,flip:false,dy:-Math.abs(Math.sin(this.fase*Math.PI*2))*.9}}
    if(d==='S'&&this.talking&&f.talk_S_1)return {n:'talk_S_'+clamp(this.bocca||1,1,4),flip:false,dy:0};
    if(d==='S'&&f.idle_S_1){
      if(f.idle_S_4&&(this.t+this.seed)%4.3<.14)return {n:'idle_S_4',flip:false,dy:0};
      return {n:'idle_S_'+[1,2,3,2][Math.floor((this.t+this.seed)/.6)%4],flip:false,dy:0}}
    return {n:stat,flip:false,dy:Math.sin(this.t*1.6)*.1}}
  testa(){return {x:this.x,y:this.y-this.altezza()*.97}}}

/* ============================================================ 4. VOCI E DIALOGO */
const VOCI={ // profilo di voce per personaggio: f0 in Hz, forma d'onda, battute al secondo, variazione, e parametri della sintesi del telefono
  'protagonista-interno':{sx:'m',f0:150,forma:'triangle',cps:30,mod:.10,tp:.85,tr:.98,col:'#e8dfc0'},
  'protagonista-esterno':{sx:'m',f0:150,forma:'triangle',cps:30,mod:.10,tp:.85,tr:.98,col:'#e8dfc0'},
  donna:{sx:'f',f0:300,forma:'triangle',cps:29,mod:.12,tp:1.25,tr:1,col:'#9fd6d0'},
  prete:{sx:'m',f0:112,forma:'sawtooth',cps:23,mod:.06,tp:.6,tr:.88,col:'#d9b98a'},
  leonardo:{sx:'f',f0:400,forma:'square',cps:36,mod:.18,tp:1.6,tr:1.15,col:'#f08a7a'},
  anna:{sx:'f',f0:265,forma:'triangle',cps:31,mod:.14,tp:1.15,tr:1.03,col:'#e0a8d0'},
  'anna-senza-giacca':{sx:'f',f0:265,forma:'triangle',cps:31,mod:.14,tp:1.15,tr:1.03,col:'#e0a8d0'},
  lillo:{sx:'m',f0:128,forma:'sawtooth',cps:27,mod:.12,tp:.7,tr:.95,col:'#b8c8a0'},
  greg:{sx:'m',f0:172,forma:'triangle',cps:30,mod:.08,tp:.95,tr:1,col:'#b8a0d8'},
  gemella:{sx:'f',f0:360,forma:'sine',cps:27,mod:.08,tp:1.5,tr:.95,col:'#a8c8f0'},
  'doc-ritorno-al-futuro':{sx:'m',f0:210,forma:'square',cps:34,mod:.30,tp:1.1,tr:1.12,col:'#f0e8d0'},
  default:{sx:'m',f0:185,forma:'triangle',cps:30,mod:.10,tp:1,tr:1,col:'#e8dfc0'}};
const FORM={a:[800,1200],e:[500,1800],i:[320,2300],o:[500,900],u:[320,800]};
const BOCCA={a:3,e:2,i:2,o:4,u:4}; // forma della bocca: 1 chiusa, 2 poco aperta, 3 molto aperta, 4 a "o"
function blip(p,ch,altezza,vol){
  if(!AU.ctx||AU.muted)return;const c=AU.ctx,t=c.currentTime,vo=FORM[ch];
  const o=c.createOscillator(),gn=c.createGain(),fl=c.createBiquadFilter();o.type=p.forma;
  o.frequency.value=p.f0*altezza*(1+(Math.random()*2-1)*p.mod);fl.type='bandpass';fl.Q.value=vo?2.2:.8;fl.frequency.value=vo?vo[0]+(Math.random()*120-60):1400;
  const d=vo?.06:.035;gn.gain.setValueAtTime(.0001,t);gn.gain.linearRampToValueAtTime(vol*(vo?1:.55),t+.008);gn.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(fl);fl.connect(gn);gn.connect(AU.master);o.start(t);o.stop(t+d+.02);
  if(vo){const o2=c.createOscillator(),g2=c.createGain(),f2=c.createBiquadFilter();o2.type=p.forma;o2.frequency.value=o.frequency.value;f2.type='bandpass';f2.Q.value=3;f2.frequency.value=vo[1];
    g2.gain.setValueAtTime(.0001,t);g2.gain.linearRampToValueAtTime(vol*.5,t+.008);g2.gain.exponentialRampToValueAtTime(.0001,t+d);o2.connect(f2);f2.connect(g2);g2.connect(AU.master);o2.start(t);o2.stop(t+d+.02)}}
const Voce={modo:(()=>{try{return localStorage.getItem('mistero-voce')||'blip'}catch(e){return'blip'}})(),voci:null,
  scegli(sx){ // sceglie la voce italiana del telefono adatta: maschile o femminile
    if(!window.speechSynthesis)return null;const vs=speechSynthesis.getVoices().filter(v=>/^it/i.test(v.lang));if(!vs.length)return null;
    const M=['Luca','Cosimo','Giorgio','Diego','Marco','Paolo','Male'],F=['Alice','Federica','Paola','Elsa','Emma','Isabella','Google italiano','Female'];
    for(const n of (sx==='m'?M:F)){const v=vs.find(v=>v.name.includes(n));if(v)return v}
    if(sx==='m'){const v=vs.find(v=>!F.some(n=>v.name.includes(n)));if(v)return v}
    return vs[0]},
  disponibile(){return !!window.speechSynthesis&&speechSynthesis.getVoices().some(v=>/^it/i.test(v.lang))},
  imposta(m){this.modo=m;try{localStorage.setItem('mistero-voce',m)}catch(e){}if(window.speechSynthesis&&m!=='voce')speechSynthesis.cancel()}};
const VD=/[?&]voci=2/.test(location.search)?'audio/voci2/':'audio/voci-r2/';   // ?voci=2 = clip "pulite" (prova). (12 nov) voci-r2: le stesse clip in MP3 a 44,1 kHz (quelle a 16 kHz su iPhone non si sentivano)
fetch(VD+'indice.json').then(r=>r.ok?r.json():null).then(j=>{Voce.clips=j}).catch(()=>{});
/* (12 nov) clip vocali con Web Audio, non con <audio>: su iPhone un <audio> avviato da un timer (non dal tocco) resta muto,
   mentre il contesto Web Audio, sbloccato dal primo tocco, suona anche con il telefono in modalita' silenziosa. Stessa interfaccia minima di <audio>. */
const CLIPBUF={};
function caricaClip(u){if(!AU.ctx)return Promise.resolve(null);if(!CLIPBUF[u])CLIPBUF[u]=fetch(u).then(r=>r.arrayBuffer()).then(ab=>new Promise((ok,ko)=>AU.ctx.decodeAudioData(ab,ok,ko))).catch(()=>{delete CLIPBUF[u];return null});return CLIPBUF[u]}
function suonaClip(u,vol=1){
  if(!AU.ctx){const a=new Audio(u);a.play().catch(()=>{});return a}
  const c=AU.ctx,o={duration:0,ended:false,paused:false,t0:0,src:null,
    get currentTime(){return this.src?Math.max(0,c.currentTime-this.t0):0},
    pause(){this.paused=true;try{this.src&&this.src.stop()}catch(e){}},play(){return Promise.resolve()}};
  if(c.state==='suspended')c.resume();
  caricaClip(u).then(b=>{if(!b){o.ended=true;return}if(o.paused)return;
    const s=c.createBufferSource(),gn=c.createGain();s.buffer=b;gn.gain.value=vol;s.connect(gn);gn.connect(AU.master);
    s.onended=()=>{o.ended=true};o.duration=b.duration;o.t0=c.currentTime+.02;o.src=s;s.start(o.t0)});
  return o}
if(window.speechSynthesis){speechSynthesis.getVoices();speechSynthesis.onvoiceschanged=()=>{Voce.voci=speechSynthesis.getVoices()}}

const Dialogo={
  coda:[],cor:null,el:null,scelteEl:null,
  attivo(){return !!this.cor||this.coda.length>0||!!this.scelteEl},
  creaDOM(){ if(this.el)return;
    const st=document.createElement('style');st.textContent=`
    .nuv{position:absolute;z-index:5;max-width:44%;padding:.55em .8em;background:rgba(6,8,13,.94);border:2px solid #e8dfc0;color:#f2ead0;font-family:Verdana,'Trebuchet MS','DejaVu Sans',Arial,sans-serif;font-weight:700;line-height:1.28;letter-spacing:.01em;pointer-events:none;border-radius:3px;box-shadow:3px 3px 0 rgba(0,0,0,.55);transform:translate(-50%,-100%);opacity:0;transition:opacity .12s}
    .nuv.on{opacity:1}.nuv .nm{display:block;font-size:.72em;letter-spacing:.08em;text-transform:uppercase;margin-bottom:.25em;opacity:.95}
    .nuv::after{content:'';position:absolute;left:var(--tail,50%);bottom:-.62em;width:.7em;height:.7em;background:rgba(6,8,13,.94);border-right:2px solid var(--bc,#e8dfc0);border-bottom:2px solid var(--bc,#e8dfc0);transform:translateX(-50%) rotate(45deg)}
    .nuv .cur{display:inline-block;width:.5em;opacity:.8;animation:cur .5s steps(2) infinite}@keyframes cur{50%{opacity:0}}
    .scelte{position:absolute;left:50%;bottom:4%;transform:translateX(-50%);z-index:6;display:flex;flex-direction:column;gap:.4em;max-width:80%}
    .scelte button{text-align:left;text-transform:none;letter-spacing:.01em;font-size:inherit;padding:.5em .9em;pointer-events:auto}`;
    document.head.appendChild(st);
    const d=document.createElement('div');d.className='nuv';wrap.appendChild(d);this.el=d},
  /* ---- API ---- */
  parla(att,testo,opz={}){return new Promise(res=>{this.coda.push({att,testo,opz,res});if(!this.cor)this.prossima()})},
  narra(testo,sec){say(testo);return new Promise(r=>setTimeout(r,(sec||(2.2+testo.length*.055))*1000))},
  async scegli(opzioni,att){ // opzioni: ['testo 1','testo 2'] -> indice scelto
    this.creaDOM();return new Promise(res=>{const d=document.createElement('div');d.className='scelte';
      d.style.fontSize=this.fontPx()+'px';
      opzioni.forEach((t,i)=>{const b=document.createElement('button');b.textContent=t;b.onclick=e=>{e.stopPropagation();d.remove();this.scelteEl=null;res(i)};d.appendChild(b)});
      wrap.appendChild(d);this.scelteEl=d})},
  fontPx(){const v=view();return clamp(5.3*v.k,9,19)},
  prossima(){
    const r=this.coda.shift();if(!r){this.cor=null;if(this.el)this.el.classList.remove('on');return}
    this.creaDOM();const att=r.att,p=VOCI[att&&att.nome]||VOCI.default,tx=r.testo;
    // testo a capo gestito dal browser; qui si calcolano solo tempi e vocali
    this.cor={r,att,p,tx,n:0,acc:0,t:0,fine:false,att2:0,tts:null,clip:null,mouthT:0};
    if(att){att.talking=true;att.bocca=1;if(!att.seq&&att.state!=='sit'&&r.opz.frontale!==false&&att.c&&att.c.fr&&att.c.fr.talk_S_1){att.dir='S'}}
    const nm=r.opz.nome||(att&&att.etichetta)||'';this.nome=nm;this.col=r.opz.colore||p.col;
    this.el.style.setProperty('--bc',this.col);this.el.style.borderColor=this.col;this.el.style.fontSize=this.fontPx()+'px';
    this.cor.cps=p.cps*(r.opz.vel||1);
    // voce del telefono o clip registrata
    const reg=(window.__battute=window.__battute||[]);if(att&&!reg.some(b=>b.pers===att.nome&&b.testo===tx))reg.push({pers:att.nome,testo:tx});   // elenco delle battute dette: serve a genera_voci.py
    const cf=r.opz.clip||(Voce.modo==='voce'&&Voce.clips&&att&&Voce.clips[att.nome+'|'+tx]?VD+Voce.clips[att.nome+'|'+tx]:null);   // clip registrata (Piper) se esiste per questa battuta
    if(cf){this.cor.clip=suonaClip(cf)}
    else if(Voce.modo==='voce'&&window.speechSynthesis&&!r.opz.animale){const v=Voce.scegli(p.sx);const u=new SpeechSynthesisUtterance(tx);u.lang='it-IT';if(v)u.voice=v;u.pitch=clamp(p.tp,.1,2);u.rate=clamp(p.tr*(r.opz.vel||1),.5,1.6);
      u.onboundary=e=>{this.cor&&(this.cor.bi=e.charIndex)};u.onend=()=>{this.cor&&(this.cor.ttsFine=true)};this.cor.tts=u;speechSynthesis.cancel();speechSynthesis.speak(u);
      this.cor.cps=15*u.rate}
    this.disegnaTesto()},
  /* testo visibile: macchina da scrivere */
  disegnaTesto(){const c=this.cor;if(!c)return;const vis=c.tx.slice(0,Math.floor(c.n));
    const nome=this.nome?`<span class="nm" style="color:${this.col}">${this.nome}</span>`:'';
    this.el.innerHTML=nome+vis.replace(/</g,'&lt;')+(c.fine?'':'<i class="cur">&#9646;</i>');
    const hid=c.tx.slice(Math.floor(c.n)); // riempie lo spazio del testo non ancora scritto per non far saltare la forma della nuvola
    if(hid){const sp=document.createElement('span');sp.style.visibility='hidden';sp.textContent=hid;this.el.appendChild(sp)}},
  posiziona(){if(!this.el||!this.cor)return;const c=this.cor,v=view();
    let hx=W/2,hy=30;if(c.att&&c.att.testa){const t=c.att.testa();hx=t.x;hy=t.y-4}
    const r=cv.getBoundingClientRect(),wr=wrap.getBoundingClientRect(),k=v.k;
    const px=(r.left-wr.left)+(r.width-v.DW*k)/2+(hx+v.OX)*k,py=(r.top-wr.top)+(r.height-H*k)/2+hy*k;
    const bw=this.el.offsetWidth,bh=this.el.offsetHeight,half=bw/2,margin=6;
    const cx=clamp(px,half+margin,wrap.clientWidth-half-margin),top=py-bh;
    this.el.style.left=cx+'px';this.el.style.top=Math.max(bh+margin,py)+'px';
    this.el.style.setProperty('--tail',clamp(50+(px-cx)/bw*100,12,88)+'%');this.el.classList.add('on')},
  aggiorna(dt){const c=this.cor;if(!c)return;
    c.t+=dt;
    if(!c.fine){
      // avanzamento: a velocita' fissa; con voce del telefono / clip segue la durata
      let spd=c.cps;if(c.clip&&c.clip.duration>0)spd=c.tx.length/c.clip.duration;
      const prev=Math.floor(c.n);c.acc+=dt*spd;
      // pause di punteggiatura
      const nextCh=c.tx[Math.floor(c.n)]||'';
      if(c.pausa>0){c.pausa-=dt}else{c.n=Math.min(c.tx.length,c.n+dt*spd);
        if(c.tts&&c.bi!==undefined&&c.bi>c.n)c.n=Math.min(c.tx.length,c.bi)}
      for(let i=prev;i<Math.floor(c.n);i++){const ch=(c.tx[i]||'').toLowerCase();if(!ch)continue;
        const f=ch.normalize('NFD').replace(/[̀-ͯ]/g,'');
        if('.!?:;'.includes(ch))c.pausa=.22;else if(ch===',')c.pausa=.11;
        if(/[a-z]/.test(f)){
          const mo=BOCCA[f]||1;if(c.att)c.att.bocca=mo;c.mouthT=.09;
          if(Voce.modo!=='muto'&&!c.tts&&!c.clip&&!c.r.opz.animale){const fine=c.tx.length-i<=Math.max(4,c.tx.length*.2);const q=/\?\s*$/.test(c.tx)&&fine?1+.35*(1-(c.tx.length-i)/Math.max(4,c.tx.length*.2)):1;
            const decl=1-.1*(i/Math.max(1,c.tx.length));
            if(FORM[f]||(i%2===0&&'bdgptkmnlrsfvc'.includes(f)))blip(c.p,FORM[f]?f:'',decl*q*(/!\s*$/.test(c.tx)?1.08:1),.045)}}
        else if(ch===' '){if(c.att)c.att.bocca=1}}
      if(c.clip&&c.clip.currentTime>0){/* con la clip la bocca segue l'ampiezza: vedi analizzatore, qui basta il testo */}
      if(c.mouthT>0){c.mouthT-=dt;if(c.mouthT<=0&&c.att)c.att.bocca=1}
      this.disegnaTesto();
      if(c.n>=c.tx.length&&(!c.tts||c.ttsFine||Voce.modo!=='voce'||c.t>c.tx.length*.12+4)&&(!c.clip||c.clip.ended||c.clip.paused||c.t>c.tx.length*.12+4)){c.fine=true;c.att2=0;if(c.att){c.att.talking=false;c.att.bocca=1}this.disegnaTesto()}}
    else{c.att2+=dt;const lettura=c.r.opz.attesa??(.9+c.tx.length*.05);if(c.r.opz.auto!==false&&c.att2>lettura)this.chiudi()}
    this.posiziona()},
  tocca(){const c=this.cor;if(!c)return false;
    if(!c.fine){c.n=c.tx.length;c.fine=true;c.att2=0;if(c.att){c.att.talking=false;c.att.bocca=1}if(c.tts)speechSynthesis.cancel();if(c.clip)c.clip.pause();this.disegnaTesto();return true}
    this.chiudi();return true},
  chiudi(){const c=this.cor;if(!c)return;if(c.tts)speechSynthesis.cancel();if(c.clip)c.clip.pause();if(c.att){c.att.talking=false;c.att.bocca=1}
    this.cor=null;this.el.classList.remove('on');c.r.res(true);this.prossima()},
  azzera(){while(this.coda.length)this.coda.pop().res(false);if(this.cor){const c=this.cor;if(c.att){c.att.talking=false;c.att.bocca=1}if(c.clip)c.clip.pause();c.r.res(false);this.cor=null}if(this.el)this.el.classList.remove('on');if(this.scelteEl){this.scelteEl.remove();this.scelteEl=null}if(window.speechSynthesis)speechSynthesis.cancel()}};

/* pulsante voce: BLIP (voci a suoni), VOCE (sintesi italiana del telefono), MUTO (solo testo) */
(function(){const bar=document.getElementById('bar');if(!bar||document.getElementById('bVoce'))return;
  const b=document.createElement('button');b.id='bVoce';const et={blip:'♬',voce:'🗣',muto:'✎'};
  const agg=()=>{b.textContent=et[Voce.modo]||'♬';b.title='Parlato: '+Voce.modo};agg();
  b.onclick=e=>{e.stopPropagation();const ordine=['blip','voce','muto'].filter(m=>m!=='voce'||Voce.disponibile()||!window.speechSynthesis||true);
    const i=ordine.indexOf(Voce.modo);Voce.imposta(ordine[(i+1)%ordine.length]);agg();setHint('PARLATO: '+({blip:'VOCI A SUONI',voce:'VOCE ITALIANA',muto:'SOLO TESTO'})[Voce.modo]);setTimeout(()=>setHint(''),1800)};
  bar.appendChild(b)})();

/* ============================================================ 5. SCENA CAMMINABILE */
class Scena{
  constructor(cfg){
    this.cfg=cfg;this.id=cfg.id;this.mappa=new Mappa(cfg.area,cfg.ostacoli||[],cfg.cella||3);
    this.sfondo=cfg.sfondo?mkImg(cfg.sfondo):null;
    this.oggetti=[];this.attori={};this.giocatore=null;this.occupato=false;this.t=0;this.hover=null;this.ultimoTocco=0;this.debug=/[?&]debug/.test(location.search);
    this.superfici=cfg.superfici||[];this.sup0=cfg.superficie||'legno'}
  scala(y){const c=this.cfg;if(c.scala)return c.scala(y);const p=c.prof||[94,117,1.45,1.9];return lerp(p[2],p[3],clamp((y-p[0])/(p[1]-p[0]),0,1))}
  superficieIn(x,y){for(const s of this.superfici)if(inPoly(s.poly,x,y))return s.tipo;return this.sup0}
  passo(p){const a=this.cfg.audioPassi;if(a===false)return;const sup=this.superficieIn(p.x,p.y);
    const vicino=this.giocatore?Math.hypot(p.x-this.giocatore.x,p.y-this.giocatore.y):0;
    const vol=clamp(p.scala()/1.9,.4,1)*(p===this.giocatore?1:clamp(1-vicino/220,.25,.9));
    sfx.passo(sup,vol*(this.cfg.volPassi??1),p.corsa,p.piede)}
  /* ---- ciclo di vita ---- */
  enter(){
    Dialogo.azzera();Dialogo.creaDOM();this.t=0;this.occupato=false;
    document.getElementById('bHint').style.display='';
    setHint(this.cfg.suggerimento||'TOCCA PER CAMMINARE · TOCCA GLI OGGETTI, LE PORTE E I PERSONAGGI');
    const arr=Scena.arrivo&&Scena.arrivo.id===this.id?Scena.arrivo:null;Scena.arrivo=null;
    this.pronto=false;
    const nomi=[...new Set([...(this.cfg.attori||[]).map(a=>a.nome),this.cfg.giocatore].filter(Boolean))];
    Promise.all(nomi.map(loadChar)).then(()=>{
      this.attori={};
      for(const a of this.cfg.attori||[]){const p=new Pers(a.nome,a.x,a.y,this);p.dir=a.dir||'S';p.etichetta=a.etichetta||a.nome.toUpperCase().replace(/-/g,' ');if(a.vel)p.vel=a.vel;this.attori[a.id||a.nome]=p;if(a.siedi)p.state='sit'}
      if(this.cfg.giocatore){const s=this.cfg.partenza||{x:40,y:105,dir:'E'},p=new Pers(this.cfg.giocatore,arr?arr.x:s.x,arr?arr.y:s.y,this);p.dir=arr?arr.dir||'E':s.dir||'E';p.etichetta=this.cfg.nomeGiocatore||'';this.attori._io=p;this.giocatore=p}
      this.oggetti=(this.cfg.oggetti||[]).map(o=>({...o,img:o.img?mkImg(o.img):null}));
      this.pronto=true;if(arr&&arr.cammina)this.giocatore.vaiA(arr.cammina.x,arr.cammina.y,false,arr.cammina.dir);
      const amb=this.cfg.ambiente;if(amb)ambiente(amb);
      if(this.cfg.entra)this.cfg.entra(this)})}
  update(dt){
    this.t+=dt;if(!this.pronto)return;
    for(const k in this.attori)this.attori[k].update(dt);
    Dialogo.aggiorna(dt);
    if(this.cfg.aggiorna)this.cfg.aggiorna(this,dt)}
  /* ---- disegno ---- */
  draw(){
    g.globalAlpha=1;g.globalCompositeOperation='source-over';
    if(this.cfg.disegnaSfondo)this.cfg.disegnaSfondo(g,this);else if(this.sfondo&&this.sfondo.complete&&this.sfondo.naturalWidth)g.drawImage(this.sfondo,0,0,W,H);else R(0,0,W,H,'#111');
    if(!this.pronto){txt('CARICO...',90,56,'#d8cfb0');return}
    if(this.cfg.sotto)this.cfg.sotto(g,this);
    const lista=[];
    for(const k in this.attori){const a=this.attori[k];if(a.visibile!==false)lista.push({y:a.y,f:()=>a.draw(a.scala())})}
    for(const o of this.oggetti){if(o.visibile&&!o.visibile(this))continue;lista.push({y:o.baseY??(o.y||0),f:()=>{if(o.img&&o.img.complete&&o.img.naturalWidth)g.drawImage(o.img,o.x,o.y,o.w||o.img.naturalWidth,o.h||o.img.naturalHeight);if(o.disegna)o.disegna(g,this)}})}
    lista.sort((a,b)=>a.y-b.y);for(const e of lista)e.f();
    g.globalAlpha=1;
    if(this.cfg.sopra)this.cfg.sopra(g,this);
    // evidenzia il punto toccabile sotto il dito / il mouse
    const h=this.hover;if(h&&!this.occupato){g.globalAlpha=.5+.25*Math.sin(now()*8);const r=h.rect;if(r){R(r[0],r[1],r[2],1,'#e0a040');R(r[0],r[1]+r[3]-1,r[2],1,'#e0a040');R(r[0],r[1],1,r[3],'#e0a040');R(r[0]+r[2]-1,r[1],1,r[3],'#e0a040')}g.globalAlpha=1}
    if(this.debug)this.disegnaDebug()}
  disegnaDebug(){const m=this.mappa;g.globalAlpha=.35;
    for(let j=0;j<m.ny;j++)for(let i=0;i<m.nx;i++)if(m.gr[j*m.nx+i])R(m.x0+i*m.cell,m.y0+j*m.cell,1,1,'#40ff80');
    for(const h of this.cfg.punti||[])if(h.rect)R(h.rect[0],h.rect[1],h.rect[2],h.rect[3],'#ff4080');
    for(const u of this.cfg.uscite||[])R(u.rect[0],u.rect[1],u.rect[2],u.rect[3],'#4080ff');
    g.globalAlpha=1;const p=this.giocatore;if(p&&p.path.length){let x=p.x,y=p.y;for(const q of p.path){line2(x,y,q[0],q[1]);x=q[0];y=q[1]}}}
  /* ---- tocchi ---- */
  trova(x,y){
    for(const u of this.cfg.uscite||[]){const r=u.rect;if(x>=r[0]&&x<r[0]+r[2]&&y>=r[1]&&y<r[1]+r[3])return {tipo:'uscita',o:u,rect:r,nome:u.nome}}
    for(const k in this.attori){if(k==='_io')continue;const a=this.attori[k];if(a.visibile===false)continue;const h=a.altezza(),w=a.c.w/RS*a.scala()*.28;
      if(Math.abs(x-a.x)<w&&y<a.y+2&&y>a.y-h)return {tipo:'attore',o:a,rect:[a.x-w,a.y-h,w*2,h],nome:a.etichetta}}
    for(const h of this.cfg.punti||[]){if(h.visibile&&!h.visibile(this))continue;const r=h.rect;if(r&&x>=r[0]&&x<r[0]+r[2]&&y>=r[1]&&y<r[1]+r[3])return {tipo:'punto',o:h,rect:r,nome:h.nome}}
    return null}
  move(x,y){if(!this.pronto)return;const t=this.trova(x,y);this.hover=t;setHint(t&&t.nome?t.nome:(this.cfg.suggerimento||''))}
  async down(x,y){
    if(fade.a>.3||!this.pronto)return;
    if(Dialogo.cor){Dialogo.tocca();return}
    if(this.occupato||Dialogo.scelteEl)return;
    const p=this.giocatore;if(!p)return;
    const doppio=now()-this.ultimoTocco<.32;this.ultimoTocco=now();
    const t=this.trova(x,y);this.hover=t;
    if(t){await this.interagisci(t,doppio);return}
    const pt=this.mappa.libero(x,y)?[x,y]:this.mappa.vicina(x,y);
    this.hover={tipo:'terra',rect:[pt[0]-2,pt[1]-1,5,2]};setTimeout(()=>{if(this.hover&&this.hover.tipo==='terra')this.hover=null},350);
    p.vaiA(pt[0],pt[1],doppio)}
  async interagisci(t,corri=false){
    const p=this.giocatore;this.hover=null;
    if(t.tipo==='attore'){const a=t.o,dx=a.x>p.x?-1:1,ax=a.x+dx*Math.max(14,a.altezza()*.34),ay=a.y+(a.y<p.y?2:-2);
      if(Math.hypot(p.x-a.x,p.y-a.y)>26){if(!(await p.vaiA(ax,ay,corri)))return}p.guardaVerso(a.x,a.y);a.guardaVerso(p.x,p.y);
      const f=this.cfg.parla&&(this.cfg.parla[a.nome]||this.cfg.parla[a.id]);if(f)await this.sequenza(()=>f(this,a,p));else await this.dici(p,'Non ho niente da dire.');return}
    const o=t.o,c=o.cammina||{x:(o.rect[0]+o.rect[2]/2),y:Math.min(115,o.rect[1]+o.rect[3]+4),dir:'N'};
    if(!(await p.vaiA(c.x,c.y,corri,c.dir)))return;if(c.dir)p.dir=c.dir;
    if(t.tipo==='uscita'){const pien=!o.chiusa||!o.chiusa(this);
      if(!pien){sfx.portaChiusa();await this.dici(p,o.testoChiusa||'È chiusa.');return}
      sfx.portaApre();this.vaiScena(o.verso,o.arrivo);return}
    await this.sequenza(async()=>{if(o.usa)await o.usa(this,p);else if(o.guarda)await this.dici(p,typeof o.guarda==='function'?o.guarda(this):o.guarda)})}
  async sequenza(f){this.occupato=true;try{await f()}finally{this.occupato=false;Dialogo.azzera()}}
  /* ---- strumenti per scrivere scene e dialoghi ---- */
  dici(att,testo,opz){return Dialogo.parla(att,testo,opz)}
  narra(testo,sec){return Dialogo.narra(testo,sec)}
  scegli(opz,att){return Dialogo.scegli(opz,att)}
  attore(id){return this.attori[id]}
  vaiScena(id,arr){Scena.arrivo=arr?{id,...arr}:{id,x:40,y:105};this.occupato=true;fadeTo(1,2.6,()=>{setScene(id);fadeTo(0,2.2)})}
  hint(){setHint(this.cfg.suggerimento||'');}}
Scena.arrivo=null;
function line2(x0,y0,x1,y1){const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)));for(let i=0;i<=n;i++)R(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,1,1,'#ffff40')}

function registraScena(cfg){const s=new Scena(cfg);scenes[cfg.id]=s;return s}
A.motore={Scena,Pers,Mappa,Dialogo,Voce,VOCI,sfx,ambiente,registraScena,blip,suonaClip,caricaClip,VD};
window.__motore=A.motore;
});

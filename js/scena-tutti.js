/* ============================================================================================
   SCENA DI PROVA CON TUTTI I PERSONAGGI (si apre con ?tutti). Non fa parte della storia.
   - un tocco su un personaggio lo SELEZIONA (anello giallo) e lo fa parlare; un altro tocco sullo stesso dice la frase dopo
   - un tocco sul pavimento fa camminare il personaggio selezionato (doppio tocco: corre)
   - le gatte miagolano, la capra bela
   ============================================================================================ */
(window.__ext=window.__ext||[]).push(function(A){
"use strict";
const {Scena,VOCI,Dialogo}=A.motore,{R,ell,txt,AU,clamp}=A,fade=A.fade;

/* nome file, etichetta, gruppo: u = uomini, d = donne, b = bambini, a = animali */
const PERS=[
 ['protagonista-interno','PROTAGONISTA','u'],['protagonista-esterno','PROTAGONISTA ESTERNO','u'],['prete','IL PRETE','u'],['lillo','LILLO','u'],['greg','GREG','u'],
 ['graziano','GRAZIANO','u'],['igor','IGOR','u'],['doc-ritorno-al-futuro','DOC','u'],['marty-mcfly-ritorno-al-futuro','MARTY','u'],['blues-brothers-alto','BLUES ALTO','u'],
 ['blues-brothers-basso','BLUES BASSO','u'],['macgyver','MACGYVER','u'],['mark-knopfler','MARK','u'],['kurt-cobain','KURT','u'],['controllore-del-treno','IL CONTROLLORE','u'],
 ['donna','LA DONNA','d'],['anna','ANNA','d'],['anna-senza-giacca','ANNA (SENZA GIACCA)','d'],['poliziotta','LA POLIZIOTTA','d'],['lara-croft','LARA','d'],['carmen-san-diego','CARMEN','d'],
 ['leonardo','LEONARDO','b'],['gemella','LE GEMELLE','b'],
 ['khora','KHORA (GATTA)','a'],['mia','MIA (GATTA)','a'],['capra','LA CAPRA','a']];
// voci a suoni (blip) e della sintesi del telefono per i personaggi nuovi
Object.assign(VOCI,{
 gemella:Object.assign({sx:'f'},VOCI.gemella||{f0:360,forma:'sine',cps:27,mod:.08,tp:1.5,tr:.95,col:'#a8c8f0'}),
 graziano:{sx:'m',f0:120,forma:'sawtooth',cps:26,mod:.08,tp:.75,tr:.95,col:'#c0b090'},
 igor:{sx:'m',f0:90,forma:'sawtooth',cps:20,mod:.2,tp:.4,tr:.8,col:'#9aa890'},
 'marty-mcfly-ritorno-al-futuro':{sx:'m',f0:190,forma:'triangle',cps:33,mod:.14,tp:1.1,tr:1.1,col:'#f0a070'},
 'blues-brothers-alto':{sx:'m',f0:130,forma:'sawtooth',cps:24,mod:.05,tp:.7,tr:.9,col:'#c8c8d0'},
 'blues-brothers-basso':{sx:'m',f0:100,forma:'sawtooth',cps:23,mod:.05,tp:.55,tr:.88,col:'#b8b8c4'},
 macgyver:{sx:'m',f0:160,forma:'triangle',cps:30,mod:.1,tp:.95,tr:1.02,col:'#e0b070'},
 'mark-knopfler':{sx:'m',f0:140,forma:'triangle',cps:27,mod:.07,tp:.85,tr:.95,col:'#d09090'},
 'kurt-cobain':{sx:'m',f0:155,forma:'triangle',cps:26,mod:.16,tp:.95,tr:.9,col:'#c8c8a0'},
 'controllore-del-treno':{sx:'m',f0:135,forma:'square',cps:28,mod:.06,tp:.8,tr:1,col:'#80a0a8'},
 poliziotta:{sx:'f',f0:250,forma:'triangle',cps:30,mod:.08,tp:1.1,tr:1.05,col:'#7ab0c8'},
 'lara-croft':{sx:'f',f0:235,forma:'triangle',cps:30,mod:.09,tp:1.05,tr:1.03,col:'#d0b080'},
 'carmen-san-diego':{sx:'f',f0:280,forma:'triangle',cps:28,mod:.1,tp:1.2,tr:.98,col:'#e05050'},
 khora:{sx:'f',f0:700,forma:'sine',cps:10,mod:.1,tp:1.8,tr:1,col:'#d0d0d0'},mia:{sx:'f',f0:760,forma:'sine',cps:10,mod:.1,tp:1.9,tr:1,col:'#d0d0d0'},
 capra:{sx:'m',f0:330,forma:'sawtooth',cps:10,mod:.2,tp:1.2,tr:1,col:'#e0d8c0'}});

/* le frasi di prova (le stesse devono stare in _strumenti/battute.json per avere la voce di Piper) */
function frasi(et){
  if(et==='LE GEMELLE')return ['Ciao, siamo le gemelle. Questa è la nostra voce.','Camminiamo sempre insieme, tenendoci per mano.'];
  const n=et.replace(/\s*\(.*\)/,'').replace(/^(IL|LA|LO)\s+/,'');
  return ['Ciao, sono '+n.charAt(0)+n.slice(1).toLowerCase()+'. Questa è la mia voce.','Tocca il pavimento e mi metto in cammino.']}

/* ---- versi degli animali (sintetizzati, nessun file) ---- */
function verso(tipo,f0){
  if(!AU.ctx||AU.muted)return .8;const c=AU.ctx,t=c.currentTime;
  if(tipo==='miao'){
    const d=.55+Math.random()*.15,o=c.createOscillator(),gn=c.createGain(),f1=c.createBiquadFilter(),f2=c.createBiquadFilter();
    o.type='sawtooth';o.frequency.setValueAtTime(f0*.85,t);o.frequency.linearRampToValueAtTime(f0*1.35,t+d*.35);o.frequency.linearRampToValueAtTime(f0*.7,t+d);
    f1.type='bandpass';f1.Q.value=4;f1.frequency.setValueAtTime(700,t);f1.frequency.linearRampToValueAtTime(1900,t+d*.4);f1.frequency.linearRampToValueAtTime(900,t+d);
    f2.type='lowpass';f2.frequency.value=4000;
    gn.gain.setValueAtTime(.0001,t);gn.gain.linearRampToValueAtTime(.5,t+.06);gn.gain.setValueAtTime(.5,t+d*.55);gn.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(f1);f1.connect(f2);f2.connect(gn);gn.connect(AU.master);o.start(t);o.stop(t+d+.05);return d}
  const d=1.0,o=c.createOscillator(),lfo=c.createOscillator(),lg=c.createGain(),gn=c.createGain(),f1=c.createBiquadFilter();   // capra: "meeeh" tremolante
  o.type='sawtooth';o.frequency.setValueAtTime(f0,t);o.frequency.linearRampToValueAtTime(f0*1.12,t+.25);o.frequency.linearRampToValueAtTime(f0*.9,t+d);
  lfo.frequency.value=26;lg.gain.value=f0*.07;lfo.connect(lg);lg.connect(o.frequency);
  f1.type='bandpass';f1.Q.value=3;f1.frequency.setValueAtTime(900,t);f1.frequency.linearRampToValueAtTime(1500,t+d*.5);f1.frequency.linearRampToValueAtTime(1000,t+d);
  gn.gain.setValueAtTime(.0001,t);gn.gain.linearRampToValueAtTime(.45,t+.08);gn.gain.setValueAtTime(.45,t+d*.7);gn.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(f1);f1.connect(gn);gn.connect(AU.master);o.start(t);lfo.start(t);o.stop(t+d+.05);lfo.stop(t+d+.05);return d}

/* versi veri (registrazioni libere di Wikimedia Commons, in audio/versi); se non si caricano resta il verso sintetizzato */
const VERSI={khora:['miao_khora'],mia:['miao_mia'],capra:['bela_1','bela_2']};
function versoReale(nome){
  const l=VERSI[nome];if(!l||AU.muted)return Promise.resolve(null);
  const a=new Audio('audio/versi/'+l[Math.floor(Math.random()*l.length)]+'.mp3');a.volume=1;
  return new Promise(res=>{let ok=false;const fine=d=>{if(!ok){ok=true;res(d)}};
    a.addEventListener('loadedmetadata',()=>{a.play().then(()=>fine(a.duration||1)).catch(()=>fine(null))});
    a.addEventListener('error',()=>fine(null));setTimeout(()=>fine(null),2500)})}
let SCN=null;
function hintSel(a,sopra){const p=a&&SCN&&SCN.parlante(a);A.setHint(sopra?sopra:(p?'SELEZIONATO: '+p[1]+' · TOCCA IL PAVIMENTO PER MUOVERLO, UN PERSONAGGIO PER SCEGLIERLO':'TOCCA UN PERSONAGGIO'))}

class ScenaTutti extends Scena{
  constructor(cfg){super(cfg);this.sel=null;this.n={}}
  parlante(a){return PERS.find(p=>p[0]===a.nome)}
  gemelle(){return [this.attori.gemella,this.attori.gemella2]}
  gemellaSel(a){return a&&a.nome==='gemella'}
  dx(){return 7.7*this.attori.gemella.scala()}   // distanza a cui le due bambine si toccano con le braccia
  muovi(a,x,y,corri){
    if(this.gemellaSel(a)){const [l,r]=this.gemelle(),h=this.dx()/2,px=clamp(x,6+h,234-h);l.vaiA(px-h,y,corri);r.vaiA(px+h,y,corri);return}
    a.vaiA(x,y,corri)}
  seleziona(a){this.sel=a;hintSel(a)}
  async parla(a){
    const p=this.parlante(a);if(!p)return;
    a.dir='S';
    if(p[2]==='a'){   // gatta o capra: verso, bocca che si muove, nuvoletta senza voce a suoni
      const capra=a.nome==='capra';let d=await versoReale(a.nome);if(d==null)d=verso(capra?'bela':'miao',capra?300:(a.nome==='mia'?640:520));
      a.talking=true;const iv=setInterval(()=>{a.bocca=1+Math.floor(Math.random()*4)},110);
      await Dialogo.parla(a,capra?'Beeeh!':'Miaaao!',{animale:true,attesa:Math.max(.4,d-.3),nome:p[1]});
      clearInterval(iv);a.talking=false;a.bocca=1;return}
    const L=frasi(p[1]),k=(this.n[a.nome]=(this.n[a.nome]||0)+1)-1;
    if(this.gemellaSel(a)){   // le gemelle parlano all'unisono: stessa frase, stessa voce, due bocche, e un'eco della clip a 18 ms per l'effetto "due voci"
      const [l,r]=this.gemelle();l.dir=r.dir='S';const pr=Dialogo.parla(l,L[k%L.length],{nome:p[1]}),c=Dialogo.cor;
      if(c&&c.clip){const e=new Audio(c.clip.src);e.volume=.8;setTimeout(()=>e.play().catch(()=>{}),18);c.eco=e}
      await pr;if(c&&c.eco)c.eco.pause();return}
    await Dialogo.parla(a,L[k%L.length],{nome:p[1]})}
  async down(x,y){
    if(fade.a>.3||!this.pronto)return;
    if(Dialogo.cor){Dialogo.tocca();return}
    const t=this.trova(x,y);
    if(t&&t.tipo==='attore'){this.seleziona(t.o);await this.parla(t.o);return}
    const a=this.sel;if(!a)return;
    const doppio=A.now()-this.ultimoTocco<.32;this.ultimoTocco=A.now();
    const pt=this.mappa.libero(x,y)?[x,y]:this.mappa.vicina(x,y);
    this.hover={tipo:'terra',rect:[pt[0]-2,pt[1]-1,5,2]};setTimeout(()=>{if(this.hover&&this.hover.tipo==='terra')this.hover=null},350);
    this.muovi(a,pt[0],pt[1],doppio)}
  move(x,y){if(!this.pronto)return;const t=this.trova(x,y);this.hover=t&&t.tipo==='attore'?t:null;hintSel(this.sel,t&&t.nome)}}

/* disposizione per gruppi: UOMINI a sinistra (3 file), DONNE al centro, BAMBINI a destra, ANIMALI davanti */
const attori=[],gr=g=>PERS.filter(p=>p[2]===g);
gr('u').forEach((p,i)=>attori.push({nome:p[0],etichetta:p[1],x:14+(i%5)*26+(Math.floor(i/5)%2?13:0),y:[86,98,110][Math.floor(i/5)],dir:'S'}));
gr('d').forEach((p,i)=>attori.push({nome:p[0],etichetta:p[1],x:152+(i%3)*18+(Math.floor(i/3)?9:0),y:[89,101][Math.floor(i/3)],dir:'S'}));
attori.push({nome:'leonardo',etichetta:'LEONARDO',x:214,y:90,dir:'S'});
attori.push({nome:'gemella',id:'gemella',etichetta:'LE GEMELLE',x:210,y:106,dir:'S'});
attori.push({nome:'gemella',id:'gemella2',etichetta:'LE GEMELLE',x:218,y:106,dir:'S'});   // la copia identica, con le braccia che si toccano
gr('a').forEach((p,i)=>attori.push({nome:p[0],etichetta:p[1],x:168+i*30,y:117,dir:'S'}));

SCN=new ScenaTutti({
  id:'tutti',giocatore:null,
  area:[[4,78],[236,78],[238,119],[2,119]],ostacoli:[],
  prof:[78,118,.8,1.3],superficie:'legno',
  ambiente:{stanza:1,vento:0,pioggia:0},
  attori,
  suggerimento:'TOCCA UN PERSONAGGIO PER SCEGLIERLO E FARLO PARLARE · TOCCA IL PAVIMENTO PER MUOVERLO',
  disegnaSfondo(){   // palcoscenico neutro
    R(0,0,240,120,'#12141c');for(let y=0;y<70;y+=6)R(0,y,240,1,'#171a24');
    R(0,70,240,8,'#1c2030');R(0,78,240,42,'#232838');
    for(let y=82;y<120;y+=6)R(0,y,240,1,'#2a3044');
    txt('PROVA DI TUTTI I PERSONAGGI',50,6,'#6a7490');
    txt('UOMINI',62,42,'#7a88a8');txt('DONNE',158,42,'#7a88a8');txt('BAMBINI',198,56,'#7a88a8');txt('ANIMALI',160,107,'#7a88a8')},
  sotto(g,s){const a=s.sel;if(!a)return;const L=s.gemellaSel(a)?s.gemelle():[a];for(const q of L){const w=7*q.scala();g.globalAlpha=.55+.25*Math.sin(A.now()*6);ell(q.x,q.y,w,2.2,'#e0a040');g.globalAlpha=1;ell(q.x,q.y,w-1.5,1.2,'#6a4a18')}},
  aggiorna(s){const l=s.attori.gemella,r=s.attori.gemella2;if(l&&r){r.talking=l.talking;r.bocca=l.bocca;if(l.dir!==r.dir&&!l.path.length)r.dir=l.dir}},
  entra(s){const a=s.attori['protagonista-interno'];if(a)s.seleziona(a)}});
SCN.id='tutti';A.scenes.tutti=SCN;
});

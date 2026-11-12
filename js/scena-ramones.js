/* ============================================================================================
   I RAMONES (?ramones): quattro punk fermi, appoggiati al muro. Non camminano. Animazione semplice: ogni tanto girano la testa,
   alzano il pugno e muovono la bocca. Parlano tutti insieme, A TURNO MA SOVRAPPOSTI, in modo un po' confusionario:
   "Hey! Ho! Let's go!" (clip inglesi di Piper). Un tocco avvia/ferma il coro.
   ============================================================================================ */
(window.__ext=window.__ext||[]).push(function(A){
"use strict";
const {Scena,Pers,Voce}=A.motore,{R,txt,AU,clamp,hash}=A;

const NOMI=['ramone-1','ramone-2','ramone-3','ramone-4'];
const FRASI=['Hey!','Ho!',"Let's go!"];

/* un Ramone: nessun movimento, solo le pose del suo atlante (fermo: neutro / testa a sx / testa a dx / pugno; parlato: 4 bocche) */
class Ramone extends Pers{
  constructor(nome,x,y,sc,idx){super(nome,x,y,sc);this.idx=idx;this.tt=hash(idx*7.3)*3;this.sguardo=0;this.pugno=0;this.parlaFino=0;this.testo='';this.testoFino=0;this.clip=null}
  grida(testo){
    this.testo=testo;this.testoFino=A.now()+.95;this.parlaFino=A.now()+.55+hash(this.idx+testo.length)*.25;
    if(testo==="Let's go!")this.pugno=A.now()+.9;
    const f=Voce.clips&&Voce.clips[this.nome+'|'+testo];
    if(f&&!AU.muted){try{this.clip=A.motore.suonaClip(A.motore.VD+f)}catch(e){}}}   // (12 nov) Web Audio: si sente anche su iPhone
  update(dt){
    super.update(dt);const t=A.now();
    this.tt-=dt;if(this.tt<=0){this.tt=2.2+hash(t+this.idx)*3.5;this.sguardo=t+.9+hash(t*3+this.idx)*.8;this.verso=hash(t*5+this.idx)<.5?'idle_S_2':'idle_S_4'}
    this.talking=t<this.parlaFino;if(this.talking)this.bocca=1+Math.floor(t*14+this.idx*3)%4}
  pose(){
    const t=A.now();
    if(t<this.pugno)return {n:'idle_S_3',flip:false,dy:0};
    if(t<this.parlaFino)return {n:'talk_S_'+(1+Math.floor(t*12+this.idx*5)%4),flip:false,dy:0};
    if(t<this.sguardo)return {n:this.verso||'idle_S_2',flip:false,dy:0};
    return {n:'idle_S_1',flip:false,dy:0}}}

class ScenaRamones extends Scena{
  constructor(cfg){super(cfg);this.coro=false;this.prossimo=0;this.giro=0}
  enter(){super.enter();this.coro=false}
  /* gli attori sono creati da Scena.enter con la classe Pers: qui li sostituisco con i Ramone dopo il caricamento */
  update(dt){
    super.update(dt);if(!this.pronto)return;
    if(!this.ramones){this.ramones=NOMI.map((n,i)=>{const a=this.attori[n];const r=new Ramone(n,a.x,a.y,this,i);r.etichetta=a.etichetta;this.attori[n]=r;return r})}
    const t=A.now();
    if(this.coro&&t>=this.prossimo){
      // un "giro": ognuno attacca con un piccolo ritardo (0-0,35 s dopo il precedente), quindi le frasi si sovrappongono
      const ordine=this.ramones.map((r,i)=>({r,k:hash(this.giro*3.1+i*1.7)})).sort((a,b)=>a.k-b.k).map(o=>o.r);
      let ritardo=0;
      ordine.forEach((r,i)=>{ritardo+=.05+hash(this.giro*7+i)*.32;const frase=FRASI[Math.floor(hash(this.giro*2.3+i*5.1)*3)%3];setTimeout(()=>{if(this.coro)r.grida(frase)},ritardo*1000)});
      this.giro++;this.prossimo=t+2.4+hash(this.giro*4.4)*1.8}}
  draw(){
    super.draw();const t=A.now();
    for(const r of this.ramones||[]){if(t<r.testoFino){const y=r.y-r.altezza()-3,T=r.testo.toUpperCase(),w=T.length*5+4;R(r.x-w/2,y-9,w,9,'#0b0d14');txt(T,r.x-w/2+2,y-8,'#f2ead0')}}}
  async down(){if(A.fade.a>.3||!this.pronto)return;this.coro=!this.coro;if(this.coro)this.prossimo=0;A.setHint(this.coro?'I RAMONES · TOCCA PER ZITTIRLI':'I RAMONES · TOCCA PER FARLI GRIDARE')}
  move(){}}

/* il muro: calcestruzzo grigio a macchie, con una striscia di marciapiede */
function muro(g){
  R(0,0,240,120,'#4a4f58');
  for(let y=0;y<92;y+=2)for(let x=0;x<240;x+=2){const h=hash(x*.37+y*1.13);if(h>.8)R(x,y,2,2,'#555b64');else if(h<.12)R(x,y,2,2,'#40444c');if(hash(x*.91+y*.41)>.97)R(x,y,1,1,'#6a707a')}
  R(0,92,240,3,'#2c2f36');R(0,95,240,25,'#34363e');
  for(let x=0;x<240;x+=30)R(x,95,1,25,'#2a2c32');
  R(0,95,240,1,'#555a64')}

const ramones=new ScenaRamones({
  id:'ramones',giocatore:null,disegnaSfondo:muro,
  area:[[4,100],[236,100],[238,119],[2,119]],ostacoli:[],prof:[96,118,1.0,1.2],superficie:'pietra',ambiente:{stanza:0,vento:.1,pioggia:0},
  attori:[{nome:'ramone-1',etichetta:'RAMONE 1',x:72,y:108,dir:'S'},{nome:'ramone-2',etichetta:'RAMONE 2',x:102,y:108,dir:'S'},
          {nome:'ramone-3',etichetta:'RAMONE 3',x:132,y:108,dir:'S'},{nome:'ramone-4',etichetta:'RAMONE 4',x:162,y:108,dir:'S'}],
  suggerimento:'I RAMONES · TOCCA PER FARLI GRIDARE'});
A.scenes.ramones=ramones;
});

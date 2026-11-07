/* ============================================================================================
   SCENE DI PROVA DEL MOTORE (si aprono con ?demo). Servono a vedere come si scrive una scena:
   non fanno parte della storia e i testi sono solo esempi tecnici.
   Per scrivere una scena vera si copia questo schema: registraScena({ id, sfondo, area, ostacoli, ... }).
   ============================================================================================ */
(window.__ext=window.__ext||[]).push(function(A){
"use strict";
const {registraScena}=A.motore;

/* ---------- 1. la stanza con la stufa ---------- */
registraScena({
  id:'demo',
  sfondo:'img/emb/bg_stufa.png',            // immagine 240x120
  giocatore:'protagonista-interno',nomeGiocatore:'',
  partenza:{x:60,y:108,dir:'E'},
  area:[[6,95],[234,95],[238,118],[2,118]],  // poligono calpestabile (coordinate 240x120)
  ostacoli:[                                  // zone dove non si cammina: tavolo, stufa, divano
    [[58,89],[104,89],[104,100],[58,100]],
    [[124,87],[160,87],[160,98],[124,98]],
    [[196,92],[238,92],[238,106],[196,106]]],
  prof:[95,118,1.5,1.95],                     // scala del personaggio in alto e in basso (profondità)
  superficie:'legno',
  superfici:[{poly:[[190,95],[238,95],[238,118],[150,118],[150,108]],tipo:'tappeto'}],
  ambiente:{stanza:1,vento:.25,pioggia:.35,pioggiaDentro:true},
  attori:[
    {nome:'prete',etichetta:'IL PRETE',x:150,y:109,dir:'S'},
    {nome:'donna',etichetta:'LA DONNA',x:88,y:103,dir:'S'},
    {nome:'leonardo',etichetta:'LEONARDO',x:30,y:112,dir:'S'}],
  uscite:[{nome:'LA PORTA',rect:[12,28,24,66],cammina:{x:30,y:97,dir:'W'},verso:'demo2',arrivo:{x:206,y:108,dir:'W'}}],
  punti:[
    {nome:'LA STUFA',rect:[128,50,32,38],guarda:'Una stufa a legna. Prova di un punto toccabile: il personaggio cammina fino a qui e commenta.'},
    {nome:'IL TAVOLO',rect:[60,64,44,26],guarda:'Un tavolo. Si gira intorno senza attraversarlo: il percorso evita gli ostacoli.'},
    {nome:'LA FINESTRA',rect:[70,34,30,28],guarda:'Fuori piove, e il rumore dei passi cambia con il pavimento.'},
    {nome:'LA LIBRERIA',rect:[164,36,26,54],guarda:'Una libreria. Nessuna storia qui: è solo una prova.'},
    {nome:'IL DIVANO',rect:[196,64,42,28],cammina:{x:190,y:110,dir:'E'},usa:async(s,p)=>{
       await s.dici(p,'Vuoi vedere un\'azione?',{});
       const i=await s.scegli(['Raccogli qualcosa da terra','Indica la stufa','Niente, grazie'],p);
       if(i===0){await p.azione('raccogli');await s.dici(p,'Era solo una prova.')}
       else if(i===1){p.guardaVerso(144,70);await p.azione('indica')}}}],
  parla:{
    prete:async(s,a,p)=>{
      await s.dici(a,'Buonasera. Questa è una conversazione di prova.');
      await s.dici(p,'Sembra funzionare bene.');
      const i=await s.scegli(['Come funzionano le voci?','Cosa sa fare questo motore?','Arrivederci'],p);
      if(i===0)await s.dici(a,'Ogni personaggio ha la sua voce a suoni. Dal pulsante con la nota si passa alla voce italiana del telefono.');
      else if(i===1)await s.dici(a,'Cammina intorno agli ostacoli, scala con la profondità e fa il rumore giusto sul pavimento giusto.');
      else await s.dici(a,'Arrivederci.')},
    donna:async(s,a,p)=>{
      await s.dici(a,'Le bocche si muovono con le vocali, e la nuvola segue la testa di chi parla.',{vel:1});
      await s.dici(p,'E se il testo è lungo, la nuvola si allarga e resta dentro lo schermo, senza coprire troppo la scena.')},
    leonardo:async(s,a,p)=>{await s.dici(a,'Ehi! Anche io ho una voce tutta mia, più acuta e veloce.',{vel:1.1})}}});

/* ---------- il furgone dei panini (?furgone): solo il furgone, isolato su fondo neutro; la posizione la decide l'autore ---------- */
registraScena({
  id:'furgone',giocatore:'protagonista-esterno',partenza:{x:200,y:108,dir:'W'},
  disegnaSfondo(g){const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};R(0,0,240,120,'#161a24');R(0,70,240,50,'#222838');for(let y=76;y<120;y+=6)R(0,y,240,1,'#2a3044')},
  area:[[6,98],[234,98],[238,118],[2,118]],ostacoli:[[[56,103],[150,103],[150,113],[56,113]]],
  prof:[98,118,1.0,1.2],superficie:'ghiaia',ambiente:{stanza:0,vento:0,pioggia:0},
  oggetti:[{img:'img/emb/furgone_panini_hd.png',x:56,y:53,w:94,h:60,baseY:113}],   // 348x223 px disegnato a 94x60 unita' logiche
  punti:[{nome:'IL FURGONE DEI PANINI',rect:[56,55,94,56],cammina:{x:160,y:114,dir:'W'},guarda:'Il furgone dei panini.'}]});

/* ---------- 2. il bagno (seconda scena: piastrelle, uscita che torna indietro) ---------- */
registraScena({
  id:'demo2',
  sfondo:'img/emb/bg_bagno.png',
  giocatore:'protagonista-interno',
  partenza:{x:206,y:108,dir:'W'},
  area:[[10,94],[232,94],[238,118],[4,118]],
  ostacoli:[[[58,84],[90,84],[90,100],[58,100]],[[106,86],[140,86],[140,102],[106,102]]],
  prof:[94,118,1.45,1.9],superficie:'piastrelle',
  ambiente:{stanza:1,vento:0,pioggia:0},
  uscite:[{nome:'LA PORTA',rect:[218,56,22,56],cammina:{x:222,y:108,dir:'E'},verso:'demo',arrivo:{x:40,y:108,dir:'E'}}],
  punti:[
    {nome:'IL LAVANDINO',rect:[108,60,28,40],guarda:'Un lavandino. Qui i passi fanno un altro rumore: piastrelle.'},
    {nome:'IL WATER',rect:[58,52,30,48],guarda:'Un bagno vecchio stile.'}]});

});

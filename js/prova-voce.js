/* ============================================================================================
   PAGINA DI DIAGNOSI DELLE VOCI (?provavoce), 12 nov.
   Serve a capire sul telefono perche' una voce non si sente: tre pulsanti (voce con Web Audio come nel gioco,
   voce con il lettore <audio>, bip di prova) e lo stato dell'audio scritto sullo schermo.
   ============================================================================================ */
(window.__ext=window.__ext||[]).push(function(A){
"use strict";
if(!/[?&]provavoce/.test(location.search))return;
const M=A.motore,AU=A.AU,TESTO='protagonista-interno|Che sonno… Dove sono?… Ah, la baita.';
const d=document.createElement('div');
d.style.cssText='position:fixed;inset:0;z-index:999;background:#0b0d12;color:#e8dfc0;font:15px/1.35 -apple-system,Helvetica,sans-serif;padding:14px 16px;overflow:auto';
d.innerHTML='<b style="font-size:17px">PROVA DELLE VOCI</b><br>Tocca i pulsanti uno alla volta e dimmi cosa senti e cosa compare qui sotto.<br><br>'+
  '<button id="pv1">1 · VOCE DI NICK (come nel gioco)</button><br><br><button id="pv4">4 · VOCE DI NICK, FORMATO VECCHIO (16 kHz)</button><br><br><button id="pv2">2 · VOCE DI NICK (lettore audio)</button><br><br><button id="pv3">3 · BIP DI PROVA</button>'+
  '<pre id="pvlog" style="white-space:pre-wrap;margin-top:14px;font:13px/1.4 Menlo,monospace;color:#9fd6d0"></pre>';
document.body.appendChild(d);
for(const b of d.querySelectorAll('button'))b.style.cssText='font:inherit;font-weight:600;padding:12px 16px;background:#1c2230;color:#e8dfc0;border:2px solid #4a5a70;border-radius:4px;width:100%;max-width:420px;text-align:left';
const log=t=>{d.querySelector('#pvlog').textContent+=t+'\n'};
const stato=()=>{const V=M&&M.Voce,c=AU.ctx;
  log('versione: '+((document.getElementById('ver')||{}).textContent||'?')+' | audio: '+(c?c.state+' '+c.sampleRate+' Hz':'non ancora creato')+' | muto: '+!!AU.muted+' | modo parlato: '+(V?V.modo:'?')+
      ' | indice voci: '+(V&&V.clips?Object.keys(V.clips).length+' clip, battuta '+(V.clips[TESTO]?'trovata':'MANCANTE'):'non caricato'))};
const url=()=>{const V=M.Voce;return V.clips&&V.clips[TESTO]?M.VD+V.clips[TESTO]:null};
d.querySelector('#pv1').onclick=e=>{e.stopPropagation();A.audioInit&&A.audioInit();const c=AU.ctx;if(c&&c.state==='suspended')c.resume();
  stato();const u=url();if(!u){log('1: nessuna clip nell\'indice');return}
  M.caricaClip(u).then(b=>{if(!b){log('1: ERRORE nel decodificare '+u);return}log('1: clip decodificata, '+b.duration.toFixed(1)+' s; parte ora (stato audio: '+AU.ctx.state+')');
    const o=M.suonaClip(u);setTimeout(()=>log('1: dopo 4 s: finita='+o.ended+' stato audio='+AU.ctx.state),4000)})};
d.querySelector('#pv2').onclick=e=>{e.stopPropagation();stato();const u=url();if(!u){log('2: nessuna clip nell\'indice');return}
  const a=new Audio(u);a.play().then(()=>log('2: il lettore audio dice che sta suonando')).catch(er=>log('2: il lettore audio ha rifiutato: '+er.name))};
d.querySelector('#pv3').onclick=e=>{e.stopPropagation();A.audioInit&&A.audioInit();const c=AU.ctx;if(c&&c.state==='suspended')c.resume();
  stato();try{A.tone(440,.5,'sine',.25);log('3: bip inviato')}catch(er){log('3: errore '+er.message)}};
d.querySelector('#pv4').onclick=e=>{e.stopPropagation();A.audioInit&&A.audioInit();const c=AU.ctx;if(c&&c.state==='suspended')c.resume();const u='audio/prova-16k.mp3';
  M.caricaClip(u).then(b=>{if(!b){log('4: ERRORE nel decodificare il formato vecchio');return}log('4: formato vecchio decodificato, '+b.duration.toFixed(1)+' s; parte ora');M.suonaClip(u)})};
stato();
});

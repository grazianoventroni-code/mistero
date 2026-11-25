# Audio nuovi (25 nov) - crediti e metodo

Nessuna sorgente esterna: non e' stato scaricato nulla da YouTube o Freesound. Tutto e' sintetizzato in autonomia (numpy/scipy, lameenc) o con Kokoro (Apache 2.0, locale), quindi nessun problema di diritti. Tutti i file sono MP3 mono 44,1 kHz. Non ascoltati da me: controllati solo con misure (durata, picco < 0,97 dopo la decodifica, salto al punto di loop).


## Voce di Michael Jackson (`audio/versi/`, indice `mj-indice.json`)
`mj_uh_r1..3`, `mj_ah_r1..3`, `mj_hi_r1..3`, `mj_eh_r1..3` (0,29-0,47 s, 2-4 KB l'uno). Kokoro americano (am_adam r1, am_michael r2, am_liam r3, come `bb_voci_ehi.py`) sul testo "Uh!", "Ah!", "Hee!", "Eh!"; poi altezza alzata con contorno (+30-50%, sale anche il timbro), attacco secco, brillantezza e saturazione. Piper non usato: le voci Piper del progetto sono solo italiane.

Risate, sbuffi, schiocco: sintesi a formanti/rumore filtrato. "oh/eh/uuh": Kokoro im_nicola con altezza spostata. Nessuna frase.

## Effetti (`audio/effetti/`, suffisso `_r1`, indice `effetti-nuovi-indice.json`), tutti sintesi propria
`mazza_fendente_r1` (0,4 s), `mazza_colpo_metallo_r1` (0,9 s), `mazza_colpo_legno_r1` (0,35 s), `mazza_colpo_sordo_r1` (0,4 s), `motorino_passa_r1` (4,2 s, Doppler, 33 KB), `motorino_si_ferma_r1` (5,2 s, arriva, minimo, colpo di gas, spegne, 41 KB), `tram_campanello_r1` (1,6 s), `tram_frenata_r1` (2,6 s), `passi_marciapiede_r1` (4,6 s, 8 passi), `sportello_apre_r1` (1,3 s), `sportello_chiude_r1` (0,8 s), `cintura_slaccia_r1` (1,4 s, bottone + cricchetto del riavvolgitore), `freno_mano_r1` (0,9 s, cricchetto a 7 scatti), `viale_giorno_r1` (24,8 s, LOOP, 145 KB: traffico lontano, auto che passano, uccelli, clacson lontano).

## Musiche (`audio/musica/`, indice `musiche-nuove-indice.json`), originali, nessuna cover
- `funk_mj.mp3`: 33,7 s, 114 bpm, 16 battute in La minore, basso slap, charleston, battito di mani, stab di sintetizzatore. 329 KB. LOOP.
- `mistero_firenze.mp3`: 53,3 s, 72 bpm, 16 battute in Re dorico, pad, pizzicato (Karplus-Strong), campanelle rade. 416 KB. LOOP.
Loop: tutto e' scritto in un buffer circolare (code sommate alla testa, riverbero con convoluzione circolare), quindi la fine si lega alla testa senza clic; resta solo il minimo vuoto del padding MP3 del browser (come per le altre musiche).

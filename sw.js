// Service worker: il gioco funziona offline.
// - i file del gioco (immagini, audio, icone) sono salvati alla prima apertura (sempre scaricati freschi: cache reload) e serviti dalla memoria del telefono;
// - la pagina e questo file si chiedono prima alla rete (cosi' gli aggiornamenti arrivano subito) e, senza rete, si usa la copia salvata.
const VERSION = "7 nov 13:00";
const CACHE = "mistero-" + VERSION;
const FILES = [
  "./",
  "apple-touch-icon.png",
  "audio/temporale.wav",
  "audio/tuoni.mp3",
  "icon-192.png",
  "icon-512.png",
  "img/abete1.png",
  "img/abete2.png",
  "img/abete3.png",
  "img/abete4.png",
  "img/abete5.png",
  "img/auto-esterno.png",
  "img/auto-interno.png",
  "img/bagno.png",
  "img/casetta.png",
  "img/char/anna-senza-giacca.json",
  "img/char/anna-senza-giacca.png",
  "img/char/anna.json",
  "img/char/anna.png",
  "img/char/donna.json",
  "img/char/donna.png",
  "img/char/greg.json",
  "img/char/greg.png",
  "img/char/leonardo.json",
  "img/char/leonardo.png",
  "img/char/lillo.json",
  "img/char/lillo.png",
  "img/char/prete.json",
  "img/char/prete.png",
  "img/char/protagonista-esterno.json",
  "img/char/protagonista-esterno.png",
  "img/char/protagonista-interno.json",
  "img/char/protagonista-interno.png",
  "img/emb/bg_bagno.png",
  "img/emb/bg_out.png",
  "img/emb/bg_stufa.png",
  "img/emb/img_cab.png",
  "img/emb/img_car.png",
  "img/emb/img_carx.png",
  "img/emb/img_dream_0.png",
  "img/emb/img_dream_1.png",
  "img/emb/img_dream_2.png",
  "img/emb/img_dream_3.png",
  "img/emb/img_log.png",
  "img/emb/img_pint.png",
  "img/emb/img_prot.png",
  "img/emb/img_seat.png",
  "img/emb/img_trees_0.png",
  "img/emb/img_trees_1.png",
  "img/emb/img_trees_2.png",
  "img/emb/img_trees_3.png",
  "img/emb/img_trees_4.png",
  "img/emb/img_walk12.png",
  "img/emb/img_walk8.png",
  "img/emb/img_wheel.png",
  "img/emb/img_woman.png",
  "img/emb/spr_book_locked.png",
  "img/emb/spr_book_locked_small.png",
  "img/emb/spr_book_open.png",
  "img/emb/spr_book_open_big.png",
  "img/emb/spr_candle_lit.png",
  "img/emb/spr_candle_lit_big.png",
  "img/emb/spr_candle_unlit_big.png",
  "img/emb/spr_candle_unlit_mid.png",
  "img/emb/spr_comic.png",
  "img/emb/spr_comic_small.png",
  "img/emb/spr_key.png",
  "img/emb/spr_key_small.png",
  "img/emb/spr_matchbox.png",
  "img/emb/spr_matchbox_small.png",
  "img/emb/spr_matchburn.png",
  "img/emb/spr_palla_carta.png",
  "img/emb/spr_symbol.png",
  "img/esterno.png",
  "img/scene/chiesa-nera.png",
  "img/scene/donna-ritratto.png",
  "img/scene/ponte-diavolo.png",
  "img/scene/ristorante-settimo.png",
  "img/scene/torre-orologio-2.png",
  "img/scene/torre-orologio.png",
  "img/scene/treno-arrivo.png",
  "img/scene/treno-interno.png",
  "img/scene/treno-ponte.png",
  "img/scene/treno-stazione-partenza.png",
  "img/sprite/book_locked.png",
  "img/sprite/book_locked_small.png",
  "img/sprite/book_open.png",
  "img/sprite/book_open_big.png",
  "img/sprite/candle_lit.png",
  "img/sprite/candle_lit_big.png",
  "img/sprite/candle_unlit_big.png",
  "img/sprite/candle_unlit_mid.png",
  "img/sprite/comic.png",
  "img/sprite/comic_small.png",
  "img/sprite/donna.png",
  "img/sprite/key.png",
  "img/sprite/key_small.png",
  "img/sprite/log.png",
  "img/sprite/matchbox.png",
  "img/sprite/matchbox_small.png",
  "img/sprite/matchburn.png",
  "img/sprite/palla_carta.png",
  "img/sprite/protagonista-base.png",
  "img/sprite/protagonista-int-walk.png",
  "img/sprite/protagonista-int-walk12.png",
  "img/sprite/protagonista-int-walk12c.png",
  "img/sprite/protagonista-int-walk12d.png",
  "img/sprite/protagonista-int-walk8.png",
  "img/sprite/protagonista-int-walk8b.png",
  "img/sprite/protagonista-int-walk8c.png",
  "img/sprite/protagonista-int.png",
  "img/sprite/protagonista.png",
  "img/sprite/seduto.png",
  "img/sprite/symbol.png",
  "img/stanza-stufa.png",
  "img/volante.png",
  "index.html",
  "manifest.webmanifest"
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(FILES.map((f) => c.add(new Request(f, { cache: "reload" })).catch(() => {}))   // cache: reload = salta la copia del browser (GitHub Pages la tiene 10 minuti) e scarica sempre il file nuovo)));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  const u = new URL(r.url);
  const pagina = r.mode === "navigate" || /(\/|index\.html|sw\.js|manifest\.webmanifest)$/.test(u.pathname);
  if (pagina) {
    e.respondWith(fetch(r, { cache: "no-store" }).then((res) => { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(r, cp)); return res; })
      .catch(() => caches.match(r, { ignoreSearch: true }).then((m) => m || caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then((m) => m || fetch(r).then((res) => {
    if (res.ok) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(r, cp)); }
    return res;
  })));
});

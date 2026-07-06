// Service worker: hace que el juego funcione sin conexión (T3.4). Dos cachés:
// - CACHE_APP: el "esqueleto" de la app (HTML/CSS/JS/manifest/iconos), conocido de antemano.
// - CACHE_DATOS: todo lo demás (puzles JSON, imágenes) se cachea solo, la primera vez que se pide,
//   para no tener que mantener a mano una lista de cada fichero de puzle que se vaya añadiendo.
// Subir VERSION al cambiar el esqueleto fuerza a los dispositivos a descargar la versión nueva.
const VERSION = 'v34';
const CACHE_APP = `liga-eterna-app-${VERSION}`;
const CACHE_DATOS = `liga-eterna-datos-${VERSION}`;

const ARCHIVOS_APP = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/styles.css',
  'js/storage.js',
  'js/engine.js',
  'js/progression.js',
  'js/assessment.js',
  'js/audio.js',
  'js/ui.js',
  'js/datos-juego.js',
  'js/logica-juego.js',
  'js/pantallas/comun.js',
  'js/pantallas/portada.js',
  'js/pantallas/perfil.js',
  'js/pantallas/modo.js',
  'js/pantallas/calendario.js',
  'js/pantallas/reto.js',
  'js/pantallas/entrenamiento.js',
  'js/pantallas/contrarreloj.js',
  'js/pantallas/victoria.js',
  'js/pantallas/museo.js',
  'js/pantallas/estadio.js',
  'js/pantallas/ascenso.js',
  'js/pantallas/copa.js',
  'js/pantallas/familia.js',
  'js/main.js',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/icon-maskable-192.png',
  'assets/icons/icon-maskable-512.png',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/favicon.ico',
  'assets/icons/favicon-32.png',
  'assets/icons/favicon-16.png',
  'assets/fonts/nunito-regular.woff2',
  'assets/fonts/nunito-semibold.woff2',
  'assets/fonts/nunito-bold.woff2',
  'assets/fonts/nunito-extrabold.woff2',
  'assets/fonts/fredoka-semibold.woff2',
  'assets/fonts/fredoka-bold.woff2',
  'assets/img/decoracion/portada.webp',
  'assets/icons-svg/banderin.svg',
  'assets/icons-svg/rayo.svg',
  'assets/icons-svg/llama.svg',
  'assets/icons-svg/medalla-aprendiz.svg',
  'assets/icons-svg/medalla-titular.svg',
  'assets/icons-svg/medalla-crack.svg',
  'assets/icons-svg/candado.svg'
];

self.addEventListener('install', (evento) => {
  // skipWaiting(): la versión nueva se activa en cuanto termina de instalarse, sin esperar a que
  // se cierren TODAS las pestañas/instancias. Sin esto, en una app ya instalada (PWA) la versión
  // vieja podía seguir mandando durante días y el usuario nunca veía los arreglos (fue justo lo que
  // pasó: el bug del bucle ya estaba corregido en el servidor pero el dispositivo servía el código
  // viejo desde la caché). Junto con clients.claim() y el recargado de main.js, las actualizaciones
  // llegan solas en el siguiente arranque con conexión.
  self.skipWaiting();
  evento.waitUntil(
    caches.open(CACHE_APP).then((cache) => cache.addAll(ARCHIVOS_APP))
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys().then((claves) =>
      Promise.all(
        claves
          .filter((clave) => clave !== CACHE_APP && clave !== CACHE_DATOS)
          .map((clave) => caches.delete(clave))
      )
    )
  );
  self.clients.claim();
});

// Cache-first: si ya lo tenemos guardado, servimos eso (rápido y sirve sin red); si no, vamos a la
// red y, si responde bien, lo guardamos en CACHE_DATOS para la próxima vez que falte conexión.
self.addEventListener('fetch', (evento) => {
  if (evento.request.method !== 'GET') return;
  const url = new URL(evento.request.url);
  if (url.origin !== self.location.origin) return;

  evento.respondWith(
    caches.match(evento.request).then((enCache) => {
      if (enCache) return enCache;

      return fetch(evento.request)
        .then((respuesta) => {
          if (respuesta.ok) {
            const copia = respuesta.clone();
            caches.open(CACHE_DATOS).then((cache) => cache.put(evento.request, copia));
          }
          return respuesta;
        })
        .catch(() => caches.match('index.html'));
    })
  );
});

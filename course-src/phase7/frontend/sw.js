// Offline shell only: API mutations and task data are never cached here.
const CACHE='quadro-shell-v1';
const ASSETS=['/','/style.css','/dist/app.js','/dist/model.mjs','/dist/storage.mjs','/node_modules/web-vitals/dist/web-vitals.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('quadro-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==location.origin||!ASSETS.includes(url.pathname))return;
  event.respondWith(fetch(event.request).catch(()=>caches.match(event.request).then(response=>response||Response.error())));
});

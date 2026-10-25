const CACHE='danjeong-5-0-7-20261025-r1';
const ASSETS=[
  '/danjeong/',
  '/danjeong/styles.css',
  '/danjeong/app.js',
  '/danjeong/manifest.webmanifest',
  '/danjeong/assets/school-logo.png',
  '/danjeong/assets/icon-192.png',
  '/danjeong/assets/icon-512.png'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key.startsWith('danjeong-')&&key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.includes('/api/'))return;
  event.respondWith(
    fetch(request)
      .then(async response=>{
        if(response.ok){
          const cache=await caches.open(CACHE);
          await cache.put(request,response.clone());
        }
        return response;
      })
      .catch(async()=>{
        const cached=await caches.match(request);
        if(cached)return cached;
        if(request.mode==='navigate')return caches.match('/danjeong/');
        throw new Error('오프라인 캐시를 찾을 수 없습니다.');
      })
  );
});

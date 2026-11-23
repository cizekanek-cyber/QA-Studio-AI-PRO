/* QA Studio AI PRO offline shell — no account/API data caching */
const VERSION='qa-shell-20261123-v2';
const CORE=['./','./index.html','./index-1.html','./qa-animals.js','./qa-account.js','./qa-plans.js','./qa-social.js','./qa-cutouts.js','./qa-start.js','./icon.svg','./manifest.webmanifest'];
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(VERSION);
  await Promise.allSettled(CORE.map(async url=>{try{const r=await fetch(url,{cache:'reload'});if(r.ok)await cache.put(url,r);}catch{}}));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('qa-shell-')&&key!==VERSION)await caches.delete(key);await self.clients.claim()})());
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==location.origin||!url.pathname.startsWith('/QA-Studio-AI-PRO/'))return;
 if(url.pathname.includes('/assets/cutouts/')){event.respondWith((async()=>{
  const c=await caches.open(VERSION);
  const cached=await c.match(req);
  if(cached)return cached;
  const r=await fetch(req);
  if(r.ok)await c.put(req,r.clone());
  return r;
 })());return;}
 if(req.mode==='navigate'||url.pathname.endsWith('.html')){event.respondWith((async()=>{
  try{const res=await fetch(req);if(res.ok)(await caches.open(VERSION)).put(req,res.clone());return res;}catch{const cached=await caches.match(req);return cached||Response.error();}
 })());return;}
 if(/\.(?:js|css|svg|webmanifest)$/i.test(url.pathname)){event.respondWith((async()=>{
  const cache=await caches.open(VERSION),fallback=await cache.match(req);
  const update=fetch(req).then(r=>{if(r.ok)cache.put(req,r.clone());return r}).catch(()=>null);
  return fallback||(await update)||Response.error();
 })());}
});
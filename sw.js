/* QA Studio AI PRO offline shell — no account/API data caching */
const VERSION='qa-shell-20261127-brand05';
const SCOPE_PATH=new URL(self.registration.scope).pathname;
const CORE=['./','./index.html','./index-1.html','./qa-design.css','./assets/photos/manifest.json','./assets/cutouts/manifest.json','./qa-animals.js','./qa-account.js','./qa-auth-core.js','./qa-login.js','./login.html','./licenses.html','./qa-plans.js','./qa-external-ai.js','./qa-shared-library.js','./qa-social.js','./qa-cutouts.js','./qa-prompts.js','./qa-start.js','./qa-gallery.js','./qa-funny.js','./qa-one-editor.js','./qa-motion.js','./qa-prep-studio.js','./qa-help.js','./qa-landing.js','./qa-branding-art.js','./assets/branding/hero.webp','./assets/branding/postavy.webp','./assets/branding/zvirata.webp','./assets/branding/lide.webp','./assets/branding/fantasytvorove.webp','./assets/branding/fantasypozadi.webp','./assets/branding/ptaci.webp','./assets/branding/farma.webp','./assets/branding/divokazvirata.webp','./assets/branding/vodnizvirata.webp','./qa-i18n.js','./assets/reference-fantasy.webp','./assets/qa-hero-campaign.webp','./assets/gallery-hero.webp','./qa-pricing-fix.js','./icon.svg','./assets/qa-icon-192.png','./assets/qa-icon-512.png','./assets/qa-icon-180.png','./qa-install.js','./manifest.webmanifest'];
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
 if(url.origin!==location.origin||!url.pathname.startsWith(SCOPE_PATH))return;
 if((url.pathname.endsWith('/assets/reference-fantasy.webp'))||url.pathname.includes('/assets/cutouts/')||url.pathname.includes('/assets/branding/')){event.respondWith((async()=>{
  const c=await caches.open(VERSION);
  const cached=await c.match(req);
  if(cached)return cached;
  const r=await fetch(req);
  if(r.ok)await c.put(req,r.clone());
  return r;
 })());return;}
 if(req.mode==='navigate'||url.pathname.endsWith('.html')){event.respondWith((async()=>{
  try{const res=await fetch(req);if(res.ok)(await caches.open(VERSION)).put(req,res.clone());return res;}catch{const cached=await caches.match(req)||await caches.match(req,{ignoreSearch:true});return cached||Response.error();}
 })());return;}
 if(/\.(?:js|css|svg|webmanifest)$/i.test(url.pathname)){event.respondWith((async()=>{
  const cache=await caches.open(VERSION);try{const res=await fetch(req,{cache:'no-cache'});if(res.ok){await cache.put(req,res.clone());return res}return (await cache.match(req)||await cache.match(req,{ignoreSearch:true}))||res}catch{return (await cache.match(req)||await cache.match(req,{ignoreSearch:true}))||Response.error()}
 })());}
});
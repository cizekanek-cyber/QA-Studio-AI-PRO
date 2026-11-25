'use strict';
// QA Studio AI PRO static Cloudflare Pages distribution.
// Run from repo root: node scripts/build-cloudflare.cjs
// No npm modules, tokens, database exports or customer data required.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const out=path.join(root,'dist');
function copy(relative){
  const source=path.join(root,relative);
  const stat=fs.lstatSync(source);
  if(stat.isSymbolicLink()||!stat.isFile())throw Error('Invalid deployment file: '+relative);
  if(stat.size>24*1024*1024)throw Error('File exceeds Pages single-file limit: '+relative);
  const destination=path.join(out,relative);
  fs.mkdirSync(path.dirname(destination),{recursive:true});
  fs.copyFileSync(source,destination);
}
const required=['index.html','index-1.html','login.html','licenses.html','icon.svg','manifest.webmanifest','sw.js','qa-design.css'];
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const filename of required)copy(filename);
const modules=fs.readdirSync(root).filter(n=>/^qa-[A-Za-z0-9-]+\.js$/.test(n));
if(modules.length<12)throw Error('Unexpected missing QA modules ('+modules.length+')');
for(const filename of modules)copy(filename);
for(const dir of ['assets','beta']){
 const folder=path.join(root,dir);
 if(!fs.existsSync(folder))continue;
 function walk(relative){
  for(const e of fs.readdirSync(path.join(root,relative),{withFileTypes:true})){
    if(e.name.startsWith('.'))continue;
    const next=path.posix.join(relative,e.name);
    if(e.isSymbolicLink())throw Error('No symlinks: '+next);
    if(e.isDirectory())walk(next);
    else if(e.isFile()&&(/\.(?:html|webp|png|jpe?g|gif|svg|ico|mp4|webm|woff2?)$/i.test(e.name)||['assets/cutouts/manifest.json','assets/photos/manifest.json'].includes(next)))copy(next);
  }
 }
 walk(dir);
}
for(const name of ['_headers','_redirects']){
 const srcPath=path.join(root,'cloudflare',name);
 if(!fs.statSync(srcPath).isFile())throw Error('Missing Pages configuration: '+name);
 fs.copyFileSync(srcPath,path.join(out,name));
}
const forbidden=['.github','tests','scripts','.env','.git','LAUNCH_READINESS.md'];
for(const part of forbidden)if(fs.existsSync(path.join(out,part)))throw Error('Private/development path leaked into dist: '+part);
const files=[];
function inventory(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.isDirectory())inventory(path.join(dir,e.name));else files.push(path.relative(out,path.join(dir,e.name)).replaceAll('\\','/'))}}
inventory(out);
if(!files.includes('_headers')||!files.includes('_redirects'))throw Error('Missing Pages rules');
console.log('Cloudflare Pages dist ready: '+files.length+' static files; '+modules.length+' QA modules; no secrets or development files');

import {userFrom,entitlement,assetPlan,json,preflight,respondError} from '../_shared/qa.ts';
Deno.serve(async(req)=>{if(req.method==='OPTIONS')return preflight(req);if(req.method!=='POST')return json(req,{error:'Method not allowed'},405);
 try{const {user,db}=await userFrom(req);const body=await req.json();const access=await entitlement(db,user.id);
 if(body.action==='status')return json(req,access);
 if(body.action!=='asset'||typeof body.path!=='string')throw Error('Neplatná šablona');
 const tier=assetPlan(body.path);if(!access.is_admin&&!access.plus&&!(tier==='christmas'&&access.christmas))return json(req,{error:'Nemáte aktivní licenci pro tuto šablonu'},403);
 const {data,error}=await db.storage.from('qa-premium').createSignedUrl(body.path,60);
 if(error||!data?.signedUrl)return json(req,{error:'Soubor zatím není dostupný'},404);
 return json(req,{url:data.signedUrl,expires_in:60});
 }catch(e){return respondError(req,e)}
});
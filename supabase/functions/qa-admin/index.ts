import {userFrom,isOwner,json,preflight,respondError} from '../_shared/qa.ts';
Deno.serve(async(req)=>{if(req.method==='OPTIONS')return preflight(req);if(req.method!=='POST')return json(req,{error:'Method not allowed'},405);
 try{const {user,db}=await userFrom(req);if(!isOwner(user.id))return json(req,{error:'Přístup pouze pro majitele'},403);
 const [payments,subs]=await Promise.all([db.from('qa_transactions').select('amount_czk').limit(10000),db.from('qa_subscriptions').select('status,period_end').limit(10000)]);
 if(payments.error||subs.error)throw Error('Db error');
 const active=(subs.data||[]).filter((x:any)=>['active','trialing'].includes(x.status)&&x.period_end&&new Date(x.period_end)>new Date()).length;
 return json(req,{gross_czk:(payments.data||[]).reduce((sum:number,x:any)=>sum+Number(x.amount_czk),0),paid_transactions:(payments.data||[]).length,active_subscriptions:active,mode:Deno.env.get('STRIPE_SECRET_KEY')?.startsWith('sk_test_')?'test':'live',note:'Hrubé platby bez odečtení poplatků a vratek; max. 10000 záznamů'});
 }catch(e){return respondError(req,e)}
});
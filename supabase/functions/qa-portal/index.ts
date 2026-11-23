import {userFrom,json,preflight,respondError,stripe,SITE_URL} from '../_shared/qa.ts';
Deno.serve(async(req)=>{if(req.method==='OPTIONS')return preflight(req);if(req.method!=='POST')return json(req,{error:'Method not allowed'},405);
 try{const {user,db}=await userFrom(req);const {data,error}=await db.from('qa_subscriptions').select('stripe_customer_id').eq('user_id',user.id).not('stripe_customer_id','is',null).limit(1);
 if(error)throw Error('Db error');const customer=data?.[0]?.stripe_customer_id;if(!customer)throw Error('Předplatné není nalezeno');
 const portal=await stripe('billing_portal/sessions',new URLSearchParams({customer,return_url:SITE_URL}));
 if(typeof portal.url!=='string'||!portal.url.startsWith('https://billing.stripe.com/'))throw Error('Portal error');
 return json(req,{url:portal.url});
 }catch(e){return respondError(req,e)}
});
import {userFrom,json,preflight,respondError,stripe,SITE_URL,entitlement} from '../_shared/qa.ts';
const plans:Record<string,string>={christmas:'STRIPE_PRICE_CHRISTMAS',plus_month:'STRIPE_PRICE_PLUS_MONTH',plus_year:'STRIPE_PRICE_PLUS_YEAR'};
Deno.serve(async(req)=>{if(req.method==='OPTIONS')return preflight(req);if(req.method!=='POST')return json(req,{error:'Method not allowed'},405);
 try{const {user,db}=await userFrom(req);const body=await req.json();const plan=body?.plan;if(typeof plan!=='string'||!plans[plan])throw Error('Neplatný plán');if(!user.email)throw Error('Chybí e-mail');
 if(plan==='christmas'&&(await entitlement(db,user.id)).christmas)throw Error('Licence již byla zakoupena');
 const price=Deno.env.get(plans[plan]);if(!price)throw Error('Prodej zatím není aktivní');
 const mode=plan==='christmas'?'payment':'subscription';const success=new URL(SITE_URL);success.searchParams.set('payment','success');success.searchParams.set('session_id','{CHECKOUT_SESSION_ID}');const cancel=new URL(SITE_URL);cancel.searchParams.set('payment','cancel');
 const form=new URLSearchParams({mode,'line_items[0][price]':price,'line_items[0][quantity]':'1',client_reference_id:user.id,customer_email:user.email,'metadata[user_id]':user.id,'metadata[plan]':plan,success_url:success.toString(),cancel_url:cancel.toString(),allow_promotion_codes:'true'});
 if(mode==='subscription'){form.set('subscription_data[metadata][user_id]',user.id);form.set('subscription_data[metadata][plan]',plan);}
 const s=await stripe('checkout/sessions',form);if(typeof s.url!=='string'||!s.url.startsWith('https://checkout.stripe.com/'))throw Error('Payment session unavailable');
 return json(req,{url:s.url});
 }catch(e){return respondError(req,e)}
});
/* QA Studio AI PRO · first-party GoTrue browser adapter · v20261123.1.
   Uses only the project's PUBLIC publishable key, never a secret/service key.
   Session authorization is ALWAYS checked by Supabase / protected Edge Functions.
   Mirrors supabase-js's default storage format so existing app modules interoperate. */
(()=>{'use strict';
  if(window.QAAuthCore)return;
  const PROJECT='https://naxotlqvimewbfowxwmw.supabase.co';
  const PUBLIC_KEY='sb_publishable_F4L1g58JH7TtFbt9xQkg__C8g71oL';
  const STORAGE='sb-naxotlqvimewbfowxwmw-auth-token';
  const API=PROJECT+'/auth/v1';
  const err=(code,message,status=0)=>Object.assign(new Error(message||'Authentication error'),{code,status});
  const fail=(e)=>({data:{user:null,session:null,url:null},error:e});
  let memorySession=null;
  function read(){try{const value=localStorage.getItem(STORAGE);return value?JSON.parse(value):memorySession}catch{return memorySession}}
  function write(session){
    if(!session){memorySession=null;try{localStorage.removeItem(STORAGE)}catch{};return true}
    memorySession=session;
    try{localStorage.setItem(STORAGE,JSON.stringify(session));return true}catch{return false}
  }
  function wrapSession(payload){
    if(!payload||!payload.access_token||!payload.refresh_token)return null;
    const expires_in=Math.max(0,Number(payload.expires_in)||3600);
    return {...payload,token_type:'bearer',expires_in,expires_at:Number(payload.expires_at)||Math.floor(Date.now()/1000)+expires_in};
  }
  async function request(path,{method='GET',body,token,timeout=18000}={}){
    const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),timeout);
    try{
      const response=await fetch(API+path,{
        method,signal:ctl.signal,cache:'no-store',
        headers:{apikey:PUBLIC_KEY,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},
        ...(body===undefined?{}:{body:JSON.stringify(body)})
      });
      let data={};try{data=await response.json()}catch{}
      if(!response.ok){const error=err(data.code||data.error_code||data.error||'http_'+response.status,
        data.msg||data.error_description||data.message||data.error||('Authentication server returned '+response.status),response.status);
        const retry=response.headers.get('retry-after');if(retry)error.retryAfter=retry;
        throw error;}
      return data;
    }catch(e){
      if(e.name==='AbortError')throw err('timeout','Connection timed out. Check your internet connection.');
      if(e instanceof TypeError)throw err('network_error','Could not reach Supabase. Check network access or try an external browser.');
      throw e;
    }finally{clearTimeout(timer)}
  }
  const listeners=new Set();
  function notify(event,session){for(const cb of listeners){try{cb(event,session)}catch(e){console.error('Auth event error',e)}}}
  let refreshInFlight=null;
  async function freshSession(){
    let s=read();
    if(!s?.access_token)return null;
    if(!s.refresh_token){write(null);return null}
    if(!s.expires_at||s.expires_at*1000>Date.now()+45000)return s;
    if(!refreshInFlight){refreshInFlight=(async()=>{
      try{
        const result=await request('/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:s.refresh_token}});
        const newS=wrapSession(result);if(!newS)throw err('refresh_failed','Unable to renew session');
        write(newS);notify('TOKEN_REFRESHED',newS);return newS;
      }catch(e){
        if(['invalid_grant','refresh_token_not_found','session_not_found'].includes(e.code)||e.status===401){write(null);notify('SIGNED_OUT',null)}
        throw e;
      }finally{refreshInFlight=null}
    })()}
    return refreshInFlight;
  }
  function authReturnUrl(value){
    const str=String(value||new URL('./login.html',location.href).href);
    const url=new URL(str,location.href);
    if(url.origin!==location.origin)throw err('unsafe_redirect','External redirect is not allowed');
    return url.href;
  }
  async function save(payload,event='SIGNED_IN'){
    const s=wrapSession(payload);if(!s)throw err('missing_session','Server did not return a usable login session');
    write(s);notify(event,s);
    return {data:{user:s.user||null,session:s},error:null};
  }
  const auth={
    async signInWithPassword({email,password}){
      try{return await save(await request('/token?grant_type=password',{method:'POST',body:{email,password}}))}
      catch(e){return fail(e)}
    },
    async signUp({email,password,options={}}){
      try{
        const redirect=encodeURIComponent(authReturnUrl(options.emailRedirectTo));
        const j=await request('/signup?redirect_to='+redirect,{method:'POST',body:{email,password}});
        if(j.access_token)return await save(j);
        return {data:{user:j.user||j,session:null},error:null};
      }catch(e){return fail(e)}
    },
    async signInWithOtp({email,options={}}){
      try{const redirect=encodeURIComponent(authReturnUrl(options.emailRedirectTo));
        await request('/otp?redirect_to='+redirect,{method:'POST',body:{email,create_user:options.shouldCreateUser!==false}});
        return {data:{user:null,session:null},error:null};
      }catch(e){return fail(e)}
    },
    async resetPasswordForEmail(email,{redirectTo}={}){
      try{const redirect=encodeURIComponent(authReturnUrl(redirectTo));
        await request('/recover?redirect_to='+redirect,{method:'POST',body:{email}});
        return {data:{},error:null};
      }catch(e){return fail(e)}
    },
    async verifyOtp(args){
      try{
        const data=await request('/verify',{method:'POST',body:args});
        if(!data.access_token)return fail(err('missing_session','Verification did not return a session'));
        return await save(data,args.type==='recovery'?'PASSWORD_RECOVERY':'SIGNED_IN');
      }catch(e){return fail(e)}
    },
    async getSession(){try{return {data:{session:await freshSession()},error:null}}catch(e){return {data:{session:null},error:e}}},
    async getUser(){
      try{
        const s=await freshSession();if(!s)return {data:{user:null},error:err('no_session','Not signed in')};
        const user=await request('/user',{token:s.access_token});
        const updated={...s,user};write(updated);
        return {data:{user},error:null};
      }catch(e){if(e.status===401){write(null);notify('SIGNED_OUT',null)}return {data:{user:null},error:e}}
    },
    async updateUser(attributes){
      try{const s=await freshSession();if(!s)throw err('no_session','You need a verified session');
        const user=await request('/user',{method:'PUT',body:attributes,token:s.access_token});
        write({...s,user});notify('USER_UPDATED',read());return {data:{user},error:null};
      }catch(e){return {data:{user:null},error:e}}
    },
    async signOut(){
      const s=read();write(null);notify('SIGNED_OUT',null);
      if(s?.access_token){try{await request('/logout',{method:'POST',token:s.access_token,timeout:7000})}catch{}}
      return {error:null};
    },
    async signInWithOAuth({provider,options={}}){
      try{
        if(!['google','facebook','apple'].includes(provider))throw err('unsupported_provider','Provider not supported');
        const redirect=authReturnUrl(options.redirectTo);
        const url=new URL(API+'/authorize');url.searchParams.set('provider',provider);url.searchParams.set('redirect_to',redirect);
        if(!options.skipBrowserRedirect){location.assign(url.href)}
        return {data:{provider,url:url.href},error:null};
      }catch(e){return fail(e)}
    },
    onAuthStateChange(callback){listeners.add(callback);return {data:{subscription:{unsubscribe(){listeners.delete(callback)}}}}},
    async handleRedirect(){
      const hash=new URLSearchParams(location.hash.slice(1)),query=new URLSearchParams(location.search);
      const errorCode=hash.get('error_code')||query.get('error_code');
      if(errorCode){
        const e=err(errorCode,hash.get('error_description')||query.get('error_description')||'The verification link is invalid or expired');
        history.replaceState(null,'',location.pathname+location.search.replace(/(?:^\?|&)error(?:_code|_description)?=[^&]*/g,''));
        return {event:'AUTH_ERROR',error:e};
      }
      if(!hash.has('access_token')||!hash.has('refresh_token'))return {event:'NO_CALLBACK',error:null};
      const payload={access_token:hash.get('access_token'),refresh_token:hash.get('refresh_token'),
        expires_in:Number(hash.get('expires_in'))||3600,token_type:hash.get('token_type')||'bearer'};
      const typ=hash.get('type');
      // Clear auth tokens from URL immediately, before any async call or future navigation.
      history.replaceState(null,'',location.pathname+location.search);
      try{
        const u=await request('/user',{token:payload.access_token});payload.user=u;
        await save(payload,typ==='recovery'?'PASSWORD_RECOVERY':'SIGNED_IN');
        return {event:typ==='recovery'?'PASSWORD_RECOVERY':'SIGNED_IN',error:null};
      }catch(e){return {event:'AUTH_ERROR',error:e}}
    },
  };
  window.QAAuthCore={project:PROJECT,publishableKey:PUBLIC_KEY,storageKey:STORAGE,createClient:()=>({auth}),readSession:read,request};
})();
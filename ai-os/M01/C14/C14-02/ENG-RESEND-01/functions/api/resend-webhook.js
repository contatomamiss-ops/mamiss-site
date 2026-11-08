import {reply,hex,equal} from '../_lib/resend-core.js';
export async function onRequest({request,env}){
 if(request.method!=='POST')return reply({ok:false},405);
 if(!env?.RESEND_WEBHOOK_SECRET||!env?.LEADS_DB)return reply({ok:false},503);
 const id=request.headers.get('svix-id'),stamp=request.headers.get('svix-timestamp'),signature=request.headers.get('svix-signature');
 if(!id||!stamp||!signature||Math.abs(Date.now()/1000-Number(stamp))>300)return reply({ok:false},401);
 const raw=await request.text();if(raw.length>65536)return reply({ok:false},413);
 const secret=env.RESEND_WEBHOOK_SECRET.replace(/^whsec_/,'');let bytes;try{bytes=Uint8Array.from(atob(secret),c=>c.charCodeAt(0));}catch{return reply({ok:false},503);}
 const key=await crypto.subtle.importKey('raw',bytes,{name:'HMAC',hash:'SHA-256'},false,['sign']);const mac=new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${id}.${stamp}.${raw}`)));const b64=btoa(String.fromCharCode(...mac));
 if(!signature.split(' ').some(x=>x.startsWith('v1,')&&equal(x.slice(3),b64)))return reply({ok:false},401);
 let event;try{event=JSON.parse(raw);}catch{return reply({ok:false},400);}
 try{await env.LEADS_DB.prepare('INSERT INTO resend_events(event_id,event_type,received_at) VALUES(?,?,?)').bind(id,String(event.type||''),new Date().toISOString()).run();}catch{return reply({ok:true,mensagem:'duplicado'});}
 if(['email.bounced','email.complained'].includes(event.type)&&event.data?.email_id){await env.LEADS_DB.prepare("UPDATE leads SET status='suppressed' WHERE provider_id=? AND status!='unsubscribed'").bind(event.data.email_id).run();}
 return reply({ok:true});
}

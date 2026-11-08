const encoder = new TextEncoder();
export const reply = (body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
export const hex = bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
export async function digest(value){return hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));}
export async function sign(secret,value){const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,encoder.encode(value)));}
export function equal(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let n=0;for(let i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0;}
export async function token(secret,id,expires){return `${id}.${expires}.${await sign(secret,`${id}.${expires}`)}`;}
export async function verifyToken(secret,t){const p=String(t||'').split('.');if(p.length!==3||!/^[a-f0-9]{32}$/.test(p[0])||!/^[0-9]{10,13}$/.test(p[1])||Number(p[1])<Date.now())return null;return equal(p[2],await sign(secret,`${p[0]}.${p[1]}`))?p[0]:null;}
export const config=env=>Boolean(env?.RESEND_API_KEY&&env?.RESEND_FROM&&env?.RESEND_TOKEN_SECRET&&env?.LEADS_DB);
export async function send(env,to,subject,html,id){const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);try{const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{authorization:`Bearer ${env.RESEND_API_KEY}`,'content-type':'application/json','Idempotency-Key':id},body:JSON.stringify({from:env.RESEND_FROM,to:[to],subject,html}),signal:controller.signal});if(!r.ok)return {ok:false,uncertain:r.status===429||r.status>=500,status:r.status};const j=await r.json();return {ok:true,id:String(j.id||'')};}catch(e){return {ok:false,uncertain:true,status:0};}finally{clearTimeout(timeout);}}
export async function getRow(db,id){return db.prepare('SELECT * FROM leads WHERE id = ?').bind(id).first();}

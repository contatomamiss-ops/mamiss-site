import {reply,verifyToken,getRow} from '../_lib/resend-core.js';
const headers={'content-type':'text/html; charset=utf-8','cache-control':'no-store','referrer-policy':'no-referrer','content-security-policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"};
export async function onRequest({request,env}){
 if(!['GET','POST'].includes(request.method))return reply({ok:false,erro:'metodo_nao_permitido'},405);
 if(!env?.LEADS_DB||!env?.RESEND_TOKEN_SECRET)return reply({ok:false,erro:'configuracao_ausente'},503);
 let t;
 if(request.method==='POST'){const ct=request.headers.get('content-type')||'';if(!ct.includes('application/x-www-form-urlencoded'))return reply({ok:false,erro:'formato_invalido'},415);t=(await request.formData()).get('token');}
 else t=new URL(request.url).searchParams.get('token');
 const id=await verifyToken(env.RESEND_TOKEN_SECRET,t);
 if(!id)return reply({ok:false,erro:'token_invalido'},400);
 const row=await getRow(env.LEADS_DB,id);
 if(!row||row.status==='unsubscribed'||row.status==='suppressed'||row.status==='confirmed')return reply({ok:false,erro:'token_consumido'},409);
 if(request.method==='GET')return new Response(`<html><meta name="referrer" content="no-referrer"><title>Confirmar cadastro</title><form method="POST" action="/api/lead-confirm"><input type="hidden" name="token" value="${t}"><button type="submit">Confirmar meu cadastro</button></form></html>`,{status:200,headers});
 const result=await env.LEADS_DB.prepare("UPDATE leads SET status='confirmed',confirmed_at=? WHERE id=? AND status IN ('pending','confirmation_sent','outcome_unknown') AND confirmed_at IS NULL").bind(new Date().toISOString(),id).run();
 return result.meta?.changes===1?reply({ok:true,mensagem:'confirmado'}):reply({ok:false,erro:'token_consumido'},409);
}

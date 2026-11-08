import {reply,verifyToken,getRow} from '../_lib/resend-core.js';
export async function onRequest({request,env}){
 if(!['GET','POST'].includes(request.method))return reply({ok:false,erro:'metodo_nao_permitido'},405);
 if(!env?.LEADS_DB||!env?.RESEND_TOKEN_SECRET)return reply({ok:false,erro:'configuracao_ausente'},503);
 const t=request.method==='GET'?new URL(request.url).searchParams.get('token'):(await request.formData()).get('token');
 const id=await verifyToken(env.RESEND_TOKEN_SECRET,t);
 if(!id)return reply({ok:false,erro:'token_invalido'},400);
 const row=await getRow(env.LEADS_DB,id);if(!row)return reply({ok:false,erro:'token_invalido'},400);
 if(request.method==='GET')return new Response(`<html><meta name="referrer" content="no-referrer"><form method="POST"><input type="hidden" name="token" value="${t}"><button>Descadastrar</button></form></html>`,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','referrer-policy':'no-referrer','content-security-policy':"default-src 'none'; form-action 'self'; frame-ancestors 'none'"}});
 await env.LEADS_DB.prepare("UPDATE leads SET status='unsubscribed',unsubscribed_at=COALESCE(unsubscribed_at,?) WHERE id=? AND status!='unsubscribed'").bind(new Date().toISOString(),id).run();
 return reply({ok:true,mensagem:'descadastrado'});
}

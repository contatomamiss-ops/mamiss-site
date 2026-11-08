import {reply,verifyToken,getRow} from '../_lib/resend-core.js';
export async function onRequest({request,env}){
 if(!['GET','POST'].includes(request.method))return reply({ok:false,erro:'metodo_nao_permitido'},405);
 if(!env?.LEADS_DB||!env?.RESEND_TOKEN_SECRET)return reply({ok:false,erro:'configuracao_ausente'},503);
 const id=await verifyToken(env.RESEND_TOKEN_SECRET,new URL(request.url).searchParams.get('token'));
 if(!id)return reply({ok:false,erro:'token_invalido'},400);
 const row=await getRow(env.LEADS_DB,id);if(!row||row.status==='unsubscribed')return reply({ok:false,erro:'token_invalido'},400);
 if(row.status==='confirmed')return reply({ok:true,mensagem:'confirmado'});
 await env.LEADS_DB.prepare("UPDATE leads SET status='confirmed',confirmed_at=? WHERE id=? AND status IN ('pending','confirmation_sent','outcome_unknown')").bind(new Date().toISOString(),id).run();
 return reply({ok:true,mensagem:'confirmado'});
}

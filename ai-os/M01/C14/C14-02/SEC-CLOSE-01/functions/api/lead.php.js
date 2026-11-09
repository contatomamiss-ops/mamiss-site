import {reply,digest,token,send,config} from '../_lib/resend-core.js';
import {allow} from '../_lib/rate-limit.js';
const clean=(v,max=200)=>String(v??'').trim().slice(0,max+1);
export async function onRequest({request,env}){
 if(request.method!=='POST')return reply({ok:false,erro:'metodo_nao_permitido'},405);
 if(!config(env))return reply({ok:false,erro:'configuracao_ausente'},503);
 if(Number(request.headers.get('content-length')||0)>16384)return reply({ok:false,erro:'corpo_excessivo'},413);
 let form;try{form=await request.formData();}catch{return reply({ok:false,erro:'corpo_invalido'},400);}
 if(String(form.get('email_address_check')||'').trim())return reply({ok:true,mensagem:'ok'});
 const nome=clean(form.get('NOME')),email=clean(form.get('EMAIL'),254).toLowerCase(),lgpd=String(form.get('LGPD')||'').toLowerCase();
 if(!nome||nome.length>200)return reply({ok:false,erro:'nome_invalido'},422);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return reply({ok:false,erro:'email_invalido'},422);
 if(!['1','on','true'].includes(lgpd))return reply({ok:false,erro:'consentimento_ausente'},422);
 const list=['Site-Leads','Site-Conteudo'].includes(form.get('LISTA'))?form.get('LISTA'):'Site-Leads';
 const hash=await digest(email+'|'+list),id=hash.slice(0,32),existing=await env.LEADS_DB.prepare('SELECT * FROM leads WHERE id=?').bind(id).first();
 if(existing)return reply({ok:true,mensagem:'solicitacao_recebida'},202);
 try{if(!await allow(env.LEADS_DB,'lead:'+hash))return reply({ok:false,erro:'limite_excedido'},429);}catch{return reply({ok:false,erro:'persistencia_indisponivel'},503);}
 const exp=Date.now()+86400000,confirmation=await token(env.RESEND_TOKEN_SECRET,id,exp);
 const origin=env.PUBLIC_ORIGIN; if(!origin||!/^https:\/\/[^/]+$/.test(origin))return reply({ok:false,erro:'origem_nao_configurada'},503);const url=`${origin}/api/lead-confirm?token=${encodeURIComponent(confirmation)}`;
 try{await env.LEADS_DB.prepare('INSERT INTO leads(id,email,email_hash,name,list_name,consent_at,status,origin,utm_source,utm_medium,utm_campaign) VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(id,email,hash,nome,list,new Date().toISOString(),'pending',clean(form.get('ORIGEM')),clean(form.get('UTM_SOURCE')),clean(form.get('UTM_MEDIUM')),clean(form.get('UTM_CAMPAIGN'))).run();}catch{return reply({ok:false,erro:'persistencia_indisponivel'},503);}
 const sent=await send(env,email,'Confirme seu cadastro',`<p>Confirme sua solicitação:</p><a href="${url}">Confirmar</a>`,id);
 try{await env.LEADS_DB.prepare("UPDATE leads SET status=?,provider_id=?,last_error=? WHERE id=? AND status='pending'").bind(sent.ok?'confirmation_sent':sent.uncertain?'outcome_unknown':'send_failed',sent.id||null,sent.ok?null:`provider_${sent.status}`,id).run();}catch{return reply({ok:false,erro:'persistencia_indisponivel'},503);}
 return sent.ok?reply({ok:true,mensagem:'confirmacao_enviada'}):reply({ok:false,erro:sent.uncertain?'envio_indeterminado':'envio_falhou'},sent.uncertain?503:502);
}

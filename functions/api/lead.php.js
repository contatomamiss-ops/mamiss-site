/**
 * MAMISS — Captura de leads (Cloudflare Pages Function)
 * =============================================================================
 * Substitui o public/api/lead.php quando o site roda no Cloudflare Pages,
 * porque o Cloudflare NÃO executa PHP. A rota é a MESMA (/api/lead.php),
 * então o formulário continua funcionando sem mudar uma linha no site.
 *
 * Como o Cloudflare resolve a rota
 * -----------------------------------------------------------------------------
 * O arquivo `functions/api/lead.php.js` responde em `/api/lead.php`.
 * O sufixo `.js` é a implementação; a URL fica igual à do HostGator.
 *
 * Diferença de segurança em relação ao HostGator (é uma MELHORIA)
 * -----------------------------------------------------------------------------
 * No HostGator a chave vivia num arquivo (lead-config.php) dentro do site.
 * Aqui a chave vive numa VARIÁVEL DE AMBIENTE criptografada do Cloudflare
 * (BREVO_API_KEY) — ela nunca é gravada no código nem no build.
 *
 * Configuração (uma vez, no painel do Cloudflare)
 * -----------------------------------------------------------------------------
 * Workers & Pages → seu projeto → Settings → Variables and Secrets
 *   BREVO_API_KEY  = sua chave da API do Brevo   (tipo: Secret)
 *   BREVO_DIAG_TOKEN = um texto aleatório seu    (opcional, para diagnóstico)
 *
 * Diagnóstico: GET /api/lead.php?diagnostico=SEU_TOKEN
 * =============================================================================
 */

// Listas de destino (WHITELIST). O navegador manda o NOME; o servidor traduz.
// Para adicionar um ponto de captação: crie a lista no Brevo e acrescente aqui.
const LISTAS = {
  'Site-Leads': 9,      // intenção ALTA — aviso de abertura dos cursos
  'Site-Conteudo': 10,  // intenção BAIXA — atualizações de conteúdo
};
const LISTA_PADRAO = 'Site-Leads';

const TEMPLATE_ID = 1; // Confirmação Double Opt-in
const REDIRECT = 'https://www.mamiss.com.br/obrigado/';

const json = (corpo, status = 200) =>
  new Response(JSON.stringify(corpo), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
    },
  });

// Limpa e limita um valor de texto.
const limpo = (v, max = 200) => String(v ?? '').trim().replace(/<[^>]*>/g, '').slice(0, max);

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // ---------------------------------------------------------------------------
  // 1. Diagnóstico opcional — não cria nada, só confere se a configuração vive.
  // ---------------------------------------------------------------------------
  if (url.searchParams.has('diagnostico')) {
    const esperado = String(env.BREVO_DIAG_TOKEN ?? '');
    const recebido = url.searchParams.get('diagnostico') ?? '';
    if (esperado === '' || recebido !== esperado) {
      return json({ ok: false, erro: 'nao_encontrado' }, 404);
    }
    const status = {
      ok: true,
      config_presente: Boolean(env.BREVO_API_KEY),
      listas: LISTAS,
      lista_padrao: LISTA_PADRAO,
      template_id: TEMPLATE_ID,
      brevo: null,
    };
    if (env.BREVO_API_KEY) {
      try {
        const r = await fetch('https://api.brevo.com/v3/account', {
          headers: { 'api-key': env.BREVO_API_KEY },
        });
        status.brevo = r.status === 200 ? 'autenticado' : `http_${r.status}`;
      } catch (e) {
        status.brevo = 'erro_de_rede';
      }
    }
    return json(status);
  }

  // ---------------------------------------------------------------------------
  // 2. Método
  // ---------------------------------------------------------------------------
  if (request.method !== 'POST') {
    return json({ ok: false, erro: 'metodo_nao_permitido' }, 405);
  }

  // ---------------------------------------------------------------------------
  // 3. Entrada (multipart/form-data, como o formulário envia)
  // ---------------------------------------------------------------------------
  let form;
  try {
    form = await request.formData();
  } catch (e) {
    return json({ ok: false, erro: 'corpo_invalido' }, 400);
  }

  // Honeypot: humano nunca preenche. Robô preenche. Fingimos sucesso.
  if (String(form.get('email_address_check') ?? '').trim() !== '') {
    return json({ ok: true, mensagem: 'ok' });
  }

  const nome = limpo(form.get('NOME'));
  const email = limpo(form.get('EMAIL'), 254);
  const lgpd = String(form.get('LGPD') ?? '');

  if (nome === '' || nome.length > 200) {
    return json({ ok: false, erro: 'nome_invalido' }, 422);
  }
  if (email === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, erro: 'email_invalido' }, 422);
  }
  if (!['1', 'on', 'true'].includes(lgpd.toLowerCase())) {
    return json({ ok: false, erro: 'consentimento_ausente' }, 422);
  }
  if (!env.BREVO_API_KEY) {
    return json({ ok: false, erro: 'configuracao_ausente' }, 500);
  }

  // ---------------------------------------------------------------------------
  // 4. Qual lista? (o formulário pede, o servidor decide)
  // ---------------------------------------------------------------------------
  let listaNome = String(form.get('LISTA') ?? '').trim();
  if (listaNome === '' || !(listaNome in LISTAS)) {
    listaNome = LISTA_PADRAO; // lista desconhecida não é erro: cai na padrão
  }
  if (!(listaNome in LISTAS)) {
    return json({ ok: false, erro: 'lista_padrao_invalida' }, 500);
  }
  const listaId = LISTAS[listaNome];

  // ---------------------------------------------------------------------------
  // 5. Atributos — LGPD + origem + rastreio
  // ---------------------------------------------------------------------------
  const atributos = {
    NOME: nome,
    LGPD: true,
    DATA_CONSENTIMENTO: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    ORIGEM: limpo(form.get('ORIGEM') ?? `Site — ${listaNome}`),
  };
  for (const k of ['UTM_SOURCE', 'UTM_MEDIUM', 'UTM_CAMPAIGN']) {
    const v = limpo(form.get(k));
    if (v !== '') atributos[k] = v;
  }

  // ---------------------------------------------------------------------------
  // 6. Brevo — Double Opt-in (envia o e-mail de confirmação e inscreve na lista)
  // ---------------------------------------------------------------------------
  try {
    const r = await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        includeListIds: [listaId],
        templateId: TEMPLATE_ID,
        redirectionUrl: REDIRECT,
        attributes: atributos,
      }),
    });

    // 201 = criado · 204 = já existia e foi atualizado → ambos são sucesso
    if (r.status === 201 || r.status === 204) {
      return json({ ok: true, mensagem: 'confirmacao_enviada' });
    }

    // Contato já inscrito / duplicado: para a visitante, é sucesso.
    if (r.status === 400) {
      return json({ ok: true, mensagem: 'ja_inscrito' });
    }

    return json({ ok: false, erro: `brevo_http_${r.status}` }, 502);
  } catch (e) {
    return json({ ok: false, erro: 'brevo_indisponivel' }, 502);
  }
}

# MAMISS — Acessos necessários para automação GitHub → Cloudflare

## O que já consigo fazer com o acesso atual

Com o acesso GitHub atual via ferramentas, consigo:

- editar/criar arquivos textuais no repositório `contatomamiss-ops/mamiss-site`;
- criar documentação, workflows e issues;
- adicionar/atualizar a Cloudflare Pages Function `functions/api/lead.php.js`;
- preparar automação GitHub Actions;
- criar estrutura de projeto e arquivos de configuração;
- revisar o estado do repositório.

Limitações atuais:

- não consigo configurar **GitHub Actions Secrets** via ferramenta atual;
- não consigo fazer `git push` pelo terminal porque não há credencial Git interativa configurada;
- não consigo subir em lote binários/imagens/fontes do build pelo método atual de arquivos textuais;
- não tenho acesso direto ao painel/API Cloudflare para vincular domínio, criar secrets no Pages ou disparar deploy com credenciais reais.

---

## Acesso adicional útil no GitHub

### Opção recomendada

Ariadne configura manualmente os Secrets no GitHub e eu sigo versionando o repositório.

Criar em:

```text
GitHub → contatomamiss-ops/mamiss-site
→ Settings
→ Secrets and variables
→ Actions
→ Repository secrets
```

Secrets:

| Nome | Valor |
|---|---|
| `CLOUDFLARE_API_TOKEN` | token Cloudflare com permissão de deploy Pages |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID Cloudflare |
| `CLOUDFLARE_PROJECT_NAME` | `mamiss` |

### Se quiser que eu suba o snapshot completo com binários

Preciso que o terminal consiga autenticar no GitHub, por uma das opções:

1. instalar/configurar GitHub CLI (`gh auth login`); ou
2. fornecer um token GitHub temporário com permissão de escrita no repo para usar como credencial Git; ou
3. habilitar outro mecanismo de push Git autenticado no ambiente.

Permissões mínimas do token GitHub:

- para repositório clássico: `repo` no repositório `contatomamiss-ops/mamiss-site`;
- para fine-grained token: acesso ao repo `mamiss-site` com `Contents: Read and write` e, se for configurar secrets via API, `Actions secrets: Read and write` quando disponível.

---

## Acesso necessário no Cloudflare

### Para deploy automático via GitHub Actions

Criar um token Cloudflare em:

```text
Cloudflare Dashboard
→ My Profile
→ API Tokens
→ Create Token
→ Custom token
```

Permissões recomendadas:

| Scope | Permissão |
|---|---|
| Account → Cloudflare Pages | Edit |
| Account → Workers Scripts | Edit *(se o painel exigir para Functions)* |
| Account → Account Settings | Read |
| Zone → Zone | Read |

Recursos:

| Campo | Valor |
|---|---|
| Account Resources | incluir a conta da MAMISS |
| Zone Resources | incluir `mamiss.com.br` |

Depois copiar o token e salvar no GitHub como:

```text
CLOUDFLARE_API_TOKEN
```

⚠️ Não colar token em issue, chat público ou arquivo do repositório.

---

## Variáveis/secrets no Cloudflare Pages

No projeto Pages `mamiss`:

```text
Cloudflare Dashboard
→ Workers & Pages
→ mamiss
→ Settings
→ Variables and Secrets
```

Criar/confirmar:

| Nome | Tipo | Uso |
|---|---|---|
| `BREVO_API_KEY` | Secret | usada pela Function `/api/lead.php` |
| `BREVO_DIAG_TOKEN` | Secret | diagnóstico controlado |

Essas variáveis ficam no Cloudflare, **não** no GitHub.

---

## Vincular GitHub ao Cloudflare Pages pelo painel

Alternativa ao GitHub Actions: usar integração nativa do Cloudflare Pages.

Passo a passo:

```text
Cloudflare Dashboard
→ Workers & Pages
→ mamiss
→ Settings
→ Builds & deployments
→ Source / Git integration
→ Connect GitHub
→ selecionar contatomamiss-ops/mamiss-site
→ branch main
```

Configuração quando o source Astro estiver no repo:

| Campo | Valor |
|---|---|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

Configuração emergencial com snapshot estático completo:

| Campo | Valor |
|---|---|
| Framework preset | None/static |
| Build command | vazio ou `echo static` |
| Build output directory | `site-publicado` |
| Root directory | `/` |

---

## Custom domain

Confirmar em:

```text
Cloudflare Dashboard
→ Workers & Pages
→ mamiss
→ Custom domains
```

Domínios esperados:

```text
www.mamiss.com.br
mamiss.com.br
```

Se `www.mamiss.com.br` estiver retornando 403, verificar:

1. se o domínio está adicionado ao projeto Pages;
2. se o DNS aponta para Pages e não para HostGator;
3. se não existe regra de bloqueio/WAF/Access;
4. se o projeto Pages tem último deploy válido.

---

## Ordem prática recomendada

1. Configurar os Secrets no GitHub: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_PROJECT_NAME`.
2. Confirmar no Cloudflare Pages os Secrets `BREVO_API_KEY` e `BREVO_DIAG_TOKEN`.
3. Recuperar/subir o source Astro real para o repo.
4. Remover ou arquivar o `index.html` legado da raiz.
5. Rodar Actions manualmente em `Deploy Cloudflare Pages`.
6. Confirmar HTTP 200 em `mamiss.pages.dev` e `www.mamiss.com.br`.

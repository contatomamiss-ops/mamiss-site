# MAMISS — Plano de automação GitHub → Cloudflare Pages

## Objetivo

Fazer com que uma atualização aprovada no GitHub publique automaticamente o site na internet, via Cloudflare Pages.

Fluxo alvo:

```text
GitHub main
  → GitHub Actions / Cloudflare Pages
  → build ou deploy estático
  → mamiss.pages.dev
  → www.mamiss.com.br
```

## Estado atual do repositório

Este repositório já contém:

- documentação de manutenção (`docs/MAMISS-SITE-MAPA-MANUTENCAO-GITHUB-v1.md`);
- função Cloudflare Pages para captação (`functions/api/lead.php.js`);
- manifesto do deploy encontrado (`site-publicado/MANIFESTO-DEPLOY.txt`);
- workflow de deploy preparado em `.github/workflows/deploy-cloudflare-pages.yml`.

Ainda NÃO contém o source Astro real completo do site:

```text
package.json
astro.config.*
src/
public/
scripts/
```

Também NÃO contém o snapshot estático completo com binários/imagens/fontes, apenas o manifesto.

Por isso, a automação foi instalada como infraestrutura, mas só publicará com sucesso quando uma das duas estruturas publicáveis existir no repositório.

---

## Modelo recomendado — source Astro

Estrutura esperada:

```text
mamiss-site/
├── package.json
├── astro.config.*
├── src/
├── public/
├── functions/
│   └── api/lead.php.js
└── scripts/
```

Configuração do workflow:

- instala dependências com `npm ci` ou `npm install`;
- roda `npm run build`;
- publica `dist/` no Cloudflare Pages;
- inclui `functions/` no deploy.

Este é o modelo correto para manutenção contínua.

---

## Modelo emergencial — snapshot estático

Estrutura alternativa:

```text
mamiss-site/
├── site-publicado/
│   ├── index.html
│   ├── 404.html
│   ├── _astro/
│   ├── blog/
│   ├── marca/
│   └── ...
└── functions/
    └── api/lead.php.js
```

Nesse modo, o workflow publica `site-publicado/` direto.

⚠️ Este modelo é menos recomendado porque o conteúdo está buildado/minificado e é pior de manter.

---

## Segredos necessários no GitHub

Criar em:

```text
GitHub → Settings → Secrets and variables → Actions → Repository secrets
```

Secrets necessários:

| Secret | Uso |
|---|---|
| `CLOUDFLARE_API_TOKEN` | token com permissão de deploy em Cloudflare Pages |
| `CLOUDFLARE_ACCOUNT_ID` | ID da conta Cloudflare |
| `CLOUDFLARE_PROJECT_NAME` | normalmente `mamiss` |

O workflow NÃO deve receber `BREVO_API_KEY`. Essa chave deve continuar como Secret no Cloudflare Pages:

```text
Cloudflare → Workers & Pages → mamiss → Settings → Variables and Secrets
```

Secrets Cloudflare Pages:

| Secret | Uso |
|---|---|
| `BREVO_API_KEY` | chamada à API do Brevo pela Function |
| `BREVO_DIAG_TOKEN` | diagnóstico controlado do endpoint `/api/lead.php` |

---

## Como automatizar a publicação

### Opção 1 — deploy automático em todo push na `main`

O workflow já está configurado para rodar em:

```yaml
on:
  push:
    branches: [main]
```

Quando o source real estiver no repo e os secrets do GitHub existirem, cada push na `main` tentará publicar no Cloudflare Pages.

### Opção 2 — deploy manual

Também está habilitado:

```yaml
workflow_dispatch:
```

Isso permite disparar manualmente em:

```text
GitHub → Actions → Deploy Cloudflare Pages → Run workflow
```

---

## Gates de segurança

Antes de publicar, o workflow faz preflight:

1. detecta se existe projeto Astro (`package.json`);
2. ou detecta se existe snapshot estático (`site-publicado/index.html`);
3. se nenhum existir, falha com instrução clara;
4. verifica se arquivos proibidos como `.env` e `lead-config.php` não entraram no repositório;
5. exige secrets de Cloudflare para publicar.

---

## O que falta para refletir 100% o site online

1. Recuperar o source Astro original; ou
2. subir o snapshot estático completo, incluindo imagens/fontes/binários; e
3. configurar os secrets do GitHub Actions; e
4. confirmar no Cloudflare Pages que o projeto `mamiss` está ligado ao domínio correto `www.mamiss.com.br`.

Sem esses itens, o repositório está preparado para automação, mas ainda não é a fonte de produção do site.

---

## Próxima ação recomendada

Prioridade 1: recuperar o source Astro original e versionar no GitHub.

Depois disso:

```bash
git push origin main
```

será suficiente para disparar o deploy automático no Cloudflare Pages, desde que os secrets estejam configurados.

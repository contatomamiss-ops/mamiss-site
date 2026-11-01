# MAMISS Site

Repositório de organização/manutenção do site MAMISS.

> Estado atual: este repositório foi estruturado a partir do pacote de deploy encontrado em `/home/user/mamiss-deploy`. O projeto fonte Astro original (`/home/user/mamiss-site`) não estava presente no ambiente no momento da estruturação.

## Estrutura atual

```text
.
├── index.html                         # página legada do app Drive MCP; preservada por enquanto
├── .github/workflows/
│   └── deploy-cloudflare-pages.yml    # automação GitHub → Cloudflare Pages
├── docs/
│   ├── MAMISS-SITE-MAPA-MANUTENCAO-GITHUB-v1.md
│   └── PLANO-AUTOMACAO-GITHUB-CLOUDFLARE.md
├── functions/
│   └── api/
│       └── lead.php.js                # Cloudflare Pages Function para /api/lead.php
└── site-publicado/                    # snapshot documentado do deploy atual
    ├── README.md
    └── MANIFESTO-DEPLOY.txt
```

## Automação preparada

Este repositório já tem um workflow em:

```text
.github/workflows/deploy-cloudflare-pages.yml
```

Ele prepara o fluxo:

```text
push na main → GitHub Actions → Cloudflare Pages → site na internet
```

O workflow detecta automaticamente dois modos:

1. **Astro/source** — se existir `package.json`, roda `npm install` + `npm run build` e publica `dist/`.
2. **Snapshot estático** — se existir `site-publicado/index.html`, publica `site-publicado/` direto.

## O que ainda falta para produção real

Hoje o repositório ainda NÃO é a fonte completa do site online porque faltam:

- source Astro completo (`package.json`, `astro.config.*`, `src/`, `public/`, `scripts/`); ou
- snapshot estático completo com `site-publicado/index.html`, `_astro/`, páginas, imagens e fontes;
- secrets do GitHub Actions para Cloudflare;
- confirmação no Cloudflare Pages de domínio customizado `www.mamiss.com.br`.

## Secrets necessários no GitHub

Criar em:

```text
Settings → Secrets and variables → Actions → Repository secrets
```

| Secret | Uso |
|---|---|
| `CLOUDFLARE_API_TOKEN` | publicar no Cloudflare Pages |
| `CLOUDFLARE_ACCOUNT_ID` | conta Cloudflare |
| `CLOUDFLARE_PROJECT_NAME` | nome do projeto Pages, normalmente `mamiss` |

## Secrets que ficam no Cloudflare, não no GitHub

| Secret | Uso |
|---|---|
| `BREVO_API_KEY` | API Brevo usada pela Function |
| `BREVO_DIAG_TOKEN` | diagnóstico controlado do endpoint `/api/lead.php` |

## Como manter

1. Use `docs/MAMISS-SITE-MAPA-MANUTENCAO-GITHUB-v1.md` como porta de entrada.
2. Use `docs/PLANO-AUTOMACAO-GITHUB-CLOUDFLARE.md` para configurar publicação automática.
3. Não coloque segredos no GitHub.
4. A captação no Cloudflare usa `functions/api/lead.php.js`, que responde em `/api/lead.php`.
5. Para manutenção ideal, recuperar o source Astro (`mamiss-site`) e versionar `src/`, `public/`, `functions/` e `scripts/`.

## Próximo passo recomendado

Recuperar o projeto fonte Astro original e reorganizar o repositório para conter o source real. Depois disso, um `push` na `main` poderá publicar automaticamente no Cloudflare Pages.

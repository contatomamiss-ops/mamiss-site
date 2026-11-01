# MAMISS Site

Repositório de organização/manutenção do site MAMISS.

> Estado atual: este repositório foi estruturado a partir do pacote de deploy encontrado em `/home/user/mamiss-deploy`. O projeto fonte Astro original (`/home/user/mamiss-site`) não estava presente no ambiente no momento da estruturação.

## Estrutura

```text
.
├── index.html                         # página legada do app Drive MCP; preservada
├── docs/
│   └── MAMISS-SITE-MAPA-MANUTENCAO-GITHUB-v1.md
├── functions/
│   └── api/
│       └── lead.php.js                # Cloudflare Pages Function para /api/lead.php
└── site-publicado/                    # snapshot do deploy atual publicado/buildado
    ├── README.md
    └── MANIFESTO-DEPLOY.txt
```

## Como manter

1. Use `docs/MAMISS-SITE-MAPA-MANUTENCAO-GITHUB-v1.md` como porta de entrada.
2. Não coloque segredos no GitHub. `BREVO_API_KEY` e `BREVO_DIAG_TOKEN` devem ficar como Secrets no Cloudflare Pages.
3. A captação no Cloudflare usa `functions/api/lead.php.js`, que responde em `/api/lead.php`.
4. `site-publicado/` documenta o snapshot buildado encontrado; para manutenção ideal, recuperar o source Astro (`mamiss-site`) e versionar `src/`, `public/`, `functions/` e `scripts/`.

## Próximo passo recomendado

Recuperar o projeto fonte Astro original e reorganizar o repositório para conter o source, não apenas o snapshot publicado.

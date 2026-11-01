# MAMISS — Mapa do site para manutenção e atualização (v1)

## 1. Estado encontrado

- **Produção/deploy local encontrado:** `/home/user/mamiss-deploy`
- **Source Astro esperado pelos documentos:** `/home/user/mamiss-site`
- **Estado atual no ambiente:** `/home/user/mamiss-site` **não existe** neste filesystem.
- **Repositório GitHub identificado:** `https://github.com/contatomamiss-ops/mamiss-site`
- **Site publicado segundo passagem v9:** `https://mamiss.pages.dev`
- **Deploy:** Cloudflare Pages.
- **Função de captação:** `functions/api/lead.php.js` respondendo em `/api/lead.php`.

## 2. Estrutura real encontrada em `/home/user/mamiss-deploy`

```text
mamiss-deploy/
├── index.html
├── 404.html
├── _astro/                         # CSS/JS/fontes gerados pelo Astro
├── blog/
│   ├── index.html
│   ├── primeiro-trimestre-de-gravidez/index.html
│   ├── segundo-trimestre-de-gravidez/index.html
│   ├── preparacao-para-o-parto/index.html
│   ├── amamentacao-e-pos-parto/index.html
│   ├── desenvolvimento-do-bebe-12-meses/index.html
│   └── *.webp                      # imagens dos artigos
├── contato/index.html
├── curso/guia-da-descoberta/index.html
├── cursos/index.html
├── functions/api/lead.php.js        # Cloudflare Pages Function / Brevo
├── inscricao/index.html
├── marca/                           # logos e ícones publicados
├── obrigado/index.html
├── pilares/index.html
├── politica-de-privacidade/index.html
├── referencias/index.html
├── sobre/index.html
├── termos-de-uso/index.html
├── manifest.webmanifest
├── robots.txt
├── rss.xml
├── sitemap-0.xml
└── sitemap-index.xml
```

## 3. Estrutura fonte recomendada para o GitHub

> Esta estrutura é reconstruída a partir dos documentos internos; o source local não está presente no ambiente atual.

```text
mamiss-site/
├── README.md
├── package.json
├── astro.config.*
├── src/
│   ├── data/
│   │   ├── site.ts                 # fonte única: dados institucionais, links, números, e-mails, CNPJ
│   │   └── referencias.ts          # fonte única: referências/fontes exibidas
│   ├── components/
│   │   └── FormularioLead.astro    # componente reutilizável de captação
│   ├── layouts/
│   └── pages/
│       ├── index.astro
│       ├── inscricao.astro         # formulário nativo; LISTA=Site-Leads
│       ├── obrigado.astro          # noindex
│       ├── blog/
│       │   ├── index.astro
│       │   ├── primeiro-trimestre-de-gravidez.astro
│       │   ├── segundo-trimestre-de-gravidez.astro
│       │   ├── preparacao-para-o-parto.astro
│       │   ├── amamentacao-e-pos-parto.astro
│       │   └── desenvolvimento-do-bebe-12-meses.astro
│       ├── curso/
│       │   └── guia-da-descoberta.astro
│       ├── cursos.astro
│       ├── pilares.astro
│       ├── referencias.astro
│       ├── sobre.astro
│       ├── contato.astro
│       ├── politica-de-privacidade.astro
│       └── termos-de-uso.astro
├── public/
│   ├── marca/
│   ├── robots.txt
│   └── manifest.webmanifest
├── functions/
│   └── api/
│       └── lead.php.js             # Cloudflare Pages Function
└── scripts/
    ├── verificar_site.py
    ├── verificar_brevo.py
    └── verificar_conformidade.py
```

## 4. Regras de manutenção que não podem ser quebradas

1. **Fonte única:** alterações de dados institucionais, links, contatos, CNPJ, números publicados e endpoints devem ir em `src/data/site.ts`; não duplicar em páginas.
2. **Referências:** alterações em fontes/citações devem ir em `src/data/referencias.ts`.
3. **Captação:** lista = intenção. `Site-Leads` = lista 9; `Site-Conteudo` = lista 10.
4. **Campo oculto:** manter `LISTA` em maiúsculas nos formulários.
5. **Cloudflare não roda PHP:** não voltar a usar `public/api/lead.php` nem publicar `lead-config.php`.
6. **Segredos:** `BREVO_API_KEY` e `BREVO_DIAG_TOKEN` devem ficar como Secrets no Cloudflare Pages, nunca no GitHub.
7. **E-mail/DNS:** não ligar proxy Cloudflare em `mail`, `cpanel`, `whm`, `ftp`, `webdisk`, `autodiscover`, `autoconfig`.
8. **Venda:** curso/venda continuam dependentes de decisão comercial; captação é fase vigente.
9. **Publicação:** antes de deploy, rodar check/build/verificações e pedir inspeção visual.

## 5. Checklist mínimo para atualizar

```bash
# dentro do source recuperado
npm run check
npm run build

# conferir dist
find dist -name "*.mjs" | wc -l
find dist -type f | grep -E "lead-config|BREVO_API_KEY|api_key" && echo "ATENÇÃO: segredo" || echo "OK: sem segredo óbvio"

# preparar deploy Cloudflare Pages
rm -rf /home/user/mamiss-deploy
mkdir -p /home/user/mamiss-deploy
cp -r dist/* /home/user/mamiss-deploy/
cp -r functions /home/user/mamiss-deploy/
```

## 6. Pendência principal

Recuperar/clonar o **repositório fonte do site** (`mamiss-site`) no GitHub. O ambiente atual só contém o pacote de deploy gerado (`mamiss-deploy`), que serve para auditoria e republicação emergencial, mas não é o melhor lugar para manutenção de conteúdo.

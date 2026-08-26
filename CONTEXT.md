# CONTEXT — Leão North (Instalações Elétricas + Materiais)

> **Para quem é este documento:** outra IA (ou desenvolvedor) que receber acesso a este projeto
> precisa entender, em poucos minutos, **o que** o aplicativo faz, **como** está arquitetado,
> **como funciona** e **o que há em cada arquivo**.

---

## 1. Visão Geral do Aplicativo

A **Leão North** é uma empresa de engenharia elétrica com sede em **Cornélio Procópio - PR**
(R. Paraíba, 830 - Centro). O domínio principal agora atende **duas frentes de negócio** no mesmo
SPA (conceito "Yin-Yang"):

1. **Leão North Service** — serviços elétricos (tema escuro). Apresenta a empresa, serviços,
   portfólio, depoimentos, sócios e formulário de orçamento.
2. **Leão North Materiais** — catálogo de produtos elétricos para venda casada (tema claro).
   Consome a API de produtos e encaminha o interesse via WhatsApp.

A experiência começa no **Portal Gateway**, uma tela dividida (split-screen) onde o visitante
escolhe entre **Service** (lado escuro) e **Materiais** (lado claro). Há também o **Painel
Administrativo** (`/admin`), que permite gerenciar portfólio, produtos, mensagens e depoimentos.

O site é um **SPA em React** que roda na pasta do **XAMPP** (`c:/xampp/htdocs/leaonorth`) e conversa
com uma **API em PHP** servida pelo Apache do XAMPP, persistindo dados em **MySQL**.

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
| --- | --- |
| Frontend | React 19 + TypeScript + Vite 7 |
| Estilo | Tailwind CSS 4 + shadcn/ui (Radix UI) + tw-animate-css |
| Roteamento | Wouter 3 (client-side routing) |
| Animações | CSS + IntersectionObserver (scroll reveal) + tw-animate-css (Gateway) |
| Backend | PHP 8 (PDO/MySQL) servido pelo Apache do XAMPP |
| Banco de dados | MySQL — database `leao_north` |
| Upload de imagens | PHP `move_uploaded_file` → pasta `uploads/` |
| Ícones | lucide-react |
| Fonte | Barlow Condensed (títulos) + DM Sans (corpo), via Google Fonts |
| Gerenciador de pacotes | pnpm (também há `package-lock.json`) |

> **Importante:** o frontend e o backend **não** rodam juntos no mesmo processo. O backend PHP
> (`/api/...`) é servido pelo **Apache do XAMPP** em `http://localhost/leaonorth/api/...`, e o
> frontend (Vite dev server, porta 3000) faz requisições `fetch` para essas URLs absolutas.

---

## 3. Arquitetura Geral

```mermaid
flowchart LR
    subgraph Browser
        A[Gateway Yin-Yang]
        B[Service page]
        C[Materiais page]
        D[Admin panel]
    end

    subgraph XAMPP Apache :80
        E[API PHP /api]
        F[uploads/ imagens]
    end

    subgraph MySQL
        G[(leao_north<br/>contatos portfolio depoimentos produtos admin_users)]
    end

    A -->|escolha da frente| B
    A -->|escolha da frente| C
    B -->|fetch JSON| E
    C -->|fetch produtos| E
    D -->|CRUD| E
    E --> G
    E -->|grava/remove arquivos| F
    B -->|img src /uploads| F
    C -->|img src /uploads| F
```

### Fluxo de dados principal

1. O usuário acessa `/` → o **Portal Gateway** exibe as duas frentes (Service escuro / Materiais claro).
2. Escolhe **Service** (`/service`): a landing compõe Hero, About, Mission, Services, Portfolio,
   Differentials, **Sócios**, Testimonials e Contact. Seções dinâmicas (Portfólio, Depoimentos)
   buscam dados via `fetch` para a API PHP.
3. Escolhe **Materiais** (`/materiais`): catálogo claro de produtos, consumindo `api/produtos.php`,
   com botão "Tenho Interesse" que abre o WhatsApp com o nome do produto.
4. O visitante envia um formulário (orçamento, contato ou "falar com sócio") → `POST /api/contato.php`
   → grava em `contatos` com o campo `tipo_mensagem` (service | materiais | socio) e tenta disparar
   e-mail para `contato@leaonorth.com.br`.
5. O administrador acessa `/admin` (login) → token no `localStorage` → `/admin/dashboard` para
   gerenciar portfólio, **produtos**, mensagens (com badges de origem) e depoimentos.

---

## 4. Estrutura de Diretórios

```
leaonorth/                          ← raiz do workspace (document root do site no XAMPP)
├── CONTEXT.md                      ← este documento
├── .gitignore
│
├── api/                            ← BACKEND PHP (usado de verdade pelo frontend)
│   ├── contato.php                 ← POST: salva contato/orçamento + tipo_mensagem + e-mail
│   ├── portfolio.php               ← GET: lista projetos do portfólio
│   ├── depoimentos.php             ← GET: lista depoimentos
│   ├── produtos.php                ← GET: lista produtos do catálogo (filtro ?categoria=)
│   └── admin/
│       ├── login.php               ← POST: autentica admin (password_verify)
│       ├── mensagens.php           ← GET: lista mensagens de contato (inclui tipo_mensagem)
│       ├── add_depoimento.php      ← POST: cria depoimento
│       ├── edit_depoimento.php     ← PUT: edita depoimento
│       ├── delete_depoimento.php   ← DELETE: remove depoimento
│       ├── upload.php              ← POST: upload de imagem + insere no portfólio
│       ├── delete.php              ← DELETE: remove projeto do portfólio
│       ├── add_produto.php         ← POST: cadastra produto + upload de imagem (valida MIME/5MB)
│       └── delete_produto.php      ← DELETE: remove produto + arquivo físico da imagem
│
├── uploads/                        ← imagens (portfólio e produtos)
│
├── zoo_code_docs/                  ← documentação de planejamento das fases (fase1..fase5)
│
└── leao-north-site/                ← FRONTEND React (código-fonte do site)
    ├── package.json                ← dependências e scripts
    ├── vite.config.ts              ← config do Vite (alias, plugins, debug logs)
    ├── tsconfig.json               ← config TypeScript (alias @, @shared)
    ├── components.json             ← config shadcn/ui
    ├── index.html (client/)        ← HTML raiz (metas SEO + fontes)
    ├── client/
    │   ├── public/__manus__/       ← debug collector do Manus (dev tooling)
    │   └── src/
    │       ├── main.tsx            ← entry point React
    │       ├── App.tsx             ← rotas (/, /service, /materiais, /admin, /admin/dashboard, /404)
    │       ├── index.css           ← design system (cores/tipografia/utilitários)
    │       ├── const.ts            ← constantes OAuth (não usado no fluxo atual)
    │       ├── pages/
    │       │   ├── Gateway.tsx     ← Portal Yin-Yang (escolha Service × Materiais)
    │       │   ├── Service.tsx     ← landing da Leão North Service (ex-Home)
    │       │   ├── Materiais.tsx   ← catálogo de produtos (tema claro)
    │       │   ├── NotFound.tsx    ← página 404
    │       │   └── admin/
    │       │       ├── Login.tsx   ← tela de login do painel
    │       │       └── Dashboard.tsx ← painel (portfólio/produtos/mensagens/depoimentos)
    │       ├── components/
    │       │   ├── Navbar.tsx      ← navbar fixa com blur; prop variant="dark" | "light"
    │       │   ├── Footer.tsx      ← rodapé escuro (mantido escuro em todas as páginas)
    │       │   ├── WhatsAppButton.tsx ← botão flutuante do WhatsApp
    │       │   ├── ErrorBoundary.tsx ← captura erros de renderização
    │       │   ├── Map.tsx         ← componente Google Maps (do template; NÃO usado)
    │       │   ├── ManusDialog.tsx ← dialog de login do Manus (do template; NÃO usado)
    │       │   ├── sections/       ← seções da landing Service
    │       │   │   ├── HeroSection.tsx, AboutSection.tsx, MissionSection.tsx,
    │       │   │   ├── ServicesSection.tsx, PortfolioSection.tsx, DifferentialsSection.tsx,
    │       │   │   ├── SociosSection.tsx, TestimonialsSection.tsx, ContactSection.tsx
    │       │   └── ui/             ← ~50 componentes shadcn/ui (biblioteca padrão)
    │       ├── contexts/
    │       │   └── ThemeContext.tsx ← provider de tema claro/escuro (app usa dark)
    │       ├── hooks/
    │       │   ├── useScrollReveal.ts ← hook de reveal ao rolar
    │       │   ├── useComposition.ts  ← util para inputs (template)
    │       │   ├── useMobile.tsx      ← detecta mobile (template)
    │       │   └── usePersistFn.ts    ← função estável (template)
    │       └── lib/
    │           └── utils.ts        ← helper `cn()` (clsx + tailwind-merge)
    ├── server/index.ts             ← servidor Express placeholder (template; NÃO usado)
    ├── shared/const.ts             ← constantes compartilhadas (template)
    ├── patches/wouter@3.7.1.patch  ← patch do wouter (registra rotas no window)
    ├── ideas.md                    ← brainstorm de design (documentação)
    ├── template.json               ← manifest do template usado para criar o site
    └── README.md                   ← readme do template
```

---

## 5. Backend PHP — Endpoints (raiz `/api`)

> Todos os endpoints usam **PDO** com credenciais do XAMPP local: host `localhost`, database
> `leao_north`, user `root`, senha vazia. Todos liberam **CORS**
> (`Access-Control-Allow-Origin: *`) e respondem **JSON**.

| Endpoint | Método | O que faz | Retorno |
| --- | --- | --- | --- |
| [`api/contato.php`](api/contato.php) | POST | Valida `name`, `phone`, `message`; insere em `contatos` **incluindo `tipo_mensagem`** (whitelist `service`/`materiais`/`socio`, default `service`); tenta enviar e-mail com a origem | `200/400/500/503` + `mensagem` |
| [`api/portfolio.php`](api/portfolio.php) | GET | `SELECT id, img, title, category, size FROM portfolio ORDER BY id DESC` | array JSON |
| [`api/depoimentos.php`](api/depoimentos.php) | GET | `SELECT id, nome, estrelas, texto FROM depoimentos ORDER BY id DESC` | array JSON |
| [`api/produtos.php`](api/produtos.php) | GET | `SELECT id, nome, especificacao, categoria, imagem, data_cadastro FROM produtos ORDER BY id DESC`; filtro opcional `?categoria=` | array JSON |
| [`api/admin/login.php`](api/admin/login.php) | POST | Busca usuário por e-mail em `admin_users`; confere senha com `password_verify` | `200` com `token` ou `401` |
| [`api/admin/mensagens.php`](api/admin/mensagens.php) | GET | Lista `contatos` **incluindo `tipo_mensagem`** (id, nome, telefone, email, servico, mensagem, tipo_mensagem, data_envio) | array JSON |
| [`api/admin/add_depoimento.php`](api/admin/add_depoimento.php) | POST | Insere em `depoimentos` (nome, estrelas, texto — texto opcional) | `200`/`500` |
| [`api/admin/edit_depoimento.php`](api/admin/edit_depoimento.php) | PUT | `UPDATE depoimentos SET nome, estrelas, texto WHERE id` | `200`/`400`/`500` |
| [`api/admin/delete_depoimento.php`](api/admin/delete_depoimento.php) | DELETE | `DELETE FROM depoimentos WHERE id` (id via query string) | `200`/`500` |
| [`api/admin/upload.php`](api/admin/upload.php) | POST | Recebe imagem (`$_FILES['image']`) + `title`/`category`/`size`; salva em `../../uploads/` com nome `time()_nome`; insere `img` (`/uploads/...`) no `portfolio` | `200`/`400`/`500` |
| [`api/admin/delete.php`](api/admin/delete.php) | DELETE | `DELETE FROM portfolio WHERE id` (id via query string) | `200`/`500` |
| [`api/admin/add_produto.php`](api/admin/add_produto.php) | POST | Cadastra produto (nome, especificacao, categoria, imagem) com **upload para `../../uploads/`** e **validação rigorosa**: MIME real via `finfo` (jpg/png/webp/avif) e limite **5MB**; remove imagem órfã em falha | `200`/`400`/`500` |
| [`api/admin/delete_produto.php`](api/admin/delete_produto.php) | DELETE | `SELECT` da imagem **antes** do `DELETE FROM produtos WHERE id`; remove o arquivo físico (`unlink`) de `uploads/` | `200`/`400`/`500` |

### Sobre o campo `tipo_mensagem`

- **`contato.php`**: aceita `tipo_mensagem` no payload JSON e valida com whitelist
  (`service`, `materiais`, `socio`); se ausente/inválido, usa `service`. A origem também é incluída
  no corpo do e-mail de notificação.
- **`mensagens.php`**: o `SELECT` retorna `tipo_mensagem` para o painel exibir o badge de origem.

### Observações de segurança/qualidade (importantes para quem for mexer)

- **Login "frouxo":** o token (`base64(id + time())`) é guardado apenas no `localStorage`; **nenhum
  endpoint de admin valida de fato esse token** no servidor. A "proteção" é client-side.
- **Injeção SQL:** todas as queries usam prepared statements (`bindParam`) — ok.
- **Upload:** o novo `add_produto.php` valida MIME real e tamanho (5MB). O `upload.php` do portfólio
  continua sem validação no servidor (apenas `accept="image/*"` no frontend).
- **Conexão:** credenciais do banco hardcoded (padrão XAMPP: root/senha vazia).

---

## 6. Frontend React — Arquivos Principais

### Entrada e rotas

- [`client/src/main.tsx`](leao-north-site/client/src/main.tsx) — monta o `<App />` no `#root`.
- [`client/src/App.tsx`](leao-north-site/client/src/App.tsx) — define o `Router` (wouter `Switch`):
  - `/` → **`Gateway`** (Portal Yin-Yang)
  - `/service` → **`Service`**
  - `/materiais` → **`Materiais`**
  - `/admin` → `Login`
  - `/admin/dashboard` → `Dashboard`
  - qualquer outra → `NotFound`
  - Envolve tudo com `ErrorBoundary`, `ThemeProvider` (tema escuro) e `Toaster` (sonner).

### Páginas

| Página | Função |
| --- | --- |
| [`Gateway.tsx`](leao-north-site/client/src/pages/Gateway.tsx) | **Portal de escolha (Yin-Yang):** tela dividida em duas metades (lado a lado no desktop, empilhada no mobile). Lado esquerdo **Service** (fundo `#080808`, dourado, → `/service`) e lado direito **Materiais** (fundo claro `#F8FAFC`, dourado, → `/materiais`). Animações de entrada com `tw-animate-css` e hover com anel de brilho dourado + zoom. Não usa Navbar/Footer. |
| [`Service.tsx`](leao-north-site/client/src/pages/Service.tsx) | **Leão North Service** (ex-`Home`): compõe `Navbar` → `Hero` → `About` → `Mission` → `Services` → `Portfolio` → `Differentials` → **`SociosSection`** → `Testimonials` → `Contact` → `Footer` → `WhatsAppButton`. Fundo geral `#080808`. |
| [`Materiais.tsx`](leao-north-site/client/src/pages/Materiais.tsx) | **Leão North Materiais (tema claro):** fundo `bg-slate-50`/branco, textos escuros. Hero claro + **catálogo** consumindo `api/produtos.php` (grid de cards com imagem, categoria, nome, especificação) + **filtro por categoria** (chips) + botão **"Tenho Interesse"** que abre o WhatsApp (`wa.me/5543999190467`) citando o produto. Usa `<Navbar variant="light" />` e o `Footer` escuro (contraste). |
| [`NotFound.tsx`](leao-north-site/client/src/pages/NotFound.tsx) | Página 404. |

### Seções (components/sections) — usadas pelo `Service`

| Arquivo | Conteúdo |
| --- | --- |
| [`HeroSection.tsx`](leao-north-site/client/src/components/sections/HeroSection.tsx) | Hero assimétrico: badge, título, CTAs (WhatsApp + scroll), estatísticas, imagem com clip-path diagonal |
| [`AboutSection.tsx`](leao-north-site/client/src/components/sections/AboutSection.tsx) | "Quem Somos": imagem, badge 10+ anos, texto institucional, 4 destaques |
| [`MissionSection.tsx`](leao-north-site/client/src/components/sections/MissionSection.tsx) | 3 cards: Missão, Visão e Valores |
| [`ServicesSection.tsx`](leao-north-site/client/src/components/sections/ServicesSection.tsx) | Grid com 7 serviços + card CTA "Solicite um Orçamento" |
| [`PortfolioSection.tsx`](leao-north-site/client/src/components/sections/PortfolioSection.tsx) | Busca projetos via `api/portfolio.php`, galeria com lightbox |
| [`DifferentialsSection.tsx`](leao-north-site/client/src/components/sections/DifferentialsSection.tsx) | Lista vertical numerada (01–05) de diferenciais |
| [`SociosSection.tsx`](leao-north-site/client/src/components/sections/SociosSection.tsx) | **2 cards de sócios** (Igor Busquim de Moraes — Diretor Executivo; Rafael — Diretor Técnico; fotos em `/uploads/`). Botão "Falar com [Nome]" abre um **mini-formulário** que envia `POST` para `api/contato.php` com **`tipo_mensagem: "socio"`** |
| [`TestimonialsSection.tsx`](leao-north-site/client/src/components/sections/TestimonialsSection.tsx) | Busca depoimentos via `api/depoimentos.php`, calcula média de estrelas; se vazio, fica oculta |
| [`ContactSection.tsx`](leao-north-site/client/src/components/sections/ContactSection.tsx) | Info de contato, CTA WhatsApp, formulário de orçamento (`POST api/contato.php`) e mapa (iframe) |

> **Padrão comum nas seções:** cada seção usa `IntersectionObserver` para aplicar `.reveal`
> (fade-up com stagger), definido no [`index.css`](leao-north-site/client/src/index.css).
> A página Materiais **não** usa scroll reveal nos cards (renderização direta).

### Componentes compartilhados

- [`Navbar.tsx`](leao-north-site/client/src/components/Navbar.tsx) — fixa, ganha blur ao rolar,
  menu mobile hambúrguer, links âncora (Início, Sobre, Serviços, Portfólio, **Sócios**, Depoimentos,
  Contato). **Agora aceita a prop `variant?: "dark" | "light"`** (default `dark`): a variante `light`
  usa textos escuros, fundo branco com blur ao rolar e acentos dourados mais escuros (`#B8860B`) —
  usada na página Materiais.
- [`Footer.tsx`](leao-north-site/client/src/components/Footer.tsx) — rodapé escuro com colunas de
  marca, links, serviços e contato. Mantido escuro em todas as páginas (inclusive na Materiais).
- [`WhatsAppButton.tsx`](leao-north-site/client/src/components/WhatsAppButton.tsx) — botão flutuante
  verde com pulso, link `https://wa.me/5543999190467`.
- [`ErrorBoundary.tsx`](leao-north-site/client/src/components/ErrorBoundary.tsx) — captura erros e
  mostra tela com stack + "Reload Page".
- [`Map.tsx`](leao-north-site/client/src/components/Map.tsx) e
  [`ManusDialog.tsx`](leao-north-site/client/src/components/ManusDialog.tsx) — do template; **não
  usados** no fluxo atual.
- [`components/ui/`](leao-north-site/client/src/components/ui/) — biblioteca **shadcn/ui** padrão
  (~50 componentes). A landing usa classes Tailwind próprias; o admin usa componentes simples.

### Admin

- [`client/src/pages/admin/Login.tsx`](leao-north-site/client/src/pages/admin/Login.tsx) — tela de
  login. Envia `POST` para `api/admin/login.php`; em sucesso salva `admin_token` no `localStorage`.
- [`client/src/pages/admin/Dashboard.tsx`](leao-north-site/client/src/pages/admin/Dashboard.tsx) —
  painel com **sidebar** e 4 abas:
  - **Portfólio:** upload (título, categoria, tamanho, imagem) → `upload.php`; lista + excluir → `delete.php`.
  - **Catálogo de Produtos:** formulário (nome, especificação, categoria, imagem) → `add_produto.php`;
    grade de produtos com exclusão → `delete_produto.php`.
  - **Caixa de Entrada:** tabela de mensagens → `mensagens.php`, com **badge de `tipo_mensagem`**
    (Service = dourado, Materiais = azul, Sócio = roxo) também presente no modal de leitura.
  - **Depoimentos:** criar/editar (add/edit) e excluir → `delete_depoimento.php`.
  - Redireciona para `/admin` se não existir `admin_token`.

### Contextos, hooks e utilitários

- [`contexts/ThemeContext.tsx`](leao-north-site/client/src/contexts/ThemeContext.tsx) — provider de
  tema (app usa `defaultTheme="dark"`; não é `switchable`). O tema claro da página Materiais é
  aplicado **localmente** via classes, sem alterar o provider global.
- [`hooks/useScrollReveal.ts`](leao-north-site/client/src/hooks/useScrollReveal.ts) — hook de reveal
  ao rolar (as seções implementam a lógica inline com `IntersectionObserver`).
- [`hooks/useComposition.ts`](leao-north-site/client/src/hooks/useComposition.ts),
  [`hooks/useMobile.tsx`](leao-north-site/client/src/hooks/useMobile.tsx),
  [`hooks/usePersistFn.ts`](leao-north-site/client/src/hooks/usePersistFn.ts) — utilitários do template.
- [`lib/utils.ts`](leao-north-site/client/src/lib/utils.ts) — exporta `cn()`.

### Design system (`client/src/index.css`)

- Paleta **"Tech Engineering Dark Gold"**: preto `#080808` + dourado `#F0B429` + branco.
- Tokens via `oklch` (`--primary`, `--gold`, etc.); utilitários customizados: `.text-gold-gradient`,
  `.gold-glow`, `.reveal`, `.service-card`, `.navbar-scrolled`, `.wa-pulse`, `.stagger-children`.
- Tipografia: `Barlow Condensed` (títulos) e `DM Sans` (corpo).
- O **tema claro** da página Materiais usa classes do Tailwind (ex.: `bg-slate-50`, `text-slate-900`)
  diretamente, mantendo os destaques no dourado da marca.

### Fontes e SEO (`client/index.html`)

- `lang="pt-BR"`, título "Leão North — Instalações Elétricas e Engenharia Elétrica", meta tags de
  SEO/OG e link canônico `https://leaonorth.com.br`.
- Google Fonts: `Barlow+Condensed` e `DM+Sans`.

---

## 7. Banco de Dados — Database `leao_north`

O schema não está versionado em SQL no repositório (é criado manualmente no phpMyAdmin/XAMPP; há a
referência DDL nos documentos de planejamento em `zoo_code_docs/`).

| Tabela | Colunas | Usada por |
| --- | --- | --- |
| `contatos` | `id`, `nome`, `telefone`, `email`, `servico`, `mensagem`, **`tipo_mensagem`** (ENUM `service`/`materiais`/`socio`, default `service`), `data_envio` | `contato.php` (insert), `mensagens.php` (select) |
| `portfolio` | `id`, `img`, `title`, `category`, `size` | `portfolio.php` (select), `upload.php` (insert), `delete.php` (delete) |
| `depoimentos` | `id`, `nome`, `estrelas`, `texto` | `depoimentos.php` (select), `add_depoimento.php`/`edit_depoimento.php` (insert/update), `delete_depoimento.php` (delete) |
| `produtos` | `id`, `nome`, `especificacao`, `categoria`, `imagem`, `data_cadastro` (TIMESTAMP default CURRENT_TIMESTAMP) | `produtos.php` (select), `add_produto.php` (insert), `delete_produto.php` (delete) |
| `admin_users` | `id`, `email`, `password` | `login.php` (select + `password_verify`) |

> **Nota:** a senha do admin deve ser gerada com `password_hash()` (ex.: `password_hash('123456',
> PASSWORD_DEFAULT)`). Não há script de seed no repo. A coluna `tipo_mensagem` e a tabela `produtos`
> foram adicionadas na Fase 1 (DDL documentado em `zoo_code_docs/fase1_arquitetura.md`).

---

## 8. Como Rodar Localmente (XAMPP)

1. **Apache + MySQL** do XAMPP ligados.
2. Criar o banco `leao_north` e as tabelas da §7 (no phpMyAdmin), incluindo a coluna
   `tipo_mensagem` em `contatos` e a tabela `produtos`.
3. Colocar o projeto em `C:\xampp\htdocs\leaonorth` (já é a raiz do workspace).
4. A API PHP fica em `http://localhost/leaonorth/api/...` (testar no navegador).
5. Frontend:
   ```bash
   cd leao-north-site
   pnpm install   # ou npm install
   pnpm dev       # sobe o Vite em http://localhost:3000
   ```
   > O frontend **não funciona sozinho** sem a API: portfólio, depoimentos, produtos e formulários
   > dependem de `http://localhost/leaonorth/api/...`.
6. **Rotas:** `/` (Gateway) → escolha Service (`/service`) ou Materiais (`/materiais`). Painel admin
   em `/admin` (é preciso um registro em `admin_users` com senha `password_hash`-ada).

### Scripts do frontend (package.json)

- `pnpm dev` — Vite dev server (`--host`)
- `pnpm build` — `vite build` + bundle do `server/index.ts` via esbuild
- `pnpm start` — roda o servidor Express de produção (`node dist/index.js`)
- `pnpm check` — `tsc --noEmit`
- `pnpm format` — Prettier

---

## 9. Arquivos que Fazem Parte do Template (NÃO usar/editar sem necessidade)

- [`leao-north-site/server/index.ts`](leao-north-site/server/index.ts) — servidor Express placeholder
  (serve estáticos; o site real usa Apache + PHP).
- [`leao-north-site/shared/const.ts`](leao-north-site/shared/const.ts) — constantes placeholder.
- [`leao-north-site/client/src/const.ts`](leao-north-site/client/src/const.ts) — função `getLoginUrl()`
  para OAuth da Manus (não usado).
- [`leao-north-site/client/src/components/Map.tsx`](leao-north-site/client/src/components/Map.tsx) e
  [`ManusDialog.tsx`](leao-north-site/client/src/components/ManusDialog.tsx) — não usados.
- [`leao-north-site/client/public/__manus__/debug-collector.js`](leao-north-site/client/public/__manus__/debug-collector.js)
  — script de debug (infraestrutura de desenvolvimento).
- [`leao-north-site/patches/wouter@3.7.1.patch`](leao-north-site/patches/wouter@3.7.1.patch) — patch
  que registra as rotas do wouter em `window.__WOUTER_ROUTES__` (dev tooling).
- [`leao-north-site/template.json`](leao-north-site/template.json) e
  [`leao-north-site/README.md`](leao-north-site/README.md) — manifest/readme do template.
- [`leao-north-site/ideas.md`](leao-north-site/ideas.md) — brainstorm de design (histórico).

---

## 10. ⚠️ Pontos de Atenção (deixar claro para quem for trabalhar no projeto)

1. **URLs hardcoded:** o frontend contém `http://localhost/leaonorth/...` fixo em vários arquivos
   (`PortfolioSection`, `TestimonialsSection`, `ContactSection`, `SociosSection`, `Materiais`,
   `Login`, `Dashboard`). Em produção isso precisaria apontar para `https://leaonorth.com.br`.
2. **Autenticação client-side apenas:** o `admin_token` não é validado no backend; qualquer endpoint
   admin pode ser chamado sem token. Recomendado implementar verificação de token/sessão no PHP.
3. **Design por frente de negócio:** Service é **escuro** (`#080808` + dourado) e Materiais é
   **claro** (`bg-slate-50` + dourado). Mantenha consistência: use os tokens do
   [`index.css`](leao-north-site/client/src/index.css) e as fontes Barlow Condensed/DM Sans.
4. **Navbar com variante:** a `Navbar` aceita `variant="dark"` (padrão) e `variant="light"` (usada
   na página Materiais). Ao adicionar páginas novas, escolha a variante coerente com o fundo.
5. **Credenciais do banco hardcoded** em todos os PHP (root/senha vazia) — padrão local XAMPP.
6. **Upload de arquivos:** o caminho `../../uploads/` é relativo à pasta `api/admin/`, resolvendo
   para `leaonorth/uploads/` (raiz do site). `add_produto.php` valida MIME/5MB; o `upload.php` do
   portfólio ainda não valida no servidor.
7. **`tipo_mensagem`:** `contato.php` grava o valor com whitelist; o painel exibe badges (Service
   dourado, Materiais azul, Sócio roxo). Ao adicionar novas origens, atualizar o ENUM, o `contato.php`
   e a config de badges no `Dashboard.tsx`.
8. **Documentação por fases:** os planejamentos das Fases 1–5 estão em
   [`zoo_code_docs/`](zoo_code_docs/) (`fase1_arquitetura.md` ... `fase5_gateway.md`).
9. **Sem teste automatizado** no projeto (apenas `tsc --noEmit` via `pnpm check`).

# CONTEXT — Leão North (Instalações Elétricas + Materiais)

> **Para quem é este documento:** outra IA (ou desenvolvedor) que receber acesso a este projeto
> precisa entender, em poucos minutos, **o que** o aplicativo faz, **como** está arquitetado,
> **como funciona** e **o que há em cada arquivo**.

---

## 1. Visão Geral do Aplicativo

A **Leão North** é uma empresa de engenharia elétrica com sede em **Cornélio Procópio - PR**
(R. Paraíba, 830 - Centro). O domínio principal atende **duas frentes de negócio** no mesmo SPA
(conceito "Yin-Yang"):

1. **Leão North Service** — serviços elétricos (tema escuro). Apresenta a empresa, serviços,
   portfólio, depoimentos, sócios e formulário de orçamento.
2. **Leão North Materiais** — catálogo de produtos elétricos para venda casada (tema claro).
   Produtos com **múltiplas imagens** (com capa), descrição longa e informações adicionais
   (chave/valor). O interesse é encaminhado via WhatsApp e há uma **página de detalhes** por produto
   com galeria, zoom ("lupa") e CTA de venda.

A experiência começa no **Portal Gateway** (split-screen), onde o visitante escolhe entre
**Service** e **Materiais**. Há também o **Painel Administrativo** (`/admin`), que permite gerenciar
portfólio, **produtos (criar, editar, excluir)**, mensagens e depoimentos.

O site é um **SPA em React** que roda na pasta do **XAMPP** (`c:/xampp/htdocs/leaonorth`) e conversa
com uma **API em PHP** servida pelo Apache do XAMPP, persistindo dados em **MySQL**.

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
| --- | --- |
| Frontend | React 19 + TypeScript + Vite 7 |
| Estilo | Tailwind CSS 4 + shadcn/ui (Radix UI) + tw-animate-css |
| Roteamento | Wouter 3 (client-side routing; rotas dinâmicas `/materiais/:id`) |
| Animações | CSS + IntersectionObserver (scroll reveal) + tw-animate-css (Gateway) + zoom CSS (transform-origin) |
| Backend | PHP 8 (PDO/MySQL) servido pelo Apache do XAMPP |
| Banco de dados | MySQL — database `leao_north` |
| Upload de imagens | PHP `move_uploaded_file` → pasta `uploads/` (validação MIME real via `finfo` + 5MB) |
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
        D[Produto Detalhes]
        E[Admin panel]
    end

    subgraph XAMPP Apache :80
        F[API PHP /api]
        G[uploads/ imagens]
    end

    subgraph MySQL
        H[(leao_north<br/>contatos portfolio depoimentos produtos admin_users<br/>produto_imagens produto_informacoes)]
    end

    A -->|escolha da frente| B
    A -->|escolha da frente| C
    C -->|detalhes /materiais/id| D
    B -->|fetch JSON| F
    C -->|fetch produtos| F
    D -->|fetch produtos| F
    E -->|CRUD| F
    F --> H
    F -->|grava/remove arquivos| G
    B -->|img src /uploads| G
    C -->|img src /uploads| G
    D -->|img src /uploads| G
```

### Fluxo de dados principal

1. O usuário acessa `/` → o **Portal Gateway** exibe as duas frentes (Service escuro / Materiais claro).
2. Escolhe **Service** (`/service`): landing compõe Hero, About, Mission, Services, Portfolio,
   Differentials, **Sócios**, Testimonials e Contact. Seções dinâmicas (Portfólio, Depoimentos)
   buscam dados via `fetch` para a API PHP.
3. Escolhe **Materiais** (`/materiais`): catálogo claro consumindo `api/produtos.php`, com cards de
   **mini-carrossel**, filtro por categoria e botões "Mais Detalhes" e "Tenho Interesse" (WhatsApp).
4. Clica em um produto → **`/materiais/:id`** (`ProdutoDetalhes.tsx`): galeria com zoom (lupa),
   descrição, informações adicionais e CTA "Tenho Interesse".
5. O visitante envia um formulário (orçamento, contato ou "falar com sócio") → `POST /api/contato.php`
   → grava em `contatos` com `tipo_mensagem` (service | materiais | socio) e tenta disparar e-mail
   para `contato@leaonorth.com.br`.
6. O administrador acessa `/admin` (login) → token no `localStorage` → `/admin/dashboard` para
   gerenciar portfólio, **produtos (criar/editar/excluir, múltiplas imagens + capa + informações)**,
   mensagens (com badges de origem) e depoimentos.

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
│   ├── produtos.php                ← GET: lista produtos (imagens[], informacoes[], descricao; 3 queries sem N+1)
│   └── admin/
│       ├── login.php               ← POST: autentica admin (password_verify)
│       ├── mensagens.php           ← GET: lista mensagens de contato (inclui tipo_mensagem)
│       ├── add_depoimento.php      ← POST: cria depoimento
│       ├── edit_depoimento.php     ← PUT: edita depoimento
│       ├── delete_depoimento.php   ← DELETE: remove depoimento
│       ├── upload.php              ← POST: upload de imagem + insere no portfólio
│       ├── delete.php              ← DELETE: remove projeto do portfólio
│       ├── add_produto.php         ← POST: cadastra produto (múltiplas imagens + capa + informações; MIME/5MB)
│       ├── edit_produto.php        ← POST: edita produto (imagens mantidas + novas; capa combinada)
│       └── delete_produto.php      ← DELETE: remove produto (CASCADE) + todas as imagens físicas
│
├── uploads/                        ← imagens (portfólio e produtos)
│
├── zoo_code_docs/                  ← documentação de planejamento das fases (fase1..fase10)
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
    │       ├── App.tsx             ← rotas (/, /service, /materiais, /materiais/:id, /admin, /admin/dashboard, /404)
    │       ├── index.css           ← design system (cores/tipografia/utilitários)
    │       ├── const.ts            ← constantes OAuth (não usado no fluxo atual)
    │       ├── pages/
    │       │   ├── Gateway.tsx     ← Portal Yin-Yang (escolha Service × Materiais)
    │       │   ├── Service.tsx     ← landing da Leão North Service (ex-Home)
    │       │   ├── Materiais.tsx   ← catálogo de produtos (tema claro, cards com mini-carrossel)
    │       │   ├── ProdutoDetalhes.tsx ← página de detalhes do produto (galeria + zoom/lupa)
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
| [`api/produtos.php`](api/produtos.php) | GET | Lista produtos com `descricao` e **arrays aninhados** `imagens[]` e `informacoes[]` (3 queries com `IN (ids)`, **sem N+1**); filtro opcional `?categoria=` | array JSON |
| [`api/admin/login.php`](api/admin/login.php) | POST | Busca usuário por e-mail em `admin_users`; confere senha com `password_verify` | `200` com `token` ou `401` |
| [`api/admin/mensagens.php`](api/admin/mensagens.php) | GET | Lista `contatos` **incluindo `tipo_mensagem`** (id, nome, telefone, email, servico, mensagem, tipo_mensagem, data_envio) | array JSON |
| [`api/admin/add_depoimento.php`](api/admin/add_depoimento.php) | POST | Insere em `depoimentos` (nome, estrelas, texto — texto opcional) | `200`/`500` |
| [`api/admin/edit_depoimento.php`](api/admin/edit_depoimento.php) | PUT | `UPDATE depoimentos SET nome, estrelas, texto WHERE id` | `200`/`400`/`500` |
| [`api/admin/delete_depoimento.php`](api/admin/delete_depoimento.php) | DELETE | `DELETE FROM depoimentos WHERE id` (id via query string) | `200`/`500` |
| [`api/admin/upload.php`](api/admin/upload.php) | POST | Recebe imagem (`$_FILES['image']`) + `title`/`category`/`size`; salva em `../../uploads/` com nome `time()_nome`; insere `img` (`/uploads/...`) no `portfolio` | `200`/`400`/`500` |
| [`api/admin/delete.php`](api/admin/delete.php) | DELETE | `DELETE FROM portfolio WHERE id` (id via query string) | `200`/`500` |
| [`api/admin/add_produto.php`](api/admin/add_produto.php) | POST | Cadastra produto (nome, especificacao, categoria, **descricao**) com **1 a 8 imagens** (`$_FILES['imagens']`), `capa_index`, `informacoes` (JSON) — tudo em **transação**, com MIME real (`finfo`) e limite **5MB** por imagem | `200`/`400`/`500` |
| [`api/admin/edit_produto.php`](api/admin/edit_produto.php) | POST | **Edita** produto (nome, especificacao, categoria, descricao); recebe `imagens_mantidas` (JSON de caminhos) + `novas_imagens` (`$_FILES`); exclui as removidas (banco + `unlink`), reordena mantidas e faz upload das novas; capa pela **lista combinada**; informações deletadas/reinseridas — em transação | `200`/`400`/`500` |
| [`api/admin/delete_produto.php`](api/admin/delete_produto.php) | DELETE | Resgata **todas** as imagens de `produto_imagens` antes do `DELETE FROM produtos` (FKs `ON DELETE CASCADE` removem filhas); faz `unlink` de todos os arquivos | `200`/`400`/`500` |

### Sobre o campo `tipo_mensagem`

- **`contato.php`**: aceita `tipo_mensagem` no payload JSON e valida com whitelist
  (`service`, `materiais`, `socio`); se ausente/inválido, usa `service`. A origem também é incluída
  no corpo do e-mail de notificação.
- **`mensagens.php`**: o `SELECT` retorna `tipo_mensagem` para o painel exibir o badge de origem.

### Observações de segurança/qualidade (importantes para quem for mexer)

- **Login "frouxo":** o token (`base64(id + time())`) é guardado apenas no `localStorage`; **nenhum
  endpoint de admin valida de fato esse token** no servidor. A "proteção" é client-side.
- **Injeção SQL:** todas as queries usam prepared statements (`bindParam`) — ok.
- **Upload:** `add_produto.php` e `edit_produto.php` validam **MIME real via `finfo`** e **5MB** por
  imagem; `upload.php` do portfólio continua sem validação no servidor (apenas `accept="image/*"`).
- **Conexão:** credenciais do banco hardcoded (padrão XAMPP: root/senha vazia).

---

## 6. Frontend React — Arquivos Principais

### Entrada e rotas

- [`client/src/main.tsx`](leao-north-site/client/src/main.tsx) — monta o `<App />` no `#root`.
- [`client/src/App.tsx`](leao-north-site/client/src/App.tsx) — define o `Router` (wouter `Switch`):
  - `/` → **`Gateway`** (Portal Yin-Yang)
  - `/service` → **`Service`**
  - `/materiais` → **`Materiais`**
  - `/materiais/:id` → **`ProdutoDetalhes`** (rota dinâmica)
  - `/admin` → `Login`
  - `/admin/dashboard` → `Dashboard`
  - qualquer outra → `NotFound`
  - Envolve tudo com `ErrorBoundary`, `ThemeProvider` (tema escuro) e `Toaster` (sonner).

### Páginas

| Página | Função |
| --- | --- |
| [`Gateway.tsx`](leao-north-site/client/src/pages/Gateway.tsx) | **Portal de escolha (Yin-Yang):** tela dividida em duas metades (lado a lado no desktop, empilhada no mobile). Lado esquerdo **Service** (fundo `#080808`, dourado, → `/service`) e lado direito **Materiais** (fundo claro `#F8FAFC`, dourado, → `/materiais`). Animações de entrada com `tw-animate-css` e hover com anel de brilho dourado + zoom. Não usa Navbar/Footer. |
| [`Service.tsx`](leao-north-site/client/src/pages/Service.tsx) | **Leão North Service** (ex-`Home`): compõe `Navbar` → `Hero` → `About` → `Mission` → `Services` → `Portfolio` → `Differentials` → **`SociosSection`** → `Testimonials` → `Contact` → `Footer` → `WhatsAppButton`. Fundo geral `#080808`. |
| [`Materiais.tsx`](leao-north-site/client/src/pages/Materiais.tsx) | **Leão North Materiais (tema claro):** Hero claro + **catálogo** consumindo `api/produtos.php`. Cards (`ProdutoCard`) com **mini-carrossel de imagens** (setas + contador, **capa no índice 0**) e dois botões: **"Mais Detalhes"** (`/materiais/:id`) e **"Tenho Interesse"** (WhatsApp `wa.me/5543999190467` citando o produto). Filtro por categoria (chips). Usa `<Navbar variant="light" />` e o `Footer` escuro (contraste). |
| [`ProdutoDetalhes.tsx`](leao-north-site/client/src/pages/ProdutoDetalhes.tsx) | **Detalhes do produto** (`/materiais/:id`): busca produto por `id` em `api/produtos.php`; **galeria** (foto principal + miniaturas + setas, capa por padrão) com **efeito de zoom "lupa"** (hover desktop: `scale(2)` + `transform-origin` no cursor, ícone `ZoomIn`); **descrição** com `whitespace-pre-line`; **informações adicionais** em tabela; **CTA gigante "Tenho Interesse"** (WhatsApp verde `#25D366`). |
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
  Contato). **Aceita a prop `variant?: "dark" | "light"`** (default `dark`): a variante `light` usa
  textos escuros, fundo branco com blur ao rolar e acentos dourados mais escuros (`#B8860B`) — usada
  nas páginas Materiais e ProdutoDetalhes.
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
  - **Catálogo de Produtos:** formulário rico (**modo Adicionar/Editar**) — múltiplas fotos com
    preview e **seletor de capa**, descrição longa e **informações adicionais dinâmicas**
    (título/texto). Envia `imagens[]`, `capa_index` e `informacoes` (JSON) para `add_produto.php`
    (ou `novas_imagens[]` + `imagens_mantidas` para `edit_produto.php`). Listagem com capa via
    `imagens.find(i => i.is_capa)`, botões **Editar** (`Pencil`) e **Excluir**.
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
| `produtos` | `id`, `nome`, `especificacao`, **`descricao`** (TEXT, Fase 6), `categoria`, `data_cadastro` (TIMESTAMP default CURRENT_TIMESTAMP) — **sem coluna `imagem`** | `produtos.php` (select), `add_produto.php`/`edit_produto.php` (insert/update), `delete_produto.php` (delete) |
| `produto_imagens` | `id`, `produto_id` (FK `ON DELETE CASCADE`), `caminho_imagem`, `is_capa` (TINYINT 0/1), `ordem` | `add_produto.php`/`edit_produto.php` (insert/update), `produtos.php` (select), `delete_produto.php` (delete) |
| `produto_informacoes` | `id`, `produto_id` (FK `ON DELETE CASCADE`), `titulo`, `texto` | `add_produto.php`/`edit_produto.php` (insert/delete), `produtos.php` (select) |
| `admin_users` | `id`, `email`, `password` | `login.php` (select + `password_verify`) |

> **Nota:** a senha do admin deve ser gerada com `password_hash()` (ex.: `password_hash('123456',
> PASSWORD_DEFAULT)`). Não há script de seed no repo. A coluna `tipo_mensagem` e a tabela `produtos`
> foram adicionadas na Fase 1; a coluna `descricao` e as tabelas `produto_imagens`/
> `produto_informacoes` na Fase 6 (DDLs documentados em `zoo_code_docs/`).

---

## 8. Como Rodar Localmente (XAMPP)

1. **Apache + MySQL** do XAMPP ligados.
2. Criar o banco `leao_north` e as tabelas da §7 (no phpMyAdmin): `contatos` (com `tipo_mensagem`),
   `portfolio`, `depoimentos`, `produtos` (com `descricao`), `produto_imagens`, `produto_informacoes`
   e `admin_users`.
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
6. **Rotas:** `/` (Gateway) → escolha Service (`/service`) ou Materiais (`/materiais`); detalhes de
   produto em `/materiais/:id`. Painel admin em `/admin` (é preciso um registro em `admin_users` com
   senha `password_hash`-ada).

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
   `ProdutoDetalhes`, `Login`, `Dashboard`). Em produção isso precisaria apontar para
   `https://leaonorth.com.br`.
2. **Autenticação client-side apenas:** o `admin_token` não é validado no backend; qualquer endpoint
   admin pode ser chamado sem token. Recomendado implementar verificação de token/sessão no PHP.
3. **Design por frente de negócio:** Service é **escuro** (`#080808` + dourado) e Materiais é
   **claro** (`bg-slate-50` + dourado). Mantenha consistência: use os tokens do
   [`index.css`](leao-north-site/client/src/index.css) e as fontes Barlow Condensed/DM Sans.
4. **Navbar com variante:** a `Navbar` aceita `variant="dark"` (padrão) e `variant="light"` (usada
   nas páginas Materiais e ProdutoDetalhes). Ao adicionar páginas novas, escolha a variante coerente
   com o fundo.
5. **Credenciais do banco hardcoded** em todos os PHP (root/senha vazia) — padrão local XAMPP.
6. **Upload de arquivos:** o caminho `../../uploads/` é relativo à pasta `api/admin/`, resolvendo
   para `leaonorth/uploads/` (raiz do site). `add_produto.php` e `edit_produto.php` validam MIME/5MB;
   o `upload.php` do portfólio ainda não valida no servidor.
7. **`tipo_mensagem`:** `contato.php` grava o valor com whitelist; o painel exibe badges (Service
   dourado, Materiais azul, Sócio roxo). Ao adicionar novas origens, atualizar o ENUM, o `contato.php`
   e a config de badges no `Dashboard.tsx`.
8. **Produtos complexos:** produtos usam **múltiplas imagens** em `produto_imagens` (capa via
   `is_capa`; `add`/`edit` enviam `imagens[]`/`novas_imagens[]` com colchetes no FormData) e
   **informações adicionais** em `produto_informacoes`. A coluna `imagem` da tabela `produtos` **não
   existe mais**. O `produtos.php` retorna `imagens[]` e `informacoes[]` aninhados (sem N+1).
9. **Zoom na página de detalhes:** o efeito de lupa (`scale(2)` + `transform-origin`) funciona
   apenas em **desktop (hover)** — no mobile, usa-se o gesto nativo de pinça.
10. **Documentação por fases:** os planejamentos das Fases 1–10 estão em
    [`zoo_code_docs/`](zoo_code_docs/) (`fase1_arquitetura.md` ... `fase10_zoom_imagem.md`).
11. **Sem teste automatizado** no projeto (apenas `tsc --noEmit` via `pnpm check`).

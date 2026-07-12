# Site Automotivo Premium (multi-página) — Marca fictícia

## Context

O usuário quer um site automotivo/tech premium em React + Tailwind, inspirado visualmente nas 8 referências anexadas (registro editorial estilo Porsche + registro tech/futurista estilo "Axon"), mas seguindo **estritamente o Design System fornecido** (quase monocromático preto/branco/cinza com um único acento azul `#5D7FA6`, tipografia grotesk neutra + display condensada uppercase com tracking largo, pills para ações, cards flat com borda sutil, muito respiro).

Decisões confirmadas com o usuário:
- **Marca fictícia própria** — vou criar nome e textos premium no estilo das refs. Marca: **AXIOM** (elétricos de performance / tech futurista).
- **Multi-página com rotas**: Home, Lineup, Configurador, Sobre/Time.

Estado atual do projeto: React 18 + Tailwind v4, `react-router` 7.13.0 já instalado, componentes Shadcn/Radix disponíveis em `src/app/components/ui/`, `motion` disponível. `src/app/App.tsx` está vazio. `theme.css` usa tokens OKLch genéricos e `fonts.css` está vazio. **Não há design system @make-kits** — construiremos os tokens do usuário sobre a base existente.

## Design tokens (aplicar antes do código)

1. **`src/styles/fonts.css`**: importar Google Fonts no topo — `Inter` (base grotesk neutra) e `Oswald` (display condensada, para headlines uppercase com tracking largo).
2. **`src/styles/theme.css`**: adicionar os tokens do usuário como CSS custom properties e mapeá-los em `@theme inline` para virarem utilitários Tailwind:
   - Cores: `--color-neutral-0/50/100/200/400/600/800/900`, `--color-brand-blue-500 (#5D7FA6)`, `--color-brand-blue-700 (#3E5A7C)`, `--color-ice-100 (#E6ECF2)`, semânticas `success/warning/error`.
   - Font families: `--font-sans: 'Inter'...`, `--font-display: 'Oswald'...`.
   - Radius: `--radius-pill: 999px`, manter `sm=8px`, `md=16px`.
   - Sombra suave `--shadow-soft: 0 8px 24px rgba(14,15,16,0.08)`.
   - Manter defaults de tipografia sem classes de tamanho/peso do Tailwind (respeitando regra do projeto); estilizar headings via `theme.css`/componentes.
   - NÃO usaremos dark mode (a paleta é clara/premium).

## Imagens

- Usar **Unsplash** (skill `unsplash`) para fotos de carros premium/EV em fundo neutro (silver/cinza), interiores e retratos de equipe (b&w/neutro como na ref 6).
- Renderizar sempre via `ImageWithFallback` (`src/app/components/figma/ImageWithFallback.tsx`), importando o binding — nunca string de caminho crua.

## Arquitetura de rotas

- **`src/app/App.tsx`**: monta `<BrowserRouter>` (ou `createBrowserRouter`) com layout compartilhado (Navbar + Footer + `<Outlet/>`). Seguir o padrão de react-router do ambiente Figma Make (verificar skill `react-router` na implementação).
- Rotas: `/` (Home), `/lineup`, `/configure`, `/about`.

## Componentes a criar (`src/app/components/`)

Compartilhados:
- `layout/Navbar.tsx` — barra fina translúcida, logo "AXIOM" em display condensada, links de rota, pill CTA preta ("Reservar"). Ativa link com acento azul.
- `layout/Footer.tsx` — footer minimalista com colunas + legal.
- `layout/PageContainer.tsx` — wrapper de grid 12col / margens generosas.
- `ui-primitives/PillButton.tsx` — wrapper sobre `ui/button` no estilo pill (primária preta / secundária outline).
- `ui-primitives/SpecBadge.tsx` — badge caption uppercase tracking largo.
- `ui-primitives/SectionHeading.tsx` — heading de seção (display) + kicker caption.
- `CarCard.tsx` — card flat com foto, nome, badges de features, preço e mini-specs (ref 3).

Home (`pages/Home.tsx`):
- Hero editorial "Timeless. Powerful. Unmistakable." estilo ref 1 (número de fundo grande em display, foto do carro centralizada, badge circular).
- Bloco "intelligent engineering" com cards de features (ref 2).
- Preview do lineup (carrossel curto → link p/ /lineup).
- Faixa CTA "Build your AXIOM" (ref 3 rodapé).
- Bloco de tecnologias (ref 5) + citação premium (ref 5 último).

Lineup (`pages/Lineup.tsx`):
- "Explore our lineup" com grid/carrossel de `CarCard` + setas de navegação (ref 3). Dados mock de 4–6 modelos.

Configurador (`pages/Configure.tsx`):
- Layout ref 4: painel esquerdo (Model, Exterior, Interior, Wheels, Performance, Technology com steppers), carro central grande com hotspots/badges flutuantes, seletor de cores (bolinhas), specs inferiores em cards, pill "Start configuration". Estado local em React para seleções (cor, opções) atualizando resumo/preço.

Sobre/Time (`pages/About.tsx`):
- Seção "About AXIOM" (ref 5) + "Our Team" grid de retratos com nome/cargo (ref 6) + citação.

## Dados mock

- `src/app/data/models.ts` — array de modelos (id, nome, tagline, preço, specs, features, imagem importada), reutilizado em Home/Lineup/Configure.
- `src/app/data/team.ts` — membros da equipe.

## Verificação

- O dev server do Figma Make já roda; NÃO rodar build/vite manualmente.
- Usar o preview surface para validar: navegação entre as 4 rotas, link ativo destacado, responsividade (desktop → mobile), configurador atualizando cor/opções/preço, imagens carregando via Unsplash/ImageWithFallback.
- Conferir aderência ao design system: paleta quase monocromática + único acento azul, pills nas ações, headings em display condensada uppercase, cards flat com borda `neutral-200`, respiro generoso.

## Notas

- Reusar componentes Shadcn de `ui/` (button, badge, carousel, tabs, separator) como base, estilizados com os tokens do DS — não recriar do zero.
- Sem violar copyright: nada de logos/nomes reais (Porsche/Axon); marca fictícia AXIOM.

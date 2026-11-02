# mova* — direção visual (nov/2026)

Referência da Gabi: o projeto **"Login Look Dashboard"** dela na Lovable
(`src/routes/index.tsx` e `src/styles.css`) e a imagem do login com a ilustração dela.
Pedido: "imite tudo, design tudo" — login e Visão geral iguais ao projeto, e as
demais abas no mesmo estilo.

## Paleta
| Papel | Cor | Tokens |
| --- | --- | --- |
| Tinta (cabeçalho, capa, bordas, sombras, texto) | `#0C0A0E` | `ink`, `vinho`, `tinta`, `px-line` |
| Texto claro sobre a tinta | `#F6F1E7` | `ink-fg` |
| Lavanda (aba ativa, botões, blocos) | `#C3AEEC` · `#DCD1F4` · `#EBE4FA` | `lavanda`, `rosa`, `queimado` |
| Sálvia (blocos, receitas) | `#A8CA96` · `#D2E5C8` · escuro `#376139` | `salvia`, `oliva` |
| Creme (blocos) | `#FAF1DF` | `px-gold-soft`, `pastel-yellow` |
| Vinho (saldo, foco da semana) | `#702335` | `cereja` |
| Fundo da página | `#F1EFF4` | `creme` |
| Cards | `#FEFCF7` | `quente`, `px-panel` |

## Princípios
- Cards: `rounded-3xl border-2 border-ink bg-quente shadow-pixel` (sombra sólida 4px 4px).
- Botão principal: pílula lavanda com borda de tinta; secundário: tinta; contorno: creme com borda.
- Fraunces (serifa) em títulos, números e logo; Figtree no texto.
- Cabeçalho tinta com abas em pílula; ícones claros; avatar sálvia.
- Ilustração da Gabi (`src/assets/gabi-login.webp`) no login e na capa.
- Sem cereja, pixel art, XP, nível ou linguagem de jogo.

## Peças
- `TopNav` / `Topbar` / `BottomNav` / `HeaderActions` — navegação (Configurações só no menu da conta).
- `components/home/HomeCards.tsx` — Visão geral (HeroCard, DateWeather, StatTiles, MyDayCard, WeekChart, FinanceCard, InProgress).
- `pages/Login.tsx` + `components/auth/AuthField.tsx` — login escuro com a ilustração.
- `components/finance/FinanceTop.tsx` — cartão escuro do saldo, próxima receita, resumo rápido.
- Primitivos em `components/ui/` (Card, Button, Chip/Segmented, Form, Modal, Progress, Checkbox, Icon).

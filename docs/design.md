# MOVA — direção visual (nov/2026)

Referências da Gabi: um dashboard com menu no topo e cards arredondados
(saudação, "Continue de onde parou", pilares, meu dia, evolução da semana,
meta principal) e a paleta "Deep Espresso / Petal Reverie / Ivory Hearth".
Pedido dela: **algo bem minimalista**, sem foto/ilustração e sem frase motivacional.

## Paleta
| Papel | Cor | Tokens |
| --- | --- | --- |
| Principal (texto, botões, gráficos, aba ativa, faixa "Meta principal") | Deep Espresso `#3E2723` | `vinho`, `cereja`, `tinta` |
| Destaque (cartão "Oi, Gabi!", botões secundários, área do gráfico) | Petal Reverie `#F4C9D6` | `rosa`, `lima`, `px-gold` |
| Fundo | Ivory Hearth `#F5F0E6` | `creme` |
| Cards | `#FFFDF9` com linha `#E8DFD0` | `quente`, `px-line` |
| Entradas / sucesso | verde suave `#6E8B6A` | `oliva` |

## Princípios
- Minimalista: só essas cores, sem gradientes, sem ilustrações, sem fotos, sem emojis decorativos.
- Cards marfim-claro com borda fina e quase nenhuma sombra; cantos de 24px.
- DM Sans em tudo; títulos em negrito, textos de apoio em espresso com transparência.
- Ícones de linha fina (lucide).
- Sem cereja, pixel art, XP, nível ou linguagem de jogo.

## Peças
- `TopNav` / `Topbar` / `BottomNav` / `HeaderActions` — navegação (Configurações só no menu da conta).
- `components/home/HomeCards.tsx` — Dashboard ("Oi, Gabi!", Continue de onde parou, Meus pilares, Meu dia, Evolução da semana, Meta principal).
- `components/finance/FinanceTop.tsx` — cartão do saldo, próxima receita, resumo rápido.
- Primitivos em `components/ui/` (Card, Button, Chip/Segmented, Form, Modal, Progress, Icon).

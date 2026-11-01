# MOVA — direção visual (nov/2026)

Referências da Gabi: a tela "Visão geral" do MOVA (menu no topo, saudação com a
ilustração, cards brancos) e dois apps de orçamento em tons pastel (cartão rosa
do saldo, "próxima receita", blocos coloridos de resumo, lembretes de contas).

## Princípios
- Limpo, suave e acolhedor: fundo lilás bem claro, cards brancos com cantos de
  20–28px, borda de 1px quase invisível e sombra leve.
- Uma cor principal (ameixa `#5B2448`) para botões, gráficos e aba ativa;
  pastéis só em blocos de resumo e destaques.
- DM Sans em tudo; títulos em negrito, números grandes e fortes.
- Ícones de linha fina (lucide); emojis só nos blocos pastel de Finanças.
- Sem cereja, pixel art, XP, nível ou linguagem de jogo.

## Peças
- `TopNav` / `Topbar` / `BottomNav` / `HeaderActions` — navegação.
- `components/home/HomeCards.tsx` — Visão geral.
- `components/finance/FinanceTop.tsx` — cartão do saldo, próxima receita, resumo rápido.
- Primitivos em `components/ui/` (Card, Button, Chip/Segmented, Form, Modal, Progress, Icon).

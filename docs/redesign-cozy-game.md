# Redesign "cozy game 2D" — plano de refatoração

Conceito: *minha vida transformada em um cozy game 2D*. Pixel art em personagem,
cenário, ícones, conquistas e decoração; interface moderna e legível para
textos, valores e formulários.

## 1. Análise do que existe (preservar)
- Dados e regras: `store/` (coleções persistidas), `hooks/useData.ts`,
  `hooks/useWork.ts`, `useVault()`, `useFocusTimer`, `lib/auth.ts`.
- Páginas: Início, Planejamento, Trabalho, Finanças, Sair de casa (cofre da
  mudança), Estudos, Leitura, Metas, Rotina, Notas, Perfil, Login.
- Formulários globais (`FormHost`/`openForm`), busca, notificações, toasts.
- Primitivos de UI usados por todas as telas: `Card`, `Button`, `Chip`,
  `Segmented`, `Modal`, `PageHeader`, `StatCard`, `Progress`, `Checkbox`.

## 2. Estratégia
1. **Tokens** (cores, bordas, sombras "pixel", tipografia, espaçamento,
   animações) em `tailwind.config.js` + variáveis CSS em `src/index.css`.
2. **Reestilizar os primitivos** → todas as telas ganham a linguagem de jogo
   sem reescrever regras de negócio. Aliases com nomes de jogo:
   `GameCard`, `PixelButton`, `GameModal`, `GameToast`.
3. **Camada de gamificação derivada dos dados reais** (`src/game/`):
   XP calculado a partir do que já existe (tarefas, sessões de foco, hábitos,
   páginas lidas, rolês, metas). Nada de "dinheiro de jogo"; valores
   continuam reais. Pontuação central em `src/game/config.ts`.
4. **Componentes de jogo**: `XPBar`, `LevelBadge`, `Achievement`, `Quest`,
   `DailyMission`, `CharacterScene`, `ProgressPanel`, `PixelIcon`,
   `ExplorationCard`, `GameWatcher` (toasts de XP, LEVEL UP, conquistas).
5. **Novas áreas** (sem remover nenhuma): Meu dia, Vida social, Saúde,
   Explorar (mapa estilo jogo + lugares), Minha cidade (bairros dos lugares
   cadastrados), Conquistas, Configurações (= Perfil), Modo foco.
   Lugares/experiências voltam do histórico do git (mesmas chaves de
   armazenamento, então dados antigos reaparecem).
6. **Layout**: sidebar escura de jogo com ícones pixel, nível/XP no topo do
   cenário e da sidebar; bottom nav mobile Início · Meu dia · ＋ · Explorar ·
   Perfil.

## 3. Decisões
- "Sair de casa" continua sendo o **cofre da mudança** (pedido anterior da
  Gabi). "Explorar" é a área nova de lugares/rolês.
- Trabalho, Sair de casa e Notas continuam no menu, além dos itens novos.
- Sem fonte pixel em textos longos, valores ou formulários.

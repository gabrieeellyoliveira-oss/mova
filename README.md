# MOVA 🍒

> Mais movimento, mais vida.

Dashboard pessoal para organizar finanças, estudos, leituras, rotina, metas e — principalmente — sair de casa e viver experiências novas.

## Rodando

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # build de produção em dist/
npm run build:single # um único index.html autocontido em dist-single/
```

## Stack

React 18 · TypeScript · Modak (títulos) + DM Sans (interface) · Tailwind CSS · Lucide · Recharts · React Router (HashRouter) · LocalStorage.

Os componentes de UI (`src/components/ui`) seguem a ideia do shadcn/ui — primitivos pequenos e editáveis — mas foram escritos à mão para carregar a identidade do MOVA.

## Estrutura

```
src/
  assets/       ilustração da Gabi + gata, avatar
  components/
    ui/         Button, Card, Modal, Form, Chip, Progress, Checkbox…
    layout/     Sidebar, Topbar, BottomNav (mobile), busca global, toasts
    widgets/    widgets da Home (independentes e reutilizáveis)
    modals/     formulários globais (tarefa, gasto, compromisso, lugar, livro, nota)
    calendar/ tasks/ finance/ places/ studies/ books/ goals/ habits/ planner/
    doodles/    SVGs desenhados à mão (cereja, flor, coração, xícara…)
  pages/        uma página por módulo
  hooks/        leitura de dados, seletores, toasts, timer de foco, busca
  store/        stores reativos + coleções (CRUD genérico)
  lib/storage.ts  adapter de persistência (LocalStorage hoje)
  data/         constantes (categorias, cores) e dados iniciais
  types/        tipos de domínio
  utils/        datas, formatação, imagens
```

## Persistência e migração para Supabase

Toda leitura/escrita passa por um `StorageAdapter` (`src/lib/storage.ts`) com `load / save / remove / keys`.
As coleções (`src/store/db.ts`) usam esse adapter através de `createCollection`, que expõe `add / update / remove / replaceAll`.

Para trocar por Supabase:

1. Crie uma tabela por coleção (ou uma `collections(key text, value jsonb, user_id uuid)`).
2. Implemente um `supabaseAdapter` (carregando o estado inicial no boot e gravando em `save`), ou troque
   `createCollection` por uma versão que chame `insert/update/delete` do Supabase.
3. Troque `activeAdapter` em `src/lib/storage.ts`.

Páginas e componentes só usam os hooks de `src/hooks/useData.ts` e as ações de `db`, então não precisam mudar.

## Dados

Na primeira execução o MOVA abre com dados de exemplo (relativos à data de hoje). Em **Perfil** dá para exportar/importar backup em JSON ou restaurar os exemplos.

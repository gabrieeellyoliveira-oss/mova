-- MOVA · estrutura do banco no Supabase
-- Cole tudo no Supabase → SQL Editor → New query → Run. Pode rodar mais de uma vez.

-- Cada chave do MOVA (tarefas, metas, finanças, projetos…) vira uma linha por usuária.
create table if not exists public.mova_store (
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  key        text        not null,
  value      jsonb       not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

-- Segurança: cada pessoa só enxerga e altera os próprios dados.
alter table public.mova_store enable row level security;

drop policy if exists "mova_store: ler os próprios dados" on public.mova_store;
create policy "mova_store: ler os próprios dados" on public.mova_store
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "mova_store: criar os próprios dados" on public.mova_store;
create policy "mova_store: criar os próprios dados" on public.mova_store
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "mova_store: atualizar os próprios dados" on public.mova_store;
create policy "mova_store: atualizar os próprios dados" on public.mova_store
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "mova_store: apagar os próprios dados" on public.mova_store;
create policy "mova_store: apagar os próprios dados" on public.mova_store
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Tempo real: mudança feita no celular aparece no computador na hora.
do $$
begin
  alter publication supabase_realtime add table public.mova_store;
exception when duplicate_object then null;
end $$;

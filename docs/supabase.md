# Ligando o Supabase no MOVA

O código já está pronto: sem as variáveis abaixo o MOVA funciona só no navegador
(como antes); com elas, o login vira Supabase Auth e os dados sincronizam na nuvem.

## 1. Criar o projeto
1. Entre em https://supabase.com (pode usar a conta do GitHub) → **New project**.
2. Nome: `mova` · Região: **South America (São Paulo)** · crie uma senha do banco e guarde (não precisa mandar para ninguém).

## 2. Criar a tabela
**SQL Editor → New query**, cole o conteúdo de `supabase/schema.sql` e clique em **Run**.
Ele cria a tabela `mova_store`, as regras de segurança (cada pessoa só vê os próprios dados)
e liga o tempo real.

## 3. Endereços do site
**Authentication → URL Configuration**
- Site URL: `https://mova-eosin.vercel.app`
- Redirect URLs: `https://mova-eosin.vercel.app/**`

(Opcional) **Authentication → Sign In / Providers → Email → Confirm email**: ligado pede
confirmação por e-mail no cadastro; desligado entra direto.

## 4. Chaves públicas
**Project Settings → API Keys / Data API**: copie a **Project URL** e a chave **anon / publishable**.
Elas viram as variáveis da Vercel (Production, Preview e Development):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Nunca use a chave `service_role` / `secret` no site.

## 5. Primeiro acesso
Depois do novo deploy, abra o MOVA **no navegador onde seus dados já estão** e use
"Novo jogo" com seu e-mail. Na primeira entrada, tudo que está nesse navegador sobe
para a nuvem. Nos outros aparelhos é só "Continuar jogo" com o mesmo e-mail.

(Opcional) Depois de criar sua conta: **Authentication → Sign In / Providers → Allow new users to sign up** desligado, para ninguém mais criar acesso no seu MOVA.

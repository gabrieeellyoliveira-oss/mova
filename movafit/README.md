# movafit*

App de treino em casa da família **mova**: registrar os treinos feitos (nome, foco, duração,
intensidade, como me senti, link do vídeo e anotações), ver a semana, a sequência de dias e o
histórico do mês num calendário.

- **Mesma conta e mesmo Supabase do mova.** Os dados ficam na tabela `mova_store` com o prefixo
  `fit:` (ex.: `fit:workouts`, `fit:settings`), protegidos pelas mesmas regras (RLS). O mova
  ignora as linhas `fit:*` e o MOVAFIT só lê as suas. Não precisa rodar nenhum SQL novo.
- Mesmo visual do mova (tokens em `tailwind.config.js`, Fraunces + Figtree).
- Abre na hora e funciona sem internet (lê do navegador e sobe as mudanças depois).
- Instalável no celular: no Safari/Chrome, "Adicionar à tela de início".

## Rodar

```bash
cd movafit
npm install
cp .env.example .env.local   # URL e chave anon do Supabase do mova
npm run dev
```

## Publicação

Projeto `movafit` na Vercel com **Root Directory = `movafit`**, ligado a este repositório:
cada push na `main` publica. Variáveis: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (as mesmas do mova).

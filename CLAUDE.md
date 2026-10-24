# MOVA — instruções para o Claude

## Publicação
- A Gabi autorizou publicar sem pedir confirmação: depois de testar, faça commit e push direto na `main`. A Vercel (projeto `mova`, time `gabrieeellyoliveira-8364s-projects`) publica automaticamente em https://mova-eosin.vercel.app.
- Antes de enviar: `npx tsc -b` e `npm run build` sem erros, e confira as telas afetadas no navegador (desktop e 390px).
- Depois de enviar, acompanhe o deploy na Vercel e confirme que ficou `READY`.

## Identidade visual
- Siga à risca o prompt original e as imagens de referência da Gabi; não invente elementos, cores ou textos.
- Tipografia: a Sooky 70s (`src/assets/fonts`, comercial) é usada **somente no logo MOVA** (`font-logo`). Todo o resto — títulos, atalhos, cards, banner — usa DM Sans, a mesma fonte do menu (`font-display`/`font-heading` apontam para ela).

## Módulos
- **Sair de casa** = sair da casa dos pais (mudança), **não** rolês. A aba `/sair-de-casa` é um cofre: depósitos/retiradas (`db.vaultEntries`), custos da mudança cuja soma é a meta (`db.vaultCosts`), data desejada (`vaultSettingsStore`). Cálculos em `useVault()` (`src/hooks/useData.ts`).
- **Trabalho** (`/trabalho`): meta do mês e evolução. Meta por mês (`db.workGoals`, herda a do mês anterior se não houver), resultados diários (`db.workEntries`), o que é medido/unidade/dias úteis em `workSettingsStore`. Cálculos (ritmo esperado, projeção, quanto fazer por dia útil, histórico) em `useWork()` (`src/hooks/useWork.ts`).
- **Login** (`src/pages/Login.tsx`, `src/lib/auth.ts`): acesso local ao navegador (e-mail + hash SHA-256 com sal no localStorage; sessão em session/localStorage conforme "Lembrar de mim"). Não é conta online — ao ligar o Supabase, trocar por Supabase Auth. Ilustração animada em camadas em `src/components/auth/LoginArt.tsx` (`src/assets/login`: anel externo gira, centro parado).

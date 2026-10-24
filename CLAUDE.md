# MOVA — instruções para o Claude

## Publicação
- A Gabi autorizou publicar sem pedir confirmação: depois de testar, faça commit e push direto na `main`. A Vercel (projeto `mova`, time `gabrieeellyoliveira-8364s-projects`) publica automaticamente em https://mova-eosin.vercel.app.
- Antes de enviar: `npx tsc -b` e `npm run build` sem erros, e confira as telas afetadas no navegador (desktop e 390px).
- Depois de enviar, acompanhe o deploy na Vercel e confirme que ficou `READY`.

## Identidade visual
- Siga à risca o prompt original e as imagens de referência da Gabi; não invente elementos, cores ou textos.
- Tipografia: a Sooky 70s (`src/assets/fonts`, comercial) é usada **somente no logo MOVA** (`font-logo`). Todo o resto — títulos, atalhos, cards, banner — usa DM Sans, a mesma fonte do menu (`font-display`/`font-heading` apontam para ela).

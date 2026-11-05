# Método Barron

Um site só. O app Next.js em [`members/`](members/) serve a página de vendas e a área de membros.

Produção: deploy desse diretório na **Vercel** (Root Directory `members`) e DNS de `metodobarron.com` apontando para a Vercel. O GitHub Pages não é mais o host do marketing. Os HTML na raiz (`index.html`, `afiliados.html`, `obrigado.html`, `privacidade.html`, `termos.html`, `404.html`) ficam como referência; as rotas vivas estão no app.

Detalhes de ambiente, Stripe e rotas: [members/README.md](members/README.md).

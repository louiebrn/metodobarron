# Área de membros — Método Barron

App Next.js da área de membros. O site de marketing continua estático na raiz do repositório (GitHub Pages em `metodobarron.com`). Este diretório é publicado à parte, no subdomínio `membros.metodobarron.com`.

A interface está em português do Brasil. Em desenvolvimento (`npm run dev`) o app abre em **modo demonstração**, sem chave secreta da Stripe.

## O que já funciona

- Conta com e-mail, senha e nome de usuário único.
- Os 8 módulos do site (do choque de realidade ao plano de 30 dias).
- Quiz (10 pontos) e prática (5 pontos), uma vez por módulo em cada mês.
- Ranking mensal e pódio do sorteio (top 3).
- Webhook da Stripe que liga ou corta o acesso. Sem segredo, um token de demonstração faz o mesmo papel.

Vídeos das aulas ainda são placeholder (“vídeo em breve”).

## Rodar localmente

Requisito: Node.js 22.

```bash
cd members
npm install
npm run dev
```

Abra http://localhost:3000. Não precisa de `.env` para ver a interface.

1. Crie uma conta em **Criar conta**.
2. Os módulos nascem bloqueados.
3. Em **Conta**, use **Ligar acesso de demonstração**.
4. Abra um módulo, acerte o quiz e registre a prática.
5. Em **Ranking**, **Carregar exemplos** coloca quatro alunos fictícios no mês.

Comandos úteis:

```bash
npm test
npm run typecheck
npm run build
```

O banco SQLite é criado em `members/data/members.db` (não vai para o git).

## Variáveis de ambiente

Copie `.env.example` para `.env.local` só se for mudar algum padrão.

| Variável | Obrigatória para vender | Função |
| --- | --- | --- |
| `DATABASE_PATH` | Não | Caminho do SQLite. Padrão `./data/members.db`. |
| `APP_URL` | Sim, em produção | URL pública deste app. Padrão `http://localhost:3000`. Usada na volta do portal da Stripe. |
| `MARKETING_URL` | Não | Link “voltar ao site”. Padrão `https://metodobarron.com`. |
| `DEMO_MODE` | Sim, `false` em produção | Liga o botão de acesso falso e o webhook sem assinatura. Se ficar vazio: ligado no `next dev` quando não há `STRIPE_WEBHOOK_SECRET`; desligado com `NODE_ENV=production`. |
| `DEMO_WEBHOOK_TOKEN` | Não | Bearer do webhook de demonstração. Padrão `demo-local`. |
| `STRIPE_PAYMENT_LINK_URL` | Não | Payment Link já no ar. Padrão `https://buy.stripe.com/cNi6oG8sBewcaWk7tldfG01`. |
| `STRIPE_PAYMENT_LINK_ID` | Não | `plink_1UYTL9COW8xQ7IOjQ0gliHvp`. Só documentação. |
| `STRIPE_SECRET_KEY` | Sim, para o portal criado pelo app | Chave secreta **live**. Nunca commitar. |
| `STRIPE_WEBHOOK_SECRET` | Sim, em produção | Segredo do endpoint (`whsec_...`). |
| `STRIPE_CUSTOMER_PORTAL_LOGIN_URL` | Alternativa à chave secreta | Link de login do portal, se você não quiser que o app chame a API. |

`DEMO_MODE=false` sem as chaves da Stripe: a interface continua no ar, mas os módulos só abrem quando um webhook de verdade marcar a assinatura como ativa.

## Pontos

| Atividade | Pontos | Limite |
| --- | --- | --- |
| Quiz do módulo (resposta certa) | 10 | 1 vez por módulo por mês |
| Prática (três itens marcados) | 5 | 1 vez por módulo por mês |

- Resposta errada não tira ponto e pode ser refeita.
- Máximo no mês: 8 × 10 + 8 × 5 = **120 pontos**.
- O mês é o calendário de **America/Sao_Paulo** (Brasília, sem horário de verão). Às 00:00 do dia 1º o placar daquele mês para de receber pontos novos; o histórico do mês anterior continua no banco, o ranking da tela mostra só o mês corrente.
- Concluir o quiz também marca o módulo como estudado (isso não zera no mês seguinte). Os pontos, sim.

Quem não tem assinatura ativa não ganha pontos. Status com acesso: `active` e `trialing`, e só se `current_period_end` ainda não passou. `past_due`, `canceled`, `unpaid`, `incomplete`, `paused` e `inactive` bloqueiam os módulos.

## Sorteio: como sai o top 3

Entram só quem tem **pontos > 0** no mês. A ordem é:

1. Mais pontos primeiro.
2. Empate na pontuação: fica na frente quem **alcançou aquele total antes** (`score_reached_at` — atualizado só quando os pontos sobem).
3. Se o instante também empatar: ordem alfabética do nome de usuário (`pt-BR`).

Os três primeiros dessa lista são os ganhadores do mês. O prêmio na tela é o placeholder **“a definir”**. Menos de três pessoas com ponto: o pódio fica com quem tiver pontos; não se inventa ganhador.

Alunos de exemplo (`@ana_trades`, `@leo_simulador`, `@bia_risco`, `@marina_plano`) só existem se alguém clicar em **Carregar exemplos** no modo demonstração. Não dá para entrar com essas contas.

## Stripe

Payment Link já existente (conta live, R$97/mês):

- URL: `https://buy.stripe.com/cNi6oG8sBewcaWk7tldfG01`
- ID: `plink_1UYTL9COW8xQ7IOjQ0gliHvp`

Fluxo combinado: a pessoa **paga primeiro** e **depois cria a conta** com o **mesmo e-mail** do checkout. O webhook grava a assinatura por e-mail; quando a conta nasce, o acesso cola nela. Quem já tem conta e assina de novo pelo botão do app manda `client_reference_id` (id do usuário) e `prefilled_email`.

### Webhook

Endpoint: `POST https://membros.metodobarron.com/api/stripe/webhook`

No Dashboard da Stripe (modo live), crie o endpoint e marque:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.paused`
- `customer.subscription.resumed`

Cole o `whsec_...` em `STRIPE_WEBHOOK_SECRET`. Com esse segredo, o app recusa corpo sem `Stripe-Signature`. Evento repetido (mesmo `id`) é ignorado. Evento mais antigo não desfaz um mais novo.

`checkout.session.completed` só libera acesso se `mode=subscription` e o pagamento está `paid` (ou `no_payment_required`). Um checkout `unpaid` não derruba uma assinatura que já está ativa. Cancelamento (`customer.subscription.deleted`) corta o acesso na hora, mesmo que o período pago ainda não tenha acabado.

### Testar o webhook sem chave

Com `npm run dev`:

```bash
curl -s -X POST http://localhost:3000/api/stripe/webhook \
  -H "Authorization: Bearer demo-local" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_demo_1",
    "type": "checkout.session.completed",
    "created": 1762300000,
    "data": {
      "object": {
        "mode": "subscription",
        "payment_status": "paid",
        "customer": "cus_demo_1",
        "subscription": "sub_demo_1",
        "customer_details": { "email": "ana@email.com" }
      }
    }
  }'
```

Depois crie a conta com `ana@email.com`. Os módulos já entram liberados. Para cortar:

```bash
curl -s -X POST http://localhost:3000/api/stripe/webhook \
  -H "Authorization: Bearer demo-local" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_demo_2",
    "type": "customer.subscription.deleted",
    "created": 1762301000,
    "data": { "object": { "id": "sub_demo_1", "customer": "cus_demo_1", "status": "canceled" } }
  }'
```

Em produção, sem `DEMO_MODE=true`, esse Bearer não funciona.

Para um ensaio com a Stripe CLI e a chave de teste (não use a live no laptop sem querer):

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

O CLI imprime um `whsec_...` temporário. Coloque-o em `STRIPE_WEBHOOK_SECRET` e suba o app de novo.

### Portal do cliente

Em **Conta → Gerir assinatura**:

- Com `STRIPE_SECRET_KEY` e um `cus_...` já gravado, o app abre uma sessão do [Customer Portal](https://docs.stripe.com/customer-management/integrate-customer-portal).
- Sem a chave, use `STRIPE_CUSTOMER_PORTAL_LOGIN_URL` (link de login do portal, nas configurações de Billing).
- Ative o portal no Dashboard (cancelar, atualizar cartão, ver faturas) antes de mandar aluno para lá.

### Payment Link: o que conferir no Dashboard

- Preço recorrente de R$97/mês (o link acima já é esse).
- URL de sucesso: `https://metodobarron.com/obrigado.html` — o botão dessa página aponta para `https://membros.metodobarron.com/criar-conta`.
- URL de cancelamento: a home `https://metodobarron.com/`.
- Não coloque a chave secreta no GitHub Pages. O marketing só conhece o link público.

## Publicar o app

O GitHub Pages **não** executa Next.js. O arquivo `_config.yml` na raiz pede ao Jekyll para ignorar `members/`, para o código deste app não aparecer em `metodobarron.com/members/`.

Sugestão de host: **Vercel**, com root directory `members`, ou qualquer Node 22 com disco persistente.

1. DNS: `membros.metodobarron.com` → o host do app.
2. Variáveis: `APP_URL=https://membros.metodobarron.com`, `DEMO_MODE=false`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
3. Webhook live apontando para `https://membros.metodobarron.com/api/stripe/webhook`.
4. Confirme o botão de `obrigado.html`. Se o subdomínio for outro, troque o `href`.

**SQLite neste scaffold não serve para a Vercel serverless**: o disco da função é efêmero e cada instância teria o seu arquivo. Para produção, use um dos caminhos abaixo antes de abrir para aluno de verdade:

- VPS, Fly.io ou Railway com volume, mantendo `DATABASE_PATH` num disco que não some; ou
- Turso (libSQL) ou Postgres (Neon, Supabase). O SQL deste app é o de partida; a troca de driver fica para o passo seguinte.

Cloudflare Workers não tem `node:sqlite`. O site estático pode continuar no GitHub Pages; o app de membros precisa de runtime Node.

Não commite `.env`, `.env.local` nem `data/`.

## Modelo de dados

| Tabela | Papel |
| --- | --- |
| `users` | E-mail, username, hash scrypt da senha. |
| `sessions` | Cookie `mb_session` (só o SHA-256 do token). 30 dias. |
| `subscriptions` | Uma linha por assinatura. Liga e-mail, usuário, `cus_`, `sub_`, status e fim do período. `source` é `stripe` ou `demo`. |
| `progress` | Primeira vez que a pessoa passou no quiz ou na prática daquele módulo (não zera no mês). |
| `point_events` | Cada ponto concedido. Único por usuário + tipo + módulo + mês. |
| `monthly_scores` | Soma do mês, separada em quiz e prática, com o instante em que o total foi alcançado. |
| `stripe_events` | Id do evento, para não processar duas vezes. |

## Rotas

| Caminho | Quem vê |
| --- | --- |
| `/` | Porta de entrada |
| `/criar-conta`, `/entrar` | Público |
| `/painel` | Início logado |
| `/modulos`, `/modulos/[slug]` | Trilha, quiz e prática |
| `/ranking` | Mês corrente e pódio |
| `/conta` | Username, assinatura, demo |
| `POST /api/stripe/webhook` | Stripe (ou demo) |
| `GET /api/health` | `{ ok, demo }` sem segredos |

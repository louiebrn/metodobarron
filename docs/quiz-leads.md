# Quiz da home → planilha

A home envia `POST /api/quiz`. O servidor repete o JSON para `LEADS_WEBHOOK_URL`. Quem marca “Menos de 18” não gera envio.

## Colunas da aba Quiz

`createdAt`, `name`, `email`, `contactType` (`whatsapp` ou `telegram`), `contact`, `age`, `capital`, `experience`, `goal`, `dailyTime`, `broker`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `source`, `page`, `consent`.

O campo `kind` vem no JSON (`"quiz"`) e não vira coluna. `source` é o referrer, ou `direto`. Os `utm_*` saem da URL da visita.

## Google Apps Script

1. Abra uma planilha Google da conta que vai guardar os contatos.
2. Extensões → Apps Script. Apague o exemplo e cole `docs/quiz-apps-script.js`.
3. Salve. Implantar → Nova implantação → tipo **App da Web**.
4. Executar como: **Eu**. Quem tem acesso: **Qualquer pessoa**.
5. Autorize o acesso à planilha. Copie a URL que termina em `/exec`.
6. Na Vercel, no projeto que serve metodobarron.com, crie `LEADS_WEBHOOK_URL` com essa URL (Production). Não commite a URL.

A primeira linha da aba `Quiz` nasce com os cabeçalhos. Cada envio válido acrescenta uma linha. Um valor que começa com `=`, `+`, `-` ou `@` ganha aspas para não virar fórmula.

Se o script responder com erro, a pessoa vê que o envio não foi guardado. O site não finge sucesso.

No `npm run dev`, com a variável vazia, a linha fica na tabela SQLite `quiz_leads`.

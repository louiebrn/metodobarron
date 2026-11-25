// Revisar com um advogado antes de tratar este texto como versão final.
import type { Metadata } from "next";
import { DocPage } from "@/components/marketing/doc-page";

export const metadata: Metadata = {
  title: { absolute: "Política de Privacidade — Método Barron" },
  description: "Como o Método Barron trata o quiz, nome, e-mail, WhatsApp ou Telegram, em conformidade com a LGPD.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/privacidade" },
};

export default function PrivacidadePage() {
  return (
    <DocPage>
      <h1>Política de Privacidade</h1>
      <p className="updated">Última atualização: 25 de novembro de 2026</p>

      <div className="notice">
        <strong>Nota:</strong> este texto descreve o tratamento real do site hoje. Ele ainda deve ser revisado por um
        advogado antes de ser tratado como versão definitiva.
      </div>

      <h2>1. Quem é o controlador</h2>
      <p>
        O controlador dos dados pessoais tratados neste site é <strong>Método Barron</strong>. Contato do controlador e
        canal para pedidos da LGPD: <a href="mailto:mtdbarron@proton.me">mtdbarron@proton.me</a>.
      </p>
      <p>
        O site oferece um quiz curto para maiores de 18 anos, um curso educacional de day trade nos futuros NQ e ES e uma
        área de membros. O quiz indica um link de afiliado da corretora Axi e o grupo da tropa no Telegram. Não é
        recomendação de investimento.
      </p>

      <h2>2. Dados que coletamos</h2>
      <table>
        <tbody>
          <tr>
            <th>Situação</th>
            <th>Dados</th>
          </tr>
          <tr>
            <td>Quiz da home</td>
            <td>
              Faixa de idade, quanto pretende investir, experiência, objetivo, tempo por dia, se já tem conta em
              corretora, nome, e-mail, WhatsApp ou usuário do Telegram, data do envio, página, origem (referrer) e
              parâmetros utm. Quem marca “Menos de 18” não envia nada: essa resposta não é salva.
            </td>
          </tr>
          <tr>
            <td>Conta de membro</td>
            <td>Nome de usuário, e-mail e senha (guardamos só o hash, nunca a senha em texto)</td>
          </tr>
          <tr>
            <td>Assinatura</td>
            <td>
              A Stripe processa o pagamento. Recebemos e-mail, identificadores de cliente e de assinatura, status e fim
              do período. Não guardamos número completo de cartão.
            </td>
          </tr>
          <tr>
            <td>Uso do curso</td>
            <td>Aulas concluídas, respostas de quiz, itens de prática e pontos do ranking do mês</td>
          </tr>
          <tr>
            <td>Técnicos</td>
            <td>Endereço IP, por pouco tempo, para limitar abuso nos formulários; cookies de sessão e de consentimento</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Para que usamos</h2>
      <ul>
        <li>Mostrar o caminho depois do quiz e falar com você sobre esse próximo passo, sem spam;</li>
        <li>Criar a conta, liberar os 8 módulos e operar o ranking;</li>
        <li>Cobrar a assinatura, aplicar a garantia de 7 dias e o cancelamento;</li>
        <li>Medir o uso do site e, só com o seu aceite, campanhas da Meta e do TikTok;</li>
        <li>Cumprir obrigação legal e responder aos seus pedidos.</li>
      </ul>

      <h2>4. Base legal</h2>
      <p>
        Consentimento, para guardar as respostas do quiz e o contato, e para pixels de anúncio. Execução de contrato e
        de procedimentos preliminares, para conta e curso. Legítimo interesse, para segurança e para a medição agregada
        do site. Obrigação legal, quando a lei exigir guarda de registro.
      </p>

      <h2>5. Com quem compartilhamos</h2>
      <p>Não vendemos dados pessoais. O compartilhamento fica limitado a quem opera o serviço:</p>
      <ul>
        <li>Vercel, hospedagem e medição agregada do site (Web Analytics, sem cookie de publicidade);</li>
        <li>Stripe, pagamento e portal de assinatura;</li>
        <li>Meta e TikTok, somente se você aceitar o banner de cookies e os pixels estiverem configurados;</li>
        <li>Telegram, só se você mesmo entrar na Tropa do Barron pelo link;</li>
        <li>
          Axi e a rede de afiliados, só se você clicar em “Abrir conta na Axi”. O clique sai do nosso site. Não
          enviamos as respostas do quiz para a corretora.
        </li>
        <li>
          A planilha ou o endpoint que o Método Barron configurar para receber o quiz (nome, contato, respostas, data e
          origem). Esse destino não é a Axi.
        </li>
      </ul>
      <p>
        Alguns desses operadores podem tratar dados fora do Brasil. Nesses casos, buscamos contratos e medidas
        compatíveis com a LGPD.
      </p>

      <h2>6. Cookies</h2>
      <p>
        Cookies de sessão e o registro da sua escolha no banner são necessários para entrar na conta e lembrar se você
        aceitou ou recusou anúncios. A medição da Vercel não usa cookie de publicidade. Os pixels da Meta e do TikTok
        só são carregados depois de <strong>Aceitar</strong>. <strong>Recusar</strong> impede o carregamento desses
        pixels. A escolha fica neste navegador até você limpar os dados do site.
      </p>

      <h2>7. Por quanto tempo</h2>
      <p>
        Conta, progresso e assinatura ficam enquanto a conta existir e pelo prazo em que a lei exigir a guarda. O
        contato e as respostas do quiz ficam enquanto forem úteis para esse envio e para a prova do consentimento, e podem
        ser apagados quando você pedir, salvo dever legal de retenção.
      </p>

      <h2>8. Seus direitos</h2>
      <p>Você pode pedir confirmação, acesso, correção, anonimização, bloqueio, eliminação, portabilidade e informação sobre compartilhamentos. Pode revogar o consentimento quando ele for a base do tratamento. Para isso, escreva para <a href="mailto:mtdbarron@proton.me">mtdbarron@proton.me</a>. Também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).</p>

      <h2>9. Crianças e adolescentes</h2>
      <p>
        O quiz e o curso são para maiores de 18 anos. A opção “Menos de 18” encerra o fluxo e não grava dado. Não
        coletamos dados de crianças de propósito.
      </p>

      <h2>10. Segurança</h2>
      <p>
        Usamos HTTPS, senha com hash e acesso restrito aos módulos sem assinatura ativa. Nenhum sistema é infalível. Em
        incidente relevante, avisaremos os titulares e a ANPD quando a lei exigir.
      </p>

      <h2>11. Atualizações</h2>
      <p>A data no topo muda quando esta política mudar. O uso do site depois da mudança vale como ciência da nova versão.</p>
    </DocPage>
  );
}

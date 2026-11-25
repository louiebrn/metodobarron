// Revisar com um advogado antes de tratar este texto como versão final.
import type { Metadata } from "next";
import { DocPage } from "@/components/marketing/doc-page";

export const metadata: Metadata = {
  title: { absolute: "Política de Privacidade — Método Barron" },
  description: "Como o Método Barron trata nome, e-mail e WhatsApp, em conformidade com a LGPD.",
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
        O site oferece um curso educacional de day trade nos futuros NQ e ES, uma área de membros e um material grátis
        (planilha de diário de trades e checklist pré-mercado).
      </p>

      <h2>2. Dados que coletamos</h2>
      <table>
        <tbody>
          <tr>
            <th>Situação</th>
            <th>Dados</th>
          </tr>
          <tr>
            <td>Material grátis</td>
            <td>Nome (opcional), e-mail ou WhatsApp com DDD, página de origem e data do envio</td>
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
        <li>Entregar o material grátis e avisar a tropa sobre esse material, sem spam;</li>
        <li>Criar a conta, liberar os 8 módulos e operar o ranking;</li>
        <li>Cobrar a assinatura, aplicar a garantia de 7 dias e o cancelamento;</li>
        <li>Medir o uso do site e, só com o seu aceite, campanhas da Meta e do TikTok;</li>
        <li>Cumprir obrigação legal e responder aos seus pedidos.</li>
      </ul>

      <h2>4. Base legal</h2>
      <p>
        Execução de contrato e de procedimentos preliminares, para conta, curso e material pedido. Consentimento, para
        pixels de anúncio e para mensagens que não sejam necessárias à conta. Legítimo interesse, para segurança e para
        a medição agregada do site. Obrigação legal, quando a lei exigir guarda de registro.
      </p>

      <h2>5. Com quem compartilhamos</h2>
      <p>Não vendemos dados pessoais. O compartilhamento fica limitado a quem opera o serviço:</p>
      <ul>
        <li>Vercel, hospedagem e medição agregada do site (Web Analytics, sem cookie de publicidade);</li>
        <li>Stripe, pagamento e portal de assinatura;</li>
        <li>Meta e TikTok, somente se você aceitar o banner de cookies e os pixels estiverem configurados;</li>
        <li>Telegram, só se você mesmo entrar na Tropa do Barron pelo link;</li>
        <li>Um endpoint que você configurar para receber os contatos do material grátis, se houver.</li>
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
        contato do material grátis fica enquanto for útil para esse envio e para a prova do consentimento, e pode ser
        apagado quando você pedir, salvo dever legal de retenção.
      </p>

      <h2>8. Seus direitos</h2>
      <p>Você pode pedir confirmação, acesso, correção, anonimização, bloqueio, eliminação, portabilidade e informação sobre compartilhamentos. Pode revogar o consentimento quando ele for a base do tratamento. Para isso, escreva para <a href="mailto:mtdbarron@proton.me">mtdbarron@proton.me</a>. Também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).</p>

      <h2>9. Crianças e adolescentes</h2>
      <p>O curso é dirigido a maiores de 18 anos. Não coletamos dados de crianças de propósito.</p>

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

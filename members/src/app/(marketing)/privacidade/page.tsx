import type { Metadata } from "next";
import { DocPage } from "@/components/marketing/doc-page";

export const metadata: Metadata = {
  title: { absolute: "Política de Privacidade — Método Barron" },
  description: "Política de Privacidade do Método Barron, em conformidade com a LGPD.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/privacidade" },
};

export default function PrivacidadePage() {
  return (
    <DocPage footer={<> · <a href="/termos">Termos de Uso</a></>}>
      <h1>Política de Privacidade</h1>
      <p className="updated">Última atualização: 19 de agosto de 2026</p>

      <div className="notice">
        <strong>Nota:</strong> este documento é um modelo baseado na Lei Geral de Proteção de Dados (LGPD — Lei nº
        13.709/2018), pensado como ponto de partida. Antes de publicar, revise com um advogado e preencha os campos
        destacados em vermelho com os dados reais da empresa.
      </div>

      <h2>1. Introdução</h2>
      <p>
        Esta Política de Privacidade explica como o Método Barron (&quot;nós&quot;) coleta, usa, armazena e protege os dados
        pessoais dos usuários da nossa plataforma, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
      </p>

      <h2>2. Quem Somos (Controlador dos Dados)</h2>
      <p>
        <span className="placeholder">[Razão social]</span>, inscrita no CNPJ{" "}
        <span className="placeholder">[00.000.000/0000-00]</span>, com sede em{" "}
        <span className="placeholder">[endereço completo]</span>, é a controladora dos dados pessoais tratados por meio
        desta Plataforma.
      </p>

      <h2>3. Dados Que Coletamos</h2>
      <table>
        <tbody>
          <tr>
            <th>Categoria</th>
            <th>Exemplos</th>
          </tr>
          <tr>
            <td>Dados de cadastro</td>
            <td>Nome, e-mail, telefone</td>
          </tr>
          <tr>
            <td>Dados de pagamento</td>
            <td>Processados por terceiros (ex: gateway de pagamento) — não armazenamos dados completos de cartão</td>
          </tr>
          <tr>
            <td>Dados de uso</td>
            <td>Progresso nos cursos, interações na comunidade</td>
          </tr>
          <tr>
            <td>Dados técnicos</td>
            <td>Endereço IP, tipo de dispositivo, cookies</td>
          </tr>
          <tr>
            <td>Dados opcionais</td>
            <td>Instagram (usado para sorteios e ações de marketing, quando fornecido)</td>
          </tr>
        </tbody>
      </table>

      <h2>4. Finalidade do Tratamento</h2>
      <p>
        Utilizamos seus dados para: viabilizar seu acesso e uso da Plataforma; processar pagamentos e assinaturas;
        enviar comunicações sobre sua conta e, quando autorizado, conteúdo de marketing; realizar sorteios e ações
        promocionais para quem fornecer o Instagram voluntariamente; melhorar nossos produtos; e cumprir obrigações
        legais.
      </p>

      <h2>5. Base Legal (Art. 7º da LGPD)</h2>
      <p>
        O tratamento de dados ocorre com base em: execução de contrato (para prestar o serviço contratado),
        consentimento (para comunicações de marketing), legítimo interesse (para melhorias da Plataforma) e cumprimento
        de obrigação legal ou regulatória.
      </p>

      <h2>6. Compartilhamento de Dados</h2>
      <p>
        Podemos compartilhar dados com prestadores de serviço que nos auxiliam a operar a Plataforma — processadores de
        pagamento, ferramentas de e-mail marketing, hospedagem e comunidade (ex: Discord) — sempre limitado ao necessário
        para a finalidade contratada. Não vendemos dados pessoais a terceiros.
      </p>

      <h2>7. Cookies</h2>
      <p>
        Usamos cookies essenciais para o funcionamento da Plataforma e, com seu consentimento, cookies de análise e
        marketing para entender o uso do site e melhorar nossas campanhas. Você pode gerenciar suas preferências de
        cookies a qualquer momento no banner exibido ao acessar o site.
      </p>

      <h2>8. Seus Direitos como Titular de Dados</h2>
      <p>De acordo com a LGPD, você tem direito a:</p>
      <ul>
        <li>Confirmar a existência de tratamento dos seus dados;</li>
        <li>Acessar seus dados;</li>
        <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
        <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários;</li>
        <li>Solicitar a portabilidade dos dados a outro fornecedor;</li>
        <li>Revogar o consentimento a qualquer momento;</li>
        <li>Solicitar informações sobre com quem compartilhamos seus dados.</li>
      </ul>
      <p>Para exercer esses direitos, entre em contato pelo e-mail informado na seção 11.</p>

      <h2>9. Retenção de Dados</h2>
      <p>
        Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta política, ou conforme
        exigido por obrigações legais, fiscais ou regulatórias.
      </p>

      <h2>10. Segurança da Informação</h2>
      <p>
        Adotamos medidas técnicas e organizacionais razoáveis para proteger seus dados contra acesso não autorizado,
        perda ou alteração. Nenhum sistema é 100% infalível, e nos comprometemos a notificar você e a Autoridade
        Nacional de Proteção de Dados (ANPD) em caso de incidente relevante, conforme exigido por lei.
      </p>

      <h2>11. Encarregado de Dados (DPO) e Contato</h2>
      <p>
        Para dúvidas, solicitações ou reclamações sobre esta Política, entre em contato com nosso Encarregado de
        Proteção de Dados: <span className="placeholder">[e-mail do DPO/contato]</span>.
      </p>

      <h2>12. Alterações Nesta Política</h2>
      <p>
        Podemos atualizar esta Política periodicamente. A data da última atualização está indicada no topo desta página.
        Recomendamos revisitar este documento com regularidade.
      </p>
    </DocPage>
  );
}

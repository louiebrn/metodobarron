import type { Metadata } from "next";
import { DocPage } from "@/components/marketing/doc-page";

export const metadata: Metadata = {
  title: { absolute: "Termos de Uso — Método Barron" },
  description: "Termos de Uso da plataforma Método Barron.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/termos" },
};

export default function TermosPage() {
  return (
    <DocPage footer={<> · <a href="/privacidade">Política de Privacidade</a></>}>
      <h1>Termos de Uso</h1>
      <p className="updated">Última atualização: 19 de agosto de 2026</p>

      <div className="notice">
        <strong>Nota:</strong> este documento é um modelo geral, criado para servir de ponto de partida. Ele não
        substitui a revisão de um advogado antes de entrar em operação — especialmente pontos como cobrança recorrente,
        cancelamento e isenção de responsabilidade sobre resultados.
      </div>

      <h2>1. Aceitação dos Termos</h2>
      <p>
        Ao acessar ou usar a plataforma Método Barron (&quot;Plataforma&quot;), você concorda com estes Termos de Uso. Se você
        não concordar com qualquer parte destes termos, não deve utilizar a Plataforma.
      </p>

      <h2>2. Descrição do Serviço</h2>
      <p>
        O Método Barron é uma plataforma de educação online que oferece cursos, conteúdo em vídeo, mentorias e acesso a
        uma comunidade, com foco em habilidades de geração de renda como e-commerce, marketing digital, trading,
        criptomoedas, inteligência artificial e copywriting.
      </p>

      <h2>3. Cadastro e Elegibilidade</h2>
      <p>
        Para assinar a Plataforma, você deve ter pelo menos 18 anos ou possuir autorização de um responsável legal. Você
        é responsável por manter a confidencialidade dos dados de acesso à sua conta e por todas as atividades realizadas
        por meio dela.
      </p>

      <h2>4. Planos, Pagamento e Cancelamento</h2>
      <p>
        Os planos disponíveis, valores e periodicidade são apresentados na página de preços da Plataforma. As
        assinaturas são cobradas de forma recorrente (mensal ou anual, conforme o plano escolhido) até que sejam
        canceladas pelo usuário.
      </p>
      <p>
        O cancelamento pode ser feito a qualquer momento{" "}
        <span className="placeholder">
          [descrever aqui o processo real de cancelamento — painel do usuário, e-mail, etc.]
        </span>
        . Após o cancelamento, o acesso permanece ativo até o fim do período já pago, sem reembolso proporcional, exceto
        quando aplicável a garantia descrita na página de preços.
      </p>

      <h2>5. Propriedade Intelectual</h2>
      <p>
        Todo o conteúdo disponibilizado na Plataforma — incluindo vídeos, textos, materiais e marca — é de propriedade do
        Método Barron ou de seus licenciadores, sendo protegido por leis de direitos autorais. É proibida a reprodução,
        distribuição ou revenda do conteúdo sem autorização expressa.
      </p>

      <h2>6. Conduta do Usuário</h2>
      <p>Ao usar a Plataforma, você concorda em não:</p>
      <ul>
        <li>Compartilhar seu acesso com terceiros não autorizados;</li>
        <li>Copiar, redistribuir ou revender o conteúdo dos cursos;</li>
        <li>Utilizar a comunidade para fins abusivos, discriminatórios ou ilegais;</li>
        <li>Tentar acessar áreas restritas da Plataforma sem autorização.</li>
      </ul>

      <h2>7. Isenção de Responsabilidade Sobre Resultados</h2>
      <p>
        O conteúdo do Método Barron tem finalidade educacional e informativa. Não garantimos resultados financeiros
        específicos. O desempenho de cada aluno depende de fatores individuais como dedicação, execução, mercado e
        contexto pessoal. Nada na Plataforma deve ser interpretado como aconselhamento financeiro, de investimento ou
        jurídico individualizado.
      </p>

      <h2>8. Limitação de Responsabilidade</h2>
      <p>
        Na máxima extensão permitida pela lei, o Método Barron não se responsabiliza por danos indiretos, lucros
        cessantes ou perdas decorrentes do uso ou da impossibilidade de uso da Plataforma.
      </p>

      <h2>9. Alterações nestes Termos</h2>
      <p>
        Podemos atualizar estes Termos periodicamente. Alterações significativas serão comunicadas por e-mail ou por
        aviso na Plataforma. O uso continuado após a alteração constitui aceitação dos novos termos.
      </p>

      <h2>10. Lei Aplicável e Foro</h2>
      <p>
        Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de{" "}
        <span className="placeholder">[cidade/estado]</span> para dirimir eventuais controvérsias.
      </p>

      <h2>11. Contato</h2>
      <p>
        Dúvidas sobre estes Termos podem ser enviadas para <span className="placeholder">[e-mail de contato]</span>.
      </p>
    </DocPage>
  );
}

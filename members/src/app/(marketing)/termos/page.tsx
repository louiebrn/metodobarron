// Revisar com um advogado antes de tratar este texto como versão final.
import type { Metadata } from "next";
import { DocPage } from "@/components/marketing/doc-page";

export const metadata: Metadata = {
  title: { absolute: "Termos de Uso — Método Barron" },
  description: "Termos do curso educacional Método Barron, com garantia de 7 dias e aviso de risco.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/termos" },
};

export default function TermosPage() {
  return (
    <DocPage footer={<> · <a href="/privacidade">Política de Privacidade</a></>}>
      <h1>Termos de Uso</h1>
      <p className="updated">Última atualização: 25 de novembro de 2026</p>

      <div className="notice">
        <strong>Nota:</strong> estes termos descrevem a oferta atual do curso. Eles ainda devem ser revisados por um
        advogado antes de serem tratados como versão definitiva.
      </div>

      <h2>1. Quem oferece</h2>
      <p>
        O Método Barron é um curso educacional de day trade nos futuros NQ (Nasdaq-100) e ES (S&amp;P 500), com área de
        membros, quizzes, práticas e um plano de estudo. O contato é{" "}
        <a href="mailto:mtdbarron@proton.me">mtdbarron@proton.me</a>.
      </p>

      <h2>2. Aceite</h2>
      <p>
        Ao criar conta, pedir o material grátis ou pagar a assinatura, você concorda com estes termos e com a{" "}
        <a href="/privacidade">Política de Privacidade</a>. Se não concordar, não use o site.
      </p>

      <h2>3. O que o curso é — e o que não é</h2>
      <p>
        O conteúdo é educacional. Não é recomendação de investimento, não é consultoria, não é sinal de compra ou venda
        e não é promessa de lucro. Day trade tem risco alto: você pode perder parte ou todo o capital. Resultados
        passados, inclusive os do Barron, não são típicos nem garantidos.
      </p>
      <p>
        A trilha pede prática no simulador antes de dinheiro real. A decisão de operar, o tamanho da posição e o stop
        são seus.
      </p>

      <h2>4. Idade e conta</h2>
      <p>
        É preciso ter 18 anos ou mais. A conta pede e-mail, senha e um nome de usuário. Quem pagou deve usar o mesmo
        e-mail da Stripe para a assinatura liberar os módulos. A senha não é enviada por e-mail. Você responde pelo uso
        da sua conta e não deve repassar o acesso.
      </p>

      <h2>5. Preço, cobrança e cancelamento</h2>
      <p>
        A oferta de lançamento é de R$97 por mês, cobrados todo mês pela Stripe, no lugar de R$197. O valor da
        renovação é o mesmo anunciado no momento da compra, salvo aviso prévio de mudança para o ciclo seguinte.
      </p>
      <p>
        O cancelamento da renovação é feito em Conta → Gerir assinatura, no portal da Stripe, ou por e-mail para
        mtdbarron@proton.me. Cancelar corta a renovação. O acesso do período já pago segue até o fim desse período,
        salvo no caso da garantia abaixo.
      </p>

      <h2>6. Garantia de 7 dias</h2>
      <p>
        Se você não gostar do conteúdo, peça o reembolso em até 7 dias corridos depois da primeira cobrança, pelo e-mail
        mtdbarron@proton.me, com o e-mail usado na compra. Devolvemos o valor dessa cobrança, sem perguntas. Depois do
        reembolso, o acesso aos módulos é encerrado. Pedidos depois dos 7 dias não geram reembolso do mês em curso.
      </p>

      <h2>7. Material grátis</h2>
      <p>
        A planilha e o checklist são liberados quando você informa e-mail ou WhatsApp. O contato serve para entregar o
        material e, se for o caso, avisar a tropa sobre esse material. Não é obrigatório comprar o curso para baixar.
      </p>

      <h2>8. Conduta</h2>
      <ul>
        <li>Não copie, redistribua ou revenda aulas, planilhas ou o checklist;</li>
        <li>Não use a comunidade, o ranking ou o Telegram para abuso, discriminação ou promessa de ganho fácil;</li>
        <li>Não tente acessar módulos sem assinatura ativa nem quebrar o site.</li>
      </ul>

      <h2>9. Propriedade</h2>
      <p>
        Aulas, textos, marca e materiais são do Método Barron ou de quem licenciou. O acesso é uma licença pessoal,
        intransferível e limitada ao período da assinatura.
      </p>

      <h2>10. Limitação</h2>
      <p>
        Na medida permitida pela lei, o Método Barron não responde por perdas de trading, lucros cessantes ou danos
        indiretos ligados ao uso do conteúdo. Nada aqui afasta direito do consumidor que não possa ser afastado.
      </p>

      <h2>11. Lei e foro</h2>
      <p>
        A lei brasileira rege estes termos. Se você for consumidor, vale o foro do seu domicílio quando a lei assim
        determinar. Nos demais casos, o foro é o da comarca do domicílio do controlador.
      </p>

      <h2>12. Mudanças</h2>
      <p>
        Estes termos podem ser atualizados. A data no topo registra a versão. Mudança relevante de preço ou de garantia
        vale para o próximo ciclo, não para o período já pago.
      </p>
    </DocPage>
  );
}

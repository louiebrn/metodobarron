export type Flash = { tone: "ok" | "warn"; text: string };

export function flashMessage(query: {
  aviso?: string;
  pts?: string;
  acertos?: string;
  total?: string;
}): Flash | null {
  const pts = query.pts || "0";
  switch (query.aviso) {
    case "quiz-ok":
      return {
        tone: "ok",
        text: `Você acertou ${query.acertos || "0"} de ${query.total || "0"}. +${pts} pontos neste mês. A explicação de cada pergunta está abaixo.`,
      };
    case "quiz-ja":
      return { tone: "warn", text: "Este quiz já foi enviado neste mês. A nota não muda até o dia 1º." };
    case "quiz-invalido":
      return { tone: "warn", text: "Responda todas as perguntas antes de enviar." };
    case "pratica-ok":
      return { tone: "ok", text: `Checklist somou +${pts} pontos neste mês. Marcar mais itens ainda pode aumentar a nota.` };
    case "pratica-ja":
      return {
        tone: "warn",
        text: `Esta seleção não passa dos ${pts} pontos que você já tem nesta prática no mês.`,
      };
    case "pratica-incompleta":
      return { tone: "warn", text: "Marque ao menos um item. Cada item vale os pontos escritos ao lado." };
    case "aula-ok":
      return { tone: "ok", text: "Aula marcada como concluída." };
    case "aula-ja":
      return { tone: "ok", text: "Esta aula já estava concluída." };
    case "aula-invalida":
      return { tone: "warn", text: "Não encontrei essa aula." };
    case "sem-acesso":
      return { tone: "warn", text: "Os módulos ficam liberados só com a assinatura ativa." };
    case "demo":
      return { tone: "ok", text: "Acesso de demonstração atualizado." };
    case "demo-off":
      return { tone: "warn", text: "O modo demonstração está desligado neste ambiente." };
    case "exemplos":
      return { tone: "ok", text: "Alunos de exemplo atualizados no ranking deste mês." };
    default:
      return null;
  }
}

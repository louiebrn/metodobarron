export type Flash = { tone: "ok" | "warn"; text: string };

export function flashMessage(code?: string, pts?: string): Flash | null {
  switch (code) {
    case "quiz-ok":
      return { tone: "ok", text: `Resposta certa. +${pts || "10"} pontos neste mês.` };
    case "quiz-ja":
      return { tone: "warn", text: "Você já ganhou os pontos deste quiz neste mês." };
    case "quiz-errado":
      return {
        tone: "warn",
        text: "Não foi dessa vez. Resposta errada não tira ponto. Leia de novo e tente outra vez.",
      };
    case "quiz-invalido":
      return { tone: "warn", text: "Escolha uma alternativa antes de enviar." };
    case "pratica-ok":
      return { tone: "ok", text: `Prática registrada. +${pts || "5"} pontos neste mês.` };
    case "pratica-ja":
      return { tone: "warn", text: "Você já ganhou os pontos desta prática neste mês." };
    case "pratica-incompleta":
      return { tone: "warn", text: "Marque os três itens para registrar a prática." };
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

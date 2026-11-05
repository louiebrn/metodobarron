import { PRACTICE_POINTS, QUIZ_POINTS } from "./scoring";

export type Lesson = {
  slug: string;
  title: string;
  /** Placeholder length until the real cut is uploaded. */
  minutes: number;
  /** Empty shows the placeholder player. YouTube watch/share URL or a direct .mp4. */
  videoUrl: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
};

export type PracticeTask = {
  id: string;
  label: string;
  points: number;
};

export type CourseModule = {
  slug: string;
  number: number;
  title: string;
  summary: string;
  central?: boolean;
  lessons: Lesson[];
  quiz: QuizQuestion[];
  practice: PracticeTask[];
};

function lessons(slug: string, items: Array<[string, number]>): Lesson[] {
  return items.map(([title, minutes], index) => ({
    slug: `${slug}-${index + 1}`,
    title,
    minutes,
    videoUrl: "",
  }));
}

function quiz(items: Array<[string, string[], number, string]>): QuizQuestion[] {
  return items.map(([question, options, correctIndex, explanation]) => ({
    question,
    options,
    correctIndex,
    explanation,
    points: QUIZ_POINTS / items.length,
  }));
}

function practice(focus: string, extra: string): PracticeTask[] {
  return [
    { id: "simulador", points: 2, label: `Pratiquei «${focus}» no simulador, sem dinheiro real.` },
    { id: "diario", points: 2, label: "Anotei o que fiz no diário: gatilho, stop e o que senti." },
    { id: "stop", points: 1, label: extra },
  ];
}

export const MODULES: CourseModule[] = [
  {
    slug: "boas-vindas",
    number: 1,
    title: "Boas-vindas e choque de realidade",
    summary: "Antes de qualquer gráfico, a conversa honesta sobre o que é day trade de verdade.",
    lessons: lessons("boas-vindas", [
      ["Como o curso funciona e como estudar pelo celular", 6],
      ["Do Brasil para o mercado americano: por que NQ e ES", 8],
      ["Por que a maioria dos iniciantes perde dinheiro", 7],
      ["Expectativas realistas: estudo, prática e paciência", 6],
    ]),
    quiz: quiz([
      [
        "Por onde o método manda começar a praticar?",
        ["No simulador, sem dinheiro real", "Com a conta cheia no primeiro dia", "Copiando sinais de um grupo", "Operando só notícia"],
        0,
        "O curso inteiro pode ser praticado no simulador. Dinheiro real não é pré-requisito.",
      ],
      [
        "O que este curso se dispõe a entregar?",
        ["Uma meta de lucro mensal", "Estudo, prática e um plano de processo", "Sinais de compra e venda", "Garantia de não perder"],
        1,
        "A proposta é educacional: método, risco e rotina. Não há promessa de resultado.",
      ],
      [
        "O que costuma acontecer com quem começa no day trade sem método?",
        ["Ganha rápido e consistente", "A maioria perde dinheiro", "O simulador impede qualquer erro", "O mercado paga quem entra todo dia"],
        1,
        "A aula de abertura é explícita: a maioria dos iniciantes perde. Por isso o curso começa pelo choque de realidade.",
      ],
      [
        "Dinheiro na conta real é obrigatório para fazer o curso?",
        ["Sim, pelo menos um contrato cheio", "Não. Dá para estudar e praticar no simulador", "Só se for micro", "Só na primeira semana"],
        1,
        "A trilha foi desenhada para o simulador. A conta real fica para depois do plano.",
      ],
      [
        "O ranking da área de membros mede o quê?",
        ["Lucro no simulador", "Pontos de quiz e prática do mês", "Número de contratos", "Opinião do grupo"],
        1,
        "Os pontos vêm de estudo: quiz e checklist. Não medem dinheiro.",
      ],
    ]),
    practice: practice("as expectativas do módulo 1", "Escrevi, em uma frase, o que este curso não promete."),
  },
  {
    slug: "mercado",
    number: 2,
    title: "Como o mercado funciona",
    summary: "A base que quase todo mundo pula: o que você está negociando e como.",
    lessons: lessons("mercado", [
      ["Contratos futuros e a CME", 8],
      ["NQ (Nasdaq-100) e ES (S&P 500)", 7],
      ["Valor do ponto e do tick, vencimentos e margem", 9],
      ["Horários da sessão de Nova York e as micros MNQ e MES", 7],
    ]),
    quiz: quiz([
      [
        "O contrato NQ acompanha qual índice?",
        ["Ibovespa", "Nasdaq-100", "Dólar futuro da B3", "Ouro"],
        1,
        "NQ é o futuro do Nasdaq-100 na CME. ES acompanha o S&P 500.",
      ],
      [
        "O contrato ES acompanha qual índice?",
        ["S&P 500", "Nasdaq-100", "Dow Jones apenas no after", "Ibovespa futuro"],
        0,
        "ES é o E-mini do S&P 500. NQ é o do Nasdaq-100.",
      ],
      [
        "MNQ e MES, em relação a NQ e ES, são:",
        ["Contratos de outra bolsa", "Micros, com valor de ponto menor", "A mesma margem do contrato cheio", "Índices brasileiros"],
        1,
        "A micro é um décimo do contrato cheio. Serve para praticar com menos risco, não para 'ganhar igual com menos'.",
      ],
      [
        "Para que serve saber o valor do tick antes de clicar?",
        ["Para prever a direção do candle", "Para calcular quanto o preço andando custa em dinheiro", "Para escolher o indicador", "Para pagar menos corretagem"],
        1,
        "Ponto e tick dizem o tamanho do movimento em dólares. Sem isso, o risco é chute.",
      ],
      [
        "A sessão regular de Nova York, de segunda a sexta, é:",
        ["9:30–16:00 no horário de Brasília", "9:30–16:00 no horário de Nova York", "24 horas sem intervalo", "Só das 10 às 12"],
        1,
        "O relógio do curso é 9:30–16:00 America/New_York. Em Brasília o intervalo muda no relógio, não na regra.",
      ],
    ]),
    practice: practice("ponto, tick e o horário de Nova York", "Anotei o valor do tick de MNQ e de MES antes de simular."),
  },
  {
    slug: "configuracao",
    number: 3,
    title: "Configurando tudo",
    summary: "Deixe a estrutura pronta, do jeito certo, antes de operar.",
    lessons: lessons("configuracao", [
      ["Corretora ou mesa proprietária com acesso à CME", 7],
      ["Configurando a plataforma (NinjaTrader, Tradovate, TradingView ou similar)", 8],
      ["Ativando e usando o simulador", 6],
    ]),
    quiz: quiz([
      [
        "O que precisa estar ativo antes de qualquer operação de estudo?",
        ["A alavancagem máxima da conta", "Um indicador secreto", "O simulador da plataforma", "A conta com dinheiro real"],
        2,
        "A ordem da trilha é conta, plataforma e simulador. A conta real não é o primeiro passo.",
      ],
      [
        "Qual destas plataformas o curso cita como exemplo?",
        ["Só o home broker da B3", "NinjaTrader, Tradovate ou TradingView", "Uma planilha", "O app do banco"],
        1,
        "O curso não prende você a uma marca. O exemplo é uma plataforma com acesso à CME e simulador.",
      ],
      [
        "Para negociar NQ e ES a partir do Brasil, o acesso costuma ser:",
        ["Pela bolsa brasileira, no mesmo contrato", "Por corretora ou mesa com acesso à CME", "Só pelo Tesouro Direto", "Por um grupo de sinais"],
        1,
        "Futuros da CME não são o mini índice da B3. O caminho é corretora ou mesa com esse acesso.",
      ],
      [
        "O simulador usa dinheiro real?",
        ["Sim, um valor simbólico", "Não", "Só nas micros", "Só se você errar o stop"],
        1,
        "Simulador é treino. O placar de pontos do curso também não é dinheiro.",
      ],
      [
        "Qual é a ordem pedida antes de estudar um setup?",
        ["Operar, depois configurar", "Conta com acesso, plataforma, simulador", "Indicador, depois corretora", "Lucro de uma semana, depois aula"],
        1,
        "Sem a estrutura, o resto do curso vira vídeo solto.",
      ],
    ]),
    practice: practice("a plataforma e o simulador", "Confirmei que a ordem simulada não foi enviada para a conta real."),
  },
  {
    slug: "graficos",
    number: 4,
    title: "Lendo gráficos",
    summary: "Aprenda a enxergar o que o preço está mostrando.",
    lessons: lessons("graficos", [
      ["Leitura de candles", 8],
      ["Identificando tendência", 7],
      ["Suporte e resistência na prática", 8],
    ]),
    quiz: quiz([
      [
        "O que é uma região de suporte?",
        ["Uma garantia de que o preço vai subir", "Uma área em que o preço costumou parar de cair e reagir", "O horário de abertura da sessão", "O valor da margem do contrato"],
        1,
        "Suporte é uma região observada. Não é promessa de alta.",
      ],
      [
        "Um candle mostra:",
        ["O que o preço vai fazer no próximo", "O que aconteceu naquele intervalo: abertura, máxima, mínima e fechamento", "O lucro da sua conta", "A opinião do grupo"],
        1,
        "Candle é registro do passado recente. Ler não é prever.",
      ],
      [
        "Tendência, neste módulo, é:",
        ["Uma ordem da corretora", "A direção recente que o preço está desenhando", "Um indicador pago", "O viés do noticiário"],
        1,
        "Tendência aqui é leitura do gráfico, não uma certeza.",
      ],
      [
        "Resistência é:",
        ["Onde o preço costumou parar de subir e reagir", "O stop obrigatório de 10 pontos", "A margem da micro", "O fim da sessão"],
        0,
        "Resistência espelha o suporte do outro lado. Também não garante reversão.",
      ],
      [
        "Marcar suporte e resistência serve para:",
        ["Acertar todos os candles", "Ter regiões de referência antes de simular uma entrada", "Substituir o stop", "Calcular imposto"],
        1,
        "A região entra no plano. O stop continua sendo definido à parte, em dinheiro.",
      ],
    ]),
    practice: practice("suporte e resistência num gráfico de 5 minutos", "Marquei uma região e escrevi por que ela é referência, sem chamar de certeza."),
  },
  {
    slug: "setups",
    number: 5,
    title: "Setups básicos (no simulador)",
    summary: "Poucas regras, bem definidas, treinadas sem dinheiro real.",
    lessons: lessons("setups", [
      ["Setups simples para iniciantes", 8],
      ["Como treinar no simulador com disciplina", 7],
      ["Registrando cada operação no diário", 6],
    ]),
    quiz: quiz([
      [
        "Nos setups iniciais, quanto de dinheiro real entra?",
        ["Metade do capital", "Um contrato cheio", "Nenhum: a prática é no simulador", "O que sobrar no fim do mês"],
        2,
        "Os setups do curso são treinados no simulador. O placar mede estudo, não lucro.",
      ],
      [
        "Um setup simples deste curso inclui:",
        ["Só o indicador", "Gatilho, stop e tamanho, definidos antes", "A opinião do pregão", "Dobrar depois de um erro"],
        1,
        "Poucas regras. O stop não é decidido depois que a tela ficou vermelha.",
      ],
      [
        "O diário de trades serve para:",
        ["Calcular o imposto sozinho", "Ver repetição de comportamento, não para exibir lucro", "Escolher a ação da B3", "Substituir o simulador"],
        1,
        "O diário mostra se você seguiu o plano. O resultado em pontos do simulador não é a nota.",
      ],
      [
        "Treinar com disciplina no simulador significa:",
        ["Entrar em todo candle", "Seguir o mesmo gatilho e o mesmo stop combinados", "Aumentar o contrato quando acertar", "Desligar o diário"],
        1,
        "Disciplina é repetir a regra. O simulador não fica mais 'real' se você ignorar o stop.",
      ],
      [
        "Um acerto no simulador prova que o setup dá lucro?",
        ["Sim, se passou de três vezes", "Não. É treino de processo", "Sim, nas micros", "Só se o diário estiver vazio"],
        1,
        "Amostra curta no simulador não é evidência de resultado futuro.",
      ],
    ]),
    practice: practice("um setup com gatilho e stop", "Registrei a simulação no diário antes de abrir outra."),
  },
  {
    slug: "risco",
    number: 6,
    title: "Gestão de risco",
    summary: "O módulo mais importante do curso. Aqui você aprende a proteger o capital.",
    central: true,
    lessons: lessons("risco", [
      ["Stop: onde colocar e por quê", 8],
      ["Tamanho de posição", 8],
      ["A regra do 1% e o limite de perda diário", 9],
    ]),
    quiz: quiz([
      [
        "A regra do 1% serve para quê?",
        ["Garantir 1% de lucro por dia", "Limitar o risco de cada operação a cerca de 1% do capital", "Operar uma vez por semana", "Cobrar 1% de taxa da corretora"],
        1,
        "O 1% é teto de risco por operação, calculado antes do clique. Não é meta de lucro.",
      ],
      [
        "O stop se define:",
        ["Depois de ver o prejuízo", "Antes da entrada, com o tamanho já calculado", "Quando o grupo avisar", "Só no fim do pregão"],
        1,
        "Sem stop prévio não há tamanho de posição. Há chute.",
      ],
      [
        "O tamanho da posição sai de onde?",
        ["De quantos contratos cabem na tela", "Do risco em dinheiro dividido pela distância do stop", "Do lucro que você quer", "Do contrato cheio, sempre"],
        1,
        "Primeiro o risco em dinheiro. Depois o número de contratos. Nunca o contrário.",
      ],
      [
        "O limite de perda do dia existe para:",
        ["Recuperar o prejuízo em seguida", "Encerrar o pregão quando o teto combinado foi atingido", "Dobrar o tamanho", "Ignorar o diário"],
        1,
        "O limite é uma regra de parar. Não é um convite para a próxima entrada.",
      ],
      [
        "Aumentar o tamanho para recuperar uma perda:",
        ["É a regra do 1%", "Foge da gestão de risco do módulo", "É obrigatório nas micros", "Reduz o risco"],
        1,
        "Recuperar no impulso aumenta o risco. O módulo central existe para impedir isso.",
      ],
    ]),
    practice: practice("o tamanho da posição com a regra do 1%", "Calculei contratos a partir do risco em dinheiro, antes de simular."),
  },
  {
    slug: "psicologia",
    number: 7,
    title: "Psicologia",
    summary: "Seu maior adversário no mercado costuma ser você mesmo.",
    lessons: lessons("psicologia", [
      ["Como evitar FOMO", 7],
      ["Operações por vingança e como pará-las", 8],
      ["Rotina, disciplina e o diário de trades", 6],
    ]),
    quiz: quiz([
      [
        "O que é uma operação por vingança?",
        ["Entrar no impulso para «recuperar» uma perda", "Seguir o stop combinado", "Anotar a operação no diário", "Encerrar o dia ao bater o limite de perda"],
        0,
        "Vingança é tentar recuperar uma perda no impulso. O plano manda parar, não dobrar.",
      ],
      [
        "FOMO, neste módulo, é:",
        ["Entrar com medo de ficar de fora do movimento", "Um tipo de ordem na CME", "O nome do diário", "Respeitar o limite do dia"],
        0,
        "FOMO é pressa. O setup não fica mais válido porque o candle já andou.",
      ],
      [
        "O diário ajuda na psicologia porque:",
        ["Apaga a emoção", "Deixa registrado o que você sentiu junto com a regra", "Substitui o stop", "Garante a próxima entrada"],
        1,
        "Anotar 'ansioso' ao lado do trade é dado. Sem isso, o erro repete sem nome.",
      ],
      [
        "Depois de uma perda que respeitou o stop, o curso manda:",
        ["Entrar de novo na hora, maior", "Voltar para a regra ou encerrar, não para a vingança", "Desligar o simulador para sempre", "Pedir um sinal"],
        1,
        "O stop funcionou se você saiu onde combinou. A próxima decisão ainda é do plano.",
      ],
      [
        "Um dia ruim no simulador significa que:",
        ["O método acabou", "Aquele dia não é a medida do processo", "Você deve operar a conta real para compensar", "O diário deve ser apagado"],
        1,
        "Um pregão não é amostra. A régua continua sendo se você seguiu o plano.",
      ],
    ]),
    practice: practice("um pregão em que você não perseguiu candle", "No diário, nomeei a emoção em vez de justificar a entrada."),
  },
  {
    slug: "plano-30-dias",
    number: 8,
    title: "Seu plano de 30 dias",
    summary: "Junte tudo em uma rotina clara para evoluir com consistência.",
    lessons: lessons("plano-30-dias", [
      ["Plano de estudo e prática para cada dia", 7],
      ["Como medir a evolução (processo, não lucro)", 6],
      ["Impostos sobre operações no exterior: o básico que você precisa saber", 8],
    ]),
    quiz: quiz([
      [
        "O plano de 30 dias pede para medir o quê?",
        ["Quanto você lucrou no simulador", "O número de contratos operados", "Processo: estudo e prática, não lucro", "A opinião do grupo sobre o pregão"],
        2,
        "A meta do plano é processo. Lucro no simulador não é a régua do curso.",
      ],
      [
        "Sobre impostos de operação no exterior, o curso pede:",
        ["Ignorar até a receita cobrar", "Registrar as operações e confirmar a regra com um contador, porque ela muda", "Usar a mesma regra da B3 sem checar", "Deixar o diário em branco"],
        1,
        "A aula é o básico. A declaração depende da regra vigente e de um contador.",
      ],
      [
        "Um dia do plano está cumprido quando:",
        ["O simulador fechou positivo", "Você fez o estudo e a prática combinados, com registro", "Entrou em cinco trades", "Alguém elogiou o print"],
        1,
        "Processo é aula, prática e diário. O saldo do dia não marca o checkbox.",
      ],
      [
        "Por que o plano dura 30 dias?",
        ["Porque depois disso o lucro é garantido", "Para repetir a rotina o bastante para ver o próprio processo", "Porque a CME fecha no dia 30", "Para operar todos os horários"],
        1,
        "Trinta dias é amostra de hábito, não um prazo de resultado.",
      ],
      [
        "Guardar extrato da corretora entra no plano porque:",
        ["Substitui o contador", "O registro faz parte do básico fiscal, junto com o diário", "Aumenta o ponto no ranking", "Prova que o setup funciona"],
        1,
        "Extrato é documento. Não é estratégia e não substitui orientação contábil.",
      ],
    ]),
    practice: practice("o dia de hoje do plano de 30 dias", "Marquei o dia como processo cumprido, sem usar o saldo como nota."),
  },
];

const BY_SLUG = new Map(MODULES.map((module) => [module.slug, module]));

export function getModule(slug: string): CourseModule | undefined {
  return BY_SLUG.get(slug);
}

export function allLessons(): Array<{ moduleSlug: string; lesson: Lesson }> {
  return MODULES.flatMap((module) => module.lessons.map((lesson) => ({ moduleSlug: module.slug, lesson })));
}

export function quizPointsTotal(module: CourseModule): number {
  return module.quiz.reduce((sum, question) => sum + question.points, 0);
}

export function practicePointsTotal(module: CourseModule): number {
  return module.practice.reduce((sum, task) => sum + task.points, 0);
}

export function gradeQuiz(module: CourseModule, answers: number[]): { correct: number; total: number; points: number } {
  let correct = 0;
  let points = 0;
  module.quiz.forEach((question, index) => {
    if (answers[index] === question.correctIndex) {
      correct += 1;
      points += question.points;
    }
  });
  return { correct, total: module.quiz.length, points };
}

export function gradePractice(module: CourseModule, checkedIds: Iterable<string>): number {
  const checked = new Set(checkedIds);
  return module.practice.reduce((sum, task) => (checked.has(task.id) ? sum + task.points : sum), 0);
}

export function quizIsValid(module: CourseModule): boolean {
  return (
    module.quiz.length >= 4 &&
    quizPointsTotal(module) === QUIZ_POINTS &&
    module.quiz.every(
      (question) =>
        question.points > 0 &&
        question.correctIndex >= 0 &&
        question.correctIndex < question.options.length &&
        new Set(question.options).size === question.options.length,
    )
  );
}

export function practiceIsValid(module: CourseModule): boolean {
  const ids = module.practice.map((task) => task.id);
  return module.practice.length >= 3 && practicePointsTotal(module) === PRACTICE_POINTS && new Set(ids).size === ids.length;
}

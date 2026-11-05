import { PRACTICE_IDS, type PracticeId } from "./scoring";

export type CourseModule = {
  slug: string;
  number: number;
  title: string;
  summary: string;
  central?: boolean;
  lessons: string[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  practice: { id: PracticeId; label: string }[];
};

const practice = (focus: string): CourseModule["practice"] => [
  { id: "simulador", label: `Pratiquei «${focus}» no simulador, sem dinheiro real.` },
  { id: "diario", label: "Anotei o que fiz no diário de trades." },
  { id: "stop", label: "Defini o stop antes de simular qualquer entrada." },
];

export const MODULES: CourseModule[] = [
  {
    slug: "boas-vindas",
    number: 1,
    title: "Boas-vindas e choque de realidade",
    summary:
      "Antes de qualquer gráfico, a conversa honesta sobre o que é day trade de verdade.",
    lessons: [
      "Como o curso funciona e como estudar pelo celular",
      "Do Brasil para o mercado americano: por que NQ e ES",
      "Por que a maioria dos iniciantes perde dinheiro",
      "Expectativas realistas: estudo, prática e paciência",
    ],
    quiz: {
      question: "Por onde o método manda começar a praticar?",
      options: [
        "No simulador, sem dinheiro real",
        "Com a conta cheia no primeiro dia",
        "Copiando sinais de um grupo",
        "Operando só notícia",
      ],
      correctIndex: 0,
      explanation: "O curso inteiro pode ser praticado no simulador. Dinheiro real não é pré-requisito.",
    },
    practice: practice("as expectativas do módulo 1"),
  },
  {
    slug: "mercado",
    number: 2,
    title: "Como o mercado funciona",
    summary: "A base que quase todo mundo pula: o que você está negociando e como.",
    lessons: [
      "Contratos futuros e a CME",
      "NQ (Nasdaq-100) e ES (S&P 500)",
      "Valor do ponto e do tick, vencimentos e margem",
      "Horários da sessão de Nova York e as micros MNQ e MES",
    ],
    quiz: {
      question: "O contrato NQ acompanha qual índice?",
      options: ["Ibovespa", "Nasdaq-100", "Dólar futuro da B3", "Ouro"],
      correctIndex: 1,
      explanation: "NQ é o futuro do Nasdaq-100 na CME. ES acompanha o S&P 500.",
    },
    practice: practice("ponto, tick e horário de Nova York"),
  },
  {
    slug: "configuracao",
    number: 3,
    title: "Configurando tudo",
    summary: "Deixe a estrutura pronta, do jeito certo, antes de operar.",
    lessons: [
      "Corretora ou mesa proprietária com acesso à CME",
      "Configurando a plataforma (NinjaTrader, Tradovate, TradingView ou similar)",
      "Ativando e usando o simulador",
    ],
    quiz: {
      question: "O que precisa estar ativo antes de qualquer operação de estudo?",
      options: [
        "A alavancagem máxima da conta",
        "Um indicador secreto",
        "O simulador da plataforma",
        "A conta com dinheiro real",
      ],
      correctIndex: 2,
      explanation: "Primeiro a conta e a plataforma, depois o simulador. A conta real fica para depois do plano.",
    },
    practice: practice("a plataforma e o simulador"),
  },
  {
    slug: "graficos",
    number: 4,
    title: "Lendo gráficos",
    summary: "Aprenda a enxergar o que o preço está mostrando.",
    lessons: ["Leitura de candles", "Identificando tendência", "Suporte e resistência na prática"],
    quiz: {
      question: "O que é uma região de suporte?",
      options: [
        "Uma garantia de que o preço vai subir",
        "Uma área em que o preço costumou parar de cair e reagir",
        "O horário de abertura da sessão",
        "O valor da margem do contrato",
      ],
      correctIndex: 1,
      explanation: "Suporte é uma região observada no gráfico, não uma promessa de alta.",
    },
    practice: practice("suporte e resistência no gráfico de 5 minutos"),
  },
  {
    slug: "setups",
    number: 5,
    title: "Setups básicos (no simulador)",
    summary: "Poucas regras, bem definidas, treinadas sem dinheiro real.",
    lessons: [
      "Setups simples para iniciantes",
      "Como treinar no simulador com disciplina",
      "Registrando cada operação no diário",
    ],
    quiz: {
      question: "Nos setups iniciais, quanto de dinheiro real entra?",
      options: [
        "Metade do capital",
        "Um contrato cheio",
        "Nenhum: a prática é no simulador",
        "O que sobrar no fim do mês",
      ],
      correctIndex: 2,
      explanation: "Os setups do curso são treinados no simulador. O placar de pontos mede estudo, não lucro.",
    },
    practice: practice("um setup simples, com gatilho e stop"),
  },
  {
    slug: "risco",
    number: 6,
    title: "Gestão de risco",
    summary: "O módulo mais importante do curso. Aqui você aprende a proteger o capital.",
    central: true,
    lessons: [
      "Stop: onde colocar e por quê",
      "Tamanho de posição",
      "A regra do 1% e o limite de perda diário",
    ],
    quiz: {
      question: "A regra do 1% serve para quê?",
      options: [
        "Garantir 1% de lucro por dia",
        "Limitar o risco de cada operação a cerca de 1% do capital",
        "Operar uma vez por semana",
        "Cobrar 1% de taxa da corretora",
      ],
      correctIndex: 1,
      explanation: "O 1% é teto de risco por operação, calculado antes do clique. Não é meta de lucro.",
    },
    practice: practice("o tamanho da posição com a regra do 1%"),
  },
  {
    slug: "psicologia",
    number: 7,
    title: "Psicologia",
    summary: "Seu maior adversário no mercado costuma ser você mesmo.",
    lessons: [
      "Como evitar FOMO",
      "Operações por vingança e como pará-las",
      "Rotina, disciplina e o diário de trades",
    ],
    quiz: {
      question: "O que é uma operação por vingança?",
      options: [
        "Entrar no impulso para «recuperar» uma perda",
        "Seguir o stop combinado",
        "Anotar a operação no diário",
        "Encerrar o dia ao bater o limite de perda",
      ],
      correctIndex: 0,
      explanation: "Vingança é tentar recuperar uma perda no impulso. O plano manda parar, não dobrar.",
    },
    practice: practice("um dia em que você seguiu o plano, sem FOMO"),
  },
  {
    slug: "plano-30-dias",
    number: 8,
    title: "Seu plano de 30 dias",
    summary: "Junte tudo em uma rotina clara para evoluir com consistência.",
    lessons: [
      "Plano de estudo e prática para cada dia",
      "Como medir a evolução (processo, não lucro)",
      "Impostos sobre operações no exterior: o básico que você precisa saber",
    ],
    quiz: {
      question: "O plano de 30 dias pede para medir o quê?",
      options: [
        "Quanto você lucrou no simulador",
        "O número de contratos operados",
        "Processo: estudo e prática, não lucro",
        "A opinião do grupo sobre o pregão",
      ],
      correctIndex: 2,
      explanation: "A meta do plano é processo. Lucro no simulador não é a régua do curso.",
    },
    practice: practice("o dia de hoje do plano de 30 dias"),
  },
];

const BY_SLUG = new Map(MODULES.map((module) => [module.slug, module]));

export function getModule(slug: string): CourseModule | undefined {
  return BY_SLUG.get(slug);
}

export function practiceIdsMatch(module: CourseModule): boolean {
  return module.practice.every((item, index) => item.id === PRACTICE_IDS[index]);
}

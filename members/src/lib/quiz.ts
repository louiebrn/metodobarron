/** Quiz do funil da home. Sem Node: o cliente e a rota usam o mesmo contrato. */

export const AXI_AFFILIATE_URL = "https://records.axiaffiliates.com/visit/?bta=45006&brand=axitrader";
export const TROPA_URL = "https://t.me/+Mj-tOeCA_whhYmU0";

export const AGE_MINOR_ID = "under18";

export type QuizOption = { id: string; label: string };

export type QuizQuestion = {
  id: "age" | "capital" | "experience" | "goal" | "dailyTime" | "broker";
  prompt: string;
  options: readonly QuizOption[];
  /** Só a pergunta de idade. Encerra o quiz e não vai para o servidor. */
  minor?: QuizOption;
};

export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "age",
    prompt: "Quantos anos você tem?",
    options: [
      { id: "18-24", label: "18–24" },
      { id: "25-34", label: "25–34" },
      { id: "35-44", label: "35–44" },
      { id: "45-plus", label: "45+" },
    ],
    minor: { id: AGE_MINOR_ID, label: "Menos de 18" },
  },
  {
    id: "capital",
    prompt: "Quanto pretende investir?",
    options: [
      { id: "up-to-500", label: "Até R$500" },
      { id: "500-2k", label: "R$500–2 mil" },
      { id: "2k-10k", label: "R$2–10 mil" },
      { id: "over-10k", label: "Mais de R$10 mil" },
    ],
  },
  {
    id: "experience",
    prompt: "Qual é a sua experiência?",
    options: [
      { id: "never", label: "Nunca operei" },
      { id: "tried", label: "Já testei um pouco" },
      { id: "sometimes", label: "Opero às vezes" },
      { id: "weekly", label: "Opero toda semana" },
    ],
  },
  {
    id: "goal",
    prompt: "Qual é o seu objetivo principal?",
    options: [
      { id: "extra", label: "Renda extra" },
      { id: "learn", label: "Aprender a operar" },
      { id: "copy", label: "Copiar sinais" },
      { id: "live", label: "Viver de trade" },
    ],
  },
  {
    id: "dailyTime",
    prompt: "Quanto tempo por dia você tem?",
    options: [
      { id: "under-30", label: "Menos de 30 min" },
      { id: "about-1h", label: "Cerca de 1 hora" },
      { id: "2-3h", label: "2–3 horas" },
      { id: "all-day", label: "Tenho o dia livre" },
    ],
  },
  {
    id: "broker",
    prompt: "Já tem conta em corretora?",
    options: [
      { id: "no", label: "Não" },
      { id: "other", label: "Sim, mas não na Axi" },
      { id: "axi", label: "Sim, na Axi" },
      { id: "unsure", label: "Não sei" },
    ],
  },
] as const;

export type AnswerId = (typeof QUIZ_QUESTIONS)[number]["id"];

export type QuizAnswers = Record<AnswerId, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function optionLabel(questionId: AnswerId, optionId: string): string | null {
  const question = QUIZ_QUESTIONS.find((item) => item.id === questionId);
  if (!question) return null;
  if (question.minor?.id === optionId) return question.minor.label;
  return question.options.find((option) => option.id === optionId)?.label ?? null;
}

export function normalizeWhatsApp(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length > 11) digits = digits.slice(2);
  digits = digits.slice(0, 11);
  if (!/^[1-9][1-9]/.test(digits)) return null;
  const valid = digits.length === 11 ? digits[2] === "9" : digits.length === 10;
  return valid ? `+55${digits}` : null;
}

export function normalizeTelegram(raw: string): string | null {
  const value = raw
    .trim()
    .replace(/^https?:\/\/(t\.me|telegram\.me)\//i, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "");
  if (!/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(value)) return null;
  return `@${value}`;
}

function clip(value: unknown, max: number): string {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
}

export type QuizLeadInput = {
  answers?: Partial<Record<AnswerId, unknown>>;
  name?: unknown;
  email?: unknown;
  contactType?: unknown;
  contact?: unknown;
  consent?: unknown;
  honeypot?: unknown;
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  utm_content?: unknown;
  utm_term?: unknown;
  source?: unknown;
  page?: unknown;
};

export type QuizLeadPayload = {
  kind: "quiz";
  createdAt: string;
  name: string;
  email: string;
  contactType: "whatsapp" | "telegram";
  contact: string;
  age: string;
  capital: string;
  experience: string;
  goal: string;
  dailyTime: string;
  broker: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  source: string;
  page: string;
  consent: true;
};

export type ParsedQuiz =
  | { ok: true; honeypot: true }
  | { ok: true; minor: true }
  | { ok: true; lead: QuizLeadPayload & { answers: QuizAnswers } }
  | { ok: false; error: string };

export function parseQuizLead(input: QuizLeadInput, now = new Date()): ParsedQuiz {
  if (clip(input.honeypot, 200)) return { ok: true, honeypot: true };

  const answers = {} as QuizAnswers;
  for (const question of QUIZ_QUESTIONS) {
    const optionId = clip(input.answers?.[question.id], 40);
    if (question.id === "age" && optionId === AGE_MINOR_ID) return { ok: true, minor: true };
    const label = optionLabel(question.id, optionId);
    if (!label || optionId === AGE_MINOR_ID) {
      return { ok: false, error: "Responda todas as perguntas para continuar." };
    }
    answers[question.id] = optionId;
  }

  const name = clip(input.name, 80).replace(/\s+/g, " ");
  if (name.length < 2) return { ok: false, error: "Digite seu nome." };

  const email = clip(input.email, 120).toLowerCase();
  if (!EMAIL.test(email)) return { ok: false, error: email ? "Esse e-mail não parece válido." : "Digite seu e-mail." };

  const contactType = input.contactType === "telegram" ? "telegram" : input.contactType === "whatsapp" ? "whatsapp" : "";
  if (!contactType) return { ok: false, error: "Escolha WhatsApp ou Telegram." };
  const rawContact = clip(input.contact, 80);
  const contact = contactType === "whatsapp" ? normalizeWhatsApp(rawContact) : normalizeTelegram(rawContact);
  if (!contact) {
    return {
      ok: false,
      error:
        contactType === "whatsapp"
          ? rawContact
            ? "Esse número não parece válido. Use DDD + número."
            : "Digite seu WhatsApp com DDD."
          : rawContact
            ? "Esse usuário do Telegram não parece válido."
            : "Digite seu usuário do Telegram.",
    };
  }

  if (input.consent !== true && input.consent !== "true") {
    return { ok: false, error: "É preciso aceitar o uso dos dados para continuar." };
  }

  return {
    ok: true,
    lead: {
      kind: "quiz",
      createdAt: now.toISOString(),
      name,
      email,
      contactType,
      contact,
      age: optionLabel("age", answers.age)!,
      capital: optionLabel("capital", answers.capital)!,
      experience: optionLabel("experience", answers.experience)!,
      goal: optionLabel("goal", answers.goal)!,
      dailyTime: optionLabel("dailyTime", answers.dailyTime)!,
      broker: optionLabel("broker", answers.broker)!,
      utm_source: clip(input.utm_source, 120),
      utm_medium: clip(input.utm_medium, 120),
      utm_campaign: clip(input.utm_campaign, 120),
      utm_content: clip(input.utm_content, 120),
      utm_term: clip(input.utm_term, 120),
      source: clip(input.source, 300) || "direto",
      page: clip(input.page, 300),
      consent: true,
      answers,
    },
  };
}

export type ResultCopy = {
  perfil: string;
  title: string;
  text: string;
  checklist: string[];
};

function plan(perfil: string, title: string, text: string, extra: string): ResultCopy {
  return {
    perfil,
    title,
    text,
    checklist: [
      "Abrir a conta na Axi pelo link da tropa",
      "Entrar no Telegram e ficar com o método, não com o palpite",
      extra,
    ],
  };
}

export function resultCopy(answers: QuizAnswers): ResultCopy {
  if (answers.goal === "copy") {
    return plan(
      "Curioso de Sinais",
      "Copiar entrada não é o caminho.",
      "Querer sinal pronto é comum. Na tropa o passo é entender o porquê, no seu ritmo, antes de aumentar o tamanho.",
      "Separar o que é método do que é só copiar",
    );
  }
  if (answers.broker === "axi" && answers.experience !== "never" && answers.experience !== "tried") {
    return plan(
      "Conta Pronta",
      "Você já tem conta e alguma rotina.",
      "Com a Axi aberta, o próximo passo é a tropa: método e risco. Ninguém aqui promete viver de trade amanhã.",
      "Revisar tamanho e stop antes da próxima semana",
    );
  }
  if ((answers.experience === "never" || answers.experience === "tried") && answers.dailyTime === "under-30") {
    return plan(
      "Iniciante Estratégico",
      "Pouco tempo pede um começo pequeno.",
      "Menos de uma hora por dia cabe num bloco curto, de preferência no simulador. A conta e a tropa são os dois passos.",
      "Marcar um bloco fixo no simulador",
    );
  }
  if (answers.goal === "live") {
    return plan(
      "Visão de Longo Prazo",
      "Viver de trade é meta, não atalho.",
      "Dá para estudar com método e risco limitado. Ninguém aqui garante renda. A conta na Axi e a tropa são o começo.",
      "Tratar a meta como anos de prática, não como um mês",
    );
  }
  if (answers.goal === "learn") {
    return plan(
      "Estudante de Método",
      "Aprender a operar combina com este começo.",
      "Pelo que você respondeu, o próximo passo é a conta na Axi e a tropa do Barron, no horário que você já tem.",
      "Estudar um setup por vez, com risco escrito antes",
    );
  }
  return plan(
    "Foco em Renda Extra",
    "Renda extra pede limite, não pressa.",
    "O caminho é método e um tamanho que você aguenta perder. Abra a conta e entre na tropa para seguir com calma.",
    "Definir um teto de risco antes de operar",
  );
}

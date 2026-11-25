"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Logo } from "@/components/logo";
import { trackIfConsented } from "@/lib/pixel-events";
import { AXI_AFFILIATE_URL, QUIZ_QUESTIONS, TROPA_URL, resultCopy, type AnswerId, type QuizAnswers } from "@/lib/quiz";
import "./funnel.css";

type Step = "landing" | "question" | "analyzing" | "details" | "minor" | "results";

const EMPTY: Partial<QuizAnswers> = {};

const PROOF = [
  { value: "50k+", label: "TikTok" },
  { value: "30k+", label: "Instagram" },
  { value: "1k+", label: "Telegram" },
] as const;

const LIFE = [
  { src: "/lifestyle/barron-1.webp", alt: "Dois carros num terraço. Foto da tropa, não é resultado de operação.", width: 900, height: 1600 },
  { src: "/lifestyle/barron-2.webp", alt: "Relógio e corrente. Foto da tropa, não é resultado de operação.", width: 900, height: 1600 },
  { src: "/lifestyle/barron-3.webp", alt: "Interior de um carro, com outro carro do lado de fora.", width: 900, height: 1600 },
  { src: "/lifestyle/barron-4.webp", alt: "Relógio no pulso ao lado de um prato.", width: 900, height: 1600 },
  { src: "/lifestyle/barron-5.webp", alt: "Casa e piscina à noite.", width: 900, height: 1600 },
] as const;

const NUDGE = [
  "A idade só decide se este caminho é para você.",
  "Sem julgamento. É o tamanho que você pensa hoje.",
  "Todo mundo começa em algum ponto da curva.",
  "O objetivo muda o próximo passo. Não promete resultado.",
  "Uma rotina boa cabe no dia que você já tem.",
  "A conta é o passo prático. A tropa é o método.",
];

const OPTION_ICON: Record<string, string> = {
  "18-24": "✦",
  "25-34": "⚡",
  "35-44": "🎯",
  "45-plus": "◆",
  under18: "⛔",
  "up-to-500": "🪙",
  "500-2k": "🔧",
  "2k-10k": "🧭",
  "over-10k": "🏔️",
  never: "🌑",
  tried: "🧪",
  sometimes: "📆",
  weekly: "🔁",
  extra: "➕",
  learn: "📚",
  copy: "📋",
  live: "🌅",
  "under-30": "⏱️",
  "about-1h": "🕐",
  "2-3h": "🕒",
  "all-day": "☀️",
  no: "✖️",
  other: "🏦",
  axi: "✅",
  unsure: "❓",
};

const SHOTS = [
  { src: "/funnel/desk.webp", alt: "Mesa vazia com três monitores e gráficos à noite.", width: 1280, height: 720 },
  { src: "/funnel/skyline.webp", alt: "Horizonte de uma cidade moderna à noite, sem pessoas.", width: 1280, height: 720 },
  { src: "/funnel/car.webp", alt: "Volante de um carro à noite, sem motorista.", width: 1280, height: 720 },
  { src: "/funnel/watch.webp", alt: "Relógio no pulso ao lado de um gráfico, sem rosto.", width: 1152, height: 864 },
];

const TAPE = ["NQ", "ES", "ilustrativo", "sem cotação", "método", "risco"];

function campaign() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") ?? "",
    utm_medium: params.get("utm_medium") ?? "",
    utm_campaign: params.get("utm_campaign") ?? "",
    utm_content: params.get("utm_content") ?? "",
    utm_term: params.get("utm_term") ?? "",
    source: document.referrer || "direto",
    page: `${window.location.pathname}${window.location.search}`.slice(0, 300),
  };
}

export function Funnel() {
  const [step, setStep] = useState<Step>("landing");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>(EMPTY);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [channel, setChannel] = useState<"whatsapp" | "telegram">("whatsapp");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (step !== "analyzing") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setStep("details"), reduce ? 200 : 1400);
    return () => window.clearTimeout(timer);
  }, [step]);

  const question = QUIZ_QUESTIONS[index];
  const copy = isComplete(answers) ? resultCopy(answers) : null;

  function reset() {
    setStep("landing");
    setIndex(0);
    setAnswers(EMPTY);
    setError("");
    setPending(false);
  }

  function start() {
    setIndex(0);
    setError("");
    setStep("question");
  }

  function back() {
    setError("");
    if (step === "details" || step === "analyzing") {
      setIndex(QUIZ_QUESTIONS.length - 1);
      setStep("question");
      return;
    }
    if (step === "question" && index > 0) {
      setIndex(index - 1);
      return;
    }
    setStep("landing");
  }

  function choose(optionId: string) {
    if (!question) return;
    if (question.id === "age" && optionId === "under18") {
      setAnswers(EMPTY);
      setStep("minor");
      return;
    }
    const next = { ...answers, [question.id]: optionId };
    setAnswers(next);
    setError("");
    if (index < QUIZ_QUESTIONS.length - 1) {
      setIndex(index + 1);
      setStep("question");
      return;
    }
    setStep("analyzing");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!isComplete(answers) || pending) return;
    if (name.trim().length < 2) {
      setError("Digite seu nome.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("Digite um e-mail válido.");
      return;
    }
    if (!contact.trim()) {
      setError(channel === "whatsapp" ? "Digite seu WhatsApp com DDD." : "Digite seu usuário do Telegram.");
      return;
    }
    if (!consent) {
      setError("É preciso aceitar o uso dos dados para continuar.");
      return;
    }
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          answers,
          name,
          email,
          contactType: channel,
          contact,
          consent,
          company,
          ...campaign(),
        }),
      });
      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!response.ok || !data?.ok) {
        setError(data?.error || "Não foi possível guardar agora. Tente de novo.");
        setPending(false);
        return;
      }
      trackIfConsented("Lead");
      trackIfConsented("CompleteRegistration");
      setStep("results");
      setPending(false);
    } catch {
      setError("Sem conexão agora. Tente de novo em instantes.");
      setPending(false);
    }
  }

  return (
    <div className="funnel">
      <div className="funnel-grid" aria-hidden="true" />
      <header className="funnel-top">
        <Logo href="/" />
        <a className="funnel-login" href="/entrar">
          Entrar
        </a>
      </header>
      <main className="funnel-main">
        {step === "landing" ? (
          <div className="funnel-pane">
            <section>
              <p className="eyebrow">Diagnóstico da tropa</p>
              <h1>
                Day trade sem <span className="funnel-grad">método</span> é só pressa.
              </h1>
              <p className="funnel-lead">
                Seis perguntas para achar o seu próximo passo nos futuros NQ e ES. A tropa do Barron, sem promessa de lucro.
              </p>
              <ul className="funnel-trust">
                <li>Grátis</li>
                <li>60 segundos</li>
                <li>6 perguntas</li>
              </ul>
              <button className="funnel-cta" type="button" onClick={start}>
                Começar meu diagnóstico (grátis, 60s)
                <span className="ar" aria-hidden="true">
                  <Arrow />
                </span>
              </button>
              <p className="funnel-note">Só para maiores de 18. Conteúdo educacional.</p>
              <div className="funnel-candles" aria-hidden="true">
                <Candles />
              </div>
            </section>

            <div className="tape" aria-hidden="true">
              <div className="tape-track">
                {[...TAPE, ...TAPE, ...TAPE].map((item, i) => (
                  <span key={i}>
                    {item === "ilustrativo" ? <b>{item}</b> : item}
                  </span>
                ))}
              </div>
            </div>
            <p className="funnel-note">Faixa ilustrativa. Não é cotação.</p>

            <section className="proof">
              <p className="eyebrow">Prova</p>
              <h2>A tropa já está reunida.</h2>
              <p className="funnel-lead">TikTok 50k+. Instagram 30k+. Telegram 1k+.</p>
              <div className="counts">
                {PROOF.map((item) => (
                  <p className="count" key={item.label}>
                    <b>{item.value}</b>
                    <span>{item.label}</span>
                  </p>
                ))}
              </div>
            </section>

            <section className="block">
              <p className="eyebrow">Como funciona</p>
              <div className="steps">
                <article className="step">
                  <em>1</em>
                  <div>
                    <strong>Responda</strong>
                    <p>Seis toques. Um minuto.</p>
                  </div>
                </article>
                <article className="step">
                  <em>2</em>
                  <div>
                    <strong>Receba seu plano</strong>
                    <p>Um perfil e o próximo passo.</p>
                  </div>
                </article>
                <article className="step">
                  <em>3</em>
                  <div>
                    <strong>Entre na tropa</strong>
                    <p>Conta na Axi e o Telegram.</p>
                  </div>
                </article>
              </div>
            </section>

            <section className="block">
              <p className="eyebrow">Na tropa</p>
              <h2>O que você encontra lá.</h2>
              <div className="gets">
                <article className="get">
                  <em>01</em>
                  <div>
                    <strong>Método</strong>
                    <p>NQ e ES com um jeito de ler o mercado.</p>
                  </div>
                </article>
                <article className="get">
                  <em>02</em>
                  <div>
                    <strong>Risco</strong>
                    <p>Tamanho e stop antes da pressa.</p>
                  </div>
                </article>
                <article className="get">
                  <em>03</em>
                  <div>
                    <strong>Rotina</strong>
                    <p>Um bloco que cabe no seu dia.</p>
                  </div>
                </article>
                <article className="get">
                  <em>04</em>
                  <div>
                    <strong>Grupo</strong>
                    <p>A tropa no Telegram, sem palpite solto.</p>
                  </div>
                </article>
              </div>
            </section>

            <section className="block">
              <p className="eyebrow">Clima</p>
              <h2>O ambiente. Não o extrato.</h2>
              <p className="funnel-lead">Imagens de clima. Não são prints de resultado e não prometem renda.</p>
              <div className="gallery">
                <div className="gallery-track">
                  {[...SHOTS, ...SHOTS].map((shot, i) => (
                    <figure key={`${shot.src}-${i}`}>
                      <Image
                        src={shot.src}
                        alt={i < SHOTS.length ? shot.alt : ""}
                        width={shot.width}
                        height={shot.height}
                        sizes="320px"
                        priority={i === 0}
                      />
                      {i < SHOTS.length ? <figcaption>{shot.alt}</figcaption> : null}
                    </figure>
                  ))}
                </div>
              </div>
              <button className="funnel-cta" type="button" onClick={start}>
                Começar meu diagnóstico (grátis, 60s)
                <span className="ar" aria-hidden="true">
                  <Arrow />
                </span>
              </button>
            </section>
            <LifeGallery />
          </div>
        ) : null}

        {step === "question" && question ? (
          <section className="funnel-pane" aria-labelledby="quiz-q" key={question.id}>
            <button className="funnel-back" type="button" onClick={back}>
              Voltar
            </button>
            <p className="funnel-step">
              {index + 1} de {QUIZ_QUESTIONS.length}
            </p>
            <div
              className="funnel-bar"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={QUIZ_QUESTIONS.length}
              aria-valuenow={index + 1}
              aria-label="Progresso do quiz"
            >
              <i style={{ width: `${((index + 1) / QUIZ_QUESTIONS.length) * 100}%` }} />
            </div>
            <h1 id="quiz-q" className="funnel-q">
              {question.prompt}
            </h1>
            <p className="nudge">{NUDGE[index]}</p>
            <div className="funnel-options">
              {question.options.map((option) => (
                <button
                  key={option.id}
                  className={answers[question.id] === option.id ? "funnel-option on" : "funnel-option"}
                  type="button"
                  onClick={() => choose(option.id)}
                >
                  <span className="ic" aria-hidden="true">
                    {OPTION_ICON[option.id] ?? "•"}
                  </span>
                  {option.label}
                  <span className="go" aria-hidden="true">
                    <Arrow />
                  </span>
                </button>
              ))}
              {question.minor ? (
                <button className="funnel-option minor" type="button" onClick={() => choose(question.minor!.id)}>
                  <span className="ic" aria-hidden="true">
                    {OPTION_ICON[question.minor.id]}
                  </span>
                  {question.minor.label}
                  <span className="go" aria-hidden="true">
                    <Arrow />
                  </span>
                </button>
              ) : null}
            </div>
          </section>
        ) : null}

        {step === "analyzing" ? (
          <section className="scan funnel-pane" aria-live="polite">
            <p className="eyebrow">Quase lá</p>
            <div className="scan-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <h1 className="funnel-q">Analisando suas respostas…</h1>
            <p className="funnel-lead">Montando um perfil. Sem promessa no meio do caminho.</p>
          </section>
        ) : null}

        {step === "minor" ? (
          <section className="funnel-pane">
            <h1 className="funnel-q">Este caminho é só para maiores de 18.</h1>
            <p className="funnel-lead">
              A Axi atende adultos. Não guardamos essa resposta. Quando você fizer 18 anos, a tropa continua aqui.
            </p>
            <button className="funnel-cta" type="button" onClick={reset}>
              Voltar ao início
              <span className="ar" aria-hidden="true">
                <Arrow />
              </span>
            </button>
          </section>
        ) : null}

        {step === "details" ? (
          <section className="funnel-pane">
            <button className="funnel-back" type="button" onClick={back}>
              Voltar
            </button>
            <p className="funnel-step">Seus dados</p>
            <div className="funnel-bar" aria-hidden="true">
              <i style={{ width: "100%" }} />
            </div>
            <h1 className="funnel-q">Seu perfil está pronto. Para onde enviamos?</h1>
            <form className="funnel-form" onSubmit={submit} noValidate>
              <label className="funnel-field">
                Nome
                <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
              </label>
              <label className="funnel-field">
                E-mail
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  required
                />
              </label>
              <div className="funnel-switch" role="radiogroup" aria-label="WhatsApp ou Telegram">
                <button
                  type="button"
                  className={channel === "whatsapp" ? "on" : undefined}
                  aria-pressed={channel === "whatsapp"}
                  onClick={() => setChannel("whatsapp")}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  className={channel === "telegram" ? "on" : undefined}
                  aria-pressed={channel === "telegram"}
                  onClick={() => setChannel("telegram")}
                >
                  Telegram
                </button>
              </div>
              <label className="funnel-field">
                {channel === "whatsapp" ? "WhatsApp com DDD" : "Usuário do Telegram"}
                <input
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  inputMode={channel === "whatsapp" ? "tel" : "text"}
                  autoComplete={channel === "whatsapp" ? "tel" : "off"}
                  placeholder={channel === "whatsapp" ? "(11) 90000-0000" : "@usuario"}
                  required
                />
              </label>
              <label className="funnel-check">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required />
                <span>
                  Concordo com o uso do meu nome, e-mail, contato e respostas para receber este caminho, conforme a{" "}
                  <a href="/privacidade">Política de Privacidade</a>.
                </span>
              </label>
              <label className="funnel-hp" aria-hidden="true">
                Empresa
                <input tabIndex={-1} autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} />
              </label>
              {error ? (
                <p className="funnel-error" role="alert">
                  {error}
                </p>
              ) : null}
              <button className="funnel-cta" type="submit" disabled={pending}>
                {pending ? "Enviando…" : "Ver o meu perfil"}
                <span className="ar" aria-hidden="true">
                  <Arrow />
                </span>
              </button>
            </form>
          </section>
        ) : null}

        {step === "results" && copy ? (
          <section className="funnel-pane">
            <p className="funnel-step">Seu caminho</p>
            <p className="perfil">{copy.perfil}</p>
            <h1 className="funnel-q">{copy.title}</h1>
            <p className="funnel-lead">{copy.text}</p>
            <ul className="check">
              {copy.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="funnel-steps">
              <article className="funnel-card">
                <b>Passo 1</b>
                <p>Abra sua conta na Axi pelo link da tropa.</p>
                <a className="funnel-cta" href={AXI_AFFILIATE_URL} target="_blank" rel="noopener noreferrer">
                  Abrir conta na Axi
                  <span className="ar" aria-hidden="true">
                    <Arrow />
                  </span>
                </a>
              </article>
              <article className="funnel-card">
                <b>Passo 2</b>
                <p>Entre na Tropa do Barron no Telegram.</p>
                <a className="funnel-cta" href={TROPA_URL} target="_blank" rel="noopener noreferrer">
                  Entrar na Tropa do Barron
                  <span className="ar" aria-hidden="true">
                    <Arrow />
                  </span>
                </a>
              </article>
            </div>
            <LifeGallery />
            <p className="funnel-warn">Não é recomendação de investimento. Trading envolve risco.</p>
            <button className="funnel-back" type="button" onClick={reset}>
              Refazer
            </button>
          </section>
        ) : null}
      </main>
      <footer className="funnel-foot">
        <a href="/privacidade">Privacidade</a>
        <a href="/termos">Termos</a>
        <a href={TROPA_URL} target="_blank" rel="noopener noreferrer">
          Tropa
        </a>
      </footer>
    </div>
  );
}

function isComplete(answers: Partial<QuizAnswers>): answers is QuizAnswers {
  return QUIZ_QUESTIONS.every((question) => Boolean(answers[question.id as AnswerId]));
}

function LifeGallery() {
  return (
    <section className="block life">
      <p className="eyebrow">Estilo</p>
      <h2>O estilo de vida da tropa.</h2>
      <p className="funnel-lead">Fotos do dia a dia. Não são resultado de trade e não prometem renda.</p>
      <div className="life-row">
        {LIFE.map((photo) => (
          <figure key={photo.src}>
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 900px) 72vw, 22vw"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Candles() {
  const bars = [28, 46, 22, 54, 36, 62, 30, 48, 24, 58, 40, 18, 50, 34, 66, 26, 44, 32, 60, 38];
  return (
    <svg viewBox="0 0 800 160" preserveAspectRatio="none">
      {bars.map((height, i) => (
        <rect key={i} x={i * 40 + 8} y={140 - height} width="10" height={height} rx="2" fill={i % 3 === 0 ? "#62b3ff" : "#2ee6c8"} />
      ))}
      {bars.map((height, i) => (
        <rect key={`b-${i}`} x={800 + i * 40 + 8} y={140 - height} width="10" height={height} rx="2" fill={i % 3 === 0 ? "#62b3ff" : "#2ee6c8"} />
      ))}
    </svg>
  );
}

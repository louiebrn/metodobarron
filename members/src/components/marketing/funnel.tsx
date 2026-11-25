"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { formatFollowers } from "@/lib/follower-format";
import { trackIfConsented } from "@/lib/pixel-events";
import { AXI_AFFILIATE_URL, QUIZ_QUESTIONS, TROPA_URL, resultCopy, type AnswerId, type QuizAnswers } from "@/lib/quiz";
import "./funnel.css";

type Step = "landing" | "question" | "details" | "minor" | "results";

const EMPTY: Partial<QuizAnswers> = {};

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

export function Funnel({ instagram, tiktok }: { instagram: number; tiktok: number }) {
  const [counts, setCounts] = useState({ instagram, tiktok });
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
    let cancelled = false;
    fetch("/api/followers", { headers: { accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { instagram?: number; tiktok?: number } | null) => {
        if (cancelled || !data) return;
        const nextIg = Number(data.instagram);
        const nextTt = Number(data.tiktok);
        if (!Number.isFinite(nextIg) || !Number.isFinite(nextTt)) return;
        setCounts({ instagram: nextIg, tiktok: nextTt });
      })
      .catch(() => {
        /* Mantém o último número conhecido. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const question = QUIZ_QUESTIONS[index];
  const copy = isComplete(answers) ? resultCopy(answers) : null;

  function reset() {
    setStep("landing");
    setIndex(0);
    setAnswers(EMPTY);
    setError("");
    setPending(false);
  }

  function back() {
    setError("");
    if (step === "details") {
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
    setStep("details");
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
      <div className="funnel-aurora" aria-hidden="true">
        <span className="a1" />
        <span className="a2" />
      </div>
      <header className="funnel-top">
        <Logo href="/" />
        <a className="funnel-login" href="/entrar">
          Entrar
        </a>
      </header>
      <main className="funnel-main">
        {step === "landing" ? (
          <section>
            <p className="funnel-kicker">
              <i className="funnel-dot" aria-hidden="true" />
              <span>
                Instagram <b>{formatFollowers(counts.instagram)}</b>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                TikTok <b>{formatFollowers(counts.tiktok)}</b>
              </span>
            </p>
            <h1>
              Descubra o seu próximo passo <span className="funnel-grad">no day trade.</span>
            </h1>
            <p className="funnel-lead">Um minuto com a tropa do Barron para futuros NQ e ES, com método e sem promessa.</p>
            <button
              className="funnel-cta"
              type="button"
              onClick={() => {
                setIndex(0);
                setStep("question");
              }}
            >
              Começar
              <span aria-hidden="true">
                <Arrow />
              </span>
            </button>
            <p className="funnel-note">Só para maiores de 18. Conteúdo educacional.</p>
          </section>
        ) : null}

        {step === "question" && question ? (
          <section aria-labelledby="quiz-q">
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
            <div className="funnel-options">
              {question.options.map((option) => (
                <button
                  key={option.id}
                  className={answers[question.id] === option.id ? "funnel-option on" : "funnel-option"}
                  type="button"
                  onClick={() => choose(option.id)}
                >
                  {option.label}
                  <Arrow />
                </button>
              ))}
              {question.minor ? (
                <button className="funnel-option minor" type="button" onClick={() => choose(question.minor!.id)}>
                  {question.minor.label}
                  <Arrow />
                </button>
              ) : null}
            </div>
          </section>
        ) : null}

        {step === "minor" ? (
          <section>
            <h1>Este caminho é só para maiores de 18.</h1>
            <p className="funnel-lead">
              A Axi atende adultos. Não guardamos essa resposta. Quando você fizer 18 anos, a tropa continua aqui.
            </p>
            <button className="funnel-cta" type="button" onClick={reset}>
              Voltar ao início
              <span aria-hidden="true">
                <Arrow />
              </span>
            </button>
          </section>
        ) : null}

        {step === "details" ? (
          <section>
            <button className="funnel-back" type="button" onClick={back}>
              Voltar
            </button>
            <p className="funnel-step">Seus dados</p>
            <div className="funnel-bar" aria-hidden="true">
              <i style={{ width: "100%" }} />
            </div>
            <h1 className="funnel-q">Para onde enviamos o seu caminho?</h1>
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
                {pending ? "Enviando…" : "Ver o meu caminho"}
                <span aria-hidden="true">
                  <Arrow />
                </span>
              </button>
            </form>
          </section>
        ) : null}

        {step === "results" && copy ? (
          <section>
            <p className="funnel-step">Seu caminho</p>
            <h1 className="funnel-q">{copy.title}</h1>
            <p className="funnel-lead">{copy.text}</p>
            <div className="funnel-steps">
              <article className="funnel-card">
                <b>Passo 1</b>
                <p>Abra sua conta na Axi pelo link da tropa.</p>
                <a className="funnel-cta" href={AXI_AFFILIATE_URL} target="_blank" rel="noopener noreferrer">
                  Abrir conta na Axi
                  <span aria-hidden="true">
                    <Arrow />
                  </span>
                </a>
              </article>
              <article className="funnel-card">
                <b>Passo 2</b>
                <p>Entre na Tropa do Barron no Telegram.</p>
                <a className="funnel-cta" href={TROPA_URL} target="_blank" rel="noopener noreferrer">
                  Entrar na Tropa do Barron
                  <span aria-hidden="true">
                    <Arrow />
                  </span>
                </a>
              </article>
            </div>
            <p className="funnel-warn">Não é recomendação de investimento. Trading envolve risco.</p>
            <button className="funnel-back" type="button" onClick={reset} style={{ marginTop: 18 }}>
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

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

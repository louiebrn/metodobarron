"use client";

import { useEffect, useState, type ReactNode } from "react";

const TELEGRAM = "https://t.me/+Mj-tOeCA_whhYmU0";

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function MarketingChrome({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="mkt docpage">
      <div className="grain" aria-hidden="true" />
      <header className={`hdr${open ? " open" : ""}${scrolled ? " scrolled" : ""}`}>
        <div className="wrap">
          <nav aria-label="Principal">
            <a className="logo" href="/" aria-label="Método Barron, início">
              <span className="mark" />
              Método Barron
            </a>
            <div className="links">
              <a href="/termos">Termos</a>
              <a href="/privacidade">Privacidade</a>
            </div>
            <div className="nav-r">
              <a className="nav-login" href="/entrar">Entrar</a>
              <a className="nbtn" href="/">Começar</a>
              <button
                className="menu"
                type="button"
                aria-label={open ? "Fechar menu" : "Abrir menu"}
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
              >
                <span />
              </button>
            </div>
          </nav>
        </div>
        <div className="mpanel">
          <a href="/" onClick={() => setOpen(false)}><span>Começar</span> <Arrow /></a>
          <a href="/entrar" onClick={() => setOpen(false)}><span>Entrar</span> <Arrow /></a>
          <a href="/termos" onClick={() => setOpen(false)}><span>Termos</span> <Arrow /></a>
          <a href="/privacidade" onClick={() => setOpen(false)}><span>Privacidade</span> <Arrow /></a>
        </div>
      </header>

      {children}

      <footer>
        <div className="wrap">
          <div className="ft">
            <a className="logo" href="/"><span className="mark" />Método Barron</a>
            <div className="flinks">
              <a href="/">Começar</a>
              <a href="/termos">Termos</a>
              <a href="/privacidade">Privacidade</a>
              <a className="fig" href="https://www.instagram.com/mtdbarron/" target="_blank" rel="noopener">Instagram</a>
              <a className="fig" href="https://www.tiktok.com/@mtdbarron" target="_blank" rel="noopener">TikTok</a>
              <a className="btn line sm" href={TELEGRAM} target="_blank" rel="noopener">Entre na Tropa do Barron</a>
            </div>
          </div>
          <div className="warn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffd27a" strokeWidth="2" style={{ flex: "none", marginTop: 2 }} aria-hidden="true">
              <path d="M12 3 2 21h20z" />
              <path d="M12 10v5M12 18h.01" />
            </svg>
            <p>
              <b>Aviso:</b> este é um conteúdo exclusivamente educacional e não constitui recomendação de investimento. Day trade envolve alto risco e você pode perder parte ou todo o capital investido. Resultados passados não garantem resultados futuros.
            </p>
          </div>
          <div className="copy">
            <span>
              © {year} Método Barron. <span>Todos os direitos reservados.</span> · <a href="/termos">Termos</a> · <a href="/privacidade">Privacidade</a> · <a href="/afiliados">Afiliados</a>
            </span>
            <span>Feito com método, não com promessa.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

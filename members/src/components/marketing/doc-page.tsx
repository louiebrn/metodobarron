import type { ReactNode } from "react";
import "./docs.css";

function BrandMark({ variant }: { variant: "svg" | "clip" }) {
  if (variant === "clip") {
    return (
      <div className="brand-mark brand-mark-clip" aria-hidden="true">
        <span>B</span>
      </div>
    );
  }
  return (
    <svg className="brand-mark" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="docBrand" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f2545a" />
          <stop offset="100%" stopColor="#a4222b" />
        </linearGradient>
      </defs>
      <polygon points="50,3 92,18 92,60 50,97 8,60 8,18" fill="url(#docBrand)" />
      <text
        x="50"
        y="63"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontSize="42"
        fill="#ffffff"
        textAnchor="middle"
      >
        B
      </text>
    </svg>
  );
}

export function DocPage({
  variant = "clip",
  thanks = false,
  children,
  footer,
}: {
  variant?: "svg" | "clip";
  thanks?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className={thanks ? "mdoc mdoc-thanks" : "mdoc"}>
      <header>
        <div className="container">
          <a href="/" className="brand">
            <BrandMark variant={variant} />
            <span className="brand-name">Método Barron</span>
          </a>
        </div>
      </header>
      <main>
        <div className="container">{children}</div>
      </main>
      <footer>
        <div className="container">
          © 2026 Método Barron. <a href="/">Voltar ao início</a>
          {footer}
        </div>
      </footer>
    </div>
  );
}

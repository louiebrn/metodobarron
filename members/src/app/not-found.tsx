import type { Metadata } from "next";
import "@/components/marketing/docs.css";

export const metadata: Metadata = {
  title: { absolute: "Página Não Encontrada — Método Barron" },
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mdoc-404">
      <div>
        <div className="brand-mark">
          <span>B</span>
        </div>
        <div className="code">404</div>
        <h1>Essa página não existe (ainda).</h1>
        <p>O link pode estar quebrado ou a página pode ter mudado de endereço. Vamos te levar de volta.</p>
        <a href="/" className="btn">
          Voltar ao Início
        </a>
      </div>
    </div>
  );
}

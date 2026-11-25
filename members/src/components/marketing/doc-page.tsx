import type { ReactNode } from "react";
import { MarketingChrome } from "./marketing-chrome";
import "./home.css";
import "./docs.css";

export function DocPage({
  thanks = false,
  children,
}: {
  variant?: "svg" | "clip";
  thanks?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <MarketingChrome>
      <main className={thanks ? "doc doc-thanks" : "doc"}>
        <div className="wrap">{children}</div>
      </main>
    </MarketingChrome>
  );
}

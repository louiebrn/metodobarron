"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/painel", label: "Início" },
  { href: "/modulos", label: "Módulos" },
  { href: "/ranking", label: "Ranking" },
  { href: "/conta", label: "Conta" },
];

function Icon({ name }: { name: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, viewBox: "0 0 24 24" };
  if (name === "Início") {
    return (
      <svg {...common} width="18" height="18" aria-hidden="true">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
      </svg>
    );
  }
  if (name === "Módulos") {
    return (
      <svg {...common} width="18" height="18" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 9h8M8 13h8M8 17h5" />
      </svg>
    );
  }
  if (name === "Ranking") {
    return (
      <svg {...common} width="18" height="18" aria-hidden="true">
        <path d="M7 20V10M12 20V4M17 20v-6" />
      </svg>
    );
  }
  return (
    <svg {...common} width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="8" r="3" />
      <path d="M5 19c1.5-3 3.8-4.5 7-4.5S17.5 16 19 19" />
    </svg>
  );
}

export function Nav({ variant }: { variant: "tab" | "desktop" }) {
  const pathname = usePathname();
  return (
    <nav className={variant === "tab" ? "tabbar" : "desktop-nav"} aria-label="Área de membros">
      {LINKS.map((link) => {
        const current = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link key={link.href} href={link.href} aria-current={current ? "page" : undefined}>
            {variant === "tab" ? <Icon name={link.label} /> : null}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

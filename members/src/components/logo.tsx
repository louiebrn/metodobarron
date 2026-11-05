export function Logo({ href, label = "Método Barron" }: { href: string; label?: string }) {
  return (
    <a className="logo" href={href}>
      <span className="mark" aria-hidden="true" />
      {label}
    </a>
  );
}

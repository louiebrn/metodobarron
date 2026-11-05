const RESERVED = new Set([
  "admin",
  "barron",
  "metodo",
  "metodobarron",
  "suporte",
  "sistema",
  "root",
  "conta",
  "ranking",
  "modulos",
]);

export type UsernameResult =
  | { ok: true; username: string }
  | { ok: false; error: string };

export function validateUsername(raw: unknown): UsernameResult {
  const username = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return {
      ok: false,
      error: "Use de 3 a 20 caracteres: letras minúsculas, números e _.",
    };
  }
  if (RESERVED.has(username)) {
    return { ok: false, error: "Este nome de usuário não está disponível." };
  }
  return { ok: true, username };
}

export type EmailResult = { ok: true; email: string } | { ok: false; error: string };

export function validateEmail(raw: unknown): EmailResult {
  const email = String(raw ?? "").trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { ok: false, error: "Digite um e-mail válido." };
  }
  return { ok: true, email };
}

export type PasswordResult = { ok: true; password: string } | { ok: false; error: string };

export function validatePassword(raw: unknown): PasswordResult {
  const password = String(raw ?? "");
  if (password.length < 8) {
    return { ok: false, error: "A senha precisa ter pelo menos 8 caracteres." };
  }
  if (password.length > 128) {
    return { ok: false, error: "A senha pode ter no máximo 128 caracteres." };
  }
  return { ok: true, password };
}

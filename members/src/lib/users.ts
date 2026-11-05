import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { isUniqueError, one, withTx } from "./db";
import { hashPassword, verifyPassword } from "./passwords";
import { validateEmail, validatePassword, validateUsername } from "./validate";

export type UserRow = {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  created_at: number;
  updated_at: number;
};

const SESSION_MS = 30 * 24 * 60 * 60 * 1000;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type CreateUserResult =
  | { ok: true; userId: string }
  | { ok: false; error: string };

export async function createUser(
  db: DatabaseSync,
  input: { email: unknown; username: unknown; password: unknown },
): Promise<CreateUserResult> {
  const email = validateEmail(input.email);
  if (!email.ok) return email;
  const username = validateUsername(input.username);
  if (!username.ok) return username;
  const password = validatePassword(input.password);
  if (!password.ok) return password;

  const passwordHash = await hashPassword(password.password);
  const now = Date.now();
  const id = randomUUID();

  try {
    withTx(db, () => {
      db.prepare(
        `INSERT INTO users (id, email, username, password_hash, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      ).run(id, email.email, username.username, passwordHash, now, now);
      db.prepare(
        `UPDATE subscriptions
         SET user_id = ?
         WHERE email = ? AND (user_id IS NULL OR user_id = ?)`,
      ).run(id, email.email, id);
    });
  } catch (error) {
    if (isUniqueError(error, "users.email")) {
      return { ok: false, error: "Já existe uma conta com este e-mail. Entre para continuar." };
    }
    if (isUniqueError(error, "users.username")) {
      return { ok: false, error: "Este nome de usuário já está em uso." };
    }
    throw error;
  }

  return { ok: true, userId: id };
}

export async function authenticate(
  db: DatabaseSync,
  input: { email: unknown; password: unknown },
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const email = validateEmail(input.email);
  const password = typeof input.password === "string" ? input.password : "";
  const invalid = { ok: false as const, error: "E-mail ou senha incorretos." };
  if (!email.ok || !password) return invalid;
  const user = one<UserRow>(db, "SELECT * FROM users WHERE email = ?", email.email);
  if (!user) return invalid;
  const match = await verifyPassword(password, user.password_hash);
  if (!match) return invalid;
  return { ok: true, userId: user.id };
}

export function openSession(db: DatabaseSync, userId: string, now = Date.now()): string {
  const token = randomBytes(32).toString("base64url");
  db.prepare(
    `INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(randomUUID(), userId, hashToken(token), now + SESSION_MS, now);
  return token;
}

export function closeSession(db: DatabaseSync, token: string): void {
  db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
}

export function userFromToken(db: DatabaseSync, token: string, now = Date.now()): UserRow | undefined {
  if (!token) return undefined;
  const row = one<UserRow>(
    db,
    `SELECT u.* FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > ?`,
    hashToken(token),
    now,
  );
  if (!row) {
    db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  }
  return row;
}

export function changeUsername(
  db: DatabaseSync,
  userId: string,
  raw: unknown,
): { ok: true; username: string } | { ok: false; error: string } {
  const username = validateUsername(raw);
  if (!username.ok) return username;
  try {
    const result = db
      .prepare("UPDATE users SET username = ?, updated_at = ? WHERE id = ?")
      .run(username.username, Date.now(), userId);
    if (result.changes !== 1) return { ok: false, error: "Não foi possível atualizar o nome." };
  } catch (error) {
    if (isUniqueError(error, "users.username")) {
      return { ok: false, error: "Este nome de usuário já está em uso." };
    }
    throw error;
  }
  return { ok: true, username: username.username };
}

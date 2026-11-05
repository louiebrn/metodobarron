import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

/**
 * Local SQLite via Node's built-in driver (no native addon).
 * Server-only: do not import this module from client components.
 * The file is fine for `next dev` and a host with a persistent disk.
 * It is not durable on serverless filesystems — see members/README.md.
 */

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  user_id TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL,
  current_period_end INTEGER,
  source TEXT NOT NULL DEFAULT 'stripe',
  last_event_created INTEGER,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_customer ON subscriptions(stripe_customer_id);

CREATE TABLE IF NOT EXISTS progress (
  user_id TEXT NOT NULL,
  module_slug TEXT NOT NULL,
  quiz_completed_at INTEGER,
  practice_completed_at INTEGER,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, module_slug)
);

CREATE TABLE IF NOT EXISTS point_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('quiz', 'practice')),
  module_slug TEXT NOT NULL,
  points INTEGER NOT NULL,
  month_key TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE (user_id, kind, module_slug, month_key)
);
CREATE INDEX IF NOT EXISTS point_events_month ON point_events(month_key, user_id);

CREATE TABLE IF NOT EXISTS monthly_scores (
  user_id TEXT NOT NULL,
  month_key TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  quiz_points INTEGER NOT NULL DEFAULT 0,
  practice_points INTEGER NOT NULL DEFAULT 0,
  score_reached_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, month_key)
);

CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  received_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id TEXT NOT NULL,
  module_slug TEXT NOT NULL,
  lesson_slug TEXT NOT NULL,
  completed_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, module_slug, lesson_slug)
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  user_id TEXT NOT NULL,
  module_slug TEXT NOT NULL,
  month_key TEXT NOT NULL,
  answers TEXT NOT NULL,
  correct_count INTEGER NOT NULL,
  points INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, module_slug, month_key)
);

CREATE TABLE IF NOT EXISTS practice_marks (
  user_id TEXT NOT NULL,
  module_slug TEXT NOT NULL,
  month_key TEXT NOT NULL,
  item_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, module_slug, month_key, item_id)
);
`;

export type Sql = string | number | bigint | null | Uint8Array;

export function openDatabase(filename: string): DatabaseSync {
  const db = new DatabaseSync(filename);
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA busy_timeout = 3000;");
  if (filename !== ":memory:") {
    db.exec("PRAGMA journal_mode = WAL;");
  }
  db.exec(SCHEMA);
  return db;
}

const globalForDb = globalThis as unknown as { mbDb?: DatabaseSync };

export function databasePath(): string {
  return process.env.DATABASE_PATH?.trim() || path.join(process.cwd(), "data", "members.db");
}

export function getDb(): DatabaseSync {
  if (!globalForDb.mbDb) {
    const filename = databasePath();
    if (filename !== ":memory:") {
      fs.mkdirSync(path.dirname(filename), { recursive: true });
    }
    globalForDb.mbDb = openDatabase(filename);
  }
  return globalForDb.mbDb;
}

export function one<T>(db: DatabaseSync, sql: string, ...params: Sql[]): T | undefined {
  return db.prepare(sql).get(...params) as T | undefined;
}

export function many<T>(db: DatabaseSync, sql: string, ...params: Sql[]): T[] {
  return db.prepare(sql).all(...params) as T[];
}

export function withTx<T>(db: DatabaseSync, fn: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      /* already rolled back */
    }
    throw error;
  }
}

export function isUniqueError(error: unknown, column: string): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("UNIQUE constraint failed") && message.includes(column);
}

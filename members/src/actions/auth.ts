"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { allow } from "@/lib/rate-limit";
import { endSession, startSession } from "@/lib/session";
import { authenticate, createUser } from "@/lib/users";
import { validateEmail } from "@/lib/validate";

export type FormState = { error: string };

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = validateEmail(formData.get("email"));
  const key = email.ok ? email.email : "invalid";
  if (!allow(`login:${key}`, 10, 15 * 60 * 1000)) {
    return { error: "Muitas tentativas. Espere alguns minutos e tente de novo." };
  }
  const result = await authenticate(getDb(), {
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!result.ok) return { error: result.error };
  await startSession(result.userId);
  redirect("/painel");
}

export async function signup(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = validateEmail(formData.get("email"));
  const key = email.ok ? email.email : "invalid";
  if (!allow(`signup:${key}`, 8, 60 * 60 * 1000)) {
    return { error: "Muitas tentativas. Espere alguns minutos e tente de novo." };
  }
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password !== confirm) return { error: "As senhas não coincidem." };
  const result = await createUser(getDb(), {
    email: formData.get("email"),
    username: formData.get("username"),
    password,
  });
  if (!result.ok) return { error: result.error };
  await startSession(result.userId);
  redirect("/painel");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/entrar");
}

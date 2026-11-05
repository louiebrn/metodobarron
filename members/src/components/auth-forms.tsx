"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, signup, type FormState } from "@/actions/auth";

function Submit({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
      {pending ? "Aguarde…" : children}
    </button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(login, { error: "" } satisfies FormState);
  return (
    <form action={action}>
      {state.error ? (
        <p className="alert alert-bad" role="alert">
          {state.error}
        </p>
      ) : null}
      <label className="field">
        <span>E-mail</span>
        <input name="email" type="email" autoComplete="email" required placeholder="voce@email.com" />
      </label>
      <label className="field">
        <span>Senha</span>
        <input name="password" type="password" autoComplete="current-password" required minLength={8} />
      </label>
      <Submit>Entrar</Submit>
    </form>
  );
}

export function SignupForm() {
  const [state, action] = useActionState(signup, { error: "" } satisfies FormState);
  return (
    <form action={action}>
      {state.error ? (
        <p className="alert alert-bad" role="alert">
          {state.error}
        </p>
      ) : null}
      <label className="field">
        <span>E-mail</span>
        <input name="email" type="email" autoComplete="email" required placeholder="o mesmo e-mail da compra" />
      </label>
      <label className="field">
        <span>Nome de usuário</span>
        <input name="username" type="text" autoComplete="username" required minLength={3} maxLength={20} placeholder="ana_trades" />
        <small className="hint">Aparece no ranking. 3 a 20 caracteres: letras, números e _.</small>
      </label>
      <label className="field">
        <span>Senha</span>
        <input name="password" type="password" autoComplete="new-password" required minLength={8} />
      </label>
      <label className="field">
        <span>Confirmar senha</span>
        <input name="confirm" type="password" autoComplete="new-password" required minLength={8} />
      </label>
      <Submit>Criar conta</Submit>
    </form>
  );
}

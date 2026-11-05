"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { openPortal, updateUsername, type UsernameState } from "@/actions/account";

function Submit({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary" type="submit" disabled={pending}>
      {pending ? "Aguarde…" : children}
    </button>
  );
}

export function UsernameForm({ username }: { username: string }) {
  const [state, action] = useActionState(updateUsername, {
    error: "",
    ok: false,
    username: "",
  } satisfies UsernameState);
  const shown = state.ok && state.username ? state.username : username;
  return (
    <form action={action} key={shown}>
      {state.error ? (
        <p className="alert alert-bad" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? <p className="alert alert-ok">Nome atualizado para @{state.username}.</p> : null}
      <label className="field">
        <span>Nome de usuário</span>
        <input name="username" type="text" required minLength={3} maxLength={20} defaultValue={shown} autoComplete="username" />
      </label>
      <Submit>Salvar nome</Submit>
    </form>
  );
}

export function PortalButton() {
  const [state, action] = useActionState(openPortal, { error: "" });
  return (
    <form action={action}>
      {state.error ? (
        <p className="alert alert-warn" role="alert">
          {state.error}
        </p>
      ) : null}
      <Submit>Gerir assinatura</Submit>
    </form>
  );
}

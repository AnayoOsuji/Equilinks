"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type LoginState } from "./actions";

export function LoginForm({
  nextPath,
  forbidden,
}: {
  nextPath: string;
  forbidden: boolean;
}) {
  const [state, action, pending] = useActionState<LoginState | undefined, FormData>(login, undefined);
  const message =
    state?.error ??
    (forbidden ? "Only a Super Admin account can open this dashboard." : null);

  return (
    <form className="login-form" action={action}>
      <input type="hidden" name="next" value={nextPath} />
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="username"
        placeholder="you@school.edu"
        defaultValue={state?.email ?? ""}
        key={state?.email ?? "email"}
        required
      />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Your password"
        required
      />
      {message ? (
        <p className="login-error" role="alert">
          {message}
        </p>
      ) : null}
      <button className="primary-link login-submit" type="submit" disabled={pending}>
        <span>{pending ? "Signing in…" : "Sign in"}</span>
      </button>
      <Link className="login-home" href="/">
        Back to Equilinks
      </Link>
    </form>
  );
}

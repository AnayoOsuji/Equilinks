import { Suspense } from "react";
import Link from "next/link";
import { safeInternalPath } from "@/lib/auth-paths";
import { LoginForm } from "./login-form";

type LoginSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function LoginPage({ searchParams }: { searchParams: LoginSearchParams }) {
  return (
    <main className="login-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Equilinks home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
          </span>
          <span>
            equi<span className="brand-light">links</span>
          </span>
        </Link>
      </header>

      <section className="login-panel" aria-labelledby="login-title">        
        <h1 id="login-title">Login</h1><br />
        <Suspense fallback={<p className="login-copy">Loading sign in…</p>}>
          <LoginPanel searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}

async function LoginPanel({ searchParams }: { searchParams: LoginSearchParams }) {
  const params = await searchParams;
  const nextPath = safeInternalPath(typeof params.next === "string" ? params.next : null) ?? "";
  const forbidden = params.error === "forbidden";

  return <LoginForm nextPath={nextPath} forbidden={forbidden} />;
}

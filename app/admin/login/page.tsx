import "../admin.css";
import { loginAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function LoginPage(props: {
  searchParams?: Promise<{ error?: string; next?: string }>;
}) {
  const sp = (await props.searchParams) ?? {};
  return (
    <div className="login-shell">
      <div className="login-card">
        <div>
          <h1>Modern Rehab — Admin</h1>
          <p className="sub">Enter the owner password to continue.</p>
        </div>
        {sp.error && (
          <div className="login-err">Incorrect password. Try again.</div>
        )}
        <form className="login-form" action={loginAction}>
          <input type="hidden" name="next" value={sp.next ?? "/admin"} />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            autoComplete="current-password"
            autoFocus
            required
          />
          <button type="submit">Sign in →</button>
        </form>
        <div className="login-help">
          Local default: <code>modernrehab</code>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import "../admin.css";
import { listBookings, listClients } from "../../../lib/store";
import { logoutAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [upcoming, clients] = await Promise.all([
    listBookings({ filter: "upcoming" }),
    listClients(),
  ]);

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <Link href="/admin" className="admin-brand">
            <svg viewBox="0 0 100 100" width="28" height="28" aria-label="Modern Rehab">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#E67E2A" strokeWidth="6" />
              <text x="50" y="64" textAnchor="middle" fontSize="40" fill="#E67E2A" fontWeight="800" letterSpacing="-2">MR</text>
            </svg>
            <div>
              <div className="admin-brand-name">Modern Rehab</div>
              <div className="admin-brand-sub">Clinic Admin</div>
            </div>
          </Link>
        </div>
        <nav className="admin-nav">
          <Link href="/admin">Overview</Link>
          <Link href="/admin/bookings">
            Bookings <span className="count">{upcoming.length}</span>
          </Link>
          <Link href="/admin/clients">
            Clients <span className="count">{clients.length}</span>
          </Link>
          <Link href="/" target="_blank" rel="noreferrer">
            Public site ↗
          </Link>
        </nav>
        <div className="admin-side-foot">
          <form action={logoutAction}>
            <button className="admin-logout" type="submit">
              ← Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}

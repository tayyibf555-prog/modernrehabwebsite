import Link from "next/link";
import {
  listClients,
  listBookings,
  prettyDate,
} from "../../../../lib/store";

export const dynamic = "force-dynamic";

export default async function ClientsPage(props: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const sp = (await props.searchParams) ?? {};
  const search = sp.q?.trim() || "";
  const [clients, allBookings] = await Promise.all([
    listClients({ search }),
    listBookings({ filter: "all" }),
  ]);

  const visitCounts = new Map<string, number>();
  for (const b of allBookings) {
    if (b.status !== "attended") continue;
    visitCounts.set(b.clientId, (visitCounts.get(b.clientId) ?? 0) + 1);
  }

  return (
    <>
      <header className="admin-pagehead">
        <div>
          <span className="admin-eyebrow">Clients</span>
          <h1 className="admin-h1">All clients</h1>
          <p className="admin-sub">
            Search by name, email or phone. {clients.length} total.
          </p>
        </div>
      </header>

      <div className="filter-bar">
        <form className="filter-search" action="/admin/clients" method="get">
          <input
            name="q"
            placeholder="Search name, email or phone..."
            defaultValue={search}
            autoComplete="off"
          />
        </form>
        {search && (
          <Link href="/admin/clients" className="btn-sm">
            Clear
          </Link>
        )}
      </div>

      {clients.length === 0 ? (
        <p className="kv-val muted">No clients match that search.</p>
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Visits</th>
                <th>Last visit</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td className="cell-bold cell-name">
                    <Link href={`/admin/clients/${c.id}`}>{c.fullName}</Link>
                    {c.tags.length > 0 && (
                      <div className="tags" style={{ marginTop: 4 }}>
                        {c.tags.slice(0, 3).map((t) => (
                          <span key={t} className="pill pill-tag">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="cell-mono">{c.email}</td>
                  <td className="cell-mono">{c.phone}</td>
                  <td>
                    {c.isReturning ? (
                      <span className="pill pill-returning">Returning</span>
                    ) : (
                      <span className="pill pill-new">New</span>
                    )}
                  </td>
                  <td className="cell-bold" style={{ textAlign: "right" }}>
                    {visitCounts.get(c.id) ?? 0}
                  </td>
                  <td className="cell-mono">
                    {c.lastSeenAt ? prettyDate(new Date(c.lastSeenAt)) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

import Link from "next/link";
import {
  getOverview,
  listBookings,
  listClients,
  recentActivity,
  formatPence,
  prettyDateTime,
  relativeTime,
  listServices,
} from "../../../lib/store";

export default async function AdminOverview() {
  const [overview, today, services, clients, feed] = await Promise.all([
    getOverview(),
    listBookings({ filter: "today" }),
    listServices(),
    listClients(),
    recentActivity(10),
  ]);
  const serviceMap = new Map(services.map((s) => [s.id, s]));
  const clientMap = new Map(clients.map((c) => [c.id, c]));

  return (
    <>
      <header className="admin-pagehead">
        <div>
          <span className="admin-eyebrow">Overview</span>
          <h1 className="admin-h1">Hello James.</h1>
          <p className="admin-sub">
            What's on today, what's coming up this week, and who's new.
          </p>
        </div>
        <Link href="/admin/bookings" className="btn-sm primary">
          View all bookings →
        </Link>
      </header>

      <section className="stat-grid">
        <div className="stat-card accent">
          <div className="stat-lab">Today</div>
          <div className="stat-num">
            {overview.todayBookings}
            <span className="unit">{overview.todayBookings === 1 ? "session" : "sessions"}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-lab">This week revenue</div>
          <div className="stat-num">{formatPence(overview.weekRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lab">Next 7 days booked</div>
          <div className="stat-num">{overview.upcomingNext7}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lab">Total clients</div>
          <div className="stat-num">
            {overview.totalClients}
            <span className="unit">+{overview.newClientsThisMonth} this month</span>
          </div>
        </div>
      </section>

      <section className="dash-grid">
        <div className="panel">
          <div className="panel-head">
            <h3>Today's schedule</h3>
            <Link href="/admin/bookings?filter=today" className="panel-action">
              All today →
            </Link>
          </div>
          {today.length === 0 ? (
            <p className="kv-val muted">No sessions today.</p>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {today.map((b) => {
                  const c = clientMap.get(b.clientId);
                  const svc = serviceMap.get(b.serviceId);
                  return (
                    <tr key={b.id} className={b.status === "cancelled" ? "is-cancelled" : ""}>
                      <td>
                        <Link href={`/admin/bookings/${b.id}`} className="cell-mono" style={{ color: "var(--mr-ink)", fontWeight: 600 }}>
                          {b.slot}
                        </Link>
                      </td>
                      <td className="cell-bold cell-name">
                        <Link href={`/admin/clients/${b.clientId}`}>{c?.fullName ?? "Unknown"}</Link>
                      </td>
                      <td>{svc?.name ?? b.serviceId}</td>
                      <td>
                        <StatusPill status={b.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Recent activity</h3>
          </div>
          <div className="feed">
            {feed.map((e, i) => (
              <div className="feed-item" key={i}>
                <span className={`feed-dot kind-${e.kind}`} />
                <span className="feed-summary">{e.summary}</span>
                <span className="feed-when">{relativeTime(e.at)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dash-grid" style={{ marginTop: 16 }}>
        <div className="panel">
          <div className="panel-head">
            <h3>Upcoming bookings (next 14)</h3>
            <Link href="/admin/bookings" className="panel-action">
              All upcoming →
            </Link>
          </div>
          <UpcomingList />
        </div>
        <div className="panel">
          <div className="panel-head">
            <h3>Services</h3>
            <span className="cell-mono">{services.length} live</span>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Service</th>
                <th style={{ textAlign: "right" }}>Price</th>
                <th style={{ textAlign: "right" }}>Returning</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="cell-bold">{s.name}</div>
                    <div className="cell-mono">{s.tag} · {s.durationMin}min</div>
                  </td>
                  <td className="cell-bold" style={{ textAlign: "right" }}>
                    {formatPence(s.price)}
                  </td>
                  <td className="cell-orange" style={{ textAlign: "right" }}>
                    {s.returningPrice != null ? formatPence(s.returningPrice) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

async function UpcomingList() {
  const [bookings, services, clients] = await Promise.all([
    listBookings({ filter: "upcoming" }),
    listServices(),
    listClients(),
  ]);
  const serviceMap = new Map(services.map((s) => [s.id, s]));
  const clientMap = new Map(clients.map((c) => [c.id, c]));
  const next = bookings.slice(0, 14);
  if (!next.length) return <p className="kv-val muted">Nothing upcoming.</p>;
  return (
    <table className="tbl">
      <thead>
        <tr>
          <th>When</th>
          <th>Client</th>
          <th>Service</th>
          <th style={{ textAlign: "right" }}>Price</th>
        </tr>
      </thead>
      <tbody>
        {next.map((b) => {
          const c = clientMap.get(b.clientId);
          const svc = serviceMap.get(b.serviceId);
          return (
            <tr key={b.id}>
              <td>
                <Link href={`/admin/bookings/${b.id}`} className="cell-mono" style={{ color: "var(--mr-ink)", fontWeight: 600 }}>
                  {prettyDateTime(new Date(b.scheduledAt))}
                </Link>
              </td>
              <td className="cell-bold cell-name">
                <Link href={`/admin/clients/${b.clientId}`}>{c?.fullName ?? "Unknown"}</Link>
              </td>
              <td>{svc?.name ?? b.serviceId}</td>
              <td className="cell-bold" style={{ textAlign: "right" }}>
                {formatPence(b.pricePaid)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function StatusPill({ status }: { status: string }) {
  return <span className={`pill pill-${status}`}>{status.replace("-", " ")}</span>;
}

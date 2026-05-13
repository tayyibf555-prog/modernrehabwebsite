import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getClient,
  listBookings,
  listServices,
  formatPence,
  prettyDate,
  prettyDateTime,
  relativeTime,
  type NoteEntry,
} from "../../../../../lib/store";
import {
  addClientNoteAction,
  setClientTagsAction,
} from "../../../actions";

export const dynamic = "force-dynamic";

export default async function ClientDetail(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const client = await getClient(id);
  if (!client) notFound();

  const [bookings, services] = await Promise.all([
    listBookings({ clientId: id, filter: "all" }),
    listServices(),
  ]);
  const serviceMap = new Map(services.map((s) => [s.id, s]));

  const attended = bookings.filter((b) => b.status === "attended");
  const totalSpent = attended.reduce((sum, b) => sum + b.pricePaid, 0);
  const upcoming = bookings.filter(
    (b) => new Date(b.scheduledAt) >= new Date() && b.status === "booked",
  );

  return (
    <>
      <header className="admin-pagehead">
        <div>
          <span className="admin-eyebrow">
            <Link href="/admin/clients" style={{ color: "inherit" }}>
              ← All clients
            </Link>
          </span>
          <h1 className="admin-h1">{client.fullName}</h1>
          <p className="admin-sub">
            {client.isReturning ? (
              <span className="pill pill-returning">Returning</span>
            ) : (
              <span className="pill pill-new">New</span>
            )}{" "}
            {client.tags.length > 0 && (
              <span className="tags" style={{ marginLeft: 8 }}>
                {client.tags.map((t) => (
                  <span key={t} className="pill pill-tag">{t}</span>
                ))}
              </span>
            )}
          </p>
        </div>
      </header>

      <section className="stat-grid">
        <div className="stat-card">
          <div className="stat-lab">Visits attended</div>
          <div className="stat-num">{attended.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lab">Total spent</div>
          <div className="stat-num">{formatPence(totalSpent)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lab">Upcoming</div>
          <div className="stat-num">{upcoming.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lab">Client since</div>
          <div className="stat-num" style={{ fontSize: 18 }}>
            {prettyDate(new Date(client.firstSeenAt))}
          </div>
        </div>
      </section>

      <section className="detail-grid">
        <div className="panel">
          <div className="panel-head">
            <h3>Booking history</h3>
            <span className="cell-mono">{bookings.length} total</span>
          </div>
          {bookings.length === 0 ? (
            <p className="kv-val muted">No bookings yet.</p>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Price</th>
                  <th className="cell-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const svc = serviceMap.get(b.serviceId);
                  const noteCount = Array.isArray(b.notes) ? b.notes.length : 0;
                  return (
                    <tr key={b.id} className={b.status === "cancelled" ? "is-cancelled" : ""}>
                      <td>
                        <Link
                          href={`/admin/bookings/${b.id}`}
                          className="cell-mono"
                          style={{ display: "block", color: "var(--mr-ink)", fontWeight: 600 }}
                        >
                          {prettyDateTime(new Date(b.scheduledAt))}
                        </Link>
                      </td>
                      <td>{svc?.name ?? b.serviceId}</td>
                      <td>
                        <span className={`pill pill-${b.status}`}>
                          {b.status.replace("-", " ")}
                        </span>
                        {noteCount > 0 && (
                          <span className="pill pill-tag" style={{ marginLeft: 6 }}>
                            {noteCount} note{noteCount === 1 ? "" : "s"}
                          </span>
                        )}
                      </td>
                      <td className="cell-bold" style={{ textAlign: "right" }}>
                        {formatPence(b.pricePaid)}
                      </td>
                      <td className="cell-actions">
                        <Link href={`/admin/bookings/${b.id}`} className="btn-sm primary">
                          Open →
                        </Link>
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
            <h3>Contact</h3>
          </div>
          <div className="kv-row">
            <span className="kv-lab">Email</span>
            <a className="kv-val" href={`mailto:${client.email}`}>{client.email}</a>
          </div>
          <div className="kv-row">
            <span className="kv-lab">Phone</span>
            <a className="kv-val" href={`tel:${client.phone}`}>{client.phone}</a>
          </div>
          <div className="kv-row">
            <span className="kv-lab">Client ID</span>
            <span className="kv-val cell-mono" style={{ fontSize: 12 }}>{client.id}</span>
          </div>

          <div className="panel-head" style={{ marginTop: 24 }}>
            <h3>Client notes</h3>
            <span className="cell-mono">
              {Array.isArray(client.notes) ? client.notes.length : 0} on file
            </span>
          </div>
          <ClientNotesTimeline notes={client.notes} />
          <form action={addClientNoteAction} className="note-form">
            <input type="hidden" name="id" value={client.id} />
            <textarea
              name="note"
              placeholder="Add a private clinical note about this client..."
              required
              rows={3}
            />
            <div className="actions">
              <button type="submit" className="btn-sm primary">
                Save note →
              </button>
            </div>
          </form>

          <div className="panel-head" style={{ marginTop: 24 }}>
            <h3>Tags</h3>
          </div>
          <form action={setClientTagsAction} className="note-form">
            <input type="hidden" name="id" value={client.id} />
            <input
              type="text"
              name="tags"
              defaultValue={client.tags.join(", ")}
              placeholder="comma, separated, tags"
              style={{
                background: "var(--mr-paper)",
                border: "1px solid var(--mr-rule)",
                borderRadius: 2,
                padding: "10px 12px",
                fontFamily: "var(--font-body)",
                fontSize: 13.5,
                color: "var(--mr-ink)",
              }}
            />
            <div className="actions">
              <button type="submit" className="btn-sm">
                Save tags
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

function ClientNotesTimeline({ notes }: { notes: NoteEntry[] }) {
  if (!Array.isArray(notes) || notes.length === 0) {
    return (
      <p className="kv-val muted" style={{ marginBottom: 12 }}>
        No client notes yet. Add the first one below.
      </p>
    );
  }
  const ordered = [...notes].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
  return (
    <ol className="notes-timeline">
      {ordered.map((n, i) => (
        <li key={`${n.at}-${i}`} className="note-entry">
          <div className="note-meta">
            <span className="note-when">{prettyDateTime(new Date(n.at))}</span>
            <span className="note-relative">{relativeTime(n.at)}</span>
            {n.author && <span className="note-author">· {n.author}</span>}
          </div>
          <p className="note-body">{n.body}</p>
        </li>
      ))}
    </ol>
  );
}

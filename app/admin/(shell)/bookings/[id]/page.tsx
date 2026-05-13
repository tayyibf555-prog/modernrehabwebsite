import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBooking,
  getClient,
  listServices,
  formatPence,
  prettyDate,
  prettyDateTime,
  relativeTime,
  type NoteEntry,
} from "../../../../../lib/store";
import {
  addBookingNoteAction,
  setBookingStatusAction,
} from "../../../actions";

export const dynamic = "force-dynamic";

export default async function BookingDetail(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const booking = await getBooking(id);
  if (!booking) notFound();

  const [client, services] = await Promise.all([
    getClient(booking.clientId),
    listServices(),
  ]);
  const service = services.find((s) => s.id === booking.serviceId);
  const notes: NoteEntry[] = Array.isArray(booking.notes) ? booking.notes : [];
  const orderedNotes = [...notes].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );

  return (
    <>
      <header className="admin-pagehead">
        <div>
          <span className="admin-eyebrow">
            <Link href="/admin/bookings" style={{ color: "inherit" }}>
              ← All bookings
            </Link>
          </span>
          <h1 className="admin-h1">
            Session — {prettyDateTime(new Date(booking.scheduledAt))}
          </h1>
          <p className="admin-sub">
            {service?.name ?? booking.serviceId}
            {client && (
              <>
                {" · "}
                <Link
                  href={`/admin/clients/${client.id}`}
                  style={{ color: "var(--mr-orange)" }}
                >
                  {client.fullName}
                </Link>
              </>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <StatusButton id={booking.id} clientId={booking.clientId} target="attended" current={booking.status} label="Mark attended" />
          <StatusButton id={booking.id} clientId={booking.clientId} target="cancelled" current={booking.status} label="Cancel" danger />
          <StatusButton id={booking.id} clientId={booking.clientId} target="no-show" current={booking.status} label="No-show" danger />
        </div>
      </header>

      <section className="stat-grid">
        <div className="stat-card accent">
          <div className="stat-lab">Status</div>
          <div className="stat-num" style={{ fontSize: 22 }}>
            <span className={`pill pill-${booking.status}`} style={{ fontSize: 11 }}>
              {booking.status.replace("-", " ")}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-lab">Price</div>
          <div className="stat-num">{formatPence(booking.pricePaid)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lab">Notes on file</div>
          <div className="stat-num">{notes.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lab">Booked</div>
          <div className="stat-num" style={{ fontSize: 18 }}>
            {prettyDate(new Date(booking.createdAt))}
          </div>
        </div>
      </section>

      <section className="detail-grid">
        <div className="panel">
          <div className="panel-head">
            <h3>Session notes</h3>
            <span className="cell-mono">{notes.length} on record</span>
          </div>
          {orderedNotes.length === 0 ? (
            <p className="kv-val muted" style={{ marginBottom: 12 }}>
              No session notes yet. Add the first one below.
            </p>
          ) : (
            <ol className="notes-timeline">
              {orderedNotes.map((n, i) => (
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
          )}
          <form action={addBookingNoteAction} className="note-form">
            <input type="hidden" name="id" value={booking.id} />
            <input type="hidden" name="clientId" value={booking.clientId} />
            <textarea
              name="note"
              placeholder="Add a session note. What did you work on, how did the client respond, what's next?"
              required
              rows={4}
            />
            <div className="actions">
              <button type="submit" className="btn-sm primary">
                Save session note →
              </button>
            </div>
          </form>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Booking detail</h3>
          </div>
          <div className="kv-row">
            <span className="kv-lab">When</span>
            <span className="kv-val">{prettyDateTime(new Date(booking.scheduledAt))}</span>
          </div>
          <div className="kv-row">
            <span className="kv-lab">Service</span>
            <span className="kv-val">
              {service?.name ?? booking.serviceId}
              {service && (
                <span className="kv-val muted" style={{ display: "block", fontSize: 12 }}>
                  {service.tag} · {service.durationMin}min
                </span>
              )}
            </span>
          </div>
          <div className="kv-row">
            <span className="kv-lab">Client</span>
            <span className="kv-val">
              {client ? (
                <Link href={`/admin/clients/${client.id}`} style={{ color: "var(--mr-orange)" }}>
                  {client.fullName}
                </Link>
              ) : (
                "—"
              )}
            </span>
          </div>
          {booking.presentingComplaint && (
            <div className="kv-row">
              <span className="kv-lab">Presenting</span>
              <span className="kv-val">{booking.presentingComplaint}</span>
            </div>
          )}
          <div className="kv-row">
            <span className="kv-lab">Booking ID</span>
            <span className="kv-val cell-mono" style={{ fontSize: 12 }}>
              {booking.id}
            </span>
          </div>
          {booking.cancelledAt && (
            <div className="kv-row">
              <span className="kv-lab">Cancelled</span>
              <span className="kv-val">{prettyDateTime(new Date(booking.cancelledAt))}</span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function StatusButton({
  id,
  clientId,
  target,
  current,
  label,
  danger,
}: {
  id: string;
  clientId: string;
  target: "attended" | "cancelled" | "no-show";
  current: string;
  label: string;
  danger?: boolean;
}) {
  const isCurrent = current === target;
  return (
    <form action={setBookingStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="clientId" value={clientId} />
      <input type="hidden" name="status" value={target} />
      <button
        type="submit"
        className={`btn-sm ${danger ? "danger" : "primary"}`}
        disabled={isCurrent}
        title={isCurrent ? `Already ${target}` : label}
      >
        {label}
      </button>
    </form>
  );
}

import Link from "next/link";
import {
  listBookings,
  listClients,
  listServices,
  formatPence,
  prettyDateTime,
  type BookingFilter,
  type BookingStatus,
} from "../../../../lib/store";
import { setBookingStatusAction, addBookingNoteAction } from "../../actions";

const FILTERS: Array<{ id: BookingFilter; label: string }> = [
  { id: "upcoming", label: "Upcoming" },
  { id: "today", label: "Today" },
  { id: "past", label: "Past" },
  { id: "all", label: "All" },
];

export default async function BookingsPage(props: {
  searchParams?: Promise<{ filter?: string; status?: string }>;
}) {
  const sp = (await props.searchParams) ?? {};
  const filter: BookingFilter = (FILTERS.find((f) => f.id === sp.filter)?.id ?? "upcoming") as BookingFilter;
  const status = sp.status as BookingStatus | undefined;

  const [bookings, services, clients] = await Promise.all([
    listBookings({ filter, status }),
    listServices(),
    listClients(),
  ]);
  const serviceMap = new Map(services.map((s) => [s.id, s]));
  const clientMap = new Map(clients.map((c) => [c.id, c]));

  return (
    <>
      <header className="admin-pagehead">
        <div>
          <span className="admin-eyebrow">Bookings</span>
          <h1 className="admin-h1">All bookings</h1>
          <p className="admin-sub">
            Filter by time window, mark attended / cancelled / no-show, and add
            per-session notes. Row total: <strong>{bookings.length}</strong>.
          </p>
        </div>
      </header>

      <div className="filter-bar">
        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <Link
              key={f.id}
              href={`/admin/bookings?filter=${f.id}${status ? `&status=${status}` : ""}`}
              className={filter === f.id ? "active" : ""}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <div className="filter-tabs" aria-label="Status">
          {(["booked", "attended", "cancelled", "no-show"] as BookingStatus[]).map((s) => (
            <Link
              key={s}
              href={`/admin/bookings?filter=${filter}${status === s ? "" : `&status=${s}`}`}
              className={status === s ? "active" : ""}
            >
              {s.replace("-", " ")}
            </Link>
          ))}
        </div>
      </div>

      {bookings.length === 0 ? (
        <p className="kv-val muted">No bookings match this filter.</p>
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>When</th>
                <th>Client</th>
                <th>Service</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Price</th>
                <th className="cell-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const c = clientMap.get(b.clientId);
                const svc = serviceMap.get(b.serviceId);
                return (
                  <tr key={b.id} className={b.status === "cancelled" ? "is-cancelled" : ""}>
                    <td>
                      <div className="cell-mono">{prettyDateTime(new Date(b.scheduledAt))}</div>
                      <div className="cell-mono" style={{ fontSize: 10, opacity: 0.7 }}>{b.id}</div>
                    </td>
                    <td className="cell-bold cell-name">
                      <Link href={`/admin/clients/${b.clientId}`}>{c?.fullName ?? "—"}</Link>
                      {c?.isReturning && (
                        <span className="pill pill-returning" style={{ marginLeft: 8 }}>Returning</span>
                      )}
                    </td>
                    <td>
                      <div>{svc?.name ?? b.serviceId}</div>
                      {b.presentingComplaint && (
                        <div className="cell-mono" style={{ fontSize: 10, opacity: 0.7 }}>
                          {b.presentingComplaint}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`pill pill-${b.status}`}>{b.status.replace("-", " ")}</span>
                    </td>
                    <td className="cell-bold" style={{ textAlign: "right" }}>
                      {formatPence(b.pricePaid)}
                    </td>
                    <td className="cell-actions">
                      <BookingRowActions
                        id={b.id}
                        clientId={b.clientId}
                        status={b.status}
                        notes={b.notes}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function BookingRowActions({
  id,
  clientId,
  status,
}: {
  id: string;
  clientId: string;
  status: BookingStatus;
  notes: string;
}) {
  return (
    <div style={{ display: "inline-flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
      <StatusForm id={id} clientId={clientId} target="attended" current={status} label="Mark attended" />
      <StatusForm id={id} clientId={clientId} target="cancelled" current={status} label="Cancel" danger />
      <StatusForm id={id} clientId={clientId} target="no-show" current={status} label="No-show" danger />
    </div>
  );
}

function StatusForm({
  id,
  clientId,
  target,
  current,
  label,
  danger,
}: {
  id: string;
  clientId: string;
  target: BookingStatus;
  current: BookingStatus;
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
        className={`btn-sm ${danger ? "danger" : ""}`}
        type="submit"
        disabled={isCurrent}
        title={isCurrent ? `Already ${target}` : label}
      >
        {label}
      </button>
    </form>
  );
}

export const dynamic = "force-dynamic";

// Note input is rendered on the client-detail page; the bookings list keeps
// row width manageable. Future v2: expandable row with note textarea.
export { addBookingNoteAction };

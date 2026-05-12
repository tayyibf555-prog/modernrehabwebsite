/**
 * Storage adapter — JSON file backed for local development.
 *
 * For production, swap the implementation of `loadStore` / `saveStore`
 * with a Postgres/Drizzle implementation. The exported functions and
 * their signatures must NOT change — every admin page consumes them.
 *
 * See CRM-SOP.md for the production upgrade procedure.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { SEED } from "./seed";

const STORE_PATH = path.join(process.cwd(), "data", "store.json");

export type Service = {
  id: string;
  name: string;
  price: number;          // pence
  returningPrice: number | null;
  durationMin: number;
  tag: string;
  description: string;
  position: number;
};

export type Client = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  firstSeenAt: string;     // ISO
  lastSeenAt: string | null;
  isReturning: boolean;
  notes: string;
  tags: string[];
};

export type BookingStatus = "booked" | "attended" | "cancelled" | "no-show";

export type Booking = {
  id: string;
  clientId: string;
  serviceId: string;
  scheduledAt: string;       // ISO
  slot: string;              // "08:00"
  status: BookingStatus;
  pricePaid: number;         // pence; effective price after returning discount
  notes: string;
  presentingComplaint: string;
  createdAt: string;
  cancelledAt: string | null;
};

export type Store = {
  services: Service[];
  clients: Client[];
  bookings: Booking[];
  meta: { seededAt: string; version: number };
};

// =====================================================================
// File I/O
// =====================================================================
async function loadStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw) as Store;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      const seed = SEED();
      await saveStore(seed);
      return seed;
    }
    throw err;
  }
}

async function saveStore(store: Store): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}

// =====================================================================
// Queries — used by admin pages
// =====================================================================
export async function listServices(): Promise<Service[]> {
  const s = await loadStore();
  return [...s.services].sort((a, b) => a.position - b.position);
}

export async function listClients(opts?: { search?: string }): Promise<Client[]> {
  const s = await loadStore();
  let clients = [...s.clients];
  if (opts?.search) {
    const q = opts.search.toLowerCase().trim();
    clients = clients.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        normalisePhone(c.phone).includes(normalisePhone(q)),
    );
  }
  return clients.sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export async function getClient(id: string): Promise<Client | null> {
  const s = await loadStore();
  return s.clients.find((c) => c.id === id) ?? null;
}

export type BookingFilter = "upcoming" | "past" | "today" | "all";

export async function listBookings(opts?: {
  filter?: BookingFilter;
  status?: BookingStatus;
  clientId?: string;
}): Promise<Booking[]> {
  const s = await loadStore();
  let bookings = [...s.bookings];
  if (opts?.clientId) bookings = bookings.filter((b) => b.clientId === opts.clientId);
  if (opts?.status) bookings = bookings.filter((b) => b.status === opts.status);
  const now = new Date();
  if (opts?.filter === "upcoming") {
    bookings = bookings.filter((b) => new Date(b.scheduledAt) >= now && b.status !== "cancelled");
  } else if (opts?.filter === "past") {
    bookings = bookings.filter((b) => new Date(b.scheduledAt) < now);
  } else if (opts?.filter === "today") {
    bookings = bookings.filter((b) => isSameDay(new Date(b.scheduledAt), now));
  }
  return bookings.sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  );
}

export async function getBooking(id: string): Promise<Booking | null> {
  const s = await loadStore();
  return s.bookings.find((b) => b.id === id) ?? null;
}

// =====================================================================
// Aggregates
// =====================================================================
export async function getOverview(): Promise<{
  todayBookings: number;
  weekRevenue: number;
  weekBookings: number;
  upcomingNext7: number;
  totalClients: number;
  newClientsThisMonth: number;
}> {
  const s = await loadStore();
  const now = new Date();
  const startOfWeek = startOfISOWeek(now);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  const in7 = new Date(now);
  in7.setDate(in7.getDate() + 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const todayBookings = s.bookings.filter(
    (b) => isSameDay(new Date(b.scheduledAt), now) && b.status !== "cancelled",
  ).length;

  const thisWeek = s.bookings.filter((b) => {
    const d = new Date(b.scheduledAt);
    return d >= startOfWeek && d < endOfWeek;
  });

  const weekRevenue = thisWeek
    .filter((b) => b.status === "attended")
    .reduce((sum, b) => sum + b.pricePaid, 0);

  const upcomingNext7 = s.bookings.filter((b) => {
    const d = new Date(b.scheduledAt);
    return d >= now && d <= in7 && b.status === "booked";
  }).length;

  const newClientsThisMonth = s.clients.filter(
    (c) => new Date(c.firstSeenAt) >= startOfMonth,
  ).length;

  return {
    todayBookings,
    weekRevenue,
    weekBookings: thisWeek.length,
    upcomingNext7,
    totalClients: s.clients.length,
    newClientsThisMonth,
  };
}

export async function recentActivity(limit = 12): Promise<
  Array<{
    kind: "booked" | "attended" | "cancelled" | "client-added";
    at: string;
    booking?: Booking;
    client?: Client;
    summary: string;
  }>
> {
  const s = await loadStore();
  const clientMap = new Map(s.clients.map((c) => [c.id, c]));
  const events: Array<{
    kind: "booked" | "attended" | "cancelled" | "client-added";
    at: string;
    booking?: Booking;
    client?: Client;
    summary: string;
  }> = [];

  for (const b of s.bookings) {
    const c = clientMap.get(b.clientId);
    if (!c) continue;
    const svc = s.services.find((sv) => sv.id === b.serviceId);
    events.push({
      kind: "booked",
      at: b.createdAt,
      booking: b,
      client: c,
      summary: `${c.fullName} booked ${svc?.name ?? b.serviceId} — ${prettyDate(new Date(b.scheduledAt))}`,
    });
    if (b.status === "attended") {
      events.push({
        kind: "attended",
        at: b.scheduledAt,
        booking: b,
        client: c,
        summary: `${c.fullName} attended ${svc?.name ?? b.serviceId}`,
      });
    } else if (b.status === "cancelled" && b.cancelledAt) {
      events.push({
        kind: "cancelled",
        at: b.cancelledAt,
        booking: b,
        client: c,
        summary: `${c.fullName} cancelled ${svc?.name ?? b.serviceId}`,
      });
    }
  }

  for (const c of s.clients) {
    events.push({
      kind: "client-added",
      at: c.firstSeenAt,
      client: c,
      summary: `${c.fullName} registered`,
    });
  }

  return events
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit);
}

// =====================================================================
// Mutations — used by server actions
// =====================================================================
export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<void> {
  const s = await loadStore();
  const b = s.bookings.find((x) => x.id === id);
  if (!b) throw new Error("Booking not found");
  b.status = status;
  if (status === "cancelled") b.cancelledAt = new Date().toISOString();
  if (status === "attended") {
    // Update client's last-seen + returning flag
    const c = s.clients.find((c) => c.id === b.clientId);
    if (c) {
      c.lastSeenAt = b.scheduledAt;
      const attendedCount = s.bookings.filter(
        (x) => x.clientId === c.id && x.status === "attended",
      ).length;
      c.isReturning = attendedCount >= 1;
    }
  }
  await saveStore(s);
}

export async function appendBookingNote(id: string, note: string): Promise<void> {
  const s = await loadStore();
  const b = s.bookings.find((x) => x.id === id);
  if (!b) throw new Error("Booking not found");
  const stamp = new Date().toISOString();
  const trimmed = note.trim();
  if (!trimmed) return;
  b.notes = (b.notes ? `${b.notes}\n` : "") + `[${stamp}] ${trimmed}`;
  await saveStore(s);
}

export async function appendClientNote(id: string, note: string): Promise<void> {
  const s = await loadStore();
  const c = s.clients.find((x) => x.id === id);
  if (!c) throw new Error("Client not found");
  const stamp = new Date().toISOString();
  const trimmed = note.trim();
  if (!trimmed) return;
  c.notes = (c.notes ? `${c.notes}\n` : "") + `[${stamp}] ${trimmed}`;
  await saveStore(s);
}

export async function setClientTags(id: string, tags: string[]): Promise<void> {
  const s = await loadStore();
  const c = s.clients.find((x) => x.id === id);
  if (!c) throw new Error("Client not found");
  c.tags = tags.map((t) => t.trim()).filter(Boolean);
  await saveStore(s);
}

export type BookingDraft = {
  clientId: string;
  serviceId: string;
  scheduledAt: string;
  presentingComplaint?: string;
};

export async function createBooking(draft: BookingDraft): Promise<Booking> {
  const s = await loadStore();
  const svc = s.services.find((x) => x.id === draft.serviceId);
  if (!svc) throw new Error("Service not found");
  const client = s.clients.find((x) => x.id === draft.clientId);
  if (!client) throw new Error("Client not found");
  const price = client.isReturning && svc.returningPrice != null ? svc.returningPrice : svc.price;
  const d = new Date(draft.scheduledAt);
  const slot = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const booking: Booking = {
    id: randomUUID(),
    clientId: draft.clientId,
    serviceId: draft.serviceId,
    scheduledAt: draft.scheduledAt,
    slot,
    status: "booked",
    pricePaid: price,
    notes: "",
    presentingComplaint: draft.presentingComplaint ?? "",
    createdAt: new Date().toISOString(),
    cancelledAt: null,
  };
  s.bookings.push(booking);
  await saveStore(s);
  return booking;
}

// =====================================================================
// Helpers
// =====================================================================
export function normalisePhone(s: string): string {
  return s.replace(/[^\d+]/g, "");
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfISOWeek(d: Date) {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = (day + 6) % 7; // Mon=0
  dt.setDate(dt.getDate() - diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

export function prettyDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function prettyDateTime(d: Date): string {
  return `${prettyDate(d)} · ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

export function relativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const sec = Math.round(diffMs / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  if (Math.abs(sec) < 60) return "just now";
  if (Math.abs(min) < 60) return min > 0 ? `${min}m ago` : `in ${-min}m`;
  if (Math.abs(hr) < 24) return hr > 0 ? `${hr}h ago` : `in ${-hr}h`;
  if (Math.abs(day) < 14) return day > 0 ? `${day}d ago` : `in ${-day}d`;
  return prettyDate(d);
}

export function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

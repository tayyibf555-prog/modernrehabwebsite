/**
 * Seed data for local development. Realistic enough to demo the admin
 * to the owner without it feeling empty.
 *
 * Bookings span the past 6 weeks + next 4 weeks. Mix of attended / booked /
 * cancelled / no-show so every status renders somewhere on the dashboard.
 */
import type { Store, Service, Client, Booking, BookingStatus } from "./store";

const SERVICES_SEED: Service[] = [
  {
    id: "pain-strategy",
    name: "Pain Strategy & Treatment Session",
    price: 9900,
    returningPrice: null,
    durationMin: 60,
    tag: "First visit",
    description:
      "Structured assessment plus first treatment. Maps the recovery plan.",
    position: 1,
  },
  {
    id: "treatment",
    name: "Treatment Session",
    price: 9900,
    returningPrice: 7900,
    durationMin: 45,
    tag: "Ongoing",
    description: "Hands-on treatment session for continuing care.",
    position: 2,
  },
  {
    id: "4-week",
    name: "4-Week Programme",
    price: 37900,
    returningPrice: 29900,
    durationMin: 45,
    tag: "Recovery plan",
    description: "Four sessions plus home movement & strength plan.",
    position: 3,
  },
  {
    id: "8-week",
    name: "8-Week Programme",
    price: 69900,
    returningPrice: 55900,
    durationMin: 45,
    tag: "Most popular",
    description: "Eight sessions plus home plan. The full reset.",
    position: 4,
  },
  {
    id: "4-week-foundations",
    name: "4-Week Foundations Programme",
    price: 37900,
    returningPrice: 29900,
    durationMin: 45,
    tag: "Starter plan",
    description: "Four-session programme covering treatment, education, and a home plan.",
    position: 5,
  },
  {
    id: "8-week-foundations",
    name: "8-Week Foundations Programme",
    price: 69900,
    returningPrice: 55900,
    durationMin: 45,
    tag: "Deep work",
    description: "Eight-session programme combining ongoing treatment with a full strength plan.",
    position: 6,
  },
];

// Twelve mock clients — mix of new and returning, mix of presentations
const CLIENT_NAMES = [
  { fullName: "Lorna McKenzie",   email: "lorna.m@example.com",      phone: "+447700900101", tags: ["fibromyalgia", "90-day"] },
  { fullName: "Vicky Sutherland",  email: "vicky.s@example.com",      phone: "+447700900102", tags: ["sciatica"] },
  { fullName: "Margaret Adair",    email: "margaret.a@example.com",   phone: "+447700900103", tags: ["hip-knee", "70s"] },
  { fullName: "Mary Donald",       email: "mary.d@example.com",       phone: "+447700900104", tags: ["nerve-injury", "monthly"] },
  { fullName: "Wilson Bryce",      email: "wilson.b@example.com",     phone: "+447700900105", tags: ["lower-back", "ironman"] },
  { fullName: "Ian Cameron",       email: "ian.c@example.com",        phone: "+447700900106", tags: ["trapped-nerve", "neck"] },
  { fullName: "Audrey Watt",       email: "audrey.w@example.com",     phone: "+447700900107", tags: ["chronic-hip"] },
  { fullName: "Dawn Henderson",    email: "dawn.h@example.com",       phone: "+447700900108", tags: ["chronic-back"] },
  { fullName: "Craig Allan",       email: "craig@example.com",        phone: "+447700900109", tags: ["runner"] },
  { fullName: "Sarah Knox",        email: "sarah.k@example.com",      phone: "+447700900110", tags: ["post-surgery"] },
  { fullName: "David Reid",        email: "david.r@example.com",      phone: "+447700900111", tags: ["shoulder"] },
  { fullName: "Demo Account",      email: "demo@modernrehab.co.uk",   phone: "+447700900000", tags: ["demo"] },
];

const NOTES_SAMPLES = [
  "Onset 3 years ago after a kettlebell session. Failed NHS physio (10 sessions). MRI clear.",
  "Cortisone injection 6 months ago, partial relief then return. Pain worse on left lateral movement.",
  "Marathon training, runs 60km/week. Wants to compete in October.",
  "Post-laminectomy 2018. Residual L5 nerve sensitivity. Sleep affected.",
  "Returning after 8 months. Maintenance only — work has been stressful.",
  "Recommended by Lorna. Hasn't been to a physio before.",
  "",
];

const COMPLAINTS = [
  "Lower back, both sides, worse mornings",
  "Right shoulder, can't lift overhead",
  "Sciatica radiating down right leg, 3 months",
  "Hip pain, getting in/out of car difficult",
  "Neck stiffness, headaches afternoons",
  "Achilles tendon, runs aggravate it",
  "Knee — meniscectomy 2 years ago, weakness lingering",
];

// Deterministic pseudo-random so seed is reproducible
function prng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function SEED(): Store {
  const rng = prng(20260512);
  const now = new Date(2026, 4, 12, 9, 0, 0); // Tue 12 May 2026 09:00

  const clients: Client[] = CLIENT_NAMES.map((c, i) => {
    // First seen 1–24 months back, weighted recent
    const monthsBack = Math.floor(rng() * 24);
    const firstSeen = new Date(now);
    firstSeen.setMonth(firstSeen.getMonth() - monthsBack);
    firstSeen.setDate(Math.floor(rng() * 28) + 1);
    return {
      id: `clt-${(i + 1).toString().padStart(3, "0")}`,
      fullName: c.fullName,
      email: c.email,
      phone: c.phone,
      firstSeenAt: firstSeen.toISOString(),
      lastSeenAt: null,
      isReturning: false,
      notes: pick(rng, NOTES_SAMPLES),
      tags: c.tags,
    };
  });

  // Generate bookings: each client gets 0–8 prior + 0–2 upcoming
  const bookings: Booking[] = [];
  let bookingIdx = 1;
  for (const c of clients) {
    const priorCount = Math.floor(rng() * 7); // 0–6 past bookings
    for (let i = 0; i < priorCount; i++) {
      const daysBack = Math.floor(rng() * 84) + 1; // 1–84 days back
      const at = new Date(now);
      at.setDate(at.getDate() - daysBack);
      // Skip weekends (Sunday)
      if (at.getDay() === 0) at.setDate(at.getDate() + 1);
      const slot = pick(rng, TIME_SLOTS);
      const [hh, mm] = slot.split(":").map(Number);
      at.setHours(hh, mm, 0, 0);
      const status: BookingStatus =
        rng() < 0.08 ? "cancelled" :
        rng() < 0.04 ? "no-show" :
        "attended";
      const svc = pick(rng, SERVICES_SEED);
      const isReturningAtTime = i > 0;
      const pricePaid = isReturningAtTime && svc.returningPrice != null ? svc.returningPrice : svc.price;
      const createdAt = new Date(at);
      createdAt.setDate(createdAt.getDate() - Math.floor(rng() * 14) - 1);
      bookings.push({
        id: `bkg-${(bookingIdx++).toString().padStart(4, "0")}`,
        clientId: c.id,
        serviceId: svc.id,
        scheduledAt: at.toISOString(),
        slot,
        status,
        pricePaid,
        notes: rng() < 0.4 ? pick(rng, NOTES_SAMPLES) : "",
        presentingComplaint: pick(rng, COMPLAINTS),
        createdAt: createdAt.toISOString(),
        cancelledAt: status === "cancelled" ? at.toISOString() : null,
      });
    }
    const upcomingCount = Math.floor(rng() * 3); // 0–2 upcoming
    for (let i = 0; i < upcomingCount; i++) {
      const daysAhead = Math.floor(rng() * 28) + 1;
      const at = new Date(now);
      at.setDate(at.getDate() + daysAhead);
      if (at.getDay() === 0) at.setDate(at.getDate() + 1);
      const slot = pick(rng, TIME_SLOTS);
      const [hh, mm] = slot.split(":").map(Number);
      at.setHours(hh, mm, 0, 0);
      const svc = pick(rng, SERVICES_SEED);
      const wasReturning = bookings.some((b) => b.clientId === c.id && b.status === "attended");
      const pricePaid = wasReturning && svc.returningPrice != null ? svc.returningPrice : svc.price;
      bookings.push({
        id: `bkg-${(bookingIdx++).toString().padStart(4, "0")}`,
        clientId: c.id,
        serviceId: svc.id,
        scheduledAt: at.toISOString(),
        slot,
        status: "booked",
        pricePaid,
        notes: "",
        presentingComplaint: pick(rng, COMPLAINTS),
        createdAt: new Date(now.getTime() - rng() * 1000 * 60 * 60 * 24 * 7).toISOString(),
        cancelledAt: null,
      });
    }
  }

  // Add a couple of bookings for today specifically so the overview never looks empty
  const todayHours = [10, 14, 17];
  for (const h of todayHours) {
    const c = pick(rng, clients);
    const svc = pick(rng, SERVICES_SEED);
    const at = new Date(now);
    at.setHours(h, 0, 0, 0);
    const wasReturning = bookings.some((b) => b.clientId === c.id && b.status === "attended");
    const pricePaid = wasReturning && svc.returningPrice != null ? svc.returningPrice : svc.price;
    bookings.push({
      id: `bkg-${(bookingIdx++).toString().padStart(4, "0")}`,
      clientId: c.id,
      serviceId: svc.id,
      scheduledAt: at.toISOString(),
      slot: `${String(h).padStart(2, "0")}:00`,
      status: "booked",
      pricePaid,
      notes: "",
      presentingComplaint: pick(rng, COMPLAINTS),
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      cancelledAt: null,
    });
  }

  // Recompute isReturning + lastSeenAt for each client
  for (const c of clients) {
    const attended = bookings
      .filter((b) => b.clientId === c.id && b.status === "attended")
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
    c.isReturning = attended.length >= 1;
    c.lastSeenAt = attended[0]?.scheduledAt ?? null;
  }

  return {
    services: SERVICES_SEED,
    clients,
    bookings,
    meta: { seededAt: now.toISOString(), version: 1 },
  };
}

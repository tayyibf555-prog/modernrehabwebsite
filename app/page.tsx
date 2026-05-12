"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import BodyMap, { REGIONS, REGION_DETAILS, DEFAULT_REGION_INFO } from "../components/body-map";
import KineticH1 from "../components/kinetic-h1";

// =================================================================
// REVEAL HOOK
// =================================================================
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: 0 | 1 | 2 | 3;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal${delay ? ` reveal-delay-${delay}` : ""} ${vis ? "in" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// =================================================================
// LOGO
// =================================================================
function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg
      className="mr-logo-svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-label="Modern Rehab"
    >
      <circle cx="50" cy="50" r="44" />
      <text
        x="50"
        y="66"
        textAnchor="middle"
        fontSize="40"
        fontWeight="800"
        letterSpacing="-2"
      >
        MR
      </text>
    </svg>
  );
}

// =================================================================
// NAV
// =================================================================
function Nav({ onBook }: { onBook: () => void }) {
  const [activeId, setActiveId] = useState("hero");
  useEffect(() => {
    const ids = ["hero", "where", "approach", "about", "services", "booking", "location"];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  const link = (id: string, label: string) => (
    <a href={`#${id}`} className={activeId === id ? "active" : ""}>
      {label}
    </a>
  );
  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <a href="#hero" className="nav-brand">
          <Logo size={32} />
          <span>Modern Rehab</span>
          <span className="nav-brand-sub">Cathcart · Glasgow</span>
        </a>
        <div className="nav-links">
          {link("where", "Where it hurts")}
          {link("approach", "Approach")}
          {link("about", "James")}
          {link("services", "Pricing")}
          {link("booking", "Book")}
        </div>
        <div className="nav-actions">
          <a href="tel:+441410000000" className="nav-call" aria-label="Call Modern Rehab">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
            </svg>
          </a>
          <button className="btn btn-primary" onClick={onBook}>
            Book a session <span className="arrow">→</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

// =================================================================
// HERO
// =================================================================
function Hero({ onBook }: { onBook: () => void }) {
  return (
    <section className="hero" id="hero">
      <div className="hero-mark">Now booking — May 2026</div>
      <div className="wrap">
        <KineticH1 />
        <div className="hero-meta">
          <p>
            A one-practitioner clinic in Cathcart, Glasgow. Twelve years of
            cases nobody else could fix: chronic pain, recurring injuries, the
            ones already through NHS physio and a stack of MRIs. We don't
            manage symptoms here. We treat causes, and you leave knowing the
            plan.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={onBook}>
              Book a Pain Strategy session <span className="arrow">→</span>
            </button>
            <a className="btn btn-ghost" href="#where">
              Where does it hurt?
            </a>
          </div>
        </div>
        <div className="hero-ticker">
          <span><span className="ticker-val">12</span> years private practice</span>
          <span className="ticker-sep">/</span>
          <span><span className="ticker-val">3,090</span> followers on Instagram</span>
          <span className="ticker-sep">/</span>
          <span><span className="ticker-val">8–16 wk</span> typical recovery plan</span>
          <span className="ticker-sep">/</span>
          <span><span className="ticker-val">1-on-1</span> every session</span>
          <span className="ticker-sep">/</span>
          <span>BSc (Hons) Sports Therapy</span>
        </div>
      </div>
    </section>
  );
}

// =================================================================
// BODY-MAP NAV
// =================================================================
function WhereSection({ onBookRegion }: { onBookRegion: () => void }) {
  const [selected, setSelected] = useState<string | null>("lower-back");
  const info = selected ? REGION_DETAILS[selected] : null;
  const region = selected ? REGIONS.find((r) => r.id === selected) : null;
  return (
    <section className="bodymap-section" id="where">
      <div className="wrap">
        <div className="bodymap-head">
          <div>
            <span className="mono mono-orange" style={{ marginBottom: 16, display: "block" }}>
              · Step 01 / Find where it hurts
            </span>
            <h2>Tap the body. See how I treat it.</h2>
          </div>
          <p className="lede">
            Most clinics ask in a form. We use anatomy. Click any region — front
            or back — and see how often I treat it, how long it usually takes,
            and what the plan looks like. This is the first 30 seconds of any
            real assessment.
          </p>
        </div>

        <div className="bodymap-shell">
          <BodyMap selected={selected} onSelect={setSelected} />

          <div className="bodymap-panel">
            <div className="panel-header">
              <span className="panel-label">
                {region ? `Case file · ${region.label}` : "Case file"}
              </span>
              <span className="panel-step">Region selected</span>
            </div>
            <div className="panel-h">
              {region ? region.label : "Click a region"}
            </div>
            <p className="panel-desc">
              {(info ?? DEFAULT_REGION_INFO).description}
            </p>
            <div className="panel-stats">
              <div>
                <div className="stat-lab">Case load</div>
                <div className="stat-val">{(info ?? DEFAULT_REGION_INFO).caseCount}</div>
              </div>
              <div>
                <div className="stat-lab">Typical plan</div>
                <div className="stat-val">{(info ?? DEFAULT_REGION_INFO).weeksTypical}</div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div className="stat-lab">How we treat it</div>
                <div className="stat-val">{(info ?? DEFAULT_REGION_INFO).approach}</div>
              </div>
            </div>
            <div className="panel-foot">
              <button className="btn btn-primary" onClick={onBookRegion}>
                Book a session for this <span className="arrow">→</span>
              </button>
              <a className="btn btn-ghost" href="#about">
                Read more about James
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// =================================================================
// APPROACH (DRENCHED ORANGE)
// =================================================================
function Approach() {
  const steps = [
    {
      n: "01",
      label: "Assess",
      title: "Find the real cause.",
      body:
        "A full 60-minute first session. Movement, strength, history, scans if you have them. No guessing. You leave knowing exactly what's driving the pain.",
    },
    {
      n: "02",
      label: "Treat",
      title: "Get you moving today.",
      body:
        "Hands-on manual therapy, dry needling, mobilisation — whatever the case needs. Pain relief starts on day one, not week six.",
    },
    {
      n: "03",
      label: "Rebuild",
      title: "Make it stick.",
      body:
        "A 4-, 8-, or 16-week plan built around your life and your gym. Strength rehab that fixes the cause so the pain doesn't come back six months later.",
    },
  ];
  return (
    <section className="approach" id="approach">
      <div className="wrap">
        <div className="approach-head">
          <div className="approach-kicker">· Step 02 / The Modern Rehab approach</div>
          <div className="approach-h2">
            Three sessions in, you should feel different. By week 16, the pain
            is gone — and it stays gone.
          </div>
        </div>
        <div className="approach-grid">
          {steps.map((s) => (
            <div key={s.n} className="approach-step">
              <div className="approach-num">{s.n}</div>
              <div className="approach-label">{s.label}</div>
              <h3 className="approach-h3">{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =================================================================
// ABOUT
// =================================================================
function About() {
  return (
    <section id="about">
      <div className="wrap">
        <div className="about">
          <Reveal>
            <div className="about-photo">
              <img src="/assets/james-coffee.png" alt="James McCaig, founder of Modern Rehab" />
              <span className="photo-tag">James · Cathcart clinic</span>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="about-body">
              <span className="mono mono-orange" style={{ marginBottom: 14, display: "block" }}>
                · The practitioner
              </span>
              <h2>Twelve years fixing the cases everyone else gave up on.</h2>
              <p className="lede" style={{ marginTop: 22 }}>
                I'm James McCaig. I run Modern Rehab from a private clinic in
                Cathcart, Glasgow. The people who walk in here have usually
                already been to NHS physio, the GP, a sports massage therapist,
                sometimes a surgeon. They still have pain.
              </p>
              <p className="lede" style={{ marginTop: 16 }}>
                I don't promise miracles. I do twelve years of cases and a
                clear, structured plan. Most people are surprised by how fast
                things change once we treat the cause.
              </p>
              <div className="about-credentials">
                <div className="cred">
                  <div className="cred-lab">Education</div>
                  <div className="cred-val">BSc (Hons) Sports Therapy</div>
                </div>
                <div className="cred">
                  <div className="cred-lab">Specialism</div>
                  <div className="cred-val">Chronic pain &amp; complex injury</div>
                </div>
                <div className="cred">
                  <div className="cred-lab">Member of</div>
                  <div className="cred-val">Society of Sports Therapists</div>
                </div>
                <div className="cred">
                  <div className="cred-lab">Practising since</div>
                  <div className="cred-val">2014 — Cathcart, Glasgow</div>
                </div>
              </div>
              <div className="signature">— James</div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// =================================================================
// SERVICES
// =================================================================
type Service = {
  id: string;
  name: string;
  price: number;
  existingPrice: number | null;
  duration: string;
  tag: string;
  popular?: boolean;
  desc: string;
};
const SERVICES: Service[] = [
  {
    id: "pain-strategy",
    name: "Pain Strategy & Treatment Session",
    price: 99,
    existingPrice: null,
    duration: "60 min",
    tag: "First visit",
    desc: "Structured assessment plus first treatment. You leave knowing exactly what's going on and what the plan looks like.",
  },
  {
    id: "treatment",
    name: "Treatment Session",
    price: 99,
    existingPrice: 79,
    duration: "45 min",
    tag: "Ongoing",
    desc: "Focused, hands-on treatment for continuing care. Includes manual therapy and a clear next step.",
  },
  {
    id: "4-week",
    name: "4-Week Programme",
    price: 379,
    existingPrice: 299,
    duration: "4 sessions",
    tag: "Recovery plan",
    desc: "Four sessions plus your home movement & strength plan. Built for a focused, faster recovery.",
  },
  {
    id: "8-week",
    name: "8-Week Programme",
    price: 699,
    existingPrice: 559,
    duration: "8 sessions",
    tag: "Most popular",
    popular: true,
    desc: "Eight sessions plus your home plan. The full reset — pain out, strength in.",
  },
  {
    id: "4-week-foundations",
    name: "4-Week Foundations Programme",
    price: 379,
    existingPrice: 299,
    duration: "4 sessions",
    tag: "Starter plan",
    desc: "Four sessions covering treatment, education, and a tailored home movement plan.",
  },
  {
    id: "8-week-foundations",
    name: "8-Week Foundations Programme",
    price: 699,
    existingPrice: 559,
    duration: "8 sessions",
    tag: "Deep work",
    desc: "Eight sessions combining ongoing treatment with a full strength plan for lasting change.",
  },
];

const EXISTING_CONTACTS = [
  "craig@example.com",
  "sarah.k@example.com",
  "david.r@example.com",
  "07700900000",
  "07700900123",
  "demo@modernrehab.co.uk",
];
function normaliseContact(s: string) {
  return (s || "").trim().toLowerCase().replace(/[\s()-]/g, "");
}

function ExistingClientPanel({
  isExisting,
  setIsExisting,
}: {
  isExisting: boolean;
  setIsExisting: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "checking" | "ok" | "bad">("idle");
  const [verifiedAs, setVerifiedAs] = useState("");
  const verify = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setState("checking");
    setTimeout(() => {
      const norm = normaliseContact(value);
      const match = EXISTING_CONTACTS.find((c) => normaliseContact(c) === norm);
      if (match) {
        setState("ok");
        setIsExisting(true);
        setVerifiedAs(value.trim());
      } else {
        setState("bad");
        setIsExisting(false);
      }
    }, 700);
  };
  const reset = () => {
    setIsExisting(false);
    setValue("");
    setState("idle");
    setVerifiedAs("");
    setOpen(false);
  };
  if (isExisting) {
    return (
      <div className="ec-banner ec-banner-on">
        <div className="ec-banner-inner">
          <span className="ec-dot" />
          <div>
            <strong>Welcome back.</strong>
            <span>Returning-client pricing applied for <em>{verifiedAs}</em>.</span>
          </div>
        </div>
        <button className="ec-reset" onClick={reset}>
          Switch back to standard
        </button>
      </div>
    );
  }
  return (
    <div className="ec-banner">
      <div className="ec-banner-inner">
        <span className="mono mono-orange" style={{ fontSize: 13, letterSpacing: "0.16em" }}>
          ↻
        </span>
        <div>
          <strong>Returning client?</strong>
          <span>Sign in with your email or phone for returning-client pricing.</span>
        </div>
      </div>
      {!open && (
        <button className="ec-cta" onClick={() => setOpen(true)}>
          Sign in <span className="arrow">→</span>
        </button>
      )}
      {open && (
        <form className="ec-form" onSubmit={verify}>
          <input
            type="text"
            placeholder="Email address or mobile number"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (state === "bad") setState("idle");
            }}
            autoFocus
          />
          <button type="submit" className="ec-submit" disabled={state === "checking"}>
            {state === "checking" ? "Checking…" : "Verify"}
          </button>
          {state === "bad" && (
            <p className="ec-error">
              We can't find that contact. Double-check, or stick with standard pricing.
            </p>
          )}
          <p className="ec-help">
            Demo: try <code>demo@modernrehab.co.uk</code> or <code>07700 900 000</code>.
          </p>
        </form>
      )}
    </div>
  );
}

function Services({
  onBookService,
  isExisting,
  setIsExisting,
}: {
  onBookService: (id: string) => void;
  isExisting: boolean;
  setIsExisting: (v: boolean) => void;
}) {
  return (
    <section id="services">
      <div className="wrap">
        <div className="services-head">
          <span className="mono mono-orange" style={{ marginBottom: 14, display: "block" }}>
            · Step 03 / Pricing
          </span>
          <h2>Pick the plan that fits your case.</h2>
          <p className="lede" style={{ marginTop: 22 }}>
            Every session — single or part of a programme — includes hands-on
            treatment plus your home plan. Programmes work out cheaper per
            session and get the best results. Not sure? Start with the Pain
            Strategy session and we'll decide together.
          </p>
        </div>

        <ExistingClientPanel isExisting={isExisting} setIsExisting={setIsExisting} />

        <div className="pricing-notes">
          <span><strong>Free cancellation</strong> up to 24h before</span>
          <span className="sep">/</span>
          <span>First session <strong>counts toward any programme</strong></span>
          <span className="sep">/</span>
          <span>Receipts work with most UK private health insurers</span>
        </div>

        <div className="services-list">
          {SERVICES.map((svc) => {
            const showExisting = isExisting && svc.existingPrice != null;
            const unavailable = isExisting && svc.existingPrice == null;
            return (
              <div key={svc.id} className={`svc-row ${unavailable ? "svc-row-na" : ""}`}>
                <div>
                  <div className="svc-name">{svc.name}</div>
                  <div className="svc-meta">
                    <span className={`svc-pill ${svc.popular ? "is-popular" : ""}`}>{svc.tag}</span>
                    <span>{svc.duration}</span>
                    {unavailable && <span className="svc-pill is-na">New clients only</span>}
                  </div>
                </div>
                <div className="svc-desc">{svc.desc}</div>
                <div className="svc-price">
                  {showExisting ? (
                    <>
                      <span className="price-was">£{svc.price}</span>
                      <span className="price-now">£{svc.existingPrice}</span>
                    </>
                  ) : (
                    <span>£{svc.price}</span>
                  )}
                </div>
                <button
                  className="svc-cta"
                  onClick={() => onBookService(svc.id)}
                  disabled={unavailable}
                >
                  {unavailable ? "Unavailable" : "Book"}
                  {!unavailable && <span className="arrow">→</span>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// =================================================================
// BOOKING
// =================================================================
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const TIME_SLOTS = ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];

function dayAvailability(dateKey: string) {
  const sum = [...dateKey].reduce((a, c) => a + c.charCodeAt(0), 0);
  return sum % 7;
}
function isSlotAvailable(dateKey: string, slotIdx: number) {
  const sum = [...dateKey].reduce((a, c) => a + c.charCodeAt(0), 0);
  return (sum * (slotIdx + 1)) % 5 !== 0;
}

function Booking({
  initialServiceId,
  onReset,
  isExisting,
}: {
  initialServiceId: string | null;
  onReset?: () => void;
  isExisting: boolean;
}) {
  const today = new Date(2026, 4, 12);
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<string | null>(initialServiceId || null);
  const [viewMonth, setViewMonth] = useState({ y: 2026, m: 4 });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "", firstTime: "yes" });

  useEffect(() => {
    if (initialServiceId) {
      setServiceId(initialServiceId);
      setStep(2);
    }
  }, [initialServiceId]);

  const service = SERVICES.find((s) => s.id === serviceId) || null;
  const effectivePrice = service
    ? isExisting && service.existingPrice != null
      ? service.existingPrice
      : service.price
    : null;
  const isDiscounted = !!service && isExisting && service.existingPrice != null;

  const canNext = () => {
    if (step === 1) return !!serviceId;
    if (step === 2) return !!selectedDate && !!selectedSlot;
    if (step === 3) return form.name.trim() && form.email.trim() && form.phone.trim();
    return false;
  };

  const firstDay = new Date(viewMonth.y, viewMonth.m, 1);
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(viewMonth.y, viewMonth.m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevDisabled =
    viewMonth.y === today.getFullYear() && viewMonth.m <= today.getMonth();

  const dateLabel = selectedDate
    ? (() => {
        const [yStr, mStr, dStr] = selectedDate.split("-");
        const d = new Date(Number(yStr), Number(mStr), Number(dStr));
        return `${DOW[(d.getDay() + 6) % 7]} ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
      })()
    : "—";

  return (
    <section className="dark" id="booking" style={{ paddingTop: "clamp(64px, 8vw, 112px)", paddingBottom: "clamp(72px, 9vw, 128px)" }}>
      <div className="wrap">
        <div className="booking-head">
          <div>
            <span className="mono mono-orange" style={{ marginBottom: 14, display: "block" }}>
              · Step 04 / Book a session
            </span>
            <h2>Pick a service, pick a time. See you in Cathcart.</h2>
          </div>
          <p className="lede">
            All sessions are 1-on-1 with James at the Cathcart clinic. Free
            cancellation up to 24 hours before. Payment taken on the day. Free
            parking, train station four minutes' walk.
          </p>
        </div>

        <div className="booking-shell">
          <aside className="booking-aside">
            <span className="panel-label">Your booking</span>
            <div className="steps">
              {[
                { n: 1, label: "Service" },
                { n: 2, label: "Date & time" },
                { n: 3, label: "Your details" },
                { n: 4, label: "Confirmed" },
              ].map(({ n, label }) => (
                <div
                  key={n}
                  className={`step-row ${step === n ? "active" : step > n ? "done" : ""}`}
                >
                  <span className="step-num">{step > n || (n === 4 && step >= 4) ? "✓" : n}</span>
                  {label}
                </div>
              ))}
            </div>
            <div className="summary">
              <h4>Summary</h4>
              <div className="summary-row">
                <span>Service</span>
                <strong>{service ? service.name : "Not selected"}</strong>
              </div>
              <div className="summary-row">
                <span>Duration</span>
                <strong>{service ? service.duration : "—"}</strong>
              </div>
              <div className="summary-row">
                <span>Date</span>
                <strong>{dateLabel}</strong>
              </div>
              <div className="summary-row">
                <span>Time</span>
                <strong>{selectedSlot || "—"}</strong>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <strong>
                  {service ? (
                    isDiscounted && effectivePrice != null ? (
                      <>
                        <span className="price-was" style={{ marginRight: 8 }}>£{service.price.toFixed(2)}</span>
                        <span className="price-now">£{effectivePrice.toFixed(2)}</span>
                      </>
                    ) : (
                      `£${service.price.toFixed(2)}`
                    )
                  ) : (
                    "—"
                  )}
                </strong>
              </div>
            </div>
          </aside>

          <div className="booking-main">
            {step === 1 && (
              <>
                <h3>Choose a service</h3>
                <p className="lede" style={{ margin: "10px 0 22px" }}>
                  {isExisting
                    ? "Returning-client pricing applied below. The first-visit Pain Strategy isn't shown — it's a one-off for new clients."
                    : "Available to both new and returning clients. New here? Start with the Pain Strategy session."}
                </p>
                <div className="svc-pick">
                  {SERVICES.filter((svc) => !(isExisting && svc.existingPrice == null)).map((svc) => (
                    <button
                      key={svc.id}
                      className={`card ${serviceId === svc.id ? "selected" : ""}`}
                      onClick={() => setServiceId(svc.id)}
                    >
                      <div className="top">
                        <h4>{svc.name}</h4>
                        <span className="price">
                          {isExisting && svc.existingPrice != null ? (
                            <>
                              <span className="price-was" style={{ marginRight: 6 }}>£{svc.price}</span>
                              <span className="price-now">£{svc.existingPrice}</span>
                            </>
                          ) : (
                            `£${svc.price}`
                          )}
                        </span>
                      </div>
                      <p>{svc.desc}</p>
                      <div className="meta">{svc.tag} · {svc.duration}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h3>Pick a date and time</h3>
                <p className="lede" style={{ margin: "10px 0 22px" }}>
                  Times shown in Glasgow / UK. Greyed-out dates are fully booked.
                </p>
                <div className="cal-head">
                  <h4>{MONTHS[viewMonth.m]} {viewMonth.y}</h4>
                  <div className="cal-nav">
                    <button
                      onClick={() => {
                        if (prevDisabled) return;
                        setViewMonth((v) =>
                          v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 },
                        );
                      }}
                      disabled={prevDisabled}
                      aria-label="Previous month"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() =>
                        setViewMonth((v) =>
                          v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 },
                        )
                      }
                      aria-label="Next month"
                    >
                      ›
                    </button>
                  </div>
                </div>
                <div className="cal-grid">
                  {DOW.map((d) => <div className="cal-dow" key={d}>{d}</div>)}
                  {cells.map((d, i) => {
                    if (d === null) return <div className="cal-cell empty" key={i} />;
                    const date = new Date(viewMonth.y, viewMonth.m, d);
                    const key = `${viewMonth.y}-${viewMonth.m}-${d}`;
                    const isPast =
                      date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const isWeekend = date.getDay() === 0;
                    const avail = !isPast && !isWeekend && dayAvailability(key) > 1;
                    const isSel = selectedDate === key;
                    const isToday = date.toDateString() === today.toDateString();
                    let cls = "cal-cell ";
                    if (isSel) cls += "selected ";
                    else if (avail) cls += "avail ";
                    else cls += "unavail ";
                    if (isToday) cls += "today ";
                    return (
                      <button
                        key={i}
                        className={cls}
                        disabled={!avail}
                        onClick={() => {
                          setSelectedDate(key);
                          setSelectedSlot(null);
                        }}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
                <div className="cal-legend">
                  <span><span className="sw" style={{ background: "oklch(0.16 0.005 60)", border: "1px solid var(--mr-rule-dark)" }} />Available</span>
                  <span><span className="sw" style={{ background: "var(--mr-orange)" }} />Selected</span>
                  <span><span className="sw" style={{ background: "transparent", border: "1px solid var(--mr-orange)" }} />Today</span>
                </div>
                {selectedDate && (
                  <div style={{ marginTop: 32 }}>
                    <div className="cal-head">
                      <h4>Times for {dateLabel}</h4>
                    </div>
                    <div className="slots">
                      {TIME_SLOTS.map((t, i) => {
                        const ok = isSlotAvailable(selectedDate, i);
                        return (
                          <button
                            key={t}
                            className={`slot ${selectedSlot === t ? "selected" : ""}`}
                            disabled={!ok}
                            onClick={() => setSelectedSlot(t)}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <h3>Your details</h3>
                <p className="lede" style={{ margin: "10px 0 22px" }}>
                  We'll send a confirmation and the clinic address to your email.
                </p>
                <div className="form-grid">
                  <div className="field full">
                    <label>Full name</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="James Smith"
                    />
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@email.com"
                    />
                  </div>
                  <div className="field">
                    <label>Phone</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="07700 000 000"
                    />
                  </div>
                  <div className="field full">
                    <label>First time here?</label>
                    <select
                      value={form.firstTime}
                      onChange={(e) => setForm({ ...form, firstTime: e.target.value })}
                    >
                      <option value="yes">Yes, this will be my first session</option>
                      <option value="returning">No, I'm a returning client</option>
                    </select>
                  </div>
                  <div className="field full">
                    <label>Briefly, what's going on?</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Where the pain is, how long it's been there, what you've tried..."
                    />
                    <div className="field-help">Optional. Helps make the first session count.</div>
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <div className="success">
                <div className="check">✓</div>
                <h3>You're booked in.</h3>
                <p>
                  A confirmation has been sent to{" "}
                  <strong style={{ color: "var(--mr-paper)" }}>{form.email || "your email"}</strong>.
                  See you {dateLabel} at {selectedSlot} — 221 Clarkston Road, Cathcart.
                </p>
                <div style={{ marginTop: 28, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setStep(1);
                      setServiceId(null);
                      setSelectedDate(null);
                      setSelectedSlot(null);
                      setForm({ name: "", email: "", phone: "", notes: "", firstTime: "yes" });
                      if (onReset) onReset();
                    }}
                  >
                    Book another
                  </button>
                  <a className="btn btn-ghost" href="#hero">Back to top</a>
                </div>
              </div>
            )}

            {step < 4 && (
              <div className="booking-actions">
                <button
                  className="secondary"
                  onClick={() => setStep(Math.max(1, step - 1))}
                  disabled={step === 1}
                >
                  ← Back
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (!canNext()) return;
                    setStep(step === 3 ? 4 : step + 1);
                  }}
                  disabled={!canNext()}
                >
                  {step === 3 ? "Confirm booking" : "Continue"} <span className="arrow">→</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// =================================================================
// CASE FILES
// =================================================================
const CASES = [
  {
    id: "ian",
    file: "Case file · #M-2026-093",
    name: "Ian",
    age: "M, 52",
    condition: "Trapped nerve — neck",
    duration: "3+ years",
    plan: "12 weeks",
    outcome: "Avoided surgery",
    image: "/assets/case-ian.png",
    link: "https://www.instagram.com/p/DPhG3FlCsqo/?img_index=1",
    metric: "Avoided surgery. Back to pain-free.",
    body: [
      "Ian had a trapped nerve in his neck for over 3 years and was already booked for surgery privately. He'd tried every kind of treatment and seen multiple consultants — surgery felt like his only option.",
      "After a full assessment we found the driver wasn't where he'd been told. Twelve weeks in, he was pain-free and cancelled the procedure.",
    ],
  },
  {
    id: "audrey",
    file: "Case file · #M-2025-217",
    name: "Audrey",
    age: "F, 61",
    condition: "Chronic hip pain",
    duration: "10+ years",
    plan: "16 weeks",
    outcome: "Daily life back",
    image: "/assets/case-audrey.png",
    link: "https://www.instagram.com/p/DOk7qPKkjAZ/?img_index=1",
    metric: "Daily life back. Pain off the table.",
    body: [
      "Audrey lived with chronic hip pain for over a decade. Physio, cortisone injections, painkillers — none of it had moved the needle. Walking, sleeping, even getting in the car had become a daily struggle.",
      "We built a 16-week plan around her schedule. By week 8 the pain was inconsistent rather than constant. By week 16 it was off the table.",
    ],
  },
  {
    id: "dawn",
    file: "Case file · #M-2025-104",
    name: "Dawn",
    age: "F, 49",
    condition: "Chronic daily back pain",
    duration: "10+ years",
    plan: "6 weeks",
    outcome: "Pain-free in 6 weeks",
    image: "/assets/case-dawn.png",
    link: "https://www.instagram.com/p/DHWmyICOF3q/?img_index=1",
    metric: "Pain-free in 6 weeks. Hasn't come back.",
    body: [
      "Dawn arrived after 10+ years of chronic daily back pain. She'd been diagnosed with previous stress fractures and couldn't function day to day.",
      "Six weeks of treatment and a structured plan later, she was pain-free — and at last check, more than a year on, it has not returned.",
    ],
  },
];

function CaseFiles() {
  return (
    <section>
      <div className="wrap">
        <div className="cases-head">
          <span className="mono mono-orange" style={{ marginBottom: 14, display: "block" }}>
            · Documented results
          </span>
          <h2>Real cases. Real files. Same story most times.</h2>
          <p className="lede" style={{ marginTop: 22 }}>
            People walk in here after years of failed interventions. A few weeks
            of focused work later they're back to it. More cases on{" "}
            <strong>@_modernrehab</strong>.
          </p>
        </div>
        <div className="cases-stack">
          {CASES.map((c, i) => (
            <Reveal key={c.id} delay={Math.min(3, i + 1) as 1 | 2 | 3}>
              <article className="case-file">
                <span className="case-tab">{c.file}</span>
                <div className="case-photo">
                  <img src={c.image} alt={`${c.name} — ${c.condition}`} />
                </div>
                <div className="case-meta">
                  <div className="case-meta-row">
                    <span className="case-meta-lab">Presentation</span>
                    <span className="case-meta-val">{c.condition}</span>
                  </div>
                  <div className="case-meta-row">
                    <span className="case-meta-lab">Lived with it</span>
                    <span className="case-meta-val">{c.duration}</span>
                  </div>
                  <div className="case-meta-row">
                    <span className="case-meta-lab">Treatment plan</span>
                    <span className="case-meta-val">{c.plan}</span>
                  </div>
                  <div className="case-meta-row">
                    <span className="case-meta-lab">Outcome</span>
                    <span className="case-meta-val outcome">{c.outcome}</span>
                  </div>
                </div>
                <div className="case-body">
                  <h3 className="case-h">{c.metric}</h3>
                  {c.body.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                  <a className="case-link" href={c.link} target="_blank" rel="noreferrer">
                    See full post on Instagram <span className="arrow">→</span>
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// =================================================================
// TESTIMONIALS
// =================================================================
function Testimonials() {
  return (
    <section className="tint">
      <div className="wrap">
        <div className="testimonials-head">
          <span className="mono mono-orange" style={{ marginBottom: 14, display: "block" }}>
            · Client stories
          </span>
          <h2>People walk in here after everything else.</h2>
          <p className="lede" style={{ marginTop: 22 }}>
            What changed when they came to Modern Rehab. All five-star verified
            reviews. Lightly edited for length.
          </p>
        </div>
        <div className="testimonials">
          <Reveal className="span-3" delay={1}>
            <div className="tst tst-feature">
              <div className="tst-stars">★★★★★ <span className="source">Facebook recommendation</span></div>
              <p>
                I was diagnosed with Fibromyalgia in my late 20's, I'm 50 now.
                I've tried EVERYTHING — medication, physiotherapy, acupuncture,
                chiropractors, osteopaths, hypnosis, neurologist, pain clinics.
                James provides a treatment that is unique and very different to
                anything I have ever experienced. I signed up for his 90 day
                programme and cannot believe that I now have days with{" "}
                <strong>NO pain</strong>. I never believed that could ever be a
                possibility.
              </p>
              <footer>
                <div className="avatar">L</div>
                <div className="who">
                  <strong>Lorna</strong>
                  <span>Fibromyalgia · 90-day programme</span>
                </div>
              </footer>
            </div>
          </Reveal>
          <Reveal className="span-3" delay={2}>
            <div className="tst">
              <div className="tst-stars">★★★★★ <span className="source">Verified Google review</span></div>
              <p>
                I struggle with sciatica and was handed an A4 piece of paper of
                stretches from NHS physio — at that point I couldn't even get
                my shoes on. In only <strong>6 weeks</strong> I was pain-free
                and haven't had a flare-up since. I cannot recommend James
                enough.
              </p>
              <footer>
                <div className="avatar">V</div>
                <div className="who">
                  <strong>Vicky</strong>
                  <span>Sciatica</span>
                </div>
              </footer>
            </div>
          </Reveal>
          <Reveal className="span-2" delay={1}>
            <div className="tst">
              <div className="tst-stars">★★★★★ <span className="source">Google</span></div>
              <p>
                Convinced me, and proved, that hip and knee pains in my 70s
                could be treated, relieved, and managed. Got me back to walking{" "}
                <strong>10,000++ steps a day</strong> again.
              </p>
              <footer>
                <div className="avatar">M</div>
                <div className="who">
                  <strong>Margaret</strong>
                  <span>Hip &amp; knee, 70s</span>
                </div>
              </footer>
            </div>
          </Reveal>
          <Reveal className="span-2" delay={2}>
            <div className="tst">
              <div className="tst-stars">★★★★★ <span className="source">Google</span></div>
              <p>
                I've been seeing James for years now — originally a nerve injury
                in my neck and upper back. I'd seen many practitioners and
                James was the only person that got it under control. I'm on the
                monthly subscription now.
              </p>
              <footer>
                <div className="avatar">M</div>
                <div className="who">
                  <strong>Mary</strong>
                  <span>Nerve injury · Monthly plan</span>
                </div>
              </footer>
            </div>
          </Reveal>
          <Reveal className="span-2" delay={3}>
            <div className="tst">
              <div className="tst-stars">★★★★★ <span className="source">Facebook</span></div>
              <p>
                Long-term lower back pain that's bothered me for years. His work
                has taken my pain from an <strong>8/10 down to about a 2</strong>{" "}
                — still getting better. Massive difference to my Ironman
                training and recovery.
              </p>
              <footer>
                <div className="avatar">W</div>
                <div className="who">
                  <strong>Wilson</strong>
                  <span>Lower back · Ironman</span>
                </div>
              </footer>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// =================================================================
// FINAL CTA
// =================================================================
function FinalCTA({ onBook }: { onBook: () => void }) {
  return (
    <section className="final-cta">
      <div className="wrap final-inner">
        <h2>
          <span className="stop">Stop managing</span>
          <span className="stop">the pain.</span>
          <span className="start">Start fixing it.</span>
        </h2>
        <div className="final-side">
          <p>
            One session is usually enough to know what's going on. Book a Pain
            Strategy session, come down to Cathcart, let's get you moving again.
          </p>
          <button className="btn btn-ink" onClick={onBook}>
            Book a Pain Strategy session <span className="arrow">→</span>
          </button>
          <span className="mono" style={{ color: "oklch(0.20 0.06 45)" }}>
            £99 · 60 min · counts toward any programme
          </span>
        </div>
      </div>
    </section>
  );
}

// =================================================================
// LOCATION
// =================================================================
function Location() {
  return (
    <section className="location" id="location">
      <div className="wrap">
        <div className="location-head">
          <span className="mono mono-orange" style={{ marginBottom: 14, display: "block" }}>
            · Find the clinic
          </span>
          <h2>Cathcart. Ten minutes from Glasgow city centre.</h2>
          <p className="lede" style={{ marginTop: 22 }}>
            A private treatment room with full strength-rehab equipment. Free
            on-site parking. Cathcart train station four minutes' walk.
          </p>
        </div>
        <div className="location-grid">
          <div className="info-list">
            <div className="info-row">
              <div className="lab">Address</div>
              <div className="val">
                221 Clarkston Road<br />
                Cathcart, Glasgow<br />
                G44 3DS, United Kingdom
              </div>
            </div>
            <div className="info-row">
              <div className="lab">Clinic hours</div>
              <div className="val">
                Mon — Fri · 08:00 — 20:00<br />
                Saturday · 09:00 — 14:00<br />
                Sunday · Closed
              </div>
            </div>
            <div className="info-row">
              <div className="lab">Get in touch</div>
              <div className="val">
                hello@modernrehab.co.uk<br />
                @_modernrehab on Instagram
              </div>
            </div>
          </div>
          <div className="map-card">
            <iframe
              title="Modern Rehab — 221 Clarkston Road"
              src="https://www.google.com/maps?q=221+Clarkston+Road,+Cathcart,+Glasgow,+G44+3DS&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              className="map-pin"
              href="https://maps.google.com/?q=221+Clarkston+Road,+Cathcart,+Glasgow,+G44+3DS"
              target="_blank"
              rel="noreferrer"
            >
              <span className="dot" /> Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// =================================================================
// FOOTER
// =================================================================
function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <a className="nav-brand" style={{ color: "var(--mr-paper)" }}>
              <Logo size={32} />
              <span>Modern Rehab</span>
            </a>
            <p>
              A one-practitioner chronic-pain &amp; injury clinic in Cathcart,
              Glasgow. Twelve years of cases nobody else could fix.
            </p>
          </div>
          <div>
            <h5>Site</h5>
            <a href="#where">Where it hurts</a>
            <a href="#approach">Approach</a>
            <a href="#about">About James</a>
            <a href="#services">Pricing</a>
            <a href="#booking">Book</a>
          </div>
          <div>
            <h5>Visit</h5>
            <a>221 Clarkston Road</a>
            <a>Cathcart, Glasgow</a>
            <a>G44 3DS</a>
          </div>
          <div>
            <h5>Connect</h5>
            <a>@_modernrehab</a>
            <a>hello@modernrehab.co.uk</a>
            <a>+44 (0) 141 000 0000</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Modern Rehab · James McCaig</span>
          <span>Made in Glasgow</span>
        </div>
      </div>
    </footer>
  );
}

// =================================================================
// APP
// =================================================================
export default function Page() {
  const [bookingPreset, setBookingPreset] = useState<string | null>(null);
  const [isExisting, setIsExisting] = useState(false);

  const scrollToBooking = (svcId: string | null) => {
    setBookingPreset(svcId);
    setTimeout(() => {
      const el = document.getElementById("booking");
      if (el) {
        const top = el.getBoundingClientRect().top + window.pageYOffset - 56;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 50);
  };

  return (
    <>
      <Nav onBook={() => scrollToBooking(null)} />
      <Hero onBook={() => scrollToBooking(null)} />
      <WhereSection onBookRegion={() => scrollToBooking(null)} />
      <Approach />
      <About />
      <Services
        onBookService={scrollToBooking}
        isExisting={isExisting}
        setIsExisting={setIsExisting}
      />
      <Booking
        initialServiceId={bookingPreset}
        onReset={() => setBookingPreset(null)}
        isExisting={isExisting}
      />
      <CaseFiles />
      <Testimonials />
      <FinalCTA onBook={() => scrollToBooking(null)} />
      <Location />
      <Footer />
    </>
  );
}

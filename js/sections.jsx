/* ============================================================
   Section renderers + generic PageView
   ============================================================ */

function SectionHead({ children, eyebrow }) {
  return (
    <Reveal className="stack" style={{ gap: "0.4rem", marginBottom: "1.6rem" }}>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2 className="h2">{children}</h2>
    </Reveal>
  );
}

/* points grid (cards) */
function Points({ heading, items }) {
  const cols = items.length === 3 ? "cols-3" : "cols-2";
  return (
    <section className="section-sm">
      {heading ? <SectionHead>{heading}</SectionHead> : null}
      <div className={`grid ${cols}`}>
        {items.map((it, i) => {
          const clickable = !!it.page;
          const Tag = clickable ? "a" : "div";
          return (
            <Reveal as={Tag} key={i} delay={i * 70} href={clickable ? `#/${it.page}` : undefined}
              className={`card ${clickable ? "hover link" : ""}`}>
              <div className="row" style={{ justifyContent: "space-between", gap: "0.6rem", marginBottom: "0.7rem" }}>
                <span className="node-dot"></span>
                {it.status ? <StatusBadge status={it.status} /> : null}
              </div>
              <h3 className="h3" style={{ margin: "0 0 0.4rem" }}>{it.title}</h3>
              <p className="muted" style={{ margin: 0, fontSize: "0.96rem" }}>{it.body}</p>
              {clickable ? <span className="mono" style={{ color: "var(--accent)", fontSize: "0.78rem", marginTop: "0.9rem" }}>Explore →</span> : null}
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function Prose({ heading, body }) {
  return (
    <section className="section-sm" style={{ maxWidth: "62ch" }}>
      {heading ? <SectionHead>{heading}</SectionHead> : null}
      {body.map((p, i) => (
        <Reveal as="p" key={i} delay={i * 60} className="lede" style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>{p}</Reveal>
      ))}
    </section>
  );
}

function Values({ heading }) {
  const VALUES = window.EARTHOS.VALUES;
  return (
    <section className="section-sm">
      {heading ? <SectionHead>{heading}</SectionHead> : null}
      <div className="grid cols-3">
        {VALUES.map(([t, d], i) => (
          <Reveal key={i} delay={i * 60} className="card">
            <div className="mono" style={{ color: "var(--accent)", fontSize: "0.8rem", marginBottom: "0.7rem" }}>{String(i + 1).padStart(2, "0")}</div>
            <h3 className="h3" style={{ margin: "0 0 0.4rem" }}>{t}</h3>
            <p className="muted" style={{ margin: 0, fontSize: "0.95rem" }}>{d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Flist({ heading, items }) {
  return (
    <section className="section-sm">
      {heading ? <SectionHead>{heading}</SectionHead> : null}
      <Reveal className="flist card" style={{ padding: "0.6rem 1.6rem" }}>
        {items.map((it, i) => (
          <div className="fitem" key={i}>
            <span className="fnum">{String(i + 1).padStart(2, "0")}</span>
            <div style={{ flex: 1 }}>
              <div className="row wrap" style={{ gap: "0.7rem", marginBottom: "0.2rem" }}>
                <strong style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "1.08rem" }}>{it.title}</strong>
                {it.status ? <StatusBadge status={it.status} /> : null}
              </div>
              <p className="muted" style={{ margin: 0, fontSize: "0.96rem" }}>{it.body}</p>
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

function TwoCol({ heading, cols }) {
  return (
    <section className="section-sm">
      {heading ? <SectionHead>{heading}</SectionHead> : null}
      <div className="grid cols-2">
        {cols.map((c, i) => (
          <Reveal key={i} delay={i * 90} className="card hover">
            <div className="eyebrow" style={{ marginBottom: "0.6rem" }}>{c.tag}</div>
            <h3 className="h3" style={{ margin: "0 0 0.6rem" }}>{c.title}</h3>
            <p className="muted" style={{ marginTop: 0 }}>{c.body}</p>
            <hr className="hairline" style={{ margin: "1.1rem 0" }} />
            <div className="flist">
              {c.list.map((l, j) => (
                <div className="row" key={j} style={{ gap: "0.7rem", padding: "0.4rem 0" }}>
                  <span className="node-dot" style={{ width: 7, height: 7 }}></span>
                  <span style={{ fontSize: "0.95rem" }}>{l}</span>
                </div>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* architecture layers */
function Layers() {
  const layers = [
    ["Experiences", "What people touch — Messaging and, in time, the public layers.", "prototype"],
    ["Products", "Apps assembled from the shared source.", "planned"],
    ["Patterns", "Consent flows, Intention Mirror, calm defaults.", "prototype"],
    ["QLPA Matrix", "Source logic, principles, validation.", "foundation"],
    ["Boundaries", "Privacy, Bridge, governance, what is never allowed.", "foundation"],
  ];
  return (
    <section className="section-sm">
      <SectionHead>The stack, top to base</SectionHead>
      <div className="card" style={{ padding: "0 1.6rem" }}>
        {layers.map(([t, d, s], i) => (
          <Reveal key={i} delay={i * 70} className="row wrap"
            style={{ justifyContent: "space-between", gap: "1rem", padding: "1.4rem 0", borderBottom: i < layers.length - 1 ? "1px solid var(--line)" : "none" }}>
            <div className="row" style={{ gap: "1.2rem", alignItems: "baseline" }}>
              <span className="index">L{layers.length - i}</span>
              <div>
                <strong style={{ fontFamily: "var(--serif)", fontWeight: 460, fontSize: "1.35rem" }}>{t}</strong>
                <p className="muted" style={{ margin: "0.2rem 0 0", fontSize: "0.95rem" }}>{d}</p>
              </div>
            </div>
            <StatusBadge status={s} />
          </Reveal>
        ))}
      </div>
      <Reveal as="p" className="mono dim" style={{ textAlign: "center", marginTop: "1.4rem", fontSize: "0.8rem", letterSpacing: "0.06em" }}>
        ↓ each layer inherits the protections beneath it
      </Reveal>
    </section>
  );
}

/* roadline — honest phased path */
function Roadline() {
  const phases = [
    ["Foundation", "Encode the source once: the nine principles, the 13 pillars, the honesty/status system.", "foundation", ["QLPA Matrix Source", "Net Shield", "Language Protocol"]],
    ["Communication", "Prove consent-aware, local-first messaging before anything is sent between devices.", "prototype", ["Local messaging (active)", "Intention Mirror", "Capability Matrix"]],
    ["Transport", "Bring up relay and production encryption — carefully, with no overclaiming.", "inactive", ["Relay transport", "Production E2EE", "Multi-device"]],
    ["Bridge & ecosystem", "Open the consented seam to public systems and communities.", "planned", ["EarthOS Bridge", "Governance circles", "Public registry"]],
    ["Value & governance", "Only after review: contribution records and public governance.", "inactive", ["EarthCoin (inactive)", "Token rewards"]],
  ];
  return (
    <section className="section-sm">
      <div className="stack" style={{ gap: 0 }}>
        {phases.map(([t, d, s, items], i) => (
          <Reveal key={i} delay={i * 80} className="row" style={{ alignItems: "stretch", gap: "1.4rem" }}>
            <div className="stack" style={{ alignItems: "center", width: 24 }}>
              <span className="node-dot" style={{ marginTop: 6 }}></span>
              {i < phases.length - 1 ? <span style={{ flex: 1, width: 1, background: "var(--line-2)" }}></span> : null}
            </div>
            <div className="card" style={{ flex: 1, marginBottom: "1.2rem" }}>
              <div className="row wrap" style={{ justifyContent: "space-between", gap: "0.8rem", marginBottom: "0.5rem" }}>
                <div className="row" style={{ gap: "0.8rem" }}>
                  <span className="mono dim">{String(i + 1).padStart(2, "0")}</span>
                  <strong className="h3">{t}</strong>
                </div>
                <StatusBadge status={s} />
              </div>
              <p className="muted" style={{ marginTop: 0 }}>{d}</p>
              <div className="pillset">{items.map((x, j) => <span className="pill" key={j}>{x}</span>)}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* status ledger */
function Ledger() {
  const STATUS = window.EARTHOS.STATUS;
  const rows = [
    ["Release stage", "active", "pre-MVP"],
    ["Local messaging", "active"], ["Stats (off / light)", "active"],
    ["Consent engine", "foundation"], ["Net Shield", "foundation"],
    ["Trust graph", "foundation"], ["QLPA Language Protocol", "active"],
    ["Identity", "local"], ["Data portability", "prototype"],
    ["Voice notes", "prototype"], ["File transfer", "prototype"],
    ["Relay transport", "inactive"], ["Production E2EE", "inactive"],
    ["Cloud backup", "inactive"], ["Sync metadata", "inactive"],
    ["Governance circles", "planned"], ["Public registry", "planned"],
    ["Multi-device", "planned"], ["EarthCoin / token rewards", "inactive"],
    ["Records from private content", "never"], ["Hidden extraction of content/keys", "never"],
  ];
  return (
    <section className="section-sm">
      <Reveal className="pillset" style={{ marginBottom: "1.6rem", gap: "0.9rem 1.1rem" }}>
        {Object.keys(STATUS).map(k => (
          <span key={k} className="row" style={{ gap: "0.5rem" }}><StatusBadge status={k} /> <span className="dim" style={{ fontSize: "0.82rem" }}>{STATUS[k].blurb}</span></span>
        ))}
      </Reveal>
      <Reveal className="card" style={{ padding: "0.4rem 1.4rem" }}>
        {rows.map(([name, s, note], i) => (
          <div key={i} className="row wrap" style={{ justifyContent: "space-between", gap: "1rem", padding: "0.85rem 0", borderBottom: i < rows.length - 1 ? "1px solid var(--line)" : "none" }}>
            <span style={{ fontFamily: "var(--serif)", fontWeight: 460, fontSize: "1.05rem" }}>{name}</span>
            <span className="row" style={{ gap: "0.8rem" }}>
              {note ? <span className="mono dim" style={{ fontSize: "0.76rem" }}>{note}</span> : null}
              <StatusBadge status={s} pulse={s === "active"} />
            </span>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

/* glossary */
function Glossary() {
  const terms = [
    ["QLPA", "Quantum Love Protection Architecture — the source foundation."],
    ["Net Shield", "Layered protection with five readiness levels."],
    ["Consent ledger", "The visible, revocable record of every yes."],
    ["Capability Matrix", "Per-kind policy gating trust, consent, and reach."],
    ["EarthOS Bridge", "The consented seam between private and public."],
    ["Foundation-only", "Architecture exists; the product follows."],
    ["Local-first", "Your device is the default home for your data."],
    ["Right to exit", "Always leave, and take your data with you."],
  ];
  return (
    <section className="section-sm">
      <SectionHead>Vocabulary</SectionHead>
      <div className="grid cols-2">
        {terms.map(([t, d], i) => (
          <Reveal key={i} delay={i * 50} className="card">
            <strong className="mono" style={{ color: "var(--accent)", fontSize: "0.92rem" }}>{t}</strong>
            <p className="muted" style={{ margin: "0.4rem 0 0", fontSize: "0.95rem" }}>{d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* Net Shield readiness levels */
function ShieldLevels() {
  const levels = [
    ["00", "open", "No active protection layer.", 18],
    ["01", "protected", "Local safeguards active.", 40],
    ["02", "private", "No relay; content held locally.", 62],
    ["03", "sealed", "Relay-sealed, identity-backed.", 84],
    ["04", "guardian", "Guardian network layer (future).", 100],
  ];
  return (
    <section className="section-sm">
      <SectionHead eyebrow="Five readiness levels">From open to guardian</SectionHead>
      <Reveal className="levels">
        {levels.map(([i, n, d, w], k) => (
          <div className="level" key={k}>
            <div className="lv-i">{i}</div>
            <div className="lv-n">{n}</div>
            <div className="lv-d">{d}</div>
            <div className="lv-bar" style={{ width: w + "%" }}></div>
          </div>
        ))}
      </Reveal>
      <Reveal as="p" className="mono dim" style={{ marginTop: "1rem", fontSize: "0.8rem" }}>
        guardian is a future layer — the system never claims a level it has not reached.
      </Reveal>
    </section>
  );
}

/* Language protocol replacement table */
function LangTable() {
  const pairs = [
    ["Panic Mode", "Shield Mode"],
    ["Kill switch", "Seal Access"],
    ["Emergency wipe", "Source Clear"],
    ["Threat detected", "New access attempt noticed"],
    ["Delete forever", "Clear from this device"],
    ["Disappearing messages", "Auto-clear messages"],
    ["Self-destruct", "Auto-clear"],
    ["Block user", "Close connection"],
    ["Report abuse", "Send safety report"],
  ];
  return (
    <section className="section-sm">
      <SectionHead eyebrow="Discouraged → approved">The words we choose</SectionHead>
      <Reveal className="langt">
        <div className="lt-row head"><span>Discouraged</span><span></span><span>Approved</span></div>
        {pairs.map(([a, b], i) => (
          <div className="lt-row" key={i}>
            <span className="lt-from">{a}</span>
            <span className="lt-arrow">→</span>
            <span className="lt-to">{b}</span>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

/* Communication capability matrix (curated) */
function CapMatrix() {
  const rows = [
    ["Text message", "Unknown", "Local-only · standard"],
    ["Event invite", "Unknown", "Forwardable · relay-optional"],
    ["Voice note", "Known", "Recording consent · local-only"],
    ["Photo / video", "Known", "Shield-checked · local-only"],
    ["File transfer", "Known", "Durable · relay-optional"],
    ["Audio / video call", "Trusted", "Recording consent · not exportable"],
    ["Location", "Trusted", "Ephemeral · not exportable"],
    ["Governance signal", "Trusted", "Public ledger · bridge-gated"],
  ];
  return (
    <section className="section-sm">
      <SectionHead eyebrow="Curated from the canonical matrix">Trust gates every kind</SectionHead>
      <Reveal className="capm">
        <div className="cm-row head"><span>Capability</span><span>Min. trust</span><span>Handling</span></div>
        {rows.map(([k, t, m], i) => (
          <div className="cm-row" key={i}>
            <span className="cm-kind">{k}</span>
            <span><StatusBadge status={t === "Trusted" ? "active" : t === "Known" ? "foundation" : "inactive"} /></span>
            <span className="cm-meta">{m}</span>
          </div>
        ))}
      </Reveal>
      <Reveal as="p" className="mono dim" style={{ marginTop: "1rem", fontSize: "0.8rem" }}>
        Trust levels: unknown · known · trusted — each unlocks more, never bypassing consent.
      </Reveal>
    </section>
  );
}

/* 13 Pillars */
function Pillars() {
  const items = [
    "Source Identity", "Ethical Use Source", "Project Adaptation Guide", "Portability Shield",
    "Export Manifest", "Foundation Modes & Preferences", "QLPA Language Protocol", "QLPA Net Shield Foundation",
    "Phi / Fibonacci Design Root", "Multilingual i18n Root", "Privacy, Security & Content Boundaries",
    "Stats Analyzer Root", "Export, Validation & Documentation",
  ];
  return (
    <section className="section-sm">
      <SectionHead eyebrow="Thirteen pillars · all active">What the source is made of</SectionHead>
      <Reveal className="pillars">
        {items.map((t, i) => (
          <div className="pillar" key={i}>
            <span className="p-i">{String(i + 1).padStart(2, "0")}</span>
            <span className="p-n">{t}</span>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

/* collaboration message */
function Collab() {
  const roles = ["Builders", "Designers", "Organizers", "Translators", "Legal reviewers", "Community stewards"];
  return (
    <section className="section-sm">
      <Reveal className="card" style={{ padding: "clamp(1.6rem,4vw,3rem)" }}>
        <p className="lede" style={{ fontSize: "clamp(1.3rem,2.4vw,1.8rem)", color: "var(--paper)", maxWidth: "30ch", fontWeight: 300 }}>
          We welcome collaborators who care about consent, privacy, language, community, ecology, and truthful technology.
        </p>
        <p className="muted" style={{ maxWidth: "56ch" }}>
          The project is not looking for hype. It is looking for people who understand that digital systems must protect life before they scale.
        </p>
        <hr className="hairline" style={{ margin: "1.6rem 0" }} />
        <div className="pillset">{roles.map((r, i) => <span className="pill" key={i}>{r}</span>)}</div>
      </Reveal>
    </section>
  );
}

/* contact form (prototype, no real submit) */
function ContactForm() {
  const [sent, setSent] = React.useState(false);
  const [role, setRole] = React.useState("");
  const roles = ["Builder", "Designer", "Organizer", "Translator", "Legal", "Steward"];
  return (
    <section className="section-sm">
      <SectionHead>Reach out</SectionHead>
      <Reveal className="card" style={{ maxWidth: "640px" }}>
        {sent ? (
          <div className="stack" style={{ gap: "0.6rem", padding: "1rem 0" }}>
            <StatusBadge status="active" />
            <h3 className="h3" style={{ margin: "0.6rem 0 0" }}>Thank you for offering to help.</h3>
            <p className="muted">This prototype doesn't send a real message — but the sentiment is exactly what EarthOS is being built on. Reach out through the channel below to truly connect.</p>
            <button className="btn btn-ghost" style={{ alignSelf: "flex-start", marginTop: "0.6rem" }} onClick={() => setSent(false)}>← Back</button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <div className="stack" style={{ gap: "1rem" }}>
              <div>
                <label className="mono dim" style={{ fontSize: "0.76rem", display: "block", marginBottom: "0.4rem" }}>HOW SHALL WE CALL YOU</label>
                <input required placeholder="Your name" style={inputStyle} />
              </div>
              <div>
                <label className="mono dim" style={{ fontSize: "0.76rem", display: "block", marginBottom: "0.5rem" }}>HOW WOULD YOU HELP</label>
                <div className="pillset">
                  {roles.map(r => (
                    <button type="button" key={r} className="pill" onClick={() => setRole(r)}
                      style={role === r ? { borderColor: "var(--accent)", color: "var(--paper)", background: "transparent" } : null}>{r}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mono dim" style={{ fontSize: "0.76rem", display: "block", marginBottom: "0.4rem" }}>WHAT MOVES YOU ABOUT THIS</label>
                <textarea rows="4" placeholder="A few honest words…" style={inputStyle}></textarea>
              </div>
              <label className="toggle on" style={{ cursor: "default", fontSize: "0.78rem" }}>
                <span className="node-dot" style={{ width: 7, height: 7 }}></span> No data leaves this prototype. Nothing is stored or sold.
              </label>
              <button className="btn btn-primary" style={{ alignSelf: "flex-start" }}>Offer to help <span className="arrow">→</span></button>
            </div>
          </form>
        )}
      </Reveal>
    </section>
  );
}
const inputStyle = {
  width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--line-2)",
  borderRadius: "12px", padding: "0.85rem 1rem", color: "var(--paper)", fontFamily: "var(--sans)",
  fontSize: "1rem", outline: "none",
};

/* ---------------- section dispatcher ---------------- */
function Section({ s }) {
  switch (s.kind) {
    case "prose": return <Prose {...s} />;
    case "points": return <Points {...s} />;
    case "values": return <Values {...s} />;
    case "flist": return <Flist {...s} />;
    case "twocol": return <TwoCol {...s} />;
    case "layers": return <Layers />;
    case "roadline": return <Roadline />;
    case "ledger": return <Ledger />;
    case "glossary": return <Glossary />;
    case "shieldlevels": return <ShieldLevels />;
    case "langtable": return <LangTable />;
    case "capmatrix": return <CapMatrix />;
    case "pillars": return <Pillars />;
    case "collab": return <Collab />;
    case "contactform": return <ContactForm />;
    case "gate": return <section className="section-sm"><SendGate /></section>;
    case "disclaimer": return (
      <Reveal className="row" style={{ gap: "0.9rem", alignItems: "flex-start", margin: "1.4rem 0", padding: "1.1rem 1.3rem", border: "1px dashed var(--line-2)", borderRadius: "14px", background: "rgba(255,255,255,0.015)" }}>
        <span className="mono" style={{ color: "var(--s-plan)", fontSize: "0.8rem", flex: "0 0 auto" }}>NOTE</span>
        <p className="dim" style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.55 }}>{s.text}</p>
      </Reveal>
    );
    default: return null;
  }
}

/* ---------------- generic page ---------------- */
function PageView({ slug }) {
  const page = window.EARTHOS.PAGES[slug];
  useRevealRoot();
  React.useEffect(() => { window.scrollTo(0, 0); }, [slug]);
  if (!page) return null;
  return (
    <div className="container">
      <header className="page-head">
        <Reveal className="breadcrumb"><a href="#/home">← EarthOS</a></Reveal>
        <Reveal delay={60}><span className="kicker">{page.eyebrow}</span></Reveal>
        <Reveal delay={120}><h1 className="display h1 page-title">{page.title}</h1></Reveal>
        <Reveal delay={180} className="row wrap" style={{ gap: "1rem", alignItems: "center", marginBottom: "1.4rem" }}>
          <StatusBadge status={page.status} pulse />
          <span className="dim mono" style={{ fontSize: "0.78rem" }}>{window.EARTHOS.STATUS[page.status].blurb}</span>
        </Reveal>
        <Reveal delay={240}><p className="lede page-lede">{page.lede}</p></Reveal>
      </header>
      <hr className="hairline" />
      {page.sections.map((s, i) => <Section key={i} s={s} />)}
      {page.next ? (
        <section className="section-sm">
          <SectionHead eyebrow="Keep exploring">Where to next</SectionHead>
          <div className="next-grid">
            {page.next.map((n, i) => (
              <Reveal as="a" key={i} delay={i * 70} href={`#/${n.page}`} className="card hover link next-card">
                <span className="lab">{window.EARTHOS.PAGES[n.page]?.eyebrow || "Page"}</span>
                <span className="row" style={{ justifyContent: "space-between", gap: "0.6rem" }}>
                  <strong className="h3">{n.label}</strong><span className="arrow">→</span>
                </span>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

Object.assign(window, { Section, PageView, SectionHead });

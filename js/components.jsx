/* ============================================================
   Shared chrome + generic page renderer
   ============================================================ */

const go = (page) => { location.hash = `#/${page}`; };

/* reveal-on-scroll — self-contained & robust.
   No IntersectionObserver (unreliable here). Each Reveal manages its own
   state and sets the shown style INLINE (beats any class/specificity issue),
   with a per-element safety timeout so content can never stay hidden. */
function useRevealRoot() { /* no-op: Reveal is self-managing now */ }

function Reveal({ children, delay = 0, className = "", as = "div", style: styleProp, ...rest }) {
  const [shown, setShown] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    let done = false;
    const show = () => { if (!done) { done = true; setShown(true); } };
    const check = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight || 800;
      if (r.top < vh * 0.95 && r.bottom > -60) show();
    };
    requestAnimationFrame(check);
    const t = setTimeout(check, 120);
    const onScroll = () => requestAnimationFrame(check);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const safety = setTimeout(show, 1700); // never leave content hidden
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(t); clearTimeout(safety);
    };
  }, []);
  const style = {
    ...(delay ? { transitionDelay: delay + "ms" } : {}),
    ...(styleProp || {}),
    ...(shown ? { opacity: 1, transform: "none" } : {}),
  };
  return React.createElement(as, { ref, className: `reveal ${className}${shown ? " in" : ""}`, style, ...rest }, children);
}

/* ---------------- NAV ---------------- */
function Logo() {
  return (
    <svg className="mark" viewBox="0 0 34 22" fill="none" stroke="currentColor">
      <circle cx="17" cy="11" r="10.4" strokeWidth="1" opacity="0.3" />
      <circle cx="13" cy="11" r="4.1" strokeWidth="1.5" />
      <circle cx="21" cy="11" r="4.1" strokeWidth="1.5" />
    </svg>
  );
}

function Nav() {
  const [scrolled, setScrolled] = React.useState(false);
  const [openIdx, setOpenIdx] = React.useState(-1);
  const [drawer, setDrawer] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);
  React.useEffect(() => {
    const close = () => setOpenIdx(-1);
    addEventListener("hashchange", () => { close(); setDrawer(false); });
    document.addEventListener("click", (e) => { if (!e.target.closest(".nav-item")) close(); });
  }, []);
  const NAV = window.EARTHOS.NAV;

  return (
    <>
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="container nav-inner">
          <a className="brand" href="#/home"><Logo /> EarthOS</a>
          <div className="nav-links">
            {NAV.map((grp, i) => (
              <div key={i} className={`nav-item ${openIdx === i ? "open" : ""}`}>
                <button className="nav-trigger" onClick={(e) => { e.stopPropagation(); setOpenIdx(openIdx === i ? -1 : i); }}>
                  {grp.label}<span className="caret">▼</span>
                </button>
                <div className="nav-menu">
                  {grp.items.map(([page, title, desc]) => (
                    <a key={page} href={`#/${page}`}>
                      <span className="mi-title">{title}</span>
                      <span className="mi-desc">{desc}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="nav-right">
            <a className="nav-status hide-sm" href="#/status"><span className="node-dot"></span> Early build</a>
            <a className="btn btn-ghost" href="#/contact" style={{ padding: "0.6em 1.1em" }}>Collaborate</a>
            <button className="burger" onClick={() => setDrawer(true)} aria-label="Menu">☰</button>
          </div>
        </div>
      </nav>

      <div className={`drawer ${drawer ? "open" : ""}`}>
        <div className="container">
          <div className="drawer-top">
            <a className="brand" href="#/home" onClick={() => setDrawer(false)}><Logo /> EarthOS</a>
            <button className="burger" onClick={() => setDrawer(false)} aria-label="Close">✕</button>
          </div>
          {NAV.map((grp, i) => (
            <div className="drawer-group" key={i}>
              <h4>{grp.label}</h4>
              {grp.items.map(([page, title]) => (
                <a key={page} href={`#/${page}`} onClick={() => setDrawer(false)}>{title}</a>
              ))}
            </div>
          ))}
          <div style={{ marginTop: "2rem" }}>
            <a className="btn btn-primary" href="#/contact" onClick={() => setDrawer(false)}>Collaborate <span className="arrow">→</span></a>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------- FOOTER ---------------- */
function Footer() {
  const NAV = window.EARTHOS.NAV;
  return (
    <footer className="footer">
      <Ticker />
      <div className="container" style={{ paddingTop: "clamp(48px,7vh,80px)" }}>
        <div className="footer-grid">
          <div className="footer-col">
            <a className="brand" href="#/home" style={{ marginBottom: "1rem" }}><Logo /> EarthOS</a>
            <p className="muted" style={{ maxWidth: "34ch", fontSize: "0.92rem" }}>
              A calm, ethical foundation for future digital systems. Consent first. Life before scale.
            </p>
            <div style={{ marginTop: "1.2rem" }}><StatusBadge status="prototype" pulse /></div>
          </div>
          {NAV.map((grp, i) => (
            <div className="footer-col" key={i}>
              <h5>{grp.label}</h5>
              {grp.items.map(([page, title]) => (<a key={page} href={`#/${page}`}>{title}</a>))}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>EarthOS — concept site · {new Date().getFullYear()}</span>
          <span className="mono">Not for hype. For builders.</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- SEND GATE DEMO ---------------- */
function SendGate() {
  const [consent, setConsent] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  React.useEffect(() => { setSent(false); }, [consent]);
  return (
    <div className="gate reveal">
      <div className="gate-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Try it · Consent Gate</div>
          <strong className="h3" style={{ display: "block" }}>A message reaches you only by consent.</strong>
        </div>
        <StatusBadge status="prototype" />
      </div>
      <div className="gate-body">
        <label className={`toggle ${consent ? "on" : ""}`} onClick={() => setConsent(c => !c)}>
          <span className="switch"></span>
          {consent ? "You've agreed to hear from this sender" : "You have not agreed to hear from this sender"}
        </label>
        <div className={`gate-msg ${sent ? "sent" : (!consent ? "blocked" : "")}`}>
          <div className="mono dim" style={{ fontSize: "0.74rem", marginBottom: 6 }}>
            FROM: unknown trust · TO: you
          </div>
          {sent
            ? <span style={{ color: "var(--accent)", fontStyle: "normal", fontFamily: "var(--mono)", fontSize: "0.9rem" }}>Delivered — you chose to receive this.</span>
            : (consent
                ? <span className="muted">“Hello — may I share something with you?”</span>
                : <span style={{ color: "var(--s-block)", fontStyle: "normal", fontFamily: "var(--mono)", fontSize: "0.9rem" }}>Held at the gate. No notification. No intrusion.</span>)}
        </div>
        <div className="row wrap" style={{ gap: "0.7rem" }}>
          <button className="btn btn-primary" disabled={!consent} style={{ opacity: consent ? 1 : 0.45 }}
            onClick={() => setSent(true)}>
            Send through the gate <span className="arrow">→</span>
          </button>
          <span className="mono dim" style={{ fontSize: "0.78rem" }}>
            {consent ? "Consent granted — sending is now possible." : "Without consent, the send button does nothing."}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- MOTION OBJECTS ---------------- */

/* scroll-progress hairline */
function ScrollProgress() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    const onScroll = () => {
      const doc = document.documentElement;
      const max = (doc.scrollHeight - window.innerHeight) || 1;
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      if (el) el.style.width = (p * 100).toFixed(2) + "%";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);
  return <div className="progress" ref={ref}></div>;
}

/* slow mono ticker of the values */
function Ticker() {
  const items = window.EARTHOS.VALUES.map(v => v[0]);
  const Set = () => (
    <>
      {items.map((t, i) => (
        <span className="ticker-item" key={i}><span className="ticker-sep">◆</span> {t}</span>
      ))}
    </>
  );
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track"><Set /><Set /></div>
    </div>
  );
}

/* faint drifting concentric-orbit motif used as a background object */
function Deco({ size = 320, top, left, right, bottom, variant = "slow", opacity = 0.5 }) {
  const cls = variant === "med" ? "spin-med" : "spin-slow";
  return (
    <div className="deco float-y" style={{ width: size, height: size, top, left, right, bottom, opacity }}>
      <svg viewBox="0 0 100 100">
        <g className={cls}>
          <circle className="r d" cx="50" cy="50" r="48" />
          <circle className="r" cx="50" cy="50" r="34" />
          <circle className="r" cx="50" cy="50" r="20" />
          <circle className="n" cx="50" cy="2" r="1.6" />
          <circle className="n" cx="84" cy="50" r="1.4" />
          <circle className="n" cx="50" cy="70" r="1.4" />
        </g>
      </svg>
    </div>
  );
}

Object.assign(window, { go, Reveal, useRevealRoot, Nav, Footer, Logo, SendGate, ScrollProgress, Ticker, Deco });

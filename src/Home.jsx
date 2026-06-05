import React, { useEffect } from 'react';
import { VALUES, STATUS } from './data.js';
import { StatusBadge, EcosystemTree } from './tree.jsx';
import { Reveal, useRevealRoot, SectionHead, SendGate, Deco } from './components.jsx';
import { HeroOrb } from './background.jsx';

export function Home() {
  useRevealRoot();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="home-root">
      <Deco size={420} top="6%" right="-140px" variant="slow" opacity={0.45} />
      <Deco size={300} top="34%" left="-120px" variant="med" opacity={0.4} />
      <Deco size={360} top="62%" right="-110px" variant="slow" opacity={0.4} />
      <Deco size={280} top="86%" left="-90px" variant="med" opacity={0.35} />

      {/* HERO */}
      <header className="container" style={{ paddingTop: "clamp(40px,8vh,90px)", paddingBottom: "clamp(30px,6vh,70px)" }}>
        <div className="grid duo" style={{ gridTemplateColumns: "1.15fr 0.85fr", alignItems: "center", gap: "clamp(20px,4vw,60px)" }}>
          <div>
            <Reveal className="row wrap" style={{ gap: "0.8rem", marginBottom: "1.6rem" }}>
              <StatusBadge status="foundation" pulse />
              <span className="mono dim" style={{ fontSize: "0.78rem" }}>Stage: pre-MVP &middot; honesty over hype</span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="display h-hero">
                Protect life<br />
                <span className="serif-it">before you scale.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="lede" style={{ maxWidth: "46ch", marginTop: "1.4rem" }}>
                EarthOS is a portable, consent-first, local-first source foundation — built on the QLPA Matrix, so every system it carries begins already protected.
              </p>
            </Reveal>
            <Reveal delay={240} className="row wrap" style={{ gap: "0.9rem", marginTop: "2rem" }}>
              <a className="btn btn-primary" href="#/about">Enter EarthOS <span className="arrow">&rarr;</span></a>
              <a className="btn btn-ghost" href="#/status">See what's real</a>
            </Reveal>
          </div>
          <Reveal delay={200} style={{ display: "grid", placeItems: "center" }}>
            <HeroOrb />
          </Reveal>
        </div>
      </header>

      {/* ONE-SENTENCE DEFINITION */}
      <section className="container section-sm">
        <Reveal className="card" style={{ padding: "clamp(1.6rem,4vw,2.8rem)", textAlign: "center" }}>
          <span className="eyebrow">In one sentence</span>
          <p className="display h2" style={{ margin: "1rem auto 0", maxWidth: "26ch", fontWeight: 400 }}>
            QLPA — Quantum Love Protection Architecture — is the calm, protected ground that other digital systems can be built on, where <span className="serif-it">consent comes first</span>.
          </p>
        </Reveal>
      </section>

      {/* CORE VALUES */}
      <section className="container section">
        <SectionHead eyebrow="Commitments the system makes">Nine principles, built into the ground.</SectionHead>
        <div className="grid cols-3">
          {VALUES.map(([t, d], i) => (
            <Reveal key={i} delay={i * 60} className="card hover">
              <div className="mono" style={{ color: "var(--accent)", fontSize: "0.8rem", marginBottom: "0.8rem" }}>{String(i + 1).padStart(2, "0")}</div>
              <h3 className="h3" style={{ margin: "0 0 0.45rem" }}>{t}</h3>
              <p className="muted" style={{ margin: 0, fontSize: "0.96rem" }}>{d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ECOSYSTEM OVERVIEW */}
      <section className="container section">
        <div className="grid duo" style={{ gridTemplateColumns: "0.9fr 1.1fr", gap: "clamp(20px,4vw,56px)", alignItems: "start" }}>
          <div className="sticky-col" style={{ position: "sticky", top: "100px" }}>
            <SectionHead eyebrow="The ecosystem">One source, many protected layers.</SectionHead>
            <Reveal as="p" className="muted" style={{ maxWidth: "40ch" }}>
              Everything in EarthOS grows from the QLPA Matrix Source. Expand the tree to explore each layer — and see honestly where it stands.
            </Reveal>
            <Reveal delay={80} className="row wrap" style={{ gap: "0.6rem", marginTop: "1.2rem" }}>
              <StatusBadge status="active" /><StatusBadge status="foundation" /><StatusBadge status="planned" /><StatusBadge status="inactive" />
            </Reveal>
          </div>
          <Reveal delay={100}>
            <EcosystemTree compact />
          </Reveal>
        </div>
      </section>

      {/* MESSAGING PREVIEW */}
      <section className="container section">
        <div className="grid duo" style={{ gridTemplateColumns: "1fr 1fr", gap: "clamp(20px,4vw,56px)", alignItems: "center" }}>
          <div>
            <SectionHead eyebrow="EarthOS Messaging">Messaging that asks before it speaks.</SectionHead>
            <Reveal as="p" className="muted" style={{ maxWidth: "42ch" }}>
              Every message is a request, not an intrusion. Consent and trust are checked before delivery — not buried in settings. Try the consent gate.
            </Reveal>
            <Reveal delay={80} style={{ marginTop: "1.4rem" }}>
              <a className="btn btn-ghost" href="#/messaging">Explore Messaging <span className="arrow">&rarr;</span></a>
            </Reveal>
          </div>
          <Reveal delay={120}><SendGate /></Reveal>
        </div>
      </section>

      {/* QLPA MATRIX PREVIEW */}
      <section className="container section">
        <Reveal className="card" style={{ padding: "clamp(1.6rem,4vw,3rem)", overflow: "hidden" }}>
          <div className="grid duo" style={{ gridTemplateColumns: "1.1fr 0.9fr", gap: "clamp(20px,4vw,48px)", alignItems: "center" }}>
            <div>
              <span className="eyebrow">QLPA Matrix &middot; the source</span>
              <h2 className="h2" style={{ margin: "0.8rem 0" }}>Encode the source once. Inherit it everywhere.</h2>
              <p className="muted" style={{ maxWidth: "44ch" }}>
                Beneath every product is a shared foundation of principles, protection, and design. Fix the source, and every system built on it improves at once.
              </p>
              <div style={{ marginTop: "1.4rem" }}><a className="btn btn-ghost" href="#/qlpa">Into the Matrix <span className="arrow">&rarr;</span></a></div>
            </div>
            <div className="grid cols-2" style={{ gap: "12px" }}>
              {[["Net Shield", "netshield"], ["Language Protocol", "language"], ["Capability Matrix", "matrix"], ["Privacy & Sovereignty", "privacy"]].map(([t, p], i) => (
                <a key={i} href={`#/${p}`} className="card hover link" style={{ padding: "1.1rem", background: "rgba(255,255,255,0.02)" }}>
                  <span className="node-dot" style={{ marginBottom: "0.7rem" }}></span>
                  <div style={{ fontFamily: "var(--serif)", fontWeight: 460 }}>{t}</div>
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* PRIVACY & CONSENT PROMISE */}
      <section className="container section">
        <div className="grid cols-2" style={{ alignItems: "center", gap: "clamp(20px,4vw,56px)" }}>
          <Reveal>
            <span className="eyebrow">Our promise</span>
            <h2 className="display h2" style={{ margin: "0.8rem 0", maxWidth: "16ch" }}>
              Your data stays <span className="serif-it">yours</span>.
            </h2>
            <p className="muted" style={{ maxWidth: "42ch" }}>
              Local-first by default. Export, clear, and migrate are always available. No silent upload, no silent extraction — sovereignty is structural, not a setting.
            </p>
            <div style={{ marginTop: "1.4rem" }}><a className="btn btn-ghost" href="#/privacy">Privacy & Sovereignty <span className="arrow">&rarr;</span></a></div>
          </Reveal>
          <div className="grid" style={{ gap: "12px" }}>
            {[["Local-first", "Your device is the default home for your data."], ["Revocable consent", "Withdraw any time, recorded in the ledger."], ["Right to exit", "Leave whole, and take everything with you."]].map(([t, d], i) => (
              <Reveal key={i} delay={i * 70} className="card hover">
                <div className="row" style={{ gap: "0.8rem" }}>
                  <span className="node-dot"></span>
                  <strong style={{ fontFamily: "var(--serif)", fontWeight: 500 }}>{t}</strong>
                </div>
                <p className="muted" style={{ margin: "0.5rem 0 0 1.8rem", fontSize: "0.95rem" }}>{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ROADLINE PREVIEW */}
      <section className="container section">
        <SectionHead eyebrow="The Roadline">An honest path — not a wall of promises.</SectionHead>
        <div className="grid cols-4">
          {[["Foundation", "foundation", "Encode the source."], ["Communication", "prototype", "Prove local-first messaging."], ["Transport & Bridge", "inactive", "Relay, carefully."], ["Value & governance", "inactive", "Only after review."]].map(([t, s, d], i) => (
            <Reveal key={i} delay={i * 70} className="card hover">
              <div className="mono dim" style={{ fontSize: "0.78rem", marginBottom: "0.6rem" }}>PHASE {String(i + 1).padStart(2, "0")}</div>
              <h3 className="h3" style={{ margin: "0 0 0.5rem" }}>{t}</h3>
              <p className="muted" style={{ margin: "0 0 1rem", fontSize: "0.92rem" }}>{d}</p>
              <StatusBadge status={s} />
            </Reveal>
          ))}
        </div>
        <Reveal style={{ marginTop: "1.6rem" }}><a className="btn btn-ghost" href="#/roadline">See the full Roadline <span className="arrow">&rarr;</span></a></Reveal>
      </section>

      {/* CURRENT STATUS */}
      <section className="container section">
        <Reveal className="card" style={{ padding: "clamp(1.6rem,4vw,2.8rem)" }}>
          <div className="row wrap" style={{ justifyContent: "space-between", gap: "1rem", alignItems: "flex-end", marginBottom: "1.6rem" }}>
            <div>
              <span className="eyebrow">Current status &middot; honesty is a feature</span>
              <h2 className="h2" style={{ margin: "0.6rem 0 0" }}>Nothing here pretends to be finished.</h2>
            </div>
            <a className="btn btn-ghost" href="#/status">Full ledger <span className="arrow">&rarr;</span></a>
          </div>
          <div className="grid cols-3">
            {Object.entries(STATUS).map(([k, v]) => (
              <div key={k} className="row" style={{ gap: "0.7rem", padding: "0.7rem 0", borderTop: "1px solid var(--line)" }}>
                <StatusBadge status={k} />
                <span className="dim" style={{ fontSize: "0.84rem" }}>{v.blurb}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* INVITATION */}
      <section className="container section">
        <Reveal className="card" style={{ padding: "clamp(2.5rem,6vw,5rem)", textAlign: "center" }}>
          <div>
            <span className="kicker">An invitation</span>
            <h2 className="display h1" style={{ margin: "1.4rem auto 1.2rem", maxWidth: "16ch" }}>
              Build the foundation <span className="serif-it">with us.</span>
            </h2>
            <p className="lede" style={{ maxWidth: "52ch", margin: "0 auto 2rem" }}>
              We're not looking for hype. We're looking for builders, designers, organizers, translators, legal reviewers, and community stewards who believe technology should protect life first.
            </p>
            <div className="row wrap" style={{ justifyContent: "center", gap: "0.9rem" }}>
              <a className="btn btn-primary" href="#/contact">Offer to help <span className="arrow">&rarr;</span></a>
              <a className="btn btn-ghost" href="#/about">Read the vision</a>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

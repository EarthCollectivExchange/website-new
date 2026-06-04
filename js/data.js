/* ============================================================
   EarthOS — content backbone
   Sourced from the QLPA Matrix Source (canonical-v1).
   QLPA = Quantum Love Protection Architecture.
   ============================================================ */
window.EARTHOS = (function () {

  // ---- status / maturity model (from releaseContract + source canon) ----
  const STATUS = {
    active:     { label: "Active",          cls: "st-active",     blurb: "Working, tested, live." },
    foundation: { label: "Foundation-only", cls: "st-foundation", blurb: "Architecture defined; product follows." },
    prototype:  { label: "Prototype",       cls: "st-prototype",  blurb: "Built and testable; not production." },
    local:      { label: "Local-only",      cls: "st-local",      blurb: "Runs on your device; nothing is sent." },
    planned:    { label: "Planned",         cls: "st-planned",    blurb: "Intended; not started." },
    inactive:   { label: "Inactive",        cls: "st-inactive",   blurb: "Defined but switched off; needs review or infrastructure." },
    never:      { label: "Never allowed",   cls: "st-never",      blurb: "Forbidden by design. Permanent." },
  };

  const NAV = [
    { label: "Foundation", items: [
      ["about",        "About EarthOS",       "A portable, consent-first source"],
      ["qlpa",         "QLPA Matrix Source",  "Quantum Love Protection Architecture"],
      ["principles",   "The Nine Principles",  "Commitments the system makes"],
      ["architecture", "13 Pillars",          "What the source is made of"],
    ]},
    { label: "Protection", items: [
      ["netshield",  "Net Shield",          "Five readiness levels"],
      ["privacy",    "Privacy & Sovereignty","Local-first, consent ledger"],
      ["language",   "Language Protocol",    "Calm words, by design"],
      ["stats",      "Stats, Privately",     "Counts, never content"],
    ]},
    { label: "Communication", items: [
      ["messaging",  "EarthOS Messaging",   "Consent-aware communication"],
      ["matrix",     "Capability Matrix",   "Every kind, gated by trust"],
      ["trust",      "Trust & Consent",     "Active, revocable, visible"],
    ]},
    { label: "Boundaries", items: [
      ["earthcoin",  "EarthCoin Boundary",  "Inactive, by design"],
      ["governance", "Governance Boundary", "Public proposals, right to exit"],
      ["bridge",     "EarthOS Bridge",      "What may cross, and how"],
    ]},
    { label: "Build", items: [
      ["status",     "Release Status",      "Stage: pre-MVP"],
      ["roadline",   "Roadline",            "The honest path"],
      ["developers", "For Developers",      "Inherit the foundation"],
      ["docs",       "Documentation",       "Concepts & vocabulary"],
    ]},
  ];

  // ---- ecosystem hierarchy (interactive tree) ----
  const TREE = {
    name: "QLPA Matrix Source", page: "qlpa", status: "foundation",
    desc: "The portable source every EarthOS system inherits.",
    children: [
      { name: "Net Shield Foundation", page: "netshield", status: "foundation", desc: "Protection in five readiness levels.",
        children: [
          { name: "Language Shield", page: "language" },
          { name: "Consent Shield", page: "trust" },
          { name: "Encryption Shield", page: "privacy" },
          { name: "Trust Shield", page: "trust" },
          { name: "Source Shield", page: "qlpa" },
          { name: "Guardian Shield", page: "netshield", status: "planned" },
        ]},
      { name: "EarthOS Messaging", page: "messaging", status: "prototype", desc: "Consent-aware communication.",
        children: [
          { name: "Local messaging", page: "messaging", status: "active" },
          { name: "Capability Matrix", page: "matrix" },
          { name: "Intention Mirror", page: "messaging" },
          { name: "Voice notes", page: "matrix", status: "prototype" },
          { name: "File transfer", page: "matrix", status: "prototype" },
        ]},
      { name: "Privacy & Sovereignty", page: "privacy", status: "foundation", desc: "Local-first; you own your data.",
        children: [
          { name: "Consent ledger", page: "trust" },
          { name: "Local-first storage", page: "privacy", status: "active" },
          { name: "Export, clear, migrate", page: "privacy" },
          { name: "No hidden extraction", page: "principles", status: "never" },
        ]},
      { name: "Stats Analyzer", page: "stats", status: "foundation", desc: "Aggregate counts, never content.",
        children: [
          { name: "Off / Light / Complete", page: "stats" },
          { name: "Aggregate classes only", page: "stats" },
          { name: "No personal identifiers", page: "stats", status: "never" },
        ]},
      { name: "EarthOS Bridge", page: "bridge", status: "planned", desc: "Boundary between private and public.",
        children: [
          { name: "Public signals", page: "bridge", status: "planned" },
          { name: "Governance circles", page: "governance", status: "planned" },
          { name: "EarthCoin records", page: "earthcoin", status: "inactive" },
        ]},
      { name: "EarthCoin Boundary", page: "earthcoin", status: "inactive", desc: "Switched off until review.",
        children: [
          { name: "Token rewards", page: "earthcoin", status: "inactive" },
          { name: "Records from private content", page: "earthcoin", status: "never" },
        ]},
    ]
  };

  // ---- the nine principles (verbatim from qlpaPrinciples.ts) ----
  const VALUES = [
    ["Truth", "The system only claims what it can actually do. No overclaiming protection or delivery it cannot verify."],
    ["Calm", "Language and interface reduce anxiety rather than create urgency. No fear-based copy, no dark patterns."],
    ["Consent", "No message, file, voice, or action proceeds without active or clearly standing consent. Never assumed."],
    ["Sovereignty", "You own your data. Local-first by default. Export, clear, and migrate are always available."],
    ["Care", "Designed to support human wellbeing, not to optimise engagement. Relationships over session length."],
    ["Clarity", "Every action has a visible consequence, explained in plain language."],
    ["Reversibility where possible", "Actions are reversible where feasible. When they are not, that is stated plainly — never dramatised."],
    ["No hidden extraction", "No plaintext content or private keys leave the device without an explicit export action."],
    ["No overclaiming", "The system never claims remote deletion it cannot guarantee. Certainty levels are always honest."],
  ];

  const N = (page, label) => ({ page, label });

  const PAGES = {

    /* ---------------- ABOUT ---------------- */
    about: {
      eyebrow: "The foundation", status: "foundation",
      title: "A portable, consent-first source for the EarthOS family of systems.",
      lede: "EarthOS is not a framework and not an app. It is a set of roots — design language, privacy rules, protection architecture, and mode logic — that any aligned system inherits to begin from the same protected, coherent ground.",
      sections: [
        { kind: "prose", heading: "Core intention",
          body: ["Calm protection. Clear consent. Local sovereignty. Truthful language. Privacy by structure. Phi-aligned design rhythm. Multilingual readiness. Reusable intelligence. Transparent maturity. Portable foundation. Life-supporting systems.",
                 "Rather than re-deciding ethics in each product, EarthOS encodes them once — in the QLPA Matrix Source — so every system built on it starts already protected."] },
        { kind: "values", heading: "The nine principles" },
        { kind: "points", heading: "What EarthOS is — and is not", items: [
          { title: "It is a set of roots", body: "Design language, privacy rules, protection architecture, i18n, and mode logic." },
          { title: "It is honest about maturity", body: "Every capability carries a status: active, foundation, prototype, planned, or inactive.", page: "status" },
          { title: "It is not a framework", body: "Nothing here optimises engagement. There are no growth metrics and no dark patterns." },
          { title: "It is not finished", body: "The current stage is pre-MVP. Most layers are foundation or prototype — by design.", page: "roadline" },
        ]},
        { kind: "disclaimer", text: "EarthOS / QLPA Matrix Source is at stage pre-MVP. Status labels throughout this site state exactly where each piece stands. The system never claims a capability is live before it is." },
      ],
      next: [N("qlpa","QLPA Matrix Source"), N("principles","The Nine Principles"), N("netshield","Net Shield")],
    },

    /* ---------------- QLPA ---------------- */
    qlpa: {
      eyebrow: "Source foundation", status: "foundation",
      title: "QLPA Matrix Source.",
      lede: "Quantum Love Protection Architecture — the portable, local-first, Phi-aligned source foundation every EarthOS-aligned system inherits to begin from the same protected, coherent base.",
      sections: [
        { kind: "prose", heading: "One source, many systems",
          body: ["QLPA is not a library you call. It is a foundation you stand on. It holds the design language, the privacy rules, the protection architecture, the multilingual root, and the mode logic — so a fix to the foundation reaches everything built on it at once."] },
        { kind: "pillars" },
        { kind: "prose", heading: "Transparent maturity",
          body: ["Every capability in the source carries a maturity label — active, scaffold, or future — and that label is always visible to developers. Advanced and developer interface depths surface more maturity context, never less."] },
        { kind: "disclaimer", text: "The QLPA Matrix Source is canonical-v1. The thirteen pillars are active as foundation; the products built upon them range from prototype to planned." },
      ],
      next: [N("architecture","The 13 Pillars"), N("principles","Nine Principles"), N("developers","For Developers")],
    },

    /* ---------------- PRINCIPLES ---------------- */
    principles: {
      eyebrow: "Commitments", status: "active",
      title: "The Nine Principles.",
      lede: "These are not rules imposed on people. They are commitments the system makes — and is checked against — on every action.",
      sections: [
        { kind: "values", heading: "" },
        { kind: "disclaimer", text: "The nine principles are enforced in the source as design axioms and validation checks, not as marketing language. They constrain what the system is allowed to do." },
      ],
      next: [N("netshield","Net Shield"), N("language","Language Protocol"), N("privacy","Privacy & Sovereignty")],
    },

    /* ---------------- ARCHITECTURE / PILLARS ---------------- */
    architecture: {
      eyebrow: "Technical", status: "foundation",
      title: "Thirteen Pillars.",
      lede: "The QLPA Matrix Source is built from thirteen canonical pillars — each one active as foundation, each one inherited intact by every aligned system.",
      sections: [
        { kind: "pillars" },
        { kind: "prose", heading: "Inheritance, not duplication",
          body: ["Because the pillars live at the base, every product above inherits them automatically. A system cannot opt out of consent, privacy, or honest maturity labelling — those are properties of the ground it stands on."] },
        { kind: "disclaimer", text: "This is a conceptual map of the source pillars, not a deployed technical specification." },
      ],
      next: [N("qlpa","QLPA Matrix Source"), N("netshield","Net Shield"), N("developers","For Developers")],
    },

    /* ---------------- NET SHIELD ---------------- */
    netshield: {
      eyebrow: "Protection", status: "foundation",
      title: "Net Shield.",
      lede: "Protection is not a single switch. It is a layered architecture with five readiness levels — and the system never overclaims what any level guarantees.",
      sections: [
        { kind: "shieldlevels" },
        { kind: "points", heading: "Shield layers", items: [
          { title: "Language Shield", body: "Calm, honest wording at every protective moment.", page: "language" },
          { title: "Consent Shield", body: "Nothing proceeds without active or standing consent.", page: "trust" },
          { title: "Encryption Shield", body: "Content held locally; keys never silently leave the device." },
          { title: "Trust Shield", body: "Capabilities gated by relationship trust level.", page: "matrix" },
          { title: "Source Shield", body: "The foundation's own integrity protection." },
          { title: "Stats Privacy Shield", body: "Counts without content, identifiers, or bodies.", page: "stats" },
        ]},
        { kind: "disclaimer", text: "Guardian Shield and Recovery Shield are future layers requiring infrastructure not yet built. Protection language is always calm and honest; the system never claims a level it has not reached." },
      ],
      next: [N("privacy","Privacy & Sovereignty"), N("language","Language Protocol"), N("matrix","Capability Matrix")],
    },

    /* ---------------- PRIVACY ---------------- */
    privacy: {
      eyebrow: "Protection", status: "foundation",
      title: "Privacy & Sovereignty.",
      lede: "Local storage is the default for everything. Remote capabilities are clearly labelled scaffold or future. Nothing leaves your device without an explicit action you take.",
      sections: [
        { kind: "prose", heading: "Local-first by structure",
          body: ["Sovereignty here is structural, not a setting. Your content lives on your device first. Export, clear, and migrate are always available. There is no silent upload and no silent extraction."] },
        { kind: "points", heading: "What sovereignty means", items: [
          { title: "You own your data", body: "Local-first by default, always.", status: "active" },
          { title: "Consent is in a ledger", body: "Active, revocable, and visible in plain language.", page: "trust" },
          { title: "Export & migrate, anytime", body: "Take everything with you. Leaving is a feature." },
          { title: "No hidden extraction", body: "No plaintext content or private keys leave without your explicit export.", status: "never" },
        ]},
        { kind: "disclaimer", text: "No personal data is collected by this site. In the product, remote relay and production end-to-end encryption are not active yet — and are labelled as such." },
      ],
      next: [N("trust","Trust & Consent"), N("stats","Stats, Privately"), N("netshield","Net Shield")],
    },

    /* ---------------- LANGUAGE ---------------- */
    language: {
      eyebrow: "Protection", status: "active",
      title: "The Language Protocol.",
      lede: "Calm is a design decision made word by word. The protocol defines discouraged terms and their approved replacements — because how a system speaks shapes how it makes you feel.",
      sections: [
        { kind: "prose", heading: "Words carry pressure",
          body: ["Fear-based language manufactures urgency. The QLPA Language Protocol replaces alarm with clarity: protection becomes something steady you can understand, not a siren you must react to."] },
        { kind: "langtable" },
        { kind: "prose", heading: "Preferred vocabulary",
          body: ["shield · protect · clear · seal · pause · restore · review · confirm · trust · guardian · source · auto-clear · protection response · delivery paused · held locally · verified · ready · needs review."] },
        { kind: "disclaimer", text: "The Language Protocol is active in the source and enforced by check scripts. Multilingual readiness spans seven locales, with meaning preserved rather than flattened." },
      ],
      next: [N("netshield","Net Shield"), N("principles","Nine Principles"), N("messaging","Messaging")],
    },

    /* ---------------- STATS ---------------- */
    stats: {
      eyebrow: "Protection", status: "foundation",
      title: "Stats, privately.",
      lede: "Understanding your own use should never cost you your privacy. Stats are local, aggregate, and structurally incapable of holding content.",
      sections: [
        { kind: "points", heading: "Three modes, your choice", items: [
          { title: "Off", body: "No stats are collected at all.", status: "active" },
          { title: "Light", body: "Local aggregate counts only.", status: "active" },
          { title: "Complete", body: "Richer local analysis.", status: "foundation" },
        ]},
        { kind: "flist", heading: "What stats never include", items: [
          { title: "Message bodies", body: "Never read, never counted by content." },
          { title: "File names & voice content", body: "Excluded entirely from any analysis." },
          { title: "Private keys", body: "Out of scope by structure." },
          { title: "Contact names, email, phone numbers", body: "No personal identifiers, ever." },
        ]},
        { kind: "disclaimer", text: "Stats use aggregate classes and size or duration buckets — never personal identifiers. All analysis is local." },
      ],
      next: [N("privacy","Privacy & Sovereignty"), N("netshield","Net Shield"), N("principles","Nine Principles")],
    },

    /* ---------------- MESSAGING ---------------- */
    messaging: {
      eyebrow: "Communication", status: "prototype",
      title: "Messaging that asks before it speaks.",
      lede: "EarthOS Messaging treats every message as a request, not an intrusion. Consent, trust, and calm are part of the protocol — checked before delivery, not buried in settings.",
      sections: [
        { kind: "prose", heading: "Consent before contact",
          body: ["Before a message reaches someone, the system checks consent and the relationship's trust level for that kind of message. Reaching a stranger is a request they can quietly decline — never a notification forced into their day."] },
        { kind: "gate" },
        { kind: "points", heading: "What's inside Messaging", items: [
          { title: "Local messaging", body: "Working today, entirely on your device.", status: "active" },
          { title: "Intention Mirror", body: "A calm pause that reflects a message back before it sends.", status: "prototype" },
          { title: "Capability Matrix", body: "Every message kind gated by trust and consent.", status: "foundation", page: "matrix" },
          { title: "Relay transport", body: "Sending between devices. Not active yet.", status: "inactive" },
        ]},
        { kind: "disclaimer", text: "Private message content is never tokenized, sold, or used to train models. Production relay and end-to-end encryption are not active yet — and the system says so plainly." },
      ],
      next: [N("matrix","Capability Matrix"), N("trust","Trust & Consent"), N("language","Language Protocol")],
    },

    /* ---------------- CAPABILITY MATRIX ---------------- */
    matrix: {
      eyebrow: "Communication", status: "foundation",
      title: "The Capability Matrix.",
      lede: "No capability reaches the interface without a policy here. Each communication kind declares the trust it requires, the consent it needs, and where it is allowed to go.",
      sections: [
        { kind: "prose", heading: "Policy before product",
          body: ["Private text does not become public by default. Voice, photo, video, files, and location require stronger consent. Calls and recordings require explicit recording consent from everyone. Unknown trust never unlocks media, files, calls, or location."] },
        { kind: "capmatrix" },
        { kind: "disclaimer", text: "This is a curated view of the canonical matrix. EarthCoin and governance records may never be created from raw private content; public signals always require explicit Bridge consent." },
      ],
      next: [N("trust","Trust & Consent"), N("bridge","EarthOS Bridge"), N("messaging","Messaging")],
    },

    /* ---------------- TRUST ---------------- */
    trust: {
      eyebrow: "Communication", status: "foundation",
      title: "Trust & Consent.",
      lede: "Consent is a verb here — active, revocable, and visible in a ledger. Trust is a relationship level that decides what a connection is allowed to do.",
      sections: [
        { kind: "points", heading: "Consent, four ways", items: [
          { title: "Active, not passive", body: "A clear yes — never an assumed one." },
          { title: "Revocable at any time", body: "Withdraw instantly, with no penalty." },
          { title: "Visible in the ledger", body: "Every consent is recorded and reviewable." },
          { title: "Plain language", body: "You agree to one clear thing, stated simply." },
        ]},
        { kind: "flist", heading: "Trust levels gate capability", items: [
          { title: "Unknown", body: "Can receive a text invite. No media, files, calls, or location." },
          { title: "Known", body: "Unlocks voice notes, photos, video messages, files, and contact cards." },
          { title: "Trusted", body: "Unlocks calls, location, and governance or public signals." },
        ]},
        { kind: "disclaimer", text: "Trust is earned through relationship, not bought. Higher trust never bypasses consent or the Shield check." },
      ],
      next: [N("matrix","Capability Matrix"), N("privacy","Privacy & Sovereignty"), N("messaging","Messaging")],
    },

    /* ---------------- EARTHCOIN ---------------- */
    earthcoin: {
      eyebrow: "Boundary", status: "inactive",
      title: "The EarthCoin Boundary.",
      lede: "EarthCoin is switched off by design. Token rewards are inactive, and the boundaries around them are published before the idea itself.",
      sections: [
        { kind: "prose", heading: "A boundary, not a launch",
          body: ["Money attached to identity is exactly where systems tend to do harm, so EarthCoin begins as a set of limits. It is inactive in the release contract — not purchasable, not promised, not live.",
                 "Most importantly: EarthCoin records may never be created from raw private content. A conversation is not a transaction."] },
        { kind: "points", heading: "Boundaries that come first", items: [
          { title: "Token rewards", body: "Defined in the contract, switched off.", status: "inactive" },
          { title: "Records from private content", body: "Private messages can never become EarthCoin records.", status: "never" },
          { title: "Bridge-gated only", body: "Any value signal requires explicit Bridge consent.", page: "bridge" },
          { title: "Review before activation", body: "Nothing proceeds without ethical and legal review." },
        ]},
        { kind: "disclaimer", text: "EarthCoin is not a cryptocurrency offering, investment, or product. It is inactive by design. This page is informational only and is not financial advice or a solicitation." },
      ],
      next: [N("governance","Governance Boundary"), N("bridge","EarthOS Bridge"), N("status","Release Status")],
    },

    /* ---------------- GOVERNANCE ---------------- */
    governance: {
      eyebrow: "Boundary", status: "planned",
      title: "The Governance Boundary.",
      lede: "Governance signals are public by nature, made through councils, and recorded on a public ledger — while private communication stays beyond any governing body's reach.",
      sections: [
        { kind: "prose", heading: "Public, accountable, exitable",
          body: ["Governance circles are planned, not live. When they arrive, proposals will be public, decisions will be made by those affected, and no governing body — including the makers — will have access to private communication. Anyone may exit, and take their data with them."] },
        { kind: "points", heading: "The limits", items: [
          { title: "Public proposals", body: "Governance signals are inherently public, on a public ledger.", status: "planned" },
          { title: "Council decisions", body: "Made by trusted members in community context.", status: "planned" },
          { title: "Right to exit", body: "Always available, with full data portability." },
          { title: "No access to private communication", body: "Governance never reads private messages.", status: "never" },
        ]},
        { kind: "disclaimer", text: "Governance circles are planned. Formal mechanisms are not implemented. The boundary — no access to private communication — is permanent regardless of timeline." },
      ],
      next: [N("bridge","EarthOS Bridge"), N("earthcoin","EarthCoin Boundary"), N("privacy","Privacy & Sovereignty")],
    },

    /* ---------------- BRIDGE ---------------- */
    bridge: {
      eyebrow: "Boundary", status: "planned",
      title: "The EarthOS Bridge.",
      lede: "The Bridge is the deliberate seam between private communication and public systems. Crossing it is never automatic — it always requires explicit, specific consent.",
      sections: [
        { kind: "prose", heading: "Nothing crosses by accident",
          body: ["Most harm happens when private things quietly become public. The Bridge makes that crossing a conscious act: only capabilities that are bridge-gated, and only with explicit consent, may pass from the private side to public signals, governance, or value records."] },
        { kind: "points", heading: "What the Bridge governs", items: [
          { title: "Public signals", body: "Sharing outward requires explicit Bridge consent.", status: "planned" },
          { title: "Governance records", body: "Only governance signals enter the public ledger.", page: "governance" },
          { title: "EarthCoin records", body: "Bridge-gated, and never from private content.", page: "earthcoin", status: "inactive" },
          { title: "Private by default", body: "Direct messages can never become public on their own.", status: "never" },
        ]},
        { kind: "disclaimer", text: "The EarthOS Bridge is planned. Its rules already exist in the capability matrix so that no future product can quietly route private content into public systems." },
      ],
      next: [N("matrix","Capability Matrix"), N("governance","Governance Boundary"), N("earthcoin","EarthCoin Boundary")],
    },

    /* ---------------- STATUS ---------------- */
    status: {
      eyebrow: "Transparent ledger", status: "active",
      title: "Release Status.",
      lede: "Current stage: pre-MVP. Honesty is a feature — here is exactly where every capability stands, drawn from the release contract itself.",
      sections: [
        { kind: "ledger" },
        { kind: "disclaimer", text: "If something seems more finished than its label says, the label is correct. The release contract is the single source of truth; this page mirrors it." },
      ],
      next: [N("roadline","Roadline"), N("qlpa","QLPA Matrix Source"), N("contact","Collaborate")],
    },

    /* ---------------- ROADLINE ---------------- */
    roadline: {
      eyebrow: "The path forward", status: "prototype",
      title: "The Roadline.",
      lede: "Not a roadmap full of promises — a Roadline showing honestly where each layer stands and what genuinely comes next.",
      sections: [
        { kind: "roadline" },
        { kind: "disclaimer", text: "The Roadline reflects current intentions. Dates are deliberately omitted; the system moves at the speed of doing things safely, not the speed of shipping." },
      ],
      next: [N("status","Release Status"), N("developers","For Developers"), N("about","About EarthOS")],
    },

    /* ---------------- DEVELOPERS ---------------- */
    developers: {
      eyebrow: "For Developers", status: "foundation",
      title: "Inherit the foundation.",
      lede: "Build on the QLPA Matrix Source and the right thing becomes the default thing — consent, privacy, calm language, and honest maturity arrive with the ground you stand on.",
      sections: [
        { kind: "prose", heading: "The ethical thing is the easy thing",
          body: ["When consent and privacy live in the foundation, you don't add them — you'd have to work to remove them. The source ships with a check pipeline that holds every aligned system to the same standard."] },
        { kind: "points", heading: "What you build on", items: [
          { title: "QLPA core & principles", body: "Shared logic and the nine commitments.", page: "qlpa" },
          { title: "Net Shield & capability matrix", body: "Layered protection and gated communication.", page: "matrix" },
          { title: "Phi / Fibonacci design root", body: "A calm, consistent visual rhythm." },
          { title: "Maturity labelling", body: "Ship with honest active / scaffold / future labels.", page: "status" },
        ]},
        { kind: "disclaimer", text: "There is no public SDK or API yet; the source is canonical-v1 and the stage is pre-MVP. The integrity pipeline runs 27 checks that an aligned build must pass." },
      ],
      next: [N("qlpa","QLPA Matrix Source"), N("architecture","13 Pillars"), N("docs","Documentation")],
    },

    /* ---------------- DOCS ---------------- */
    docs: {
      eyebrow: "Reference", status: "prototype",
      title: "Documentation.",
      lede: "Concepts and vocabulary for understanding how EarthOS thinks — written for people, not only engineers.",
      sections: [
        { kind: "points", heading: "Start here", items: [
          { title: "Concepts", body: "QLPA, Net Shield, consent ledger, the Bridge.", page: "about" },
          { title: "13 Pillars", body: "What the source is made of.", page: "architecture" },
          { title: "Nine Principles", body: "The commitments the system makes.", page: "principles" },
          { title: "Release status", body: "What each maturity label means.", page: "status" },
        ]},
        { kind: "glossary", heading: "Vocabulary" },
        { kind: "disclaimer", text: "Documentation is an evolving prototype. Concepts may be refined as the foundation matures from pre-MVP." },
      ],
      next: [N("developers","For Developers"), N("qlpa","QLPA Matrix Source"), N("language","Language Protocol")],
    },

    /* ---------------- CONTACT ---------------- */
    contact: {
      eyebrow: "Collaborate", status: "active",
      title: "Build the foundation with us.",
      lede: "EarthOS is developed as a calm, ethical foundation for future digital systems. We're not looking for hype — we're looking for builders who care about consent, privacy, and life-supporting technology.",
      sections: [
        { kind: "collab" },
        { kind: "contactform" },
        { kind: "disclaimer", text: "This is a concept site for an early-stage project at stage pre-MVP. Submitting the form on this prototype does not send a real message; reach out through the listed channel instead." },
      ],
      next: [N("about","About EarthOS"), N("status","Release Status"), N("roadline","Roadline")],
    },
  };

  return { STATUS, NAV, TREE, VALUES, PAGES };
})();

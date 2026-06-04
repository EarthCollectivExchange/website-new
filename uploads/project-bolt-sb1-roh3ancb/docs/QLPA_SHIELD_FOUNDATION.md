# QLPA Shield Foundation

> Communication without extraction also means communication without predation.

---

## Implementation Status

| Component | Status |
|-----------|--------|
| `lib/qlpa/abuseTaxonomy.ts` | Implemented (Pass 113) |
| `lib/qlpa/shieldPolicy.ts` | Implemented (Pass 113) |
| `lib/qlpa/reportingEngine.ts` | Implemented (Pass 113) |
| `shield.*` i18n keys (all 7 locales) | Implemented (Pass 112) |
| Report UI flow (ReportMessageDrawer) | Not yet implemented |
| Automated content scanning | Not yet implemented — requires legal review |
| Server-side report storage | Not yet implemented |
| Legal escalation workflow | Not yet implemented — requires legal sign-off |
| Production moderation dashboard | Not yet implemented |

---

## North Star

Shield exists to protect people from harm, not to monitor them. Every safety decision must pass one test:

*Does this protect the recipient without building a surveillance infrastructure over the sender?*

Concretely:
- No content scanning happens without explicit user action (reporting)
- No behavioral fingerprinting or pattern-matching on message content
- Safety policy is applied at the **space level**, not the user level
- Escalation to third parties requires informed consent from the reporting user

---

## Communication Without Predation

EarthOS Messaging operates on a single ethical premise: **communication is an act of trust**.

The Shield Foundation exists to preserve that trust when it is threatened — not to become a new threat itself.

| What Shield does | What Shield never does |
|-----------------|----------------------|
| Lets users report harmful content | Scans messages in transit |
| Hides content flagged as critical severity | Silently blocks or shadows content |
| Routes escalation reports with user consent | Shares data with advertisers or third-party analytics |
| Gives space owners policy controls | Overrides end-to-end encryption |
| Maintains an audit trail for the reporting user | Builds behavioral profiles on senders |

---

## Shield Scope by Space Type

Different spaces carry different risk surfaces. Shield policy is set per `ConversationType`, not per user.

| Space type | Shield level | Rationale |
|------------|-------------|-----------|
| `direct` | `off` | 1:1 trust relationship; user can block sender directly |
| `group` | `basic` | Known members; low moderation overhead |
| `project` | `basic` | Known members; low moderation overhead |
| `event` | `guarded` | Mixed trust; moderate signal needed |
| `council` | `guarded` | Mixed trust; deliberative space |
| `cause` | `guarded` | Public-adjacent; broader audience |
| `place` | `guarded` | Location-linked; potentially open |
| `support_circle` | `circle` | Vulnerable users; zero tolerance for exploitation |

Shield level controls:
- Which abuse categories trigger automatic content hiding vs. requiring explicit review
- Whether a report is held locally or eligible for escalation
- What `RecommendedShieldAction` is suggested to the space owner

---

## Abuse Categories

| Category | Severity | Requires escalation |
|----------|---------|---------------------|
| `spam-bot` | medium | No |
| `scam` | high | No |
| `malicious-link` | high | No |
| `adult-sexual` | high | No |
| `sexual-violence` | critical | Yes |
| `non-consensual-content` | high | Yes |
| `child-safety` | critical | Yes |
| `harassment` | medium | No |
| `hate` | high | No |
| `self-harm` | high | No |
| `illegal-goods` | high | No |
| `unknown` | low | No |

---

## Report Classification Flow

Reports flow through three stages (all local — no network calls):

```
User initiates report
      │
      ▼
validateReport()          — checks required fields, target type, reason
      │
      ▼
classifyReport()          — maps AbuseCategory + ShieldLevel → RecommendedShieldAction
      │
      ▼
ReportSubmission object   — status: 'draft' | 'submitted' | ...
                          — ready for local storage / future relay (with user consent)
```

---

## Unknown Actor Policy

When the sender of reported content is an unknown or unverified actor (trust level `unknown` or `blocked`):

1. The reported content is immediately eligible for local hiding (user-controlled)
2. The `RecommendedShieldAction` is escalated one level (e.g., `warn` → `hold`, `hold` → `block`)
3. No automated action is taken without user confirmation
4. The reporting user is shown a summary of what will happen before they confirm

---

## Child Safety — Non-Negotiable

`child-safety` is the only category where EarthOS takes a non-deferential stance:

- **Severity is always `critical`**. It cannot be downgraded by space policy or user preference.
- **Escalation flag is always `true`**. The reporting engine will prompt the user to escalate.
- **Content is immediately hidden** on classification, regardless of shield level.
- **No AI/ML auto-classification** will be used without explicit legal review and user disclosure.

> LEGAL REVIEW REQUIRED before any automated detection or escalation pipeline is activated in production. All current `classifyReport()` logic is UI-scaffolding only. No content leaves the device without user consent.

---

## Module Map

| Module | Location | Purpose |
|--------|----------|---------|
| `abuseTaxonomy` | `lib/qlpa/abuseTaxonomy.ts` | 12-category harm vocabulary; `ABUSE_CATEGORY_META`; `getAbuseMeta()` |
| `shieldPolicy` | `lib/qlpa/shieldPolicy.ts` | Maps space types to shield levels; `getRecommendedAction(category, level)` |
| `reportingEngine` | `lib/qlpa/reportingEngine.ts` | `createReport()`, `validateReport()`, `classifyReport()`; `ReportSubmission` type |

Shield modules are deliberately isolated from the consent engine, trust graph, and messaging data store. They do not import from business logic layers. This keeps the harm taxonomy portable and auditable.

---

## i18n Surface Keys (implemented)

All user-facing shield strings live under the `shield.*` namespace in all 7 locales (en, de, es, fr, id, it, pt):

| Key | Purpose |
|-----|---------|
| `shield.report` | Report action label |
| `shield.block` | Block action label |
| `shield.hide` | Hide action label |
| `shield.spamBot` | Abuse category display name |
| `shield.harmfulLink` | Abuse category display name |
| `shield.childSafetyConcern` | Abuse category display name (critical) |
| `shield.contentHiddenForSafety` | Inline notice for hidden content |
| `shield.reportSubmitted` | Confirmation toast text |

Additional taxonomy keys referenced in `ABUSE_CATEGORY_META` (`shield.scam`, `shield.harassment`, etc.) are defined in the module but not yet in locale files — they will be added when the report UI is built.

---

## What Must Happen Before Any UI Surfaces

1. **Legal review** of escalation pathways (especially `child-safety` and `sexual-violence`)
2. **Privacy impact assessment** for any server-side report storage
3. **UX research** on reporting friction — the flow must not re-traumatize the reporter
4. **Consent disclosure** in onboarding for spaces with `circle` or higher shield level
5. **Locale completion** — add remaining taxonomy keys to all 7 locale files before report UI ships

Shield is a promise to users, not a feature. Build it accordingly.

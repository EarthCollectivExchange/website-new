# QLPA Communication Envelope

> Private messages are not planetary statistics by default.
> Only an explicit user action can turn a private communication into a public EarthOS signal.

---

## North Star

EarthOS is built for human communication first — not for data extraction, not for behavioral advertising, not for surveillance infrastructure disguised as a product.

Every communication kind — text, voice, photo, video, file, location, call, reaction — must pass through the same principled lifecycle. The envelope is the contract that makes this uniform, auditable, and sovereign by default.

---

## Why One Envelope for All Communication Types

Without a canonical envelope model:
- Different communication types accumulate different consent paths, creating gaps
- File transfers, location shares, and voice notes can bypass gates that text messages go through
- The audit trail becomes incomplete — some events have integrity hashes, others don't
- Future kinds (proposals, ritual signals, EarthCoin transactions) have nowhere to attach lifecycle state

With a canonical envelope:
- **One lifecycle** — every kind travels the same path: Consent → Protection → Local storage → Optional relay → Retention → Audit
- **One consent gate** — `checkActionPermission(action, trust)` is always called before the envelope is created
- **One audit trail** — `EnvelopeAudit.ledgerEventIds` links every envelope to its ledger events
- **One retention contract** — the envelope's `retention` field governs expiry for all kinds

---

## Lifecycle Flow

```
User initiates communication (any kind)
            │
            ▼
  ┌─────────────────────┐
  │   Consent Gate      │  checkActionPermission(action, trustLevel)
  │   (consentEngine)   │  evaluateMessageConsent / evaluateRelayConsent
  └─────────┬───────────┘
            │ allowed / waiting
            ▼
  ┌─────────────────────┐
  │  Protection Gate    │  encrypt locally → EnvelopeProtectionState: 'sealed'
  │  (crypto.ts)        │  or 'local-prototype' in dev/demo mode
  └─────────┬───────────┘
            │
            ▼
  ┌─────────────────────┐
  │   Local Store       │  MessageLifecycleState: stored_local
  │   (localPersist.)   │  EnvelopeDeliveryState: 'local'
  └─────────┬───────────┘
            │ if relay enabled and trust ≥ minimum
            ▼
  ┌─────────────────────┐
  │  Optional Relay     │  EnvelopeDeliveryState: queued → ready → relayed → delivered
  │  (relay.ts)         │  StorageMode: encrypted_relay or encrypted_backup only
  └─────────┬───────────┘
            │
            ▼
  ┌─────────────────────┐
  │  Retention Engine   │  EnvelopeRetentionMode: manual / auto-clear / archive / view-once
  │  (retention rules)  │  timer fires → lifecycleState: cleared / expired
  └─────────┬───────────┘
            │
            ▼
  ┌─────────────────────┐
  │  Audit Record       │  ledgerEventIds, integrityHash, lifecycleState snapshot
  │  (ledger.ts)        │  readable in MessageJourneyPanel
  └─────────────────────┘
```

---

## Consent Actions by Communication Kind

| Kind | ConsentAction(s) | Minimum trust |
|------|-----------------|---------------|
| `text` | `send-message` | `known` |
| `voice` | `upload-file` + `send-message` | `known` |
| `photo` | `upload-file` + `send-message` | `known` |
| `video` | `upload-file` + `send-message` | `known` |
| `file` | `upload-file` + `send-message` | `known` |
| `location` | `share-location` + `send-message` | `trusted` |
| `reaction` | `send-message` | `known` |
| `call` | `start-call` (placeholder) | `trusted` |
| `system` | internal — no user gate | — |
| `proposal` | `send-message` | `known` |
| `ritual` | `send-message` | `known` |

---

## Protection States

| State | Meaning | When |
|-------|---------|------|
| `local-prototype` | Unencrypted; local-only dev/demo mode | `storageMode: local_only` without crypto |
| `sealed` | Client-side encrypted; key never leaves device | AES-GCM applied via `crypto.ts` |
| `production-e2ee` | Full E2EE; relay cannot read content | Future — requires key exchange protocol |
| `blocked` | Protection check failed; must not relay | Crypto error or policy violation |

---

## Delivery States

| State | Meaning |
|-------|---------|
| `local` | Stored locally; no relay attempted |
| `queued` | Queued for relay; waiting for connection |
| `ready` | Ready to relay on next connection |
| `relayed` | Relay server accepted the sealed envelope |
| `delivered` | Recipient device acknowledged receipt |
| `failed` | Delivery failed; may retry |

---

## Shield Category by Kind

`getShieldCategoryForEnvelopeKind()` maps communication kind to shield routing category. No content is scanned — only the kind is classified.

| Kind(s) | Shield category | Policy path |
|---------|----------------|-------------|
| `text`, `reaction`, `proposal`, `ritual` | `text` | Link/text screening |
| `voice`, `photo`, `video` | `media` | Media size, format, trust gate |
| `file` | `file` | Extension, size gate |
| `location` | `location` | Proximity disclosure rules |
| `call` | `live` | Real-time session gate |
| `system` | `system` | No user content; no screening |

---

## Private Messages Are Not Planetary Statistics

The EarthOS world platform will eventually allow users to contribute signals — observations, intentions, local events — to a public planetary layer. The communication envelope contains a hard boundary between these two realms:

**The envelope is private by default.** Nothing in `QLPACommunicationEnvelope` is surfaced to any public layer without an explicit, affirmative user action. There is no passive aggregation of private messages into public statistics, trends, or behavioral models.

When a user *chooses* to bridge a communication into the public layer (e.g. posting a proposal to a public council, sharing a location to a community map), that action creates a new public record — it does not retroactively change the privacy posture of the original private envelope.

---

## Envelope Body Fields

All content fields are optional references (URIs, blob IDs, hash prefixes). The body never holds raw bytes or unencrypted content.

| Field | Type | Used by |
|-------|------|---------|
| `mimeType` | `string` | All kinds |
| `textPreview` | `string?` | `text`, `proposal`, `ritual` — first 80 chars |
| `localUri` | `string?` | `voice`, `photo`, `video`, `file` |
| `encryptedBlobId` | `string?` | Relay-bound media |
| `sizeBytes` | `number?` | `file`, `photo`, `video`, `voice` |
| `durationMs` | `number?` | `voice`, `video`, `call` |
| `width` / `height` | `number?` | `photo`, `video` |
| `filename` | `string?` | `file` |
| `waveformPreview` | `number[]?` | `voice` — normalized 0–1 samples |
| `thumbnailUri` | `string?` | `photo`, `video` |

---

## Future Roadmap

| Phase | Communication kind | Status |
|-------|--------------------|--------|
| 1 | `text` | Scaffold live — envelope model in place |
| 2 | `voice` note | Foundation ready — upload gate + waveform display needed |
| 3 | `photo` / `video` | Foundation ready — upload gate + thumbnail pipeline needed |
| 4 | `file` | Scaffold active — envelope wiring needed |
| 5 | `location` | Foundation ready — `share-location` gate in place |
| 6 | `call` | Placeholder — `start-call` action reserved |
| 7 | EarthOS.world public signal bridge | `proposal` / `ritual` kinds; explicit opt-in only |
| 8 | EarthCoin / governance bridge | `proposal` kind; council space type; future pass |

Each phase adds a new kind to the consent gate map and the shield category table, but does not require architectural changes — the envelope model absorbs new kinds without modification.

---

## Module Location

| File | Purpose |
|------|---------|
| `lib/qlpa/communicationEnvelope.ts` | Envelope types, body fields, audit record, 3 adapter functions |
| `lib/qlpa/consentEngine.ts` | `CommunicationKind → ConsentAction` mapping; `start-call` action |
| `lib/qlpa/shieldPolicy.ts` | `getShieldCategoryForEnvelopeKind()`, `EnvelopeShieldCategory` |
| `lib/qlpa/messageLifecycle.ts` | `MessageLifecycleState` — used as `EnvelopeAudit.lifecycleState` |
| `scripts/check-envelope.mjs` | 107-assertion smoke check wired into `qlpa:check` |

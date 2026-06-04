# QLPA Communication Capability Matrix

**Pass: 135 — Communication Capability Matrix Foundation**
**Status: CANONICAL — No capability may be added to the UI without an entry here**

---

## Overview

The Communication Capability Matrix is the authoritative policy record for every kind of communication EarthOS supports. Before any capability is surfaced to users, its privacy, consent, trust, retention, and export rules must be defined here.

This document describes each capability kind, its safety constraints, and the rules governing when it may cross the EarthOS Bridge, the EarthCoin boundary, or enter governance records.

---

## Capability Kinds (15)

| Kind | Label Key | Min Trust | Consent | Recording | Media Perm | Contexts |
|------|-----------|-----------|---------|-----------|------------|---------|
| `text-message` | capability.textMessage | unknown | yes | no | no | D, G, C |
| `voice-note` | capability.voiceNote | known | yes | yes | yes (mic) | D, G |
| `audio-call` | capability.audioCall | trusted | yes | yes | yes (mic) | D |
| `video-call` | capability.videoCall | trusted | yes | yes | yes (cam+mic) | D |
| `photo-message` | capability.photoMessage | known | yes | no | yes (camera) | D, G |
| `video-message` | capability.videoMessage | known | yes | yes | yes (camera) | D, G |
| `file-transfer` | capability.fileTransfer | known | yes | no | no | D, G |
| `location-message` | capability.locationMessage | trusted | yes | no | yes (location) | D, G |
| `contact-card` | capability.contactCard | known | yes | no | no | D, G |
| `event-invite` | capability.eventInvite | unknown | yes | no | no | D, G, C |
| `governance-signal` | capability.governanceSignal | trusted | yes | no | no | C |
| `earthos-public-signal` | capability.earthosPublicSignal | trusted | yes | no | no | C |
| `earthcoin-signal` | capability.earthcoinSignal | trusted | yes | no | no | C |
| `emergency-report` | capability.emergencyReport | unknown | yes | no | no | D, G, C |
| `system-notice` | capability.systemNotice | unknown | **no** | no | no | D, G, C |

**Contexts:** D = Direct, G = Group, C = Community

---

## Trust Level Rules

1. **`unknown`** — only text-message, event-invite, emergency-report, and system-notice are available. No media, no calls, no files, no location.
2. **`known`** — adds voice-note, photo-message, video-message, file-transfer, contact-card.
3. **`trusted`** — adds audio-call, video-call, location-message, governance-signal, earthos-public-signal, earthcoin-signal.

---

## Consent Rules

- All capabilities require sender consent except `system-notice` (system-generated).
- Capabilities with `requiresRecordingConsent: true` require in-app consent from **all parties** before recording may begin: voice-note, audio-call, video-call, video-message.
- Capabilities with `requiresMediaPermission: true` require an OS-level permission grant before use.

---

## Call and Recording Rules

| Capability | Retention | Export |
|------------|-----------|--------|
| audio-call | ephemeral | not-exportable |
| video-call | ephemeral | not-exportable |
| voice-note | standard | local-only |
| video-message | standard | local-only |

Calls are ephemeral by default and may never be exported. No recording is stored unless the user explicitly saves with all-party consent.

---

## Location Rules

- `location-message` requires `trusted` relationship minimum.
- Retention class is `ephemeral` — location clears automatically after the session.
- Export class is `not-exportable` — location data never leaves the device through any automated channel.

---

## EarthOS Bridge Rules

A capability may only cross the EarthOS Bridge when:
- Its `exportClass` is `bridge-gated`, **or**
- `canBecomePublicSignal` is `true`

Bridge-crossing requires explicit in-app Bridge consent from the user. The following capabilities are bridge-eligible:

| Capability | Reason |
|------------|--------|
| governance-signal | Inherently public; governance record |
| earthos-public-signal | Public signal by design |
| earthcoin-signal | EarthCoin ledger record |

All other capabilities (`text-message`, `voice-note`, `audio-call`, `video-call`, `photo-message`, `video-message`, `file-transfer`, `location-message`, `contact-card`, `event-invite`, `emergency-report`, `system-notice`) do **not** cross the Bridge by default.

---

## EarthCoin Boundary Rules

Only `earthcoin-signal` may produce an EarthCoin record (`canBecomeEarthCoinRecord: true`).

Private content — text, voice, photo, video, file, location, calls — **must never** become EarthCoin records. This is enforced by `canCapabilityCrossEarthCoinBoundary()` returning `false` for all private capability kinds.

---

## Governance Record Rules

Only `governance-signal` may produce a governance record (`canBecomeGovernanceRecord: true`).

Private conversations must never enter governance records. `canCapabilityEnterGovernance()` returns `false` for all private capability kinds.

---

## Shield Integration

Every capability maps to a `CommunicationKindForShield` via `getCapabilityShieldCategory()`:

| Capability Kind(s) | Shield Category |
|-------------------|-----------------|
| text-message, contact-card, event-invite, governance-signal, earthos-public-signal, earthcoin-signal, emergency-report | text |
| voice-note | voice |
| audio-call, video-call | call |
| photo-message | photo |
| video-message | video |
| file-transfer | file |
| location-message | location |
| system-notice | system |

`emergency-report` has `requiresShieldCheck: false` — safety reports bypass Shield escalation so they always reach safety services.

---

## Retention and Export Classes

| Class | Meaning |
|-------|---------|
| `ephemeral` | Auto-clears after session (calls, location) |
| `standard` | User-controlled retention (text, voice-note, photos) |
| `durable` | Explicit keep; user must actively clear (files, contact-cards, emergency-reports) |
| `ledger-only` | Content clears; ledger event persists (governance, public, EarthCoin signals) |

| Export Class | Meaning |
|-------------|---------|
| `local-only` | Never leaves device without explicit user action |
| `relay-optional` | Can traverse relay with consent (files, event-invites, emergency-reports) |
| `bridge-gated` | Requires explicit EarthOS Bridge consent (governance, public, EarthCoin signals) |
| `not-exportable` | Must never be exported (calls, location) |

---

## Prototype-Only Capabilities

The following capabilities are defined in the matrix but not yet active in any release capability key. They will return `inactive` from `getCapabilityReleaseStatus()` until wired to a real QLPA_CAPABILITIES entry:

- audio-call (`audioCalls`)
- video-call (`videoCalls`)
- voice-note (`voiceNotes`) — release key `voiceMemos` exists; `voiceNotes` maps to it
- photo-message (`photoMessages`)
- video-message (`videoMessages`)
- location-message (`locationSharing`)
- contact-card (`contactCards`)
- event-invite (`eventInvites`)
- governance-signal (`governanceSignals`)
- earthos-public-signal (`publicSignals`)
- earthcoin-signal (`earthCoin`)
- emergency-report (`emergencyReports`)
- system-notice (`systemNotices`)

---

## Helper Functions

```ts
getCapabilityPolicy(kind): CapabilityPolicy
canCapabilityRunInTrust(kind, trustLevel): boolean
requiresExplicitConsent(kind): boolean
requiresRecordingNotice(kind): boolean
canCapabilityCrossEarthOSBridge(kind): boolean
canCapabilityCrossEarthCoinBoundary(kind): boolean
canCapabilityEnterGovernance(kind): boolean
getCapabilityShieldCategory(kind): EnvelopeShieldCategory
getCapabilityReleaseStatus(kind): 'active' | 'inactive' | 'unknown'
```

All functions are pure. No React or browser imports.

---

## Pass History

- **Pass 135** (2026-05-24): Canonical capability matrix created. 15 kinds, 19-field policy each, 9 pure helpers. Safety rules encoded. i18n keys in 7 locales. Check script registered in qlpa:check pipeline.

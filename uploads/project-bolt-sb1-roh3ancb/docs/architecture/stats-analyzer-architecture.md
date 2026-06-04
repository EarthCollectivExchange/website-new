# EarthOS Stats Analyzer Architecture

## Core Principle: Privacy by Design

**Stats must never contain:**
- Message body or content
- File names or file content
- Voice recordings
- Contact names, email addresses, phone numbers
- Private cryptographic keys
- EarthID identifiers
- Full file sizes (use size buckets: tiny/small/medium/large)
- Precise personal identifiers of any kind

---

## Two Modes

### Light Stats Mode (active in v0.1)

**What it collects:**
- Aggregate event counts (messages sent, conversations created, etc.)
- Mode and locale preference changes
- File size buckets (tiny/small/medium/large)
- Duration buckets (instant/short/medium/long)
- Success/failure booleans

**Storage:** localStorage — local device only

**Processing:** In-memory aggregate update on each event. No heavy computation.

**Display:** Small summary card in Developer view only. No charts.

**Backend:** None. No data leaves the device.

**Bundle impact:** Minimal. No chart libraries. No IndexedDB.

### Complete Stats Mode (scaffold — not active)

**Future goals:**
- Local IndexedDB persistent event log
- Optional Web Worker for background aggregation
- Daily/weekly/monthly summaries
- Richer breakdown by conversation type, mode, locale
- Export as JSON (user-initiated only)
- Still local-first — no backend analytics by default

**Privacy rules remain the same in Complete Mode.** The only difference is the storage backend and analysis depth.

---

## Privacy Guard

`lib/stats/statsPrivacy.ts` contains `validateStatsEvent()` — every event passes through this before being recorded.

Prohibited field patterns (checked at event recording time):
- body, content, plaintext
- privateKey, secretKey, password
- phone, email, contactName, fileName, displayName
- earthId, messageBody, voiceContent, fileContent

Run `npm run check:stats-privacy` to verify no prohibited fields appear in stats type definitions.

---

## Event Types

All event types are behavioral/operational — never content-based:

| Event | Data Class | What it records |
|-------|-----------|-----------------|
| app_opened | operational | Session start |
| conversation_created | operational | Type + storage mode only |
| message_sent | operational | Type + mode + success boolean |
| file_prepared | operational | Storage mode + size bucket |
| voice_recorded | operational | Duration bucket + success |
| auto_clear_applied | privacy_event | Conversation type only |
| language_changed | preference | Locale code |
| mode_changed | preference | Mode/depth names |
| export_created | privacy_event | Timestamp only |
| local_clear_applied | privacy_event | Timestamp only |
| qlpa_term_detected_dev_only | developer_diagnostic | Developer mode only |

---

## No User Surveillance

EarthOS Stats Analyzer is designed to help the **product team understand how the app is used** — not to monitor individual users.

- No session IDs
- No user fingerprinting
- No cross-device correlation
- No ad network integration
- No third-party analytics
- No server-side event collection

Stats can be turned off completely in Settings → Developer → Stats Mode → Off.

---

## Architecture Files

```
lib/stats/
  statsTypes.ts        Event types, data classes, size/duration buckets
  statsPrivacy.ts      Privacy guard — validateStatsEvent, STATS_PRIVACY_NOTICE
  statsStore.ts        localStorage persistence for light aggregates
  statsEvents.ts       Typed event constructors (factory functions)
  statsSelectors.ts    Derived views for display components
  lightAnalyzer.ts     Light mode API surface
  completeAnalyzer.ts  Scaffold — future IndexedDB mode
  statsExport.ts       User-initiated JSON export

components/stats/
  StatsModeBadge.tsx        Shows off/light/complete indicator
  StatsSummaryCard.tsx      Aggregate counter display (developer only)
  StatsPrivacyNotice.tsx    What we collect / never collect
  StatsPlaceholderPanel.tsx Top-level panel combining the above
```

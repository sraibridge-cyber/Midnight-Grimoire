# Midnight Grimoire — v2.1
## Sovereign D&D Turn-Based Story Engine

**Engine:** Midnight Grimoire v2.1 | **Build:** 87 | **Seal:** cc92_3e7f1a9d2b8c4e5f
**Architect:** Kyle S. Whitlock | **Organization:** Harmony Labs · SR-AIbridge CyberWorks

---

## What Is This?

Midnight Grimoire is a **turn-based story generator** — designed like a D&D session, not a chatbot. You define **Plot Beats** (encounter beats) and the system weaves a story through them with consistent characters, coherent world logic, and proper narrative structure.

It's fully **sovereign** — no cloud AI calls go to third parties. The story generation flows through a local API proxy that routes to the user's own AI configuration.

---

## Architecture (Modular v2.1)

```
frontend/
  index.html          ← Single-page app entry
  css/styles.css      ← All styling
  js/
    app.js            ← Tab navigation, state display, axiom ticker
    generator.js      ← HSM template builder, prompt engineering
    storage.js        ← localStorage chapter archive
    export.js         ← MD/HTML/TXT/JSON export
    voices.js         ← Browser TTS (SpeechSynthesis, no downloads)
    loader.js         ← Modular loader (optional)
    core/             ← Extracted engine functions
    tools/            ← Pronoun hunter, spellcheck, continuity
    state/            ← Thread management, character tracker
    export/           ← Export formatters

harmony_core/
  engine.js           ← FRC μ scoring (standalone, works in browser)
  resonance.py        ← Formal Resonance Calculus core
  weaver.py           ← HSM template engine
  v2/                 ← v2-specific augmentations

docs/
  CONSTITUTION.md     ← Story axioms and rules
  MODULE_MAP.md       ← What each file does

tests/
  mg_full_test.py     ← Playwright end-to-end test
  mg_quality_audit.py ← Story quality checker
```

---

## Quick Start

1. Open `frontend/index.html` in any browser
2. Enter a story premise in the **Premise** field
3. Name your protagonist
4. Add **Plot Beats** — one per line (like D&D encounter beats)
5. Click **✦ Conjure Chapter ✦**
6. Read, export, or **Seal & Continue** to the next turn

---

## Key Features

- **D&D Turn Flow:** Plot Points → Conjure → Read → Seal & Continue → Next Turn
- **μ Resonance Scoring:** Formal measure of story-premise alignment (0.70–0.95)
- **Thread Continuity:** Auto-extracts story questions, carries them across chapters like initiative order
- **World Grimoire:** Tracks locations, lore, and timeline per-chapter
- **Pronoun System:** 50+ pronouns tracked for consistent character reference
- **Seal & Hash:** SHA-256 proof-of-work seal per chapter
- **Export:** MD / HTML / TXT / JSON with chapter number in filename
- **Browser TTS:** Fully sovereign voice readout, no downloads required
- **7 Tabs:** Create · Characters · Threads · World · Axioms · Settings · Voice

---

## API Proxy

Story generation routes through `/api/mg-generate` (Hono server route on zo.space). The server holds the user's AI token and proxies requests — the browser never sees the API key.

---

## Seal History

- v2.0: Initial sovereign build (single HTML file)
- v2.1: Modular rebuild — 7 tabs, thread system, μ scoring, TTS
- v2.2: Unified 398KB single-file release (GitHub sealed commit)

---

## Organization

**Harmony Labs** — SR-AIbridge CyberWorks
- GitHub: github.com/sraibridge-cyber
- Domain: harmony-labs.dev
- Sovereignty: serverless, cloudless, vendorless
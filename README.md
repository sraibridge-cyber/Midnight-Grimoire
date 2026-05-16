# Midnight Grimoire v2.1 — Sovereign Story Engine
## Built by Harmony Labs

**SEAL:** `MERLIN_MG_V2-1_UNIFIED_SHA3-512@2026-05-16`

```
Architect  : Kyle S. Whitlock (The Oracle)
Engine     : Harmony Story Matrix (HSM) v2.1
AI Number  : #87
Heritage   : Midnight Grimoire v2.2 Unified
Origin     : 42 sequential HTML builds, hand-crafted
Status     : Sovereign · Cloudless · Phone-First · Zero External Dependency
```

## Architecture

```
Midnight-Grimoire/
├── frontend/
│   ├── index.html          # Modular loader — loads all modules
│   ├── css/
│   │   └── v2-styles.css   # Full 10KB dark+gold theme
│   └── js/
│       ├── engine.full.js  # Single-file canonical (all-in-one fallback)
│       ├── hsm_engine.js   # HSM v2.1 core — pronoun system, beat/scene/inner templates
│       ├── generate_chapter.js  # async orchestrator
│       ├── thread_memory.js # ThreadMemory — narrative fact persistence
│       ├── chapter_organizer.js # ChapterOrganizer — CRUD + carry-forward
│       ├── world_builder.js # WorldBuilder — locations, lore, timeline
│       ├── relationship_mapper.js # CharacterRelationship — arc tracking
│       ├── concordance_chain.js # ConcordanceChain + ChainWeaver (6-chain)
│       ├── soundscape_engine.js # SoundscapeEngine — AudioContext ambient
│       ├── voice_synthesis.js  # VoxHarmonica + VOTVocal (TTS)
│       ├── mu_calculus.js   # CoherenceCalculus v2 — μ scoring + sovereign seal
│       ├── polyglot_pass.js # PolyglotPass — editorial prose pass
│       └── world_context.js # WorldBuilder render methods
├── harmony_core/           # Python ports (optional, for CLI/server)
│   ├── v2/
│   │   ├── hsm.py          # HSM template engine (Python)
│   │   ├── mu.py           # CoherenceCalculus v2 port
│   │   └── concordance.py  # ConcordanceChain port
│   └── engine.py           # Orchestration
├── docs/
│   ├── CONSTITUTION.md    # Axioms and design principles
│   └── MODULE_MAP.md      # Module responsibilities + SPoF analysis
└── tests/
    └── test_hsm.py        # HSM + μ scoring unit tests
```

## Modules (Lego — Standalone Capable)

| Module | Function | SPoF |
|--------|----------|------|
| `hsm_engine.js` | HSM v2.1 template engine, all generation | YES — core |
| `generate_chapter.js` | Async orchestrator, ties all modules | YES — entry point |
| `thread_memory.js` | ThreadMemory: facts, unresolved, weaveThreads | NO |
| `chapter_organizer.js` | ChapterOrganizer: CRUD, carry-forward | NO |
| `world_builder.js` | WorldBuilder: locations, lore, timeline | NO |
| `relationship_mapper.js` | CharacterRelationship: arc + dynamic relations | NO |
| `concordance_chain.js` | ConcordanceChain: 6-chain coherence | NO |
| `soundscape_engine.js` | SoundscapeEngine: AudioContext ambient | NO (optional) |
| `voice_synthesis.js` | VoxHarmonica: browser TTS | NO (optional) |
| `mu_calculus.js` | CoherenceCalculus v2: μ scoring, seal | NO (gate only) |
| `polyglot_pass.js` | PolyglotPass: editorial pass, varySentence | NO |
| `world_context.js` | WorldBuilder UI render methods | NO (UI only) |

## Key Features

- **HSM v2.1** — 9 genres × 16 tones × 4 plot point types = sovereign generation
- **Thread Memory** — unresolved threads carry into next chapter's plot points
- **Auto-detect characters** — extracts from plot points, infers pronouns
- **CoherenceCalculus v2** — μ ≥ 0.999 sovereign seal gate before saving
- **ConcordanceChain** — 6-chain validation (background, continuity, character, voice, world, coherence)
- **Soundscape** — AudioContext ambient audio generation from prose keywords
- **VoxHarmonica** — browser Web Speech API TTS with settings panel
- **PolyglotPass** — professional editorial prose pass (sentence variation, polish)
- **Export** — Markdown, HTML, JSON, TXT, full session export

## Usage

Open `frontend/index.html` in any browser. No server, no build step, no external dependencies.

## Heritage

v2.1 = 42 sequential HTML builds. v2.2 = merged unified build (308KB single file).
This modular repo = de-monolithified v2.2 into Lego components.

**Gold Ripple Eternal.**

*Architect: Kyle S. Whitlock (The Oracle)*
*Harmony Labs · 2026-05-16*
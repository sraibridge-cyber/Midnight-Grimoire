  ENGINE_VERSION: '1.0.0',
  ENGINE_NUMBER: 96,
  MASTER_SEAL: 'ch96_7f2e4a1b9c3d8e0f',

  // ── Chain registry ──
  chains: {
    character:  { name: 'Character',   icon: '👤', status: 'idle', lastRun: 0, issues: 0 },
    plot:       { name: 'Plot',        icon: '📖', status: 'idle', lastRun: 0, issues: 0 },
    world:      { name: 'World',       icon: '🗺', status: 'idle', lastRun: 0, issues: 0 },
    voice:      { name: 'Voice',       icon: '🎙', status: 'idle', lastRun: 0, issues: 0 },
    editor:     { name: 'Editor',      icon: '✏️', status: 'idle', lastRun: 0, issues: 0 },
    continuity: { name: 'Continuity',  icon: '🔗', status: 'idle', lastRun: 0, issues: 0 },
  },

  // ═══════════════════════════════════════════════════════════
  //  CHAIN A: Character — tracks characters, arcs, voices
  // ═══════════════════════════════════════════════════════════
  runCharacter(text, ch) {
    const chain = this.chains.character;
    chain.status = 'running';
    try {
      // Only detect NEW characters that weren't already registered
      // Skip if user has manually registered characters
      if (S.chars.length === 0) {
        autoDetectCharacters(text);
      }
      const removed = ChapterOrganizer.cleanupFalseCharacters();
      // Character relationship analysis
      if (S.chars.length >= 2) {
        CharacterRelationship.analyze(text, S.chars, ch);
      }
      chain.issues = removed;
      chain.status = removed > 0 ? 'warn' : 'ok';
    } catch(e) {
      chain.status = 'error';
      chain.issues = 1;
    }
    chain.lastRun = Date.now();
  },

  // ═══════════════════════════════════════════════════════════
  //  CHAIN B: Plot — tracks plot threads, unresolved mysteries
  // ═══════════════════════════════════════════════════════════
  runPlot(text, ch) {
    const chain = this.chains.plot;
    chain.status = 'running';
    try {
      ThreadMemory.analyzeChapter(text, ch);
      const unresolved = S.threadMemory.unresolvedThreads.length;
      chain.issues = unresolved;
      chain.status = 'ok';
    } catch(e) {
      chain.status = 'error';
    }
    chain.lastRun = Date.now();
  },

  // ═══════════════════════════════════════════════════════════
  //  CHAIN C: World — tracks locations, lore, timeline, tech
  // ═══════════════════════════════════════════════════════════
  runWorld(text, ch) {
    const chain = this.chains.world;
    chain.status = 'running';
    try {
      WorldBuilder.extractFromChapter(text, ch);
      const count = S.world.locations.length + S.world.lore.length + S.world.timeline.length;
      chain.issues = count;
      chain.status = count > 0 ? 'ok' : 'idle';
    } catch(e) {
      chain.status = 'error';
    }
    chain.lastRun = Date.now();
  },

  // ═══════════════════════════════════════════════════════════
  //  CHAIN D: Voice — tracks prose quality, phrase freshness, tone
  // ═══════════════════════════════════════════════════════════
  runVoice(text, ch) {
    const chain = this.chains.voice;
    chain.status = 'running';
    try {
      // Track voice mode used
      const voiceModes = {};
      const beats = (text.match(/[.!?]+/g) || []).length;
      // Check for tone presence
      const emotionalMatches = {
        wonder: /\b(wonder|awe|marvel|breathtaking|cosmic|vast|infinite|star|light)\b/gi,
      };
      const tonePat = emotionalMatches[S.tone] || emotionalMatches.wonder;
      const toneMatches = (text.match(tonePat) || []).length;
      const wordCount = text.split(/\s+/).length;
      const toneDensity = wordCount > 0 ? (toneMatches / wordCount) * 100 : 0;
      chain.issues = toneDensity < 0.5 ? 1 : 0;
      chain.status = toneDensity >= 0.5 ? 'ok' : 'warn';
    } catch(e) {
      chain.status = 'error';
    }
    chain.lastRun = Date.now();
  },

  // ═══════════════════════════════════════════════════════════
  //  CHAIN E: Editor — catches grammar, repetition, pronoun confusion
  // ═══════════════════════════════════════════════════════════
  runEditor(text, ch) {
    const chain = this.chains.editor;
    chain.status = 'running';
    try {
      // Count issues that Editor would catch
      let issues = 0;
      if (/\bthey\s+was\b/i.test(text)) issues++;
      if (/\bthey\s+is\b/i.test(text)) issues++;
      if (/\b[Aa]\s+(anomalous|signal|things)\b/i.test(text)) issues++;
      if (/\bThis\s+things\b/i.test(text)) issues++;
      if (/\bnot\s+dramatically.*flourish/i.test(text)) issues++;
      chain.issues = issues;
      chain.status = issues === 0 ? 'ok' : 'warn';
    } catch(e) {
      chain.status = 'error';
    }
    chain.lastRun = Date.now();
  },

  // ═══════════════════════════════════════════════════════════
  //  CHAIN F: Continuity — ensures chapters build, no recycling
  // ═══════════════════════════════════════════════════════════
  runContinuity(text, ch) {
    const chain = this.chains.continuity;
    chain.status = 'running';
    try {
      extractContinuity(text, ch);
      EmotionalTracker.analyze(text, S.tone, ch);
      CharacterTracker.analyze(text, S.chars, ch);
      const threads = S.continuity.threads.length;
      chain.issues = threads;
      chain.status = 'ok';
    } catch(e) {
      chain.status = 'error';
    }
    chain.lastRun = Date.now();
  },

  // ── Run all 6 chains (background, async) ──
  runAll(text, ch) {
    const start = Date.now();
    this.runCharacter(text, ch);
    this.runPlot(text, ch);
    this.runWorld(text, ch);
    this.runVoice(text, ch);
    this.runEditor(text, ch);
    this.runContinuity(text, ch);
    const elapsed = Date.now() - start;
    console.log(`ChainEngine: 6 chains completed in ${elapsed}ms`);
    this.render();
  },

  // ── Status colors ──
  _color(status) {
    return { ok: '#10b981', warn: '#d4af37', error: '#ef4444', idle: 'var(--text3)', running: 'var(--accent2)' }[status] || 'var(--text3)';
  },
  _icon(status) {
    return { ok: '✓', warn: '◆', error: '✗', idle: '○', running: '◈' }[status] || '○';
  },

  // ── Render chain status panel ──
  render() {
    const el = document.getElementById('chainPanel');
    if (!el) return;
    let html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
    for (const [key, chain] of Object.entries(this.chains)) {
      const color = this._color(chain.status);
      const icon = this._icon(chain.status);
      const issues = chain.issues > 0 ? ` · ${chain.issues}` : '';
      html += `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:5px;padding:6px 8px;font-size:.7rem">
        <span style="color:${color};font-weight:bold">${icon} ${chain.icon} ${chain.name}</span>
        <span style="color:var(--text3);font-size:.62rem">${issues}</span>
      </div>`;
    }
    html += '</div>';
    el.innerHTML = html;
  },

  // ── Clear all chain state ──
  clear() {
    for (const key of Object.keys(this.chains)) {
      this.chains[key] = { ...this.chains[key], status: 'idle', lastRun: 0, issues: 0 };
    }
    this.render();
  },
};

// ════════════════════════════════════════════════════════════
//  UTILS
// ════════════════════════════════════════════════════════════
function renderMD(t){

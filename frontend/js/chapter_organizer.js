const ChapterOrganizer = {
  ENGINE_NAME: 'Chapter Organizer',
  ENGINE_VERSION: '1.0.0',
  ENGINE_NUMBER: 95,
  MASTER_SEAL: 'co95_4e8a1c2b7f3d9e0a',

  // Words that are NEVER character names — narrative, common, celestial
  NON_CHARACTER_WORDS: new Set([
    // Narrative words
    'Chapter','Come','Some','Not','But','For','With','Without','Within','About',
    'Above','After','Again','Against','All','Almost','Already','Also','Although',
    'Always','Among','Another','Any','Around','Back','Because','Before','Behind',
    'Being','Below','Between','Beyond','Both','Cannot','Could','Down','During',
    'Each','Either','Enough','Every','Everything','Everyone','Everywhere','Except',
    'Few','Finally','Forward','From','Further','Had','Has','Having','Here','How',
    'However','Into','Its','Itself','Just','Last','Later','Least','Less','Like',
    'Made','Make','Many','Maybe','Might','Mine','More','Most','Much','Must','Near',
    'Need','Neither','Next','Nobody','None','Nothing','Now','Often','Once','Only',
    'Other','Others','Out','Outside','Over','Own','Perhaps','Rather','Really','Same',
    'Several','Should','Since','So','Somebody','Somehow','Someone','Something',
    'Sometimes','Somewhere','Still','Such','Than','That','Then','There','These',
    'Those','Though','Through','Throughout','Thus','Too','Toward','Under','Until',
    'Upon','Very','Was','Way','Well','Were','What','Whatever','When','Where',
    'Whether','Which','While','Who','Whoever','Whom','Whose','Why','Will','Would',
    'Yet','You','Your','Yourself','Remember',
    // Celestial / location (not people)
    'Proxima','Centauri','Orion','Andromeda','Nebula','Galaxy','Universe','Cosmos',
    'Asteroid','Planet','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Comet',
    // Tech / objects (not people)
    'Harmony','Resonance','Frequency','Transmission','Spectrograph','Transponder',
    'Reactor','Protocol','Signal','Array','Console','Navigation','Spectrograph',
    'Star','Void','Light','Dark','Space','Data',
  ]),

  // ── Validate: is this a real character name? ──
  isValidCharacter(name) {
    if (!name || name.length < 3) return false;
    // Must start with capital letter
    if (!/^[A-Z]/.test(name)) return false;
    // Check each word in multi-word names
    const words = name.split(/\s+/);
    for (const w of words) {
      if (this.NON_CHARACTER_WORDS.has(w)) return false;
    }
    return true;
  },

  // ── Clean false characters from registry ──
  cleanupFalseCharacters() {
    const before = S.chars.length;
    S.chars = S.chars.filter(c => {
      const valid = this.isValidCharacter(c.name);
      if (!valid) console.log(`ChapterOrganizer: removed false character "${c.name}"`);
      return valid;
    });
    const removed = before - S.chars.length;
    if (removed > 0) {
      renderChars();
      save();
    }
    return removed;
  },

  // ── Safe chapter delete with full state cleanup ──
  deleteChapter(idx) {
    if (idx < 0 || idx >= S.chapters.length) return false;
    const ch = S.chapters[idx];

    // Remove from chapters array
    S.chapters.splice(idx, 1);

    // Clean up associated emotional data
    if (S.emotional && S.emotional.chapters) {
      S.emotional.chapters = S.emotional.chapters.filter(e => e.chapter !== ch.num);
    }

    // Clean up character tracker data for this chapter
    if (S.characterTracker && S.characterTracker.chapters) {
      S.characterTracker.chapters = S.characterTracker.chapters.filter(c => c.chapter !== ch.num);
    }

    // Update continuity
    if (S.continuity) {
      S.continuity.lastScene = S.chapters.length > 0
        ? S.chapters[S.chapters.length - 1].text.slice(-200)
        : '';
    }

    // If no chapters left, clear output
    if (S.chapters.length === 0) {
      S.output = '';
      document.getElementById('output').innerHTML = '';
      document.getElementById('statsRow').style.display = 'none';
      document.getElementById('muWrap').style.display = 'none';
      document.getElementById('sealBox').style.display = 'none';
      document.getElementById('exportRow').style.display = 'none';
      document.getElementById('sealContinue').style.display = 'none';
      document.getElementById('histPanel').style.display = 'none';
    }

    renderHist();
    PathChain.render();
    save();
    return true;
  },

  // ── Get chapter by number ──
  getChapter(num) {
    return S.chapters.find(c => c.num === num);
  },

  // ── Get last chapter ──
  getLast() {
    return S.chapters.length > 0 ? S.chapters[S.chapters.length - 1] : null;
  },

  // ── Get last scene excerpt for continuity ──
  getLastScene(maxLen) {
    const last = this.getLast();
    if (!last || !last.text) return '';
    const text = last.text;
    // Find last sentence
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length === 0) return text.slice(-maxLen);
    const lastSent = sentences[sentences.length - 1].trim();
    return lastSent.length > maxLen ? lastSent.slice(0, maxLen) + '...' : lastSent;
  },

  // ── Carry forward: what transfers from chapter N to N+1 ──
  carryForward() {
    const last = this.getLast();
    if (!last) return { lastScene: '', unresolved: [], tone: S.tone };
    return {
      lastScene: this.getLastScene(200),
      unresolved: S.continuity ? S.continuity.unresolved || [] : [],
      tone: S.tone,
      lastChapterNum: last.num,
    };
  },

  clear() {
    // Nothing persistent to clear (state lives in S)
  },
};

// ════════════════════════════════════════════════════════════
//  VOICE ENGINE
//  Beat-by-beat prose adaptation — action=punchy, reflection=expansive.
//  The voice shifts because the story demands it, not because of a button.
// ════════════════════════════════════════════════════════════

const ThreadMemory = {
  // ── Extract key facts/revelations from a chapter ──
  extractFacts(text, chapterNum) {
    const facts = [];
    // Pattern: character + discovers/realizes/finds/learns + object
    const discoveryPattern = /([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\s+(?:discovered?|realized?|found|learned?|understood?)\s+(?:that\s+)?(.+?)(?:[.\n])/g;
    let m;
    while ((m = discoveryPattern.exec(text)) !== null) {
      const factText = m[0].trim();
      if (factText.length > 20 && factText.length < 200) {
        facts.push({ id: this._nextId('F'), text: factText, chapter: chapterNum, type: 'revelation' });
      }
    }
    // Pattern: something happened — event facts
    const eventPattern = /([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\s+(?:activated?|triggered?|initiated?|launched?|sent|opened?|closed?|destroyed?)\s+(?:the\s+)?([a-zA-Z\s]+)(?:[.\n])/g;
    while ((m = eventPattern.exec(text)) !== null) {
      const eventText = m[0].trim();
      if (eventText.length > 15 && eventText.length < 150) {
        facts.push({ id: this._nextId('F'), text: eventText, chapter: chapterNum, type: 'event' });
      }
    }
    return facts;
  },

  // ── Extract unresolved threads from a chapter ──
  extractThreads(text, chapterNum) {
    const threads = [];
    // Pattern: unresolved/unanswered/unexplained things
    const unresolvedPatterns = [
      /([A-Z][a-zA-Z]+(?:\s+[a-zA-Z]+){1,8})\s+(?:remained|stayed|lingered|hung|sat|rested)\s+(?:unresolved|unanswered|unexplained|unknown|mysterious|unclear)/gi,
      /(?:what|who|why|how|where|when)\s+([a-zA-Z\s]+?)\s+(?:was|were|had been|would be)\s+(?:never|still|not)\s+(?:answered?|resolved?|explained?|revealed?|known)/gi,
      /(?:question|mystery|problem)\s+(?:of|about)\s+([a-zA-Z\s]+?)\s+(?:remained|lingered|stayed)/gi,
      /(?:not|never)\s+(?:knowing|understanding|discovering|learning)\s+(?:the truth about|what happened to|why)\s+([a-zA-Z\s]+)/gi,
    ];
    for (const pat of unresolvedPatterns) {
      let match;
      while ((match = pat.exec(text)) !== null) {
        const threadText = match[0].trim();
        if (threadText.length > 20 && threadText.length < 200) {
          threads.push({
            id: this._nextId('T'),
            text: threadText,
            sourceChapter: chapterNum,
            status: 'unresolved',
            resolutionChapter: null
          });
        }
      }
    }
    // Also look for explicit unresolved markers
    const markerPattern = /(?:\[|\() unresolved: ([^\])]+)(?:\]|\))/gi;
    while ((m = markerPattern.exec(text)) !== null) {
      threads.push({
        id: this._nextId('T'),
        text: m[1].trim(),
        sourceChapter: chapterNum,
        status: 'unresolved',
        resolutionChapter: null
      });
    }
    return threads;
  },

  // ── Extract character emotional states ──
  extractEmotionalStates(text, chapterNum) {
    const states = {};
    const emotionPatterns = {
      awe: /felt\s+(?:a\s+)?(?:sense\s+of\s+)?awe/i,
      fear: /felt\s+(?:a\s+)?(?:sense\s+of\s+)?(?:fear|terror|dread)/i,
      wonder: /felt\s+(?:a\s+)?(?:sense\s+of\s+)?wonder/i,
      grief: /felt\s+(?:a\s+)?(?:sense\s+of\s+)?(?:grief|sorrow|loss)/i,
      hope: /felt\s+(?:a\s+)?(?:sense\s+of\s+)?hope/i,
      despair: /felt\s+(?:a\s+)?(?:sense\s+of\s+)?despair/i,
      determination: /felt\s+(?:a\s+)?(?:sense\s+of\s+)?(?:determination|resolve)/i,
      love: /felt\s+(?:a\s+)?(?:sense\s+of\s+)?(?:love|devotion)/i,
      confusion: /felt\s+(?:a\s+)?(?:sense\s+of\s+)?(?:confusion|uncertainty)/i,
    };
    for (const char of S.chars) {
      const firstName = char.name.split(' ')[0];
      // Find all sentences mentioning this character
      const charPattern = new RegExp('(?:^|[.!?]\\s+)(' + firstName + '[^.!?]{10,200})', 'gi');
      let match;
      while ((match = charPattern.exec(text)) !== null) {
        const sentence = match[1].toLowerCase();
        for (const [emotion, pat] of Object.entries(emotionPatterns)) {
          if (pat.test(sentence)) {
            if (!states[char.name]) states[char.name] = [];
            states[char.name].push({ emotion, intensity: 0.6, chapter: chapterNum });
          }
        }
      }
    }
    return states;
  },

  // ── Analyze a chapter and update all memory ──
  analyzeChapter(text, chapterNum) {
    const facts = this.extractFacts(text, chapterNum);
    const threads = this.extractThreads(text, chapterNum);
    const emotions = this.extractEmotionalStates(text, chapterNum);
    
    // Add facts
    for (const f of facts) S.threadMemory.facts.push(f);
    
    // Add new unresolved threads
    for (const t of threads) {
      // Check not duplicate
      const exists = S.threadMemory.unresolvedThreads.some(
        existing => existing.text.slice(0, 30) === t.text.slice(0, 30)
      );
      if (!exists) S.threadMemory.unresolvedThreads.push(t);
    }
    
    // Update emotional states
    for (const [charName, entries] of Object.entries(emotions)) {
      if (!S.threadMemory.emotionalStates[charName]) {
        S.threadMemory.emotionalStates[charName] = { current: entries[entries.length - 1], history: [] };
      }
      S.threadMemory.emotionalStates[charName].current = entries[entries.length - 1];
      S.threadMemory.emotionalStates[charName].history.push(...entries);
    }
    
    // Check if any threads are resolved in this chapter
    this.checkThreadResolutions(text, chapterNum);
    
    // Apply axiom-driven effects
    this.applyAxioms(text, chapterNum);
    
    return { factsAdded: facts.length, threadsAdded: threads.length };
  },

  // ── Check if unresolved threads got resolved ──
  checkThreadResolutions(text, chapterNum) {
    const resolvedPatterns = [
      /(?:finally|at last|in the end|ultimately)\s+(.{20,100}?\.(?:\s|$))/gi,
      /(?:resolved|settled|answered|explained|clarified|revealed|understood)/gi,
    ];
    for (const thread of S.threadMemory.unresolvedThreads) {
      if (thread.status !== 'unresolved') continue;
      // Check if this chapter's text addresses the thread's topic
      const threadKeyWords = thread.text.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      const matchCount = threadKeyWords.filter(w => text.toLowerCase().includes(w)).length;
      if (matchCount >= 2) {
        // Check for resolution language
        const hasResolutionLang = resolvedPatterns.some(pat => {
          pat.lastIndex = 0;
          return pat.test(text);
        });
        if (hasResolutionLang) {
          thread.status = 'resolved';
          thread.resolutionChapter = chapterNum;
        } else {
          thread.status = 'progressing';
        }
      }
    }
  },

  // ── Apply active axioms to generation context ──
  applyAxioms(text, chapterNum) {
    const active = S.activeAxioms || [];
    // Consistency: check facts against previous chapters
    if (active.includes('consistency')) {
      this.enforceConsistency(text, chapterNum);
    }
    // Growth: track character development
    if (active.includes('growth')) {
      this.trackGrowth(text, chapterNum);
    }
  },

  enforceConsistency(text, chapterNum) {
    // Simple check: flag if text contradicts previously established facts
    const contradictions = [];
    for (const fact of S.threadMemory.facts) {
      if (fact.chapter >= chapterNum) continue;
      // Check for negation of fact
      const negPattern = new RegExp('(not|never|no|nothing|false|wrong|incorrect|failed)\\s+.{0,50}' + 
        fact.text.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      if (negPattern.test(text)) {
        contradictions.push({ fact: fact.text, chapter: chapterNum });
      }
    }
    if (contradictions.length > 0) {
      console.warn('Consistency warnings:', contradictions);
    }
  },

  trackGrowth(text, chapterNum) {
    const growthPatterns = {
      courage: /stood\s+up|faced\s+.*fear|stepped\s+forward|did\s+not\s+retreat/i,
      wisdom: /understood|realized|knew\s+better|learned|recognized/i,
      resolve: /determined|decided|committed|chosen|accepted\s+the/i,
      sacrifice: /gave\s+up|sacrificed|offered|let\s+go/i,
      connection: /trusted|reached\s+out|accepted.*help|turned\s+to/i,
    };
    for (const char of S.chars) {
      const firstName = char.name.split(' ')[0];
      const charRegex = new RegExp(firstName + '[^.!?]{10,200}', 'gi');
      let match;
      while ((match = charRegex.exec(text)) !== null) {
        const sentence = match[0];
        for (const [trait, pat] of Object.entries(growthPatterns)) {
          if (pat.test(sentence)) {
            if (!S.characterArcs[char.name]) {
              S.characterArcs[char.name] = { stage: 'introduction', beats: [] };
            }
            S.characterArcs[char.name].beats.push({ trait, chapter: chapterNum, context: sentence.slice(0, 80) });
            // Advance stage if enough beats
            const beatCount = S.characterArcs[char.name].beats.length;
            if (beatCount >= 6) S.characterArcs[char.name].stage = 'transformation';
            else if (beatCount >= 4) S.characterArcs[char.name].stage = 'crisis';
            else if (beatCount >= 2) S.characterArcs[char.name].stage = 'growth';
          }
        }
      }
    }
  },

  // ── Get unresolved threads for plot weaving ──
  getUnresolvedForChapter(chapterNum) {
    const unresolved = S.threadMemory.unresolvedThreads.filter(
      t => t.status === 'unresolved' || (t.status === 'progressing' && t.sourceChapter < chapterNum)
    );
    // Sort by age (oldest first) so they get woven naturally
    return unresolved.sort((a, b) => a.sourceChapter - b.sourceChapter);
  },

  // ── Get character emotional context ──
  getCharacterContext(charName) {
    const state = S.threadMemory.emotionalStates[charName];
    if (!state || !state.current) return null;
    return state.current;
  },

  // ── Get all established facts for consistency checks ──
  getFacts() {
    return S.threadMemory.facts;
  },

  // ── Generate plot point suggestions from unresolved threads ──
  weaveThreads(chapterNum, chars) {
    const unresolved = this.getUnresolvedForChapter(chapterNum);
    const plotPoints = [];
    const threadCount = Math.min(2, unresolved.length); // weave up to 2 threads per chapter
    
    for (let i = 0; i < threadCount; i++) {
      const thread = unresolved[i];
      // Find a character to carry the thread
      const char = chars[0]; // primary protagonist
      if (thread.status === 'unresolved') {
        // Thread is still unresolved — character encounters it again
        plotPoints.push(
          `${char.name} encounters the unresolved ${thread.text.slice(0, 40)} again`,
          `${char.name} makes a discovery related to ${thread.text.slice(0, 40)}`
        );
      } else if (thread.status === 'progressing') {
        // Thread is progressing — move it forward
        plotPoints.push(
          `${char.name} advances understanding of ${thread.text.slice(0, 40)}`,
          `${char.name} faces a consequence of ${thread.text.slice(0, 40)}`
        );
      }
    }
    return plotPoints;
  },

  _nextId(prefix) { return prefix + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000); },

  // ── Clear all memory ──

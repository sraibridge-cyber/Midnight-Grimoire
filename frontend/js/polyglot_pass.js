  ENGINE_VERSION: '2.0.0',
  ENGINE_NUMBER: 93,
  MASTER_SEAL: 'ed93_9a4b2c7d1e3f8a0b',

  stats: { passes: 0, fixes: 0 },

  // ════════════════════════════════════════════════
  //  MAIN POLISH PIPELINE — 8 passes
  // ════════════════════════════════════════════════
  polish(text) {
    if (!text || typeof text !== 'string') return text;
    this.stats.passes++;
    let t = text;
    let fc = 0;

    const b1 = t; t = this.stripRawPlotPoints(t);   if (t !== b1) fc++;
    const b2 = t; t = this.trimOverExplicit(t);      if (t !== b2) fc++;
    const b3 = t; t = this.fixAgreement(t);          if (t !== b3) fc++;
    const b4 = t; t = this.fixDoubleWords(t);        if (t !== b4) fc++;
    const b5 = t; t = this.fixBrokenWords(t);        if (t !== b5) fc++;
    const b6 = t; t = this.fixSpacing(t);            if (t !== b6) fc++;
    const b7 = t; t = this.fixFragments(t);          if (t !== b7) fc++;
    const b8 = t; t = this.enforceVariety(t);        if (t !== b8) fc++;

    this.stats.fixes += fc;
    return t;
  },

  // ════════════════════════════════════════════════
  //  PASS 0: Strip raw plot-point leakage
  //  "Elara detects the anomalous harmonics." → removes bare plot statements
  // ════════════════════════════════════════════════
  stripRawPlotPoints(text) {
    // Remove standalone plot-point sentences that leaked through
    const plotLeaks = [
      // "Elara detects the anomalous harmonics" or "Kael-7 confirms the signal"
      /\b[A-Z][a-z0-9-]+\s+(?:detects?|confirms?|invokes?|activates?|initiates?)\s+(?:the|an?|that)\s+[^.\n—]{3,60}[.\n—]/gi,
      // "First contact protocol is invoked" — passive plot
      /\b(?:First contact|[A-Z][a-z-]+)\s+protocol\s+is\s+(?:invoked|activated|initiated)\b/gi,
      // "Kael-7 confirms the signal" at start of paragraph
      /^[A-Z][a-z0-9-]+\s+(?:confirms?|detects?|discovers?|finds?|activates?)\s+(?:the|a|an|that)\s+[^.\n—]{3,50}[.\n—]\s*/gim,
      // "They invoke the First contact protocol"
      /\b(They|[A-Z][a-z0-9-]+)\s+(?:invokes?|activates?|initiates?)\s+(?:the|a|an)\s+(?:First contact|[A-Z][a-z]+)\s+(?:protocol|sequence|procedure)\b/gi,
      // "First contact protocol showed They something" — garbled plot leak
      /\b(?:First contact|[A-Z][a-z]+)\s+protocol\s+(?:showed|revealed|gave|offered)\s+\w+\s+something\b/gi,
      // "showed They something" — pronoun-as-object leak
      /\bshowed\s+(They|He|She|It)\s+something\b/gi,
    ];
    for (const pat of plotLeaks) {
      text = text.replace(pat, '');
    }
    return text.replace(/\n{3,}/g, '\n\n').trim();
  },

  // ════════════════════════════════════════════════
  //  PASS 1: Trim over-explicit constructions
  // ════════════════════════════════════════════════
  trimOverExplicit(t) {
    return t
      // "there was a feeling of X" → tighter
      .replace(/\b[Tt]here was a feeling of\b/g, 'Something like')
      // "the particular kind of" → trim
      .replace(/\bthe particular kind of\b/gi, 'the kind of')
      // "the particular (quality|silence|weight) of" → trim
      .replace(/\bthe particular (quality|silence|weight|kind|temperature) of\b/gi, 'the $1 of')
      // "did not know if X was even possible" → softer
      .replace(/\bdid not know if ([a-z\s]+) was even possible\b/gi, 'was no longer sure $1 was possible')
      // "not overwhelming. But it was there" → tighter
      .replace(/\bnot overwhelming\. But it was there\b/gi, 'thin, but present')
      // Trailing "In time." after a longer sentence → redundant
      .replace(/, but would\. In time\./gi, ', but would.')
      // "It was obvious that" → show
      .replace(/\b[Ii]t was (obvious|clear|evident) that\b/g, (m, adj) => {
        const r = ['anyone could see', 'it showed in', 'you could tell by'];
        return r[Math.floor(Math.random() * r.length)];
      })
      // "she knew that she" → trim
      .replace(/\b([A-Z][a-z]+) knew that \1\b/g, '$1 knew —');
  },

  // ════════════════════════════════════════════════
  //  PASS 2: Fix subject-verb agreement
  // ════════════════════════════════════════════════
  fixAgreement(t) {
    return t
      .replace(/\bthey was\b/gi, 'they were')
      .replace(/\bThey was\b/g, 'They were')
      .replace(/\bthey is\b/gi, 'they are')
      .replace(/\bthey has\b/gi, 'they have')
      .replace(/\bthey does\b/gi, 'they do')
      .replace(/\bshe have\b/gi, 'she has')
      .replace(/\bhe have\b/gi, 'he has')
      .replace(/\bit are\b/gi, 'it is')
      .replace(/\bit were\b/gi, 'it was')
      .replace(/\bAre would\b/g, 'There would')
      .replace(/\bThatre would\b/gi, 'There would')
      .replace(/\bare would\b/gi, 'there would')
      .replace(/\bthatre would\b/gi, 'there would')
      .replace(/\bAre was\b/g, 'There was')
      .replace(/\bare was\b/gi, 'there was')
      .replace(/\bAre is\b/g, 'There is')
      .replace(/\bare is\b/gi, 'there is')
      // Fix articles: "A anomalous" → "An anomalous", "A Proxima" → "The Proxima"
      .replace(/\bA ([aeiou][a-z])/gi, (m, vowelWord) => 'An ' + vowelWord)
      .replace(/\bA (Proxima|anomalous|spectrograph|transponder|harmonic)/gi, (m, noun) => 'The ' + noun)
      // Fix "A things" → "The things" (wrong article)
      .replace(/\bA things\b/g, 'The things')
      .replace(/\ba things\b/g, 'the things')
      // Fix "That [noun]" at sentence start → "The [noun]"
      .replace(/\bThat (anomalous|signal|data|harmonic|transponder|spectrograph|protocol)\b/gi, (m, noun) => 'The ' + noun)
      .replace(/\bThis things\b/g, 'These things')
      .replace(/\bthis things\b/g, 'these things')
      .replace(/\bThis words\b/g, 'These words')
      .replace(/\bthis words\b/g, 'these words')
      // Fix "harmonics has" → "harmonics have" (plural noun)
      .replace(/\bharmonics has\b/gi, 'harmonics have')
      .replace(/\bHarmonics has\b/g, 'Harmonics have')
      // Fix "and She" / "but She" / "so She" → lowercase
      .replace(/\b(and|but|so|or|nor|yet)\s+She\b/g, (m, conj) => conj + ' she')
      .replace(/\b(and|but|so|or|nor|yet)\s+He\b/g, (m, conj) => conj + ' he')
      .replace(/\b(and|but|so|or|nor|yet)\s+They\b/g, (m, conj) => conj + ' they')
      // Fix lowercase names after conjunctions: "so elara" → "so Elara"
      .replace(/\b(and|but|so|or|nor|yet)\s+elara\b/g, (m, conj) => conj + ' Elara')
      .replace(/\b(and|but|so|or|nor|yet)\s+kael-7\b/g, (m, conj) => conj + ' Kael-7')
      // Fix continuity text corruption
      .replace(/\bBeyondre\b/g, 'There')
      .replace(/\bbeyondre\b/g, 'there')
      // Empty speaker: ", said." → add character name
      .replace(/"\s*,\s*said\./g, (m) => {
        const chars = (S && S.chars) || [];
        const name = chars.length > 0 ? chars[0].name.split(' ')[0] : 'she';
        return '"' + name + ' said.';
      })
      // Sentence fragment: ". Was" / ". Had" / ". Were" after period → add subject
      .replace(/\.\s+(Was|Had|Were)\s+([a-z])/g, (m, verb, rest) => {
        const chars = (S && S.chars) || [];
        const subj = chars.length > 0 ? chars[0].name.split(' ')[0] : 'She';
        return '. ' + subj + ' ' + verb.toLowerCase() + ' ' + rest;
      })
      // "for her part" / "for his part" / "for their part" filler → remove
      .replace(/\s*,?\s+for (her|his|their) part,?\s+/gi, ' ')
      // "No one around [Pronoun]" → replace with real name
      .replace(/No one around\s+(She|He|They|It|We|You)\b/gi, (m, pronoun) => {
        const chars = (S && S.chars) || [];
        if (chars.length > 0) return 'No one around ' + chars[0].name.split(' ')[0];
        return m;
      })
      // Fix "data has" → "data have" (plural noun)
      .replace(/\bdata has\b/gi, 'data have')
      .replace(/\bData has\b/g, 'Data have')
      // Remove "the figure" from prose — replace with character names
      .replace(/\bthe figure\b/gi, (m) => {
        const chars = (S && S.chars) || [];
        if (chars.length > 0) {
          HSM._charRotation = (HSM._charRotation + 1) % chars.length;
          return chars[HSM._charRotation].name;
        }
        return m;
      })
      .replace(/\bjust does not\b/gi, 'just does not')
      // Remove "Chapter" as false character from prose
      .replace(/\bChapter had been\b/g, 'She had been')
      .replace(/\bso Chapter stopped\b/g, 'so she stopped')
      .replace(/\bChapter felt\b/g, 'She felt')
      .replace(/\bChapter had the shape\b/g, 'She had the shape')
      .replace(/\b"Chapter said\b/gi, '"Elara said')
      .replace(/\bshowed She\b/g, 'showed her')
      .replace(/\bshowed He\b/g, 'showed him')
      .replace(/\bWithin the breath\b/g, 'The breath')
      .replace(/\bA work resumed\b/g, 'Her work resumed')
      .replace(/\bThe First contact\b/g, 'First contact')
      // Preserve capitalization on hyphenated names
      .replace(/\b([a-z]+-[a-z])\b/g, (m) => m.charAt(0).toUpperCase() + m.slice(1))
      // "would elara." → "would Elara." — ONLY capitalize known character names
      .replace(/would\s+([a-z][a-z]+)\./g, (m, name) => {
        const chars = (S && S.chars) || [];
        const isChar = chars.some(c => c.name.toLowerCase().split(' ')[0] === name.toLowerCase());
        return isChar ? 'would ' + name.charAt(0).toUpperCase() + name.slice(1) + '.' : m;
      });
  },

  // ════════════════════════════════════════════════
  //  PASS 3: Fix double words
  // ════════════════════════════════════════════════
  fixDoubleWords(t) {
    return t.replace(/\b(\w+)\s+\1\b/gi, '$1');
  },

  // ════════════════════════════════════════════════
  //  PASS 4: Fix broken word merges (from template interpolation)
  // ════════════════════════════════════════════════
  fixBrokenWords(t) {
    return t
      .replace(/\b([a-z])A ([a-z])/g, '$1. A $2')
      .replace(/\b([a-z])The\b/g, '$1. The')
      .replace(/\b([a-z])She\b/g, '$1. She')
      .replace(/\b([a-z])He\b/g, '$1. He')
      .replace(/\b([a-z])They\b/g, '$1. They')
      .replace(/\b([a-z])It\b/g, '$1. It')
      .replace(/\b([a-z])We\b/g, '$1. We')
      .replace(/\b([a-z])"([A-Z])/g, '$1. "$2')
      .replace(/\b"([A-Z])/g, '. "$1');
  },

  // ════════════════════════════════════════════════
  //  PASS 5: Fix spacing + capitalize sentence starts
  // ════════════════════════════════════════════════
  fixSpacing(t) {
    return t
      .replace(/  +/g, ' ')
      .replace(/^ +/gm, '')
      .replace(/ +$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      // Capitalize sentence starts: ". she" → ". She", "? he" → "? He"
      .replace(/([.!?]\s+)([a-z])/g, (m, punct, letter) => punct + letter.toUpperCase())
      // Capitalize paragraph starts
      .replace(/(^|\n\n)([a-z])/g, (m, para, letter) => para + letter.toUpperCase())
      // Fix "This [work/data/signal]" → "The [work/data/signal]" (wrong demonstrative)
      .replace(/\bThis (work|data|signal|protocol|harmonic) resumed?\b/gi, (m, noun) => 'The ' + noun + ' resumed')
      .replace(/\bThis (work|data|signal|protocol|harmonic) would\b/gi, (m, noun) => 'The ' + noun + ' would');
  },

  // ════════════════════════════════════════════════
  //  PASS 6: Fix fragments
  // ════════════════════════════════════════════════
  fixFragments(text) {
    const lines = text.split('\n');
    const out = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#') || line.startsWith('>') || line.startsWith('-')) {
        out.push(lines[i]);
        continue;
      }
      if (out.length > 0) {
        const prev = out[out.length - 1].trim();
        if (prev.length > 10 && !prev.match(/[.!?;:]$/)) {
          const prevWords = prev.split(/\s+/).length;
          const currWords = line.split(/\s+/).length;
          if (prevWords < 6 && currWords < 12) {
            out[out.length - 1] = out[out.length - 1].trimEnd() + ' ' + line;
            continue;
          }
        }
      }
      out.push(lines[i]);
    }
    return out.join('\n');
  },

  // ════════════════════════════════════════════════
  //  PASS 7: Enforce sentence variety
  // ════════════════════════════════════════════════
  enforceVariety(text) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const openers = {};
    for (const sent of sentences) {
      const first = sent.trim().split(/\s+/)[0];
      if (first) openers[first] = (openers[first] || 0) + 1;
    }
    for (const [opener, count] of Object.entries(openers)) {
      if (count <= 3 || opener.length < 3) continue;
      let replaced = 0;
      for (let i = 0; i < sentences.length; i++) {
        const sent = sentences[i].trim();
        if (sent.startsWith(opener) && replaced < Math.floor(count / 2)) {
          const variation = this._varyOpener(opener);
          if (variation && variation !== opener) {
            sentences[i] = sent.replace(new RegExp('^' + opener), variation);
            replaced++;
          }
        }
      }
    }
    return sentences.join(' ');
  },

  _varyOpener(word) {
    const v = {
      'The': ['A', 'That', 'This', 'Beyond'],
      'She': ['And she', 'Yet she', 'In that moment, she', 'Somehow, she', 'She did not know why, but she'],
      'He': ['And he', 'Yet he', 'In that moment, he', 'Somehow, he', 'He could not say how, but he'],
      'They': ['The two of them', 'Together, they', 'Both of them', 'Side by side, they', 'For the moment, they'],
      'It': ['The thing', 'That', 'This', 'The truth', 'The question'],
      'A': ['The', 'Some', 'One', 'That particular'],
      'But': ['Yet', 'Still', 'And yet', 'Even so', 'Nevertheless'],
      'And': ['Still', 'Yet', 'Meanwhile,', 'At the same time,', 'In the same moment,'],
    };
    const opts = v[word];
    if (!opts) return null;
    return opts[Math.floor(Math.random() * opts.length)];
  },

  clear() { this.stats = { passes: 0, fixes: 0 }; },
};

// ═══════════════════════════════════════════════════
//  WORLD-BUILDING ENGINE
// ═══════════════════════════════════════════════════
S.world = S.world || {locations:[], lore:[], timeline:[]};

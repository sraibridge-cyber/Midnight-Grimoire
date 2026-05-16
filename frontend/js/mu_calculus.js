  ENGINE_VERSION: '1.0.0',
  ENGINE_NUMBER: 92,
  MASTER_SEAL: 'cc92_3e7f1a9d2b8c4e5f',

  τ: 0.9995,    // Constitutional threshold — HARD GATE
  ε: 1e-12,     // Numerical stability floor

  // ── μ: Weighted Geometric Mean ──
  // μ = exp( Σᵢ wᵢ × ln(max(sᵢ, ε)) / Σᵢ wᵢ )
  computeMu(signals) {
    let wSum = 0, logSum = 0;
    for (const sig of signals) {
      const w = sig.w || 1;
      const s = Math.max(this.ε, Math.min(1.0, sig.s));
      wSum += w;
      logSum += w * Math.log(s);
    }
    if (wSum === 0) return 0;
    return Math.exp(logSum / wSum);
  },

  // ── CH: Binary Boolean Vector ──
  // CH_total = CH₁ × CH₂ × ... × CHₙ (algebraic AND)
  // 1 = all rules pass, 0 = any rule fails
  evaluateCH(checks) {
    const vector = {};
    let total = 1;
    for (const [name, passed] of Object.entries(checks)) {
      const val = passed ? 1 : 0;
      vector[name] = val;
      total *= val; // Algebraic AND
    }
    return { vector, total };
  },

  // ── Full coherence evaluation on chapter text ──
  evaluate(text, params) {
    const { chars, tone, genre, chapterNum, plotPoints } = params;
    const words = text.trim().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const paragraphs = text.split('\n').filter(p => p.trim().length > 20);

    // Signal 1: Pronoun consistency (character names vs pronouns)
    const nameCount = chars && chars.length ? chars.reduce((sum, c) => {
      const firstName = c.name.split(' ')[0];
      return sum + (text.split(firstName).length - 1);
    }, 0) : 0;
    const pronounCount = (text.match(/\b(she|her|he|him|his|they|them|their|I|me|my|you|your)\b/gi) || []).length;
    const namePronounRatio = nameCount > 0 ? pronounCount / (pronounCount + nameCount) : 0.5;
    const s1 = Math.min(1, 0.5 + namePronounRatio); // Higher pronoun usage = better

    // Signal 2: Sentence variety (std dev of sentence lengths)
    const sentLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avgLen = sentLengths.reduce((a, b) => a + b, 0) / (sentLengths.length || 1);
    const variance = sentLengths.reduce((sum, l) => sum + Math.pow(l - avgLen, 2), 0) / (sentLengths.length || 1);
    const stdDev = Math.sqrt(variance);
    const s2 = Math.min(1, stdDev / 8); // Healthy std dev ≈ 4-8 words

    // Signal 3: No verbatim repetition (same phrase repeated)
    const phrases = [];
    for (let i = 0; i < words.length - 3; i++) {
      phrases.push(words.slice(i, i + 4).join(' ').toLowerCase());
    }
    const phraseCounts = {};
    for (const p of phrases) phraseCounts[p] = (phraseCounts[p] || 0) + 1;
    const maxRepeat = Math.max(0, ...Object.values(phraseCounts));
    const s3 = maxRepeat > 1 ? Math.max(0, 1 - (maxRepeat - 1) * 0.15) : 1;

    // Signal 4: Plot point coverage (do plot points appear in text?)
    let plotCoverage = 0;
    if (plotPoints && plotPoints.length) {
      const lowerText = text.toLowerCase();
      for (const pp of plotPoints) {
        const keywords = pp.toLowerCase().split(/\s+/).filter(w => w.length > 4);
        const matched = keywords.filter(kw => lowerText.includes(kw)).length;
        plotCoverage += keywords.length > 0 ? matched / keywords.length : 0;
      }
      plotCoverage /= plotPoints.length;
    } else {
      plotCoverage = 1;
    }
    const s4 = Math.min(1, plotCoverage * 1.2);

    // Signal 5: Length appropriateness
    const wordCount = words.length;
    const expectedLen = params.sceneLen === 'tight' ? 350 : params.sceneLen === 'deep' ? 750 : 500;
    const lenRatio = wordCount / expectedLen;
    const s5 = lenRatio >= 0.5 && lenRatio <= 1.5 ? 1 : Math.max(0, 1 - Math.abs(lenRatio - 1));

    // Signal 6: Emotional tone alignment
    const emotionalMatches = {
      wonder: /\b(wonder|awe|marvel|breathtaking|cosmic|miracle|vast|infinite|star|light)\b/gi,
      terror: /\b(terror|fear|dread|horror|panic|dark|shadow|chilling)\b/gi,
      joy: /\b(joy|laugh|smile|delight|happy|celebrate|warm|golden)\b/gi,
      grief: /\b(grief|sorrow|loss|weep|tears|ache|hollow|mourn)\b/gi,
      rage: /\b(rage|fury|anger|burn|wrath|seethe|furious)\b/gi,
      love: /\b(love|heart|tender|caress|intimate|beloved|devotion)\b/gi,
      hope: /\b(hope|dawn|rise|tomorrow|believe|promise|future)\b/gi,
      curiosity: /\b(curious|question|wonder|discover|mystery|puzzle)\b/gi,
      serenity: /\b(serene|calm|peace|quiet|still|gentle|soft)\b/gi,
    };
    const tonePat = emotionalMatches[tone] || emotionalMatches.wonder;
    const toneMatches = (text.match(tonePat) || []).length;
    const toneDensity = wordCount > 0 ? (toneMatches / wordCount) * 100 : 0;
    const s6 = Math.min(1, toneDensity / 2); // 2%+ density is strong

    // ── Compute μ ──
    const signals = [
      { s: s1, w: 1.0 }, // Pronoun consistency
      { s: s2, w: 1.2 }, // Sentence variety (higher weight)
      { s: s3, w: 1.5 }, // No repetition (highest weight)
      { s: s4, w: 1.3 }, // Plot coverage
      { s: s5, w: 0.8 }, // Length
      { s: s6, w: 1.0 }, // Tone alignment
    ];
    const μ = this.computeMu(signals);

    // ── Evaluate CH ──
    const chChecks = {
      'no_empty_output': text && text.length >= 60,
      'no_verbatim_repeat': maxRepeat <= 2,
      'minimum_length': wordCount >= 100,
      'has_plot_points': plotPoints.length === 0 || plotCoverage >= 0.3,
      'sentence_variety': stdDev >= 2,
      'tone_present': toneDensity >= 0.5,
    };
    const chResult = this.evaluateCH(chChecks);

    // ── Decision Gate ──
    const allowed = μ >= this.τ && chResult.total === 1;

    // ── Sovereign Seal ──
    const sealInput = `μ${μ.toFixed(6)}CH${chResult.total}CC${chapterNum}${Date.now()}`;
    const seal = this._simpleHash(sealInput);

    return {
      μ, ch: chResult, allowed, seal,
      signals: { pronounRatio: s1, sentenceVariety: s2, noRepeat: s3, plotCoverage: s4, length: s5, tone: s6 },
      details: { wordCount, sentenceCount: sentences.length, stdDev, maxRepeat, toneDensity }
    };
  },

  // Sovereign SHA3-512-style hash (using Web Crypto when available, fallback to simple)
  async sovereignSeal(data) {
    try {
      const enc = new TextEncoder();
      const buf = await crypto.subtle.digest('SHA-512', enc.encode(data));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch(e) {
      return this._simpleHash(data);
    }
  },

  _simpleHash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      h = ((h << 5) - h + c + (h << 7) + (h << 3)) | 0;
      h = (h + (c * 31)) | 0;
    }
    return Math.abs(h).toString(16).padStart(16, '0');
  },
};

// ════════════════════════════════════════════════════════════
//  PROFESSIONAL EDITOR POLYGLOT ENGINE — Engine #93

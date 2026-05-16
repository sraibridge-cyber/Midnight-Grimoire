// ════════════════════════════════════════════════════════════
const EmotionalTracker = {

  // Emotional keyword lexicon — maps detected words to emotional categories
  lexicon: {
    wonder: ['wonder','awe','marvel','miracle','vast','enormous','cosmic','infinite','beauty','breathtaking','magnificent','extraordinary','impossible','strange','unknown','mystery','mysterious','sing','singing','resonance','harmonic','signal','discovery'],
    terror: ['terror','fear','dread','horror','panic','despair','doom','dreadful','terrifying','nightmare','shadow','darkness','void','abyss','hunted','chill','frozen','paralyzed','dread','foreboding'],
    joy: ['joy','laugh','laughter','smile','smiling','grin','delight','gleeful','euphoria','celebrate','triumph','victory','cheer','radiant','bright','warmth','light','sunshine','dance','singing','happiness'],
    grief: ['grief','sorrow','mourning','loss','bereft','weep','weeping','tears','ache','aching','hollow','empty','absence','missing','gone','never','again','remember','remembered','memorial','goodbye','farewell'],
    rage: ['rage','fury','furious','anger','angry','seethe','seething','burn','burning','scream','roar','violence','vengeance','revenge','hate','hatred','fierce','savage','wrath','ire','tempest'],
    love: ['love','loved','loving','heart','kiss','tender','tenderness','gentle','gentleness','intimate','closeness','devotion','beloved','darling','cherish','embrace','hold','holding','warm','softness'],
    hope: ['hope','hoped','hoping','believe','faith','trust','promise','tomorrow','future','dawn','light','rising','persevere','endure','carry on','not giving up','still','yet','possibility'],
    curiosity: ['curious','curiosity','question','wondering','puzzle','enigma','strange','odd','peculiar','what if','why','how','searching','seeking','investigate','uncover','hidden','secret'],
    serenity: ['serene','serenity','calm','peace','peaceful','quiet','still','stillness','gentle','soft','slow','rest','ease','tranquil','tranquility','balance','harmony','centered','grounded','breathe','breathing']
  },

  // Analyze a chapter's text for emotional content
  analyze(text, declaredTone, chapterNum) {
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const totalWords = words.length;
    const scores = {};
    const detected = {};

    for (const [emotion, keywords] of Object.entries(this.lexicon)) {
      const hits = keywords.filter(kw => {
        if (kw.includes(' ')) return text.toLowerCase().includes(kw);
        return words.includes(kw);
      }).length;
      scores[emotion] = hits;
      if (hits > 0) detected[emotion] = hits;
    }

    // Find dominant emotion
    let dominant = declaredTone;
    let maxScore = scores[declaredTone] || 0;
    for (const [emotion, score] of Object.entries(scores)) {
      if (score > maxScore) { maxScore = score; dominant = emotion; }
    }

    // Calculate emotional density (emotional words per 100 words)
    const totalHits = Object.values(scores).reduce((a, b) => a + b, 0);
    const density = totalWords > 0 ? (totalHits / totalWords * 100).toFixed(1) : 0;

    // Detect tone drift: dominant != declared
    const drift = dominant !== declaredTone && maxScore > (scores[declaredTone] || 0) + 1;

    // Build emotional arc point
    const arcPoint = {
      ch: chapterNum,
      declared: declaredTone,
      dominant,
      density,
      scores,
      detected,
      drift,
      ts: new Date().toISOString()
    };

    S.emotional.chapters.push(arcPoint);
    S.emotional.arc.push({ ch: chapterNum, declared: declaredTone, dominant, density, drift });
    if (drift) S.emotional.toneDrift.push(arcPoint);

    return arcPoint;
  },

  // Render the emotional arc summary for the UI
  renderArc() {
    const el = document.getElementById('emotionalArc');
    const n = S.emotional.chapters.length;
    if (!n) { el.innerHTML = '<p class="tm">No chapters yet — emotional arc builds as you write.</p>'; return; }

    const latest = S.emotional.chapters[n - 1];
    const drifts = S.emotional.toneDrift.length;

    // Build mini bar chart of emotions for latest chapter
    const emotionBars = Object.entries(latest.scores)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([emotion, score]) => {
        const color = this.emotionColor(emotion);
        const width = Math.min(100, score * 15);
        return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;font-size:.72rem">
          <span style="width:70px;text-align:right;color:var(--text3)">${emotion}</span>
          <div style="flex:1;background:var(--bg2);border-radius:4px;height:14px;overflow:hidden">
            <div style="width:${width}%;background:${color};height:100%;border-radius:4px"></div>
          </div>
          <span style="width:20px;color:var(--text2)">${score}</span>
        </div>`;
      }).join('');

    // Arc timeline: declared vs dominant per chapter
    const arcTimeline = S.emotional.arc.map((a, idx) => {
      const match = a.declared === a.dominant;
      const color = match ? 'var(--green)' : a.drift ? 'var(--red)' : '#fbbf24';
      const icon = match ? '✓' : a.drift ? '!' : '~';
      return `<span style="display:inline-block;background:${color}15;border:1px solid ${color};color:${color};padding:2px 8px;border-radius:6px;font-size:.68rem;margin:2px;position:relative;cursor:pointer;user-select:none" title="Click × to remove this tracking entry" onclick="return false;">
        ${icon} Ch${a.ch}: ${a.dominant}
        <span style="margin-left:4px;color:var(--text3);font-size:.6rem;cursor:pointer" onclick="EmotionalTracker.delete(${idx})" title="Remove this entry">×</span>
      </span>`;
    }).join(' ');

    el.innerHTML = `<div style="font-size:.77rem;color:var(--text2);margin-bottom:10px">
        <strong style="color:var(--gold)">Chapters analyzed:</strong> ${n} &nbsp;|&nbsp;
        <strong style="color:var(--gold)">Latest density:</strong> ${latest.density}% &nbsp;|&nbsp;
        <strong style="color:${drifts ? 'var(--red)' : 'var(--green)'}">Tone drifts:</strong> ${drifts}
      </div>
      ${drifts > 0 ? `<div style="background:var(--red)10;border:1px solid var(--red);border-radius:7px;padding:8px;margin-bottom:10px;font-size:.73rem;color:var(--red)">
        ⚠ ${drifts} chapter(s) drifted from declared tone. Check the arc timeline below.
      </div>` : ''}
      <div style="margin-bottom:10px"><strong style="color:var(--gold);font-size:.78rem">Latest Chapter Emotional Breakdown:</strong></div>
      ${emotionBars || '<p class="tm">No strong emotional signals detected.</p>'}
      <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center">
        <strong style="color:var(--gold);font-size:.78rem">Arc Timeline (declared → detected):</strong>
        <button class="btn btn-danger btn-sm" style="font-size:.65rem;padding:2px 8px" onclick="EmotionalTracker.clearAll()">🗑 Clear All</button>
      </div>
      <div style="margin-top:6px">${arcTimeline}</div>`;
  },

  // Remove individual chapter from character tracking
  delete(idx) {
    if (!confirm('Remove this character tracking entry?')) return;
    const removed = S.characterTracker.chapters[idx];
    if (!removed) return;
    // Decrement cumulative presence
    if (removed.presence) {
      for (const name in removed.presence) {
        if (S.characterTracker.presence[name]) {
          S.characterTracker.presence[name].chapters--;
          S.characterTracker.presence[name].totalMentions -= removed.presence[name].totalMentions || 0;
          if (S.characterTracker.presence[name].chapters <= 0) delete S.characterTracker.presence[name];
        }
      }
    }
    S.characterTracker.chapters.splice(idx, 1);
    S.characterTracker.povConsistency.splice(idx, 1);
    this.render();
    toast('Character entry removed');
  },

  // Clear all character tracking data
  clearAll() {
    if (!confirm('Clear all character tracking data?')) return;
    S.characterTracker = { chapters: [], presence: {}, dialogueRatio: {}, povConsistency: [] };
    this.render();
    toast('Character tracker cleared');
    save();
  },

  // Re-analyze all existing chapters with current character registry
  backfill() {
    S.characterTracker.chapters = [];
    S.characterTracker.presence = {};
    S.characterTracker.povConsistency = [];
    for (const ch of S.chapters) {
      if (ch.text) this.analyze(ch.text, S.chars, ch.num);
    }
    renderCharacter();
    toast('Character Tracker backfilled for ' + S.chapters.length + ' chapters');
  },

  // Remove individual chapter from emotional tracking
  delete(idx) {
    if (!confirm('Remove this emotional tracking entry?')) return;
    const removed = S.emotional.arc[idx];
    if (!removed) return;
    // Remove from arc
    S.emotional.arc.splice(idx, 1);
    // Remove from chapters
    const chIdx = S.emotional.chapters.findIndex(c => c.ch === removed.ch && c.ts === removed.ts);
    if (chIdx >= 0) {
      const driftIdx = S.emotional.toneDrift.findIndex(d => d.ch === removed.ch && d.ts === removed.ts);
      if (driftIdx >= 0) S.emotional.toneDrift.splice(driftIdx, 1);
      S.emotional.chapters.splice(chIdx, 1);
    }
    this.renderArc();
    toast('Emotional entry removed');
  },

  // Clear all emotional tracking data
  clearAll() {
    if (!confirm('Clear all emotional tracking data?')) return;
    S.emotional = { chapters: [], toneDrift: [], arc: [] };
    this.renderArc();
    toast('Emotional tracker cleared');
    save();
  },

  emotionColor(e) {
    const colors = { wonder:'var(--accent2)', terror:'var(--red)', joy:'#fbbf24', grief:'#64748b', rage:'#ef4444', love:'#ec4899', hope:'var(--green)', curiosity:'var(--cyan)', serenity:'#06b6d4' };
    return colors[e] || 'var(--text3)';
  }
};

// ════════════════════════════════════════════════════════════
//  CHARACTER TRACKER ENGINE
//  Auto-detects character presence, tracks dialogue & consistency

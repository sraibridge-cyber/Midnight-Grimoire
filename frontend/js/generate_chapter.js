async function generateChapter() {
  const title  = document.getElementById('storyTitle').value || 'Untitled';
  const premise= document.getElementById('premise').value || '';
  const ch     = parseInt(document.getElementById('chapterNum').value)||1;
  const sceneLen=document.getElementById('sceneLen').value;
  const rawPts = document.getElementById('plotPoints').value;
  const plotPoints = rawPts.split('\n').filter(p=>p.trim()).map(p=>p.replace(/^[-*•]\s*/,''));
  const temp   = parseFloat(document.getElementById('temperature').value);
  const style  = document.getElementById('narrativeStyle').value;
  const pacing = document.getElementById('pacing').value;
  const extra  = document.getElementById('extraInstr').value;
  const tone   = TONES.find(t=>t.n===S.tone)||TONES[0];
  const contCtx= buildContinuityContext();

  // Clean false characters BEFORE generation so they don't contaminate prose
  const removed = ChapterOrganizer.cleanupFalseCharacters();
  if (removed > 0) console.log(`ChapterOrganizer: pre-cleaned ${removed} false character(s)`);

  showTab('grimoire', document.querySelectorAll('.tab-btn')[2]);
  const out = document.getElementById('story-output');
  out.innerHTML = `<span class="ring"></span> Harmony Core weaving Chapter ${ch}...`;
  document.getElementById('conjureBtn').disabled=true;
  setStatus('purple', `Generating Chapter ${ch} via Harmony Core...`, '');
  ['statsRow','muWrap','sealBox','exportRow'].forEach(id=>document.getElementById(id).style.display='none');

  try {
    // ── THREAD WEAVER: Pull unresolved threads into plot points ──
    const woven = ThreadMemory.weaveThreads(ch, S.chars);
    if (woven.length) {
      const ins = Math.max(0, plotPoints.length - 1);
      plotPoints.splice(ins, 0, ...woven);
    }
    // ── AUTO-DETECT CHARACTERS from plot points if none registered ──
    if (!S.chars || S.chars.length === 0) {
      const detected = new Set();
      for (const pp of plotPoints) {
        // Match capitalized names at start of plot point (e.g., "Elara detects...", "Kael-7 confirms...")
        const match = pp.match(/^([A-Z][a-zA-Z0-9-]+(?:\s+[A-Z][a-zA-Z]+)?)/);
        if (match) {
          const name = match[1].trim();
          if (name.length > 2 && !HSM._PRONOUN_NAMES.has(name)) {
            detected.add(name);
          }
        }
      }
      for (const name of detected) {
        // Infer pronouns from name ending
        const pronouns = name.endsWith('a') || name.endsWith('i') ? 'she/her'
                        : name.match(/-[0-9]$/) ? 'he/him'
                        : name.match(/(a|e|i)$/) ? 'she/her'
                        : 'they/them';
        S.chars.push({ name, pronouns, role: '', backstory: '', emoji: '🎭' });
        console.log(`Auto-detected character: ${name} (${pronouns})`);
      }
      if (S.chars.length > 0) {
        renderChars();
        save();
      }
    }
    // ── WORLD CONTEXT: Load established facts & locations ──
    const worldCtx = WorldBuilder.getContextForChapter(ch);
    const relCtx   = S.chars.length >= 2 ? CharacterRelationship.getDynamic(S.chars[0].name, S.chars[1].name) : null;
    
    let text;

    // ── HARMONY CORE (sovereign) ──
    text = await callHarmonyCore({
      title, chapterNum:ch, premise, plotPoints, genre:S.genre,
      tone:S.tone, chars:S.chars, style, pacing:pacing, sceneLen, extra,
      lastScene: contCtx.lastScene,
      unresolvedThreads: contCtx.unresolvedThreads,
      continuityCtx: contCtx,
    });

    if (!text || text.trim().length < 60) throw new Error('Empty response — try again');

    // ── PROFESSIONAL EDITOR POLYGLOT PASS ──
    const editedText = EditorEngine.polish(text);
    if (editedText !== text) { text = editedText; }

    S.output = text;
    const words = text.trim().split(/\s+/).length;

    // ── COHERENCE CALCULUS v1.0 ──
    const coherence = CoherenceCalculus.evaluate(text, {
      chars: S.chars, tone: S.tone, genre: S.genre,
      chapterNum: ch, plotPoints, sceneLen
    });
    const μ = coherence.μ;
    const chVector = coherence.ch;

    out.innerHTML = renderMD(text);
    document.getElementById('statsRow').style.display='flex';
    document.getElementById('sCh').textContent=ch;
    document.getElementById('sWords').textContent=words.toLocaleString();
    document.getElementById('sGenre').textContent=S.genre;
    document.getElementById('sTone').textContent=S.tone;
    document.getElementById('sMu').textContent=μ.toFixed(4);
    document.getElementById('sModel').textContent='Harmony Core';
    document.getElementById('muWrap').style.display='block';
    document.getElementById('muVal').textContent=μ.toFixed(4);
    setTimeout(()=>{ document.getElementById('muFill').style.width=(μ*100)+'%'; },100);
    // CH vector display
    const chEl = document.getElementById('chVector');
    if (chEl) {
      const chHtml = Object.entries(chVector.vector).map(([k,v]) =>
        `<span style="color:${v?'#10b981':'#ef4444'};font-size:.65rem">${v?'✓':'✗'}${k.replace(/_/g,' ')}</span>`
      ).join(' · ');
      chEl.innerHTML = `<div style="margin-top:4px">${chHtml}</div>`;
    }
    // Editor stats
    const edEl = document.getElementById('editorStats');
    if (edEl) {
      edEl.innerHTML = `✏️ Editor: ${EditorEngine.stats.fixes} fixes across ${EditorEngine.stats.passes} passes`;
    }
    const seal=await sha256(text);
    document.getElementById('sealBox').style.display='block';
    document.getElementById('sealHash').textContent=seal;
    document.getElementById('exportRow').style.display='flex';

    // Show Seal & Continue DM panel
    document.getElementById('sealContinue').style.display='block';
    document.getElementById('continueLastScene').textContent = S.continuity.lastScene || '(end of chapter ' + ch + ')';

    // ════════════════════════════════════════════════════════════
    //  CHAIN MERGE — Save chapter immediately, prose is FINAL
    // ════════════════════════════════════════════════════════════
    S.chapters.push({num:ch,title,genre:S.genre,tone:S.tone,model:'Harmony Core',words,mu:μ.toFixed(4),text,seal,summary:'',ts:new Date().toISOString()});
    extractContinuity(text, ch);
    renderHist();
    document.getElementById('chapterNum').value=ch+1;
    PathChain.render(); PathChain.renderNext('pathNext-create'); PathChain.renderNext('pathNext-grimoire');
    save();
    setStatus('green','Harmony Core Online','Chapter sealed');
    toast(`✅ Chapter ${ch} sealed — ${words.toLocaleString()} words · μ ${coherence.μ.toFixed(4)} · CH ${coherence.ch.total}`);

    // ════════════════════════════════════════════════════════════
    //  SIX CHAINS — Run in background, NEVER modify prose
    //  Character · Plot · World · Voice · Editor · Continuity
    // ════════════════════════════════════════════════════════════
    setTimeout(() => {
      ChainEngine.runAll(text, ch);
      // Update all UI panels
      updateContUI(); renderThreads(); renderEmotional(); renderCharacter();
      renderThreadMemory(); renderWorldBuilder(); renderRelationships();
      VoxHarmonica.renderProfiles();
      save();
    }, 100);

  } catch(e) {
    out.innerHTML=`<div style="color:var(--red)">❌ ${e.message}<br><br><span style="font-size:.77rem;color:var(--text3)">Harmony Core always works offline. Try switching to it.</span></div>`;
    setStatus('green','Harmony Core Online','');
    toast(`❌ ${e.message.slice(0,55)}`);
  } finally {
    document.getElementById('conjureBtn').disabled=false;
  }
}

// ════════════════════════════════════════════════════════════
//  SEAL & CONTINUE — DM-Style Chapter Loop
//  After each chapter: review, adjust plot points, continue.
// ════════════════════════════════════════════════════════════
function sealAndContinue() {

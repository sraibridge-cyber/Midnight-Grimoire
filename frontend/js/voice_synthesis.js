// ════════════════════════════════════════════════════════════
//  VOX HARMONICA v5.0 — Engine #91
//  Architecture: Browser Voice Source → Sovereign Audio Processing
//  Speech: Web Speech API voices through Web Audio effects chain
//  Soundscape: Auto-generated ambient audio, same AudioContext
//  Tone: Harmonic phoneme music (artistic fallback)
// ════════════════════════════════════════════════════════════
const VoxHarmonica = {
  ENGINE_NAME: 'Vox Harmonica',
  ENGINE_VERSION: '5.0.0',
  ENGINE_NUMBER: 91,
  MASTER_SEAL: 'vox91_v5_0_0_8a3e1f7c',

  // ── Runtime State ──
  voices: {},
  utteranceHistory: [],
  stats: { utterances: 0, repeatCatches: 0 },
  isPlaying: false,
  isPaused: false,
  currentQueue: [],
  currentIndex: 0,
  synth: null,
  systemVoices: [],
  globalPitch: 0.80,
  globalRate: 0.80,
  globalVolume: 1.0,
  breathEnabled: true,
  emotionEnabled: true,
  noRepeatEnabled: true,
  soundscapeEnabled: true,
  mode: 'speech',
  animFrame: null,
  // Audio processing
  audioCtx: null,
  masterGain: null,
  voiceGain: null,
  ambientGain: null,
  currentAmbientNodes: [],
  currentAmbientProfile: null,

  // ════════════════════════════════════════════════════════════
  //  INITIALIZATION
  // ════════════════════════════════════════════════════════════
  init() {
    this.synth = window.speechSynthesis || null;
    this._initAudio();
    if (this.synth) {
      this._loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this._loadVoices();
      }
    }
    this.updateGlobal();
    this.renderProfiles();
    this._updateStats();
  },

  // Initialize Web Audio API for effects processing
  _initAudio() {
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.audioCtx.destination);
      // Separate gain for voice ( louder )
      this.voiceGain = this.audioCtx.createGain();
      this.voiceGain.gain.value = 1.0;
      this.voiceGain.connect(this.masterGain);
      // Separate gain for ambient
      this.ambientGain = this.audioCtx.createGain();
      this.ambientGain.gain.value = 0.6;
      this.ambientGain.connect(this.masterGain);
    } catch(e) {
      console.warn('Web Audio API not available');
    }
  },

  _ensureAudio() {
    if (!this.audioCtx) this._initAudio();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return !!this.audioCtx;
  },

  _loadVoices() {
    if (!this.synth) return;
    this.systemVoices = this.synth.getVoices() || [];
    const seen = new Set();
    this.systemVoices = this.systemVoices.filter(v => {
      if (seen.has(v.name)) return false;
      seen.add(v.name);
      return true;
    }).sort((a, b) => {
      const aLocal = a.localService ? 1 : 0;
      const bLocal = b.localService ? 1 : 0;
      if (bLocal !== aLocal) return bLocal - aLocal;
      return a.name.localeCompare(b.name);
    });
    this._renderVoiceSelector();
  },

  // ════════════════════════════════════════════════════════════
  //  VOICE SELECTION
  // ════════════════════════════════════════════════════════════
  _getBestVoice(preferredURI) {
    if (!this.systemVoices || this.systemVoices.length === 0) return null;
    if (preferredURI) {
      const v = this.systemVoices.find(v => v.voiceURI === preferredURI);
      if (v) return v;
    }
    // Quality tiers: local premium > any premium > local English > any English
    const premium = ['Samantha','Victoria','Daniel','Moira','Tessa','Fred',
      'Microsoft David','Microsoft Zira','Microsoft Mark','Google US English'];
    for (const name of premium) {
      const v = this.systemVoices.find(v => v.name.includes(name) && v.localService);
      if (v) return v;
    }
    for (const name of premium) {
      const v = this.systemVoices.find(v => v.name.includes(name));
      if (v) return v;
    }
    const enLocal = this.systemVoices.find(v => v.lang && v.lang.startsWith('en') && v.localService);
    if (enLocal) return enLocal;
    const en = this.systemVoices.find(v => v.lang && v.lang.startsWith('en'));
    if (en) return en;
    return this.systemVoices[0];
  },

  // ════════════════════════════════════════════════════════════
  //  VOICE PROFILE MANAGEMENT
  // ════════════════════════════════════════════════════════════
  createVoice(charName) {
    const voices = this.systemVoices;
    const existing = Object.values(this.voices).map(v => v.voiceName);
    let assigned = null;
    if (voices.length > 0) {
      const available = voices.filter(v => !existing.includes(v.name));
      const pool = available.length > 0 ? available : voices;
      let hash = 0;
      for (let i = 0; i < charName.length; i++) hash = ((hash << 5) - hash) + charName.charCodeAt(i);
      assigned = pool[Math.abs(hash) % pool.length];
    }
    this.voices[charName] = {
      basePitch: 1.0, baseRate: 1.0,
      voiceURI: assigned ? assigned.voiceURI : '',
      voiceName: assigned ? assigned.name : 'Default',
    };
    return this.voices[charName];
  },

  updateProfile(charName, key, value) {
    if (this.voices[charName]) this.voices[charName][key] = parseFloat(value);
  },

  assignVoice(charName, voiceURI) {
    const voice = this.systemVoices.find(v => v.voiceURI === voiceURI);
    if (voice && this.voices[charName]) {
      this.voices[charName].voiceURI = voiceURI;
      this.voices[charName].voiceName = voice.name;
      this.renderProfiles();
      toast('🎙 ' + charName + ' → ' + voice.name);
    }
  },

  deleteVoice(charName) {
    delete this.voices[charName];
    this.renderProfiles();
  },

  // ════════════════════════════════════════════════════════════
  //  UI RENDERING
  // ════════════════════════════════════════════════════════════
  _renderVoiceSelector() {
    const el = document.getElementById('voxVoiceSelector');
    if (!el) return;
    if (this.systemVoices.length === 0) {
      el.innerHTML = '<p class="tm">Loading voices... Click "Load Voices" if none appear.</p>';
      return;
    }
    let html = '<label style="font-size:.72rem;margin-bottom:6px;display:block">System Voices (' + this.systemVoices.length + ')</label>';
    html += '<select id="voxVoicePick" style="width:100%;font-size:.72rem;padding:6px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:5px;margin-bottom:8px">';
    html += '<option value="">— Select a voice —</option>';
    for (const v of this.systemVoices) {
      const flag = v.lang ? v.lang.split('-')[1] || v.lang : '??';
      const local = v.localService ? '🏠' : '☁️';
      const quality = v.localService ? '★' : ' ';
      html += '<option value="' + v.voiceURI + '">' + quality + ' ' + local + ' ' + v.name + ' · ' + flag + '</option>';
    }
    html += '</select>';
    html += '<button class="btn btn-ghost btn-sm" style="font-size:.65rem" onclick="VoxHarmonica._previewChosenVoice()">🔊 Preview</button> ';
    html += '<button class="btn btn-accent btn-sm" style="font-size:.65rem" onclick="VoxHarmonica._autoSelectBest()">🌟 Best Voice</button>';
    const best = this._getBestVoice();
    if (best) html += '<p style="font-size:.62rem;color:var(--accent2);margin-top:6px">★ Best: <strong>' + best.name + '</strong> ' + (best.localService ? '(offline)' : '') + '</p>';
    el.innerHTML = html;
  },

  renderProfiles() {
    const el = document.getElementById('voxProfiles');
    if (!el) return;
    if (!S.chars.length) {
      el.innerHTML = '<p class="tm">Register characters to create voice profiles.</p>';
      return;
    }
    for (const c of S.chars) { if (!this.voices[c.name]) this.createVoice(c.name); }
    let html = '';
    for (const c of S.chars) {
      const v = this.voices[c.name]; if (!v) continue;
      let vsel = '<select style="font-size:.65rem;padding:4px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:4px;width:100%;margin-bottom:8px" onchange="VoxHarmonica.assignVoice(&quot;' + c.name + '&quot;, this.value)">';
      vsel += '<option>' + v.voiceName + '</option>';
      for (const sv of this.systemVoices) {
        if (sv.voiceURI !== v.voiceURI) vsel += '<option value="' + sv.voiceURI + '">' + sv.name + '</option>';
      }
      vsel += '</select>';
      html += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:7px;padding:10px;margin-bottom:8px">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
      html += '<strong style="color:var(--gold);font-size:.82rem">' + (c.emoji || '🎭') + ' ' + c.name + '</strong>';
      html += '<span style="font-size:.65rem;color:var(--text3)">' + c.pronouns + (c.role ? ' · ' + c.role : '') + '</span></div>';
      html += '<div style="margin-bottom:8px"><label style="font-size:.62rem">Voice</label>' + vsel + '</div>';
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
      html += '<div><label style="font-size:.62rem">Pitch</label><input type="range" min="0.8" max="1.25" step="0.05" value="' + v.basePitch + '" onchange="VoxHarmonica.updateProfile(&quot;' + c.name + '&quot;,&quot;basePitch&quot;,this.value)" style="width:100%"></div>';
      html += '<div><label style="font-size:.62rem">Rate</label><input type="range" min="0.75" max="1.25" step="0.05" value="' + v.baseRate + '" onchange="VoxHarmonica.updateProfile(&quot;' + c.name + '&quot;,&quot;baseRate&quot;,this.value)" style="width:100%"></div>';
      html += '</div><div style="margin-top:8px;display:flex;gap:6px">';
      html += '<button class="btn btn-ghost btn-sm" style="font-size:.65rem" onclick="VoxHarmonica.testVoice(&quot;' + c.name + '&quot;)">🔊 Test</button> ';
      html += '<button class="btn btn-ghost btn-sm" style="font-size:.65rem" onclick="VoxHarmonica.deleteVoice(&quot;' + c.name + '&quot;)">🗑 Reset</button>';
      html += '</div></div>';
    }
    el.innerHTML = html;
    this._updateStats();
    const btn = document.getElementById('voxPlayBtn');
    const sBtn = document.getElementById('voxStoryBtn');
    const hasText = !!(S.output && S.output.length > 10);
    if (btn) btn.disabled = !hasText;
    if (sBtn) sBtn.disabled = !hasText;
  },

  _updateStats() {
    const vc = document.getElementById('voxVoiceCount');
    const uc = document.getElementById('voxUtteranceCount');
    if (vc) vc.textContent = Object.keys(this.voices).length;
    if (uc) uc.textContent = this.stats.utterances;
  },

  // ════════════════════════════════════════════════════════════
  //  EMOTION & ANTI-REPETITION
  // ════════════════════════════════════════════════════════════
  _detectEmotion(text) {
    const t = text.toLowerCase();
    if (/(grief|loss|ache|hollow|mourn)/.test(t)) return 'sorrow';
    if (/(joy|laugh|celebrate|triumph|relief)/.test(t)) return 'joy';
    if (/(rage|fury|anger|wrath)/.test(t)) return 'anger';
    if (/(terror|fear|dread|panic)/.test(t)) return 'fear';
    if (/(wonder|awe|marvel|extraordinary|cosmic)/.test(t)) return 'wonder';
    return 'neutral';
  },

  _emotionMod(emotion) {
    const d = { joy: {dp:0.03,dr:0.02}, sorrow: {dp:-0.03,dr:-0.08}, anger: {dp:0.03,dr:0.05}, fear: {dp:0.01,dr:0.03}, wonder: {dp:0.02,dr:-0.06}, neutral: {dp:0,dr:0} };
    return d[emotion] || d.neutral;
  },

  _effectivePitch(base, delta) {
    const g = (parseFloat(this.globalPitch) || 0.80) - 1.0;
    return Math.min(1.04, Math.max(0.80, base + delta.dp + g));
  },
  _effectiveRate(base, delta) {
    const g = (parseFloat(this.globalRate) || 0.85) - 1.0;
    return Math.min(1.12, Math.max(0.72, base + delta.dr + g));
  },

  _antiRepetition(text) {
    if (!this.noRepeatEnabled) return text;
    if (this.utteranceHistory.includes(text)) {
      this.stats.repeatCatches++;
      const v = ['As I was saying, ' + text.toLowerCase(), 'To repeat: ' + text, 'Again — ' + text];
      return v[Math.floor(Math.random() * v.length)];
    }
    return text;
  },

  // ════════════════════════════════════════════════════════════
  //  SPEAKER DETECTION
  // ════════════════════════════════════════════════════════════
  _detectSpeaker(text) {
    const BAD = new Set(['she','he','they','it','we','you','her','him','them','his','their','its','She','He','They','It']);
    for (const name of Object.keys(this.voices)) {
      if (BAD.has(name)) continue;
      const first = name.split(' ')[0];
      if (BAD.has(first)) continue;
      if (text.includes(name) || text.includes(first)) return name;
    }
    return null;
  },

  // ════════════════════════════════════════════════════════════
  //  QUEUE BUILDING
  // ════════════════════════════════════════════════════════════
  _buildQueue(text) {
    const paragraphs = text.split('\n').filter(p => p.trim().length > 10);
    const queue = [];
    for (const para of paragraphs) {
      if (para.startsWith('#')) {
        queue.push({ text: para.replace(/^#+\s*/, ''), speaker: null, isHeading: true });
        continue;
      }

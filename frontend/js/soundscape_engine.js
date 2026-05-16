  ENGINE_NAME: 'Soundscape Engine',
  ENGINE_VERSION: '1.0.0',
  ENGINE_NUMBER: 97,
  MASTER_SEAL: 'snd97_8a3e1f7c2b9d4e5f',

  audioCtx: null,
  masterGain: null,
  activeNodes: [],
  currentProfile: null,
  isPlaying: false,
  crossfadeDuration: 1.5,

  // Mood detection patterns
  patterns: {
    space: /\b(star|void|cosmos|orbit|nebula|planet|ship|deck|console|reactor|engine|warp|jump| Centauri|space|vacuum|galaxy|quasar)\b/i,
    tension: /\b(tension|dread|uneasy|wary|silent|silence|held|breath|wait|watch|unknown|uncertain|edge|danger|threat|fear)\b/i,
    dialogue: /"[^"]{10,}"/, // Dialogue present
    calm: /\b(breathe|breath|stillness|quiet|soft|gentle|calm|peace|rest|settle|moment|paused)\b/i,
    action: /\b(ran|rush|moved|fired|shouted|hit|struck|fought|charged|exploded|crash|impact|thrust)\b/i,
    mystery: /\b(anomalous|unknown|strange|weird|unseen|hidden|secret|mystery|puzzle|question|why|what|how)\b/i,
    sorrow: /\b(grief|loss|ache|hollow|sorrow|mourn|weep|sad|alone|empty|gone|never)\b/i,
    joy: /\b(joy|laugh|smile|celebrate|triumph|relief|warm|bright|light|hope|wonder|awe)\b/i,
  },

  // Sound profiles: each defines oscillators + noise for a mood
  profiles: {
    space: {
      label: 'Deep Space',
      description: 'Low sub-bass drone + subtle static — vastness of the void',
      osc: [
        { type: 'sine', freq: 55, amp: 0.06, detune: 0 },
        { type: 'sine', freq: 110, amp: 0.03, detune: 2 },
        { type: 'triangle', freq: 220, amp: 0.015, detune: -3 },
      ],
      noise: { type: 'pink', amp: 0.008, filter: 800 },
    },
    tension: {
      label: 'Building Tension',
      description: 'Rising frequency + irregular pulse — unease, anticipation',
      osc: [
        { type: 'sine', freq: 150, amp: 0.04, detune: 0, lfo: { rate: 0.2, depth: 30 } },
        { type: 'sine', freq: 300, amp: 0.02, detune: 5 },
        { type: 'sawtooth', freq: 80, amp: 0.01, detune: 0 },
      ],
      noise: { type: 'brown', amp: 0.006, filter: 400 },
    },
    dialogue: {
      label: 'Interior Dialogue',
      description: 'Warm mid-tone pad — intimate, human moments',
      osc: [
        { type: 'sine', freq: 261.63, amp: 0.035, detune: 0 }, // C4
        { type: 'sine', freq: 329.63, amp: 0.025, detune: 1 }, // E4
        { type: 'sine', freq: 392.00, amp: 0.02, detune: -1 }, // G4
      ],
      noise: null,
    },
    calm: {
      label: 'Stillness',
      description: 'Soft sine waves + breath-like noise — peace, reflection',
      osc: [
        { type: 'sine', freq: 174.61, amp: 0.03, detune: 0 }, // F3
        { type: 'sine', freq: 196.00, amp: 0.025, detune: 2 }, // G3
      ],
      noise: { type: 'pink', amp: 0.005, filter: 300 },
    },
    action: {
      label: 'Kinetic Energy',
      description: 'Sharp sawtooth + noise burst — movement, urgency',
      osc: [
        { type: 'sawtooth', freq: 100, amp: 0.03, detune: 0 },
        { type: 'square', freq: 200, amp: 0.015, detune: 7 },
      ],
      noise: { type: 'white', amp: 0.012, filter: 2000 },
    },
    mystery: {
      label: 'The Unknown',
      description: 'Drifting harmonics + sparse tones — wonder, anomaly',
      osc: [
        { type: 'sine', freq: 220, amp: 0.025, detune: 0, lfo: { rate: 0.1, depth: 15 } },
        { type: 'sine', freq: 330, amp: 0.02, detune: 3 },
        { type: 'triangle', freq: 880, amp: 0.01, detune: -5 },
      ],
      noise: { type: 'pink', amp: 0.006, filter: 1200 },
    },
    sorrow: {
      label: 'Sorrow',
      description: 'Low minor intervals + breath — loss, melancholy',
      osc: [
        { type: 'sine', freq: 220, amp: 0.03, detune: 0 },
        { type: 'sine', freq: 261.63, amp: 0.025, detune: 1 }, // C4 minor feel
      ],
      noise: { type: 'brown', amp: 0.008, filter: 250 },
    },
    joy: {
      label: 'Wonder',
      description: 'Bright major harmonics — awe, revelation',
      osc: [
        { type: 'sine', freq: 523.25, amp: 0.025, detune: 0 }, // C5
        { type: 'sine', freq: 659.25, amp: 0.02, detune: 2 },  // E5
        { type: 'sine', freq: 783.99, amp: 0.015, detune: -1 }, // G5
      ],
      noise: null,
    },
    default: {
      label: 'Neutral',
      description: 'Subtle pad — general atmosphere',
      osc: [
        { type: 'sine', freq: 150, amp: 0.02, detune: 0 },
        { type: 'sine', freq: 200, amp: 0.015, detune: 3 },
      ],
      noise: { type: 'pink', amp: 0.004, filter: 500 },
    },
  },

  _ensureCtx() {
    if (!this.audioCtx) {
      try { this.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return false; }
    }
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    if (!this.masterGain) {
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.audioCtx.destination);
    }
    return true;
  },

  // Analyze text and return best-matching profile key
  analyze(text) {
    const scores = {};
    for (const [mood, pattern] of Object.entries(this.patterns)) {
      const matches = (text.match(pattern) || []).length;
      scores[mood] = matches;
    }
    // Weight dialogue higher (conversation scenes need interior feel)
    if (scores.dialogue > 0) scores.dialogue *= 1.5;
    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return best && best[1] > 0 ? best[0] : 'default';
  },

  // Build a soundscape for a block of text
  build(text) {
    const profile = this.profiles[this.analyze(text)] || this.profiles.default;
    return { profile, text: text.slice(0, 80) };
  },

  // Start playing a profile's ambient audio
  play(profileKey) {
    // Must be called from user gesture context; AudioContext needs user interaction
    if (!this._ensureCtx()) { console.warn('Soundscape: AudioContext not available'); return; }
    const profile = this.profiles[profileKey] || this.profiles.default;
    if (this.currentProfile === profileKey) return; // Already playing

    // Crossfade: fade out old, fade in new
    const now = this.audioCtx.currentTime;
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(0, now + this.crossfadeDuration * 0.5);
    }

    // Stop old nodes after fade
    setTimeout(() => {
      this.stop();
      this._startProfile(profile);
      if (this.masterGain) {
        this.masterGain.gain.linearRampToValueAtTime(0.5, this.audioCtx.currentTime + this.crossfadeDuration * 0.5);
      }
    }, this.crossfadeDuration * 500);

    this.currentProfile = profileKey;
    this.isPlaying = true;
  },

  _startProfile(profile) {
    if (!this.audioCtx) return;
    this.activeNodes = [];
    const now = this.audioCtx.currentTime;

    // Build oscillators
    if (profile.osc) {
      for (const o of profile.osc) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = o.type;
        osc.frequency.value = o.freq;
        if (o.detune) osc.detune.value = o.detune;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(o.amp, now + 0.5);
        // Add subtle LFO for movement
        if (o.lfo) {
          const lfo = this.audioCtx.createOscillator();
          const lfoGain = this.audioCtx.createGain();
          lfo.frequency.value = o.lfo.rate;
          lfoGain.gain.value = o.lfo.depth;
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          lfo.start(now);
          this.activeNodes.push(lfo, lfoGain);
        }
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        this.activeNodes.push(osc, gain);
      }
    }

    // Build noise
    if (profile.noise) {
      const bufferSize = this.audioCtx.sampleRate * 2;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (profile.noise.type === 'pink') {
          data[i] = (white + (data[i-1] || 0)) * 0.5;
        } else if (profile.noise.type === 'brown') {
          data[i] = (white + (data[i-1] || 0) * 0.95) * 0.5;
        } else {
          data[i] = white;
        }
      }
      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const noiseGain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = profile.noise.filter;
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(profile.noise.amp, now + 0.5);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start(now);
      this.activeNodes.push(noise, noiseGain, filter);
    }
  },

  stop() {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    // Graceful fade out
    for (const node of this.activeNodes) {
      if (node.gain) {
        try { node.gain.linearRampToValueAtTime(0, now + 0.3); } catch(e) {}
      }
    }
    setTimeout(() => {
      for (const node of this.activeNodes) {
        try { if (node.stop) node.stop(); } catch(e) {}
        try { if (node.disconnect) node.disconnect(); } catch(e) {}
      }
      this.activeNodes = [];
    }, 350);
    this.isPlaying = false;
    this.currentProfile = null;
  },

  pause() {
    if (this.masterGain) this.masterGain.gain.value = 0;
  },

  resume() {
    if (this.masterGain) this.masterGain.gain.value = 0.5;
  },

  // Toggle master volume
  setVolume(v) {
    if (this.masterGain) this.masterGain.gain.value = Math.max(0, Math.min(1, v));
  },
};

// ════════════════════════════════════════════════════════════
//  VOX HARMONICA v4.0 — Engine #91

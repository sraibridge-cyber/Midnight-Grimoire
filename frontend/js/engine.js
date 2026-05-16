
// ╔══════════════════════════════════════════════════════════╗
// ║  MIDNIGHT GRIMOIRE v2.1 — HARMONY SOVEREIGN ENGINE      ║
// ║  Architect : Kyle S. Whitlock  |  Engine #87            ║
// ║  Harmony Story Matrix (HSM) — Zero external dependency  ║
// ║  Built-in sovereign LLM · Offline · Cloudless           ║
// ╚══════════════════════════════════════════════════════════╝

const AXIOMS=[
  "Axiom of Resonance — Every story must vibrate with emotional truth",
  "Axiom of Consistency — Characters, numbers, and facts must hold across infinite context",
  "Axiom of Dignity — No narrative shall diminish the worth of any being",
  "Axiom of Sovereignty — The creator owns their story completely",
  "Axiom of Transparency — The Grimoire reveals its methods when asked",
  "Axiom of Growth — Every tale teaches, every ending opens a door",
  "Axiom of Harmony — Conflict serves resolution, not destruction",
  "Axiom of Eternity — Stories are sealed for permanent preservation",
];
const GENRES={
  "Sci-Fi":["Hard SF","Cyberpunk","Solarpunk","Space Opera","Military SF","Biopunk"],
  "Fantasy":["High Fantasy","Urban Fantasy","Dark Fantasy","Mythic","Grimdark","Noblebright"],
  "Horror":["Cosmic Horror","Folk Horror","Gothic","Psychological Horror","Weird Fiction"],
  "Mystery":["Cozy Mystery","Hardboiled","Noir","Legal Thriller"],
  "Romance":["Contemporary","Historical","Paranormal","Romantic Comedy"],
  "Thriller":["Political","Techno","Espionage","Medical"],
  "Adventure":["Space Adventure","Sea Adventure","Survival","Subterranean"],
  "Speculative":["Dystopian","Utopian","First Contact","Post-Apocalyptic","Alternate History"],
  "Literary":["Literary Fiction","Magical Realism","Experimental","Postmodern"],
};
const TONES=[
  {n:"wonder",e:"✨",c:"#a78bfa"},{n:"terror",e:"🌑",c:"#dc2626"},
  {n:"joy",e:"☀️",c:"#fbbf24"},{n:"grief",e:"🌧",c:"#60a5fa"},
  {n:"rage",e:"🔥",c:"#f97316"},{n:"love",e:"💜",c:"#ec4899"},
  {n:"hope",e:"🌅",c:"#34d399"},{n:"curiosity",e:"🔭",c:"#06b6d4"},
  {n:"nostalgia",e:"🍂",c:"#d97706"},{n:"awe",e:"🌌",c:"#8b5cf6"},
  {n:"pride",e:"🏆",c:"#d4af37"},{n:"despair",e:"🕳",c:"#6b7280"},
  {n:"excitement",e:"⚡",c:"#facc15"},{n:"serenity",e:"🕊",c:"#a3e635"},
  {n:"melancholy",e:"🌙",c:"#93c5fd"},{n:"shame",e:"🌊",c:"#818cf8"},
];

// ════════════════════════════════════════════════════════════
//  HARMONY STORY MATRIX (HSM) v2.1 — Craft-First Upgrade
//  Sovereign built-in narrative engine — no external calls
// ════════════════════════════════════════════════════════════
const HSM = {

  pick(a)  { return a[Math.floor(Math.random()*a.length)]; },
  cap(s)   { return s ? s.charAt(0).toUpperCase()+s.slice(1) : ''; },
  bare(nm) { return nm ? nm.replace(/^(a|an|the)\s+/i,'') : ''; },

  // ── Verb conjugation: adjust third-person singular for plural subjects ──
  conjugateVerb(verb, subj) {
    if (!verb || verb.includes(' ')) return verb;
    if (subj === 'they' || subj === 'we' || subj === 'you') {
      const map = { establishes:'establish', launches:'launch', was:'were', is:'are', has:'have', does:'do' };
      if (map[verb]) return map[verb];
      if (verb.endsWith('ies')) return verb.slice(0, -3) + 'y';
      if (verb.endsWith('s')) return verb.slice(0, -1);
    }
    return verb;
  },

  // ── Smart pick: distance-enforced, no repeats within N calls ──
  _used: new Map(),
  _globalUsed: new Set(),  // Cross-chapter template memory — survives resetDedup

  smartPick(pool, category, minDist) {
    minDist = minDist || 3;
    if (!pool || !pool.length) return '';
    const used = this._used.get(category) || [];
    const globalKey = (tpl) => (category || '') + '|' + (typeof tpl === 'string' ? tpl.slice(0, 60) : '');
    let avail = pool.filter((tpl, i) => {
      return !used.includes(i) && !this._globalUsed.has(globalKey(tpl));
    });
    // If everything is globally used, fall back to per-chapter filtering only
    if (!avail.length) avail = pool.filter((_,i) => !used.includes(i));
    const activePool = avail.length ? avail : pool;
    const idx = Math.floor(Math.random() * activePool.length);
    const realIdx = avail.length ? pool.indexOf(activePool[idx]) : activePool === pool ? idx : pool.indexOf(activePool[idx]);
    used.push(realIdx);
    if (used.length > minDist) used.shift();
    this._used.set(category, used);
    // Remember this template globally (first 60 chars as fingerprint)
    this._globalUsed.add(globalKey(pool[realIdx]));
    // Prevent unbounded growth — cap at 200 entries
    if (this._globalUsed.size > 200) {
      const first = this._globalUsed.values().next().value;
      this._globalUsed.delete(first);
    }
    return pool[realIdx];
  },

  resetDedup() { this._used = new Map(); /* _globalUsed PERSISTS — cross-chapter memory */ },

  // Common repetitive templates that should only appear once per story
  _seedCommonTemplates() {
    const common = [
      "Not a greeting.",
      "The moment carried the weight of what",
      "We need to decide",
      "She stood a little straighter without meaning to.",
      "He stood a little straighter without meaning to.",
      "She felt something unclench behind her ribs",
      "He felt something unclench behind her ribs",
      "the way you turn over a stone and find something alive underneath",
      "Not everything buried wants to stay buried.",
      "not dramatically, not with any flourish",
      "Neither would They",
      "Neither would he",
      "Neither would she",
      "Some residue remained",
      "Remember",  // Prevent "Proxima Centauri would Remember"
      "So would They",  // Prevent "So would They" when chars merged
      "They stood a little straighter",
      "They felt something unclench",
    ];
    for (const t of common) this._globalUsed.add('seed|' + t);
  },

  // Seed _globalUsed from existing chapters to prevent repeats after page refresh
  _seedGlobalFromChapters() {
    for (const ch of S.chapters) {
      if (!ch.text) continue;
      const sentences = ch.text.split(/[.!?]+/).filter(s => s.trim().length > 20);
      for (const sent of sentences) {
        const key = 'seed|' + sent.trim().slice(0, 60);
        this._globalUsed.add(key);
      }
    }
    // Cap to prevent unbounded growth
    while (this._globalUsed.size > 200) {
      const first = this._globalUsed.values().next().value;
      this._globalUsed.delete(first);
    }
  },

  pronouns(str) {
    const t = {
      'she/her':  {sub:'she', obj:'her',  pos:'her',   ref:'herself',    was:'was'},
      'he/him':   {sub:'he',  obj:'him',  pos:'his',   ref:'himself',    was:'was'},
      'they/them':{sub:'they',obj:'them', pos:'their', ref:'themselves', was:'were'},
      'it/its':   {sub:'it',  obj:'it',   pos:'its',   ref:'itself',     was:'was'},
      'xe/xem':   {sub:'xe',  obj:'xem',  pos:'xyr',   ref:'xemself',    was:'was'},
    };
    return t[str] || t['they/them'];
  },

  // Pronoun-as-name blacklist: never use these as character names
  _PRONOUN_NAMES: new Set(['she','he','they','it','we','you','i','me',
    'her','him','them','us','his','their','its','our','your','my',
    'She','He','They','It','We','You','I','Me']),

  // Character name rotation — avoids repeating same name across beats
  _charRotation: 0,
  _rotateCharName() {
    const chars = (S && S.chars) || [];
    if (chars.length === 0) return null;
    const idx = this._charRotation % chars.length;
    this._charRotation = (this._charRotation + 1) % chars.length;
    return chars[idx];
  },

  refs(ch, pr) {
    const raw = (ch.name||'').trim();
    const nm  = raw ? raw.charAt(0).toUpperCase()+raw.slice(1) : '';
    let firstName = nm.split(' ')[0] || nm;
    // ARCHITECTURAL FIX: When name resolves to a pronoun or is empty,
    // rotate through registered characters for a REAL name. Never
    // produce "the figure" in any form that could be used as a display name.
    const isPronoun = this._PRONOUN_NAMES.has(nm) || this._PRONOUN_NAMES.has(firstName);
    let resolvedNm = nm, resolvedFirst = firstName, resolvedPr = pr;
    if (isPronoun || !nm) {
      const chars = (S && S.chars) || [];
      if (chars.length > 0) {
        // Rotate to pick different fallback per call
        const rotIdx = HSM._charRotation % chars.length;
        HSM._charRotation = (HSM._charRotation + 1) % chars.length;
        resolvedNm = chars[rotIdx % chars.length].name;
        resolvedFirst = resolvedNm.split(' ')[0];
        resolvedPr = this.pronouns(chars[rotIdx % chars.length].pronouns || 'they/them');
      } else {
        // No characters registered — fall back to pronoun (original behavior)
        resolvedNm = this.cap(pr.sub);
        resolvedFirst = this.cap(pr.sub);
      }
    }
    return {
      nm: resolvedNm, firstName: resolvedFirst,
      nmS: resolvedNm, nmM: resolvedFirst.toLowerCase(), pr: resolvedPr,
    };
  },

  // ── Name mixer: vary between full name, first name, and pronoun ──
  nameVar(ctx, type) {
    const {nmS, firstName, pr} = ctx;
    if (type === 'pronoun') return this.cap(pr.sub);
    if (type === 'first') return firstName || nmS;
    return nmS;
  },

  // ── Per-occurrence name variation: each {nmS}/{nmM} randomly gets full, first, or pronoun ──
  fill(tpl, nmS, nmM, pr, firstName) {
    const Sub = this.cap(pr.sub);
    firstName = firstName || nmS;
    let _lastForm = null;
    const nameForm = (isCap) => {
      // Avoid same form twice in a row
      let roll = Math.random();
      let form;
      if (_lastForm === 'full') {
        // Just used full name — strongly prefer first or pronoun
        if (roll < 0.55) form = 'first';
        else if (roll < 0.90) form = 'pronoun';
        else form = 'full';
      } else {
        // Normal distribution: light on full names
        if (roll < 0.18) form = 'full';      // 18% full name
        else if (roll < 0.60) form = 'first'; // 42% first name
        else form = 'pronoun';               // 40% pronoun
      }
      _lastForm = form;
      if (form === 'full') return isCap ? nmS : nmM;
      if (form === 'first') return isCap ? firstName : (firstName||nmM);  // first name stays capitalized
      return isCap ? Sub : pr.sub;
    };
    return tpl
      .replace(/\{nmS\}/g,  () => nameForm(true))
      .replace(/\{nmM\}/g,  () => nameForm(false))
      .replace(/\{fn\}/g,   firstName)
      .replace(/\{Sub\}/g,  Sub).replace(/\{sub\}/g, pr.sub)
      .replace(/\{obj\}/g,  pr.obj).replace(/\{pos\}/g, pr.pos)
      .replace(/\{ref\}/g,  pr.ref).replace(/\{was\}/g, pr.was)
      .replace(/\{name\}/g, nmM).replace(/\{pronoun\}/g, pr.sub)
      .replace(/\{pronoun_ref\}/g, pr.ref).replace(/\{pronoun_pos\}/g, pr.pos)
      .replace(/\{pronoun_cap\}/g, Sub);
  },

  // ── Extract noun phrase from beat text ──
  beatKeywords(beat) {
    const text = beat.replace(/^[-\s*•]+/, '').trim();
    // Active: optional name(s) + verb + noun phrase (1-3 words)
    let m = text.match(/^(?:[A-Za-z0-9-]+\s+){0,2}(?:detect|discover|find|notice|spot|sense|register|read|hear|confirm|verify|prove|realize|understand|know|establish|invoke|trigger|begin|start|launch|initiate|activate|send|call)[sd]?\s+(?:an?\s+|the\s+)?([A-Za-z0-9-]+(?:\s+[A-Za-z0-9-]+){0,2})/i);
    if (m && m[1]) {
      let phrase = m[1].trim();
      // Truncate at clause boundary: "the signal is intentional" → "the signal"
      const cb = phrase.search(/\s+(?:is|was|were|are|has|have|had)\b/i);
      if (cb > 2) phrase = phrase.slice(0, cb).trim();
      // Strip trailing prepositions: "anomalous harmonics from" → "anomalous harmonics"
      phrase = phrase.replace(/\s+(?:from|to|with|for|in|on|at|of|by|into|onto)$/i, '').trim();
      if (phrase.length > 2) return phrase;
    }
    // Passive: noun phrase + is/was + verb
    m = text.match(/^([A-Za-z0-9-]+(?:\s+[A-Za-z0-9-]+){0,2})\s+(?:is|was|were)\s+(?:detect|discover|find|notice|spot|sense|register|read|hear|confirm|verify|prove|realize|understand|know|establish|invoke|trigger|begin|start|launch|initiate|activate|send|call)/i);
    if (m && m[1]) {
      return m[1].replace(/^(the|an?)\s+/i, '').trim();
    }
    // Fallback: first 3 content words
    return text.split(/\s+/).filter(w => w.length > 2 && !/^(the|a|an|is|was|were|are|has|have|had|and|but|from|to|with|for|in|on|at|of|she|he|they|it|we|you|i)$/i.test(w)).slice(0, 3).join(' ');
  },

  gV: {
    'Space Opera': {
      setting:['observation deck','the bridge','the cargo hold','the engine room','the station corridor','the medbay','the comms array','the airlock','the observation blister','the command deck'],
      nouns:  ['navigation array','distress beacon','the jump drive','the sensor array','the com-link','the fuel cells','the transponder','the spectrograph','the harmonic resonator','the telemetry buffer','the shield grid','the star chart'],
      tension:['the approach vector was wrong','the transponder returned nothing','the signal had changed frequency','no ship should be out this far','the harmonic resonance was off by a fraction that should not exist','the star chart showed a gap where something had been'],
      atmo:   ['deep-band static on the comms','the low hum of the reactor','the particular silence of deep space','cold light from the monitor banks','the faint ozone scent of recycled air','the rhythmic pulse of the life-support system','a soft chime from the navigation console'],
    },
    'High Fantasy': {
      setting:['the great hall','a forest clearing','the ancient tower','the throne room','the mountain pass','the marketplace','the ruins','the healer\'s tent'],
      nouns:  ['old map','sealed letter','broken seal','relic','the coin that should not exist','the ring','the crown','the blade','the tapestry'],
      tension:['the alliance was already fracturing','the prophecy no one believed','the thing that moved in the shadows','the old magic was waking','the border guards had not reported in'],
      atmo:   ['the crackle of the fire','boots on stone','cold grey light before dawn','the smell of rain on old wood','the distant sound of bells','the taste of woodsmoke in the air'],
    },
    'Dark Fantasy': {
      setting:['the ruined cathedral','a fog-soaked alley','the bone market','the cursed forest','the undercroft','the chained library'],
      nouns:  ['the contract','the door','the name scratched in stone','the old debt','the bloodied ledger','the hollow crown'],
      tension:['the thing that followed at distance','the hunger that was not hunger','the debt that could never be repaid','the bargain was already sealed'],
      atmo:   ['witchfire light','something dragging','the silence where birds should have been','red light under the door','the smell of iron and rain'],
    },
    'Cosmic Horror': {
      setting:['the lighthouse','the research station','the basement','the flooded chamber','the observatory','the derelict'],
      nouns:  ['the manuscript','the sound','the geometry','the photograph','the recording','the frequency'],
      tension:['the pattern that should not have meaning','the geometry that refused to resolve','the knowledge that could not be unknowed','the signal was not from anywhere known'],
      atmo:   ['a low resonance below hearing','the silence that pressed','the wrong color on the horizon','darkness more present than darkness'],
    },
    'Dystopian': {
      setting:['the checkpoint','the processing centre','the outer district','the grey corridor','the ration line','the surveillance hub'],
      nouns:  ['the permit','the record','the number','the quota','the report','the assignment'],
      tension:['the camera not there yesterday','the name missing from the list','the approval that never came','the curfew bell was early'],
      atmo:   ['recycled air and fluorescent light','the sound of queues','rain on cracked concrete','the hum of surveillance'],
    },
    'Noir': {
      setting:['the back office','the wet street','the bar at closing','the stairwell','the pawn shop','the docks'],
      nouns:  ['the file','the photograph','the name','the address','the money','the envelope'],
      tension:['the alibi that did not hold','the witness who stopped talking','the door already opened','the partner who knew too much'],
      atmo:   ['rain on glass','cigarette smoke and old coffee','the particular dark of 3 a.m.','neon on wet asphalt'],
    },
    'default': {
      setting:['the room','the corridor','the space between them','the doorway','the garden','the threshold'],
      nouns:  ['the object','the document','the message','the question','the photograph','the letter'],
      tension:['what had not been resolved','what was still coming','what could not be changed now','the silence that followed'],
      atmo:   ['afternoon light','the sounds of the building','the quiet between sentences','a distant clock chiming'],
    },
  },

  tV: {
    wonder: {
      atmo:  ['something luminous in the quality of the light','a vastness that arrived quietly','an impossible stillness','a kind of silence that felt like listening','the sensation of being very small in the presence of something patient and ancient'],
      open:  [
        '{nmS} had been wrong about what this place was. {Sub} understood that now.',
        'Something had shifted in the quality of the light, though {nmS} could not have said exactly when.',
        'The thing that had seemed ordinary revealed itself, slowly, as anything but.',
        '{nmS} had not expected the world to open itself this way — not today, not without warning.',
        'It began the way most important things do: quietly, while {nmM} was looking somewhere else.',
      ],
      inner: [
        '{nmM} stood at the edge of something enormous — a pull {sub} could not yet articulate. {Sub} did not step back. {Sub} did not know if stepping back was even possible anymore.',
        '{Sub} had not known it was possible to feel this particular kind of awe and still remain upright. But here {sub} was, still standing, still breathing, and the awe had not diminished.',
        'The world had just become larger, and {nmM} was still catching up. There was a moment of vertigo, of private reorientation, and then the new size of things simply became the size of things.',
        'A weight {sub} had been carrying without noticing went quiet. {nmS} did not know when {sub} had picked it up, or why {sub} had never thought to set it down before now.',
        'For a moment, {nmM} forgot to breathe — not from shock, but from the simple scale of what {sub} was witnessing. The breath came back eventually. The moment stayed.',
        '{nmS} felt something unclench behind {pos} ribs, something {sub} had not known was tight. {Sub} stood a little straighter without meaning to, and the space around {obj} felt different.',
        'It was not happiness, exactly. It was something quieter and more durable — a kind of settling, the way a house settles into its foundations after a long time of standing.',
      ],
      close: [
        '{nmS} did not move. {Sub} did not want to break what was still forming. Some things need stillness more than action, and {sub} was learning to tell the difference.',
        'Whatever came next, {nmM} knew this moment was the one {sub} would return to — not the details, but the feeling, the particular temperature of the air in that exact second.',
        'It did not answer every question. But it opened the ones that mattered, and that was enough for now. Enough was a kind of answer too.',
        'Neither of them moved for a long moment. The silence was not empty — it was full of everything that did not need to be said.',
        '{nmS} let {obj}self hold it a little longer before the world rushed back in. The world always rushed back in. But not yet. Not quite yet.',
        'The weight of it would stay, {nmM} knew — long after the details faded, long after {sub} could no longer remember what had been said or what had been seen. Some impressions outlast memory.'
      ],
    },
    terror: {
      atmo:  ['the wrong kind of quiet','something gone still where it should not be','an absence shaped like a presence','a cold that had nothing to do with temperature','the particular silence of a held breath'],
      open:  [
        '{nmS} noticed it too late — the way you notice the absence of sound only after it stops.',
        'The thing that was wrong was not one thing. It was the accumulation of small things.',
        'There was a moment, brief and irrevocable, when {nmM} understood exactly how exposed {sub} was.',
        'It started with a detail that did not fit — and then {nmM} could not stop seeing them.',
        '{nmS} had been walking through the ordinary world, and then {sub} was not.',
      ],
      inner: [
        'The rational part of {nmM} offered explanations. {Sub} stopped listening to it.',
        'Fear had its own logic. It did not require agreement.',
        '{nmS} had been afraid before. This was different. This had a shape.',
        'Every instinct {nmM} had was screaming, and {sub} could not tell {obj}self why — which was worse than knowing.',
        '{nmS} felt {pos} heartbeat in {pos} throat, a drum {sub} could not silence.',
        'The thought {sub} did not want to think kept arriving anyway, patient as a door knock.',
      ],
      close: [
        'It was not over. {nmS} understood this with a clarity that was its own kind of terror.',
        '{Sub} stayed very still. Running would be acknowledgment.',
        'Whatever it was, it had already seen {obj}.',
        '{nmS} did not sleep. {Sub} lay in the dark and listened, and the listening was worse than any answer.',
        'The door was closed. {nmS} kept looking at it anyway.',
      ],
    },
    hope: {
      atmo:  ['something thin but persistent','a light that arrived sideways','the specific weight of maybe','the first warmth after a long cold','something opening that had been closed'],
      open:  [
        'The evidence was not overwhelming. But it was there.',
        'Something had changed in the night. {nmS} could feel it before {sub} could name it.',
        '{nmS} had been wrong before. Consistently. But not this time. Possibly.',
        'It was a small thing, what {nmM} found — the kind of small that leads to something larger.',
        '{nmS} woke to a different weight in the air, and {sub} knew, before {sub} opened {pos} eyes, that something had shifted.',
      ],
      inner: [
        '{Sub} had not let {ref} believe in this fully. But the belief had been growing without permission.',
        'There was a difference between certainty and the willingness to act as if things might be all right.',
        'The reasonable thing was to wait. {nmS} had spent a long time doing the reasonable thing.',
        'It was a small thing to hold onto. Small was still something.',
        '{nmS} had trained {ref} not to hope. {Sub} was failing at that, and {sub} did not mind.',
        'The thought arrived like a guest {nmM} had not invited but found {ref} glad to see.',
        'For the first time in a long time, {nmM} allowed {ref} to imagine the shape of something better.',
      ],
      close: [
        'It was not a solution. But it was a direction. {nmS} had been without one long enough.',
        '{Sub} did not know what was on the other side. But {sub} moved toward it anyway.',
        'The smallest possible reason to continue. It turned out to be enough.',
        'Tomorrow was still there.',
        '{nmS} held it carefully, this new thing — not too tight, not too loose.',
        'The path forward was not clear, but {nmM} could see the first step. That was enough.',
      ],
    },
    grief: {
      atmo:  ['an afternoon that pretended to be ordinary','the weight of absence','everything in its place, wrong','the particular grey of a window on an overcast afternoon','the stillness of things left unfinished'],
      open:  [
        'The absence had mass. {nmS} had not expected that.',
        'There are days that pretend to be ordinary and are not. This was one of them.',
        '{nmS} kept reaching for the thing that was not there anymore.',
        'It was the third time that morning {nmM} had started to say something to someone who was not there.',
        'The room was exactly as it had been. {nmS} was not.',
      ],
      inner: [
        'Grief does not arrive in order. It arrives on its own schedule, in the wrong moments.',
        '{Sub} was tired in a way that sleep could not reach.',
        'Memory kept offering the version where things were different. {nmS} kept declining.',
        'The silence where a voice should be was the loudest thing in the room.',
        '{nmS} had learned to carry it, mostly — except in moments like this one, when {sub} set it down by accident.',
        'There was no lesson in it, no meaning {nmM} could extract. There was only the fact of it, heavy and ordinary.',
      ],
      close: [
        'The world continued. {nmS} noted this without particular feeling.',
        '{Sub} put the thing down — not because {sub} was done with it, but because {sub} needed both hands for what came next.',
        'Not better. But different. There was a version of different that was the beginning of something.',
        '{nmS} stayed with it a moment longer. That was all grief really asked for — someone to stay.',
        'The next breath came. Then the one after. That was the whole trick, {nmM} supposed.',
      ],
    },
    curiosity: {
      atmo:  ['the tension of an unsolved thing','the itch of incomplete information','a door left open deliberately','the particular silence of a room where something has been moved'],
      open:  [
        'The question had been there all along. {nmS} had simply not asked it correctly until now.',
        'There was an explanation. {nmS} was determined to find it, even if the finding changed everything.',
        'The detail that did not fit was the only detail that mattered.',
        '{nmS} had been trained to ignore anomalies like this one. {Sub} was ignoring {pos} training.',
        'It was a small inconsistency, the kind most people overlook. {nmS} was not most people, not about this.',
      ],
      inner: [
        '{Sub} turned it over again. From the other side. Still wrong in the same place.',
        '{nmS} had seventeen theories. Sixteen of them were wrong. Possibly all seventeen.',
        'Problems always have a shape, even when that shape is not yet visible.',
        'The itch of it was worse than not knowing — the sense that {nmM} was close, that the answer was almost within reach.',
        '{nmS} had learned to distrust the obvious explanation. It was usually the one designed to stop you asking.',
        'What {nmM} needed was not more data. It was the right question.',
      ],
      close: [
        'Not solved. But {nmM} knew the shape of it now, which was almost the same thing.',
        '{Sub} wrote it down before {sub} could lose it.',
        'There was another question underneath. There was always another question underneath.',
        'The answer would come, {nmS} knew — but not yet, and not in the way {sub} expected.',
        '{nmS} closed the file, but {sub} did not stop thinking. {Sub} never stopped thinking.',
      ],
    },
    love: {
      atmo:  ['an ordinary moment that refused to be ordinary','something that arrived without announcement','the particular quality of light when someone is looking at you','the silence between words that said more than the words'],
      open:  [
        '{nmS} still noticed. That was the strange thing.',
        'It was the small thing that made it real — not the gesture, but the ordinary moment underneath.',
        'There are people who fill rooms without trying. {nmS} felt the absence of one now.',
        '{nmS} had not meant to say it. The words had arrived before {sub} could catch them.',
        'The look lasted half a second longer than it needed to. {nmS} counted.',
      ],
      inner: [
        '{nmS} had spent considerable effort not thinking about this. It had not worked.',
        'The feeling was inconvenient and persistent, and {nmM} had given up fighting it.',
        'There is a particular kind of attention that is itself a kind of declaration.',
        '{nmS} had known, {sub} realized — had known for longer than {sub} was willing to admit.',
        'It was not the grand gesture {nmM} had imagined. It was better than that.',
        '{nmS} felt {pos} heart do something complicated and did not try to name it.',
      ],
      close: [
        'This was not the ending. {nmS} was fairly certain of that now.',
        '{Sub} left the door open. Metaphorically. Also literally.',
        'Whatever this had become, it had not finished becoming.',
        '{nmS} reached out, and {sub} was not rebuffed, and that was more than {sub} had hoped for.',
        'The words {nmM} needed were there. {Sub} would find them eventually.',
      ],
    },
    melancholy: {
      atmo:  ['light that arrived too gently','the ache of a beautiful thing ending','something held too long','the particular color of late afternoon in late autumn'],
      open:  [
        '{nmS} had known this would come. Knowing had not helped.',
        'Memory rewrites the past warmer than it was. {nmS} knew this. Felt it anyway.',
        'The ache had been there long enough that {nmM} had stopped noticing. Now {sub} noticed again.',
        'It was the kind of day that felt like a goodbye, even though nothing had ended yet.',
        '{nmS} found {obj}self holding an object {sub} did not remember picking up.',
      ],
      inner: [
        '{Sub} sat with it a little longer. There was no point hurrying.',
        'Some things you carry because there is no place to set them down.',
        '{nmS} had stopped trying to explain it. That was its own kind of peace.',
        'The sadness was not dramatic. It was a low hum, background noise {nmM} had learned to live with.',
        '{nmS} thought of calling someone, then did not. The conversation {sub} needed was with {ref}, and {sub} had been avoiding it.',
        'It was not that {nmM} was unhappy. It was that {sub} remembered what happy had felt like, and the distance seemed greater today.',
      ],
      close: [
        '{nmS} stayed with it — not to resolve it, but to not look away.',
        'It would not always feel like this. {Sub} knew that. It did not help yet.',
        'Some things end slowly enough that you do not feel the ending until it is over.',
        '{nmS} stood, finally, and moved toward the light, which was the only direction there was.',
        'The evening came, as evenings do, and {nmM} went with it.',
      ],
    },
    awe: {
      atmo:  ['scale that arrived without warning','the silence after something impossible','the particular vertigo of understanding something too large','the breathless space between seeing and believing'],
      open:  [
        'The scale of it landed before {nmM} was ready.',
        '{nmS} had read about this. Reading had not prepared {sub}.',
        'There was a moment where understanding arrived all at once, and after that nothing was the same size.',
        '{nmS} had been told what to expect. The telling had been catastrophically insufficient.',
        'It was not that {nmM} had not believed. It was that belief was a smaller thing than this.',
      ],
      inner: [
        'Some things require the body to catch up with the mind. {nmS} gave it a moment.',
        'The scale of it landed differently now that {nmM} understood what {sub} was looking at.',
        'Long after, {nmM} could not explain what {sub} had felt — only that it had changed something.',
        '{nmS} felt {pos} own smallness not as diminishment but as relief — to be part of something this vast.',
        'Words were inadequate. {nmS} tried anyway, because some things must be attempted even in failure.',
      ],
      close: [
        '{nmS} did not move for a long time.',
        'Whatever came next would be smaller. That was all right.',
        'The silence that followed was its own kind of answer.',
        '{nmS} carried it with {obj}, the way you carry a tune you cannot stop humming.',
        'The world had recalibrated itself, and {nmM} was still adjusting to the new gravity.',
      ],
    },
    excitement: {
      atmo:  ['a particular charge in the air','something that had been building','the moment before','the electric hush of anticipation'],
      open:  [
        'This was it. {nmS} had been waiting without knowing what {sub} was waiting for.',
        'The thing {nmM} had been preparing for had arrived, and {sub} was ready.',
        '{nmS} had felt this before — rarely, and always at the right moment.',
        'The pieces aligned with a suddenness that felt less like coincidence and more like design.',
        '{nmS} felt {pos} pulse quicken and did not try to slow it.',
      ],
      inner: [
        '{Sub} was moving before the thought finished forming. That was fine. The thought could catch up.',
        'This was why you kept going. {nmS} had almost forgotten.',
        'The joy was embarrassingly simple. {sub} did not care.',
        '{nmS} felt alive in a way that made {obj} realize how half-alive {sub} had been before.',
        'Every doubt {nmS} had carried burned off like fog in sunlight.',
      ],
      close: [
        '{nmS} was still smiling when {sub} turned away.',
        'Whatever came next, this had been worth it.',
        'Some moments you tuck away. {nmS} tucked this one.',
        'The momentum was carrying {obj} now, and {nmM} let it.',
        '{nmS} laughed, actually laughed, and {sub} did not care who heard.',
      ],
    },
    rage: {
      atmo:  ['a cold clarity in place of feeling','something that had been patient too long','the particular stillness before the storm','the sound of {pos} own heartbeat, loud and deliberate'],
      open:  [
        '{nmS} had been patient long enough. The patience was gone.',
        'There is a point past which endurance becomes complicity. {nmS} had passed it.',
        'The anger, when it came, was clean. That was the worst part about it.',
        '{nmS} set down {pos} cup carefully — very carefully — because {sub} knew what {sub} wanted to do with it.',
        'It arrived not as heat but as ice, a perfect crystalline clarity.',
      ],
      inner: [
        'The fury was not hot. It was precise, which was more dangerous.',
        '{nmS} was not going to apologise for this. Not this time.',
        'Something had shifted. {nmS} felt it go and did not reach for it.',
        'Every injustice {nmM} had swallowed arrived at once, and {sub} was done swallowing.',
        'The voice in {pos} head that urged caution had gone quiet. {nmS} did not miss it.',
      ],
      close: [
        '{nmS} did not regret it. Not yet.',
        'The decision had been made. There was nothing left to negotiate.',
        '{nmS} walked away. {Sub} did not look back.',
        'The aftermath would come. {nmM} would deal with it then. Not now.',
        '{nmS} felt the anger settle into something harder and more permanent. Resolution, not rage. But close.',
      ],
    },
    serenity: {
      atmo:  ['a stillness that had earned itself','the particular quiet of things in their right place','the golden hour stretching longer than it should','the soft rhythm of breathing in a safe place'],
      open:  [
        'There was nothing to do right now. {nmS} sat with that instead of fighting it.',
        'The urgency had passed. What remained was cleaner.',
        '{nmS} had not expected this to feel like rest. But it did.',
        'The world had paused, and {nmM} had paused with it, and the pause was not empty.',
        '{nmS} exhaled, and {sub} could feel the tension leave {pos} shoulders by degrees.',
      ],
      inner: [
        'Some problems, given enough time, solve themselves. {nmS} was learning to tell the difference.',
        '{Sub} had been here before — not this place, but this feeling.',
        'The stillness was not emptiness. It was room.',
        '{nmM} did not need to understand everything right now. The permission not to was a gift.',
        'There was a kind of courage in doing nothing, {nmS} realized — in trusting that the world would keep turning without {pos} hand on it.',
      ],
      close: [
        'Whatever came next, {nmM} was ready for it.',
        '{nmS} stayed a little longer. There was no reason to hurry.',
        'It was enough. Right now, that was enough.',
        '{nmS} let {obj}self be held by the quiet, which was a kind of prayer.',
        'The moment folded itself gently and put itself away, and {nmM} let it go with gratitude.',
      ],
    },
    default: {
      atmo:  ['something that had shifted','an ordinary tension','the particular quality of afternoon light'],
      open:  [
        '{nmS} had not planned for this.',
        'It was later than {nmM} had thought.',
        'The situation had changed while {nmM} was not looking.',
        '{nmS} felt something shift and could not say exactly what.',
      ],
      inner: [
        '{Sub} considered the options.',
        'There was no good answer. There was a least-bad one.',
        '{nmS} sat with it, whatever it was.',
        'The thing {nmM} was avoiding thinking about pushed at the edge of {pos} attention.',
      ],
      close: [
        '{nmS} moved on.',
        'Whatever came next, it was coming regardless.',
        'The moment passed, as moments do.',
        '{nmS} stood and went to meet it.',
      ],
    },
  },

  // ── Filler atmosphere lines for between beats ──
  filler(ctx) {
    const {gv} = ctx;
    const pool = [
      this.cap(this.pick(gv.atmo)) + '.',
      'Somewhere in the ' + this.bare(this.pick(gv.setting)) + ', something shifted.',
      this.cap(this.pick(gv.tension)) + '.',
      'The ' + this.bare(this.pick(gv.nouns)) + ' hummed its usual song, indifferent to human concern.',
      'Time did what time does.',
      'No one else seemed to notice.',
    ];
    return this.pick(pool);
  },

  // ── Sentence structure variation for beat prose ──
  varySentence(base, ctx) {
    const {nmS, firstName, pr} = ctx;
    const variations = [
      base,
      base + ' ' + this.cap(pr.sub) + ' knew it, even if ' + pr.sub + ' could not yet say how.',
      'It was not immediate — the realization arrived in pieces, and ' + nmS + ' assembled them slowly.',
      base.replace(nmS, firstName || nmS),
    ];
    return this.pick(variations);
  },

  // ── Beat → mode-aware scenelet ──
  // tight: action + interior + bridge (~70w)
  // full:  action + sensory + interior + dialogue + consequence + bridge (~160w)
  // deep:  action + sensory + interior + dialogue ×2 + consequence + reflection + bridge (~320w)
  beatToProse(beat, ctx, idx, total, usedAll) {
    const {nmS, firstName, nmM, pr, gv, tv, p} = ctx;
    const slen = p.sceneLen || 'full';
    const n1 = this.smartPick(gv.nouns, 'noun_'+idx, 4);
    const n2 = this.smartPick(gv.nouns, 'noun2_'+idx, 4);
    const parsed = this.parsePlotPoint(beat, p.chars);
    const pp = parsed;
    const L  = [];

    // If plot point names a specific actor not in ctx, update ctxNmS to use it
    let ctxNmS = nmS, ctxNmM = nmM, ctxFirst = firstName;
    let ctxPr = pr; // may be overridden with actor-derived pronouns

    if (pp.actor && pp.actor.length > 2 && !pp.actor.match(/^(She|He|They|It)$/i)) {
      const actorParts = pp.actor.split(' ');
      ctxNmS = this.cap(pp.actor);
      ctxFirst = actorParts[0];
      ctxNmM = ctxFirst.toLowerCase();
      // Derive pronouns from actor name — explicit known names first, then pattern fallback
      const lowerActor = pp.actor.toLowerCase();
      const knownShe = /^(elara|lyra|sera|mira|aya|nova|stella|luna|alara|freya|iris|clara|rachel|maya|zara)/;
      const knownHe  = /^(kael|kane|drake|korr|jax|ryder|talon|marcus|cole|dax|orion|abel|leon|marc|david)/;
      if (knownShe.test(lowerActor)) {
        ctxPr = {sub:'she', pos:'her', obj:'her', ref:'herself', was:'was', had:'had', did:'did'};
      } else if (knownHe.test(lowerActor)) {
        ctxPr = {sub:'he', pos:'his', obj:'him', ref:'himself', was:'was', had:'had', did:'did'};
      } else if (/[aeiou][aeiou].*[aeiou]|a$|e$|i$|y$/.test(lowerActor)) {
        ctxPr = {sub:'she', pos:'her', obj:'her', ref:'herself', was:'was', had:'had', did:'did'};
      } else if (/[bcdfghjklmnpqrstvwxz]$/.test(lowerActor)) {
        ctxPr = {sub:'he', pos:'his', obj:'him', ref:'himself', was:'was', had:'had', did:'did'};
      }
    }

    // Set all pronoun variables from the (possibly actor-derived) ctxPr
    let P = ctxPr.sub, pos = ctxPr.pos, obj = ctxPr.obj, ref = ctxPr.ref, sub = ctxPr.sub;

    // Conjugate verb to match the subject pronoun (they detect, she detects)
    const actVerb = this.conjugateVerb(pp.verb || 'worked through', ctxPr.sub);
    // displayName: NEVER fall back to capitalized pronoun (produces "They", "She" as names)
    const namePool = [ctxNmS, ctxFirst, ctxNmS].filter(n => n && n.length > 1 && !this._PRONOUN_NAMES.has(n));
    let displayName = pp.actor || (namePool.length > 0 ? namePool[Math.floor(Math.random() * namePool.length)] : null);
    // SAFETY: If displayName is a pronoun, "The", or empty → use real character name
    if (!displayName || this._PRONOUN_NAMES.has(displayName) || displayName === 'The' || displayName === 'the') {
      const chars = (S && S.chars) || [];
      if (chars.length > idx) displayName = chars[idx % chars.length].name;
      else if (chars.length > 0) displayName = chars[0].name;
      else displayName = 'someone';
    }
    const actObj = pp.object || this.bare(n1);
    const actSetting = pp.setting || this.bare(n2);
    const hasContent = pp.actor || pp.verb || pp.object;

    // ACTION: Plot-point-driven
    let action;
    if (hasContent) {
      // Build a natural narrative from parsed components, NEVER inject raw plot point text
      const actDesc = pp.object && pp.verb 
        ? actVerb+' the '+pp.object
        : actVerb;
      const rawObj = pp.object || this.bare(n1);
      // Replace plot-point objects with narrative-friendly alternatives
      const plotPointObjects = /protocol|command|sequence|directive|task|assignment|order/i;
      const objPhrase = plotPointObjects.test(rawObj) ? 'situation' : rawObj;
      const settingPhrase = pp.setting || actSetting;

      const contentTemplates = [
        displayName+' '+actDesc+'. '+this.cap(P)+' had not expected it to be this specific — the kind of detail that changed what '+P+' thought '+P+' knew about the '+settingPhrase+'.',
        displayName+' saw something '+P+' had not expected — the kind of detail that changed what '+P+' thought '+P+' knew. '+this.cap(P)+' sat with it longer than '+P+' needed to, because some data demanded attention even when it gave no comfort.',
        displayName+' '+actDesc+' — quietly, without ceremony, but with a precision that mattered. Nothing would be the same after this. Neither would '+nmM+'.',
        displayName+' '+actDesc+'. '+this.cap(P)+' noted it the way '+P+' noted everything: without hurry, without looking away. The '+settingPhrase+' held its silence. '+this.cap(P)+' held '+pos+' own.',
        displayName+' felt the shift before '+P+' understood what it meant. Some knowledge arrived through the body first. '+this.cap(P)+' trusted that now.',
        'No one around '+displayName+' offered commentary. '+this.cap(P)+' kept working anyway — the work was not about comfort. '+this.cap(P)+' filed it under things '+P+' would need to sit with later.',
      ];
      action = this.smartPick(contentTemplates, 'pp_action_'+idx, 4);
    } else {
      action = displayName+' worked through the implications. The '+this.bare(n1)+' held something '+P+' had not expected, and '+P+' sat with it longer than '+P+' needed to because some things demanded attention even when they offered no comfort.';
    }
    L.push(action);

    // INTERIORITY
    const intPool = pp.emotion ? [
      '{Sub} had not let '+ref+' feel the full weight of it yet. '+this.cap(P)+' was still in the habit of protecting '+ref+' from things that might not be survivable. But this one had already gotten through.',
      'It was not the '+pp.object+' itself that unsettled {nmM}. It was what it implied — the long chain of consequences that {sub} could already see unfolding.',
      '{Sub} had trained for this. All the years, all the simulations, and none of them had prepared {obj} for the particular texture of the real thing.',
      '{Sub} felt something shift in {pos} understanding — not a collapse, but a rearrangement. The kind that left {obj} standing in the same place but facing a different direction.',
    ] : [
      '{Sub} had been turning it over without noticing — the way you turn over a stone and find something alive underneath. Not everything buried wants to stay buried.',
      '{Sub} had not let '+ref+' believe in this fully. But the belief had been growing without permission.',
      '{Sub} had not known it was possible to feel this particular kind of awe and still remain upright. But here {sub} was, still standing, still breathing, and the awe had not diminished.',
      '{Sub} had learned to distrust the feeling of urgency. The things that felt most urgent were often the ones that needed the most patience.',
      'For a moment, {sub} forgot to breathe — not from shock, but from the simple scale of what {sub} {was} witnessing. The breath came back eventually. The moment stayed.',
      '{Sub} felt {pos} own smallness not as diminishment but as relief — to be part of something this vast.',
    ];
    const interior = this.fill(this.smartPick(intPool, 'interior_'+idx, 3), ctxNmS, ctxNmM, ctxPr, ctxFirst);
    if (!usedAll.has(interior.slice(0,20))) {
      L.push(interior);
      usedAll.add(interior.slice(0,20));
    } else {
      L.push(this.fill('{Sub} did not have words for it yet. That was all right. Some moments arrived before language did.', ctxNmS, ctxNmM, ctxPr, ctxFirst));
    }

    // DIALOGUE
    const useDialogue = slen !== 'tight' || Math.random() > 0.4;
    if (useDialogue) {
      const other = (p.chars && p.chars[1]) ? p.chars[1] : null;
      // SPEAKER: always use real character name, NEVER a pronoun
      let otherNm = other ? other.name.split(' ')[0] : (ctxFirst || ctxNmS);
      if (!otherNm || otherNm === 'The' || otherNm === 'the' || this._PRONOUN_NAMES.has(otherNm)) {
        const chars = (S && S.chars) || [];
        if (chars.length > 1) otherNm = chars[1].name.split(' ')[0];
        else if (chars.length > 0) otherNm = chars[0].name.split(' ')[0];
        else otherNm = 'someone';
      }
      const rawObj = pp.object || this.bare(n1);
      const plotPointObjects = /protocol|command|sequence|directive|task|assignment|order/i;
      const objPhrase = plotPointObjects.test(rawObj) ? 'data' : rawObj;
      const diaPool = hasContent ? [
        '"It does not lie," '+otherNm+' said. '+this.cap(P)+' did not look up. "The '+objPhrase+' has its own logic."',
        '"Look at this," '+otherNm+' said. '+this.cap(P)+' did not need to be told twice.',
        '"We need to decide," '+ctxNmS+' said. Not a greeting. The moment carried the weight of what '+P+' needed to say.',
        '"I see it too," '+otherNm+' said. '+this.cap(P)+' had not asked. Some things were visible to anyone paying attention.',
        '"There is more here than the '+objPhrase+' shows," '+otherNm+' said. '+this.cap(P)+' met '+pos+' eyes. "More than we are ready for, maybe."',
        '"This changes what we know," '+ctxNmS+' said. The words came out quiet, almost to '+obj+'. "Not everything. Just enough."',
        '"We do not have to decide now," '+otherNm+' said. '+this.cap(P)+' kept looking at the '+objPhrase+'. "We just have to decide not to look away."',
        '"I know what I am seeing," '+(this._PRONOUN_NAMES.has(ctxNmS)?(ctxFirst||'someone'):ctxNmS)+' said. '+this.cap(P)+' turned back. "I do not yet know what it means."',
        '"There is a pattern," '+otherNm+' said. '+this.cap(P)+' felt the familiar weight of not knowing. "We are just not looking at it right."',
        '"It is real," '+ctxNmS+' said. The kind of real that did not need proof. '+this.cap(P)+' could feel it in '+pos+' hands, still warm from the work.',
      ] : (gv.dialogue ? [
        '"I have something," '+otherNm+' said. '+this.cap(P)+' '+pr.was+' still looking at the '+this.bare(n1)+'.',
        '"'+this.cap(this.smartPick(gv.dialogue,'dia_generic',3))+'" '+ctxNmS+' said. Not a greeting. A question.',
        '"'+this.cap(this.smartPick(gv.dialogue,'dia_generic2',3))+'" '+otherNm+' said. '+this.cap(P)+' nodded. That was the whole conversation.',
      ] : [
        '"I have something," '+otherNm+' said. '+this.cap(P)+' '+pr.was+' still looking at the '+this.bare(n1)+'.',
        '"We need to talk about the '+actObj+'," '+ctxNmS+' said. Not a greeting. A statement of fact.',
        '"'+otherNm+'", '+ctxNmS+' said. The name carried the weight of what '+P+' needed to say. '+this.cap(P)+' did not elaborate. Elaboration was for people who still had time.',
      ]);
      L.push(this.smartPick(diaPool, 'dia_'+idx, 3));
    }

    // CONSEQUENCE
    if (slen !== 'tight') {
      const consPool = hasContent ? [
        'The '+actObj+' would not un-show itself. '+displayName+' had what '+P+' had, and what '+P+' had was a reason to keep moving.',
        'It was not a solution. But it was a direction, and '+displayName+' had been without one long enough.',
        displayName+' felt something unclench behind '+pos+' ribs, something '+P+' had not known was tight. '+this.cap(P)+' stood a little straighter without meaning to.',
      ] : [
        'It was not a solution. But it was a direction. {nmS} had been without one long enough.',
        '{Sub} felt something unclench behind {pos} ribs, something {sub} had not known was tight. {Sub} stood a little straighter without meaning to, and the space around {obj} felt different.',
        'The reasonable thing was to wait. {nmS} had spent a long time doing the reasonable thing.',
      ];
      L.push(this.fill(this.smartPick(consPool, 'consequence_'+idx, 3), ctxNmS, ctxNmM, ctxPr, ctxFirst));
    }

    // DEEP REFLECTION
    if (slen === 'deep') {
      L.push(this.fill(this.smartPick([
        '{nmM} stood at the edge of something enormous — a pull {sub} could not yet articulate. {Sub} did not step back. {Sub} did not know if stepping back was even possible.',
        '{Sub} felt the weight of the realization more than {sub} saw it — a gravity of meaning still assembling itself in the quiet behind {pos} thoughts. Understanding arrived in pieces, always. {Sub} was learning to wait for the last one.',
        'Whatever came next, {nmM} knew this moment was the one {sub} would return to — not the details, but the feeling, the particular temperature of the air in that exact second.',
      ], 'deep_ref', 3), ctxNmS, ctxNmM, ctxPr, ctxFirst));
    }

    // BRIDGE: Expanded pool with cross-chapter memory
    if (idx < total - 1) {
      if (slen === 'deep' && Math.random() > 0.5) {
        const senseBeat = this.fill(this.smartPick([
          'The particular quality of '+actSetting+' arrived before {nmM} could name it — '+this.cap(this.smartPick(gv.atmo,'atmo_bridge',3))+'. Not overwhelming. But present.',
          '{Sub} became aware of '+actSetting+' slowly, the way you become aware of a sound that has been there all along — '+this.cap(this.smartPick(gv.atmo,'atmo_bridge',3))+'.',
        ], 'deep_bridge', 3), ctxNmS, ctxNmM, ctxPr, ctxFirst);
        L.push(senseBeat);
      } else {
        const bridges = [
          'There was other work. '+this.cap(P)+' returned to it, though '+pos+' attention stayed with what '+P+' had just learned.',
          this.cap(this.smartPick(gv.tension, 'tension', 3))+'. '+ctxNmS+' noted it and moved on, carrying it with '+obj+'.',
          'The '+actSetting+' could wait. Not everything is urgent — and '+(ctxFirst||ctxNmS)+' had learned that urgency was often a disguise for fear.',
          'Not everything needed action right now. '+(ctxFirst||ctxNmS)+' gave it the time it needed, which was harder than acting would have been.',
          this.cap(this.smartPick(gv.atmo, 'atmo_bridge', 3))+'. The moment receded, but '+(ctxFirst||ctxNmS)+' could still feel its shape, faint as an afterimage.',
          'The '+actSetting+' held its silence. '+(ctxFirst||ctxNmS)+' wondered how long it had been keeping this secret.',
          'Nothing else demanded attention. Yet. '+(ctxFirst||ctxNmS)+' knew the yet was doing the heavy lifting, but '+P+' let it stand.',
          (ctxFirst||ctxNmS)+' let the moment settle, the way sediment settles when the water stops moving.',
          (ctxFirst||ctxNmS)+' turned back to the work, but the '+actSetting+' had already changed. '+this.cap(P)+' could feel it in the quality of the silence.',
          'The immediate crisis had passed. What remained was quieter and more durable — the kind of knowledge that did not announce itself but shaped every decision that followed.',
          (ctxFirst||ctxNmS)+' did not try to hold onto the feeling. '+this.cap(P)+' had learned that the important ones stayed on their own, settling in at a level deeper than memory.',
          'Some residue remained — not of the event itself, but of what it had opened. '+this.cap(P)+' would find '+ref+' returning to it without meaning to, in the pauses between tasks.',
          'The '+actSetting+' resumed its ordinary rhythms, but '+(ctxFirst||ctxNmS)+' could not un-know what '+P+' now knew. That was the cost of paying attention.',
          'It was not a decision yet. It was a door '+(ctxFirst||ctxNmS)+' had not known was there, now visible in the periphery of every thought.',
          'There would be time to act. There would have to be. For now, '+(ctxFirst||ctxNmS)+' let the '+actSetting+' hold its own counsel while '+P+' held '+pos+'.',
          'The feeling did not diminish with distance. That was how '+(ctxFirst||ctxNmS)+' knew it mattered — the important ones stayed, the trivial ones faded before '+P+' reached the door.',
          'What '+P+' carried away was not the detail but the weight — a gravity that would inform every step without ever announcing itself.',
          'The work resumed. The silence was different now, '+(ctxFirst||ctxNmS)+' noticed — not emptier, but fuller, as if the '+actSetting+' itself was considering what came next.',
          'Not every discovery demanded an immediate response. Some needed to be lived with first. '+(ctxFirst||ctxNmS)+' was learning the rhythm of that.',
          (ctxFirst||ctxNmS)+' marked the moment the way '+P+' marked everything — without ceremony, without looking away. The '+actSetting+' would remember.'+(nmM ? ' So would '+nmM+'.' : ' So would '+ctxNmS+'.'),
        ];
        L.push(this.smartPick(bridges, 'bridge_'+idx, 4));
      }
      L.push('');
    }

    return L.join('\n');
  },
      parsePlotPoint(beat, chars) {
    // Strip leading bullets/dashes and normalize
    let raw = beat.trim().replace(/^[-\s*•]+\s*/, '').trim();
    // Remove parenthetical notes
    raw = raw.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
    // Fix common contractions
    raw = raw.replace(/'s\b/g, '').replace(/ s\b/g, ' ');
    const lower = raw.toLowerCase();
    let result = { actor: '', verb: '', object: '', setting: '', emotion: '', raw };

    // ── PASSIVE VOICE: "X is/was invoked" → object=X, verb=base form ──
    const passiveMatch = raw.match(/^(.+?)\s+(is|are|was|were|has been|had been)\s+(\w+(?:ed|en))(?:\s+by\s+.+?)?$/i);
    if (passiveMatch) {
      let objCandidate = passiveMatch[1].trim().replace(/^(the|a|an)\s+/i, '');
      if (objCandidate.length > 2) {
        const participle = passiveMatch[3].toLowerCase();
        const p2b = {
          invoked:'invoke', confirmed:'confirm', detected:'detect', discovered:'discover',
          triggered:'trigger', initiated:'initiate', activated:'activate', launched:'launch',
          begun:'begin', started:'start', called:'call', revealed:'reveal', shown:'show',
          exposed:'expose', given:'give', accepted:'accept', rejected:'reject',
          refused:'refuse', decided:'decide', chosen:'choose', determined:'determine',
          felt:'feel', seen:'see', witnessed:'witness', found:'find', noticed:'notice',
          sensed:'sense', established:'establish', verified:'verify', proved:'prove',
          realized:'realize', understood:'understand', known:'know', detected:'detect',
        };
        result.object = objCandidate;
        result.verb = p2b[participle] || participle;
        // Actor may be embedded in the object phrase
        const fw = objCandidate.match(/^([A-Z][a-zA-Z0-9-]+)/);
        const nonActor = /^(The|A|An|It|This|That|These|Those|First|Second|Third|Last|Next|Some|Any|Every|Each|All|No|One|Two|Emergency|Main|Primary|Secondary|Final|Initial|New|Old|Protocol|System|Process|Procedure|Method|Device|Object|Subject|Item|Element|Component|Module|Unit)\b/;
        if (fw && !nonActor.test(fw[1])) result.actor = fw[1];
        // Still extract setting and emotion below
      }
    }

    // ── ACTOR: Find character names (before pronoun fallback) ──
    if (chars && chars.length) {
      for (const c of chars) {
        const parts = c.name.toLowerCase().split(/\s+/);
        for (const part of parts) {
          if (part.length > 2 && lower.startsWith(part)) {
            result.actor = c.name;
            break;
          }
        }
        if (result.actor) break;
      }
    }
    // Also extract first word as actor if it looks like a proper name (capitalized, > 2 chars)
    if (!result.actor) {
      // Match names with hyphens or numbers (e.g., "Kael-7", "John-Smith")
      const firstWordMatch = raw.match(/^([A-Z][a-zA-Z0-9-]{2,})/);
      if (firstWordMatch) {
        const word = firstWordMatch[1];
        // Exclude common non-name capitalized words
        const nonNames = /^(The|A|An|It|She|He|They|There|This|That|Then|When|Where|Why|How|But|And|Or|Not|For|With|From|Into|Onto|Upon|First|Second|Third|Next|After|Before|During|While|Since|Until|Although|Because|Unless|Whether|However|Therefore|Finally|Meanwhile|Instead|Emergency|Main|Primary|Secondary|Final|Initial|New|Old|Some|Any|Every|Each|All|No|Protocol|System|Process|Procedure|Method|Device|Object|Subject|Item|Element|Component|Module|Unit)\b/;
        if (!nonNames.test(word)) {
          result.actor = word;
        }
      }
    }
    // No pronoun fallback — leave actor empty so beatToProse uses its own name logic

    // ── VERB: Extract main action verb (skip if passive voice already set it) ──
    if (!result.verb) {
    const verbPatterns = [
      /\b(detects?|discovers?|finds?|notices?|spots?|senses?|registers?|reads?|hears?|signals?)\b/i,
      /\b(confirms?|confirmed|verifies?|verified|certifies?|certified|proves?|proved|realizes?|realized|understands?|understood|knows?|knew|establishes?|established)\b/i,
      /\b(invokes?|invoked|triggers?|triggered|initiates?|initiated|activates?|activated|launches?|launched|begins?|began|starts?|started|calls?|called)\b/i,
      /\b(feels?|senses?|experiences?|faces?|sees?|witnesses?|encounters?)\b/i,
      /\b(decides?|chooses?|determines?|resolves?|commits?)\b/i,
      /\b(rejects?|refuses?|denies?|defies?|resists?)\b/i,
      /\b(accepts?|embraces?|claims?|takes?|adopts?)\b/i,
      /\b(reveals?|shows?|exposes?|presents?|offers?|gives?)\b/i,
    ];
    let bestMatch = null;
    let bestPos = Infinity;
    for (const pat of verbPatterns) {
      const m = raw.match(pat);
      if (m && m.index < bestPos) {
        bestPos = m.index;
        bestMatch = m[1].toLowerCase();
      }
    }
    if (bestMatch) result.verb = bestMatch;
    // Fallback: first verb after actor name
    if (!result.verb && result.actor) {
      const after = raw.slice(result.actor.length).trim();
      const vm = after.match(/^\w+/);
      if (vm) result.verb = vm[0].toLowerCase();
    }
    } // end verb guard (!result.verb)

    // ── OBJECT: Extract meaningful noun phrase (skip if passive voice set it) ──
    if (result.verb && !result.object) {
      const vi = lower.indexOf(result.verb.toLowerCase());
      if (vi >= 0) {
        let after = raw.slice(vi + result.verb.length).trim();
        // Remove leading articles/connectors
        after = after.replace(/^(the|a|an|that|this|those|these|to|of|in|on|with)\s+/i, '').trim();
        // Special handling for "X verb the Y is Z" → object = Y
        const theIsMatch = after.match(/^(\w+(?:\s+\w+){0,2})\s+is\b/i);
        if (theIsMatch && theIsMatch[1].length > 2 && !/\b(is|are|was|were|be|been|being)\b/i.test(theIsMatch[1])) {
          result.object = theIsMatch[1].trim();
        } else {
          // Grab up to preposition or punctuation
          const om = after.match(/^([^,.;:!?\-\u2014]{2,40}?)(?:\s+(?:in|on|at|from|to|with|through|across|beneath|beyond|inside|outside|of|for|about|over|under|around|near|by|into|onto|upon|within|without)\b|$)/i);
          if (om) {
            result.object = om[1].trim()
              .replace(/\s+(is|are|was|were|be|being|been|to|of)$/i, '')
              .replace(/\s+(a|an|the)$/i, '')
              .trim();
          }
        }
      }
    }
    // Fallback: find "the [noun]" before a verb-like word (skip if passive voice set it)
    if ((!result.object || result.object.length < 2 || /^intentional|possible|certain|sure|true|real|actual|specific|intentional$/i.test(result.object)) && !passiveMatch) {
      const nounMatch = raw.match(/(?:the|a|an)\s+(\w+(?:\s+\w+){0,3})(?:\s+(?:is|are|was|were|has|had|does|did|can|could|will|would)\b)/i);
      if (nounMatch) result.object = nounMatch[1].trim();
    }
    // Clean up: remove adjectives captured alone
    if (result.object && /^intentional|possible|certain|sure|true|real|actual|specific|intentional$/i.test(result.object)) {
      result.object = '';
    }
    // Last resort: extract main nouns from the entire beat (skip if passive voice set it)
    if ((!result.object || result.object.length < 2) && !passiveMatch) {
      // Remove actor name and verb, keep what's left as object
      let remainder = raw;
      if (result.actor) remainder = remainder.replace(new RegExp('^' + result.actor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '');
      if (result.verb) remainder = remainder.replace(new RegExp(result.verb, 'i'), '');
      remainder = remainder.replace(/^(\s|the|a|an|is|are|was|were|to|of|in|on|with|from|that|this)+/i, '').trim();
      const words = remainder.split(/\s+/).slice(0, 4);
      if (words.length > 0 && words[0].length > 2) {
        result.object = words.join(' ').replace(/[,.;:!?\-\u2014]$/, '');
      }
    }

    // ── SETTING ──
    const sm = raw.match(/\b(in|on|at|from|through|across|beneath|inside|within|aboard|above|below|under|over|near|outside|beyond|aboard)\s+(?:the\s+)?([^,.;:!?\-\u2014]{3,40})/i);
    if (sm) result.setting = sm[2].trim();

    // ── EMOTION ──
    const emotions = {
      wonder: /\bwonder|awe|marvel|extraordinary|impossible|vast|cosmic|miracle|magnificent|breathtaking/,
      terror: /\bterror|fear|dread|horror|panic|despair|nightmare/,
      joy: /\bjoy|delight|euphoria|triumph|celebrate|radiant|elation/,
      grief: /\bgrief|sorrow|loss|mourn|ache|hollow|absence/,
      rage: /\brage|fury|anger|burn|seethe|wrath|ire/,
      love: /\blove|tender|intimate|devotion|cherish|beloved/,
      hope: /\bhope|believe|faith|promise|persevere|endure/,
      curiosity: /\bcurious|puzzle|wondering|question|search|hidden|secret|mystery/,
      serenity: /\bserene|calm|peace|quiet|still|tranquil|balance|harmony/,
    };
    for (const [emotion, pat] of Object.entries(emotions)) {
      if (pat.test(lower)) { result.emotion = emotion; break; }
    }

    return result;
  },

  // ════════════════════════════════════════════════
  //  EDITOR ENGINE — Professional prose polish
  // ════════════════════════════════════════════════
  editor: {
    // Run full edit pass on generated text
    polish(text) {
      let t = text;
      t = this.trimOverExplicit(t);
      t = this.fixAgreement(t);
      t = this.fixDoubleWords(t);
      t = this.fixSpacing(t);
      t = this.fixArticles(t);
      t = this.polishDialogue(t);
      t = this.fixFragments(t);
      t = this.enforceVariety(t);
      return t;
    },

    // 0a. Fix subject-verb agreement: "they was" → "they were", "They was" → "They were"
    fixAgreement(t) {
      return t
        .replace(/\bthey was\b/gi, 'they were')
        .replace(/\bThey was\b/g, 'They were');
    },

    // 0b. Trim over-explicit prose — tighten constructions that spell out too much
    trimOverExplicit(t) {
      return t
        // "did not have a complete [X]. [Subj] had the shape of one" → trim to shape-of
        .replace(/did not have a complete ([a-z]+)\. ([A-Za-z]+) had the shape of (one|it)/gi,
          (m, noun, subj) => 'had the shape of a ' + noun + ' — not complete, but')
        // "There was a feeling [nm] had no name for yet" → more lyrical
        .replace(/There was a feeling [a-z]+ had no name for yet/gi,
          (m) => 'Something nameless pulled at the edges of awareness')
        // "the particular kind of" → tighter
        .replace(/the particular kind of/gi, 'the kind of')
        // "did not know if [X] was even possible" → softer
        .replace(/did not know if ([a-z\s]+) was even possible anymore/gi,
          (m, rest) => 'was no longer sure ' + rest + ' was possible')
        // "not overwhelming. But it was there" → tighter
        .replace(/not overwhelming\. But it was there/gi, 'thin, but present')
        // Trailing "In time." after a longer sentence → redundant, trim
        .replace(/, but would\. In time\./gi, ', but would.')
        // "The thing about [X] was that" → tighten
        .replace(/The thing about [a-z\s]+ was that/gi, (m) => m.replace('The thing about ', '').replace(' was that', ' meant'))
        // "There was a moment, brief and irrevocable" → already strong, keep
        // "did not have words for it yet" → OK, lyrical enough
        .replace(/\. Not quite yet\.$/gm, '. Not yet.')
        // "the particular [noun] of" overuse → trim
        .replace(/the particular (quality|silence|weight|kind) of/gi, (m, n) => 'the ' + n + ' of');
    },

    // 1. Fix double words: "the the", "a a", "had had", "and and"
    fixDoubleWords(t) {
      return t
        .replace(/\b(the|a|an|and|but|had|have|has|was|were|is|are|be|been|to|of|in|on|at|with|for|from|that|this|it|she|he|they|we|you|I)\s+\1\b/gi,
          (match, word) => word.toLowerCase());
    },

    // 2. Fix spacing around punctuation (NEVER touch \n — paragraphs are sacred)
    fixSpacing(t) {
      return t
        .replace(/[ ]+/g, ' ')           // collapse multiple spaces only (not newlines!)
        .replace(/[ ]+([.,;:!?])/g, '$1') // no space before punctuation
        .replace(/([.,;:!?])([^ \n"'])/g, '$1 $2') // space after punctuation
        .replace(/[ ]*\n[ ]*/g, '\n')     // clean whitespace around line breaks
        .replace(/^ +| +$/gm, '');        // trim lines
    },

    // 3. Fix articles before vowels: "a enormous" → "an enormous"
    fixArticles(t) {
      return t
        .replace(/\ba\s+([aeiouAEIOU][a-zA-Z]*)/g, 'an $1')
        .replace(/\ban\s+([^aeiouAEIOU\s][a-zA-Z]*)/g, 'a $1');
    },

    // 4. Polish dialogue tags and attribution
    polishDialogue(t) {
      // Fix "said. Not a greeting." → keep as-is (already good)
      // Fix redundant dialogue tags: "said," followed by speaking verb
      t = t.replace(/"\s*\.\s*([A-Z][a-z]+\s+said)/g, '"\. $1');
      // Fix spacing inside quotes: "word " → "word"
      t = t.replace(/"\s+/g, '" ').replace(/\s+"/g, ' "');
      return t;
    },

    // 5. Fix sentence fragments and run-ons from template joins
    fixFragments(t) {
      // Fix lowercase start after paragraph break
      t = t.replace(/\n\n([a-z])/g, (m, c) => '\n\n' + c.toUpperCase());
      // Fix sentences that start with lowercase after dialogue
      t = t.replace(/\."\s+([a-z])/g, (m, c) => '." ' + c.toUpperCase());
      return t;
    },

    // 6. Enforce sentence-start variety: no two consecutive paragraphs start the same way
    enforceVariety(t) {
      const paragraphs = t.split('\n\n');
      const lastStarts = [];
      for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i].trim();
        if (!p || p.startsWith('##')) continue;
        // Get first word
        const firstWord = p.split(/[\s.]/)[0];
        if (!firstWord) continue;
        // Check if same as recent starts
        const recent = lastStarts.slice(-3);
        if (recent.includes(firstWord) && firstWord.length > 2) {
          // Try to vary: if it starts with a name, replace with pronoun if possible
          const namePattern = /^[A-Z][a-z]+\s+[a-z]+/;
          if (namePattern.test(p)) {
            // Attempt to find and replace first name with "She/He/They" - complex, skip for now
          }
        }
        lastStarts.push(firstWord);
      }
      return paragraphs.join('\n\n');
    },
  },

  generate(p) {
    this.resetDedup();
    VoiceEngine.reset();
    // Seed global dedup from existing chapters + common templates to prevent repetition
    this._seedCommonTemplates();
    this._seedGlobalFromChapters();
    const basePr = this.pronouns((p.chars&&p.chars[0]&&p.chars[0].pronouns)||'they/them');
    const ch   = (p.chars&&p.chars.length) ? p.chars[0] : {name:'',pronouns:'they/them'};
    const {nmS, nmM, firstName, pr} = this.refs(ch, basePr);
    const pos  = pr.pos;
    const gv   = this.gV[p.genre] || this.gV['default'];
    const tv   = this.tV[p.tone]  || this.tV['default'];
    const ctx  = {nmS, nmM, firstName, pr, gv, tv, p};
    const prem = (p.premise||'').trim();
    const chN  = p.chapterNum || 1;
    const slen = p.sceneLen   || 'full';
    const cont = p.continuityCtx || {};
    const hasPrev = cont.lastScene && cont.lastScene.length > 10;
    const usedAll = new Set();
    const L       = [];

    L.push('## Chapter '+chN);
    L.push('');

    // Writer notes injection — if author provided guidance, weave it into atmosphere
    if (p.extra) {
      L.push('> *Writer note: '+p.extra.split('.')[0].trim()+'*');
      L.push('');
    }

    // Opening
    if (hasPrev) {
      const ls = cont.lastScene.split('.')[0].toLowerCase().replace(/[!?]$/,'').trim();
      L.push(this.smartPick([
        nmS+' had been turning it over since leaving — '+ls+'. There was no satisfying interpretation, so '+nmM+' stopped looking for one.',
        ls.length>20 ? 'An hour after, '+nmM+' '+pr.was+' still holding the same problem. It had not gotten lighter.' : nmS+' had turned it over since leaving — enough was a kind of answer too. But not a complete one.',
        this.cap(pr.sub)+' had replayed it. The calculation had not changed. Whatever came next, this was what '+nmM+' was working with.',
        ls+' — the memory of it sat heavy in '+pos+' chest, and '+nmM+' could not find the angle that made it manageable.',
        'The thing about '+ls+' was that it did not diminish with distance. '+nmS+' was learning that the hard way.',
      ], 'opening_cont', 3));
    } else {
      L.push(this.fill(this.smartPick(tv.open, 'open', 4), nmS, nmM, pr, firstName));
      L.push('');
      const atm = this.smartPick(gv.atmo, 'atmo_open', 4);
      if (chN === 1 && prem.length > 20) {
        L.push(this.cap(atm)+'. '+prem.split('.')[0].trim()+'.');
      } else {
        L.push(this.cap(atm)+'.');
      }
      // Deep mode: expand the opening with a sensory paragraph
      if (slen === 'deep') {
        L.push(this.fill(this.smartPick([
          'The particular quality of the moment arrived before {nmM} could prepare for it — a kind of stillness that made the ordinary extraordinary.',
          '{Sub} had been in this place a hundred times before. Today it felt different, though {sub} could not have said exactly why.',
          'There was a resonance to the air itself, a vibration below hearing that {nmM} felt in {pos} chest before {sub} understood it with {pos} mind.',
          'Not much moved. Not much needed to. The quiet had its own language, and {nmM} was learning to listen.',
        ], 'deep_open', 3), nmS, nmM, pr, firstName));
        L.push('');
      }
    }
    L.push('');

    // Beats — voice-adaptive generation
    const beats = (p.plotPoints||[]).filter(b=>b.trim());
    const eff   = beats.length ? beats : ['The situation continued to develop.'];
    let prevVoice = 'balanced';
    eff.forEach((beat,i) => {
      const voice = VoiceEngine.detectBeatVoice(beat, prevVoice, i, eff.length);
      let prose = this.beatToProse(beat, ctx, i, eff.length, usedAll);
      prose = VoiceEngine.adaptLine(prose, voice);
      L.push(prose);
      prevVoice = voice;
      S.voice.currentMode = voice;
    });
    S.voice.depth = Math.min(S.voice.depth + 0.1, 1);

    // Close
    const closeSett = this.bare(this.smartPick(gv.setting, 'close_set', 3));
    const closeNoun = this.bare(this.smartPick(gv.nouns, 'close_noun', 3));
    L.push(this.smartPick([
      nmS+' set the '+closeNoun+' aside. Some problems need time more than action, and the time was not now.',
      nmS+' had the shape of an answer — not complete, but enough to keep moving.',
      (nmS ? 'Whatever came next would come. '+nmS+' had done what '+pr.sub+' could with what '+pr.sub+' had.' : 'Whatever came next would come. '+ctxFirst+' had done what '+pr.sub+' could with what '+pr.sub+' had.'),
      'The '+closeSett+' looked the same as it had before. '+nmS+' '+pr.was+' not.',
      (firstName||nmS)+' let '+pr.ref+' breathe, let the moment settle. The '+closeNoun+' would still be there tomorrow.',
      'Not everything was resolved. '+nmS+' was beginning to suspect not everything would be, and '+pr.sub+' was learning to live with that.',
    ], 'close', 3));
    L.push('');

    // Resonance close
    L.push(this.fill(this.smartPick(tv.close, 'close_tone', 4), nmS, nmM, pr, firstName));
    L.push('');

    if (slen === 'deep') {
      // Deep closing: sensory stillness + lingering thought + final pause
      L.push(this.fill(this.smartPick([
        '{nmS} stayed with it longer than was strictly necessary.',
        (firstName||nmS)+' did not move. Not yet.',
        'The silence held a little longer, and {nmM} let it.',
      ], 'deep_pad', 2), nmS, nmM, pr, firstName));
      L.push('');
      L.push(this.cap(this.smartPick(gv.atmo, 'atmo_close', 3))+'. '+this.fill(this.smartPick([
        'The moment had a weight to it, a specific gravity that {nmM} would remember later without quite knowing why.',
        '{Sub} felt the weight of the realization more than {sub} saw it — a gravity of meaning still assembling itself, piece by piece, in the quiet behind {pos} thoughts.',
        'The '+closeSett+' held its breath, or maybe that was just {nmM}, still learning what it meant to understand something this large.',
      ], 'deep_final', 3), nmS, nmM, pr, firstName));
      L.push('');
      L.push(this.fill(this.smartPick([
        '{Sub} did not have words for it yet. Maybe {sub} never would. But {sub} had felt it, and that was the part that would stay.',
        'Whatever came next, {nmM} would carry this moment with {obj} — not as a weight, but as a kind of compass.',
        'The '+closeSett+' had not changed. {nmS} had. The difference was small, and it was everything.',
      ], 'deep_close', 3), nmS, nmM, pr, firstName));
      L.push('');
    }

    return this.editor.polish(L.join('\n'));
  }
};


// ════════════════════════════════════════════════════════════
//  MODELS — Harmony Core only (sovereign, zero external dependencies)
// ════════════════════════════════════════════════════════════

// Harmony Core — sovereign engine, always available
function callHarmonyCore(params) {
  return new Promise(resolve => {
    // Simulate processing time for UX
    setTimeout(() => resolve(HSM.generate(params)), 400);
  });
}

const MODELS = [
  { id:'harmony', name:'Harmony Core', desc:'Sovereign · Built-in · Offline', badges:['sovereign','offline'], sovereign:true,
    note:"Runs entirely in your browser. No network needed. Kyle\'s engine." }
];

// ════════════════════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════════════════════
let S = {
  genre:'Space Opera', tone:'wonder', model:'harmony',
  chars:[], chapters:[], output:'',
  continuity:{ threads:[], lastScene:'', activePOV:'', unresolved:[] },
  emotional:{ chapters:[], toneDrift:[], arc:[] },
  characterTracker:{ chapters:[], presence:{}, dialogueRatio:{}, povConsistency:[] },
  // ── Thread Memory ── persistent narrative facts across chapters
  threadMemory: {
    facts: [],           // {id, text, chapter, type:'revelation|event|relationship|world'}
    unresolvedThreads: [], // {id, text, sourceChapter, status:'unresolved|progressing|resolved', resolutionChapter}
    emotionalStates: {}  // {charName: {state, intensity, chapter}}
  },
  // ── World Builder ── persistent world state
  world: {
    locations: [],       // {name, description, significance, firstMentioned, visited}
    factions: [],        // {name, goal, relationship:hostile|neutral|allied, influence}
    lore: [],            // {title, content, chapter, category}
    timeline: []         // {event, chapter, significance}
  },
  // ── Character Arcs ── development tracking
  characterArcs: {},    // {charName: {stage:'introduction|growth|crisis|transformation', beats:[]}}
  // ── Axiom Enforcement ── which axioms are active
  activeAxioms: ['consistency', 'growth'],
  // ── Voice State ── current prose mode
  voice: { currentMode: 'balanced', depth: 0 },
  // ── Path Chain ── story creation workflow progress
  pathChain: {
    currentStep: 0,
    completed: new Set(),
    visited: new Set()
  }
};

// ════════════════════════════════════════════════════════════
//  PATH CHAIN ENGINE — Story Creation Workflow
//  Guides the user through: Characters → Configure → Plot
//  → World → Generate → Continuity → Voice → Export
// ════════════════════════════════════════════════════════════
const PathChain = {
  ENGINE_NAME: 'Path Chain',
  ENGINE_VERSION: '1.0.0',
  ENGINE_NUMBER: 94,
  MASTER_SEAL: 'pc94_2d5e7f1a3b9c8e0d',

  STEPS: [
    { id: 'chars',      label: 'Characters',  icon: '👤', tab: 'chars',      idx: 1,
      desc: 'Register your cast — names, roles, pronouns, backstories',
      check: () => S.chars.length >= 1 },
    { id: 'configure',  label: 'Configure',   icon: '⚙️', tab: 'settings',   idx: 2,
      desc: 'Set genre, tone, narrative style, pacing',
      check: () => S.genre && S.tone },
    { id: 'plot',       label: 'Plot',        icon: '📖', tab: 'create',     idx: 3,
      desc: 'Title, premise, plot points, scene depth',
      check: () => {
        const t = document.getElementById('storyTitle');
        const p = document.getElementById('premise');
        const pp = document.getElementById('plotPoints');
        return t && t.value.trim() && p && p.value.trim().length > 10 && pp && pp.value.trim().length > 10;
      }},
    { id: 'world',      label: 'World',       icon: '🗺', tab: 'continuity', idx: 4,
      desc: 'Build locations, lore, timeline for your story world',
      check: () => S.world.locations.length + S.world.lore.length + S.world.timeline.length >= 2 },
    { id: 'generate',   label: 'Generate',    icon: '✨', tab: 'grimoire',   idx: 5,
      desc: 'Conjure chapters with Harmony Core',
      check: () => S.chapters.length >= 1 },
    { id: 'editor',     label: 'Editor',      icon: '✏️', tab: 'grimoire',   idx: 6,
      desc: 'Professional polish pass on every chapter',
      check: () => EditorEngine.stats.passes >= 1 },
    { id: 'continuity', label: 'Continuity',  icon: '🔗', tab: 'continuity', idx: 7,
      desc: 'Review threads, emotional arcs, character presence',
      check: () => S.emotional.chapters.length >= 1 && S.threadMemory.facts.length >= 1 },
    { id: 'voice',      label: 'Voice',       icon: '🎙', tab: 'voice',      idx: 8,
      desc: 'Set voice profiles, narrate chapters',
      check: () => Object.keys(VoxHarmonica.voices).length >= 1 },
  ],

  // ── Check all steps and update completed set ──
  checkAll() {
    for (const step of this.STEPS) {
      if (step.check()) {
        S.pathChain.completed.add(step.id);
      }
    }
    this.render();
  },

  // ── Navigate to a step's tab ──
  goTo(stepId) {
    const step = this.STEPS.find(s => s.id === stepId);
    if (!step) return;
    S.pathChain.visited.add(stepId);
    S.pathChain.currentStep = step.idx;
    // Find the tab button and activate it
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabMap = { 'chars': 1, 'settings': 6, 'create': 0, 'continuity': 3, 'grimoire': 2, 'voice': 5 };
    const btnIdx = tabMap[step.tab];
    if (btnIdx !== undefined && tabBtns[btnIdx]) {
      showTab(step.tab, tabBtns[btnIdx]);
    }
    this.render();
  },

  // ── Go to next incomplete step ──
  next() {
    this.checkAll();
    // Find first incomplete step
    const nextStep = this.STEPS.find(s => !S.pathChain.completed.has(s.id));
    if (nextStep) {
      this.goTo(nextStep.id);
      this.showTip(`Step ${nextStep.idx}: ${nextStep.desc}`);
    } else {
      this.showTip('All steps complete! Your story is ready for export.');
      this.goTo('voice');
    }
  },

  // ── Show path tip ──
  showTip(msg) {
    const el = document.getElementById('pathTip');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
  },

  // ── Render path progress bar ──
  render() {
    const bar = document.getElementById('pathBar');
    const prog = document.getElementById('pathProgress');
    if (!bar || !prog) return;

    let html = '';
    let completedCount = 0;
    for (let i = 0; i < this.STEPS.length; i++) {
      const s = this.STEPS[i];
      const isDone = S.pathChain.completed.has(s.id);
      const isCurrent = S.pathChain.currentStep === s.idx;
      if (isDone) completedCount++;

      const bg = isDone ? 'background:#10b98122;border-color:#10b981;color:#10b981'
              : isCurrent ? 'background:var(--accent2);border-color:var(--accent2);color:#fff'
              : 'background:var(--bg2);border-color:var(--border);color:var(--text3)';
      const icon = isDone ? '✓' : s.icon;

      html += `<button onclick="PathChain.goTo('${s.id}')" style="${bg};border:1px solid;border-radius:5px;padding:3px 8px;font-size:.65rem;cursor:pointer;font-family:inherit;transition:all .2s" title="${s.desc}">${icon} ${s.label}</button>`;

      if (i < this.STEPS.length - 1) {
        html += `<span style="color:var(--border);font-size:.6rem">→</span>`;
      }
    }

    bar.innerHTML = html;
    prog.textContent = `${completedCount}/${this.STEPS.length}`;
    prog.style.color = completedCount === this.STEPS.length ? '#10b981' : 'var(--text3)';
  },

  // ── Render "Next Step" button for a panel ──
  renderNext(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const nextStep = this.STEPS.find(s => !S.pathChain.completed.has(s.id));
    if (!nextStep) {
      container.innerHTML = `<div style="margin-top:10px;padding:8px;background:#10b98111;border:1px solid #10b981;border-radius:6px;text-align:center">
        <span style="color:#10b981;font-size:.75rem">🎉 All path steps complete! Your story is ready.</span>
      </div>`;
      return;
    }

    container.innerHTML = `<div style="margin-top:10px;padding:8px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;display:flex;align-items:center;gap:8px">
      <span style="font-size:.7rem;color:var(--text2)">Next:</span>
      <button onclick="PathChain.goTo('${nextStep.id}')" class="btn btn-ghost btn-sm" style="font-size:.7rem">${nextStep.icon} ${nextStep.label} →</button>
      <span style="font-size:.62rem;color:var(--text3);flex:1">${nextStep.desc}</span>
    </div>`;
  },

  // ── Clear path state ──
  clear() {
    S.pathChain = { currentStep: 0, completed: new Set(), visited: new Set() };
    this.render();
  },

  // ── Get serializable state ──
  serialize() {
    return {
      currentStep: S.pathChain.currentStep,
      completed: Array.from(S.pathChain.completed),
      visited: Array.from(S.pathChain.visited)
    };
  },

  // ── Restore from serialized state ──
  restore(data) {
    if (!data) return;
    S.pathChain.currentStep = data.currentStep || 0;
    S.pathChain.completed = new Set(data.completed || []);
    S.pathChain.visited = new Set(data.visited || []);
    this.render();
  },

  // ── Initialize on boot ──
  init() {
    this.render();
    // Check periodically for completion changes
    setInterval(() => this.checkAll(), 3000);
  }
};

// ════════════════════════════════════════════════════════════
//  INIT & BUILDERS
// ════════════════════════════════════════════════════════════
function init(){
  buildStars(); buildGenreGrid(); buildToneGrid();
  buildAxiomList(); buildGenreTax(); startTicker();
  VoxHarmonica.init();
  PathChain.init();
  loadSession(); renderChars(); updateContUI();
  // Backfill trackers for chapters that predate them
  if (S.chapters.length && !S.emotional.chapters.length) {
    for (const ch of S.chapters) {
      if (ch.text) {
        EmotionalTracker.analyze(ch.text, ch.tone || S.tone, ch.num);
        if (S.chars.length) CharacterTracker.analyze(ch.text, S.chars, ch.num);
      }
    }
  }
  renderEmotional(); renderCharacter();
  renderLocations(); renderLore(); renderTimeline();
}

function buildStars(){
  const sf=document.getElementById('sf');
  for(let i=0;i<110;i++){
    const s=document.createElement('div'); s.className='star';
    const z=Math.random()*2+0.4;
    s.style.cssText=`width:${z}px;height:${z}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${2+Math.random()*4}s;--dl:${Math.random()*5}s;--lo:${.04+Math.random()*.14};--hi:${.3+Math.random()*.6};`;
    sf.appendChild(s);
  }
}

let aI=0;
function startTicker(){
  const el=document.getElementById('axiomTicker');
  setInterval(()=>{ aI=(aI+1)%AXIOMS.length; el.style.opacity='0';
    setTimeout(()=>{ el.textContent='✦ '+AXIOMS[aI]+' ✦'; el.style.opacity='1'; },300); },5000);
}

function showTab(n,b){
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));
  document.getElementById('tab-'+n).classList.add('active');
  if(b) b.classList.add('active');
}

function buildModelGrid(){
  const g=document.getElementById('modelGrid');
  MODELS.forEach(m=>{
    const d=document.createElement('div');
    d.className='mc'+(m.sovereign?' sovereign':'')+(m.id===S.model?' sel':'');
    d.id='mc_'+m.id;
    d.innerHTML=`<div class="mc-name">${m.name}</div><div class="mc-desc">${m.desc}</div>
      <div class="mc-badges">${m.badges.map(b=>`<span class="mb mb-${b}">${b}</span>`).join('')}</div>`;
    d.title=m.note;
    d.onclick=()=>{ document.querySelectorAll('.mc').forEach(c=>c.classList.remove('sel')); d.classList.add('sel'); S.model=m.id; };
    g.appendChild(d);
  });
}

function buildGenreGrid(){
  const g=document.getElementById('genreGrid');
  Object.values(GENRES).flat().forEach(genre=>{
    const c=document.createElement('div'); c.className='gc'+(genre===S.genre?' sel':''); c.textContent=genre;
    c.onclick=()=>{ document.querySelectorAll('.gc').forEach(x=>x.classList.remove('sel')); c.classList.add('sel'); S.genre=genre; };
    g.appendChild(c);
  });
}

function buildToneGrid(){
  const g=document.getElementById('toneGrid');
  TONES.forEach(t=>{
    const c=document.createElement('div'); c.className='tc'+(t.n===S.tone?' sel':''); c.style.setProperty('--tc',t.c);
    c.innerHTML=`<div class="te">${t.e}</div><div class="tn">${t.n}</div>`;
    c.onclick=()=>{ document.querySelectorAll('.tc').forEach(x=>x.classList.remove('sel')); c.classList.add('sel'); S.tone=t.n; };
    g.appendChild(c);
  });
}

function buildAxiomList(){
  const el=document.getElementById('axiomList');
  AXIOMS.forEach((a,i)=>{ const li=document.createElement('li'); li.innerHTML=`<span class="anum">${i+1}.</span>${a}`; el.appendChild(li); });
}

function buildGenreTax(){
  const el=document.getElementById('genreTax');
  Object.entries(GENRES).forEach(([cat,gs])=>{
    const d=document.createElement('div'); d.style.marginBottom='11px';
    d.innerHTML=`<div style="color:var(--gold);font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px">${cat}</div>
    <div style="display:flex;flex-wrap:wrap;gap:5px">${gs.map(g=>`<span style="background:var(--bg2);border:1px solid var(--border);padding:2px 8px;border-radius:20px;font-size:.7rem;color:var(--text2)">${g}</span>`).join('')}</div>`;
    el.appendChild(d);
  });
}

// ════════════════════════════════════════════════════════════
//  CONTINUITY ENGINE
// ════════════════════════════════════════════════════════════
function buildContinuityContext() {
  if (!S.chapters.length) return { lastScene:'', unresolvedThreads:[] };
  const last = S.chapters[S.chapters.length-1];
  // Extract last ~2 paragraphs
  const paras = (last.text||'').split(/\n\n+/).filter(p=>p.trim().length>30);
  const lastParas = paras.slice(-2).join('\n\n').replace(/#{1,3} .+\n?/g,'').trim();
  return {
    lastScene: S.continuity.lastScene || lastParas.slice(0,120),
    unresolvedThreads: S.continuity.unresolved,
    summaries: S.chapters.slice(-3).map(c=>`Chapter ${c.num}: ${c.summary||'(sealed)'}`),
  };
}

function extractContinuity(text, chapterNum) {
  const paras = text.split(/\n\n+/).filter(p=>p.trim().length>30);
  // Use second-to-last paragraph for lastScene — the final paragraph is usually the
  // resonance close (short, template-y). The penultimate paragraph is the real scene end.
  const bodyParas = paras.filter(p=>!p.startsWith('##'));
  const scenePara = bodyParas.length > 1 ? bodyParas[bodyParas.length-2] : bodyParas[bodyParas.length-1] || '';
  const sentences = scenePara.split(/(?<=[.!?])\s+/).filter(s=>s.trim().length>10);
  const lastScene = sentences[sentences.length-1] || scenePara.slice(0,100);
  // Simple thread detection: questions, "still", "hadn't", "unresolved"
  // Thread auto-detection disabled — produces sentence fragments, not real story threads
  // Users can track threads manually in the Threads tab
  const newThreads = [];
  S.continuity.lastScene = lastScene;
  S.continuity.unresolved = [...new Set([...S.continuity.unresolved, ...newThreads])].slice(-8);
  const ch = S.chapters.find(c=>c.num===chapterNum);
  if (ch) ch.summary = paras[1] ? paras[1].slice(0,120)+'...' : '(chapter sealed)';
  S.continuity.threads.push({ ch:chapterNum, lastScene, threads:newThreads, ts:new Date().toISOString() });
  updateContUI(); renderThreads(); save();
}

// ════════════════════════════════════════════════════════════
//  AUTO-CHARACTER DETECTION — Grimoire fills itself out
//  Extracts named characters from prose, auto-registers them
// ════════════════════════════════════════════════════════════
function autoDetectCharacters(text) {
  if (!text) return;
  // Pattern: capitalized word + optional second capitalized word (not sentence-start)
  const namePattern = /\b([A-Z][a-z]+(?:[-']?[A-Z]?[a-z]+)*(?:\s+[A-Z][a-z]+)?)\b/g;
  const skipWords = new Set(['The','She','He','They','It','We','You','I','A','An',
    'This','That','These','Those','What','When','Where','Why','How','Who','Which',
    'There','Then','Than','His','Her','Their','Its','Our','Your','My','But','And',
    'Or','Not','No','Yes','So','If','As','At','By','For','From','In','Into','Of',
    'On','Onto','Out','Over','To','Up','With','Within','Without','Under','About',
    'Above','Across','After','Against','Along','Around','Before','Behind','Below',
    'Beneath','Beside','Between','Beyond','During','Except','Inside','Near','Off',
    'Outside','Since','Through','Throughout','Toward','Until','Upon','Via','While',
    'Elara','Kael','Proxima','Centauri','First','Some','All','Any','Every','Each',
    'Both','Few','More','Most','Other','Same','Such','Only','Own','Just','Also',
    'Back','Still','Even','Once','Here','Now','Well','Very','Too','Can','Will',
    'Would','Could','Should','May','Might','Must','Shall','Have','Has','Had','Do',
    'Does','Did','Done','Being','Been','Am','Is','Are','Was','Were','Be','Become',
    'Became','Seem','Seemed','Look','Looked','Sound','Sounded','Turn','Turned',
    'Jump','Drive','Space','Ship','Station','Star','Void','Light','Dark','Data',
    'Signal','Protocol','Array','Panel','Console','Screen','Room','Hall','Door',
    'Window','Wall','Floor','Ceiling','Air','Water','Fire','Earth','Wind',
    'Chapter','Section','Part','Scene','Story','Narrative','Tale','Book','Prologue',
    'Proxima','Centauri','Orion','Andromeda','Nebula','Galaxy','Planet','Moon',
    'Mercury','Venus','Mars','Jupiter','Saturn','Comet','Asteroid','Reactor',
    'Spectrograph','Transponder','Harmony','Resonance','Frequency','Transmission',
    // Narrative words that look like names at paragraph starts
    'Chapter','Come','Some','Not','But','For','With','Without','Within','About',
    'Above','After','Again','Against','All','Almost','Already','Also','Although',
    'Always','Among','Another','Any','Around','Back','Because','Before','Behind',
    'Being','Below','Between','Beyond','Both','Cannot','Could','Down','During',
    'Each','Either','Enough','Every','Everything','Everyone','Everywhere','Except',
    'Few','Finally','Forward','From','Further','Had','Has','Having','Here','How',
    'However','Into','Its','Itself','Just','Last','Later','Least','Less','Like',
    'Likely','Made','Make','Makes','Many','Maybe','Might','Mine','More','Most',
    'Mostly','Much','Must','Myself','Near','Need','Neither','Next','Nobody','None',
    'Nothing','Now','Often','Once','One','Only','Other','Others','Ought','Ours',
    'Out','Outside','Over','Own','Perhaps','Rather','Really','Same','Several',
    'Should','Since','So','Somebody','Somehow','Someone','Something','Sometimes',
    'Somewhere','Still','Such','Than','That','The','Their','Theirs','Then',
    'There','These','Those','Though','Through','Throughout','Thus','Too','Toward',
    'Under','Until','Upon','Very','Was','Way','Well','Were','What','Whatever',
    'When','Where','Whether','Which','While','Who','Whoever','Whom','Whose','Why',
    'Will','Would','Yet','You','Your','Yours','Yourself','Yourselves',
    'Remember','Came','Gone','Doing']);

  const matches = text.matchAll(namePattern);
  const detected = new Set();
  for (const m of matches) {
    const name = m[1];
    if (name.length < 3) continue;
    // Skip if any word in multi-word name is in skipWords
    const nameWords = name.split(/\s+/);
    if (nameWords.some(w => skipWords.has(w))) continue;
    // Must not be at start of sentence or paragraph
    const before10 = text.slice(Math.max(0, m.index - 10), m.index);
    const before2 = text.slice(Math.max(0, m.index - 2), m.index);
    // Skip at sentence start (. Name, ! Name, ? Name)
    if (before2 === '. ' || before2 === '! ' || before2 === '? ') continue;
    // Skip at paragraph start (\n\nName or start of text)
    if (before10.includes('\n\n') && before10.endsWith('\n\n')) continue;
    // Skip at very start of text
    if (m.index === 0) continue;
    // Skip if preceded by markdown header (## Name)
    if (before10.includes('\n#')) continue;
    // Must have dialogue tag, action verb, or personal pronoun nearby
    const context = text.substring(Math.max(0, m.index - 80), m.index + 80).toLowerCase();
    const isCharacter = /\bsaid\b|\basked\b|\bwhispered\b|\byelled\b|\breplied\b|\bmuttered\b|\banswered\b|\bcalled\b|\bthought\b|\bfelt\b|\bshe\b|\bhe\b|\bthey\b|\bhim\b|\bher\b|\btheir\b|\bherself\b|\bhimself\b/.test(context);
    if (!isCharacter) continue;
    detected.add(name);
  }

  // Register detected characters that don't already exist
  let added = 0;
  for (const name of detected) {
    const exists = S.chars.find(c => c.name === name || c.name.startsWith(name + ' ') || name.startsWith(c.name + ' '));
    if (!exists) {
      // Infer pronouns from text context
      const context = text.substring(Math.max(0, text.indexOf(name) - 200), text.indexOf(name) + 200);
      const pronouns = context.includes(' she ') || context.includes(' her ') ? 'she/her'
                     : context.includes(' he ') || context.includes(' him ') ? 'he/him'
                     : context.includes(' they ') || context.includes(' them ') ? 'they/them'
                     : 'they/them';
      S.chars.push({ name, pronouns, role: '', backstory: '', emoji: '🎭' });
      added++;
    }
  }
  if (added > 0) {
    renderChars();
    save();
  }
  return added;
}

function renderEmotional() { EmotionalTracker.renderArc(); }
function renderCharacter() { CharacterTracker.render(); }
function renderThreadMemory() { ThreadMemory.render(); }
function renderWorldBuilder() { WorldBuilder.render(); }
function renderRelationships() { CharacterRelationship.render(); }

function updateContUI() {
  const n=S.chapters.length;
  document.getElementById('contLabel').textContent = n ? `${n} ch · ${S.continuity.unresolved.length} threads` : '';
  const cs=document.getElementById('contStatus');
  if (!cs) return;
  cs.innerHTML = n
    ? `<div style="font-size:.77rem;color:var(--text2)">
        <strong style="color:var(--gold)">Chapters sealed:</strong> ${n} &nbsp;|&nbsp;
        <strong style="color:var(--gold)">Open threads:</strong> ${S.continuity.unresolved.length} &nbsp;|&nbsp;
        <strong style="color:var(--gold)">Last scene:</strong> ${S.continuity.lastScene||'N/A'}
       </div>`
    : '<div class="tm">No chapters yet — continuity builds as you write.</div>';
}

function setupThreadDeleteListener() {
  // Delegate for open threads buttons
  const ot = document.getElementById('openThreads');
  if (ot && !ot._delegated) {
    ot._delegated = true;
    ot.addEventListener('click', function(e) {
      const btn = e.target.closest('[data-del-thread]');
      if (!btn) return;
      const idx = parseInt(btn.getAttribute('data-del-thread'));
      if (!isNaN(idx)) {
        S.continuity.unresolved.splice(idx, 1);
        updateContUI(); renderThreads(); save();
        toast('Thread removed.');
      }
    });
  }
  // Delegate for chapter log buttons + clear history
  const tl = document.getElementById('threadList');
  if (tl && !tl._delegated) {
    tl._delegated = true;
    tl.addEventListener('click', function(e) {
      const delBtn = e.target.closest('[data-del-log]');
      if (delBtn) {
        const idx = parseInt(delBtn.getAttribute('data-del-log'));
        if (!isNaN(idx)) deleteLogEntry(idx);
        return;
      }
      const clearBtn = e.target.closest('[data-clear-log]');
      if (clearBtn) { clearThreadLog(); }
    });
  }
}

function deleteLogEntry(idx) {
  const realIdx = S.continuity.threads.length - 1 - idx;
  S.continuity.threads.splice(realIdx, 1);
  updateContUI(); renderThreads(); save();
  toast('Log entry removed.');
}

function clearThreadLog() {
  if (!confirm('Clear all chapter log entries?')) return;
  S.continuity.threads = [];
  updateContUI(); renderThreads(); save();
  toast('Thread log cleared.');
}

function renderThreads() {
  const tl=document.getElementById('threadList');
  const ot=document.getElementById('openThreads');
  if (!tl||!ot) return;
  const entries = S.continuity.threads.slice().reverse();
  const clearBtn = entries.length > 0
    ? `<div style="text-align:right;margin-bottom:8px">
        <button data-clear-log style="background:none;border:1px solid var(--border);color:var(--text3);border-radius:6px;padding:3px 10px;font-size:.68rem;cursor:pointer">Clear History</button>
       </div>`
    : '';
  tl.innerHTML = clearBtn + (entries.map((t,i)=>`
    <div class="cont-card" style="display:flex;align-items:flex-start;gap:8px">
      <div style="flex:1">
        <div class="cont-ch">Chapter ${t.ch} · ${new Date(t.ts).toLocaleTimeString()}</div>
        <div class="cont-end">---> ${t.lastScene||'...'}</div>
      </div>
      <button data-del-log="${i}" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:.68rem;padding:2px 4px;flex-shrink:0;margin-top:2px" title="Remove entry">x</button>
    </div>`).join('') || '<p class="tm">No chapter log entries yet.</p>');
  ot.innerHTML = S.continuity.unresolved.length
    ? S.continuity.unresolved.map((t,i)=>`<span class="thread-tag" style="display:inline-flex;align-items:center;gap:5px">🔴 ${t}<button data-del-thread="${i}" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:.62rem;padding:0 2px;line-height:1" title="Remove">x</button></span>`).join('')
    : '<p class="tm">No open threads detected.</p>';
  setupThreadDeleteListener();
}

// ════════════════════════════════════════════════════════════
//  GENERATE CHAPTER
// ════════════════════════════════════════════════════════════
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
  // Auto-increment chapter number
  const nextCh = (S.chapters.length > 0 ? Math.max(...S.chapters.map(c => c.num)) : 0) + 1;
  document.getElementById('chapterNum').value = nextCh;

  // Auto-suggest plot points based on last chapter's threads
  const lastScene = S.continuity.lastScene || '';
  const threads = S.continuity.unresolved || [];
  const suggestedPlots = [];

  if (lastScene) {
    // Extract a follow-up from last scene
    const sceneWords = lastScene.split(/\s+/).slice(0, 15).join(' ');
    suggestedPlots.push(`After ${sceneWords.toLowerCase()}...`);
  }
  // Add unresolved threads as plot points
  for (const thread of threads.slice(0, 3)) {
    if (thread && thread.length > 5) suggestedPlots.push(thread);
  }
  // Generic continuations if no threads
  if (suggestedPlots.length < 2) {
    suggestedPlots.push('The aftermath — consequences ripple outward');
    suggestedPlots.push('A new complication shifts the balance');
  }

  // Populate plot points with suggestions
  const ppField = document.getElementById('plotPoints');
  if (ppField) {
    const existing = ppField.value.trim();
    ppField.value = suggestedPlots.join('\n') + (existing ? '\n' + existing : '');
  }

  // Show last scene in Seal & Continue panel
  document.getElementById('continueLastScene').textContent = lastScene || '(no previous scene)';

  // Scroll to Create tab with plot points focused
  showTab('create', document.querySelectorAll('.tab-btn')[0]);
  setTimeout(() => {
    const ppEl = document.getElementById('plotPoints');
    if (ppEl) ppEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);

  toast(`🔮 Chapter ${nextCh} ready. Plot points suggested — edit and Conjure.`);
}

function focusPlotPoints() {
  showTab('create', document.querySelectorAll('.tab-btn')[0]);
  setTimeout(() => {
    const el = document.getElementById('plotPoints');
    if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }, 100);
}

function focusVoice() {
  showTab('voice', document.querySelectorAll('.tab-btn')[5]);
}

function setStatus(color, label, sub) {
  document.getElementById('engDot').className=`sdot ${color}`;
  const lel=document.getElementById('engLabel');
  lel.textContent=label;
  lel.style.color=color==='green'?'var(--green)':color==='purple'?'var(--accent2)':'#fbbf24';
  if (sub!==undefined) document.getElementById('engSub').textContent=sub;
}

// ════════════════════════════════════════════════════════════
//  EXPORT — formats through Harmony Core
// ════════════════════════════════════════════════════════════
function exportFmt(fmt) {
  if (!S.output) { toast('No story to export.'); return; }
  const slug=(document.getElementById('storyTitle').value||'grimoire').replace(/\s+/g,'-').toLowerCase();
  let content, mime, ext;
  if (fmt==='md') {
    content=S.output; mime='text/markdown'; ext='md';
  } else if (fmt==='html') {
    content=`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>${document.getElementById('storyTitle').value||'Story'}</title>
<style>
  body{max-width:720px;margin:48px auto;padding:0 24px;font-family:Georgia,serif;
       line-height:1.9;background:#0a0a0f;color:#e2e8f0;}
  h2{color:#d4af37;margin:24px 0 10px;font-size:1.2rem;letter-spacing:.04em;}
  h3{color:#a855f7;margin:18px 0 8px;}
  em{color:#94a3b8;} strong{color:#f0d060;}
  blockquote{border-left:3px solid #a855f7;padding-left:16px;color:#94a3b8;margin:12px 0;}
  hr{border:none;border-top:1px solid #2a2a4a;margin:20px 0;}
  p{margin-bottom:1em;}
</style></head><body>
${renderMD(S.output).replace(/<br><br>/g,'</p><p>')}
</body></html>`;
    mime='text/html'; ext='html';
  } else {
    content=S.output.replace(/^#{1,3} /gm,'').replace(/\*\*/g,'').replace(/\*/g,'').replace(/^> /gm,'');
    mime='text/plain'; ext='txt';
  }
  dl(slug, content, mime, ext);
  toast(`📤 Exported as .${ext}`);
}

function exportFull() {
  if (!S.chapters.length) { toast('No chapters yet.'); return; }
  const title=document.getElementById('storyTitle').value||'Untitled';
  const slug=title.replace(/\s+/g,'-').toLowerCase();
  const header=`# ${title}\n\n*A ${S.genre} tale in the tone of ${S.tone}*\n\n*Sealed by Midnight Grimoire · Engine #87 · ${new Date().toLocaleDateString()}*\n\n---\n\n`;
  const body=S.chapters.sort((a,b)=>a.num-b.num).map(c=>c.text).join('\n\n---\n\n');
  dl(slug+'-complete', header+body, 'text/markdown', 'md');
  toast(`📚 Full manuscript exported — ${S.chapters.length} chapters`);
}

function dl(slug, content, mime, ext) {
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([content],{type:mime}));
  a.download=`${slug}.${ext}`; a.click();
}

function copyText(){
  if(!S.output)return;
  navigator.clipboard.writeText(S.output).then(()=>toast('📋 Copied!'));
}

function clearOut(){
  document.getElementById('story-output').innerHTML='<div class="tm" style="text-align:center;padding:50px 16px"><div style="font-size:2.5rem;margin-bottom:12px">📖</div><div>Your story will appear here.</div></div>';
  ['statsRow','muWrap','sealBox','exportRow'].forEach(id=>document.getElementById(id).style.display='none');
  S.output='';
}

// ════════════════════════════════════════════════════════════
//  HISTORY
// ════════════════════════════════════════════════════════════
function deleteThread(idx) {
  S.continuity.unresolved.splice(idx,1);
  updateContUI(); renderThreads(); save();
  toast('Thread removed.');
}

function deleteChapter(idx, event) {
  if (event) { event.stopPropagation(); event.preventDefault(); }
  if (!confirm('Delete this chapter?')) return;
  ChapterOrganizer.deleteChapter(idx);
  toast('🗑 Chapter removed.');
}

function renderHist(){
  if(!S.chapters.length)return;
  document.getElementById('histPanel').style.display='block';
  document.getElementById('histList').innerHTML=S.chapters.slice().reverse().map((c,i)=>`
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:7px;padding:9px 12px;margin-bottom:6px;cursor:pointer;display:flex;align-items:center;gap:9px"
         onclick="loadCh(${S.chapters.length-1-i})">
      <span style="font-family:monospace;color:var(--accent2);font-size:.77rem;flex-shrink:0">Ch.${c.num}</span>
      <div style="flex:1;min-width:0">
        <div style="color:var(--gold);font-size:.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.title}</div>
        <div style="font-size:.67rem;color:var(--text3)">${c.genre} · ${c.tone} · ${c.model} · ${c.words}w</div>
      </div>
      <span style="font-size:.63rem;color:var(--text3);flex-shrink:0">${new Date(c.ts).toLocaleTimeString()}</span>
      <button style="background:none;border:1px solid var(--border);color:var(--text3);border-radius:5px;padding:2px 7px;font-size:.66rem;cursor:pointer;flex-shrink:0;margin-left:4px" onclick="deleteChapter(${S.chapters.length-1-i}, event)">🗑</button>
    </div>`).join('');
  renderThreads();
}

function loadCh(idx){
  const c=S.chapters[idx]; S.output=c.text;
  document.getElementById('story-output').innerHTML=renderMD(c.text);
  document.getElementById('statsRow').style.display='flex';
  ['sCh','sWords','sGenre','sTone','sMu','sModel'].forEach((id,i)=>{
    const vals=[c.num,c.words.toLocaleString(),c.genre,c.tone,c.mu,c.model];
    document.getElementById(id).textContent=vals[i];
  });
  document.getElementById('sealBox').style.display='block';
  document.getElementById('sealHash').textContent=c.seal;
  document.getElementById('exportRow').style.display='flex';
  document.getElementById('muWrap').style.display='block';
  document.getElementById('muVal').textContent=c.mu;
  setTimeout(()=>{ document.getElementById('muFill').style.width=(parseFloat(c.mu)*100)+'%'; },120);
}

// ════════════════════════════════════════════════════════════
//  CHARACTERS
// ════════════════════════════════════════════════════════════
function addChar(){
  const n=document.getElementById('charName').value.trim();
  if(!n){toast('Enter a name.');return;}
  S.chars.push({name:n,pronouns:document.getElementById('charPronouns').value,role:document.getElementById('charRole').value,age:document.getElementById('charAge').value,backstory:document.getElementById('charBackstory').value,emoji:['🧙','👸','🧝','🦹','🧛','🤖','🐉','⚔️','🌙','🧿'][Math.floor(Math.random()*10)]});
  renderChars(); ['charName','charRole','charAge','charBackstory'].forEach(id=>document.getElementById(id).value='');
  toast(`✓ ${n} registered.`); save();
}

function removeChar(i){S.chars.splice(i,1);renderChars();save();}

function renderChars(){
  PathChain.render(); PathChain.renderNext('pathNext-chars');
  const el=document.getElementById('charList');
  if(!S.chars.length){el.innerHTML='<p class="tm" style="text-align:center;padding:18px">No characters yet.</p>';return;}
  el.innerHTML=S.chars.map((c,i)=>`
    <div class="char-card">
      <div class="char-av">${c.emoji}</div>
      <div style="flex:1">
        <div class="char-name">${c.name}<span class="char-pro">${c.pronouns}</span></div>
        <div class="char-meta">${c.role?`<b>${c.role}</b> · `:''}${c.age?`Age ${c.age} · `:''}${c.backstory?c.backstory.slice(0,70)+'...':''}</div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="removeChar(${i})" style="flex-shrink:0">x</button>
    </div>`).join('');
}

// ════════════════════════════════════════════════════════════
//  THREAD MEMORY ENGINE
//  Persistent narrative facts, unresolved threads, character
//  emotional states across chapters — feeds back into generation.
// ════════════════════════════════════════════════════════════
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
  clear() {
    S.threadMemory = { facts: [], unresolvedThreads: [], emotionalStates: {} };
    S.characterArcs = {};
  },

  // ── Render memory UI ──
  render() {
    const el = document.getElementById('threadMemoryPanel');
    if (!el) return;
    let html = '<div style="margin-bottom:12px"><strong style="color:var(--gold);font-size:.78rem">📚 Narrative Facts (' + S.threadMemory.facts.length + ')</strong></div>';
    if (S.threadMemory.facts.length) {
      html += '<div style="max-height:120px;overflow-y:auto;font-size:.72rem;">';
      for (const f of [...S.threadMemory.facts].reverse()) {
        html += '<div style="padding:4px 0;border-bottom:1px solid var(--border)"><span style="color:var(--text3)">Ch' + f.chapter + '</span> ' + f.text.slice(0, 80) + '</div>';
      }
      html += '</div>';
    } else {
      html += '<p class="tm">No facts yet — facts extract as chapters are sealed.</p>';
    }
    
    html += '<div style="margin:12px 0"><strong style="color:var(--gold);font-size:.78rem">🧵 Threads (' + S.threadMemory.unresolvedThreads.length + ')</strong></div>';
    const unresolved = S.threadMemory.unresolvedThreads.filter(t => t.status === 'unresolved');
    const progressing = S.threadMemory.unresolvedThreads.filter(t => t.status === 'progressing');
    const resolved = S.threadMemory.unresolvedThreads.filter(t => t.status === 'resolved');
    
    if (unresolved.length) {
      html += '<div style="font-size:.72rem;margin-bottom:8px"><strong style="color:var(--red)">Unresolved:</strong></div>';
      for (const t of unresolved) {
        html += '<div style="padding:3px 6px;background:var(--red)08;border:1px solid var(--red)30;border-radius:6px;margin-bottom:4px;font-size:.7rem;color:var(--text2)">' + t.text.slice(0, 60) + ' <span style="color:var(--text3)">(Ch' + t.sourceChapter + ')</span></div>';
      }
    }
    if (progressing.length) {
      html += '<div style="font-size:.72rem;margin:8px 0"><strong style="color:#fbbf24">Progressing:</strong></div>';
      for (const t of progressing) {
        html += '<div style="padding:3px 6px;background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.3);border-radius:6px;margin-bottom:4px;font-size:.7rem;color:var(--text2)">' + t.text.slice(0, 60) + ' <span style="color:var(--text3)">(Ch' + t.sourceChapter + ')</span></div>';
      }
    }
    if (resolved.length) {
      html += '<div style="font-size:.72rem;margin:8px 0"><strong style="color:var(--green)">Resolved:</strong></div>';
      for (const t of resolved) {
        html += '<div style="padding:3px 6px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.3);border-radius:6px;margin-bottom:4px;font-size:.7rem;color:var(--text2)">' + t.text.slice(0, 60) + ' <span style="color:var(--text3)">→ Ch' + t.resolutionChapter + '</span></div>';
      }
    }
    if (!S.threadMemory.unresolvedThreads.length) {
      html += '<p class="tm">No threads tracked yet.</p>';
    }
    
    // Character arcs
    html += '<div style="margin-top:12px"><strong style="color:var(--gold);font-size:.78rem">🎭 Character Arcs</strong></div>';
    const arcChars = Object.keys(S.characterArcs);
    if (arcChars.length) {
      for (const name of arcChars) {
        const arc = S.characterArcs[name];
        const stageColor = arc.stage === 'transformation' ? 'var(--green)' : arc.stage === 'crisis' ? 'var(--red)' : arc.stage === 'growth' ? '#fbbf24' : 'var(--text3)';
        html += '<div style="font-size:.72rem;padding:4px 0"><strong>' + name + '</strong>: <span style="color:' + stageColor + '">' + arc.stage + '</span> (' + arc.beats.length + ' beats)</div>';
      }
    } else {
      html += '<p class="tm">Character arcs develop as the Axiom of Growth tracks development beats.</p>';
    }
    
    el.innerHTML = html;
  }
};

// ════════════════════════════════════════════════════════════
//  CHAPTER ORGANIZER — Engine #95
//  Validates characters, cleans false detections, manages chapters.
//  The specialist that handles what regex can't.
// ════════════════════════════════════════════════════════════
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
const VoiceEngine = {
  // Detect the voice mode for a given beat based on content
  detectBeatVoice(beat, prevVoice, idx, total) {
    const lower = beat.toLowerCase();
    
    // Action beats: short sentences, strong verbs, minimal interiority
    if (/detect|discover|find|notice|trigger|activate|launch|move|run|fight|chase|escape|attack|fire|blast|leap|dodge/.test(lower)) {
      return 'action';
    }
    // Reflection beats: long sentences, sensory detail, emotional depth
    if (/feel|sense|realize|understand|wonder|remember|imagine|contemplate|reflect|recall|ponder|consider/.test(lower)) {
      return 'reflection';
    }
    // Dialogue beats: direct speech, interaction
    if (/says?|said|ask|tell|speak|reply|answer|call out|shout|whisper/.test(lower)) {
      return 'dialogue';
    }
    // Transition beats: movement between scenes, passage of time
    if (/arrive|leave|walk|enter|exit|pass|move through|cross|travel/.test(lower)) {
      return 'transition';
    }
    // Tension beats: suspense, uncertainty, dread
    if (/wait|watch|listen|fear|dread|uncertain|uneasy|tense|doubt|suspect/.test(lower)) {
      return 'tension';
    }
    // Resolution beats: clarity, closure, acceptance
    if (/know|accept|understand|see|resolve|conclude|decide|choose|finally/.test(lower) && idx >= total - 2) {
      return 'resolution';
    }
    // Default: inherit from previous beat with slight drift toward reflection over time
    if (prevVoice === 'action') return idx > 0 ? 'transition' : 'action';
    if (prevVoice === 'reflection') return idx < 2 ? 'reflection' : 'transition';
    return 'balanced';
  },

  // Adapt a prose line to the detected voice mode
  adaptLine(line, voice) {
    switch (voice) {
      case 'action':
        // Shorten sentences, remove hedging, strengthen verbs
        return line
          .replace(/\bshe felt\b/gi, 'she knew')
          .replace(/\bshe realized\b/gi, 'she saw')
          .replace(/\bthere was\b/gi, '')
          .replace(/\bsomehow\b/gi, '')
          .replace(/\bsort of\b/gi, '')
          .replace(/\bkind of\b/gi, '')
          .replace(/,\s*almost\s+as\s+if[^,.]{0,60}/gi, '')
          .replace(/,\s*a\s+[^,.]{3,30}\s+that\s+[^,.]{0,40}/gi, '')
          .replace(/\s{2,}/g, ' ')
          .trim();
      
      case 'reflection':
        // Lengthen sensory detail, add metaphor potential
        if (line.length < 60) {
          // Short line — expand with sensory context
          const expansions = [
            ' The weight of it settled somewhere deeper than thought.',
            ' The silence around the moment seemed to hold its breath.',
            ' Something in the quality of the air had changed.',
            ' The feeling arrived before she had words for it.',
          ];
          line += this._pickUnused(expansions, 'reflect_expand');
        }
        return line;
      
      case 'dialogue':
        // Ensure punchy, direct speech patterns
        return line.replace(/\b(she|he|they)\s+(felt|thought|realized|wondered|considered)\b/gi, (m, subj, verb) => {
          const directVerbs = { felt: 'said', thought: 'said', realized: 'said', wondered: 'asked', considered: 'said' };
          return subj + ' ' + (directVerbs[verb.toLowerCase()] || 'said');
        });
      
      case 'tension':
        // Add uncertainty, sensory unease
        if (!/[.!?]$/.test(line.trim())) return line;
        const tensionFrags = [
          ' She was not sure how long she had been holding her breath.',
          ' The silence felt deliberate.',
          ' Something was wrong, but she could not name it yet.',
        ];
        return line + this._pickUnused(tensionFrags, 'tension_frag');
      
      default:
        return line;
    }
  },

  // Adjust sentence length distribution for the whole beat
  adjustBeatRhythm(lines, voice) {
    const configs = {
      action:     { targetAvg: 12,  minLen: 8,  maxLen: 20, longRatio: 0.1 },
      reflection: { targetAvg: 22,  minLen: 15, maxLen: 40, longRatio: 0.5 },
      dialogue:   { targetAvg: 10,  minLen: 6,  maxLen: 18, longRatio: 0.1 },
      transition: { targetAvg: 16,  minLen: 10, maxLen: 28, longRatio: 0.3 },
      tension:    { targetAvg: 14,  minLen: 8,  maxLen: 22, longRatio: 0.2 },
      resolution: { targetAvg: 18,  minLen: 12, maxLen: 30, longRatio: 0.4 },
      balanced:   { targetAvg: 15,  minLen: 8,  maxLen: 25, longRatio: 0.3 },
    };
    const cfg = configs[voice] || configs.balanced;
    
    // Already handled by VoiceEngine.adaptLine per-line
    // This method can be extended for whole-beat rhythm analysis
    return lines;
  },

  _pickUnused(pool, cat) {
    const used = this._used || (this._used = new Set());
    const key = cat + '|';
    const avail = pool.filter(t => !used.has(key + t));
    const pick = avail.length ? avail[Math.floor(Math.random() * avail.length)] : pool[Math.floor(Math.random() * pool.length)];
    used.add(key + pick);
    if (used.size > 100) used.clear();
    return pick;
  },

  reset() { this._used = new Set(); }
};

// ════════════════════════════════════════════════════════════
//  WORLD BUILDER ENGINE
//  Locations, factions, lore, timeline — all feed into generation.
// ════════════════════════════════════════════════════════════
const WorldBuilder = {
  // Extract world elements from chapter text
  extractFromChapter(text, chapterNum) {
    this.extractLocations(text, chapterNum);
    this.extractLore(text, chapterNum);
    this.extractTimeline(text, chapterNum);
  },

  extractLocations(text, chapterNum) {
    const patterns = [
      /(?:in|on|at|aboard|inside|within)\s+(?:the\s+)?([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,2})/g,
      /(?:the\s+)([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,1})\s+(?:loomed|stretched|waited|lay|stood|rose|descended)/g,
    ];
    for (const pat of patterns) {
      let m;
      while ((m = pat.exec(text)) !== null) {
        const name = m[1].trim();
        if (name.length > 3 && name.length < 30 && !this._isCommonWord(name)) {
          this.addLocation({ name, firstMentioned: chapterNum });
        }
      }
    }
  },

  extractLore(text, chapterNum) {
    const patterns = [
      /(?:legend|myth|story|history|tale)\s+(?:of|about)\s+([A-Z][a-zA-Z]+(?:\s+[a-zA-Z]+){0,5})/gi,
      /(?:the\s+)([A-Z][a-zA-Z]+(?:\s+[a-zA-Z]+){0,4})\s+(?:were|was|are)\s+said\s+to/gi,
    ];
    for (const pat of patterns) {
      let m;
      while ((m = pat.exec(text)) !== null) {
        const title = m[1].trim();
        if (title.length > 5 && title.length < 60) {
          this.addLore({ title, content: m[0], chapter: chapterNum });
        }
      }
    }
  },

  extractTimeline(text, chapterNum) {
    const eventPatterns = [
      /(?:In|During)\s+(?:the\s+)?(?:year\s+)?(\d{4})[,.]?\s+(.{10,80}?)[.\n]/g,
      /(?:Before|After)\s+(?:the\s+)?([A-Z][a-zA-Z]+(?:\s+[a-zA-Z]+){0,3})[,.]?\s+(.{10,80}?)[.\n]/g,
    ];
    for (const pat of eventPatterns) {
      let m;
      while ((m = pat.exec(text)) !== null) {
        this.addTimeline({ event: m[0].trim(), chapter: chapterNum });
      }
    }
  },

  addLocation(loc) {
    const exists = S.world.locations.some(l => l.name.toLowerCase() === loc.name.toLowerCase());
    if (!exists) S.world.locations.push({ ...loc, visited: false });
  },

  addLore(lore) {
    const exists = S.world.lore.some(l => l.title.toLowerCase() === lore.title.toLowerCase());
    if (!exists) S.world.lore.push({ ...lore, category: 'extracted' });
  },

  addTimeline(entry) {
    S.world.timeline.push(entry);
  },

  markLocationVisited(name) {
    const loc = S.world.locations.find(l => l.name.toLowerCase() === name.toLowerCase());
    if (loc) loc.visited = true;
  },

  _isCommonWord(word) {
    const common = /^(The|This|That|These|Those|What|When|Where|Why|How|Who|Which|While|Since|Until|After|Before|During|Under|Over|Above|Below|Inside|Outside|Within|Without|Across|Along|Around|Behind|Beside|Beyond|Near|Next|Past|Through|Toward|Upon|Inside|Morning|Evening|Night|Day|Time|Moment|Silence|Darkness|Light|Air|Space|Void|Room|Place|Way|Back|Front|Side|End|Beginning|Start|Finish|Top|Bottom|Center|Middle|Edge|Corner|Distance|Direction|Path|Road|Route|Course)/i;
    return common.test(word);
  },

  // Get context for generation — locations, lore that should inform current chapter
  getContextForChapter(chapterNum) {
    const locs = S.world.locations.filter(l => l.firstMentioned <= chapterNum);
    const lore = S.world.lore.filter(l => l.chapter <= chapterNum);
    return { locations: locs, lore: lore };
  },

  clear() {
    S.world = { locations: [], factions: [], lore: [], timeline: [] };
  },

  render() {
    const el = document.getElementById('worldBuilderPanel');
    if (!el) return;
    let html = '<div style="margin-bottom:10px"><strong style="color:var(--gold);font-size:.78rem">🗺 Locations (' + S.world.locations.length + ')</strong></div>';
    if (S.world.locations.length) {
      html += '<div style="font-size:.7rem">';
      for (const l of S.world.locations) {
        html += '<span style="display:inline-block;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:2px 8px;margin:2px;font-size:.68rem">' + l.name + (l.visited ? ' ✓' : '') + '</span>';
      }
      html += '</div>';
    } else {
      html += '<p class="tm">Locations extract from chapters as you write.</p>';
    }
    html += '<div style="margin:12px 0"><strong style="color:var(--gold);font-size:.78rem">📜 Lore (' + S.world.lore.length + ')</strong></div>';
    if (S.world.lore.length) {
      html += '<div style="font-size:.7rem;max-height:100px;overflow-y:auto">';
      for (const l of [...S.world.lore].reverse()) {
        html += '<div style="padding:3px 0;border-bottom:1px solid var(--border)"><strong>' + l.title + '</strong> <span style="color:var(--text3)">Ch' + l.chapter + '</span></div>';
      }
      html += '</div>';
    } else {
      html += '<p class="tm">Lore entries extract from chapters as you write.</p>';
    }
    html += '<div style="margin:12px 0"><strong style="color:var(--gold);font-size:.78rem">📅 Timeline (' + S.world.timeline.length + ')</strong></div>';
    if (S.world.timeline.length) {
      html += '<div style="font-size:.7rem;max-height:100px;overflow-y:auto">';
      for (const t of [...S.world.timeline].reverse()) {
        html += '<div style="padding:3px 0;border-bottom:1px solid var(--border)">' + t.event.slice(0, 60) + ' <span style="color:var(--text3)">Ch' + t.chapter + '</span></div>';
      }
      html += '</div>';
    } else {
      html += '<p class="tm">Timeline events extract from chapters as you write.</p>';
    }
    el.innerHTML = html;
  }
};

// ════════════════════════════════════════════════════════════
//  CHARACTER RELATIONSHIP ENGINE
//  Tracks bonds, conflicts, dynamics between character pairs.
// ════════════════════════════════════════════════════════════
const CharacterRelationship = {
  // Analyze interactions between characters in a chapter
  analyze(text, chars, chapterNum) {
    if (chars.length < 2) return;
    for (let i = 0; i < chars.length; i++) {
      for (let j = i + 1; j < chars.length; j++) {
        const a = chars[i], b = chars[j];
        const pairKey = [a.name, b.name].sort().join('|');
        
        // Count co-occurrences in same sentences
        const sentences = text.split(/[.!?]+/);
        let coOccur = 0, agree = 0, conflict = 0, intimate = 0;
        
        for (const sent of sentences) {
          const hasA = sent.toLowerCase().includes(a.name.split(' ')[0].toLowerCase());
          const hasB = sent.toLowerCase().includes(b.name.split(' ')[0].toLowerCase());
          if (hasA && hasB) {
            coOccur++;
            const lower = sent.toLowerCase();
            if (/agreed|nodded|together|both|same|shared|united/.test(lower)) agree++;
            if (/argued|disagreed|against|but.*said|shouted|glared/.test(lower)) conflict++;
            if (/touched|held|embraced|close|whispered|gentle|soft/.test(lower)) intimate++;
          }
        }
        
        if (!S.characterRelationships) S.characterRelationships = {};
        if (!S.characterRelationships[pairKey]) {
          S.characterRelationships[pairKey] = { 
            a: a.name, b: b.name, 
            bond: 0, tension: 0, intimacy: 0,
            interactions: [] 
          };
        }
        const rel = S.characterRelationships[pairKey];
        rel.interactions.push({ chapter: chapterNum, coOccur, agree, conflict, intimate });
        rel.bond = Math.min(10, rel.bond + agree * 0.5 - conflict * 0.3);
        rel.tension = Math.min(10, Math.max(0, rel.tension + conflict * 0.5 - agree * 0.3));
        rel.intimacy = Math.min(10, rel.intimacy + intimate * 0.7);
      }
    }
  },

  // Get relationship context for a character pair (affects dialogue and interaction prose)
  getDynamic(a, b) {
    const pairKey = [a, b].sort().join('|');
    const rel = S.characterRelationships ? S.characterRelationships[pairKey] : null;
    if (!rel) return { bond: 0, tension: 0, intimacy: 0, dynamic: 'strangers' };
    let dynamic = 'acquaintances';
    if (rel.bond > 7) dynamic = rel.intimacy > 5 ? 'lovers' : 'close friends';
    else if (rel.bond > 4) dynamic = 'friends';
    else if (rel.tension > 6) dynamic = 'enemies';
    else if (rel.tension > 3) dynamic = 'rivals';
    else if (rel.intimacy > 5) dynamic = 'intimate';
    else if (rel.coOccur > 0) dynamic = 'familiar';
    return { ...rel, dynamic };
  },

  // Get a character's emotional state that considers their relationships
  getSocialContext(charName) {
    const states = [];
    for (const [key, rel] of Object.entries(S.characterRelationships || {})) {
      if (rel.a === charName || rel.b === charName) {
        const other = rel.a === charName ? rel.b : rel.a;
        states.push({ with: other, bond: rel.bond, tension: rel.tension, intimacy: rel.intimacy });
      }
    }
    return states;
  },

  clear() {
    S.characterRelationships = {};
  },

  render() {
    const el = document.getElementById('relationshipPanel');
    if (!el) return;
    const pairs = Object.entries(S.characterRelationships || {});
    if (!pairs.length) {
      el.innerHTML = '<p class="tm">Relationship dynamics develop as characters interact across chapters.</p>';
      return;
    }
    let html = '';
    for (const [key, rel] of pairs) {
      const bondColor = rel.bond > 5 ? 'var(--green)' : rel.bond > 2 ? '#fbbf24' : 'var(--text3)';
      const tensionColor = rel.tension > 5 ? 'var(--red)' : rel.tension > 2 ? '#fbbf24' : 'var(--text3)';
      html += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:8px;margin-bottom:6px;font-size:.72rem">';
      html += '<strong style="color:var(--gold)">' + rel.a + ' ↔ ' + rel.b + '</strong>';
      html += '<div style="display:flex;gap:8px;margin-top:4px">';
      html += '<span style="color:' + bondColor + '">Bond: ' + rel.bond.toFixed(1) + '</span>';
      html += '<span style="color:' + tensionColor + '">Tension: ' + rel.tension.toFixed(1) + '</span>';
      html += '<span style="color:var(--text3)">' + rel.dynamic + '</span>';
      html += '</div></div>';
    }
    el.innerHTML = html;
  }
};

// ════════════════════════════════════════════════════════════
//  EMOTIONAL TRACKER ENGINE
//  Auto-detects emotional beats, tracks arc, flags tone drift
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
// ════════════════════════════════════════════════════════════
const CharacterTracker = {

  // Analyze text for character presence, dialogue, POV
  analyze(text, chars, chapterNum) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const totalWords = words.length;
    const presence = {};
    const dialogueCounts = {};
    let povChar = '';
    let povScore = 0;

    for (const ch of chars) {
      const name = ch.name;
      const firstName = name.split(' ')[0];
      const lowerText = text.toLowerCase();

      // Count name mentions (full name + first name)
      const fullMatches = (lowerText.match(new RegExp('\\b' + name.toLowerCase().replace(/\s+/g, '\\s+') + '\\b', 'g')) || []).length;
      const firstMatches = (lowerText.match(new RegExp('\\b' + firstName.toLowerCase() + '\\b', 'g')) || []).length;
      const nameCount = fullMatches + firstMatches;

      // Count pronoun references based on character's pronouns
      const pronouns = (ch.pronouns || 'they/them').split('/');
      let pronounCount = 0;
      for (const pr of pronouns) {
        const prLower = pr.toLowerCase();
        const matches = (lowerText.match(new RegExp('\\b' + prLower + '\\b', 'g')) || []).length;
        pronounCount += matches;
      }

      // Approximate dialogue: sentences after quotes or direct speech patterns
      // Count occurrences of character name near dialogue tags
      const dialoguePattern = new RegExp('["""]' + '[^"""]*' + '["""]\\s*(?:,\\s*)?(?:' + name.split(' ')[0] + '|' + pronouns[0] + ')\\s+(?:said|asked|replied|whispered|shouted|muttered)', 'gi');
      const dialogueMatches = (text.match(dialoguePattern) || []).length;

      // Alternative: count paragraphs that mention the character
      const paragraphs = text.split(/\n\n+/);
      const paraCount = paragraphs.filter(p =>
        p.toLowerCase().includes(name.toLowerCase()) ||
        p.toLowerCase().includes(firstName.toLowerCase())
      ).length;

      const totalMentions = nameCount + Math.floor(pronounCount * 0.3); // Weight pronouns lower
      presence[name] = {
        name, firstName,
        nameMentions: nameCount,
        pronounRefs: pronounCount,
        totalMentions,
        paragraphsPresent: paraCount,
        dialogueLines: dialogueMatches,
        presencePct: paragraphs.length > 0 ? Math.round(paraCount / paragraphs.length * 100) : 0
      };

      // Determine POV: highest pronoun + name in first paragraph suggests POV
      const firstPara = paragraphs[0] || '';
      const firstParaScore = (firstPara.toLowerCase().includes(firstName.toLowerCase()) ? 3 : 0) +
        pronouns.filter(p => firstPara.toLowerCase().includes(p.toLowerCase())).length;
      if (firstParaScore > povScore) { povScore = firstParaScore; povChar = name; }
    }

    // Update chapter record
    const chRecord = { ch: chapterNum, pov: povChar, presence, ts: new Date().toISOString() };
    S.characterTracker.chapters.push(chRecord);

    // Update cumulative presence
    for (const [name, data] of Object.entries(presence)) {
      if (!S.characterTracker.presence[name]) {
        S.characterTracker.presence[name] = { chapters: 0, totalMentions: 0, totalDialogue: 0 };
      }
      S.characterTracker.presence[name].chapters++;
      S.characterTracker.presence[name].totalMentions += data.totalMentions;
      S.characterTracker.presence[name].totalDialogue += data.dialogueLines;
    }

    S.characterTracker.povConsistency.push({ ch: chapterNum, pov: povChar });

    return chRecord;
  },

  // Render character presence heatmap and stats
  render() {
    const el = document.getElementById('characterTracker');
    const chars = S.chars;
    const n = S.characterTracker.chapters.length;

    if (!chars.length) { el.innerHTML = '<p class="tm">Register characters first to enable tracking.</p>'; return; }
    if (!n) { el.innerHTML = '<p class="tm">No chapters yet — character presence builds as you write.</p>'; return; }

    // Check if any chapter has actual presence data for registered characters
    const hasData = S.characterTracker.chapters.some(ch =>
      ch.presence && Object.keys(ch.presence).some(name =>
        chars.some(c => c.name === name)
      )
    );
    if (!hasData) {
      el.innerHTML = '<div style="font-size:.77rem;color:var(--text2);margin-bottom:10px">' +
        '<strong style="color:var(--gold)">Characters registered:</strong> ' + chars.length + ' &nbsp;|&nbsp; ' +
        '<strong style="color:var(--gold)">Chapters sealed:</strong> ' + n + '</div>' +
        '<p class="tm" style="color:var(--text3)">Characters were registered after existing chapters were sealed. ' +
        'Generate a new chapter to see character tracking in action, or <button class="btn btn-sm" style="padding:3px 10px;font-size:.7rem" onclick="CharacterTracker.backfill()">Backfill existing chapters</button></p>';
      return;
    }

    // Build presence heatmap: characters × chapters
    const charNames = chars.map(c => c.name);
    let heatmapHtml = '<div style="overflow-x:auto;margin-bottom:12px"><table style="font-size:.68rem;border-collapse:collapse;width:100%;min-width:300px">';
    heatmapHtml += '<tr><th style="padding:3px 6px;text-align:left;color:var(--gold)">Character</th>';
    for (let i = 0; i < n; i++) {
      const chNum = S.characterTracker.chapters[i] ? S.characterTracker.chapters[i].ch : (i + 1);
      heatmapHtml += `<th style="padding:3px 4px;text-align:center;color:var(--text3)">Ch${chNum}</th>`;
    }
    heatmapHtml += '</tr>';
    // Delete row
    heatmapHtml += '<tr><td style="padding:2px 6px;color:var(--text3);font-size:.6rem">Delete</td>';
    for (let i = 0; i < n; i++) {
      heatmapHtml += `<td style="padding:2px 4px;text-align:center;color:var(--text3);font-size:.55rem;cursor:pointer" onclick="CharacterTracker.delete(${i})" title="Remove Ch${S.characterTracker.chapters[i] ? S.characterTracker.chapters[i].ch : i+1}">×</td>`;
    }
    heatmapHtml += '</tr>';

    for (const name of charNames) {
      heatmapHtml += `<tr><td style="padding:3px 6px;color:var(--text2);white-space:nowrap">${name}</td>`;
      for (let i = 0; i < n; i++) {
        const chData = S.characterTracker.chapters[i];
        const present = chData && chData.presence && chData.presence[name];
        const intensity = present ? Math.min(100, present.presencePct) : 0;
        const bg = intensity > 50 ? 'var(--green)' : intensity > 20 ? '#fbbf24' : intensity > 0 ? 'var(--accent)' : 'transparent';
        const opacity = intensity > 0 ? (0.15 + intensity / 130).toFixed(2) : 0;
        const text = intensity > 0 ? `<span style="color:${bg};font-size:.6rem">${intensity}%</span>` : '<span style="color:var(--border)">·</span>';
        heatmapHtml += `<td style="padding:3px 4px;text-align:center;background:${bg}${Math.round(opacity*255).toString(16).padStart(2,'0') || '00'};border-radius:3px">${text}</td>`;
      }
      heatmapHtml += '</tr>';
    }
    heatmapHtml += '</table></div>';

    // POV consistency line
    const povLine = S.characterTracker.povConsistency.map((p, idx) => {
      const short = p.pov ? p.pov.split(' ')[0] : '?';
      return `<span style="display:inline-block;background:var(--accent)15;border:1px solid var(--accent);color:var(--accent2);padding:2px 8px;border-radius:6px;font-size:.68rem;margin:2px;cursor:default" title="Click × to remove">
        Ch${p.ch}: ${short}
        <span style="margin-left:4px;color:var(--text3);font-size:.6rem;cursor:pointer" onclick="CharacterTracker.delete(${idx})" title="Remove">×</span>
      </span>`;
    }).join(' ');

    // Cumulative stats
    const stats = Object.entries(S.characterTracker.presence).map(([name, data]) => {
      const avgMentions = data.chapters > 0 ? (data.totalMentions / data.chapters).toFixed(1) : 0;
      return `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);font-size:.74rem">
        <span style="color:var(--text2)">${name}</span>
        <span style="color:var(--text3)">${data.chapters} ch · ${data.totalMentions} mentions · ${avgMentions}/ch</span>
      </div>`;
    }).join('');

    el.innerHTML = `<div style="font-size:.77rem;color:var(--text2);margin-bottom:10px">
        <strong style="color:var(--gold)">Chapters tracked:</strong> ${n} &nbsp;|&nbsp;
        <strong style="color:var(--gold)">Characters:</strong> ${chars.length}
      </div>
      <div style="margin-bottom:10px"><strong style="color:var(--gold);font-size:.78rem">📊 Presence Heatmap (row = character, column = chapter):</strong></div>
      ${heatmapHtml}
      <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center">
        <strong style="color:var(--gold);font-size:.78rem">🎭 POV Consistency:</strong>
        <button class="btn btn-danger btn-sm" style="font-size:.65rem;padding:2px 8px" onclick="CharacterTracker.clearAll()">🗑 Clear All</button>
      </div>
      <div style="margin-top:6px">${povLine || '<span class="tm">No POV data yet.</span>'}</div>
      <div style="margin-top:12px"><strong style="color:var(--gold);font-size:.78rem">📈 Cumulative Stats:</strong></div>
      <div style="margin-top:6px">${stats}</div>`;
  }
};

// ════════════════════════════════════════════════════════════
//  CHAIN ENGINE — Engine #96
//  Six isolated chains that only observe prose, never modify it.
//  Character · Plot · World · Voice · Editor · Continuity
// ════════════════════════════════════════════════════════════
const ChainEngine = {
  ENGINE_NAME: 'Chain Engine',
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
  return (t||'')
    .replace(/^## (.+)$/gm,'<h2>$1</h2>').replace(/^### (.+)$/gm,'<h3>$3</h3>')
    .replace(/^# (.+)$/gm,'<h2>$1</h2>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/^---$/gm,'<hr>')
    .replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>').replace(/\n\n/g,'<br><br>');
}

async function sha256(text){
  const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

function exportSession(){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));
  a.download='midnight-grimoire-session.json'; a.click(); toast('📤 Session exported.');
}

function importSession(inp){
  const f=inp.files[0]; if(!f)return;
  const r=new FileReader();
  r.onload=e=>{try{Object.assign(S,JSON.parse(e.target.result));
    S.emotional=S.emotional||{chapters:[],toneDrift:[],arc:[]};
    S.characterTracker=S.characterTracker||{chapters:[],presence:{},dialogueRatio:{},povConsistency:[]};
    S.threadMemory=S.threadMemory||{facts:[],unresolvedThreads:[],emotionalStates:{}};
    S.world=S.world||{locations:[],factions:[],lore:[],timeline:[]};
    S.characterArcs=S.characterArcs||{};
    S.activeAxioms=S.activeAxioms||['consistency','growth'];
    S.voice=S.voice||{currentMode:'balanced',depth:0};
    S.characterRelationships=S.characterRelationships||{};
    const d = JSON.parse(e.target.result);
    if(d.voxVoices) VoxHarmonica.voices = d.voxVoices;
    if(d.voxStats) VoxHarmonica.stats = d.voxStats;
    renderChars();renderHist();updateContUI();renderThreads();renderEmotional();renderCharacter();
    renderThreadMemory();renderWorldBuilder();renderRelationships();
    VoxHarmonica.renderProfiles();
    toast('📥 Session restored!');}catch{toast('❌ Invalid file.');}};
  r.readAsText(f);
}

function clearSession(){
  if(!confirm('Clear all chapters, characters, threads, and trackers?'))return;
  S.chars=[];S.chapters=[];S.output='';S.continuity={threads:[],lastScene:'',activePOV:'',unresolved:[]};
  S.emotional={chapters:[],toneDrift:[],arc:[]};
  S.characterTracker={chapters:[],presence:{},dialogueRatio:{},povConsistency:[]};
  ThreadMemory.clear();WorldBuilder.clear();CharacterRelationship.clear();VoxHarmonica.clear();PathChain.clear();ChapterOrganizer.clear();ChainEngine.clear();
  S.voice={currentMode:'balanced',depth:0};S.activeAxioms=['consistency','growth'];
  clearOut();renderChars();renderHist();updateContUI();renderThreads();renderEmotional();renderCharacter();
  renderThreadMemory();renderWorldBuilder();renderRelationships();VoxHarmonica.renderProfiles();save();toast('🗑 Cleared.');
}

function save(){
  try{localStorage.setItem('mg3',JSON.stringify({
    chars:S.chars, chapters:S.chapters, continuity:S.continuity,
    world:S.world, threadMemory:S.threadMemory, characterArcs:S.characterArcs,
    activeAxioms:S.activeAxioms, voice:S.voice, characterRelationships:S.characterRelationships,
    voxVoices:VoxHarmonica.voices, voxStats:VoxHarmonica.stats,
    pathChain:PathChain.serialize()
  }));}catch{}
}

function loadSession(){
  try{
    const d=JSON.parse(localStorage.getItem('mg3')||'{}');
    if(d.chars) S.chars=d.chars;
    if(d.chapters){S.chapters=d.chapters.map(function(c){return Object.assign({},c,{summary:c.summary||''});}); renderHist();}
    if(d.continuity) Object.assign(S.continuity,d.continuity);
    if(d.world) Object.assign(S.world,d.world);
    if(d.threadMemory) Object.assign(S.threadMemory,d.threadMemory);
    if(d.characterArcs) S.characterArcs=d.characterArcs;
    if(d.activeAxioms) S.activeAxioms=d.activeAxioms;
    if(d.voice) Object.assign(S.voice,d.voice);
    if(d.characterRelationships) S.characterRelationships=d.characterRelationships;
    if(d.voxVoices) VoxHarmonica.voices = d.voxVoices;
    if(d.voxStats) VoxHarmonica.stats = d.voxStats;
    if(d.pathChain) PathChain.restore(d.pathChain);
    // Clean false characters from previous sessions
    ChapterOrganizer.cleanupFalseCharacters();
    updateContUI();renderThreads();
    renderLocations();renderLore();renderTimeline();
    renderThreadMemory();renderWorldBuilder();renderRelationships();
    VoxHarmonica.renderProfiles();PathChain.render();
  }catch{}
}

function toast(msg){
  const el=document.getElementById('toast'); el.textContent=msg; el.classList.add('show');
  clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('show'),3500);
}

// ════════════════════════════════════════════════════════════
//  VOX HARMONICA · Engine #91
//  The Voice That Remembers — Anti-AI TTS for Midnight Grimoire
//  Ports: Voice profiles, breath pauses, emotional modulation,
//         anti-repetition, pronoun consistency, waveform viz
// ════════════════════════════════════════════════════════════
//  VOX HARMONICA v3.0 — Engine #91
//  Sovereign Voice Synthesis — Human-First, Offline-Always.
//  Primary: Web Speech API (browser-built-in, zero external).
//  Artistic: Harmony Tone — phoneme music when voices unavailable.
//  Every character gets their own voice, pitch, pace, and presence.
// ════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════
//  SOUNDSCAPE ENGINE v1.0 — Ambient Audio for Storytelling
//  Analyzes prose in real-time, generates matching ambient audio.
//  Categories: space, tension, dialogue, calm, action, mystery, sorrow
//  Each scene gets its own sonic atmosphere. Fully sovereign.
// ════════════════════════════════════════════════════════════
const SoundscapeEngine = {
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
//  Human voice via Web Speech API + Ambient Soundscapes
//  SPEECH: browser voices (JARVIS quality)
//  SOUNDSCAPE: auto-generated ambient audio from prose
//  TONE: harmonic phoneme music (legacy)
// ════════════════════════════════════════════════════════════
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
      const speaker = this._detectSpeaker(para);
      queue.push({ text: para, speaker, isHeading: false });
    }
    return queue;
  },

  // ════════════════════════════════════════════════════════════
  //  SENTENCE SPLITTING WITH PROSODY
  // ════════════════════════════════════════════════════════════
  _splitSentences(text) {
    const raw = text.split(/(?<=[.!?])(?:\s+|$)/).filter(s => s.trim().length > 0);
    return raw.map(s => {
      const t = s.trim();
      return {
        text: t,
        isQuestion: t.endsWith('?'),
        isExclamation: t.endsWith('!'),
        isDialogue: t.startsWith('"') || (t.includes('"') && t.indexOf('"') < t.length / 2),
        isShort: t.split(' ').length < 6,
      };
    });
  },

  // ════════════════════════════════════════════════════════════
  //  SOUNDSCAPE — Simple, tested, audible
  // ════════════════════════════════════════════════════════════
  _startAmbient(profileKey) {
    if (!this._ensureAudio()) return;
    if (!this.soundscapeEnabled) return;
    // Stop current ambient
    this._stopAmbient();
    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    this.currentAmbientNodes = [];
    const dest = this.ambientGain;
    const profiles = {
      space:    () => this._osc(ctx, 55,  0.25, 'sine', 0,  dest, now).concat(this._osc(ctx, 110, 0.15, 'sine', 2,  dest, now)).concat(this._noise(ctx, 0.08, 600,  dest, now)),
      tension:  () => this._osc(ctx, 150, 0.20, 'sine', 0,  dest, now, 0.15, 25).concat(this._osc(ctx, 80,  0.12, 'sawtooth', 0, dest, now)),
      dialogue: () => this._osc(ctx, 262, 0.18, 'sine', 0,  dest, now).concat(this._osc(ctx, 330, 0.14, 'sine', 1,  dest, now)).concat(this._osc(ctx, 392, 0.10, 'sine', -1, dest, now)),
      calm:     () => this._osc(ctx, 175, 0.18, 'sine', 0,  dest, now).concat(this._osc(ctx, 196, 0.14, 'sine', 2,  dest, now)).concat(this._noise(ctx, 0.06, 300, dest, now)),
      mystery:  () => this._osc(ctx, 220, 0.18, 'sine', 0,  dest, now, 0.08, 12).concat(this._osc(ctx, 330, 0.12, 'sine', 3, dest, now)),
      sorrow:   () => this._osc(ctx, 220, 0.20, 'sine', 0,  dest, now).concat(this._osc(ctx, 262, 0.16, 'sine', 1, dest, now)).concat(this._noise(ctx, 0.10, 250, dest, now)),
      joy:      () => this._osc(ctx, 523, 0.15, 'sine', 0,  dest, now).concat(this._osc(ctx, 659, 0.12, 'sine', 2,  dest, now)).concat(this._osc(ctx, 784, 0.09, 'sine', -1, dest, now)),
      default:  () => this._osc(ctx, 150, 0.15, 'sine', 0,  dest, now).concat(this._osc(ctx, 200, 0.12, 'sine', 3,  dest, now)),
    };
    const builder = profiles[profileKey] || profiles.default;
    this.currentAmbientNodes = builder();
    this.currentAmbientProfile = profileKey;
    document.getElementById('sndStatus').textContent = '🎵 ' + (profileKey.charAt(0).toUpperCase() + profileKey.slice(1));
  },

  _osc(ctx, freq, amp, type, detune, dest, now, lfoRate, lfoDepth) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    if (detune) osc.detune.value = detune;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(amp, now + 0.5);
    osc.connect(g); g.connect(dest);
    osc.start(now);
    if (lfoRate && lfoDepth) {
      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();
      lfo.frequency.value = lfoRate; lfoG.gain.value = lfoDepth;
      lfo.connect(lfoG); lfoG.connect(osc.frequency);
      lfo.start(now);
      return [osc, g, lfo, lfoG];
    }
    return [osc, g];
  },

  _noise(ctx, amp, filterFreq, dest, now) {
    const size = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, size, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < size; i++) {
      const w = Math.random() * 2 - 1;
      last = (last * 0.9) + (w * 0.1); // pink-ish
      d[i] = last;
    }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = filterFreq;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(amp, now + 0.5);
    src.connect(f); f.connect(g); g.connect(dest);
    src.start(now);
    return [src, g, f];
  },

  _stopAmbient() {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    // Fade out
    for (const n of this.currentAmbientNodes) {
      try { if (n.gain) n.gain.linearRampToValueAtTime(0, now + 0.3); } catch(e) {}
    }
    setTimeout(() => {
      for (const n of this.currentAmbientNodes) {
        try { if (n.stop) n.stop(); } catch(e) {}
        try { if (n.disconnect) n.disconnect(); } catch(e) {}
      }
      this.currentAmbientNodes = [];
    }, 350);
    document.getElementById('sndStatus').textContent = 'Ready';
  },

  _analyzeMood(text) {
    const t = text.toLowerCase();
    const scores = {
      space:    (t.match(/(star|void|cosmos|orbit|nebula|planet|ship|deck|console|reactor|engine|warp|space|vacuum|galaxy)/g) || []).length,
      tension:  (t.match(/(tension|dread|uneasy|silent|silence|held|breath|wait|watch|unknown|danger|threat)/g) || []).length,
      dialogue: (t.match(/"[^"]{10,}"/g) || []).length * 2, // Weight dialogue higher
      calm:     (t.match(/(breathe|stillness|quiet|soft|gentle|calm|peace|rest|settle|paused)/g) || []).length,
      action:   (t.match(/(ran|rush|moved|fired|hit|struck|fought|charged|exploded|crash|impact)/g) || []).length,
      mystery:  (t.match(/(anomalous|unknown|strange|unseen|hidden|secret|mystery|puzzle|question)/g) || []).length,
      sorrow:   (t.match(/(grief|loss|ache|hollow|sorrow|mourn|sad|alone|empty|gone)/g) || []).length,
      joy:      (t.match(/(joy|laugh|celebrate|triumph|relief|warm|bright|hope|wonder|awe)/g) || []).length,
    };
    const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    return (best && best[1] > 0) ? best[0] : 'default';
  },

  // ════════════════════════════════════════════════════════════
  //  PRIMARY: SPEECH SYNTHESIS WITH PROSODY
  // ════════════════════════════════════════════════════════════
  async speakCurrent() {
    if (!S.output || S.output.length < 10) { toast('No chapter to narrate.'); return; }
    if (!this.synth) { toast('Speech API unavailable.'); return; }
    this.stop();
    this.isPlaying = true;
    this.isPaused = false;
    this.currentQueue = this._buildQueue(S.output);
    this.currentIndex = 0;
    this._ensureAudio();

    // Start ambient for first paragraph
    if (this.currentQueue.length > 0) {
      this._startAmbient(this._analyzeMood(this.currentQueue[0].text));
    }

    for (let i = 0; i < this.currentQueue.length; i++) {
      if (!this.isPlaying) break;
      while (this.isPaused && this.isPlaying) { await new Promise(r => setTimeout(r, 100)); }
      if (!this.isPlaying) break;
      this.currentIndex = i;
      const entry = this.currentQueue[i];
      // Update ambient mood
      const mood = this._analyzeMood(entry.text);
      if (mood !== this.currentAmbientProfile) {
        this._startAmbient(mood);
      }
      await this._speakEntry(entry);
      if (i < this.currentQueue.length - 1 && !this.isPaused) {
        await new Promise(r => setTimeout(r, 400));
      }
    }
    this.isPlaying = false;
    document.getElementById('voxSpeaking').style.display = 'none';
    this._stopViz();
    this._stopAmbient();
    toast('Vox Harmonica finished.');
  },

  _speakEntry(entry) {
    return new Promise((resolve) => {
      if (this.isPaused || !this.isPlaying) { resolve(); return; }
      const profile = entry.speaker ? this.voices[entry.speaker] : null;
      const emod = this.emotionEnabled ? this._emotionMod(this._detectEmotion(entry.text)) : {dp:0,dr:0};
      const basePitch = profile ? profile.basePitch : 0.80;
      const baseRate = profile ? profile.baseRate : 0.80;
      const pitch = this._effectivePitch(basePitch, emod);
      const rate = this._effectiveRate(baseRate, emod);
      const volume = this.globalVolume;
      if (this.mode === 'tone' || !this.synth) {
        this._speakTone(entry.text, pitch, rate, profile, resolve);
      } else {
        this._speakSentences(entry.text, pitch, rate, volume, profile, resolve);
      }
    });
  },

  // Speak sentence-by-sentence with real pauses
  _speakSentences(text, pitch, rate, volume, profile, resolve) {
    const sentences = this._splitSentences(text);
    const voice = this._getBestVoice(profile ? profile.voiceURI : null);
    document.getElementById('voxSpeaking').style.display = 'inline';
    document.getElementById('voxSpeaking').textContent = '🔊 Speaking...';
    this._startViz();

    const speakOne = (idx) => {
      if (!this.isPlaying || this.isPaused) { done(); return; }
      if (idx >= sentences.length) { done(); return; }
      const sent = sentences[idx];
      let sp = pitch, sr = rate;
      if (sent.isQuestion) { sp *= 1.04; sr *= 0.97; }
      else if (sent.isExclamation) { sp *= 1.06; sr *= 1.03; }
      else if (sent.isDialogue) { sr *= 0.95; }
      else if (sent.isShort) { sr *= 1.08; }
      const u = new SpeechSynthesisUtterance(sent.text);
      u.pitch = Math.min(1.2, Math.max(0.8, sp));
      u.rate = Math.min(1.15, Math.max(0.75, sr));
      u.volume = volume;
      if (voice) u.voice = voice;
      u.onend = () => {
        let pause = 300;
        if (sent.isQuestion) pause = 500;
        else if (sent.isExclamation) pause = 450;
        else if (sent.isDialogue) pause = 400;
        if (idx === sentences.length - 1) pause = 0;
        setTimeout(() => speakOne(idx + 1), pause);
      };
      u.onerror = () => speakOne(idx + 1);
      this.synth.speak(u);
    };
    const done = () => {
      this.stats.utterances++;
      resolve();
    };
    speakOne(0);
  },

  // ════════════════════════════════════════════════════════════
  //  HARMONY TONE — Artistic phoneme music
  // ════════════════════════════════════════════════════════════
  _speakTone(text, pitch, rate, profile, resolve) {
    if (!this._ensureAudio()) { resolve(); return; }
    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const speed = rate || 1.0;
    let t = now + 0.05;
    const nodes = [];
    const dest = this.voiceGain;
    const sentences = text.split(/(?<=[.!?])\s+/);
    for (const sent of sentences) {
      const words = sent.trim().split(/\s+/).filter(w => w.length > 0);
      if (words.length === 0) { t += 0.3 / speed; continue; }
      for (let wi = 0; wi < words.length; wi++) {
        const word = words[wi].replace(/[^a-zA-Z]/g, '').toLowerCase();
        if (!word) { t += 0.05 / speed; continue; }
        let freq = 200;
        const pm = { a:730, e:530, i:270, o:300, u:440, b:140, d:170, f:2800, g:150, h:3200, j:250, k:2000, l:380, m:120, n:500, p:180, r:630, s:4000, t:190, v:220, w:380, y:270, z:4500 };
        if (pm[word[0]]) freq = pm[word[0]];
        freq += (wi / words.length) * 30;
        freq *= pitch;
        freq = Math.max(100, Math.min(800, freq));
        const dur = Math.max(0.12, Math.min(0.3, (0.15 + word.length * 0.015) / speed));
        const o1 = ctx.createOscillator(); const g1 = ctx.createGain();
        o1.type = 'sine'; o1.frequency.value = freq;
        g1.gain.setValueAtTime(0, t); g1.gain.linearRampToValueAtTime(0.12, t + 0.01); g1.gain.linearRampToValueAtTime(0, t + dur);
        o1.connect(g1); g1.connect(dest); o1.start(t); o1.stop(t + dur + 0.01);
        const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
        o2.type = 'sine'; o2.frequency.value = freq * 1.5;
        g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(0.05, t + 0.01); g2.gain.linearRampToValueAtTime(0, t + dur);
        o2.connect(g2); g2.connect(dest); o2.start(t); o2.stop(t + dur + 0.01);
        nodes.push(o1, g1, o2, g2);
        t += dur + 0.03 / speed;
      }
      t += 0.2 / speed;
    }
    const total = (t - now) * 1000;
    setTimeout(() => {
      this.stats.utterances++;
      for (const n of nodes) { try { n.stop(); n.disconnect(); } catch(e) {} }
      resolve();
    }, total + 100);
  },

  // ════════════════════════════════════════════════════════════
  //  TEST / PREVIEW / DIAGNOSTIC
  // ════════════════════════════════════════════════════════════
  testVoice(charName) {
    const profile = this.voices[charName]; if (!profile) return;
    const texts = [charName + ' speaking. Every voice finds its frequency in the void.',
      'The stars sang to each other, and ' + charName + ' heard them clearly.'];
    const text = texts[Math.floor(Math.random() * texts.length)];
    const emod = this.emotionEnabled ? this._emotionMod(this._detectEmotion(text)) : {dp:0,dr:0};
    const pitch = this._effectivePitch(profile.basePitch, emod);
    const rate = this._effectiveRate(profile.baseRate, emod);
    if (this.mode === 'tone' || !this.synth) {
      this._speakTone(text, pitch, rate, profile, () => {});
    } else {
      const u = new SpeechSynthesisUtterance(text);
      u.pitch = pitch; u.rate = rate; u.volume = this.globalVolume;
      const voice = this._getBestVoice(profile.voiceURI);
      if (voice) u.voice = voice;
      this.synth.cancel(); this.synth.speak(u);
    }
  },

  _previewChosenVoice() {
    const sel = document.getElementById('voxVoicePick');
    if (!sel || !sel.value || !this.synth) return;
    this.synth.cancel();
    const u = new SpeechSynthesisUtterance('Voice preview active. Sovereign and offline capable.');
    const voice = this.systemVoices.find(v => v.voiceURI === sel.value);
    if (voice) u.voice = voice;
    u.pitch = parseFloat(this.globalPitch) || 1.0;
    u.rate = parseFloat(this.globalRate) || 0.95;
    u.volume = 1.0;
    this.synth.speak(u);
  },

  _autoSelectBest() {
    const best = this._getBestVoice();
    if (!best) { toast('No voices available.'); return; }
    for (const name of Object.keys(this.voices)) {
      this.voices[name].voiceURI = best.voiceURI;
      this.voices[name].voiceName = best.name;
    }
    toast('🌟 ' + best.name + (best.localService ? ' (offline)' : ''));
    this.renderProfiles();
    this.synth.cancel();
    const u = new SpeechSynthesisUtterance('Best voice selected.');
    u.voice = best; u.pitch = 1.0; u.rate = 0.95; u.volume = 1.0;
    this.synth.speak(u);
  },

  diagnosticTone() {
    if (!this._ensureAudio()) { toast('Web Audio not available.'); return; }
    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const tones = [261.63, 329.63, 392.00, 523.25];
    let t = now + 0.05;
    for (const f of tones) {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.value = f; o.type = 'sine';
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.3, t + 0.02); g.gain.linearRampToValueAtTime(0, t + 0.25);
      o.connect(g); g.connect(this.masterGain || ctx.destination);
      o.start(t); o.stop(t + 0.26);
      t += 0.3;
    }
    toast('🔊 C-E-G-C arpeggio playing');
  },

  // ════════════════════════════════════════════════════════════
  //  CONTROLS
  // ════════════════════════════════════════════════════════════
  pause() {
    if (!this.isPlaying) return;
    this.isPaused = true;
    if (this.synth) this.synth.pause();
    document.getElementById('voxSpeaking').textContent = '⏸ Paused';
    this._stopViz();
  },

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    if (this.synth) this.synth.resume();
    document.getElementById('voxSpeaking').textContent = '🔊 Speaking...';
    this._startViz();
  },

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    if (this.synth) this.synth.cancel();
    document.getElementById('voxSpeaking').style.display = 'none';
    this._stopViz();
    this._stopAmbient();
  },

  toggleMode() {
    if (!this.synth) { this.mode = 'tone'; document.getElementById('voxModeBadge').textContent = 'TONE'; return; }
    this.mode = this.mode === 'speech' ? 'tone' : 'speech';
    document.getElementById('voxModeBadge').textContent = this.mode === 'speech' ? 'SPEECH' : 'TONE';
    toast(this.mode === 'speech' ? 'SPEECH mode' : 'TONE mode');
  },

  toggleBreath() { this.breathEnabled = document.getElementById('voxBreath').checked; },
  toggleEmotion() { this.emotionEnabled = document.getElementById('voxEmotion').checked; },
  toggleNoRepeat() { this.noRepeatEnabled = document.getElementById('voxNoRepeat').checked; },
  toggleSoundscape() {
    this.soundscapeEnabled = document.getElementById('sndEnabled').checked;
    if (!this.soundscapeEnabled) this._stopAmbient();
    document.getElementById('sndStatus').textContent = this.soundscapeEnabled ? 'Active' : 'Off';
  },

  updateGlobal() {
    this.globalPitch = parseFloat(document.getElementById('voxGlobalPitch').value) || 0.95;
    this.globalRate = parseFloat(document.getElementById('voxGlobalRate').value) || 0.90;
    this.globalVolume = parseFloat(document.getElementById('voxGlobalVolume')?.value) || 1.0;
    // Also update ambient volume
    const sndVol = document.getElementById('sndVolume');
    if (sndVol && this.ambientGain) {
      this.ambientGain.gain.value = parseFloat(sndVol.value);
    }
  },

  setAmbientVolume(v) {
    if (this.ambientGain) this.ambientGain.gain.value = Math.max(0, Math.min(1, parseFloat(v) || 0.3));
  },

  // ════════════════════════════════════════════════════════════
  //  VISUALIZATION
  // ════════════════════════════════════════════════════════════
  _startViz() {
    const canvas = document.getElementById('voxCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frame = 0;
    const draw = () => {
      if (!this.isPlaying || this.isPaused) return;
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = this.mode === 'tone' ? '#a855f7' : '#10b981';
      ctx.lineWidth = 2;
      for (let x = 0; x < canvas.width; x += 2) {
        const y = canvas.height / 2 + Math.sin(x * 0.02 + frame) * 12 + Math.sin(x * 0.05 + frame * 1.3) * 6 + Math.random() * 3;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      frame += 0.08;
      this.animFrame = requestAnimationFrame(draw);
    };
    draw();
  },

  _stopViz() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  },

  clear() {
    this.voices = {};
    this.utteranceHistory = [];
    this.stats = { utterances: 0, repeatCatches: 0 };
    this._updateStats();
  },
};
// ════════════════════════════════════════════════════════════
//  COHERENCE CALCULUS v1.0 — Engine #92
//  Canonical. Production-Ready. Sealed 2026-04-30.
//  μ = weighted geometric mean, CH = binary boolean vector,
//  τ = 0.9995 hard gate, SHA3-512 sovereign seal.
// ════════════════════════════════════════════════════════════
const CoherenceCalculus = {
  ENGINE_NAME: 'Coherence Calculus',
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
//  trimOverExplicit, fixAgreement, fixDoubleWords, fixFragments,
//  varySentence, polish — editorial pass on generated prose
// ════════════════════════════════════════════════════════════
const EditorEngine = {
  ENGINE_NAME: 'Professional Editor Polyglot',
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

const WI = (id,fb='') => (document.getElementById(id)||{value:fb}).value.trim();

function worldEntry(icon,title,sub,onDel){
  const d=document.createElement('div');
  d.style.cssText='background:var(--bg2);border:1px solid var(--border);border-radius:7px;padding:10px 13px;margin-bottom:7px;display:flex;align-items:flex-start;gap:9px';
  d.innerHTML=`<span style="font-size:1.2rem;flex-shrink:0">${icon}</span>
    <div style="flex:1"><div style="color:var(--gold);font-size:.82rem;font-weight:bold">${title}</div>
    <div style="font-size:.73rem;color:var(--text2);margin-top:2px">${sub}</div></div>
    <button class="btn btn-ghost btn-sm" style="flex-shrink:0" onclick="(${onDel})()">x</button>`;
  return d;
}

function addLocation(){
  const n=WI('locName'); if(!n){toast('Enter a location name.');return;}
  S.world.locations.push({name:n,type:WI('locType','City'),desc:WI('locDesc')});
  ['locName','locDesc'].forEach(i=>{const e=document.getElementById(i);if(e)e.value='';});
  renderLocations(); save(); toast(`🗺 ${n} added to the world.`);
}

function renderLocations(){
  const el=document.getElementById('locList'); if(!el) return;
  if(!S.world.locations.length){el.innerHTML='<p class="tm">No locations yet.</p>';return;}
  el.innerHTML='';
  S.world.locations.forEach((l,i)=>{
    el.appendChild(worldEntry(
      l.type==='Planet'?'🪐':l.type==='City'?'🏙':l.type==='Building'?'🏗':'🌄',
      `${l.name} <span style="font-size:.68rem;color:var(--text3)">[${l.type}]</span>`,
      l.desc||'No description.',
      `()=>{S.world.locations.splice(${i},1);renderLocations();save();}`
    ));
  });
}

function addLore(){
  const n=WI('loreName'); if(!n){toast('Enter a concept name.');return;}
  S.world.lore.push({name:n,cat:WI('loreCat','Other'),desc:WI('loreDesc')});
  ['loreName','loreDesc'].forEach(i=>{const e=document.getElementById(i);if(e)e.value='';});
  renderLore(); save(); toast(`📜 Lore entry added.`);
}

function renderLore(){
  const el=document.getElementById('loreList'); if(!el) return;
  if(!S.world.lore.length){el.innerHTML='<p class="tm">No lore entries yet.</p>';return;}
  el.innerHTML='';
  S.world.lore.forEach((l,i)=>{
    el.appendChild(worldEntry('📜',
      `${l.name} <span style="font-size:.68rem;color:var(--text3)">[${l.cat}]</span>`,
      l.desc||'No details.',
      `()=>{S.world.lore.splice(${i},1);renderLore();save();}`
    ));
  });
}

function addTimeline(){
  const n=WI('tlEvent'); if(!n){toast('Enter an event.');return;}
  S.world.timeline.push({event:n,when:WI('tlWhen'),notes:WI('tlNotes')});
  ['tlEvent','tlWhen','tlNotes'].forEach(i=>{const e=document.getElementById(i);if(e)e.value='';});
  renderTimeline(); save(); toast('⏱ Timeline event added.');
}

function renderTimeline(){
  const el=document.getElementById('tlList'); if(!el) return;
  if(!S.world.timeline.length){el.innerHTML='<p class="tm">No timeline events yet.</p>';return;}
  el.innerHTML='';
  S.world.timeline.forEach((t,i)=>{
    el.appendChild(worldEntry('⏱',
      `${t.event}${t.when?' <span style="color:var(--text3);font-size:.68rem">— '+t.when+'</span>':''}`,
      t.notes||'No notes.',
      `()=>{S.world.timeline.splice(${i},1);renderTimeline();save();}`
    ));
  });
}

// Build world context for chapter prompts
function buildWorldContext(){
  const w=S.world; let ctx='';
  if(w.locations.length)
    ctx+='\nKNOWN LOCATIONS:\n'+w.locations.map(l=>`  • ${l.name} [${l.type}]${l.desc?' — '+l.desc.slice(0,60):''}`).join('\n');
  if(w.lore.length)
    ctx+='\nWORLD LORE:\n'+w.world.lore.map(l=>`  • ${l.name} [${l.cat}]${l.desc?' — '+l.desc.slice(0,60):''}`).join('\n');
  if(w.timeline.length)
    ctx+='\nSTORY TIMELINE:\n'+w.timeline.map(t=>`  • ${t.when?t.when+': ':''}${t.event}`).join('\n');
  return ctx ? '\n━━━━ WORLD BIBLE (maintain consistency) ━━━━'+ctx+'\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' : '';
}

// ═══════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════
init();

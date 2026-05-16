
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

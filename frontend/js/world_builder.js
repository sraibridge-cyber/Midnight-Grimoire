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

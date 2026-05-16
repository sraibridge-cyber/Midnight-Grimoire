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

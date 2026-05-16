/**
 * Midnight Grimoire v2.1 — Modular Loader
 * Loads all HSM engine modules in dependency order
 */

(async function loadModules() {
  const base = 'js/';
  const modules = [
    // 1. HSM core — all other modules depend on HSM
    'hsm_engine.js',
    // 2. State managers (depend on HSM constants: AXIOMS, GENRES, TONES)
    'thread_memory.js',      // ThreadMemory
    'chapter_organizer.js',  // ChapterOrganizer
    'world_builder.js',      // WorldBuilder
    'relationship_mapper.js', // CharacterRelationship
    // 3. Coherence engines (depend on state managers)
    'concordance_chain.js',  // ConcordanceChain + ChainWeaver
    'mu_calculus.js',        // CoherenceCalculus v2
    // 4. Tools (no cross-dependencies)
    'polyglot_pass.js',      // PolyglotPass + varySentence + polish
    'world_context.js',      // WorldBuilder render methods
    // 5. Optional engines
    'soundscape_engine.js',  // SoundscapeEngine (AudioContext)
    'voice_synthesis.js',    // VoxHarmonica + VOTVocal
    // 6. Orchestrator — must run last (depends on everything)
    'generate_chapter.js',   // async generateChapter() + init()
  ];

  for (const mod of modules) {
    try {
      await import(new URL(base + mod, import.meta.url).href);
    } catch (e) {
      console.error(`Midnight Grimoire: failed to load ${mod}`, e);
    }
  }
})();
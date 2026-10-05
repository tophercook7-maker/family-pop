/* The Whispering Woods — web edition. Same story engine as the original, now narrated
   and kid-friendly, with a menu, save/continue, chapter select, and an endings gallery. */
(function () {
  'use strict';
  const STORY = window.STORY, START = window.START;
  const app = document.getElementById('app');
  const CHAPTERS = [
    { key: 'ch1', start: 'woods_entry', title: 'The Whispering Woods', label: 'Chapter One · The Whispering Woods' },
    { key: 'ch2', start: 'ch2_entry',   title: 'The Winter Hush',      label: 'Chapter Two · The Winter Hush' },
    { key: 'ch3', start: 'ch3_entry',   title: 'The Harvest Star',     label: 'Chapter Three · The Harvest Star' },
  ];

  // ---------- persistence ----------
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  let settings = load('ww-settings', { narration: true, rate: 0.92, music: true, musicVol: 0.45 });
  if (settings.music === undefined) settings.music = true;
  if (settings.musicVol === undefined) settings.musicVol = 0.45;
  let endingsFound = load('ww-endings', {});

  // ---------- background music (starts on first tap; loops per chapter) ----------
  const bgm = new Audio();
  bgm.loop = true;
  let bgmTrack = null, bgmReady = false;
  function playMusic(name) {
    if (!settings.music) { bgm.pause(); return; }
    bgm.volume = settings.musicVol;
    if (bgmTrack === name) { if (bgm.paused && bgmReady) bgm.play().catch(() => {}); return; }
    bgmTrack = name;
    bgm.src = 'assets/audio/' + name + '.m4a';
    if (bgmReady) bgm.play().catch(() => {});
  }
  // browsers block audio until a user gesture — unlock on first tap
  document.addEventListener('pointerdown', function unlock() {
    bgmReady = true;
    if (settings.music && bgmTrack) bgm.play().catch(() => {});
    document.removeEventListener('pointerdown', unlock);
  }, { once: true });

  // ---------- game state ----------
  let state = null; // {node, inv:[], rep, }

  function chapterFor(id) {
    if (id && id.startsWith('ch3')) return CHAPTERS[2];
    if (id && id.startsWith('ch2')) return CHAPTERS[1];
    return CHAPTERS[0];
  }
  function node() { return STORY[state.node]; }

  function visibleOptions(n) {
    return (n.options || []).filter(o => {
      if (o.requires_item && !state.inv.includes(o.requires_item)) return false;
      if (o.requires_reputation != null && state.rep < o.requires_reputation) return false;
      return true;
    });
  }
  function applyEffects(o) {
    const e = o.effects || {};
    if (e.reputation_change) state.rep += e.reputation_change;
    (e.add_items || []).forEach(i => { if (!state.inv.includes(i)) state.inv.push(i); });
    (e.remove_items || []).forEach(i => { state.inv = state.inv.filter(x => x !== i); });
  }

  // ---------- narration (Web Speech) ----------
  let voice = null;
  function pickVoice() {
    const vs = speechSynthesis.getVoices();
    if (!vs.length) return;
    const pref = ['Samantha', 'Karen', 'Moira', 'Tessa', 'Google US English', 'Serena'];
    voice = pref.map(p => vs.find(v => v.name === p)).find(Boolean)
         || vs.find(v => /en[-_]US/i.test(v.lang) && /female/i.test(v.name))
         || vs.find(v => /^en/i.test(v.lang)) || vs[0];
  }
  if ('speechSynthesis' in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }
  function stopSpeak() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  function speak(text) {
    if (!settings.narration || !('speechSynthesis' in window)) return;
    stopSpeak();
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.rate = settings.rate; u.pitch = 1.02;
    speechSynthesis.speak(u);
  }

  // ---------- helpers ----------
  const mediaSrc = p => p ? 'assets/' + p.split('/').pop() : null;
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  // ---------- screens ----------
  function showMenu() {
    stopSpeak();
    playMusic('music_title');
    const hasSave = !!load('ww-save', null);
    app.innerHTML = '';
    const s = el('div', 'title-screen');
    s.appendChild(el('img', 'title-art')).src = 'assets/woods_entry.png';
    s.appendChild(el('h1', null, '🌲 The Whispering Woods'));
    s.appendChild(el('p', 'tag', 'A gentle storybook adventure where kindness grows the story.'));
    const m = el('div', 'menu-btns');
    if (hasSave) m.appendChild(mkBtn('Continue', 'primary', () => { state = load('ww-save', null); renderScene(); }));
    m.appendChild(mkBtn(hasSave ? 'New Story' : 'Begin', hasSave ? '' : 'primary', newGame));
    m.appendChild(mkBtn('Pick a Chapter', '', showChapters));
    m.appendChild(mkBtn('Endings I\'ve Found', '', showGallery));
    m.appendChild(mkBtn('Settings', '', showSettings));
    s.appendChild(m);
    s.appendChild(el('p', 'small dim', 'Tip: turn on Read-Aloud in Settings so little ones can listen and tap.'));
    app.appendChild(s);
  }
  function mkBtn(label, cls, fn) { const b = el('button', cls); b.textContent = label; b.onclick = fn; return b; }

  function newGame() { state = { node: START, inv: [], rep: 0 }; save('ww-save', state); renderScene(); }
  function startAt(id) { state = { node: id, inv: [], rep: 0 }; save('ww-save', state); renderScene(); }

  function showChapters() {
    stopSpeak();
    app.innerHTML = '';
    const w = el('div', 'scene');
    w.appendChild(topbar('Pick a Chapter'));
    CHAPTERS.forEach((c, i) => {
      const b = mkBtn(`${i + 1}. ${c.title}`, '', () => startAt(c.start));
      b.style.margin = '10px 0';
      w.appendChild(b);
    });
    w.appendChild(el('p', 'small dim center', 'Starting a chapter fresh is great for exploring — your keepsakes begin empty.'));
    app.appendChild(w);
  }

  function topbar(labelText, withMenu) {
    const t = el('div', 'topbar');
    t.appendChild(el('span', 'chapter-label', labelText));
    const right = el('div'); right.style.display = 'flex'; right.style.gap = '8px';
    const rd = el('button', 'icon-btn small'); rd.textContent = settings.narration ? '🔊' : '🔈';
    rd.title = 'Read aloud'; rd.onclick = () => { settings.narration = !settings.narration; save('ww-settings', settings); if (settings.narration) speak(node().text_chunk); else stopSpeak(); rd.textContent = settings.narration ? '🔊' : '🔈'; };
    const home = el('button', 'icon-btn small'); home.textContent = '☰'; home.title = 'Menu'; home.onclick = showMenu;
    right.appendChild(rd); right.appendChild(home);
    t.appendChild(right);
    return t;
  }

  function renderScene() {
    const n = node();
    if (!n) { showMenu(); return; }
    save('ww-save', state);
    const ch = chapterFor(n.id);
    playMusic('music_' + ch.key);
    app.innerHTML = '';
    const w = el('div', 'scene');
    w.appendChild(topbar(ch.label, true));

    // art (video if present, else image)
    const src = mediaSrc(n.media_hook && (n.media_hook.video_path));
    const img = mediaSrc(n.media_hook && n.media_hook.image_path);
    if (src) {
      const wrap = el('div', 'art-wrap');
      const v = document.createElement('video');
      v.src = src; v.autoplay = true; v.loop = true; v.muted = true; v.playsInline = true; v.setAttribute('playsinline', '');
      wrap.appendChild(v); w.appendChild(wrap);
    } else if (img) {
      const wrap = el('div', 'art-wrap');
      const im = el('img'); im.src = img; im.alt = ''; wrap.appendChild(im); w.appendChild(wrap);
    }

    w.appendChild(el('p', 'narration', n.text_chunk));

    if (n.is_ending) {
      endingsFound[n.id] = n.ending_title || 'The End'; save('ww-endings', endingsFound);
      const b = el('div', 'ending-banner');
      b.appendChild(el('div', 'star', '✨'));
      b.appendChild(el('h2', null, n.ending_title || 'The End'));
      b.appendChild(el('p', null, 'Every path grows a different story — there are more to find.'));
      w.appendChild(b);
      const ch2 = el('div', 'choices');
      ch2.appendChild(mkBtn('🌿 Play Again', 'primary', newGame));
      ch2.appendChild(mkBtn('Endings I\'ve Found', '', showGallery));
      w.appendChild(ch2);
      speak((n.text_chunk) + '. The end. ' + (n.ending_title || ''));
    } else {
      const inv = state.inv.length ? state.inv.join(', ') : 'nothing yet';
      w.appendChild(el('div', 'status', `🎒 ${inv}   💛 Kindness: ${state.rep}`));
      const choices = el('div', 'choices');
      visibleOptions(n).forEach(o => {
        const b = el('button', 'choice'); b.textContent = o.display_text;
        b.onclick = () => { stopSpeak(); applyEffects(o); state.node = o.next_id; renderScene(); };
        choices.appendChild(b);
      });
      w.appendChild(choices);
      speak(n.text_chunk);
    }
    app.appendChild(w);
    window.scrollTo(0, 0);
  }

  // ---------- gallery ----------
  function showGallery() {
    stopSpeak();
    app.innerHTML = '';
    const w = el('div', 'scene');
    w.appendChild(topbar('Endings I\'ve Found'));
    const all = Object.values(STORY).filter(n => n.is_ending);
    const foundCount = all.filter(n => endingsFound[n.id]).length;
    w.appendChild(el('p', 'center', `${foundCount} of ${all.length} endings discovered`));
    const grid = el('div', 'gallery-grid');
    all.forEach(n => {
      const found = !!endingsFound[n.id];
      const im = el('img');
      im.src = 'assets/' + ((n.media_hook.image_path || 'woods_entry.png').split('/').pop());
      if (found) im.className = 'found';
      im.title = found ? n.ending_title : '???';
      grid.appendChild(im);
    });
    w.appendChild(grid);
    w.appendChild(el('div', 'center')).appendChild(mkBtn('Back to Menu', '', showMenu));
    app.appendChild(w);
  }

  // ---------- settings ----------
  function showSettings() {
    stopSpeak();
    app.innerHTML = '';
    const w = el('div', 'scene');
    w.appendChild(topbar('Settings'));
    // read-aloud toggle
    const row = el('div', 'setting-row');
    row.appendChild(el('span', null, '🔊 Read the story aloud'));
    const tg = el('div', 'toggle' + (settings.narration ? ' on' : '')); tg.appendChild(el('div', 'knob'));
    tg.onclick = () => { settings.narration = !settings.narration; tg.className = 'toggle' + (settings.narration ? ' on' : ''); save('ww-settings', settings); };
    row.appendChild(tg); w.appendChild(row);
    // music toggle
    const rowM = el('div', 'setting-row');
    rowM.appendChild(el('span', null, '🎵 Background music'));
    const tgM = el('div', 'toggle' + (settings.music ? ' on' : '')); tgM.appendChild(el('div', 'knob'));
    tgM.onclick = () => { settings.music = !settings.music; tgM.className = 'toggle' + (settings.music ? ' on' : ''); save('ww-settings', settings); if (settings.music) { bgmReady = true; playMusic(bgmTrack || 'music_title'); } else bgm.pause(); };
    rowM.appendChild(tgM); w.appendChild(rowM);
    // music volume
    const rowV = el('div', 'setting-row');
    rowV.appendChild(el('span', null, '🔉 Music volume'));
    const vol = document.createElement('input'); vol.type = 'range'; vol.min = '0'; vol.max = '0.9'; vol.step = '0.05'; vol.value = settings.musicVol;
    vol.oninput = () => { settings.musicVol = parseFloat(vol.value); bgm.volume = settings.musicVol; save('ww-settings', settings); };
    rowV.appendChild(vol); w.appendChild(rowV);
    // speed
    const row2 = el('div', 'setting-row');
    row2.appendChild(el('span', null, '🐢 Reading speed'));
    const rng = document.createElement('input'); rng.type = 'range'; rng.min = '0.7'; rng.max = '1.1'; rng.step = '0.02'; rng.value = settings.rate;
    rng.oninput = () => { settings.rate = parseFloat(rng.value); save('ww-settings', settings); };
    row2.appendChild(rng); w.appendChild(row2);
    // reset progress
    const row3 = el('div', 'setting-row');
    row3.appendChild(el('span', null, '↺ Start over'));
    const rb = mkBtn('Reset story', 'small', () => { localStorage.removeItem('ww-save'); showMenu(); });
    rb.style.width = 'auto'; row3.appendChild(rb); w.appendChild(row3);
    w.appendChild(el('p', 'small dim center', 'Read-Aloud uses your device\'s built-in voice — great for pre-readers.'));
    w.appendChild(el('div', 'center')).appendChild(mkBtn('Back to Menu', '', showMenu));
    app.appendChild(w);
  }

  // ---------- go ----------
  showMenu();
})();

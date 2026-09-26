
const DATA = window.APP_DATA;
const subjects = DATA.subjects;
const books = DATA.books.filter(b => b.id !== 'maths-workbook');
const curriculum = DATA.curriculum.filter(c => c.book_id !== 'maths-workbook');
const subjectById = Object.fromEntries(subjects.map(s => [s.id, s]));
const booksBySubject = Object.fromEntries(subjects.map(s => [s.id, books.filter(b => b.subject_id === s.id)]));
const chapterById = Object.fromEntries(curriculum.map(c => [c.chapter_id, c]));

const key = 'class4world_v4_state';
const legacyKey = 'class4world_v3_state';
const DEFAULT_STATE = {
  name: '', avatar: 'explorer', homeName: 'My Home', xp: 0, coins: 0, streak: 1,
  completed: [], perfectMissions: 0, goldenEggs: 0, chapterBest: {}, questionHistory: {},
  roomUnlocked: { living: ['living-starter-lamp'], drawing: ['drawing-starter-easel'], play: ['play-starter-ball'], dining: ['dining-starter-plant'] },
  roomItems: [
    { id: 'living-starter-lamp-1', room: 'living', x: 18, y: 20, emoji: '💡', name: 'Starter Lamp' },
    { id: 'drawing-starter-easel-1', room: 'drawing', x: 20, y: 22, emoji: '🖼️', name: 'Starter Easel' },
    { id: 'play-starter-ball-1', room: 'play', x: 20, y: 22, emoji: '⚽', name: 'Starter Ball' },
    { id: 'dining-starter-plant-1', room: 'dining', x: 18, y: 22, emoji: '🪴', name: 'Starter Plant' }
  ],
  roomThemes: { living: 'sky', drawing: 'mint', play: 'sky', dining: 'sky' },
  customRoomColors: { living: '', drawing: '', play: '', dining: '' },
  activeRoom: 'living', lastSubject: 'science'
};

// Each room has its own inventory. The paid item costs intentionally total 7,560 coins,
// matching the maximum first-completion earning from the 126 unique active chapter records.
const ROOM_CATALOG = {
  living: [
    { id:'living-starter-lamp', cost:0, emoji:'💡', name:'Starter Lamp' },
    { id:'living-sofa', cost:450, emoji:'🛋️', name:'Cozy Sofa' },
    { id:'living-tv', cost:350, emoji:'📺', name:'Smart TV' },
    { id:'living-table', cost:250, emoji:'🪵', name:'Coffee Table' },
    { id:'living-lamp', cost:180, emoji:'🛋️', name:'Floor Lamp' },
    { id:'living-plant', cost:200, emoji:'🪴', name:'Living Plant' },
    { id:'living-bookshelf', cost:460, emoji:'📚', name:'Bookshelf' }
  ],
  drawing: [
    { id:'drawing-starter-easel', cost:0, emoji:'🖼️', name:'Starter Easel' },
    { id:'drawing-sofa', cost:400, emoji:'🛋️', name:'Art Sofa' },
    { id:'drawing-canvas', cost:250, emoji:'🎨', name:'Canvas Stand' },
    { id:'drawing-piano', cost:500, emoji:'🎹', name:'Mini Piano' },
    { id:'drawing-showcase', cost:300, emoji:'🗿', name:'Art Showcase' },
    { id:'drawing-side-table', cost:180, emoji:'🪑', name:'Side Table' },
    { id:'drawing-lamp', cost:260, emoji:'💡', name:'Gallery Lamp' }
  ],
  play: [
    { id:'play-starter-ball', cost:0, emoji:'⚽', name:'Starter Ball' },
    { id:'play-gaming', cost:500, emoji:'🎮', name:'Gaming Corner' },
    { id:'play-blocks', cost:200, emoji:'🧱', name:'Building Blocks' },
    { id:'play-ball', cost:180, emoji:'🏀', name:'Basketball' },
    { id:'play-rocket', cost:350, emoji:'🚀', name:'Rocket Toy' },
    { id:'play-console', cost:400, emoji:'🕹️', name:'Game Console' },
    { id:'play-trophy', cost:260, emoji:'🏆', name:'Champion Trophy' }
  ],
  dining: [
    { id:'dining-starter-plant', cost:0, emoji:'🪴', name:'Starter Plant' },
    { id:'dining-table', cost:550, emoji:'🍽️', name:'Dining Table' },
    { id:'dining-chairs', cost:300, emoji:'🪑', name:'Dining Chairs' },
    { id:'dining-fridge', cost:450, emoji:'🧊', name:'Smart Fridge' },
    { id:'dining-cabinet', cost:260, emoji:'🗄️', name:'Kitchen Cabinet' },
    { id:'dining-pendant', cost:180, emoji:'💡', name:'Dining Pendant' },
    { id:'dining-basket', cost:150, emoji:'🧺', name:'Fruit Basket' }
  ]
};
function roomCatalog(room) { return ROOM_CATALOG[room] || []; }
function roomItemDef(room, id) { return roomCatalog(room).find(x => x.id === id); }

const AVATARS = {
  explorer: { name: 'Explorer', emoji: '🧑‍🚀', minXP: 0 },
  artist: { name: 'Artist', emoji: '🧑‍🎨', minXP: 0 },
  hero: { name: 'Super Hero', emoji: '🦸', minXP: 40 },
  wizard: { name: 'Wizard', emoji: '🧙', minXP: 100 },
  gamer: { name: 'Gamer', emoji: '🧑‍💻', minXP: 180 },
  ninja: { name: 'Ninja', emoji: '🥷', minXP: 280 },
  elf: { name: 'Elf', emoji: '🧝', minXP: 400 },
  singer: { name: 'Star', emoji: '🧑‍🎤', minXP: 550 },
  scientist: { name: 'Scientist', emoji: '🧑‍🔬', minXP: 750 },
  dragon: { name: 'Dragon Rider', emoji: '🐉', minXP: 1000 }
};

const CUSTOM_COLOUR_MIN_XP = 160;

function avatarMeta(){ return AVATARS[state.avatar] || AVATARS.explorer; }

const ROOMS = [
  { id: 'living', icon: '🛋️', name: 'Living Room' },
  { id: 'drawing', icon: '🎨', name: 'Drawing Room' },
  { id: 'play', icon: '🎮', name: 'Play Room' },
  { id: 'dining', icon: '🍽️', name: 'Dining Room' }
];

const THEMES = {
  sky: { name: 'Sky', minXP: 0, wall: '#dff7ff', floor: '#d8b27b', accent: '#8b7be0' },
  mint: { name: 'Mint', minXP: 20, wall: '#dcfff0', floor: '#c9dfb8', accent: '#4db58a' },
  sunset: { name: 'Sunset', minXP: 40, wall: '#ffe7d7', floor: '#d9a26b', accent: '#ff7a59' },
  violet: { name: 'Violet', minXP: 60, wall: '#eee7ff', floor: '#bd9acb', accent: '#8064ff' },
  candy: { name: 'Candy', minXP: 80, wall: '#fff0fb', floor: '#e3b5cf', accent: '#ff5ba8' },
  space: { name: 'Space', minXP: 120, wall: '#1e2758', floor: '#303c73', accent: '#6f9dff' }
};

let state = loadState();
let route = 'home';
let selectedSubjectId = null, selectedBookId = null, selectedChapterId = null, activeChapter = null;
let stage = 'intro', quiz = [], qIndex = 0, score = 0, selectedOption = null;
let mini = { done:false, progress:0, dragging:false, selected:[], sequence:[], tapped:[], checkCards:[], checkSelected:[], checkDone:false, checkMessage:'', wrongCard:-1 };
let draggedWorldItem = null;
const chapterCache = {};
let lastReward = {xp:0, coins:0, egg:0};
let lastFirstCompletion = false;

function cloneDefault() { return JSON.parse(JSON.stringify(DEFAULT_STATE)); }
function loadState() {
  try {
    const current = JSON.parse(localStorage.getItem(key) || 'null');
    const base = cloneDefault();
    if (!current) return base;
    const merged = { ...base, ...current };
    merged.avatar = AVATARS[current.avatar] ? current.avatar : base.avatar;
    merged.customRoomColors = { ...base.customRoomColors, ...(current.customRoomColors || {}) };
    merged.roomUnlocked = { ...base.roomUnlocked, ...(current.roomUnlocked || {}) };
    merged.roomItems = Array.isArray(current.roomItems) && current.roomItems.length ? current.roomItems : base.roomItems;
    merged.roomThemes = { ...base.roomThemes, ...(current.roomThemes || {}) };
    for (const [rid, tid] of Object.entries(merged.roomThemes)) {
      if (!THEMES[tid] || merged.xp < THEMES[tid].minXP) merged.roomThemes[rid] = 'sky';
    }
    merged.completed = Array.isArray(current.completed) ? current.completed : [];
    merged.perfectMissions = Number(current.perfectMissions || 0);
    merged.goldenEggs = Number(current.goldenEggs || 0);
    merged.chapterBest = (current.chapterBest && typeof current.chapterBest === 'object') ? current.chapterBest : {};
    merged.questionHistory = (current.questionHistory && typeof current.questionHistory === 'object') ? current.questionHistory : {};
    return merged;
  } catch {
    return cloneDefault();
  }
}
function save() {
  localStorage.setItem(key, JSON.stringify(state));
  header();
}
function level() { return Math.min(30, 1 + Math.floor(state.xp / 250)); }
function maxCoins() { return curriculum.length * 60; }
function completedCoinsPossible() { return state.completed.length * 60; }
function header() {
  document.getElementById('xpValue').textContent = state.xp;
  document.getElementById('coinValue').textContent = state.coins;
  document.getElementById('levelValue').textContent = level();
}
function esc(v) {
  return String(v).replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
}
function playerName() { return state.name && state.name.trim() ? state.name.trim() : 'Explorer'; }
function playerGreeting() { return state.name && state.name.trim() ? `Hi ${esc(state.name.trim())}!` : 'Hi there!'; }
function toast(t, tone = '') {
  const e = document.getElementById('toast');
  e.textContent = t;
  e.className = `toast show ${tone}`;
  clearTimeout(window._toast);
  window._toast = setTimeout(() => e.classList.remove('show'), 1900);
}
function go(r) { route = r; render(); }
function goHome() { selectedSubjectId = selectedBookId = selectedChapterId = null; activeChapter = null; go('home'); }
function subjectBooks(id) { return booksBySubject[id] || []; }
function chaptersForBook(id) { return curriculum.filter(c => c.book_id === id); }
function render() {
  document.body.classList.toggle('mission-mode', route === 'mission');
  document.getElementById('backBtn').classList.toggle('hidden', ['home','subjects'].includes(route));
  document.querySelectorAll('.nav-btn').forEach(x => x.classList.toggle('active', x.dataset.route === route));
  if (route === 'home') app.innerHTML = homeView();
  else if (route === 'subjects') app.innerHTML = subjectsView();
  else if (route === 'books') app.innerHTML = booksView();
  else if (route === 'chapters') app.innerHTML = chaptersView();
  else if (route === 'chapter') app.innerHTML = chapterView();
  else if (route === 'mission') app.innerHTML = missionView();
  else if (route === 'world') app.innerHTML = worldView();
  else if (route === 'profile') app.innerHTML = profileView();
  else if (route === 'result') app.innerHTML = resultView();
  bind();
  header();
  if (route === 'mission' && stage === 'game') bindMini();
  if (route === 'world') bindWorldDrag();
}
const app = document.getElementById('app');

function homeView() {
  const avatar = avatarMeta();
  const s = subjectById[state.lastSubject] || subjectById.science;
  const b = subjectBooks(s.id)[0];
  const first = chaptersForBook(b.id)[0];
  const pct = Math.round(state.completed.length / curriculum.length * 100);
  return `<section class="hero-grid">
    <div class="hero-card"><div class="hero-player"><span class="hero-avatar">${avatar.emoji}</span><div class="eyebrow">${playerGreeting()} • CLASS 4</div></div><h1>Learn it. Play it. Build it.</h1>
      <p>Every chapter becomes a visual mission, a challenge and a reward. Perfect missions can even hatch Golden Eggs.</p>
      <div class="hero-actions"><button class="btn primary" data-action="continue">Continue mission</button><button class="btn soft" data-route="subjects">Explore subjects</button></div>
    </div>
    <div class="daily-card"><span class="pill">⚡ Quick mission</span><h3>${esc(s.name)} • ${esc(first.chapter)}</h3><p>${esc(first.learning_objectives[0])}</p><button class="btn soft" data-action="start-default">Start now →</button></div>
  </section>
  <section class="section"><div class="section-head"><div><div class="eyebrow">YOUR PROGRESS</div><h2>Keep building</h2></div><span class="pill">${state.completed.length}/${curriculum.length} chapters</span></div>
    <div class="progress-card"><div><b>${state.xp} XP</b><small>Level ${level()}</small></div><div class="big-progress"><span style="width:${Math.min(100,pct)}%"></span></div><div><b>🥚 ${state.goldenEggs}</b><small>golden eggs</small></div></div>
  </section>
  <section class="section"><div class="section-head"><div><div class="eyebrow">CHOOSE A WORLD</div><h2>Subjects</h2></div></div>${subjectCards()}</section>`;
}
function subjectCards() {
  return `<div class="subject-grid">${subjects.map(s => `<article class="subject-card" data-subject="${s.id}" style="--accent:${s.color}"><div class="icon-bubble">${s.icon}</div><h3>${esc(s.name)}</h3><p>${esc(s.blurb)}</p><div class="card-foot"><span>${books.filter(b => b.subject_id === s.id).reduce((a,b) => a + b.chapter_count, 0)} units</span><b>Open →</b></div></article>`).join('')}</div>`;
}
function subjectsView() {
  return `<section class="section-head"><div><div class="eyebrow">LEARNING MAP</div><h1>Pick a subject</h1><p>Core learning tracks stay separate; workbook content supports practice inside Mathematics.</p></div></section>${subjectCards()}<div class="source-note">Source chapter titles are taken from the uploaded books. Concept maps and starter questions are app-level curriculum intelligence inferred from titles and book framing, not verbatim textbook reproduction.</div>`;
}
function booksView() {
  const s = subjectById[selectedSubjectId];
  return `<section class="section-head"><div><div class="eyebrow">${s.icon} SUBJECT</div><h1>${esc(s.name)}</h1><p>Keep textbook, grammar, workbook and Olympiad tracks separate.</p></div></section><div class="book-grid">${subjectBooks(s.id).map(b => `<article class="book-card" data-book="${b.id}"><div class="book-icon">${s.icon}</div><div><h3>${esc(b.name)}</h3><p>${esc(b.publisher)} • ${esc(b.role)}</p><span class="pill">${b.chapter_count} chapters</span></div><b class="arrow">→</b></article>`).join('')}</div>`;
}
function chaptersView() {
  const b = books.find(x => x.id === selectedBookId), list = chaptersForBook(selectedBookId);
  return `<section class="section-head"><div><div class="eyebrow">${esc(b.role)}</div><h1>${esc(b.name)}</h1><p>${esc(b.publisher)}</p></div><span class="pill">${list.length} chapters</span></section><div class="chapter-grid">${list.map(c => `<article class="chapter-card ${state.completed.includes(c.chapter_id)?'done':''}" data-chapter="${c.chapter_id}"><div class="chapter-num">${String(c.chapter_no).padStart(2,'0')}</div><div><h3>${esc(c.chapter)}</h3><p>${esc(c.concepts.slice(0,3).join(' • '))}</p><div class="tag-row"><span>${state.completed.includes(c.chapter_id)?'✅ Completed':'🎮 Mission'}</span><span>${esc(c.game_type)}</span></div></div></article>`).join('')}</div>`;
}
function chapterView() {
  const c = chapterById[selectedChapterId], s = subjectById[c.subject_id];
  return `<section class="chapter-hero" style="--accent:${s.color}"><div class="eyebrow">${s.icon} ${esc(c.subject)} • ${esc(c.role)}</div><h1>${esc(c.chapter)}</h1><p>${esc(c.book)}</p><div class="tag-row"><span>${state.completed.includes(c.chapter_id)?'✅ Completed':'🗺️ Ready to play'}</span><span>Difficulty ${c.difficulty}/3</span><span>${esc(c.game_type)}</span></div></section>
  <section class="content-grid"><article class="content-card"><div class="card-icon">🧠</div><h3>Concept map</h3><div class="chip-wrap">${c.concepts.map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div></article>
  <article class="content-card"><div class="card-icon">🎯</div><h3>Learning goals</h3>${c.learning_objectives.map(x=>`<p>• ${esc(x)}</p>`).join('')}</article>
  <article class="content-card"><div class="card-icon">🧩</div><h3>Skills</h3>${c.skills.map(x=>`<span class="skill-pill">${esc(x)}</span>`).join(' ')}</article>
  <article class="content-card"><div class="card-icon">🎮</div><h3>Mission format</h3><p>Visual-first mini-game → 5-question challenge → final reward.</p><small class="muted">Question pool: ${c.question_count ?? 0} questions • 5 per attempt • replay-friendly</small></article></section>
  <div class="action-bar"><button class="btn soft" data-action="back-chapters">← Chapters</button><button class="btn primary" data-action="play">Play mission →</button></div>`;
}
function missionView(){if(stage==='intro')return missionIntro();if(stage==='check')return missionCheck();if(stage==='game')return missionGame();return missionQuiz();}
function missionIntro(){const c=activeChapter,s=subjectById[c.subject_id],objs=(c.learning_objectives||[]).slice(0,3),concepts=(c.concepts||[]).slice(0,4);return `<section class="mission-shell"><div class="mission-hero"><div class="eyebrow">${playerGreeting()} ${s.icon} ${esc(c.subject)} • DISCOVER</div><h1>What are we learning?</h1><p>Before you play, get a quick picture of <strong>${esc(c.chapter)}</strong>. Then prove what you noticed in a tiny warm-up challenge.</p><div class="stepper"><span class="active">1 DISCOVER</span><span>2 QUICK CHECK</span><span>3 PLAY</span><span>4 CHALLENGE</span></div></div><section class="learn-card"><div class="learn-visual"><div class="learn-orb">${s.icon}</div><div class="learn-pulse"></div><div class="learn-label">${esc(c.chapter)}</div></div><div class="learn-copy"><span class="pill">🧠 Quick Learn</span><h2>${esc(introHeadline(c))}</h2><div class="learn-goals">${objs.map(x=>`<div class="learn-goal"><span>✓</span>${esc(x)}</div>`).join('')}</div><div class="tag-row">${concepts.map(x=>`<span>${esc(x)}</span>`).join('')}</div></div></section><div class="action-bar"><button class="btn soft" data-action="exit">Exit</button><button class="btn primary" data-action="start-check">I got it — Quick Check →</button></div></section>`;}
function introHeadline(c){const f=c.learning_objectives&&c.learning_objectives[0];return f?f.charAt(0).toUpperCase()+f.slice(1)+'.':`Explore the key ideas in ${c.chapter}.`;}
function missionCheck(){const c=activeChapter,s=subjectById[c.subject_id];if(!mini.checkCards.length)mini.checkCards=quickCheckCards(c);const cards=mini.checkCards,n=mini.checkSelected.length;return `<section class="mission-shell"><div class="mission-hero"><div class="eyebrow">${playerGreeting()} ${s.icon} ${esc(c.subject)} • QUICK CHECK</div><h1>Show what you understood</h1><p>Pick the <strong>3 ideas</strong> that really belong to <strong>${esc(c.chapter)}</strong>. Three are right and three are decoys.</p><div class="stepper"><span>1 DISCOVER</span><span class="active">2 QUICK CHECK</span><span>3 PLAY</span><span>4 CHALLENGE</span></div></div><section class="visual-game-card check-card"><div class="game-head"><div><span class="pill">🧩 Quick Check</span><h2>Can you spot the right ideas?</h2><p>Wrong picks do not cost a life. Think again and try another card.</p></div><span class="page-badge">${n} / 3</span></div><div class="check-grid">${cards.map((card,i)=>`<button class="check-card-btn ${mini.checkSelected.includes(i)?'selected':''} ${mini.wrongCard===i?'wrong':''}" data-check-card="${i}" ${mini.checkSelected.includes(i)||mini.checkDone?'disabled':''}><span class="check-icon">${mini.checkSelected.includes(i)?'✓':'?'}</span><b>${esc(card.label)}</b></button>`).join('')}</div><div class="check-status ${mini.checkDone?'success':''} ${mini.wrongCard>=0?'warn':''}">${mini.checkDone?`✅ Brilliant, ${playerName()}! You found all 3 correct ideas.`:(mini.checkMessage||`${n} / 3 correct ideas found`)}</div><div class="action-bar"><button class="btn soft" data-action="back-intro">← Back to learn</button>${mini.checkDone?'<button class="btn primary" data-action="start-game">Start mission →</button>':'<span class="muted">Find all 3 correct cards to continue.</span>'}</div></section></section>`;}
function quickCheckCards(c){const correct=(c.concepts||[]).slice(0,3).map(x=>({label:x,correct:true}));const current=new Set((c.concepts||[]).map(normalizeConcept));const pool=[];for(const o of curriculum){if(o.chapter_id===c.chapter_id)continue;for(const x of(o.concepts||[])){const n=normalizeConcept(x);if(x&&!current.has(n)&&!pool.some(v=>normalizeConcept(v)===n))pool.push(x);}}const wrong=shuffle(pool).slice(0,3).map(x=>({label:x,correct:false}));while(wrong.length<3){const fb=['Cooking recipes','Weather satellites','Basketball drills','Music practice','Gardening tools'];wrong.push({label:fb[wrong.length],correct:false});}return shuffle([...correct,...wrong]);}
function normalizeConcept(v){return String(v||'').toLowerCase().replace(/[^a-z0-9\u0900-\u097f]+/g,' ').trim();}
function missionGame(){const c=activeChapter,s=subjectById[c.subject_id];return `<section class="mission-shell"><div class="mission-hero"><div class="eyebrow">${playerGreeting()} ${s.icon} ${esc(c.subject)} • PLAY</div><h1>${esc(missionTitle(c))}</h1><p>${esc(missionStory(c))}</p><div class="stepper"><span>1 DISCOVER</span><span>2 QUICK CHECK</span><span class="active">3 PLAY</span><span>4 CHALLENGE</span></div></div><section class="visual-game-card"><div class="game-head"><div><span class="pill">🎮 Mini Game</span><h2>${esc(missionInstruction(c))}</h2><p>${requiresMiniGame(c)?'Complete the hands-on task first. Your reward unlocks after the questions.':'Your quick check unlocked the chapter mission. Now jump into the 5-question challenge.'}</p></div><span class="page-badge">3 / 4</span></div>${miniGame(c)}<div class="visual-controls">${requiresMiniGame(c)?`<button class="btn soft" data-action="reset-mini">Reset</button><span class="visual-status ${mini.done?'success':''}">${mini.done?`✅ Nice, ${playerName()}! Task complete!`:'🎯 Finish the mini-game first.'}</span>`:'<span class="visual-status success">✅ Ready! The chapter challenge is unlocked.</span>'}</div><div class="action-bar"><button class="btn soft" data-action="exit">Exit</button>${mini.done?'<button class="btn primary" data-action="start-quiz">Start 5 questions →</button>':'<span class="muted">Finish the mission to continue.</span>'}</div></section></section>`;}
function requiresMiniGame(c){return ['Push and Pull','Money','Understanding Scratch – Your Gateway to Coding','Maps and Views','Symmetry','Time'].includes(c.chapter);}
function missionTitle(c){const m={'Push and Pull':'Toy Factory Rescue','Money':'Toy Shop Cashier','Understanding Scratch – Your Gateway to Coding':'Robot Code Run','The Tree':'Tree Guardian Quest','अब और प्लास्टिक नहीं!':'Plastic-Free Park','Our Forests':'Forest Ranger Mission','Maps and Views':'Map Explorer','Data Handling':'Data Detective','Symmetry':'Mirror Master','Time':'Clock Dash'};return m[c.chapter]||`${c.chapter} Mission`;}
function missionStory(c){if(c.chapter==='Push and Pull')return'The toy factory is ready for delivery, but a heavy toy crate is stuck. Move it into the delivery zone and feel the push in action.';if(c.chapter==='Money')return'You are the cashier. Build a customer order, total the price, and make the correct change.';if(c.chapter==='Understanding Scratch – Your Gateway to Coding')return'Your robot only moves when the blocks are in the right order. Build the sequence and test it.';if(c.chapter==='Maps and Views')return'Use the map controls to find the right directions and location clues.';if(c.chapter==='Symmetry')return'Become a mirror master by matching shapes that balance on both sides.';if(c.chapter==='Time')return'Set the clock correctly and race the mission timer.';return`Complete a short interactive task connected to ${c.chapter}, then take the chapter challenge.`;}
function missionInstruction(c){if(c.chapter==='Push and Pull')return'Get the toy crate into the delivery zone!';if(c.chapter==='Money')return'Build a ₹50 order from the shelf.';if(c.chapter==='Understanding Scratch – Your Gateway to Coding')return'Tap the blocks in the right order.';if(c.chapter==='Maps and Views')return'Find three directions on the map.';if(c.chapter==='Symmetry')return'Match the mirrored shapes.';if(c.chapter==='Time')return'Set the clock to the target time.';if(c.subject_id==='computer')return'Complete the interactive screen task.';return`Mission warm-up: ${c.chapter}`;}
function miniGame(c) {
  if (c.chapter === 'Push and Pull') return `<div class="mini-scene" id="pushScene"><div class="cloud">☁️</div><div class="sign">TOY FACTORY</div><div class="ground"></div><div class="conveyor"><div class="belt"></div></div><div class="drop-target" id="dropTarget">📦<br>DROP HERE</div><div class="crate" id="dragCrate" style="left:${10+mini.progress*70}%">🧸📦</div><div class="hint-arrow">DRAG →</div><div class="mini-info">Push the crate away from you.</div></div>`;
  if (c.chapter === 'Money') return `<div class="mini-scene" style="background:linear-gradient(#fff2d7,#f1c27c)"><div class="sign">TOY SHOP</div><div class="mini-info">Tap two items to make a ₹50 order.</div><div style="position:absolute;inset:24% 8% auto;display:grid;grid-template-columns:repeat(3,1fr);gap:12px">${[['🧸','₹20'],['🚗','₹30'],['🪀','₹15'],['🎲','₹25'],['🧩','₹35'],['🎈','₹10']].map((x,i)=>`<button class="btn ${mini.selected.includes(i)?'dark':'soft'}" data-item="${i}" style="min-height:70px;font-size:22px">${x[0]}<small style="display:block;font-size:10px">${x[1]}</small></button>`).join('')}</div><div class="action-bar" style="position:absolute;left:16px;right:16px;bottom:18px"><span class="pill">Selected: ${mini.selected.length}</span>${mini.selected.length>=2?'<button class="btn primary" data-action="shop-check">Check order</button>':''}</div></div>`;
  if (c.chapter === 'Understanding Scratch – Your Gateway to Coding') return `<div class="mini-scene" style="background:linear-gradient(#e9f9ff,#c8d5ff)"><div class="sign">ROBOT LAB</div><div class="mini-info">Tap blocks: Move → Turn → Say</div><div style="position:absolute;top:28%;left:8%;right:8%;display:grid;grid-template-columns:repeat(3,1fr);gap:12px">${[['Move','➡️',0],['Turn','↪️',1],['Say','💬',2]].map(x=>`<button class="btn ${mini.sequence.includes(x[2])?'dark':'soft'}" data-code="${x[2]}" style="min-height:80px">${x[1]}<br><span style="font-size:11px">${x[0]}</span></button>`).join('')}</div><div class="robot" style="position:absolute;bottom:40px;left:${20+Math.min(mini.sequence.length,3)*20}%">🤖</div></div>`;
  if (c.chapter === 'Maps and Views') return `<div class="mini-scene" style="background:#e8f6e6"><div class="sign">MAP LAB</div>${[['NORTH','🔼',0],['EAST','➡️',1],['SCHOOL','🏫',2]].map((x,i)=>`<button class="btn ${mini.tapped.includes(String(i))?'dark':'soft'}" data-map="${i}" style="position:absolute;left:${20+i*25}%;top:${35+(i%2)*22}%;font-size:20px">${x[1]}<small style="display:block;font-size:9px">${x[0]}</small></button>`).join('')}<div class="mini-info">Find 3 map labels.</div></div>`;
  if (c.chapter === 'Symmetry') return `<div class="mini-scene" style="background:linear-gradient(#f5f3ff,#e4ddff)"><div class="sign">MIRROR LAB</div><div style="position:absolute;left:12%;right:12%;top:26%;display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:44px;text-align:center"><button class="btn ${mini.selected.includes(0)?'dark':'soft'}" data-item="0">🦋</button><button class="btn ${mini.selected.includes(1)?'dark':'soft'}" data-item="1">🦋</button><button class="btn ${mini.selected.includes(2)?'dark':'soft'}" data-item="2">🔺</button><button class="btn ${mini.selected.includes(3)?'dark':'soft'}" data-item="3">🔻</button></div><div class="mini-info">Tap two matching mirror halves.</div></div>`;
  const emoji = c.subject_id === 'science' ? '🔬' : c.subject_id === 'social' ? '🗺️' : c.subject_id === 'english' ? '🔤' : c.subject_id === 'hindi' ? 'अ' : c.subject_id === 'computer' ? '💻' : c.subject_id === 'olympiad' ? '🏆' : '➗';
  const chips=(c.concepts||[]).slice(0,3);
  return `<div class="mini-scene concept-scene" style="background:linear-gradient(135deg,#f6f4ff,#dce7ff)"><div class="sign">READY</div><div class="concept-stage"><div class="concept-icon">${emoji}</div><p class="concept-prompt"><strong>${esc(c.chapter)}</strong> is ready. Your next step is the 5-question challenge.</p><div class="mission-chip-grid">${chips.map(x=>`<span class="mission-chip">✓ ${esc(x)}</span>`).join('')}</div><div class="concept-progress">Quick Check complete • Mission unlocked</div></div></div>`;
}
function missionQuiz() {
  const q = quiz[qIndex];
  const pct = Math.round((qIndex / quiz.length) * 100);
  return `<section class="mission-shell"><div class="mission-hero"><div class="eyebrow">${playerGreeting()} ${subjectById[activeChapter.subject_id].icon} ${esc(activeChapter.chapter)} • CHALLENGE</div><h1>Question ${qIndex+1} of ${quiz.length}</h1><p>${esc(activeChapter.learning_objectives[0])}</p><div class="progress"><span style="width:${pct}%"></span></div></div><section class="question-card"><div class="question-meta"><span>Question ${qIndex+1} / ${quiz.length}</span><span>Reward after all answers</span></div><h2>${esc(q.q)}</h2><div class="option-grid">${q.o.map((o,i)=>`<button class="option-btn ${selectedOption !== null ? (i === q.a ? 'correct' : i === selectedOption ? 'wrong' : '') : ''}" data-option="${i}" ${selectedOption !== null ? 'disabled' : ''}>${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join('')}</div>${selectedOption !== null ? `<div class="feedback ${selectedOption===q.a?'good':'bad'}">${selectedOption===q.a?'✅ Correct!':'❌ Not quite.'} ${esc(q.e)}</div>` : ''}<div class="action-bar"><button class="btn soft" data-action="exit">Exit</button>${selectedOption !== null ? `<button class="btn primary" data-action="next-q">${qIndex===quiz.length-1?'Finish mission':'Next question →'}</button>` : ''}</div></section></section>`;
}
function rewardFor(scoreCount, firstCompletion) {
  if (!firstCompletion) return { xp: 0, coins: 0, egg: 0 };
  const xp = 5 + scoreCount * 3;
  const perfect = scoreCount === 5;
  const coins = 10 + scoreCount * 5 + (perfect ? 25 : 0);
  return { xp, coins, egg: perfect ? 1 : 0 };
}
function resultView() {
  const perfect = score === 5;
  const first = lastFirstCompletion;
  const reward = lastReward;
  return `<section class="result-card ${perfect?'perfect':''}"><div class="result-icon">${perfect?'🥚':'🏆'}</div><div class="eyebrow">${perfect?'PERFECT MISSION':'MISSION COMPLETE'}</div><h1>${esc(activeChapter?.chapter||'Chapter')}</h1>${perfect?`<div class="perfect-banner">👏 WOW, ${playerName()}! Perfect 5 / 5 — Golden Egg unlocked!</div>`:`<div class="personal-best">🎉 Great job, ${playerName()}!</div>`}<p class="muted">${first?'Your mission reward is ready.':'Practice complete — this chapter reward was already collected.'}</p><div class="reward-grid"><div><b>⭐ ${reward.xp}</b><span class="muted">XP</span></div><div><b>🪙 ${reward.coins}</b><span class="muted">Coins</span></div><div><b>✅ ${score}/${quiz.length}</b><span class="muted">Correct</span></div></div>${perfect?'<div class="golden-egg">🥚 Golden Egg <small>Perfect-mission collectible</small></div>':''}<div class="personal-best">🏅 Personal best: ${perfect?'Perfect mission':'Keep practising'}</div><div class="action-bar"><button class="btn soft" data-action="back-chapters">Back to chapters</button><button class="btn primary" data-route="world">See My Home →</button></div></section>`;
}

function roomItemsFor(room) { return state.roomItems.filter(x => (x.room || 'living') === room); }
function resolveRoomTheme(roomId){
  const custom = String(state.customRoomColors?.[roomId] || '').trim();
  if(/^#[0-9a-f]{6}$/i.test(custom)) return {name:'Custom', minXP:CUSTOM_COLOUR_MIN_XP, wall:custom, floor:adjustColor(custom,-12), accent:custom};
  return THEMES[state.roomThemes[roomId]] || THEMES.sky;
}
function adjustColor(hex, delta){
  const n=parseInt(hex.slice(1),16);
  const r=Math.max(0,Math.min(255,(n>>16)+delta));
  const g=Math.max(0,Math.min(255,((n>>8)&255)+delta));
  const b=Math.max(0,Math.min(255,(n&255)+delta));
  return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
}
function worldView() {
  const room = ROOMS.find(r => r.id === state.activeRoom) || ROOMS[0];
  const theme = resolveRoomTheme(room.id);
  const items = roomItemsFor(room.id);
  const catalog = roomCatalog(room.id);
  const unlocked = state.roomUnlocked[room.id] || [];
  const roomPaidTotal = catalog.reduce((sum,it)=>sum + (it.cost || 0), 0);
  return `<section class="world-header"><div><div class="world-title-line"><span class="world-avatar">${avatarMeta().emoji}</span><div><div class="eyebrow">MY HOME</div><h1>${esc(state.homeName)}</h1></div></div><p>Each room has its own furniture. Coins unlock that room's objects; XP unlocks colour themes you can use in any room.</p></div><div class="world-meta"><span class="pill">🪙 ${state.coins} coins</span><span class="pill">⭐ ${state.xp} XP</span><span class="pill">🏠 ${roomPaidTotal} coins to complete this room</span></div></section>
  <div class="home-editor"><div class="room-tabs">${ROOMS.map(r => `<button class="room-tab ${room.id===r.id?'active':''}" data-room="${r.id}">${r.icon}<span>${esc(r.name)}</span></button>`).join('')}</div><div class="editor-actions"><button class="btn soft" data-action="rename-home">✏️ Name</button><button class="btn soft" data-action="themes">🎨 Colours</button></div></div>
  <div class="room-wrap"><div class="room" style="--wall:${theme.wall};--floor:${theme.floor};--accent:${theme.accent}"><div class="wall-pattern"></div><div class="window"></div><div class="rug"></div><div class="room-label">${room.icon} ${room.name}</div>${items.map((p,i)=>`<button class="world-item" data-world-item="${esc(p.id)}" data-world-index="${i}" style="left:${p.x}%;top:${p.y}%" aria-label="${esc(p.name||'item')}">${p.emoji}</button>`).join('')}</div><aside class="shop"><div class="shop-head"><div><h3>Build ${esc(room.name)}</h3><small>Only ${esc(room.name)} objects appear here. Drag them anywhere in this room.</small></div><span class="pill">${unlocked.length}/${catalog.length} unlocked</span></div><div class="inventory-grid">${catalog.map(it=>`<div class="item-card"><div class="item-emoji">${it.emoji}</div><div class="item-main"><b>${esc(it.name)}</b><small>${it.cost ? it.cost+' coins' : 'Starter'}</small></div><button class="btn tiny" data-buy="${it.id}" ${unlocked.includes(it.id)?'disabled':''}>${unlocked.includes(it.id)?'Owned':'Unlock'}</button></div>`).join('')}</div></aside></div>`;
}
function themeSheet() {
  const unlocked = Object.entries(THEMES).filter(([,t]) => state.xp >= t.minXP);
  return unlocked.map(([id,t]) => `<button class="theme-card ${state.roomThemes[state.activeRoom]===id?'active':''}" data-theme="${id}"><span class="theme-swatch" style="background:linear-gradient(135deg,${t.wall},${t.floor})"></span><b>${t.name}</b><small>${t.minXP} XP</small></button>`).join('');
}
function profileView() {
  const av=avatarMeta();
  return `<section class="profile-card">
    <div class="profile-main"><div class="profile-player-avatar">${av.emoji}</div><div><div class="eyebrow">PLAYER</div><h1>${state.name?esc(state.name):'Young Explorer'}</h1><p>Class 4 • Level ${level()} • ${esc(av.name)}</p></div><div class="profile-actions"><button class="btn soft" data-action="edit-name">Edit name</button><button class="btn soft" data-action="edit-avatar">Edit avatar</button></div></div>
    <div class="stat-grid"><div><b>⭐ ${state.xp}</b><span>XP</span></div><div><b>🪙 ${state.coins}</b><span>Coins</span></div><div><b>🥚 ${state.goldenEggs}</b><span>Golden Eggs</span></div></div>
    <div class="profile-section"><h3>✨ My progress</h3><p>${state.name?`Keep going, ${esc(state.name)}!`:'Choose your name and start your first mission.'} Perfect missions unlock Golden Eggs, avatars and My Home customisation.</p></div>
    <div class="profile-section"><h3>🎨 My colours</h3><p>Sky and Mint are free. More colours unlock as your XP grows. At ${CUSTOM_COLOUR_MIN_XP} XP, you can choose your own colour for any room.</p><div class="theme-mini-row">${Object.entries(THEMES).map(([id,t])=>`<span class="xp-chip ${state.xp>=t.minXP?'on':''}">${t.name} • ${t.minXP===0?'Free':t.minXP+' XP'}</span>`).join('')}</div></div>
    <div class="profile-section"><h3>🧑‍🚀 My avatar</h3><p>${esc(av.name)} selected. More avatars unlock with XP.</p><div class="theme-mini-row">${Object.values(AVATARS).map(a=>`<span class="xp-chip ${state.xp>=a.minXP?'on':''}">${a.emoji} ${a.name} • ${a.minXP===0?'Free':a.minXP+' XP'}</span>`).join('')}</div></div>
    <div class="profile-section"><h3>🏆 My achievements</h3><p>${state.completed.length} missions completed • ${state.perfectMissions} perfect missions • ${state.goldenEggs} Golden Eggs</p></div>
    <div class="profile-section"><button class="btn dark" data-action="reset">Reset testing progress</button></div>
  </section>`;
}


function bind() {
  document.getElementById('brandBtn').onclick = goHome;
  document.querySelectorAll('[data-route]').forEach(e => e.onclick = () => go(e.dataset.route));
  document.querySelectorAll('[data-subject]').forEach(e => e.onclick = () => { selectedSubjectId=e.dataset.subject; state.lastSubject=selectedSubjectId; save(); route='books'; render(); });
  document.querySelectorAll('[data-book]').forEach(e => e.onclick = () => { selectedBookId=e.dataset.book; route='chapters'; render(); });
  document.querySelectorAll('[data-chapter]').forEach(e => e.onclick = () => { selectedChapterId=e.dataset.chapter; route='chapter'; render(); });
  document.querySelectorAll('[data-option]').forEach(e => e.onclick = () => { if (selectedOption === null) { selectedOption=Number(e.dataset.option); if (selectedOption===quiz[qIndex].a) { playSuccess(); toast(`✨ Nice, ${playerName()}! Keep going!`); } else { toast(`Keep going, ${playerName()}! You can do the next one!`); } render(); }});
  document.querySelectorAll('[data-buy]').forEach(e => e.onclick = () => buy(e.dataset.buy));
  document.querySelectorAll('[data-item]').forEach(e => e.onclick = () => selectItem(Number(e.dataset.item)));
  document.querySelectorAll('[data-code]').forEach(e => e.onclick = () => tapCode(Number(e.dataset.code)));
  document.querySelectorAll('[data-check-card]').forEach(e => e.onclick = () => checkCard(Number(e.dataset.checkCard)));
  document.querySelectorAll('[data-map]').forEach(e => e.onclick = () => tapMap(String(e.dataset.map)));
  document.querySelectorAll('[data-room]').forEach(e => e.onclick = () => { state.activeRoom=e.dataset.room; save(); render(); });
  document.querySelectorAll('[data-theme]').forEach(e => e.onclick = () => chooseTheme(e.dataset.theme));
  document.querySelectorAll('[data-action]').forEach(e => e.onclick = () => act(e.dataset.action));
}
function act(a) {
  if (a==='continue' || a==='start-default') { selectedSubjectId=state.lastSubject||'science'; selectedBookId=subjectBooks(selectedSubjectId)[0].id; selectedChapterId=chaptersForBook(selectedBookId)[0].chapter_id; startMission(); return; }
  if (a==='play') { startMission(); return; }
  if (a==='start-check') { stage='check'; mini.checkCards=[]; mini.checkSelected=[]; mini.checkDone=false; mini.checkMessage=''; mini.wrongCard=-1; render(); return; }
  if (a==='back-intro') { stage='intro'; mini.checkCards=[]; mini.checkSelected=[]; mini.checkDone=false; mini.checkMessage=''; mini.wrongCard=-1; render(); return; }
  if (a==='start-game') { stage='game'; if(!requiresMiniGame(activeChapter)) mini.done=true; render(); return; }
  if (a==='start-quiz') { startQuiz(); return; }
  if (a==='replay') { startMission(); return; }
  if (a==='next-q') { const correct=selectedOption===quiz[qIndex].a; if (correct) score++; if (qIndex===quiz.length-1) finishMission(); else { qIndex++; selectedOption=null; render(); } return; }
  if (a==='exit') { route='chapter'; render(); return; }
  if (a==='back-chapters') { route='chapters'; render(); return; }
  if (a==='reset-mini') { resetMini(); render(); return; }
  if (a==='shop-check') { mini.done=mini.selected.includes(0)&&mini.selected.includes(1); render(); return; }
  if (a==='edit-name') { openName(); return; }
  if (a==='edit-avatar') { openAvatar(); return; }
  if (a==='rename-home') { openHomeName(); return; }
  if (a==='themes') { openThemes(); return; }
  if (a==='reset') { localStorage.removeItem(key); state=cloneDefault(); render(); toast('Progress reset'); return; }
}
function resetMini() { mini = { done:false, progress:0, dragging:false, selected:[], sequence:[], tapped:[], checkCards:[], checkSelected:[], checkDone:false, checkMessage:'', wrongCard:-1 }; }
function checkCard(index){if(!mini.checkCards.length)mini.checkCards=quickCheckCards(activeChapter);const card=mini.checkCards[index];if(!card||mini.checkDone||mini.checkSelected.includes(index))return;mini.wrongCard=-1;if(!card.correct){mini.wrongCard=index;mini.checkMessage=`❌ Not quite, ${playerName()}! Look back at the quick lesson and think again.`;playWrong();render();setTimeout(()=>{mini.wrongCard=-1;mini.checkMessage='';if(route==='mission'&&stage==='check')render();},850);return;}mini.checkSelected.push(index);if(mini.checkSelected.length>=3){mini.checkDone=true;mini.checkMessage=`✅ Brilliant, ${playerName()}! You found all 3 correct ideas.`;playSuccess();toast(`✨ Great start, ${playerName()}! Mission unlocked.`);}else{mini.checkMessage=`✅ Correct! ${3-mini.checkSelected.length} more to unlock the mission.`;playSuccess();}render();}
async function loadChapterData(chapterId){
  if(chapterCache[chapterId]) return chapterCache[chapterId];
  const meta = chapterById[chapterId];
  if(!meta || !meta.data_path) throw new Error('Chapter data path missing.');
  const r = await fetch('../'+meta.data_path, { cache: 'no-store' });
  if(!r.ok) throw new Error('Chapter load failed: '+r.status);
  const data = await r.json();
  chapterCache[chapterId] = data;
  return data;
}
async function startMission(){
  const meta = chapterById[selectedChapterId];
  if(!meta){toast('Please choose a chapter first.');return;}
  if(meta.status !== 'active'){toast('This chapter is a future slot and is not active yet.');return;}
  state.lastSubject=meta.subject_id;
  try {
    activeChapter = await loadChapterData(selectedChapterId);
  } catch (err) {
    console.error(err);
    toast('Chapter could not be loaded. Please try again.');
    return;
  }
  stage='intro'; resetMini(); route='mission'; render();
}
function questionKey(q){ return String(q.q || '').trim(); }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function prepareQuestion(q){
  const pairs=q.o.map((text,i)=>({text,correct:i===q.a}));
  const mixed=shuffle(pairs);
  return {...q,o:mixed.map(x=>x.text),a:mixed.findIndex(x=>x.correct)};
}
function startQuiz() {
  stage='quiz'; qIndex=0; score=0; selectedOption=null;
  const pool=Array.isArray(activeChapter.questions)?activeChapter.questions:[];
  const history=Array.isArray(state.questionHistory[activeChapter.chapter_id])?state.questionHistory[activeChapter.chapter_id]:[];
  let fresh=pool.filter(q=>!history.includes(questionKey(q)));
  if(fresh.length<5) fresh=pool;
  const picked=shuffle(fresh).slice(0,Math.min(5,pool.length)).map(prepareQuestion);
  quiz=picked;
  const keys=picked.map(questionKey);
  state.questionHistory[activeChapter.chapter_id]=[...keys,...history.filter(k=>!keys.includes(k))].slice(0,10);
  save(); render();
}
function masteryReward(scoreCount){
  if(scoreCount>=5) return {xp:20,coins:60,egg:1};
  if(scoreCount>=4) return {xp:10,coins:20,egg:0};
  return {xp:0,coins:0,egg:0};
}
function rewardFor(scoreCount, firstCompletion) { return masteryReward(scoreCount); }
function resultCopy(){
  if(score===5) return `👏 WOW, ${playerName()}! Perfect 5 / 5 — you unlocked the full mission reward!`;
  if(score===4) return `🌟 Great job, ${playerName()}! One more correct answer would have unlocked the full reward.`;
  const need=5-score;
  return `💪 Nice try, ${playerName()}! ${need} more correct ${need===1?'answer':'answers'} would unlock the reward. Try the mission again!`;
}
function resultView() {
  const perfect = score === 5;
  const reward = lastReward || {xp:0,coins:0,egg:0};
  const best=Number(state.chapterBest[activeChapter?.chapter_id]||0);
  const rewardText = score<4 ? `No reward yet. A 5/5 unlocks ⭐ 20 XP + 🪙 60 Coins + 🥚 Golden Egg.` : (score===4 ? `Partial reward unlocked. A 5/5 adds the remaining reward + Golden Egg.` : (reward.xp || reward.coins || reward.egg ? `Full mastery reward unlocked.` : `No new reward this time — try to beat your best score!`));
  return `<section class="result-card ${perfect?'perfect':''}"><div class="result-icon">${perfect?'🥚':score>=4?'🏆':'💪'}</div><div class="eyebrow">${perfect?'PERFECT MISSION':score>=4?'MISSION CLEARED':'KEEP PRACTISING'}</div><h1>${esc(activeChapter?.chapter||'Chapter')}</h1><div class="perfect-banner ${score<4?'retry-banner':''}">${resultCopy()}</div><p class="muted">Best score: <b>${best}/5</b> • ${rewardText}</p><div class="reward-grid"><div><b>⭐ ${reward.xp}</b><span class="muted">XP earned</span></div><div><b>🪙 ${reward.coins}</b><span class="muted">Coins earned</span></div><div><b>✅ ${score}/${quiz.length}</b><span class="muted">Correct</span></div></div>${perfect&&reward.egg?'<div class="golden-egg">🥚 Golden Egg <small>Perfect-mission collectible</small></div>':''}<div class="personal-best">🏅 Best score: ${best}/5</div><div class="action-bar"><button class="btn soft" data-action="back-chapters">Back to chapters</button><button class="btn soft" data-action="replay">Play again</button><button class="btn primary" data-route="world">See My Home →</button></div></section>`;
}
function finishMission() {
  const id=activeChapter.chapter_id;
  const previousBest=Number(state.chapterBest[id]||0);
  const newBest=Math.max(previousBest,score);
  const previousReward=masteryReward(previousBest);
  const newReward=masteryReward(newBest);
  const delta={xp:Math.max(0,newReward.xp-previousReward.xp),coins:Math.max(0,newReward.coins-previousReward.coins),egg:Math.max(0,newReward.egg-previousReward.egg)};
  lastReward=delta;
  lastFirstCompletion=newBest>previousBest;
  if(newBest>previousBest){
    state.chapterBest[id]=newBest;
    if(newBest>=4 && !state.completed.includes(id)) state.completed.push(id);
    state.xp+=delta.xp;
    state.coins+=delta.coins;
    state.goldenEggs+=delta.egg;
    if(delta.egg){
      state.perfectMissions += 1;
      addGoldenEggToHome();
      playApplause();
      confetti();
    } else if(delta.xp || delta.coins){
      playSuccess();
    }
  }
  save();
  route='result';
  render();
}
function addGoldenEggToHome() {
  const id=`golden-egg-${Date.now()}`;
  state.roomItems.push({id,room:'play',x:52,y:35,emoji:'🥚',name:'Golden Egg'});
}
function selectItem(i) {
  if (activeChapter.chapter==='Money'||activeChapter.chapter==='Symmetry') {
    if (!mini.selected.includes(i)) mini.selected.push(i); else mini.selected=mini.selected.filter(x=>x!==i);
    if (activeChapter.chapter==='Symmetry' && mini.selected.length>=2) mini.done=true;
    render();
  }
}
function tapCode(i) { if (!mini.sequence.includes(i)) mini.sequence.push(i); if (mini.sequence.join(',')==='0,1,2') mini.done=true; render(); }
function tapMap(v) { if (!mini.tapped.includes(v)) mini.tapped.push(v); if (mini.tapped.length>=3) mini.done=true; render(); }
function bindMini() {
  const scene=document.getElementById('pushScene'), crate=document.getElementById('dragCrate'), target=document.getElementById('dropTarget');
  if(scene&&crate&&target){
    const move=x=>{
      const sr=scene.getBoundingClientRect();
      let left=x-sr.left-crate.offsetWidth/2;
      const max=scene.clientWidth-crate.offsetWidth-6;
      left=Math.max(6,Math.min(max,left));
      crate.style.left=left+'px';
      mini.progress=Math.max(mini.progress,Math.min(1,left/(max||1)));
      const cr=crate.getBoundingClientRect(),tr=target.getBoundingClientRect();
      const overlap=(cr.right>tr.left+5&&cr.left<tr.right-5&&cr.bottom>tr.top+5&&cr.top<tr.bottom-5);
      if(overlap){ mini.done=true; mini.progress=1; crate.style.left=Math.max(0,target.offsetLeft+(target.offsetWidth-crate.offsetWidth)/2)+'px'; render(); }
    };
    crate.onpointerdown=e=>{crate.setPointerCapture(e.pointerId);mini.dragging=true;};
    crate.onpointermove=e=>{if(mini.dragging)move(e.clientX);};
    crate.onpointerup=()=>mini.dragging=false;
    crate.onpointercancel=()=>mini.dragging=false;
  }
}
function buy(id) {
  const room = state.activeRoom;
  const it = roomItemDef(room, id);
  if(!it) return;
  state.roomUnlocked[room] ||= [];
  if(state.roomUnlocked[room].includes(id)) return;
  if(state.coins < it.cost){toast(`You need ${it.cost-state.coins} more coins.`);return;}
  state.coins -= it.cost;
  state.roomUnlocked[room].push(id);
  state.roomItems.push({id:`${id}-${Date.now()}`,room,x:50,y:45,emoji:it.emoji,name:it.name});
  save(); render(); toast(`${it.name} added to ${ROOMS.find(r => r.id===room).name}!`);
}
function bindWorldDrag() {
  const roomEl=document.querySelector('.room');
  if(!roomEl) return;
  document.querySelectorAll('[data-world-item]').forEach(el=>{
    el.onpointerdown=e=>{
      e.preventDefault();
      draggedWorldItem=el;
      el.setPointerCapture(e.pointerId);
      el.classList.add('dragging');
    };
    el.onpointermove=e=>{
      if(!draggedWorldItem) return;
      const rect=roomEl.getBoundingClientRect();
      const x=Math.max(8,Math.min(92,((e.clientX-rect.left)/rect.width)*100));
      const y=Math.max(10,Math.min(86,((e.clientY-rect.top)/rect.height)*100));
      el.style.left=x+'%'; el.style.top=y+'%';
    };
    el.onpointerup=()=>finishWorldDrag(el);
    el.onpointercancel=()=>finishWorldDrag(el);
  });
}
function finishWorldDrag(el){
  if(!draggedWorldItem) return;
  const rect=document.querySelector('.room').getBoundingClientRect();
  const x=Math.max(8,Math.min(92,((parseFloat(el.style.left)||50))));
  const y=Math.max(10,Math.min(86,((parseFloat(el.style.top)||45))));
  const id=el.dataset.worldItem;
  const room=state.activeRoom;
  const sameRoom=roomItemsFor(room);
  const indexInRoom=Array.from(document.querySelectorAll('[data-world-item]')).indexOf(el);
  const globalIndex=state.roomItems.findIndex(i=>i.id===id);
  if(globalIndex>=0){state.roomItems[globalIndex].x=x;state.roomItems[globalIndex].y=y;state.roomItems[globalIndex].room=room;save();}
  el.classList.remove('dragging');draggedWorldItem=null;
}
function chooseTheme(id){
  const t=THEMES[id];
  if(state.xp<t.minXP){toast(`Earn ${t.minXP-state.xp} more XP to unlock ${t.name}.`);return;}
  state.customRoomColors[state.activeRoom]='';
  state.roomThemes[state.activeRoom]=id; save(); const m=document.getElementById('modal'); if(m)m.classList.add('hidden'); render(); toast(`${t.name} colour applied!`);
}
function applyCustomColor(){
  if(state.xp<CUSTOM_COLOUR_MIN_XP){toast(`Earn ${CUSTOM_COLOUR_MIN_XP-state.xp} more XP to create your own colour.`);return;}
  const input=document.getElementById('customColor');
  if(!input)return;
  state.customRoomColors[state.activeRoom]=input.value.toLowerCase();
  save(); const m=document.getElementById('modal'); if(m)m.classList.add('hidden'); render(); toast('Your colour is now active!');
}
function openThemes(){
  const m=document.getElementById('modal');m.classList.remove('hidden');
  const custom=state.customRoomColors?.[state.activeRoom]||'';
  m.innerHTML=`<div class="modal-card"><div class="modal-kicker">🎨 ROOM COLOURS</div><h2>Choose a colour</h2><p class="muted">Sky and Mint are free. Other colours unlock with XP. You can use any unlocked colour in any room.</p><div class="theme-grid">${Object.entries(THEMES).map(([id,t])=>`<button class="theme-card ${state.xp>=t.minXP?'':'locked'} ${state.roomThemes[state.activeRoom]===id && !custom?'active':''}" data-theme="${id}"><span class="theme-swatch" style="background:linear-gradient(135deg,${t.wall},${t.floor})"></span><b>${t.name}</b><small>${t.minXP===0?'Free':t.minXP+' XP'}</small></button>`).join('')}</div><div class="custom-colour-row"><input id="customColor" class="color-picker" type="color" value="${custom || '#6f9dff'}" ${state.xp>=CUSTOM_COLOUR_MIN_XP?'':'disabled'}><button class="custom-colour-btn" id="applyCustomColor" ${state.xp>=CUSTOM_COLOUR_MIN_XP?'':'disabled'}>✨ Use my colour <span>${CUSTOM_COLOUR_MIN_XP} XP</span></button></div><div class="modal-actions"><button class="btn dark" id="closeThemes">Done</button></div></div>`;
  document.getElementById('closeThemes').onclick=()=>{m.classList.add('hidden');render();};
  document.querySelectorAll('.modal [data-theme]').forEach(e=>e.onclick=()=>chooseTheme(e.dataset.theme));
  const customBtn=document.getElementById('applyCustomColor');
  if(customBtn) customBtn.onclick=()=>applyCustomColor();
}
function openHomeName(){
  const m=document.getElementById('modal');m.classList.remove('hidden');
  m.innerHTML=`<div class="modal-card"><div class="modal-kicker">🏠 MY HOME</div><h2>Name your world</h2><p class="muted">Give your home a name you'll recognise.</p><input id="homeNameInput" class="input" maxlength="24" value="${esc(state.homeName)}" placeholder="Abbir's World"><div class="modal-actions"><button class="btn soft" id="closeHomeName">Cancel</button><button class="btn dark" id="saveHomeName">Save</button></div></div>`;
  document.getElementById('closeHomeName').onclick=()=>m.classList.add('hidden');
  document.getElementById('saveHomeName').onclick=()=>{state.homeName=document.getElementById('homeNameInput').value.trim()||'My Home';save();m.classList.add('hidden');render();};
  document.getElementById('homeNameInput').focus();
}
function openAvatar(){
  const m=document.getElementById('modal');m.classList.remove('hidden');
  m.innerHTML=`<div class="modal-card"><div class="modal-kicker">🧑‍🚀 PLAYER</div><h2>Choose your avatar</h2><p class="muted">Your avatar follows you across Home, Profile, My Home and Missions. XP unlocks more choices.</p><div class="avatar-grid">${Object.entries(AVATARS).map(([id,a])=>`<button class="avatar-card ${state.avatar===id?'active':''} ${state.xp>=a.minXP?'':'locked'}" data-avatar="${id}"><span class="avatar-face">${a.emoji}</span><b>${a.name}</b><small>${a.minXP===0?'Free':a.minXP+' XP'}</small></button>`).join('')}</div><div class="modal-actions"><button class="btn dark" id="closeAvatar">Done</button></div></div>`;
  document.getElementById('closeAvatar').onclick=()=>{m.classList.add('hidden');render();};
  document.querySelectorAll('.modal [data-avatar]').forEach(e=>e.onclick=()=>chooseAvatar(e.dataset.avatar));
}
function chooseAvatar(id){
  const a=AVATARS[id]; if(!a)return;
  if(state.xp<a.minXP){toast(`Earn ${a.minXP-state.xp} more XP to unlock ${a.name}.`);return;}
  state.avatar=id; save(); const m=document.getElementById('modal'); if(m)m.classList.add('hidden'); render(); toast(`${a.name} selected!`);
}
function openName(){
  const m=document.getElementById('modal');m.classList.remove('hidden');
  m.innerHTML=`<div class="modal-card"><div class="modal-kicker">🧑‍🚀 PLAYER</div><h2>What should we call you?</h2><p class="muted">Use the name you want to see in missions and rewards.</p><input id="nameInput" class="input" maxlength="20" value="" placeholder="Write your name" autocomplete="off"><div class="modal-actions"><button class="btn soft" id="closeName">Cancel</button><button class="btn dark" id="saveName">Save</button></div></div>`;
  document.getElementById('closeName').onclick=()=>m.classList.add('hidden');
  document.getElementById('saveName').onclick=()=>{const entered=document.getElementById('nameInput').value.trim(); if(entered) state.name=entered; save();m.classList.add('hidden');render();};
  document.getElementById('nameInput').focus();
}
function audioContext(){return window.AudioContext||window.webkitAudioContext?new (window.AudioContext||window.webkitAudioContext)():null}
function playSuccess(){ try{const ctx=audioContext(); if(!ctx)return; const o=ctx.createOscillator(), g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(660,ctx.currentTime); o.frequency.exponentialRampToValueAtTime(880,ctx.currentTime+.12); g.gain.setValueAtTime(.001,ctx.currentTime); g.gain.exponentialRampToValueAtTime(.12,ctx.currentTime+.02); g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.18); o.connect(g).connect(ctx.destination); o.start();o.stop(ctx.currentTime+.2);}catch{} }
function playWrong(){ try{const ctx=audioContext(); if(!ctx)return; const o=ctx.createOscillator(), g=ctx.createGain(); o.type='square'; o.frequency.setValueAtTime(210,ctx.currentTime); o.frequency.exponentialRampToValueAtTime(160,ctx.currentTime+.12); g.gain.setValueAtTime(.001,ctx.currentTime); g.gain.exponentialRampToValueAtTime(.055,ctx.currentTime+.015); g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.16); o.connect(g).connect(ctx.destination); o.start();o.stop(ctx.currentTime+.17);}catch{} }
function playApplause(){
  try{
    const C=window.AudioContext||window.webkitAudioContext; if(!C)return; const ctx=new C();
    const duration=.8, buffer=ctx.createBuffer(1,ctx.sampleRate*duration,ctx.sampleRate), data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*Math.exp(-i/(ctx.sampleRate*.22));
    for(let n=0;n<12;n++){
      const src=ctx.createBufferSource(), gain=ctx.createGain(); src.buffer=buffer; gain.gain.value=.07; src.connect(gain).connect(ctx.destination); src.start(ctx.currentTime+n*.055);
    }
    const o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.value=523;g.gain.setValueAtTime(.001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.12,ctx.currentTime+.08);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.65);o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+.7);
  }catch{}
}
function confetti(){
  const host=document.createElement('div'); host.className='confetti';
  for(let i=0;i<42;i++){const s=document.createElement('span');s.style.left=Math.random()*100+'%';s.style.animationDelay=(Math.random()*.2)+'s';s.style.transform=`rotate(${Math.random()*360}deg)`;host.appendChild(s)}
  document.body.appendChild(host);setTimeout(()=>host.remove(),1800);
}
document.getElementById('backBtn').onclick=()=>{
  if(route==='profile' || route==='world') route='home';
  else if(route==='result') route='chapter';
  else if(route==='mission') route='chapter';
  else if(route==='chapter') route='chapters';
  else if(route==='chapters') route='books';
  else if(route==='books') route='subjects';
  else if(route==='subjects') route='home';
  render();
};
render();


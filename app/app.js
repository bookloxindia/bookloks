const DATA = window.APP_DATA || {};
const BASE_SUBJECTS = Array.isArray(DATA.subjects) ? DATA.subjects : [];
const TRACK_DEFS = [
  ['maths','Mathematics','maths-main','🧮','#5B43FF','Numbers, operations, geometry, measurement and data.'],
  ['science','Science','science-main','🔬','#12B8E8','Health, living things, materials, light, measurement and forces.'],
  ['social','Social Studies','social-main','🌍','#19B36B','India, regions, resources, history, culture and civic life.'],
  ['english','English','english-reader','📖','#FF6B9C','Stories, poems, communication, reading and language.'],
  ['english-grammar','English Grammar','english-grammar','📝','#FF5D91','Words, sentences, grammar and writing.'],
  ['hindi','Hindi','hindi-reader','📚','#FF8A48','Hindi stories, poems, reading and writing.'],
  ['hindi-grammar','Hindi Grammar','hindi-grammar','✍️','#FF7A45','Hindi grammar, writing and language skills.'],
  ['computer','Computer / IT','computer-main','💻','#F2B600','Digital literacy, coding, internet and AI.'],
  ['olympiad','Olympiad Challenge','maths-olympiad','🏆','#9D6BFF','Higher-difficulty reasoning and competitive mathematics.']
].map(([id,name,book_id,icon,color,blurb]) => ({id,name,book_id,icon,color,blurb}));
const subjects = TRACK_DEFS.map(t => ({...t, ...(Array.isArray(DATA.tracks) ? (DATA.tracks.find(x=>x.id===t.id)||{}) : {})}));
const subjectById = Object.fromEntries(subjects.map(s => [s.id, s]));
const books = Array.isArray(DATA.books) ? DATA.books.filter(b => b.id !== 'maths-workbook') : [];
const curriculum = Array.isArray(DATA.curriculum) ? DATA.curriculum.filter(c => c.book_id !== 'maths-workbook' && c.status !== 'planned') : [];
const chapterById = Object.fromEntries(curriculum.map(c => [c.chapter_id, c]));
const booksBySubject = Object.fromEntries(subjects.map(s => [s.id, books.filter(b => b.id === s.book_id)]));
const trackForBookId = Object.fromEntries(subjects.map(s => [s.book_id, s]));
function trackForChapter(c) { return subjectById[c?.track_id] || trackForBookId[c?.book_id] || subjectById[c?.subject_id] || subjects[0]; }

const key = 'class4world_v4_state';
const legacyKey = 'class4world_v3_state';
const DEFAULT_STATE = {
  name: '', avatar: 'boy', homeName: 'My Home', homeNameCustom: false, xp: 0, coins: 0, streak: 1,
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

// Each room has its own inventory. Each room has 25 objects and its 24 paid items total 1,890 coins.
// Four rooms therefore cost 7,560 coins in total, matching the maximum 126-chapter perfect reward pool.
const ROOM_COSTS = [20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,105,110,115,120,130,135,155]; // 1,890 coins across 24 paid items
const ROOM_CATALOG = {
  living: [
    ['living-starter-lamp',0,'💡','Starter Lamp'], ['living-cozy-sofa',20,'🛋️','Cozy Sofa'], ['living-armchair',25,'🪑','Armchair'], ['living-coffee-table',30,'🪵','Coffee Table'], ['living-floor-lamp',35,'💡','Floor Lamp'], ['living-plant',40,'🪴','Living Plant'], ['living-rug',45,'🧶','Rug'], ['living-tv',50,'📺','TV'], ['living-tv-unit',55,'🗄️','TV Unit'], ['living-bookshelf',60,'📚','Bookshelf'], ['living-side-table',65,'🪑','Side Table'], ['living-wall-clock',70,'🕒','Wall Clock'], ['living-curtains',75,'🪟','Curtains'], ['living-cushion',80,'🛏️','Cushion'], ['living-photo-frame',85,'🖼️','Photo Frame'], ['living-wall-art',90,'🎨','Wall Art'], ['living-cabinet',95,'🗄️','Cabinet'], ['living-ottoman',100,'🪑','Ottoman'], ['living-coffee-tray',105,'🍵','Tea Tray'], ['living-tall-plant',110,'🌿','Tall Plant'], ['living-ceiling-light',115,'💡','Ceiling Light'], ['living-bean-bag',120,'🪑','Bean Bag'], ['living-speaker',130,'🔊','Speaker'], ['living-floor-cushion',135,'🟣','Floor Cushion'], ['living-aquarium',155,'🐠','Fish Tank']
  ],
  drawing: [
    ['drawing-starter-easel',0,'🖼️','Starter Easel'], ['drawing-art-stool',20,'🪑','Art Stool'], ['drawing-canvas',25,'🎨','Canvas'], ['drawing-paint-box',30,'🖍️','Colour Box'], ['drawing-palette',35,'🎨','Paint Palette'], ['drawing-pencil-cup',40,'✏️','Pencil Cup'], ['drawing-art-table',45,'🪵','Art Table'], ['drawing-floor-lamp',50,'💡','Art Lamp'], ['drawing-art-rug',55,'🧶','Art Rug'], ['drawing-storage-box',60,'📦','Art Box'], ['drawing-wall-clock',65,'🕒','Wall Clock'], ['drawing-side-table',70,'🪑','Side Table'], ['drawing-bookshelf',75,'📚','Bookshelf'], ['drawing-plant',80,'🪴','Small Plant'], ['drawing-wall-art',85,'🖼️','Wall Art'], ['drawing-sketch-board',90,'📋','Sketch Board'], ['drawing-storage-cabinet',95,'🗄️','Art Cabinet'], ['drawing-floor-cushion',100,'🟣','Floor Cushion'], ['drawing-craft-basket',105,'🧺','Craft Basket'], ['drawing-frame',110,'🖼️','Picture Frame'], ['drawing-ceiling-light',115,'💡','Ceiling Light'], ['drawing-trophy',120,'🏆','Art Trophy'], ['drawing-sculpture',130,'🗿','Mini Sculpture'], ['drawing-mini-piano',135,'🎹','Mini Piano'], ['drawing-display-shelf',155,'🪵','Display Shelf']
  ],
  play: [
    ['play-starter-ball',0,'⚽','Starter Ball'], ['play-blocks',20,'🧱','Building Blocks'], ['play-toy-chest',25,'🧰','Toy Chest'], ['play-soft-rug',30,'🧶','Soft Rug'], ['play-bean-bag',35,'🪑','Bean Bag'], ['play-small-table',40,'🪵','Play Table'], ['play-chair',45,'🪑','Play Chair'], ['play-puzzle-mat',50,'🧩','Puzzle Mat'], ['play-bookshelf',55,'📚','Toy Shelf'], ['play-soft-toys',60,'🧸','Soft Toys'], ['play-basket',65,'🧺','Toy Basket'], ['play-rocket',70,'🚀','Rocket Toy'], ['play-train',75,'🚂','Toy Train'], ['play-board-game',80,'🎲','Board Game'], ['play-rc-car',85,'🚗','RC Car'], ['play-dollhouse',90,'🏠','Doll House'], ['play-art-corner',95,'🎨','Art Corner'], ['play-star-lamp',100,'⭐','Star Lamp'], ['play-wall-clock',105,'🕒','Wall Clock'], ['play-wall-art',110,'🎯','Play Wall Art'], ['play-mini-tent',115,'⛺','Play Tent'], ['play-gaming',120,'🎮','Game Corner'], ['play-trophy',130,'🏆','Trophy'], ['play-music-corner',135,'🎵','Music Corner'], ['play-mini-slide',155,'🛝','Mini Slide']
  ],
  dining: [
    ['dining-starter-plant',0,'🪴','Starter Plant'], ['dining-table',20,'🍽️','Dining Table'], ['dining-chair',25,'🪑','Dining Chair'], ['dining-bench',30,'🪑','Dining Bench'], ['dining-rug',35,'🧶','Dining Rug'], ['dining-fruit-basket',40,'🧺','Fruit Basket'], ['dining-pendant',45,'💡','Pendant Light'], ['dining-sideboard',50,'🗄️','Sideboard'], ['dining-cabinet',55,'🗄️','Crockery Cabinet'], ['dining-water-jug',60,'🫗','Water Jug'], ['dining-plates',65,'🍽️','Dinner Plates'], ['dining-cups',70,'☕','Tea Cups'], ['dining-cutlery',75,'🥄','Cutlery Set'], ['dining-vase',80,'🏺','Flower Vase'], ['dining-centerpiece',85,'🌼','Table Decor'], ['dining-wall-clock',90,'🕒','Wall Clock'], ['dining-mirror',95,'🪞','Wall Mirror'], ['dining-serving-trolley',100,'🛒','Serving Trolley'], ['dining-bar-stool',105,'🪑','Bar Stool'], ['dining-napkin-holder',110,'🧻','Napkin Holder'], ['dining-tea-set',115,'🫖','Tea Set'], ['dining-wall-art',120,'🖼️','Wall Art'], ['dining-plant',130,'🌿','Table Plant'], ['dining-floor-lamp',135,'💡','Floor Lamp'], ['dining-display-shelf',155,'🪵','Display Shelf']
  ]
};
for(const [room,list] of Object.entries(ROOM_CATALOG)) ROOM_CATALOG[room]=list.map(([id,cost,emoji,name])=>({id,cost,emoji,name}));

function roomCatalog(room) { return [...(ROOM_CATALOG[room] || [])].sort((a,b)=>a.cost-b.cost || a.name.localeCompare(b.name)); }
function roomItemDef(room, id) { return roomCatalog(room).find(x => x.id === id); }

const AVATARS = {
  boy: { name: 'Boy', emoji: '👦', minXP: 0 },
  girl: { name: 'Girl', emoji: '👧', minXP: 0 },
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

function avatarMeta(){ return AVATARS[state.avatar] || AVATARS.boy; }

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

let state = null;

// Initialise persisted player state only after AVATARS and THEMES exist.
state = loadState();
let route = 'home';
let selectedSubjectId = null, selectedBookId = null, selectedChapterId = null, activeChapter = null;
let stage = 'intro', quiz = [], qIndex = 0, score = 0, selectedOption = null;
let mini = { done:false, progress:0, dragging:false, selected:[], sequence:[], tapped:[], genericStep:0, checkCards:[], checkSelected:[], checkDone:false, checkMessage:'', wrongCard:-1 };
let draggedWorldItem = null;
const chapterCache = {};
let lastReward = {xp:0, coins:0, egg:0};
let lastFirstCompletion = false;
let onboardingStep = 1;
const SOUND_FILES = {
  background: 'sounds/background.mp3',
  quickCheckWrong: 'sounds/quick-check-wrong.mp3',
  quickCheckRight: 'sounds/quick-check-right.mp3',
  questionRight: 'sounds/question-right.mp3',
  questionWrong: 'sounds/question-wrong.mp3',
  missionSuccess: 'sounds/mission-success.mp3',
  missionFailed: 'sounds/mission-failed.mp3'
};
let bgMusic = null;
let audioGestureSeen = false;
const AUDIO_DEFAULTS_VERSION = '7.0';
const audioDefaultsApplied = localStorage.getItem('bookloks_audio_defaults_version') === AUDIO_DEFAULTS_VERSION;
if (!audioDefaultsApplied) {
  const mobileDefault = window.innerWidth <= 640;
  localStorage.setItem('bookloks_music', 'on');
  localStorage.setItem('bookloks_sfx', 'on');
  localStorage.setItem('bookloks_music_volume', mobileDefault ? '0.05' : '0.20');
  localStorage.setItem('bookloks_sfx_volume', '0.90');
  localStorage.setItem('bookloks_audio_defaults_version', AUDIO_DEFAULTS_VERSION);
}
let musicEnabled = localStorage.getItem('bookloks_music') !== 'off';
let soundEffectsEnabled = localStorage.getItem('bookloks_sfx') !== 'off';
let musicVolume = Number(localStorage.getItem('bookloks_music_volume') ?? '0.20');
let sfxVolume = Number(localStorage.getItem('bookloks_sfx_volume') ?? '0.90');
if (!Number.isFinite(musicVolume)) musicVolume = 0.20;
if (!Number.isFinite(sfxVolume)) sfxVolume = 0.90;
musicVolume = Math.max(0, Math.min(1, musicVolume));
sfxVolume = Math.max(0, Math.min(1, sfxVolume));

function initSoundSystem() {
  if (bgMusic) return;
  bgMusic = new Audio(SOUND_FILES.background);
  bgMusic.loop = true;
  bgMusic.preload = 'auto';
  bgMusic.volume = musicVolume;
}

function updateSoundSettingsUI() {
  const music = document.getElementById('profileMusicBtn');
  const sfx = document.getElementById('profileSfxBtn');
  const musicRange = document.getElementById('musicVolumeRange');
  const sfxRange = document.getElementById('sfxVolumeRange');
  const musicPct = document.getElementById('musicVolumePct');
  const sfxPct = document.getElementById('sfxVolumePct');
  if (music) {
    music.textContent = musicEnabled ? '🎵 Music: ON' : '🔇 Music: OFF';
    music.classList.toggle('active', musicEnabled);
  }
  if (sfx) {
    sfx.textContent = soundEffectsEnabled ? '🔊 Sounds: ON' : '🔇 Sounds: OFF';
    sfx.classList.toggle('active', soundEffectsEnabled);
  }
  if (musicRange) musicRange.value = String(Math.round(musicVolume * 100));
  if (sfxRange) sfxRange.value = String(Math.round(sfxVolume * 100));
  if (musicPct) musicPct.textContent = Math.round(musicVolume * 100) + '%';
  if (sfxPct) sfxPct.textContent = Math.round(sfxVolume * 100) + '%';
  if (bgMusic) bgMusic.volume = musicEnabled ? musicVolume : 0;
}
function startBackgroundMusic(opts = {}) {
  if (!musicEnabled) return;
  initSoundSystem();
  if (!bgMusic) return;
  bgMusic.volume = musicVolume;
  bgMusic.muted = !audioGestureSeen;
  try { bgMusic.currentTime = bgMusic.currentTime || 0; } catch (_) {}
  if (!bgMusic.paused) {
    if (audioGestureSeen) bgMusic.muted = false;
    return;
  }
  const p = bgMusic.play();
  if (p && typeof p.then === 'function') {
    p.then(() => {
      if (audioGestureSeen) bgMusic.muted = false;
    }).catch(() => {
      // Browser autoplay policy may block audible playback.
      // We retry automatically on the first pointer/touch/key gesture.
    });
  }
}
function unlockAndStartMusic() {
  audioGestureSeen = true;
  if (!musicEnabled) return;
  initSoundSystem();
  if (!bgMusic) return;
  bgMusic.muted = false;
  bgMusic.volume = musicVolume;
  const p = bgMusic.play();
  if (p && typeof p.catch === 'function') p.catch(() => {});
}


function setMusicVolume(value) {
  musicVolume = Math.max(0, Math.min(1, Number(value) || 0));
  localStorage.setItem('bookloks_music_volume', String(musicVolume));
  if (bgMusic) bgMusic.volume = musicEnabled ? musicVolume : 0;
  updateSoundSettingsUI();
}
function setSfxVolume(value) {
  sfxVolume = Math.max(0, Math.min(1, Number(value) || 0));
  localStorage.setItem('bookloks_sfx_volume', String(sfxVolume));
  updateSoundSettingsUI();
}
function toggleMusic() {
  musicEnabled = !musicEnabled;
  localStorage.setItem('bookloks_music', musicEnabled ? 'on' : 'off');
  initSoundSystem();
  if (musicEnabled) { audioGestureSeen = true; bgMusic.muted = false; startBackgroundMusic(); }
  else if (bgMusic) { bgMusic.pause(); bgMusic.volume = 0; }
  updateSoundSettingsUI();
}
function toggleSoundEffects() {
  soundEffectsEnabled = !soundEffectsEnabled;
  localStorage.setItem('bookloks_sfx', soundEffectsEnabled ? 'on' : 'off');
  updateSoundSettingsUI();
}
function playEffect(file, volume, duckMs = 1100) {
  if (!soundEffectsEnabled) return;
  try {
    if (musicEnabled) startBackgroundMusic();
    const effect = new Audio(SOUND_FILES[file]);
    effect.preload = 'auto';
    effect.volume = Math.max(0, Math.min(1, volume * sfxVolume));
    const oldVolume = bgMusic ? bgMusic.volume : musicVolume;
    if (bgMusic && !bgMusic.paused) bgMusic.volume = Math.min(0.08, musicVolume * 0.25);
    const restore = () => {
      if (bgMusic && !bgMusic.paused) bgMusic.volume = oldVolume;
      effect.removeEventListener('ended', restore);
    };
    effect.addEventListener('ended', restore);
    window.setTimeout(restore, duckMs);
    const p = effect.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch (_) {}
}

function vibrateWrong() {
  try {
    if (navigator.vibrate) navigator.vibrate([90, 45, 90]);
  } catch (_) {}
}


function cloneDefault() { return JSON.parse(JSON.stringify(DEFAULT_STATE)); }
function loadState() {
  try {
    const current = JSON.parse(localStorage.getItem(key) || 'null');
    const base = cloneDefault();
    if (!current) return base;
    const merged = { ...base, ...current };
    merged.avatar = AVATARS[current.avatar] ? current.avatar : (AVATARS.boy ? 'boy' : base.avatar);
    merged.homeNameCustom = typeof current.homeNameCustom === 'boolean' ? current.homeNameCustom : Boolean(current.homeName && current.homeName !== 'My Home' && current.homeName !== `${current.name || ''}'s Home`);
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
function go(r) { route = r; syncOrientationForRoute(r); render(); }
function goHome() { selectedSubjectId = selectedBookId = selectedChapterId = null; activeChapter = null; go('home'); }
function subjectBooks(id) { return booksBySubject[id] || []; }
function chaptersForBook(id) { return curriculum.filter(c => c.book_id === id && c.status !== 'planned'); }
function chaptersForTrack(id) { const t=subjectById[id]; return t ? chaptersForBook(t.book_id) : []; }
function syncOrientationForRoute(r) {
  const landscape = r === 'map' || r === 'world';
  document.body.classList.toggle('landscape-route', landscape);
  if (landscape) {
    try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(()=>{}); } catch (_) {}
  } else {
    try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (_) {}
  }
}
function render() {
  document.body.classList.toggle('mission-mode', route === 'mission');
  syncOrientationForRoute(route);
  document.getElementById('backBtn').classList.toggle('hidden', ['home','subjects','map'].includes(route));
  document.querySelectorAll('.nav-btn').forEach(x => x.classList.toggle('active', x.dataset.route === route));
  const homeNavLabel = document.querySelector('.nav-btn[data-route=\"world\"] small');
  if (homeNavLabel) homeNavLabel.textContent = state.homeName && state.homeName !== 'My Home' ? state.homeName : 'My Home';
  if (route === 'home') app.innerHTML = homeView();
  else if (route === 'subjects') app.innerHTML = subjectsView();
  else if (route === 'books') app.innerHTML = booksView();
  else if (route === 'chapters') app.innerHTML = chaptersView();
  else if (route === 'chapter') app.innerHTML = chapterView();
  else if (route === 'mission') app.innerHTML = missionView();
  else if (route === 'map') app.innerHTML = mapView();
  else if (route === 'world') app.innerHTML = worldView();
  else if (route === 'collection') app.innerHTML = collectionView();
  else if (route === 'store') app.innerHTML = storeView();
  else if (route === 'howto') app.innerHTML = howToPlayView();
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
  const total = curriculum.length || 1;
  const completed = state.completed.length;
  const pct = Math.min(100, Math.round(completed / total * 100));
  const nextSubject = subjectById[state.lastSubject] || subjectById.science || subjects[0];
  const nextBook = nextSubject ? subjectBooks(nextSubject.id)[0] : null;
  const nextList = nextBook ? chaptersForBook(nextBook.id) : [];
  const nextChapter = nextList.find(c => !state.completed.includes(c.chapter_id)) || nextList[0] || null;
  const avatarHTML = avatar.image ? `<img src="${avatar.image}" alt="${esc(avatar.name)}">` : avatar.emoji;
  return `<section class="home-hub">
    <div class="home-welcome-card">
      <div>
        <div class="home-eyebrow">YOUR BOOKLOKS WORLD</div>
        <div class="home-title-row"><div><h1>Hi ${esc(playerName())}!</h1><p>Ready for a new adventure?</p></div><div class="level-badge">👑 LV ${level()}</div></div>
        <div class="home-progress-line"><div><b>${state.xp} / ${Math.max(250, level()*250)} XP</b><small>Level ${level()} progress</small></div><div class="home-progress"><span style="width:${Math.min(100,(state.xp%250)/2.5)}%"></span></div></div>
        <div class="home-reward-strip"><span>🪙 ${state.coins} Coins</span><span>🥚 ${state.goldenEggs} Eggs</span><span>🎯 ${completed}/${total} Missions</span></div>
      </div>
      <div class="home-character"><div class="character-glow"></div><div class="character-avatar">${avatarHTML}</div><span class="character-spark s1">✦</span><span class="character-spark s2">★</span></div>
    </div>
    <div class="home-continue-card">
      <div class="continue-scene"><span class="scene-sun">☀️</span><span class="scene-cloud">☁️</span><span class="scene-book">📖</span><span class="scene-star">✦</span></div>
      <div class="continue-copy"><span class="home-eyebrow" style="color:#dff7e8">CONTINUE YOUR JOURNEY</span><h2>${nextChapter ? esc(nextChapter.chapter) : 'Your next mission'}</h2><p>${nextChapter ? `Keep learning, then play the mission and earn XP + Coins.` : 'Pick any chapter and start your next learning adventure.'}</p><button class="big-primary" data-action="continue"><span>▶</span><strong>Continue Mission</strong></button></div>
    </div>
    <div class="home-actions-grid">
      <button class="home-action-card green" data-route="map"><span class="home-action-icon">🗺️</span><span><b>Explore Map</b><small>Choose a learning world</small></span><strong>›</strong></button>
      <button class="home-action-card blue" data-route="world"><span class="home-action-icon">🏠</span><span><b>${esc(state.homeName || 'My Home')}</b><small>Build your rooms</small></span><strong>›</strong></button>
      <button class="home-action-card gold" data-route="collection"><span class="home-action-icon">🏆</span><span><b>My Collection</b><small>Eggs, badges & avatars</small></span><strong>›</strong></button>
    </div>
    <button class="home-how-card" data-route="howto"><span class="how-icon">💡</span><span><h3>How to Play</h3><p>Learn • Quick Check • Mission • Quiz • Rewards</p></span><span class="how-arrow">›</span></button>
    <div class="home-mini-footer"><span>LEARN</span><span>•</span><span>PLAY</span><span>•</span><span>BUILD</span><button class="home-footer-link" data-route="store">Store</button></div>
  </section>`;
}
function mapView(){
  const progressForSubject = (sid) => { const ids=chaptersForTrack(sid).map(c=>c.chapter_id); return ids.length ? Math.round(ids.filter(id=>state.completed.includes(id)).length/ids.length*100) : 0; };
  return `<section class="map-page">
    <div class="map-topbar"><button class="mini-back" data-route="home">←</button><div><div class="home-eyebrow">LEARNING WORLD</div><h1>Explore the Map</h1><p>Choose a world and follow the path to the next mission.</p></div><span class="map-tip">↗ Tip: turn your phone sideways</span></div>
    <div class="map-board"><div class="map-path map-path-1"></div><div class="map-path map-path-2"></div><div class="map-cloud cloud-a">☁️</div><div class="map-cloud cloud-b">☁️</div>
      ${subjects.map((s,i)=>{const pct=progressForSubject(s.id);const left=[7,27,49,71,10,33,57,78,44][i%9];const top=[17,10,26,17,53,48,58,51,77][i%9];return `<button class="map-island" data-subject="${s.id}" style="--x:${left}%;--y:${top}%;--accent:${s.color}"><span class="map-island-icon">${s.icon}</span><b>${esc(s.name)}</b><small>${pct}% done</small><span class="map-island-progress"><i style="width:${pct}%"></i></span></button>`}).join('')}
    </div>
  </section>`;
}
function collectionView(){
  const badges=[
    ['🌟','First Mission',state.completed.length>0],['🔥','Learning Streak',state.completed.length>=3],['🏆','Mission Master',state.perfectMissions>=1],['🥚','Golden Egg Hunter',state.goldenEggs>=1]
  ];
  return `<section class="collection-page"><div class="collection-top"><button class="mini-back" data-route="home">←</button><div><div class="home-eyebrow">MY COLLECTION</div><h1>Your rewards</h1><p>Everything you unlock while you learn and play.</p></div></div>
    <div class="collection-stats"><div><b>⭐ ${state.xp}</b><small>XP</small></div><div><b>🪙 ${state.coins}</b><small>Coins</small></div><div><b>🥚 ${state.goldenEggs}</b><small>Golden Eggs</small></div></div>
    <h3 class="collection-heading">Badges</h3><div class="badge-grid">${badges.map(([ic,n,on])=>`<div class="badge-card ${on?'earned':''}"><span>${ic}</span><b>${n}</b><small>${on?'Earned':'Keep playing'}</small></div>`).join('')}</div>
    <h3 class="collection-heading">Avatars</h3><div class="avatar-collection">${Object.entries(AVATARS).map(([id,a])=>`<button class="avatar-tile ${state.avatar===id?'selected':''} ${state.xp>=a.minXP?'':'locked'}" data-avatar="${id}"><span>${a.emoji}</span><b>${a.name}</b><small>${a.minXP===0?'Free':a.minXP+' XP'}</small></button>`).join('')}</div>
  </section>`;
}
function storeView(){
  const featured=roomCatalog(state.activeRoom||'living').slice(1,9);
  return `<section class="store-page"><div class="collection-top"><button class="mini-back" data-route="home">←</button><div><div class="home-eyebrow">BOOKLOKS STORE</div><h1>Build your world</h1><p>Spend Coins on room items and save your XP for avatar unlocks.</p></div></div>
    <div class="store-balance">🪙 <b>${state.coins}</b> Coins <button class="btn soft" data-route="world">Open My Home</button></div>
    <div class="store-grid">${featured.map(it=>`<article class="store-card"><div class="store-art">${it.emoji}</div><b>${esc(it.name)}</b><small>${it.cost} Coins</small><button class="btn tiny" data-buy="${it.id}" ${state.roomUnlocked[state.activeRoom]?.includes(it.id)?'disabled':''}>${state.roomUnlocked[state.activeRoom]?.includes(it.id)?'Owned':'Unlock'}</button></article>`).join('')}</div>
  </section>`;
}
function howToPlayView(){
  const items=[
    ['1','📚','Learn','Read a tiny visual guide before the mission.'],
    ['2','🧩','Quick Check','Pick the 3 cards that match the chapter.'],
    ['3','🎮','Mission','Play a short activity connected to what you learned.'],
    ['4','❓','5 Questions','Answer five easy-to-read questions.'],
    ['5','⭐','Rewards','Earn XP, Coins and Golden Eggs for strong scores.'],
    ['6','🏠','Build','Use Coins to add objects to your rooms.']
  ];
  return `<section class="howto-page"><div class="howto-top"><button class="mini-back" data-route="home">←</button><div><div class="home-eyebrow">BOOKLOKS GUIDE</div><h1>How to Play</h1><p>A simple journey: learn a little, play a little, build a lot.</p></div><span class="howto-book-icon">📘</span></div>
    <div class="howto-hero"><span>🎮</span><div><h2>Ready? Here is the journey.</h2><p>Every mission follows the same easy path, so children always know what to do next.</p></div></div>
    <div class="howto-list">${items.map(([n,ic,t,d])=>`<details class="howto-item" ${n==='1'?'open':''}><summary><span class="howto-num">${n}</span><span><b>${ic} ${t}</b><small>${esc(d)}</small></span><em>+</em></summary><div class="howto-body">${esc(d)}<div class="howto-tip">Keep going at your own pace. You can replay a chapter.</div></div></details>`).join('')}</div>
    <div class="howto-reward-grid"><div><b>⭐ XP</b><small>Levels up your player and unlocks colours and avatars.</small></div><div><b>🪙 Coins</b><small>Build your rooms with furniture and fun objects.</small></div><div><b>🥚 Golden Eggs</b><small>Perfect missions add a collectible to your world.</small></div></div>
    <div class="howto-bottom"><button class="big-primary" data-route="map">Start Exploring the Map →</button></div>
  </section>`;
}
function subjectCards() {
  return `<div class="subject-grid">${subjects.map(s => `<article class="subject-card" data-subject="${s.id}" style="--accent:${s.color}"><div class="icon-bubble">${s.icon}</div><h3>${esc(s.name)}</h3><p>${esc(s.blurb)}</p><div class="card-foot"><span>${chaptersForTrack(s.id).length} chapters</span><b>Open →</b></div></article>`).join('')}</div>`;
}
function subjectsView() {
  return `<section class="section-head"><div><div class="eyebrow">LEARN</div><h1>Choose a subject</h1><p>Pick a subject, then choose a chapter to learn and play.</p></div></section>${subjectCards()}`;
}
function booksView() {
  const s = subjectById[selectedSubjectId];
  return `<section class="section-head"><div><div class="eyebrow">${s.icon} SUBJECT</div><h1>${esc(s.name)}</h1><p>Keep textbook, grammar, workbook and Olympiad tracks separate.</p></div></section><div class="book-grid">${subjectBooks(s.id).map(b => `<article class="book-card" data-book="${b.id}"><div class="book-icon">${s.icon}</div><div><h3>${esc(b.name)}</h3><p>${esc(b.publisher)} • ${esc(b.role)}</p><span class="pill">${b.chapter_count} chapters</span></div><b class="arrow">→</b></article>`).join('')}</div>`;
}
function chaptersView() {
  const t = subjectById[selectedSubjectId] || trackForBookId[selectedBookId] || subjects[0];
  const list = chaptersForTrack(t.id);
  return `<section class="section-head"><div><div class="eyebrow">${t.icon} LEARN</div><h1>${esc(t.name)}</h1><p>${esc(t.blurb || 'Pick a chapter and start learning.')}</p></div><span class="pill">${list.length} chapters</span></section><div class="chapter-grid">${list.map(c => `<article class="chapter-card ${state.completed.includes(c.chapter_id)?'done':''}" data-chapter="${c.chapter_id}"><div class="chapter-num">${String(c.chapter_no).padStart(2,'0')}</div><div><h3>${esc(c.chapter)}</h3><p>${esc((c.concepts||[]).slice(0,3).join(' • '))}</p><div class="tag-row"><span>${state.completed.includes(c.chapter_id)?'✅ Completed':'🎮 Mission'}</span><span>${esc(c.game_type||'Mission')}</span></div></div></article>`).join('')}</div>`;
}
function chapterView() {
  const c = chapterById[selectedChapterId], s = trackForChapter(c);
  const summary = chapterSummaryText(c);
  const objs = (c.learning_objectives || []).slice(0,3);
  const concepts = (c.concepts || []).slice(0,3);
  return `<section class="chapter-one-page">
    <div class="chapter-one-top"><button class="mini-back" data-action="back-chapters">←</button><span class="subject-badge">${s.icon} ${esc(c.subject)}</span><span class="chapter-status">${state.completed.includes(c.chapter_id)?'✅ Completed':'🎮 Ready to play'}</span></div>
    <div class="chapter-visual-banner" style="--subject-accent:${s.color || '#5b43ff'}">
      <div class="chapter-visual-orb">${s.icon}</div>
      <div class="chapter-visual-shapes"><span>✦</span><span>✦</span><span>•</span></div>
      <div class="chapter-banner-copy"><div class="home-eyebrow">CHAPTER ${String(c.chapter_no).padStart(2,'0')} • DISCOVER</div><h1>${esc(c.chapter)}</h1><p>${esc(summary.length>170?summary.slice(0,167)+'…':summary)}</p></div>
    </div>
    <div class="chapter-learning-row">${objs.map((x,i)=>`<div class="chapter-learning-card"><span>${['💡','🧠','🎯'][i%3]}</span><b>${esc(x)}</b></div>`).join('')}</div>
    <div class="chapter-learn-strip"><div class="learn-strip-icon">📖</div><div><b>In this chapter</b><p>${concepts.length?esc(concepts.join(' • ')):'Learn the key idea, then use it in the mission.'}</p></div></div>
    <div class="chapter-bottom"><div class="chapter-meta"><span>${esc(c.game_type||'Mission')}</span><span>5 questions</span><span>Replay anytime</span></div><button class="big-primary chapter-play-btn" data-action="play"><span>▶</span><strong>Play Mission</strong></button></div>
  </section>`;
}
function missionView(){if(stage==='intro')return missionIntro();if(stage==='check')return missionCheck();if(stage==='game')return missionGame();return missionQuiz();}
function chapterSummaryText(c){
  const direct = c.chapter_summary || c.simple_explanation;
  if (direct) return direct;
  const concepts=(c.concepts||[]).slice(0,3);
  if(!concepts.length) return `Let’s learn ${c.chapter} step by step.`;
  return `In this chapter, we will learn about ${concepts.join(', ')}.`;
}
function chapterSceneText(c){ return c.visual_learning_scene || c.mission_context || ''; }
function missionIntro(){
  const c=activeChapter,s=trackForChapter(c),objs=(c.learning_objectives||[]).slice(0,3),concepts=(c.concepts||[]).slice(0,4),summary=chapterSummaryText(c),scene=chapterSceneText(c);
  return `<section class="mission-one-page"><div class="mission-one-top"><button class="mini-back" data-action="exit">←</button><span class="mission-chip-top">${s.icon} ${esc(c.subject)}</span><span class="step-chip mission-one-top step-chip">1 / 4 • Learn</span></div>
    <section class="mission-story-card"><div class="mission-story-visual"><div class="scene-bubble one">✦</div><div class="scene-bubble two">💡</div><div class="mission-scene-orb">${s.icon}</div><div class="mission-scene-copy">${esc(scene || `Let’s explore ${c.chapter} with a short, fun guide.`)}</div></div><div class="mission-story-text"><span class="pill">📖 Tiny chapter guide</span><h1>${esc(c.chapter)}</h1><p>${esc(summary.length>220?summary.slice(0,217)+'…':summary)}</p><div class="mission-skill-row">${concepts.slice(0,3).map(x=>`<span>${esc(x)}</span>`).join('')}</div></div></section>
    <div class="mission-steps-mini"><div class="active"><span>1</span><b>Learn</b></div><div><span>2</span><b>Quick Check</b></div><div><span>3</span><b>Mission</b></div><div><span>4</span><b>5 Questions</b></div></div>
    <div class="mission-one-cta"><div><b>Ready to explore?</b><small>Read a little, then show what you know.</small></div><button class="big-primary" data-action="start-check"><span>▶</span><strong>Quick Check</strong></button></div>
  </section>`;
}

function introHeadline(c){const f=c.learning_objectives&&c.learning_objectives[0];return f?f.charAt(0).toUpperCase()+f.slice(1)+'.':`Explore ${c.chapter} step by step.`;}
function missionCheck(){const c=activeChapter,s=trackForChapter(c);if(!mini.checkCards.length)mini.checkCards=quickCheckCards(c);const cards=mini.checkCards,n=mini.checkSelected.length;return `<section class="mission-shell"><div class="mission-hero"><div class="eyebrow">${playerGreeting()} ${s.icon} ${esc(c.subject)} • QUICK CHECK</div><h1>Quick Check</h1><p>Pick the <strong>3 cards</strong> that belong to <strong>${esc(c.chapter)}</strong>.</p><div class="stepper"><span>1 LEARN</span><span class="active">2 CHECK</span><span>3 PLAY</span><span>4 QUIZ</span></div></div><section class="visual-game-card check-card"><div class="game-head"><div><span class="pill">🧩 Quick Check</span><h2>Pick the 3 right cards</h2><p>Not quite? Try another card.</p></div><span class="page-badge">${n} / 3</span></div><div class="check-grid">${cards.map((card,i)=>`<button class="check-card-btn ${mini.checkSelected.includes(i)?'selected':''} ${mini.wrongCard===i?'wrong':''}" data-check-card="${i}" ${mini.checkSelected.includes(i)||mini.checkDone?'disabled':''}><span class="check-icon">${mini.checkSelected.includes(i)?'✓':'?'}</span><b>${esc(card.label)}</b></button>`).join('')}</div><div class="check-status ${mini.checkDone?'success':''} ${mini.wrongCard>=0?'warn':''}">${mini.checkDone?`✅ Great job, ${playerName()}! You found all 3.`:(mini.checkMessage||`${n} / 3`)}</div><div class="action-bar"><button class="btn soft" data-action="back-intro">← Back</button>${mini.checkDone?'<span class="muted">Read the chapter recap to start the mission.</span>':'<span class="muted">Find 3 right cards.</span>'}</div></section></section>`;}
function quickCheckCards(c){
  const q=c.quick_check||{};
  const presetCorrect = Array.isArray(q.correct_options)?q.correct_options:(Array.isArray(c.quick_check_correct_options)?c.quick_check_correct_options:[]);
  const presetWrong = Array.isArray(q.wrong_options)?q.wrong_options:(Array.isArray(c.quick_check_wrong_options)?c.quick_check_wrong_options:[]);
  if(presetCorrect.length>=3 && presetWrong.length>=3){
    return shuffle([...presetCorrect.slice(0,3).map(x=>({label:x,correct:true})),...presetWrong.slice(0,3).map(x=>({label:x,correct:false}))]);
  }
  if(Array.isArray(q.cards) && q.cards.length>=6){
    const usable=q.cards.filter(x=>x&&x.label).slice(0,6).map(x=>({label:x.label,correct:!!x.correct}));
    const yes=usable.filter(x=>x.correct),no=usable.filter(x=>!x.correct);
    if(yes.length>=3&&no.length>=3) return shuffle([...yes.slice(0,3),...no.slice(0,3)]);
  }
  const correct=(c.concepts||[]).slice(0,3).map(x=>({label:x,correct:true}));
  const current=new Set((c.concepts||[]).map(normalizeConcept));
  const pool=[];
  for(const o of curriculum){if(o.chapter_id===c.chapter_id)continue;for(const x of(o.concepts||[])){const n=normalizeConcept(x);if(x&&!current.has(n)&&!pool.some(v=>normalizeConcept(v)===n))pool.push(x);}}
  const wrong=shuffle(pool).slice(0,3).map(x=>({label:x,correct:false}));
  while(wrong.length<3){const fb=['Read a story','Play a sport','Draw a picture'];wrong.push({label:fb[wrong.length],correct:false});}
  return shuffle([...correct,...wrong]);
}
function normalizeConcept(v){return String(v||'').toLowerCase().replace(/[^a-z0-9\u0900-\u097f]+/g,' ').trim();}
function missionGame(){const c=activeChapter,s=trackForChapter(c);return `<section class="mission-shell"><div class="mission-hero"><div class="eyebrow">${playerGreeting()} ${s.icon} ${esc(c.subject)} • PLAY</div><h1>${esc(missionTitle(c))}</h1><p>${esc(missionStory(c))}</p><div class="stepper"><span>1 DISCOVER</span><span>2 QUICK CHECK</span><span class="active">3 PLAY</span><span>4 CHALLENGE</span></div></div><section class="visual-game-card"><div class="game-head"><div><span class="pill">🎮 Mini Game</span><h2>${esc(missionInstruction(c))}</h2><p>${requiresMiniGame(c)?'Complete the hands-on task first. Your reward unlocks after the questions.':'Your quick check unlocked the chapter mission. Now jump into the 5-question challenge.'}</p></div><span class="page-badge">3 / 4</span></div>${miniGame(c)}<div class="visual-controls">${requiresMiniGame(c)?`<button class="btn soft" data-action="reset-mini">Reset</button><span class="visual-status ${mini.done?'success':''}">${mini.done?`✅ Nice, ${playerName()}! Task complete!`:'🎯 Finish the mini-game first.'}</span>`:'<span class="visual-status success">✅ Ready! The chapter challenge is unlocked.</span>'}</div><div class="action-bar"><button class="btn soft" data-action="exit">Exit</button>${mini.done?'<button class="btn primary" data-action="start-quiz">Start 5 questions →</button>':'<span class="muted">Finish the mission to continue.</span>'}</div></section></section>`;}
function requiresMiniGame(c){ return true; }
function missionTitle(c){const m={'Push and Pull':'Toy Factory Rescue','Money':'Toy Shop Cashier','Understanding Scratch – Your Gateway to Coding':'Robot Code Run','The Tree':'Tree Guardian Quest','अब और प्लास्टिक नहीं!':'Plastic-Free Park','Our Forests':'Forest Ranger Mission','Maps and Views':'Map Explorer','Data Handling':'Data Detective','Symmetry':'Mirror Master','Time':'Clock Dash'};return m[c.chapter]||`${c.chapter} Mission`;}
function missionStory(c){if(c.chapter==='Push and Pull')return'The toy factory is ready for delivery, but a heavy toy crate is stuck. Move it into the delivery zone and feel the push in action.';if(c.chapter==='Money')return'You are the cashier. Build a customer order, total the price, and make the correct change.';if(c.chapter==='Understanding Scratch – Your Gateway to Coding')return'Your robot only moves when the blocks are in the right order. Build the sequence and test it.';if(c.chapter==='Maps and Views')return'Use the map controls to find the right directions and location clues.';if(c.chapter==='Symmetry')return'Become a mirror master by matching shapes that balance on both sides.';if(c.chapter==='Time')return'Set the clock correctly and race the mission timer.';return`Complete a short interactive task connected to ${c.chapter}, then take the chapter challenge.`;}
function missionInstruction(c){if(c.chapter==='Push and Pull')return'Get the toy crate into the delivery zone!';if(c.chapter==='Money')return'Build a ₹50 order from the shelf.';if(c.chapter==='Understanding Scratch – Your Gateway to Coding')return'Tap the blocks in the right order.';if(c.chapter==='Maps and Views')return'Find three directions on the map.';if(c.chapter==='Symmetry')return'Match the mirrored shapes.';if(c.chapter==='Time')return'Set the clock to the target time.';if(c.subject_id==='computer')return'Complete the interactive screen task.';return`Mission warm-up: ${c.chapter}`;}

function missionConcepts(c){
  const list=[...(c.concepts||[]),...(c.learning_objectives||[])].map(x=>String(x||'').trim()).filter(Boolean);
  const unique=[]; const seen=new Set();
  for(const x of list){const k=x.toLowerCase();if(!seen.has(k)){seen.add(k);unique.push(x);}if(unique.length>=5)break;}
  while(unique.length<3) unique.push(['Look closely','Think and choose','Use what you learned'][unique.length]);
  return unique.slice(0,5);
}
function genericMission(c){
  const goals=missionConcepts(c), step=Math.min(2,mini.genericStep||0), target=goals[step]||goals[0];
  const distractors=shuffle(goals.filter((x,i)=>i!==step).concat(['Try again','Random idea','Not this one'])).slice(0,3);
  const cards=shuffle([{label:target,correct:true},...distractors.map(label=>({label,correct:false}))]);
  return `<div class="generic-mission-board">
    <div class="generic-mission-banner"><span class="generic-mission-icon">🎯</span><div><b>Mission Step ${step+1} of 3</b><small>Find the idea that matches your target.</small></div></div>
    <div class="generic-target"><span>FIND THIS</span><strong>${esc(target)}</strong></div>
    <div class="generic-choice-grid">${cards.map((x,i)=>`<button class="generic-choice" data-generic-choice="${x.correct?'1':'0'}"><span>${['🔑','⭐','💎','🧩'][i]}</span><b>${esc(x.label)}</b></button>`).join('')}</div>
    <div class="generic-mission-note">Pick the idea you learned in the chapter.</div>
  </div>`;
}

function miniGame(c) {
  if (c.chapter === 'Push and Pull') return `<div class="mini-scene" id="pushScene"><div class="cloud">☁️</div><div class="sign">TOY FACTORY</div><div class="ground"></div><div class="conveyor"><div class="belt"></div></div><div class="drop-target" id="dropTarget">📦<br>DROP HERE</div><div class="crate" id="dragCrate" style="left:${10+mini.progress*70}%">🧸📦</div><div class="hint-arrow">DRAG →</div><div class="mini-info">Push the crate away from you.</div></div>`;
  if (c.chapter === 'Money') return `<div class="mini-scene" style="background:linear-gradient(#fff2d7,#f1c27c)"><div class="sign">TOY SHOP</div><div class="mini-info">Tap two items to make a ₹50 order.</div><div style="position:absolute;inset:24% 8% auto;display:grid;grid-template-columns:repeat(3,1fr);gap:12px">${[['🧸','₹20'],['🚗','₹30'],['🪀','₹15'],['🎲','₹25'],['🧩','₹35'],['🎈','₹10']].map((x,i)=>`<button class="btn ${mini.selected.includes(i)?'dark':'soft'}" data-item="${i}" style="min-height:70px;font-size:22px">${x[0]}<small style="display:block;font-size:10px">${x[1]}</small></button>`).join('')}</div><div class="action-bar" style="position:absolute;left:16px;right:16px;bottom:18px"><span class="pill">Selected: ${mini.selected.length}</span>${mini.selected.length>=2?'<button class="btn primary" data-action="shop-check">Check order</button>':''}</div></div>`;
  if (c.chapter === 'Understanding Scratch – Your Gateway to Coding') return `<div class="mini-scene" style="background:linear-gradient(#e9f9ff,#c8d5ff)"><div class="sign">ROBOT LAB</div><div class="mini-info">Tap blocks: Move → Turn → Say</div><div style="position:absolute;top:28%;left:8%;right:8%;display:grid;grid-template-columns:repeat(3,1fr);gap:12px">${[['Move','➡️',0],['Turn','↪️',1],['Say','💬',2]].map(x=>`<button class="btn ${mini.sequence.includes(x[2])?'dark':'soft'}" data-code="${x[2]}" style="min-height:80px">${x[1]}<br><span style="font-size:11px">${x[0]}</span></button>`).join('')}</div><div class="robot" style="position:absolute;bottom:40px;left:${20+Math.min(mini.sequence.length,3)*20}%">🤖</div></div>`;
  if (c.chapter === 'Maps and Views') return `<div class="mini-scene" style="background:#e8f6e6"><div class="sign">MAP LAB</div>${[['NORTH','🔼',0],['EAST','➡️',1],['SCHOOL','🏫',2]].map((x,i)=>`<button class="btn ${mini.tapped.includes(String(i))?'dark':'soft'}" data-map="${i}" style="position:absolute;left:${20+i*25}%;top:${35+(i%2)*22}%;font-size:20px">${x[1]}<small style="display:block;font-size:9px">${x[0]}</small></button>`).join('')}<div class="mini-info">Find 3 map labels.</div></div>`;
  if (c.chapter === 'Symmetry') return `<div class="mini-scene" style="background:linear-gradient(#f5f3ff,#e4ddff)"><div class="sign">MIRROR LAB</div><div style="position:absolute;left:12%;right:12%;top:26%;display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:44px;text-align:center"><button class="btn ${mini.selected.includes(0)?'dark':'soft'}" data-item="0">🦋</button><button class="btn ${mini.selected.includes(1)?'dark':'soft'}" data-item="1">🦋</button><button class="btn ${mini.selected.includes(2)?'dark':'soft'}" data-item="2">🔺</button><button class="btn ${mini.selected.includes(3)?'dark':'soft'}" data-item="3">🔻</button></div><div class="mini-info">Tap two matching mirror halves.</div></div>`;
  const emoji = c.subject_id === 'science' ? '🔬' : c.subject_id === 'social' ? '🗺️' : c.subject_id === 'english' ? '🔤' : c.subject_id === 'hindi' ? 'अ' : c.subject_id === 'computer' ? '💻' : c.subject_id === 'olympiad' ? '🏆' : '➗';
  const chips=(c.concepts||[]).slice(0,3);
  return genericMission(c);
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
  return `<section class="world-header"><div><div class="world-title-line"><span class="world-avatar">${avatarMeta().emoji}</span><div><div class="eyebrow">MY HOME</div><h1>${esc(state.homeName)}</h1></div></div><p>Build each room your way. Start with a small item, then unlock more as you earn coins.</p></div><div class="world-meta"><span class="pill">🪙 ${state.coins} coins</span><span class="pill">⭐ ${state.xp} XP</span><span class="pill">🏠 ${catalog.length} objects • ${roomPaidTotal} coins total</span></div></section>
  <div class="home-editor"><div class="room-tabs">${ROOMS.map(r => `<button class="room-tab ${room.id===r.id?'active':''}" data-room="${r.id}">${r.icon}<span>${esc(r.name)}</span></button>`).join('')}</div><div class="editor-actions"><button class="btn soft" data-action="rename-home">✏️ Name</button><button class="btn soft" data-action="themes">🎨 Colours</button></div></div>
  <div class="room-wrap"><div class="room" style="--wall:${theme.wall};--floor:${theme.floor};--accent:${theme.accent}"><div class="room-stage"><div class="wall-pattern"></div><div class="window"></div><div class="rug"></div><div class="room-label">${room.icon} ${room.name}</div>${items.map((p,i)=>`<button class="world-item" data-world-item="${esc(p.id)}" data-world-index="${i}" style="left:${p.x}%;top:${p.y}%" aria-label="${esc(p.name||'item')}">${p.emoji}</button>`).join('')}</div></div><aside class="shop"><div class="shop-head"><div><h3>Build ${esc(room.name)}</h3><small>Only ${esc(room.name)} objects appear here. Drag them anywhere in this room.</small></div><span class="pill">${unlocked.length}/${catalog.length} unlocked</span></div><div class="inventory-grid">${catalog.map(it=>`<div class="item-card"><div class="item-emoji">${it.emoji}</div><div class="item-main"><b>${esc(it.name)}</b><small>${it.cost ? it.cost+' coins' : 'Starter'}</small></div><button class="btn tiny" data-buy="${it.id}" ${unlocked.includes(it.id)?'disabled':''}>${unlocked.includes(it.id)?'Owned':'Unlock'}</button></div>`).join('')}</div></aside></div>`;
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
    <div class="profile-section sound-settings"><h3>🔊 Sound settings</h3><p>Turn music and sounds on or off, then set the volume you like. Your choices are saved.</p><div class="sound-settings-actions"><button id="profileMusicBtn" class="btn sound-toggle active" data-action="toggle-music">🎵 Music: ON</button><button id="profileSfxBtn" class="btn sound-toggle active" data-action="toggle-sfx">🔊 Sounds: ON</button></div><div class="volume-control"><div class="volume-head"><b>🎵 Music volume</b><span id="musicVolumePct">20%</span></div><input id="musicVolumeRange" class="volume-range" type="range" min="0" max="100" value="20" aria-label="Music volume"></div><div class="volume-control"><div class="volume-head"><b>🔊 Sound volume</b><span id="sfxVolumePct">90%</span></div><input id="sfxVolumeRange" class="volume-range" type="range" min="0" max="100" value="90" aria-label="Sound volume"></div></div><div class="profile-section"><h3>🏆 My achievements</h3><p>${state.completed.length} missions completed • ${state.perfectMissions} perfect missions • ${state.goldenEggs} Golden Eggs</p></div>
    <div class="profile-section"><button class="btn dark" data-action="reset">Reset testing progress</button></div>
  </section>`;
}


function bind() {
  updateSoundSettingsUI();
  document.getElementById('brandBtn').onclick = goHome;
  document.querySelectorAll('[data-route]').forEach(e => e.onclick = (ev) => { ev.preventDefault(); go(e.dataset.route); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.querySelectorAll('[data-subject]').forEach(e => e.onclick = () => { selectedSubjectId=e.dataset.subject; selectedBookId=subjectById[selectedSubjectId]?.book_id || null; state.lastSubject=selectedSubjectId; save(); route='chapters'; render(); });
  document.querySelectorAll('[data-book]').forEach(e => e.onclick = () => { selectedBookId=e.dataset.book; route='chapters'; render(); });
  document.querySelectorAll('[data-chapter]').forEach(e => e.onclick = () => { selectedChapterId=e.dataset.chapter; route='chapter'; render(); });
  document.querySelectorAll('[data-option]').forEach(e => e.onclick = () => {
    if (selectedOption === null) {
      startBackgroundMusic();
      selectedOption=Number(e.dataset.option);
      if (selectedOption===quiz[qIndex].a) {
        playQuestionRight();
        toast(`✨ Nice, ${playerName()}! Keep going!`);
      } else {
        playQuestionWrong();
        toast(`❌ Not quite. Try the next one!`);
      }
      render();
    }
  });
  document.querySelectorAll('[data-buy]').forEach(e => e.onclick = () => buy(e.dataset.buy));
  document.querySelectorAll('[data-item]').forEach(e => e.onclick = () => selectItem(Number(e.dataset.item)));
  document.querySelectorAll('[data-code]').forEach(e => e.onclick = () => tapCode(Number(e.dataset.code)));
  document.querySelectorAll('[data-check-card]').forEach(e => e.onclick = () => checkCard(Number(e.dataset.checkCard)));
  document.querySelectorAll('[data-map]').forEach(e => e.onclick = () => tapMap(String(e.dataset.map)));
  document.querySelectorAll('[data-room]').forEach(e => e.onclick = () => { state.activeRoom=e.dataset.room; save(); render(); });
  document.querySelectorAll('[data-theme]').forEach(e => e.onclick = () => chooseTheme(e.dataset.theme));
  document.querySelectorAll('.avatar-tile[data-avatar]').forEach(e => e.onclick = () => chooseAvatar(e.dataset.avatar));
  document.querySelectorAll('[data-action]').forEach(e => e.onclick = () => act(e.dataset.action));
  const musicRange = document.getElementById('musicVolumeRange');
  if (musicRange) musicRange.oninput = () => setMusicVolume(Number(musicRange.value) / 100);
  const sfxRange = document.getElementById('sfxVolumeRange');
  if (sfxRange) sfxRange.oninput = () => setSfxVolume(Number(sfxRange.value) / 100);
}
function act(a) {
  startBackgroundMusic();
  if (a==='continue' || a==='start-default') { selectedSubjectId=state.lastSubject||'science'; selectedBookId=subjectBooks(selectedSubjectId)[0].id; selectedChapterId=chaptersForBook(selectedBookId)[0].chapter_id; startMission(); return; }
  if (a==='play') { startMission(); return; }
  if (a==='start-check') { stage='check'; mini.checkCards=[]; mini.checkSelected=[]; mini.checkDone=false; mini.checkMessage=''; mini.wrongCard=-1; render(); return; }
  if (a==='back-intro') { stage='intro'; mini.checkCards=[]; mini.checkSelected=[]; mini.checkDone=false; mini.checkMessage=''; mini.wrongCard=-1; render(); return; }
  if (a==='start-game' || a==='start-summary-mission') { stage='game'; if(!requiresMiniGame(activeChapter)) mini.done=true; render(); return; }
  if (a==='start-quiz') { startQuiz(); return; }
  if (a==='replay') { startMission(); return; }
  if (a==='next-q') { const correct=selectedOption===quiz[qIndex].a; if (correct) score++; if (qIndex===quiz.length-1) finishMission(); else { qIndex++; selectedOption=null; render(); } return; }
  if (a==='exit') { route='chapter'; render(); return; }
  if (a==='back-chapters') { route='chapters'; render(); return; }
  if (a==='reset-mini') { resetMini(); render(); return; }
  if (a==='shop-check') { mini.done=mini.selected.includes(0)&&mini.selected.includes(1); render(); return; }
  if (a==='toggle-music') { toggleMusic(); return; }
  if (a==='toggle-sfx') { toggleSoundEffects(); return; }
  if (a==='edit-name') { openName(); return; }
  if (a==='edit-avatar') { openAvatar(); return; }
  if (a==='rename-home') { openHomeName(); return; }
  if (a==='themes') { openThemes(); return; }
  if (a==='reset') { localStorage.removeItem(key); state=cloneDefault(); render(); toast('Progress reset'); return; }
}
function resetMini() { mini = { done:false, progress:0, dragging:false, selected:[], sequence:[], tapped:[], genericStep:0, checkCards:[], checkSelected:[], checkDone:false, checkMessage:'', wrongCard:-1 }; }

function shortSummaryPages(c){
  const clean = (v) => String(v || '').replace(/\s+/g,' ').trim();
  const source = clean(c.chapter_summary || c.simple_explanation || c.mission_context || c.visual_learning_scene);
  const pages = [];
  if(source){
    const sentences = source.split(/(?<=[.!?।])\s+/).map(clean).filter(Boolean);
    let buf='';
    for(const s of sentences){
      const candidate = buf ? `${buf} ${s}` : s;
      if(candidate.length > 155 && buf){ pages.push(buf); buf=s; }
      else buf=candidate;
    }
    if(buf) pages.push(buf);
  }
  const goals = Array.isArray(c.learning_objectives)?c.learning_objectives.map(clean).filter(Boolean):[];
  const concepts = Array.isArray(c.concepts)?c.concepts.map(clean).filter(Boolean):[];
  for(const g of goals.slice(0,2)) pages.push(`Remember: ${g}`);
  if(!pages.length && concepts.length) pages.push(`In this chapter, we will learn about ${concepts.slice(0,3).join(', ')}.`);
  if(!pages.length) pages.push(`This chapter is about ${clean(c.chapter)}. Read the guide, then use what you learn in the mission.`);
  return pages.slice(0,5);
}
function showQuickCheckExplanation(){
  const c = activeChapter;
  if(!c) return;
  const old=document.getElementById('chapterLearnOverlay');
  if(old) old.remove();
  const selected=(mini.checkSelected||[]).map(i=>mini.checkCards?.[i]?.label).filter(Boolean).slice(0,3);
  const concepts=(c.concepts||[]).slice(0,3);
  const summary=chapterSummaryText(c);
  const explain=c.learning?.quick_check_explanation || c.quick_check_explanation || '';
  const reasons=(selected.length?selected:concepts).map((x,i)=>`<span class="mini-reason"><b>${i+1}</b>${esc(x)}</span>`).join('');
  const overlay=document.createElement('div');
  overlay.id='chapterLearnOverlay';
  overlay.className='chapter-learn-overlay quick-explain-overlay';
  overlay.innerHTML=`<div class="chapter-learn-card quick-explain-card">
    <div class="chapter-learn-top"><span class="pill">✅ Great job!</span><span class="page-badge">Quick Check</span></div>
    <div class="chapter-learn-icon">💡</div>
    <div class="chapter-learn-kicker">WHY THESE ARE RIGHT</div>
    <h2>You got the chapter idea.</h2>
    <p class="quick-explain-text">${esc(explain || summary || `These ideas are connected to ${c.chapter}. Now let’s use them in the mission.`)}</p>
    <div class="quick-reasons">${reasons}</div>
    <div class="chapter-learn-progress"><span style="width:100%"></span></div>
    <div class="modal-actions"><button class="btn primary" id="quickStartMissionBtn">Start Mission →</button></div>
  </div>`;
  document.body.appendChild(overlay);
  document.getElementById('quickStartMissionBtn').onclick=()=>{overlay.remove();stage='game';mini.done=false;render();};
}

function checkCard(index){
  startBackgroundMusic();
  if(!mini.checkCards.length) mini.checkCards=quickCheckCards(activeChapter);
  const card=mini.checkCards[index];
  if(!card || mini.checkDone || mini.checkSelected.includes(index)) return;
  mini.wrongCard=-1;
  if(!card.correct){
    mini.wrongCard=index;
    mini.checkMessage='❌ Not quite. Try another card.';
    playQuickCheckWrong();
    render();
    setTimeout(()=>{mini.wrongCard=-1;mini.checkMessage='';if(route==='mission'&&stage==='check')render();},850);
    return;
  }
  mini.checkSelected.push(index);
  playQuickCheckRight();
  if(mini.checkSelected.length>=3){
    mini.checkDone=true;
    mini.checkMessage=`✅ Great job, ${playerName()}! All 3 are correct.`;
    render();
    window.setTimeout(showQuickCheckExplanation,180);
  } else {
    mini.checkMessage=`✅ Correct! ${3-mini.checkSelected.length} more to go.`;
    render();
  }
}
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
  state.lastSubject=(meta.track_id || trackForChapter(meta).id || meta.subject_id);
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
  syncOrientationForRoute('quiz');
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
    }
  }
  save();
  route='result';
  render();
  showMissionOutcome(score);
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
function tapGeneric(correct){
  startBackgroundMusic();
  if(correct){
    playQuestionRight();
    mini.genericStep=(mini.genericStep||0)+1;
    if(mini.genericStep>=3){mini.done=true;toast(`✅ Mission complete, ${playerName()}!`,'success');}
    render();
  } else {
    playQuestionWrong();
    toast('Not quite. Try again.','warn');
  }
}
function bindGenericMission(){
  document.querySelectorAll('[data-generic-choice]').forEach(btn=>{btn.onclick=()=>tapGeneric(btn.dataset.genericChoice==='1');});
}
function bindMini() {
  bindGenericMission();
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
  const stageEl=document.querySelector('.room-stage');
  if(!roomEl || !stageEl) return;
  document.querySelectorAll('[data-world-item]').forEach(el=>{
    el.onpointerdown=e=>{
      e.preventDefault();
      draggedWorldItem=el;
      el.setPointerCapture(e.pointerId);
      el.classList.add('dragging');
    };
    el.onpointermove=e=>{
      if(!draggedWorldItem) return;
      const rect=stageEl.getBoundingClientRect();
      const x=Math.max(8,Math.min(92,((e.clientX-rect.left)/rect.width)*100));
      const y=Math.max(8,Math.min(92,((e.clientY-rect.top)/rect.height)*100));
      el.style.left=x+'%'; el.style.top=y+'%';
    };
    el.onpointerup=()=>finishWorldDrag(el);
    el.onpointercancel=()=>finishWorldDrag(el);
  });
}
function finishWorldDrag(el){
  if(!draggedWorldItem) return;
  const rect=document.querySelector('.room-stage').getBoundingClientRect();
  const x=Math.max(8,Math.min(92,((parseFloat(el.style.left)||50))));
  const y=Math.max(8,Math.min(92,((parseFloat(el.style.top)||45))));
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
function onboardingView(){
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  if (onboardingStep === 1) {
    modal.innerHTML = `<div class="modal-card onboarding-card">
      <div class="onboarding-progress"><span class="active"></span><span></span></div>
      <div class="modal-kicker">👋 WELCOME TO BOOKLOKS</div>
      <h2>What's your name?</h2>
      <p class="muted">Tell us your name. We’ll use it in your missions and rewards.</p>
      <input id="onboardingName" class="input" maxlength="20" placeholder="Write your name" autocomplete="off">
      <div class="modal-actions"><button class="btn dark" id="onboardingNameNext">Continue →</button></div>
    </div>`;
    const input = document.getElementById('onboardingName');
    const next = document.getElementById('onboardingNameNext');
    next.onclick = () => {
      const name = input.value.trim();
      if (!name) { input.focus(); toast('Please write your name.'); return; }
      state.name = name;
      state.homeName = `${name}'s Home`;
      state.homeNameCustom = false;
      save();
      onboardingStep = 2;
      onboardingView();
    };
    input.addEventListener('keydown', e => { if (e.key === 'Enter') next.click(); });
    input.focus();
    return;
  }
  modal.innerHTML = `<div class="modal-card onboarding-card">
    <div class="onboarding-progress"><span class="active"></span><span class="active"></span></div>
    <div class="modal-kicker">🧑‍🚀 YOUR AVATAR</div>
    <h2>Select your avatar</h2>
    <p class="muted">Pick the avatar you want to see across BookLoks. You can change it later.</p>
    <div class="onboarding-avatar-grid">
      ${['boy','girl'].map(id => { const a=AVATARS[id]; return `<button class="onboarding-avatar ${state.avatar===id?'selected':''}" data-onboarding-avatar="${id}"><span>${a.emoji}</span><b>${a.name}</b><small>Free</small></button>`; }).join('')}
    </div>
    <div class="modal-actions"><button class="btn dark" id="onboardingFinish">Let's Go →</button></div>
  </div>`;
  document.querySelectorAll('[data-onboarding-avatar]').forEach(btn => btn.onclick = () => {
    state.avatar = btn.dataset.onboardingAvatar;
    save();
    document.querySelectorAll('[data-onboarding-avatar]').forEach(x => x.classList.toggle('selected', x.dataset.onboardingAvatar === state.avatar));
  });
  document.getElementById('onboardingFinish').onclick = () => {
    if (!['boy','girl'].includes(state.avatar)) state.avatar = 'boy';
    localStorage.setItem('bookloks_onboarding_done', '1');
    save();
    modal.classList.add('hidden');
    render();
    startBackgroundMusic();
  };
}
function startFirstRunOnboarding(){
  if (localStorage.getItem('bookloks_onboarding_done') === '1') return false;
  onboardingStep = 1;
  window.setTimeout(() => onboardingView(), 180);
  return true;
}
window.startFirstRunOnboarding = startFirstRunOnboarding;

function bookloksPlayerName(){ return state?.name || ''; }
window.bookloksPlayerName = bookloksPlayerName;

function showReturningWelcome(){
  if (!state?.name) return;
  const old=document.getElementById('welcomeBackOverlay');
  if(old) old.remove();
  const overlay=document.createElement('div');
  overlay.id='welcomeBackOverlay';
  overlay.className='welcome-back-overlay';
  const av=avatarMeta();
  overlay.innerHTML=`<div class="welcome-back-glow"></div><div class="welcome-back-inner"><div class="welcome-back-avatar">${av.emoji}</div><div class="welcome-back-hi">Hi ${esc(state.name)}!</div><div class="welcome-back-title">Welcome back to BookLoks</div><div class="welcome-back-sub">Ready for a new adventure?</div><div class="welcome-back-journey">LET'S PLAY • LEARN • BUILD</div></div>`;
  document.body.appendChild(overlay);
  window.setTimeout(()=>{
    overlay.classList.add('hide');
    window.setTimeout(()=>overlay.remove(),450);
  },2300);
}
window.showReturningWelcome = showReturningWelcome;

function openHomeName(){
  const m=document.getElementById('modal');m.classList.remove('hidden');
  m.innerHTML=`<div class="modal-card"><div class="modal-kicker">🏠 MY HOME</div><h2>Name your world</h2><p class="muted">Give your home a name you'll recognise.</p><input id="homeNameInput" class="input" maxlength="24" value="${esc(state.homeName)}" placeholder="Abbir's World"><div class="modal-actions"><button class="btn soft" id="closeHomeName">Cancel</button><button class="btn dark" id="saveHomeName">Save</button></div></div>`;
  document.getElementById('closeHomeName').onclick=()=>m.classList.add('hidden');
  document.getElementById('saveHomeName').onclick=()=>{state.homeName=document.getElementById('homeNameInput').value.trim()||'My Home';state.homeNameCustom=true;save();m.classList.add('hidden');render();};
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
  document.getElementById('saveName').onclick=()=>{const entered=document.getElementById('nameInput').value.trim(); if(entered){const oldName=state.name; state.name=entered; if(!state.homeNameCustom && (!state.homeName || state.homeName==='My Home' || state.homeName===`${oldName || ''}'s Home`)) state.homeName=`${entered}'s Home`;} save();m.classList.add('hidden');render();};
  document.getElementById('nameInput').focus();
}
function playQuickCheckRight(){ playEffect('quickCheckRight', 1.0, 900); }
function playQuickCheckWrong(){ playEffect('quickCheckWrong', 1.0, 1200); vibrateWrong(); }
function playQuestionRight(){ playEffect('questionRight', 1.0, 900); }
function playQuestionWrong(){ playEffect('questionWrong', 1.0, 1100); vibrateWrong(); }
function playMissionSuccess(){ playEffect('missionSuccess', 1.0, 5200); }
function playMissionFailed(){ playEffect('missionFailed', 1.0, 6200); }

if (!window.__bookloksAudioGesture) {
  window.__bookloksAudioGesture = true;
  const unlockAudio = () => { unlockAndStartMusic(); };
  document.addEventListener('pointerdown', unlockAudio, {passive:true});
  document.addEventListener('touchstart', unlockAudio, {passive:true});
  document.addEventListener('keydown', unlockAudio, {passive:true});
  document.getElementById('splashScreen')?.addEventListener('click', unlockAudio, {passive:true});
}
function showMissionOutcome(scoreCount){
  const old=document.getElementById('missionOutcomeOverlay');
  if(old) old.remove();
  const overlay=document.createElement('div'); overlay.id='missionOutcomeOverlay';
  const success=scoreCount>=4;
  overlay.className=`mission-outcome-overlay ${success?'success':'try-again'}`;
  if(success){
    playMissionSuccess();
    confetti();
    const title=scoreCount===5?'TREASURE FOUND!':'MISSION CLEARED!';
    const subtitle=scoreCount===5?`Perfect! ${playerName()} found the Golden Egg.`:`Amazing! ${playerName()} cleared this mission.`;
    overlay.innerHTML=`<div class="outcome-stars">${Array.from({length:18},(_,i)=>`<span style="--i:${i}">✦</span>`).join('')}</div><div class="outcome-treasure">💰</div><div class="outcome-card treasure-card"><div class="treasure-chest">🧰</div><div class="outcome-kicker">${title}</div><h2>${scoreCount===5?'Amazing work!':'Great job!'}</h2><p>${subtitle}</p><div class="outcome-rewards"><span>⭐ +${lastReward.xp||0} XP</span><span>🪙 +${lastReward.coins||0} Coins</span>${scoreCount===5?'<span>🥚 Golden Egg!</span>':''}</div></div>`;
  } else {
    playMissionFailed();
    overlay.innerHTML=`<div class="outcome-card minimal"><div class="outcome-icon">💪</div><div class="outcome-kicker">KEEP GOING</div><h2>Better luck next time!</h2><p>${playerName()}, you scored <b>${scoreCount}/5</b>. Try the mission again when you are ready.</p></div>`;
  }
  document.body.appendChild(overlay);
  window.setTimeout(()=>{overlay.classList.add('hide');window.setTimeout(()=>overlay.remove(),500);},success?3200:1900);
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
  else if(route==='chapters') route='subjects';
  else if(route==='books') route='subjects';
  else if(route==='subjects') route='home';
  render();
};
render();


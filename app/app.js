const STORAGE='bookloks_phase1';
const defaultState={name:'',avatar:'boy',level:3,xp:320,xpTarget:500,coins:85,musicOn:true,musicVolume:(window.matchMedia && window.matchMedia('(max-width: 700px)').matches ? 5 : 20),soundOn:true,soundVolume:90,hasOnboarded:false};
let state=loadState();
let selectedAvatar='boy';
const $=(s)=>document.querySelector(s);
const splash=$('#splash'), onboarding=$('#onboarding'), welcome=$('#welcomeBack'), app=$('#app');
const backgroundMusic=$('#backgroundMusic');
const uiError=$('#uiError');

function loadState(){try{return {...defaultState,...JSON.parse(localStorage.getItem(STORAGE)||'{}')};}catch{return {...defaultState};}}
function saveState(){localStorage.setItem(STORAGE,JSON.stringify(state));}
function avatarPath(type,kind='profile'){return `./assets/img/${type}-${kind}.png`;}
function setAvatarImages(){
  const type=state.avatar==='girl'?'girl':'boy';
  $('#playerMiniAvatar').src=avatarPath(type,'profile');
  $('#heroCharacter').src=avatarPath(type,'full');
  $('#profileAvatar').src=avatarPath(type,'bust');
  $('#welcomeAvatar').src=avatarPath(type,'bust');
  $('#navProfileIcon').src=avatarPath(type,'profile');
}
function updateHome(){
  $('#playerName').textContent=state.name||'Gaurav';
  $('#levelValue').textContent=state.level;
  $('#xpCurrent').textContent=state.xp;
  $('#xpTarget').textContent=state.xpTarget;
  $('#xpFill').style.width=Math.min(100,Math.round((state.xp/state.xpTarget)*100))+'%';
  $('#coinValue').textContent=state.coins;
  setAvatarImages();
}
function hideOverlay(el){el.classList.add('hidden');el.setAttribute('aria-hidden','true');}
function showOverlay(el){el.classList.remove('hidden');el.setAttribute('aria-hidden','false');}
function revealApp(){app.classList.remove('hidden-app');}
function startMusic(){
  backgroundMusic.volume=(state.musicVolume||20)/100;
  backgroundMusic.muted=!state.musicOn;
  if(!state.musicOn)return;
  backgroundMusic.play().catch(()=>{});
}
function setSoundPrefs(){backgroundMusic.volume=(state.musicVolume||20)/100;backgroundMusic.muted=!state.musicOn;}
function playError(){if(!state.soundOn)return;uiError.volume=(state.soundVolume||90)/100;uiError.currentTime=0;uiError.play().catch(()=>{});if(navigator.vibrate)navigator.vibrate(80);}
function showRoute(title,text){$('#routeTitle').textContent=title;$('#routeText').textContent=text;$('#routePanel').classList.remove('hidden');}
function closePanels(){['routePanel','profilePanel','infoPanel'].forEach(id=>$('#'+id)?.classList.add('hidden'));}
function showProfile(){closePanels();const p=$('#profilePanel');p.classList.remove('hidden');$('#profileNameInput').value=state.name||'';$('#musicToggle').textContent=state.musicOn?'ON':'OFF';$('#musicToggle').classList.toggle('active',state.musicOn);$('#soundToggle').textContent=state.soundOn?'ON':'OFF';$('#soundToggle').classList.toggle('active',state.soundOn);$('#musicVolume').value=state.musicVolume;$('#soundVolume').value=state.soundVolume;}
function persistProfile(){const name=$('#profileNameInput').value.trim();if(name)state.name=name;saveState();updateHome();}

function beginOnboarding(){revealApp();showOverlay(onboarding);$('#nameInput').value='';}
function beginWelcome(){revealApp();$('#welcomeName').textContent=`Hi ${state.name||'there'}!`;setAvatarImages();showOverlay(welcome);}

$('#nameNext').addEventListener('click',()=>{const name=$('#nameInput').value.trim();if(!name){$('#nameInput').focus();return;}state.name=name;saveState();$('#onboardStepName').classList.add('hidden');$('#onboardStepAvatar').classList.remove('hidden');});
$('#nameInput').addEventListener('keydown',(e)=>{if(e.key==='Enter')$('#nameNext').click();});
document.querySelectorAll('.avatar-choice').forEach(btn=>btn.addEventListener('click',()=>{selectedAvatar=btn.dataset.avatar;document.querySelectorAll('.avatar-choice').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');$('#avatarFinish').disabled=false;}));
$('#avatarFinish').addEventListener('click',()=>{state.avatar=selectedAvatar;state.hasOnboarded=true;saveState();hideOverlay(onboarding);updateHome();startMusic();});
$('#welcomeContinue').addEventListener('click',()=>{hideOverlay(welcome);startMusic();});

for(const btn of document.querySelectorAll('.action-card')){btn.addEventListener('click',()=>{
  const type=btn.dataset.action;
  if(type==='continue')showRoute('Next Mission','The Science World and Push & Pull chapter will be connected here in Phase 2.');
  if(type==='map')showRoute('Map Coming Soon','Your first world will be Science Forest. We will build it in Phase 2.');
  if(type==='rewards')showRoute('Rewards Coming Soon','XP, Coins and Golden Eggs will connect here as the reward system is added.');
});}
$('#routeClose').addEventListener('click',()=>$('#routePanel').classList.add('hidden'));
$('#profileClose').addEventListener('click',()=>$('#profilePanel').classList.add('hidden'));
$('#notifyBtn').addEventListener('click',()=>showRoute('No new notifications','You are all caught up.'));
$('#settingsBtn').addEventListener('click',showProfile);
$('#saveProfile').addEventListener('click',()=>{persistProfile();$('#profilePanel').classList.add('hidden');});
$('#musicToggle').addEventListener('click',()=>{state.musicOn=!state.musicOn;saveState();setSoundPrefs();if(state.musicOn)startMusic();});
$('#soundToggle').addEventListener('click',()=>{state.soundOn=!state.soundOn;saveState();});
$('#musicVolume').addEventListener('input',(e)=>{state.musicVolume=Number(e.target.value);saveState();setSoundPrefs();});
$('#soundVolume').addEventListener('input',(e)=>{state.soundVolume=Number(e.target.value);saveState();});

for(const btn of document.querySelectorAll('.nav-btn')){btn.addEventListener('click',()=>{
  document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));btn.classList.add('active');
  const nav=btn.dataset.nav;
  if(nav==='home'){closePanels();window.scrollTo({top:0,behavior:'smooth'});}
  if(nav==='profile'){showProfile();window.scrollTo({top:0,behavior:'smooth'});}
  if(nav==='learn')showRoute('Learn — Coming Soon','Phase 2 will connect Science World → Push & Pull here.');
  if(nav==='myhome')showRoute('My Home — Coming Soon','Phase 5 will turn this into your first buildable room.');
});}

// Mobile audio unlock: do not require toggling music.
['pointerdown','touchstart','keydown'].forEach(evt=>window.addEventListener(evt,()=>{if(state.hasOnboarded && state.musicOn)startMusic();},{once:true,passive:true}));

window.addEventListener('load',()=>{
  if('serviceWorker' in navigator){ navigator.serviceWorker.register('./sw.js').catch(()=>{}); }
  updateHome();
  setSoundPrefs();
  setTimeout(()=>{
    hideOverlay(splash);
    if(!state.hasOnboarded){beginOnboarding();}
    else{beginWelcome();}
  },2200);
});

import { QUESTIONS } from './questions.js?v=21-cube-copy-6';
import { STOPS, LEG_DURATION } from './route.js';
import { createPresentationMusic } from './music.js?v=21-gull-14';

// Fallback travel uses wall-clock time. Film travel is driven by decoded video time,
// so buffering or a visibility hold cannot advance the quiz ahead of the picture.
gsap.ticker.lagSmoothing(0);

const $=id=>document.getElementById(id);
const letters=['A','B','C','D'];
const STORE='ky-thu-dai-hai.game.v1',PREFS='ky-thu-dai-hai.settings.v1';
const FILM_MANIFESTS={v21:'./assets/voyage-v21/manifest.json'};
const EXPECTED_FILM=Object.freeze({stage:'final-sails-v21-full-hd',width:1920,height:1080,nativeSha256:'c25312d6197e1fa7d8e059e52da448efca8860e36ea22e3e5a9486c100e7ad4b'});
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
let preferences={duration:LEG_DURATION,quality:'auto',reduced:null};
try{const p=JSON.parse(localStorage.getItem(PREFS));if(p&&typeof p==='object')preferences={...preferences,...p};}catch{}
preferences.duration=LEG_DURATION;
if(!['auto','low'].includes(preferences.quality))preferences.quality='auto';
const state={phase:'lobby',index:0,progress:0,answers:Array(10).fill(null),started:false};
let world=null,worldReady=false,filmAvailability={status:'unchecked',mediaReady:false},fallback=false,busy=false,voyageTween=null,transition=null,cinemaTween=null,endingTimeline=null,flowGeneration=0,openingTimeline=null,introAmbient=[],toastTimeout=0,lastSave=0,saved=null;
const holds=new Set();
let soundOn=false,audio=null,noise=null,windGain=null,musicPictureReady=false;
const screens=['lobby','blackout','opening','voyage','question','complete'];
const reduced=()=>preferences.reduced??motionQuery.matches;
const score=()=>state.answers.filter((a,i)=>a===QUESTIONS[i].correct).length;
const announced=text=>{$('announcement').textContent=text;};
const music=createPresentationMusic($('background-music'),{onChange:recordDiagnostics,
  onError:()=>toast('Nhạc nền chưa phát được. Trò chơi vẫn tiếp tục.'),
  onAmbienceError:()=>toast('Một lớp âm thanh tàu chưa tải được. Trò chơi vẫn tiếp tục.'),
  ambience:[{id:'water',media:$('water-ambience')},{id:'wood',media:$('wood-ambience')},
    {id:'gull',media:$('gull-cue'),phases:['opening','return','sailing','outro']}]});
const safeSave=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
function readSaved(){try{const s=JSON.parse(localStorage.getItem(STORE));if(s?.version===1&&s.answers?.length===10&&Number.isInteger(s.index)&&s.index>=0&&s.index<10&&s.answers.every(a=>a===null||(Number.isInteger(a)&&a>=0&&a<=3))&&['sailing','question','answered','outro','complete'].includes(s.phase)&&!(s.phase==='outro'&&(s.index!==9||s.answers.some(a=>a===null)))){s.progress=Math.min(1,Math.max(0,Number(s.progress)||0));return s;}}catch{}return null;}
function save(){if(!state.started)return;let phase=state.phase;if(phase==='arrival')phase='question';if(phase==='return')return;
  if(!['sailing','question','answered','outro','complete'].includes(phase))return;
  safeSave(STORE,{version:1,index:state.index,progress:state.progress,answers:state.answers,phase,paused:holds.has('manual')});
  recordDiagnostics();
}
function recordDiagnostics(){$('game').dataset.diagnostics=JSON.stringify({phase:state.phase,index:state.index,progress:state.progress,answers:[...state.answers],score:score(),duration:preferences.duration,reduced:reduced(),fullscreenSupported:!!document.fullscreenEnabled,fallback,busy,holds:[...holds],music:music.getState(),film:world?.availability??filmAvailability,world:world?.getState()??null,metrics:world?.getMetrics()??null});}
function phase(name){state.phase=name;document.body.dataset.phase=name;document.body.dataset.phaseStartedAt=String(Date.now());if(name==='standby')document.body.dataset.blackoutStartedAt=String(Date.now());if(name==='opening')document.body.dataset.blackoutElapsed=String(Date.now()-Number(document.body.dataset.blackoutStartedAt));$('pause').disabled=!['sailing','outro'].includes(name);syncProjectorCursor();syncPlayback();recordDiagnostics();}
function showScreen(id){for(const name of screens){$(name).hidden=name!==id;$(name).inert=name!==id;}if(id==='opening')introAmbient.forEach(t=>t.resume());else introAmbient.forEach(t=>t.pause());}
function syncPlayback(){const frozen=holds.size>0;
  music.update({phase:state.phase,index:state.index,started:state.started&&musicPictureReady,hidden:holds.has('hidden'),paused:holds.has('manual')||holds.has('dialog')});
  voyageTween?.paused(frozen);
  cinemaTween?.paused(holds.has('hidden'));
  if(transition)transition.paused(holds.has('hidden'));
  const mapVisible=['sailing','arrival','return','outro'].includes(state.phase);
  world?.setActive(mapVisible&&!frozen);world?.setPaused(frozen);
  if(holds.has('hidden')){openingTimeline?.pause();introAmbient.forEach(t=>t.pause());}
  else if(state.phase==='opening'){openingTimeline?.resume();if(!reduced())introAmbient.forEach(t=>t.resume());}
  $('pause').innerHTML=frozen?'<svg><use href="#i-play"/></svg><span>Đi tiếp</span>':'<svg><use href="#i-pause"/></svg><span>Tạm dừng</span>';
  $('pause').setAttribute('aria-label',frozen?'Đi tiếp hành trình':'Tạm dừng hành trình');
  if(windGain&&audio)windGain.gain.setTargetAtTime(soundOn&&!holds.has('hidden')&&mapVisible ? .014 : 0,audio.currentTime,.25);
}
function toast(message){clearTimeout(toastTimeout);$('toast').textContent=message;$('toast').hidden=false;toastTimeout=setTimeout(()=>$('toast').hidden=true,3500);}
function persistPreferences(){safeSave(PREFS,preferences);}
function applyMotion(){document.body.classList.toggle('motion-reduced',reduced());world?.setReduced(reduced());$('reduce-motion').checked=reduced();
  introAmbient.forEach(t=>reduced()?t.pause():state.phase==='opening'&&t.resume());
}
function beginIntro(){
  openingTimeline?.kill();introAmbient.forEach(t=>t.kill());introAmbient=[];
  const title=document.querySelector('.title-art'),art=document.querySelector('.opening-art');
  gsap.set(title,{autoAlpha:1,x:0,y:0,scale:1,rotationZ:0,clipPath:'inset(0% 0% 0% 0%)'});
  gsap.set(art,{scale:1.02,x:0,y:0});
  if(reduced()){gsap.fromTo(title,{opacity:.4},{opacity:1,duration:.3});return;}
  openingTimeline=gsap.timeline({defaults:{ease:'power3.out'}})
    .fromTo(title,{autoAlpha:.05,y:24,scale:.94,clipPath:'inset(0% 100% 0% 0%)'},{autoAlpha:1,y:0,scale:1,clipPath:'inset(0% 0% 0% 0%)',duration:2.1},.15);
  introAmbient.push(gsap.to(art,{scale:1.055,x:-9,y:5,duration:12,ease:'sine.inOut',repeat:-1,yoyo:true}));
  introAmbient.push(gsap.to(title,{y:-7,rotationZ:-.25,duration:5,ease:'sine.inOut',repeat:-1,yoyo:true,delay:2.3}));
  introAmbient.push(gsap.to('.opening-dust',{y:-28,x:7,opacity:.7,duration:10,ease:'sine.inOut',repeat:-1,yoyo:true}));
}
function updateRoute(){
  $('route-progress').replaceChildren(...QUESTIONS.map((q,i)=>{const li=document.createElement('li');const done=state.answers[i]!==null;li.className=done?'done':i===state.index?'current':'';li.textContent=String(i+1);li.setAttribute('aria-label',`Câu ${i+1}${done?', đã trả lời':i===state.index?', đang đến':''}`);if(i===state.index)li.setAttribute('aria-current','step');return li;}));
}
function updateVoyage(){
  $('leg-label').textContent=`Điểm dừng ${state.index+1} / ${QUESTIONS.length}`;$('destination-name').textContent=`${world?.getStopName?.(state.index)||STOPS[state.index].name} · ${state.index+1} / ${QUESTIONS.length}`;
  $('travel-status').textContent=holds.has('manual')?'Đang tạm dừng':state.index?'Đang tiếp tục cuộc khám phá':'Đang hướng tới thử thách đầu tiên';
  $('travel-progress').style.transform=`scaleX(${state.progress})`;updateRoute();
}
function moveShip(){
  if(!reduced())world?.setLeg(state.index,state.progress);
  $('travel-progress').style.transform=`scaleX(${state.progress})`;
  if(performance.now()-lastSave>1000){save();lastSave=performance.now();}
}
function sail(progress=0){
  voyageTween?.kill();state.progress=progress;phase('sailing');showScreen('voyage');updateVoyage();
  $('pause').disabled=false;
  if(world?.isFilm){
    voyageTween=null;
    world.playLeg(state.index,state.progress,{onProgress:p=>{state.progress=p;$('travel-progress').style.transform=`scaleX(${p})`;if(performance.now()-lastSave>1000){save();lastSave=performance.now();}},onComplete:arrive});
  }else{
    world?.setLeg(state.index,reduced()?0:state.progress);
    voyageTween=gsap.to(state,{progress:1,duration:preferences.duration*(1-progress),ease:'none',onUpdate:moveShip,onComplete:arrive});
  }
  syncPlayback();save();if(world?.focus)world.focus();else $('world').focus({preventScroll:true});announced(`Tàu đang đi đến điểm dừng ${state.index+1}: ${world?.getStopName?.(state.index)||STOPS[state.index].name}.`);
}
async function wipe(swap,{back=false}={}){
  busy=true;const curtain=$('curtain');curtain.style.pointerEvents='auto';document.body.dataset.transition='true';
  await new Promise(resolve=>{
    transition=gsap.timeline({paused:holds.has('hidden'),defaults:{ease:'power2.inOut'},onInterrupt:()=>resolve(false),onComplete:()=>{curtain.style.pointerEvents='none';busy=false;transition=null;document.body.dataset.transition='false';recordDiagnostics();resolve(true);}});
    if(reduced()){
      transition.set(curtain,{y:0,yPercent:0,autoAlpha:0}).to(curtain,{autoAlpha:1,duration:.2}).call(swap).to(curtain,{autoAlpha:0,duration:.2}).set(curtain,{y:0,yPercent:115,autoAlpha:1});
    }else{
      transition.set(curtain,{y:0,autoAlpha:1,yPercent:back?-115:115,rotation:back?-3:3})
        .to(curtain,{yPercent:0,rotation:0,duration:.58}).call(swap)
        .to(curtain,{yPercent:back?115:-115,rotation:back?3:-3,duration:.66},'+=.03');
    }
  });
}
function dissolveToQuestion(){
  const question=$('question');busy=true;document.body.dataset.transition='true';
  question.hidden=false;question.inert=true;renderQuestion(false);
  const heading=question.querySelectorAll('.question-top,#question-story,#question-prompt');
  const answers=question.querySelectorAll('.answer');
  gsap.set(question,{opacity:0});gsap.set([...heading,...answers],{opacity:0,y:reduced()?0:8});
  return new Promise(resolve=>{
    transition=gsap.timeline({paused:holds.has('hidden'),onInterrupt:()=>resolve(false),onComplete:()=>{
      gsap.set([question,...heading,...answers],{clearProps:'transform,opacity,visibility'});
      showScreen('question');phase('question');busy=false;transition=null;
      document.body.dataset.transition='false';save();resolve(true);
    }})
      .to(question,{opacity:1,duration:reduced()?.2:.55,ease:'sine.inOut'},0)
      .to(heading,{opacity:1,y:0,duration:.27,ease:'power3.out'},reduced()?.12:.36)
      .to(answers,{opacity:1,y:0,duration:.24,stagger:reduced()?0:.045,ease:'power3.out'},reduced()?.12:.52);
  });
}
async function arrive(){
  if(state.phase!=='sailing')return;
  const epoch=flowGeneration;busy=true;voyageTween=null;phase('arrival');state.progress=1;world?.setLeg(state.index,1);$('pause').disabled=true;
  $('travel-status').textContent=`Đã đến ${world?.getStopName?.(state.index)||STOPS[state.index].name}`;playTone('arrive');
  await dissolveToQuestion();
  if(epoch===flowGeneration)focusQuestion();
}
function renderQuestion(animate=true){
  const q=QUESTIONS[state.index];$('question-number').textContent=`Câu hỏi ${q.id} / ${QUESTIONS.length}`;
  $('score-small').textContent=`${score()} câu đúng`;$('question-story').textContent=q.story;$('question-prompt').textContent=q.prompt;
  document.querySelector('.question-content').classList.toggle('long-question',q.story.length>380);
  $('answers').replaceChildren(...q.options.map((text,i)=>{
    const b=document.createElement('button');b.type='button';b.className='answer';b.dataset.answer=i;
    const letter=document.createElement('span');letter.className='answer-letter';letter.textContent=`${letters[i]}.`;
    const content=document.createElement('span');content.textContent=text;
    const status=document.createElement('span');status.className='answer-status';
    b.append(letter,content,status);b.setAttribute('aria-label',`${letters[i]}. ${text}`);b.setAttribute('aria-keyshortcuts',letters[i]);b.addEventListener('click',()=>choose(i));return b;
  }));
  $('feedback').hidden=true;$('answer-instruction').hidden=false;$('continue').disabled=false;
  $('continue').innerHTML=`${state.index===9?'Hoàn thành hành trình':'Tiếp tục hành trình'} <svg><use href="#i-arrow"/></svg>`;
  document.querySelector('.question-scroll').scrollTop=0;
  if(state.answers[state.index]!==null){phase('answered');reveal(false);}
  else if(animate&&!reduced())gsap.fromTo('#question-story, #question-prompt, .answer',{autoAlpha:.2,y:9},{autoAlpha:1,y:0,duration:.27,stagger:.045,ease:'power3.out',clearProps:'transform,opacity,visibility'});
}
function focusQuestion(){if(['question','answered'].includes(state.phase))$('question-prompt').focus({preventScroll:true});}
function choose(choice){
  if(state.phase!=='question'||busy||holds.has('dialog')||state.answers[state.index]!==null)return;
  state.answers[state.index]=choice;phase('answered');reveal(true);save();
}
function reveal(animate){
  const q=QUESTIONS[state.index],selected=state.answers[state.index],correct=selected===q.correct;
  for(const b of $('answers').children){const i=+b.dataset.answer;b.disabled=true;b.dataset.result=i===q.correct?'correct':i===selected?'wrong':'muted';
    const s=b.querySelector('.answer-status');s.textContent=i===q.correct?'Đáp án đúng':i===selected?'Đã chọn':'';
    b.setAttribute('aria-label',`${letters[i]}. ${q.options[i]}${i===q.correct?', đáp án đúng':i===selected?', bạn đã chọn':''}`);
  }
  $('score-small').textContent=`${score()} câu đúng`;$('answer-instruction').hidden=true;$('feedback').hidden=false;$('feedback').dataset.correct=String(correct);
  $('feedback-title').textContent=correct?'Chính xác!':`Chưa chính xác. Đáp án ${letters[q.correct]}.`;
  $('feedback-explanation').textContent=q.explanation;
  if(animate){playTone(correct?'correct':'wrong');announced(`${correct?'Chính xác':'Chưa chính xác'}. Đáp án ${letters[q.correct]}: ${q.options[q.correct]}.`);
    if(!reduced())gsap.fromTo($('feedback'),{opacity:0,y:8},{opacity:1,y:0,duration:.25,ease:'power3.out'});
    requestAnimationFrame(()=>{if(state.phase==='answered'&&!$('feedback').hidden)$('continue').focus({preventScroll:true});});
  }
}
async function continueVoyage(){
  if(state.phase!=='answered'||busy||holds.has('dialog'))return;
  const epoch=flowGeneration;
  $('continue').disabled=true;
  if(state.index===9&&!world?.hasOutro){await wipe(()=>complete());$('complete-heading').focus({preventScroll:true});return;}
  const ending=state.index===9;
  phase('return');
  // Compose the next film shot while the question is still opaque. Continuous
  // editions resolve to the same endpoint; cut editions use their own startStill.
  busy=true;document.body.dataset.transition='true';
  $('voyage').hidden=false;$('voyage').inert=true;
  if(ending)await world.setOutro(0);
  else if(world?.isFilm){if(world.prepareLeg)await world.prepareLeg(state.index+1,0);else world.setLeg(state.index+1,0);}
  else world?.setLeg(state.index,1);
  if(epoch!==flowGeneration)return;
  await new Promise(resolve=>{
    transition=gsap.timeline({paused:holds.has('hidden'),onInterrupt:()=>resolve(false),onComplete:()=>{
      gsap.set($('question'),{clearProps:'opacity'});showScreen('voyage');busy=false;transition=null;
      document.body.dataset.transition='false';resolve(true);
    }}).to($('question'),{opacity:0,duration:reduced()?.2:.45,ease:'power2.out'});
  });
  if(epoch!==flowGeneration)return;
  if(ending){beginOutro();return;}
  state.index++;state.progress=0;sail();
}
// Cancel the current film/transition before restoring an unanswered question.
function goBack(){
  if(!state.started||holds.has('dialog'))return;
  const p=state.phase;
  if(!['question','answered','arrival','return','sailing','outro','complete'].includes(p))return;
  let target=state.index;
  if(['question','sailing','arrival'].includes(p)){
    if(target===0)return;
    target--;
  }
  flowGeneration++;
  voyageTween?.kill();voyageTween=null;transition?.kill();transition=null;
  cinemaTween?.kill();cinemaTween=null;endingTimeline?.kill();endingTimeline=null;
  holds.delete('manual');busy=false;
  document.body.dataset.transition='false';delete document.body.dataset.filmEnding;
  gsap.set($('curtain'),{y:0,yPercent:115,rotation:0,autoAlpha:1});$('curtain').style.pointerEvents='none';
  const questionElements=[$('question'),...document.querySelectorAll('.question-top,#question-story,#question-prompt,.answer,#feedback')];
  gsap.killTweensOf(questionElements);
  gsap.set(questionElements,{clearProps:'transform,opacity,visibility'});
  state.index=target;state.progress=1;
  // Later answers belong to the abandoned branch of the presentation.
  state.answers.fill(null,target);
  world?.setLeg(target,1);showScreen('question');phase('question');renderQuestion(false);
  syncPlayback();save();focusQuestion();announced(`Quay lại câu hỏi ${target+1}, chưa chọn đáp án.`);
}
function prepareComplete(){
  $('final-score').textContent=score();$('review-toggle').setAttribute('aria-expanded','false');$('review-toggle').textContent='Xem lại đáp án';$('answer-review').hidden=true;
  $('answer-review').replaceChildren(...QUESTIONS.map((q,i)=>{const li=document.createElement('li'),h=document.createElement('h3'),p=document.createElement('p'),result=document.createElement('p');h.textContent=`${i+1}. ${q.title}`;p.textContent=`Đáp án ${letters[q.correct]}: ${q.options[q.correct]}`;result.className='review-result';result.textContent=state.answers[i]===q.correct?'Bạn đã trả lời đúng':`Bạn đã chọn ${letters[state.answers[i]]}. ${q.explanation}`;li.append(h,p,result);return li;}));
}
function showFilmEnding(){showScreen('complete');$('voyage').hidden=false;$('voyage').inert=true;document.body.dataset.filmEnding='true';}
function buildEndingTimeline(){
  endingTimeline?.kill();const timing=world.outroTiming;
  const title=document.querySelector('#complete-heading'),subtitle=document.querySelector('.complete-intro'),compass=document.querySelector('.complete-compass'),result=document.querySelector('.final-score'),actions=document.querySelector('.complete-actions'),shade=document.querySelector('.complete-backdrop');
  gsap.set([compass,title,subtitle,result,actions],{autoAlpha:0,y:reduced()?0:10});gsap.set(shade,{opacity:0});
  endingTimeline=gsap.timeline({paused:true,defaults:{ease:'power3.out'}})
    .to(shade,{opacity:1,duration:.4},Math.max(0,timing.titleFrom-.4))
    .to([compass,title],{autoAlpha:1,y:0,duration:.8,stagger:.06},timing.titleFrom)
    .to(subtitle,{autoAlpha:1,y:0,duration:.7},timing.subtitleFrom)
    .to(result,{autoAlpha:1,y:0,duration:.65},Math.min(timing.completeFrom-.7,timing.subtitleFrom+.7))
    .to(actions,{autoAlpha:1,y:0,duration:.6},timing.completeFrom);
}
function renderOutro(progress){
  state.progress=progress;const seconds=progress*world.outroTiming.duration;
  endingTimeline?.time(seconds,false);document.querySelector('.complete-actions').inert=seconds<world.outroTiming.completeFrom;
  if(performance.now()-lastSave>500){save();lastSave=performance.now();}
}
function beginOutro(progress=0){
  if(!world?.hasOutro){complete();return;}
  prepareComplete();showFilmEnding();buildEndingTimeline();state.progress=progress;phase('outro');renderOutro(progress);
  if(reduced()){complete();return;}
  world.playOutro(progress,{onProgress:renderOutro,onComplete:complete});syncPlayback();save();world.focus();announced('Mười điểm dừng đã hoàn thành. Đang nhìn lại toàn bộ hành trình.');
}
function complete(){
  if(state.phase!=='outro'||document.body.dataset.filmEnding!=='true')prepareComplete();state.progress=1;
  if(world?.hasOutro){showFilmEnding();if(!endingTimeline)buildEndingTimeline();endingTimeline.progress(1);document.querySelector('.complete-actions').inert=false;world.setOutro(1);}
  else showScreen('complete');
  phase('complete');save();playTone('complete');$('complete-heading').focus({preventScroll:true});
}
function waitCinema(seconds){return new Promise(resolve=>{cinemaTween=gsap.to({elapsed:0},{elapsed:1,duration:seconds,ease:'none',paused:holds.has('hidden'),onComplete:()=>{cinemaTween=null;resolve(true);},onInterrupt:()=>resolve(false)});});}
async function startFresh(){if(busy||!worldReady)return;
  const epoch=++flowGeneration;
  busy=true;
  musicPictureReady=false;state.started=true;state.index=0;state.progress=0;state.answers=Array(10).fill(null);holds.delete('manual');
  showScreen('blackout');phase('standby');
  music.unlock({restart:true});
  if(!await waitCinema(5)||epoch!==flowGeneration)return;
  showScreen('opening');phase('opening');beginIntro();
  openingTimeline?.fromTo($('opening'),{opacity:0},{opacity:1,duration:.8,clearProps:'opacity'},0);
  // Let the opening paint before starting the first audible media sample.
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    if(epoch===flowGeneration&&state.phase==='opening'){musicPictureReady=true;syncPlayback();}
  }));
  if(!await waitCinema(5.5)||epoch!==flowGeneration)return;
  await wipe(()=>{showScreen('voyage');world?.setLeg(0,0);phase('return');});if(epoch===flowGeneration)sail();
}
async function resume(){if(busy||!saved||!worldReady)return;
  const epoch=++flowGeneration;
  musicPictureReady=true;state.started=true;state.index=saved.index;state.progress=saved.progress;state.answers=[...saved.answers];holds.delete('manual');
  music.unlock();
  const destination=saved.phase;
  if(['sailing','outro'].includes(destination)&&saved.paused)holds.add('manual');
  await wipe(()=>{if(destination==='complete')complete();else if(destination==='outro'){if(world?.hasOutro){world.setOutro(state.progress);prepareComplete();showFilmEnding();buildEndingTimeline();phase('outro');renderOutro(state.progress);}else complete();}else if(destination==='question'||destination==='answered'){showScreen('question');phase(destination);renderQuestion();world?.setLeg(state.index,1);}else{showScreen('voyage');phase('return');world?.setLeg(state.index,state.progress);}});
  if(epoch!==flowGeneration)return;
  if(destination==='sailing')sail(state.progress);else if(destination==='outro'&&world?.hasOutro)beginOutro(state.progress);else if(destination!=='complete')focusQuestion();
}
function restart(){flowGeneration++;voyageTween?.kill();voyageTween=null;transition?.kill();transition=null;cinemaTween?.kill();cinemaTween=null;busy=false;state.started=false;state.phase='lobby';state.index=0;state.progress=0;state.answers=Array(10).fill(null);holds.delete('manual');
  endingTimeline?.kill();endingTimeline=null;delete document.body.dataset.filmEnding;gsap.set('#complete .complete-compass,#complete-heading,.complete-intro,.final-score,.complete-actions,.complete-backdrop',{clearProps:'transform,opacity,visibility'});document.querySelector('.complete-actions').inert=false;
  try{localStorage.removeItem(STORE);}catch{}saved=null;$('resume').hidden=true;world?.setLeg(0,0);showScreen('lobby');phase('lobby');$('start').focus({preventScroll:true});
}
async function initializeWorld(){
  worldReady=false;
  $('start').disabled=true;$('resume').disabled=true;
  $('retry-film').hidden=true;$('retry-film').disabled=true;
  $('loading-note').dataset.ready='false';$('loading-note').textContent='Đang chuẩn bị phim mới…';
  document.body.dataset.ready='false';document.body.dataset.renderer='loading';
  try{
    const {createFilmWorld}=await import('./film.js?v=21-only-2');
    // Archived film/mode query strings must not select a previous edition.
    world=await createFilmWorld($('world'),{manifestURLs:[FILM_MANIFESTS.v21],expectedFilm:EXPECTED_FILM,reduced:reduced(),onError:()=>{recordDiagnostics();toast('Đoạn phim v21 chưa phát được. Đang giữ khung hình của bản mới.');}});
    filmAvailability=world.availability;world.setQuality(preferences.quality);worldReady=true;
  }catch(error){
    filmAvailability=error.filmAvailability??{status:'unavailable',mediaReady:false,error:error.message};
    document.body.dataset.renderer='film-unavailable';document.body.dataset.filmStage='unavailable';
    $('loading-note').textContent='Chưa tải được phim. Kiểm tra kết nối rồi thử lại.';
    $('retry-film').hidden=false;$('retry-film').disabled=false;
    recordDiagnostics();return;
  }
  $('start').disabled=false;$('resume').disabled=false;$('loading-note').dataset.ready='true';
  document.body.dataset.ready='true';
  document.body.dataset.renderer=world?.isFilm?'blender-film':fallback?'still':'legacy-3d';
  document.body.dataset.filmStage=world?.isFilm?world.availability.stage:'legacy';
  $('leg-duration').disabled=!!world?.isFilm;
  if(world?.isFilm){preferences.duration=5;$('leg-duration').value='5';}
  recordDiagnostics();
}
function ensureAudio(){if(audio)return;
  audio=new (window.AudioContext||window.webkitAudioContext)();
  const buffer=audio.createBuffer(1,audio.sampleRate*3,audio.sampleRate),data=buffer.getChannelData(0);let b=0;
  for(let i=0;i<data.length;i++){b=(b+Math.random()*.08-.04)*.985;data[i]=b;}
  noise=audio.createBufferSource();noise.buffer=buffer;noise.loop=true;
  const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=600;windGain=audio.createGain();windGain.gain.value=0;noise.connect(filter).connect(windGain).connect(audio.destination);noise.start();
}
function playTone(kind){if(!soundOn||!audio||holds.has('hidden'))return;
  const notes=kind==='correct'?[440,554.37,659.25]:kind==='wrong'?[220,207.65]:kind==='complete'?[329.63,440,554.37,659.25]:[392,523.25];
  notes.forEach((frequency,i)=>{const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime+i*.12;osc.type='sine';osc.frequency.value=frequency;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.045,t+.015);gain.gain.exponentialRampToValueAtTime(.001,t+.48);osc.connect(gain).connect(audio.destination);osc.start(t);osc.stop(t+.5);});
}
function toggleSound(){
  music.setMuted(!music.getState().muted);
  const enabled=!music.getState().muted;
  if(enabled&&state.started)music.unlock();
  $('sound').setAttribute('aria-pressed',String(enabled));$('sound').setAttribute('aria-label',enabled?'Tắt âm thanh':'Bật âm thanh');
  $('sound').title=enabled?'Tắt âm thanh (M)':'Bật âm thanh (M)';$('sound').innerHTML=`<svg><use href="#${enabled?'i-sound':'i-muted'}"/></svg>`;
  toast(enabled?'Âm thanh: bật':'Âm thanh: tắt');recordDiagnostics();
}
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{if(document.body.dataset.presentation!=='true')toast('Không mở được toàn màn hình trong khung xem này. Hãy mở trang bằng trình duyệt rồi nhấn F11.');}}
// Browser F11 does not reliably emit fullscreenchange. Keep the whole
// presentation cursor-free, including descendants with their own pointer rule.
// The lobby also hides it for browser/native fullscreen; F11 remains native.
const fullscreenQuery=matchMedia('(display-mode: fullscreen)');
function syncProjectorCursor(){
  const browserFullscreen=fullscreenQuery.matches||
    (window.innerHeight>=screen.height-2&&window.innerWidth>=screen.width-2);
  const hidden=!!document.fullscreenElement||browserFullscreen||
    (document.body.dataset.presentation==='true'&&state.started);
  document.documentElement.dataset.projectorCursor=hidden?'hidden':'visible';
}
window.addEventListener('resize',syncProjectorCursor);
fullscreenQuery.addEventListener('change',syncProjectorCursor);
function togglePause(){if(!['sailing','outro'].includes(state.phase)||busy)return;holds.has('manual')?holds.delete('manual'):holds.add('manual');syncPlayback();if(state.phase==='sailing')updateVoyage();save();}
function openSettings(){if(busy)return;holds.add('dialog');syncPlayback();$('restart-confirm').hidden=true;$('restart-ask').hidden=false;$('settings').showModal();}
function closeSettings(){$('settings').close();}
function closeSettingsEvent(){holds.delete('dialog');syncPlayback();}

$('start').addEventListener('click',startFresh);$('resume').addEventListener('click',()=>{closeSettings();resume();});$('continue').addEventListener('click',continueVoyage);
$('retry-film').addEventListener('click',initializeWorld);
$('pause').addEventListener('click',togglePause);$('sound').addEventListener('click',toggleSound);$('fullscreen').addEventListener('click',fullscreen);
$('settings-open').addEventListener('click',openSettings);$('settings-close').addEventListener('click',closeSettings);$('settings').addEventListener('close',closeSettingsEvent);
$('leg-duration').value=String(preferences.duration);$('quality').value=preferences.quality;$('reduce-motion').checked=reduced();
$('leg-duration').addEventListener('change',()=>{preferences.duration=+$('leg-duration').value;if(voyageTween&&state.phase==='sailing'){const progress=state.progress;voyageTween.kill();voyageTween=null;sail(progress);}persistPreferences();});
$('quality').addEventListener('change',()=>{preferences.quality=$('quality').value;world?.setQuality(preferences.quality);persistPreferences();});
$('reduce-motion').addEventListener('change',()=>{preferences.reduced=$('reduce-motion').checked;applyMotion();persistPreferences();});
motionQuery.addEventListener('change',applyMotion);
$('restart-ask').addEventListener('click',()=>{$('restart-confirm').hidden=false;$('restart-ask').hidden=true;$('restart-cancel').focus();});
$('restart-cancel').addEventListener('click',()=>{$('restart-confirm').hidden=true;$('restart-ask').hidden=false;$('restart-ask').focus();});
$('restart-confirm-button').addEventListener('click',()=>{closeSettings();restart();});
$('replay').addEventListener('click',restart);
$('review-toggle').addEventListener('click',()=>{const open=$('answer-review').hidden;$('answer-review').hidden=!open;$('review-toggle').setAttribute('aria-expanded',String(open));$('review-toggle').textContent=open?'Ẩn đáp án':'Xem lại đáp án';});
document.addEventListener('keydown',event=>{
  if(event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||$('settings').open)return;
  const tag=event.target?.tagName;if(['SELECT','INPUT','TEXTAREA'].includes(tag)||event.target?.isContentEditable)return;
  const key=event.key.toLowerCase();
  const physical=/^Key([ABCD])$/.exec(event.code);
  const choice=physical?letters.indexOf(physical[1]):letters.indexOf(key.toUpperCase());
  const quizPhase=['question','answered'].includes(state.phase);
  if(event.key==='Backspace'){event.preventDefault();if(!event.repeat)goBack();return;}
  if(event.repeat){if(quizPhase&&(event.key==='Enter'||choice>=0))event.preventDefault();return;}
  if(key==='m'){event.preventDefault();toggleSound();return;}
  // Consume Enter even when a button has focus. Otherwise its default click
  // can choose an unanswered option or race with the next question transition.
  if(event.key==='Enter'&&(quizPhase||busy)){
    event.preventDefault();if(state.phase==='answered'&&!busy)continueVoyage();return;
  }
  if(key==='f'){event.preventDefault();fullscreen();return;}
  if(key==='home'&&state.phase==='complete'){event.preventDefault();restart();return;}
  if(busy)return;
  if(state.phase==='question'&&(choice>=0||['1','2','3','4'].includes(key))){event.preventDefault();choose(choice>=0?choice:+key-1);}
  else if((event.key==='ArrowRight'||event.key==='PageDown')&&state.phase==='answered'){event.preventDefault();continueVoyage();}
  else if(event.code==='Space'&&['sailing','outro'].includes(state.phase)){event.preventDefault();togglePause();}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){save();holds.add('hidden');}else holds.delete('hidden');syncPlayback();});
window.addEventListener('pagehide',event=>{save();world?.setActive(false);music.suspend();if(!event.persisted){world?.dispose();music.dispose();}});window.addEventListener('pageshow',()=>{syncPlayback();});
document.addEventListener('fullscreenchange',()=>{$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Thoát toàn màn hình':'Toàn màn hình');syncProjectorCursor();});

saved=readSaved();$('resume').hidden=!saved;syncProjectorCursor();applyMotion();initializeWorld();

// Read-only diagnostics used to verify the actual runtime, never a shortcut that skips game rules.
Object.defineProperty(window,'voyageDiagnostics',{value:Object.freeze({
  snapshot:()=>({...state,answers:[...state.answers],score:score(),duration:preferences.duration,reduced:reduced(),fallback,busy,holds:[...holds],film:world?.availability??filmAvailability,world:world?.getState()??null}),
  metrics:()=>world?.getMetrics()??{fallback:true},
  dependencies:()=>({three:'0.186.1',gsap:gsap.version,questions:QUESTIONS.length})
}),writable:false});

// Keep one music transport across film, questions and results. Only the gain
// changes at a question; the ten-minute bed never restarts between questions.
export const MUSIC_LEVELS=Object.freeze({main:0.70,question:0.07});
// The ambience sources are normalized near -24 LUFS before these quiet gains.
export const AMBIENCE_LEVELS=Object.freeze({water:0.18,wood:0.17,gull:0.16});
export function musicLevelForPhase(phase){
  if(['arrival','question','answered'].includes(phase))return MUSIC_LEVELS.question;
  if(['opening','return','sailing','outro'].includes(phase))return MUSIC_LEVELS.main;
  return 0;
}

export function createPresentationMusic(media,{onChange=()=>{},onError=()=>{},onAmbienceError=onError,ambience=[],
  createAudioContext=()=>new (window.AudioContext||window.webkitAudioContext)()}={}){
  let context=null,gain=null,source=null,unlocked=false,muted=false,disposed=false;
  let desired={phase:'lobby',index:0,started:false,hidden:false,paused:false};
  let target=0,error=null,stopTimer=0,rampTimer=0,playEpoch=0;
  const beds=ambience.map(({id,media:element,phases=['return','sailing','outro']})=>({id,media:element,level:AMBIENCE_LEVELS[id]??0,
    phases,gain:null,source:null,target:0,stopTimer:0,epoch:0,error:null}));
  media.loop=true;media.volume=1;
  for(const bed of beds){bed.media.loop=true;bed.media.volume=1;}
  const notify=()=>{if(!disposed)onChange();};
  function cancelStop(){clearTimeout(stopTimer);stopTimer=0;}
  function automate(param,level,seconds){
    const now=context.currentTime;
    if(param.cancelAndHoldAtTime)param.cancelAndHoldAtTime(now);
    else{const current=param.value;param.cancelScheduledValues(now);param.setValueAtTime(current,now);}
    param.linearRampToValueAtTime(level,now+seconds);
  }
  function ramp(level,seconds){
    if(!gain||target===level)return;
    target=level;automate(gain.gain,level,seconds);
    clearTimeout(rampTimer);rampTimer=setTimeout(notify,seconds*1000+50);
  }
  function rampBed(bed,level,seconds){
    if(!bed.gain||bed.target===level)return;
    bed.target=level;automate(bed.gain.gain,level,seconds);
  }
  function reportBed(bed,problem){
    if(disposed)return;const message=problem?.message||'Ambience playback failed';
    if(bed.error===message)return;bed.error=message;onAmbienceError(problem,bed.id);notify();
  }
  function syncAmbience(){
    // Cut the ship beds before the first question text fades into view.
    const immediate=!desired.started||desired.hidden||desired.paused||['lobby','standby','arrival','question','answered'].includes(desired.phase);
    const active=unlocked&&!muted&&!immediate;
    for(const bed of beds){
      clearTimeout(bed.stopTimer);bed.stopTimer=0;const epoch=++bed.epoch;
      const bedActive=active&&bed.phases.includes(desired.phase);
      if(immediate){bed.media.pause();rampBed(bed,0,.12);continue;}
      const seconds=bedActive?1:muted?.12:desired.phase==='complete'?1.2:.6;
      rampBed(bed,bedActive?bed.level:0,seconds);
      if(bedActive){
        if(bed.media.paused){bed.media.play().catch(problem=>{
          if(epoch===bed.epoch&&!disposed&&!muted&&!desired.hidden&&!desired.paused&&problem.name!=='AbortError')reportBed(bed,problem);
        });}
      }else if(!bed.media.paused){
        bed.stopTimer=setTimeout(()=>{if(!disposed&&epoch===bed.epoch){bed.media.pause();notify();}},seconds*1000+50);
      }
    }
  }
  function pauseAmbience(){
    for(const bed of beds){bed.epoch++;clearTimeout(bed.stopTimer);bed.stopTimer=0;bed.media.pause();rampBed(bed,0,.12);}
  }
  function report(problem){
    if(disposed)return;error=problem?.message||'Music playback failed';
    onError(problem);notify();
  }
  function play(){
    if(disposed||!unlocked||muted)return;
    const epoch=playEpoch;
    if(context.state!=='running')context.resume().catch(e=>{if(epoch===playEpoch)report(e);});
    if(media.paused)media.play().catch(e=>{
      if(epoch===playEpoch&&!disposed&&!desired.hidden&&!desired.paused&&!muted&&e.name!=='AbortError')report(e);
    });
  }
  function update(next){
    if(disposed)return;desired={...desired,...next};cancelStop();
    const stopped=!desired.started||['lobby','standby','complete'].includes(desired.phase);
    if(desired.hidden||desired.paused||desired.phase==='standby'){
      playEpoch++;media.pause();ramp(0,.12);syncAmbience();notify();return;
    }
    const level=muted||stopped?0:musicLevelForPhase(desired.phase);
    const seconds=level===MUSIC_LEVELS.question?0.7:level===MUSIC_LEVELS.main?1.2:1.8;
    ramp(level,seconds);
    if(unlocked&&!muted&&!stopped){play();}
    else if(unlocked){
      const epoch=++playEpoch;
      stopTimer=setTimeout(()=>{if(!disposed&&epoch===playEpoch){media.pause();notify();}},1850);
    }
    syncAmbience();notify();
  }
  function unlock({restart=false}={}){
    if(disposed)return Promise.resolve();cancelStop();error=null;
    if(!context){
      context=createAudioContext();gain=context.createGain();gain.gain.value=0;
      source=context.createMediaElementSource(media);source.connect(gain);gain.connect(context.destination);
      for(const bed of beds){
        bed.gain=context.createGain();bed.gain.gain.value=0;
        bed.source=context.createMediaElementSource(bed.media);bed.source.connect(bed.gain);bed.gain.connect(context.destination);
      }
    }
    unlocked=true;playEpoch++;
    if(restart){media.currentTime=0;for(const bed of beds)bed.media.currentTime=0;}
    media.preload='auto';
    for(const bed of beds)bed.media.preload='auto';
    // Unlock the audio graph on the user gesture; leave the media paused
    // throughout standby. Its first sample plays only when opening is shown.
    const resumed=context.resume();
    const canPlay=desired.started&&!['lobby','standby','complete'].includes(desired.phase)&&!desired.hidden&&!desired.paused;
    const played=muted||!canPlay?Promise.resolve():media.play();
    notify();
    return Promise.all([resumed,played]).then(()=>update(desired)).catch(e=>{
      if(!disposed&&e.name!=='AbortError')report(e);
    });
  }
  function setMuted(value){muted=!!value;playEpoch++;update(desired);}
  const errorEvent=()=>report(new Error('Không tải được nhạc nền.'));
  const events=['playing','pause','waiting','canplay','loadedmetadata'];
  for(const event of events)media.addEventListener(event,notify);
  media.addEventListener('error',errorEvent);
  for(const bed of beds){
    bed.errorEvent=()=>reportBed(bed,new Error(`Không tải được âm thanh ${bed.id==='water'?'nước':bed.id==='wood'?'tàu gỗ':'hải âu'}.`));
    for(const event of events)bed.media.addEventListener(event,notify);
    bed.media.addEventListener('error',bed.errorEvent);
  }
  return {
    unlock,update,setMuted,
    getState:()=>({unlocked,muted,phase:desired.phase,targetVolume:target,
      volume:gain?.gain.value??0,context:context?.state??'locked',paused:media.paused,
      currentTime:media.currentTime,duration:Number.isFinite(media.duration)?media.duration:null,
      readyState:media.readyState,error,source:media.currentSrc||media.src,
      ambience:beds.map(bed=>({id:bed.id,loop:bed.media.loop,targetVolume:bed.target,volume:bed.gain?.gain.value??0,
        paused:bed.media.paused,currentTime:bed.media.currentTime,duration:Number.isFinite(bed.media.duration)?bed.media.duration:null,
        readyState:bed.media.readyState,error:bed.error,source:bed.media.currentSrc||bed.media.src}))}),
    suspend(){playEpoch++;cancelStop();media.pause();ramp(0,.12);pauseAmbience();notify();},
    dispose(){if(disposed)return;disposed=true;playEpoch++;cancelStop();clearTimeout(rampTimer);media.pause();
      for(const event of events)media.removeEventListener(event,notify);
      media.removeEventListener('error',errorEvent);
      for(const bed of beds){bed.epoch++;clearTimeout(bed.stopTimer);bed.media.pause();
        for(const event of events)bed.media.removeEventListener(event,notify);
        bed.media.removeEventListener('error',bed.errorEvent);bed.source?.disconnect();bed.gain?.disconnect();}
      source?.disconnect();gain?.disconnect();context?.close().catch(()=>{});}
  };
}

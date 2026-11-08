const DEFAULT_MANIFEST='./assets/voyage-v21/manifest.json';
const STOP_NAMES=['Rìa tây Nam Mỹ','Xuyên Nam Mỹ','Đại Tây Dương','Tây Phi','Trung và Đông Phi','Biển Ả Rập','Tiểu lục địa Ấn Độ','Vịnh Bengal và Andaman','Đông Nam Á','Chân trời phía đông'];
const clamp=p=>Math.max(0,Math.min(1,Number(p)||0));

export function canFinishVerifiedHold({holdFrom,duration,presentedMediaTime,activePlaybackSeconds,buffered}){
  return Number.isFinite(holdFrom)&&holdFrom>=4.8&&holdFrom<duration&&
    presentedMediaTime>=holdFrom&&activePlaybackSeconds>=duration&&
    buffered.some(([start,end])=>start<=holdFrom&&end>=duration);
}

export function validateFilmManifest(raw,manifestURL){
  if(raw?.version!==1||raw.fps!==30||raw.duration!==5||!Array.isArray(raw.legs)||raw.legs.length!==10)throw new Error('Film manifest must contain ten 5-second, 30-fps legs.');
  if(!Number.isInteger(raw.width)||!Number.isInteger(raw.height)||raw.width<1||raw.height<1||Math.abs(raw.width/raw.height-16/9)>.01)throw new Error('Film dimensions must be 16:9.');
  const resolve=value=>{
    if(typeof value!=='string'||!value.trim())throw new Error('A film asset URL is missing.');
    const url=new URL(value,manifestURL);
    if(!['http:','https:'].includes(url.protocol))throw new Error('Unsupported film URL protocol.');
    return url.href;
  };
  const initialStill=resolve(raw.initialStill);
  const legs=raw.legs.map((leg,i)=>{
    if(leg.id!==i+1||leg.duration!==5)throw new Error('Film leg IDs or durations are inconsistent.');
    if(leg.holdFrom!==undefined&&(!Number.isFinite(leg.holdFrom)||leg.holdFrom<4.8||leg.holdFrom>=leg.duration))throw new Error('A verified hold must begin at or after 4.8 seconds and before the clip end.');
    if(leg.transition!==undefined&&(!['opening','cut','continuous'].includes(leg.transition)||leg.transition==='opening'&&i!==0))throw new Error('Unsupported film transition.');
    if(leg.transition==='cut'&&!leg.startStill)throw new Error('A camera cut requires its own starting still.');
    return {...leg,src:resolve(leg.src),still:resolve(leg.still),...(leg.startStill!==undefined?{startStill:resolve(leg.startStill)}:{}),name:leg.name||STOP_NAMES[i]};
  });
  for(let i=0;i<legs.length;i++)if(legs[i].transition==='continuous'&&legs[i].startStill!==(i===0?initialStill:legs[i-1].still))throw new Error('A continuous leg must reuse its canonical previous endpoint still.');
  let outro;
  if(raw.outro!==undefined){
    const o=raw.outro;
    if(!o||o.duration!==8||![o.titleFrom,o.subtitleFrom,o.completeFrom].every(Number.isFinite)||o.titleFrom<0||o.titleFrom>=o.subtitleFrom||o.subtitleFrom>=o.completeFrom||o.completeFrom>=o.duration)throw new Error('The outro must be eight seconds with ordered title, subtitle and completion beats.');
    if(o.holdFrom!==undefined&&(!Number.isFinite(o.holdFrom)||o.holdFrom<7.8||o.holdFrom>=o.duration))throw new Error('A verified outro hold must begin at or after 7.8 seconds and before the clip end.');
    outro={...o,id:'outro',src:resolve(o.src),startStill:resolve(o.startStill),still:resolve(o.still)};
    if(outro.startStill!==legs[9].still)throw new Error('The outro must begin on the last canonical voyage endpoint.');
  }
  return {...raw,initialStill,legs,...(outro?{outro}: {})};
}

function assetError(message,availability){
  const error=new Error(message);error.filmAvailability=availability;return error;
}

export function validateExpectedFilm(manifest,expected){
  if(!expected)return manifest;
  if(manifest.stage!==expected.stage||manifest.width!==expected.width||manifest.height!==expected.height||manifest.provenance?.nativeSha256!==expected.nativeSha256)throw new Error('This film is not the approved V21 Full HD render.');
  return manifest;
}

async function loadManifest(manifestURL,expected){
  const availability={status:'checking',manifestURL,manifestValid:false,mediaReady:false,missing:[]};
  let response;
  try{response=await fetch(manifestURL,{cache:'no-store',signal:AbortSignal.timeout(8000)});}
  catch(error){throw assetError(`Film manifest unavailable: ${error.message}`,{...availability,status:'unavailable'});}
  if(!response.ok)throw assetError(`Film manifest HTTP ${response.status}`,{...availability,status:response.status===404?'absent':'unavailable'});
  let manifest;
  try{manifest=validateExpectedFilm(validateFilmManifest(await response.json(),manifestURL),expected);}
  catch(error){throw assetError(error.message,{...availability,status:'invalid'});}
  availability.manifestValid=true;
  const urls=[manifest.initialStill,...manifest.legs.flatMap(leg=>[leg.src,leg.still,...(leg.startStill?[leg.startStill]:[])]),...(manifest.outro?[manifest.outro.src,manifest.outro.startStill,manifest.outro.still]:[])];
  const pending=[...new Set(urls)];
  async function worker(){
    while(pending.length){
      const url=pending.shift();
      try{
        const asset=await fetch(url,{method:'HEAD',cache:'no-cache',signal:AbortSignal.timeout(10000)});
        const type=asset.headers.get('content-type')||'';
        if(!asset.ok||type.includes('text/html')||asset.headers.get('content-length')==='0')availability.missing.push(url);
      }catch{availability.missing.push(url);}
    }
  }
  await Promise.all([worker(),worker(),worker()]);
  if(availability.missing.length)throw assetError('Film manifest exists but some media are missing.',{...availability,status:'incomplete'});
  return {manifest,availability:{...availability,status:'ready',mediaReady:true,stage:typeof manifest.stage==='string'?manifest.stage:'film',readiness:'All media URLs passed HTTP preflight; each clip is decoded and duration-checked before playback.'}};
}

export async function createFilmWorld(canvas,{reduced=false,onError=()=>{},manifestURL=DEFAULT_MANIFEST,manifestURLs,expectedFilm}={}){
  // Select a complete film before mounting its player. The new manifest is
  // published only after all ten clips pass encoding checks; HTTP preflight
  // also prevents an interrupted copy from activating a partial journey.
  const candidates=(manifestURLs??[manifestURL]).map(url=>new URL(url,location.href).href);
  if(!candidates.length)throw new Error('At least one film manifest URL is required.');
  const attempts=[];let selected,lastError;
  for(const candidate of candidates){
    try{selected=await loadManifest(candidate,expectedFilm);break;}
    catch(error){lastError=error;attempts.push(error.filmAvailability??{status:'unavailable',manifestURL:candidate,error:error.message});}
  }
  if(!selected){
    lastError.filmAvailability={...lastError.filmAvailability,attempts};throw lastError;
  }
  const {manifest,availability}=selected;
  availability.preferredManifestURL=candidates[0];availability.previousAttempts=attempts;
  const root=document.createElement('div');root.className='voyage-film';root.tabIndex=0;root.setAttribute('role','img');root.setAttribute('aria-label','Tàu buồm di chuyển xuyên biển và lục địa trên bản đồ khoáng tím.');
  let still=document.createElement('img');still.className='voyage-film-still';still.alt='';still.decoding='async';
  const videos=Array.from({length:2},()=>{
    const v=document.createElement('video');v.className='voyage-film-video';v.muted=true;v.defaultMuted=true;v.playsInline=true;v.preload='auto';v.disablePictureInPicture=true;v.setAttribute('aria-hidden','true');v.tabIndex=-1;root.append(v);return v;
  });
  root.append(still);canvas.after(root);
  const imageCache=new Map(),decodedImages=new Map();
  let index=0,segment='leg',progress=0,active=false,paused=false,disposed=false,running=false,token=0,modeRequest=0,raf=0,video=null,mode=reduced?'still':'video',callbacks=null,lastTick=0,quality='auto',ended=false,endReason=null,errorText=null,currentDecoded=false,frames=0,presentedFrames=0,buffering=false,bufferCount=0;
  const currentClip=()=>segment==='outro'?manifest.outro:manifest.legs[index];
  let frameObserver=0,frameVideo=null,lastPresentedMediaTime=-1,activePlaybackSeconds=0,playbackTick=0,playbackStarted=false,tailGuardCompletions=0;
  function loadImage(url){
    if(!imageCache.has(url))imageCache.set(url,new Promise((resolve,reject)=>{
      const img=new Image();img.decoding='async';img.alt='';img.className='voyage-film-still';
      img.onload=async()=>{try{if(img.decode)await img.decode();decodedImages.set(url,img);resolve(img);}catch{reject(new Error(`Film still failed to decode: ${url}`));}};
      img.onerror=()=>reject(new Error(`Film still failed to load: ${url}`));img.src=url;
    }));
    return imageCache.get(url);
  }
  function displayStill(img){
    // Swap the already-decoded node, not a new src on the visible node.
    if(still!==img){still.replaceWith(img);still=img;}still.style.opacity='1';
  }
  async function showStill(url,epoch=token){
    const img=await loadImage(url);if(disposed||epoch!==token)return;
    displayStill(img);
  }
  function hideVideos(){for(const v of videos)v.style.opacity='0';}
  function halt(){cancelAnimationFrame(raf);raf=0;if(frameObserver&&frameVideo?.cancelVideoFrameCallback)frameVideo.cancelVideoFrameCallback(frameObserver);frameObserver=0;frameVideo=null;for(const v of videos)v.pause();lastTick=0;playbackTick=0;playbackStarted=false;}
  function observeFrames(v,epoch){
    if(!v.requestVideoFrameCallback)return;
    if(frameObserver&&frameVideo?.cancelVideoFrameCallback)frameVideo.cancelVideoFrameCallback(frameObserver);
    frameVideo=v;
    const frame=(now,metadata)=>{
      if(disposed||epoch!==token||v!==video||!running)return;
      lastPresentedMediaTime=metadata.mediaTime;
      frameObserver=v.requestVideoFrameCallback(frame);
    };
    frameObserver=v.requestVideoFrameCallback(frame);
  }
  // A new camera cut has its own first-frame poster. Older continuous films
  // omit startStill and retain their shared previous-endpoint behavior.
  function boundary(i){return manifest.legs[i].startStill??(i===0?manifest.initialStill:manifest.legs[i-1].still);}
  async function prepareVideo(v,leg,position){
    if(v.dataset.leg!==String(leg.id)){
      v.pause();v.dataset.leg=String(leg.id);v.src=leg.src;v.poster=leg.id==='outro'?leg.startStill:boundary(leg.id-1);v.load();
    }
    await new Promise((resolve,reject)=>{
      let timeout;
      const finish=error=>{clearTimeout(timeout);v.removeEventListener('loadeddata',ready);v.removeEventListener('error',failed);error?reject(error):resolve();};
      const ready=()=>{if(v.readyState>=2)finish();};
      const failed=()=>finish(new Error(`Film clip ${leg.id} failed to decode.`));
      if(v.error){failed();return;}if(v.readyState>=2){resolve();return;}
      v.addEventListener('loadeddata',ready);v.addEventListener('error',failed);timeout=setTimeout(()=>finish(new Error(`Film clip ${leg.id} did not load.`)),15000);
    });
    if(!Number.isFinite(v.duration)||Math.abs(v.duration-leg.duration)>1/manifest.fps+.02)throw new Error(`Film clip ${leg.id} has duration ${v.duration}; expected ${leg.duration}.`);
    const target=Math.min(position*leg.duration,Math.max(0,v.duration-1/manifest.fps));
    if(Math.abs(v.currentTime-target)>.01)await new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>done(new Error(`Film clip ${leg.id} could not seek.`)),5000);
      const done=error=>{clearTimeout(timeout);v.removeEventListener('seeked',seeked);v.removeEventListener('error',failed);error?reject(error):resolve();};
      const seeked=()=>done(),failed=()=>done(new Error(`Film clip ${leg.id} seek failed.`));
      v.addEventListener('seeked',seeked,{once:true});v.addEventListener('error',failed,{once:true});v.currentTime=target;
    });
  }
  function warmNext(){
    if(segment==='outro')return;
    const next=manifest.legs[index+1]??manifest.outro;if(!next)return;
    const start=next.id==='outro'?next.startStill:boundary(index+1);
    loadImage(next.still).catch(()=>{});loadImage(start).catch(()=>{});
    const spare=videos.find(v=>v!==video);
    if(spare&&spare.dataset.leg!==String(next.id)){spare.dataset.leg=String(next.id);spare.src=next.src;spare.poster=start;spare.load();}
  }
  function reportError(error){errorText=error.message;availability.status='playback-degraded';availability.mediaReady=false;onError(error);}
  function finish(epoch,reason='video-ended'){
    if(disposed||epoch!==token||!running)return;
    running=false;ended=true;endReason=reason;if(reason==='verified-hold-tail')tailGuardCompletions++;progress=1;halt();
    const done=callbacks;callbacks=null;
    // The endpoint was predecoded before travel, so the next paint is a clean hold.
    if(decodedImages.has(currentClip().still))displayStill(decodedImages.get(currentClip().still));
    done?.onProgress?.(1);done?.onComplete?.();
  }
  function tick(now){
    if(disposed||!running)return;
    const epoch=token;frames++;
    if(active&&!paused){
      if(mode==='still'){
        if(lastTick)progress=clamp(progress+(now-lastTick)/1000/currentClip().duration);
      }else if(mode==='video'&&video){
        progress=clamp(video.currentTime/currentClip().duration);
        buffering=video.readyState<3&&!video.ended;
        if(video.getVideoPlaybackQuality)presentedFrames=video.getVideoPlaybackQuality().totalVideoFrames;
        if(playbackStarted&&!video.paused){if(playbackTick)activePlaybackSeconds+=(now-playbackTick)/1000;playbackTick=now;}else playbackTick=0;
      }
      callbacks?.onProgress?.(progress);
      if(progress>=1||mode==='video'&&video?.ended){finish(epoch,mode==='still'?'reduced-motion-timer':video?.ended?'video-ended':'video-time-complete');return;}
      if(mode==='video'&&video&&canFinishVerifiedHold({holdFrom:currentClip().holdFrom,duration:currentClip().duration,presentedMediaTime:lastPresentedMediaTime,activePlaybackSeconds,buffered:Array.from({length:video.buffered.length},(_,i)=>[video.buffered.start(i),video.buffered.end(i)])})){
        finish(epoch,'verified-hold-tail');return;
      }
      lastTick=now;
    }else{lastTick=0;playbackTick=0;}
    raf=requestAnimationFrame(tick);
  }
  async function revealVideo(v,epoch){
    await new Promise(resolve=>{
      let done=false;
      const finish=()=>{if(done)return;done=true;clearTimeout(timeout);resolve();};
      const timeout=setTimeout(finish,200);
      if(v.requestVideoFrameCallback)v.requestVideoFrameCallback(finish);else requestAnimationFrame(()=>requestAnimationFrame(finish));
    });
    if(disposed||epoch!==token||video!==v||mode!=='video')return;
    currentDecoded=true;hideVideos();v.style.opacity='1';still.style.opacity='0';
  }
  function sync(){
    if(disposed)return;
    if(!running||!active||paused||mode!=='video'){video?.pause();lastTick=0;playbackTick=0;return;}
    if(video?.readyState>=2&&video.paused&&!video.ended){
      const epoch=token,v=video;
      v.play().then(()=>{if(epoch!==token||disposed||mode!=='video'||reduced)return;playbackStarted=true;playbackTick=performance.now();revealVideo(v,epoch);}).catch(error=>{
        if(epoch!==token||disposed||paused||!active||mode!=='video'||reduced||error.name==='AbortError')return;
        reportError(error);mode='still';lastTick=0;video.pause();if(segment==='outro')finish(epoch,'outro-media-fallback');
      });
    }
  }
  function setSegment(kind,i,p){
    const sameCompleted=ended&&segment===kind&&progress===1&&Math.max(0,Math.min(9,i))===index&&clamp(p)===1;
    token++;modeRequest++;running=false;callbacks=null;halt();segment=kind;index=Math.max(0,Math.min(9,i));progress=clamp(p);ended=progress===1;currentDecoded=false;
    const clip=currentClip();
    if(!sameCompleted){endReason=ended?'held-state':null;lastPresentedMediaTime=-1;activePlaybackSeconds=progress*clip.duration;}
    const epoch=token;
    const shown=showStill(progress>=1?clip.still:segment==='outro'?clip.startStill:boundary(index),epoch).catch(error=>{if(epoch===token&&!disposed)reportError(error);});
    loadImage(clip.still).catch(()=>{});return shown;
  }
  const setLeg=(i,p)=>setSegment('leg',i,p);
  const setOutro=p=>manifest.outro?setSegment('outro',9,p):Promise.resolve();
  async function prepareLeg(i,p=0){await setLeg(i,p);const epoch=token,leg=currentClip();if(!reduced){const v=videos.find(v=>v.dataset.leg===String(leg.id))||videos[index%2];try{await prepareVideo(v,leg,progress);}catch(error){if(epoch===token&&!disposed)reportError(error);}}}
  async function playSegment(kind,i,p,handlers={}){
    if(kind==='outro'&&!manifest.outro){handlers.onComplete?.();return;}
    setSegment(kind,i,p);const epoch=token;callbacks=handlers;ended=false;errorText=null;mode=reduced?'still':'video';
    try{
      const leg=currentClip();
      await Promise.all([loadImage(segment==='outro'?leg.startStill:boundary(index)),loadImage(leg.still)]);
      if(disposed||epoch!==token)return;
      if(mode==='video'){
        video=videos.find(v=>v.dataset.leg===String(leg.id))||videos[index%2];
        await prepareVideo(video,leg,progress);
        if(disposed||epoch!==token)return;
        currentDecoded=true;
        // A restored manual pause must show the sought decoded frame. Waiting
        // for play() here would keep the opening poster visible until resume.
        if(progress>0)await revealVideo(video,epoch);
      }
    }catch(error){
      if(epoch!==token||disposed)return;
      reportError(error);mode='still';video?.pause();
    }
    if(epoch!==token||disposed)return;
    running=true;lastTick=0;
    if(segment==='outro'&&mode==='still'){finish(epoch,reduced?'reduced-motion-outro':'outro-media-fallback');return;}
    if(mode==='video')observeFrames(video,epoch);raf=requestAnimationFrame(tick);sync();warmNext();
  }
  for(const v of videos){
    v.addEventListener('ended',()=>{if(v===video&&mode==='video')finish(token,'video-ended');});
    v.addEventListener('waiting',()=>{if(v===video){buffering=true;bufferCount++;}});
    v.addEventListener('playing',()=>{if(v===video)buffering=false;});
    v.addEventListener('error',()=>{
      if(v!==video||!running||mode!=='video')return;
      reportError(new Error(`Film clip ${segment==='outro'?'outro':index+1} playback failed.`));mode='still';v.pause();lastTick=0;if(segment==='outro')finish(token,'outro-media-fallback');
    });
  }
  try{await showStill(manifest.initialStill);await loadImage(manifest.legs[0].still);}
  catch(error){root.remove();throw assetError(error.message,{...availability,status:'decode-failed',mediaReady:false});}
  canvas.hidden=true;
  return {
    cameraAuthored:true,isFilm:true,availability,
    setLeg,prepareLeg,playLeg:(i,p,handlers)=>playSegment('leg',i,p,handlers),
    hasOutro:!!manifest.outro,outroTiming:manifest.outro?Object.freeze({duration:manifest.outro.duration,titleFrom:manifest.outro.titleFrom,subtitleFrom:manifest.outro.subtitleFrom,completeFrom:manifest.outro.completeFrom}):null,
    setOutro,playOutro:(p,handlers)=>playSegment('outro',9,p,handlers),
    setActive(value){active=value;sync();},setPaused(value){paused=value;sync();},setQuality(value){quality=value;},
    setReduced(value){
      if(reduced===value)return;reduced=value;lastTick=0;playbackTick=0;const request=++modeRequest;
      if(!running){mode=reduced?'still':'video';return;}
      if(reduced){mode='still';video?.pause();if(segment==='outro'){finish(token,'reduced-motion-outro');return;}}
      else{
        mode='loading';const epoch=token,leg=currentClip();activePlaybackSeconds=progress*leg.duration;playbackStarted=false;video=videos.find(v=>v.dataset.leg===String(leg.id))||videos[index%2];
        prepareVideo(video,leg,progress).then(async()=>{if(epoch!==token||disposed||request!==modeRequest||reduced)return;mode='video';if(progress>0)await revealVideo(video,epoch);if(epoch!==token||disposed||request!==modeRequest||reduced)return;observeFrames(video,epoch);sync();}).catch(error=>{if(epoch!==token||disposed||request!==modeRequest)return;reportError(error);mode='still';});
      }
    },
    focus(){root.focus({preventScroll:true});},
    getStopName:i=>manifest.legs[i]?.name||STOP_NAMES[i],
    getState:()=>({renderer:'blender-cinematic-film',stage:availability.stage,segment,index,progress,seconds:currentClip().duration,fps:manifest.fps,resolution:[manifest.width,manifest.height],currentTime:video?.currentTime??null,ended,endReason,videoEnded:video?.ended??false,videoPaused:video?.paused??true,holdFrom:currentClip().holdFrom??null,lastPresentedMediaTime,activePlaybackSeconds,active,paused,running,mode,reduced,buffering,currentDecoded,error:errorText,availability:{...availability}}),
    getMetrics:()=>({renderer:'video',frames,presentedFrames,bufferCount,tailGuardCompletions,readyState:video?.readyState??0,networkState:video?.networkState??0,droppedFrames:video?.getVideoPlaybackQuality?.().droppedVideoFrames??null,quality,mediaReady:availability.mediaReady}),
    dispose(){if(disposed)return;disposed=true;token++;running=false;callbacks=null;halt();for(const v of videos){v.removeAttribute('src');v.load();}root.remove();imageCache.clear();decodedImages.clear();}
  };
}

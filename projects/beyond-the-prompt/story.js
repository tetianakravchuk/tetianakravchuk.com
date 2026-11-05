// Progressive enhancement: show a native video only after the optional asset is deployed.
// The static text story remains usable without the MP4.
(async()=>{
 const container=document.getElementById('video-container');if(!container)return;
 const src=container.dataset.videoSrc;
 try{
  const response=await fetch(src,{method:'HEAD',cache:'no-store'});
  if(!response.ok||!(response.headers.get('content-type')||'').includes('video/'))return;
  const video=document.createElement('video');
  video.controls=true;video.preload='metadata';video.playsInline=true;
  video.setAttribute('aria-label','Beyond the Prompt: AI engineering and reliability short film');
  const source=document.createElement('source');source.src=src;source.type='video/mp4';
  video.append(source);video.addEventListener('error',()=>{video.remove();container.querySelector('.story-fallback').hidden=false;});
  container.querySelector('.story-fallback').hidden=true;container.append(video);
 }catch(_){/* Leave accessible text fallback visible. */}
})();
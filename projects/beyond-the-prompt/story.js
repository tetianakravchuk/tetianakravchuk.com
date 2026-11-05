// Native, accessible, progressive video enhancement.
// A missing or invalid MP4 never prevents readers from using the case study.
(()=>{
 const container=document.getElementById('video-container');
 if(!container)return;
 const fallback=container.querySelector('#video-fallback');
 const src=container.dataset.videoSrc;
 if(!src||!fallback)return;
 const video=document.createElement('video');
 video.controls=true;
 video.preload='metadata';
 video.playsInline=true;
 video.setAttribute('aria-label','Beyond the Prompt — short cinematic explanation of AI reliability');
 video.setAttribute('aria-describedby','video-description');
 const source=document.createElement('source');
 source.src=src;source.type='video/mp4';
 video.append(source);
 let ready=false;
 video.addEventListener('loadedmetadata',()=>{
  if(ready)return;
  ready=true;
  fallback.hidden=true;
  video.hidden=false;
 });
 const restore=()=>{
  video.hidden=true;
  fallback.hidden=false;
 };
 video.addEventListener('error',restore);
 source.addEventListener('error',restore);
 video.hidden=true;
 container.append(video);
 // Loading metadata is browser-managed: no HEAD dependency, external player, or autoplay.
})();
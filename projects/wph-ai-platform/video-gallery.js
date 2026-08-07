document.addEventListener('DOMContentLoaded', () => {
  const embeds = document.querySelectorAll('[data-wph-video]');

  embeds.forEach((embed) => {
    const play = embed.querySelector('[data-wph-video-play]');
    if (!play) return;

    play.addEventListener('click', () => {
      const id = embed.dataset.wphVideo;
      if (!id) return;

      const iframe = document.createElement('iframe');
      iframe.className = 'video-frame';
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
      iframe.title = play.getAttribute('aria-label') || 'World Publishing Houses video';
      iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

      embed.replaceChildren(iframe);

      try {
        if (window.goatcounter && typeof window.goatcounter.count === 'function') {
          window.goatcounter.count({
            path: `wph-video-${id}`,
            title: iframe.title,
            event: true
          });
        }
      } catch (_) {
        // Analytics must never block playback.
      }
    }, { once: true });
  });
});

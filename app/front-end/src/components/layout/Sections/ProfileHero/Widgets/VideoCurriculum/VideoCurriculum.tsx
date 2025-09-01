import React, { useEffect, useRef, useState } from 'react';
import type { UserProfile } from '@/types/api';
import styles from './videoCurriculum.module.css';

interface Props {
  userProfile: UserProfile | null;
}

function toYouTubeEmbed(url: string) {
  try {
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1].split(/[?&]/)[0];
      return {
        id,
        src: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&enablejsapi=1`,
      };
    }
    if (url.includes('youtube.com/watch')) {
      const params = new URL(url).searchParams;
      const id = params.get('v');
      if (id)
        return {
          id,
          src: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&enablejsapi=1`,
        };
    }
  } catch (e) {
    // fallthrough
  }
  return null;
}

// Load YouTube IFrame API if not already present
function loadYouTubeAPI(): Promise<void> {
  return new Promise(resolve => {
    if ((window as any).YT && (window as any).YT.Player) return resolve();
    const existing = document.getElementById('youtube-iframe-api');
    if (existing) {
      // wait for API to be ready
      const check = setInterval(() => {
        if ((window as any).YT && (window as any).YT.Player) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      return;
    }

    const tag = document.createElement('script');
    tag.id = 'youtube-iframe-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);

    // The API will call window.onYouTubeIframeAPIReady when ready
    (window as any).onYouTubeIframeAPIReady = () => {
      resolve();
    };
  });
}

const VideoCurriculum: React.FC<Props> = ({ userProfile }) => {
  const fallback = 'https://www.youtube.com/watch?v=xe0-arQ2MBE';
  const rawUrl = (userProfile as any)?.video_url || fallback;
  const embed = toYouTubeEmbed(rawUrl);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(rawUrl);
      } else {
        const ta = document.createElement('textarea');
        ta.value = rawUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // ignore copy errors
    }
  }

  useEffect(() => {
    // only initialize player when we have an embed and the iframe is requested (user clicked play)
    if (!embed || !showIframe) return;

    let mounted = true;

    (async () => {
      await loadYouTubeAPI();
      if (!mounted) return;

      // mark ready to initialize player and let YT.Player create the iframe element
      setInitialized(true);

      // create player if not exists
      if (!playerRef.current) {
        playerRef.current = new (window as any).YT.Player(`yt-player-${embed.id}`, {
          videoId: embed.id,
          // Reduce YouTube UI: hide annotations, minimize branding, prevent unrelated suggestions where possible
          playerVars: {
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3, // hide annotations
            playsinline: 1,
            controls: 1,
          },
          // Use privacy-enhanced host so YouTube uses youtube-nocookie.com when possible
          host: 'https://www.youtube-nocookie.com',
          events: {
            onReady: () => {
              // Poll current time periodically
              intervalRef.current = window.setInterval(() => {
                try {
                  const player = playerRef.current;
                  if (!player || typeof player.getCurrentTime !== 'function') return;
                  const t = player.getCurrentTime();
                  // Animate the widget container as before and also paint the header red
                  // between 2:18 (138s) and 2:22 (142s)
                  const shouldAnimate = t >= 138 && t < 142;

                  if (containerRef.current) {
                    containerRef.current.classList.toggle(styles.animate, shouldAnimate);
                  }

                  // Header element has id="home" in ProfileHero — toggle inline background color
                  try {
                    const headerEl = document.getElementById('home');
                    if (headerEl) {
                      if (shouldAnimate) {
                        headerEl.classList.add('vc-header-red');
                      } else {
                        headerEl.classList.remove('vc-header-red');
                      }
                    }
                  } catch (e) {
                    // ignore DOM errors
                  }
                } catch (e) {
                  // ignore
                }
              }, 250);
            },
            onStateChange: (ev: any) => {
              // if video ended or paused, remove animation class
              const state = ev.data;
              try {
                if (state === (window as any).YT.PlayerState.ENDED) {
                  // destroy player and show poster again to avoid YouTube end-screen suggestions
                  const player = playerRef.current;
                  try {
                    if (player && typeof player.destroy === 'function') player.destroy();
                  } catch (e) {
                    /* ignore */
                  }
                  playerRef.current = null;
                  setInitialized(false);
                  setShowIframe(false);
                  if (containerRef.current) containerRef.current.classList.remove(styles.animate);
                } else if (state === (window as any).YT.PlayerState.PAUSED) {
                  if (containerRef.current) containerRef.current.classList.remove(styles.animate);
                }
              } catch (e) {
                // swallow any runtime errors from player interaction
              }
            },
          },
        });
      }
    })();

    return () => {
      mounted = false;
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current as any);
        intervalRef.current = null;
      }
      // destroy player to free resources
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // ignore destroy errors
        }
        playerRef.current = null;
      }
      // ensure header class removed on unmount
      try {
        const headerEl = document.getElementById('home');
        if (headerEl) headerEl.classList.remove('vc-header-red');
      } catch (e) {
        /* noop */
      }
      setInitialized(false);
    };
  }, [embed]);

  return (
    <div
      className={styles.videoWidget}
      role="region"
      aria-label="Videocurrículum"
      ref={containerRef}
    >
      {embed ? (
        <div className={styles.embedWrapper}>
          <div className={styles.animatedOverlay} aria-hidden="true">
            ★
          </div>
          <div className={styles.embedContainer}>
            {/* placeholder div: YT.Player will create the real iframe here once initialized */}
            {showIframe ? (
              initialized ? (
                <div id={`yt-player-${embed.id}`} className={styles.embed} />
              ) : (
                <div className={styles.embedPlaceholder} aria-hidden="true">
                  <div
                    className={styles.videoSkeleton}
                    role="status"
                    aria-live="polite"
                    aria-busy="true"
                  >
                    <div className={styles.skeletonBar} />
                    <div className={styles.skeletonThumb} />
                    <div className={styles.skeletonLines}>
                      <div className={styles.line} style={{ width: '80%' }} />
                      <div className={styles.line} style={{ width: '60%' }} />
                      <div className={styles.line} style={{ width: '40%' }} />
                    </div>
                  </div>
                </div>
              )
            ) : (
              // show clickable poster to avoid YouTube end-screen suggestions when finished
              <div className={styles.posterWrap}>
                <button
                  type="button"
                  className={styles.posterButton}
                  aria-label="Reproducir videocurrículum"
                  onClick={() => setShowIframe(true)}
                >
                  <img
                    src={
                      (userProfile as any)?.video_poster ||
                      (embed ? `https://i.ytimg.com/vi/${embed.id}/hqdefault.jpg` : '')
                    }
                    alt="Videocurrículum"
                    className={styles.posterImage}
                  />
                  <div className={styles.playIcon} aria-hidden="true">
                    ▶
                  </div>
                </button>

                {/* top-right: copy link */}
                <button
                  type="button"
                  className={styles.copyButton}
                  title="Copiar enlace"
                  onClick={e => {
                    e.stopPropagation();
                    copyLink();
                  }}
                >
                  {copied ? 'Copiado' : '🔗'}
                </button>

                {/* bottom-left: open in YouTube */}
                <a
                  href={rawUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.youtubeBadge}
                  onClick={e => e.stopPropagation()}
                >
                  <span className={styles.youtubeBadgeIcon} aria-hidden="true">
                    ▶
                  </span>
                  <span className={styles.youtubeBadgeText}>Ver en YouTube</span>
                </a>
              </div>
            )}
          </div>
        </div>
      ) : rawUrl && rawUrl.endsWith('.mp4') ? (
        <video className={styles.video} controls poster={(userProfile as any)?.video_poster || ''}>
          <source src={rawUrl} type="video/mp4" />
          Tu navegador no soporta reproducción de vídeo.
        </video>
      ) : (
        <div className={styles.emptyPlaceholder}>
          <div className={styles.icon} aria-hidden="true">
            🎬
          </div>
          <div>No hay videocurrículum disponible.</div>
        </div>
      )}
    </div>
  );
};

export default VideoCurriculum;

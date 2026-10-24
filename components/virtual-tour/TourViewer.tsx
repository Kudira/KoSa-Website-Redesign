'use client';

import { useEffect, useRef, useState } from 'react';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { Loader2, Maximize2 } from 'lucide-react';
import { BrandLoader } from '@/components/shared/BrandLoader';
import { useT } from '@/lib/i18n';

export interface Scene {
  sceneId: string;
  sceneName: string;
  imageUrl: string;
  thumbnailUrl: string;
}

interface Props {
  scenes: Scene[];
}

function supportsWebGL() {
  if (typeof window === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function TourViewer({ scenes }: Props) {
  const { t } = useT();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<unknown>(null);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    setWebgl(supportsWebGL());
  }, []);

  useEffect(() => {
    if (!webgl || !containerRef.current || !scenes[active]) return;
    let cancelled = false;
    const container = containerRef.current;
    setLoading(true);

    // Safely destroy a Photo Sphere Viewer instance. PSV calls removeChild()
    // internally; in dev (StrictMode/HMR) React may already have detached the
    // node, throwing NotFoundError. Swallow it the GC will reclaim the rest.
    const safeDestroy = (instance: unknown) => {
      const v = instance as { destroy?: () => void } | null;
      if (!v?.destroy) return;
      try {
        v.destroy();
      } catch {
        /* node already removed by React ignore */
      }
    };

    (async () => {
      const { Viewer } = await import('@photo-sphere-viewer/core');
      await import('@photo-sphere-viewer/core/index.css' as string).catch(() => {});
      if (cancelled || !containerRef.current) return;

      // Destroy previous instance + clear container so PSV starts clean.
      // Use innerHTML='' (cannot throw) instead of removeChild loop (can throw
      // if PSV reparented nodes during teardown).
      safeDestroy(viewerRef.current);
      viewerRef.current = null;
      try {
        container.innerHTML = '';
      } catch {
        /* ignore */
      }

      let v: { addEventListener: (e: string, fn: () => void) => void; destroy?: () => void };
      try {
        v = new Viewer({
          container,
          panorama: scenes[active].imageUrl,
          navbar: ['zoom', 'fullscreen'],
          defaultZoomLvl: 30,
          loadingImg: undefined,
        }) as typeof v;
      } catch (err) {
        // PSV constructor can throw NotFoundError in dev StrictMode if a stale
        // DOM ref was held. Bail silently the next render cycle will retry.
        console.warn('[TourViewer] PSV init failed (likely StrictMode double-invoke):', err);
        return;
      }
      viewerRef.current = v;
      v.addEventListener('ready', () => {
        if (!cancelled) setLoading(false);
      });
    })();

    return () => {
      cancelled = true;
      safeDestroy(viewerRef.current);
      viewerRef.current = null;
    };
  }, [active, scenes, webgl]);

  if (!scenes.length) {
    return (
      <div className="aspect-[16/9] grid place-items-center bg-sand-light rounded-pebble text-forest/70">
        {t('tour.loadingTour')}
      </div>
    );
  }

  if (!webgl) {
    return (
      <div className="space-y-6">
        <div className="branded-img relative aspect-[16/9] w-full rounded-pebble overflow-hidden">
          <Image src={scenes[active].imageUrl} alt={scenes[active].sceneName} fill sizes="100vw" className="object-cover" />
        </div>
        <SceneStrip scenes={scenes} active={active} onSelect={setActive} />
        <p className="text-center text-xs text-forest/60">{t('tour.noWebgl')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <div
          ref={containerRef}
          className="aspect-[16/9] w-full rounded-pebble overflow-hidden bg-umber"
          style={{ minHeight: 320 }}
        />
        {loading && (
          <div className="absolute inset-0 grid place-items-center bg-umber/80 backdrop-blur-sm rounded-pebble text-cream pointer-events-none">
            <div className="flex flex-col items-center gap-4">
              <BrandLoader size={72} />
              <p className="font-sans text-xs flex items-center gap-2 text-cream">
                <Loader2 size={14} className="animate-spin" /> {t('tour.loading')} {scenes[active].sceneName}…
              </p>
            </div>
          </div>
        )}
        <button
          aria-label={t('tour.fullscreen')}
          onClick={() => {
            const el = containerRef.current?.querySelector('canvas')?.parentElement;
            el?.requestFullscreen?.();
          }}
          className="absolute top-3 right-3 z-10 grid place-items-center h-9 w-9 rounded-full bg-umber/70 text-cream hover:bg-primary hover:text-forest"
        >
          <Maximize2 size={16} />
        </button>
      </div>
      <SceneStrip scenes={scenes} active={active} onSelect={setActive} />
    </div>
  );
}

function SceneStrip({ scenes, active, onSelect }: { scenes: Scene[]; active: number; onSelect: (i: number) => void }) {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
      {scenes.map((s, i) => (
        <button
          key={s.sceneId}
          onClick={() => onSelect(i)}
          className={`relative flex-shrink-0 w-32 h-20 rounded-pebble overflow-hidden transition-all branded-img ${
            i === active ? 'ring-2 ring-primary' : 'ring-1 ring-umber/20 opacity-70 hover:opacity-100'
          }`}
        >
          <Image src={s.thumbnailUrl} alt={s.sceneName} fill sizes="128px" className="object-cover" />
          <span className="absolute bottom-0 inset-x-0 bg-umber/70 text-cream text-sm font-sans py-1 text-center">
            {s.sceneName}
          </span>
        </button>
      ))}
    </div>
  );
}

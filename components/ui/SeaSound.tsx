'use client';

// "Hear the sea". A soft ocean generated live in the browser: brown noise
// through a low-pass filter whose cutoff and volume swell on a slow, uneven
// rhythm, like waves arriving and drawing back. No audio file, nothing to
// download, and it never plays until the visitor asks for it.

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';

type Engine = { ctx: AudioContext; master: GainNode; stop: () => void };

function createSea(): Engine {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();

  // 6 seconds of brown noise, looped.
  const len = ctx.sampleRate * 6;
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 500;
  filter.Q.value = 0.6;

  const swell = ctx.createGain();
  swell.gain.value = 0.35;

  const master = ctx.createGain();
  master.gain.value = 0;

  src.connect(filter).connect(swell).connect(master).connect(ctx.destination);
  src.start();

  // Schedule waves: each one rises over ~3s and falls over ~5s, with jitter.
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout>;
  const wave = () => {
    if (cancelled) return;
    const now = ctx.currentTime;
    const rise = 2.4 + Math.random() * 1.6;
    const fall = 4 + Math.random() * 2.5;
    const peak = 0.55 + Math.random() * 0.4;
    swell.gain.cancelScheduledValues(now);
    swell.gain.setValueAtTime(swell.gain.value, now);
    swell.gain.linearRampToValueAtTime(peak, now + rise);
    swell.gain.linearRampToValueAtTime(0.18 + Math.random() * 0.1, now + rise + fall);
    filter.frequency.cancelScheduledValues(now);
    filter.frequency.setValueAtTime(filter.frequency.value, now);
    filter.frequency.linearRampToValueAtTime(900 + Math.random() * 600, now + rise);
    filter.frequency.linearRampToValueAtTime(360, now + rise + fall);
    timer = setTimeout(wave, (rise + fall - 0.8) * 1000);
  };
  wave();

  return {
    ctx,
    master,
    stop: () => {
      cancelled = true;
      clearTimeout(timer);
      try {
        src.stop();
      } catch {
        /* already stopped */
      }
      ctx.close();
    },
  };
}

export function SeaSound({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  const [on, setOn] = useState(false);
  const engine = useRef<Engine | null>(null);
  const { t } = useT();

  const toggle = () => {
    if (!on) {
      if (!engine.current) engine.current = createSea();
      const { ctx, master } = engine.current;
      ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2.5);
      setOn(true);
    } else if (engine.current) {
      const { ctx, master } = engine.current;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
      setOn(false);
    }
  };

  useEffect(() => () => engine.current?.stop(), []);

  const label = on ? t('sea.off') : t('sea.on');

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={label}
      title={label}
      className={cn(
        'group inline-flex items-center justify-center gap-2 xl:gap-2.5 rounded-full h-11 min-w-11 px-3 xl:pl-3 xl:pr-4 text-sm font-medium transition-colors duration-500',
        tone === 'dark' ? 'text-cream hover:bg-cream/10 ring-cream/40' : 'text-forest hover:bg-forest/5 ring-forest/25',
        // On phones and tablets the label is hidden, so the control gets a
        // visible outline and a speaker icon to read clearly as "sound".
        'ring-1 ring-inset xl:ring-0',
        className,
      )}
    >
      <span className="xl:hidden" aria-hidden>{on ? <Volume2 size={16} /> : <VolumeX size={16} />}</span>
      <span className="flex items-end gap-[3px] h-4" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn('w-[3px] rounded-full bg-current origin-bottom transition-all duration-700', on ? 'motion-safe:animate-breathe' : '')}
            style={{ height: on ? `${[9, 15, 11, 7][i]}px` : '3px', animationDelay: `${i * 0.6}s` }}
          />
        ))}
      </span>
      <span className="hidden xl:inline">{on ? t('sea.playing') : t('sea.on')}</span>
    </button>
  );
}

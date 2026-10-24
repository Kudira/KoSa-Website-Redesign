'use client';

// First-visit arrival: one breath. The logo sits on the sea, a wave rolls
// under it, and the water draws back to reveal the page. Shown once per
// browser session, and skipped entirely for reduced-motion visitors.

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const KEY = 'kosa_arrived';

export function Preloader() {
  const pathname = usePathname();
  const [show, setShow] = useState(true);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === '1';
      sessionStorage.setItem(KEY, '1');
    } catch {
      /* storage blocked: just play it */
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (seen || reduce || pathname?.startsWith('/admin')) {
      setShow(false);
      return;
    }
    const start = Date.now();
    const finish = () => setTimeout(() => setShow(false), Math.max(0, 1500 - (Date.now() - start)));
    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });
    const safety = setTimeout(() => setShow(false), 3500);
    return () => {
      window.removeEventListener('load', finish);
      clearTimeout(safety);
    };
  }, [pathname]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="arrival"
          aria-hidden
          style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: '#007C9D' }}
          initial={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] } }}
          className="flex flex-col items-center justify-center"
        >
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
            <Image src="/logo-cream.png" alt="" width={260} height={96} priority style={{ width: 260, height: 'auto' }} />
          </motion.div>
          <svg width="220" height="28" viewBox="0 0 220 28" className="mt-8" aria-hidden>
            <motion.path
              d="M4 20 C 22 20 26 6 46 6 S 70 20 88 20 112 6 132 6 156 20 174 20 198 6 216 6"
              fill="none"
              stroke="#EEDDC2"
              strokeWidth="6"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.3, ease: [0.45, 0, 0.55, 1] }}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

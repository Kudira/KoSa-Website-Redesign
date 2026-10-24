'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { site } from '@/lib/site';

/**
 * Aliviomind-style floating WhatsApp button. Fixed bottom-left so it doesn't
 * collide with the Abena chat widget (bottom-right). Opens wa.me/<number> in a
 * new tab with a polite default message. Hidden on /admin/*.
 */
export function FloatingWhatsApp() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Reveal after a short delay so it doesn't compete with the hero
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  // Pre-filled message per Website Content Brief §02.
  const message = encodeURIComponent(site.contact.whatsappMessage);
  const href = `https://wa.me/${site.contact.whatsapp}?text=${message}`;

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          key="wa"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chat with us on WhatsApp at ${site.contact.phone}`}
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="fixed bottom-5 left-5 md:bottom-6 md:left-6 z-40 grid place-items-center h-14 w-14 rounded-full bg-forest text-cream ring-1 ring-cream/20 shadow-[0_18px_40px_-16px_rgba(20,37,25,0.55)] hover:bg-[#25D366] transition-colors duration-500"
        >
          {/* Pulsing halo */}
          <span
            aria-hidden
            className="hidden"
            style={{ animationDuration: '2.4s' }}
          />
          <svg
            viewBox="0 0 32 32"
            width={60}
            height={60}
            fill="currentColor"
            className="relative"
            aria-hidden
          >
            <path d="M19.11 17.31c-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.13-.18.27-.7.88-.86 1.06-.16.18-.31.2-.58.07-.27-.13-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.41.12-.54.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47l-.52-.01c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.27 0 1.34.97 2.63 1.11 2.81.13.18 1.92 2.93 4.65 4.11.65.28 1.16.45 1.55.58.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.31zM16.03 5.34c-5.95 0-10.79 4.84-10.79 10.79 0 1.9.5 3.76 1.45 5.4l-1.54 5.62 5.76-1.51c1.59.87 3.39 1.33 5.12 1.33 5.95 0 10.79-4.84 10.79-10.79 0-2.88-1.12-5.59-3.16-7.63a10.7 10.7 0 0 0-7.63-3.21zm0 19.78c-1.55 0-3.07-.42-4.4-1.21l-.31-.18-3.27.86.87-3.18-.21-.33a8.96 8.96 0 0 1-1.38-4.79c0-4.95 4.03-8.98 8.98-8.98 2.4 0 4.65.93 6.34 2.63a8.92 8.92 0 0 1 2.63 6.35c0 4.94-4.03 8.97-8.98 8.97z" />
          </svg>
        </motion.a>
      )}
    </AnimatePresence>
  );
}

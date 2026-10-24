'use client';

// Book / Enquire button for a specific service. On click it records a
// ServiceEnquiry (fire-and-forget) so the team sees demand in the admin
// dashboard, then hands the visitor to WhatsApp with the service pre-filled.
//
// It renders a real <a target="_blank">, so WhatsApp always opens (never
// popup-blocked) and recording happens in the background via sendBeacon
// (falls back to fetch keepalive). Room booking + the navbar Book CTA do NOT
// use this - they go to the Cloudbeds engine.

import type { ReactNode } from 'react';
import { waLink } from '@/lib/pricing';

export type ServiceEnquiryType =
  | 'TREATMENT' | 'ENHANCEMENT' | 'PACKAGE' | 'EVENT'
  | 'DINING' | 'EXPERIENCE' | 'TRANSFER' | 'OTHER';

interface BookButtonProps {
  category: ServiceEnquiryType;
  itemName: string;
  /** WhatsApp message text (also stored on the record). */
  message: string;
  /** Page/context the click came from, for the admin record. */
  source?: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}

function recordEnquiry(payload: {
  category: string;
  itemName: string;
  message: string;
  source?: string;
}) {
  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      // sendBeacon survives the page/tab change to WhatsApp.
      const blob = new Blob([body], { type: 'application/json' });
      const queued = navigator.sendBeacon('/api/enquiry', blob);
      if (queued) return;
    }
    // Fallback: keepalive fetch so the request still completes on navigation.
    void fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* never block the WhatsApp hand-off */
  }
}

export function BookButton({
  category,
  itemName,
  message,
  source,
  className,
  children,
  ariaLabel,
}: BookButtonProps) {
  return (
    <a
      href={waLink(message)}
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel}
      className={className}
      onClick={() => recordEnquiry({ category, itemName, message, source })}
    >
      {children}
    </a>
  );
}

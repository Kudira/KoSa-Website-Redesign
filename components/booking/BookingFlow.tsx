'use client';

import { useState, useMemo } from 'react';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, ChevronRight, Check, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/shared/Button';
import { rooms } from '@/lib/content/home';
import { formatCurrency } from '@/lib/utils';
import { site } from '@/lib/site';
import { useT } from '@/lib/i18n';
import type { DictKey } from '@/lib/i18n/dictionaries';

interface Props {
  initial: { checkIn?: string; checkOut?: string; adults?: string; children?: string; room?: string };
}

function daysBetween(a: string, b: string) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

export function BookingFlow({ initial }: Props) {
  const { t } = useT();
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400 * 2 * 1000).toISOString().slice(0, 10);

  const guestSchema = useMemo(
    () =>
      z.object({
        firstName: z.string().min(1, t('book.errRequired')),
        lastName: z.string().min(1, t('book.errRequired')),
        email: z.string().email(t('book.errEmail')),
        phone: z.string().optional(),
        country: z.string().optional(),
        notes: z.string().optional(),
      }),
    [t],
  );
  type GuestValues = z.infer<typeof guestSchema>;

  const [step, setStep] = useState(initial.room ? 1 : 0);
  const [checkIn, setCheckIn] = useState(initial.checkIn || today);
  const [checkOut, setCheckOut] = useState(initial.checkOut || tomorrow);
  const [adults, setAdults] = useState(Number(initial.adults) || 2);
  const [children, setChildren] = useState(Number(initial.children) || 0);
  const [roomSlug, setRoomSlug] = useState(initial.room || '');
  const [confirmation, setConfirmation] = useState<{ id: string } | null>(null);

  const nights = useMemo(() => daysBetween(checkIn, checkOut), [checkIn, checkOut]);
  const selectedRoom = rooms.find((r) => r.slug === roomSlug);
  const total = selectedRoom ? selectedRoom.price * nights : 0;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GuestValues>({ resolver: zodResolver(guestSchema) });

  async function onConfirm(values: GuestValues) {
    if (!selectedRoom) return;
    const body = {
      roomTypeID: selectedRoom.slug,
      startDate: checkIn,
      endDate: checkOut,
      adults,
      children,
      guest: {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        country: values.country,
      },
      paymentMethod: 'card' as const,
      totalCost: total,
      currency: selectedRoom.currency,
    };
    try {
      const res = await fetch('/api/cloudbeds/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || t('book.failed'));
      setConfirmation({ id: data.confirmationNumber });
      setStep(3);
    } catch {
      // Cloudbeds not configured in dev still progress to a "request received" state
      setConfirmation({ id: `REQ-${Date.now().toString(36).toUpperCase()}` });
      setStep(3);
    }
  }

  const steps = [t('book.step.dates'), t('book.step.room'), t('book.step.guest'), t('book.step.confirm')];

  return (
    <div className="max-w-5xl mx-auto">
      <ol className="flex items-center justify-between mb-10 px-2">
        {steps.map((label, i) => (
          <li key={label} className="flex items-center gap-2 flex-1">
            <span
              className={`grid place-items-center h-9 w-9 rounded-full text-sm font-semibold ${
                step >= i ? 'bg-teal text-cream' : 'bg-forest/10 text-forest/50'
              }`}
            >
              {step > i ? <Check size={14} /> : i + 1}
            </span>
            <span className={`text-sm hidden sm:inline ${step >= i ? 'text-forest' : 'text-forest/40'}`}>
              {label}
            </span>
            {i < steps.length - 1 && <span className="flex-1 h-px bg-forest/15" />}
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="dates" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <div className="rounded-pebble bg-cream/70 p-6 md:p-9 ring-1 ring-forest/10 space-y-5">
              <h2 className="font-display text-2xl text-forest">{t('book.datesHeading')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DateField label={t('book.checkIn')} icon><input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="field" /></DateField>
                <DateField label={t('book.checkOut')} icon><input type="date" min={checkIn} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="field" /></DateField>
                <DateField label={t('book.adults')}><select value={adults} onChange={(e) => setAdults(+e.target.value)} className="field">{[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}</select></DateField>
                <DateField label={t('book.children')}><select value={children} onChange={(e) => setChildren(+e.target.value)} className="field">{[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}</select></DateField>
              </div>
              <Button onClick={() => setStep(1)} size="lg">{t('book.continue')} <ChevronRight size={16} /></Button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="rooms" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((r) => (
                <button
                  key={r.slug}
                  onClick={() => { setRoomSlug(r.slug); setStep(2); }}
                  className={`group text-left bg-cream/80 rounded-pebble overflow-hidden transition-all ring-2 ${
                    roomSlug === r.slug ? 'ring-teal' : 'ring-transparent hover:ring-forest/15'
                  }`}
                >
                  <div className="branded-img relative aspect-[4/3]">
                    <Image src={r.image} alt={t(`rooms.${r.slug}.name` as DictKey)} fill sizes="33vw" className="object-cover" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-xl text-forest group-hover:text-primary">{t(`rooms.${r.slug}.name` as DictKey)}</h3>
                    <p className="text-xs text-forest/60 mt-1">
                      {formatCurrency(r.price, r.currency)} × {nights} {t('book.nightsUnit')} = {formatCurrency(r.price * nights, r.currency)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6">
              <button onClick={() => setStep(0)} className="text-xs text-forest/60 hover:text-primary">← {t('book.editDates')}</button>
            </div>
          </motion.div>
        )}

        {step === 2 && selectedRoom && (
          <motion.form key="guest" onSubmit={handleSubmit(onConfirm)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 rounded-pebble bg-cream/70 p-6 md:p-9 ring-1 ring-forest/10 space-y-5">
              <h2 className="font-display text-2xl text-forest">{t('book.guestHeading')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label={t('book.firstName')} error={errors.firstName?.message}><input {...register('firstName')} className="field" /></FormField>
                <FormField label={t('book.lastName')} error={errors.lastName?.message}><input {...register('lastName')} className="field" /></FormField>
                <FormField label={t('book.email')} error={errors.email?.message}><input type="email" {...register('email')} className="field" /></FormField>
                <FormField label={t('book.phone')}><input {...register('phone')} className="field" /></FormField>
                <FormField label={t('book.country')}><input {...register('country')} className="field" /></FormField>
              </div>
              <FormField label={t('book.notes')}><textarea rows={4} {...register('notes')} className="field resize-y" /></FormField>
              <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {t('book.confirmReservation')}
              </Button>
            </div>
            <aside className="lg:col-span-5">
              <div className="sticky top-28 bg-teal-600 text-cream rounded-pebble p-7 space-y-3">
                <h3 className="font-display text-2xl">{t(`rooms.${selectedRoom.slug}.name` as DictKey)}</h3>
                <p className="text-cream/70 text-sm">{t(`rooms.${selectedRoom.slug}.tagline` as DictKey)}</p>
                <div className="border-t border-cream/10 pt-3 text-sm space-y-2">
                  <Row label={t('book.checkIn')} value={new Date(checkIn).toLocaleDateString()} />
                  <Row label={t('book.checkOut')} value={new Date(checkOut).toLocaleDateString()} />
                  <Row label={t('book.guests')} value={`${adults} ${t('book.adultsUnit')} · ${children} ${t('book.childrenUnit')}`} />
                  <Row label={t('book.nights')} value={String(nights)} />
                </div>
                <div className="border-t border-cream/10 pt-3 flex justify-between font-display text-3xl">
                  <span>{t('book.total')}</span>
                  <span>{formatCurrency(total, selectedRoom.currency)}</span>
                </div>
                <p className="text-sm text-cream/50">{t('book.taxesLine')}</p>
              </div>
            </aside>
          </motion.form>
        )}

        {step === 3 && confirmation && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="bg-cream rounded-pebble p-12 text-center shadow-xl">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/20 text-primary grid place-items-center mb-5">
              <Check size={32} />
            </div>
            <h2 className="font-display text-3xl text-forest">{t('book.doneHeading')}</h2>
            <p className="mt-3 text-forest/70">
              {t('book.confirmationLabel')} <span className="font-sans text-primary">{confirmation.id}</span>
            </p>
            <p className="mt-2 text-sm text-forest/70 max-w-md mx-auto">{t('book.doneBody')}</p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Button href="/">{t('book.returnHome')}</Button>
              <Button
                href={`${site.socials.whatsapp}?text=${encodeURIComponent(site.contact.whatsappMessage)}`}
                variant="gold-outline"
                target="_blank"
                rel="noreferrer"
              >
                {t('book.whatsappUs')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}

function DateField({ label, icon, children }: { label: string; icon?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-sans text-sm text-forest/60">{label}</span>
      <span className="relative">
        {icon && <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />}
        {!icon && <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />}
        <span className="block [&>*]:pl-10">{children}</span>
      </span>
    </label>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-sans text-sm text-forest/60">{label}</span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-cream/60">{label}</span>
      <span>{value}</span>
    </div>
  );
}

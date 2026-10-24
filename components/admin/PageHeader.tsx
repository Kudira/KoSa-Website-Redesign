import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  backHref?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, backHref, actions }: Props) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-warm-grey/30 pb-6 mb-8">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-xs font-poppins uppercase tracking-tracked text-umber/60 hover:text-primary mb-3"
          >
            <ChevronLeft size={14} /> Back
          </Link>
        )}
        {eyebrow && (
          <p className="font-poppins text-[10px] uppercase tracking-tracked text-brown">
            {eyebrow}
          </p>
        )}
        <h1 className="font-belleza text-3xl md:text-4xl text-umber mt-1">{title}</h1>
        {description && (
          <p className="text-sm text-umber/70 mt-2 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </header>
  );
}

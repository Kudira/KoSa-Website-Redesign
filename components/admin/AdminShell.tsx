'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import {
  LayoutDashboard,
  Hotel,
  Sparkles,
  Compass,
  UtensilsCrossed,
  Image as ImageIcon,
  Eye,
  BookOpen,
  Quote,
  Settings,
  Users,
  MessageSquare,
  Mail,
  Send,
  CalendarCheck,
  FolderOpen,
  Menu as MenuIcon,
  X,
  ChevronDown,
  CalendarDays,
  Package,
  Gift,
  PartyPopper,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Group = {
  label: string;
  links: { href: string; label: string; icon: React.ElementType; roles?: string[] }[];
};

const groups: Group[] = [
  {
    label: 'Overview',
    links: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Operations',
    links: [
      { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
      { href: '/admin/service-enquiries', label: 'Booking Enquiries', icon: ClipboardList },
      { href: '/admin/enquiries', label: 'Enquiries', icon: Mail },
      { href: '/admin/newsletter', label: 'Newsletter', icon: Send },
      { href: '/admin/chat', label: 'Chat', icon: MessageSquare },
    ],
  },
  {
    label: 'Content',
    links: [
      { href: '/admin/rooms', label: 'Rooms', icon: Hotel },
      { href: '/admin/wellness', label: 'Spa Treatments', icon: Sparkles },
      { href: '/admin/wellness-packages', label: 'Stay Packages', icon: Package },
      { href: '/admin/stay-enhancements', label: 'Stay Enhancements', icon: Gift },
      { href: '/admin/experiences', label: 'Experiences', icon: Compass },
      { href: '/admin/events', label: 'Events & Activities', icon: PartyPopper },
      { href: '/admin/daily-activities', label: 'Daily Activities', icon: CalendarDays },
      { href: '/admin/dining', label: 'Dining', icon: UtensilsCrossed },
      { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
      { href: '/admin/virtual-tour', label: 'Virtual Tour', icon: Eye },
      { href: '/admin/journal', label: 'Journal', icon: BookOpen },
      { href: '/admin/testimonials', label: 'Testimonials', icon: Quote },
    ],
  },
  {
    label: 'Library',
    links: [{ href: '/admin/media', label: 'Media', icon: FolderOpen }],
  },
  {
    label: 'Configuration',
    links: [
      { href: '/admin/settings', label: 'Site Settings', icon: Settings },
      { href: '/admin/users', label: 'Admin Users', icon: Users, roles: ['OWNER'] },
    ],
  },
];

const SIDEBAR_W = 'w-64'; // 16rem / 256px

export function AdminShell({
  user,
  children,
}: {
  user: { id: string; email: string; name?: string | null; role: string };
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-orange">
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 bg-cream border-b border-warm-grey/40">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/admin" className="font-belleza text-lg text-umber">
            KoSa · Admin
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-umber"
            aria-label="Open navigation"
          >
            <MenuIcon size={22} />
          </button>
        </div>
      </header>

      {/* Desktop sidebar fixed, full height */}
      <aside
        className={cn(
          'hidden md:flex md:flex-col',
          'md:fixed md:inset-y-0 md:left-0 md:z-30',
          SIDEBAR_W,
          'bg-cream border-r border-warm-grey/40',
        )}
      >
        <SidebarContent user={user} onNavigate={() => {}} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-umber/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className={cn('relative flex flex-col bg-cream border-r border-warm-grey/40', SIDEBAR_W, 'max-w-[80%]')}>
            <div className="flex items-center justify-between h-14 px-4 border-b border-warm-grey/30">
              <span className="font-belleza text-lg text-umber">KoSa · Admin</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation" className="text-umber">
                <X size={22} />
              </button>
            </div>
            <SidebarContent user={user} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content offset by the fixed sidebar width on desktop */}
      <main className="md:pl-64 min-h-screen">{children}</main>
    </div>
  );
}

function SidebarContent({
  user,
  onNavigate,
}: {
  user: { id: string; email: string; name?: string | null; role: string };
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  return (
    <>
      {/* Brand row (desktop only mobile drawer has its own header) */}
      <div className="hidden md:flex h-16 items-center px-6 border-b border-warm-grey/30 shrink-0">
        <Link href="/admin" className="font-belleza text-xl text-umber hover:text-primary">
          KoSa · Admin
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {groups.map((group) => {
          const visible = group.links.filter((l) => !l.roles || l.roles.includes(user.role));
          if (visible.length === 0) return null;
          return (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[10px] font-poppins uppercase tracking-tracked text-umber/40">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {visible.map((l) => {
                  const active =
                    pathname === l.href ||
                    (l.href !== '/admin' && pathname?.startsWith(l.href + '/'));
                  const Icon = l.icon;
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={onNavigate}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                          active
                            ? 'bg-primary/15 text-umber font-medium'
                            : 'text-umber/70 hover:bg-umber/5 hover:text-umber',
                        )}
                      >
                        <Icon size={16} className={active ? 'text-primary' : 'text-umber/50'} />
                        <span>{l.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-warm-grey/30 p-4 shrink-0">
        <UserMenu user={user} />
      </div>
    </>
  );
}

function UserMenu({
  user,
}: {
  user: { email: string; name?: string | null; role: string };
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-umber/5 text-left"
      >
        <span className="grid place-items-center h-8 w-8 rounded-full bg-primary/20 text-primary font-poppins text-xs uppercase">
          {(user.name || user.email)[0]}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm text-umber truncate">{user.name || user.email}</span>
          <span className="block text-[10px] font-poppins uppercase tracking-tracked text-primary">
            {user.role}
          </span>
        </span>
        <ChevronDown size={14} className="text-umber/40" />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-cream border border-warm-grey/40 rounded-md shadow-lg overflow-hidden">
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="block px-3 py-2 text-sm text-umber/80 hover:bg-umber/5"
          >
            View site ↗
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full text-left px-3 py-2 text-sm text-umber/80 hover:bg-umber/5"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

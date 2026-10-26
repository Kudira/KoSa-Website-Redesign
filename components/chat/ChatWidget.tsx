'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, UserCheck } from 'lucide-react';
import { AdinkraIcon } from '@/components/shared/AdinkraIcon';
import { useT } from '@/lib/i18n';
import type { DictKey } from '@/lib/i18n/dictionaries';

type MsgRole = 'user' | 'assistant' | 'admin' | 'system';
type Msg = { id?: string; role: MsgRole; content: string };

const SUGGESTED_KEYS: DictKey[] = [
  'chat.suggested.rooms',
  'chat.suggested.directions',
  'chat.suggested.spa',
  'chat.suggested.included',
];

const POLL_INTERVAL = 2500; // ms - how often we check for agent messages when open

function getSessionId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('kosa_chat_session');
  if (!id) {
    id = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('kosa_chat_session', id);
  }
  return id;
}

function parseSystemMsg(content: string, agentName: string | null): string {
  if (content.startsWith('__AGENT_JOIN__')) {
    const name = content.replace('__AGENT_JOIN__', '') || agentName || 'A team member';
    return `${name} from KoSa has joined the conversation.`;
  }
  if (content.startsWith('__AGENT_LEAVE__')) {
    return 'You are now chatting with Abena, our AI concierge.';
  }
  return content;
}

export function ChatWidget() {
  const pathname   = usePathname();
  const { t }      = useT();
  const [open, setOpen]           = useState(false);
  const [input, setInput]         = useState('');
  const [messages, setMessages]   = useState<Msg[]>([
    { role: 'assistant', content: '' },
  ]);
  const [loading, setLoading]     = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [agentMode, setAgentMode] = useState(false);
  const [agentName, setAgentName] = useState<string | null>(null);

  // Cursor: ISO timestamp of the last agent/system message we've shown
  const lastAgentMsgAt = useRef<string>(new Date(0).toISOString());
  const pollRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const scroller       = useRef<HTMLDivElement | null>(null);

  useEffect(() => { setSessionId(getSessionId()); }, []);

  // Localize greeting
  useEffect(() => {
    setMessages((m) => {
      if (m.length !== 1 || m[0].role !== 'assistant') return m;
      const greeting = t('chat.greeting');
      return m[0].content === greeting ? m : [{ role: 'assistant', content: greeting }];
    });
  }, [t]);

  // Auto-scroll
  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [messages, loading]);

  // ── Agent message polling ─────────────────────────────────────────────
  const pollAgentMessages = useCallback(async () => {
    const sid = sessionId || getSessionId();
    if (!sid) return;

    try {
      const res = await fetch(
        `/api/chat/${encodeURIComponent(sid)}/poll?after=${encodeURIComponent(lastAgentMsgAt.current)}`,
        { cache: 'no-store' },
      );
      if (!res.ok) return;

      const data = await res.json() as {
        agentMode: boolean;
        agentName: string | null;
        messages: Array<{ id: string; role: string; content: string; createdAt: string }>;
      };

      setAgentMode(data.agentMode);
      setAgentName(data.agentName ?? null);

      if (data.messages.length > 0) {
        const newMsgs: Msg[] = data.messages.map((m) => ({
          id: m.id,
          role: (m.role === 'ADMIN' ? 'admin' : 'system') as MsgRole,
          content: m.role === 'SYSTEM'
            ? parseSystemMsg(m.content, data.agentName)
            : m.content,
        }));

        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id).filter(Boolean));
          const toAdd = newMsgs.filter((m) => !m.id || !existingIds.has(m.id));
          return toAdd.length ? [...prev, ...toAdd] : prev;
        });

        // Advance cursor to the most recent message
        const latest = data.messages[data.messages.length - 1];
        lastAgentMsgAt.current = latest.createdAt;
      }
    } catch { /* network error - silent */ }
  }, [sessionId]);

  // Start/stop polling when widget is open
  useEffect(() => {
    if (!open || !sessionId) return;

    // Immediate first check
    pollAgentMessages();

    pollRef.current = setInterval(pollAgentMessages, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open, sessionId, pollAgentMessages]);

  // ── Send message ──────────────────────────────────────────────────────
  async function send(text: string) {
    if (!text.trim() || loading) return;
    const sid = sessionId || getSessionId();
    if (!sid || sid.length < 4) return;

    const userMsg: Msg = { role: 'user', content: text };

    if (agentMode) {
      // Agent is active: save locally and ship to server; no AI stream expected
      setMessages((m) => [...m, userMsg]);
      setInput('');
      try {
        await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, sessionId: sid }),
        });
      } catch { /* non-critical */ }
      return;
    }

    // Normal AI path
    setMessages((m) => [...m, userMsg, { role: 'assistant', content: '' }]);
    setInput('');
    setLoading(true);

    const ctrl    = new AbortController();
    const timeout = setTimeout(() => ctrl.abort('chat-timeout'), 60_000);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: sid }),
        signal: ctrl.signal,
      });

      // 202 = agent took over mid-flight; remove the placeholder assistant bubble
      if (res.status === 202) {
        setMessages((m) => m.filter((_, i) => i !== m.length - 1));
        const json = await res.json() as { agentMode?: boolean };
        if (json.agentMode) setAgentMode(true);
        return;
      }

      if (!res.ok || !res.body) {
        throw new Error(`Chat unavailable (${res.status})`);
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let assembled = '';
      let chunks    = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks++;
        assembled += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', content: assembled };
          return copy;
        });
      }

      if (chunks === 0 || !assembled.trim()) {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', content: t('chat.errorEmpty') };
          return copy;
        });
      }
    } catch (e) {
      const reason = (e as Error)?.message || String(e);
      const isAbort =
        reason.includes('chat-timeout') || (e as DOMException)?.name === 'AbortError';
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: 'assistant',
          content: isAbort ? t('chat.errorTimeout') : t('chat.errorGeneric'),
        };
        return copy;
      });
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }

  if (pathname?.startsWith('/admin')) return null;

  const headerSubtitle = agentMode
    ? `${agentName ?? 'KoSa team'} · Live support`
    : t('chat.subtitle');

  return (
    <>
      {/* Trigger buttons - hidden while the panel is open */}
      {!open && (
        <>
          {/* Desktop trigger */}
          <button
            onClick={() => setOpen(true)}
            aria-label={t('chat.cta')}
            className="fixed bottom-6 right-6 z-40 hidden md:flex items-center gap-3 bg-cream text-forest ring-1 ring-forest/10 rounded-full pl-2 pr-5 py-2 shadow-[0_18px_40px_-16px_rgba(20,37,25,0.45)] hover:bg-sunshine transition-colors duration-500"
          >
            <span className="grid place-items-center h-10 w-10 rounded-full bg-teal text-cream">
              {agentMode
                ? <UserCheck size={18} className="text-cream" />
                : <AdinkraIcon name="knonsonkonson" size={20} className="text-cream" />
              }
            </span>
            <span className="font-sans text-[0.95rem] font-semibold">{t('chat.cta')}</span>
            {agentMode && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-cream" />
            )}
          </button>

          {/* Mobile trigger */}
          <button
            onClick={() => setOpen(true)}
            aria-label={t('chat.cta')}
            className="md:hidden fixed bottom-5 right-5 z-40 grid place-items-center h-14 w-14 rounded-full bg-cream text-forest ring-1 ring-forest/10 shadow-[0_18px_40px_-16px_rgba(20,37,25,0.45)]"
          >
            <MessageCircle size={22} />
            {agentMode && (
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-cream" />
            )}
          </button>
        </>
      )}

      <AnimatePresence>
        {open && (
          <>
            {/* Mobile backdrop - tap outside to close */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 md:hidden"
              onClick={() => setOpen(false)}
              aria-hidden
            />

          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            // Mobile: slide up from bottom, leaving room for the navbar.
            // Desktop: a contained panel anchored to the bottom-right corner.
            //   - max-h uses 100dvh minus navbar height and bottom offset so the
            //     header is NEVER clipped no matter the viewport height.
            className="fixed bottom-0 inset-x-0 z-50 md:inset-auto md:bottom-6 md:right-6 md:w-[400px] md:max-h-[min(620px,calc(100dvh-6rem))] rounded-t-2xl md:rounded-pebble bg-cream shadow-2xl flex flex-col overflow-hidden border border-umber/10"
            style={{ height: 'min(620px, calc(100dvh - 5rem))' }}
            role="dialog"
            aria-label={t('a11y.resortChat')}
          >
            {/* Header */}
            <header
              className={`flex items-center justify-between px-5 py-4 ${
                agentMode ? 'bg-teal-700' : 'bg-umber'
              } text-cream transition-colors duration-500`}
            >
              <div className="flex items-center gap-3">
                <span className="grid place-items-center h-10 w-10 rounded-full bg-white/15">
                  {agentMode
                    ? <UserCheck size={20} className="text-white" />
                    : <AdinkraIcon name="palm" size={22} className="text-primary" />
                  }
                </span>
                <div>
                  <p className="font-display text-lg leading-none">
                    {agentMode ? (agentName ?? 'KoSa Team') : t('chat.title')}
                  </p>
                  <p className="font-sans text-sm text-cream/70">
                    {headerSubtitle}
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label={t('chat.close')} className="hover:text-primary">
                <X size={22} />
              </button>
            </header>

            {/* Agent-active pill */}
            {agentMode && (
              <div className="flex items-center justify-center gap-2 bg-emerald-50 border-b border-emerald-200 py-2 px-4">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-sm font-sans text-emerald-800 font-medium">
                  You are chatting with a KoSa team member
                </p>
              </div>
            )}

            {/* Messages. `data-lenis-prevent` stops the global smooth-scroll
                engine from hijacking touch/wheel scrolling inside the panel,
                and overscroll-contain keeps the page behind from scrolling. */}
            <div
              ref={scroller}
              data-lenis-prevent
              className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 space-y-3 bg-bg-orange"
            >
              {messages.map((m, i) => {
                if (m.role === 'system') {
                  return (
                    <div key={m.id ?? i} className="flex justify-center my-2">
                      <span className="text-sm text-forest/55 bg-warm-grey/30 px-3 py-1 rounded-full font-sans italic">
                        {m.content}
                      </span>
                    </div>
                  );
                }

                const isUser  = m.role === 'user';
                const isAdmin = m.role === 'admin';

                return (
                  <div
                    key={m.id ?? i}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    aria-live="polite"
                  >
                    <div
                      className={`max-w-[85%] px-4 py-2.5 rounded-pebble text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-primary text-forest rounded-br-sm'
                          : isAdmin
                          ? 'bg-teal-700 text-cream rounded-bl-sm'
                          : 'bg-cream text-forest border border-umber/10 rounded-bl-sm'
                      }`}
                    >
                      {m.content ? <RichText text={m.content} /> : loading && i === messages.length - 1 ? <Typing /> : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Suggested questions (only before first user reply) */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2 bg-bg-orange">
                {SUGGESTED_KEYS.map((key) => {
                  const q = t(key);
                  return (
                    <button
                      key={key}
                      onClick={() => send(q)}
                      className="text-xs px-3 py-1.5 rounded-full bg-cream border border-umber/15 hover:bg-primary hover:text-forest hover:border-primary transition-colors"
                    >
                      {q}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2 p-3 border-t border-umber/10 bg-cream"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={agentMode ? 'Message the team…' : t('chat.placeholder')}
                className="flex-1 bg-bg-orange rounded-full px-4 py-2.5 text-sm focus:outline-none border border-transparent focus:border-primary"
              />
              <button
                disabled={loading || !input.trim()}
                type="submit"
                aria-label={t('chat.send')}
                className="grid place-items-center h-10 w-10 rounded-full bg-umber text-cream disabled:opacity-50 hover:bg-primary hover:text-forest transition-colors"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Typing() {
  return (
    <span className="inline-flex gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }}
          className="block h-1.5 w-1.5 rounded-full bg-primary"
        />
      ))}
    </span>
  );
}


// Turns Abena's replies into readable text with real links:
// [label](url) markdown links, bare URLs and site paths like /book or /rooms/x.
function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)\s]+)\)|(https?:\/\/[^\s)]+)|(?<![\w/])(\/(?:book|rooms|wellness|dining|experiences|events|groups|plan|contact|about|gallery|blog)(?:[/?#][^\s.,)]*)?)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const href = m[2] ?? m[3] ?? m[4];
    const label = m[1] ?? (m[3] ? 'link' : m[4]);
    const external = /^https?:/.test(href);
    parts.push(
      <a
        key={k++}
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        className="font-semibold text-teal underline underline-offset-2 decoration-teal/40 hover:decoration-teal break-words"
      >
        {label}
      </a>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

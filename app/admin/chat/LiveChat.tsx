'use client';

// Full live-chat console for admin agents.
//
// Layout (desktop): left panel = session list | right panel = conversation + controls.
// Layout (mobile):  session list initially; tapping a session slides in the conversation.
//
// Real-time: subscribes to GET /api/admin/chat/stream (SSE, auto-reconnects).
// Agent actions:
//   - "Monitor"  - watches without changing anything (SSE already does this)
//   - "Take Over" - sets AGENT_ACTIVE, pauses AI, enables reply input
//   - "Release"   - hands back to AI, clears agent fields
//   - "Resolve"   - marks session RESOLVED

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MessageCircle, User, Bot, UserCheck, LogOut, CheckCircle2,
  Send, Loader2, RefreshCw, Bell, BellOff, ChevronLeft,
  Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

// ── Types (mirror Prisma output) ───────────────────────────────────────────

type MsgRole = 'USER' | 'ASSISTANT' | 'ADMIN' | 'SYSTEM';
type SessionStatus = 'ACTIVE' | 'NEEDS_ADMIN' | 'ADMIN_REPLIED' | 'AGENT_ACTIVE' | 'RESOLVED';

interface ChatMsg {
  id: string;
  sessionId: string;
  role: MsgRole;
  content: string;
  createdAt: string;
}

interface LastMsg {
  content: string;
  role: MsgRole;
  createdAt: string;
}

interface ChatSessionSummary {
  id: string;
  sessionId: string;
  guestName: string | null;
  guestEmail: string | null;
  status: SessionStatus;
  agentId: string | null;
  agentName: string | null;
  agentJoinedAt: string | null;
  lastMessageAt: string;
  _count: { messages: number };
  messages: LastMsg[];
}

interface ChatSessionDetail extends ChatSessionSummary {
  messages: ChatMsg[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function guestLabel(s: ChatSessionSummary) {
  return s.guestName ?? s.guestEmail ?? 'Anonymous';
}

function statusColor(status: SessionStatus): string {
  switch (status) {
    case 'AGENT_ACTIVE': return 'bg-emerald-500';
    case 'NEEDS_ADMIN':  return 'bg-red-500 animate-pulse';
    case 'ADMIN_REPLIED': return 'bg-blue-400';
    case 'RESOLVED':     return 'bg-warm-grey/40';
    default:             return 'bg-amber-400';
  }
}

function statusLabel(status: SessionStatus): string {
  switch (status) {
    case 'AGENT_ACTIVE':  return 'Agent active';
    case 'NEEDS_ADMIN':   return 'Needs agent';
    case 'ADMIN_REPLIED': return 'Replied';
    case 'RESOLVED':      return 'Resolved';
    default:              return 'Active';
  }
}

function parseSystemMsg(content: string): string {
  if (content.startsWith('__AGENT_JOIN__')) {
    const name = content.replace('__AGENT_JOIN__', '');
    return `${name} joined the conversation.`;
  }
  if (content.startsWith('__AGENT_LEAVE__')) {
    const name = content.replace('__AGENT_LEAVE__', '');
    return `${name} handed back to AI concierge.`;
  }
  return content;
}

// ── Toast notification ─────────────────────────────────────────────────────

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      role="alert"
      className="fixed top-4 right-4 z-[200] flex items-center gap-3 bg-teal-700 text-cream rounded-lg px-4 py-3 shadow-xl text-sm font-opensans max-w-xs animate-slide-in-right"
    >
      <Bell size={16} className="shrink-0" />
      <span>{msg}</span>
      <button onClick={onClose} className="ml-auto text-cream/70 hover:text-cream">✕</button>
    </div>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMsg }) {
  if (msg.role === 'SYSTEM') {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-umber/50 bg-warm-grey/30 px-3 py-1 rounded-full font-opensans">
          {parseSystemMsg(msg.content)}
        </span>
      </div>
    );
  }

  const isUser  = msg.role === 'USER';
  const isAgent = msg.role === 'ADMIN';
  const isAI    = msg.role === 'ASSISTANT';

  return (
    <div className={cn('flex gap-2 mb-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className={cn(
          'flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center mt-1',
          isAgent ? 'bg-teal-700 text-cream' : 'bg-primary/15 text-primary',
        )}>
          {isAgent ? <UserCheck size={14} /> : <Bot size={14} />}
        </div>
      )}
      <div className="max-w-[75%]">
        <div className={cn(
          'px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
          isUser  ? 'bg-sand-light text-umber rounded-br-sm'
          : isAgent ? 'bg-teal-700 text-cream rounded-bl-sm'
          : 'bg-cream border border-warm-grey/40 text-umber rounded-bl-sm',
        )}>
          {msg.content}
        </div>
        <p className={cn(
          'text-[10px] text-umber/40 mt-0.5 font-opensans',
          isUser ? 'text-right' : 'text-left pl-1',
        )}>
          {isAgent ? 'You · ' : isAI ? 'Abena · ' : 'Guest · '}
          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isUser && (
        <div className="flex-shrink-0 h-7 w-7 rounded-full bg-sand flex items-center justify-center mt-1">
          <User size={14} className="text-umber/60" />
        </div>
      )}
    </div>
  );
}

// ── Session list item ──────────────────────────────────────────────────────

function SessionItem({
  session,
  active,
  onClick,
}: {
  session: ChatSessionSummary;
  active: boolean;
  onClick: () => void;
}) {
  const last = session.messages[0];
  const isAgentActive = session.status === 'AGENT_ACTIVE';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3 border-b border-warm-grey/30 hover:bg-sand-light/60 transition-colors',
        active && 'bg-sand-light',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn('h-2 w-2 rounded-full shrink-0', statusColor(session.status))} />
          <span className="font-opensans text-sm font-medium text-umber truncate">
            {guestLabel(session)}
          </span>
        </div>
        <span className="text-[10px] text-umber/40 shrink-0">
          {formatDate(session.lastMessageAt)}
        </span>
      </div>
      {last && (
        <p className="text-xs text-umber/55 mt-0.5 pl-4 truncate">
          {last.role === 'USER' ? '' : last.role === 'ADMIN' ? 'You: ' : 'Abena: '}
          {last.content.replace(/^__\w+__/, '').slice(0, 80)}
        </p>
      )}
      {isAgentActive && session.agentName && (
        <p className="text-[10px] text-teal-700 pl-4 mt-0.5 font-opensans">
          Agent: {session.agentName}
        </p>
      )}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function LiveChat({ initialSessions }: { initialSessions: ChatSessionSummary[] }) {
  const [sessions, setSessions]           = useState<ChatSessionSummary[]>(initialSessions);
  const [activeId, setActiveId]           = useState<string | null>(null);
  const [detail, setDetail]               = useState<ChatSessionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reply, setReply]                 = useState('');
  const [sending, setSending]             = useState(false);
  const [toast, setToast]                 = useState<string | null>(null);
  const [soundOn, setSoundOn]             = useState(true);
  const [mobileShowConvo, setMobileShowConvo] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const esRef     = useRef<EventSource | null>(null);
  const audioRef  = useRef<HTMLAudioElement | null>(null);

  // ── Notification sound ────────────────────────────────────────────────
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNkl7ptnI1qhcLSuV3e7n5aMsAACi8f//9q0rAACj8///9a0rAACi8v//9K0rAACh8v//860rAACi8v//9K0r');
  }, []);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    if (soundOn) audioRef.current?.play().catch(() => {});
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('KoSa Chat', { body: msg, icon: '/logo.png' });
    }
  }, [soundOn]);

  // ── SSE connection ────────────────────────────────────────────────────
  useEffect(() => {
    let lastEventId = '';

    function connect() {
      const url = lastEventId
        ? `/api/admin/chat/stream`
        : '/api/admin/chat/stream';
      const es = new EventSource(url);
      esRef.current = es;

      es.addEventListener('snapshot', (e) => {
        const { sessions: snap } = JSON.parse((e as MessageEvent).data) as { sessions: ChatSessionSummary[] };
        setSessions(snap);
        lastEventId = (e as MessageEvent & { lastEventId: string }).lastEventId || '';
      });

      es.addEventListener('sessions', (e) => {
        const { sessions: updated } = JSON.parse((e as MessageEvent).data) as { sessions: ChatSessionSummary[] };
        setSessions((prev) => {
          const map = new Map(prev.map((s) => [s.id, s]));
          for (const s of updated) {
            const wasActive = map.get(s.id)?.status !== 'AGENT_ACTIVE' && s.status === 'AGENT_ACTIVE';
            if (wasActive) notify(`Agent joined conversation with ${guestLabel(s)}`);
            map.set(s.id, s);
          }
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
          );
        });
        lastEventId = (e as MessageEvent & { lastEventId: string }).lastEventId || '';
      });

      es.addEventListener('messages', (e) => {
        const { messages: newMsgs } = JSON.parse((e as MessageEvent).data) as { messages: ChatMsg[] };
        // Append new messages to the open session detail
        setDetail((prev) => {
          if (!prev) return prev;
          const existingIds = new Set(prev.messages.map((m) => m.id));
          const toAdd = newMsgs.filter(
            (m) => m.sessionId === prev.sessionId && !existingIds.has(m.id),
          );
          if (toAdd.length === 0) return prev;
          // Notify on new USER messages in the active session
          for (const m of toAdd) {
            if (m.role === 'USER') notify(`New message from guest`);
          }
          return { ...prev, messages: [...prev.messages, ...toAdd] };
        });
        // Also notify for USER messages in non-active sessions
        for (const m of newMsgs) {
          if (m.role === 'USER') {
            setSessions((prev) => {
              const idx = prev.findIndex((s) => s.sessionId === m.sessionId);
              if (idx === -1) return prev;
              const updated = [...prev];
              updated[idx] = {
                ...updated[idx],
                lastMessageAt: m.createdAt,
                messages: [{ content: m.content, role: m.role, createdAt: m.createdAt }],
              };
              return updated;
            });
          }
        }
        lastEventId = (e as MessageEvent & { lastEventId: string }).lastEventId || '';
      });

      es.onerror = () => {
        es.close();
        setTimeout(connect, 3000);
      };
    }

    connect();
    return () => { esRef.current?.close(); };
  }, [notify]);

  // ── Auto-scroll conversation ─────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [detail?.messages]);

  // ── Load full session detail ─────────────────────────────────────────
  const loadSession = useCallback(async (id: string) => {
    setActiveId(id);
    setMobileShowConvo(true);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/chat/sessions/${id}`);
      const { session } = await res.json() as { session: ChatSessionDetail };
      setDetail(session);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // ── Agent actions ────────────────────────────────────────────────────
  const takeover = useCallback(async () => {
    if (!detail) return;
    setActionLoading('takeover');
    try {
      const res = await fetch(`/api/admin/chat/sessions/${detail.id}/takeover`, { method: 'POST' });
      const data = await res.json() as { session: ChatSessionDetail; agentName: string };
      setDetail((prev) => prev ? { ...prev, ...data.session, status: 'AGENT_ACTIVE' } : prev);
      setSessions((prev) =>
        prev.map((s) => s.id === detail.id ? { ...s, status: 'AGENT_ACTIVE', agentName: data.agentName } : s),
      );
      // System join message will arrive via SSE; also add locally for instant feedback
      const joinMsg: ChatMsg = {
        id: `local-join-${Date.now()}`,
        sessionId: detail.sessionId,
        role: 'SYSTEM',
        content: `__AGENT_JOIN__${data.agentName}`,
        createdAt: new Date().toISOString(),
      };
      setDetail((prev) => prev ? { ...prev, messages: [...prev.messages, joinMsg] } : prev);
      notify(`You are now chatting directly with ${guestLabel(detail)}`);
    } catch {
      setToast('Failed to take over session. Try again.');
    } finally {
      setActionLoading(null);
    }
  }, [detail, notify]);

  const release = useCallback(async () => {
    if (!detail) return;
    setActionLoading('release');
    try {
      await fetch(`/api/admin/chat/sessions/${detail.id}/release`, { method: 'POST' });
      setDetail((prev) => prev ? { ...prev, status: 'ACTIVE', agentId: null, agentName: null } : prev);
      setSessions((prev) =>
        prev.map((s) => s.id === detail.id ? { ...s, status: 'ACTIVE', agentId: null, agentName: null } : s),
      );
      const leaveMsg: ChatMsg = {
        id: `local-leave-${Date.now()}`,
        sessionId: detail.sessionId,
        role: 'SYSTEM',
        content: `__AGENT_LEAVE__`,
        createdAt: new Date().toISOString(),
      };
      setDetail((prev) => prev ? { ...prev, messages: [...prev.messages, leaveMsg] } : prev);
      setReply('');
    } catch {
      setToast('Failed to release session.');
    } finally {
      setActionLoading(null);
    }
  }, [detail]);

  const sendMessage = useCallback(async () => {
    if (!detail || !reply.trim() || sending) return;
    const text = reply.trim();
    setSending(true);
    setReply('');

    // Optimistic local message
    const optimistic: ChatMsg = {
      id: `opt-${Date.now()}`,
      sessionId: detail.sessionId,
      role: 'ADMIN',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setDetail((prev) => prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev);

    try {
      const res = await fetch(`/api/admin/chat/sessions/${detail.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) throw new Error('Failed');
      const { message: saved } = await res.json() as { message: ChatMsg };
      // Replace optimistic with saved
      setDetail((prev) =>
        prev
          ? { ...prev, messages: prev.messages.map((m) => m.id === optimistic.id ? saved : m) }
          : prev,
      );
    } catch {
      // Revert optimistic on error
      setDetail((prev) =>
        prev ? { ...prev, messages: prev.messages.filter((m) => m.id !== optimistic.id) } : prev,
      );
      setReply(text);
      setToast('Message failed to send. Try again.');
    } finally {
      setSending(false);
    }
  }, [detail, reply, sending]);

  const isAgentHere = detail?.status === 'AGENT_ACTIVE';
  const sessionCount = sessions.length;
  const agentActiveCount = sessions.filter((s) => s.status === 'AGENT_ACTIVE').length;
  const needsAgentCount  = sessions.filter((s) => s.status === 'NEEDS_ADMIN').length;

  return (
    <>
      {/* Toast notifications */}
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* ── Left: session list ──────────────────────────────────── */}
        <aside
          className={cn(
            'w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-warm-grey/40 bg-cream',
            mobileShowConvo && 'hidden md:flex',
          )}
        >
          {/* Header stats */}
          <div className="px-4 py-4 border-b border-warm-grey/30 bg-sand-light/50">
            <div className="flex items-center justify-between">
              <h2 className="font-playfair text-lg text-umber">Live Chats</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundOn((v) => !v)}
                  className="p-1.5 rounded-full hover:bg-warm-grey/40 text-umber/60"
                  title={soundOn ? 'Mute notifications' : 'Enable notifications'}
                >
                  {soundOn ? <Bell size={16} /> : <BellOff size={16} />}
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="p-1.5 rounded-full hover:bg-warm-grey/40 text-umber/60"
                  title="Refresh"
                >
                  <RefreshCw size={15} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs font-opensans text-umber/60">
              <span className="flex items-center gap-1">
                <Circle size={8} className="fill-amber-400 text-amber-400" />
                {sessionCount} total
              </span>
              {agentActiveCount > 0 && (
                <span className="flex items-center gap-1">
                  <Circle size={8} className="fill-emerald-500 text-emerald-500" />
                  {agentActiveCount} agent active
                </span>
              )}
              {needsAgentCount > 0 && (
                <span className="flex items-center gap-1 text-red-600 font-semibold">
                  <Circle size={8} className="fill-red-500 text-red-500 animate-pulse" />
                  {needsAgentCount} needs help
                </span>
              )}
            </div>
          </div>

          {/* Session list */}
          <div className="flex-1 overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-umber/40">
                <MessageCircle size={32} className="mb-2" />
                <p className="text-sm font-opensans">No active conversations</p>
              </div>
            ) : (
              sessions.map((s) => (
                <SessionItem
                  key={s.id}
                  session={s}
                  active={s.id === activeId}
                  onClick={() => loadSession(s.id)}
                />
              ))
            )}
          </div>
        </aside>

        {/* ── Right: conversation panel ───────────────────────────── */}
        <main
          className={cn(
            'flex-1 flex flex-col overflow-hidden',
            !mobileShowConvo && 'hidden md:flex',
          )}
        >
          {!detail && !detailLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-umber/40 gap-3">
              <MessageCircle size={48} strokeWidth={1.2} />
              <p className="font-opensans text-sm">Select a conversation to monitor</p>
            </div>
          ) : detailLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-primary" />
            </div>
          ) : detail ? (
            <>
              {/* Conversation header */}
              <header className="flex items-center justify-between gap-3 px-5 py-3 border-b border-warm-grey/30 bg-cream shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    className="md:hidden p-1 -ml-1 text-umber/60 hover:text-umber"
                    onClick={() => setMobileShowConvo(false)}
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <div className={cn(
                    'h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                    isAgentHere ? 'bg-teal-700 text-cream' : 'bg-sand text-umber/70',
                  )}>
                    {guestLabel(detail).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-opensans font-semibold text-umber text-sm leading-none">
                      {guestLabel(detail)}
                    </p>
                    <p className="text-[10px] text-umber/50 mt-0.5">
                      {detail.guestEmail ?? detail.sessionId.slice(0, 14) + '…'}
                    </p>
                  </div>
                  <span className={cn(
                    'text-[10px] font-opensans uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold',
                    isAgentHere
                      ? 'bg-teal-100 text-teal-800'
                      : detail.status === 'NEEDS_ADMIN'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-50 text-amber-700',
                  )}>
                    {statusLabel(detail.status)}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {!isAgentHere ? (
                    <button
                      disabled={!!actionLoading}
                      onClick={takeover}
                      className="flex items-center gap-1.5 text-xs font-opensans bg-teal-700 text-cream px-3 py-1.5 rounded-lg hover:bg-teal-800 transition-colors disabled:opacity-60"
                    >
                      {actionLoading === 'takeover'
                        ? <Loader2 size={13} className="animate-spin" />
                        : <UserCheck size={13} />
                      }
                      Take Over
                    </button>
                  ) : (
                    <button
                      disabled={!!actionLoading}
                      onClick={release}
                      className="flex items-center gap-1.5 text-xs font-opensans border border-teal-700 text-teal-700 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors disabled:opacity-60"
                    >
                      {actionLoading === 'release'
                        ? <Loader2 size={13} className="animate-spin" />
                        : <LogOut size={13} />
                      }
                      Release to AI
                    </button>
                  )}
                </div>
              </header>

              {/* Agent-active banner */}
              {isAgentHere && (
                <div className="bg-teal-700 text-cream text-xs font-opensans px-5 py-2 flex items-center gap-2 shrink-0">
                  <UserCheck size={13} />
                  You are chatting directly with this guest. AI is paused.
                </div>
              )}

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-5 py-4 bg-bg-orange/30"
              >
                {detail.messages.map((m) => (
                  <MessageBubble key={m.id} msg={m} />
                ))}
              </div>

              {/* Reply input - only available when agent is active */}
              {isAgentHere ? (
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                  className="flex items-end gap-2 p-3 border-t border-warm-grey/30 bg-cream shrink-0"
                >
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Reply as agent… (Enter to send, Shift+Enter for new line)"
                    rows={2}
                    className="flex-1 resize-none bg-sand-light rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/40 border border-warm-grey/40"
                  />
                  <button
                    type="submit"
                    disabled={sending || !reply.trim()}
                    className="h-10 w-10 rounded-xl bg-teal-700 text-cream flex items-center justify-center disabled:opacity-50 hover:bg-teal-800 transition-colors"
                  >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 px-5 py-3 border-t border-warm-grey/20 bg-cream/60 shrink-0">
                  <Bot size={15} className="text-umber/40" />
                  <p className="text-xs text-umber/50 font-opensans">
                    AI concierge is handling this conversation.{' '}
                    <button onClick={takeover} className="text-teal-700 underline hover:no-underline">
                      Take over
                    </button>{' '}
                    to reply directly.
                  </p>
                </div>
              )}
            </>
          ) : null}
        </main>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
      `}</style>
    </>
  );
}

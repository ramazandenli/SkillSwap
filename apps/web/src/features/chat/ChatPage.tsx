import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { MessageDto } from '@skillswap/shared';
import { useAuth } from '@/auth/AuthContext';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/ui/Button';
import { ensureSocket, connectSocket } from '@/lib/socket';
import {
  useMarkThreadRead,
  useSendMessage,
  useThreadMessages,
  useThreads,
} from './hooks';

export function ChatPage() {
  const { peer: peerFromRoute } = useParams<{ peer?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();

  const threads = useThreads();
  const active = peerFromRoute ?? threads.data?.[0]?.user.username;
  const thread = useThreadMessages(active);
  const sendMessage = useSendMessage();
  const markRead = useMarkThreadRead();

  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    connectSocket();
    const s = ensureSocket();

    const onNewMessage = (msg: MessageDto) => {
      qc.invalidateQueries({ queryKey: ['messages', 'threads'] });
      const isFromMe = msg.fromId === user?.id;
      const peerId = isFromMe ? msg.toId : msg.fromId;
      qc.setQueryData<{ messages: MessageDto[]; peerId: string }>(
        ['messages', 'thread', active],
        (prev) => {
          if (!prev) return prev;
          if (prev.peerId !== peerId) return prev;
          if (prev.messages.some((m) => m.id === msg.id)) return prev;
          return { ...prev, messages: [...prev.messages, msg] };
        },
      );
    };

    s.on('message:new', onNewMessage);
    return () => {
      s.off('message:new', onNewMessage);
    };
  }, [qc, active, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.data?.messages.length]);

  // Mark read only when opening / switching a thread. New messages arriving
  // while the thread is already open don't auto-mark — the peer sees "seen"
  // only after the reader actually navigates to the thread.
  useEffect(() => {
    if (active) markRead.mutate(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    const body = draft.trim();
    setDraft('');
    await sendMessage.mutateAsync({ toUsername: active, body });
  };

  return (
    <main className="mx-auto grid min-h-screen max-w-5xl grid-cols-[280px_1fr] gap-0 border-x border-slate-200 dark:border-slate-800">
      <aside className="border-r border-slate-200 dark:border-slate-800">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h2 className="font-semibold">Messages</h2>
          <Link to={`/home/${user?.username}`} className="text-xs text-brand-500">
            Back to profile
          </Link>
        </header>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {threads.isPending && (
            <li className="p-4 text-sm text-slate-500">Loading...</li>
          )}
          {threads.data?.length === 0 && (
            <li className="p-4 text-sm text-slate-500">No conversations yet.</li>
          )}
          {threads.data?.map((t) => {
            const isActive = active === t.user.username;
            return (
              <li key={t.user.id}>
                <button
                  onClick={() => navigate(`/messages/${t.user.username}`)}
                  className={
                    isActive
                      ? 'flex w-full items-center gap-3 bg-brand-50 px-4 py-3 text-left dark:bg-brand-500/10'
                      : 'flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900'
                  }
                >
                  <Avatar name={t.user.name} avatarUrl={t.user.avatarUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.user.name} {t.user.surname}</p>
                    <p className="truncate text-xs text-slate-500">{t.lastMessage.body}</p>
                  </div>
                  {t.unreadCount > 0 && (
                    <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-semibold text-white">
                      {t.unreadCount}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="flex flex-col">
        {!active ? (
          <div className="flex flex-1 items-center justify-center text-slate-500">
            Select a conversation.
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              {(() => {
                const t = threads.data?.find((x) => x.user.username === active);
                const name = t?.user.name ?? active;
                return (
                  <>
                    <Avatar name={name} avatarUrl={t?.user.avatarUrl ?? null} size="sm" />
                    <p className="text-sm font-semibold">{name}</p>
                  </>
                );
              })()}
            </header>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {thread.data?.messages.map((m) => {
                const mine = m.fromId === user?.id;
                return (
                  <div key={m.id} className={mine ? 'flex justify-end' : 'flex justify-start'}>
                    <div
                      className={
                        mine
                          ? 'max-w-md rounded-2xl rounded-br-md bg-brand-500 px-3 py-2 text-sm text-white'
                          : 'max-w-md rounded-2xl rounded-bl-md bg-slate-100 px-3 py-2 text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                      }
                    >
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      {mine && (
                        <p className="mt-1 text-right text-[10px] opacity-70">
                          {m.readAt ? 'seen' : 'sent'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <form
              onSubmit={onSend}
              className="flex items-center gap-2 border-t border-slate-200 p-3 dark:border-slate-800"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900"
              />
              <Button type="submit" disabled={!draft.trim()} loading={sendMessage.isPending}>
                Send
              </Button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

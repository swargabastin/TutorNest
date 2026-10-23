'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Clock, User, ArrowLeft, Search } from 'lucide-react';
import { messagesApi, Conversation, ChatMessage, authApi } from '@/lib/api';
import Link from 'next/link';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = authApi.getUser();

  const loadConversations = () => {
    messagesApi.getConversations()
      .then((data) => {
        setConversations(data);
        if (data.length > 0 && !activeConv) {
          setActiveConv(data[0]);
        }
      })
      .catch((err) => console.error('Failed to load conversations', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    messagesApi.getMessages(activeConv.id)
      .then(setMessages)
      .catch((err) => console.error('Failed to load messages', err));
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || !newMsg.trim() || sending) return;

    const content = newMsg.trim();
    setNewMsg('');
    setSending(true);

    try {
      const sent = await messagesApi.sendMessage(activeConv.id, content);
      setMessages((prev) => [...prev, sent]);
      // Update snippet in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConv.id
            ? { ...c, lastMessage: content, lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const otherParty = currentUser?.role === 'Tutor' ? c.studentName : c.tutorName;
    return otherParty.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F1924] py-6 sm:py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <Link
              href={currentUser?.role === 'Tutor' ? '/dashboard/tutor' : '/dashboard/student'}
              className="text-slate-500 hover:text-plum-900 p-1 rounded-lg hover:bg-plum-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1F1924] tracking-tight flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-plum-800" />
              Messages &amp; Enquiries
            </h1>
          </div>
        </div>

        <div className="grid md:grid-cols-12 bg-white rounded-2xl shadow-xs border border-[#EADDD0] overflow-hidden min-h-[580px]">
          {/* Conversation List Sidebar */}
          <div className="md:col-span-4 border-r border-[#EADDD0] flex flex-col">
            <div className="p-3 border-b border-[#F0E6DB]">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search chats…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 text-xs bg-[#FAF8F5] border-[#EADDD0] rounded-xl focus-visible:ring-plum-600"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <p className="p-4 text-xs text-slate-500 text-center">Loading chats…</p>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <MessageSquare className="h-7 w-7 mx-auto mb-2 text-slate-300" />
                  No messages yet.
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isSelected = activeConv?.id === c.id;
                  const name = currentUser?.role === 'Tutor' ? c.studentName : c.tutorName;
                  const avatar = currentUser?.role === 'Tutor' ? c.studentAvatar : c.tutorAvatar;

                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveConv(c)}
                      className={`w-full text-left p-3 border-b border-[#F0E6DB] hover:bg-[#FAF8F5] flex items-start gap-3 transition-colors ${
                        isSelected ? 'bg-plum-50/70 border-l-4 border-l-plum-900' : ''
                      }`}
                    >
                      <Avatar className="h-9 w-9 shrink-0 rounded-xl">
                        <AvatarImage src={avatar || ''} />
                        <AvatarFallback className="bg-plum-100 text-plum-900 text-xs font-bold rounded-xl">
                          {name[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-xs font-bold text-[#1F1924] truncate">{name}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(c.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{c.lastMessage || 'No messages yet'}</p>
                        {c.unreadCount > 0 && (
                          <Badge className="mt-1 h-4 px-1.5 text-[9px] bg-plum-900 text-white font-bold rounded-full">
                            {c.unreadCount} new
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Chat Window */}
          <div className="md:col-span-8 flex flex-col bg-[#FAF8F5]">
            {activeConv ? (
              <>
                {/* Chat Header */}
                <div className="p-3.5 border-b border-[#EADDD0] flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 rounded-xl">
                      <AvatarImage
                        src={currentUser?.role === 'Tutor' ? activeConv.studentAvatar : activeConv.tutorAvatar}
                      />
                      <AvatarFallback className="bg-plum-100 text-plum-900 text-xs font-bold rounded-xl">
                        {(currentUser?.role === 'Tutor' ? activeConv.studentName : activeConv.tutorName)[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-[#1F1924]">
                        {currentUser?.role === 'Tutor' ? activeConv.studentName : activeConv.tutorName}
                      </h3>
                      {activeConv.subject && (
                        <p className="text-[11px] text-slate-500">Subject: {activeConv.subject}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-2.5 max-h-[460px]">
                  {messages.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      Say hello to start the conversation!
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.senderUserId === currentUser?.id;
                      return (
                        <div
                          key={m.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-xs shadow-xs ${
                              isMe
                                ? 'bg-plum-900 text-white rounded-br-none'
                                : 'bg-white text-[#1F1924] border border-[#EADDD0] rounded-bl-none'
                            }`}
                          >
                            <p className="leading-relaxed">{m.content}</p>
                            <span
                              className={`block text-[9px] mt-1 ${
                                isMe ? 'text-plum-200 text-right' : 'text-slate-400'
                              }`}
                            >
                              {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Form */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-[#EADDD0] bg-white flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Type your message…"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    className="flex-1 text-xs h-10 bg-[#FAF8F5] border-[#EADDD0] rounded-xl focus-visible:ring-plum-600"
                  />
                  <Button type="submit" disabled={sending || !newMsg.trim()} size="sm" className="h-10 px-4 bg-plum-900 hover:bg-plum-950 text-white rounded-xl">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
                <MessageSquare className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

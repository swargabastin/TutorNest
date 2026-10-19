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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href={currentUser?.role === 'Tutor' ? '/dashboard/tutor' : '/dashboard/student'}
              className="text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-teal-600" />
              Messages &amp; Inquiries
            </h1>
          </div>
        </div>

        <div className="grid md:grid-cols-12 bg-white rounded-xl shadow-sm border overflow-hidden min-h-[620px]">
          {/* Conversation List Sidebar */}
          <div className="md:col-span-4 border-r flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search chats…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-xs bg-gray-50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <p className="p-4 text-xs text-gray-500">Loading chats…</p>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
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
                      className={`w-full text-left p-3.5 border-b hover:bg-gray-50 flex items-start gap-3 transition-colors ${
                        isSelected ? 'bg-teal-50/70 border-l-4 border-l-teal-600' : ''
                      }`}
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={avatar || ''} />
                        <AvatarFallback className="bg-teal-100 text-teal-700 text-xs font-semibold">
                          {name[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {new Date(c.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{c.lastMessage || 'No messages yet'}</p>
                        {c.unreadCount > 0 && (
                          <Badge className="mt-1 h-4 px-1.5 text-[10px] bg-teal-600 text-white">
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
          <div className="md:col-span-8 flex flex-col">
            {activeConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={currentUser?.role === 'Tutor' ? activeConv.studentAvatar : activeConv.tutorAvatar}
                      />
                      <AvatarFallback className="bg-teal-100 text-teal-700 font-semibold">
                        {(currentUser?.role === 'Tutor' ? activeConv.studentName : activeConv.tutorName)[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900">
                        {currentUser?.role === 'Tutor' ? activeConv.studentName : activeConv.tutorName}
                      </h3>
                      {activeConv.subject && (
                        <p className="text-xs text-gray-500">Subject: {activeConv.subject}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50 max-h-[480px]">
                  {messages.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-sm">
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
                            className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                              isMe
                                ? 'bg-teal-600 text-white rounded-br-none'
                                : 'bg-white text-gray-800 border rounded-bl-none'
                            }`}
                          >
                            <p className="leading-relaxed">{m.content}</p>
                            <span
                              className={`block text-[10px] mt-1 ${
                                isMe ? 'text-teal-100 text-right' : 'text-gray-400'
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
                <form onSubmit={handleSendMessage} className="p-3 border-t bg-white flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Type your message…"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    className="flex-1 text-sm bg-gray-50"
                  />
                  <Button type="submit" disabled={sending || !newMsg.trim()} size="sm" className="bg-teal-600 hover:bg-teal-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                <MessageSquare className="h-12 w-12 text-gray-200 mb-2" />
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { messagesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Avatar, PageLoader } from '../../components/common';
import { format } from 'date-fns';
import { io } from 'socket.io-client';

export default function MessagesPage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUserId, setActiveUserId] = useState(userId || null);
  const [activeUser, setActiveUser] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  // Socket setup
  useEffect(() => {
    socketRef.current = io('/', { withCredentials: true });
    socketRef.current.emit('join', user._id);
    socketRef.current.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => socketRef.current?.disconnect();
  }, [user._id]);

  // Load conversations
  useEffect(() => {
    messagesAPI.getConversations().then(({ data }) => {
      setConversations(data.conversations || []);
    }).finally(() => setLoading(false));
  }, []);

  // Load conversation when activeUserId changes
  useEffect(() => {
    if (!activeUserId) return;
    messagesAPI.getConversation(activeUserId).then(({ data }) => {
      setMessages(data.messages || []);
      // Get the other user info from messages
      const other = data.messages?.find(m =>
        (m.senderId?._id || m.senderId) !== user._id
      );
      if (other) setActiveUser(other.senderId);
    });
  }, [activeUserId, user._id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeUserId) return;
    setSending(true);
    try {
      const { data } = await messagesAPI.send({ recipientId: activeUserId, content: text.trim() });
      setMessages(prev => [...prev, data.message]);
      setText('');
    } finally { setSending(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container py-6">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Messages</h1>
      <div className="card overflow-hidden" style={{ height: '70vh' }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 shrink-0 border-r border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-800">
              <p className="text-sm font-semibold text-slate-300">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm mt-8">
                  <div className="text-3xl mb-2">💬</div>
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv, i) => {
                  const last = conv.lastMessage;
                  const other = last?.senderId?._id !== user._id ? last?.senderId : last?.recipientId;
                  const otherId = other?._id;
                  return (
                    <button key={i} onClick={() => { setActiveUserId(otherId); setActiveUser(other); }}
                      className={`w-full text-left p-4 hover:bg-slate-800 transition-colors border-b border-slate-800/50 ${activeUserId === otherId ? 'bg-slate-800' : ''}`}>
                      <div className="flex items-center gap-3">
                        <Avatar name={other?.name} src={other?.avatar} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{other?.name}</p>
                          <p className="text-xs text-slate-500 truncate">{last?.content}</p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {!activeUserId ? (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-slate-400 font-medium">Select a conversation</p>
                  <p className="text-slate-500 text-sm mt-1">or start messaging from a profile</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                  <Avatar name={activeUser?.name} src={activeUser?.avatar} size="sm" />
                  <div>
                    <p className="font-semibold text-slate-200 text-sm">{activeUser?.name || 'User'}</p>
                    <p className="text-xs text-brand-400">Online</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, i) => {
                    const isMe = (msg.senderId?._id || msg.senderId) === user._id;
                    return (
                      <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                          isMe ? 'bg-brand-500 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 rounded-bl-sm'
                        }`}>
                          <p className="leading-relaxed">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? 'text-brand-200/70' : 'text-slate-500'}`}>
                            {format(new Date(msg.createdAt), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-slate-800 flex gap-3">
                  <input
                    className="input flex-1 py-2.5 text-sm"
                    placeholder="Type a message…"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    disabled={sending}
                  />
                  <button type="submit" disabled={!text.trim() || sending} className="btn-primary px-4 py-2.5 shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

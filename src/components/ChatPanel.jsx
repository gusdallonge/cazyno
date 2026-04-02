import { useState, useRef, useEffect } from 'react';
import { X, Send, Users } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

const FAKE_MESSAGES = [
  { user: 'CryptoKing', msg: 'Just hit 50x on Crash!', time: '14:23', color: '#22c55e' },
  { user: 'LuckyDice', msg: 'Plinko is on fire today', time: '14:24', color: '#a855f7' },
  { user: 'HighRoller', msg: 'Anyone playing Blackjack?', time: '14:25', color: '#3b82f6' },
  { user: 'CazynoFan', msg: 'Love the new design', time: '14:26', color: '#f59e0b' },
  { user: 'Admin', msg: 'Daily Race starts in 30 min!', time: '14:27', color: '#ef4444' },
];

export default function ChatPanel({ onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState(FAKE_MESSAGES);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      user: user?.full_name || 'You',
      msg: input,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      color: '#00e701',
    }]);
    setInput('');
  };

  return (
    <aside className="hidden md:flex flex-col fixed top-[var(--topbar-height)] right-0 bottom-0 w-[300px] z-30 border-l border-[#1a2a38] slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2a38]">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-[13px] font-semibold text-white">Chat</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(0,231,1,0.1)] text-primary font-mono">
            {Math.floor(Math.random() * 500 + 200)}
          </span>
        </div>
        <button onClick={onClose} className="hover:bg-white/5 rounded-lg transition p-1.5">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5">
        {messages.map((m, i) => (
          <div key={i} className="group">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] font-bold shrink-0" style={{ color: m.color }}>{m.user}</span>
              <span className="text-[10px] text-[#94a3b8]/50">{m.time}</span>
            </div>
            <p className="text-[12px] text-white/80 leading-relaxed">{m.msg}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#1a2a38]">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Message..."
            className="flex-1 bg-[#111a25] border border-[#1a2a38] rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:border-[rgba(0,231,1,0.5)] placeholder:text-[#94a3b8]/50"
          />
          <button onClick={send} disabled={!input.trim()}
            className="w-8 h-8 rounded-lg bg-[rgba(0,231,1,0.1)] border border-[#00e701]/25 flex items-center justify-center hover:bg-[#00e701]/20 disabled:opacity-30 transition-all">
            <Send className="w-3.5 h-3.5 text-primary" />
          </button>
        </div>
      </div>
    </aside>
  );
}

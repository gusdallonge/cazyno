import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Cpu, User, ChevronLeft, Ticket } from 'lucide-react';
import { api } from '@/api';
import { useLang, t } from '../lib/i18n';

const SYSTEM_CONTEXT = `Tu es l'assistant support de Cazyno, un casino en ligne premium.
JEUX : Dice (×2), Blackjack (×1.5), Plinko (×1000), Roulette (×36).
DÉPÔT : bouton top-up en haut, crypto (BTC/ETH/SOL), instantané.
NIVEAUX : Sans rang → Silver (5k€) → Gold → Platine → Diamond → Legend (3M€). Rakeback 0.15%.
RETRAIT : via l'icône solde en haut.
Réponds en français, sois concis (2-4 phrases max). Si la question nécessite un humain, suggère de créer un ticket.`;

export default function SupportChat() {
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('choice'); // choice | bot | human
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // Ticket human
  const [ticketStep, setTicketStep] = useState('subject'); // subject | chat
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketId, setTicketId] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [existingTickets, setExistingTickets] = useState([]);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, ticketMessages, open]);

  useEffect(() => {
    api.auth.me().then(async u => {
      setUserEmail(u.email);
      setUserName(u.full_name);
      try {
        const tickets = await api.entities.SupportTicket.filter({ user_email: u.email });
        setExistingTickets(tickets.filter(t => t.status !== 'resolved').sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      } catch (e) {}
    }).catch(() => {});
  }, []);

  // Poll for new admin replies on ticket
  useEffect(() => {
    if (mode === 'human' && ticketStep === 'chat' && ticketId) {
      pollRef.current = setInterval(async () => {
        try {
          const ticket = await api.entities.SupportTicket.filter({ id: ticketId });
          if (ticket[0]?.messages) setTicketMessages(ticket[0].messages);
        } catch (e) {}
      }, 4000);
    }
    return () => clearInterval(pollRef.current);
  }, [mode, ticketStep, ticketId]);

  const openChat = () => {
    setOpen(true);
    // Ne réinitialise pas le mode si une conversation est déjà en cours
  };

  const startBot = () => {
    setMode('bot');
    setMessages([{ role: 'assistant', content: "Bonjour ! Je suis CasinoBot. Comment puis-je t'aider ?" }]);
  };

  const startHuman = () => {
    setMode('human');
    setTicketStep('subject');
    setTicketSubject('');
  };

  const createTicket = async () => {
    if (!ticketSubject.trim()) return;
    setLoading(true);
    const ticket = await api.entities.SupportTicket.create({
      user_email: userEmail,
      user_name: userName,
      subject: ticketSubject,
      status: 'open',
      priority: 'normal',
      messages: [{ role: 'user', content: ticketSubject, date: new Date().toISOString(), sender: userName || userEmail }],
    });
    setTicketId(ticket.id);
    setTicketMessages(ticket.messages);
    setTicketStep('chat');
    setLoading(false);
  };

  const sendTicketMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const newMsg = { role: 'user', content: text, date: new Date().toISOString(), sender: userName || userEmail };
    const updated = [...ticketMessages, newMsg];
    setTicketMessages(updated);
    await api.entities.SupportTicket.update(ticketId, { messages: updated });
  };

  const sendBot = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);
    const history = newMessages.slice(-6).map(m => `${m.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${m.content}`).join('\n');
    const prompt = `${SYSTEM_CONTEXT}\n\nHistorique:\n${history}\n\nRéponds:`;
    const res = await api.integrations.Core.InvokeLLM({ prompt });
    setMessages(prev => [...prev, { role: 'assistant', content: typeof res === 'string' ? res : res?.text || 'Désolé, impossible de répondre.' }]);
    setLoading(false);
  };

  const openExistingTicket = (ticket) => {
    setMode('human');
    setTicketStep('chat');
    setTicketId(ticket.id);
    setTicketMessages(ticket.messages || []);
  };

  const reset = () => { setMode('choice'); setTicketId(null); setTicketMessages([]); setMessages([]); };

  return (
    <>
      <button onClick={() => open ? setOpen(false) : openChat()}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95"
        style={{ background: 'hsl(var(--primary))', boxShadow: '0 0 24px hsl(var(--green)/0.5)' }}>
        {open ? <X className="w-6 h-6 text-primary-foreground" /> : <MessageCircle className="w-6 h-6 text-primary-foreground" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 border border-[#1a2a38] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: 460, boxShadow: '0 0 40px rgba(0,0,0,0.5), 0 0 0 1px hsl(var(--border))' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1a2a38] shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(var(--card)), hsl(142 30% 8%))' }}>
            {mode !== 'choice' && (
              <button onClick={reset} className="text-[#94a3b8] hover:text-white transition-colors mr-1">
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-9 h-9 rounded-xl bg-[#00e701]/20 border border-[#00e701]/40 flex items-center justify-center relative shrink-0">
              {mode === 'human' ? <User className="w-5 h-5 text-primary" /> : <Cpu className="w-5 h-5 text-primary" />}
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#00e701] border-2 border-card"></span>
            </div>
            <div className="min-w-0">
              <p className="font-orbitron font-bold text-sm text-white">
                {mode === 'human' ? 'Support humain' : 'CasinoBot'}
              </p>
              <p className="text-[10px] text-primary truncate">
                {mode === 'human' && ticketId ? `Ticket #${ticketId.slice(-6).toUpperCase()}` : 'En ligne'}
              </p>
            </div>
          </div>

          {/* CHOICE */}
          {mode === 'choice' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
              <p className="text-sm text-[#94a3b8] text-center">Comment veux-tu qu'on t'aide ?</p>
              <button onClick={startBot}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl border-2 border-[#1a2a38] bg-[#111a25] hover:border-[rgba(0,231,1,0.5)] hover:bg-[#00e701]/5 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[rgba(0,231,1,0.15)] flex items-center justify-center shrink-0">
                  <Cpu className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm text-white">Assistant IA</p>
                  <p className="text-xs text-[#94a3b8]">Réponse instantanée 24/7</p>
                </div>
              </button>
              <button onClick={startHuman}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl border-2 border-[#1a2a38] bg-[#111a25] hover:border-[rgba(0,231,1,0.5)] hover:bg-[#00e701]/5 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm text-white">Support humain</p>
                  <p className="text-xs text-[#94a3b8]">Créer un ticket, réponse sous 24h</p>
                </div>
              </button>
              {existingTickets.length > 0 && (
                <div className="w-full space-y-2">
                  <p className="text-xs text-[#94a3b8] font-semibold uppercase tracking-wider">Mes tickets</p>
                  {existingTickets.map(ticket => (
                    <button key={ticket.id} onClick={() => openExistingTicket(ticket)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-[#1a2a38] bg-[#111a25] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left">
                      <Ticket className="w-4 h-4 text-blue-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">{ticket.subject}</p>
                        <p className="text-[10px] text-[#94a3b8]">
                          #{ticket.id.slice(-6).toUpperCase()} · {ticket.status === 'open' ? 'En attente' : ticket.status === 'in_progress' ? 'En cours' : ticket.status}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BOT */}
          {mode === 'bot' && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.role === 'user' ? 'bg-[#00e701] text-primary-foreground rounded-br-sm' : 'bg-[#111a25] border border-[#1a2a38] rounded-bl-sm text-white'}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-[#111a25] border border-[#1a2a38] rounded-2xl rounded-bl-sm px-4 py-2.5">
                      <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00e701] animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}</div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <div className="p-3 border-t border-[#1a2a38] flex gap-2 shrink-0">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendBot()}
                  placeholder="Pose ta question..." className="flex-1 bg-[#111a25] border border-[#1a2a38] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00e701] placeholder:text-[#94a3b8]" />
                <button onClick={sendBot} disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-xl bg-[#00e701] flex items-center justify-center shrink-0 hover:brightness-110 disabled:opacity-40 transition-all">
                  <Send className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>
            </>
          )}

          {/* HUMAN - subject */}
          {mode === 'human' && ticketStep === 'subject' && (
            <div className="flex-1 flex flex-col gap-4 p-5">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Ticket className="w-4 h-4 text-blue-400 shrink-0" />
                <p className="text-xs text-blue-300">Un admin répondra dans les meilleurs délais.</p>
              </div>
              <div className="space-y-2 flex-1">
                <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Décris ton problème</label>
                <textarea value={ticketSubject} onChange={e => setTicketSubject(e.target.value)} rows={5}
                  placeholder="Ex: Mon retrait n'a pas été traité, j'ai un problème avec mon solde..."
                  className="w-full bg-[#111a25] border border-[#1a2a38] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00e701] resize-none text-white placeholder:text-[#94a3b8]" />
              </div>
              <button onClick={createTicket} disabled={!ticketSubject.trim() || loading}
                className="bg-[#00e701] text-black rounded-xl font-bold w-full py-3 font-orbitron text-sm disabled:opacity-40">
                {loading ? 'Création...' : 'Créer le ticket'}
              </button>
            </div>
          )}

          {/* HUMAN - chat */}
          {mode === 'human' && ticketStep === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <div className="text-center">
                  <span className="text-xs text-[#94a3b8] bg-[#111a25] px-3 py-1 rounded-full border border-[#1a2a38]">
                    Ticket créé · Un admin va répondre bientôt
                  </span>
                </div>
                {ticketMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] space-y-1`}>
                      <div className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.role === 'user' ? 'bg-[#00e701] text-primary-foreground rounded-br-sm' : 'bg-blue-500/15 border border-blue-500/30 text-white rounded-bl-sm'}`}>
                        {m.content}
                      </div>
                      <p className={`text-[10px] text-[#94a3b8] ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {m.role === 'admin' ? 'Admin' : m.sender} · {new Date(m.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="p-3 border-t border-[#1a2a38] flex gap-2 shrink-0">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendTicketMessage()}
                  placeholder="Répondre..." className="flex-1 bg-[#111a25] border border-[#1a2a38] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00e701] placeholder:text-[#94a3b8]" />
                <button onClick={sendTicketMessage} disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl bg-[#00e701] flex items-center justify-center shrink-0 hover:brightness-110 disabled:opacity-40 transition-all">
                  <Send className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
import { useState } from 'react';
import { X, Send, Snowflake, CheckCircle } from 'lucide-react';
import { api } from '@/api';

const CRYPTOS = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', emoji: '₿' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', emoji: '⟠' },
  { id: 'usdt', name: 'Tether', symbol: 'USDT', emoji: '₮' },
  { id: 'sol', name: 'Solana', symbol: 'SOL', emoji: '◎' },
];

function FrozenBlock({ onClose }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [showForm, setShowForm] = useState(false);

  const sendRequest = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    const user = await api.auth.me();
    await api.entities.SupportTicket.create({
      user_email: user.email,
      user_name: user.full_name,
      subject: `Demande de dégel des retraits`,
      status: 'open',
      priority: 'high',
      messages: [{
        role: 'user',
        content: `Demande de dégel des retraits.\n\nRaison : ${reason}`,
        date: new Date().toISOString(),
        sender: user.full_name || user.email,
      }],
    });
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="space-y-4 text-center py-2">
      <div className="flex justify-center"><Snowflake className="w-12 h-12 text-blue-400" /></div>
      <div className="rounded-2xl p-5 space-y-2 text-left" style={{ background: 'rgba(59,130,246,0.08)', border: '1.5px solid rgba(59,130,246,0.35)' }}>
        <p className="font-orbitron font-bold text-base text-center" style={{ color: '#60a5fa' }}>Retraits temporairement bloqués</p>
        <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.65)' }}>Vos retraits ont été suspendus par notre équipe de sécurité.</p>
      </div>

      {sent ? (
        <div className="rounded-xl p-4" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <p className="font-semibold text-sm flex items-center justify-center gap-1" style={{ color: '#4ade80' }}><CheckCircle className="w-4 h-4" /> Demande envoyée !</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Notre équipe reviendra vers vous sous 24h.</p>
        </div>
      ) : showForm ? (
        <div className="space-y-3 text-left">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider block">Expliquez votre situation</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            placeholder="Ex : Je n'ai rien fait de frauduleux, je souhaite comprendre..."
            className="w-full bg-[#111a25] border border-[#1a2a38] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#00e701] resize-none text-white placeholder:text-[#94a3b8]"
          />
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-[#1a2a38] text-sm text-[#94a3b8] hover:text-white transition-all">Annuler</button>
            <button onClick={sendRequest} disabled={!reason.trim() || loading}
              className="flex-1 py-2.5 rounded-xl font-orbitron font-bold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.5)', color: '#60a5fa' }}>
              <Send className="w-3.5 h-3.5" /> {loading ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <button onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-xl font-orbitron font-bold text-sm transition-all hover:brightness-110"
            style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.4)', color: '#60a5fa' }}>
            Demander le degel
          </button>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm text-[#94a3b8] hover:text-white border border-[#1a2a38] transition-all">Fermer</button>
        </div>
      )}
    </div>
  );
}

export default function WithdrawModal({ credits, onWithdraw, onClose, isFrozen }) {
  const [step, setStep] = useState(1);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleWithdraw = async () => {
    const num = parseFloat(amount);
    if (num <= 0 || num > credits || !selectedCrypto) return;
    setIsSending(true);
    await new Promise(r => setTimeout(r, 1200));
    onWithdraw(selectedCrypto, num);
    setAmount('');
    setSelectedCrypto(null);
    setStep(1);
    setIsSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 min-h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="border border-[#1a2a38] rounded-2xl p-4 sm:p-6 max-w-sm w-full mx-4 space-y-4 my-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-orbitron font-bold text-lg">Retirer</h3>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isFrozen ? (
          <FrozenBlock onClose={onClose} />
        ) : (
          <>
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-[#94a3b8] text-center">Sélectionne la crypto</p>
                <div className="grid grid-cols-2 gap-2">
                  {CRYPTOS.map(crypto => (
                    <button key={crypto.id} onClick={() => { setSelectedCrypto(crypto); setStep(2); }}
                      className="p-4 rounded-xl border-2 border-[#1a2a38] bg-[#111a25] hover:border-[rgba(0,231,1,0.5)] hover:bg-[#00e701]/5 transition-all active:scale-95 flex flex-col items-center gap-2">
                      <span className="text-3xl">{crypto.emoji}</span>
                      <p className="font-orbitron text-xs font-bold">{crypto.symbol}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && selectedCrypto && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-4xl mb-2">{selectedCrypto.emoji}</p>
                  <p className="font-orbitron font-bold text-lg">{selectedCrypto.name}</p>
                  {isSending && <p className="text-xs text-primary mt-2 animate-pulse">Envoi en cours...</p>}
                </div>
                <div className="bg-[#111a25] rounded-xl p-3 border border-[#1a2a38]">
                  <p className="text-xs text-[#94a3b8] mb-1">Solde disponible</p>
                  <p className="font-orbitron font-bold text-lg text-primary">{credits.toFixed(2)} €</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#94a3b8] block mb-2">Montant à retirer</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" disabled={isSending}
                    className="w-full bg-[#111a25] border border-[#1a2a38] rounded-xl px-4 py-3 font-orbitron font-bold text-lg text-primary focus:outline-none focus:border-[#00e701] disabled:opacity-50" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setStep(1); setAmount(''); }} disabled={isSending}
                    className="flex-1 py-3 rounded-xl border border-[#1a2a38] bg-[#111a25] hover:bg-[#111a25] transition-all disabled:opacity-50">Retour</button>
                  <button onClick={handleWithdraw} disabled={isSending || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > credits}
                    className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground font-orbitron font-bold hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all">
                    {isSending ? 'Envoi...' : 'Retirer'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
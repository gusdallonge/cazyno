import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Wallet, ArrowDownCircle, Clock, AlertCircle, Check } from 'lucide-react';

function fmt(n) { return Number(parseFloat(n || 0)).toLocaleString('fr-FR'); }

const CRYPTOS = [
  { id: 'btc', label: 'Bitcoin (BTC)', fee: '~0.0001 BTC' },
  { id: 'eth', label: 'Ethereum (ETH)', fee: '~0.002 ETH' },
  { id: 'usdt', label: 'Tether (USDT)', fee: '~1 USDT' },
  { id: 'sol', label: 'Solana (SOL)', fee: '~0.01 SOL' },
];

export default function Withdrawal() {
  const { credits } = useOutletContext();
  const [crypto, setCrypto] = useState('btc');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const selectedCrypto = CRYPTOS.find(c => c.id === crypto);
  const numAmount = parseFloat(amount) || 0;
  const isValid = address.length > 10 && numAmount >= 10 && numAmount <= credits;

  const handleSubmit = () => {
    if (!isValid) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setAddress('');
    setAmount('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-up">
      <div className="text-center space-y-1">
        <h1 className="font-orbitron text-4xl font-black text-[#00e701]">Retrait</h1>
        <p className="text-[#94a3b8] text-sm">Retirez vos gains en crypto-monnaie</p>
      </div>

      {/* Balance */}
      <div className="border border-[#1a2a38] rounded-2xl p-6 text-center">
        <p className="text-xs text-[#94a3b8] mb-1">Solde disponible</p>
        <p className="font-orbitron font-black text-3xl text-[#00e701]">{fmt(credits)} EUR</p>
      </div>

      {/* Withdrawal form */}
      <div className="border border-[#1a2a38] rounded-2xl p-6 space-y-5">
        <h3 className="font-orbitron text-sm font-bold text-white flex items-center gap-2">
          <Wallet className="w-4 h-4 text-[#00e701]" /> Retrait crypto
        </h3>

        {/* Crypto select */}
        <div>
          <label className="text-xs text-[#94a3b8] mb-2 block">Choisir la crypto</label>
          <div className="grid grid-cols-2 gap-2">
            {CRYPTOS.map(c => (
              <button key={c.id} onClick={() => setCrypto(c.id)}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${crypto === c.id ? 'bg-[rgba(0,231,1,0.15)] border border-[#00e701]/40 text-[#00e701]' : 'bg-[#111a25] border border-[#1a2a38] text-[#94a3b8] hover:bg-[#111a25]'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Wallet address */}
        <div>
          <label className="text-xs text-[#94a3b8] mb-1 block">Adresse du portefeuille</label>
          <input value={address} onChange={e => setAddress(e.target.value)} placeholder="0x..."
            className="w-full bg-[#111a25] border border-[#1a2a38] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00e701]/40 font-mono" />
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs text-[#94a3b8] mb-1 block">Montant (EUR)</label>
          <input type="number" min="10" max={credits} value={amount} onChange={e => setAmount(e.target.value)} placeholder="Min. 10"
            className="w-full bg-[#111a25] border border-[#1a2a38] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00e701]/40" />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-[#94a3b8]">Min : 10 EUR</span>
            <span className="text-xs text-[#94a3b8]">Max : {fmt(credits)} EUR</span>
          </div>
        </div>

        {/* Fee */}
        <div className="flex items-center gap-2 text-xs text-[#94a3b8] bg-[#111a25] border border-[#1a2a38] rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0" />
          <span>Frais reseau estimes : {selectedCrypto.fee}</span>
        </div>

        {/* Submit */}
        {submitted ? (
          <div className="flex items-center gap-2 text-[#00e701] text-sm font-bold justify-center py-2">
            <Check className="w-5 h-5" /> Demande de retrait envoyee
          </div>
        ) : (
          <button onClick={handleSubmit} disabled={!isValid}
            className={`w-full py-3 rounded-xl font-orbitron font-bold text-sm transition-all ${isValid ? 'bg-[#00e701] text-black rounded-xl font-bold' : 'bg-[#111a25] border border-[#1a2a38] text-[#94a3b8] cursor-not-allowed'}`}>
            Demander le retrait
          </button>
        )}
      </div>

      {/* Processing info */}
      <div className="flex items-center gap-3 border border-[#1a2a38] rounded-2xl p-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,231,1,0.1)' }}>
          <Clock className="w-5 h-5 text-[#00e701]" />
        </div>
        <div>
          <p className="text-sm text-white font-bold">Traitement rapide</p>
          <p className="text-xs text-[#94a3b8]">Les retraits crypto sont traites en moins de 10 minutes</p>
        </div>
      </div>

      {/* Withdrawal history */}
      <div className="border border-[#1a2a38] rounded-2xl p-6">
        <h3 className="font-orbitron text-sm font-bold text-white flex items-center gap-2 mb-4">
          <ArrowDownCircle className="w-4 h-4 text-[#00e701]" /> Historique des retraits
        </h3>
        <div className="text-center py-8">
          <p className="text-[#94a3b8] text-sm">Aucun retrait</p>
          <p className="text-xs text-[#94a3b8] mt-1">Vos retraits apparaitront ici</p>
        </div>
      </div>
    </div>
  );
}

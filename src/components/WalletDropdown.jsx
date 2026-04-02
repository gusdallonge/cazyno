import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDownCircle, ArrowUpCircle, Lock, Coins, X, ChevronDown } from 'lucide-react';
import DepositModal from './DepositModal';
import WithdrawModal from './WithdrawModal';
import { C, T, card, btn, iconBox, modalOverlay, modalBox } from '../lib/design';

const CRYPTOS = [
  { key:'btc', name:'Bitcoin', symbol:'BTC', color:'#f7931a' },
  { key:'eth', name:'Ethereum', symbol:'ETH', color:'#627eea' },
  { key:'usdt', name:'Tether', symbol:'USDT', color:'#26a17b' },
  { key:'sol', name:'Solana', symbol:'SOL', color:'#9945ff' },
];

const CURRENCIES = [
  { code:'EUR', symbol:'€', rate:1 },
  { code:'USD', symbol:'$', rate:1.08 },
  { code:'GBP', symbol:'£', rate:0.86 },
  { code:'BTC', symbol:'₿', rate:0.0000165 },
];

export default function WalletDropdown({ credits, setCredits, addTransaction, wallet, updateWallet, isFrozen, onClose }) {
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [currency, setCurrency] = useState(() => localStorage.getItem('cazyno_currency') || 'EUR');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const cur = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  const displayBalance = (credits * cur.rate).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: cur.code === 'BTC' ? 6 : 2 });

  const selectCurrency = (code) => {
    setCurrency(code);
    localStorage.setItem('cazyno_currency', code);
    setShowCurrencyPicker(false);
  };

  return (
    <>
      {/* Popup overlay */}
      {createPortal(
        <div style={modalOverlay}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

          <div style={{...modalBox, maxWidth:'420px'}}>

            {/* Close */}
            <button onClick={onClose} style={{...btn.icon, position:'absolute',top:'20px',right:'20px',borderRadius:'10px',zIndex:10}}>
              <X style={{width:'18px',height:'18px',color:C.s}} />
            </button>

            {/* Balance */}
            <div style={{padding:'28px 28px 20px',textAlign:'center'}}>
              <p style={{...T.tiny, marginBottom:'8px'}}>Solde total</p>
              <div style={{display:'flex',alignItems:'baseline',justifyContent:'center',gap:'8px'}}>
                <span style={{fontFamily:'Orbitron,sans-serif',fontSize:'32px',fontWeight:900,color:C.g}}>
                  {displayBalance}
                </span>
                <button onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
                  style={{...btn.small, padding:'4px 10px'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=`${C.g}40`;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.b;}}>
                  <span style={{fontSize:'13px',fontWeight:700,color:C.s}}>{cur.code}</span>
                  <ChevronDown style={{width:'12px',height:'12px',color:C.m,transform:showCurrencyPicker?'rotate(180deg)':'',transition:'transform 0.2s'}} />
                </button>
              </div>

              {/* Currency picker */}
              {showCurrencyPicker && (
                <div style={{display:'flex',justifyContent:'center',gap:'8px',marginTop:'12px'}}>
                  {CURRENCIES.map(c => (
                    <button key={c.code} onClick={() => selectCurrency(c.code)}
                      style={{padding:'8px 16px',borderRadius:'10px',background:c.code===currency?`${C.g}15`:C.crd,border:`1px solid ${c.code===currency?`${C.g}40`:C.b}`,color:c.code===currency?C.g:C.white,fontSize:'12px',fontWeight:700,cursor:'pointer',transition:'all 0.15s'}}>
                      {c.symbol} {c.code}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{padding:'0 28px 20px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
              <button onClick={() => { setShowDeposit(true); onClose(); }}
                style={{...btn.primary, padding:'14px',borderRadius:'14px',fontSize:'14px'}}
                onMouseEnter={e=>{e.currentTarget.style.filter='brightness(1.1)';}}
                onMouseLeave={e=>{e.currentTarget.style.filter='';}}>
                <ArrowDownCircle style={{width:'18px',height:'18px'}} /> Deposer
              </button>
              <button onClick={() => { setShowWithdraw(true); onClose(); }}
                style={{...btn.secondary, padding:'14px',borderRadius:'14px',fontSize:'14px'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=`${C.g}40`;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.b;}}>
                {isFrozen ? <Lock style={{width:'18px',height:'18px',color:'#3b82f6'}} /> : <ArrowUpCircle style={{width:'18px',height:'18px'}} />}
                Retirer
              </button>
            </div>

            {/* Crypto wallets */}
            {wallet && (
              <div style={{padding:'0 28px 28px'}}>
                <p style={{...T.tiny, marginBottom:'12px'}}>Crypto Wallets</p>
                <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                  {CRYPTOS.map(({ key, name, symbol, color }) => (
                    <div key={key} style={{...card, display:'flex',alignItems:'center',gap:'12px',padding:'12px 14px',borderRadius:'12px'}}>
                      <div style={iconBox(color)}>
                        <Coins style={{width:'18px',height:'18px',color}} />
                      </div>
                      <div style={{flex:1}}>
                        <p style={{...T.h3, margin:0}}>{symbol}</p>
                        <p style={{...T.tiny, margin:0}}>{name}</p>
                      </div>
                      <span style={{...T.mono, fontSize:'14px'}}>
                        {(wallet[key] || 0).toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {showDeposit && createPortal(<DepositModal onClose={() => setShowDeposit(false)} />, document.body)}
      {showWithdraw && createPortal(
        <WithdrawModal
          credits={credits}
          isFrozen={isFrozen}
          onWithdraw={(crypto, amount) => {
            setCredits(c => c - amount);
            addTransaction?.('withdraw', -amount, `Retrait ${crypto.symbol}`);
            updateWallet?.(crypto.id, amount);
            setShowWithdraw(false);
          }}
          onClose={() => setShowWithdraw(false)}
        />,
        document.body
      )}
    </>
  );
}

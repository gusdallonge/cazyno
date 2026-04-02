import { useState } from 'react';
import { X, Zap, Copy, Check, QrCode, CreditCard, Coins, ShieldCheck, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { C, T, card, btn, iconBox, modalOverlay, modalBox, badge, input } from '../lib/design';

const CRYPTOS = [
  { key:'btc', name:'Bitcoin', symbol:'BTC', color:'#f7931a', network:'Bitcoin', confirmations:3, address:'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', rate:0.0000165, min:10 },
  { key:'eth', name:'Ethereum', symbol:'ETH', color:'#627eea', network:'ERC-20', confirmations:12, address:'0x71C7656EC7ab88b098defB751B7401B5f6d8976F', rate:0.00043, min:10 },
  { key:'usdt', name:'Tether', symbol:'USDT', color:'#26a17b', network:'TRC-20', confirmations:20, address:'TJYwFsrRdqPoZ4gBkAYnTwEbRp6RF4Gp3s', rate:1, min:10 },
  { key:'sol', name:'Solana', symbol:'SOL', color:'#9945ff', network:'Solana', confirmations:32, address:'7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV', rate:0.0067, min:10 },
];

const PRESETS = [25, 50, 100, 250, 500, 1000];

export default function DepositModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState('100');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goBack = () => {
    if (step === 3) { setStep(2); setCopied(false); }
    else if (step === 2) { setStep(1); setSelected(null); }
  };

  const cryptoAmount = selected ? (parseFloat(amount || 0) * selected.rate).toFixed(selected.key === 'usdt' ? 2 : 6) : '0';

  return (
    <div style={modalOverlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      <div style={{...modalBox, maxWidth:'460px'}}>

        {/* Close */}
        <button onClick={onClose} style={{...btn.icon, position:'absolute',top:'20px',right:'20px',zIndex:10}}>
          <X style={{width:'18px',height:'18px',color:C.s}} />
        </button>

        {/* Header */}
        <div style={{padding:'28px 28px 0',display:'flex',alignItems:'center',gap:'14px'}}>
          {step > 1 && (
            <button onClick={goBack} style={{...btn.icon, width:'40px',height:'40px',flexShrink:0}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=`${C.g}40`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.b;}}>
              <ChevronLeft style={{width:'18px',height:'18px',color:C.s}} />
            </button>
          )}
          <div>
            <h2 style={{...T.h1, margin:0}}>Deposer</h2>
            <p style={{...T.small, margin:'4px 0 0'}}>
              {step === 1 ? 'Choisissez votre methode de paiement' : step === 2 ? 'Selectionnez le montant a deposer' : `Envoyez ${cryptoAmount} ${selected?.symbol}`}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div style={{padding:'20px 28px 0',display:'flex',gap:'8px'}}>
          {[1,2,3].map(i => (
            <div key={i} style={{flex:1,height:'4px',borderRadius:'2px',background:i<=step?C.g:C.b,transition:'all 0.3s'}} />
          ))}
        </div>

        {/* -- STEP 1: Choose crypto -- */}
        {step === 1 && (
          <div style={{padding:'24px 28px 28px'}}>
            <p style={{...T.tiny, marginBottom:'16px'}}>Cryptomonnaie</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
              {CRYPTOS.map(crypto => (
                <button key={crypto.key} onClick={() => { setSelected(crypto); setStep(2); }}
                  style={{...card, display:'flex',flexDirection:'column',alignItems:'center',gap:'12px',padding:'20px 16px',cursor:'pointer',transition:'all 0.2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=`${crypto.color}50`;e.currentTarget.style.boxShadow=`0 4px 20px ${crypto.color}15`;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.b;e.currentTarget.style.boxShadow='none';}}>
                  <div style={iconBox(crypto.color, 48)}>
                    <Coins style={{width:'24px',height:'24px',color:crypto.color}} />
                  </div>
                  <div style={{textAlign:'center'}}>
                    <div style={T.h2}>{crypto.symbol}</div>
                    <div style={{...T.small, marginTop:'2px'}}>{crypto.name}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Card option */}
            <div style={{marginTop:'12px'}}>
              <button disabled
                style={{...card, width:'100%',display:'flex',alignItems:'center',gap:'14px',padding:'16px 20px',cursor:'not-allowed',opacity:0.4}}>
                <div style={iconBox(C.p, 48)}>
                  <CreditCard style={{width:'24px',height:'24px',color:C.p}} />
                </div>
                <div style={{textAlign:'left'}}>
                  <div style={T.h3}>Carte bancaire</div>
                  <div style={T.small}>Via MoonPay — Bientot disponible</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* -- STEP 2: Amount -- */}
        {step === 2 && selected && (
          <div style={{padding:'24px 28px 28px'}}>
            {/* Selected crypto */}
            <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'14px 16px',borderRadius:'14px',background:`${selected.color}08`,border:`1px solid ${selected.color}20`,marginBottom:'20px'}}>
              <div style={iconBox(selected.color)}>
                <Coins style={{width:'18px',height:'18px',color:selected.color}} />
              </div>
              <div>
                <div style={T.h3}>{selected.name}</div>
                <div style={T.tiny}>Reseau {selected.network}</div>
              </div>
            </div>

            {/* Amount input */}
            <p style={{...T.tiny, marginBottom:'10px'}}>Montant en EUR</p>
            <div style={{position:'relative',marginBottom:'14px'}}>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="100"
                style={{...input, padding:'18px 60px 18px 20px',borderRadius:'14px',borderWidth:'2px',fontSize:'24px',fontWeight:800,fontFamily:'Orbitron,sans-serif',transition:'border 0.2s'}}
                onFocus={e=>{e.target.style.borderColor=`${C.g}50`;}}
                onBlur={e=>{e.target.style.borderColor=C.b;}}
              />
              <span style={{position:'absolute',right:'20px',top:'50%',transform:'translateY(-50%)',fontSize:'16px',fontWeight:700,color:C.m}}>EUR</span>
            </div>

            {/* Presets */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:'8px',marginBottom:'20px'}}>
              {PRESETS.map(p => (
                <button key={p} onClick={() => setAmount(String(p))}
                  style={{padding:'10px',borderRadius:'10px',background:String(p)===amount?`${C.g}15`:C.crd,border:`1px solid ${String(p)===amount?`${C.g}40`:C.b}`,color:String(p)===amount?C.g:C.white,fontSize:'14px',fontWeight:700,cursor:'pointer',transition:'all 0.15s'}}>
                  {p}€
                </button>
              ))}
            </div>

            {/* Conversion */}
            <div style={{...card, padding:'14px 16px',borderRadius:'14px',marginBottom:'20px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={T.small}>Vous envoyez</span>
                <span style={{fontSize:'16px',fontWeight:800,fontFamily:'Orbitron,sans-serif',color:selected.color}}>
                  {cryptoAmount} {selected.symbol}
                </span>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'6px'}}>
                <span style={T.tiny}>Minimum</span>
                <span style={T.small}>{selected.min}€</span>
              </div>
            </div>

            {/* Continue */}
            <button onClick={() => { if (parseFloat(amount) >= selected.min) setStep(3); }}
              disabled={!amount || parseFloat(amount) < selected.min}
              style={{...btn.primary, width:'100%',padding:'16px',borderRadius:'14px',fontSize:'15px',fontWeight:800,fontFamily:'Orbitron,sans-serif',letterSpacing:'0.03em',
                background:(!amount || parseFloat(amount) < selected.min) ? C.b : C.g,
                color:(!amount || parseFloat(amount) < selected.min) ? C.m : C.black,
                cursor:(!amount || parseFloat(amount) < selected.min)?'not-allowed':'pointer'}}>
              Continuer
            </button>
          </div>
        )}

        {/* -- STEP 3: Address + QR -- */}
        {step === 3 && selected && (
          <div style={{padding:'24px 28px 28px',display:'flex',flexDirection:'column',gap:'18px'}}>

            {/* Amount summary */}
            <div style={{textAlign:'center',padding:'16px',borderRadius:'14px',background:`${selected.color}08`,border:`1px solid ${selected.color}15`}}>
              <p style={{...T.small, marginBottom:'6px'}}>Envoyez exactement</p>
              <p style={{fontSize:'28px',fontWeight:800,fontFamily:'Orbitron,sans-serif',color:selected.color,margin:0}}>
                {cryptoAmount} {selected.symbol}
              </p>
              <p style={{...T.small, marginTop:'4px'}}>{parseFloat(amount).toLocaleString('fr-FR')} EUR</p>
            </div>

            {/* QR Code */}
            <div style={{display:'flex',justifyContent:'center'}}>
              <div style={{width:'160px',height:'160px',borderRadius:'16px',background:C.white,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                <QrCode style={{width:'80px',height:'80px',color:C.black}} />
                <span style={{fontSize:'8px',color:'#666',fontWeight:600}}>Scannez pour deposer</span>
              </div>
            </div>

            {/* Address */}
            <div>
              <p style={{...T.tiny, marginBottom:'8px'}}>
                Adresse {selected.symbol} ({selected.network})
              </p>
              <div style={{...card, display:'flex',alignItems:'center',gap:'10px',padding:'14px',borderRadius:'14px'}}>
                <span style={{...T.mono, flex:1,wordBreak:'break-all',lineHeight:'1.6',fontSize:'12px'}}>
                  {selected.address}
                </span>
                <button onClick={() => handleCopy(selected.address)}
                  style={{...btn.primary, flexShrink:0,padding:'10px 18px',borderRadius:'10px',fontSize:'12px',
                    background:copied?'rgba(0,231,1,0.15)':C.g,
                    color:copied?C.g:C.black}}>
                  {copied ? <Check style={{width:'14px',height:'14px'}} /> : <Copy style={{width:'14px',height:'14px'}} />}
                  {copied ? 'Copie !' : 'Copier'}
                </button>
              </div>
            </div>

            {/* Network info */}
            <div style={{display:'flex',gap:'10px'}}>
              <div style={{...card, flex:1,padding:'14px',borderRadius:'12px'}}>
                <ShieldCheck style={{width:'14px',height:'14px',color:selected.color,marginBottom:'6px'}} />
                <p style={{...badge.standard, textTransform:'uppercase',color:C.m,marginBottom:'2px'}}>Reseau</p>
                <p style={{...T.h3, fontSize:'14px',margin:0}}>{selected.network}</p>
              </div>
              <div style={{...card, flex:1,padding:'14px',borderRadius:'12px'}}>
                <Clock style={{width:'14px',height:'14px',color:selected.color,marginBottom:'6px'}} />
                <p style={{...badge.standard, textTransform:'uppercase',color:C.m,marginBottom:'2px'}}>Confirmations</p>
                <p style={{...T.h3, fontSize:'14px',margin:0}}>{selected.confirmations}</p>
              </div>
            </div>

            {/* Warning */}
            <p style={{...T.small, lineHeight:'1.6',textAlign:'center',padding:'0 8px'}}>
              Envoyez uniquement du <span style={{color:selected.color,fontWeight:700}}>{selected.symbol}</span> sur le reseau <span style={{color:C.white,fontWeight:700}}>{selected.network}</span>. Tout autre actif sera perdu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Zap, LogIn, ArrowRight, ChevronDown } from 'lucide-react';
import { api } from '@/api';
import { useAuth } from '@/lib/AuthContext';
import { C, T, card, btn, iconBox, modalOverlay, modalBox, input } from '../lib/design';

export default function AuthModal({ onClose }) {
  const [step, setStep] = useState('email'); // email | code
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const sendCode = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      await api.auth.sendCode({ email });
      setStep('code');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const user = await api.auth.verifyCode({ email, code });
      login(user);
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={{...modalBox, maxWidth:'400px', margin:'0 16px'}} onClick={e => e.stopPropagation()}>

        <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:'192px',height:'96px',borderRadius:'50%',opacity:0.08,pointerEvents:'none',background:`radial-gradient(circle, ${C.g}, transparent 70%)`}} />

        <button onClick={onClose} style={{...btn.icon, position:'absolute',top:'16px',right:'16px',zIndex:10}}>
          <X style={{width:'18px',height:'18px',color:C.s}} />
        </button>

        <div style={{position:'relative',padding:'24px 32px'}}>
          {/* Logo */}
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'24px'}}>
            <div style={iconBox(C.g)}>
              <Zap style={{width:'20px',height:'20px',color:C.g}} />
            </div>
            <span style={{fontFamily:'Orbitron,sans-serif',fontWeight:900,fontSize:'16px',letterSpacing:'0.08em',color:C.white}}>CAZYNO</span>
          </div>

          {step === 'email' ? (
            <>
              <h2 style={{...T.h1, fontSize:'22px',marginBottom:'4px'}}>Connexion / Inscription</h2>
              <p style={{...T.body, color:C.m,marginBottom:'24px'}}>
                Entrez votre email, on vous envoie un code. Pas de mot de passe.
              </p>

              <form onSubmit={sendCode} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                <div>
                  <label style={{...T.tiny, display:'block',marginBottom:'6px'}}>Email</label>
                  <div style={{display:'flex',gap:'8px'}}>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" required autoFocus
                      style={{...input, flex:1,padding:'12px 16px',fontSize:'14px'}}
                      onFocus={e => e.target.style.borderColor = `${C.g}40`}
                      onBlur={e => e.target.style.borderColor = C.b} />
                    <button type="submit" disabled={loading || !email}
                      style={{...btn.primary, padding:'12px 16px',opacity:(loading||!email)?0.4:1}}>
                      {loading ? <div style={{width:'20px',height:'20px',border:`2px solid rgba(0,0,0,0.3)`,borderTopColor:C.black,borderRadius:'50%',animation:'spin 1s linear infinite'}}/> : <ArrowRight style={{width:'20px',height:'20px'}} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div style={{borderRadius:'12px',padding:'12px',background:`${C.red}14`,border:`1px solid ${C.red}33`}}>
                    <p style={{...T.body, color:C.red}}>{error}</p>
                  </div>
                )}
              </form>

              {/* Separator */}
              <div style={{display:'flex',alignItems:'center',gap:'12px',margin:'24px 0'}}>
                <div style={{flex:1,height:'1px',background:C.b}} />
                <span style={T.small}>ou continuer avec</span>
                <div style={{flex:1,height:'1px',background:C.b}} />
              </div>

              {/* SSO */}
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                <button style={{...btn.secondary, width:'100%'}}>
                  <svg style={{width:'20px',height:'20px'}} viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continuer avec Google
                </button>
                <button style={{...btn.secondary, width:'100%'}}>
                  <svg style={{width:'20px',height:'20px'}} fill="#0088cc" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                  Continuer avec Telegram
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 style={{...T.h1, fontSize:'22px',marginBottom:'4px'}}>Entrez votre code</h2>
              <p style={{...T.body, color:C.m,marginBottom:'24px'}}>
                Un code a ete envoye a <span style={{fontWeight:600,color:C.white}}>{email}</span>
              </p>

              <form onSubmit={verifyCode} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                <div>
                  <label style={{...T.tiny, display:'block',marginBottom:'6px'}}>Code de verification</label>
                  <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="123456" required autoFocus
                    maxLength={6}
                    style={{...input, fontSize:'20px',fontFamily:'monospace',fontWeight:700,textAlign:'center',letterSpacing:'0.3em',padding:'12px 16px'}}
                    onFocus={e => e.target.style.borderColor = `${C.g}40`}
                    onBlur={e => e.target.style.borderColor = C.b} />
                </div>

                {error && (
                  <div style={{borderRadius:'12px',padding:'12px',background:`${C.red}14`,border:`1px solid ${C.red}33`}}>
                    <p style={{...T.body, color:C.red}}>{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading || code.length < 4}
                  style={{...btn.primary, width:'100%',padding:'12px',fontSize:'14px',boxShadow:`0 4px 20px ${C.gR}0.25)`,opacity:(loading||code.length<4)?0.5:1}}>
                  {loading ? 'Verification...' : 'Verifier'}
                </button>
              </form>

              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'16px'}}>
                <button onClick={() => { setStep('email'); setCode(''); setError(null); }} style={{background:'none',border:'none',cursor:'pointer',...T.small, color:C.s}}>
                  Changer d'email
                </button>
                <button onClick={sendCode} style={{background:'none',border:'none',cursor:'pointer',...T.small, color:C.g}}>
                  Renvoyer le code
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

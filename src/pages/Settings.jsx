import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Globe, DollarSign, Volume2, VolumeX, ShieldAlert, Clock, X, Settings2 } from 'lucide-react';

const LANGUAGES = [
  { code: 'fr', label: 'Francais' }, { code: 'en', label: 'English' },
  { code: 'ru', label: 'Pycckuji' }, { code: 'es', label: 'Espanol' },
  { code: 'pt', label: 'Portugues' }, { code: 'zh', label: 'Zhongwen' }, { code: 'ar', label: 'Al-Arabiyyah' },
];
const CURRENCIES = ['EUR', 'USD', 'BTC', 'ETH'];
const SESSION_REMINDERS = [
  { value: 'off', label: 'Desactive' }, { value: '30', label: '30 minutes' },
  { value: '60', label: '1 heure' }, { value: '120', label: '2 heures' }, { value: '240', label: '4 heures' },
];
const EXCLUSION_OPTIONS = [
  { value: '7', label: '1 semaine' }, { value: '30', label: '1 mois' },
  { value: '180', label: '6 mois' }, { value: 'permanent', label: 'Permanent' },
];

function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle}
      className="w-11 h-6 rounded-full transition-all relative"
      style={{background: on ? '#00e701' : '#111a25'}}>
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}

export default function Settings() {
  useOutletContext();

  const [lang, setLang] = useState(() => localStorage.getItem('cazyno_lang') || 'fr');
  const [currency, setCurrency] = useState(() => localStorage.getItem('cazyno_currency') || 'EUR');
  const [sound, setSound] = useState(() => localStorage.getItem('cazyno_sound') !== 'off');
  const [emailNotif, setEmailNotif] = useState(true);
  const [promoNotif, setPromoNotif] = useState(true);
  const [dailyLimit, setDailyLimit] = useState('');
  const [weeklyLimit, setWeeklyLimit] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [sessionReminder, setSessionReminder] = useState('off');
  const [showExclusion, setShowExclusion] = useState(false);

  const savePref = (key, val) => localStorage.setItem(key, val);

  const Block = ({ icon: Icon, title, children }) => (
    <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
      <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" style={{color:'#00e701'}} />
          <h2 className="font-orbitron font-black text-white text-sm">{title}</h2>
        </div>
      </div>
      <div className="px-5 py-5 space-y-4">
        {children}
      </div>
    </div>
  );

  const Row = ({ label, children }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{color:'#94a3b8'}}>{label}</span>
      {children}
    </div>
  );

  return (
    <div className="w-full space-y-5 fade-up">

      {/* Language */}
      <Block icon={Globe} title="Langue">
        <div className="grid grid-cols-4 gap-2">
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => { setLang(l.code); savePref('cazyno_lang', l.code); }}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
              style={lang === l.code
                ? { background:'#00e701', color:'#000' }
                : { background:'#111a25', border:'1px solid #1a2a38', color:'#94a3b8' }}>
              {l.label}
            </button>
          ))}
        </div>
      </Block>

      {/* Currency */}
      <Block icon={DollarSign} title="Devise">
        <div className="flex gap-2">
          {CURRENCIES.map(c => (
            <button key={c} onClick={() => { setCurrency(c); savePref('cazyno_currency', c); }}
              className="px-4 py-2 rounded-xl text-xs font-orbitron font-bold transition-all"
              style={currency === c
                ? { background:'#00e701', color:'#000' }
                : { background:'#111a25', border:'1px solid #1a2a38', color:'#94a3b8' }}>
              {c}
            </button>
          ))}
        </div>
      </Block>

      {/* Sound & Notifications */}
      <Block icon={sound ? Volume2 : VolumeX} title="Son et notifications">
        <Row label="Effets sonores">
          <Toggle on={sound} onToggle={() => { setSound(!sound); savePref('cazyno_sound', sound ? 'off' : 'on'); }} />
        </Row>
        <Row label="Notifications par email">
          <Toggle on={emailNotif} onToggle={() => setEmailNotif(!emailNotif)} />
        </Row>
        <Row label="Emails promotionnels">
          <Toggle on={promoNotif} onToggle={() => setPromoNotif(!promoNotif)} />
        </Row>
      </Block>

      {/* Responsible gambling */}
      <Block icon={ShieldAlert} title="Jeu responsable">
        <p className="text-xs" style={{color:'#94a3b8'}}>
          Definissez vos limites pour garder le controle de votre experience de jeu.
        </p>
        {[
          { label: 'Limite quotidienne', val: dailyLimit, set: setDailyLimit },
          { label: 'Limite hebdomadaire', val: weeklyLimit, set: setWeeklyLimit },
          { label: 'Limite mensuelle', val: monthlyLimit, set: setMonthlyLimit },
        ].map(({ label, val, set }) => (
          <div key={label}>
            <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{color:'#4b5c6f'}}>{label}</label>
            <input type="number" min="0" value={val} onChange={e => set(e.target.value)} placeholder="0 EUR"
              className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
              style={{background:'#111a25', border:'1px solid #1a2a38'}} />
          </div>
        ))}

        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 mb-1" style={{color:'#4b5c6f'}}>
            <Clock className="w-3 h-3" /> Rappel de session
          </label>
          <div className="flex gap-2 flex-wrap">
            {SESSION_REMINDERS.map(r => (
              <button key={r.value} onClick={() => setSessionReminder(r.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={sessionReminder === r.value
                  ? { background:'#00e701', color:'#000' }
                  : { background:'#111a25', border:'1px solid #1a2a38', color:'#94a3b8' }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2" style={{borderTop:'1px solid #1a2a38'}}>
          <button onClick={() => setShowExclusion(true)}
            className="px-6 py-2.5 font-orbitron font-bold text-xs rounded-xl transition-all"
            style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444'}}>
            Auto-exclusion
          </button>
        </div>
      </Block>

      {/* Self-exclusion modal */}
      {showExclusion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl p-8 max-w-md w-full mx-4 space-y-5" style={{background:'#111a25', border:'1px solid rgba(239,68,68,0.3)'}}>
            <div className="flex items-center justify-between">
              <h3 className="font-orbitron text-lg font-bold" style={{color:'#ef4444'}}>Auto-exclusion</h3>
              <button onClick={() => setShowExclusion(false)} style={{color:'#94a3b8'}}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm" style={{color:'#94a3b8'}}>
              Attention : cette action est irreversible pendant la duree choisie. Vous ne pourrez plus acceder a votre compte ni jouer.
            </p>
            <div className="space-y-2">
              {EXCLUSION_OPTIONS.map(opt => (
                <button key={opt.value}
                  className="w-full px-4 py-3 rounded-xl text-sm font-bold text-left transition-all"
                  style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444'}}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

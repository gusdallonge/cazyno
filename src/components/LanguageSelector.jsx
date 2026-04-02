import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'fr', flag: 'FR', label: 'Français' },
  { code: 'en', flag: 'EN', label: 'English' },
  { code: 'ru', flag: 'RU', label: 'Русский' },
  { code: 'es', flag: 'ES', label: 'Español' },
  { code: 'zh', flag: 'ZH', label: '中文' },
];

export default function LanguageSelector() {
  const [lang, setLang] = useState(() => localStorage.getItem('cazyno_lang') || 'fr');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (code) => {
    setLang(code);
    localStorage.setItem('cazyno_lang', code);
    window.dispatchEvent(new Event('cazyno_lang_change'));
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-[#1a2a38] bg-[#111a25] hover:bg-[#111a25] transition-colors text-sm">
        <span className="text-lg leading-none">{current.flag}</span>
        <ChevronDown className={`w-3 h-3 text-[#94a3b8] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 border border-[#1a2a38] rounded-xl shadow-xl z-50 overflow-hidden">
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => select(l.code)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[#111a25] transition-colors ${l.code === lang ? 'text-primary font-bold' : 'text-white'}`}>
              <span className="text-lg">{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
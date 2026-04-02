import { useState, useEffect } from 'react';
import { useLang } from '../lib/i18n';

const SLIDES = [
  {
    tag:      { fr: 'Bonus Bienvenue', en: 'Welcome Bonus', ru: 'Бонус', es: 'Bono Bienvenida', zh: '欢迎奖励' },
    title:    'BONUS 100%',
    badge:    { fr: "Jusqu'à 10 000 €", en: 'Up to €10,000', ru: 'До 10 000 €', es: 'Hasta 10.000 €', zh: '最高10,000€' },
    desc:     { fr: 'Tu déposes 100 €, on t\'en donne 100 de plus.\nSoit 200 € pour jouer dès le départ !', en: 'Deposit €100, we add €100 more.\n€200 to play from the start!', ru: 'Вносишь 100 €, мы добавляем ещё 100 €.\nИтого 200 € сразу!', es: '¡Deposita 100€, te damos 100€ más.\n200€ para jugar desde ya!', zh: '存入100€，我们再给100€。\n从一开始就有200€！' },
    wager:    { fr: 'Mise requise : ×30 votre dépôt', en: 'Wagering requirement: ×30 your deposit', ru: 'Требование отыгрыша: ×30 депозита', es: 'Requisito de apuesta: ×30 tu depósito', zh: '投注要求：存款的×30' },
    color:    '#22c55e',
    cta:      { fr: 'Déposer maintenant', en: 'Deposit now', ru: 'Внести сейчас', es: 'Depositar ahora', zh: '立即存款' },
  },
  {
    tag:      { fr: 'Bonus Reload', en: 'Reload Bonus', ru: 'Бонус Reload', es: 'Bono Reload', zh: '重载奖励' },
    title:    'BONUS 200%',
    badge:    { fr: "Jusqu'à 5 000 €", en: 'Up to €5,000', ru: 'До 5 000 €', es: 'Hasta 5.000 €', zh: '最高5,000€' },
    desc:     { fr: 'Dépôt de 100 € = 300 € dans ta poche.\n3× ta mise pour exploser les jackpots !', en: 'Deposit €100 = €300 in your pocket.\n3× your stake to hit jackpots!', ru: 'Депозит 100 € = 300 € на счёту.\nВ 3 раза больше для джекпотов!', es: '¡100€ depositados = 300€ en tu bolsillo!\n3× tu apuesta para los jackpots.', zh: '存入100€ = 口袋里有300€。\n3倍押注冲击大奖！' },
    wager:    { fr: 'Mise requise : ×35 votre dépôt', en: 'Wagering requirement: ×35 your deposit', ru: 'Требование отыгрыша: ×35 депозита', es: 'Requisito de apuesta: ×35 tu depósito', zh: '投注要求：存款的×35' },
    color:    '#FFD700',
    cta:      { fr: 'Activer le bonus', en: 'Activate bonus', ru: 'Активировать бонус', es: 'Activar bono', zh: '激活奖励' },
  },
  {
    tag:      { fr: 'Bonus VIP', en: 'VIP Bonus', ru: 'VIP Бонус', es: 'Bono VIP', zh: 'VIP奖励' },
    title:    'BONUS 300%',
    badge:    { fr: "Jusqu'à 2 500 €", en: 'Up to €2,500', ru: 'До 2 500 €', es: 'Hasta 2.500 €', zh: '最高2,500€' },
    desc:     { fr: 'Dépôt de 100 € = 400 € crédités.\nRéservé aux joueurs qui voient grand.', en: 'Deposit €100 = €400 credited.\nFor players who think big.', ru: 'Депозит 100 € = 400 € на счёт.\nДля тех, кто думает по-крупному.', es: '100€ depositados = 400€ acreditados.\nPara jugadores que piensan en grande.', zh: '存入100€ = 400€到账。\n为有大志的玩家准备。' },
    wager:    { fr: 'Mise requise : ×37 votre dépôt', en: 'Wagering requirement: ×37 your deposit', ru: 'Требование отыгрыша: ×37 депозита', es: 'Requisito de apuesta: ×37 tu depósito', zh: '投注要求：存款的×37' },
    color:    '#a855f7',
    cta:      { fr: 'Saisir l\'offre', en: 'Claim offer', ru: 'Получить оффер', es: 'Reclamar oferta', zh: '领取优惠' },
  },
];

function sl(obj, lang) { return obj[lang] || obj['fr']; }

// 3D Casino chips stack
function CasinoChips({ color }) {
  // derive lighter/darker shades from the hex color for 3D effect
  return (
    <svg width="160" height="220" viewBox="0 0 160 220" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`chipGrad1_${color.replace('#','')}`} cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor="white" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="black" stopOpacity="0.4"/>
        </radialGradient>
        <radialGradient id={`chipGrad2_${color.replace('#','')}`} cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor="white" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="black" stopOpacity="0.5"/>
        </radialGradient>
        <filter id="chipShadow">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="black" floodOpacity="0.5"/>
        </filter>
        <filter id="chipGlow">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ─── Chip 1 (back, small) ─── */}
      <g transform="translate(95, 155) rotate(-30)" filter="url(#chipShadow)">
        <ellipse cx="0" cy="0" rx="34" ry="10" fill="black" opacity="0.3" transform="translate(0,36)"/>
        {/* Side thickness */}
        <ellipse cx="0" cy="8" rx="34" ry="9" fill={color} opacity="0.6"/>
        <ellipse cx="0" cy="5" rx="34" ry="9" fill={color} opacity="0.7"/>
        <ellipse cx="0" cy="2" rx="34" ry="9" fill={color} opacity="0.8"/>
        {/* Face */}
        <ellipse cx="0" cy="0" rx="34" ry="9" fill={color}/>
        <ellipse cx="0" cy="0" rx="34" ry="9" fill={`url(#chipGrad2_${color.replace('#','')})`}/>
        <ellipse cx="0" cy="0" rx="29" ry="7.5" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4"/>
        <ellipse cx="0" cy="0" rx="20" ry="5" fill="none" stroke="white" strokeWidth="2.5" opacity="0.5"/>
        {[0,45,90,135,180,225,270,315].map(a => {
          const rad = a * Math.PI / 180;
          const x1 = 22 * Math.cos(rad); const y1 = 5.8 * Math.sin(rad);
          const x2 = 28 * Math.cos(rad); const y2 = 7.4 * Math.sin(rad);
          return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>;
        })}
        <text x="0" y="2.5" textAnchor="middle" fontFamily="Orbitron,monospace" fontWeight="900" fontSize="5.5" fill="white" opacity="0.8">€</text>
      </g>

      {/* ─── Chip 2 (middle) ─── */}
      <g transform="translate(60, 175)" filter="url(#chipShadow)">
        <ellipse cx="0" cy="0" rx="42" ry="11" fill="black" opacity="0.3" transform="translate(0,40)"/>
        {[10,8,6,4,2].map((offset, i) => (
          <ellipse key={i} cx="0" cy={offset} rx="42" ry="11" fill={color} opacity={0.5 + i * 0.1}/>
        ))}
        <ellipse cx="0" cy="0" rx="42" ry="11" fill={color}/>
        <ellipse cx="0" cy="0" rx="42" ry="11" fill={`url(#chipGrad1_${color.replace('#','')})`}/>
        <ellipse cx="0" cy="0" rx="36" ry="9.5" fill="none" stroke="white" strokeWidth="1.5" opacity="0.45"/>
        <ellipse cx="0" cy="0" rx="25" ry="6.5" fill="none" stroke="white" strokeWidth="3" opacity="0.55"/>
        {[0,45,90,135,180,225,270,315].map(a => {
          const rad = a * Math.PI / 180;
          const x1 = 27 * Math.cos(rad); const y1 = 7 * Math.sin(rad);
          const x2 = 34 * Math.cos(rad); const y2 = 9 * Math.sin(rad);
          return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.55"/>;
        })}
        <text x="0" y="3" textAnchor="middle" fontFamily="Orbitron,monospace" fontWeight="900" fontSize="7" fill="white" opacity="0.9">€</text>
      </g>

      {/* ─── Chip 3 (front, large) ─── */}
      <g transform="translate(80, 120)" filter="url(#chipGlow)">
        <ellipse cx="0" cy="0" rx="52" ry="14" fill="black" opacity="0.35" transform="translate(0,50)"/>
        {[14,12,10,8,6,4,2].map((offset, i) => (
          <ellipse key={i} cx="0" cy={offset} rx="52" ry="14" fill={color} opacity={0.4 + i * 0.08}/>
        ))}
        <ellipse cx="0" cy="0" rx="52" ry="14" fill={color}/>
        <ellipse cx="0" cy="0" rx="52" ry="14" fill={`url(#chipGrad1_${color.replace('#','')})`}/>
        {/* Outer ring */}
        <ellipse cx="0" cy="0" rx="46" ry="12" fill="none" stroke="white" strokeWidth="2" opacity="0.5"/>
        {/* Inner ring */}
        <ellipse cx="0" cy="0" rx="32" ry="8.5" fill="none" stroke="white" strokeWidth="3.5" opacity="0.6"/>
        {/* Notches */}
        {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => {
          const rad = a * Math.PI / 180;
          const x1 = 34 * Math.cos(rad); const y1 = 9 * Math.sin(rad);
          const x2 = 44 * Math.cos(rad); const y2 = 11.5 * Math.sin(rad);
          return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="3.5" strokeLinecap="round" opacity="0.6"/>;
        })}
        {/* Center text */}
        <text x="0" y="4" textAnchor="middle" fontFamily="Orbitron,monospace" fontWeight="900" fontSize="10" fill="white" opacity="0.95" style={{filter:`drop-shadow(0 0 4px white)`}}>€</text>
      </g>

      {/* Reflection/glow under the stack */}
      <ellipse cx="80" cy="210" rx="55" ry="8" fill={color} opacity="0.15"/>
    </svg>
  );
}

export default function F1Banner() {
  const lang = useLang();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true);
      setTimeout(() => { setCurrent(c => (c + 1) % SLIDES.length); setAnimating(false); }, 300);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="relative overflow-hidden rounded-3xl border"
      style={{
        background: 'linear-gradient(135deg, #050505 0%, #0d1a0d 60%, #0d0510 100%)',
        minHeight: 260,
        borderColor: slide.color + '44',
        transition: 'border-color 0.5s ease',
      }}>

      {/* Subtle grid lines */}
      <div className="absolute inset-0 opacity-[0.04]">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute w-full h-px bg-white" style={{ top: `${10 + i * 12}%` }} />
        ))}
      </div>

      {/* Color glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse at 80% 50%, ${slide.color}18 0%, transparent 55%)`,
        transition: 'background 0.6s ease',
      }} />

      {/* Chips — right side */}
      <div className="absolute right-4 bottom-0 opacity-80 sm:opacity-95 pointer-events-none transition-opacity duration-500">
        <CasinoChips color={slide.color} />
      </div>

      {/* Content */}
      <div
        className="relative z-10 p-7 max-w-xs sm:max-w-sm"
        style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(6px)' : 'translateY(0)', transition: 'opacity 0.3s, transform 0.3s' }}>

        {/* Tag */}
        <span className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 border"
          style={{ color: slide.color, borderColor: slide.color + '55', background: slide.color + '18' }}>
          {sl(slide.tag, lang)}
        </span>

        {/* Title */}
         <h1 className="font-orbitron font-black leading-none mb-0.5"
           style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: 'white', textShadow: `0 0 30px ${slide.color}88, 0 0 60px ${slide.color}33` }}>
           {slide.title}
         </h1>

        {/* Badge */}
         <div className="inline-block mt-1 mb-2 px-3 py-1 rounded-full font-orbitron font-black text-xs border"
          style={{ color: slide.color, borderColor: slide.color + '66', background: slide.color + '18' }}>
          {sl(slide.badge, lang)}
        </div>

        {/* Description */}
        <p className="text-gray-400 text-[11px] leading-snug whitespace-pre-line mb-3">
          {sl(slide.desc, lang)}
        </p>

        {/* CTA + En savoir plus */}
        <div className="flex items-center gap-3 flex-wrap">
          <a href="/TopUpPayment"
            className="inline-flex items-center px-4 py-2 rounded-xl font-orbitron font-bold text-[11px] transition-all hover:brightness-110 active:scale-95"
            style={{ background: slide.color, color: '#000', boxShadow: `0 0 18px ${slide.color}55` }}>
            {sl(slide.cta, lang)}
          </a>
          <a href="/BonusConditions"
            className="inline-flex items-center text-[10px] font-semibold border rounded-xl px-3 py-2 transition-all hover:brightness-125"
            style={{ color: slide.color, borderColor: slide.color + '55', background: slide.color + '12' }}>
            En savoir plus
          </a>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-7 flex gap-1.5 z-20">
        {SLIDES.map((s, i) => (
          <button key={i}
            onClick={() => { setAnimating(true); setTimeout(() => { setCurrent(i); setAnimating(false); }, 200); }}
            className="rounded-full transition-all duration-300"
            style={{ width: i === current ? 20 : 6, height: 6, background: i === current ? slide.color : '#ffffff22' }} />
        ))}
      </div>
    </div>
  );
}
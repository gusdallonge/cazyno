import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, Trophy, User, LayoutGrid } from 'lucide-react';

const TABS = [
  { path: '/dashboard', icon: LayoutGrid, label: 'Browse' },
  { path: '/dashboard/casino', icon: Gamepad2, label: 'Casino' },
  { path: '/dashboard/sport', icon: Trophy, label: 'Sports' },
  { path: '/dashboard/stats', icon: User, label: 'Profil' },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-[#111a25]/95 backdrop-blur-md border-t border-[#1a2a38]">
      <div className="h-full flex items-center justify-around px-2">
        {TABS.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all
                ${active ? 'text-primary' : 'text-[#94a3b8]'}`}
            >
              <Icon className={`w-5 h-5 ${active ? 'drop-shadow-[0_0_6px_rgba(0,255,102,0.5)]' : ''}`} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

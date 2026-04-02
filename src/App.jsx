import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Layout from './components/Layout';
import PublicLayout from './components/PublicLayout';
import AuthModal from './components/AuthModal';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Casino from './pages/Casino';
import Dice from './pages/Dice';
import Blackjack from './pages/Blackjack';
import Plinko from './pages/Plinko';
import Sport from './pages/Sport';
import Admin from './pages/Admin';
import Leaderboard from './pages/Leaderboard';
import Stats from './pages/Stats';
import Transactions from './pages/Transactions';
import Affiliate from './pages/Affiliate';
import BonusConditions from './pages/BonusConditions';
import PulseBomb from './pages/PulseBomb';
import CrashGame from './pages/CrashGame';
import ChickenDrop from './pages/ChickenDrop';
import Roulette from './pages/Roulette';
import DemoGame from './pages/DemoGame';
import Trader from './pages/Trader';
import Mines from './pages/Mines';
import Limbo from './pages/Limbo';
import Keno from './pages/Keno';
import Tower from './pages/Tower';
import Coinflip from './pages/Coinflip';
import HiLo from './pages/HiLo';
import Wheel from './pages/Wheel';
import VideoPoker from './pages/VideoPoker';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import VipClub from './pages/VipClub';
import Promotions from './pages/Promotions';
import RewardsCalendar from './pages/RewardsCalendar';
import Onboarding from './pages/Onboarding';
import Terms from './pages/legal/Terms';
import Privacy from './pages/legal/Privacy';
import ResponsibleGambling from './pages/legal/ResponsibleGambling';
import AmlPolicy from './pages/legal/AmlPolicy';
import Fairness from './pages/legal/Fairness';
import KycInfo from './pages/legal/KycInfo';
import About from './pages/legal/About';
import Complaints from './pages/legal/Complaints';
import CityPage from './pages/CityPage';
import Blog from './pages/Blog';
import SoundBrowser from './pages/SoundBrowser';
import JacobStreaming from './pages/JacobStreaming';

function SmartLanding() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Landing />;
}

function ProtectedRoute({ children }) {
  const { isLoadingAuth, isAuthenticated } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0d1117]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-[#00e701]/30 border-t-[#00e701] rounded-full animate-spin" />
          <span className="font-orbitron text-xs text-[#8B949E] tracking-widest">LOADING</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Landing />
        <AuthModal onClose={() => setShowAuth(false)} />
      </>
    );
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            {/* PUBLIC — no auth needed */}
            <Route path="/" element={<SmartLanding />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/jacob" element={<JacobStreaming />} />

            {/* PUBLIC PAGES — wrapped in PublicLayout (sidebar + header) */}
            <Route element={<PublicLayout />}>
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/responsible-gambling" element={<ResponsibleGambling />} />
              <Route path="/aml-policy" element={<AmlPolicy />} />
              <Route path="/fairness" element={<Fairness />} />
              <Route path="/kyc" element={<KycInfo />} />
              <Route path="/about" element={<About />} />
              <Route path="/complaints" element={<Complaints />} />
              <Route path="/city/:country/:city" element={<CityPage />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<Blog />} />
              <Route path="/sounds" element={<SoundBrowser />} />
            </Route>

            {/* DEMO — play without login */}
            <Route path="/demo/roulette" element={<DemoGame />}><Route index element={<Roulette />} /></Route>
            <Route path="/demo/dice" element={<DemoGame />}><Route index element={<Dice />} /></Route>
            <Route path="/demo/blackjack" element={<DemoGame />}><Route index element={<Blackjack />} /></Route>
            <Route path="/demo/plinko" element={<DemoGame />}><Route index element={<Plinko />} /></Route>
            <Route path="/demo/crash" element={<DemoGame />}><Route index element={<CrashGame />} /></Route>
            <Route path="/demo/pulse-bomb" element={<DemoGame />}><Route index element={<PulseBomb />} /></Route>
            <Route path="/demo/chicken-drop" element={<DemoGame />}><Route index element={<ChickenDrop />} /></Route>
            <Route path="/demo/trader" element={<DemoGame />}><Route index element={<Trader />} /></Route>
            <Route path="/demo/mines" element={<DemoGame />}><Route index element={<Mines />} /></Route>
            <Route path="/demo/limbo" element={<DemoGame />}><Route index element={<Limbo />} /></Route>
            <Route path="/demo/keno" element={<DemoGame />}><Route index element={<Keno />} /></Route>
            <Route path="/demo/tower" element={<DemoGame />}><Route index element={<Tower />} /></Route>
            <Route path="/demo/coinflip" element={<DemoGame />}><Route index element={<Coinflip />} /></Route>
            <Route path="/demo/hilo" element={<DemoGame />}><Route index element={<HiLo />} /></Route>
            <Route path="/demo/wheel" element={<DemoGame />}><Route index element={<Wheel />} /></Route>
            <Route path="/demo/video-poker" element={<DemoGame />}><Route index element={<VideoPoker />} /></Route>

            {/* PROTECTED — auth required */}
            <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Home />} />
              <Route path="casino" element={<Casino />} />
              <Route path="casino/roulette" element={<Roulette />} />
              <Route path="casino/blackjack" element={<Blackjack />} />
              <Route path="casino/dice" element={<Dice />} />
              <Route path="casino/plinko" element={<Plinko />} />
              <Route path="casino/crash" element={<CrashGame />} />
              <Route path="casino/pulse-bomb" element={<PulseBomb />} />
              <Route path="casino/chicken-drop" element={<ChickenDrop />} />
              <Route path="casino/trader" element={<Trader />} />
              <Route path="casino/mines" element={<Mines />} />
              <Route path="casino/limbo" element={<Limbo />} />
              <Route path="casino/keno" element={<Keno />} />
              <Route path="casino/tower" element={<Tower />} />
              <Route path="casino/coinflip" element={<Coinflip />} />
              <Route path="casino/hilo" element={<HiLo />} />
              <Route path="casino/wheel" element={<Wheel />} />
              <Route path="casino/video-poker" element={<VideoPoker />} />
              <Route path="sport" element={<Sport />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="stats" element={<Stats />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="affiliate" element={<Affiliate />} />
              <Route path="bonus" element={<BonusConditions />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="vip" element={<VipClub />} />
              <Route path="promotions" element={<Promotions />} />
              <Route path="rewards" element={<RewardsCalendar />} />
              <Route path="onboarding" element={<Onboarding />} />
              <Route path="admin" element={<Admin />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;

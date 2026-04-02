import { Auth } from './services/auth';
import { UserProfile, getTotalWagered } from './services/userProfile';
import { GameRound } from './services/gameRound';
import { SupportTicket } from './services/supportTicket';
import { AppUser } from './services/appUser';
import { Integrations } from './services/integrations';
import { Leaderboard } from './services/leaderboard';
import { Rewards } from './services/rewards';

export const api = {
  auth: Auth,
  entities: {
    UserProfile,
    GameRound,
    SupportTicket,
    User: AppUser,
  },
  integrations: {
    Core: Integrations,
  },
  leaderboard: Leaderboard,
  rewards: Rewards,
};

export { getTotalWagered };

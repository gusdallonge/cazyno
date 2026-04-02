/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Admin from './pages/Admin';
import Affiliate from './pages/Affiliate';
import Blackjack from './pages/Blackjack';
import BonusConditions from './pages/BonusConditions';
import Casino from './pages/Casino';
import CrashGame from './pages/CrashGame';
import Dice from './pages/Dice';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import Plinko from './pages/Plinko';
import PulseBomb from './pages/PulseBomb';
import Roulette from './pages/Roulette';
import Sport from './pages/Sport';
import Stats from './pages/Stats';
import TopUpPayment from './pages/TopUpPayment';
import Transactions from './pages/Transactions';
import ChickenDrop from './pages/ChickenDrop';
import Trader from './pages/Trader';


export const PAGES = {
    "Admin": Admin,
    "Affiliate": Affiliate,
    "Blackjack": Blackjack,
    "BonusConditions": BonusConditions,
    "Casino": Casino,
    "CrashGame": CrashGame,
    "Dice": Dice,
    "Home": Home,
    "Leaderboard": Leaderboard,
    "Plinko": Plinko,
    "PulseBomb": PulseBomb,
    "Roulette": Roulette,
    "Sport": Sport,
    "Stats": Stats,
    "TopUpPayment": TopUpPayment,
    "Transactions": Transactions,
    "ChickenDrop": ChickenDrop,
    "Trader": Trader,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};
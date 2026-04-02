/**
 * Server-side game engine.
 *
 * Every function receives:
 *   result  - a deterministic float in [0, 1) from provablyFair.generateResult
 *   params  - game-specific parameters supplied by the player
 *
 * Every function returns:
 *   { won: boolean, multiplier: number, details: object }
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Expand a single 0-1 float into N independent sub-results via hashing offsets. */
function expandResult(result, count) {
  const results = [result];
  for (let i = 1; i < count; i++) {
    // Simple deterministic expansion: fraction part of result * large prime
    const v = (result * (7919 + i * 104729)) % 1;
    results.push(Math.abs(v));
  }
  return results;
}

// ─── Dice ───────────────────────────────────────────────────────────────────

/**
 * Over/Under 50 dice game.
 * House edge: 2% (payout 1.96x instead of 2x).
 * @param {number} result 0-1
 * @param {{ choice: 'over'|'under' }} params
 */
export function dice(result, { choice = 'over' } = {}) {
  const number = parseFloat((result * 100).toFixed(2)); // 0.00 - 99.99
  const MULTIPLIER = 1.96; // 2% house edge
  const won =
    choice === 'over' ? number > 50 : number < 50;

  return {
    won,
    multiplier: won ? MULTIPLIER : 0,
    details: { number, choice },
  };
}

// ─── Blackjack (simplified) ─────────────────────────────────────────────────

function drawCard(r) {
  // r is 0-1, map to 1-13 (A,2..10,J,Q,K)
  const rank = Math.floor(r * 13) + 1;
  const value = rank >= 10 ? 10 : rank; // face cards = 10, ace handled separately
  return { rank, value, isAce: rank === 1 };
}

function handValue(cards) {
  let total = cards.reduce((s, c) => s + c.value, 0);
  let aces = cards.filter((c) => c.isAce).length;
  // Count aces as 11 when beneficial
  while (aces > 0 && total + 10 <= 21) {
    total += 10;
    aces--;
  }
  return total;
}

/**
 * Simplified Blackjack.
 * result is expanded into multiple sub-results for card draws.
 * @param {number} result 0-1
 * @param {{ action: 'stand'|'hit' }} params
 */
export function blackjack(result, { action = 'stand' } = {}) {
  const draws = expandResult(result, 10);
  let idx = 0;

  // Deal: player 2 cards, dealer 2 cards
  const playerCards = [drawCard(draws[idx++]), drawCard(draws[idx++])];
  const dealerCards = [drawCard(draws[idx++]), drawCard(draws[idx++])];

  // Player hits
  if (action === 'hit') {
    playerCards.push(drawCard(draws[idx++]));
  }

  const playerTotal = handValue(playerCards);

  // Dealer draws to 17
  while (handValue(dealerCards) < 17 && idx < draws.length) {
    dealerCards.push(drawCard(draws[idx++]));
  }
  const dealerTotal = handValue(dealerCards);

  let won = false;
  let multiplier = 0;

  if (playerTotal > 21) {
    // Player bust
    won = false;
    multiplier = 0;
  } else if (playerTotal === 21 && playerCards.length === 2) {
    // Natural blackjack
    won = true;
    multiplier = 2.5;
  } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
    won = true;
    multiplier = 2;
  } else if (playerTotal === dealerTotal) {
    // Push
    won = false;
    multiplier = 1; // bet returned
  } else {
    won = false;
    multiplier = 0;
  }

  return {
    won,
    multiplier,
    details: { playerCards, dealerCards, playerTotal, dealerTotal, action },
  };
}

// ─── Plinko ─────────────────────────────────────────────────────────────────

const PLINKO_PAYOUTS = {
  normal: [8.9, 3, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 3, 8.9],
  medium: [18, 4, 1.7, 1.3, 1, 0.4, 0.4, 1, 1.3, 1.7, 4, 18],
  expert: [110, 25, 9, 2, 1.4, 0.2, 0.2, 0.2, 1.4, 2, 9, 25, 110],
};

/**
 * Plinko: 14 rows, ball bounces left/right each row.
 * @param {number} result 0-1
 * @param {{ mode: 'normal'|'medium'|'expert' }} params
 */
export function plinko(result, { mode = 'normal' } = {}) {
  const payouts = PLINKO_PAYOUTS[mode] || PLINKO_PAYOUTS.normal;
  const rows = 14;
  const draws = expandResult(result, rows);

  // Each bounce: < 0.5 = left, >= 0.5 = right. Count rights = binomial index.
  let rights = 0;
  const path = [];
  for (let i = 0; i < rows; i++) {
    const goRight = draws[i] >= 0.5;
    if (goRight) rights++;
    path.push(goRight ? 'R' : 'L');
  }

  // Map binomial outcome to bucket index (scale to payout array length)
  const bucketIndex = Math.min(
    Math.round((rights / rows) * (payouts.length - 1)),
    payouts.length - 1
  );
  const multiplier = payouts[bucketIndex];

  return {
    won: multiplier > 1,
    multiplier,
    details: { path, bucketIndex, mode },
  };
}

// ─── Crash / PulseBomb ──────────────────────────────────────────────────────

/**
 * Crash game. House edge ~3%.
 * crash_point = 0.97 / result  (capped at 1000x).
 * If result < 0.03 the game insta-crashes at 1.00x.
 */
export function crash(result, { cashoutAt = 2 } = {}) {
  let crashPoint;
  if (result < 0.03) {
    crashPoint = 1.0;
  } else {
    crashPoint = parseFloat(Math.min(0.97 / result, 1000).toFixed(2));
  }

  const won = cashoutAt <= crashPoint;
  const multiplier = won ? cashoutAt : 0;

  return {
    won,
    multiplier,
    details: { crashPoint, cashoutAt },
  };
}

/** PulseBomb is the same mechanic as crash. */
export function pulseBomb(result, params = {}) {
  return crash(result, params);
}

// ─── Roulette ───────────────────────────────────────────────────────────────

const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

/**
 * European Roulette (0-36, single zero).
 * @param {number} result 0-1
 * @param {{ bets: Array<{type: string, value: any, amount: number}> }} params
 *   type can be: 'number', 'red', 'black', 'odd', 'even', 'high', 'low',
 *                'dozen1', 'dozen2', 'dozen3', 'col1', 'col2', 'col3'
 */
export function roulette(result, { bets = [] } = {}) {
  const number = Math.floor(result * 37); // 0-36
  const isRed = RED_NUMBERS.has(number);
  const isBlack = number !== 0 && !isRed;
  const isOdd = number !== 0 && number % 2 === 1;
  const isEven = number !== 0 && number % 2 === 0;
  const isLow = number >= 1 && number <= 18;
  const isHigh = number >= 19 && number <= 36;
  const dozen = number === 0 ? 0 : Math.ceil(number / 12); // 1,2,3
  const column = number === 0 ? 0 : ((number - 1) % 3) + 1; // 1,2,3

  let totalMultiplier = 0;
  let totalWon = 0;
  let totalBet = 0;
  const betResults = [];

  for (const bet of bets) {
    const amt = bet.amount || 1;
    totalBet += amt;
    let win = false;
    let payout = 0;

    switch (bet.type) {
      case 'number':
        win = number === Number(bet.value);
        payout = win ? 36 : 0;
        break;
      case 'red':
        win = isRed;
        payout = win ? 2 : 0;
        break;
      case 'black':
        win = isBlack;
        payout = win ? 2 : 0;
        break;
      case 'odd':
        win = isOdd;
        payout = win ? 2 : 0;
        break;
      case 'even':
        win = isEven;
        payout = win ? 2 : 0;
        break;
      case 'high':
        win = isHigh;
        payout = win ? 2 : 0;
        break;
      case 'low':
        win = isLow;
        payout = win ? 2 : 0;
        break;
      case 'dozen1':
        win = dozen === 1;
        payout = win ? 3 : 0;
        break;
      case 'dozen2':
        win = dozen === 2;
        payout = win ? 3 : 0;
        break;
      case 'dozen3':
        win = dozen === 3;
        payout = win ? 3 : 0;
        break;
      case 'col1':
        win = column === 1;
        payout = win ? 3 : 0;
        break;
      case 'col2':
        win = column === 2;
        payout = win ? 3 : 0;
        break;
      case 'col3':
        win = column === 3;
        payout = win ? 3 : 0;
        break;
      default:
        break;
    }

    totalWon += payout * amt;
    betResults.push({ ...bet, win, payout });
  }

  totalMultiplier = totalBet > 0 ? totalWon / totalBet : 0;

  return {
    won: totalWon > totalBet,
    multiplier: totalMultiplier,
    details: { number, isRed, betResults },
  };
}

// ─── Chicken Drop ───────────────────────────────────────────────────────────

/**
 * Chicken Drop: a grid with safe spots and cars.
 * Player advances rows, picking safe spots to increase multiplier.
 * @param {number} result 0-1
 * @param {{ difficulty: number, step: number }} params
 *   difficulty = number of cars per row (1-4 out of 5 columns)
 *   step = current row (0-indexed)
 */
export function chickenDrop(result, { difficulty = 1, step = 0 } = {}) {
  const columns = 5;
  const carCount = Math.min(Math.max(difficulty, 1), columns - 1);
  const draws = expandResult(result, columns);

  // Determine car positions: sort draw indices, pick lowest carCount as cars
  const indexed = draws.map((v, i) => ({ v, i }));
  indexed.sort((a, b) => a.v - b.v);
  const carPositions = new Set(indexed.slice(0, carCount).map((x) => x.i));

  // Safe positions
  const safePositions = [];
  for (let i = 0; i < columns; i++) {
    if (!carPositions.has(i)) safePositions.push(i);
  }

  // Multiplier grows per step based on difficulty
  const safeOdds = (columns - carCount) / columns;
  const baseMultiplier = parseFloat((0.97 / safeOdds).toFixed(4));
  const stepMultiplier = parseFloat(Math.pow(baseMultiplier, step + 1).toFixed(4));

  return {
    won: true, // The round result only tells positions; won/lost depends on player pick
    multiplier: stepMultiplier,
    details: {
      carPositions: [...carPositions],
      safePositions,
      step,
      difficulty,
    },
  };
}

// ─── Trader ─────────────────────────────────────────────────────────────────

/**
 * Simplified trader: predict up or down.
 * Result determines price movement magnitude.
 * @param {number} result 0-1
 * @param {{ direction: 'up'|'down' }} params
 */
export function trader(result, { direction = 'up' } = {}) {
  // Price moves up if result > 0.49 (slight house edge), down otherwise
  const priceUp = result > 0.49;
  const magnitude = parseFloat((result * 10).toFixed(2));

  const won =
    (direction === 'up' && priceUp) || (direction === 'down' && !priceUp);
  const multiplier = won ? 1.96 : 0; // ~2% house edge

  return {
    won,
    multiplier,
    details: { priceUp, magnitude, direction },
  };
}

// ─── Mines ──────────────────────────────────────────────────────────────────

/**
 * Mines: 5x5 grid with hidden mines.
 * @param {number} result 0-1
 * @param {{ mineCount: number, revealed: number }} params
 *   mineCount = number of mines (1-24)
 *   revealed  = how many safe tiles the player has already revealed
 */
export function mines(result, { mineCount = 3, revealed = 0 } = {}) {
  const totalTiles = 25;
  mineCount = Math.min(Math.max(mineCount, 1), 24);

  // Generate mine positions deterministically
  const draws = expandResult(result, totalTiles);
  const indexed = draws.map((v, i) => ({ v, i }));
  indexed.sort((a, b) => a.v - b.v);
  const minePositions = new Set(indexed.slice(0, mineCount).map((x) => x.i));

  // Calculate multiplier for the current reveal count
  // Each safe reveal: multiplier = product of (totalTiles - i) / (totalTiles - mineCount - i)
  // with house edge factor 0.97
  const safeTiles = totalTiles - mineCount;
  let multiplier = 0.97;
  for (let i = 0; i <= revealed; i++) {
    multiplier *= (totalTiles - i) / (totalTiles - mineCount - i);
  }
  multiplier = parseFloat(multiplier.toFixed(4));

  return {
    won: true, // Actual win/loss depends on which tile the player picks
    multiplier,
    details: { minePositions: [...minePositions], mineCount, revealed, totalTiles },
  };
}

// ─── Limbo ──────────────────────────────────────────────────────────────────

/**
 * Limbo: result must exceed target multiplier.
 * Payout = target * 0.99 (1% house edge).
 * @param {number} result 0-1
 * @param {{ target: number }} params
 */
export function limbo(result, { target = 2 } = {}) {
  // Game result: 0.99 / result (same as crash formula but with 1% edge)
  const gameResult = result < 0.01 ? 100 : parseFloat(Math.min(0.99 / result, 10000).toFixed(2));
  const won = gameResult >= target;
  const multiplier = won ? parseFloat((target * 0.99).toFixed(4)) : 0;

  return {
    won,
    multiplier,
    details: { gameResult, target },
  };
}

// ─── Engine map ─────────────────────────────────────────────────────────────

const GAMES = {
  dice,
  blackjack,
  plinko,
  crash,
  roulette,
  pulseBomb,
  pulse_bomb: pulseBomb,
  chickenDrop,
  chicken_drop: chickenDrop,
  trader,
  mines,
  limbo,
};

/**
 * Resolve a game by name. Returns the game function or null.
 */
export function getGame(name) {
  // Normalise: lowercase, strip spaces/hyphens
  const key = name.toLowerCase().replace(/[\s-]/g, '');
  return GAMES[key] || GAMES[name] || null;
}

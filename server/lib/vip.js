// ─── VIP System: 24 micro-tiers ───

const TIERS = [
  { group: 'Bronze',   sub: 1, xp: 0,           rakeback: 5,  bonus: 5 },
  { group: 'Bronze',   sub: 2, xp: 5000,        rakeback: 5,  bonus: 15 },
  { group: 'Bronze',   sub: 3, xp: 15000,       rakeback: 5,  bonus: 30 },
  { group: 'Silver',   sub: 1, xp: 30000,       rakeback: 7,  bonus: 50 },
  { group: 'Silver',   sub: 2, xp: 60000,       rakeback: 7,  bonus: 80 },
  { group: 'Silver',   sub: 3, xp: 100000,      rakeback: 7,  bonus: 120 },
  { group: 'Gold',     sub: 1, xp: 200000,      rakeback: 10, bonus: 200 },
  { group: 'Gold',     sub: 2, xp: 400000,      rakeback: 10, bonus: 350 },
  { group: 'Gold',     sub: 3, xp: 700000,      rakeback: 10, bonus: 500 },
  { group: 'Platinum', sub: 1, xp: 1000000,     rakeback: 12, bonus: 800 },
  { group: 'Platinum', sub: 2, xp: 2000000,     rakeback: 12, bonus: 1200 },
  { group: 'Platinum', sub: 3, xp: 3500000,     rakeback: 12, bonus: 2000 },
  { group: 'Diamond',  sub: 1, xp: 5000000,     rakeback: 15, bonus: 3000 },
  { group: 'Diamond',  sub: 2, xp: 8000000,     rakeback: 15, bonus: 5000 },
  { group: 'Diamond',  sub: 3, xp: 12000000,    rakeback: 15, bonus: 8000 },
  { group: 'Emerald',  sub: 1, xp: 18000000,    rakeback: 18, bonus: 12000 },
  { group: 'Emerald',  sub: 2, xp: 25000000,    rakeback: 18, bonus: 18000 },
  { group: 'Emerald',  sub: 3, xp: 35000000,    rakeback: 18, bonus: 25000 },
  { group: 'Ruby',     sub: 1, xp: 50000000,    rakeback: 20, bonus: 35000 },
  { group: 'Ruby',     sub: 2, xp: 75000000,    rakeback: 20, bonus: 50000 },
  { group: 'Ruby',     sub: 3, xp: 100000000,   rakeback: 20, bonus: 70000 },
  { group: 'Obsidian', sub: 1, xp: 150000000,   rakeback: 25, bonus: null },
  { group: 'Obsidian', sub: 2, xp: 250000000,   rakeback: 25, bonus: null },
  { group: 'Obsidian', sub: 3, xp: 500000000,   rakeback: 25, bonus: null },
];

/**
 * Get the current VIP tier for a given XP amount.
 * Returns the highest tier the user qualifies for.
 */
export function getTier(xp) {
  let current = TIERS[0];
  for (const tier of TIERS) {
    if (xp >= tier.xp) {
      current = tier;
    } else {
      break;
    }
  }
  return current;
}

/**
 * Get the rakeback percentage for a given XP amount.
 */
export function getRakebackRate(xp) {
  return getTier(xp).rakeback;
}

/**
 * Get the next tier after the current one, or null if at max.
 */
export function getNextTier(xp) {
  const current = getTier(xp);
  const currentIndex = TIERS.indexOf(current);
  if (currentIndex >= TIERS.length - 1) return null;
  return TIERS[currentIndex + 1];
}

/**
 * Check if a level-up occurred between oldXp and newXp.
 * Returns { leveledUp, newTier, bonus } or null if no level-up.
 */
export function checkLevelUp(oldXp, newXp) {
  const oldTier = getTier(oldXp);
  const newTier = getTier(newXp);

  if (oldTier === newTier) return null;

  return {
    leveledUp: true,
    newTier,
    bonus: newTier.bonus,
  };
}

export { TIERS };

export interface Sm2Input {
  interval: number;
  repetition: number;
  efactor: number;
  quality: number;
  hideFuzz?: boolean;
}

export interface Sm2Output {
  interval: number;
  repetition: number;
  efactor: number;
  nextReview: Date;
}

/**
 * Calculates the next review schedule using the SM-2 algorithm with improvements.
 * Improvements:
 * - Minimum E-Factor is 1.3 (as per SM-2 spec).
 * - Adds "fuzz" (random variance) to intervals > 4 days to prevent card clumping.
 * - Standardizes review time to 4:00 AM next day (start of day).
 * - Differentiates Hard/Good/Easy immediately for better interval spacing.
 */
export function calculateSm2(input: Sm2Input): Sm2Output {
  let { interval, repetition, efactor, quality, hideFuzz } = input;
  let nextInterval = 0;
  let nextRepetition = 0;
  let nextEfactor = efactor;

  if (quality >= 3) {
    if (repetition === 0) {
      if (quality === 3) nextInterval = 1; // Hard
      else if (quality === 4) nextInterval = 1; // Good
      else if (quality === 5) nextInterval = 4; // Easy
      else nextInterval = 1;
    } else if (repetition === 1) {
      if (quality === 3) nextInterval = 3; // Hard
      else if (quality === 4) nextInterval = 6; // Good
      else if (quality === 5) nextInterval = 8; // Easy
      else nextInterval = 6;
    } else {
      let multiplier = efactor;
      if (quality === 3) multiplier = 1.2; // Hard scales slowly
      else if (quality === 4) multiplier = efactor; // Good scales normally
      else if (quality === 5) multiplier = efactor * 1.3; // Easy gets bonus

      nextInterval = Math.round(interval * multiplier);
    }
    nextRepetition = repetition + 1;
  } else {
    nextInterval = 1;
    nextRepetition = 0;
  }

  // Calculate new Ease Factor: EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
  nextEfactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (nextEfactor < 1.3) nextEfactor = 1.3;

  // --- FUZZ LOGIC ---
  // Only fuzz if interval is large enough (> 4 days) to avoid messing up short-term learning
  // UI shouldn't use fuzz when predicting button labels.
  if (!hideFuzz && nextInterval > 4) {
    const fuzzFactor = 0.05; // 5% variance
    const fuzz = Math.ceil(nextInterval * fuzzFactor);
    // Randomly add or subtract fuzz, but ensure interval checks logic
    const randomFuzz = Math.floor(Math.random() * (fuzz * 2 + 1)) - fuzz;
    nextInterval += randomFuzz;

    // Ensure interval doesn't drop below previous repetition logic boundaries too much, 
    // but essential constraint is > 0
    if (nextInterval < 1) nextInterval = 1;
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);
  // Set to 4:00 AM to align with day start logic
  nextReviewDate.setHours(4, 0, 0, 0);

  return {
    interval: nextInterval,
    repetition: nextRepetition,
    efactor: nextEfactor,
    nextReview: nextReviewDate
  };
}

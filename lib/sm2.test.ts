import { describe, it, expect } from 'vitest';
import { calculateSm2 } from './sm2';

/**
 * SM-2 Algorithm Implementation Details (for reference):
 * - Initial state: interval=0, repetition=0, efactor=2.5
 * - Correct (Q >= 3):
 *   - Repetition 0 -> Int=1, Rep=1
 *   - Repetition 1 -> Int=6, Rep=2
 *   - Repetition > 1 -> Int=Round(Int * EF), Rep++
 * - Incorrect (Q < 3):
 *   - Int=1, Rep=0, EF down
 * - EF formula: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
 * - EF min: 1.3
 */

describe('SRS (SM-2) Algorithm Tests', () => {

    describe('1. Initial State & Basic Ratings', () => {
        it('should correctly handle a new word (Initial State)', () => {
            // Simulator for a new word added to DB
            const initialWord = { interval: 0, repetition: 0, efactor: 2.5 };

            // Test "Easy" (Quality 5) on first appearance
            const result = calculateSm2({ ...initialWord, quality: 5 });
            expect(result.interval).toBe(1);
            expect(result.repetition).toBe(1);
            expect(result.efactor).toBeGreaterThan(2.5); // EF should increase
        });

        it('should handle "Forgot" (Quality 0)', () => {
            const result = calculateSm2({ interval: 10, repetition: 5, efactor: 2.8, quality: 0 });
            expect(result.interval).toBe(1); // Should reset to daily review
            expect(result.repetition).toBe(0); // Should reset repetition
            expect(result.efactor).toBeLessThan(2.8 - 0.5); // Should drop significantly
        });

        it('should handle "Hard" (Quality 3)', () => {
            const result = calculateSm2({ interval: 10, repetition: 5, efactor: 2.5, quality: 3 });
            expect(result.repetition).toBe(6);
            expect(result.efactor).toBeLessThan(2.5); // Quality 3 decreases EF
        });
    });

    describe('2. Rating Sequences', () => {
        it('should follow the correct timeline for "Easy -> Forgot -> Hard -> Easy"', () => {
            // Day 0: New word, User rated Easy (5)
            let state = calculateSm2({ interval: 0, repetition: 0, efactor: 2.5, quality: 5 });
            expect(state.interval).toBe(1);
            expect(state.repetition).toBe(1);

            // Day 1: User reviewed, Forgot (0)
            state = calculateSm2({ interval: state.interval, repetition: state.repetition, efactor: state.efactor, quality: 0 });
            expect(state.interval).toBe(1);
            expect(state.repetition).toBe(0);
            const efAfteForgot = state.efactor;

            // Day 2: User reviewed again, Hard (3)
            state = calculateSm2({ interval: state.interval, repetition: state.repetition, efactor: state.efactor, quality: 3 });
            expect(state.interval).toBe(1);
            expect(state.repetition).toBe(1);
            expect(state.efactor).toBeLessThan(efAfteForgot);

            // Next session (Day 3ish): User rated Easy (5)
            state = calculateSm2({ interval: state.interval, repetition: state.repetition, efactor: state.efactor, quality: 5 });
            // Repetition was 1, so next interval is 6 (+/- fuzz 1)
            expect(state.interval).toBeGreaterThanOrEqual(5);
            expect(state.interval).toBeLessThanOrEqual(7);
            expect(state.repetition).toBe(2);
        });
    });

    describe('3. Boundary Cases', () => {
        it('should clamp E-Factor to a minimum of 1.3 even with continuous forgetting', () => {
            let state = { interval: 1, repetition: 1, efactor: 1.4 };

            // Forget once
            let result = calculateSm2({ ...state, quality: 0 });
            // Forget again using result
            result = calculateSm2({
                interval: result.interval,
                repetition: result.repetition,
                efactor: result.efactor,
                quality: 0
            });

            expect(result.efactor).toBe(1.3);
        });

        it('should increase E-Factor steadily with continuous Easy ratings', () => {
            let state = { interval: 1, repetition: 1, efactor: 2.5 };

            // 5 consecutive Easy ratings
            for (let i = 0; i < 5; i++) {
                state = calculateSm2({ ...state, quality: 5 });
            }

            expect(state.efactor).toBeGreaterThan(3.0);
            expect(state.interval).toBeGreaterThan(50); // Compounding effect
        });
    });

    describe('4. Aggregate Simulation (Distribution Test)', () => {
        it('should simulate a 30-day review cycle for 100 words', () => {
            const NUM_WORDS = 100;
            const DAYS = 30;

            const todayStart = new Date();
            todayStart.setHours(4, 0, 0, 0);

            // Pool of 100 new words, all due today
            let words = Array.from({ length: NUM_WORDS }, () => ({
                id: Math.random().toString(),
                interval: 0,
                repetition: 0,
                efactor: 2.5,
                nextReview: new Date(todayStart)
            }));

            const reviewsPerDay: number[] = new Array(DAYS).fill(0);

            for (let day = 0; day < DAYS; day++) {
                const currentDay = new Date(todayStart);
                currentDay.setDate(currentDay.getDate() + day);

                words.forEach((word, index) => {
                    if (word.nextReview <= currentDay) {
                        reviewsPerDay[day]++;

                        // Simulate random user performance: 70% Good/Easy, 20% Hard, 10% Forgot
                        const rand = Math.random();
                        let quality = 5;
                        if (rand < 0.1) quality = 0;
                        else if (rand < 0.3) quality = 3;
                        else if (rand < 0.6) quality = 4;

                        const result = calculateSm2({
                            interval: word.interval,
                            repetition: word.repetition,
                            efactor: word.efactor,
                            quality
                        });

                        words[index] = {
                            ...word,
                            interval: result.interval,
                            repetition: result.repetition,
                            efactor: result.efactor,
                            nextReview: result.nextReview
                        };
                    }
                });
            }

            // High-level verification:
            // 1. Every day should have some reviews (after day 1)
            // 2. Total reviews should be significantly higher than NUM_WORDS due to repetition
            const totalReviews = reviewsPerDay.reduce((a, b) => a + b, 0);

            expect(reviewsPerDay[0]).toBe(NUM_WORDS); // Day 0 all new words
            expect(totalReviews).toBeGreaterThan(NUM_WORDS * 2);

            // Distribution check: No single day should be 0 after initial ramp-up
            reviewsPerDay.slice(1, 10).forEach(count => {
                expect(count).toBeGreaterThan(0);
            });

            console.log('Daily Review Distribution (100 words, 30 days):', reviewsPerDay);
        });
    });
});

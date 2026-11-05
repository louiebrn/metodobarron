/** Points awarded once per module, per calendar month. */
export const QUIZ_POINTS = 10;
export const PRACTICE_POINTS = 5;

/** Podium size for the monthly giveaway. */
export const GIVEAWAY_PLACES = 3;

/** Leaderboard month boundary. Brazil no longer observes daylight saving. */
export const TIME_ZONE = "America/Sao_Paulo";

export const PRACTICE_IDS = ["simulador", "diario", "stop"] as const;
export type PracticeId = (typeof PRACTICE_IDS)[number];

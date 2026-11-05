import { GIVEAWAY_PLACES } from "./scoring";

export type ScoreRow = {
  userId: string;
  username: string;
  points: number;
  scoreReachedAt: number;
};

export type RankedScore = ScoreRow & {
  rank: number;
  /** True for the monthly giveaway podium (top 3 with points). */
  winner: boolean;
};

/**
 * Monthly giveaway order:
 * 1. Higher points first.
 * 2. Whoever reached that exact score earlier (`scoreReachedAt`) wins the tie.
 * 3. Username (pt-BR) is the final deterministic tie-break.
 * Only rows with points > 0 are ranked. The first {@link GIVEAWAY_PLACES} are winners.
 */
export function rankScores(rows: readonly ScoreRow[]): RankedScore[] {
  const sorted = rows.filter((row) => row.points > 0).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (a.scoreReachedAt !== b.scoreReachedAt) return a.scoreReachedAt - b.scoreReachedAt;
    return a.username.localeCompare(b.username, "pt-BR");
  });
  return sorted.map((row, index) => ({
    ...row,
    rank: index + 1,
    winner: index < GIVEAWAY_PLACES,
  }));
}

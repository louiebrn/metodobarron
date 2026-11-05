import type { Metadata } from "next";
import { seedRivals } from "@/actions/learn";
import { isDemoMode } from "@/lib/config";
import { getDb } from "@/lib/db";
import { flashMessage } from "@/lib/notices";
import { leaderboard } from "@/lib/points";
import { GIVEAWAY_PLACES } from "@/lib/scoring";
import { requireUser } from "@/lib/session";
import { formatMonth, formatPoints, monthKey } from "@/lib/time";

export const metadata: Metadata = { title: "Ranking" };

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string }>;
}) {
  const user = await requireUser();
  const query = await searchParams;
  const flash = flashMessage(query.aviso);
  const month = monthKey();
  const board = leaderboard(getDb(), month);
  const mine = board.find((row) => row.userId === user.id);
  const winners = board.filter((row) => row.winner);
  const rest = board.filter((row) => !row.winner);

  return (
    <>
      <header className="page-head">
        <p className="kicker">
          <span className="dot" /> Ranking · {formatMonth(month)}
        </p>
        <h1>Quem estudou mais neste mês.</h1>
        <p>Os {GIVEAWAY_PLACES} primeiros entram no sorteio. O placar zera no dia 1º, no horário de Brasília.</p>
      </header>

      {flash ? <p className={flash.tone === "ok" ? "alert alert-ok" : "alert alert-warn"}>{flash.text}</p> : null}

      <section className="card" style={{ marginBottom: 12 }}>
        <h2>Sorteio do mês</h2>
        <p className="muted">
          Prêmio: <strong>a definir</strong>. Entram os {GIVEAWAY_PLACES} primeiros com pontos. Empate: quem chegou
          naquela pontuação antes fica na frente. Se ainda empatar, o nome em ordem alfabética decide.
        </p>
        {mine ? (
          <p>
            Você está em <b>{mine.rank}º</b> com <b className="mono">{formatPoints(mine.points)}</b> pontos
            {mine.winner ? " — dentro do sorteio." : "."}
          </p>
        ) : (
          <p className="muted">Você ainda não pontuou neste mês. Um quiz vale 10 pontos; uma prática vale 5.</p>
        )}
      </section>

      {winners.length ? (
        <div className="podium" aria-label="Pódio">
          {(winners.length >= 3 ? [winners[1], winners[0], winners[2]] : winners).map((row) => (
            <article key={row.userId} className={`place place-${row.rank}`}>
              <span className="dim mono">{row.rank}º</span>
              <b>@{row.username}</b>
              <span className="mono">{formatPoints(row.points)} pts</span>
              {row.userId === user.id ? <span className="pill pill-ok">você</span> : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="card">Ninguém pontuou ainda neste mês.</p>
      )}

      {rest.length ? (
        <div className="rank-list">
          {rest.map((row) => (
            <div key={row.userId} className={row.userId === user.id ? "rank-row me" : "rank-row"}>
              <span className="mono dim">{row.rank}</span>
              <span>@{row.username}</span>
              <span className="mono">{formatPoints(row.points)}</span>
            </div>
          ))}
        </div>
      ) : null}

      {isDemoMode() ? (
        <form action={seedRivals} style={{ marginTop: 18 }}>
          <p className="dim">Modo demonstração: coloca quatro alunos fictícios neste mês para ver o pódio.</p>
          <button className="btn btn-ghost" type="submit">
            Carregar exemplos
          </button>
        </form>
      ) : null}
    </>
  );
}

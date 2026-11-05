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
  const flash = flashMessage({ aviso: query.aviso });
  const month = monthKey();
  const monthLabel = formatMonth(month);
  const monthPretty = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  const board = leaderboard(getDb(), month);
  const mine = board.find((row) => row.userId === user.id);
  const winners = board.filter((row) => row.winner);
  const rest = board.filter((row) => !row.winner);

  return (
    <>
      <header className="page-head">
        <p className="kicker">
          <span className="dot" /> Ranking
        </p>
        <h1>Quem estudou mais neste mês.</h1>
        <p>
          {monthPretty}. Os {GIVEAWAY_PLACES} primeiros entram no sorteio. O placar zera no dia 1º, no horário de
          Brasília.
        </p>
      </header>

      {flash ? <p className={flash.tone === "ok" ? "alert alert-ok" : "alert alert-warn"}>{flash.text}</p> : null}

      <section className="card prize">
        <p className="kicker">
          <span className="dot" /> Sorteio do mês
        </p>
        <h2>
          Prêmio: <span className="grad">a definir</span>
        </h2>
        <p className="muted">
          Entram os {GIVEAWAY_PLACES} primeiros com pontos. Empate: quem chegou naquela pontuação antes fica na frente.
          Se ainda empatar, o nome em ordem alfabética decide.
        </p>
        {mine ? (
          <p className="you">
            Você está em <b>{mine.rank}º</b> com <b className="mono">{formatPoints(mine.points)}</b> pontos
            {mine.winner ? " — dentro do sorteio." : "."}
          </p>
        ) : (
          <p className="you">Você ainda não pontuou neste mês. Um quiz vale 10 pontos; uma prática vale 5.</p>
        )}
      </section>

      {winners.length ? (
        <div className="podium" aria-label="Pódio">
          {(winners.length >= 3 ? [winners[1], winners[0], winners[2]] : winners).map((row) => (
            <article key={row.userId} className={`place place-${row.rank}`}>
              <span className="medal" aria-hidden="true">
                {row.rank}
              </span>
              <span className="medal-label">{row.rank === 1 ? "Ouro" : row.rank === 2 ? "Prata" : "Bronze"}</span>
              <b>@{row.username}</b>
              <span className="pts">{formatPoints(row.points)} pts</span>
              {row.userId === user.id ? <span className="pill pill-ok">você</span> : null}
            </article>
          ))}
        </div>
      ) : (
        <section className="empty">
          <span className="medal" aria-hidden="true">
            —
          </span>
          <h2>O pódio ainda está vazio.</h2>
          <p>Faça um quiz ou registre uma prática para ser o primeiro nome do mês.</p>
        </section>
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
        <form className="seed-form" action={seedRivals}>
          <p className="dim">Modo demonstração: coloca quatro alunos fictícios neste mês para ver o pódio.</p>
          <button className="btn btn-ghost" type="submit">
            Carregar exemplos
          </button>
        </form>
      ) : null}
    </>
  );
}

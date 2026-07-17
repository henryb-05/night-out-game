import { useState } from "react";

function ResolveScreen({
  players,
  lines,
  resolveLine,
  returnToBetting,
}) {
  const [selectedOutcomeId, setSelectedOutcomeId] = useState(null);
  const [error, setError] = useState("");

  const unresolvedLines = lines.filter((line) => !line.settled);
  const currentLine = unresolvedLines[0];

  const allLinesResolved = unresolvedLines.length === 0;

  function getOptionPool(line, optionId) {
    return line.bets
      .filter((bet) => bet.optionId === optionId)
      .reduce((total, bet) => total + bet.stake, 0);
  }

  function confirmResult() {
    if (!selectedOutcomeId) {
      setError("Select the winning outcome.");
      return;
    }

    const resolvedSuccessfully = resolveLine(
      currentLine.id,
      selectedOutcomeId,
    );

    if (!resolvedSuccessfully) {
      setError("This line could not be resolved.");
      return;
    }

    setSelectedOutcomeId(null);
    setError("");
  }

  if (allLinesResolved) {
    const sortedPlayers = [...players].sort(
      (playerA, playerB) => playerB.balance - playerA.balance,
    );

    return (
      <main>
        <h1>Final Results</h1>

        <p>
          Every betting line has been resolved. The player with the most
          tokens wins.
        </p>

        <section>
          <div className="section-header">
            <div className="section-title">
              <span className="section-icon">♛</span>
              <h2>Leaderboard</h2>
            </div>
          </div>

          <div className="final-leaderboard">
            {sortedPlayers.map((player, index) => (
              <article
                className={`leaderboard-row ${
                  index === 0 ? "leaderboard-winner" : ""
                }`}
                key={player.id}
              >
                <div className="leaderboard-position">
                  {index === 0 ? "♛" : index + 1}
                </div>

                <div className="player-details">
                  <div className="player-avatar small-avatar">
                    {player.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <strong>{player.name}</strong>

                    <span>
                      {index === 0 ? "Winner" : `Position ${index + 1}`}
                    </span>
                  </div>
                </div>

                <span className="final-balance">
                  {player.balance}
                  <small> tokens</small>
                </span>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="section-header">
            <div className="section-title">
              <span className="section-icon">✓</span>
              <h2>Resolved lines</h2>
            </div>
          </div>

          <div className="resolved-lines-list">
            {lines.map((line) => {
              const winningOption = line.options.find(
                (option) => option.id === line.winningOptionId,
              );

              return (
                <article className="resolved-line-row" key={line.id}>
                  <div>
                    <strong>{line.question}</strong>
                    <span>Winning outcome</span>
                  </div>

                  <span className="winning-outcome-badge">
                    {winningOption?.label ?? "Unknown"}
                  </span>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    );
  }

  const currentLineNumber =
    lines.findIndex((line) => line.id === currentLine.id) + 1;

  const totalPool = currentLine.bets.reduce(
    (total, bet) => total + bet.stake,
    0,
  );

  return (
    <main>
      <h1>Resolve Bets</h1>

      <p>
        Select what actually happened. Payouts will be calculated
        automatically.
      </p>

      <section className="resolve-progress-card">
        <div className="turn-progress">
          <span>
            Line {lines.length - unresolvedLines.length + 1} of{" "}
            {lines.length}
          </span>

          <strong>
            {Math.round(
              ((lines.length - unresolvedLines.length) / lines.length) *
                100,
            )}
            %
          </strong>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${
                ((lines.length - unresolvedLines.length) / lines.length) *
                100
              }%`,
            }}
          />
        </div>
      </section>

      <section className="resolve-line-card">
        <div className="betting-line-heading">
          <span className="line-number">{currentLineNumber}</span>
          <h2>{currentLine.question}</h2>
        </div>

        <div className="resolve-pool-summary">
          <span>Total pool</span>
          <strong>{totalPool} tokens</strong>
        </div>

        <div className="resolve-options">
          {currentLine.options.map((option) => {
            const optionPool = getOptionPool(currentLine, option.id);
            const optionBets = currentLine.bets.filter(
              (bet) => bet.optionId === option.id,
            ).length;

            const isSelected = selectedOutcomeId === option.id;

            return (
              <button
                type="button"
                className={`resolve-option-button ${
                  isSelected ? "selected-result" : ""
                }`}
                key={option.id}
                onClick={() => {
                  setSelectedOutcomeId(option.id);
                  setError("");
                }}
              >
                <span className="resolve-option-label">{option.label}</span>

                <span className="resolve-option-details">
                  {optionPool} tokens · {optionBets}{" "}
                  {optionBets === 1 ? "bet" : "bets"}
                </span>
              </button>
            );
          })}
        </div>

        {currentLine.bets.length === 0 && (
          <p className="next-stage-message">
            Nobody placed a bet on this line, so no tokens will be moved.
          </p>
        )}

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          className="resolve-button"
          onClick={confirmResult}
          disabled={!selectedOutcomeId}
        >
          Resolve this line
        </button>

        <button
          type="button"
          className="secondary-button back-button"
          onClick={returnToBetting}
        >
          Back
        </button>
      </section>
    </main>
  );
}

export default ResolveScreen;
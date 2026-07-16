function BettingScreen({
  players,
  lines,
  returnToLines,
}) {
  return (
    <main>
      <h1>Place Your Bets</h1>

      <p>
        The lines are ready. Player-by-player betting comes next.
      </p>

      <section>
        <div className="section-header">
          <div className="section-title">
            <span className="section-icon">◎</span>
            <h2>Betting ready</h2>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-item">
            <span>Players</span>
            <strong>{players.length}</strong>
          </div>

          <div className="summary-item">
            <span>Lines</span>
            <strong>{lines.length}</strong>
          </div>
        </div>

        <p className="next-stage-message">
          Milestone 3 will add private player turns, outcome selection and
          token staking.
        </p>

        <button
          type="button"
          className="secondary-button"
          onClick={returnToLines}
        >
          Back to lines
        </button>
      </section>
    </main>
  );
}

export default BettingScreen;
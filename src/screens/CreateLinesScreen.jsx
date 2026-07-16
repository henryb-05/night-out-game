function CreateLinesScreen({
  players,
  startingTokens,
  returnToSetup,
}) {
  return (
    <main>
      <h1>Game Created</h1>

      <p>
        Your group is ready. Next, each player will create their betting lines.
      </p>

      <section className="setup-summary">
        <div className="section-header">
          <div className="section-title">
            <span className="section-icon">✓</span>
            <h2>Game setup complete</h2>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-item">
            <span>Players</span>
            <strong>{players.length}</strong>
          </div>

          <div className="summary-item">
            <span>Starting balance</span>
            <strong>{startingTokens} tokens</strong>
          </div>
        </div>

        <div className="setup-player-names">
          {players.map((player) => (
            <span key={player.id}>{player.name}</span>
          ))}
        </div>

        <p className="next-stage-message">
          The line-creation screen will be our next milestone.
        </p>

        <button
          type="button"
          className="secondary-button"
          onClick={returnToSetup}
        >
          Back to setup
        </button>
      </section>
    </main>
  );
}

export default CreateLinesScreen;
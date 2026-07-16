import PlayerList from "../components/PlayerList";

function SetupScreen({
  playerName,
  setPlayerName,
  players,
  startingTokens,
  linesPerPlayer,
  error,
  addPlayer,
  removePlayer,
  handleKeyDown,
  handleStartingTokensChange,
  handleLinesPerPlayerChange,
  continueGame,
  clearError,
}) {

  return (
    <main>
      <h1>Night Out Betting</h1>

      <p>Create the group, make your predictions and back your bets.</p>

      <section>
        <div className="section-header">
          <div className="section-title">
            <span className="section-icon">♙</span>
            <h2>Add players</h2>
          </div>
        </div>

        <label className="input-label" htmlFor="starting-tokens">
          Starting tokens
        </label>

        <select
          id="starting-tokens"
          value={startingTokens}
          onChange={handleStartingTokensChange}
        >
          <option value={50}>50 tokens</option>
          <option value={100}>100 tokens</option>
          <option value={150}>150 tokens</option>
          <option value={200}>200 tokens</option>
          <option value={500}>500 tokens</option>
        </select>


        <label className="input-label" htmlFor="lines-per-player">
            Lines per player
        </label>

        <select
            id="lines-per-player"
            value={linesPerPlayer}
            onChange={handleLinesPerPlayerChange}
        >
            <option value={1}>1 line per player</option>
            <option value={2}>2 lines per player</option>
        </select>

        <label className="input-label" htmlFor="player-name">
          Player name
        </label>

        <input
          id="player-name"
          type="text"
          placeholder="Enter player name"
          value={playerName}
          maxLength={20}
          onChange={(event) => {
            setPlayerName(event.target.value);
            clearError();
          }}
          onKeyDown={handleKeyDown}
        />

        <button type="button" onClick={addPlayer}>
          Add player
        </button>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
      </section>

      <PlayerList players={players} removePlayer={removePlayer} />

      <button
        type="button"
        className="continue-button"
        onClick={continueGame}
        disabled={players.length < 2}
      >
        Continue
        <span aria-hidden="true">→</span>
      </button>

      {players.length < 2 && (
        <p className="player-requirement">
          Add at least two players to continue.
        </p>
      )}
    </main>
  );
}

export default SetupScreen;
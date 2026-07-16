import { useState } from "react";
import PlayerList from "./components/PlayerList";
import "./App.css";

function App() {
  const [playerName, setPlayerName] = useState("");
  const [players, setPlayers] = useState([]);
  const [startingTokens, setStartingTokens] = useState(100);
  const [error, setError] = useState("");
  const [screen, setScreen] = useState("setup");

  function addPlayer() {
    const cleanedName = playerName.trim();

    if (cleanedName === "") {
      setError("Please enter a player name.");
      return;
    }

    const nameAlreadyExists = players.some(
      (player) => player.name.toLowerCase() === cleanedName.toLowerCase(),
    );

    if (nameAlreadyExists) {
      setError(`${cleanedName} has already been added.`);
      return;
    }

    const newPlayer = {
      id: crypto.randomUUID(),
      name: cleanedName,
      balance: startingTokens,
      lines: [],
      bets: [],
    };

    setPlayers((currentPlayers) => [...currentPlayers, newPlayer]);
    setPlayerName("");
    setError("");
  }

  function removePlayer(playerId) {
    setPlayers((currentPlayers) =>
      currentPlayers.filter((player) => player.id !== playerId),
    );

    setError("");
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      addPlayer();
    }
  }

  function handleStartingTokensChange(event) {
    const newStartingTokens = Number(event.target.value);

    setStartingTokens(newStartingTokens);

    setPlayers((currentPlayers) =>
      currentPlayers.map((player) => ({
        ...player,
        balance: newStartingTokens,
      })),
    );
  }

  function continueGame() {
    if (players.length < 2) {
      setError("You need at least two players to start a game.");
      return;
    }

    setError("");
    setScreen("lines");
  }

  function returnToSetup() {
    setScreen("setup");
  }

  if (screen === "lines") {
    return (
      <main>
        <h1>Game Created</h1>

        <p>
          Your group is ready. Next, each player will create their betting
          lines.
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

            if (error) {
              setError("");
            }
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

export default App;
import { useState } from "react";

function BettingScreen({
  players,
  lines,
  submitPlayerBets,
  returnToLines,
  continueToResolve,
}) {

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [draftBets, setDraftBets] = useState({});
  const [error, setError] = useState("");

  const allBettingComplete = currentPlayerIndex >= players.length;

  const currentPlayer = allBettingComplete
    ? null
    : players[currentPlayerIndex];

  const totalStake = Object.values(draftBets).reduce(
    (total, bet) => total + (bet.stake || 0),
    0,
  );

  const remainingBalance = currentPlayer
    ? currentPlayer.balance - totalStake
    : 0;

  function selectOption(lineId, optionId) {
    setDraftBets((currentBets) => ({
      ...currentBets,
      [lineId]: {
        optionId,
        stake: currentBets[lineId]?.stake ?? 0,
      },
    }));

    setError("");
  }

  function updateStake(lineId, enteredValue) {
    const numericValue = Number(enteredValue);

    const stake = Number.isFinite(numericValue)
      ? Math.max(0, Math.floor(numericValue))
      : 0;

    setDraftBets((currentBets) => ({
      ...currentBets,
      [lineId]: {
        optionId: currentBets[lineId]?.optionId ?? null,
        stake,
      },
    }));

    setError("");
  }

  function addToStake(lineId, amount) {
    const currentStake = draftBets[lineId]?.stake ?? 0;

    updateStake(lineId, currentStake + amount);
  }

  function submitBets() {
    const completedBets = Object.entries(draftBets)
      .filter(([, bet]) => bet.optionId && bet.stake > 0)
      .map(([lineId, bet]) => ({
        lineId,
        optionId: bet.optionId,
        stake: bet.stake,
      }));

    if (completedBets.length === 0) {
      setError("Place at least one bet before continuing.");
      return;
    }

    if (totalStake > currentPlayer.balance) {
      setError(
        `You have exceeded your balance by ${
          totalStake - currentPlayer.balance
        } tokens.`,
      );
      return;
    }

    const successfullySaved = submitPlayerBets(
      currentPlayer.id,
      completedBets,
    );

    if (!successfullySaved) {
      setError("The bets could not be saved. Check your token balance.");
      return;
    }

    setDraftBets({});
    setError("");
    setIsReady(false);
    setCurrentPlayerIndex((currentIndex) => currentIndex + 1);
  }

  if (allBettingComplete) {
    const totalTokensStaked = lines.reduce(
      (lineTotal, line) =>
        lineTotal +
        line.bets.reduce(
          (betTotal, bet) => betTotal + bet.stake,
          0,
        ),
      0,
    );

    const totalBetsPlaced = lines.reduce(
      (total, line) => total + line.bets.length,
      0,
    );

    return (
      <main>
        <h1>Bets Locked</h1>

        <p>
          Everyone has placed their bets. The game is ready for the night out.
        </p>

        <section>
          <div className="section-header">
            <div className="section-title">
              <span className="section-icon">✓</span>
              <h2>Betting complete</h2>
            </div>
          </div>

          <div className="summary-grid">
            <div className="summary-item">
              <span>Total bets</span>
              <strong>{totalBetsPlaced}</strong>
            </div>

            <div className="summary-item">
              <span>Tokens staked</span>
              <strong>{totalTokensStaked}</strong>
            </div>
          </div>

          <div className="betting-player-summary">
            {players.map((player) => {
              const playerStake = player.bets.reduce(
                (total, bet) => total + bet.stake,
                0,
              );

              return (
                <div className="betting-player-row" key={player.id}>
                  <div className="player-details">
                    <div className="player-avatar small-avatar">
                      {player.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <strong>{player.name}</strong>
                      <span>{playerStake} tokens staked</span>
                    </div>
                  </div>

                  <span className="balance-badge">
                    {player.balance} left
                  </span>
                </div>
              );
            })}
          </div>

          <p className="next-stage-message">
            Keep this screen with the host. When the night is over, resolve each
            prediction and calculate the final leaderboard.
          </p>

          <button
            type="button"
            className="continue-to-resolve-button"
            onClick={continueToResolve}
          >
            Resolve bets
          </button>
        </section>
      </main>
    );
  }

  if (!isReady) {
    return (
      <main>
        <h1>Pass the Phone</h1>

        <p>
          Bets are private. Make sure only the named player can see the screen.
        </p>

        <section className="pass-phone-card">
          <div className="turn-progress">
            <span>
              Player {currentPlayerIndex + 1} of {players.length}
            </span>

            <strong>
              {Math.round(
                (currentPlayerIndex / players.length) * 100,
              )}
              %
            </strong>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${
                  (currentPlayerIndex / players.length) * 100
                }%`,
              }}
            />
          </div>

          <div className="pass-phone-player">
            <div className="player-avatar large-avatar">
              {currentPlayer.name.charAt(0).toUpperCase()}
            </div>

            <span>Pass the phone to</span>
            <h2>{currentPlayer.name}</h2>

            <p className="line-turn-count">
              {currentPlayer.balance} tokens available
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsReady(true)}
          >
            I’m ready
          </button>

          {currentPlayerIndex === 0 && (
            <button
              type="button"
              className="secondary-button back-button"
              onClick={returnToLines}
            >
              Back to lines
            </button>
          )}
        </section>
      </main>
    );
  }

  return (
    <main>
      <h1>Place Your Bets</h1>

      <p>
        {currentPlayer.name}, choose outcomes and spread your tokens across
        the lines.
      </p>

      <section className="betting-balance-panel">
        <div>
          <span>Available</span>
          <strong>{currentPlayer.balance}</strong>
        </div>

        <div>
          <span>Staked</span>
          <strong>{totalStake}</strong>
        </div>

        <div>
          <span>Remaining</span>
          <strong className={remainingBalance < 0 ? "negative-balance" : ""}>
            {remainingBalance}
          </strong>
        </div>
      </section>

      <div className="betting-lines-list">
        {lines.map((line, index) => {
          const selectedBet = draftBets[line.id];

          return (
            <section className="betting-line-card" key={line.id}>
              <div className="betting-line-heading">
                <span className="line-number">{index + 1}</span>
                <h2>{line.question}</h2>
              </div>

              <div className="betting-options">
                {line.options.map((option) => {
                  const isSelected =
                    selectedBet?.optionId === option.id;

                  return (
                    <button
                      type="button"
                      className={`outcome-button ${
                        isSelected ? "selected-outcome" : ""
                      }`}
                      key={option.id}
                      onClick={() =>
                        selectOption(line.id, option.id)
                      }
                    >
                      <span className="outcome-radio" />
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <label
                className="input-label"
                htmlFor={`stake-${line.id}`}
              >
                Stake
              </label>

              <div className="stake-controls">
                <input
                  id={`stake-${line.id}`}
                  className="stake-input"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={selectedBet?.stake ?? 0}
                  onChange={(event) =>
                    updateStake(line.id, event.target.value)
                  }
                />

                <button
                  type="button"
                  className="stake-chip"
                  onClick={() => addToStake(line.id, 5)}
                >
                  +5
                </button>

                <button
                  type="button"
                  className="stake-chip"
                  onClick={() => addToStake(line.id, 10)}
                >
                  +10
                </button>

                <button
                  type="button"
                  className="stake-chip"
                  onClick={() => addToStake(line.id, 25)}
                >
                  +25
                </button>
              </div>
            </section>
          );
        })}
      </div>

      {error && (
        <p className="error-message betting-error" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        className="continue-button"
        onClick={submitBets}
      >
        Lock in bets
        <span aria-hidden="true">→</span>
      </button>

      <button
        type="button"
        className="secondary-button betting-back-button"
        onClick={() => {
          setDraftBets({});
          setError("");
          setIsReady(false);
        }}
      >
        Back
      </button>
    </main>
  );
}

export default BettingScreen;
import { useState } from "react";

function CreateLinesScreen({
  players,
  lines,
  linesPerPlayer,
  addLine,
  returnToSetup,
  continueToBetting,
}) {

  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [error, setError] = useState("");
  const [isReady, setIsReady] = useState(false);

  const totalLinesRequired = players.length * linesPerPlayer;

  const allLinesCreated = lines.length >= totalLinesRequired;

  const currentPlayerIndex = Math.floor(
    lines.length / linesPerPlayer,
  );

  const currentLineNumber =
    (lines.length % linesPerPlayer) + 1;

  const currentPlayer = players[currentPlayerIndex];

  function submitLine() {
    const cleanedQuestion = question.trim();
    const cleanedOptionA = optionA.trim();
    const cleanedOptionB = optionB.trim();

    if (
      cleanedQuestion === "" ||
      cleanedOptionA === "" ||
      cleanedOptionB === ""
    ) {
      setError("Please complete the question and both outcomes.");
      return;
    }

    if (cleanedOptionA.toLowerCase() === cleanedOptionB.toLowerCase()) {
      setError("The two outcomes must be different.");
      return;
    }

    const newLine = {
      id: crypto.randomUUID(),
      authorId: currentPlayer.id,
      question: cleanedQuestion,
      options: [
        {
          id: crypto.randomUUID(),
          label: cleanedOptionA,
        },
        {
          id: crypto.randomUUID(),
          label: cleanedOptionB,
        },
      ],
      bets: [],
      winningOptionId: null,
      settled: false,

      createdAt: Date.now()
    };

    addLine(newLine);

    setQuestion("");
    setOptionA("");
    setOptionB("");
    setError("");
    setIsReady(false);
  }

  function clearError() {
    if (error) {
      setError("");
    }
  }

  if (allLinesCreated) {
    return (
      <main>
        <h1>Lines Created</h1>

        <p>
          Everyone has submitted a prediction. Review the lines before
          betting begins.
        </p>

        <section>
          <div className="section-header">
            <div className="section-title">
              <span className="section-icon">✓</span>
              <h2>Betting lines</h2>
            </div>

            <span className="player-count">
              {lines.length} {lines.length === 1 ? "line" : "lines"}
            </span>
          </div>

          <div className="line-review-list">
            {lines.map((line, index) => {
              const author = players.find(
                (player) => player.id === line.authorId,
              );

              return (
                <article className="line-review-card" key={line.id}>
                  <div className="line-number">{index + 1}</div>

                  <div className="line-review-content">
                    <span className="line-author">
                      Created by {author?.name ?? "Unknown player"}
                    </span>

                    <strong>{line.question}</strong>

                    <div className="line-options">
                      <span>{line.options[0].label}</span>
                      <span>{line.options[1].label}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <button
            type="button"
            className = "continue-to-betting-button"
            onClick={continueToBetting}
          >
            Continue to betting
          </button>

          <button
            type="button"
            className="secondary-button back-button"
            onClick={returnToSetup}
          >
            Back to setup
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
          Keep each player’s prediction private until everyone has created
          one.
        </p>

        <section className="pass-phone-card">
          <div className="turn-progress">
            <span>
              Prediction {lines.length + 1} of {totalLinesRequired}
            </span>

            <strong>
              {Math.round(
                (lines.length / totalLinesRequired) * 100,
              )}
              %
            </strong>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${
                  (lines.length / totalLinesRequired) * 100
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
                Line {currentLineNumber} of {linesPerPlayer}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsReady(true)}
          >
            I’m ready
          </button>

          <button
            type="button"
            className="secondary-button back-button"
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
      <h1>Create a Line</h1>

      <p>
        {currentPlayer.name}, create a prediction with two possible
        outcomes.
      </p>

      <section>
        <div className="section-header">
          <div className="section-title">
            <div className="player-avatar small-avatar">
              {currentPlayer.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <span className="turn-label">
                {currentPlayer.name} · Line {currentLineNumber} of{" "}
                {linesPerPlayer}
              </span>

              <h2>Create prediction</h2>
            </div>
          </div>
        </div>

        <label className="input-label" htmlFor="line-question">
          Question
        </label>

        <input
          id="line-question"
          type="text"
          placeholder="e.g. How many pubs will we visit?"
          value={question}
          maxLength={80}
          onChange={(event) => {
            setQuestion(event.target.value);
            clearError();
          }}
        />

        <div className="option-input-grid">
          <div>
            <label className="input-label" htmlFor="option-a">
              Outcome A
            </label>

            <input
              id="option-a"
              type="text"
              placeholder="e.g. Over 4"
              value={optionA}
              maxLength={30}
              onChange={(event) => {
                setOptionA(event.target.value);
                clearError();
              }}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="option-b">
              Outcome B
            </label>

            <input
              id="option-b"
              type="text"
              placeholder="e.g. Under 4"
              value={optionB}
              maxLength={30}
              onChange={(event) => {
                setOptionB(event.target.value);
                clearError();
              }}
            />
          </div>
        </div>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <button type="button" onClick={submitLine}>
          Save prediction
        </button>

        <button
          type="button"
          className="secondary-button back-button"
          onClick={() => {
            setIsReady(false);
            setError("");
          }}
        >
          Back
        </button>
      </section>
    </main>
  );
}

export default CreateLinesScreen;
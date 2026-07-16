import { useState } from "react";
import SetupScreen from "./screens/SetupScreen";
import CreateLinesScreen from "./screens/CreateLinesScreen";
import { SCREENS } from "./constants/screens";
import BettingScreen from "./screens/BettingScreen";
import "./App.css";

function App() {
  const [playerName, setPlayerName] = useState("");
  const [players, setPlayers] = useState([]);
  const [startingTokens, setStartingTokens] = useState(100);
  const [error, setError] = useState("");
  const [screen, setScreen] = useState(SCREENS.SETUP);
  const [lines, setLines] = useState([]);
  const [linesPerPlayer, setLinesPerPlayer] = useState(1);
  
  function handleLinesPerPlayerChange(event) {
    setLinesPerPlayer(Number(event.target.value));
  }

  function continueToBetting() {
    setScreen(SCREENS.BETTING);
  }

  function addPlayer() {
    const cleanedName = playerName.trim();

    if (cleanedName === "") {
      setError("Please enter a player name.");
      return;
    }

    const nameAlreadyExists = players.some(
      (player) =>
        player.name.toLowerCase() === cleanedName.toLowerCase(),
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

    setPlayers((currentPlayers) => [
      ...currentPlayers,
      newPlayer,
    ]);

    setPlayerName("");
    setError("");
  }

  function removePlayer(playerId) {
    setPlayers((currentPlayers) =>
      currentPlayers.filter(
        (player) => player.id !== playerId,
      ),
    );

    setError("");
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      addPlayer();
    }
  }

  function addLine(newLine) {
    setLines((currentLines) => [...currentLines, newLine]);
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
    setScreen(SCREENS.CREATE_LINES);
  }

  function returnToSetup() {
    setScreen(SCREENS.SETUP);
  }

  function clearError() {
    if (error) {
      setError("");
    }
  }

  if (screen === SCREENS.CREATE_LINES) {
    return (
      <CreateLinesScreen
        players={players}
        lines={lines}
        linesPerPlayer={linesPerPlayer}
        addLine={addLine}
        returnToSetup={returnToSetup}
        continueToBetting={continueToBetting}
      />
    );
  }

  if (screen === SCREENS.BETTING) {
    return (
      <BettingScreen
        players={players}
        lines={lines}
        returnToLines={() => setScreen(SCREENS.CREATE_LINES)}
      />
    );
  }

  return (
    <SetupScreen
      playerName={playerName}
      setPlayerName={setPlayerName}
      players={players}
      startingTokens={startingTokens}
      error={error}
      addPlayer={addPlayer}
      removePlayer={removePlayer}
      handleKeyDown={handleKeyDown}
      handleStartingTokensChange={handleStartingTokensChange}
      continueGame={continueGame}
      clearError={clearError}
      linesPerPlayer={linesPerPlayer}
      handleLinesPerPlayerChange={handleLinesPerPlayerChange}
    />
  );
}

export default App;
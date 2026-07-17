import { useState } from "react";
import SetupScreen from "./screens/SetupScreen";
import CreateLinesScreen from "./screens/CreateLinesScreen";
import { SCREENS } from "./constants/screens";
import BettingScreen from "./screens/BettingScreen";
import ResolveScreen from "./screens/ResolveScreen";
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

  function submitPlayerBets(playerId, submittedBets) {
    const player = players.find((currentPlayer) => currentPlayer.id === playerId);

    if (!player) {
      return false;
    }

    const totalStake = submittedBets.reduce(
      (total, bet) => total + bet.stake,
      0,
    );

    if (totalStake > player.balance) {
      return false;
    }

    const savedBets = submittedBets.map((bet) => ({
      id: crypto.randomUUID(),
      playerId,
      lineId: bet.lineId,
      optionId: bet.optionId,
      stake: bet.stake,
      createdAt: Date.now(),
    }));

    setPlayers((currentPlayers) =>
      currentPlayers.map((currentPlayer) => {
        if (currentPlayer.id !== playerId) {
          return currentPlayer;
        }

        return {
          ...currentPlayer,
          balance: currentPlayer.balance - totalStake,
          bets: [...currentPlayer.bets, ...savedBets],
        };
      }),
    );

    setLines((currentLines) =>
      currentLines.map((line) => {
        const betsForThisLine = savedBets.filter(
          (bet) => bet.lineId === line.id,
        );

        if (betsForThisLine.length === 0) {
          return line;
        }

        return {
          ...line,
          bets: [...line.bets, ...betsForThisLine],
        };
      }),
    );

    return true;
  }

  function resolveLine(lineId, winningOptionId) {
    const line = lines.find((currentLine) => currentLine.id === lineId);

    if (!line || line.settled) {
      return false;
    }

    const validWinningOption = line.options.some(
      (option) => option.id === winningOptionId,
    );

    if (!validWinningOption) {
      return false;
    }

    const winningBets = line.bets.filter(
      (bet) => bet.optionId === winningOptionId,
    );

    const losingBets = line.bets.filter(
      (bet) => bet.optionId !== winningOptionId,
    );

    const winningStake = winningBets.reduce(
      (total, bet) => total + bet.stake,
      0,
    );

    const losingPool = losingBets.reduce(
      (total, bet) => total + bet.stake,
      0,
    );

    const payouts = [];

    /*
      If either side has no money staked, there is no opposing pool.
      Refund every bet on the line.
    */
    if (winningStake === 0 || losingPool === 0) {
      line.bets.forEach((bet) => {
        payouts.push({
          playerId: bet.playerId,
          amount: bet.stake,
        });
      });
    } else {
      /*
        First calculate each winner's exact proportional share
        of the losing pool.
      */
      const calculatedShares = winningBets.map((bet) => {
        const exactShare =
          losingPool * (bet.stake / winningStake);

        const roundedDownShare = Math.floor(exactShare);

        return {
          bet,
          roundedDownShare,
          remainder: exactShare - roundedDownShare,
        };
      });

      const distributedTokens = calculatedShares.reduce(
        (total, result) => total + result.roundedDownShare,
        0,
      );

      let remainingTokens = losingPool - distributedTokens;

      /*
        Give remaining whole tokens to the players with the
        largest fractional remainders.
      */
      calculatedShares.sort((resultA, resultB) => {
        if (resultB.remainder !== resultA.remainder) {
          return resultB.remainder - resultA.remainder;
        }

        if (resultB.bet.stake !== resultA.bet.stake) {
          return resultB.bet.stake - resultA.bet.stake;
        }

        return resultA.bet.id.localeCompare(resultB.bet.id);
      });

      calculatedShares.forEach((result) => {
        let profit = result.roundedDownShare;

        if (remainingTokens > 0) {
          profit += 1;
          remainingTokens -= 1;
        }

        payouts.push({
          playerId: result.bet.playerId,

          // Return original stake plus profit
          amount: result.bet.stake + profit,
        });
      });
    }

    const payoutByPlayer = payouts.reduce((totals, payout) => {
      totals[payout.playerId] =
        (totals[payout.playerId] ?? 0) + payout.amount;

      return totals;
    }, {});

    setPlayers((currentPlayers) =>
      currentPlayers.map((player) => ({
        ...player,
        balance:
          player.balance + (payoutByPlayer[player.id] ?? 0),
      })),
    );

    setLines((currentLines) =>
      currentLines.map((currentLine) =>
        currentLine.id === lineId
          ? {
              ...currentLine,
              winningOptionId,
              settled: true,
              settledAt: Date.now(),
              payouts,
            }
          : currentLine,
      ),
    );

    return true;
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
        submitPlayerBets={submitPlayerBets}
        returnToLines={() => setScreen(SCREENS.CREATE_LINES)}
        continueToResolve={() => setScreen(SCREENS.RESOLVE)}
      />
    );
  }

  if (screen === SCREENS.RESOLVE) {
    return (
      <ResolveScreen
        players={players}
        lines={lines}
        resolveLine={resolveLine}
        returnToBetting={() => setScreen(SCREENS.BETTING)}
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
function PlayerList({ players, removePlayer }) {
    return (
      <section>
        <div className="section-header">
          <div className="section-title">
            <span className="section-icon">♙</span>
            <h2>Players</h2>
          </div>
  
          {players.length > 0 && (
            <span className="player-count">
              {players.length} {players.length === 1 ? "player" : "players"}
            </span>
          )}
        </div>
  
        {players.length === 0 ? (
          <p>No players added yet.</p>
        ) : (
          <ul className="player-list">
            {players.map((player) => (
              <li className="player-card" key={player.id}>
                <div className="player-details">
                  <div className="player-avatar">
                    {player.name.charAt(0).toUpperCase()}
                  </div>
  
                  <div>
                    <strong>{player.name}</strong>
  
                    <span className="balance-badge">
                      {player.balance} tokens
                    </span>
                  </div>
                </div>
  
                <button
                  type="button"
                  className="delete-button"
                  aria-label={`Remove ${player.name}`}
                  onClick={() => removePlayer(player.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }
  
  export default PlayerList;
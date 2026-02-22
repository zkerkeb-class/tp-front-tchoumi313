import { useState, useEffect } from "react";
import {
  createTeam,
  updateTeam,
  deleteTeamByName,
  getTeamByName,
  listTeams,
  usePokemonList,
} from "../hook/usePokemon";
import PokeImage from "../components/pokeCard/pokeImage";
import "./teamBuilder.css";

const STAT_LABELS = [
  "HP",
  "Attack",
  "Defense",
  "SpecialAttack",
  "SpecialDefense",
  "Speed",
];

const TeamBuilder = () => {
  const [team, setTeam] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [savedTeams, setSavedTeams] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { items, loading } = usePokemonList(1, 100, 0);

  // Load saved teams from backend on mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teams = await listTeams();
        setSavedTeams(teams || []);
      } catch (e) {
        console.error("Failed to load teams from backend", e);
        setActionError("Impossible de charger les équipes.");
      }
    };
    fetchTeams();
  }, []);

  const addToTeam = (pokemon) => {
    if (team.length < 6 && !team.find((p) => p.id === pokemon.id)) {
      setTeam([...team, pokemon]);
      setShowPicker(false);
    }
  };

  const removeFromTeam = (pokemonId) => {
    setTeam(team.filter((p) => p.id !== pokemonId));
  };

  const saveTeam = async () => {
    const trimmed = teamName.trim();
    if (!trimmed) return;
    setActionError("");
    setActionLoading(true);
    const exists = savedTeams.some(
      (t) => t.name?.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      updateTeam(
        trimmed,
        team.map((p) => p.id)
      )
        .then(() => listTeams())
        .then((teams) => {
          setSavedTeams(teams || []);
          setTeamName("");
          setShowSaveModal(false);
        })
        .catch(() => setActionError("Échec de mise à jour."))
        .finally(() => setActionLoading(false));
      return;
    } else {
      try {
        const pokemonIds = team.map((p) => p.id);
        await createTeam({ name: trimmed, pokemonIds });
        const teams = await listTeams();
        setSavedTeams(teams || []);
        setTeamName("");
        setShowSaveModal(false);
      } catch (e) {
        setActionError("Échec de sauvegarde.");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const loadTeam = async (savedTeam) => {
    setActionError("");
    setActionLoading(true);
    try {
      const result = await getTeamByName(savedTeam.name);
      setTeam(result.pokemons || []);
      setShowLoadModal(false);
    } catch (e) {
      setActionError("Échec de chargement.");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteTeam = async (teamNameToDelete) => {
    setActionError("");
    setActionLoading(true);
    try {
      await deleteTeamByName(teamNameToDelete);
      const teams = await listTeams();
      setSavedTeams(teams || []);
    } catch (e) {
      setActionError("Échec de suppression.");
    } finally {
      setActionLoading(false);
    }
  };

  const clearTeam = () => {
    if (window.confirm("Êtes-vous sûr de vouloir effacer l'équipe?")) {
      setTeam([]);
    }
  };

  // Calculate team stats
  const teamStats = team.reduce((acc, pokemon) => {
    STAT_LABELS.forEach((stat) => {
      acc[stat] = (acc[stat] || 0) + (pokemon.base?.[stat] || 0);
    });
    return acc;
  }, {});

  const avgStats = {};
  STAT_LABELS.forEach((stat) => {
    avgStats[stat] =
      team.length > 0 ? Math.round(teamStats[stat] / team.length) : 0;
  });

  // Type coverage
  const typeCoverage = team.reduce((acc, pokemon) => {
    pokemon.type?.forEach((type) => {
      acc[type] = (acc[type] || 0) + 1;
    });
    return acc;
  }, {});

  const totalPower = Object.values(teamStats).reduce(
    (sum, val) => sum + val,
    0
  );

  return (
    <div className="team-builder">
      <div className="team-builder-header">
        <div>
          <h2>Créateur d'Équipe</h2>
          <p className="team-builder-subtitle">
            Sélectionnez jusqu'à 6 Pokémon pour votre équipe
          </p>
          {actionError && (
            <div className="team-builder-error">{actionError}</div>
          )}
        </div>
        <div className="team-builder-actions">
          <button
            className="btn"
            onClick={() => setShowSaveModal(true)}
            disabled={!team.length || actionLoading}
          >
            Enregistrer
          </button>
          <button
            className="btn"
            onClick={() => setShowLoadModal(true)}
            disabled={!savedTeams.length || actionLoading}
          >
            Charger ({savedTeams.length})
          </button>
          <button
            className="btn btn-danger"
            onClick={clearTeam}
            disabled={!team.length || actionLoading}
          >
            Effacer
          </button>
        </div>
      </div>

      <div className="team-slots">
        {[...Array(6)].map((_, idx) => {
          const pokemon = team[idx];
          return (
            <div
              key={idx}
              className={`team-slot ${pokemon ? "team-slot-filled" : ""}`}
            >
              {pokemon ? (
                <>
                  <button
                    className="team-slot-remove"
                    onClick={() => removeFromTeam(pokemon.id)}
                  >
                    ×
                  </button>
                  <PokeImage imageUrl={pokemon.image} />
                  <div className="team-slot-name">{pokemon.name?.english}</div>
                  <div className="team-slot-types">
                    {pokemon.type?.map((t) => (
                      <span key={t} className="team-slot-type">
                        {t}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <button
                  className="team-slot-add"
                  onClick={() => setShowPicker(true)}
                >
                  <span className="team-slot-add-icon">+</span>
                  <span>Ajouter</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {team.length > 0 && (
        <div className="team-stats">
          <div className="team-stats-section">
            <h3>Puissance Totale: {totalPower}</h3>
            <div className="team-stats-bars">
              {STAT_LABELS.map((stat) => (
                <div key={stat} className="team-stat-row">
                  <span className="team-stat-label">{stat}</span>
                  <div className="team-stat-bar-wrap">
                    <div
                      className="team-stat-bar"
                      style={{
                        width: `${Math.min(
                          100,
                          (avgStats[stat] / 150) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="team-stat-value">{avgStats[stat]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="team-stats-section">
            <h3>Couverture de Types</h3>
            <div className="team-type-coverage">
              {Object.entries(typeCoverage).map(([type, count]) => (
                <div key={type} className="team-type-item">
                  <span className="team-type-badge">{type}</span>
                  <span className="team-type-count">×{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPicker && (
        <div
          className="pokemon-picker-overlay"
          onClick={() => setShowPicker(false)}
        >
          <div className="pokemon-picker" onClick={(e) => e.stopPropagation()}>
            <div className="pokemon-picker-header">
              <h3>Choisir un Pokémon</h3>
              <button onClick={() => setShowPicker(false)}>×</button>
            </div>
            <div className="pokemon-picker-grid">
              {loading ? (
                <p>Chargement...</p>
              ) : (
                items.map((pokemon) => (
                  <div
                    key={pokemon.id}
                    className={`pokemon-picker-card ${
                      team.find((p) => p.id === pokemon.id)
                        ? "pokemon-picker-card-disabled"
                        : ""
                    }`}
                    onClick={() => addToTeam(pokemon)}
                  >
                    <PokeImage imageUrl={pokemon.image} />
                    <div className="pokemon-picker-name">
                      {pokemon.name?.english}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save Team Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Enregistrer l'Équipe</h3>
            <input
              type="text"
              placeholder="Nom de l'équipe"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && saveTeam()}
              className="modal-input"
            />
            <div className="modal-actions">
              <button
                className="btn"
                onClick={() => setShowSaveModal(false)}
                disabled={actionLoading}
              >
                Annuler
              </button>
              <button
                className="btn btn-primary"
                onClick={saveTeam}
                disabled={!teamName.trim() || actionLoading}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Team Modal */}
      {showLoadModal && (
        <div className="modal-overlay" onClick={() => setShowLoadModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <h3>Équipes Enregistrées</h3>
            <div className="saved-teams-list">
              {savedTeams.length === 0 ? (
                <p className="empty-message">Aucune équipe enregistrée</p>
              ) : (
                savedTeams.map((savedTeam) => (
                  <div key={savedTeam._id} className="saved-team-item">
                    <div className="saved-team-info">
                      <strong>{savedTeam.name}</strong>
                      <span className="saved-team-date">
                        {savedTeam.createdAt
                          ? new Date(savedTeam.createdAt).toLocaleString()
                          : ""}
                      </span>
                      <div className="saved-team-pokemons">
                        <span className="team-pokemon-tag">
                          {savedTeam.pokemonIds?.length || 0} Pokémon(s)
                        </span>
                      </div>
                    </div>
                    <div className="saved-team-actions">
                      <button
                        className="btn btn-small"
                        onClick={() => loadTeam(savedTeam)}
                        disabled={actionLoading}
                      >
                        Charger
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => deleteTeam(savedTeam.name)}
                        disabled={actionLoading}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="modal-actions">
              <button
                className="btn"
                onClick={() => setShowLoadModal(false)}
                disabled={actionLoading}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamBuilder;

import { Link } from "react-router-dom";
import './index.css';
import PokeTitle from "./pokeTitle";
import PokeImage from "./pokeImage";

const PokeCard = ({ pokemon, selectable = false, selected = false, onSelect }) => {
    const typeColor = {
        normal: '#A8A878', fire: '#F08030', water: '#6890F0', grass: '#78C850',
        electric: '#F8D030', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
        ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
        rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
        steel: '#B8B8D0', fairy: '#EE99AC'
    };

    const typeName = pokemon.type?.[0]?.toLowerCase() || 'normal';
    const baseColor = typeColor[typeName] || '#A8A878';

    // Normalize stat values to 0-100 scale (assuming max stat is around 150)
    const getStatPercent = (stat) => Math.min((stat / 150) * 100, 100);

    return (
        <div className="poke-card-wrapper">
            <Link to={`/pokemon/${pokemon.id}`} className="poke-card-link">
                <div className="poke-card" style={{'--type-color': baseColor}}>
                    {/* Card Border Accent */}
                    <div className="poke-card-border-top" style={{backgroundColor: baseColor}}></div>
                    
                    {/* Header with Type and HP */}
                    <div className="poke-card-header">
                        <div className="poke-card-header-content">
                            <div className="poke-card-type-hp">
                                <span className="poke-type-badge-large" style={{backgroundColor: baseColor}}>
                                    {pokemon.type?.[0] || 'Normal'}
                                </span>
                                <span className="poke-hp-badge">HP {pokemon.base?.HP}</span>
                            </div>
                            {selectable && (
                                <label
                                    className="poke-card-select"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={() => onSelect?.(pokemon.id)}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                        }}
                                        aria-label="Sélectionner ce Pokémon"
                                    />
                                </label>
                            )}
                        </div>
                        <h3 className="poke-card-title">
                            {pokemon.name?.english || pokemon.name?.french}
                        </h3>
                    </div>

                    {/* Image Section */}
                    <div className="poke-image-section">
                        <div className="poke-image-container" style={{background: `linear-gradient(135deg, ${baseColor}40, ${baseColor}20)`}}>
                            <PokeImage imageUrl={pokemon.image} />
                        </div>
                    </div>

                    {/* Separator Line */}
                    <div className="poke-card-separator"></div>

                    {/* Stats Section */}
                    <div className="poke-card-stats">
                        <div className="poke-stats-row">
                            <div className="poke-stat-mini">
                                <span className="stat-label">ATK</span>
                                <span className="stat-value">{pokemon.base?.Attack}</span>
                            </div>
                            <div className="poke-stat-mini">
                                <span className="stat-label">DEF</span>
                                <span className="stat-value">{pokemon.base?.Defense}</span>
                            </div>
                            <div className="poke-stat-mini">
                                <span className="stat-label">SPD</span>
                                <span className="stat-value">{pokemon.base?.Speed}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Footer with All Types */}
                    <div className="poke-card-footer">
                        <div className="poke-all-types">
                            {pokemon.type?.map((t, i) => (
                                <span key={i} className="poke-type-small" style={{backgroundColor: typeColor[t.toLowerCase()]}}>
                                    {t.slice(0, 2).toUpperCase()}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default PokeCard;
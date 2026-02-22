import './index.css';
import PokeImage from '../pokeCard/pokeImage';

const STAT_LABELS = [
    { key: 'Speed', label: 'Vitesse' },
    { key: 'Attack', label: 'Attaque' },
    { key: 'Defense', label: 'Défense' },
    { key: 'SpecialAttack', label: 'Sp. Atk' },
    { key: 'SpecialDefense', label: 'Sp. Def' },
    { key: 'HP', label: 'HP' },
];

const COLORS = ['#38bdf8', '#6366f1', '#22c55e'];

const TYPE_COLORS = {
    Normal: '#A8A878', Fire: '#F08030', Water: '#6890F0', Electric: '#F8D030',
    Grass: '#78C850', Ice: '#98D8D8', Fighting: '#C03028', Poison: '#A040A0',
    Ground: '#E0C068', Flying: '#A890F0', Psychic: '#F85888', Bug: '#A8B820',
    Rock: '#B8A038', Ghost: '#705898', Dragon: '#7038F8', Dark: '#705848',
    Steel: '#B8B8D0', Fairy: '#EE99AC'
};

const buildPolygonPoints = ({ center, radius, values, maxValues }) => {
    const points = values.map((value, index) => {
        const angle = (Math.PI * 2 * index) / values.length - Math.PI / 2;
        const ratio = maxValues[index] ? value / maxValues[index] : 0;
        const r = radius * ratio;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
    });
    return points.join(' ');
};

const RadarChart = ({ pokemons }) => {
    const size = 320;
    const center = size / 2;
    const radius = 110;
    const rings = 4;

    const maxValues = STAT_LABELS.map(() => 150);

    const labelRadius = radius + 26;
    const axisPoints = STAT_LABELS.map((_, index) => {
        const angle = (Math.PI * 2 * index) / STAT_LABELS.length - Math.PI / 2;
        return {
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle),
            lx: center + labelRadius * Math.cos(angle),
            ly: center + labelRadius * Math.sin(angle),
        };
    });

    return (
        <svg className="compare-radar" viewBox={`0 0 ${size} ${size}`}>
            {[...Array(rings)].map((_, i) => {
                const ringRadius = (radius / rings) * (i + 1);
                const ringPoints = STAT_LABELS.map((__, index) => {
                    const angle = (Math.PI * 2 * index) / STAT_LABELS.length - Math.PI / 2;
                    const x = center + ringRadius * Math.cos(angle);
                    const y = center + ringRadius * Math.sin(angle);
                    return `${x},${y}`;
                }).join(' ');
                return (
                    <polygon
                        key={`ring-${i}`}
                        points={ringPoints}
                        className="compare-radar-ring"
                    />
                );
            })}

            {axisPoints.map((point, index) => (
                <line
                    key={`axis-${index}`}
                    x1={center}
                    y1={center}
                    x2={point.x}
                    y2={point.y}
                    className="compare-radar-axis"
                />
            ))}

            {pokemons.map((pokemon, idx) => {
                const values = STAT_LABELS.map((stat) => pokemon?.base?.[stat.key] || 0);
                const points = buildPolygonPoints({
                    center,
                    radius,
                    values,
                    maxValues,
                });
                return (
                    <polygon
                        key={pokemon.id}
                        points={points}
                        className="compare-radar-shape compare-radar-animate"
                        style={{ 
                            stroke: COLORS[idx % COLORS.length], 
                            fill: `${COLORS[idx % COLORS.length]}33`,
                            animationDelay: `${idx * 0.2}s`
                        }}
                    />
                );
            })}

            {axisPoints.map((point, index) => (
                <text
                    key={`label-${index}`}
                    x={point.lx}
                    y={point.ly}
                    className="compare-radar-label"
                    textAnchor="middle"
                    dominantBaseline="middle"
                >
                    {STAT_LABELS[index].label}
                </text>
            ))}
        </svg>
    );
};

const CompareModal = ({ open, onClose, pokemons = [] }) => {
    if (!open) return null;

    const displayPokemons = pokemons.slice(0, 2);

    // Calculate total power for each Pokemon
    const totalPowers = displayPokemons.map(p => 
        STAT_LABELS.reduce((sum, stat) => sum + (p?.base?.[stat.key] || 0), 0)
    );
    const maxPower = Math.max(...totalPowers);
    const overallWinner = totalPowers.indexOf(maxPower);

    return (
        <div className="compare-modal-overlay compare-modal-fade-in" onClick={onClose}>
            <div className="compare-modal compare-modal-scale-in" onClick={(e) => e.stopPropagation()}>
                <button className="compare-modal-close" onClick={onClose} aria-label="Fermer">
                    ×
                </button>
                <div className="compare-modal-title">Comparaison</div>

                <div className="compare-modal-heroes">
                    {displayPokemons.map((pokemon, idx) => (
                        <div 
                            key={pokemon.id} 
                            className={`compare-hero ${idx === overallWinner && totalPowers[0] !== totalPowers[1] ? 'compare-hero-winner' : ''}`}
                            style={idx === overallWinner && totalPowers[0] !== totalPowers[1] ? {
                                boxShadow: `0 0 20px ${COLORS[idx % COLORS.length]}, inset 0 0 20px ${COLORS[idx % COLORS.length]}33`,
                                borderColor: COLORS[idx % COLORS.length]
                            } : {}}
                        >
                            <div className="compare-hero-image">
                                <PokeImage imageUrl={pokemon.image} />
                            </div>
                            <div className="compare-hero-info">
                                <div className="compare-hero-name">
                                    {pokemon.name?.english || pokemon.name?.french}
                                    {idx === overallWinner && totalPowers[0] !== totalPowers[1] && (
                                        <span className="compare-winner-badge"> 🏆</span>
                                    )}
                                </div>
                                {pokemon.type && (
                                    <div className="compare-hero-types">
                                        {pokemon.type.map(t => (
                                            <span 
                                                key={t} 
                                                className="compare-type-badge"
                                                style={{ backgroundColor: TYPE_COLORS[t] || '#777' }}
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="compare-hero-color" style={{ background: COLORS[idx % COLORS.length] }} />
                            </div>
                        </div>
                    ))}
                    <div className="compare-vs-divider">
                        <div className="compare-vs-text">VS</div>
                    </div>
                </div>

                {/* Total Power Comparison */}
                <div className="compare-total-power">
                    <div className="compare-total-power-title">Puissance Totale</div>
                    <div className="compare-total-power-bars">
                        {displayPokemons.map((pokemon, idx) => {
                            const power = totalPowers[idx];
                            const percentage = (power / (maxPower || 1)) * 100;
                            return (
                                <div key={pokemon.id} className="compare-total-power-row">
                                    <span className="compare-total-power-label">
                                        {pokemon.name?.english?.substring(0, 10) || '?'}
                                    </span>
                                    <div className="compare-total-power-bar-wrap">
                                        <div 
                                            className="compare-total-power-bar"
                                            style={{ 
                                                width: `${percentage}%`,
                                                backgroundColor: COLORS[idx % COLORS.length]
                                            }}
                                        />
                                    </div>
                                    <span className="compare-total-power-value">{power}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="compare-radar-wrap">
                    <RadarChart pokemons={displayPokemons} />
                </div>

                <div className="compare-stats-table">
                    <div className="compare-stats-header">
                        <div className="compare-stats-label"></div>
                        {displayPokemons.map((pokemon) => (
                            <div key={pokemon.id} className="compare-stats-pokemon">
                                {pokemon.name?.english || pokemon.name?.french}
                            </div>
                        ))}
                        <div className="compare-stats-diff-header">Diff</div>
                    </div>
                    {STAT_LABELS.map((stat) => {
                        const values = displayPokemons.map(p => p?.base?.[stat.key] || 0);
                        const maxValue = Math.max(...values);
                        const diff = values.length === 2 ? values[0] - values[1] : 0;
                        
                        return (
                            <div key={stat.key} className="compare-stats-row">
                                <div className="compare-stats-name">{stat.label}</div>
                                {displayPokemons.map((pokemon, idx) => {
                                    const value = pokemon?.base?.[stat.key] || 0;
                                    const width = Math.round((value / 150) * 100);
                                    const barColor = idx === 0 ? '#38bdf8' : '#6366f1';
                                    const isWinner = value === maxValue && values[0] !== values[1];
                                    
                                    return (
                                        <div key={`${pokemon.id}-${stat.key}`} className="compare-stats-cell">
                                            <span className={`compare-stats-value ${isWinner ? 'compare-stats-winner' : ''}`}>
                                                {value}
                                                {isWinner && ' ✓'}
                                            </span>
                                            <div className="compare-stats-bar" style={{ width: `${100}%` }}>
                                                <div 
                                                    className="compare-stats-bar-fill"  
                                                    style={{ 
                                                        width: `${width}%`, 
                                                        backgroundColor: barColor,
                                                        zIndex: 99999 
                                                    }} 
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="compare-stats-diff">
                                    {diff > 0 ? `+${diff}` : diff < 0 ? diff : '='}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CompareModal;
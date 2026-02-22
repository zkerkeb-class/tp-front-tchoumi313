import { useMemo, useState } from 'react';
import { usePokemonList } from '../hook/usePokemon';
import PokeImage from '../components/pokeCard/pokeImage';
import './fightSimulator.css';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const computeDamage = (attacker, defender) => {
    const atk = Math.max(attacker.base?.Attack || 0, attacker.base?.SpecialAttack || 0);
    const def = Math.max(defender.base?.Defense || 0, defender.base?.SpecialDefense || 0);
    const raw = Math.floor(atk - def * 0.5 + 10);
    return clamp(raw, 5, 80);
};

const simulateFight = (a, b) => {
    if (!a || !b) return { log: [], winner: null, hpA: 0, hpB: 0 };

    let hpA = a.base?.HP || 0;
    let hpB = b.base?.HP || 0;
    const log = [];
    const hpProgression = [{ hpA, hpB }];

    const speedA = a.base?.Speed || 0;
    const speedB = b.base?.Speed || 0;

    let turn = 1;
    while (hpA > 0 && hpB > 0 && turn < 50) {
        const first = speedA >= speedB ? 'A' : 'B';
        const order = first === 'A' ? [a, b] : [b, a];
        const names = first === 'A' ? ['A', 'B'] : ['B', 'A'];

        const dmg1 = computeDamage(order[0], order[1]);
        if (names[0] === 'A') {
            hpB -= dmg1/10 * Math.random() * 2;
            log.push(`Tour ${turn}: ${a.name?.english || a.name?.french} inflige ${Math.round(dmg1)} dégâts.`);
        } else {
            hpA -= dmg1/10 * Math.random() * 2;
            log.push(`Tour ${turn}: ${b.name?.english || b.name?.french} inflige ${Math.round(dmg1)} dégâts.`);
        }
        hpProgression.push({ hpA: Math.max(0, hpA), hpB: Math.max(0, hpB) });
        if (hpA <= 0 || hpB <= 0) break;

        const dmg2 = computeDamage(order[1], order[0]);
        if (names[1] === 'A') {
            hpB -= dmg2/10 * Math.random() * 2;
            log.push(`Tour ${turn}: ${a.name?.english || a.name?.french} inflige ${Math.round(dmg2)} dégâts.`);
        } else {
            hpA -= dmg2/10 * Math.random() * 2;
            log.push(`Tour ${turn}: ${b.name?.english || b.name?.french} inflige ${Math.round(dmg2)} dégâts.`);
        }
        hpProgression.push({ hpA: Math.max(0, hpA), hpB: Math.max(0, hpB) });

        turn += 1;
    }

    const winner = hpA === hpB ? null : hpA > hpB ? a : b;
    return { log, winner, hpA: Math.max(0, hpA), hpB: Math.max(0, hpB), hpProgression };
};

const FightSimulator = () => {
    const { items } = usePokemonList(1, 200, 0);
    const [firstId, setFirstId] = useState('');
    const [secondId, setSecondId] = useState('');
    const [result, setResult] = useState({ log: [], winner: null, hpA: 0, hpB: 0, hpProgression: [] });
    const [isSimulating, setIsSimulating] = useState(false);

    const first = useMemo(() => items.find(p => String(p.id) === String(firstId)), [items, firstId]);
    const second = useMemo(() => items.find(p => String(p.id) === String(secondId)), [items, secondId]);

    const handleSimulate = () => {
        if (!first || !second) return;
        setIsSimulating(true);
        setTimeout(() => {
            setResult(simulateFight(first, second));
            setIsSimulating(false);
        }, 300);
    };

    const maxHpA = first?.base?.HP || 100;
    const maxHpB = second?.base?.HP || 100;
    const hpPercentA = (result.hpA / maxHpA) * 100;
    const hpPercentB = (result.hpB / maxHpB) * 100;

    return (
        <div className="fight-sim">
            <div className="fight-header">
                <h2>Arène de Combat</h2>
                <p>Sélectionnez deux Pokémon et affrontez-les en combat épique!</p>
            </div>

            <div className="fight-selectors">
                <div className="fight-card fight-card-1">
                    <div className="fight-card-header">
                        <label className="fight-card-label">🔴 Pokémon 1</label>
                        <select
                            className="fight-card-select"
                            value={firstId}
                            onChange={(e) => setFirstId(e.target.value)}
                        >
                            <option value="">Sélectionner</option>
                            {items.map(p => (
                                <option key={p.id} value={p.id}>{p.name?.english || p.name?.french}</option>
                            ))}
                        </select>
                    </div>
                    {first && (
                        <div className="fight-preview fight-preview-active">
                            <div className="fight-preview-image">
                                <PokeImage imageUrl={first.image} />
                            </div>
                            <div className="fight-preview-info">
                                <strong className="fight-pokemon-name">{first.name?.english || first.name?.french}</strong>
                                <div className="fight-stats-mini">
                                    <div className="stat-item">HP: <span className="stat-value">{first.base?.HP}</span></div>
                                    <div className="stat-item">Attack: <span className="stat-value">{first.base?.Attack}</span></div>
                                    <div className="stat-item">Defense: <span className="stat-value">{first.base?.Defense}</span></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="fight-vs-separator">
                    <div className="fight-vs-circle">VS</div>
                </div>

                <div className="fight-card fight-card-2">
                    <div className="fight-card-header">
                        <label className="fight-card-label">🔵 Pokémon 2</label>
                        <select
                            className="fight-card-select"
                            value={secondId}
                            onChange={(e) => setSecondId(e.target.value)}
                        >
                            <option value="">Sélectionner</option>
                            {items.map(p => (
                                <option key={p.id} value={p.id}>{p.name?.english || p.name?.french}</option>
                            ))}
                        </select>
                    </div>
                    {second && (
                        <div className="fight-preview fight-preview-active">
                            <div className="fight-preview-image">
                                <PokeImage imageUrl={second.image} />
                            </div>
                            <div className="fight-preview-info">
                                <strong className="fight-pokemon-name">{second.name?.english || second.name?.french}</strong>
                                <div className="fight-stats-mini">
                                    <div className="stat-item">HP: <span className="stat-value">{second.base?.HP}</span></div>
                                    <div className="stat-item">Attack: <span className="stat-value">{second.base?.Attack}</span></div>
                                    <div className="stat-item">Defense: <span className="stat-value">{second.base?.Defense}</span></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <button 
                className={`btn btn-fight ${isSimulating ? 'btn-fighting' : ''}`}
                onClick={handleSimulate} 
                disabled={!first || !second || isSimulating}
            >
                {isSimulating ? '⚡ Bataille en cours...' : 'Lancer le Combat'}
            </button>

            {result.log.length > 0 && (
                <div className="fight-result">
                    <div className={`fight-result-header ${result.winner ? 'has-winner' : 'draw'}`}>
                        {result.winner ? (
                            <div className="fight-winner-announcement">
                                <div className="trophy-icon">🏆</div>
                                <div>
                                    <div className="winner-label">VAINQUEUR!</div>
                                    <div className="winner-name">{result.winner.name?.english || result.winner.name?.french}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="fight-draw">
                                <div className="draw-icon">⚡</div>
                                <div className="draw-label">MATCH NUL!</div>
                            </div>
                        )}
                    </div>

                    <div className="fight-hp-bars">
                        <div className="hp-bar-container">
                            <div className="hp-bar-label">{first?.name?.english || first?.name?.french}</div>
                            <div className="hp-bar-bg">
                                <div 
                                    className="hp-bar-fill hp-bar-1"
                                    style={{ width: `${hpPercentA}%` }}
                                >
                                    <span className="hp-text">{Math.round(result.hpA)} / {maxHpA}</span>
                                </div>
                            </div>
                        </div>
                        <div className="hp-bar-container">
                            <div className="hp-bar-label">{second?.name?.english || second?.name?.french}</div>
                            <div className="hp-bar-bg">
                                <div 
                                    className="hp-bar-fill hp-bar-2"
                                    style={{ width: `${hpPercentB}%` }}
                                >
                                    <span className="hp-text">{Math.round(result.hpB)} / {maxHpB}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="fight-log-container">
                        <div className="fight-log-title">📜 Journal de Bataille</div>
                        <div className="fight-log">
                            {result.log.map((line, idx) => (
                                <div key={idx} className="fight-log-line" style={{ animationDelay: `${idx * 0.05}s` }}>
                                    <span className="log-turn">T{idx + 1}:</span> {line}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FightSimulator;

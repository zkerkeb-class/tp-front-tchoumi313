import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { usePokemonDetails, apiBaseUrl } from '../hook/usePokemon';
import './pokemonDetails.css';

const getToken = () => localStorage.getItem('poke_token');
const authHeaders = (extra = {}) => ({
    ...extra,
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const PokemonDetails = () => { 
    const { id } = useParams(); 
    const navigate = useNavigate();
    const { pokemon, loading, error } = usePokemonDetails(id);
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const typeColors = {
        normal: '#A8A878', fire: '#F08030', water: '#6890F0', grass: '#78C850',
        electric: '#F8D030', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
        ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
        rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
        steel: '#B8B8D0', fairy: '#EE99AC'
    };

    useEffect(() => {
        if (pokemon) {
            setForm({
                name: {
                    english: pokemon.name?.english || '',
                    french: pokemon.name?.french || ''
                },
                type: pokemon.type || [],
                image: pokemon.image || '',
                base: {
                    HP: pokemon.base?.HP || 0,
                    Attack: pokemon.base?.Attack || 0,
                    Defense: pokemon.base?.Defense || 0,
                    SpecialAttack: pokemon.base?.SpecialAttack || 0,
                    SpecialDefense: pokemon.base?.SpecialDefense || 0,
                    Speed: pokemon.base?.Speed || 0,
                }
            });
        }
    }, [pokemon]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleBaseChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            base: { ...prev.base, [field]: Number(value) }
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await fetch(`${apiBaseUrl}/pokemons/${id}`, {
                method: 'PUT',
                headers: authHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify(form)
            });
            if (!response.ok) throw new Error('Update failed');
            navigate(0);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Supprimer ce Pokémon ?')) return;
        setDeleting(true);
        try {
            const response = await fetch(`${apiBaseUrl}/pokemons/${id}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            if (!response.ok) throw new Error('Delete failed');
            navigate('/');
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <p>Chargement des détails du Pokémon...</p>;
    if (error || !pokemon) return <p>Pokémon introuvable.</p>;

    const primaryType = (pokemon.type?.[0] || 'Normal').toLowerCase();
    const typeColor = typeColors[primaryType] || '#A8A878';

    const getTypeColor = (type) => typeColors[type?.toLowerCase()] || '#A8A878';

    const statItems = [
        { label: 'HP', value: pokemon.base?.HP || 0 },
        { label: 'Attack', value: pokemon.base?.Attack || 0 },
        { label: 'Defense', value: pokemon.base?.Defense || 0 },
        { label: 'Sp. Attack', value: pokemon.base?.SpecialAttack || 0 },
        { label: 'Sp. Defense', value: pokemon.base?.SpecialDefense || 0 },
        { label: 'Speed', value: pokemon.base?.Speed || 0 }
    ];

    const getStatPercent = (value) => Math.min((value / 150) * 100, 100);
    const getStatColor = (value) => (value >= 100 ? '#22c55e' : value >= 70 ? '#f59e0b' : '#ef4444');

    const buildImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('/assets')) return url;
        if (url.startsWith('http')) return url;
        if (url.startsWith('/')) return url;
        return `/${url}`;
    };

    return (
        <div className="details-container">
            <div className="details-header">
                <Link to="/" className="btn">Retour</Link>
                <h1>{pokemon.name?.english || pokemon.name?.french}</h1>
                <button className="btn btn-primary" onClick={() => setIsEditing((prev) => !prev)}>
                    {isEditing ? 'Fermer' : 'Modifier'}
                </button>
            </div>

            <div className="details-card" style={{ '--type-color': typeColor }}>
                <div className="details-image-wrap">
                    <img className="details-image" src={buildImageUrl(pokemon.image)} alt={pokemon.name?.english || pokemon.name?.french} />
                    <div className="details-image-shadow" />
                </div>
                <div className="details-info">
                    <div className="details-meta">
                        <div className="details-row"><span>ID</span><strong>#{pokemon.id}</strong></div>
                        <div className="details-row">
                            <span>Type</span>
                            <div className="details-types">
                                {(pokemon.type || []).map((type) => (
                                    <span key={type} className="details-type-badge" style={{ backgroundColor: getTypeColor(type) }}>
                                        {type}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="details-stats">
                        {statItems.map((stat) => (
                            <div key={stat.label} className="details-stat-item">
                                <div className="details-stat-header">
                                    <span className="details-stat-label">{stat.label}</span>
                                    <span className="details-stat-value">{stat.value}</span>
                                </div>
                                <div className="details-stat-bar">
                                    <div
                                        className="details-stat-fill"
                                        style={{ width: `${getStatPercent(stat.value)}%`, backgroundColor: getStatColor(stat.value) }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {form && isEditing && (
                <form className="details-form" onSubmit={handleSave}>
                    <h2>Modifier</h2>
                    <div className="form-grid">
                        <label>
                            Nom (EN)
                            <input value={form.name.english} onChange={(e) => handleChange('name', { ...form.name, english: e.target.value })} />
                        </label>
                        <label>
                            Nom (FR)
                            <input value={form.name.french} onChange={(e) => handleChange('name', { ...form.name, french: e.target.value })} />
                        </label>
                        <label>
                            Types (séparés par ,)
                            <input value={form.type.join(', ')} onChange={(e) => handleChange('type', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} />
                        </label>
                        <label>
                            Image URL
                            <input value={form.image} onChange={(e) => handleChange('image', e.target.value)} />
                        </label>
                    </div>
                    <div className="form-grid">
                        {Object.keys(form.base).map((key) => (
                            <label key={key}>
                                {key}
                                <input type="number" value={form.base[key]} onChange={(e) => handleBaseChange(key, e.target.value)} />
                            </label>
                        ))}
                    </div>
                    <div className="form-actions">
                        <button className="btn" type="submit" disabled={saving}>Sauvegarder</button>
                        <button className="btn danger" type="button" onClick={handleDelete} disabled={deleting}>Supprimer</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default PokemonDetails;
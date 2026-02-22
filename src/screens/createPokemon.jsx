import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '../hook/usePokemon';
import './createPokemon.css';

const getToken = () => localStorage.getItem('poke_token');
const authHeaders = (extra = {}) => ({
    ...extra,
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const POKEMON_TYPES = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 
    'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 
    'Steel', 'Fairy'];

const TYPE_COLORS = {
    Normal: '#A8A878',
    Fire: '#F08030',
    Water: '#6890F0',
    Electric: '#F8D030',
    Grass: '#78C850',
    Ice: '#98D8D8',
    Fighting: '#C03028',
    Poison: '#A040A0',
    Ground: '#E0C068',
    Flying: '#A890F0',
    Psychic: '#F85888',
    Bug: '#A8B820',
    Rock: '#B8A038',
    Ghost: '#705898',
    Dragon: '#7038F8',
    Dark: '#705848',
    Steel: '#B8B8D0',
    Fairy: '#EE99AC'
};

const CreatePokemon = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    
    const [formData, setFormData] = useState({
        // id: '',
        nameEn: '',
        nameFr: '',
        nameJp: '',
        type: [],
        hp: 0,
        attack: 0,
        defense: 0,
        spAtk: 0,
        spDef: 0,
        speed: 0,
        imageUrl: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTypeToggle = (type) => {
        setFormData(prev => ({
            ...prev,
            type: prev.type.includes(type)
                ? prev.type.filter(t => t !== type)
                : [...prev.type, type]
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        setImageFile(file || null);
        setUploadError('');
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        } else {
            setImagePreview('');
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return '';
        setUploading(true);
        setUploadError('');
        try {
            const form = new FormData();
            form.append('image', imageFile);
            const response = await fetch(`${apiBaseUrl}/upload`, {
                method: 'POST',
                headers: authHeaders(),
                body: form
            });
            if (!response.ok) throw new Error('Upload failed');
            const data = await response.json();
            setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }));
            return data.imageUrl;
        } catch (err) {
            setUploadError('Upload image échoué.');
            return '';
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let imageUrl = formData.imageUrl;
            if (imageFile && !imageUrl) {
                imageUrl = await uploadImage();
                if (!imageUrl) {
                    setLoading(false);
                    return;
                }
            }
            const payload = {
                // id: parseInt(formData.id),
                name: {
                    english: formData.nameEn,
                    french: formData.nameFr || formData.nameEn,
                    japanese: formData.nameJp || formData.nameEn
                },
                type: formData.type,
                base: {
                    HP: parseInt(formData.hp),
                    Attack: parseInt(formData.attack),
                    Defense: parseInt(formData.defense),
                    SpecialAttack: parseInt(formData.spAtk),
                    SpecialDefense: parseInt(formData.spDef),
                    Speed: parseInt(formData.speed)
                },
                image: imageUrl || `/assets/pokemons/${formData.id}.png`
            };

            const response = await fetch(`${apiBaseUrl}/pokemons`, {
                method: 'POST',
                headers: authHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to create Pokemon');
            
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const totalStats = parseInt(formData.hp || 0) + parseInt(formData.attack || 0) + 
        parseInt(formData.defense || 0) + parseInt(formData.spAtk || 0) + 
        parseInt(formData.spDef || 0) + parseInt(formData.speed || 0);

    return (
        <div className="create-pokemon">
            <div className="create-pokemon-header">
                <h2>Créer un Nouveau Pokémon</h2>
                <button className="btn" onClick={() => navigate('/')}>Retour</button>
            </div>

            <form className="create-pokemon-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3>Informations de Base</h3>
                    
                    <div className="form-group">
                        <label>ID *</label>
                        <input 
                            type="number" 
                            name="id"
                            value={formData.id}
                            onChange={handleChange}
                            required
                            min="1"
                        />
                    </div>

                    <div className="form-group">
                        <label>Nom (Anglais) *</label>
                        <input 
                            type="text" 
                            name="nameEn"
                            value={formData.nameEn}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Nom (Français)</label>
                        <input 
                            type="text" 
                            name="nameFr"
                            value={formData.nameFr}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Nom (Japonais)</label>
                        <input 
                            type="text" 
                            name="nameJp"
                            value={formData.nameJp}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>URL de l'image</label>
                        <input 
                            type="text" 
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            placeholder={`Par défaut: /assets/pokemons/${formData.id || 'ID'}.png`}
                        />
                    </div>

                    <div className="form-group">
                        <label>Upload d'image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {imagePreview && (
                            <div className="image-preview">
                                <img src={imagePreview} alt="Prévisualisation" />
                            </div>
                        )}
                        {uploadError && <div className="form-error">{uploadError}</div>}
                        <button
                            type="button"
                            className="btn"
                            onClick={uploadImage}
                            disabled={!imageFile || uploading}
                        >
                            {uploading ? 'Upload...' : 'Uploader l\'image'}
                        </button>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Types *</h3>
                    <div className="type-selector">
                        {POKEMON_TYPES.map(type => (
                            <button
                                key={type}
                                type="button"
                                className={`type-button ${formData.type.includes(type) ? 'type-button-selected' : ''}`}
                                style={formData.type.includes(type) ? { backgroundColor: TYPE_COLORS[type], borderColor: TYPE_COLORS[type] } : { borderColor: TYPE_COLORS[type] }}
                                onClick={() => handleTypeToggle(type)}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-section">
                    <h3>Statistiques de Base</h3>
                    <p className="stats-total">Total: {totalStats}</p>
                    
                    <div className="stats-grid">
                        <div className="form-group">
                            <label>HP</label>
                            <input 
                                type="number" 
                                name="hp"
                                value={formData.hp}
                                onChange={handleChange}
                                min="0"
                                max="255"
                            />
                        </div>

                        <div className="form-group">
                            <label>Attaque</label>
                            <input 
                                type="number" 
                                name="attack"
                                value={formData.attack}
                                onChange={handleChange}
                                min="0"
                                max="255"
                            />
                        </div>

                        <div className="form-group">
                            <label>Défense</label>
                            <input 
                                type="number" 
                                name="defense"
                                value={formData.defense}
                                onChange={handleChange}
                                min="0"
                                max="255"
                            />
                        </div>

                        <div className="form-group">
                            <label>Attaque Spé.</label>
                            <input 
                                type="number" 
                                name="spAtk"
                                value={formData.spAtk}
                                onChange={handleChange}
                                min="0"
                                max="255"
                            />
                        </div>

                        <div className="form-group">
                            <label>Défense Spé.</label>
                            <input 
                                type="number" 
                                name="spDef"
                                value={formData.spDef}
                                onChange={handleChange}
                                min="0"
                                max="255"
                            />
                        </div>

                        <div className="form-group">
                            <label>Vitesse</label>
                            <input 
                                type="number" 
                                name="speed"
                                value={formData.speed}
                                onChange={handleChange}
                                min="0"
                                max="255"
                            />
                        </div>
                    </div>
                </div>

                {error && <div className="form-error">{error}</div>}

                <div className="form-actions">
                    <button type="button" className="btn" onClick={() => navigate('/')}>
                        Annuler
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading || uploading || formData.type.length === 0}>
                        {loading ? 'Création...' : 'Créer le Pokémon'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePokemon;

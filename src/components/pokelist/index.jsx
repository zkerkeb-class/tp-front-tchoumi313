import { useEffect, useMemo, useState } from "react";
import PokeCard from "../pokeCard";
import {
    comparePokemons,
    deletePokemons,
    duplicatePokemon,
    getPokemonByName,
    usePokemonList,
    useSearch
} from "../../hook/usePokemon";
import CompareModal from "../compareModal";

import './index.css';

const PAGE_SIZE = 20;

const POKEMON_TYPES = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 
    'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 
    'Steel', 'Fairy'];

const SORT_OPTIONS = [
    { value: 'id', label: 'ID' },
    { value: 'name', label: 'Nom' },
    { value: 'total', label: 'Puissance Totale' },
    { value: 'hp', label: 'HP' },
    { value: 'attack', label: 'Attaque' },
    { value: 'defense', label: 'Défense' },
];

const PokeList = () => {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [sortBy, setSortBy] = useState("id");
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState(null);
    const [compareResults, setCompareResults] = useState([]);
    const [compareOpen, setCompareOpen] = useState(false);

    const { items, total, totalPages, loading, error } = usePokemonList(page, PAGE_SIZE, refreshKey, typeFilter);
    const { results: searchResults, loading: searchLoading, error: searchError } = useSearch(searchTerm);
    const isSearching = searchTerm.trim().length > 0;
    
    // Apply sorting only (filtering is now done by backend)
    const displayItems = useMemo(() => {
        let result = isSearching ? searchResults : items;
        
        // Apply sorting
        result = [...result].sort((a, b) => {
            switch(sortBy) {
                case 'name':
                    return (a.name?.english || '').localeCompare(b.name?.english || '');
                case 'total':
                    const totalA = Object.values(a.base || {}).reduce((sum, val) => sum + val, 0);
                    const totalB = Object.values(b.base || {}).reduce((sum, val) => sum + val, 0);
                    return totalB - totalA;
                case 'hp':
                    return (b.base?.HP || 0) - (a.base?.HP || 0);
                case 'attack':
                    return (b.base?.Attack || 0) - (a.base?.Attack || 0);
                case 'defense':
                    return (b.base?.Defense || 0) - (a.base?.Defense || 0);
                default:
                    return a.id - b.id;
            }
        });
        
        return result;
    }, [items, searchResults, isSearching, sortBy]);
    
    const displayTotal = isSearching ? displayItems.length : total;
    const selectedCount = selectedIds.size;
    const selectedList = useMemo(() => Array.from(selectedIds), [selectedIds]);

    useEffect(() => {
        if (isSearching) setPage(1);
    }, [isSearching]);

    useEffect(() => {
        setSelectedIds(new Set());
        setCompareResults([]);
        setActionError(null);
        setCompareOpen(false);
    }, [page, searchTerm]);

    const toggleSelect = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const selectAllOnPage = () => {
        const next = new Set(displayItems.map((pokemon) => pokemon.id));
        setSelectedIds(next);
    };

    const clearSelection = () => setSelectedIds(new Set());

    const handleDuplicate = async () => {
        if (selectedCount !== 1) return;
        setActionLoading(true);
        setActionError(null);
        try {
            await duplicatePokemon(selectedList[0]);
            setRefreshKey((k) => k + 1);
            clearSelection();
        } catch (err) {
            setActionError(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCount) return;
        if (!window.confirm(`Supprimer ${selectedCount} Pokémon(s) ?`)) return;
        setActionLoading(true);
        setActionError(null);
        try {
            await deletePokemons(selectedList);
            setRefreshKey((k) => k + 1);
            clearSelection();
        } catch (err) {
            setActionError(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCompare = async () => {
        if (selectedCount < 2) return;
        setActionLoading(true);
        setActionError(null);
        try {
            const results = await comparePokemons(selectedList);
            setCompareResults(results);
            setCompareOpen(true);
        } catch (err) {
            setActionError(err);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && !isSearching) return <p>Chargement...</p>;
    if (error){
        console.error("Erreur lors du chargement:", error);
        return <p>Erreur lors du chargement.</p>;}

    return (
        <div className="poke-list-container">
            <div className="poke-list-header">
                <h2>Liste des Pokémon</h2>
                <span className="poke-list-count">Total: {displayTotal}</span>
            </div>
            
            <div className="poke-filters">
                <div className="poke-search">
                    <input
                        className="poke-search-input"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher par nom ou ID"
                    />
                </div>
                
                <div className="poke-filter-controls">
                    <select 
                        className="poke-select"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="">Tous les types</option>
                        {POKEMON_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    
                    <select 
                        className="poke-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="">Trier par</option>
                        {SORT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="poke-actions">
                <span className="poke-actions-count">Sélection: {selectedCount}</span>
                <div className="poke-actions-buttons">
                    <button className="btn" onClick={selectAllOnPage} disabled={!displayItems.length}>
                        Tout sélectionner
                    </button>
                    <button className="btn" onClick={clearSelection} disabled={!selectedCount}>
                        Réinitialiser
                    </button>
                    <button className="btn" onClick={handleDuplicate} disabled={actionLoading || selectedCount !== 1}>
                        Dupliquer
                    </button>
                    <button className="btn btn-danger" onClick={handleDelete} disabled={actionLoading || !selectedCount}>
                        Supprimer
                    </button>
                    <button className="btn" onClick={handleCompare} disabled={actionLoading || selectedCount != 2}>
                        Comparer
                    </button>
                </div>
            </div>
            {!isSearching && (
                <div className="poke-list-pagination">
                    <button
                        className="btn"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        >
                            {"<"}
                        </button>
                        <span className="page-indicator">Page {page} / {totalPages}</span>
                        <button
                            className="btn"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            {">"}
                        </button>
                    </div>
                )}
            {actionError && <p>Erreur d'action.</p>}
            {searchLoading && isSearching && <p>Recherche...</p>}
            {searchError && isSearching && <p>Erreur de recherche.</p>}
            <div className="poke-list">
                {displayItems.map((pokemon) => (
                    <PokeCard
                        key={pokemon.id}
                        pokemon={pokemon}
                        selectable
                        selected={selectedIds.has(pokemon.id)}
                        onSelect={toggleSelect}
                    />
                ))}
            </div>
            {!displayItems.length && !loading && (!isSearching || !searchLoading) && (
                <p>Aucun résultat.</p>
            )}
            
            <CompareModal
                open={compareOpen}
                onClose={() => setCompareOpen(false)}
                pokemons={compareResults}
            />
        </div>
    );
};

export default PokeList;

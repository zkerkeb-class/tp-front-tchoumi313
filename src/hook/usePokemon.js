import { useState, useEffect } from 'react';

const API_BASE = '/api';

const getToken = () => localStorage.getItem('poke_token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

export const usePokemonList = (page, limit, refreshKey, typeFilter = '') => {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchList = async () => {
            setLoading(true);
            setError(null);
            try {
                let url = `${API_BASE}/pokemons/?page=${page}&limit=${limit}`;
                if (typeFilter) {
                    url += `&type=${encodeURIComponent(typeFilter)}`;
                }
                const response = await fetch(url, { headers: authHeaders() });
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }
                const data = await response.json();

                if (Array.isArray(data)) {
                    const start = (page - 1) * limit;
                    const sliced = data.slice(start, start + limit);
                    setItems(sliced);
                    setTotal(data.length);
                } else {
                    const list = data.items || data.pokemons || [];
                    setItems(list);
                    setTotal(data.total || list.length);
                }
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchList();
    }, [page, limit, refreshKey, typeFilter]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { items, total, totalPages, loading, error };
};

export const usePokemonDetails = (id) => {
    const [pokemon, setPokemon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPokemon = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE}/pokemons/${id}`, { headers: authHeaders() });
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setPokemon(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchPokemon();
    }, [id]);

    return { pokemon, loading, error };
};

export const useSearch = (searchTerm) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setResults([]);
            return;
        }
        
        const fetchResults = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE}/pokemons/search?q=${encodeURIComponent(searchTerm)}`, { headers: authHeaders() });
                if (!response.ok) throw new Error('Search failed');
                const data = await response.json();
                setResults(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    return { results, loading, error };
};

export const apiBaseUrl = API_BASE;

export const duplicatePokemon = async (id) => {
    const response = await fetch(`${API_BASE}/pokemons/${id}`, {
        method: 'POST',
        headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Duplicate failed');
    return response.json();
};

export const deletePokemons = async (ids) => {
    const response = await fetch(`${API_BASE}/pokemons`, {
        method: 'DELETE',
        headers: authHeaders(),
        body: JSON.stringify({ ids })
    });
    if (!response.ok) throw new Error('Delete failed');
    return response.json();
};

export const comparePokemons = async (ids) => {
    const query = encodeURIComponent(ids.join(','));
    const response = await fetch(`${API_BASE}/pokemons/comparetwo?ids=${query}`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Compare failed');
    return response.json();
};

export const getPokemonByName = async (name) => {
    const response = await fetch(`${API_BASE}/pokemonbyname/${encodeURIComponent(name)}`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Pokemon not found');
    return response.json();
};

// Team persistence helpers
export const createTeam = async ({ name, pokemonIds }) => {
    const response = await fetch(`${API_BASE}/teams`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name, pokemonIds })
    });
    if (!response.ok) throw new Error('Team create failed');
    return response.json();
};

export const listTeams = async () => {
    const response = await fetch(`${API_BASE}/teams`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Team list failed');
    return response.json();
};

export const getTeamByName = async (name) => {
    const response = await fetch(`${API_BASE}/teams/${encodeURIComponent(name)}`, { headers: authHeaders() });
    if (!response.ok) throw new Error('Team not found');
    return response.json();
};

export const updateTeam = async (name, pokemonIds) => {
    const response = await fetch(`${API_BASE}/teams/${encodeURIComponent(name)}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ pokemonIds })
    });
    if (!response.ok) throw new Error('Team update failed');
    return response.json();
};

export const deleteTeamByName = async (name) => {
    const response = await fetch(`${API_BASE}/teams/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Team delete failed');
    return response.json();
};

// export const usePokemonList = (page, limit, refreshKey, typeFilter = '') => {
//     const [items, setItems] = useState([]);
//     const [total, setTotal] = useState(0);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const fetchList = async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 let url = `${API_BASE}/pokemons/?page=${page}&limit=${limit}`;
//                 if (typeFilter) {
//                     url += `&type=${encodeURIComponent(typeFilter)}`;
//                 }
//                 const response = await fetch(url);
//                 if (!response.ok) {
//                     throw new Error(`HTTP Error: ${response.status}`);
//                 }
//                 const data = await response.json();

//                 if (Array.isArray(data)) {
//                     const start = (page - 1) * limit;
//                     const sliced = data.slice(start, start + limit);
//                     setItems(sliced);
//                     setTotal(data.length);
//                 } else {
//                     const list = data.items || data.pokemons || [];
//                     setItems(list);
//                     setTotal(data.total || list.length);
//                 }
//             } catch (err) {
//                 setError(err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchList();
//     }, [page, limit, refreshKey, typeFilter]);

//     const totalPages = Math.max(1, Math.ceil(total / limit));
//     return { items, total, totalPages, loading, error };
// };

// export const usePokemonDetails = (id) => {
//     const [pokemon, setPokemon] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const fetchPokemon = async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 const response = await fetch(`${API_BASE}/pokemons/${id}`);
//                 if (!response.ok) throw new Error('Network response was not ok');
//                 const data = await response.json();
//                 setPokemon(data);
//             } catch (err) {
//                 setError(err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (id) fetchPokemon();
//     }, [id]);

//     return { pokemon, loading, error };
// };

// export const useSearch = (searchTerm) => {
//     const [results, setResults] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         if (!searchTerm.trim()) {
//             setResults([]);
//             return;
//         }
        
//         const fetchResults = async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 const response = await fetch(`${API_BASE}/pokemons/search?q=${encodeURIComponent(searchTerm)}`);
//                 if (!response.ok) throw new Error('Search failed');
//                 const data = await response.json();
//                 setResults(data);
//             } catch (err) {
//                 setError(err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         const timer = setTimeout(fetchResults, 300);
//         return () => clearTimeout(timer);
//     }, [searchTerm]);

//     return { results, loading, error };
// };

// export const apiBaseUrl = API_BASE;

// export const duplicatePokemon = async (id) => {
//     const response = await fetch(`${API_BASE}/pokemons/${id}`, {
//         method: 'POST'
//     });
//     if (!response.ok) throw new Error('Duplicate failed');
//     return response.json();
// };

// export const deletePokemons = async (ids) => {
//     const response = await fetch(`${API_BASE}/pokemons`, {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ ids })
//     });
//     if (!response.ok) throw new Error('Delete failed');
//     return response.json();
// };

// export const comparePokemons = async (ids) => {
//     const query = encodeURIComponent(ids.join(','));
//     const response = await fetch(`${API_BASE}/pokemons/comparetwo?ids=${query}`);
//     if (!response.ok) throw new Error('Compare failed');
//     return response.json();
// };

// export const getPokemonByName = async (name) => {
//     const response = await fetch(`${API_BASE}/pokemonbyname/${encodeURIComponent(name)}`);
//     if (!response.ok) throw new Error('Pokemon not found');
//     return response.json();
// };

// // Team persistence helpers
// export const createTeam = async ({ name, pokemonIds }) => {
//     const response = await fetch(`${API_BASE}/teams`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ name, pokemonIds })
//     });
//     if (!response.ok) throw new Error('Team create failed');
//     return response.json();
// };

// export const listTeams = async () => {
//     const response = await fetch(`${API_BASE}/teams`);
//     if (!response.ok) throw new Error('Team list failed');
//     return response.json();
// };

// export const getTeamByName = async (name) => {
//     const response = await fetch(`${API_BASE}/teams/${encodeURIComponent(name)}`);
//     if (!response.ok) throw new Error('Team not found');
//     return response.json();
// };

// export const updateTeam = async (name, pokemonIds) => {
//     const response = await fetch(`${API_BASE}/teams/${encodeURIComponent(name)}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ pokemonIds })
//     });
//     if (!response.ok) throw new Error('Team update failed');
//     return response.json();
// };

// export const deleteTeamByName = async (name) => {
//     const response = await fetch(`${API_BASE}/teams/${encodeURIComponent(name)}`, {
//         method: 'DELETE'
//     });
//     if (!response.ok) throw new Error('Team delete failed');
//     return response.json();
// };
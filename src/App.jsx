import './App.css'
import { Link, Routes, Route, Navigate } from 'react-router-dom'
import Pokelist from './components/pokelist'
import PokemonDetails from './screens/pokemonDetails'
import TeamBuilder from './screens/teamBuilder'
import CreatePokemon from './screens/createPokemon'
import FightSimulator from './screens/fightSimulator'
import Login from './screens/Login'
import AuthCallback from './screens/AuthCallback'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'

// Header is its own component so it can access AuthContext
const AppHeader = () => {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <Link to="/" className="app-brand">PokeMon-Dex</Link>
      <nav className="app-nav">
        <Link to="/" className="app-nav-link">Liste</Link>
        <Link to="/team" className="app-nav-link">Équipe</Link>
        <Link to="/create" className="app-nav-link">Créer</Link>
        <Link to="/fight" className="app-nav-link">Combat</Link>
        {user && (
          <div className="app-user">
            {user.avatar && (
              <img className="app-user-avatar" src={user.avatar} alt={user.name} referrerPolicy="no-referrer" />
            )}
            <span className="app-user-name">{user.name?.split(' ')[0]}</span>
            <button className="app-logout-btn" onClick={logout}>Déconnexion</button>
          </div>
        )}
      </nav>
    </header>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Routes>
          {/* Public pages — no header */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* All protected pages share the header layout */}
          <Route path="/*" element={
            <ProtectedRoute>
              <AppHeader />
              <main className="app-content">
                <Routes>
                  <Route path="/" element={<Pokelist />} />
                  <Route path="/pokemon/:id" element={<PokemonDetails />} />
                  <Route path="/team" element={<TeamBuilder />} />
                  <Route path="/create" element={<CreatePokemon />} />
                  <Route path="/fight" element={<FightSimulator />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App

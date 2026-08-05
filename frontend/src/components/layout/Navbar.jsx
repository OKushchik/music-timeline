import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useMusicProvider } from '../../context/MusicProviderContext';

const PROVIDER_LABELS = {
  deezer:  { label: 'Deezer',   color: 'text-green-400',  icon: '♪' },
  spotify: { label: 'Spotify',  color: 'text-green-500',  icon: '♪' },
  youtube: { label: 'YouTube',  color: 'text-yellow-400', icon: '▶' },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { provider, loading } = useMusicProvider();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const providerInfo = PROVIDER_LABELS[provider] ?? PROVIDER_LABELS.deezer;

  return (
    <nav className="bg-darker border-b border-card px-6 py-3 flex flex-col sm:flex-row items-center justify-between">
      <Link to="/" className="text-xl font-bold text-primary tracking-wide">
        🎵 Timeline
      </Link>

      <div className="flex items-center gap-4">
        {/* Active music provider badge */}
        {!loading && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full bg-card border border-gray-700 ${providerInfo.color}`}
            title="Active music provider (change via MUSIC_PROVIDER in backend .env)"
          >
            {providerInfo.icon} {providerInfo.label}
          </span>
        )}

        {user ? (
          <>
            <Link to="/lobby" className="text-sm text-gray-300 hover:text-primary transition">
              Lobby
            </Link>
            <span className="text-sm text-gray-400">
              👤 {user.username}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm bg-accent hover:bg-red-600 text-white px-3 py-1 rounded-md transition"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            className="text-sm bg-primary hover:bg-indigo-500 text-white px-4 py-1.5 rounded-md transition"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}

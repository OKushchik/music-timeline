import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/authApi';
import Button from '../components/shared/Button';
import toast from 'react-hot-toast';

export default function HomePage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleGuest = async () => {
    try {
      const data = await authApi.guest();
      login(data);
      navigate('/lobby');
    } catch {
      toast.error('Could not start guest session');
    }
  };

  return (
    <main className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-xl">
        <h1 className="text-5xl font-black text-white mb-4 leading-tight">
          🎵 Music <span className="text-primary">Timeline</span>
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Listen to songs. Place them in the correct chronological order.
          Beat your friends online or pass-and-play locally.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {user ? (
            <Button onClick={() => navigate('/lobby')} className="text-base px-8 py-3">
              🚀 Go to Lobby
            </Button>
          ) : (
            <>
              <Button onClick={() => navigate('/auth')} className="text-base px-8 py-3">
                Sign In / Register
              </Button>
              <Button variant="ghost" onClick={handleGuest} className="text-base px-8 py-3">
                Play as Guest
              </Button>
            </>
          )}
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {[
            { icon: '🎧', title: 'Listen', desc: 'A 30-second clip plays — no artist or year shown.' },
            { icon: '🗓️', title: 'Place', desc: 'Drag the card to the correct spot in your timeline.' },
            { icon: '🏆', title: 'Compete', desc: 'Play online with friends or pass-and-play on one device.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-card rounded-xl p-4 border border-slate-700">
              <div className="text-3xl mb-2">{icon}</div>
              <h3 className="font-bold text-white mb-1">{title}</h3>
              <p className="text-gray-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}


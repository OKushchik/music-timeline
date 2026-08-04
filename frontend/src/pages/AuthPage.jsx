import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

export default function AuthPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('login');

  if (user) return <Navigate to="/lobby" replace />;

  return (
    <main className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Tab switcher */}
        <div className="flex bg-darker border border-card rounded-xl overflow-hidden mb-6">
          {['login', 'register'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors
                ${tab === t ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <div className="bg-darker border border-card rounded-xl p-6">
          {tab === 'login'
            ? <LoginForm    onSwitch={() => setTab('register')} />
            : <RegisterForm onSwitch={() => setTab('login')} />}
        </div>
      </div>
    </main>
  );
}


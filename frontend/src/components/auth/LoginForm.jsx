import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/authApi';
import Button from '../shared/Button';
import toast from 'react-hot-toast';

export default function LoginForm({ onSwitch }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login(form);
      login(data);
      toast.success(`Welcome back, ${data.username}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full bg-card border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full bg-card border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          placeholder="••••••••"
        />
      </div>
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? 'Signing in…' : 'Sign In'}
      </Button>
      <p className="text-center text-sm text-gray-400">
        No account?{' '}
        <button type="button" onClick={onSwitch} className="text-primary hover:underline">
          Register
        </button>
      </p>
    </form>
  );
}


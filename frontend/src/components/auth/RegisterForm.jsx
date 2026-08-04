import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/authApi';
import Button from '../shared/Button';
import toast from 'react-hot-toast';

export default function RegisterForm({ onSwitch }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.register(form);
      login(data);
      toast.success(`Account created! Welcome, ${data.username}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Username</label>
        <input
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          required
          minLength={2}
          maxLength={20}
          className="w-full bg-card border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          placeholder="coolplayer99"
        />
      </div>
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
          minLength={6}
          className="w-full bg-card border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          placeholder="Min. 6 characters"
        />
      </div>
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? 'Creating account…' : 'Create Account'}
      </Button>
      <p className="text-center text-sm text-gray-400">
        Already have an account?{' '}
        <button type="button" onClick={onSwitch} className="text-primary hover:underline">
          Sign In
        </button>
      </p>
    </form>
  );
}


import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { roomApi } from '../../api/roomApi';
import { EVENTS } from '../../utils/socketEvents';
import Button from '../shared/Button';
import toast from 'react-hot-toast';

export default function CreateRoom({ onCancel }) {
  const { token, user } = useAuth();
  const { emit, connected } = useSocket();
  const [form, setForm] = useState({
    name: `${user?.username}'s Room`,
    totalRounds: 10,
    maxPlayers: 4,
    isPrivate: true,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const room = await roomApi.createRoom(token, {
        name: form.name,
        totalRounds: form.totalRounds,
        maxPlayers: form.maxPlayers,
        isPrivate: form.isPrivate,
        mode: 'online',
      });
      toast.success(`Room ${room.code} created!`);
      if (!connected) {
        toast.error('Room created but socket not connected — refresh and join by code');
        return;
      }
      // Emit JOIN_ROOM so the LobbyPage JOIN_SUCCESS listener shows the WaitingRoom.
      emit(EVENTS.JOIN_ROOM, { roomCode: room.code });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Room Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          maxLength={40}
          className="w-full bg-card border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
        />
      </div>
      <fieldset>
        <legend className="block text-sm text-gray-400 mb-2">Visibility</legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
            <input
              type="radio"
              name="visibility"
              checked={form.isPrivate === true}
              onChange={() => setForm({ ...form, isPrivate: true })}
              className="accent-primary"
            />
            Private
          </label>
          <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
            <input
              type="radio"
              name="visibility"
              checked={form.isPrivate === false}
              onChange={() => setForm({ ...form, isPrivate: false })}
              className="accent-primary"
            />
            Global
          </label>
        </div>
        <p className="mt-1.5 text-xs text-gray-500">
          {form.isPrivate
            ? 'Join by room code only — not shown in Open Rooms.'
            : 'Shown in Open Rooms — anyone can join from the list.'}
        </p>
      </fieldset>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm text-gray-400 mb-1">Rounds</label>
          <select
            name="totalRounds"
            value={form.totalRounds}
            onChange={handleChange}
            className="w-full bg-card border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-400 mb-1">Max Players</label>
          <select
            name="maxPlayers"
            value={form.maxPlayers}
            onChange={handleChange}
            className="w-full bg-card border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            {[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" fullWidth onClick={onCancel}>Cancel</Button>
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Creating…' : 'Create Room'}
        </Button>
      </div>
    </form>
  );
}

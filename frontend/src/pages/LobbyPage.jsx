import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { roomApi } from '../api/roomApi';
import { EVENTS } from '../utils/socketEvents';
import CreateRoom from '../components/lobby/CreateRoom';
import JoinRoom from '../components/lobby/JoinRoom';
import WaitingRoom from '../components/lobby/WaitingRoom';
import Modal from '../components/shared/Modal';
import Button from '../components/shared/Button';
import Loader from '../components/shared/Loader';
import toast from 'react-hot-toast';

export default function LobbyPage() {
  const { token } = useAuth();
  const { emit, on } = useSocket();
  const navigate = useNavigate();

  const [openRooms, setOpenRooms] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null); // 'create' | 'join' | null
  const [joinedRoom, setJoinedRoom] = useState(null);

  // Fetch / poll open Global rooms while browsing the lobby
  useEffect(() => {
    if (!token || joinedRoom) return undefined;

    let cancelled = false;
    const loadRooms = (showError = false) =>
      roomApi.getRooms(token)
        .then((rooms) => { if (!cancelled) setOpenRooms(rooms); })
        .catch(() => { if (showError && !cancelled) toast.error('Could not fetch rooms'); })
        .finally(() => { if (!cancelled) setLoading(false); });

    loadRooms(true);
    const id = setInterval(() => loadRooms(false), 4000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token, joinedRoom]);

  // Listen for socket join confirmation
  useEffect(() => {
    const offJoin = on(EVENTS.JOIN_SUCCESS, ({ room }) => {
      setJoinedRoom(room);
      setModal(null);
    });
    const offErr = on(EVENTS.ERROR, ({ message }) => toast.error(message));
    return () => { offJoin(); offErr(); };
  }, [on]);

  const handleQuickJoin = (code) => {
    emit(EVENTS.JOIN_ROOM, { roomCode: code });
  };

  const handleLocalGame = () => navigate('/setup');

  if (joinedRoom) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-8">
        <WaitingRoom
          room={joinedRoom}
          onLeave={() => {
            setJoinedRoom(null);
            roomApi.getRooms(token).then(setOpenRooms).catch(() => {});
          }}
        />
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-white mb-2">Game Lobby</h1>
      <p className="text-gray-400 mb-8">Create a room, join a friend, or start a local pass-and-play game.</p>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Button onClick={() => setModal('create')}>➕ Create Room</Button>
        <Button variant="ghost" onClick={() => setModal('join')}>🔑 Join by Code</Button>
        <Button variant="secondary" onClick={handleLocalGame}>🎮 Local Game</Button>
      </div>

      {/* Open rooms list */}
      <h2 className="text-lg font-bold text-white mb-3">Open Rooms</h2>
      {loading ? (
        <Loader text="Fetching rooms…" />
      ) : openRooms.length === 0 ? (
        <div className="bg-darker border border-card rounded-xl p-8 text-center text-gray-500">
          No open rooms. Be the first to create one!
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {openRooms.map((r) => (
            <li key={r._id} className="bg-darker border border-card rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{r.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Host: {r.host?.username} · {r.players.length}/{r.maxPlayers} players · {r.totalRounds} rounds
                </p>
              </div>
              <Button onClick={() => handleQuickJoin(r.code)} className="text-xs px-3 py-1.5">
                Join
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Modals */}
      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="Create a Room">
        <CreateRoom onCancel={() => setModal(null)} />
      </Modal>
      <Modal isOpen={modal === 'join'} onClose={() => setModal(null)} title="Join by Room Code">
        <JoinRoom onCancel={() => setModal(null)} />
      </Modal>
    </main>
  );
}


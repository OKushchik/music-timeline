import { createContext, useContext, useEffect, useState } from 'react';
import { musicApi } from '../api/musicApi';

/**
 * Provides the active music provider name to the whole app.
 * The provider is set server-side via the MUSIC_PROVIDER env var.
 *
 * provider: 'deezer' | 'spotify' | 'youtube'
 */
const MusicProviderContext = createContext({ provider: 'deezer', loading: true });

export function MusicProviderProvider({ children }) {
  const [provider, setProvider] = useState('deezer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    musicApi
      .getProvider()
      .then(({ provider: p }) => setProvider(p))
      .catch(() => setProvider('deezer'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MusicProviderContext.Provider value={{ provider, loading }}>
      {children}
    </MusicProviderContext.Provider>
  );
}

export function useMusicProvider() {
  return useContext(MusicProviderContext);
}

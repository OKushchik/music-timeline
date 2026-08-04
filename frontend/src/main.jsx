import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { MusicProviderProvider } from './context/MusicProviderContext';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <MusicProviderProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                style: { background: '#0F3460', color: '#f1f1f1', border: '1px solid #6C63FF' },
              }}
            />
          </MusicProviderProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);


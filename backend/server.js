require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { connectDB } = require('./src/config/db');
const { initSocket } = require('./src/sockets');
const authRoutes = require('./src/routes/authRoutes');
const roomRoutes = require('./src/routes/roomRoutes');
const songRoutes = require('./src/routes/songRoutes');
const spotifyRoutes = require('./src/routes/spotifyRoutes');
const musicRoutes = require('./src/routes/musicRoutes');
const { errorHandler } = require('./src/middleware/errorMiddleware');

const app = express();
const httpServer = http.createServer(app);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/spotify', spotifyRoutes);   // legacy — kept for backwards compat
app.use('/api/music', musicRoutes);        // unified provider-agnostic music API

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Error handler (must be last)
app.use(errorHandler);

// Socket.io
initSocket(httpServer);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

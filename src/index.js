require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const { sequelize } = require('./models');

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL;
// When CLIENT_URL is '*' or unset, reflect the request origin (required for credentials)
const corsOrigin = (!clientUrl || clientUrl === '*') ? true : clientUrl;
const corsOptions = { origin: corsOrigin, credentials: true };

const io = new Server(server, { cors: corsOptions });

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/promotions', require('./routes/promotions'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/followups', require('./routes/followups'));
app.use('/api/measurements', require('./routes/measurements'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/coach-notes', require('./routes/coachNotes'));
app.use('/api/check-ins', require('./routes/checkIns'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/progress-photos', require('./routes/progressPhotos'));
app.use('/api/gym', require('./routes/gym'));
app.use('/api/gym-programs', require('./routes/gymPrograms'));
app.use('/api/follow', require('./routes/follow'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// WebSocket for real-time messaging
const onlineUsers = new Map();
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('users_online', Array.from(onlineUsers.keys()));
  });

  socket.on('send_message', (data) => {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new_message', data);
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, sid] of onlineUsers.entries()) {
      if (sid === socket.id) { onlineUsers.delete(userId); break; }
    }
    io.emit('users_online', Array.from(onlineUsers.keys()));
  });
});

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Base de données synchronisée');
  server.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));
}).catch((err) => {
  console.error('❌ Erreur de connexion à la base de données:', err);
  process.exit(1);
});

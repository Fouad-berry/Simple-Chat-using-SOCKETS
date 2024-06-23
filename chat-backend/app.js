const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const socket = require('socket.io');
const http = require('http');

app.use(cors());

const server = http.createServer(app);
const io = socket(server, {
  cors: { origin: 'http://localhost:5173' }
});

let socketsConnected = new Set();
let users = {};

// Objets pour stocker les messages
let generalMessages = [];
let privateMessages = {}; // clé: user1_user2, valeur: array de messages

io.on('connection', (socket) => {
  console.log(`New user connected: ${socket.id}`);
  socketsConnected.add(socket.id);

  // Envoyer le nombre de sockets connectés
  io.emit('userCount', socketsConnected.size);

  // Envoyer l'historique général au nouvel utilisateur
  socket.emit('messageHistory', generalMessages);

  // Ajouter l'événement de réception des messages
  socket.on('message', (message) => {
    generalMessages.push(message);
    io.emit('message', message);
  });

  // Ajouter l'événement de message privé
  socket.on('privateMessage', (data) => {
    const { receiverId, message } = data;
    const senderId = socket.id;

    // Créer une clé unique pour identifier la conversation privée
    const conversationKey = [senderId, receiverId].sort().join('_');
    if (!privateMessages[conversationKey]) {
      privateMessages[conversationKey] = [];
    }

    privateMessages[conversationKey].push(message);
    socket.to(receiverId).emit('privateMessage', message);
  });

  // Envoyer l'historique des messages privés
  socket.on('requestPrivateHistory', (receiverId) => {
    const senderId = socket.id;
    const conversationKey = [senderId, receiverId].sort().join('_');

    if (privateMessages[conversationKey]) {
      socket.emit('privateMessageHistory', privateMessages[conversationKey]);
    } else {
      socket.emit('privateMessageHistory', []);
    }
  });

  // Ajouter les événements de saisie
  socket.on('typing', (user) => {
    socket.broadcast.emit('typing', user);
  });

  socket.on('stopTyping', () => {
    socket.broadcast.emit('stopTyping');
  });

  // Ajouter l'événement de définition du nom d'utilisateur
  socket.on('setUsername', (username) => {
    users[socket.id] = username;
    io.emit('updateUserList', users);
  });

  // Ajouter l'événement de déconnexion
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    socketsConnected.delete(socket.id);
    delete users[socket.id];
    io.emit('updateUserList', users);
    io.emit('userCount', socketsConnected.size);
  });
});

app.get('/', (req, res) => {
  res.send('Hello, welcome to my server');
});

server.listen(port, () => {
  console.log(`Server online on http://localhost:${port}`);
});

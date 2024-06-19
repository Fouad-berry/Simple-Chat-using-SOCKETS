const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const socket = require('socket.io');
const http = require('http');

app.use(cors());
const server = http.createServer(app);
const io = socket(server, {
    cors: {origin: 'http://localhost:5173/'}
})

io.on(`connection`, (socket) => {
    coonsole.log(`New user connected' : ${socket.id}`);
})

app.get('/', (req,res) => {
    res.send('Hello! Welcome to my server');
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
})
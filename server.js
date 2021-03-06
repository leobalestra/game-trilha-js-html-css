const express = require('express');
const path = require('path');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const db = require('./database.js');

let rooms = 0;

app.use(express.static('.'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/tabu', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    var query = "SELECT * FROM tb_img_tabu";
    db.query(query, function(dadosRetornados, erro) {
        if(erro){
            console.log();
            res.send("Erro banco de dados");
        }
        else{
            console.log(dadosRetornados);
            res.send(dadosRetornados);
        }
    });
});

app.get('/api/back', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    var query = "SELECT * FROM tb_img_back";
    db.query(query, function(dadosRetornados, erro) {
        if(erro){
            console.log();
            res.send("Erro banco de dados");
        }
        else{
            console.log(dadosRetornados);
            res.send(dadosRetornados);
        }
    });
});

io.on('connection', (socket) => {

    // Cria novo jogo e notifica o criador do jogo!
    socket.on('createGame', (data) => {
        socket.join(`room-${++rooms}`);
        socket.emit('newGame', { name: data.name, room: `room-${rooms}` });
        console.log(data.name, rooms);
    });

    // Conectar jogador 2. Erro para sala cheia.
    socket.on('joinGame', function (data) {
        var room = io.nsps['/'].adapter.rooms[data.room];
        console.log(data, room);
        if (room && room.length === 1) {
            socket.join(data.room);
            socket.broadcast.to(data.room).emit('player1', {});
            socket.emit('player2', { name: data.name, room: data.room })
        } else {
            socket.emit('err', { message: 'Sorry, The room is full!' });
        }
    });

    // Handle the turn played by either player and notify the other.
    socket.on('playTurn', (data) => {
        socket.broadcast.to(data.room).emit('turnPlayed', {
            tile: data.tile,
            room: data.room
        });
    });

    // Notify the players about the victor.
    socket.on('gameEnded', (data) => {
        socket.broadcast.to(data.room).emit('gameEnd', data);
        console.log("fim de jogo enviado");
    });
});

server.listen(process.env.PORT || 5000);
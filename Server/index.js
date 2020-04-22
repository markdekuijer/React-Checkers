const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const { addUser, createRoom, joinRoom, leaveRoom, getUser, removeUser, getUsersInRoom, logUsers } = require('./users.js');

const PORT = process.env.PORT || 5000

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);

server.listen(PORT, () => console.log(`server has started on port ${PORT}`));

io.on('connection', (socket) => {
    console.log("we have a new connection");

    socket.on('user-login', (name) => {
        console.log(name);
        addUser(socket.id, name);
    });

    socket.on('user-create-room', (roomName) => {
        var roomOwner = createRoom(socket.id, roomName);
        if(roomOwner === false){
            socket.emit('creating-failed', "Room already exists!");
        } else{
            socket.join(roomName);
            socket.emit('user-created-room', {});
        }
    });

    socket.on('user-join-room', ({name, roomName}) => {
        var roomOwners = getUsersInRoom(roomName);
        if(roomOwners === undefined || roomOwners.length === 0){
            socket.emit('joining-failed', "Room doesn't exist!");
        } else if (roomOwners.length >= 2) {
            socket.emit('joining-failed', "Room full!");
        } else {
            joinRoom(socket.id, roomName);
            socket.join(roomName);
            socket.broadcast.to(roomName).emit('user-joined', name)
            socket.emit('user-joined', roomOwners[0].name);
            
        }
    });

    socket.on('disconnect', () => {
        var user = removeUser(socket.id);

        if(user !== undefined){
            if(user.room !== "") {
                socket.broadcast.to(user.room).emit('user-left', {});
                var users = getUsersInRoom(user.room);
                if(user !== undefined && users.length > 0){
                    leaveRoom(users[0].id)
                }
            }
        }
        
    });

    socket.on('user-left', () => {
        logUsers();
        var user = getUser(socket.id);
        if(user !== undefined){
            if(user.room !== "") {
                var room = user.room;
                leaveRoom(socket.id);
                socket.broadcast.to(room).emit('user-left', {});
                var users = getUsersInRoom(room);
                if(user !== undefined && users.length > 0){
                    leaveRoom(users[0].id)
                }
            }
        }
    });

    socket.on('user-switch-turn', ({turn, board}) => {
        var user = getUser(socket.id);
        socket.broadcast.to(user.room).emit('user-switch-turn', {turn, board});
    });

    socket.on('user-kill-piece', ({turn, board}) => {
        var user = getUser(socket.id);
        socket.broadcast.to(user.room).emit('user-kill-piece', {turn, board});
    });
});
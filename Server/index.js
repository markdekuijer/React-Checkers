const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const { addUser, createRoom, joinRoom, leaveRoom, getUser, removeUser, getUsersInRoom } = require('./users.js');

const PORT = process.env.PORT || 5000

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
    console.log("we have a new connection");

    socket.on('user-login', (name) => {
        console.log(name);
        addUser(socket.id, name);
    });

    socket.on('user-create-room', (roomName) => {
        var user = createRoom(socket.id, roomName);
        socket.join(roomName);
    });

    socket.on('user-join-room', ({name, roomName}) => {
        var roomOwners = getUsersInRoom(roomName);
        if(roomOwners === undefined || roomOwners.length >= 2){
            socket.emit('joining-failed', {});
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
            console.log(`Disconnected ${user.name}`)
        }
        
        if(user.room !== "") {
            leaveRoom(getUsersInRoom(user.room)[0].id);
            socket.broadcast.to(user.room).emit('user-left', {});
        }
    })
})

app.use(router);
server.listen(PORT, () => console.log(`server has started on port ${PORT}`));
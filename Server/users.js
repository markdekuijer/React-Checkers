const users = [];

const addUser = (id, name) => {
    const user = {
        id: id,
        name: name,
        room: "",
    }

    users.push(user);

    return { user };
}

const getUser = (id) => {
    console.log(users);
    return users.find((user) => user.id === id);
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room);
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if(index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const createRoom = (id, roomName) => {
    var roomOwner = users.filter((user) => user.room === roomName);

    if(roomOwner === undefined || roomOwner.length === 0){
        var user = users.find((user) => user.id === id);
        user.room = roomName;
        return user;
    } else {
        return false;
    }
    
}

const joinRoom = (id, roomName) => {
    console.log(users);
    console.log(id);
    var user = users.find((user) => user.id === id);
    user.room = roomName;

    console.log(users);

    return user;
}

const leaveRoom = (id) => {
    console.log(`${id} needs to leave the room`);
    console.log(users);
    var user = users.find((user) => user.id === id)
    user.room = "";

    console.log(users);

    return user;
}

module.exports = { addUser, createRoom, joinRoom, leaveRoom, getUser, removeUser, getUsersInRoom }
const Constants = require('../shared/constants');
const express = require('express');
const app = express();
app.use(express.static('dist'));
const port = Constants.PORT;
const socketio = require('socket.io');
const User = require('../shared/user');
const Message = require('../shared/message')
const server = app.listen(port);
console.log(`Server listening on port ${port}`);

const io = socketio(server);

const userMap = {};
const messagesCache = [];

io.on('connection', socket => {
    console.log(`Socket ${socket.id} has connected!`);

    socket.on(Constants.MSG_TYPES.INITIALIZE, handleInitialize);
    socket.on(Constants.MSG_TYPES.MESSAGE, handleMessage);
    socket.on('disconnect', handleDisconnect);

    sendUpdateMessages(socket);
});

function handleInitialize(jsonData) {
    var data = JSON.parse(jsonData);
    if (data.username != null && data.color != null && userMap[data.username] == null) {
        data.username = data.username;
        data.color = data.color;
        initializeUser(this, data.username, data.color);
        sendServerMessage(`${data.username} joined`);
        console.log(`User ${this.id} has set their username to ${data.username} and color to ${data.color}`);
    } else {
        sendError(this, "Error: Username Invalid or Taken");
    }
}

function sendServerMessage(messageText) {
    var currentTime = Date.now();
    var adminMessage = new Message(null, messageText, currentTime);
    emitMessage(adminMessage);
}

function handleMessage(messageText) {
    var user = this.data.user;
    if (user != null) {
        var currentTime = Date.now();
        messageText = messageText;
        var newMessage = new Message(user, messageText, currentTime);
        emitMessage(newMessage);
    }
}

function emitMessage(message) {
    var debugString = `${message.time} [${message.user!=null?message.user.username:"Server"}] ${message.message}`;
    console.log(debugString);

    pushMessage(message);
    var messageJSON = JSON.stringify(message);
    io.emit(Constants.MSG_TYPES.MESSAGE, messageJSON);
}

function sendError(socket, error) {
    socket.emit(Constants.MSG_TYPES.ERROR, error);
}

function sendUpdateMessages(socket) {
    var messagesJSON = JSON.stringify(messagesCache);
    socket.emit(Constants.MSG_TYPES.UPDATEMESSAGES, messagesJSON);
}

function pushMessage(message) {
    messagesCache.push(message);
    truncateMessagesCache();
}

var cacheLimit = 1000;

function truncateMessagesCache() {
    var cacheOverflow = messagesCache.length - cacheLimit;
    if (cacheOverflow > 0) {
        messagesCache.splice(0, cacheOverflow);
    }
}

function handleDisconnect() {
    if (this.data.user != null) {
        var username = this.data.user.username;
        if (userMap[username] != null) {
            delete userMap[username];
        }
        sendServerMessage(`${username} left`);
    }
    console.log(`Socket ${this.id} has disconnected!`);
}

function initializeUser(socket, username, color) {
    var newUser = new User(username, color);
    socket.data.user = newUser;
    userMap[username] = newUser;
    var jsonUser = JSON.stringify(newUser);
    socket.emit(Constants.MSG_TYPES.INITIALIZE, jsonUser);
}

function getSocketByID(id) {
    return io.sockets.sockets.get(id);
}

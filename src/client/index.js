import io from 'socket.io-client';
import './style.css';
import backgrounds from './backgrounds.txt';
const $ = require("jquery");
const Constants = require('../shared/constants');
const url = `${Constants.URL}:${Constants.PORT}`;
const socket = io(`${url}`);

var elements = {};
var messagesCache = [];

var userCache;
$(document).ready(function () {});

function initialize() {
    randomBackground();

    window.addEventListener('resize', scrollToBottom);

    elements.chatBox = getEle("chatBox");
    elements.contentBox = getEle("contentBox");
    elements.messageBox = getEle("messageBox");
    elements.messageField = getEle("messageField");
    elements.submitButton = getEle("submitButton");

    elements.userDialogBox = getEle("userDialogBox");
    elements.usernameField = getEle("usernameField");
    elements.colorField = getEle("colorField");
    elements.submitUserButton = getEle("submitUserButton");

    elements.messageField.addEventListener("keydown", function (e) {
        switch (e.keyCode) {
            case 13:
                submitText();
                break;
        }
    });
    elements.submitButton.addEventListener("click", function (e) {
        submitText();
    });

    elements.usernameField.addEventListener("keydown", function (e) {
        switch (e.keyCode) {
            case 13:
                submitUser();
                break;
        }
    });

    elements.colorField.value = `#${randomColor()}`;

    elements.submitUserButton.addEventListener("click", function (e) {
        submitUser();
    });


    elements.usernameField.focus();
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function randomBackground() {
    var allBackgrounds = backgrounds.split("\n");
    var backgroundIndex = getRandomInt(allBackgrounds.length);
    var backgroundUrl = allBackgrounds[backgroundIndex];
    document.body.style.backgroundImage = `url(${backgroundUrl})`;
}

socket.on('connect', () => {
    console.log('Connected to server!');
    socket.emit();
    initialize();
});

socket.on(Constants.MSG_TYPES.INITIALIZE, handleInitialize);

socket.on(Constants.MSG_TYPES.MESSAGE, handleMessage);

socket.on(Constants.MSG_TYPES.UPDATEMESSAGES, handleUpdateMessages);

socket.on(Constants.MSG_TYPES.ERROR, handleError);

function handleInitialize(userJSON) {
    var parsedUser = JSON.parse(userJSON);
    if (parsedUser != null) {
        userCache = parsedUser;
        showChat();
    }
}

function handleError(error) {
    alert(error);
}

function handleMessage(messageJSON) {
    var message = JSON.parse(messageJSON);
    if (message != null) {
        pushMessage(message);
    }
}

function handleUpdateMessages(messagesJSON) {
    var messages = JSON.parse(messagesJSON);
    if (messages != null) {
        messagesCache = messages;
        renderMessages();
    }
}

function pushMessage(message) {
    messagesCache.push(message);
    appendMessage(message);
    scrollToBottom();
}


function appendMessage(message) {
    var messageElement = generateMessageElement(message);
    elements.messageBox.appendChild(messageElement);
}

function renderMessages() {
    elements.messageBox.innerHTML = [];
    for (var i = 0; i < messagesCache.length; i++) {
        var message = messagesCache[i];
        appendMessage(message);
    }
    scrollToBottom();
}

function scrollToBottom() {
    elements.contentBox.scrollTop = elements.contentBox.scrollHeight;
}

const escapeHtml = (unsafe) => {
    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function generateMessageElement(message) {
    var messageElement = document.createElement("div");
    messageElement.className = "chatMessage";

    var timeElement = document.createElement("span");
    timeElement.className = "timestamp";
    var date = new Date(message.time);
    var timeString = `${date.getHours()}:${date.getMinutes()} `;
    timeElement.innerHTML = timeString;

    var bodyElement = document.createElement("span");
    bodyElement.className = "body";

    messageElement.appendChild(timeElement);

    if (message.user != null) {
        var authorElement = document.createElement("span");
        authorElement.className = "author";
        authorElement.innerHTML = `${escapeHtml(message.user.username)}: `;
        authorElement.style.color = `#${escapeHtml(message.user.color)}`;
        messageElement.appendChild(authorElement);
    } else {
        bodyElement.className = "body admin";
    }


    bodyElement.innerHTML = escapeHtml(message.message);

    messageElement.appendChild(bodyElement);

    return messageElement;
}

function getEle(id) {
    return document.getElementById(id);
}


function submitText() {
    var submitValue = elements.messageField.value;
    elements.messageField.value = "";
    sendMessage(submitValue);
}

function submitUser() {
    var username = elements.usernameField.value;
    var color = elements.colorField.value.replace("#", "");
    var user = {
        username: username,
        color: color
    };
    var userJSON = JSON.stringify(user);
    socket.emit(Constants.MSG_TYPES.INITIALIZE, userJSON);
}

function sendMessage(message) {
    socket.emit(Constants.MSG_TYPES.MESSAGE, message);
}

function randomColor() {
    var color = Math.floor(Math.random() * 16777215).toString(16);
    return color;
}

function showChat() {
    hideElement(elements.userDialogBox);
    showElement(elements.chatBox);
    elements.messageField.focus();
    scrollToBottom()
}

function hideChat() {
    hideElement(elements.chatBox);
    showElement(elements.userDialogBox);
    elements.usernameField.focus();
}

function showElement(element) {
    element.classList.remove("intangible");
}

function hideElement(element) {
    element.classList.add("intangible");
}

var socket = io();
var username = makeRandomName();

var messages = document.getElementById("messages");
var form = document.getElementById("form");
var input = document.getElementById("input");

form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (input.value) {
        socket.emit("chat message", { msg: input.value, user: username });
        input.value = "";
    }
});

socket.on("redirect", function (url) {
    alert("인원이 가득이 가득 찼습니다.\n나중에 다시 시도해주세요.");
    window.location.href = url;
});

socket.emit("login", {
    name: username
});

socket.on("login", function (data) {
    var userItem = document.createElement("div");
    userItem.textContent = data;
    userItem.className = "msg-in msg-status";
    messages.appendChild(userItem);
    messages.scrollTop = messages.scrollHeight;
});

socket.on("login-success", function (user) {
    username = user;
})

socket.on("chat history", function (history) {
    history.forEach(data => {
        makeMsg(data.msg, data.user);
    });
    messages.scrollTop = messages.scrollHeight;
});

socket.on("chat message", function (data) {
    makeMsg(data.msg, data.user);
});

socket.on("disconnectUser", function (data) {
    var userItem = document.createElement("div");
    userItem.textContent = data;
    userItem.className = "msg-out msg-status";
    messages.appendChild(userItem);
    messages.scrollTop = messages.scrollHeight;
});

function makeRandomName() {
    return "User" + Math.floor(Math.random() * 100);;
}

function makeMsg(message, name) {
    //메시지 컨테이너
    let msg_container = document.createElement("div");
    let owner = name == username ? "msg-sent" : "msg-receive";
    msg_container.className = "msg-container " + owner;

    //보낸 사람
    let spanElement = document.createElement("span");
    spanElement.textContent = name;
    msg_container.appendChild(spanElement);

    //메시지 내용
    let item = document.createElement("div");
    item.textContent = message;
    item.className = "msg";
    msg_container.appendChild(item);

    messages.appendChild(msg_container);
    messages.scrollTop = messages.scrollHeight;
}
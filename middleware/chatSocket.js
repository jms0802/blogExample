const SocketIO = require("socket.io");
const MAX_CONNECT = 10;
const MAX_MESSAGE = 1000;
let messages = [];
let connectUser = [];


module.exports = (server) => {
    const io = SocketIO(server, { path: "/socket.io" });
    io.on("connection", (socket) => {
        if (connectUser.length >= MAX_CONNECT) {
            socket.emit("redirect", "/");
            socket.disconnect();
            return;
        }
        //접속 유저명 표시
        socket.on("login", function (data) {
            let username = data.name;
            let time = data.connectionTime;

            while (connectUser.includes(username)) {
                username = "User" + Math.floor(Math.random() * 100);
            }

            connectUser.push({ username, connectionTime: time });
            socket.name = username;

            const loginMsg = username + " 님이 입장하였습니다.";
            io.emit("login-msg",
                {
                    msg: loginMsg,
                    count: connectUser.length,
                    maxcount: MAX_CONNECT,
                    user: connectUser[connectUser.length - 1]
                });
            socket.emit("login-success", { username: username });
            console.log(`${username} 연결됨`);
        });


        //이전 채팅 기록 표시
        socket.emit("chat history", { messages: messages, users: connectUser });

        //채팅 입력
        socket.on("chat message", (data) => {
            const msg = data.msg;
            const user = data.user;
            const date = data.createDate;
            if (messages.length >= MAX_MESSAGE) {
                messages.shift();
            }
            messages.push({ msg, user, createDate: date });
            console.log(messages);
            io.emit("chat message", { msg: msg, user: user, createDate: date });
        });

        socket.on('forceDisconnect', function () {
            socket.disconnect();
        });
        //사용자 연결 해제
        socket.on("disconnect", () => {
            let removeUser = connectUser.find(u => u.username === socket.name);
            let msg = "";
            if (removeUser) {
                let index = connectUser.indexOf(removeUser);
                if (index !== -1) {
                    connectUser.splice(index, 1);
                }
                console.log(`${removeUser.username} 연결 해제`);
                msg = removeUser.username + " 님이 퇴장하였습니다.";
            } else {
                msg = "undefined";
            }
            io.emit("disconnectUser", {
                msg: msg,
                count: connectUser.length,
                maxcount: MAX_CONNECT,
                user: removeUser
            });
        });
    });
};
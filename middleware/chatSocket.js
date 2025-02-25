const SocketIO = require("socket.io");
const MAX_CONNECT = 10;
const MAX_MESSAGE = 1000;
let messages = [];
let connectUser = [];


module.exports = (server) => {
    const io = SocketIO(server, { path: "/socket.io" });
    io.on("connection", (socket) => {
        if(connectUser.length >= MAX_CONNECT){
            socket.emit("redirect", "/");
            socket.disconnect();
            return;
        }
        //접속 유저명 표시
        socket.on("login", function (data) {
            let username = data.name;

            while (connectUser.includes(username)) {
                username = "User" + Math.floor(Math.random() * 100);
            }

            connectUser.push(username);
            socket.name = username;
            io.emit("login", username + " 님이 입장하였습니다.");
            socket.emit("login-success", username);
            console.log(`${username} 연결됨`);
        });


        //이전 채팅 기록 표시
        socket.emit("chat history", messages);

        //채팅 입력
        socket.on("chat message", (data) => {
            const msg = data.msg;
            const user = data.user;
            if(messages.length >= MAX_MESSAGE){
                messages.shift();
            }
            messages.push({msg, user});
            io.emit("chat message", { msg: msg, user: user });
        });

        socket.on('forceDisconnect', function () {
            socket.disconnect();
        });
        //사용자 연결 해제
        socket.on("disconnect", () => {
            console.log(`${socket.name} 연결 해제`);
            connectUser.pop(socket.name);
            io.emit("disconnectUser", socket.name + " 님이 퇴장하였습니다.");
        });
    });
};
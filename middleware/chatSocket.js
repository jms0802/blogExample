const SocketIO = require("socket.io");
let messages = [];
let connectUser = [];

module.exports = (server) => {
    const io = SocketIO(server, { path: "/socket.io" });
    io.on("connection", (socket) => {

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
            messages.push(msg);
            io.emit("chat message", { msg: msg, user: user });
        });

        socket.on('forceDisconnect', function () {
            socket.disconnect();
        });
        //사용자 연결 해제
        socket.on("disconnect", () => {
            console.log(`${socket.name} 연결 해제`);
            //connectUser.pop(username);
            io.emit("disconnectUser", socket.name + " 님이 퇴장하였습니다.");
        });
    });
};
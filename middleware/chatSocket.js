const SocketIO = require("socket.io");
const MAX_CONNECT = 10;
const MAX_MESSAGE = 1000;
let messages = [];
let connectUser = [];

module.exports = (server) => {
    const io = SocketIO(server, { path: "/socket.io" });
    io.on("connection", (socket) => {
        //인원 초과
        if (connectUser.length >= MAX_CONNECT) {
            socket.emit("redirect", "/");
            socket.disconnect();
            return;
        }

        //접속 유저명 표시
        socket.on("login", function (data) {
            let username = data.name;
            let time = data.connectionTime;

            if(data.role === "admin") {
                username = "Admin";
            } else {
                while (connectUser.includes(username)) {
                    username = "User" + Math.floor(Math.random() * 100);
                }
            }
            connectUser.push({ username, connectionTime: time, role: data.role });
            socket.name = username;

            const loginMsg = username + " 님이 입장하였습니다.";
            io.emit("login-msg",
                {
                    msg: loginMsg,
                    count: connectUser.length,
                    maxcount: MAX_CONNECT,
                    user: connectUser[connectUser.length - 1],
                });
            socket.emit("login-success", { username: username, role: data.role, });
            console.log(`${username} 연결됨`);
        });

        //사용자 이름 변경
        socket.on("change name", function (data) {
            const prevName = socket.name;
            const newName = data.newName;
            if(connectUser.find(u => u.username === newName) !== undefined) {
                socket.emit("change-name-result", { error: "Duflicate", newName: newName });
                return;
            }
            const changeUser = connectUser.find(u => u.username === prevName);
            let msg = "";
            if (changeUser) {
                let index = connectUser.indexOf(changeUser);
                if (index !== -1) {
                    connectUser[index].username = newName;
                }
                msg = prevName + " 님이 " + newName + " 으로 변경하였습니다.";
                socket.name = newName;
            } else {
                msg = "undefined";
            }
            io.emit("change-name-msg", {
                msg: msg,
                prevName: prevName,
                newName: newName,
            });
            socket.emit("change-name-result", { error: null, newName: newName });
        });

        //이전 채팅 기록 표시
        socket.emit("chat history", { messages: messages, users: connectUser });

        //채팅 입력
        socket.on("chat message", (data) => {
            const msg = { 
                value: data.msg, 
                date: data.createDate,
            };
            const user = { 
                name: data.user, 
                role: data.role 
            };

            if (messages.length >= MAX_MESSAGE) {
                messages.shift();
            }
            const item = { msg, user};
            messages.push(item);
            io.emit("chat message", item);
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
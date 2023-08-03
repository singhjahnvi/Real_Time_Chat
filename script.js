const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const users = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get("/contact", (req, res) => res.send("<h1>Contact</h1>"));
app.get("/about", (req, res) => res.send("<h1>About</h1>"));

//when you open a tab on the browser on port 3000 the following msgs will be shown to the server and client side respectively.
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on("new user", (nickname) => {
    users[socket.id] = { nickname, connection: socket };
    io.emit("user joined", nickname);
  });


  socket.on('chat message', (msg, recipient) => {
    //To print out the chat message event to server's console
    console.log('message: ' + msg);

    //To send a message to everyone including the sender  on client side
    const nickname = users[socket.id].nickname;
    if (recipient) {
      const recipientSocket = Object.values(users).find(
        (user) => user.nickname === recipient);
      if (recipientSocket) {
        recipientSocket.connection.emit('private message', {
          nickname: nickname,
          msg: msg,
          recipient: recipient,
        });
        socket.emit('private message', {
          nickname: nickname,
          msg: msg,
          recipient: recipient,
        });
      } else {
        socket.emit('chat message', {
          nickname: "Server",
          msg: `User "${recipient}" not found in the chat`,
        });
      }
    } else {
      io.emit('chat message', nickname + ": " + msg);
    }
  });

  socket.on('disconnect', () => {
    const nickname = users[socket.id];
    delete users[socket.id];
    io.emit("user left", nickname);

    console.log('User disconnected');
  });


});
//creates server
const port = 3000;
const ipAddress = "192.168.29.226";
server.listen(port, ipAddress, () => {
  console.log(`Server on port http://${ipAddress}:${port}`);
});

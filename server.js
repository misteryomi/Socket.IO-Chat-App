const express = require('express');
const app = express();
const http = require('http').createServer(app)
const bodyParser = require('body-parser')

const server = app.listen(3000, () => console.log('Server started on port 3000'))
const socket = require('socket.io')(server);

//DB connection
const Chat = require('./models/chat');
const connect = require('./dbconnection');

const chatRouter = require("./routes/chatRoute");

//bodyparser middleware
app.use(bodyParser.json());
//routes
app.use("/chats", chatRouter);
app.use(express.static(__dirname + "/public"));

socket.on('connection', (socket) => {
    console.log('User connected')

    socket.on('disconnect', () => {
        console.log('User disconnected')
    })

    
    socket.on('chat_message', (message) => {
        console.log(`Message: ${message}`);    
        socket.broadcast.emit("received", {message})

        connect.then(db => {
            console.log("Connected to db server");

            let chatMessage = new Chat({message, sender:"Anonymous"});
            chatMessage.save();
        })
    })

    socket.on('typing', data => {
        socket.broadcast.emit('notifyTyping', data);
    })
    socket.on('stopTyping', () => {
        socket.broadcast.emit('notifyStopTyping');
    })
    
})



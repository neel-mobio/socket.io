const express           = require('express');
const path              = require('path');
const http              = require('http');
const soceketio         = require('socket.io');
const app               = express();
const formatMessage     = require('./utils/messages');
const server            = http.createServer(app);
const io                = soceketio(server);
const PORT              = 3000
const { userJion, 
        getCurrentUser, 
        getRoomUsers, 
        userLeave }     = require('./utils/users');


//set static folder path
app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', (req,res)=>{
//     return res.send("aaaa")
// });

const botName = "Admin"

//run when clients connect
io.on("connection", socket => {

    socket.on("joinRoom", ({ username, room }) => {

        const user = userJion(socket.id, username, room);

        socket.join(user.room);

        // Welcom current user
        socket.emit("message", formatMessage(botName, `welcome to {room}realtime chat app`));

        // BroadCast when user connect
        socket.broadcast
            .to(user.room)
            .emit("message", 
            formatMessage(botName, `${user.username} has joined the chat application`));

        // Send user and room information 
        io.to(user.room).emit("roomUsers",{
            room:user.room,
            users:getRoomUsers(user.room)
        });
    });

    // Listen for chatMessage from client side.
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id)
        // this message is send to cliet side. using io.emit();
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    })

    // Runs whene the clients is discconected
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);
        if(user){
            // to use of io.emit() to know the all user this perticuler user is left
            io.emit(
                "message", 
                formatMessage(botName, `${user.username} has left the chat`)
                );
            // Send user and room information 
            io.to(user.room).emit("roomUsers",{
                room:user.room,
                users:getRoomUsers(user.room)
            });
            
        }
    });

})

// server.listen(PORT, () => {
//     console.log("server Running on port 3000")
// })

server.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });
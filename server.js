const express = require('express');
const path = require('path');
const http = require('http');
const soceketio = require('socket.io');
const app = express();

const server = http.createServer(app);
const io = soceketio(server);
const PORT = 3000


//set static folder path
app.use(express.static(path.join(__dirname, 'public')));


//run when clients connect

server.listen(PORT, () => {
    console.log("server Running on port 3000")
})
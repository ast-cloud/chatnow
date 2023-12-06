import express from 'express';
import http from 'http';
import {WebSocketServer} from 'ws';

const app = express();

const server = http.createServer(app);

const wss = new WebSocketServer({server});

app.get('/healthcheck', (req, res)=>{
    res.json({'status':'healthy'});
});

wss.on('connection', async (ws, req)=>{
    ws.on('message', (message)=>{
        console.log('Received message - ', String(message));
        ws.send('You have sent - '+message);
    })    
})

server.listen(3000, ()=>{console.log('Started http server on port 3000.')})
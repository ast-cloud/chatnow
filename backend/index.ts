import express from 'express';
import http from 'http';
import {WebSocketServer} from 'ws';
import RedisSubscriptionManager from './RedisClient';

const app = express();

const server = http.createServer(app);

const wss = new WebSocketServer({server});

app.get('/healthcheck', (req, res)=>{
    res.json({'status':'healthy'});
});

let count=0;

const users : {[key: string] : {room: string, ws: any, name: string}} = {};

wss.on('connection', async (ws, req)=>{

    const wsId = String(count++);
    
    ws.on('message', (message)=>{

        console.log('Received message - ', String(message));
        const data = JSON.parse(message.toString());

        if(data.type=='create'){
            const roomId = generateRoomID();
            users[wsId] = {
                room: roomId,
                ws: ws,
                name: data.payload.name
            }
            try{
                RedisSubscriptionManager.getInstance().subscribe(String(wsId), String(roomId), ws);
                ws.send(JSON.stringify({
                    'type': 'roomCreated',
                    'payload':{
                        'roomId': roomId
                    }
                }));
            }catch(e){
                ws.send(JSON.stringify({
                    'type': 'roomCreationFailed',
                    'payload':{
                        'message':''
                    }
                }));
            }
            
        }
        else if(data.type=='join'){
            if(wsId in users){
                ws.send(JSON.stringify({
                    'type': 'roomJoinFailed',
                    'payload':{
                        'message': 'Already in a room'
                    }
                }));
            }
            else if(!(RedisSubscriptionManager.getInstance().doesRoomExist(String(data.payload.roomId)))){
                ws.send(JSON.stringify({
                    'type': 'roomJoinFailed',
                    'payload':{
                        'message': 'Room does not exist'
                    }
                }));
            }
            else if((RedisSubscriptionManager.getInstance().roomParticipants(String(data.payload.roomId)))>=5){
                ws.send(JSON.stringify({
                    'type': 'roomJoinFailed',
                    'payload':{
                        'message': 'Room is full (Maximum capacity: 4)'
                    }
                }));
            }
            else{
                users[wsId] = {
                    room: String(data.payload.roomId), 
                    ws: ws,
                    name: String(data.payload.name)
                };
                RedisSubscriptionManager.getInstance().subscribe(String(wsId), String(data.payload.roomId), ws);
                ws.send(JSON.stringify({
                    'type': 'roomJoined',
                    'payload':{
                        'roomId': String(data.payload.roomId)
                    }
                }));
            }
        }
        else if(data.type=='message'){
            const roomId = users[wsId].room;
            const message = String(data.payload.message);
            RedisSubscriptionManager.getInstance().addChatMessage(roomId, message);
        }
        
    });
    
    ws.on('disconnect', ()=>{
        RedisSubscriptionManager.getInstance().unsubscribe(wsId, users[wsId].room);
    });
});

function generateRoomID(){
    let uid : string;
    do{
        uid = String(Math.floor(Math.random()*10000));
    }while(RedisSubscriptionManager.getInstance().doesRoomExist(String(uid)));

    return uid;
}

server.listen(3000, ()=>{console.log('Started http server on port 3000.')})
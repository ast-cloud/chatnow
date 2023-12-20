import express from 'express';
import http from 'http';
import {WebSocketServer} from 'ws';
import RedisSubscriptionManager from './RedisClient';

const userColors = {
    nextColor : 0,
    colors : ['violet', 'lightblue', 'lightgreen', 'orange']
}

const app = express();

const server = http.createServer(app);

const wss = new WebSocketServer({server});

app.get('/healthcheck', (req, res)=>{
    res.json({'status':'healthy'});
});

let count=0;

const users : {[key: string] : {room: string, ws: any, name: string, color: string}} = {};

const rooms : {[roomId : string] : {roomName: string}} = {};

wss.on('connection', async (ws, req)=>{

    const wsId = String(count++);
    
    ws.on('message', (message)=>{

        console.log('Received message - ', String(message));
        const data = JSON.parse(message.toString());

        if(data.type=='create'){
            console.log('New create room request received.');
            if(wsId in users){
                ws.send(JSON.stringify({
                    'type': 'roomCreationFailed',
                    'payload':{
                        'message': 'Already in a room'
                    }
                }));
            }
            else{

                const roomId = generateRoomID();
                users[wsId] = {
                    room: roomId,
                    ws: ws,
                    name: data.payload.name,
                    color: userColors.colors[userColors.nextColor]
                }
                userColors.nextColor=(userColors.nextColor+1)%(userColors.colors.length);
                rooms[roomId] = {
                    roomName: data.payload.roomName
                }
                try{
                    RedisSubscriptionManager.getInstance().subscribe(String(wsId), String(roomId), ws);
                    ws.send(JSON.stringify({
                        'type': 'roomCreated',
                        'payload':{
                            'roomId': roomId,
                            'roomName': rooms[roomId].roomName,
                            'userId': wsId
                        }
                    }));
                }catch(e){
                    delete users[wsId];
                    userColors.nextColor=(userColors.nextColor==0)?(userColors.colors.length-1):(userColors.nextColor-1);
                    delete rooms[roomId];
                    ws.send(JSON.stringify({
                        'type': 'roomCreationFailed',
                        'payload':{
                            'message':''
                        }
                    }));
                }
            }
            
        }
        else if(data.type=='join'){
            console.log('New join room request received.');
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
                    name: String(data.payload.name),
                    color: userColors.colors[userColors.nextColor]
                };
                userColors.nextColor=(userColors.nextColor+1)%(userColors.colors.length);
                try{
                    RedisSubscriptionManager.getInstance().subscribe(String(wsId), String(data.payload.roomId), ws);
                    ws.send(JSON.stringify({
                        'type': 'roomJoined',
                        'payload':{
                            'roomId': String(data.payload.roomId),
                            'roomName': rooms[data.payload.roomId].roomName,
                            'userId': wsId
                        }
                    }));
                }catch(e){
                    delete users[wsId];
                    userColors.nextColor=(userColors.nextColor==0)?(userColors.colors.length-1):(userColors.nextColor-1);
                    ws.send(JSON.stringify({
                        'type': 'roomJoinFailed',
                        'payload':{
                            'message':''
                        }
                    }));
                }
            }
        }
        else if(data.type=='message'){
            if(!(wsId in users)){
                ws.send(JSON.stringify({
                    'type': 'messageSendingFailed',
                    'payload':{
                        'message': 'No room joined yet.'
                    }
                }));
            }
            else{
                const roomId = users[wsId].room;
                const name = users[wsId].name;
                const color = users[wsId].color;
                const message = String(data.payload.message);
                const userId = wsId;
                try{
                    RedisSubscriptionManager.getInstance().addChatMessage(roomId, name, userId, color, message);
                    ws.send(JSON.stringify({
                        'type': 'messageSentSuccessfully',
                        'payload':{
                            'message': ''
                        }
                    }));
                }catch(e){
                    ws.send(JSON.stringify({
                        'type': 'messageSendingFailed',
                        'payload':{
                            'message': 'No room joined yet.'
                        }
                    }));
                }
            }
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
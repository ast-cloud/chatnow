"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const RedisClient_1 = __importDefault(require("./RedisClient"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
app.get('/healthcheck', (req, res) => {
    res.json({ 'status': 'healthy' });
});
let count = 0;
const users = {};
const rooms = {};
wss.on('connection', (ws, req) => __awaiter(void 0, void 0, void 0, function* () {
    const wsId = String(count++);
    ws.on('message', (message) => {
        console.log('Received message - ', String(message));
        const data = JSON.parse(message.toString());
        if (data.type == 'create') {
            console.log('New create room request received.');
            if (wsId in users) {
                ws.send(JSON.stringify({
                    'type': 'roomCreationFailed',
                    'payload': {
                        'message': 'Already in a room'
                    }
                }));
            }
            else {
                const roomId = generateRoomID();
                users[wsId] = {
                    room: roomId,
                    ws: ws,
                    name: data.payload.name
                };
                rooms[roomId] = {
                    roomName: data.payload.roomName
                };
                try {
                    RedisClient_1.default.getInstance().subscribe(String(wsId), String(roomId), ws);
                    ws.send(JSON.stringify({
                        'type': 'roomCreated',
                        'payload': {
                            'roomId': roomId
                        }
                    }));
                }
                catch (e) {
                    delete users[wsId];
                    delete rooms[roomId];
                    ws.send(JSON.stringify({
                        'type': 'roomCreationFailed',
                        'payload': {
                            'message': ''
                        }
                    }));
                }
            }
        }
        else if (data.type == 'join') {
            console.log('New join room request received.');
            if (wsId in users) {
                ws.send(JSON.stringify({
                    'type': 'roomJoinFailed',
                    'payload': {
                        'message': 'Already in a room'
                    }
                }));
            }
            else if (!(RedisClient_1.default.getInstance().doesRoomExist(String(data.payload.roomId)))) {
                ws.send(JSON.stringify({
                    'type': 'roomJoinFailed',
                    'payload': {
                        'message': 'Room does not exist'
                    }
                }));
            }
            else if ((RedisClient_1.default.getInstance().roomParticipants(String(data.payload.roomId))) >= 5) {
                ws.send(JSON.stringify({
                    'type': 'roomJoinFailed',
                    'payload': {
                        'message': 'Room is full (Maximum capacity: 4)'
                    }
                }));
            }
            else {
                users[wsId] = {
                    room: String(data.payload.roomId),
                    ws: ws,
                    name: String(data.payload.name)
                };
                try {
                    RedisClient_1.default.getInstance().subscribe(String(wsId), String(data.payload.roomId), ws);
                    ws.send(JSON.stringify({
                        'type': 'roomJoined',
                        'payload': {
                            'roomId': String(data.payload.roomId)
                        }
                    }));
                }
                catch (e) {
                    delete users[wsId];
                    ws.send(JSON.stringify({
                        'type': 'roomJoinFailed',
                        'payload': {
                            'message': ''
                        }
                    }));
                }
            }
        }
        else if (data.type == 'message') {
            if (!(wsId in users)) {
                ws.send(JSON.stringify({
                    'type': 'messageSendingFailed',
                    'payload': {
                        'message': 'No room joined yet.'
                    }
                }));
            }
            else {
                const roomId = users[wsId].room;
                const name = users[wsId].name;
                const message = String(data.payload.message);
                RedisClient_1.default.getInstance().addChatMessage(roomId, name, message);
            }
        }
    });
    ws.on('disconnect', () => {
        RedisClient_1.default.getInstance().unsubscribe(wsId, users[wsId].room);
    });
}));
function generateRoomID() {
    let uid;
    do {
        uid = String(Math.floor(Math.random() * 10000));
    } while (RedisClient_1.default.getInstance().doesRoomExist(String(uid)));
    return uid;
}
server.listen(3000, () => { console.log('Started http server on port 3000.'); });

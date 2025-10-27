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
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
class RedisSubscriptionManager {
    constructor() {
        try {
            this.subscriber = (0, redis_1.createClient)({
                password: `${process.env.REDIS_INSTANCE_PASSWORD}`,
                socket: {
                    host: `${process.env.REDIS_INSTANCE_URL}`,
                    port: Number(`${process.env.REDIS_INSTANCE_PORT}`)
                }
            });
            this.publisher = (0, redis_1.createClient)({
                password: `${process.env.REDIS_INSTANCE_PASSWORD}`,
                socket: {
                    host: `${process.env.REDIS_INSTANCE_URL}`,
                    port: Number(`${process.env.REDIS_INSTANCE_PORT}`)
                }
            });
            this.publisher.connect().catch((err) => {
                console.info('Redis URL - ', process.env.REDIS_INSTANCE_URL, ' \nPort - ', process.env.REDIS_INSTANCE_PORT);
                console.error('Failed to connect publisher to Redis:', err);
            });
            this.subscriber.connect().catch((err) => {
                console.error('Failed to connect subscriber to Redis:', err);
            });
            this.subscriptions = new Map();
            this.reverseSubscriptions = new Map();
        }
        catch (err) {
            console.error('Error initializing RedisSubscriptionManager:', err);
            throw err;
        }
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new RedisSubscriptionManager();
        }
        return this.instance;
    }
    subscribe(userId, room, ws) {
        this.subscriptions.set(userId, room);
        this.reverseSubscriptions.set(room, Object.assign(Object.assign({}, (this.reverseSubscriptions.get(room) || {})), { [userId]: { userId: userId, ws } }));
        if (Object.keys(this.reverseSubscriptions.get(room) || {}).length === 1) {
            this.subscriber.subscribe(room, (payload) => {
                try {
                    const subscribers = this.reverseSubscriptions.get(room) || {};
                    Object.values(subscribers).forEach(({ ws }) => { ws.send(payload); });
                }
                catch (e) {
                    console.log('Erroneous payload.');
                }
            });
        }
    }
    unsubscribe(userId, room) {
        var _a;
        this.subscriptions.delete(userId);
        (_a = this.reverseSubscriptions.get(room)) === null || _a === void 0 ? true : delete _a[userId];
        if (!this.reverseSubscriptions.get(room) || Object.keys(this.reverseSubscriptions.get(room) || {}).length === 0) {
            this.subscriber.unsubscribe(room);
            this.reverseSubscriptions.delete(room);
        }
    }
    addChatMessage(room, name, userId, color, message) {
        return __awaiter(this, void 0, void 0, function* () {
            this.publish(room, { type: 'message', payload: {
                    name: name,
                    userId: userId,
                    color: color,
                    message: message
                } });
        });
    }
    publish(room, message) {
        this.publisher.publish(room, JSON.stringify(message));
    }
    doesRoomExist(roomId) {
        return this.reverseSubscriptions.has(roomId);
    }
    roomParticipants(roomId) {
        return Object.keys(this.reverseSubscriptions.get(roomId)).length;
    }
}
exports.default = RedisSubscriptionManager;

import type {RedisClientType} from 'redis';
import {createClient} from 'redis';

export default class RedisSubscriptionManager{
    private static instance: RedisSubscriptionManager;
    private subscriber: RedisClientType;
    private publisher: RedisClientType;
    private subscriptions: Map<string, string>;
    private reverseSubscriptions: Map<string, { [userId:string] : {userId:string, ws:any}}>;

    private constructor() {
        try {
            this.subscriber = createClient({
                password: `${process.env.REDIS_INSTANCE_PASSWORD}`,
                socket: {
                    host: `${process.env.REDIS_INSTANCE_URL}`,
                    port: Number(`${process.env.REDIS_INSTANCE_PORT}`)
                }
            });
            this.publisher = createClient({
                password: `${process.env.REDIS_INSTANCE_PASSWORD}`,
                socket: {
                    host: `${process.env.REDIS_INSTANCE_URL}`,
                    port: Number(`${process.env.REDIS_INSTANCE_PORT}`)
                }
            });
            this.publisher.connect().catch((err) => {
                console.error('Failed to connect publisher to Redis:', err);
            });
            this.subscriber.connect().catch((err) => {
                console.error('Failed to connect subscriber to Redis:', err);
            });
            this.subscriptions = new Map<string, string>();
            this.reverseSubscriptions = new Map<string, { [userId: string]: { userId: string, ws: any } }>();
        } catch (err) {
            console.error('Error initializing RedisSubscriptionManager:', err);
            throw err;
        }
    }

    static getInstance(){
        if(!this.instance){
            this.instance = new RedisSubscriptionManager();
        }
        return this.instance;
    }

    subscribe(userId:string, room:string, ws:any){
        this.subscriptions.set(userId, room);
        this.reverseSubscriptions.set(room, {
            ...(this.reverseSubscriptions.get(room) || {}), [userId] : {userId: userId, ws},
        });
        if(Object.keys(this.reverseSubscriptions.get(room)||{}).length === 1){
            this.subscriber.subscribe(room, (payload)=>{
                try{
                    const subscribers = this.reverseSubscriptions.get(room)||{};
                    Object.values(subscribers).forEach(({ws})=>{ws.send(payload)});
                }catch(e){
                    console.log('Erroneous payload.');
                }
            })
        }
    }

    unsubscribe(userId:string, room:string){

        this.subscriptions.delete(userId);
        
        delete this.reverseSubscriptions.get(room)?.[userId];

        if(!this.reverseSubscriptions.get(room) || Object.keys(this.reverseSubscriptions.get(room) || {}).length === 0){
            this.subscriber.unsubscribe(room);
            this.reverseSubscriptions.delete(room);
        }

    }

    async addChatMessage(room:string, name:string, userId:string, color: string, message:string){
        this.publish(room, {type: 'message', payload: {
            name: name,
            userId: userId,
            color: color,
            message: message
        }});
    }

    publish(room:string, message:any){
        this.publisher.publish(room, JSON.stringify(message));
    }
    
    doesRoomExist(roomId: string){
        return this.reverseSubscriptions.has(roomId);                
    }

    roomParticipants(roomId: string){
        return Object.keys(this.reverseSubscriptions.get(roomId)).length;
    }

}
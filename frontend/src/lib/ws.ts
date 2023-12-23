import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default class WSManager{
    
    public static instance: WSManager;
    private websocket: WebSocket;
    
    private constructor(setChatRouteData, setMessages){
        
        this.websocket = new WebSocket('wss://chatnow.aastikyadav.com');

        this.websocket.onmessage = (event)=>{
            const data = JSON.parse(event.data);
            if(data.type=='roomCreated'){
                toast.success('Room ID : '+ String(data.payload.roomId));
                setChatRouteData({roomId: data.payload.roomId, roomName: data.payload.roomName, userId: data.payload.userId});
            }
            else if(data.type=='roomJoined'){
                toast.success('Room ID : '+ String(data.payload.roomId));
                setChatRouteData({roomId: data.payload.roomId, roomName: data.payload.roomName, userId: data.payload.userId});
            }
            else if(data.type=='roomCreationFailed'){
                toast.error(data.payload.message);
            }
            else if(data.type=='roomJoinFailed'){
                toast.error(data.payload.message);
            }
            else if(data.type=='message'){
                setMessages(messages => [...messages, {name: data.payload.name, userId: data.payload.userId, color: data.payload.color, message: data.payload.message}]);
            }
        }

    }

    getState(){
        return this.websocket.readyState;
    }

    static getInstance(setChatRouteData?, setMessages?){
        if(!this.instance){
            this.instance = new WSManager(setChatRouteData, setMessages);
        }
        return this.instance;
    }
    
    static doesInstanceExist(){
        return !!this.instance;
    }

    sendData(data: string){
        this.websocket.send(data);
    }

    async sendMessage(message: string){

        const responsePromise = new Promise((resolve)=>{
            const tempCallback = (event)=>{
                const data = JSON.parse(event.data);
                if(data.type=='messageSentSuccessfully' || data.type=='messageSendingFailed'){
                    resolve(data);
                    this.websocket.removeEventListener('message', tempCallback);
                }

            };
            this.websocket.addEventListener('message', tempCallback);
            this.sendData(JSON.stringify({
                type: 'message',
                payload:{
                    message: message
                }
            }));
        });

        return responsePromise;
        
    }

    closeConnection(){
        if(this.websocket.readyState == this.websocket.OPEN){
            this.websocket.close();
        }
    }

}
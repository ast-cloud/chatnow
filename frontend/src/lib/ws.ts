import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default class WSManager{
    
    public static instance: WSManager;
    private websocket: WebSocket;
    
    private constructor(setNavigateToUrl, setMessages){
        
        this.websocket = new WebSocket('ws://localhost:3000');

        this.websocket.onmessage = (event)=>{
            const data = JSON.parse(event.data);
            if(data.type=='roomCreated'){
                toast.success('Room ID : '+ String(data.payload.roomId));
                console.log('About to call navigate("/chat")');
                setNavigateToUrl('/chat');
            }
            else if(data.type=='roomJoined'){
                toast.success('Room ID : '+ String(data.payload.roomId));
                setNavigateToUrl('/chat');
            }
            else if(data.type=='roomCreationFailed'){
                toast.error(data.payload.message);
            }
            else if(data.type=='roomJoinFailed'){
                toast.error(data.payload.message);
            }
            else if(data.type=='message'){
                setMessages(messages => [...messages, data.payload.message]);
            }
        }

    }

    static getInstance(setNavigateToUrl?, setMessages?){
        if(!this.instance){
            this.instance = new WSManager(setNavigateToUrl, setMessages);
        }
        return this.instance;
    }

    sendData(data: string){
        this.websocket.send(data);
    }

}
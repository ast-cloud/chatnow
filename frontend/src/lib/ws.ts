
export default class WSManager{
    
    public static instance: WSManager;
    
    private constructor(){
        const websocket = new WebSocket('ws://localhost:3000');
    }

    static getInstance(){
        if(!this.instance){
            this.instance = new WSManager();
        }
        return this.instance;
    }

}
import { useState } from "react";

export default function Landing(){

    const websocket = new WebSocket('ws://localhost:3000');

    function createRoom(){
        
    }
    
    function joinRoom(){

    }

    return (
        <div style={{display:'flex'}}>
            <button onClick={createRoom}>Create a room</button>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <button onClick={joinRoom}>Join a room</button>
        </div>
    );
}
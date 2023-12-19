import {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import { Button, Textarea, Typography } from '@material-tailwind/react';
import {useRecoilValue} from 'recoil';
import { chatMessages } from '../lib/atoms/chatPage';
import WSManager from "../lib/ws";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



export default function ChatPage(){
    
    const [newMessage, setNewMessage] = useState<string>('');

    const messages = useRecoilValue(chatMessages);

    const {state} = useLocation();
    const {roomId, roomName} = state;
    
    useEffect(() => {
        console.log('messages - ', messages);
        const scrollableDiv = document.getElementById('chatDiv');
        // scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
        scrollableDiv.scrollTo({
            top: scrollableDiv.scrollHeight,
            behavior: 'smooth'
          });
    }, [messages]);

    useEffect(()=>{
        return ()=>{
            WSManager.getInstance().closeConnection();            
        }
    },[]);
    
    function handleChange(event){
        setNewMessage(event.target.value);
    }
    
    async function handleSend(){
        const data = await WSManager.getInstance().sendMessage(newMessage);
        if(data['type']=='messageSentSuccessfully'){
            console.log('Message sent succesfully');
            setNewMessage('');
            
        }
        else if(data['type']=='messageSendingFailed'){
            toast.error(data['payload'].message);
        }
    }

    return <div className='flex flex-col justify-between h-screen'>
        <div className='w-full h-20 bg-[#F5F3F3]'>
            Room name : {roomName} &nbsp; Room ID : {roomId}
        </div>
        <div id='chatDiv' className='flex-grow overflow-y-auto'>
            {messages.map((m, index)=>(
                <div key={`message_${index}`} className='flex flex-col bg-[#f5f3f3] m-4 p-1 pl-2 max-w-[50vw] rounded-md'>
                    <p style={{fontSize:'14px'}}>{m.name}</p>                                        
                    <Typography placeholder='' variant='lead'>{m.message}</Typography>                                        
                </div>
            ))}
        </div>
        <div className='w-full h-21 bg-[#F5F3F3] flex flex-row p-5 flex-g'>
            <Textarea placeholder='Type a message' className='w-12/14 bg-white' value={newMessage} onChange={handleChange}/>
            <div className='w-2'/>
            <Button placeholder='' className='w-2/14 h-10 place-self-center' onClick={handleSend}>Send</Button>
        </div>
        <ToastContainer/>
    </div>
}
import {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import { Button, Typography } from '@material-tailwind/react';
import {useRecoilValue} from 'recoil';
import { chatMessages } from '../lib/atoms/chatPage';
import WSManager from "../lib/ws";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';




export default function ChatPage(){
    
    const [newMessage, setNewMessage] = useState<string>('');

    const messages = useRecoilValue(chatMessages);

    const {state} = useLocation();
    const {roomId, roomName, userId} = state;
    
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
            console.log('Closing ws connection.')
            //WSManager.getInstance().closeConnection();            
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

        <div className='w-full h-20 px-5 bg-[#F5F3F3] font-bold flex-shrink-0 flex flex-row justify-between items-center' style={{color:'#414142'}}>
            <Typography placeholder='' variant='h5'>
                {roomName} 
            </Typography>
            <Typography placeholder='' variant='h5' style={{color:'grey'}}>
                (Room ID : {roomId})
            </Typography>
        </div>

        <div id='chatDiv' className='flex-grow flex flex-col overflow-y-auto bg-[#EFEAE2]'>
            {messages.map((m, index)=>(
                <div key={`message_${index}`} className={`flex flex-col bg-white m-4 p-2 pl-4 max-w-[50vw] rounded-lg ${m.userId==userId?'self-end':''}`} style={{}}>
                    <p style={{fontSize:'14px', fontWeight:'bold', color: m.color}}>{m.name}</p>                                        
                    <p style={{fontSize:'16px', wordWrap:'break-word', whiteSpace:'pre-wrap', color:'#414142'}}>{m.message}</p>                          
                </div>
            ))}
        </div>

        <div className='w-full h-25 bg-[#F5F3F3] flex flex-row p-5  '>
            <textarea id="chat" rows={1} className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Type a message" value={newMessage} onChange={handleChange}></textarea>
            <div className='w-2'/>
            <Button placeholder='' className='w-2/14 h-10 place-self-center' onClick={handleSend}>Send</Button>
        </div>

        <ToastContainer/>
    </div>
}
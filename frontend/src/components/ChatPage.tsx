import {useEffect} from 'react';
import {useParams} from 'react-router-dom';
import { Button, Textarea } from '@material-tailwind/react';
import {useRecoilValue} from 'recoil';
import { chatMessages } from '../lib/atoms/chatPage';


export default function ChatPage(){
    

    const messages = useRecoilValue(chatMessages);

    const {roomName} = useParams();
    
    useEffect(() => {
      console.log('messages - ', messages);
    }, [messages]);
    

    return <div className='flex flex-col justify-between h-screen'>
        <div className='w-full h-20 bg-[#F5F3F3]'>
            Room name : {roomName}
        </div>
        <div className='flex-grow'>

        </div>
        <div className='w-full h-21 bg-[#F5F3F3] flex flex-row p-5 flex-g'>
            <Textarea placeholder='Type a message' className='w-12/14 bg-white'/>
            <div className='w-2'/>
            <Button placeholder='' className='w-2/14 h-10 place-self-center'>Send</Button>
        </div>
    </div>
}
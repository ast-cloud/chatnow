import {useState} from 'react';
import { Button, Textarea } from '@material-tailwind/react';

type message = {
    name: string;
    text: string;
}

export default function ChatPage(){
    
    const [messages, setMessages] = useState<message[]|null>(null);

    return <div className='flex flex-col justify-between h-screen'>
        <div className='w-full h-20 bg-[#F5F3F3]'>
            ChatPage
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
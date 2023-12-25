import { useEffect, useState } from "react";
import {Button, Dialog, Typography, Card, CardBody, CardFooter, Input } from '@material-tailwind/react';
import { useNavigate } from "react-router-dom";
import WSManager from "../lib/ws";
import {useSetRecoilState} from 'recoil';
import { chatMessages } from '../lib/atoms/chatPage';
import Lottie from 'react-lottie-player';
import homePageAnimation from '../../public/home_page_animation.json';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type chatPageData = {
    roomId: string;
    roomName: string;
    userId: string;
};
export default function Landing(){


    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [createOrJoin, setCreateOrJoin] = useState('create');

    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
          setIsSmallScreen(window.innerWidth < 600);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
    
        return () => window.removeEventListener('resize', handleResize);
      }, []);

    function createRoom(){
        setCreateOrJoin('create');
        setDialogOpen(!dialogOpen);
    }
    
    function joinRoom(){
        setCreateOrJoin('join');
        setDialogOpen(!dialogOpen);
    }

    return (
        <div style={{display:'flex', flexDirection:isSmallScreen?'column':'row', height:'100vh'}}>

            <div style={{display:'flex', flexDirection:'column', width:'50vw', backgroundColor:''}}>

                <div style={{display:'flex', alignItems:'center', height:'35vh', paddingLeft:'15%', border:'0px solid black'}}>
                    <div className="floating-animation" style={{height:'100px', width:'100px'}}>
                        <img src="/chatnow_logo.png" className="floating-animation-item" alt=""/>
                    </div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <h1 style={{fontSize:'50px', fontFamily:"cursive", fontWeight:'bold', color: '#05e3c5'}}>Chatnow</h1>
                </div>

                <div style={{display:'flex', flexDirection:'column', height:'25vh', justifyContent:'center', paddingLeft:'20%', border:'0px solid green'}}>
                    
                        <p style={{fontSize:'20px', fontFamily:'cursive', fontWeight:'bold'}}>Quick, anonymous chatting application</p>
                        <p style={{fontSize:'20px', fontFamily:'cursive', fontWeight:'bold'}}>Hidden identity</p>
                        <p style={{fontSize:'20px', fontFamily:'cursive', fontWeight:'bold'}}>Encrypted</p>
                        <p style={{fontSize:'20px', fontFamily:'cursive', fontWeight:'bold'}}>No logs</p>

                    
                </div>

                
                <div style={{display:'flex', height:'40vh', justifyContent:'space-around', paddingTop:'15%', border:'0px solid yellow'}}>
                    <Button placeholder='' size="lg" style={{height:'45px', borderRadius:'40px'}} onClick={createRoom}>Create a room</Button>
                    <Button placeholder='' size="lg" style={{height:'45px', borderRadius:'40px'}} onClick={joinRoom}>Join a room</Button>
                    <DialogWithForm dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} createOrJoin={createOrJoin}/>
                </div>
                

                
            </div>

            <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'50vw', backgroundColor:''}}>
                <Lottie loop animationData={homePageAnimation} play speed={2.0} style={{height:450, width:450}}/>
            </div>

            {/* <div style={{display:'flex', flexDirection: isSmallScreen?'column':'row'}}>
                <div style={{display:'flex', height:'40vh', width:'50vw', border:'0px solid black'}}>
                    <div style={{height:'100px', width:'100px', marginTop:'7vh', marginLeft:'25vh'}}>
                        <img src="/chatnow_logo.png" alt=""/>
                    </div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <h1 style={{fontSize:'50px', fontFamily:"cursive", fontWeight:'bold', color: '#05e3c5', marginTop:'7vh'}}>Chatnow</h1>
                </div>
                <div style={{display:'flex', width:'50vw', paddingLeft:'55px', paddingTop:'85px', alignItems:'center', border:'0px solid red'}}>
                    <div>
                        <p style={{fontSize:'20px', fontFamily:'cursive', fontWeight:'bold'}}>Quick, anonymous chatting application</p>
                        <p style={{fontSize:'20px', fontFamily:'cursive', fontWeight:'bold'}}>Hidden identity</p>
                        <p style={{fontSize:'20px', fontFamily:'cursive', fontWeight:'bold'}}>Encrypted</p>
                        <p style={{fontSize:'20px', fontFamily:'cursive', fontWeight:'bold'}}>No logs</p>

                    </div>
                </div>
            </div>
            <div style={{display:'flex'}}>
                <div style={{display:'flex', justifyContent:'space-evenly', alignItems:'center', height:'60vh', width:'50vw', border:'0px solid black'}}>
                    <Button placeholder='' size="lg" onClick={createRoom}>Create a room</Button>
                    <Button placeholder='' size="lg" onClick={joinRoom}>Join a room</Button>
                    <DialogWithForm dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} createOrJoin={createOrJoin}/>
                </div>
            </div> */}
        </div>
    );
}

function DialogWithForm({dialogOpen, setDialogOpen, createOrJoin}){

    const [chatRouteData, setChatRouteData] = useState<chatPageData|null>(null);

    const setMessages = useSetRecoilState(chatMessages);

    useEffect(function(){
        WSManager.getInstance(setChatRouteData, setMessages);
    },[]);

    const [name, setName] = useState('');
    const [roomName, setRoomName] = useState('');
    const [roomId, setRoomId] = useState('');

    const navigate = useNavigate();

    useEffect(function(){
        if(chatRouteData){
            navigate('/chat', {state: chatRouteData});
        }
    }, [chatRouteData]);
    

    function handleSubmit(){
        if(createOrJoin=='create'){
            WSManager.getInstance().sendData(JSON.stringify({
                type: "create",
                payload:{
                    name: name,
                    roomName: roomName
                }
            }));
        }
        else{
            WSManager.getInstance().sendData(JSON.stringify({
                type: "join",
                payload:{
                    roomId: roomId,
                    name: name,
                }
            }));
        }                                     
    }

    return (
        <>
            <Dialog
            size="md"
            open={dialogOpen}
            handler={()=>{setDialogOpen(!dialogOpen)}}
            placeholder=''
            className="bg-red-50 shadow-none"
            >
                <Card className="mx-auto w-full" placeholder=''>
                    <CardBody className="flex flex-col gap-4" placeholder=''>
                        <Typography variant="h4" color="blue-gray" placeholder=''>
                        {(createOrJoin=='join')?'Join room':'Create a room'}
                        </Typography>
                        <Typography className="-mb-2" variant="h6" placeholder=''>
                        Enter your name (to be displayed in messages)
                        </Typography>
                        <Input label="Name" size="lg" crossOrigin="" onChange={(e)=>{setName(e.target.value)}}/>
                        <Typography className="-mb-2" variant="h6" placeholder=''>
                            {(createOrJoin=='join') ? 'Enter room code': 'Room name (Topic of discussion)'}
                        </Typography>
                        {(createOrJoin=='join') ? <Input label="Room code" size="lg" crossOrigin="" onChange={(e)=>{setRoomId(e.target.value)}}/> : <Input label="Room name" size="lg" crossOrigin="" onChange={(e)=>{setRoomName(e.target.value)}}/>}
                    </CardBody>
                    <CardFooter className="pt-0" placeholder=''>
                        <Button variant="gradient" onClick={()=>{handleSubmit()}} fullWidth placeholder=''>
                        {(createOrJoin=='join')?'Join':'Create'}
                        </Button>
                    </CardFooter>
                </Card>
            <ToastContainer/>
            </Dialog>
      </>
    );
}
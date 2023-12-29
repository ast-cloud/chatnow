import { useEffect, useState } from "react";
import {Button, Dialog, Typography, Card, CardBody, CardFooter, Input } from '@material-tailwind/react';
import { useNavigate } from "react-router-dom";
import WSManager from "../lib/ws";
import {useSetRecoilState} from 'recoil';
import { chatMessages } from '../lib/atoms/chatPage';
import Lottie from 'react-lottie-player';
import homePageAnimation from '../assets/home_page_animation.json';
import {useMediaQuery} from 'react-responsive';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type chatPageData = {
    roomId: string;
    roomName: string;
    userId: string;
};
export default function Landing(){

    var isScreenLTE600 = useMediaQuery({query: '(max-width: 600px)'});
    var isScreenLTE800 = useMediaQuery({query: '(max-width: 800px)'});

    if(isScreenLTE600){
        return <SmallScreenLayout/>
    }
    else if(!isScreenLTE600 && isScreenLTE800){
        return <MediumScreenLayout/>
    }
    else{
        return <BigScreenLayout/>
    }  

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
        console.log('Inside useeffect, chatRouteData modified to - ', chatRouteData);
        if(chatRouteData){
            navigate('/chat', {state: chatRouteData});
        }
        return ()=>{console.log('Cleanup called')};
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
            console.log('Joining room ', roomId);
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

function LogoWithName({paddingleft, divHeight, imageHeight, imageWidth}){
    return (
        <div style={{display:'flex', alignItems:'center', height: divHeight, paddingLeft: paddingleft, border:'0px solid black'}}>
            <div className="floating-animation" style={{height:imageHeight, width:imageWidth}}>
                <img src="/chatnow_logo.png" className="floating-animation-item" alt="" style={{height:imageHeight, width:imageWidth}} height='100px' width='100px'/>
            </div>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <h1 style={{fontSize:'55px', fontFamily:"Comic Neue", fontWeight:'bold', color: '#05e3c5'}}>Chatnow</h1>
        </div>
    );
}

function Features({isSmallScreen}){
    return (
        <div style={{display:'flex', flexDirection:'column', height:'25vh', justifyContent:'center', paddingLeft:isSmallScreen?'0%':'20%', border:'0px solid green'}}>
                    
                <p style={{fontSize:'25px', fontFamily:'Comic Neue', fontWeight:'bolder'}}>Quick, anonymous chatting application</p>
                <p style={{fontSize:'25px', fontFamily:'Comic Neue', fontWeight:'bold'}}>Hidden identity</p>
                <p style={{fontSize:'25px', fontFamily:'Comic Neue', fontWeight:'bold'}}>Encrypted</p>
                <p style={{fontSize:'25px', fontFamily:'Comic Neue', fontWeight:'bold'}}>No logs</p>

            
        </div>
    );
}

function CreateJoinButtons({divHeight, paddingtop}){

    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [createOrJoin, setCreateOrJoin] = useState('create');

    function createRoom(){
        setCreateOrJoin('create');
        setDialogOpen(!dialogOpen);
    }
    
    function joinRoom(){
        setCreateOrJoin('join');
        setDialogOpen(!dialogOpen);
    }

    return (
        <div style={{display:'flex', height: divHeight, justifyContent:'space-around', paddingTop: paddingtop, border:'0px solid yellow'}}>
            <Button placeholder='' size="lg" style={{height:'45px', borderRadius:'40px'}} onClick={createRoom}>Create a room</Button>
            <Button placeholder='' size="lg" style={{height:'45px', borderRadius:'40px'}} onClick={joinRoom}>Join a room</Button>
            <DialogWithForm dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} createOrJoin={createOrJoin}/>
        </div>
    );
}

function BigScreenLayout(){

    console.log('Big screen layout rendering');
    
    return (
        <div style={{display:'flex', flexDirection:'row', height:'100vh'}}>
            <div style={{display:'flex', flexDirection:'column', width:'50vw', backgroundColor:''}}>

                <LogoWithName paddingleft='15%' divHeight='35vh' imageHeight='100px' imageWidth='100px'/>

                <Features isSmallScreen={false}/>

                <CreateJoinButtons divHeight='40vh' paddingtop='15%'/>

            </div>

            <div style={{display:'flex', justifyContent:'center', alignItems:'center', width:'50vw', backgroundColor:''}}>

                <Lottie loop animationData={homePageAnimation} play speed={2.0} style={{height:450, width:450}}/>

            </div>    
        </div>
    );
}

function MediumScreenLayout(){

    console.log('Medium screen layout rendering');

    return (
        <div style={{display:'flex', flexDirection:'column'}}>

            <div style={{display:'flex', justifyContent:'center'}}>
                <LogoWithName paddingleft='0%' divHeight='20vh' imageHeight='80px' imageWidth='80px'/>
            </div>

            <div style={{display:'flex', border:'0px solid blue'}}>
                <div style={{width:'45vw', backgroundColor:'', alignSelf:'center'}}>
                    <Features isSmallScreen={false}/>
                </div>
                <div style={{display:'flex', justifyContent:'center', width:'55vw'}}>
                    <Lottie loop animationData={homePageAnimation} play speed={2.0} style={{height:350, width:350}}/>              
                </div>                
            </div>
            
                <CreateJoinButtons divHeight='35vh' paddingtop='8%'/>

            

        </div>
    );
}

function SmallScreenLayout(){

    console.log('Small screen layout rendering');

    return (
        <div style={{display:'flex', flexDirection:'column'}}>

            <div style={{display:'flex', justifyContent:'center'}}>
                <LogoWithName paddingleft='0%' divHeight='20vh' imageHeight='65px' imageWidth='65px'/>
            </div>

            <Lottie loop animationData={homePageAnimation} play speed={2.0} style={{height:250, width:250, alignSelf:'center'}}/>

            <div style={{display:'flex', justifyContent:'center'}}>
                <Features isSmallScreen={true}/>
            </div>
            
            <CreateJoinButtons divHeight='25vh' paddingtop='5%'/>            

        </div>
    );
}
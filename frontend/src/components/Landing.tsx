import { useEffect, useState } from "react";
import {Button, Dialog, Typography, Card, CardBody, CardFooter, Input } from '@material-tailwind/react';
import { useNavigate } from "react-router-dom";
import WSManager from "../lib/ws";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function Landing(){


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
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', border:'1px solid black'}}>
            <Button placeholder='' size="lg" onClick={createRoom}>Create a room</Button>
            <div style={{width:'100px'}}></div>
            <Button placeholder='' size="lg" onClick={joinRoom}>Join a room</Button>
            <DialogWithForm dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} createOrJoin={createOrJoin}/>
        </div>
    );
}

function DialogWithForm({dialogOpen, setDialogOpen, createOrJoin}){

    const [navigateToUrl, setNavigateToUrl] = useState<string|null>(null);

    useEffect(function(){
        WSManager.getInstance(setNavigateToUrl);
    },[]);

    const [name, setName] = useState('');
    const [roomName, setRoomName] = useState('');
    const [roomId, setRoomId] = useState('');

    const navigate = useNavigate();

    useEffect(function(){
        if(navigateToUrl){
            navigate(navigateToUrl);
        }
    }, [navigateToUrl]);
    

    function handleSubmit(){
        if(createOrJoin=='create'){
            WSManager.getInstance().sendData(JSON.stringify({
                type: "create",
                payload:{
                    name: name
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
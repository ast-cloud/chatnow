import { useState } from "react";
import {Button, Dialog, Typography, Card, CardBody, CardFooter, Input } from '@material-tailwind/react';

export default function Landing(){

    const websocket = new WebSocket('ws://localhost:3000');

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

    return (
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
            <Input label="Name" size="lg" crossOrigin=""/>
            <Typography className="-mb-2" variant="h6" placeholder=''>
                {(createOrJoin=='join') ? 'Enter room code': 'Room name (Topic of discussion)'}
            </Typography>
            {(createOrJoin=='join') ? <Input label="Room code" size="lg" crossOrigin=""/> : <Input label="Room name" size="lg" crossOrigin=""/>}
          </CardBody>
          <CardFooter className="pt-0" placeholder=''>
            <Button variant="gradient" onClick={()=>{}} fullWidth placeholder=''>
              {(createOrJoin=='join')?'Join':'Create'}
            </Button>
          </CardFooter>
        </Card>
      </Dialog>
    );
}
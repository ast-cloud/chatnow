import express from 'express';

const app = express();

app.get('/healthcheck', (req, res)=>{
    res.json({'status':'healthy'});
})

app.listen(3000, ()=>{console.log('Started express server on port 3000.')})
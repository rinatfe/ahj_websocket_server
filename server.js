const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const cors = require("@koa/cors");
const app = new Koa();
const WS = require('ws');


app.use(koaBody({
    urlencoded: true
}));

const users = [];
const messages = [];

app.use(cors({
    origin: "*",
    credentials: true,
    "Access-Control-Allow-Origin": true,
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(async (ctx)=> {
    
    const {method, name}  = ctx.request.query;
    if(method == 'findUser') {
        if(users.some(x=> x.name == name)){
            ctx.response.body = false;
        }else {
            users.push({name:name});
            ctx.response.body = users;
        }
    }
    if(method == 'deleteUser') {
        let user = ctx.request.body;
        users.splice(users.findIndex(x => x.name == user), 1);
    }
});


const port = process.env.PORT||7070;
const server = http.createServer(app.callback());
const wsServer = new WS.Server({server});

wsServer.on('connection', (ws, req)=> {
    const errCallback = (err)=> {
        if(err){
          console.log('error');  
        }
    };

    ws.on('message', msg => {
        
        messages.push(JSON.parse(msg));
        ws.send(JSON.stringify(messages), errCallback);
    });

    ws.send('Соединение открыто', errCallback);
});

server.listen(port);



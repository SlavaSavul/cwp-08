const http = require('http');
const net = require('net');
const hostname = '127.0.0.1';
const port = 3000;
let  client = new net.Socket();

const handlers = {
    '/workers': getWorkers,
    '/workers/add': addWorker,
    '/workers/remove': removeWorker
};

const server = http.createServer((req, res) => {
    try {
        parseBodyJson(req, (err, payload) => {
            const handler = getHandler(req.url);
            handler( payload, (err, result) => {
                if (err) {
                    res.statusCode = err.code;
                    res.end(JSON.stringify(err));
                    return;
                }else{
                    res.statusCode = 200;
                    res.end(result);
                }
            });
        });
    }catch (e) {
        console.log(e);
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

function getHandler(url) {
    return handlers[url] || notFound;
}

function notFound(req, res, payload, cb) {
    cb({ code: 404, message: 'Not found'});
}

function parseBodyJson(req, cb) {
    let body = [];
    req.on('data', function(chunk) {
        body.push(chunk);
    }).on('end', function() {
        let params = '';
        body = Buffer.concat(body).toString();
        if (body !== ""){
            params = JSON.parse(body);
        }
        cb(null, params);
    });
}

client.connect(8003, function () {
    console.log('Connected to the TCP server');
});

function sendToTCPServer(  cb, message){
    client.write(JSON.stringify(message));
    client.on('data', (data)=>{
        cb(null, data || []);
    });
}

function getWorkers( payload, cb){
    sendToTCPServer(  cb, {act: "GET"});
}

function addWorker(  payload, cb) {
    sendToTCPServer( cb, {act: "CREATE", X: payload.X});
}

async function removeWorker( payload, cb){
    sendToTCPServer(  cb, {act: "STOP", id: payload.id});
}
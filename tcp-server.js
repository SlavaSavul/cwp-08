const fs = require('fs');
const spawn = require('child_process').spawn;
const net = require('net');
let seed = 0;
const port = 8003;
let idWorker = 0;
let workers = [];

const handlers = {
    "CREATE":createWorker,
    "GET":getWorkers,
    "STOP": stopWorker
};

const server = net.createServer((client)=>{
    client.setEncoding('utf8');
    client.id = `${Date.now()}seed${++seed}`;
    client.on('data', (data)=>{
        data = JSON.parse(data);
        handlers[data.act](client, data);
    });

});

server.listen(port, () => {
    console.log(`Server running at ${port}`);
});

function createWorker(client, data){
    let workerData={};
    workerData.X = data.X || 1;
    workerData.startedOn  = currentDate();
    workerData.workerId = `${client.id}${++idWorker}`;
    workerData.file = `${process.cwd()}/${workerData.workerId}.json`;
    workerData.proc = spawn('node', ['worker.js', workerData.file, workerData.X], { detached: true } );
    client.write(JSON.stringify({id: `${workerData.workerId}`, startedOn: workerData.startedOn}));
    workers.push({id: `${workerData.workerId}`, X: workerData.X, startedOn: workerData.startedOn, file: workerData.file, proc: workerData.proc});
}

function stopWorker(client, data){
    if(data.id!==undefined){
        let index = workers.findIndex((worker) => worker.id === data.id);
        if(index!==-1){
            let numbers = fs.readFileSync(workers[index].file);
            let result = {id: workers[index].id, startedOn: workers[index].startedOn, numbers: numbers};
            client.write(JSON.stringify(result));
            process.kill(workers[index].proc.pid);
            workers.splice(index, 1);
            return;
        }
    }
    client.write(JSON.stringify({err:"Invalid ID"}));
}

function getWorkers(client){
    let result = [];
    workers.forEach((worker)=>{
        let numbers = fs.readFileSync(worker.file);
        result.push({id: worker.id, startedOn: worker.startedOn, numbers: numbers});
    });
    client.write(JSON.stringify(result));
}

function currentDate() {
    const date = new Date();
    return `${date.getFullYear()}.${date.getMonth()}.${date.getDay()} ${date.getHours()}:${date.getMinutes()}`;
}

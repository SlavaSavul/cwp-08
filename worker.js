const fs = require('fs');
let file = process.argv[2];
let X = process.argv[3]*1000;


(()=> {
    fs.exists(file, function (exists) {
        if (!exists) {
            fs.writeFile(file, '[]', () => {writeNumeric()});
        }
        else writeNumeric();
    })
})();

function writeNumeric() {
    fs.readFile(file, 'utf8', (err, data) => {
        let arr = JSON.parse(data);
        setInterval(function appendNumeric() {
            arr.push(rand());
            let dat = JSON.stringify(arr);
            fs.writeFile(file, dat, (err) => {
                if(err){
                    console.log(err);
                }
            });
        }, X);
    });
}


function rand() { return Math.round(Math.random() * 1000); }



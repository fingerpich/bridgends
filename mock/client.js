const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const StartTimepout = 1000;
const IntervalTime = 10 * 1000;
// const uri = 'http://localhost:3033';
const uri = 'http://localhost:6464/proxy';

app.use( bodyParser.json({}) );
app.use(bodyParser.urlencoded({}));

app.all('*', function (req, res) {
    const proxy = request({ url: req + req.path});
    req.pipe(uri);
});

function sendRequestUsingProxy(path, method){
    const clientServerOptions = {
        uri: uri + '/' + path,
        body: JSON.stringify({ask:'Can i ask you some thing?'}),
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    console.log('__________________________');
    console.log(clientServerOptions.uri);
    console.log(clientServerOptions.body);

    request(clientServerOptions, function (error, response) {
        if (error) {
            console.log('err: ',error);
        }
        if (response) {
            console.log('resp: ',response.statusCode, response.body);
        }
        setTimeout(sendNewQuestion, IntervalTime);
    });
}
const sendNewQuestion = () => {
    const depth = Math.floor(3 + Math.random() * 3);
    const url = Array.apply(null, Array(depth)).map((i,index) => {
        return 'url' + index + (Math.floor(Math.random() * 10))
    }).join('/');
    const methods = ['POST', 'GET'];
    const method = methods[Math.floor(Math.random() * 1.99)];
    sendRequestUsingProxy(url, method);
};

setTimeout(sendNewQuestion, StartTimepout);

app.listen(3031, () => console.log('localhost:3031 started sending random requests to ' + uri));
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use( bodyParser.json({}) );
app.use(bodyParser.urlencoded({}));

app.all('*', function (req, res) {
    res.send({answer: 'ok'})
});
// const uri = 'http://localhost:3033';
const uri = 'http://localhost:6464/proxy';
const request = require('request');

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
        setTimeout(sendNewQuestion, 2000);
    });
}
const sendNewQuestion = () => {
    const depth = Math.floor(5 + Math.random() * 6);
    const url = Array.apply(null, Array(depth)).map((i,index) => {
        return 'url' + index + (Math.floor(Math.random() * 10))
    }).join('/');
    const methods = ['POST', 'GET'];
    const method = methods[Math.floor(Math.random() * 1.99)];
    sendRequestUsingProxy(url, method);
};

setTimeout(sendNewQuestion, 2000);

app.listen(3031, () => console.log('I will send a lot of request from port 3031 to ' + uri));
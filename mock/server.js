const express = require('express');
const app = express();

app.all('*', function (req, res) {
    res.send({answer: 'Yes'})
});

app.listen(3033, () => console.log('the spit fire is on port: 3033'));
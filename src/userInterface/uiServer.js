const express = require('express');
const router = express.Router();
const reqManager = require('../requestManager/reqManager.js');

// middleware that is specific to this router
// router.use(function timeLog (req, res, next) {
//     console.log('Time: ', Date.now());
//     next()
// });

// define the home page route
router.get('/', function (req, res) {
    res.send('Birds home page')
});

// define the about route
router.get('/reqList', function (req, res) {
    res.send(JSON.stringify(reqManager.list));
});

module.exports = router;
const bridgends = require('./src/bridgends.js');

bridgends.start({
    apiPath: '/api',
    target: 'http://192.168.82.198:81/api/',
    saveDir: 'cache_api/',
    port: 6464,
});
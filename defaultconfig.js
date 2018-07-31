module.exports = {
    name: 'default',
    proxyPath: '/proxy',
    requestTimeout: 10,
    targets: ['http://172.17.1.55:80/'],
    // targets: ['http://192.168.82.198:81'],
    firstCache: true,
    savePath: './bridgendsfiles/',
    port: 6464,

    uiPath: '/reqManager',
    socketPath: '/ws1',
};

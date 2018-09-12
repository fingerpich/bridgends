module.exports = {
    name: 'default',
    proxyPath: '/proxy',
    requestTimeout: 10,
    targets: ['http://localhost:3033'],
    firstCache: true,
    savePath: './bridgendsfiles/',
    port: 6464,

    uiPath: '/reqManager',
    socketPath: '/ws1',
};

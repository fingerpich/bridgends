const bridgends = require('./src/bridgends.js');
const config = require('./defaultconfig.js');
const argv = require('minimist')(process.argv.slice(2));
if (argv.targets) {
    argv.targets = argv.targets.split(',');
}
Object.assign(config, argv);
console.log(config);
bridgends.start(config);
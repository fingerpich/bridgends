const bridgends = require('./src/bridgends.js');
const config = require('./defaultconfig.js');
const argv = require('minimist')(process.argv.slice(2));
argv.targets = argv.targets.split(',');
console.log(argv);
Object.assign(config, argv);
bridgends.start(config);
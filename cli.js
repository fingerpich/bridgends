#!/usr/bin/env node
const pm2 = require('pm2');
const fs = require('fs');
const program = require('commander');
const inquirer = require('inquirer');
const config = require('./defaultconfig.js');

program
    .version('0.0.1', '-v, --version')
    .option('-s, stop', 'stop')
    .option('-t, --targets <targets>', 'Add target', list => list.split(','))
    .option('-u, --ui-path', 'Set ui path')
    .option('-f, --files-path', 'Set files path')
    .option('-o, --socket-path', 'Set socket path')
    .parse(process.argv);

if (program.stop) {
    pm2.stop('index');
    setTimeout(() => {
        console.log('bridgends is stoped');
        process.exit(2);
    }, 2000);
} else {
    (() => {
        if (program.targets) {
            config.targets = program.targets;
            console.log('targets: ' + config.targets);
            return Promise.resolve()
        } else {
            return inquirer.prompt({type: 'string', name: 'targets', message: 'you have to had an api target at least, enter targets(eg: http://192.168.10.20:4243/)'})
                .then(answers => {
                    console.log(answers);
                    config.targets = answers.targets.split(',');
                    return config.targets;
                },(err) => {
                    console.error(err);
                });
        }
    })().then(() => {
        if (program.uiPath) {
            config.uiPath = program.uiPath.split(':')[0];
            config.port = program.uiPath.split(':')[1];
        }
        if (program.cachePath) {
            config.saveDir = program.savePath;
        }
        if (program.socketPath) {
            config.socketPath = program.socketPath.split(':')[0];

        }
        fs.writeFileSync('./config.js',"module.exports ="+JSON.stringify(config));

        pm2.connect(function(err) {
            if (err) {
                console.error(err.message);
                process.exit(2);
            }
            console.log('bridgends has started');
            console.log('open http://localhost' +(config.port?':'+config.port:'') + '/ in your browser');
            pm2.start('index.js', function (err, apps) {
                pm2.disconnect();
                if (err) {
                    console.error(err.message);
                }
            });
        });
    });
}
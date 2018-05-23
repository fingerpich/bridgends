#!/usr/bin/env node
const pm2 = require('pm2');
const fs = require('fs');
const program = require('commander');
const inquirer = require('inquirer');
const config = require('./defaultconfig.js');

program
    .version('0.0.1', '-v, --version');

program
    .command('stop [name]')
    .description('stop bridgends')
    .action((name, cmd) => {
        pm2.stop(name || 'index');
        setTimeout(() => {
            console.log('bridgends is stoped');
            process.exit(2);
        }, 2000);
    });

program
    .command('start [name]')
    .description('start new instance of bridgends')
    .option('-t, --targets <targets>', 'set api targets', list => list.split(','))
    .option('-f, --save-path [value]', 'Set files path')
    .option('-a, --api-path [value]', 'Set api path')
    .option('-p, --port [value]', 'set instance port')
    .action((name, cmd) => {
        (() => {
            if (cmd.targets) {
                config.targets = cmd.targets;
                console.log('targets: ' + config.targets);
                return Promise.resolve()
            } else {
                return inquirer.prompt({type: 'string', name: 'targets', message: 'you have to had an api target at least, enter targets(eg: http://192.168.10.20:4243/)'})
                    .then(answers => {
                        config.targets = answers.targets.split(',');
                        return config.targets;
                    },(err) => {
                        console.error(err);
                    });
            }
        })().then(() => {
            if (cmd.apiPath) {config.apiPath = cmd.apiPath;}
            if (cmd.savePath) {config.saveDir = cmd.savePath;}
            if (cmd.port) {config.port = cmd.port;}
            fs.writeFileSync('./config.js', 'module.exports =' + JSON.stringify(config));

            pm2.connect(function(err) {
                if (err) {
                    console.error(err.message);
                    process.exit(2);
                }
                console.log('bridgends has started');
                console.log('open http://localhost' +(config.port?':'+config.port:'') + '/ in your browser');
                pm2.start({name, script: 'index.js'}, function (err, apps) {
                    pm2.disconnect();
                    if (err) {
                        console.error(err.message);
                    }
                });
            });
        });
    });

program
    .parse(process.argv);


if (program.args.length === 0) program.help();
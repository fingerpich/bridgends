#!/usr/bin/env node
const pm2 = require('pm2');
const filendir = require('filendir');
const path = require('path');
const pkg = require('./package.json');
const program = require('commander');
const inquirer = require('inquirer');
const config = require('./defaultconfig.js');

program
    .version(pkg.version, '-v, --version');

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
        const filePath = cmd.savePath || config.savePath;
        try {
            filendir.writeFileSync(path.join(filePath, 'test.tmp'));
        } catch(e) {
            console.log('you have no write access in ' + filePath + ', use -f option eg: -f /home/fingerpich/bfiles');
            return;
        }
        (() => {
            if (cmd.targets) {
                console.log('targets: ' + cmd.targets);
                return Promise.resolve(cmd.targets)
            } else {
                return inquirer.prompt({type: 'string', name: 'targets', message: 'you have to had an api target at least, enter targets(eg: http://192.168.10.20:4243/)'})
            }
        })().then((targets) => {
            pm2.connect(function(err) {
                if (err) {
                    console.error(err.message);
                    process.exit(2);
                }
                console.log('bridgends has started');
                console.log('open http://localhost' +(config.port?':'+config.port:'') + '/ in your browser');
                pm2.start({
                    name,
                    script: 'index.js',
                    args: (cmd.apiPath? ' --apiPath ' + cmd.apiPath : '') +
                    (cmd.savePath? ' --savePath ' + cmd.savePath : '') +
                    (cmd.port? ' --port ' + cmd.port : '') +
                    (targets? ' --targets ' + targets : '')
                }, function (err, apps) {
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
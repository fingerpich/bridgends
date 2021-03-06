const filendir = require('filendir');
const fs = require('fs');
const path = require('path');

class FileResponds {
    constructor () {

    }

    start ({dir, instanceName}) {
        this.savePath = dir;
        this.instanceName = instanceName;
    }

    save (data, name) {
        const filePath = this._getFileName(name);
        filendir.writeFile(filePath, JSON.stringify(data), function (err) {
            if (err) {
                console.log('File could not be saved in ' + this.savePath);
                throw err
            }
        }.bind(this));
    }

    has (name) {
        const filePath = this._getFileName(name);
        return fs.existsSync(filePath);
    }

    load (name) {
        return new Promise((resolve, reject) => {
            const filePath = this._getFileName(name);
            try {
                fs.readFile(filePath, 'utf-8', (err, data) => {
                    if (err) {
                        console.log('error loading file ', err.message);
                    }
                    else {
                        try {
                            const cached = JSON.parse(data);
                            resolve(cached);
                        } catch (e) {
                            console.log('error in parsing loaded file', e.message);
                        }
                    }
                });
            } catch(e) {
                console.log('error in finding file', e);
                reject()
            }
        });
    }

    _getFileName (name) {
        return path.join(this.savePath, this.instanceName + name + '.tmp')
    }
}

module.exports = new FileResponds();
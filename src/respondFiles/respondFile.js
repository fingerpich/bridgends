const filendir = require('filendir');
const fs = require('fs');
const path = require('path');

class FileResponds {
    constructor () {

    }

    start ({dir}) {
        this.savePath = dir;
    }

    save (data, name) {
        const filePath = this._getFileName(name);
        filendir.writeFile(filePath, JSON.stringify(data), function (err) {
            if (err) {
                log('File could not be saved in ' + this.savePath);
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
                        console.log(err.message);
                    }
                    else {
                        try {
                            const cached = JSON.parse(data);
                            resolve(cached);
                        } catch (e) {
                            console.log(e.message);
                        }
                    }
                });
            } catch(e) {
                console.log(e);
            }
        });
    }

    _getFileName (name) {
        return path.join(this.savePath, name + '.tmp')
    }
}

module.exports = new FileResponds();
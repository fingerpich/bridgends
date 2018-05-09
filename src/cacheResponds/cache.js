const filendir = require('filendir');
const fs = require('fs');
const path = require('path');

class CacheResponds {
    constructor () {

    }

    start ({dir}) {
        this.savePath = dir;
    }

    saveRequest (envelope) {
        const filePath = this._getFileName(envelope.cacheID);
        filendir.writeFile(filePath, JSON.stringify(envelope), function (err) {
            if (err) {
                log('File could not be saved in ' + this.savePath);
                throw err
            }
        }.bind(this));
    }

    has (cacheID) {
        const filePath = this._getFileName(cacheID);
        return fs.existsSync(filePath);
    }

    respond (cacheID) {
        return new Promise((resolve, reject) => {
            const filePath = this._getFileName(cacheID);
            try {
                fs.readFile(filePath, 'utf-8', (err, data) => {
                    if (err) {
                        reject(err.message);
                    }
                    else {
                        try {
                            const cached = JSON.parse(data);
                            resolve(cached);
                        } catch (e) {
                            reject(e.message);
                        }
                    }
                });
            } catch(e) {
                reject(e);
            }
        });
    }

    _getFileName (cacheID) {
        return path.join(this.savePath, cacheID + '.tmp')
    }
}
module.exports = new CacheResponds();
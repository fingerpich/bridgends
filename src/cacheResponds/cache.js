const filendir = require('filendir');
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
                    if (err) reject('')
                });
                resolve(data);
            } catch(e) {
                reject(e);
            }
        });
    }

    _getFileName (cacheID) {
        return path.resolve(this.savePath, cacheID + '.tmp')
    }
}
module.exports = new CacheResponds();
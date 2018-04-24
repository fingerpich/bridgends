const filendir = require('filendir');
const crypto = require('crypto');
const Envelope = require('./envelope.js');
const hasher = crypto.createHash('sha256');

class CacheResponds {
    constructor () {

    }

    start () {

    }

    saveRequest (envelope) {
        const filePath = this._getFileName(envelope);
        filendir.writeFile(filePath, JSON.stringify(envelope), function (err) {
            if (err) {
                log('File could not be saved in ' + this.config.cacheDir);
                throw err
            }
        }.bind(this));
    }

    respond (req) {
        this.getRequest(req).getData();
    }

    has (req) {
        const filePath = this._getFileName(req);
        return fs.existsSync(filePath);
    }

    getRequest (req) {
        return new Promise((resolve, reject) => {
            const filePath = this._getFileName(req);
            try {
                fs.readFile(filePath, 'utf-8', (err, data) => {
                    if (err) reject('')
                });
                const cachedEnvelope = Envelope.fromJson(data);
                if (cachedEnvelope.checkVersion()) {
                    reject('Request envelope created in old plugin version.');
                } else {
                    resolve(cachedEnvelope);
                }
            } catch(e) {
                reject(e);
            }
        });
    }

    _getFileName (req) {
        let bodyHash = '';
        if (req.method !== 'GET') {
            hasher.update(req.reqBody);
            bodyHash = hasher.digest('hex');
        }

        const sanitazedURL = sanitize(envelope.reqURL.replace('://', '-'), {replacement: '-'});
        let fileName = envelope.reqMethod + '_' + sanitazedURL + bodyHash;
        fileName = (fileName.length > 250) ? fileName.slice(0, 250) : fileName;
        fileName += '.tmp';

        return path.resolve(this.config.cacheDir, fileName);
    }
}
module.exports = new CacheResponds();
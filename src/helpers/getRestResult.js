/* global require, module, Buffer */
const zlib = require('zlib');

module.exports = (request) => {
    return new Promise((resolve, reject) => {
        const reqTime = Date.now();
        request.on('response', (apiRes) => {
            let body = [];
            apiRes.on('data', (chunk) => body.push(chunk));// Data is Buffer when gzip, text when not-gzip
            apiRes.on('end', () => {
                const resTime = Date.now();
                const encoding = apiRes.headers['content-encoding'];
                const buffer = Buffer.concat(body);
                if (encoding === 'gzip') {
                    body = zlib.gunzipSync(buffer);
                } else if (encoding === 'deflate') {
                    body = zlib.inflateSync(buffer);
                } else {
                    body = buffer;
                }
                body = body ? body.toString() : '';
                resolve({body, resTime, reqTime});
            });
        });
        request.on('error', (error) => {
            reject(error);
        });
    });
};

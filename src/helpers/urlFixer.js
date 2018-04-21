class UrlFixer {
    constructor () {

    }

    replaceRemoteAddress(url, remoteAddress) {
        let urlParts = url.split('/');
        const apiUrl = remoteAddress.replace(/\/+$/, '');

        if (urlParts[0] === '') {
            // req.url is like "/api/getSt"
            urlParts[0] = apiUrl
        } else {
            // req.url is like "http://localhost:8080/api/getSt"
            urlParts.splice(0, 3); // url would be ["/api/getSt"]
            urlParts.unshift(apiUrl);
        }

        return urlParts.join('/');
    }
}
module.exports = new UrlFixer();
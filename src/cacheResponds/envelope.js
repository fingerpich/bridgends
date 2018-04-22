const packageJson = require('../../package.json');

class Envelope {
    static fromData () {
    }
    static fromJson (jsonText) {
        const json = JSON.parse(jsonText);
        const env = new Envelope();
        Object.assign(env, json);
        return env;
    }
    constructor () {

    }
    checkVersion () {
        return this.version !== packageJson.version;
    }
    getHeaders () {
        const h = this.headers;
        h['bridgends-hit-date'] = this.cacheDate;
        return h;
    }
    getData () {
        const headers = this.headers;
        headers['bridgends-hit-date'] = this.cacheDate;
        return {
            body:this.body,
            headers
        };
    }
}
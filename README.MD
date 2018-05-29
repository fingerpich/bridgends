# Bridgends
Its a development tool for frontend developer to use some API which are under development.

[![MIT License][license-image]][license-url]
[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE

[![NPM version][npm-version-image]][npm-url]
[npm-url]: https://npmjs.org/package/bridgends
[npm-version-image]: http://img.shields.io/npm/v/bridgends.svg?style=flat

[![dependencies Quality][dependencies-quality]][dependencies-quality-url]
[dependencies-quality]: https://david-dm.org/fingerpich/bridgends.svg
[dependencies-quality-url]: https://david-dm.org/fingerpich/bridgends

[![dev dependencies Quality][dev-dependencies-quality]][dev-dependencies-quality-url]
[dev-dependencies-quality]: https://david-dm.org/fingerpich/bridgends/dev-status.svg
[dev-dependencies-quality-url]: https://david-dm.org/fingerpich/bridgends?type=dev


## Installation
```
npm i bridgends -g
```

## Introduction
It makes http server between frontend developer and APIs which forwards requests to APIs and also cache their response
then it makes you able to change respond way(api, cache) or define a mock to respond by its user Interface.

#### Example
suppose we want to run bridgends on a front end developer's system and
we have an API on http://192.168.82.198:81/api/

 - `npm i bridgends -g`
 - `bridgends start -t http://192.168.82.198:81/ -p 4243 -a /api`
 - change frontend to send all request to `localhost:4243`
   - if you are using webpack just change [the proxy](https://webpack.js.org/configuration/dev-server/#devserver-proxy
   ```
   proxy: {
       "/api": {
            target: "http://localhost:4243",
       }
   }
   ```
 - start front end web app
 - open `localhost:4243` in your browser and handle every request passing through

#### CLI options

Start and stop bridgends process
```
bridgends start -t http://192.168.82.198:81/
bridgends stop
```

Multiple API target
```
bridgends start -t http://192.168.82.198:81/,http://192.168.82.122:81/
bridgends stop
```
Set port, apiPath, savePath

Defaults
 - port: `6464`
 - api path: `/api`
 - file path: `./bridgendsfiles`
```
bridgends start -t http://192.168.82.198:81/ -a /api2 -p 4542 -f /home/fingerpich/bridgendsFiles
bridgends stop
```

Run multi instance
```
bridgends start name
bridgends stop name
```
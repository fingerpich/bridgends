# Bridgends
Its a development tool to manage and make api calls more reliable, more clear and faster for both team (frontend and backend)

[![MIT License][license-image]][license-url]
[![NPM version][npm-version-image]][npm-url]
[![dependencies Quality][dependencies-quality]][dependencies-quality-url]
[![dev dependencies Quality][dev-dependencies-quality]][dev-dependencies-quality-url]


## Installation
```
npm i bridgends -g
```

## Introduction
It designed to run a http server between frontend developer system and
under development APIs and makes you able to see requests and their responses in its ui
and change the respond way (api, cache, mock) for each request.
By default it responds by cache so frontend developer
would not waste time for api latency or when api is down.

#### How to run
Suppose we want to run bridgends on a front end developer's system and
there is an API on http://192.168.82.198:81/api/

 - `npm i bridgends -g`
 - `bridgends start -t http://192.168.82.198:81/ -p 4243 -a /api`
 - change frontend code to proxy all request through `localhost:4243/proxy`
   - if you are using webpack just change [the proxy](https://webpack.js.org/configuration/dev-server/#devserver-proxy)
   ```
   proxy: {
       "/api": {
            target: "http://localhost:4243/proxy",
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
Set port, savePath

Defaults
 - port: `6464`
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

[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: LICENSE

[npm-url]: https://npmjs.org/package/bridgends
[npm-version-image]: http://img.shields.io/npm/v/bridgends.svg?style=flat

[dependencies-quality]: https://david-dm.org/fingerpich/bridgends.svg
[dependencies-quality-url]: https://david-dm.org/fingerpich/bridgends

[dev-dependencies-quality]: https://david-dm.org/fingerpich/bridgends/dev-status.svg
[dev-dependencies-quality-url]: https://david-dm.org/fingerpich/bridgends?type=dev
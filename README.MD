# Bridgends
Its a development tool for frontend developer to use some API which are under development.

## Installation
Install its CLI
```
npm i bridgends -g
```

## Introduction
It makes http server between frontend developer and APIs which forwards requests to APIs and also cache their response
then it makes you able to change respond way(api, cache) or define a mock to respond by its user Interface.

#### Example
suppose that we want to run bridgends on a front end developer's system and
we have api server on http://192.168.82.198:81/api/

 - `npm i bridgends -g`
 - `bridgends start -t http://192.168.82.198:81/api/ -p 4243 -a /api`
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
 - open localhost:4243 in your browser and handle every request passing through

#### CLI options

Start and stop bridgends process
```
bridgends start -t http://192.168.82.198:81/api/
bridgends stop
```

Add multiple API target
```
bridgends start -t http://192.168.82.198:81/api/,http://192.168.82.122:81/api/
bridgends stop
```

Run multi instance
```
bridgends start name
bridgends stop name
```
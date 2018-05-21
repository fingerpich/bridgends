# Bridgends
Its a development tool for frontend developer when they want to use some API which are under development.

## Installation
Install its CLI
```
npm i bridgends -g
```

## Introduction
It is a proxy server at first which forward requests to API and cache responses
then you can change or define a new way to respond (api, cache or mock) for every request.

It consist a proxy server and its user interface which shows all the passing requests and make you able to see and change their respond

#### Example
suppose that we want to run bridgends on a front end developer's system and
api server is on http://192.168.82.198:81/api/

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

#### start options
```
bridgends start -t http://192.168.82.198:81/api/
```

#### stop service
```bash
bridgends stop
bridgends stop name
```
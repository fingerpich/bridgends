# Bridgends

Its a development tool to cache, test, debug, proxy, mock the API.

## introduction

Separation of front-end and backend has its gains but these problems may happen
 - API goes down sometimes.
 - API responds wrong and frontend developers has to use mock.
 - API responds late and frontend development would done slowly.
 - API is changed but frontend team are not aware of it.
 - Frontend tasks goes faster than backend and frontend will need not implemented api.

What Bridgends do
 - Caches the responds
 - Uses cache or mock or main API to respond the requests
 - Detects responds changes
 - Tests and shows status of the API
 - Responds the same request respond if it didn't cached before
 - Makes you be able to change behave of every request in its ui
 - It will show what browser or webpack proxy send to the server and what is respond.
 - It can change the target for some of the requests so it will be able to centralize parallel API development

## install

using npm

```
npm i bridgends -S
```

## run

```js
import bridgends from bridgends

bridgends.start({
    apiPath: '/api',
    target: 'http://192.168.82.198:81/api/',
    saveDir: 'cache_api/',
    port: 6464,
});
```

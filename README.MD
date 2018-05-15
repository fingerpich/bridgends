# Bridgends

Its a development tool to cache, test, debug, proxy and mock API.

## introduction
It makes a proxy with ui between Frontend and Backend in development time to handle the exchanging requests and responses

seperation of frontend and backend has a lots of pros but it needs
Independent testing, development and API documentation
takes a lot of time and resources for both team
and testing and mocking is not the solution always
specially in startups which changes time to time
but if we didn't do that completely we would have following problem
 - API goes down sometimes.
 - API responds wrong and frontend developers have to use mock.
 - API responds late and frontend development would done slowly.
 - API is changed but frontend team are not aware of it.
 - Frontend needs an api which is not implemented.
 - Multiple server for different API implementation.

What Bridgends do
 - Caches the responds
 - Uses cache or mock or the API to respond the requests
 - Detects responds changes
 - Tests and shows status of the API
 - It will show what browser or webpack proxy send to the server and what it responds.
 - It can use
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

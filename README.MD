![Bridgends logo](https://www.bridgends.com/images/logo.png)

# [Bridgends](https://www.bridgends.com)
Its a development tool used to support frontend and backend developers during developing and using API.

See more on [Bridgends.com](https://www.bridgends.com).

## Install and get started with bridgends
[This page](https://www.bridgends.com/getting-started) helps you to get started easily with the application.
The application uses embeded database and also the code has packaged into an executable file so you don't need to install any other dependencies.
Download it from [here](https://www.bridgends.com/download).

###### Install previous version
If you want to test the previous version of bridgends which is not suggested you need to do as the following.
Suppose we want to run bridgends on a front end developer's system and
there is an API on http://192.168.82.198:81/api/

 - `npm i bridgends -g`
 - `bridgends start -t http://192.168.82.198:81/ -p 4243`
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

###### CLI options

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

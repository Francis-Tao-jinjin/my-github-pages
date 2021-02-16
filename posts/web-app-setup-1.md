---
title: 'WebApp setup from scratch'
pic: '/images/web-app-setup-1/1.png'
keyword: 'React, Webpack, Nodejs'
description: 'Setup a web application from scratch without using create-react-app and webpack-cli. With CSS configuration so that the Tailwind can coexist with css module.'
date: '2019-02-23'
---

<div class='markdown'></div>

<h1 class="text-3xl font-medium mb-2 mt-3">How to setup a web application project on your own?</h1>

The repo of this blog is at <a class='text-blue-500' href="https://github.com/Francis-Tao-jinjin/web-app-setup/tree/stage-1">web-app-setup-stage-1</a>. You may want to read this article while reading the code.


When you Google how to create a react app, almost all the results you find will say, create a react app with 'create-react-app', and this is pretty much the same for angularjs and vuejs.


I find this situation is hard to say. I don't mean to say that these tools are bad, but on the contrary, create-react-app can save a lot of valuable time for someone who wants to quickly learn how to use Reactjs.


But in the real world of development, I believe very few people are using create-react-app to build their company's web applications. When you need to develop a complex project that integrates database, server and front-end, create-react-app feels like a toy.


In addition to this reason, it is also important for developers to have a general understanding of how the application is built. Otherwise, according to this trend, it is not surprising that a front-end developer end up only know html-related stuff.


Back to the point, let's start thinking how to setup a web application project.


Simply put, a web application requires at least one server and one clients, we can design the server to be very simple, for example, all it does is to return the html page and js and css file when user make a request. In our case, the server is written in nodejs, and the front end code is using React. In order to build React app, we also need webpack as build tool.


<h2 class="text-2xl font-medium mb-2 mt-3">Build Tool Setup</h2>

Let's get started.


1 . Create a folder and excute `npm init`, then create src folder.


2 . Inside 'src' folder, create 'app' folder and 'bin' folder. The 'app' folder will conatin all the code of frontend and the server. 'bin' folder will contain all the code that relate to build process.


Next, we are going to write our build tool and create a simple frontend entry file.


3 . install package, here are the packages we need at this step: 


<div class='preCodeBlock'></div>

```json
"@types/fs-extra": "^9.0.6",
"@types/node": "^10.14.6",
"@types/react": "^17.0.0",
"@types/react-dom": "^17.0.0",
"autoprefixer": "^9.8.6",
"css-loader": "^5.0.1",
"dotenv": "^8.2.0",
"fs-extra": "^9.1.0",
"postcss": "^7.0.35",
"mini-css-extract-plugin": "^0.8.0",
"postcss-color-function": "^4.0.1",
"postcss-loader": "^3.0.0",
"postcss-modules-values": "^3.0.0",
"postcss-px-to-viewport": "^0.0.3",
"react": "17.0.1",
"react-dom": "17.0.1",
"style-loader": "^2.0.0",
"ts-loader": "^8.0.15",
"ts-node": "^6.2.0",
"typescript": "~3.7.2",
"webpack": "4.42.1",
```

A short description, I write down the version of these package because packages like 'webpack', 'postcss-loader' and 'css-loader' need be some specific version to be compatible with each other. If you upgrade webpack or postcss-loader to the latest version, you will always find one or the other problem when you build the project. This situation is really terrible, which is why I think it's important to be able to create your own projects. Because you will know the details of each step are, and thus ensure the overall stability.


We have webpack installed, but not webpack-cli, because we will use our own nodejs script to call webapck to compile and package the app. You may wonder why we do this, because in practice we may want to perform some additional tasks before the code is compiled, or we may want to make additional changes to the compilation results during the webpack compilation process, in short, webpack may be only part of the compilation and packaging process, but not the whole thing. (Later, when we use IPFS in a project, IPFS will be greatly involved in the process of code compilation.)


under '/src/bin' folder, create this files:

<div class='preCodeBlock'></div>

```
bin
├── watch.ts
└── utils
    ├── paths.ts
    ├── watch-webpack.js
    ├── webpack-args.ts
    └── webpack.js
```

Now let's talk about the role of each file.


1 . `bin/watch.ts` is the entry file when we excute `npm run watch`, it takes the arguments we pass in from the command line, generates the webpack config with those arguments, and spawns a child-process to run `/bin/utils/watch-webpack.js`.


2 . `bin/utils/paths.ts` export the path name of directory such as 'build', 'public'.


3 . `bin/utils/webpack-args.ts` define the entryPoints of frontend code and environment info :

<div class='preCodeBlock'></div>

```typescript
export const WEBPACK_CONFIG = {
    'all': [{
            env: 'development',
            entryPoints: { app: './src/app/start-client.ts' },
        },
        {
            env: 'production',
            entryPoints: { app: './src/app/start-client.ts' },
    }],
    'dev': [{
            env: 'development',
            entryPoints: { app: './src/app/start-client.ts' },
    }],
    'prod': [{
            env: 'production',
            entryPoints: { app: './src/app/start-client.ts' },
    }],
};
```

The env and entryPoints data will be pass to webpack config builder. You may find the whole compilation process a bit complicated and unreasonable. However, if you have more than one front-end project in your project. Each project has its own development environment and production environment, then it becomes very convenient to be able to choose by entering commands in your terminal.


4 . `bin/utils/webpackpack.js` responsible for generating the webpack config object and exporting the functions that call webpack(configs).watch,


5 . `bin/utils/watch-webpack.js` call the watch function which exported from 'bin/utils/webpackpack.js'.


Then we need to focus on `bin/utils/webpackpack.js`. Because we are using typescript and react, we need to use `ts-node` in the module, since we are using css module, we also need use `MiniCssExtractPlugin`, `css-loader` and `postcss-loader`. Usually, we would set the localIdentName option in the css-loader so that the classname in the css file imported by the tsx module will be a unique string after compilation. However, for some third-party css frameworks, this will not work because the css code in those frameworks should not be modified and all the class name should be preserved. 
The most obvious example of this is <b>Tailwindcss</b>. I will talk more about how to install Tailwindcss correctly later.


Next, export the `watchWebpack` function, In this function, we manually call webapck.watch to compile and keep watch the file change.


This is what the function looks lik:

<div class='preCodeBlock'></div>

```typescript
async function watchWebpack(specs) {
    return new Promise((resolve, reject) => {
        const compiler = webpack(specs.map(getWebpackConfig));
        compiler.hooks.watchRun.tap('WatchReportChangePlugin', () => {
            logger.log(`webpack detected change...`);
        });
        compiler.hooks.invalid.tap('WatchReportChangePlugin', (fileName) => {
            logger.log(`webpack change detected to ${fileName}`);
        });
        const opts = {
            aggregateTimeout: 1000,
            poll: undefined,
            ignored: [],
        };
        let hasCompleted = false;
        compiler.watch(opts, (err, stats) => {
            if (err) {
                logger.error(`web pack error: ${err.message} ${err.stack}`);
                if (!hasCompleted) {
                    reject(err);
                    hasCompleted = true;
                }
                return;
            }
            if (!hasCompleted) {
                resolve();  
                hasCompleted = true;
            }
        });
    });
}
```

<h2 class="text-2xl font-medium mb-2 mt-3">Write Some Frontend Code</h2>

After setup the build tool, we can create some front-end code to test that our packaging tool is working properly. Under `/src/app`, let's create these file:

<div class='preCodeBlock'></div>

```
app
├── start-client.ts
├── client.tsx
└── frontend
    ├── index.tsx
    └── style.css
```

`start-client.ts` is the frontend entry file, `client.tsx` is the start point of React. `/frontend/index.tsx` is a simple React component for demonstrate whether the css module is working or not.

Code in `start-client.ts`:

<div class='preCodeBlock'></div>

```Typescript
import { FrontendClient } from './client';
import { LogLevel } from '../utils/logger';
import { createLogger } from './logger';

async function go() {
    const logger = createLogger({
        logLevel: LogLevel.DEBUG,
        logPrefixRegex: '',
    });
    const client = new FrontendClient({
        logger,
    });

    client.start();
}

go().catch((e) => {
    console.error('frontend client start error');
    console.error(e);
});
```
and this is the code in `client.tsx`

<div class='preCodeBlock'></div>

```Typescript
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Logger } from '../utils/logger';
import { FrontendUI } from './frontend';

export class FrontendClient {
    public logger:Logger;
    private rootDiv:HTMLDivElement;

    constructor(spec:{
        logger:Logger,
    }) {
        this.logger = spec.logger;
        this.rootDiv = document.createElement('div');
        this.rootDiv.style.left = '0';
        this.rootDiv.style.right = '0';
        document.body.appendChild(this.rootDiv);
    }

    public start() {
        this.render();
    }

    public render() {
        ReactDOM.render(
            <FrontendUI
                client={this}
            ></FrontendUI>,
            this.rootDiv,
        );
    }
}
```

The reason we use `start-client.ts` as entry file instead of '.tsx' file is, before we render the page, we may need to do some preparations, such as initializing the websocket, register RPC protocol or connect to the backend system.

After we setup the frontend code, we can try to compile the code with our build tool, add this line to your `package.json`'s scripts scope:

<div class='preCodeBlock'></div>

```
"watch": "TS_NODE_PROJECT=node.tsconfig.json ts-node src/bin/watch.ts"
```

Then, just type `npm run watch`, you should see some log about the compilation process are printed in the terminal. In few seconds, a 'build' folder will be created in the root directory, which contain the compiled files.

Now that we have configured webpack and ensured that the cssModule works,  let's see how to make tailwind work as well. Currently, the webpack conifg's module scope looks like this:

<div class='preCodeBlock'></div>

```Javascript
module: {
    rules: [
        {
            test: /\.tsx?$/,
            use: [
                {
                    loader: 'ts-loader',
                    options: {
                        configFile: path.join(ROOT, 'client.tsconfig.json'),
                    },
                },
            ],
            include: SRC,
        },
        {
            test: /\.css$/,
            include: SRC,
            use: [
                {
                    loader: MiniCssExtractPlugin.loader,
                },
                {
                    loader: 'css-loader',
                    options: {
                        modules: {
                            localIdentName: isDev
                                ? '[path][name]__[local]--[hash:base64:5]'
                                : '[hash:base64]',
                        },
                        importLoaders: 1,
                        url: false,
                    },
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        ident: 'postcss',
                        plugins: [
                            cssValues,
                            autoPrefixerPlugin,
                        ],
                    },
                },
            ],
        },
    ],
}
```

Noticed, in the options of `css-loader`, we have config the localIdentName, css Module have no problem with this, but it's not true with Tailwind css. We can think of tailwind css as a global css framework, all we need to do is to concat its css code to our final code without any modification. From the Tailwind Installation instruction, here are the thing we need to do:

1 . install package, once again, I will give the specific version. Since we already have autoprefixer installed, we don't need to install it agian.

<div class='preCodeBlock'></div>

```
"@tailwindcss/postcss7-compat": "^2.0.2",
"tailwindcss": "npm:@tailwindcss/postcss7-compat@^2.0.2",
```

2 . create `tailwind.config.js` and `postcss.config.js`, then fill them with these code:

<div class='preCodeBlock'></div>

```javascript
// tailwind.config.js
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

// postcss.config.js
module.exports = {
    plugins: [
        require('autoprefixer'),
        require('tailwindcss'),
    ],
};
```

Next, create `global.css` in `/src/app` folder and add these line:

<div class='preCodeBlock'></div>

```
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Then we need to change the webpack config a little bit, at this time, we need to test 'css' file twice, the first time we will skip `global.css`, the second time will only include `global.css`. So, we need to change config's module scope to this:

<div class='preCodeBlock'></div>

```javascript
module: {
    rules: [
        {
            test: /\.tsx?$/,
            use: [
                {
                    loader: 'ts-loader',
                    options: {
                        configFile: websiteTsConfig,
                    },
                },
            ],
            include: SRC,
        },
        {
            test: /\.css$/,
            include: SRC,
            use: [
                {
                    loader: MiniCssExtractPlugin.loader,
                },
                {
                    loader: 'css-loader',
                    options: {
                        modules: {
                            localIdentName: isDev
                                ? '[path][name]__[local]--[hash:base64:5]'
                                : '[hash:base64]',
                        },
                        importLoaders: 1,
                        url: false,
                    },
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        ident: 'postcss',
                        plugins: [
                            cssValues,
                            autoPrefixerPlugin,
                        ],
                    },
                },
            ],
            exclude: /(global.css)/,
        },
        {
            test: /\.css$/,
            include: /(global.css)/,
            use: [{
                loader: MiniCssExtractPlugin.loader,
                options: {
                    publicPath: '../',
                },
            },
            {
                loader: 'css-loader',
                options: {
                    modules: {
                        localIdentName: '[local]'
                    },
                    importLoaders: 1,
                    url: false,
                },
            },
            {
                loader: 'postcss-loader',
                options: {
                    ident: 'postcss',
                    plugins: [
                        tailwindcss('./tailwind.config.js'),
                        cssValues,
                        autoPrefixerPlugin,
                    ],
                },
            }],
        },
    ],
},
```

Now, the tailwind css will working.

<h2 class="text-2xl font-medium mb-2 mt-3">Server Setup</h2>

Finally, we come to the server.

1 . create these file under src folder:

<div class='preCodeBlock'></div>

```
src
├── app
│   └── start-server.ts
└── utils
    └── start-app
        ├── html-entry.ts
        └── server.ts
```

`start-server.ts` is the entry file of our nodejs server, `src/utils/server.ts` contain some helper function and `src/utils/html-entry.ts` is responsible for build the 'index.html' content.

First, install the package: `npm install ip`, then we add 'startServer' and 'createDefaultHttpHandler' function in the `src/utils/server.ts`.

<div class='preCodeBlock'></div>

```typescript
import http from 'http';
import ip from 'ip';
import url from 'url';

export type RouteHandler = (req:http.IncomingMessage, res:http.ServerResponse) => Promise<void>;
export type RouteHandlers = {[path:string]:RouteHandler};

export async function startServer(spec: {
    port:number;
    httpHandler:RouteHandler;
    start:(spec: {httpServer:http.Server}) => Promise<void>;
    logger:Logger;
}) {
    const logger = spec.logger;

    const httpServer = http.createServer(spec.httpHandler);

    await spec.start({httpServer});

    httpServer.listen(spec.port);
    const address = ip.address();
    const serverURL = `http://${address}:${spec.port}`;
    logger.log(`server address: ${serverURL}`);
}

export async function createDefaultHttpHandler(spec:{
    routes:RouteHandlers,
    logger:Logger,
    defaultRoute?:RouteHandler;
}) : Promise<RouteHandler> {
    let contentRouter;
    const routes = spec.routes;
    const logger = spec.logger || console;
    return async (req:http.IncomingMessage, res:http.ServerResponse) => {
        res.setHeader('Access-Control-Allow-Origin', req.headers && req.headers.origin || '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        if (!req.url) {
            res.writeHead(400);
            return res.end('url cannot be empty');
        }
        const { pathname } = url.parse(req.url);
        if (routes['/index.html'] && (!pathname || /^\/?(index\.html?)?$/.test(pathname))) {
            logger.debug('serving generated index');
            return await routes['/index.html'](req, res);
        }

        if (pathname) {
            let routeHandler = routes[pathname];
            if (!routeHandler) {
                const reg = pathname.match(/^\/[a-zA-Z0-9._]+/);
                if (reg) {
                    routeHandler = routes[reg[0]];
                }
            }
            if (routeHandler) {
                return await routeHandler(req, res);
            }
            if (pathname === '/healthCheck') {
                res.setHeader('Content-Type', 'application/json');
                res.end(`{status: "good"}`);
                return;
            }

            if (!pathname.match(/\.(js|css|html)$/) && spec.defaultRoute) {
                return await spec.defaultRoute(req, res);
            }
        }
        res.writeHead(400);
        res.end('resource not found');
    }
}
```

From the code above, you should already see that we are handling the routes directly through nodejs, rather than installing a toolkit such as express. The fact is, in most of the cases, we don't need to install express at all. It is not complicated to write a routing logic directly with nodejs. 

In the `start-server.ts`, we add routes `/bundle.js`, `/bundle.css` and `/index.html`, we also need to create routes to handle static file request and bad request.

<div class='preCodeBlock'></div>

```Typescript
import fs from 'fs';
import http from 'http';
import url from 'url';
import util from 'util';
import { config } from './config';
import * as PATHS from '../bin/utils/paths';
import { startServer, createDefaultHttpHandler, RouteHandlers } from '../utils/start-app/server';
import { htmlEntry } from '../utils/start-app/html-entry';

async function go() {
    function getHtml(res:http.ServerResponse, htmlSpec?:object) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Cache-Control': 'private, no-cache, no-store, must-revalidate',
            'Expire': '-1',
            'Pragma': 'no-cache',
        });
        res.end(Buffer.from(htmlEntry({
            title: ...,
            description: ...,
            cssBundle: '/bundle.css',
            jsBundle: '/bundle.js',
            manifest: true,
            viewPort: '',
            bodyHtml: '',
            headHtml: '',
        }), 'utf8'));
    }

    const routes:RouteHandlers = {
        '/bundle.js': async (req:http.IncomingMessage, res:http.ServerResponse) => {
            res.writeHead(200, {
                'Content-Type': 'text/javascript',
                'Cache-Control': 'private, no-cache, no-store, must-revalidate',
                'Expire': '-1',
                'Pragma': 'no-cache',
            });
            fs.createReadStream(PATHS.FRONTEND_JS).pipe(res);
            return;
        },
        '/bundle.css': async (req, res) => {
            res.writeHead(200, {
                'Content-Type': 'text/css',
                'Cache-Control': 'private, no-cache, no-store, must-revalidate',
                'Expire': '-1',
                'Pragma': 'no-cache',
            });
            fs.createReadStream(PATHS.FRONTEND_CSS).pipe(res);
            return;
        },
        '/index.html': async (req, res) => getHtml(res),
    };

    const logger = createLogger({
        logLevel: config.logLevel,
        logPrefixRegex: config.logPrefixRegex,
    });

    await startServer({
        port: config.port,
        env: config.env,
        development: config.env === 'development',
        logger,
        httpHandler: await createDefaultHttpHandler({
            development: config.env === 'development',
            routes,
            logger,
            defaultRoute: async (req:http.IncomingMessage, res:http.ServerResponse) => {
                if (!req.url) {
                    res.writeHead(400);
                    return res.end('url cannot be empty');
                }
                const { pathname } = url.parse(req.url);
                const publicStaticFile = PATHS.PUBLIC + pathname;
                const stats = await util.promisify(fs.stat)(publicStaticFile).catch((error) => {
                    logger.error(error);
                    res.writeHead(400);
                    res.end('resource not found');
                    return;
                });

                if (stats && stats.isFile()) {
                    fs.createReadStream(publicStaticFile).pipe(res);
                    return;
                }
                return;
            },
        }),
        start: async () => {
        },
    });
}

go().catch((e) => {
    console.error('start server error');
    console.error(e);
});
```

In order to run the server, add `"start": "TS_NODE_PROJECT=node.tsconfig.json ts-node src/app/start-server.ts"` to your package.json, then type `npm start`.

Now, your app is running!
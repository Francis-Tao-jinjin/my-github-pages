---
title: 'Thinking In RPC'
pic: '/images/thinking-in-rpc/rpc.png'
keyword: 'Remote Procedure Calls, NodeJs'
description: 'Ever since the Nodejs take a place in a server-side language, adopt the RPC pattern for designing the client-server API may be a very interesting approach.'
date: '2019-08-01'
---

<div class='markdown'></div>

# Remote Procedure Calls

Today, whenever we think about how to implement client-server interaction, REST API is the pattern that always come first. Well, although it is tried and true, it is not the only pattern we can use. Before REST API become popular,  RPC has been used in various situations. Ever since the Nodejs take a place in a server-side language, adopt the RPC pattern for designing the client-server API may be a very interesting approach.

Before we go further into this, we need to understand what is RPC, and why it is different from REST API as well as we shouldn't use the rule of the REST to judge the RPC.

Remote Procedure Call (RPC) is a protocol that one program can use to request a service from a program localted in another computer on a network without having to understand the network's details.

* However, because we are dealing with an environment in which the processes are excuting on separate systems, we must use a **message based communication scheme** to provide remote service.
* The RPC system hides the details that allow communication to take place by providing a stub on the client side.
* Typically, a sparate stub exist for each separate remote procedure.
* When the client invokes a remote procedure, the RPC system call the approriate stub, passing it the parameters provided to the remote procudure. This stub locates the port ont the server and marshals the parameters.
* Parameter marshalling involves packaging the parameters into a form that can be transmitted over a network.
* The stub then transmits a message to the server using message passing.
* A similar stub on the server side receives this message and invokes the procedure on the server.
* If necessary, return values are passed back to the client using the same technique.

The REST API, in contrast, models the various entities within the problem domain as resources, and uses HTTP verbs to represent transactions against these resources - POST to create, PUT to update, and GET to read. All of these verbs, invoked on the same URL, provide different functionality. Common HTTP return codes are used to convey status of the requests.

* REST must be stateless: not persisting sessions between requests.
* Responses should declare cacheablility: helps your API scale if clients respect the rules.
* REST focuses on uniformity: if you’re using HTTP you should utilize HTTP features whenever possible, instead of inventing conventions.

In short, RPC treats the client's request to the server as a call to a remote function while REST API see it as an acquisition of resources.

## Remote and Async

This is the moment when JavaScript become really handy. The ability of handling async function is simply inside JavaScript's veins. While in RPC, what we need to achieve just a little bit different, that we need to hide all the detail of making http request and turn the remote function invoke looks like call a local async function.

### Design the architecture

**protocol**

A protocol is the description of the api between a client and a server. You can define multiple different protocols in your application for different functionalities, with equal number of client-server pairs each dedicated to one of the protocols.

**client/server**

All communications are initiated by client. Client calls, server executes. Client can only communicate with server through the api defined by the protocol, which means they both need to "understand" the same protocol.

**transport**

Client and server take care of invocation and execution, while transport takes care of message passing. Transports are protocol-agnostic. It means different servers can share the same server transport. Similarly, different clients can share one client transport.

Ok, finished talking, let's try to build a real RPC library, we also gonna write a simple demo program to show how to use this library. You can checkout out [this repo](https://github.com/Francis-Tao-jinjin/web-app-setup/tree/rpc) to see the final code. The project is setup base on the [WebApp setup from scratch](https://francis-tao-jinjin.github.io/posts/web-app-setup-1).

### Protocol

In this project, we are using *mudb/muSchema* and *TypeScript*. First, we gonna define the type/interface for the RPC protocol, which contain all the api information. The api data could be as simple as a key value table.

```TypeScript
export type RPCTableEntry<ArgsSchema extends MuSchema<any>, ReturnSchema extends MuSchema<any>> = {
    arg:ArgsSchema;
    reg:ReturnSchema;
};

export type RPCTable = {
    [method:string]:RPCTableEntry<any, any>;
};

export type RPCProtocol<AnyRPCTable extends RPCTable> = {
    name:string;
    api:AnyRPCTable;
};
```

For each protocol object, it will need a unique name and an API object which list all the basic info of the remote function. The unique protocol name, in this case, can be seen as something like a namespace and will also be used in URL path.

Here is code show how to create a actual protocol object accroding to the type definitation.

```TypeScript
import { MuUTF8, MuStruct, MuFloat64, MuVoid } from 'mudb/src/schema';

export const CaculatorRPCSchema = {
    name: 'caculator-service',
    api: {
        hello: {
            arg: new MuVoid(),
            ret: new MuUTF8(),
        },
        add: {
            arg: new MuStruct({
                a: new MuFloat64(),
                b: new MuFloat64(),
            }),
            ret: new MuFloat64(),
        },
        ...
    }
}
```

After we have define the protocol, we need a helper class that let both server and client understand the protocol:

```TypeScript
export class RPCSchemas<Protocol extends RPCProtocol<any>> {
    public errorSchema = new MuUTF8();
    public tokenSchema = new Muvarint();

    public argSchema:MuUnion<{
        [key in keyof Protocol['api']]:Protocol['api']['arg'];
    }>;

    public retSchema:MuUnion<{
        [key in keyof Protocol['api']]:Protocol['api']['ret'];
    }>;

    public responseSchema:MuUnion<{
        success:RPCSchemas<Protocol>['retSchema'];
        error:RPCSchemas<Protocol>['errorSchema'];
    }>;

    constructor(public protocol:Protocol) {
        const argTable:any = {};
        const retTable:any = {};
        const methods = Object.keys(protocol.api);
        for (let i = 0; i < methods.length; i++>) {
            const m = methods[i];
            const s = protocol.api[m];
            argTable[m] = s.arg;
            retTable[m] = s.ret;
        }
        this.argSchema = new MuUnion(argTable);
        this.retSchema = new MuUnion(retTable);

        this.responseSchema = new MuUnion({
            success: this.retSchema,
            error: this.errorSchema,
        });
    }
}
```

### Transport

Before we start implementing the stubs for both client and server, we need to figure out how to implement the transport layer. The transport layer on the Client-side is responsible for sending the HTTP request and sending the response on the Server-side. We already know the Browser is the client in our web app, but we also need to consider the case both client and server could be Nodejs Server.

For browser client, we can use XHR to implement the transport layer, for NodeJs client, `http` module can do what XHR does. We will only use `POST` method, pack the name of the remote function and arguments required by those functions into the body of the request object.

```TypeScript
// Browser Client
import { RPCClientTransport, RPCProtocol, RPCSchemas } from '../protocol';

export class RPCHttpClientTransport implements RPCClientTransport<any> {
    private _url:string;
    private _timeout:string;

    constructor(spec:{
        url:string,
        timeout:number,
    }) {
        this._url = spec.url;
        this._timeout = spec.timeout;
    }

    public send<Protocol extends RPCProtocol<any>> (
        schemas:RPCSchemas<Protocol>,
        arg:RPCSchemas<Protocol>['argSchema']['identity'],
    ) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', this._url + '/' + schemas.protocol.name, true);
        xhr.responseType = '';
        if (this._timeout < Infinity && this._timeout>) {
            xhr.timeout = this._timeout;
        }
        xhr.withCredentials = true;
        const body = JSON.stringify(schemas.argSchema.toJSON(arg));
        return new Promise<RPCSchemas<Protocol>['responseSchema']['identity']>((resolve, reject) => {
            let completed = false;
            xhr.onreadystatechange = () => {
                if (completed) {
                    return;
                }
                const readyState = xhr.readyState;
                if (readyState === 4) {
                    completed = true;
                    const responseText = xhr.responseText;
                    try {
                        let json:any;
                        if (0 < responseText.length) {
                            json = JSON.parse(responseText);
                        } else {
                            json = {
                                type: 'error',
                                data: 'empty response',
                            };
                        }
                        return resolve(schemas.responseSchema.fromJSON(json));
                    } catch (e) {
                        return reject(e);
                    }
                };
            }
            xhr.onabort = () => {
                if (completed) {
                    return;
                }
                reject(`request aborted [mudb/rpc]`);
            };
            xhr.onerror = () => {
                if (completed) {
                    return;
                }
                reject(`error during request [mudb/rpc]`);
            }
            xhr.send(body);
            console.log('xhr has send the body', body);
        });
    }
}
```

As for the transport layer on server-side, it need to listen to the incoming request and handle it. The listen method is called by the RPC-server at its constructor, while the handler method is called in the Nodejs Route handler.

```TypeScript
export class RPCHttpServerTransport {
    ...
    ...
    public listen<Protocol extends RPCProtocol<any>> (
        schemas:RPCSchemas<Protocol>,
        auth:(conn:RPCHttpConnection) => Promise<boolean>,
        recv:(conn:RPCHttpConnection, arg:RPCSchemas<Protocol>['argSchema']['identity'], response:RPCSchemas<Protocol>['responseSchema']['identity']) => void,
    ) {
        this._handlers[schemas.protocol.name] = {
            schemas,
            auth,
            recv: <any>recv,
        };
    }

    public handler = async (
        request:http.IncomingMessage,
        response:http.ServerResponse,
    ) => {
        const method = request.method;
        if (method !== 'post' && method !== 'POST') {
            return false;
        }
        const url = request.url;
        if (!url || !url.startsWith(this._route)) {
            return false;
        }
        const suffix = url.substr(this._route.length);
        const handler = this._handlers[suffix];
        if (!handler) {
            return false;
        }
        const ret = handler.schemas.responseSchema.alloc();
        const length = parseInt(request.headers['content-length'] || '', 10) || 0;
        ...
        ...
        // receive and decode stream data
        const body = await getRawBody(request, length);

        const bodyStr = body.toString('utf8');
        let bodyJSON:any = void 0;
        if (bodyStr.length > 0) {
            bodyJSON = JSON.parse(bodyStr);
        }
        const arg = handler.schemas.argSchema.fromJSON(bodyJSON);
        await handler.recv(
            ...,
            arg,
            ret,
        );
        ...
        ...

        response.statusCode = ret.type === 'success' ? 200 : 400;
        ...
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        response.end(JSON.stringify(handler.schemas.responseSchema.toJSON(ret)));
        handler.schemas.responseSchema.free(ret);
        return true;
    }
}
```

### RPC client and server

For RPCClient, all it does is take the protocol object and transport instance to initiates invocations to procedures of the corresponding server. 

```TypeScript
import { MuSchema } from 'mudb/src/schema';
import { RPCProtocol, RPCSchemas, RPCClientTransport } from './protocol';

export class RPCClient<Protocol extends RPCProtocol<any>> {
    public api:{
        [method in keyof Protocol['api']]:
            (arg:Protocol['api'][method]['arg']['identity']) =>
                Promise<Protocol['api'][method]['ret']['identity']>;
    };

    public schemas:RPCSchemas<Protocol>;
    public transport:RPCClientTransport<Protocol>;

    private _handleResponse = (response:any) => {
        const { type, data } = response;
        response.type = 'error';
        response.data = '';
        this.schemas.responseSchema.free(response);
        if (type === 'success') {
            return data.data;
        } else {
            console.error('RPCClient error', data);
            throw data;
        }
    }

    private _createRPC (method:keyof Protocol['api']) {
        return (arg:MuSchema<any>) => {
            const rpc = this.schemas.argSchema.alloc();
            rpc.type = method;
            rpc.data = arg;
            console.log('method:', method);
            return this.transport.send(this.schemas, rpc).then(
                this._handleResponse,
                (reason) => {
                    console.error('RPCClient error', reason);
                },
            );
        };
    }

    constructor (
        protocol:Protocol,
        transport:RPCClientTransport<Protocol>,
    ) {
        this.schemas = new RPCSchemas(protocol);
        this.transport = transport;
        const api = this.api = <any>{};
        const methods = Object.keys(protocol.api);
        for (let i = 0; i < methods.length; i++) {
            const method = methods[i];
            api[method] = this._createRPC(method);
        }
    }
}
```

In RPCServer, the actual remote function will be executed.

```TypeScript
export class RPCServer {
    public schemas;
    public transport;

     constructor (spec:{
        protocol:Protocol,
        transport:RPCServerTransport<Protocol, Connection>,
        ...
        // the handler contain the actual remote function that client want to invoke
        handlers: {
            ...
        },
    }) {
        const schemas = this.schemas = new RPCSchemas(spec.protocol);
        this.transport = spec.transport;
        this.transport.listen(
            schemas,
            async (conn, arg, response) => {
                try {
                    const method = <any>arg.type;
                    const handler = spec.handlers[method];
                    if (!handler) {
                        console.error(`invalid rpc method: ${method}`);
                        response.type = 'error';
                        response.data = `invalid rpc method: ${method}`;
                    } else {
                        const retSchema = schemas.protocol.api[method].ret;
                        if (handler.length === 3) {
                            const ret = retSchema.alloc();
                            const actualRet = await handler(conn, arg.data, ret);
                            response.type = 'success';
                            const retInfo = response.data = schemas.retSchema.alloc();
                            retInfo.type = method;
                            if (ret === actualRet) {
                                retInfo.data = ret;
                            } else {
                                console.log(`warning, handler for ${method} did not use storage for return type`);
                                retSchema.free(ret);
                                retInfo.data = actualRet;
                            }
                        } else {
                            // if user doesn't take storage as an argument, then we just leak the response reference
                            const ret = await handler(conn, arg.data, <any>undefined);
                            response.type = 'success';
                            const retInfo = response.data = schemas.retSchema.alloc();
                            retInfo.type = method;
                            retInfo.data = retSchema.clone(ret);
                        }
                    }
                } catch (e) {
                    response.type = 'error';
                    if (e instanceof Error && e.message) {
                        response.data = e.message;
                    } else {
                        response.data = e;
                    }
                }
            }
        );
    }
}
```

## Real Demo

In the code of [this repo](https://github.com/Francis-Tao-jinjin/web-app-setup/tree/rpc),  go to the `/src/app/service`, you can see all the files related to RPC API, in the 'calculator-protocol.ts', the RPC calculator API is defined, in the calculator-server.ts, you can find the actual function that does the corresponding basic math calculation. In the `src/app/frontend/index.tsx`, the result of the calculator is obtained by calling the method in the RPCClient's stub.

```TypeScript
export function FrontendUI (props:{
    client:FrontendClient,
}) {
    ...
    ...
    return (
        <div>
            ...
            
            <Equation
                symbol={'+'}
                cal={(a:number, b:number) => {
                    // this function call return a promise object,
                    // which will return the response from the remote function on server

                    return props.client.rpc.caculator.api.add({a, b});
                }}
            ></Equation>
            ...
        </div>
    );
}
```

As for the server of this demo, all you need to notice is where the  RPC Server's transport gonna be. It need to be in the place that can handle the http request, typically, in the call back function of the http.createServer. In the `src/app/start-server.ts`, you can see I put that line inside the handler of defaultRoute

```TypeScript
const success = await transport.handler(req, res);
```

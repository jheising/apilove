#apilove

A no-nonsense framework for creating server(less) APIs in TypeScript — api♥︎

## features

### decorators
TypeScript decorators make building routes, parameters, and validation a breeze (don't worry, you still have access to all of the underlying raw express.js req, res objects if you want them).

```typescript
export class SampleAPI extends APIBase {
    
    @APIEndpoint({path: "/foo"})
    fooX(@APIParameter({default: "bar"}) what: string, req?, res?): Promise<any> {

        return new Promise<any>((resolve, reject) => {
            resolve(`foo ${what}`);
        });

    }
}
```

### server(less)
Your API code will run seamlessly both as an API Gateway/Lambda combo or a standard express.js server— apilove automatically determines the environment it's running in and configures itself accordingly.

```typescript
// This is the only code that is required to run your API.
// When running on Lambda, this acts as your handler to an API Gateway proxy request.
// When running on a server, this acts as your express.js server.
module.exports.handler = APILove.start({
    apis:[
        {
            require: "./SampleAPI"
        }
    ]
});
```

### lazy loading
APIs can be split into smaller chunks and loaded on demand— this can cut down drastically on memory requirements for Lambda functions by only loading the parts of your API that are needed for a given request.

### endpoints are functions
If you use the supplied TypeScript decorators your API handler functions look just like standard functions (because they are).

```typescript
// Useful for testing and/or using your API like a library without the overhead of a web server.
let sapi = new SampleAPI();
sapi.fooX("bar")
    .then((data) => {
        console.log(data);
    }).catch((error) => {
        console.error(error);
    });
```

### deploy-joy
We include a sample serverless.yml configuration which allows you to fully deploy your API to AWS with [serverless](https://serverless.com/) in a few keystrokes.

`> serverless deploy`

### handy services
We include some standard service libraries that make building APIs even easier:

- Key-Value Storage: A generic key-value storage service (with TTL) that will store values in memory while in development, but can/will automatically switch to DynamoDB when deployed to AWS.
- More coming soon.

## docs

### building your api
An apilove API is simply any TypeScript class which extends the `APIBase` class, and decorated methods that return a Promise.

```typescript
import {APIBase, APIEndpoint, APIParameter} from "apilove";

export class SampleAPI extends APIBase {

    @APIEndpoint({path: "/foo"})
    simple(what: string): Promise<any> {

        return new Promise<any>((resolve, reject) => {
            resolve(`foo ${what}`);
        });
    }
}
```

In the above example, apilove will call this function any time a GET request is made to your API at `http://myapi.com/foo`. It will also expect a parameter called `what` to be sent in some form or another (more on parameters later).

#### @APIEndpoint decorator
```typescript
@APIEndpoint(options: APIEndpointOptions)

interface APIEndpointOptions {
    // The method to be used when requesting this endpoint. Defaults to "get".
    method?: string;
    
    // The path to reach this endpoint. Defaults to "/".
    path?: string;
    
    // Any express.js middleware functions you want to be executed before invoking this method. Useful for things like authentication.
    middleware?: Function[];
}
```

### api parameters

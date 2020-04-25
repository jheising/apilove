# apilove

(still a work in progress)

A no-nonsense framework for creating server(less) APIs in TypeScript — api♥︎

## features

### decorators
TypeScript decorators make building routes, parameters, and validation a breeze (don't worry, you still have access to all of the underlying raw express.js req, res objects if you want them).

```typescript
export class SampleAPI {
    
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

- Key-Value Storage: A generic key-value storage service (with TTL) that will store values in memory or disk while in development, but can/will automatically switch to DynamoDB when deployed to AWS.
- File Storage: A generic file storage service that will allow you store files on local disk or on S3 with the flip of an environment variable

## docs

### building your api
An apilove API is simply any TypeScript class with decorated methods that return a Promise.

```typescript
import {APIEndpoint, APIParameter} from "apilove";

export class SampleAPI {

    @APIEndpoint({path: "/foo"})
    simple(what: string): Promise<any> {

        return new Promise<any>((resolve, reject) => {
            resolve(`foo ${what}`);
        });
    }
}
```

In the above example, apilove will call this method any time a GET request is made to your API at `http://myapi.com/foo`. It will also expect a parameter called `what` to be sent in some form or another (more on parameters later).

#### @APIEndpoint decorator
```typescript
@APIEndpoint(options: APIEndpointOptions)

interface APIEndpointOptions {
    // The method to be used when requesting this endpoint. Defaults to "get".
    method?: string;

    // The path to reach this endpoint. Defaults to "/".
    path?: string;

    // Any express.js middleware functions you want to be executed before invoking this method. Useful for things like authentication.
    middleware?: ((req, res, next?) => void)[] | ((req, res, next) => void);

    // Turn this on if you want to return data as-is and not in HAPI format
    disableFriendlyResponse?:boolean;

    // Specify a function here to handle the response yourself
    successResponse?: (responseData:any, res) => void;

    // If set to true, a valid JWT must be present in the request, otherwise a 401 error will be thrown
    requireAuthentication?:boolean;
}
```

### api parameters
apilove has powerful automatic validation and type conversion capabilities so you never have to worry (or worry less) about parsing and validating data coming to your API.

Here is a little bit about how api parameters are mapped to your method:

1. apilove scans the names and type declarations in your method and looks for a corresponding value in the incoming API request.
1. The incoming API request is scanned for a parameter to match your method parameter in the following order:
    1. A path parameter, like `/foo/:what` with the same name
    1. A query parameter, like `?what=bar` wtih the same name
    1. A body parameter specified in either JSON or form values
    1. A cookie with the same name
    1. A header with the same name
1. By default, if no value can be found an error is automatically returned to the API caller and the method is not called.
1. If a value is found, apilove will try its best to convert it to the proper type you've declared. If it can't be converted to the proper type, a validation error will be returned to the API caller.
1. If the all of the parameters are found and properly validated, apilove will call your method just like normal.
1. All of this functionality can be modified with an `@APIParameter` decorator on your method property.

For example:
```typescript
@APIEndpoint({
    method: "POST",
    path: "/foo/:what"
})
fooX(
    what: string, // This will be retrieved as a string from the URL
    @APIParameter({sources: "body"}) data // The body will be parsed and sent back here
): Promise<any> {

    return new Promise<any>((resolve, reject) => {
        resolve(`foo ${what} with some ${data}`);
    });

}
```

#### @APIParameter decorator
```typescript
@APIParameter(options: APIParameterOptions)

interface APIParameterOptions {

    /**
     * If set to true, an error will not be thrown to the API caller if the value is not sent
     */
    optional?: boolean;

    /**
     * A default value to be used if one can't be found. This would be an equivalent shortcut for setting optional=true and providing a default value for your method property
     */
    defaultValue?: any;

    /**
     * A synchronous function that can be used to transform an incoming parameter into something else. Can also be used as validation by throwing an error.
     * You also get access to the raw express.js req object if you want it.
     */
    processor?: (value: any, req?) => any;

    /**
     * One or more sources from which to look for this value. This is basically a path in the req object. So for example, a value of `query` would be equivalent to `req.query[myParamName]`
     * Multiple values can be defined, and whichever one results in a non-null value first will be used. Defaults to ["params", "query", "body", "cookie", "headers"].
     */
    sources?: string[] | string;

    /**
     * If set to true, the entire source will be returned instead of looking for a particular value. Defaults to false.
     *
     * Examples:
     *
     * The following would look for something named `userData` in the query params and return that.
     * @APIParameter({sources:["query"]})
     * userData:string
     *
     * The following would take all the query params and return them as an object
     * @APIParameter({sources:["query"], includeFullSource:true})
     * userData:{[paramName:string] : any}
     */
    includeFullSource?: boolean;

    /**
     * This is the raw name of the parameter to look for in cases where the name can't be represented as a valid javascript variable name.
     * Examples usages might be when looking for a header like "content-type" or a parameter named "function"
     */
    rawName?: string;
}
```

#### redirects
If you'd like to redirect the response, simply pass a `URL` object back to the `resolve` callback.

#### accessing the raw express.js request and response
While it's generally discouraged (because it may break the ability to call your method like a regular function), you can also gain access to the raw request and response objects by appending them to your method parameters.

If the last two parameters in your method have the name "req", "res", "request" or "response" apilove will send them to you.

```typescript
@APIEndpoint({
    method: "POST",
    path: "/foo/:what"
})
fooX(
    what: string, // This will be retrieved as a string from the URL
    @APIParameter({sources: "body"}) data:any, // The body will be parsed and sent back here
    req?, // Access the raw express.js request
    res? // Access the raw express.js response
): Promise<any> {

    return new Promise<any>((resolve, reject) => {
        resolve(`foo ${what} with some ${data}`);
    });

}
```

### configuring your API
apilove has many configuration options you can modify at any time using environment variables. See the [./lib/APIConfig.ts](./lib/APIConfig.ts) file for more documentation on what you can configure.

### starting your API
Once you've defined one or more API classes it's time to expose them to the Internets! With apilove it's as simple as this:

```typescript
import {APILove} from "apilove";

// Assign the output to an export named "handler". You can point your API Gateway/Lambda combo to this handler
// and apilove will take care of the rest.
// If apilove detects that it's not running in a Lambda function, it will instead spawn an express.js server.
module.exports.handler = APILove.start({
    apis: [
        {
            require: "./SampleAPI"
        }
    ]
});
```

Why do we pass a path to our API code instead of passing an instance? Because apilove will lazy-load your API only when it needs it.

This feature becomes important when you run large APIs on Lambda— because Lambda functions are ephemeral you aren't using precious memory and CPU resources for API endpoints that aren't needed for a given request. 

#### APILove.start options
```typescript
interface APILoveOptions {

    // One or more APIs to allow apilove to load. Remember these are lazy-loaded.
    apis?: APILoaderDefinition[];

    // By default cookieParser and bodyParser will be loaded. You can set this to false to prevent those from loading. Defaults to true.
    loadStandardMiddleware?: boolean;

    // Any other express.js middleware you want loaded before requests make it to apilove.
    middleware?: [];
    
    // Override default express.js and APILove error handling
    defaultErrorHandler?: (error, req, res, next) => void;
    
    // This can be used to provide a default output for all requests. Useful to return a 404 or other default page.
    defaultRouteHandler?: (req, res) => void;
}

interface APILoaderDefinition {
    
    // The root path to the API endpoint. For example you could specify "/v1" and all endpoints in this API will now be under that root path. Defaults to "/"
    apiPath?: string;
    
    // The path to the code for your API. It should work similarly to the standard node.js require function.
    require: string;
    
    // By default apilove will look for a class or module with the same name as the source file (i.e. MyAPI.js would look for an exported module called "MyAPI").
    // You can override this functionality by specifying another name here.
    moduleName?: string;
}
```

### getting started
The quickest way to get started is:

1. Copy all of the files in the [./example](./example) directory to your root project.
1. Create your API code.
1. Modify [APIHandler.ts](./example/APIHandler.ts) to load your APIs.
1. Run and/or debug APIHandler.js (assuming you've compiled your TypeScript) on your local machine (or even deploy to a server).

**Note: You must enable the emitDecoratorMetadata option in your typescript config (tsconfig.json)**

```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true
  }
}
```

### deployment
Deploying apilove APIs with [serverless](https://serverless.com/) is a breeze. We've included a sample server.yml file in [./example/serverless.yml](./example/serverless.yml).

Assuming you've followed the instructions in the previous "getting started" section, simply:

1. Install [serverless](https://serverless.com/) — `npm install -g serverless`.
1. Modify the [APIDeploymentConfig.json](./example/APIDeploymentConfig.json) file with your particular settings.
1. Modify the [serverless.yml](./example/serverless.yml) file if you want, but it should mostly work out of the box. (See the file for comments on using the DynamoDB key-value service)
1. Run `serverless deploy --stage dev` or `sls deploy --stage prod`. You may also need to specify an AWSCLI credential profile with the `--profile myprofile` switch.

That's all there is to it!
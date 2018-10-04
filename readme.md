# apilove

(still a work in progress)

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
    middleware?: Function[];
}
```

### api parameters
apilove has powerful automatic validation and type conversion capabilities so you never have to worry (or worry less) about parsing and validating data coming to your API.

Here is a little bit about how api parameters are mapped to your method:

1. apilove scans the names and type declarations in your method and looks for a corresponding value in the incoming API request.
1. The incoming API request is scanned for a parameter to match your method parameter in the following order:
    1. A path parameter, like `/foo/:what` with the same name
    1. A query parameter, like `?what=bar` wtih the same name
    1. The body of the request. If sent in JSON or application/x-www-form-urlencoded it will be converted to an object. If this is specified, it will override all others.
    1. A cookie with the same name
    1. A header with the same name
1. By default, if no value can be found an error is automatically returned to the API caller and the method is not called.
1. If a value is found, apilove will try its best to convert it to the proper type you've declared. If it can't be converted to the proper type, a validation error will be returned to the API caller.
1. If the all of the parameters are found and properly validated, apilove will call your method just like normal.
1. All of this functionality can be modified with an `@APIParameter` decorator on your method property.

#### @APIParameter decorator
```typescript
@APIParameter(options: APIParameterOptions)

type APIParameterSource =
    "param" | // Parameters in the URL, like /foo/:bar
    "query" | // Query parameters in the URL, like /foo?what=bar
    "body" | // The full body. If sent in JSON or application/x-www-form-urlencoded it will be converted to an object. If this is specified, it will override all others.
    "cookie" | // Cookies
    "header" | // Headers
    "any"; // All of the above (except for body)

interface APIParameterOptions {

    // If set to true, an error will not be thrown if the value is not sent
    optional?: boolean;

    // A default value to be used if one can't be found. This would be an equivalent shortcut for setting optional=true and providing a default value for your method property
    default?: any;

    // A synchronous function that can be used to transform an incoming parameter into something else. Can also be used as validation by throwing an error.
    // You also get access to the raw express.js req object if you want it.
    processor?: (value: any, req?) => any;

    // One or more sources from which to look for this value. "any" is the default value
    sources?: APIParameterSource | APIParameterSource[];

    // This is the raw name of the parameter to look for in cases where the name can't be represented as a valid javascript variable name.
    // Examples usages might be when looking for a header like "content-type" or a parameter named "function"
    rawName?: string;
}
```
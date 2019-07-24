import {APIEndpoint, APIParameter} from "../APILove";

export class SampleAPI {

    @APIEndpoint({
        method: "POST",
        path: "/foo/:what"
    })
    static staticFunc(
        what: string, // This will be retrieved as a string from the URL
        @APIParameter({
            optional: true
        })
        data:any, // The body will be parsed and sent back here
        req?, // Access the raw express.js request
        res? // Access the raw express.js response
    ): Promise<any> {

        return new Promise<any>((resolve, reject) => {
            resolve(data);
        });
    }

    @APIEndpoint({
        method: "POST",
        path: "/foo/:what"
    })
    instanceFunc(
        @APIParameter({
            optional: true
        })
        what: string, // This will be retrieved as a string from the URL
        data:any, // The body will be parsed and sent back here
        req?, // Access the raw express.js request
        res? // Access the raw express.js response
    ): Promise<any> {

        return new Promise<any>((resolve, reject) => {
            resolve(data);
        });
    }
}
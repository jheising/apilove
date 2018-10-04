import {APIBase, APIEndpoint, APIParameter} from "../APILove";

export class SampleAPI extends APIBase {

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
}
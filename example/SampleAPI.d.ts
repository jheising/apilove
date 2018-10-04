import { APIBase } from "../APILove";
export declare class SampleAPI extends APIBase {
    fooX(what: string, // This will be retrieved as a string from the URL
    data: any, // The body will be parsed and sent back here
    req?: any, // Access the raw express.js request
    res?: any): Promise<any>;
}

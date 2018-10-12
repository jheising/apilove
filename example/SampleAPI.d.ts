export declare class SampleAPI {
    blah: string;
    static staticFunc(what: string, // This will be retrieved as a string from the URL
    data: any, // The body will be parsed and sent back here
    req?: any, // Access the raw express.js request
    res?: any): Promise<any>;
    instanceFunc(what: string, // This will be retrieved as a string from the URL
    data: any, // The body will be parsed and sent back here
    req?: any, // Access the raw express.js request
    res?: any): Promise<any>;
}

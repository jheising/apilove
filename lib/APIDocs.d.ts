import { APIDocsOptions, APIEndpointDocsOptions, APILoveDocsOptions, APILoveOptions } from "../APILove";
export interface APIEndpointDocData {
    overview: APIEndpointDocsOptions;
    method: string;
    path: string;
}
export interface APIDocData {
    overview: APIDocsOptions;
    path: string;
    endpoints: APIEndpointDocData[];
}
export interface APILoveDocData {
    overview: APILoveDocsOptions;
    apis: APIDocData[];
}
export declare class APIDocs {
    static getAPIDocData(options: APILoveOptions): APILoveDocData;
    static renderDocs(req: any, res: any): Promise<void>;
}

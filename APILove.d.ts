export declare type APILoaderDefinition = {
    apiPath?: string;
    require: string;
    className?: string;
};
export interface APILoveOptions {
    serviceName: string;
    apis: APILoaderDefinition[];
    middlewear?: [];
}
export declare class APILove {
    private static _loadAPI;
    static start(options: APILoveOptions): any;
}
export * from "./lib/APIBase";
export * from "./lib/APIConfig";
export * from "./lib/Services/Config";

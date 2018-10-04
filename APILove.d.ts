export interface APILoaderDefinition {
    apiPath?: string;
    require: string;
    moduleName?: string;
}
export interface APILoveOptions {
    apis?: APILoaderDefinition[];
    middleware?: [];
}
export declare class APILove {
    private static _loadAPI;
    static start(options: APILoveOptions): any;
}
export * from "./lib/APIBase";
export * from "./lib/APIConfig";
export * from "./lib/Services/Config";

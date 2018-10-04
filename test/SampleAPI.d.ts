import { APIBase, APIResponse } from "../APILove";
export declare class SampleAPI extends APIBase {
    hi(respond: APIResponse): void;
    my_name(name: string, respond: APIResponse): void;
    parameters(aString: string, aNumber: number, respond: APIResponse): void;
    error(respond: APIResponse): void;
}

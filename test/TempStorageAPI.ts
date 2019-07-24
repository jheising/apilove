import {API, APIEndpoint} from "../APILove";

@API({
    docs: {
        title: "Storage API",
        intro: "`yo` shit!"
    }
})
export class TempStorageAPI
{
    @APIEndpoint({
        path: "/endpoint1",
        docs: {
            title: "Endpoint 1",
            description: "This is a cool endpoint!"
        }
    })
    static async storeData():Promise<string>
    {
        return "Hello!"
    }

    @APIEndpoint({
        path: "/endpoint2",
        method: "POST",
        docs: {
            title: "Endpoint 2",
            description: "This is another cool endpoint!"
        }
    })
    static async testEndpoint2():Promise<string>
    {
        return "Hello!"
    }
}
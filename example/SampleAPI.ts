import {APIBase, APIEndpoint, APIParameter} from "../APILove";

export class SampleAPI extends APIBase {

    @APIEndpoint({
        method: "POST",
        path: "/foo"
    })
    fooX(
        @APIParameter({
            sources: "body"
        })
        data): Promise<any> {

        return new Promise<any>((resolve, reject) => {
            resolve(data);
        });

    }
}
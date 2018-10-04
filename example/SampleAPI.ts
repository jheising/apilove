import {APIBase, APIEndpoint, APIParameter} from "../APILove";

export class SampleAPI extends APIBase {

    @APIEndpoint({path: "/foo"})
    fooX(@APIParameter({default: "bar"}) what: string, req?, res?): Promise<any> {

        return new Promise<any>((resolve, reject) => {
            resolve(`foo ${what}`);
        });

    }
}
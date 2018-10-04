import {APIBase, APIEndpoint, APIResponse, APIParameter, APILove} from "../APILove";
import * as fs from "fs";

export class SampleAPI extends APIBase {

    @APIEndpoint({path: "/hi"})
    hi(respond: APIResponse) {
        respond.withSuccess("Hello there!");
    }

    @APIEndpoint({path: "/my_name_is/:name"})
    my_name(name: string, respond: APIResponse) {
        respond.withSuccess(`Hi ${name}!`);
    }

    @APIEndpoint({path: "/parameters"})
    parameters(
        aString: string,
        @APIParameter({
            rawName: "blah"
        })
        aNumber: number,
        respond: APIResponse) {

        respond.withSuccess(`${aString}, ${aNumber}`);
    }

    @APIEndpoint({path: "/error"})
    error(respond: APIResponse) {
        fs.readFile("", (err, data) => {

            // Quick and easy way to check for error responses from other methods with callbacks and immediately return and error.
            // If there is an error, respond.withError will send an error response and return a true value, resulting in the function exiting early. Otherwise if error is null or undefined,
            // the function will continue on.
            if (respond.withError(err)) return;

            respond.withSuccess();
        });
    }
}

module.exports.hanlder = APILove.start({
    serviceName: "SampleAPI",
    apis:[
        {
            require: "./SampleAPI"
        }
    ]
});
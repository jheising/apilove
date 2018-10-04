import {APILove} from "../APILove";
import {SampleAPI} from "./SampleAPI";

// This is the only part that is required.
module.exports.handler = APILove.start({
    apis: [
        {
            require: "./SampleAPI"
        }
    ]
});

let sapi = new SampleAPI();
sapi.fooX("bar")
    .then((data) => {
        console.log(data);
    }).catch((error) => {
        console.error(error);
    });
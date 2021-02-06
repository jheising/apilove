// @ts-ignore
import {APILove} from "apilove";

// This is the only part that is required.
module.exports.handler = APILove.start({
    apis: [
        {
            require: "./SampleAPI"
        }
    ]
});
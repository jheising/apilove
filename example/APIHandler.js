"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const APILove_1 = require("../APILove");
// This is the only part that is required.
module.exports.handler = APILove_1.APILove.start({
    apis: [
        {
            require: "./SampleAPI"
        }
    ]
});
//# sourceMappingURL=APIHandler.js.map
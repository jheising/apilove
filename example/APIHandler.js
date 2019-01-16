"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apilove_1 = require("apilove");
// This is the only part that is required.
module.exports.handler = apilove_1.APILove.start({
    apis: [
        {
            require: "./SampleAPI"
        }
    ]
});
//# sourceMappingURL=APIHandler.js.map
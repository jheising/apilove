"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const APILove_1 = require("../APILove");
module.exports.handler = APILove_1.APILove.start({
    apis: [
        {
            require: "./test/TempStorageAPI",
            apiPath: "/"
        }
    ],
    docs: {
        title: "Test API",
        intro: "This is a cool API!"
    }
});
//# sourceMappingURL=APIHandler.js.map
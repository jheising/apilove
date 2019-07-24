import {APILove} from "../APILove";

module.exports.handler = APILove.start({
    apis: [
        {
            require: "./test/TempStorageAPI",
            apiPath: "/"
        }
    ],
    docs:
        {
            title: "Test API",
            intro: "This is a cool API!"
        }
});
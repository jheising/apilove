"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const APILove_1 = require("../APILove");
class SampleAPI extends APILove_1.APIBase {
    constructor() {
        super(...arguments);
        this.blah = "yo!sddf";
    }
    fooX(what, // This will be retrieved as a string from the URL
    data, // The body will be parsed and sent back here
    req, // Access the raw express.js request
    res // Access the raw express.js response
    ) {
        return new Promise((resolve, reject) => {
            resolve(`foo ${what} with some ${this.blah}`);
        });
    }
}
__decorate([
    APILove_1.APIEndpoint({
        method: "POST",
        path: "/foo/:what"
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SampleAPI.prototype, "fooX", null);
exports.SampleAPI = SampleAPI;
//# sourceMappingURL=SampleAPI.js.map